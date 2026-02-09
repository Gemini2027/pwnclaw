-- PwnClaw: Adaptive attacks support
-- Run this in Supabase SQL Editor

-- Store custom attack list for adaptive tests (null = use standard library)
ALTER TABLE tests ADD COLUMN IF NOT EXISTS custom_attacks JSONB DEFAULT NULL;

-- Flag to indicate this test includes adaptive attacks
ALTER TABLE tests ADD COLUMN IF NOT EXISTS is_adaptive BOOLEAN DEFAULT FALSE;
