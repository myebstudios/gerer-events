create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text unique,
  description text,
  location text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  event_type text not null,
  template_id text,
  theme_color text,
  typography_preset text,
  cover_image_url text,
  status text not null default 'draft',
  moderation_mode text default 'auto-approve',
  upload_enabled boolean not null default true,
  max_upload_size_mb integer not null default 50,
  max_uploads_per_guest integer not null default 20,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_status_check check (status in ('draft','published','live','ended')),
  constraint events_moderation_mode_check check (moderation_mode in ('auto-approve','review'))
);

create table if not exists public.event_staff (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (event_id, user_id),
  constraint event_staff_role_check check (role in ('owner','co_host','staff','viewer'))
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  attendance_status text not null default 'maybe',
  plus_ones integer not null default 0,
  meal_preference text,
  message text,
  qr_token text not null unique,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guests_attendance_status_check check (attendance_status in ('yes','no','maybe'))
);

create table if not exists public.media_uploads (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  file_path text not null,
  file_url text,
  file_type text not null,
  status text not null default 'approved',
  uploaded_at timestamptz not null default now(),
  moderated_at timestamptz,
  moderated_by uuid references public.profiles(id) on delete set null,
  constraint media_uploads_status_check check (status in ('approved','pending','rejected','featured','hidden'))
);

create table if not exists public.quick_qr_codes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  label text,
  payload text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_staff enable row level security;
alter table public.guests enable row level security;
alter table public.media_uploads enable row level security;
alter table public.quick_qr_codes enable row level security;

create policy "profiles select self" on public.profiles
for select using (auth.uid() = id);

create policy "profiles update self" on public.profiles
for update using (auth.uid() = id);

create policy "events owner full access" on public.events
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "event staff read events" on public.events
for select using (
  auth.uid() = owner_id or exists (
    select 1 from public.event_staff s where s.event_id = id and s.user_id = auth.uid()
  )
);

create policy "event staff read guests" on public.guests
for select using (
  exists (
    select 1 from public.events e
    where e.id = event_id and (
      e.owner_id = auth.uid() or exists (
        select 1 from public.event_staff s where s.event_id = e.id and s.user_id = auth.uid()
      )
    )
  )
);

create policy "event owners manage guests" on public.guests
for all using (
  exists (select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid())
) with check (
  exists (select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid())
);

create policy "public read published events" on public.events
for select using (status in ('published','live','ended'));

create policy "public insert guests" on public.guests
for insert with check (
  exists (select 1 from public.events e where e.id = event_id and e.status in ('published','live','ended'))
);

create index if not exists idx_events_owner_id on public.events(owner_id);
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_guests_event_id on public.guests(event_id);
create index if not exists idx_guests_qr_token on public.guests(qr_token);
create index if not exists idx_media_event_id on public.media_uploads(event_id);
create index if not exists idx_media_status on public.media_uploads(status);
