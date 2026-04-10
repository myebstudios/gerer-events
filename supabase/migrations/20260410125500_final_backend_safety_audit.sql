-- Final backend safety audit pass

create policy "profiles insert self" on public.profiles
for insert with check (auth.uid() = id);

alter table public.guests
  drop constraint if exists guests_plus_ones_nonnegative;

alter table public.guests
  add constraint guests_plus_ones_nonnegative check (plus_ones >= 0 and plus_ones <= 10);

alter table public.guests
  drop constraint if exists guests_full_name_min_len;

alter table public.guests
  add constraint guests_full_name_min_len check (char_length(full_name) >= 2 and char_length(full_name) <= 120);

drop policy if exists "event team read media" on public.media_uploads;
drop policy if exists "event owners manage media" on public.media_uploads;

create policy "owners read media" on public.media_uploads
for select using (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = auth.uid()
  )
);

create policy "owners manage media" on public.media_uploads
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

drop policy if exists "owners manage quick qr" on public.quick_qr_codes;

create policy "owners manage quick qr" on public.quick_qr_codes
for all using (
  created_by = auth.uid() and exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = auth.uid()
  )
) with check (
  created_by = auth.uid() and exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = auth.uid()
  )
);

drop policy if exists "authenticated users can update event media" on storage.objects;
drop policy if exists "authenticated users can delete event media" on storage.objects;

create policy "authenticated users can update event media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'event-media' and name like '%/%/%'
);

create policy "authenticated users can delete event media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'event-media' and name like '%/%/%'
);
