-- INZAN Athletics: Comprehensive Database Fix & Synchronization
-- Run this script in the Supabase SQL Editor to resolve "Database error saving new user"
-- and ensure all tables are correctly structured for the current platform features.

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure Membership Tiers Table exists (dependency for profiles)
CREATE TABLE IF NOT EXISTS public.membership_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    features TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Seed Membership Tiers if empty
INSERT INTO public.membership_tiers (name, price, billing_cycle, features)
SELECT 'BASIC ANNUAL', 37500, 'yearly', ARRAY['8 Weeks freezing period', '14 Invitations (1 three-day pass)']
WHERE NOT EXISTS (SELECT 1 FROM public.membership_tiers LIMIT 1);

-- 2.5. Safe Enum Update
-- Attempt to add 'nutritionist' to the enum if it exists. 
-- Note: This is idempotent and should be run manually if the sequence below fails.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'nutritionist';
ALTER TYPE membership_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE membership_status ADD VALUE IF NOT EXISTS 'canceled';

-- 4. Create/Fix Profiles Table
-- Using a DO block to handle complex schema updates safely
DO $$ 
BEGIN
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            email TEXT UNIQUE,
            role TEXT DEFAULT 'member',
            avatar_url TEXT,
            member_code TEXT UNIQUE,
            current_strain INTEGER DEFAULT 0,
            current_recovery INTEGER DEFAULT 100,
            risk_status TEXT DEFAULT 'low',
            membership_status TEXT DEFAULT 'pending',
            membership_expiry TIMESTAMPTZ,
            last_attendance TIMESTAMPTZ,
            membership_tier_id UUID REFERENCES public.membership_tiers(id) ON DELETE SET NULL,
            athletic_passport_badges JSONB DEFAULT '[]'::jsonb,
            invitations_balance INTEGER DEFAULT 14,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Ensure 'nutritionist' is allowed
    -- We drop old constraints first
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_membership_status_check;

    -- If the column type is still the ENUM, we skip the CHECK constraint or use a text-cast version
    -- The ADD VALUE above ensures the enum itself allows it.
    -- To facilitate further role additions, we prefer the column to be text, but we won't force a type change here.
    
    -- Check if we can add a check constraint safely by casting
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role::text IN ('member', 'admin', 'coach', 'nutritionist'));

    ALTER TABLE public.profiles ADD CONSTRAINT profiles_membership_status_check 
        CHECK (membership_status::text IN ('active', 'suspended', 'expired', 'pending', 'canceled'));

    -- Ensure invitations_balance exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='profiles' AND COLUMN_NAME='invitations_balance') THEN
        ALTER TABLE public.profiles ADD COLUMN invitations_balance INTEGER DEFAULT 14;
    END IF;
    
    -- Ensure member_code exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='profiles' AND COLUMN_NAME='member_code') THEN
        ALTER TABLE public.profiles ADD COLUMN member_code TEXT UNIQUE;
    END IF;
END $$;

-- 5. Set up Member ID Sequence
CREATE SEQUENCE IF NOT EXISTS public.member_id_seq 
    START WITH 1 
    INCREMENT BY 1 
    MINVALUE 1 
    MAXVALUE 9999 
    CYCLE;

-- 6. Update Sequence to match current count of profiles to avoid uniqueness conflicts
SELECT setval('public.member_id_seq', COALESCE((SELECT COUNT(*) FROM public.profiles), 0) + 1);

-- 7. Robust New User Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_member_code TEXT;
BEGIN
    -- Generate 4-digit code from sequence
    new_member_code := LPAD(nextval('public.member_id_seq')::text, 4, '0');
    
    INSERT INTO public.profiles (
        id, 
        full_name, 
        email, 
        avatar_url, 
        membership_status, 
        role,
        member_code,
        invitations_balance
    )
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://i.pravatar.cc/150?u=' || NEW.id), 
        'pending', 
        'member',
        new_member_code,
        14
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- This ensures we don't return NULL which confuses GoTrue, 
    -- but rather let the exception propagate with more context if possible.
    -- In production triggers, returning NULL cancels the parent operation.
    RAISE; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Re-apply Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Ensure Role Finder Function exists (required for RLS)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 10. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 11. Core Policies (Basic Access)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
CREATE POLICY "Admins have full access" ON public.profiles 
    FOR ALL USING (public.get_user_role() = 'admin');

-- 12. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';
