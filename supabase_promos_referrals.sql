-- Migration: Create promo_codes and referrals tables
-- Description: Supports discount codes and member referral tracking

CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_amount NUMERIC NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    usage_limit INTEGER DEFAULT NULL, -- Null means unlimited
    times_used INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reward_status TEXT DEFAULT 'pending' CHECK (reward_status IN ('pending', 'completed', 'invalid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referred_id) -- A user can only be referred once
);

-- Active Referrals View or logic can be added here if needed to track lifetime value (LTV).

-- RLS Policies
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Promo Codes: Admins can do everything. Everyone can SELECT active codes (to validate them).
CREATE POLICY "Anyone can view active promo codes"
ON promo_codes FOR SELECT
USING (active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Admins can manage promo codes"
ON promo_codes FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Referrals: Users can view their own referrals (either as referrer or referred)
CREATE POLICY "Users can view their own referrals"
ON referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System/Admins can manage referrals"
ON referrals FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- To allow signed up users to insert a referral during initial purchase:
CREATE POLICY "Users can insert referrals linking to themselves"
ON referrals FOR INSERT
WITH CHECK (auth.uid() = referred_id);
