-- ============================================================
-- ATTENDANCE LOGS TABLE
-- Tracks every check-in event for members
-- ============================================================

CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in_by TEXT NOT NULL DEFAULT 'self' CHECK (checked_in_by IN ('self', 'admin'))
);

-- Index for fast lookups by member and date
CREATE INDEX IF NOT EXISTS idx_attendance_logs_member_date 
  ON attendance_logs(member_id, checked_in_at DESC);

-- RLS
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- Members can read their own logs
CREATE POLICY "Members can read own attendance" ON attendance_logs
  FOR SELECT USING (auth.uid() = member_id);

-- Members can insert their own logs (self check-in)
CREATE POLICY "Members can insert own attendance" ON attendance_logs
  FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Admins can read all logs
CREATE POLICY "Admins can read all attendance" ON attendance_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can insert logs for any member (admin check-in)
CREATE POLICY "Admins can insert attendance for anyone" ON attendance_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
