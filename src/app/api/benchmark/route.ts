import { NextRequest, NextResponse } from 'next/server';
import { getBenchmarkStats } from '@/lib/benchmark';

// GET /api/benchmark?score=82
// Returns percentile and global stats for a given score
// No auth required — data is anonymous
export async function GET(request: NextRequest) {
  const scoreParam = request.nextUrl.searchParams.get('score');
  
  if (!scoreParam) {
    return NextResponse.json({ error: 'score parameter required' }, { status: 400 });
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
