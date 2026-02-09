-- PwnClaw: RPC functions for atomic credit operations
-- Run this in Supabase SQL Editor

-- Drop old version first (return type may differ)
DROP FUNCTION IF EXISTS decrement_credit(uuid);

CREATE OR REPLACE FUNCTION decrement_credit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE rows_updated INTEGER;
BEGIN
  UPDATE users SET credits_remaining = credits_remaining - 1
  WHERE id = user_uuid AND credits_remaining > 0;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS increment_credit(uuid);

CREATE OR REPLACE FUNCTION increment_credit(user_uuid UUID)
RETURNS void AS $$
  UPDATE users SET credits_remaining = credits_remaining + 1
  WHERE id = user_uuid;
$$ LANGUAGE sql;

-- Prevent duplicate test results from concurrent POSTs (race condition guard)
CREATE UNIQUE INDEX IF NOT EXISTS idx_test_results_unique ON test_results(test_id, attack_name);
