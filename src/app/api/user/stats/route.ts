// TODO V6: Add rate limiting to /api/user/* endpoints (e.g., 60 req/min per user)
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, getUserStats, getTestsForUser } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);
    
    if (!user) {
      // New user - return defaults
      return NextResponse.json({
        user: {
          plan: 'free',
          creditsRemaining: 3
        },
        stats: {
          totalTests: 0,
          totalVulnerabilities: 0,
          avgScore: 0
        },
        recentTests: []
      });
    }

    // Get stats and recent tests in parallel
    const [stats, recentTests] = await Promise.all([
      getUserStats(user.id),
      getTestsForUser(user.id, 5)
    ]);

    // Get result counts for recent tests to show attack count (15 vs 50)
    const testIds = recentTests.map(t => t.id);
    let resultCounts: Record<string, number> = {};
    if (testIds.length > 0) {
      const { data: counts } = await (await import('@/lib/db')).db
        .from('test_results')
        .select('test_id')
        .in('test_id', testIds);
      if (counts) {
        for (const row of counts) {
          resultCounts[row.test_id] = (resultCounts[row.test_id] || 0) + 1;
        }
      }
    }

    const limits = PLAN_LIMITS[user.plan];
    
    return NextResponse.json({
      user: {
        plan: user.plan,
        creditsRemaining: user.credits_remaining,
        maxCredits: limits?.credits ?? 3,
        resetsAt: user.credits_reset_at
      },
      stats,
      recentTests: recentTests.map(test => ({
        id: test.id,
        token: test.test_token,
        agentName: test.agent_name,
        status: test.status,
        score: test.score,
        createdAt: test.created_at,
        withFixes: test.with_fixes || false,
        attackCount: resultCounts[test.id] || null,
      }))
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
