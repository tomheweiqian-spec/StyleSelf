-- Profiles table: stores body profile data per user
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  height integer,
  weight integer,
  gender text check (gender in ('female', 'male', 'non-binary')),
  bust integer,
  waist integer,
  hips integer,
  shoe_size numeric(4,1),
  skin_tone text,
  onboarding_complete boolean default false,
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
