import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { fetchCurrentUserProfile } from './profile';

export async function canCreateUnlimitedEvents(user: User | null | undefined) {
  if (!user) return false;
  const profile = await fetchCurrentUserProfile(user.id);
  if (!profile) return false;
  const tier = profile.access_tier || 'free';
  const contractStatus = profile.contract_status || 'inactive';
  return tier !== 'free' && contractStatus == 'active_contract';
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
  if (await canCreateUnlimitedEvents(user)) return true;
  const count = await getOwnedEventCount(user.id);
  return count < 1;
}
