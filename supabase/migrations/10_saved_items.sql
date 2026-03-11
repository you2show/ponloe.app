-- ===============================================================================
-- Saved/Bookmarked Items + Follows
-- ===============================================================================

-- 1. Saved posts table
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved posts." ON public.saved_posts;
CREATE POLICY "Users can view their own saved posts."
  ON public.saved_posts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save posts." ON public.saved_posts;
CREATE POLICY "Users can save posts."
  ON public.saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave posts." ON public.saved_posts;
CREATE POLICY "Users can unsave posts."
  ON public.saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are viewable by everyone." ON public.follows;
CREATE POLICY "Follows are viewable by everyone."
  ON public.follows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can follow others." ON public.follows;
CREATE POLICY "Users can follow others."
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow others." ON public.follows;
CREATE POLICY "Users can unfollow others."
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 3. Trigger to notify on follow
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

-- 4. Add followers/following count to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0;

CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_count ON public.follows;
CREATE TRIGGER on_follow_count
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE PROCEDURE public.update_follow_counts();

NOTIFY pgrst, 'reload schema';
