import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, getTestsForUser } from '@/lib/db';

// GET: List all tests for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get limit from query params (default 20, max 100)
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10)));

    const tests = await getTestsForUser(user.id, limit);

    return NextResponse.json({
      tests: tests.map(t => ({
        id: t.id,
        token: t.test_token,
        agentName: t.agent_name,
        status: t.status,
        score: t.score,
        createdAt: t.created_at,
        completedAt: t.completed_at,
      })),
      user: {
        plan: user.plan,
        creditsRemaining: user.credits_remaining,
      }
    });

  } catch (error) {
    console.error('Error in GET /api/user/tests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
