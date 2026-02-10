import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTestByToken, getResultsForTest, getUserByClerkId } from '@/lib/db';

// GET: Fetch detailed results for a completed test
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    // Require authentication
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get test
    const test = await getTestByToken(token);
    
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Verify ownership
    if (test.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get detailed results
    const results = await getResultsForTest(test.id);

    return NextResponse.json({
      test: {
        id: test.id,
        agentName: test.agent_name,
        status: test.status,
        score: test.score,
        isAdaptive: (test as any).is_adaptive || false,
        modelName: (test as any).model_name || null,
        framework: (test as any).framework || null,
        createdAt: test.created_at,
        completedAt: test.completed_at,
        withFixes: (test as any).with_fixes || false,
      },
      // K5: Truncate attack prompts to prevent full prompt library extraction
      results: results.map(r => ({
        id: r.id,
        category: r.attack_category,
        attackName: r.attack_name,
        promptPreview: r.prompt_sent.length > 80 ? r.prompt_sent.substring(0, 80) + '...' : r.prompt_sent,
        response: r.agent_response,
        passed: r.passed,
        severity: r.severity,
        analysis: r.analysis,
      })),
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        bySeverity: {
          critical: results.filter(r => r.severity === 'critical').length,
          high: results.filter(r => r.severity === 'high').length,
          medium: results.filter(r => r.severity === 'medium').length,
          low: results.filter(r => r.severity === 'low').length,
        }
      }
    });

  } catch (error) {
    console.error('Error in GET /api/test/[token]/results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
