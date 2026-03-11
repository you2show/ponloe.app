-- 13. Follow System - Add follow feature to make app more social
-- Create follows table for follower/following relationships

-- 1. Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 2. Enable RLS on follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for follows

-- Anyone can read follows (public followers/following)
DROP POLICY IF EXISTS "Follows are viewable by everyone." ON public.follows;
CREATE POLICY "Follows are viewable by everyone."
  ON public.follows FOR SELECT
  USING (true);

-- Users can insert their own follows
DROP POLICY IF EXISTS "Users can follow others." ON public.follows;
CREATE POLICY "Users can follow others."
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows (unfollow)
DROP POLICY IF EXISTS "Users can unfollow others." ON public.follows;
CREATE POLICY "Users can unfollow others."
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 4. Create indexes for fast feed generation
DROP INDEX IF EXISTS idx_follows_follower;
CREATE INDEX idx_follows_follower ON public.follows(follower_id);

DROP INDEX IF EXISTS idx_follows_following;
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- 5. Add follow system notification trigger
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_notify ON public.follows;
CREATE TRIGGER on_follow_notify
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE PROCEDURE public.notify_on_follow();
