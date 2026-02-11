import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/supabase';

// Auto-deletion of old test data per Privacy Policy:
// - Free: 7 days
// - Pro: 90 days  
// - Team: 365 days

const RETENTION_DAYS = {
  free: 7,
  pro: 90,
  team: 365,
};

export async function GET(request: NextRequest) {
  // Verify cron secret (prevent unauthorized calls)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role client (db) instead of anon key client
  const supabase = db;
  const results = {
    deleted: { tests: 0, results: 0 },
    errors: [] as string[],
  };

  try {
    // Mark stale running tests as failed (stuck for >30 minutes)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { error: staleError, count: staleCount } = await supabase
      .from('tests')
      .update({ status: 'failed' })
      .in('status', ['running', 'waiting', 'pending'])
      .lt('created_at', thirtyMinAgo);
    
    if (staleError) {
      results.errors.push(`Error marking stale tests: ${staleError.message}`);
    } else if (staleCount) {
      console.log(`[CLEANUP] Marked ${staleCount} stale tests as failed`);
    }

    // For each plan, find and delete expired tests
    for (const [plan, days] of Object.entries(RETENTION_DAYS)) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // Find users with this plan
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('plan', plan);
      
      if (userError) {
        results.errors.push(`Error fetching ${plan} users: ${userError.message}`);
        continue;
      }
      
      if (!users || users.length === 0) continue;
      
      const userIds = users.map(u => u.id);
      
      // Find expired tests for these users
      const { data: expiredTests, error: testError } = await supabase
        .from('tests')
        .select('id')
        .in('user_id', userIds)
        .in('status', ['completed', 'failed'])
        .lt('created_at', cutoffDate.toISOString());
      
      if (testError) {
        results.errors.push(`Error fetching ${plan} tests: ${testError.message}`);
        continue;
      }
      
      if (!expiredTests || expiredTests.length === 0) continue;
      
      const testIds = expiredTests.map(t => t.id);
      
      // Delete test_results first (foreign key)
      const { error: resultDeleteError, count: resultCount } = await supabase
        .from('test_results')
        .delete({ count: 'exact' })
        .in('test_id', testIds);
      
      if (resultDeleteError) {
        results.errors.push(`Error deleting ${plan} results: ${resultDeleteError.message}`);
        continue;
      }
      
      // Delete tests
      const { error: testDeleteError, count: testCount } = await supabase
        .from('tests')
        .delete({ count: 'exact' })
        .in('id', testIds);
      
      if (testDeleteError) {
        results.errors.push(`Error deleting ${plan} tests: ${testDeleteError.message}`);
        continue;
      }
      
      results.deleted.tests += testCount || 0;
      results.deleted.results += resultCount || 0;
      
      console.log(`[CLEANUP] ${plan}: Deleted ${testCount} tests and ${resultCount} results older than ${days} days`);
    }

    // W7: Credit reset — also handled by checkAndResetCredits() in db.ts on user access.
    // No double-reset risk: both paths set credits_reset_at to future, so whichever runs first
    // prevents the other from triggering (lt('credits_reset_at', now) won't match).
    const nextReset = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Reset each plan separately (different credit amounts) — uses PLAN_LIMITS as source of truth
    for (const [plan, credits] of [['free', PLAN_LIMITS.free.credits], ['pro', PLAN_LIMITS.pro.credits], ['team', PLAN_LIMITS.team.credits]] as const) {
      const { error: creditError } = await supabase
        .from('users')
        .update({
          credits_remaining: credits,
          credits_reset_at: nextReset,
        })
        .eq('plan', plan)
        .lt('credits_reset_at', new Date().toISOString());

      if (creditError) {
        results.errors.push(`Error resetting ${plan} credits: ${creditError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[CLEANUP] Fatal error:', error);
    return NextResponse.json({ 
      error: 'Cleanup failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Vercel Cron config
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max
