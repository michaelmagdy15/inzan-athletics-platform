-- Content Library Schema

CREATE TABLE IF NOT EXISTS public.library_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'recipe', 'document')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    author_id UUID REFERENCES public.members(id)
);

-- RLS Policies
ALTER TABLE public.library_content ENABLE ROW LEVEL SECURITY;

-- Admins can manage all content
CREATE POLICY "Admins have full access to library content" ON public.library_content FOR ALL USING (
    EXISTS (SELECT 1 FROM public.members WHERE id = auth.uid() AND role IN ('admin', 'coach', 'nutritionist'))
);

-- Everyone can view free content, but only those with active memberships can view premium content
CREATE POLICY "Users can view content" ON public.library_content FOR SELECT USING (
    (NOT is_premium) OR 
    (is_premium AND EXISTS (
        SELECT 1 FROM public.members 
        WHERE id = auth.uid() 
        AND membership_status = 'active'
    ))
);
