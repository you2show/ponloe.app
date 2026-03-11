-- 1. តារាងសម្រាប់គោលដៅអានគម្ពីរ (Reading Goals)
CREATE TABLE quran_reading_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('ayahs', 'pages', 'time')),
  goal_amount INTEGER NOT NULL DEFAULT 50,
  current_progress INTEGER NOT NULL DEFAULT 0,
  last_updated_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- បើកដំណើរការ Row Level Security (RLS)
ALTER TABLE quran_reading_goals ENABLE ROW LEVEL SECURITY;

-- បង្កើត Policies
CREATE POLICY "Users can view their own reading goals" ON quran_reading_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reading goals" ON quran_reading_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reading goals" ON quran_reading_goals FOR UPDATE USING (auth.uid() = user_id);
