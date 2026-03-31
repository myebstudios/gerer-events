import * as React from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type EventRow = {
  id: string;
  owner_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  location: string;
  starts_at: string;
  ends_at: string | null;
  event_type: string;
  template_id: string | null;
  theme_color: string | null;
  typography_preset: string | null;
  cover_image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export function useSupabaseEvents() {
  const { user } = useAuth();
  const [events, setEvents] = React.useState<EventRow[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setEvents([]);
    } else {
      setError(null);
      setEvents((data || []) as EventRow[]);
    }
    setLoading(false);
  }, [user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, loading, error, refresh };
}

export function useSupabaseDashboardStats() {
  const { events, loading, error } = useSupabaseEvents();
  const [stats, setStats] = React.useState({ totalEvents: 0, totalGuests: 0, totalRSVPs: 0 });

  React.useEffect(() => {
    const run = async () => {
      if (!events?.length) {
        setStats({ totalEvents: events?.length ?? 0, totalGuests: 0, totalRSVPs: 0 });
        return;
      }

      const eventIds = events.map((e) => e.id);
      const { data: guests } = await supabase
        .from('guests')
        .select('id,attendance_status,event_id')
        .in('event_id', eventIds);

      setStats({
        totalEvents: events.length,
        totalGuests: guests?.length ?? 0,
        totalRSVPs: guests?.filter((g) => ['yes', 'no', 'maybe'].includes(g.attendance_status)).length ?? 0,
      });
    };
    run();
  }, [events]);

  return { stats, loading, error };
}
