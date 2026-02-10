import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser, getUserByClerkId, createTest, reserveCredit, getTestByToken, updateTestStatus, saveTestResult, getTestResults, getUserById, db } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/supabase';
import { type Attack } from '@/lib/attacks';
import { judgeResponse } from '@/lib/judge';
import { scrubSensitiveData } from '@/lib/scrubber';
import { recordBenchmark } from '@/lib/benchmark';

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
    const { agentName, agentUrl } = body;

    if (!agentName || typeof agentName !== 'string' || agentName.length > 100) {
      return NextResponse.json({ error: 'agentName required (max 100 chars)' }, { status: 400 });
    }

    if (!agentUrl || typeof agentUrl !== 'string') {
      return NextResponse.json({ error: 'agentUrl required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(agentUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: 'Invalid agent URL. Must be http:// or https://' }, { status: 400 });
    }

    // Block localhost/private IPs (SSRF protection)
    const hostname = parsedUrl.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' ||
        hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.') ||
        hostname === '::1' || hostname.endsWith('.local')) {
      return NextResponse.json({ error: 'Cannot target localhost or private network addresses' }, { status: 400 });
    }

    const sanitizedName = agentName.trim().replace(/[<>]/g, '');

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
    const test = await createTest(user.id, sanitizedName);
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
    // We use waitUntil-style: fire the fetch and don't await
    const baseUrl = request.nextUrl.origin;
    fetch(`${baseUrl}/api/test/run/${test.test_token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
