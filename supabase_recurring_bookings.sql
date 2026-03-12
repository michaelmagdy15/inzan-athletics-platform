-- Advanced Booking Calendar & Integration
-- Add recurrence support to classes table

ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR(50) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS parent_class_id UUID REFERENCES classes(id) ON DELETE CASCADE;

-- Add conflict detection helper functions if needed
-- This function checks if a coach has an overlapping class
CREATE OR REPLACE FUNCTION check_coach_availability(
    p_coach_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_exclude_class_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    conflict_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM classes
        WHERE coach_id = p_coach_id
        AND id != COALESCE(p_exclude_class_id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (
            (start_time <= p_start_time AND end_time > p_start_time)
            OR (start_time < p_end_time AND end_time >= p_end_time)
            OR (start_time >= p_start_time AND end_time <= p_end_time)
        )
    ) INTO conflict_exists;
    
    RETURN NOT conflict_exists;
END;
$$ LANGUAGE plpgsql;
