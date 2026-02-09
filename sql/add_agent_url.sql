-- PwnClaw: Server-side test runner support
-- Run this in Supabase SQL Editor

ALTER TABLE tests ADD COLUMN IF NOT EXISTS agent_url TEXT DEFAULT NULL;
