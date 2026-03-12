-- Migration: Create class waitlists table
-- Table: class_waitlists
-- Description: Tracks members waiting for a spot in a full class

CREATE TABLE IF NOT EXISTS class_waitlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'promoted', 'cancelled')),
    UNIQUE(schedule_id, member_id) -- Prevent same member from joining waitlist multiple times
);

-- RLS Policies
ALTER TABLE class_waitlists ENABLE ROW LEVEL SECURITY;

-- 1. Members can view their own waitlist entries
CREATE POLICY "Members can view own waitlists"
ON class_waitlists FOR SELECT
USING (auth.uid() = member_id OR 
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach')));

-- 2. Members can insert their own waitlist entries
CREATE POLICY "Members can insert own waitlists"
ON class_waitlists FOR INSERT
WITH CHECK (auth.uid() = member_id);

-- 3. Members can update their own waitlist entries (e.g., to cancel)
CREATE POLICY "Members can update own waitlists"
ON class_waitlists FOR UPDATE
USING (auth.uid() = member_id OR 
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin')));

-- 4. Admins and coaches can manage all waitlists
CREATE POLICY "Admins can manage all waitlists"
ON class_waitlists FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach')));

-- Update schedules table to add a trigger or just rely on application logic for promotions
-- (For simplicity here, we'll use application logic to check waitlist on cancellation)
