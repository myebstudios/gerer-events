alter table public.profiles
  add column if not exists access_tier text not null default 'free',
  add column if not exists contract_status text not null default 'inactive',
  add column if not exists contract_notes text,
  add column if not exists contract_started_at timestamptz,
  add column if not exists contract_ends_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_access_tier_check;

alter table public.profiles
  add constraint profiles_access_tier_check check (access_tier in ('free', 'pro', 'agency'));

alter table public.profiles
  drop constraint if exists profiles_contract_status_check;

alter table public.profiles
  add constraint profiles_contract_status_check check (contract_status in ('inactive', 'pending_contract', 'active_contract', 'expired_contract'));
