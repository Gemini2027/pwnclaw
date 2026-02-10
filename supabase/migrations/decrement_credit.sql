-- K3: Atomic credit decrement RPC to prevent race conditions
-- Deploy this function in Supabase SQL Editor or via migrations.
-- This eliminates the TOCTOU race in the fallback path of reserveCredit().

CREATE OR REPLACE FUNCTION decrement_credit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE users
  SET credits_remaining = credits_remaining - 1
  WHERE id = user_uuid AND credits_remaining > 0;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companion function: atomic credit increment (for refunds)
CREATE OR REPLACE FUNCTION increment_credit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE users
  SET credits_remaining = credits_remaining + 1
  WHERE id = user_uuid;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
