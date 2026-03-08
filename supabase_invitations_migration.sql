-- INZAN Athletics: Invitations System Migration
-- This migration adds an invitation balance to members and a table to track guest entries.

-- 1. Add invitations_balance to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invitations_balance INTEGER DEFAULT 14;

-- 2. Create Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT,
    guest_phone TEXT,
    visit_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view their own invitations" 
ON public.invitations FOR SELECT 
USING (auth.uid() = member_id);

CREATE POLICY "Users can create their own invitations" 
ON public.invitations FOR INSERT 
WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admins can view all invitations" 
ON public.invitations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can manage all invitations" 
ON public.invitations FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 5. Trigger to deduct balance on invitation creation
CREATE OR REPLACE FUNCTION public.deduct_invitation_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if member has enough balance
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = NEW.member_id AND invitations_balance > 0
    ) THEN
        RAISE EXCEPTION 'No invitations remaining.';
    END IF;

    -- Deduct balance
    UPDATE public.profiles 
    SET invitations_balance = invitations_balance - 1
    WHERE id = NEW.member_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_invitation_created
    BEFORE INSERT ON public.invitations
    FOR EACH ROW EXECUTE PROCEDURE public.deduct_invitation_balance();

-- 6. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
