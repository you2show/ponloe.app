-- 2. តារាងសម្រាប់បេសកកម្មខែរ៉ាម៉ាដន (Ramadan Missions)
CREATE TABLE quran_ramadan_missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  completed_days INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- បើកដំណើរការ Row Level Security (RLS)
ALTER TABLE quran_ramadan_missions ENABLE ROW LEVEL SECURITY;

-- បង្កើត Policies
CREATE POLICY "Users can view their own ramadan missions" ON quran_ramadan_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ramadan missions" ON quran_ramadan_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ramadan missions" ON quran_ramadan_missions FOR UPDATE USING (auth.uid() = user_id);

-- បង្កើត Indexes
CREATE INDEX idx_quran_ramadan_missions_user_year ON quran_ramadan_missions(user_id, year);
