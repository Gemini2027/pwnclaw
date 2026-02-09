-- PwnClaw: API Keys for CI/CD integration
-- Run this in Supabase SQL Editor

-- Add api_key column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE;

-- Index for fast API key lookups
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key) WHERE api_key IS NOT NULL;
