import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Input, Textarea } from '@heroui/react';
import { sanitizeId } from '../../lib/id';
import { supabase } from '../../lib/supabase';
import { useSupabaseEventDetails } from '../../hooks/useSupabaseEventDetails';
import { useAuth } from '../../contexts/AuthContext';

const safeFormatDate = (dateStr: string, endDateStr?: string, fmt = 'MMMM d, yyyy', fallback = 'TBD') => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    const start = format(d, fmt);
    if (endDateStr) {
      const e = new Date(endDateStr);
      if (!isNaN(e.getTime())) {
        const end = format(e, fmt);
        if (start === end) return start;
        return `${start} - ${end}`;
      }
    }
    return start;
  } catch { return fallback; }
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const safeEventId = sanitizeId(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!safeEventId) return <div className="p-8 text-text-muted font-medium">Invalid event link.</div>;

  const { event, guests, media, stats, loading, error, refresh } = useSupabaseEventDetails(safeEventId);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showQR, setShowQR] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({ title: '', date: '', endDate: '', location: '', description: '' });
  const [mediaFilter, setMediaFilter] = React.useState('all');

  React.useEffect(() => {
    if (event) {
      setEditData({
        title: event.title,
        date: event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : '',
        endDate: event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : '',
        location: event.location,
        description: event.description ?? '',
      });
    }
  }, [event]);

  if (loading) return <div className="p-8 text-text-muted font-medium">Loading...</div>;
  if (error) return <div className="p-8 text-red-500 font-medium">{error}</div>;
  if (!event) return <div className="p-8 text-text-muted font-medium">Event not found</div>;

  const publicUrl = new URL(`/e/${event.id}`, window.location.origin).toString();

  const handleSaveEdit = async () => {
    const { error } = await supabase.from('events').update({
      title: editData.title,
      starts_at: new Date(editData.date).toISOString(),
      ends_at: editData.endDate ? new Date(editData.endDate).toISOString() : null,
      location: editData.location,
      description: editData.description || null,
    }).eq('id', event.id).eq('owner_id', user?.id);
    if (error) return alert(error.message);
    setIsEditing(false);
    refresh();
  };

  const handleStatusChange = async (newStatus: string) => {
    const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', event.id).eq('owner_id', user?.id);
    if (error) return alert(error.message);
    refresh();
  };

  const handleDeleteEvent = async () => {
    const { error } = await supabase.from('events').delete().eq('id', event.id).eq('owner_id', user?.id);
    if (error) return alert(error.message);
    navigate('/dashboard');
  };

  const handleDeleteGuest = async (guestId: string) => {
    const { error } = await supabase.from('guests').delete().eq('id', guestId).eq('event_id', event.id);
    if (error) return alert(error.message);
    refresh();
  };

  const handleModerateMedia = async (mediaId: string, status: string) => {
    const { error } = await supabase.from('media_uploads').update({ status, moderated_at: new Date().toISOString(), moderated_by: user?.id }).eq('id', mediaId);
    if (error) return alert(error.message);
    refresh();
  };

  const handleDeleteMedia = async (mediaId: string) => {
    const { error } = await supabase.from('media_uploads').delete().eq('id', mediaId);
    if (error) return alert(error.message);
    refresh();
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Plus Ones', 'Meal Preference', 'Checked In', 'Checked In At', 'Message'];
    const rows = guests.map((g: any) => [g.full_name, g.email, g.phone, g.attendance_status, g.plus_ones, g.meal_preference, g.checked_in, g.checked_in_at, g.message]);
    const csv = [headers.join(','), ...rows.map((r: any) => r.map((v: any) => `"${v ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}-guests.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMedia = media.filter((m: any) => mediaFilter === 'all' || m.status === mediaFilter);
  const statusColors: Record<string, string> = {
    draft: 'bg-text-subtle/10 text-text-subtle',
    published: 'bg-primary/10 text-primary',
    live: 'bg-emerald/10 text-emerald',
    ended: 'bg-red/10 text-red',
  };
  const statItems = [
    { label: 'RSVP Rate', value: `${stats.rsvpRate}%`, icon: 'monitoring', color: 'bg-primary/10 text-primary' },
    { label: 'Check-ins', value: stats.checkedIn, icon: 'qr_code_scanner', color: 'bg-secondary/10 text-secondary' },
    { label: 'Media', value: stats.mediaCount, icon: 'photo_library', color: 'bg-accent/10 text-amber-600' },
    { label: 'Plus-ones', value: stats.plusOnes, icon: 'groups', color: 'bg-emerald/10 text-emerald' },
    { label: 'No-shows', value: `${stats.noShowRate}%`, icon: 'trending_down', color: 'bg-red/10 text-red' },
  ];
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'guests', label: `Guests (${guests.length})` },
    { id: 'media', label: `Media (${media.length})` },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <Link to="/dashboard" className="text-text-muted hover:text-primary text-sm font-semibold flex items-center gap-2 mb-6 transition-colors w-fit">
            <span className="material-symbols-outlined text-sm">arrow_back</span> All Events
          </Link>
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-text-main break-words">{event.title}</h1>
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${statusColors[event.status] ?? statusColors.draft}`}>{event.status}</span>
          </div>
          <div className="flex items-center gap-6 text-text-muted text-sm font-medium flex-wrap">
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">calendar_today</span> {safeFormatDate(event.starts_at, event.ends_at, 'MMMM d, yyyy')}</span>
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span> {event.location}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {event.status === 'draft' && <Button onPress={() => handleStatusChange('published')} color="primary" variant="bordered" className="text-sm font-semibold rounded-full">Publish</Button>}
          {event.status === 'published' && <Button onPress={() => handleStatusChange('live')} className="text-sm font-semibold rounded-full bg-emerald text-white">Go Live</Button>}
          {event.status === 'live' && <Button onPress={() => handleStatusChange('ended')} color="danger" variant="bordered" className="text-sm font-semibold rounded-full">End Event</Button>}
          <Button as="a" href={publicUrl} target="_blank" rel="noopener noreferrer" variant="bordered" className="text-sm font-semibold rounded-full w-full sm:w-auto">View Public Page</Button>
          <Button as={Link as any} to={`/dashboard/events/${event.id}/checkin`} color="primary" className="text-sm font-semibold rounded-full w-full sm:w-auto">Check-in Scanner</Button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar border-b border-border pb-3 -mx-1 px-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === tab.id ? 'bg-text-main text-white shadow-sm' : 'bg-surface text-text-muted hover:bg-background border border-border'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {statItems.map((stat) => (
              <div key={stat.label} className="bg-surface p-5 rounded-2xl border border-border shadow-[var(--shadow-card)] flex items-center gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.color}`}><span className="material-symbols-outlined text-xl">{stat.icon}</span></div>
                <div><p className="text-xs font-semibold text-text-muted">{stat.label}</p><h3 className="text-2xl font-display text-text-main">{stat.value}</h3></div>
              </div>
            ))}
          </div>

          <div className="bg-surface p-4 sm:p-6 lg:p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="font-display text-2xl text-text-main">Event Details</h3>
              {!isEditing ? <Button onPress={() => setIsEditing(true)} variant="bordered" size="sm" className="font-semibold rounded-full">Edit</Button> : <div className="flex flex-wrap gap-2"><Button onPress={() => setIsEditing(false)} variant="light" size="sm">Cancel</Button><Button onPress={handleSaveEdit} color="primary" size="sm">Save</Button></div>}
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <Input value={editData.title} onValueChange={(v) => setEditData({ ...editData, title: v })} variant="bordered" label="Title" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input type="datetime-local" value={editData.date} onValueChange={(v) => setEditData({ ...editData, date: v })} variant="bordered" label="Start Date" />
                  <Input type="datetime-local" value={editData.endDate} onValueChange={(v) => setEditData({ ...editData, endDate: v })} variant="bordered" label="End Date" />
                </div>
                <Input value={editData.location} onValueChange={(v) => setEditData({ ...editData, location: v })} variant="bordered" label="Location" />
                <Textarea value={editData.description} onValueChange={(v) => setEditData({ ...editData, description: v })} variant="bordered" minRows={3} label="Description" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div><p className="text-xs font-semibold text-text-muted mb-1">Date</p><p className="text-text-main font-medium">{safeFormatDate(event.starts_at, event.ends_at, 'EEEE, MMMM d, yyyy · h:mm a')}</p></div>
                  <div><p className="text-xs font-semibold text-text-muted mb-1">Location</p><p className="text-text-main font-medium">{event.location}</p></div>
                  <div><p className="text-xs font-semibold text-text-muted mb-1">Type</p><p className="text-text-main font-medium capitalize">{event.event_type}</p></div>
                </div>
                {event.description && <div><p className="text-xs font-semibold text-text-muted mb-1">Description</p><p className="text-text-main">{event.description}</p></div>}
              </div>
            )}
          </div>

          <div className="bg-surface p-4 sm:p-6 lg:p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h3 className="font-display text-2xl text-text-main mb-2">Share Invitation</h3>
                <p className="text-text-muted font-medium">Send this link to your guests so they can RSVP.</p>
              </div>
              <button onClick={() => setShowQR(!showQR)} className="text-primary hover:text-primary-hover font-semibold flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl transition-colors">
                <span className="material-symbols-outlined">qr_code_2</span>{showQR ? 'Hide QR' : 'QR Code'}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1"><Input type="text" isReadOnly value={publicUrl} variant="bordered" /></div>
              <Button onPress={() => navigator.clipboard.writeText(publicUrl)} color="primary" className="text-sm font-semibold rounded-full">Copy Link</Button>
            </div>
            {showQR && <div className="flex flex-col items-center justify-center p-8 bg-background rounded-2xl border border-border"><div className="bg-white p-4 rounded-2xl shadow-[var(--shadow-card)] mb-4"><QRCodeSVG value={publicUrl} size={200} level="H" /></div><p className="text-text-muted text-sm font-medium text-center max-w-sm">Scan to view event and RSVP.</p></div>}
          </div>
        </div>
      )}

      {activeTab === 'guests' && (
        <div className="bg-surface p-4 sm:p-6 lg:p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h3 className="font-display text-2xl text-text-main">Guest List</h3>
            <div className="flex flex-wrap gap-3">
              <Button onPress={handleExportCSV} variant="bordered" size="sm" className="font-semibold rounded-full">Export CSV</Button>
              <span className="bg-background px-4 py-1.5 rounded-full text-sm font-semibold text-text-muted border border-border whitespace-nowrap">{guests.length} Total</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="border-b-2 border-border"><th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">Name</th><th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">Email</th><th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">Status</th><th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">+</th><th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">Checked In</th><th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">Actions</th></tr></thead>
              <tbody>
                {guests.map((guest: any) => (
                  <tr key={guest.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-text-main">{guest.full_name}</td>
                    <td className="py-4 px-4 text-sm text-text-muted font-medium">{guest.email || '-'}</td>
                    <td className="py-4 px-4"><span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${guest.attendance_status === 'yes' ? 'bg-primary-light text-primary' : guest.attendance_status === 'no' ? 'bg-red-light text-red' : 'bg-accent-light text-amber-700'}`}>{guest.attendance_status}</span></td>
                    <td className="py-4 px-4 text-sm text-text-muted font-medium">{guest.plus_ones}</td>
                    <td className="py-4 px-4">{guest.checked_in ? <span className="material-symbols-outlined text-primary">check_circle</span> : <span className="material-symbols-outlined text-text-subtle/30">cancel</span>}</td>
                    <td className="py-4 px-4"><button onClick={() => { if (confirm('Remove this guest?')) handleDeleteGuest(guest.id); }} className="text-text-subtle hover:text-red transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button></td>
                  </tr>
                ))}
                {guests.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-text-muted font-medium">No guests have RSVP'd yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="bg-surface p-4 sm:p-6 lg:p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h3 className="font-display text-2xl text-text-main">Media Gallery</h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'approved', 'pending', 'featured', 'rejected', 'hidden'].map((f) => (
                <button key={f} onClick={() => setMediaFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${mediaFilter === f ? 'bg-text-main text-white' : 'bg-background text-text-muted border border-border hover:border-primary/30'}`}>{f}</button>
              ))}
            </div>
          </div>
          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item: any) => (
                <div key={item.id} className="relative group overflow-hidden rounded-2xl border border-border">
                  <div className="aspect-square">
                    {item.file_type.startsWith('image/') ? <img src={item.file_url} alt="Event Media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <video src={item.file_url} className="w-full h-full object-cover" muted loop playsInline onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />}
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-black/70 text-white">{item.status}</div>
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleModerateMedia(item.id, 'featured')} className="bg-white/90 text-black rounded-full px-3 py-1 text-xs font-semibold">Feature</button>
                      <button onClick={() => handleModerateMedia(item.id, item.status === 'approved' ? 'hidden' : 'approved')} className="bg-white/90 text-black rounded-full px-3 py-1 text-xs font-semibold">{item.status === 'approved' ? 'Hide' : 'Approve'}</button>
                      <button onClick={() => handleDeleteMedia(item.id)} className="bg-red-500 text-white rounded-full px-3 py-1 text-xs font-semibold">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="py-12 text-center text-text-muted font-medium">No media found in this filter.</div>}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button color="danger" variant="bordered" onPress={handleDeleteEvent}>Delete Event</Button>
      </div>
    </div>
  );
}
