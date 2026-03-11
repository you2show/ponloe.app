-- 3. តារាងសម្រាប់ចំណាំ (Bookmarks)
CREATE TABLE quran_bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_id INTEGER NOT NULL,
  ayah_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, surah_id, ayah_id)
);

-- បើកដំណើរការ Row Level Security (RLS)
ALTER TABLE quran_bookmarks ENABLE ROW LEVEL SECURITY;

-- បង្កើត Policies
CREATE POLICY "Users can view their own bookmarks" ON quran_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON quran_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON quran_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- បង្កើត Indexes
CREATE INDEX idx_quran_bookmarks_user_id ON quran_bookmarks(user_id);
