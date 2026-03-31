import * as React from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSupabaseEventDetails(eventId?: string | null) {
  const { user } = useAuth();
  const [event, setEvent] = React.useState<any | null>(null);
  const [guests, setGuests] = React.useState<any[]>([]);
  const [media, setMedia] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!eventId || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: eventData, error: eventError }, { data: guestData, error: guestError }, { data: mediaData, error: mediaError }] = await Promise.all([
      supabase.from('events').select('*').eq('id', eventId).eq('owner_id', user.id).maybeSingle(),
      supabase.from('guests').select('*').eq('event_id', eventId).order('created_at', { ascending: false }),
      supabase.from('media_uploads').select('*').eq('event_id', eventId).order('uploaded_at', { ascending: false }),
    ]);

    const firstError = eventError || guestError || mediaError;
    if (firstError) {
      setError(firstError.message);
    } else {
      setError(null);
      setEvent(eventData);
      setGuests(guestData || []);
      setMedia(mediaData || []);
    }
    setLoading(false);
  }, [eventId, user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = React.useMemo(() => {
    const yes = guests.filter((g) => g.attendance_status === 'yes');
    const checkedIn = guests.filter((g) => g.checked_in);
    const plusOnes = guests.reduce((acc, g) => acc + (g.plus_ones || 0), 0);
    return {
      rsvpRate: guests.length ? Math.round((yes.length / guests.length) * 100) : 0,
      checkedIn: checkedIn.length,
      mediaCount: media.length,
      plusOnes,
      noShowRate: yes.length ? Math.max(0, Math.round(((yes.length - checkedIn.length) / yes.length) * 100)) : 0,
    };
  }, [guests, media]);

  return { event, guests, media, stats, loading, error, refresh };
}
