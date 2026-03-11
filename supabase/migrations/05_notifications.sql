-- 1. Create notifications table
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'mention', 'follow', 'system');

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The user receiving the notification
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- The user who triggered it
  type notification_type NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
CREATE POLICY "Users can view their own notifications."
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications (mark as read)." ON public.notifications;
CREATE POLICY "Users can update their own notifications (mark as read)."
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications." ON public.notifications;
CREATE POLICY "Users can delete their own notifications."
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Trigger to create notification on like
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  post_owner UUID;
BEGIN
  SELECT user_id INTO post_owner FROM public.posts WHERE id = NEW.post_id;
  IF post_owner != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, post_id)
    VALUES (post_owner, NEW.user_id, 'like', NEW.post_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_notify ON public.post_likes;
CREATE TRIGGER on_like_notify
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE PROCEDURE public.notify_on_like();

-- 5. Trigger to create notification on comment
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner UUID;
BEGIN
  SELECT user_id INTO post_owner FROM public.posts WHERE id = NEW.post_id;
  IF post_owner != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, post_id, comment_id)
    VALUES (post_owner, NEW.user_id, 'comment', NEW.post_id, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_notify ON public.comments;
CREATE TRIGGER on_comment_notify
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.notify_on_comment();
