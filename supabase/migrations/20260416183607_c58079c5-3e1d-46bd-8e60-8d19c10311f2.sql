
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-images', 'maintenance-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Maintenance images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'maintenance-images');

CREATE POLICY "Admins can upload maintenance images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'maintenance-images'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_owner(auth.uid()))
);

CREATE POLICY "Admins can update maintenance images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'maintenance-images'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_owner(auth.uid()))
);

CREATE POLICY "Admins can delete maintenance images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'maintenance-images'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_owner(auth.uid()))
);
