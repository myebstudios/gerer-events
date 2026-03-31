insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true)
on conflict (id) do nothing;

create policy "public can read event media"
on storage.objects for select
using (bucket_id = 'event-media');

create policy "authenticated users can upload event media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-media');

create policy "authenticated users can update own event media"
on storage.objects for update
to authenticated
using (bucket_id = 'event-media');

create policy "authenticated users can delete own event media"
on storage.objects for delete
to authenticated
using (bucket_id = 'event-media');
