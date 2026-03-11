-- Add social links and username to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_fb TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_telegram TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_youtube TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_gmail TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_website TEXT;
