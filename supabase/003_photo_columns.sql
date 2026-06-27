-- Add side and back photo columns to profiles
alter table public.profiles
  add column if not exists body_photo_side_path text,
  add column if not exists body_photo_back_path text;
