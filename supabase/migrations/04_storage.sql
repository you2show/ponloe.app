-- 1. Create storage buckets for media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post_media', 'post_media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS for storage buckets
-- Allow public access to read media
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('post_media', 'avatars'));

-- Allow authenticated users to upload media
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND 
  bucket_id IN ('post_media', 'avatars')
);

-- Allow users to update their own media
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (auth.uid() = owner);

-- Allow users to delete their own media
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (auth.uid() = owner);
