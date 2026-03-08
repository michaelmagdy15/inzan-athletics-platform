-- Add specific_date column to allow flexible scheduling beyond weekly constant days
ALTER TABLE coach_availabilities ADD COLUMN IF NOT EXISTS specific_date DATE;

-- Make day_of_week nullable since we can now use specific_date instead
ALTER TABLE coach_availabilities ALTER COLUMN day_of_week DROP NOT NULL;

-- Update uniqueness constraint to handle both weekly days and specific dates
-- First, drop the old constraint/index
ALTER TABLE coach_availabilities DROP CONSTRAINT IF EXISTS coach_availabilities_coach_id_day_of_week_start_time_key;
DROP INDEX IF EXISTS idx_coach_avail_precise;

-- Create a unique constraint that treats NULLs as duplicates (Postgres 15+)
-- This ensures the frontend 'upsert' works correctly for both recurring and specific dates.
ALTER TABLE coach_availabilities 
ADD CONSTRAINT coach_avail_uq_flexible 
UNIQUE NULLS NOT DISTINCT (coach_id, day_of_week, specific_date, start_time);

-- Notify PostgREST to refresh schema cache
NOTIFY pgrst, 'reload schema';
