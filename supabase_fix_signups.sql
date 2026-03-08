-- INZAN Athletics: Fix Signups and Implement Admin Approval
-- This migration ensures the profiles table is correctly set up and automatically 
-- populated upon Auth signup, defaulting to 'pending' status for admin approval.

-- 1. Ensure Profiles Table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'coach')),
    avatar_url TEXT,
    member_code TEXT UNIQUE,
    current_strain INTEGER DEFAULT 0,
    current_recovery INTEGER DEFAULT 100,
    risk_status TEXT DEFAULT 'low' CHECK (risk_status IN ('low', 'medium', 'high')),
    membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('active', 'suspended', 'expired', 'pending')),
    membership_expiry TIMESTAMPTZ,
    last_attendance TIMESTAMPTZ,
    membership_tier_id UUID REFERENCES public.membership_tiers(id) ON DELETE SET NULL,
    athletic_passport_badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Trigger Function for New User Registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        full_name, 
        email, 
        avatar_url, 
        membership_status, 
        role,
        member_code
    )
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://i.pravatar.cc/150?u=' || NEW.id), 
        'pending', 
        'member',
        UPPER(SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger to automate profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
