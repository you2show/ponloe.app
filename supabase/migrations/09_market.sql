-- ===============================================================================
-- Halal Market Table
-- ===============================================================================

-- 1. Create market_items table
CREATE TABLE IF NOT EXISTS public.market_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT DEFAULT 'other',
  location TEXT,
  condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'used', 'like_new')),
  media_urls TEXT[],
  contact_info JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved', 'archived')),
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Active market items are viewable by everyone." ON public.market_items;
CREATE POLICY "Active market items are viewable by everyone."
  ON public.market_items FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own market items." ON public.market_items;
CREATE POLICY "Users can insert their own market items."
  ON public.market_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own market items." ON public.market_items;
CREATE POLICY "Users can update their own market items."
  ON public.market_items FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own market items." ON public.market_items;
CREATE POLICY "Users can delete their own market items."
  ON public.market_items FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Market categories reference
COMMENT ON TABLE public.market_items IS 'Categories: food, clothing, books, electronics, home, beauty, other';
