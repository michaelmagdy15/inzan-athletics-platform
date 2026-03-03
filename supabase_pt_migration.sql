-- ============================================================
-- PT MANAGEMENT SYSTEM — Supabase Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Session Policies (configurable rules)
CREATE TABLE IF NOT EXISTS session_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type TEXT NOT NULL DEFAULT 'pt_1on1',  -- pt_1on1, partner, group, class, nutrition
  cancellation_window_hours INT NOT NULL DEFAULT 24,
  no_show_deducts BOOLEAN NOT NULL DEFAULT true,
  max_reschedules INT NOT NULL DEFAULT 2,
  package_validity_days INT NOT NULL DEFAULT 90,
  max_capacity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default policies
INSERT INTO session_policies (session_type, cancellation_window_hours, no_show_deducts, max_reschedules, package_validity_days, max_capacity) VALUES
  ('pt_1on1', 24, true, 2, 90, 1),
  ('partner', 24, true, 2, 90, 2),
  ('group', 24, true, 2, 90, 5),
  ('class', 12, true, 1, 60, 20),
  ('nutrition', 48, true, 1, 60, 1)
ON CONFLICT DO NOTHING;

-- 2. Coach Availabilities
CREATE TABLE IF NOT EXISTS coach_availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_day_off BOOLEAN NOT NULL DEFAULT false,
  max_pt_1on1 INT NOT NULL DEFAULT 1,
  max_partner INT NOT NULL DEFAULT 2,
  max_group INT NOT NULL DEFAULT 5,
  max_class INT NOT NULL DEFAULT 20,
  max_nutrition INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coach_id, day_of_week, start_time)
);

-- 3. PT Packages (purchased by clients)
CREATE TABLE IF NOT EXISTS pt_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  package_type TEXT NOT NULL DEFAULT 'pt_1on1', -- pt_1on1, partner, group, class, nutrition
  total_sessions INT NOT NULL DEFAULT 12,
  remaining_sessions INT NOT NULL DEFAULT 12,
  price_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_confirmed BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'exhausted', 'cancelled')),
  reschedules_used INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PT Sessions (individual bookings)
CREATE TABLE IF NOT EXISTS pt_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES pt_packages(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'pt_1on1',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'no_show', 'rescheduled', 'canceled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Session Status Log (audit trail)
CREATE TABLE IF NOT EXISTS session_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES pt_sessions(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by_role TEXT NOT NULL DEFAULT 'member',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('booking', 'cancellation', 'reschedule', 'reminder', 'capacity', 'no_show', 'info')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_session_id UUID REFERENCES pt_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE session_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies — Allow all for authenticated users (simplify for MVP)
CREATE POLICY "Authenticated users full access" ON session_policies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON coach_availabilities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON pt_packages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON pt_sessions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON session_status_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON notifications FOR ALL USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pt_sessions_coach ON pt_sessions(coach_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_pt_sessions_member ON pt_sessions(member_id, status);
CREATE INDEX IF NOT EXISTS idx_pt_packages_member ON pt_packages(member_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_coach_avail ON coach_availabilities(coach_id, day_of_week);
