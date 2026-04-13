import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export function isAdminUser(user: User | null | undefined) {
  return user?.user_metadata?.role === 'admin';
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

  const checkedInCount = (guests.data || []).filter((guest) => guest.checked_in).length;
  const pendingContracts = (profiles.data || []).filter((profile) => profile.contract_status === 'pending_contract').length;
  const activeContracts = (profiles.data || []).filter((profile) => profile.contract_status === 'active_contract').length;

  return {
    totals: {
      users: profiles.count || 0,
      events: events.count || 0,
      guests: guests.count || 0,
      checkedIns: checkedInCount,
      activeContracts,
      pendingContracts,
      mediaUploads: media.count || 0,
    },
    profiles: profiles.data || [],
    events: events.data || [],
    media: media.data || [],
  };
}
