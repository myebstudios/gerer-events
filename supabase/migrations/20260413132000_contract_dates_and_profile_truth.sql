alter table public.profiles
  add column if not exists contract_starts_at timestamptz,
  add column if not exists contract_ends_at timestamptz;
