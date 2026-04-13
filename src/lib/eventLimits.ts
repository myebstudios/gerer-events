import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export function getAccessTier(user: User | null | undefined) {
  return user?.user_metadata?.access_tier || 'free';
}

export function getContractStatus(user: User | null | undefined) {
  return user?.user_metadata?.contract_status || 'inactive';
}

export function canCreateUnlimitedEvents(user: User | null | undefined) {
  const tier = getAccessTier(user);
  const contractStatus = getContractStatus(user);
  return tier !== 'free' && contractStatus === 'active_contract';
}

export async function getOwnedEventCount(userId: string) {
  const { count, error } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', userId);

  if (error) throw error;
  return count || 0;
}

export async function canCreateAnotherEvent(user: User | null | undefined) {
  if (!user) return false;
  if (canCreateUnlimitedEvents(user)) return true;
  const count = await getOwnedEventCount(user.id);
  return count < 1;
}
