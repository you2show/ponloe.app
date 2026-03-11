-- 1. Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for comments
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
CREATE POLICY "Comments are viewable by everyone."
  ON public.comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own comments." ON public.comments;
CREATE POLICY "Users can insert their own comments."
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments." ON public.comments;
CREATE POLICY "Users can update their own comments."
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments." ON public.comments;
CREATE POLICY "Users can delete their own comments."
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Trigger to update comments_count on posts
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_inserted ON public.comments;
CREATE TRIGGER on_comment_inserted
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_comments_count();

DROP TRIGGER IF EXISTS on_comment_deleted ON public.comments;
CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_comments_count();
