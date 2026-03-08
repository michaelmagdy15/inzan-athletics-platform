-- ============================================================
-- PACKAGE OFFERINGS SYSTEM
-- ============================================================

-- 1. Create table for package offerings (the product menu)
CREATE TABLE IF NOT EXISTS package_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'Private Training', 'PT Youth', 'Nutrition', 'Classes', 'MMA'
  sub_category TEXT,       -- 'Standard', 'C. Bezo', 'Bassem Youssef', 'Kids - Youth', 'S.G.F', 'Ezzat Heidar'
  name TEXT NOT NULL,
  session_type TEXT NOT NULL, -- pt_1on1, partner, group, nutrition, class, trial
  total_sessions INT NOT NULL,
  price_member NUMERIC(10,2) NOT NULL,
  price_outsider NUMERIC(10,2),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clear existing to prevent duplicates during re-runs
TRUNCATE package_offerings;

-- 3. Insert Private Training (Standard)
INSERT INTO package_offerings (category, sub_category, name, session_type, total_sessions, price_member) VALUES
  ('Private Training', 'Standard', '1-on-1 PT (8 Sessions)', 'pt_1on1', 8, 7200),
  ('Private Training', 'Standard', '1-on-1 PT (12 Sessions)', 'pt_1on1', 12, 9800),
  ('Private Training', 'Standard', '1-on-1 PT (16 Sessions)', 'pt_1on1', 16, 12400),
  ('Private Training', 'Standard', '1-on-1 PT (20 Sessions)', 'pt_1on1', 20, 14700),
  ('Private Training', 'Standard', 'Partner Training (8 Sessions)', 'partner', 8, 5700),
  ('Private Training', 'Standard', 'Partner Training (12 Sessions)', 'partner', 12, 7700),
  ('Private Training', 'Standard', 'Partner Training (16 Sessions)', 'partner', 16, 9800),
  ('Private Training', 'Standard', 'Partner Training (20 Sessions)', 'partner', 20, 11650),
  ('Private Training', 'Standard', 'Group Training (8 Sessions)', 'group', 8, 5280),
  ('Private Training', 'Standard', 'Group Training (12 Sessions)', 'group', 12, 6380),
  ('Private Training', 'Standard', 'Group Training (16 Sessions)', 'group', 16, 7650),
  ('Private Training', 'Standard', 'Group Training (20 Sessions)', 'group', 20, 9000);

-- 4. Insert PT Youth
INSERT INTO package_offerings (category, sub_category, name, session_type, total_sessions, price_member) VALUES
  ('PT Youth', 'Standard', 'Youth Group (8 Sessions)', 'group', 8, 5500),
  ('PT Youth', 'Standard', 'Youth Group (12 Sessions)', 'group', 12, 6830),
  ('PT Youth', 'Standard', 'Youth Group (16 Sessions)', 'group', 16, 8700),
  ('PT Youth', 'Standard', 'Youth Group (20 Sessions)', 'group', 20, 10375);

-- 5. Insert PT With C. Bezo
INSERT INTO package_offerings (category, sub_category, name, session_type, total_sessions, price_member) VALUES
  ('Private Training', 'C. Bezo', 'Bezo 1-on-1 (8 Sessions)', 'pt_1on1', 8, 12000),
  ('Private Training', 'C. Bezo', 'Bezo 1-on-1 (12 Sessions)', 'pt_1on1', 12, 15900),
  ('Private Training', 'C. Bezo', 'Bezo 1-on-1 (16 Sessions)', 'pt_1on1', 16, 19950),
  ('Private Training', 'C. Bezo', 'Bezo Group (8 Sessions)', 'group', 8, 7600),
  ('Private Training', 'C. Bezo', 'Bezo Group (12 Sessions)', 'group', 12, 8280),
  ('Private Training', 'C. Bezo', 'Bezo Group (16 Sessions)', 'group', 16, 9890);

-- 6. Bassem Youssef Rates
INSERT INTO package_offerings (category, sub_category, name, session_type, total_sessions, price_member, price_outsider) VALUES
  ('Private Training', 'Bassem Youssef', 'Bassem Group (Members)', 'group', 16, 8800, NULL),
  ('Private Training', 'Bassem Youssef', 'Bassem Group (Non-Members)', 'group', 12, 11000, 11000);

-- 7. Nutrition
INSERT INTO package_offerings (category, sub_category, name, session_type, total_sessions, price_member, price_outsider) VALUES
  ('Nutrition', 'Standard', 'Nutrition With PT (4 Sessions)', 'nutrition', 4, 2750, 2750),
  ('Nutrition', 'Standard', 'Nutrition With PT (8 Sessions)', 'nutrition', 8, 4950, 4950),
  ('Nutrition', 'Standard', 'Nutrition With PT (12 Sessions)', 'nutrition', 12, 6600, 6600),
  ('Nutrition', 'Standard', 'Nutrition Without PT (4 Sessions)', 'nutrition', 4, 3300, 3300),
  ('Nutrition', 'Standard', 'Nutrition Without PT (8 Sessions)', 'nutrition', 8, 5500, 5500),
  ('Nutrition', 'Standard', 'Nutrition Without PT (12 Sessions)', 'nutrition', 12, 7150, 7150);

-- 8. Classes (Standard)
INSERT INTO package_offerings (category, sub_category, name, session_type, total_sessions, price_member, price_outsider) VALUES
  ('Classes', 'Standard', 'Group Class (1 Session)', 'class', 1, 650, 750),
  ('Classes', 'Standard', 'Group Class (8 Sessions)', 'class', 8, 2800, 3120),
  ('Classes', 'Standard', 'Group Class (12 Sessions)', 'class', 12, 3590, 3835),
  ('Classes', 'Standard', 'Partner Class (8 Sessions)', 'partner', 8, 3750, 4680),
  ('Classes', 'Standard', 'Partner Class (12 Sessions)', 'partner', 12, 4680, 6110),
  ('Classes', 'Standard', '1-on-1 Class (1 Session)', 'pt_1on1', 1, 800, 1000),
  ('Classes', 'Standard', '1-on-1 Class (8 Sessions)', 'pt_1on1', 8, 5800, 6840),
  ('Classes', 'Standard', '1-on-1 Class (12 Sessions)', 'pt_1on1', 12, 7650, 8970);

-- 9. Kids Classes
INSERT INTO package_offerings (category, sub_category, name, session_type, total_sessions, price_member) VALUES
  ('Classes', 'Kids - Youth', 'Ballet (8 Sessions)', 'class', 8, 3120),
  ('Classes', 'Kids - Youth', 'Gymnastics (8 Sessions)', 'class', 8, 3120),
  ('Classes', 'Kids - Youth', 'Gymnastics (12 Sessions)', 'class', 12, 3600);

-- 10. MMA Zone (S.G.F)
INSERT INTO package_offerings (category, sub_category, name, session_type, total_sessions, price_member, price_outsider) VALUES
  ('MMA', 'S.G.F', 'MMA Group (1 Session)', 'class', 1, 600, 700),
  ('MMA', 'S.G.F', 'MMA Group (8 Sessions)', 'class', 8, 2400, 2640),
  ('MMA', 'S.G.F', 'MMA Group (12 Sessions)', 'class', 12, 3050, 3250),
  ('MMA', 'S.G.F', 'MMA Partner (8 Sessions)', 'partner', 8, 3200, 3960),
  ('MMA', 'S.G.F', 'MMA Partner (12 Sessions)', 'partner', 12, 3960, 5200),
  ('MMA', 'S.G.F', 'MMA 1-on-1 (1 Session)', 'pt_1on1', 1, 750, 850),
  ('MMA', 'S.G.F', 'MMA 1-on-1 (8 Sessions)', 'pt_1on1', 8, 4950, 5800),
  ('MMA', 'S.G.F', 'MMA 1-on-1 (12 Sessions)', 'pt_1on1', 12, 6500, 7600);

-- 11. MMA With Ezzat Heidar
INSERT INTO package_offerings (category, sub_category, name, session_type, total_sessions, price_member, price_outsider) VALUES
  ('MMA', 'Ezzat Heidar', 'Ezzat Partner (8 Sessions)', 'partner', 8, 3650, 4555),
  ('MMA', 'Ezzat Heidar', 'Ezzat Partner (12 Sessions)', 'partner', 12, 4555, 5950),
  ('MMA', 'Ezzat Heidar', 'Ezzat 1-on-1 (1 Session)', 'pt_1on1', 1, 850, 1000),
  ('MMA', 'Ezzat Heidar', 'Ezzat 1-on-1 (8 Sessions)', 'pt_1on1', 8, 5665, 6655),
  ('MMA', 'Ezzat Heidar', 'Ezzat 1-on-1 (12 Sessions)', 'pt_1on1', 12, 7450, 8750);

-- Enable RLS
ALTER TABLE package_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for all" ON package_offerings FOR SELECT USING (true);
