-- Migration: Create legal_agreements table
-- Description: Stores signed legal documents, waivers, and T&C agreements

CREATE TABLE IF NOT EXISTS legal_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- e.g., 'liability_waiver', 'terms_and_conditions'
    agreed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    signature_data TEXT, -- Optional base64 or representation for drawn signatures
    UNIQUE(member_id, document_type)
);

-- RLS Policies
ALTER TABLE legal_agreements ENABLE ROW LEVEL SECURITY;

-- 1. Users can read their own agreements
CREATE POLICY "Users can view their own legal agreements"
ON legal_agreements FOR SELECT
USING (auth.uid() = member_id);

-- 2. Users can insert their own agreements
CREATE POLICY "Users can sign legal agreements"
ON legal_agreements FOR INSERT
WITH CHECK (auth.uid() = member_id);

-- 3. Admins can view all agreements
CREATE POLICY "Admins can view all legal agreements"
ON legal_agreements FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
