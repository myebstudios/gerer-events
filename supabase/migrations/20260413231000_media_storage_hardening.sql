create or replace function public.can_upload_event_media(target_event_id uuid, guest_token text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guests g
    join public.events e on e.id = g.event_id
    where g.event_id = target_event_id
      and g.qr_token = guest_token
      and g.checked_in = true
      and e.upload_enabled = true
      and e.status in ('published', 'live', 'ended')
  );
$$;

grant execute on function public.can_upload_event_media(uuid, text) to anon, authenticated;
