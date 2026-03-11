-- 1. Create custom types (using DO block to ignore if already exists)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'scholar', 'premium', 'general');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('published', 'pending', 'rejected', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('text', 'image', 'video', 'article', 'quran', 'dua', 'poll', 'market');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('like', 'comment', 'mention', 'follow', 'system');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Add new columns to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'general'::user_role NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
