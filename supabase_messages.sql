-- Migration: Create messages table
-- Table: messages
-- Description: In-app messaging system for members to communicate with staff

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 1. Users can read messages where they are the sender or receiver
CREATE POLICY "Users can read their own messages"
ON messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 2. Users can insert messages where they are the sender
CREATE POLICY "Users can insert messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- 3. Users can update messages where they are the receiver (to mark as read)
CREATE POLICY "Users can update received messages"
ON messages FOR UPDATE
USING (auth.uid() = receiver_id);
