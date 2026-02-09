import { db } from './db';

export interface BenchmarkEntry {
  score: number;
  attack_count: number;
  passed: number;
  failed: number;
  category_scores: Record<string, { passed: number; failed: number }>;
}

export interface BenchmarkStats {
  percentile: number;       // "Better than X% of tested agents"
  totalScans: number;       // How many scans in the benchmark
  avgScore: number;         // Global average score
  medianScore: number;      // Global median
  categoryRanking: Array<{  // Strongest → weakest categories
    category: string;
    passRate: number;
  }>;
}

/**
 * Record a completed test in the anonymous benchmark database.
 * Called when a test completes — no user-identifiable data stored.
 */
export async function recordBenchmark(entry: BenchmarkEntry): Promise<boolean> {
  const { error } = await db
    .from('benchmarks')
    .insert({
      score: entry.score,
      attack_count: entry.attack_count,
      passed: entry.passed,
      failed: entry.failed,
      category_scores: entry.category_scores,
    });

  if (error) {
    // Graceful fail if table doesn't exist yet
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.warn('Benchmarks table not created yet — skipping benchmark recording');
      return false;
    }
    console.error('Failed to record benchmark:', error.message);
    return false;
  }
  return true;
}

/**
 * Get benchmark statistics for a given score.
 * Uses cached aggregation for performance (recalculates on each call — 
 * acceptable at low volume; add caching if >1000 benchmarks).
 */
export async function getBenchmarkStats(score: number): Promise<BenchmarkStats | null> {
  // Get total count and count of scores below the given score
  const [
    { count: totalCount, error: totalError },
    { count: belowCount, error: belowError },
  ] = await Promise.all([
    db.from('benchmarks').select('*', { count: 'exact', head: true }),
    db.from('benchmarks').select('*', { count: 'exact', head: true }).lt('score', score),
  ]);

  if (totalError || belowError || !totalCount || totalCount < 5) {
    // Need at least 5 benchmarks for meaningful percentile
    return null;
  }

  const percentile = Math.round(((belowCount || 0) / totalCount) * 100);

  // Get average score
  const { data: allScores, error: scoresError } = await db
    .from('benchmarks')
    .select('score')
    .order('score', { ascending: true });

  if (scoresError || !allScores || allScores.length === 0) return null;

  const scores = allScores.map((r: { score: number }) => r.score);
  const avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  const medianScore = scores[Math.floor(scores.length / 2)];

  return {
    percentile,
    totalScans: totalCount,
    avgScore,
    medianScore,
    categoryRanking: [], // Populated by the caller from test results
  };
}
