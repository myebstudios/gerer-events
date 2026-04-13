alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create policy "profiles admin read all" on public.profiles
for select using (public.is_admin());

create policy "profiles admin update all" on public.profiles
for update using (public.is_admin()) with check (public.is_admin());

create policy "admin read all events" on public.events
for select using (public.is_admin());

create policy "admin update all events" on public.events
for update using (public.is_admin()) with check (public.is_admin());

create policy "admin read all guests" on public.guests
for select using (public.is_admin());

create policy "admin read all media" on public.media_uploads
for select using (public.is_admin());

create policy "admin read all staff" on public.event_staff
for select using (public.is_admin());
