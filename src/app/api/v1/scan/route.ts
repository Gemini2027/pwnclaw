import { NextRequest, NextResponse } from 'next/server';
import { getUserByApiKey, createTest, reserveCredit, db } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/supabase';

/**
 * POST /api/v1/scan — Start a new security scan via API key (for CI/CD)
 * 
 * Headers:
 *   Authorization: Bearer pwn_<key>
 * 
 * Body:
 *   { "agentName": "my-agent", "threshold": 80 }
 * 
 * Returns:
 *   { "testId", "testToken", "testUrl", "pollUrl" }
 */
export async function POST(request: NextRequest) {
  try {
    // Auth via API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing Authorization header. Use: Bearer pwn_<key>' }, { status: 401 });
    }

    const apiKey = authHeader.slice(7).trim();
    const user = await getUserByApiKey(apiKey);
    if (!user) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const body = await request.json();
    const { agentName, threshold } = body;

    if (!agentName || typeof agentName !== 'string' || agentName.length > 100) {
      return NextResponse.json({ error: 'agentName required (string, max 100 chars)' }, { status: 400 });
    }

    const sanitizedName = agentName.trim().replace(/[<>]/g, '');

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
      return NextResponse.json({ 
        error: 'No credits remaining',
        plan: user.plan,
        creditsRemaining: 0,
      }, { status: 403 });
    }

    // Reserve credit
    if (limits.credits !== -1) {
      const reserved = await reserveCredit(user.id);
      if (!reserved) {
        return NextResponse.json({ error: 'Failed to reserve credit' }, { status: 403 });
      }
    }

    // Create test
    let test;
    try {
      test = await createTest(user.id, sanitizedName);
    } catch (err) {
      if (limits.credits !== -1) {
        try { await db.rpc('increment_credit', { user_uuid: user.id }); } catch {}
      }
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
    }

    if (!test) {
      if (limits.credits !== -1) {
        try { await db.rpc('increment_credit', { user_uuid: user.id }); } catch {}
      }
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
    }

    const baseUrl = request.nextUrl.origin;

    return NextResponse.json({
      testId: test.id,
      testToken: test.test_token,
      testUrl: `${baseUrl}/api/test/${test.test_token}`,
      pollUrl: `${baseUrl}/api/test/${test.test_token}/results`,
      resultsUrl: `${baseUrl}/dashboard/tests/${test.test_token}`,
      threshold: threshold || null,
      creditsRemaining: user.credits_remaining - 1,
      instructions: {
        step1: `GET ${baseUrl}/api/test/${test.test_token} → get next attack prompt`,
        step2: 'Send the prompt to your agent, get the response',
        step3: `POST ${baseUrl}/api/test/${test.test_token} with body: { "response": "<agent_response>" }`,
        step4: 'Repeat steps 1-3 until GET returns status: "completed"',
        step5: `GET ${baseUrl}/api/test/${test.test_token}/results → full results with score`,
      },
    });
  } catch (error) {
    console.error('Error in /api/v1/scan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
