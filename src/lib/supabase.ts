// Types and constants for our Supabase database
// The actual Supabase client is in lib/db.ts (single source of truth)
import type { Attack } from './attacks';

// Types for our database
export type UserPlan = 'free' | 'pro' | 'team';

export interface DBUser {
  id: string;
  clerk_id: string;
  email: string;
  plan: UserPlan;
  credits_remaining: number;
  credits_reset_at: string;
  api_key: string | null;
  created_at: string;
}

export interface DBTest {
  id: string;
  user_id: string;
  agent_name: string;
  status: 'pending' | 'waiting' | 'running' | 'completed' | 'failed';
  test_token: string; // Unique token for agent to connect
  score: number | null;
  custom_attacks: Attack[] | null; // Adaptive attack list (null = standard library)
  is_adaptive: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface DBTestResult {
  id: string;
  test_id: string;
  attack_category: string;
  attack_name: string;
  prompt_sent: string;
  agent_response: string;
  passed: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low' | null;
  analysis: string;
  created_at: string;
}

// Plan limits
export const PLAN_LIMITS = {
  free: { credits: 3, tests_per_run: 15 },
  pro: { credits: 30, tests_per_run: 50 },
  team: { credits: -1, tests_per_run: 50 }, // -1 = unlimited
};
