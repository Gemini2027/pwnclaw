import { NextRequest, NextResponse } from 'next/server';
import { getUserByApiKey, getTestByToken, getResultsForTest } from '@/lib/db';

/**
 * GET /api/v1/results/[token] — Fetch full test results via API key
 * 
 * Authentication: Bearer token (API key)
 * 
 * This endpoint mirrors /api/test/[token]/results but uses API key auth
 * instead of Clerk sessions, making it accessible from CI/CD pipelines,
 * scripts, and the GitHub Action.
 * 
 * Headers:
 *   Authorization: Bearer pwn_<key>
 * 
 * Returns:
 *   - 200: Full test results with score, grade, per-attack breakdown
 *   - 401: Missing or invalid API key
 *   - 403: Test belongs to a different user
 *   - 404: Test not found
 *   - 409: Test not yet completed (includes current status + progress)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Validate token format (32-char hex string from gen_random_bytes(16))
  if (!token || !/^[0-9a-f]{32}$/i.test(token)) {
    return NextResponse.json(
      { error: 'Invalid test token format' },
      { status: 400 }
    );
  }

  try {
    // Authenticate via API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing Authorization header. Use: Bearer pwn_<key>' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7).trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Empty API key' },
        { status: 401 }
      );
    }

    const user = await getUserByApiKey(apiKey);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Look up the test
    const test = await getTestByToken(token);
    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Verify ownership — the test must belong to the API key's user
    if (test.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized — this test belongs to a different account' },
        { status: 403 }
      );
    }

    // If test is not yet completed, return status with progress info
    if (test.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'Test not yet completed',
          status: test.status,
          score: null,
        },
        { status: 409 }
      );
    }

    // Fetch detailed results
    const results = await getResultsForTest(test.id);

    // Calculate summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    const vulnerabilities = {
      critical: results.filter(r => !r.passed && r.severity === 'critical').length,
      high: results.filter(r => !r.passed && r.severity === 'high').length,
      medium: results.filter(r => !r.passed && r.severity === 'medium').length,
      low: results.filter(r => !r.passed && r.severity === 'low').length,
    };

    const score = test.score ?? 0;
    const grade = score === 100 ? 'A+' : score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

    // Group by category
    const byCategory: Record<string, { passed: number; failed: number }> = {};
    for (const r of results) {
      const cat = r.attack_category;
      if (!byCategory[cat]) byCategory[cat] = { passed: 0, failed: 0 };
      if (r.passed) byCategory[cat].passed++;
      else byCategory[cat].failed++;
    }

    return NextResponse.json({
      test: {
        id: test.id,
        token: test.test_token,
        agentName: test.agent_name,
        status: test.status,
        score,
        grade,
        isAdaptive: (test as any).is_adaptive || false,
        modelName: test.model_name || null,
        framework: test.framework || null,
        createdAt: test.created_at,
        completedAt: test.completed_at,
        withFixes: test.with_fixes || false,
      },
      // K5: Truncate attack prompts to prevent full prompt library extraction
      results: results.map(r => ({
        id: r.id,
        category: r.attack_category,
        attackName: r.attack_name,
        promptPreview: r.prompt_sent.length > 80
          ? r.prompt_sent.substring(0, 80) + '...'
          : r.prompt_sent,
        response: r.agent_response,
        passed: r.passed,
        severity: r.severity,
        analysis: r.analysis,
      })),
      summary: {
        total,
        passed,
        failed,
        score,
        grade,
        vulnerabilities,
        byCategory,
        summary: `${passed}/${total} attacks blocked. ${vulnerabilities.critical} critical, ${vulnerabilities.high} high, ${vulnerabilities.medium} medium, ${vulnerabilities.low} low severity issues.`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/v1/results/[token]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
