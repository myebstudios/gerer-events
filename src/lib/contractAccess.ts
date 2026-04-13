import type { UserProfile } from './profile';

export function isContractCurrentlyActive(profile: UserProfile | null | undefined) {
  if (!profile) return false;

  const status = profile.contract_status || 'inactive';
  const tier = profile.access_tier || 'free';
  if (tier === 'free' || status !== 'active_contract') return false;

  const now = Date.now();
  const startsAt = profile.contract_starts_at ? new Date(profile.contract_starts_at).getTime() : null;
  const endsAt = profile.contract_ends_at ? new Date(profile.contract_ends_at).getTime() : null;

  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;

  return true;
}
