-- Style preferences on profiles
alter table public.profiles
  add column if not exists style_preferences text[] default '{}';

-- Wardrobe items table
create table if not exists public.wardrobe_items (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text,
  category      text,
  colors        text[] default '{}',
  style_tags    text[] default '{}',
  formality     integer check (formality between 1 and 5),
  season        text[] default '{}',
  brand_guess   text,
  image_path    text,
  outfits       jsonb,
  created_at    timestamp with time zone default now()
);

alter table public.wardrobe_items enable row level security;

create policy "Users can manage own wardrobe"
  on public.wardrobe_items for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Wardrobe items storage bucket
insert into storage.buckets (id, name, public)
values ('wardrobe-items', 'wardrobe-items', false)
on conflict (id) do nothing;

create policy "Users can upload own wardrobe items"
  on storage.objects for insert
  with check (
    bucket_id = 'wardrobe-items'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own wardrobe items"
  on storage.objects for select
  using (
    bucket_id = 'wardrobe-items'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own wardrobe items"
  on storage.objects for delete
  using (
    bucket_id = 'wardrobe-items'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
