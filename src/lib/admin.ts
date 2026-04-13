import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function fetchCurrentUserAdminState(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data?.role === 'admin';
}

export async function fetchAdminOverview() {
  const [profiles, events, guests, media] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, access_tier, contract_status, role, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(6),
    supabase.from('events').select('id, title, status, owner_id, created_at, starts_at, location', { count: 'exact' }).order('created_at', { ascending: false }).limit(6),
    supabase.from('guests').select('id, checked_in', { count: 'exact' }),
    supabase.from('media_uploads').select('id, status', { count: 'exact' }).order('uploaded_at', { ascending: false }).limit(6),
  ]);

  if (profiles.error) throw profiles.error;
  if (events.error) throw events.error;
  if (guests.error) throw guests.error;
  if (media.error) throw media.error;

  const guestRows = guests.data || [];
  const profileRows = profiles.data || [];

  return {
    totals: {
      users: profiles.count || 0,
      events: events.count || 0,
      guests: guests.count || 0,
      checkedIns: guestRows.filter((guest) => guest.checked_in).length,
      activeContracts: profileRows.filter((profile) => profile.contract_status === 'active_contract').length,
      pendingContracts: profileRows.filter((profile) => profile.contract_status === 'pending_contract').length,
      mediaUploads: media.count || 0,
    },
    profiles: profileRows,
    events: events.data || [],
    media: media.data || [],
  };
}

export function getAdminEmailFallback(user: User | null | undefined) {
  return user?.email || '';
}
