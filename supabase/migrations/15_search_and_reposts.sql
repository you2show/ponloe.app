-- 15. Search & Repost - Add search functionality and repost feature

-- 1. Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add columns for repost feature to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT false;

-- 3. Create indexes for search performance
DROP INDEX IF EXISTS idx_users_username_trgm;
CREATE INDEX idx_users_username_trgm ON public.profiles USING GIN (username gin_trgm_ops);

DROP INDEX IF EXISTS idx_posts_content_trgm;
CREATE INDEX idx_posts_content_trgm ON public.posts USING GIN (content gin_trgm_ops);

DROP INDEX IF EXISTS idx_posts_original_post;
CREATE INDEX idx_posts_original_post ON public.posts(original_post_id) WHERE original_post_id IS NOT NULL;

-- 4. Create search function for full-text search
CREATE OR REPLACE FUNCTION public.search_posts(query_text TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.user_id, p.content, p.created_at
  FROM public.posts p
  WHERE p.status = 'published'
    AND p.content ILIKE '%' || query_text || '%'
  ORDER BY p.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create search function for users
CREATE OR REPLACE FUNCTION public.search_users(query_text TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT pr.id, pr.username, pr.full_name, pr.avatar_url, pr.bio
  FROM public.profiles pr
  WHERE pr.username ILIKE '%' || query_text || '%'
     OR pr.full_name ILIKE '%' || query_text || '%'
  ORDER BY
    CASE
      WHEN pr.username ILIKE query_text || '%' THEN 1
      WHEN pr.username ILIKE '%' || query_text || '%' THEN 2
      ELSE 3
    END
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create view for combined search results
CREATE OR REPLACE VIEW public.search_results AS
SELECT
  'user'::TEXT as type,
  pr.id,
  pr.username as title,
  pr.full_name as subtitle,
  pr.avatar_url as image_url,
  pr.created_at
FROM public.profiles pr
UNION ALL
SELECT
  'post'::TEXT as type,
  p.id,
  COALESCE(pr.username, 'Unknown') || ': ' || LEFT(p.content, 50) as title,
  p.content as subtitle,
  NULL as image_url,
  p.created_at
FROM public.posts p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
WHERE p.status = 'published';
