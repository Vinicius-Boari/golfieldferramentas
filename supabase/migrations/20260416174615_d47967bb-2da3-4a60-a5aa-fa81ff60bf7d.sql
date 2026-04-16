
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hero-videos',
  'hero-videos',
  true,
  104857600,
  array['video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read hero videos"
on storage.objects for select
to public
using (bucket_id = 'hero-videos');

create policy "Admins and owners can upload hero videos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'hero-videos'
  and (public.has_role(auth.uid(), 'admin'::public.app_role) or public.is_owner(auth.uid()))
);

create policy "Admins and owners can update hero videos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'hero-videos'
  and (public.has_role(auth.uid(), 'admin'::public.app_role) or public.is_owner(auth.uid()))
);

create policy "Admins and owners can delete hero videos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'hero-videos'
  and (public.has_role(auth.uid(), 'admin'::public.app_role) or public.is_owner(auth.uid()))
);
