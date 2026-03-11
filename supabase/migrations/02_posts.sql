-- 1. Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type post_type DEFAULT 'text'::post_type NOT NULL,
  content TEXT,
  media_urls TEXT[],
  extra_data JSONB,
  status post_status DEFAULT 'published'::post_status NOT NULL,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for posts

-- Anyone can read published posts
DROP POLICY IF EXISTS "Published posts are viewable by everyone." ON public.posts;
CREATE POLICY "Published posts are viewable by everyone."
  ON public.posts FOR SELECT
  USING (status = 'published');

-- Users can read their own posts regardless of status
DROP POLICY IF EXISTS "Users can view their own posts." ON public.posts;
CREATE POLICY "Users can view their own posts."
  ON public.posts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own posts
-- Since General Users don't need pending status for questions anymore,
-- they can insert directly as 'published'
DROP POLICY IF EXISTS "Users can insert their own posts." ON public.posts;
CREATE POLICY "Users can insert their own posts."
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
DROP POLICY IF EXISTS "Users can update their own posts." ON public.posts;
CREATE POLICY "Users can update their own posts."
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
DROP POLICY IF EXISTS "Users can delete their own posts." ON public.posts;
CREATE POLICY "Users can delete their own posts."
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 5. Enable RLS on post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for post_likes
DROP POLICY IF EXISTS "Post likes are viewable by everyone." ON public.post_likes;
CREATE POLICY "Post likes are viewable by everyone."
  ON public.post_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own likes." ON public.post_likes;
CREATE POLICY "Users can insert their own likes."
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes." ON public.post_likes;
CREATE POLICY "Users can delete their own likes."
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Trigger to update likes_count on posts
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_inserted ON public.post_likes;
CREATE TRIGGER on_like_inserted
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_likes_count();

DROP TRIGGER IF EXISTS on_like_deleted ON public.post_likes;
CREATE TRIGGER on_like_deleted
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_likes_count();
