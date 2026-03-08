-- Create a settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name TEXT DEFAULT 'INZAN Athletics',
    timezone TEXT DEFAULT 'UTC+2',
    currency TEXT DEFAULT 'EGP',
    notifications_enabled BOOLEAN DEFAULT true,
    mfa_required BOOLEAN DEFAULT true,
    encryption_level TEXT DEFAULT 'AES-256',
    active_theme TEXT DEFAULT 'default',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow all users to read settings
CREATE POLICY "Allow public read access" ON public.system_settings
    FOR SELECT USING (true);

-- Allow only admins to update settings
CREATE POLICY "Allow admin update access" ON public.system_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert initial settings if the table is empty
INSERT INTO public.system_settings (id, brand_name, active_theme)
SELECT gen_random_uuid(), 'INZAN Athletics', 'default'
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);
