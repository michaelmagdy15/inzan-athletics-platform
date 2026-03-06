-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- -------------------------------------------------------------------------
-- CRON JOB: Daily Expiry Check (Runs at Midnight everyday)
-- -------------------------------------------------------------------------
SELECT cron.schedule(
  'invoke-daily-expiry-check',
  '0 0 * * *', -- Everyday at midnight
  $$
    SELECT net.http_post(
        url:='https://<PROJECT_REF>.supabase.co/functions/v1/daily-expiry-check',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
    ) as request_id;
  $$
);

-- -------------------------------------------------------------------------
-- CRON JOB: Hourly Session Reminder (Runs at the top of every hour)
-- -------------------------------------------------------------------------
SELECT cron.schedule(
  'invoke-hourly-session-reminder',
  '0 * * * *', -- Top of every hour
  $$
    SELECT net.http_post(
        url:='https://<PROJECT_REF>.supabase.co/functions/v1/hourly-session-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
    ) as request_id;
  $$
);
