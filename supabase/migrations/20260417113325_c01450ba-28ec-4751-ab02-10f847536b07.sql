-- Drop existing policies if any (safe)
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can delete product images" ON storage.objects;

-- Public read access
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Admins and owners can upload
CREATE POLICY "Admins and owners can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_owner(auth.uid()))
);

-- Admins and owners can update
CREATE POLICY "Admins and owners can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_owner(auth.uid()))
);

-- Admins and owners can delete
CREATE POLICY "Admins and owners can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_owner(auth.uid()))
);