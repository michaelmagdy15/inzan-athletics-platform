-- Social and Gamification Schema

-- 1. Create Posts table
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Post Comments table
CREATE TABLE IF NOT EXISTS public.social_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Post Likes table (to prevent double voting)
CREATE TABLE IF NOT EXISTS public.social_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, member_id)
);

-- 4. Create Gamification Points table
CREATE TABLE IF NOT EXISTS public.gamification_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- e.g., 'completed_class', 'logged_workout', 'pb_achieved'
  points INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_points ENABLE ROW LEVEL SECURITY;

-- Policies for Social Posts
CREATE POLICY "Anyone can view social posts"
  ON public.social_posts FOR SELECT
  USING (true);

CREATE POLICY "Members can insert their own posts"
  ON public.social_posts FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members can delete their own posts"
  ON public.social_posts FOR DELETE
  USING (auth.uid() = member_id);

-- Policies for Social Comments
CREATE POLICY "Anyone can view social comments"
  ON public.social_comments FOR SELECT
  USING (true);

CREATE POLICY "Members can insert their own comments"
  ON public.social_comments FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members can delete their own comments"
  ON public.social_comments FOR DELETE
  USING (auth.uid() = member_id);

-- Policies for Social Likes
CREATE POLICY "Anyone can view likes"
  ON public.social_likes FOR SELECT
  USING (true);

CREATE POLICY "Members can like a post"
  ON public.social_likes FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members can unlike a post"
  ON public.social_likes FOR DELETE
  USING (auth.uid() = member_id);

-- Policies for Gamification Points
CREATE POLICY "Anyone can view gamification points"
  ON public.gamification_points FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert gamification points"
  ON public.gamification_points FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
