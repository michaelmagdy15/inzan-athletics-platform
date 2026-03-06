-- INZAN Athletics Platform
-- Phase 1 Security: Strict Row Level Security (RLS) Policies

-- Activate RLS on all relevant tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- PROFILES (Users, Members, Coaches, Admins)
-- --------------------------------------------------------
-- Admins can do everything
CREATE POLICY "Admins have full access to profiles" 
ON profiles FOR ALL 
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

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
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'coach' AND (role = 'member' OR id = auth.uid()) );

-- --------------------------------------------------------
-- PT PACKAGES
-- --------------------------------------------------------
CREATE POLICY "Admins have full access to pt_packages" 
ON pt_packages FOR ALL 
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

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
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

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
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

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
ALTER TABLE coach_availabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to coach_availabilities" 
ON coach_availabilities FOR ALL 
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Everyone can view coach_availabilities" 
ON coach_availabilities FOR SELECT 
USING ( true );

CREATE POLICY "Coaches can manage their own availabilities" 
ON coach_availabilities FOR ALL 
USING ( auth.uid() = coach_id );
