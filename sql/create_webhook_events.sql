-- PwnClaw: webhook_events table for Lemon Squeezy webhook processing
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT UNIQUE,
  event_name TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Index for unprocessed events
CREATE INDEX IF NOT EXISTS idx_webhook_events_unprocessed 
  ON webhook_events (processed) WHERE processed = FALSE;

-- Index for event lookup
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_name 
  ON webhook_events (event_name, created_at DESC);

-- RLS: Only service role can access
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No public access policies — only service_role key can read/write
