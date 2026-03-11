-- ===============================================================================
-- Supabase Schema Safeguard & Update Script
-- ===============================================================================
-- គោលបំណង៖ ធានាថាគ្រប់កូឡោន (Columns) ទាំងអស់ដែលត្រូវការដោយ Frontend គឺមាននៅក្នុង Database
-- ដោយប្រើប្រាស់លក្ខខណ្ឌ IF NOT EXISTS ដើម្បីកុំឱ្យមាន Error ពេលកូឡោននោះមានរួចហើយ។
-- ===============================================================================

DO $$ 
BEGIN
    -- 1. បន្ថែមប្រភេទ (Types) ប្រសិនបើមិនទាន់មាន
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'scholar', 'premium', 'general');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
        CREATE TYPE post_status AS ENUM ('published', 'pending', 'rejected', 'archived');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_type') THEN
        CREATE TYPE post_type AS ENUM ('text', 'image', 'video', 'article', 'quran', 'dua', 'poll', 'market');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('like', 'comment', 'mention', 'follow', 'system');
    END IF;

    -- 2. ធានាថាមានតារាង profiles
    CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY
    );

    -- 3. បន្ថែមកូឡោនទូទៅ (General Columns) ជាមួយនឹងលក្ខខណ្ឌការពារ (IF NOT EXISTS)
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'general'::user_role NOT NULL;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

    -- 4. បន្ថែមកូឡោនសម្រាប់បណ្ដាញសង្គម (Social Links)
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_fb TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_telegram TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_youtube TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_instagram TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_gmail TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_website TEXT;

    -- 5. បង្កើតតារាង comment_likes ប្រសិនបើមិនទាន់មាន
    CREATE TABLE IF NOT EXISTS public.comment_likes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(comment_id, user_id)
    );

    -- Enable RLS for comment_likes
    ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

    -- Create RLS Policies for comment_likes (using DO block to catch duplicate policy errors)
    BEGIN
        CREATE POLICY "Comment likes are viewable by everyone." ON public.comment_likes FOR SELECT USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END;

    BEGIN
        CREATE POLICY "Users can insert their own comment likes." ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN null; END;

    BEGIN
        CREATE POLICY "Users can delete their own comment likes." ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN null; END;

EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN
        RAISE NOTICE 'មានបញ្ហាក្នុងការបង្កើតកូឡោន: %', SQLERRM;
END $$;

-- ===============================================================================
-- ចំណុចសំខាន់បំផុតដើម្បីជៀសវាង Error "schema cache"
-- ===============================================================================
-- ពេលខ្លះ Supabase (PostgREST) មិនទាន់ស្គាល់កូឡោនថ្មីភ្លាមៗទេ ដែលបណ្ដាលឱ្យមាន Error 
-- "Could not find the column in the schema cache"
-- កូដខាងក្រោមនេះនឹងបង្ខំឱ្យ Supabase Refresh Schema ភ្លាមៗតែម្ដង៖
NOTIFY pgrst, 'reload schema';
