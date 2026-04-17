-- Add media_type column to products to allow image or video
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

-- Constrain values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_media_type_check'
  ) THEN
    ALTER TABLE public.products
    ADD CONSTRAINT products_media_type_check CHECK (media_type IN ('image','video'));
  END IF;
END $$;

-- Allow video uploads to the existing product-images bucket (keep public, no size limit)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/png','image/jpeg','image/jpg','image/webp','image/gif','image/svg+xml',
  'video/mp4','video/webm','video/ogg','video/quicktime'
]
WHERE id = 'product-images';