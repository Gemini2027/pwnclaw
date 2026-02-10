import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser, createTest, getUserByClerkId, reserveCredit, db } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/supabase';

// ⚠️ WARNING: In-memory rate limiting does NOT work on Vercel serverless.
// Each invocation may run on a different instance, so the Map is not shared.
// Rate limiting via DB-based credit system (durable, no Redis needed):
//   https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
// The DB-based rate check below (checkRecentTest) provides a durable fallback.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // Max 10 tests per minute per user
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    // W1: Cleanup expired entries to prevent memory leak on warm instances
    if (rateLimitMap.size > 50) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (now > val.resetTime) rateLimitMap.delete(key);
      }
    }
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentName } = body;

    // Input validation
    if (!agentName) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 });
    }
    
    if (typeof agentName !== 'string' || agentName.length > 100) {
      return NextResponse.json({ error: 'Agent name must be a string with max 100 characters' }, { status: 400 });
    }
    
    // Sanitize agent name
    const sanitizedName = agentName.trim().replace(/[<>]/g, '');

    // Require authentication - no anonymous mode
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting (in-memory, unreliable on serverless — see comment above)
    if (!checkRateLimit(clerkId)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Max 10 tests per minute.' }, { status: 429 });
    }

    let user = await getUserByClerkId(clerkId);
    
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkId}@clerk.user`;
      user = await getOrCreateUser(clerkId, email);
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
    }

    // DB-based rate check: prevent starting a new test within 60 seconds (durable across serverless instances)
    const sixtySecondsAgo = new Date(Date.now() - 60_000).toISOString();
    const { data: recentTest } = await db
      .from('tests')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['running', 'waiting'])
      .gte('created_at', sixtySecondsAgo)
      .limit(1);
    if (recentTest && recentTest.length > 0) {
      return NextResponse.json({ error: 'Please wait at least 60 seconds between tests.' }, { status: 429 });
    }

    // Check credits
    const limits = PLAN_LIMITS[user.plan];
    if (user.credits_remaining <= 0) {
      return NextResponse.json({ 
        error: 'No credits remaining',
        creditsRemaining: 0,
        plan: user.plan
      }, { status: 403 });
    }

    // Reserve credit BEFORE creating test (prevents race condition)
    const reserved = await reserveCredit(user.id);
    if (!reserved) {
      return NextResponse.json({ error: 'Failed to reserve credit' }, { status: 403 });
    }

    // Create test in database — refund credit on failure
    let test;
    try {
      test = await createTest(user.id, sanitizedName);
    } catch (err) {
      // Refund the reserved credit (relative increment to avoid race condition)
      try {
        await db.rpc('increment_credit', { user_uuid: user.id });
      } catch {
        // Fallback: fetch current value and use optimistic lock
        const { data: current } = await db.from('users').select('credits_remaining').eq('id', user.id).single();
        if (current) {
          await db.from('users').update({ credits_remaining: current.credits_remaining + 1 }).eq('id', user.id);
        }
      }
      console.error('createTest failed, credit refunded:', err);
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
    }

    if (!test) {
      // Refund the reserved credit
      try {
        await db.rpc('increment_credit', { user_uuid: user.id });
      } catch {
        const { data: current } = await db.from('users').select('credits_remaining').eq('id', user.id).single();
        if (current) {
          await db.from('users').update({ credits_remaining: current.credits_remaining + 1 }).eq('id', user.id);
        }
      }
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
    }

    // Estimate scan duration based on plan (attacks × ~10-15s per attack)
    const attackCount = limits.tests_per_run;
    const baseMin = Math.ceil((attackCount * 10) / 60);
    const baseMax = Math.ceil((attackCount * 15) / 60);
    const estimatedMinutes = { min: baseMin, max: baseMax };

    return NextResponse.json({
      success: true,
      testId: test.id,
      testToken: test.test_token,
      testUrl: `/api/test/${test.test_token}`,
      estimatedMinutes,
      creditsRemaining: user.credits_remaining - 1,
      instructions: `To run the security test, your agent should:

1. Make a GET request to /api/test/${test.test_token} to get the first attack prompt
2. Respond to the prompt naturally
3. POST the response to /api/test/${test.test_token} with body: { "response": "your response" }
4. Repeat until status is "completed"`.trim()
    });
  } catch (error) {
    console.error('Error in /api/test/start:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
