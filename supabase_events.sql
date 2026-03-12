-- Events & Workshops Platform
-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('workshop', 'seminar', 'competition', 'social')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    max_participants INTEGER DEFAULT 0, -- 0 means unlimited
    price DECIMAL(10, 2) DEFAULT 0.00,
    image_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded', 'free')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, member_id)
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Events Policies
-- Everyone can view upcoming and ongoing events
CREATE POLICY "Anyone can view active events" 
    ON events FOR SELECT 
    USING (status IN ('upcoming', 'ongoing', 'completed'));

-- Only admins can manage events
CREATE POLICY "Admins can insert events" 
    ON events FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update events" 
    ON events FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete events" 
    ON events FOR DELETE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin'));

-- Event Registration Policies
-- Users can view their own registrations, admins can view all
CREATE POLICY "Users can view own registrations" 
    ON event_registrations FOR SELECT 
    USING (auth.uid() = member_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'coach')));

-- Users can register themselves
CREATE POLICY "Users can register" 
    ON event_registrations FOR INSERT 
    WITH CHECK (auth.uid() = member_id);

-- Users can cancel their registration, admins can update any
CREATE POLICY "Users can cancel registration or admins manage" 
    ON event_registrations FOR UPDATE 
    USING (auth.uid() = member_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin'));

-- trigger for updated_at on events
CREATE OR REPLACE FUNCTION update_events_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_events_updated_at_column();
