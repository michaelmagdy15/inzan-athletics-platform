-- 1. Create a sequence for 4-digit member IDs
-- We start at 0 to support '0000' as requested
CREATE SEQUENCE IF NOT EXISTS public.member_id_seq 
    START WITH 0 
    INCREMENT BY 1 
    MINVALUE 0 
    MAXVALUE 9999 
    CYCLE;

-- 2. Update the handle_new_user trigger function to use the sequence
-- This handles users signing up through Supabase Auth
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
        LPAD(nextval('public.member_id_seq')::text, 4, '0')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Set the default value for member_code column
-- This handles manual inserts into the profiles table (like from the Admin Hub)
ALTER TABLE public.profiles 
    ALTER COLUMN member_code SET DEFAULT LPAD(nextval('public.member_id_seq')::text, 4, '0');

-- 4. Update existing profiles with new 4-digit codes (Optional but recommended for consistency)
-- Warning: This will overwrite existing member_codes
-- To avoid conflicts with the sequence, we use a temporary update
DO $$
DECLARE
    r RECORD;
BEGIN
    -- This resets the sequence to ensure existing records get IDs starting from 0000
    ALTER SEQUENCE public.member_id_seq RESTART WITH 0;
    
    FOR r IN (SELECT id FROM public.profiles ORDER BY created_at ASC) LOOP
        UPDATE public.profiles 
        SET member_code = LPAD(nextval('public.member_id_seq')::text, 4, '0')
        WHERE id = r.id;
    END LOOP;
END $$;

-- 5. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
