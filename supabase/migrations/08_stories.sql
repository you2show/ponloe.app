-- ===============================================================================
-- Stories Table
-- ===============================================================================

-- 1. Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  views_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Stories are viewable by everyone." ON public.stories;
CREATE POLICY "Stories are viewable by everyone."
  ON public.stories FOR SELECT
  USING (expires_at > NOW());

DROP POLICY IF EXISTS "Users can insert their own stories." ON public.stories;
CREATE POLICY "Users can insert their own stories."
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own stories." ON public.stories;
CREATE POLICY "Users can delete their own stories."
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Story views table
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Story views are viewable by story owner." ON public.story_views;
CREATE POLICY "Story views are viewable by story owner."
  ON public.story_views FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own story views." ON public.story_views;
CREATE POLICY "Users can insert their own story views."
  ON public.story_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Trigger to update views_count
CREATE OR REPLACE FUNCTION public.update_story_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stories SET views_count = views_count + 1 WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_story_view_inserted ON public.story_views;
CREATE TRIGGER on_story_view_inserted
  AFTER INSERT ON public.story_views
  FOR EACH ROW EXECUTE PROCEDURE public.update_story_views_count();
