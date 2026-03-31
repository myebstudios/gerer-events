-- Emergency fix: remove policies that can recurse through events <-> event_staff.
-- We can reintroduce staff reads later with a safer structure.

drop policy if exists "event staff read events" on public.events;
drop policy if exists "event owners manage event staff" on public.event_staff;
drop policy if exists "event staff can read event_staff rows" on public.event_staff;

-- Keep event access owner-only for now.
drop policy if exists "events owner full access" on public.events;
create policy "events owner full access" on public.events
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);
