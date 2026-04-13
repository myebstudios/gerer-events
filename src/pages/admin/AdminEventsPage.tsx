import * as React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { writeAdminAuditLog } from '../../lib/adminAudit';
import { useToast } from '../../contexts/ToastContext';

export default function AdminEventsPage() {
  const { user: adminUser } = useAuth();
  const { pushToast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [events, setEvents] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, status, location, starts_at, owner_id, upload_enabled, moderation_mode, created_at')
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;
        setEvents(data || []);
      } catch (error: any) {
        pushToast(error.message || 'Failed to load events', 'error');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [pushToast]);

  const updateStatus = async (id: string, status: string) => {
    setSavingId(id);
    try {
      const { error } = await supabase.from('events').update({ status }).eq('id', id);
      if (error) throw error;
      setEvents((current) => current.map((event) => (event.id === id ? { ...event, status } : event)));
      if (adminUser?.id) {
        await writeAdminAuditLog({ adminUserId: adminUser.id, action: 'event.status_updated', targetEventId: id, details: { status } });
      }
      pushToast('Event status updated.', 'success');
    } catch (error: any) {
      pushToast(error.message || 'Failed to update event status', 'error');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Admin events</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-black">All platform events</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">Review event status across the whole platform and jump into organizer-side details when you need context.</p>
      </div>

      <div className="rounded-[32px] border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-gray-500 font-medium">Loading events...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-[0.18em] text-gray-400">
                <tr>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Starts</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t border-gray-100">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-black">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{event.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={event.status}
                        disabled={savingId === event.id}
                        onChange={(e) => void updateStatus(event.id, e.target.value)}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                      >
                        {['draft', 'published', 'live', 'ended'].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div>{event.location}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600">{event.upload_enabled ? 'uploads on' : 'uploads off'}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600">{event.moderation_mode || 'auto-approve'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{event.starts_at ? new Date(event.starts_at).toLocaleString() : '—'}</td>
                    <td className="px-6 py-4"><Link to={`/dashboard/events/${event.id}`} className="text-sm font-semibold text-black hover:text-gray-600">Open event</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
