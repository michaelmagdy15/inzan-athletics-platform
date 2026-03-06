-- INZAN Athletics Platform
-- Phase 1 Security: Strict Row Level Security (RLS) Policies

-- Activate RLS on all relevant tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_availabilities ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- SECURITY DEFINER FUNCTION (AVOIDS INFINITE RECURSION)
-- evaluates as the creating user (DB admin), bypassing RLS
-- to fetch the current user's role securely.
-- ========================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- CLEAN UP EXISTING BUGGED POLICIES (if they exist)
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Members can view own profile and coaches" ON profiles;
DROP POLICY IF EXISTS "Members can update own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can view all members and themselves" ON profiles;

DROP POLICY IF EXISTS "Admins have full access to pt_packages" ON pt_packages;
DROP POLICY IF EXISTS "Members can view own packages" ON pt_packages;
DROP POLICY IF EXISTS "Coaches can view packages assigned to them" ON pt_packages;

DROP POLICY IF EXISTS "Admins have full access to pt_sessions" ON pt_sessions;
DROP POLICY IF EXISTS "Members can view and create their own sessions" ON pt_sessions;
DROP POLICY IF EXISTS "Members can insert their own sessions" ON pt_sessions;
DROP POLICY IF EXISTS "Members can update their own sessions" ON pt_sessions;
DROP POLICY IF EXISTS "Coaches can view and update sessions assigned to them" ON pt_sessions;
DROP POLICY IF EXISTS "Coaches can update sessions assigned to them" ON pt_sessions;

DROP POLICY IF EXISTS "Admins have full access to bookings" ON bookings;
DROP POLICY IF EXISTS "Members can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Members can insert their own bookings" ON bookings;
DROP POLICY IF EXISTS "Members can delete their own bookings" ON bookings;

DROP POLICY IF EXISTS "Admins have full access to coach_availabilities" ON coach_availabilities;
DROP POLICY IF EXISTS "Everyone can view coach_availabilities" ON coach_availabilities;
DROP POLICY IF EXISTS "Coaches can manage their own availabilities" ON coach_availabilities;


-- --------------------------------------------------------
-- PROFILES (Users, Members, Coaches, Admins)
-- --------------------------------------------------------
-- Admins can do everything
CREATE POLICY "Admins have full access to profiles" 
ON profiles FOR ALL 
USING ( public.get_user_role() = 'admin' );

-- Members can read their own profile, and read coaches' profiles
CREATE POLICY "Members can view own profile and coaches" 
ON profiles FOR SELECT 
USING ( auth.uid() = id OR role = 'coach' );

-- Members can only update their own profile
CREATE POLICY "Members can update own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id );

-- Coaches can read their own profile, and profiles of all members
CREATE POLICY "Coaches can view all members and themselves" 
ON profiles FOR SELECT 
USING ( public.get_user_role() = 'coach' AND (role = 'member' OR id = auth.uid()) );

-- --------------------------------------------------------
-- PT PACKAGES
-- --------------------------------------------------------
CREATE POLICY "Admins have full access to pt_packages" 
ON pt_packages FOR ALL 
USING ( public.get_user_role() = 'admin' );

CREATE POLICY "Members can view own packages" 
ON pt_packages FOR SELECT 
USING ( auth.uid() = member_id );

CREATE POLICY "Coaches can view packages assigned to them" 
ON pt_packages FOR SELECT 
USING ( auth.uid() = coach_id );

-- --------------------------------------------------------
-- PT SESSIONS
-- --------------------------------------------------------
CREATE POLICY "Admins have full access to pt_sessions" 
ON pt_sessions FOR ALL 
USING ( public.get_user_role() = 'admin' );

CREATE POLICY "Members can view and create their own sessions" 
ON pt_sessions FOR SELECT 
USING ( auth.uid() = member_id );
CREATE POLICY "Members can insert their own sessions" 
ON pt_sessions FOR INSERT 
WITH CHECK ( auth.uid() = member_id );
CREATE POLICY "Members can update their own sessions" 
ON pt_sessions FOR UPDATE 
USING ( auth.uid() = member_id );

CREATE POLICY "Coaches can view and update sessions assigned to them" 
ON pt_sessions FOR SELECT 
USING ( auth.uid() = coach_id );
CREATE POLICY "Coaches can update sessions assigned to them" 
ON pt_sessions FOR UPDATE 
USING ( auth.uid() = coach_id );

-- --------------------------------------------------------
-- CLASS BOOKINGS
-- --------------------------------------------------------
CREATE POLICY "Admins have full access to bookings" 
ON bookings FOR ALL 
USING ( public.get_user_role() = 'admin' );

CREATE POLICY "Members can view their own bookings" 
ON bookings FOR SELECT 
USING ( auth.uid() = member_id );

CREATE POLICY "Members can insert their own bookings" 
ON bookings FOR INSERT 
WITH CHECK ( auth.uid() = member_id );

CREATE POLICY "Members can delete their own bookings" 
ON bookings FOR DELETE 
USING ( auth.uid() = member_id );

-- --------------------------------------------------------
-- COACH AVAILABILITIES
-- --------------------------------------------------------

CREATE POLICY "Admins have full access to coach_availabilities" 
ON coach_availabilities FOR ALL 
USING ( public.get_user_role() = 'admin' );

CREATE POLICY "Everyone can view coach_availabilities" 
ON coach_availabilities FOR SELECT 
USING ( true );

CREATE POLICY "Coaches can manage their own availabilities" 
ON coach_availabilities FOR ALL 
USING ( auth.uid() = coach_id );
