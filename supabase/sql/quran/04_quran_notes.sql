-- 4. តារាងសម្រាប់កំណត់ហេតុ (Notes)
CREATE TABLE quran_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_id INTEGER NOT NULL,
  ayah_id INTEGER NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, surah_id, ayah_id)
);

-- បើកដំណើរការ Row Level Security (RLS)
ALTER TABLE quran_notes ENABLE ROW LEVEL SECURITY;

-- បង្កើត Policies
CREATE POLICY "Users can view their own notes" ON quran_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON quran_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON quran_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON quran_notes FOR DELETE USING (auth.uid() = user_id);

-- បង្កើត Indexes
CREATE INDEX idx_quran_notes_user_id ON quran_notes(user_id);
