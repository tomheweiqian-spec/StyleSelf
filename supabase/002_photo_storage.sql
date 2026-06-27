-- Storage bucket for user body photos
insert into storage.buckets (id, name, public)
values ('user-photos', 'user-photos', false);

-- Only the owner can upload to their folder
create policy "Users can upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'user-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Only the owner can view their photos
create policy "Users can view own photos"
  on storage.objects for select
  using (
    bucket_id = 'user-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Only the owner can delete their photos
create policy "Users can delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'user-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add body photo path column to profiles
alter table public.profiles
  add column if not exists body_photo_path text;
