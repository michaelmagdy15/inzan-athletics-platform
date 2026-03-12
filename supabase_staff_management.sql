-- Staff Management Schema

CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES public.profiles(id) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('coach', 'admin', 'nutritionist')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES public.profiles(id) NOT NULL,
    punch_in TIMESTAMP WITH TIME ZONE NOT NULL,
    punch_out TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payroll_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES public.profiles(id) NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    base_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    commissions DECIMAL(10,2) NOT NULL DEFAULT 0,
    bonuses DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Basic RLS
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins have full access to staff shifts" ON public.staff_shifts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins have full access to staff attendance" ON public.staff_attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins have full access to payroll" ON public.payroll_records FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Staff can read their own shifts
CREATE POLICY "Staff can view their own shifts" ON public.staff_shifts FOR SELECT USING (
    staff_id = auth.uid()
);

-- Staff can read and insert their own attendance (punch in/out)
CREATE POLICY "Staff can view their own attendance" ON public.staff_attendance FOR SELECT USING (
    staff_id = auth.uid()
);
CREATE POLICY "Staff can insert their own attendance" ON public.staff_attendance FOR INSERT WITH CHECK (
    staff_id = auth.uid()
);
CREATE POLICY "Staff can update their own attendance" ON public.staff_attendance FOR UPDATE USING (
    staff_id = auth.uid()
);

-- Staff can read their own payroll records
CREATE POLICY "Staff can view their own payroll" ON public.payroll_records FOR SELECT USING (
    staff_id = auth.uid()
);
