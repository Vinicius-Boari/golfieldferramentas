
-- Add avatar_url column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create avatars storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can view; authenticated users can upload/update/delete their own avatar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatar images are publicly accessible' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'avatars'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'avatars'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'avatars'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;
