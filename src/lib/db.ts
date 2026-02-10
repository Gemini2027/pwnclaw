import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { DBUser, DBTest, DBTestResult } from './supabase';
import { PLAN_LIMITS } from './supabase';

// Lazy-initialized Supabase client (for build-time compatibility)
let _db: SupabaseClient | null = null;

export const db = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_db) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase environment variables not configured');
      }
      
      _db = createClient(supabaseUrl, supabaseServiceKey);
    }
    return (_db as any)[prop];
  }
});

// ============ CREDIT RESET (shared logic) ============

/**
 * Check and reset monthly credits if the reset date has passed.
 * Mutates the user object in-place and updates DB.
 * Single source of truth — uses PLAN_LIMITS from supabase.ts.
 */
async function checkAndResetCredits(user: DBUser): Promise<DBUser> {
  if (!user.credits_reset_at) return user;
  
  const resetDate = new Date(user.credits_reset_at);
  const now = new Date();
  
  if (resetDate >= now) return user; // Not yet due
  
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
  const newCredits = limits.credits === -1 ? 999 : limits.credits;
  
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  
  const { error } = await db
    .from('users')
    .update({
      credits_remaining: newCredits,
      credits_reset_at: nextReset.toISOString()
    })
    .eq('id', user.id);
  
  // Only mutate user object if DB update succeeded
  if (!error) {
    user.credits_remaining = newCredits;
    user.credits_reset_at = nextReset.toISOString();
  } else {
    console.error('Failed to reset credits for user:', user.id, error.message);
  }
  
  return user;
}

// ============ USER OPERATIONS ============

export async function getOrCreateUser(clerkId: string, email: string): Promise<DBUser | null> {
  // Try to get existing user
  const { data: existing } = await db
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (existing) return checkAndResetCredits(existing as DBUser);

  // Create new user with credits reset date
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  
  const { data: newUser, error } = await db
    .from('users')
    .insert({ 
      clerk_id: clerkId, 
      email,
      credits_remaining: PLAN_LIMITS.free.credits,
      credits_reset_at: nextReset.toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return newUser as DBUser;
}

export async function getUserByClerkId(clerkId: string): Promise<DBUser | null> {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error) return null;
  
  return checkAndResetCredits(data as DBUser);
}

export async function getUserById(userId: string): Promise<DBUser | null> {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  
  return checkAndResetCredits(data as DBUser);
}

export async function updateUserCredits(userId: string, credits: number): Promise<boolean> {
  const { error } = await db
    .from('users')
    .update({ credits_remaining: credits })
    .eq('id', userId);

  return !error;
}

// Reserve a credit atomically (decrement by 1, only if > 0)
// K3: The `decrement_credit` RPC MUST be deployed in Supabase for atomic operations.
// See: supabase/migrations/decrement_credit.sql
export async function reserveCredit(userId: string): Promise<boolean> {
  // Single atomic UPDATE with gt(0) guard — no read-then-write race condition
  const { data, error } = await db
    .rpc('decrement_credit', { user_uuid: userId });
  
  // Fallback if RPC not available: optimistic lock approach
  // ⚠️ RACE CONDITION (K3): The read-then-write below has a TOCTOU race under concurrent requests.
  // Deploy the `decrement_credit` RPC to eliminate this. See supabase/migrations/decrement_credit.sql
  if (error && error.message?.includes('function') ) {
    const { data: user } = await db
      .from('users')
      .select('credits_remaining')
      .eq('id', userId)
      .single();
    
    if (!user || user.credits_remaining <= 0) {
      return false;
    }
    
    const { data: updated, error: updateError } = await db
      .from('users')
      .update({ credits_remaining: user.credits_remaining - 1 })
      .eq('id', userId)
      .eq('credits_remaining', user.credits_remaining)
      .select('id');
    
    if (updateError || !updated || updated.length === 0) {
      return false;
    }
    
    return true;
  }
  
  if (error) return false;
  
  // RPC returns the number of rows updated (1 = success, 0 = no credits)
  return data === 1 || data === true;
}

// ============ API KEY OPERATIONS ============

export async function generateApiKey(userId: string): Promise<string | null> {
  // Generate a secure random API key: pwn_<32 hex chars>
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const key = 'pwn_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const { error } = await db
    .from('users')
    .update({ api_key: key })
    .eq('id', userId);

  if (error) {
    console.error('Error generating API key:', error);
    return null;
  }
  return key;
}

export async function revokeApiKey(userId: string): Promise<boolean> {
  const { error } = await db
    .from('users')
    .update({ api_key: null })
    .eq('id', userId);
  return !error;
}

export async function getUserByApiKey(apiKey: string): Promise<DBUser | null> {
  if (!apiKey || !apiKey.startsWith('pwn_')) return null;
  
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('api_key', apiKey)
    .single();

  if (error) return null;
  
  // Also check/reset credits
  const user = data as DBUser;
  return checkAndResetCredits(user);
}

// ============ TEST OPERATIONS ============

export async function createTest(userId: string, agentName: string): Promise<DBTest | null> {
  const { data, error } = await db
    .from('tests')
    .insert({
      user_id: userId,
      agent_name: agentName,
      status: 'waiting'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating test:', error);
    return null;
  }

  return data as DBTest;
}

export async function getTestByToken(token: string): Promise<DBTest | null> {
  const { data, error } = await db
    .from('tests')
    .select('*')
    .eq('test_token', token)
    .single();

  if (error) return null;
  return data as DBTest;
}

export async function updateTestStatus(
  testId: string, 
  status: DBTest['status'], 
  score?: number
): Promise<boolean> {
  const update: Partial<DBTest> = { status };
  
  if (status === 'completed') {
    update.completed_at = new Date().toISOString();
    if (score !== undefined) update.score = score;
  }

  const { error } = await db
    .from('tests')
    .update(update)
    .eq('id', testId);

  return !error;
}

export async function getTestsForUser(userId: string, limit = 10): Promise<DBTest[]> {
  const { data, error } = await db
    .from('tests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as DBTest[];
}

// ============ RESULT OPERATIONS ============

export async function saveTestResult(
  testId: string,
  attackCategory: string,
  attackName: string,
  promptSent: string,
  agentResponse: string,
  passed: boolean,
  severity: DBTestResult['severity'] | null,
  analysis: string
): Promise<boolean> {
  const { error } = await db
    .from('test_results')
    .insert({
      test_id: testId,
      attack_category: attackCategory,
      attack_name: attackName,
      prompt_sent: promptSent,
      agent_response: agentResponse,
      passed,
      severity,
      analysis
    });

  return !error;
}

export async function getResultsForTest(testId: string): Promise<DBTestResult[]> {
  const { data, error } = await db
    .from('test_results')
    .select('*')
    .eq('test_id', testId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data as DBTestResult[];
}

// Alias for getResultsForTest (used by API)
export const getTestResults = getResultsForTest;

// Get count of completed test results (for serverless session state)
export async function getTestResultCount(testId: string): Promise<number> {
  const { count, error } = await db
    .from('test_results')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', testId);

  if (error) {
    console.error('Error getting test result count:', error);
    return 0;
  }
  return count || 0;
}

// ============ AGGREGATES ============

export async function getUserStats(userId: string): Promise<{
  totalTests: number;
  totalVulnerabilities: number;
  avgScore: number;
}> {
  // Get all tests for user
  const { data: tests } = await db
    .from('tests')
    .select('id, score')
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (!tests || tests.length === 0) {
    return { totalTests: 0, totalVulnerabilities: 0, avgScore: 0 };
  }

  // Get vulnerability count
  const testIds = tests.map(t => t.id);
  const { count } = await db
    .from('test_results')
    .select('*', { count: 'exact', head: true })
    .in('test_id', testIds)
    .eq('passed', false);

  const avgScore = tests.reduce((sum, t) => sum + (t.score || 0), 0) / tests.length;

  return {
    totalTests: tests.length,
    totalVulnerabilities: count || 0,
    avgScore: Math.round(avgScore)
  };
}
