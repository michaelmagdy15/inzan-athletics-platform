-- ============================================================
-- FREEZE REQUESTS TABLE
-- Allows members to request membership freezes with admin approval
-- ============================================================

CREATE TABLE IF NOT EXISTS freeze_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT max_freeze_duration CHECK (end_date - start_date <= 30)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_freeze_requests_member 
  ON freeze_requests(member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_freeze_requests_status 
  ON freeze_requests(status) WHERE status = 'pending';

-- RLS
ALTER TABLE freeze_requests ENABLE ROW LEVEL SECURITY;

-- Members can read their own requests
CREATE POLICY "Members can read own freeze requests" ON freeze_requests
  FOR SELECT USING (auth.uid() = member_id);

-- Members can create their own requests
CREATE POLICY "Members can create freeze requests" ON freeze_requests
  FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Admins can read all requests
CREATE POLICY "Admins can read all freeze requests" ON freeze_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update (approve/reject) requests
CREATE POLICY "Admins can update freeze requests" ON freeze_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
