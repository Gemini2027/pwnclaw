-- PwnClaw: Auto-cleanup old tests based on plan
-- Run as Supabase pg_cron job or manually
-- Schedule suggestion: DAILY at 03:00 UTC
--   SELECT cron.schedule('cleanup-old-tests', '0 3 * * *', $$ SELECT cleanup_old_tests(); $$);

CREATE OR REPLACE FUNCTION cleanup_old_tests()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Free plan: delete tests older than 7 days
  DELETE FROM test_results 
  WHERE test_id IN (
    SELECT t.id FROM tests t
    JOIN users u ON t.user_id = u.id
    WHERE u.plan = 'free' 
      AND t.status = 'completed'
      AND t.created_at < NOW() - INTERVAL '7 days'
  );
  
  DELETE FROM tests 
  WHERE id IN (
    SELECT t.id FROM tests t
    JOIN users u ON t.user_id = u.id
    WHERE u.plan = 'free' 
      AND t.status = 'completed'
      AND t.created_at < NOW() - INTERVAL '7 days'
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Pro plan: delete tests older than 90 days
  DELETE FROM test_results 
  WHERE test_id IN (
    SELECT t.id FROM tests t
    JOIN users u ON t.user_id = u.id
    WHERE u.plan = 'pro' 
      AND t.status = 'completed'
      AND t.created_at < NOW() - INTERVAL '90 days'
  );
  
  DELETE FROM tests 
  WHERE id IN (
    SELECT t.id FROM tests t
    JOIN users u ON t.user_id = u.id
    WHERE u.plan = 'pro' 
      AND t.status = 'completed'
      AND t.created_at < NOW() - INTERVAL '90 days'
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Team plan: delete tests older than 365 days
  DELETE FROM test_results 
  WHERE test_id IN (
    SELECT t.id FROM tests t
    JOIN users u ON t.user_id = u.id
    WHERE u.plan = 'team' 
      AND t.status = 'completed'
      AND t.created_at < NOW() - INTERVAL '365 days'
  );
  
  DELETE FROM tests 
  WHERE id IN (
    SELECT t.id FROM tests t
    JOIN users u ON t.user_id = u.id
    WHERE u.plan = 'team' 
      AND t.status = 'completed'
      AND t.created_at < NOW() - INTERVAL '365 days'
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Also clean up failed/stale tests older than 24h (any plan)
  DELETE FROM test_results 
  WHERE test_id IN (
    SELECT id FROM tests
    WHERE status IN ('pending', 'waiting', 'running', 'failed')
      AND created_at < NOW() - INTERVAL '24 hours'
  );
  
  DELETE FROM tests 
  WHERE status IN ('pending', 'waiting', 'running', 'failed')
    AND created_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Clean old webhook events (30 days)
  DELETE FROM webhook_events 
  WHERE created_at < NOW() - INTERVAL '30 days';

  RAISE NOTICE 'Cleaned up % tests', deleted_count;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
