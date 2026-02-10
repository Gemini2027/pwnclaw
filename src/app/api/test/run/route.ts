import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser, getUserByClerkId, createTest, reserveCredit, getTestByToken, updateTestStatus, saveTestResult, getTestResults, getUserById, db } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/supabase';
import { type Attack } from '@/lib/attacks';
import { judgeResponse } from '@/lib/judge';
import { scrubSensitiveData } from '@/lib/scrubber';
import { recordBenchmark } from '@/lib/benchmark';

// K1: SSRF protection helpers
function isPrivateHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '[::]' ||
    hostname === '[::1]' ||
    hostname === '[::ffff:127.0.0.1]' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost') ||
    isPrivateIP(hostname)
  );
}

function isPrivateIP(ip: string): boolean {
  // Handle IPv4-mapped IPv6 (::ffff:x.x.x.x)
  const v4match = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  const checkIp = v4match ? v4match[1] : ip;
  
  const parts = checkIp.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p))) return false;
  
  return (
    parts[0] === 0 ||                                          // 0.0.0.0/8
    parts[0] === 10 ||                                         // 10.0.0.0/8
    parts[0] === 127 ||                                        // 127.0.0.0/8
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
    (parts[0] === 192 && parts[1] === 168) ||                  // 192.168.0.0/16
    (parts[0] === 169 && parts[1] === 254) ||                  // 169.254.0.0/16 (link-local)
    (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127)   // 100.64.0.0/10 (CGNAT)
  );
}

/**
 * POST /api/test/run — Server-side test runner
 * 
 * PwnClaw sends attacks TO the user's agent endpoint, collects responses,
 * and judges them. The user doesn't need to write any code.
 * 
 * Body: { "agentName": "...", "agentUrl": "https://..." }
 * 
 * The agentUrl should accept POST with { "message": "..." }
 * and return { "response": "..." } (or similar fields).
 * 
 * This endpoint starts the test and returns immediately.
 * The test runs asynchronously via the /api/test/run/[token] worker.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { agentName, agentUrl, modelName, framework, withFixes } = body;

    if (!agentName || typeof agentName !== 'string' || agentName.length > 100) {
      return NextResponse.json({ error: 'agentName required (max 100 chars)' }, { status: 400 });
    }

    if (!agentUrl || typeof agentUrl !== 'string' || agentUrl.length > 2048) {
      return NextResponse.json({ error: 'agentUrl required (max 2048 chars)' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(agentUrl);
      // W3: Only allow https:// in production (http:// is a security risk)
      if (parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: 'Invalid agent URL. Must be https://' }, { status: 400 });
    }

    // K1: SSRF protection — block private/reserved IP ranges and dangerous hostnames
    const hostname = parsedUrl.hostname.toLowerCase();
    if (isPrivateHostname(hostname)) {
      return NextResponse.json({ error: 'Cannot target localhost or private network addresses' }, { status: 400 });
    }

    // K1: DNS resolution check — resolve hostname BEFORE making the request to prevent DNS rebinding
    try {
      const { resolve4 } = await import('dns/promises');
      const ips = await resolve4(hostname);
      if (ips.some(ip => isPrivateIP(ip))) {
        return NextResponse.json({ error: 'Cannot target private network addresses (DNS resolved to private IP)' }, { status: 400 });
      }
    } catch {
      // DNS resolution failed — allow the request to proceed (fetch will fail naturally)
    }

    // Validate optional model/framework
    if (modelName !== undefined && (typeof modelName !== 'string' || modelName.length > 100)) {
      return NextResponse.json({ error: 'modelName must be a string with max 100 characters' }, { status: 400 });
    }
    if (framework !== undefined && (typeof framework !== 'string' || framework.length > 100)) {
      return NextResponse.json({ error: 'framework must be a string with max 100 characters' }, { status: 400 });
    }

    const sanitizedName = agentName.trim().replace(/[<>]/g, '');
    const sanitizedModel = modelName?.trim().replace(/[<>]/g, '') || undefined;
    const sanitizedFramework = framework?.trim().replace(/[<>]/g, '') || undefined;

    let user = await getUserByClerkId(clerkId);
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkId}@clerk.user`;
      user = await getOrCreateUser(clerkId, email);
    }
    if (!user) {
      return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
    }

    // Rate limit: no concurrent running tests
    const { data: activeTest } = await db
      .from('tests')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['running', 'waiting'])
      .limit(1);
    if (activeTest && activeTest.length > 0) {
      return NextResponse.json({ error: 'You already have a running test. Wait for it to complete.' }, { status: 429 });
    }

    // Check credits
    const limits = PLAN_LIMITS[user.plan];
    if (limits.credits !== -1 && user.credits_remaining <= 0) {
      return NextResponse.json({ error: 'No credits remaining', plan: user.plan }, { status: 403 });
    }

    // Reserve credit
    if (limits.credits !== -1) {
      const reserved = await reserveCredit(user.id);
      if (!reserved) {
        return NextResponse.json({ error: 'Failed to reserve credit' }, { status: 403 });
      }
    }

    // Create test
    const test = await createTest(user.id, sanitizedName, { modelName: sanitizedModel, framework: sanitizedFramework, withFixes: !!withFixes });
    if (!test) {
      if (limits.credits !== -1) {
        try { await db.rpc('increment_credit', { user_uuid: user.id }); } catch {}
      }
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
    }

    // Store agent URL on the test for the worker
    await db.from('tests').update({ 
      agent_url: agentUrl,
      status: 'running'
    }).eq('id', test.id);

    // Fire off the server-side runner (non-blocking)
    // K2: Include WORKER_SECRET so the worker endpoint can verify internal calls
    const baseUrl = request.nextUrl.origin;
    fetch(`${baseUrl}/api/test/run/${test.test_token}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(process.env.WORKER_SECRET ? { 'x-worker-secret': process.env.WORKER_SECRET } : {}),
      },
      redirect: 'manual', // K1: Don't follow redirects (prevents SSRF via redirect)
    }).catch(err => console.error('Failed to start test runner:', err));

    return NextResponse.json({
      success: true,
      testToken: test.test_token,
      resultsUrl: `/dashboard/tests/${test.test_token}`,
    });
  } catch (error) {
    console.error('Error in POST /api/test/run:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
