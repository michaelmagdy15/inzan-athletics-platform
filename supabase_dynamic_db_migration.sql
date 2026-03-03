-- Supabase Dynamic DB Migration (Targeted at UI Un-Mocking)

-- 1. Create Financial Transactions Table
DROP TABLE IF EXISTS public.financial_transactions CASCADE;
CREATE TABLE public.financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('membership', 'package', 'kitchen', 'refund', 'other')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
    description TEXT,
    member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security for financial_transactions
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view transactions" ON public.financial_transactions FOR SELECT USING (EXists (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can insert transactions" ON public.financial_transactions FOR INSERT WITH CHECK (EXists (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 2. Create Equipment Table
DROP TABLE IF EXISTS public.equipment CASCADE;
CREATE TABLE public.equipment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) NOT NULL CHECK (status IN ('operational', 'needs_maintenance', 'out_of_orded')),
    purchase_date DATE,
    expected_lifespan_years NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security for equipment
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Admins can manage equipment" ON public.equipment FOR ALL USING (EXists (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 3. Create Facility Zones Table
DROP TABLE IF EXISTS public.facility_zones CASCADE;
CREATE TABLE public.facility_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Good', 'Clean', 'Operational', 'Restocking', 'Maintenance')),
    health_percentage INTEGER CHECK (health_percentage BETWEEN 0 AND 100),
    requires_warning BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security for facility_zones
ALTER TABLE public.facility_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view facility zones" ON public.facility_zones FOR SELECT USING (true);
CREATE POLICY "Admins can manage facility zones" ON public.facility_zones FOR ALL USING (EXists (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 4. Create Operating Goals Table
DROP TABLE IF EXISTS public.operating_goals CASCADE;
CREATE TABLE public.operating_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period VARCHAR(50) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
    metric_name VARCHAR(100) NOT NULL,
    current_value DECIMAL(10, 2) DEFAULT 0,
    target_value DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security for operating_goals
ALTER TABLE public.operating_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view goals" ON public.operating_goals FOR SELECT USING (EXists (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can manage goals" ON public.operating_goals FOR ALL USING (EXists (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 5. Alter Coaches Table to include dynamic metrics
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3, 2) DEFAULT 5.0;
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS retention_rate DECIMAL(5, 2) DEFAULT 100.0;
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS active_clients INTEGER DEFAULT 0;

-- Optionally, create a trigger to auto-update total_price of kitchen items/transactions
-- Insert seed data for standard functionality

INSERT INTO public.operating_goals (period, metric_name, current_value, target_value, currency) VALUES 
('daily', 'Revenue Target', 4200, 5000, 'EGP'),
('weekly', 'Attendance Rate', 850, 1000, NULL),
('monthly', 'New Members', 28, 50, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.facility_zones (name, status, health_percentage, requires_warning) VALUES 
('Main Workout Floor', 'Good', 100, false),
('Weight Room', 'Clean', 98, false),
('Storage Modules', 'Operational', 94, false),
('Locker Rooms', 'Restocking', 84, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.equipment (name, category, status, purchase_date, expected_lifespan_years) VALUES
('Running Treadmill T-1', 'Cardio', 'operational', '2023-01-15', 5),
('Running Treadmill T-2', 'Cardio', 'needs_maintenance', '2023-01-15', 5),
('Squat Rack Alpha', 'Strength', 'operational', '2022-05-20', 10)
ON CONFLICT DO NOTHING;
