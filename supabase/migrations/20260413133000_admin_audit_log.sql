create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete set null,
  target_event_id uuid references public.events(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

create policy "admin read audit logs" on public.admin_audit_logs
for select using (public.is_admin());

create policy "admin insert audit logs" on public.admin_audit_logs
for insert with check (public.is_admin());

create index if not exists idx_admin_audit_logs_created_at on public.admin_audit_logs(created_at desc);
create index if not exists idx_admin_audit_logs_target_user on public.admin_audit_logs(target_user_id);
create index if not exists idx_admin_audit_logs_target_event on public.admin_audit_logs(target_event_id);
