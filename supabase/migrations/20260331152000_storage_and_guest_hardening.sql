-- Harden guest writes and storage access for production prep.

-- Prevent unrestricted guest updates/deletes by public users.
drop policy if exists "event owners manage guests" on public.guests;
drop policy if exists "public insert guests" on public.guests;
drop policy if exists "event staff read guests" on public.guests;

create policy "owners manage guests" on public.guests
for all using (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = auth.uid()
  )
);

create policy "public RSVP insert guests" on public.guests
for insert with check (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.status in ('published', 'live', 'ended')
  )
  and char_length(full_name) >= 2
  and plus_ones between 0 and 10
  and char_length(qr_token) >= 8
);

create policy "owners read guests" on public.guests
for select using (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = auth.uid()
  )
);

-- Lock down storage object operations to authenticated users only.
drop policy if exists "authenticated users can upload event media" on storage.objects;
drop policy if exists "authenticated users can update own event media" on storage.objects;
drop policy if exists "authenticated users can delete own event media" on storage.objects;

create policy "authenticated users can upload event media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'event-media'
  and name like '%/%'
);

create policy "authenticated users can update event media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'event-media'
);

create policy "authenticated users can delete event media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'event-media'
);
