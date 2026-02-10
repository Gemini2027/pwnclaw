import { NextRequest, NextResponse } from 'next/server';
import { getBenchmarkStats } from '@/lib/benchmark';
import { db } from '@/lib/db';

// GET /api/benchmark?score=82 — percentile for a given score
// GET /api/benchmark?global=true — aggregated public benchmark data
// No auth required — data is anonymous
export async function GET(request: NextRequest) {
  const globalParam = request.nextUrl.searchParams.get('global');

  if (globalParam === 'true') {
    const model = request.nextUrl.searchParams.get('model') || undefined;
    const framework = request.nextUrl.searchParams.get('framework') || undefined;
    const withFixes = request.nextUrl.searchParams.get('withFixes') || undefined;
    return handleGlobal(model, framework, withFixes);
  }

  const scoreParam = request.nextUrl.searchParams.get('score');
  
  if (!scoreParam) {
    return NextResponse.json({ error: 'score or global parameter required' }, { status: 400 });
  }

  const score = parseInt(scoreParam, 10);
  if (isNaN(score) || score < 0 || score > 100) {
    return NextResponse.json({ error: 'score must be 0-100' }, { status: 400 });
  }

  try {
    const stats = await getBenchmarkStats(score);
    
    if (!stats) {
      return NextResponse.json({ 
        available: false,
        message: 'Not enough data yet for benchmark comparison' 
      });
    }

    return NextResponse.json({
      available: true,
      percentile: stats.percentile,
      totalScans: stats.totalScans,
      avgScore: stats.avgScore,
      medianScore: stats.medianScore,
    });
  } catch (error) {
    console.error('Benchmark API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGlobal(model?: string, framework?: string, withFixes?: string) {
  try {
    let query = db.from('benchmarks').select('score, category_scores, model_name, framework, with_fixes');
    if (model) query = query.eq('model_name', model);
    if (framework) query = query.eq('framework', framework);
    if (withFixes === 'true') query = query.eq('with_fixes', true);
    else if (withFixes === 'false') query = query.or('with_fixes.is.null,with_fixes.eq.false');
    const { data: benchmarks, error } = await query;

    if (error || !benchmarks || benchmarks.length === 0) {
      return NextResponse.json({ available: false, message: 'No benchmark data yet' });
    }

    const scores = benchmarks.map((b: { score: number }) => b.score).sort((a: number, b: number) => a - b);
    const totalScans = scores.length;
    const avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / totalScans);
    const medianScore = scores[Math.floor(totalScans / 2)];
    const topScore = scores[totalScans - 1];

    // Score distribution buckets
    const buckets = [
      { range: '0–20', min: 0, max: 20 },
      { range: '21–40', min: 21, max: 40 },
      { range: '41–60', min: 41, max: 60 },
      { range: '61–80', min: 61, max: 80 },
      { range: '81–100', min: 81, max: 100 },
    ];
    const scoreDistribution = buckets.map((b) => ({
      range: b.range,
      count: scores.filter((s: number) => s >= b.min && s <= b.max).length,
    }));

    // Category pass rates (aggregate across all benchmarks)
    const categoryTotals: Record<string, { passed: number; total: number }> = {};
    for (const b of benchmarks) {
      const cs = b.category_scores as Record<string, { passed: number; failed: number }> | null;
      if (!cs) continue;
      for (const [cat, vals] of Object.entries(cs)) {
        if (!categoryTotals[cat]) categoryTotals[cat] = { passed: 0, total: 0 };
        categoryTotals[cat].passed += vals.passed;
        categoryTotals[cat].total += vals.passed + vals.failed;
      }
    }
    const categoryPassRates = Object.entries(categoryTotals)
      .map(([category, { passed, total }]) => ({
        category,
        passRate: total > 0 ? Math.round((passed / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => a.passRate - b.passRate); // weakest first

    // Grade distribution
    const grades = [
      { grade: 'A+', min: 100, max: 100 },
      { grade: 'A', min: 90, max: 99 },
      { grade: 'B', min: 80, max: 89 },
      { grade: 'C', min: 60, max: 79 },
      { grade: 'D', min: 40, max: 59 },
      { grade: 'F', min: 0, max: 39 },
    ];
    const gradeDistribution = grades.map((g) => {
      const count = scores.filter((s: number) => s >= g.min && s <= g.max).length;
      return {
        grade: g.grade,
        count,
        percentage: Math.round((count / totalScans) * 100),
      };
    });

    // Collect distinct model/framework values for filter dropdowns
    const models = [...new Set(benchmarks.map((b: any) => b.model_name).filter(Boolean))].sort();
    const frameworks = [...new Set(benchmarks.map((b: any) => b.framework).filter(Boolean))].sort();

    // Fixes comparison: only include when not already filtered by withFixes
    let fixesComparison: { withoutFixes: { count: number; avgScore: number }; withFixes: { count: number; avgScore: number } } | undefined;
    if (!withFixes) {
      const withFixesScores = benchmarks.filter((b: any) => b.with_fixes === true).map((b: any) => b.score);
      const withoutFixesScores = benchmarks.filter((b: any) => !b.with_fixes).map((b: any) => b.score);
      if (withFixesScores.length >= 2 && withoutFixesScores.length >= 2) {
        fixesComparison = {
          withoutFixes: {
            count: withoutFixesScores.length,
            avgScore: Math.round(withoutFixesScores.reduce((a: number, b: number) => a + b, 0) / withoutFixesScores.length),
          },
          withFixes: {
            count: withFixesScores.length,
            avgScore: Math.round(withFixesScores.reduce((a: number, b: number) => a + b, 0) / withFixesScores.length),
          },
        };
      }
    }

    return NextResponse.json({
      available: true,
      totalScans,
      avgScore,
      medianScore,
      topScore,
      scoreDistribution,
      categoryPassRates,
      gradeDistribution,
      models,
      frameworks,
      ...(fixesComparison ? { fixesComparison } : {}),
    });
  } catch (error) {
    console.error('Global benchmark API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
