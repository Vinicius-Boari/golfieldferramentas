ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS video_loop boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS video_audio boolean NOT NULL DEFAULT false;