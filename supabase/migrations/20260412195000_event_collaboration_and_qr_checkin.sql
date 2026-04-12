create extension if not exists pgcrypto;

alter table public.event_staff
  drop constraint if exists event_staff_role_check;

alter table public.event_staff
  add constraint event_staff_role_check
  check (role in ('owner','manager','checkin_staff','media_moderator','viewer'));

create table if not exists public.event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  email text not null,
  role text not null default 'viewer',
  invited_by uuid not null references public.profiles(id) on delete cascade,
  invite_token text not null unique default md5(gen_random_uuid()::text || clock_timestamp()::text || random()::text),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (event_id, email),
  constraint event_invites_role_check check (role in ('manager','checkin_staff','media_moderator','viewer')),
  constraint event_invites_status_check check (status in ('pending','accepted','revoked'))
);

alter table public.event_invites enable row level security;

create or replace function public.is_event_owner(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events e
    where e.id = target_event_id
      and e.owner_id = auth.uid()
  );
$$;

create or replace function public.get_event_role(target_event_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1 from public.events e
      where e.id = target_event_id and e.owner_id = auth.uid()
    ) then 'owner'
    else (
      select s.role
      from public.event_staff s
      where s.event_id = target_event_id and s.user_id = auth.uid()
      limit 1
    )
  end;
$$;

create or replace function public.can_manage_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_event_role(target_event_id) in ('owner','manager'), false);
$$;

create or replace function public.can_checkin_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_event_role(target_event_id) in ('owner','manager','checkin_staff'), false);
$$;

create or replace function public.can_moderate_event_media(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_event_role(target_event_id) in ('owner','manager','media_moderator'), false);
$$;

create or replace function public.accept_event_invite(token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.event_invites;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into invite_row
  from public.event_invites
  where invite_token = token
    and status = 'pending';

  if invite_row.id is null then
    raise exception 'Invite not found or no longer valid';
  end if;

  if lower(invite_row.email) <> lower(coalesce((select email from auth.users where id = auth.uid()), '')) then
    raise exception 'This invite is for a different email address';
  end if;

  insert into public.event_staff (event_id, user_id, role)
  values (invite_row.event_id, auth.uid(), invite_row.role)
  on conflict (event_id, user_id)
  do update set role = excluded.role;

  update public.event_invites
  set status = 'accepted', accepted_at = now()
  where id = invite_row.id;

  return invite_row.event_id;
end;
$$;

drop policy if exists "events owner full access" on public.events;
create policy "events owner full access" on public.events
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "event staff read events safe" on public.events;
create policy "event staff read events safe" on public.events
for select using (
  auth.uid() = owner_id or public.get_event_role(id) is not null
);

drop policy if exists "owners read guests" on public.guests;
drop policy if exists "owners manage guests" on public.guests;

create policy "staff read guests safe" on public.guests
for select using (public.get_event_role(event_id) is not null);

create policy "staff manage guests safe" on public.guests
for all using (public.can_manage_event(event_id) or public.can_checkin_event(event_id))
with check (public.can_manage_event(event_id) or public.can_checkin_event(event_id));

drop policy if exists "event invites owner manage" on public.event_invites;
create policy "event invites owner manage" on public.event_invites
for all using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

drop policy if exists "event staff self read" on public.event_staff;
create policy "event staff self read" on public.event_staff
for select using (user_id = auth.uid() or public.can_manage_event(event_id));

drop policy if exists "event staff manage by owner" on public.event_staff;
create policy "event staff manage by owner" on public.event_staff
for all using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));
