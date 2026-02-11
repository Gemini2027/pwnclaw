-- PwnClaw: Anonymous benchmark table for score comparison
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS benchmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  score INTEGER NOT NULL,
  attack_count INTEGER NOT NULL DEFAULT 50,
  passed INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  category_scores JSONB DEFAULT '{}',
  model_name TEXT,
  framework TEXT,
  with_fixes BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for percentile queries (score lookups)
CREATE INDEX IF NOT EXISTS idx_benchmarks_score ON benchmarks(score);

-- No RLS needed — no user-identifiable data, service role only
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read (no public access)
CREATE POLICY "Service role full access" ON benchmarks
  FOR ALL USING (true) WITH CHECK (true);
