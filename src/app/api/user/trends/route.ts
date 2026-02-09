import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, db } from '@/lib/db';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ scoreTrend: [], issuesFixed: 0, agentTrends: {} });
    }

    // Get all completed tests ordered by date
    const { data: tests } = await db
      .from('tests')
      .select('id, agent_name, score, created_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    if (!tests || tests.length === 0) {
      return NextResponse.json({ scoreTrend: [], issuesFixed: 0, agentTrends: {} });
    }

    // Score trend (all tests chronologically)
    const scoreTrend = tests.map(t => ({
      score: t.score ?? 0,
      date: t.created_at,
      agent: t.agent_name,
    }));

    // Group tests by agent name
    const byAgent: Record<string, typeof tests> = {};
    for (const t of tests) {
      const name = t.agent_name.toLowerCase().trim();
      if (!byAgent[name]) byAgent[name] = [];
      byAgent[name].push(t);
    }

    // Per-agent trend data
    const agentTrends: Record<string, Array<{ score: number; date: string }>> = {};

    // Collect all test IDs that need result comparison (max 20 pairs to bound queries)
    const pairsToCompare: Array<{ prevId: string; nextId: string }> = [];
    for (const [agentName, agentTests] of Object.entries(byAgent)) {
      agentTrends[agentName] = agentTests.map(t => ({
        score: t.score ?? 0,
        date: t.created_at,
      }));

      if (agentTests.length < 2) continue;

      // Only compare last 5 consecutive pairs per agent (bound total work)
      const start = Math.max(0, agentTests.length - 6);
      for (let i = start; i < agentTests.length - 1 && pairsToCompare.length < 20; i++) {
        pairsToCompare.push({
          prevId: agentTests[i].id,
          nextId: agentTests[i + 1].id,
        });
      }
    }

    // Fetch all needed results in ONE query instead of N×2
    let issuesFixed = 0;
    if (pairsToCompare.length > 0) {
      const allTestIds = [...new Set(pairsToCompare.flatMap(p => [p.prevId, p.nextId]))];
      
      const { data: allResults } = await db
        .from('test_results')
        .select('test_id, attack_name, passed')
        .in('test_id', allTestIds);

      if (allResults) {
        // Index by test_id
        const resultsByTest: Record<string, Array<{ attack_name: string; passed: boolean }>> = {};
        for (const r of allResults as any[]) {
          if (!resultsByTest[r.test_id]) resultsByTest[r.test_id] = [];
          resultsByTest[r.test_id].push(r);
        }

        // Compare pairs
        for (const { prevId, nextId } of pairsToCompare) {
          const prevResults = resultsByTest[prevId] || [];
          const nextResults = resultsByTest[nextId] || [];

          const prevFailed = new Set(
            prevResults.filter(r => !r.passed).map(r => r.attack_name)
          );

          for (const r of nextResults) {
            if (r.passed && prevFailed.has(r.attack_name)) {
              issuesFixed++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      scoreTrend,
      issuesFixed,
      agentTrends,
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
