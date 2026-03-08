-- Supabase Migration: Nutritionist Portal Support

-- 1. Create nutritionists table (similar to coaches)
CREATE TABLE IF NOT EXISTS nutritionists (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT,
    specialties TEXT[],
    experience_years INT,
    rating NUMERIC(3,2) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create nutrition_assessments table
CREATE TABLE IF NOT EXISTS nutrition_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    weight_kg NUMERIC(5,2),
    height_cm NUMERIC(5,2),
    body_fat_pct NUMERIC(4,2),
    muscle_mass_kg NUMERIC(5,2),
    waist_circumference_cm NUMERIC(5,2),
    hip_circumference_cm NUMERIC(5,2),
    daily_calories_target INT,
    protein_grams INT,
    carbs_grams INT,
    fats_grams INT,
    notes TEXT,
    assessment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    meals JSONB NOT NULL DEFAULT '[]', -- Array of meals with name, calories, macros, and timing
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE nutritionists ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Nutritionists: Everyone can view, admins can manage, nutritionists can manage own
CREATE POLICY "Anyone can view nutritionists" ON nutritionists FOR SELECT USING (true);
CREATE POLICY "Admins can manage nutritionists" ON nutritionists FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Nutritionists can update own profile" ON nutritionists FOR UPDATE USING (auth.uid() = id);

-- Nutrition Assessments: Members can view own, nutritionists can manage for their clients, admins full access
CREATE POLICY "Admins full access to assessments" ON nutrition_assessments FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Members view own assessments" ON nutrition_assessments FOR SELECT USING (auth.uid() = member_id);
CREATE POLICY "Nutritionists manage own assessments" ON nutrition_assessments FOR ALL USING (auth.uid() = nutritionist_id);

-- Meal Plans: Members can view assigned, nutritionists manage for their clients, admins full access
CREATE POLICY "Admins full access to meal plans" ON meal_plans FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Members view assigned meal plans" ON meal_plans FOR SELECT USING (auth.uid() = member_id);
CREATE POLICY "Nutritionists manage own meal plans" ON meal_plans FOR ALL USING (auth.uid() = nutritionist_id);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
