-- Fix recursive RLS issue caused by self-referential events policy using event_staff

drop policy if exists "event staff read events" on public.events;

create policy "event staff read events" on public.events
for select using (
  auth.uid() = owner_id or exists (
    select 1 from public.event_staff s
    where s.event_id = public.events.id and s.user_id = auth.uid()
  )
);
