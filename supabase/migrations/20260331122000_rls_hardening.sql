-- Tighten event staff permissions
create policy "event owners manage event staff" on public.event_staff
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

create policy "event staff can read event_staff rows" on public.event_staff
for select using (
  user_id = auth.uid() or exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = auth.uid()
  )
);

-- Media access: owners/staff full, public can read approved/featured for public events
create policy "event team read media" on public.media_uploads
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

create policy "public read approved media for public events" on public.media_uploads
for select using (
  status in ('approved','featured') and exists (
    select 1 from public.events e
    where e.id = event_id and e.status in ('published','live','ended')
  )
);

create policy "event owners manage media" on public.media_uploads
for all using (
  exists (
    select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()
  )
);

-- Quick QR access
create policy "owners manage quick qr" on public.quick_qr_codes
for all using (
  created_by = auth.uid()
) with check (
  created_by = auth.uid()
);
