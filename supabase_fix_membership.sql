-- Add the missing membership_tier_id column to the profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membership_tier_id UUID REFERENCES membership_tiers(id) ON DELETE SET NULL;

-- Notify the PostgREST API to refresh its schema cache to recognize the newly added column immediately.
NOTIFY pgrst, 'reload schema';
