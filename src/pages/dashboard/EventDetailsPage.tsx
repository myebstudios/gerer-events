import * as React from 'react';
import { useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Input, Textarea } from '@heroui/react';
import { sanitizeId } from '../../lib/id';
import { supabase } from '../../lib/supabase';
import { useSupabaseEventDetails } from '../../hooks/useSupabaseEventDetails';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getEventRole, canManageWithRole, canModerateMediaWithRole, canCheckInWithRole } from '../../lib/eventAccess';
import { TEMPLATE_CATALOG, EVENT_TYPES, type EventType } from '../../lib/catalog';
import { compressImageFile } from '../../lib/imageUpload';

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
  const { pushToast } = useToast();

  if (!safeEventId) return <div className="p-8 text-text-muted font-medium">Invalid event link.</div>;

  const { event, guests, media, stats, loading, error, refresh } = useSupabaseEventDetails(safeEventId);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showQR, setShowQR] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({ title: '', date: '', endDate: '', location: '', description: '', event_type: 'wedding', template_id: 'eternal-vows', theme_color: '#18181B', typography_preset: 'modern' });
  const [mediaFilter, setMediaFilter] = React.useState('all');
  const [eventRole, setEventRole] = React.useState<any>(null);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('checkin_staff');
  const [staffRows, setStaffRows] = React.useState<any[]>([]);
  const [inviteRows, setInviteRows] = React.useState<any[]>([]);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (event) {
      setEditData({
        title: event.title,
        date: event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : '',
        endDate: event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : '',
        location: event.location,
        description: event.description ?? '',
        event_type: event.event_type ?? 'wedding',
        template_id: event.template_id ?? 'eternal-vows',
        theme_color: event.theme_color ?? '#18181B',
        typography_preset: event.typography_preset ?? 'modern',
      });
      setCoverPreview(event.cover_image_url ?? null);
      setCoverFile(null);
    }
  }, [event]);

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    setCoverFile(compressed);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(compressed);
  };


  React.useEffect(() => {
    const loadCollaboration = async () => {
      if (!event?.id) return;
      try {
        const role = await getEventRole(event.id);
        setEventRole(role);

        if (!canManageWithRole(role)) return;

        const [{ data: staffData }, { data: inviteData }] = await Promise.all([
          supabase.from('event_staff').select('id, role, user_id, profiles(full_name, email)').eq('event_id', event.id).order('created_at', { ascending: true }),
          supabase.from('event_invites').select('*').eq('event_id', event.id).order('created_at', { ascending: false }),
        ]);

        setStaffRows(staffData || []);
        setInviteRows(inviteData || []);
      } catch (error: any) {
        console.error(error);
      }
    };

    void loadCollaboration();
  }, [event?.id, refresh]);

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) return pushToast('Enter an email address first.', 'error');
    const { error } = await supabase.from('event_invites').upsert({
      event_id: event.id,
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      invited_by: user?.id,
      status: 'pending',
    }, { onConflict: 'event_id,email' });

    if (error) return pushToast(error.message, 'error');
    pushToast('Collaborator invite saved.', 'success');
    setInviteEmail('');
    refresh();
  };

  const handleUpdateStaffRole = async (staffId: string, role: string) => {
    const { error } = await supabase.from('event_staff').update({ role }).eq('id', staffId).eq('event_id', event.id);
    if (error) return pushToast(error.message, 'error');
    pushToast('Role updated.', 'success');
    refresh();
  };

  const handleRevokeInvite = async (inviteId: string) => {
    const { error } = await supabase.from('event_invites').update({ status: 'revoked' }).eq('id', inviteId).eq('event_id', event.id);
    if (error) return pushToast(error.message, 'error');
    pushToast('Invite revoked.', 'success');
    refresh();
  };

  if (loading) return <div className="p-8 text-text-muted font-medium">Loading...</div>;
  if (error) return <div className="p-8 text-red-500 font-medium">{error}</div>;
  if (!event) return <div className="p-8 text-text-muted font-medium">Event not found</div>;

  const publicUrl = new URL(`/e/${event.id}`, window.location.origin).toString();

  const handleSaveEdit = async () => {
    let coverImageUrl = event.cover_image_url ?? null;

    if (coverFile && user) {
      const ext = coverFile.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('event-media').upload(filePath, coverFile, {
        upsert: true,
        contentType: coverFile.type,
      });
      if (uploadError) return pushToast(uploadError.message, 'error');
      const { data } = supabase.storage.from('event-media').getPublicUrl(filePath);
      coverImageUrl = data.publicUrl;
    }

    if (!canManageEvent) return pushToast('You do not have permission to edit this event.', 'error');
    const { error } = await supabase.from('events').update({
      title: editData.title,
      starts_at: new Date(editData.date).toISOString(),
      ends_at: editData.endDate ? new Date(editData.endDate).toISOString() : null,
      location: editData.location,
      description: editData.description || null,
      event_type: editData.event_type,
      template_id: editData.template_id,
      theme_color: editData.theme_color,
      typography_preset: editData.typography_preset,
      cover_image_url: coverImageUrl,
    }).eq('id', event.id);
    if (error) return pushToast(error.message, 'error');
    setIsEditing(false);
    pushToast('Event updated successfully.', 'success');
    refresh();
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!canManageEvent) return pushToast('You do not have permission to change event status.', 'error');
    const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', event.id);
    if (error) return pushToast(error.message, 'error');
    refresh();
  };

  const handleDeleteEvent = async () => {
    if (!canManageEvent) return pushToast('You do not have permission to delete this event.', 'error');
    const { error } = await supabase.from('events').delete().eq('id', event.id);
    if (error) return pushToast(error.message, 'error');
    navigate('/dashboard');
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!canManageEvent) return pushToast('You do not have permission to remove guests from this event.', 'error');
    const { error } = await supabase.from('guests').delete().eq('id', guestId).eq('event_id', event.id);
    if (error) return pushToast(error.message, 'error');
    refresh();
  };

  const handleModerateMedia = async (mediaId: string, status: string) => {
    if (!canModerateMediaWithRole(eventRole)) return pushToast('You do not have permission to moderate media for this event.', 'error');
    const { error } = await supabase.from('media_uploads').update({ status, moderated_at: new Date().toISOString(), moderated_by: user?.id }).eq('id', mediaId);
    if (error) return pushToast(error.message, 'error');
    refresh();
  };

  const handleDeleteMedia = async (mediaId: string) => {
    const { error } = await supabase.from('media_uploads').delete().eq('id', mediaId);
    if (error) return pushToast(error.message, 'error');
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
  const canManageEvent = canManageWithRole(eventRole);
  const canCheckInEvent = canCheckInWithRole(eventRole);
  const canModerateMedia = canModerateMediaWithRole(eventRole);
  const themeColors = ['#18181B', '#e11d48', '#2563eb', '#16a34a', '#d97706', '#9333ea'];
  const typographyPresets = [
    { id: 'modern', label: 'Modern (Sans-serif)' },
    { id: 'classic', label: 'Classic (Serif)' },
    { id: 'playful', label: 'Playful (Display)' },
  ];
  const availableTemplates = TEMPLATE_CATALOG.filter((template) => template.supportedEventTypes.includes(editData.event_type as EventType));
  const activeTemplate = availableTemplates.find((template) => template.id === editData.template_id) || availableTemplates[0];

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
    ...(canManageEvent ? [{ id: 'collaboration', label: 'Collaboration' }] : []),
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
          {canManageEvent && event.status === 'draft' && <Button onPress={() => handleStatusChange('published')} color="primary" variant="bordered" className="text-sm font-semibold rounded-full">Publish</Button>}
          {canManageEvent && event.status === 'published' && <Button onPress={() => handleStatusChange('live')} className="text-sm font-semibold rounded-full bg-emerald text-white">Go Live</Button>}
          {canManageEvent && event.status === 'live' && <Button onPress={() => handleStatusChange('ended')} color="danger" variant="bordered" className="text-sm font-semibold rounded-full">End Event</Button>}
          <Button as="a" href={publicUrl} target="_blank" rel="noopener noreferrer" variant="bordered" className="text-sm font-semibold rounded-full w-full sm:w-auto">View Public Page</Button>
          {canCheckInEvent && <Button as={Link as any} to={`/dashboard/events/${event.id}/checkin`} color="primary" className="text-sm font-semibold rounded-full w-full sm:w-auto">Check-in Desk</Button>}
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
              {canManageEvent ? (!isEditing ? <Button onPress={() => setIsEditing(true)} variant="bordered" size="sm" className="font-semibold rounded-full">Edit</Button> : <div className="flex flex-wrap gap-2"><Button onPress={() => setIsEditing(false)} variant="light" size="sm">Cancel</Button><Button onPress={handleSaveEdit} color="primary" size="sm">Save</Button></div>) : <span className="text-xs font-semibold uppercase tracking-wider text-text-subtle">View only</span>}
            </div>
            {isEditing ? (
              <div className="space-y-6">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input value={editData.title} onValueChange={(v) => setEditData({ ...editData, title: v })} variant="bordered" label="Title" />
                    <div>
                      <label className="text-sm font-semibold text-text-main mb-2 block">Event Type</label>
                      <select value={editData.event_type} onChange={(e) => {
                        const nextType = e.target.value;
                        const nextTemplate = TEMPLATE_CATALOG.find((template) => template.supportedEventTypes.includes(nextType as EventType));
                        setEditData({ ...editData, event_type: nextType, template_id: nextTemplate?.id || editData.template_id });
                      }} className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm font-medium text-text-main">
                        {EVENT_TYPES.map((eventType) => <option key={eventType.id} value={eventType.id}>{eventType.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input type="datetime-local" value={editData.date} onValueChange={(v) => setEditData({ ...editData, date: v })} variant="bordered" label="Start Date" />
                    <Input type="datetime-local" value={editData.endDate} onValueChange={(v) => setEditData({ ...editData, endDate: v })} variant="bordered" label="End Date" />
                  </div>

                  <Input value={editData.location} onValueChange={(v) => setEditData({ ...editData, location: v })} variant="bordered" label="Location" />
                  <Textarea value={editData.description} onValueChange={(v) => setEditData({ ...editData, description: v })} variant="bordered" minRows={4} label="Description" />

                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-black">Cover Image</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-[24px] p-6 bg-gray-50/80">
                      {coverPreview ? <img src={coverPreview} alt="Cover preview" className="w-full h-56 object-cover rounded-2xl mb-4" /> : <div className="h-56 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-5xl text-gray-300">image</span></div>}
                      <div className="flex flex-wrap gap-3">
                        <Button type="button" variant="bordered" className="rounded-full font-medium" onPress={() => fileInputRef.current?.click()}>Upload Cover</Button>
                        {coverPreview && <Button type="button" variant="light" className="rounded-full font-medium" onPress={() => { setCoverFile(null); setCoverPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>Remove</Button>}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                    </div>
                  </div>

                  <div className="flex flex-col xl:flex-row gap-6 xl:gap-12">
                    <div className="xl:w-1/2 space-y-6">
                      <div>
                        <h4 className="font-display text-xl text-text-main font-semibold">Choose a Layout</h4>
                        <p className="text-text-muted text-sm mt-1">Same experience as event creation, now available while editing too.</p>
                      </div>

                      <div className="space-y-4">
                        {availableTemplates.map((template) => (
                          <div key={template.id} onClick={() => setEditData({ ...editData, template_id: template.id, theme_color: template.color, typography_preset: template.typographyPreset })} className={`cursor-pointer rounded-2xl p-4 transition-all flex items-center gap-4 border bg-white relative overflow-hidden ${editData.template_id === template.id ? 'border-black ring-1 ring-black shadow-md' : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'}`}>
                            {editData.template_id === template.id && (<div className="absolute top-0 bottom-0 left-0 w-1 bg-black"></div>)}
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0" style={{ backgroundColor: template.color }}>
                              <span className="material-symbols-outlined text-xl">{template.icon}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-[15px] text-black tracking-tight">{template.name}</h3>
                              <p className="text-xs text-gray-500 line-clamp-1">{template.tone}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-black">Theme Color</label>
                        <div className="flex flex-wrap gap-3">
                          {themeColors.map((color) => (
                            <button key={color} type="button" onClick={() => setEditData({ ...editData, theme_color: color })} className={`w-10 h-10 rounded-full border-2 transition-all ${editData.theme_color === color ? 'border-black scale-110' : 'border-white shadow-sm'}`} style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-black mb-2 block">Typography</label>
                        <select value={editData.typography_preset} onChange={(e) => setEditData({ ...editData, typography_preset: e.target.value })} className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm font-medium text-text-main">
                          {typographyPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="xl:w-1/2 bg-gray-50 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center border border-gray-100">
                      <p className="text-xs text-center font-semibold tracking-widest uppercase text-gray-400 mb-6">Live Preview</p>
                      <div className="w-full max-w-[260px] rounded-[2.2rem] shadow-2xl border-[7px] border-gray-900 overflow-hidden flex flex-col bg-white" style={{ aspectRatio: '9/19' }}>
                        <div className="bg-gray-900 flex justify-center pt-2 pb-1 flex-shrink-0"><div className="bg-black w-20 h-4 rounded-full"></div></div>
                        <div className="relative flex-shrink-0 flex items-end justify-center overflow-hidden" style={{ backgroundColor: activeTemplate?.color || editData.theme_color, height: '32%' }}>
                          {coverPreview ? <img src={coverPreview} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.18 }}><span className="material-symbols-outlined text-white" style={{ fontSize: '36px' }}>{activeTemplate?.icon}</span></div>}<div className="absolute inset-0 bg-black/20"></div>
                          <div className="relative z-10 text-center px-3 pb-2 w-full">
                            <h4 className="text-white font-bold leading-tight mb-1" style={{ fontSize: '11px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{editData.title || 'Your Event Title'}</h4>
                            <p className="font-bold" style={{ color: '#fff', fontSize: '9px', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{editData.date ? new Date(editData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Your Event Date'}</p>
                          </div>
                        </div>
                        <div className="flex-1 bg-white rounded-t-2xl overflow-y-auto" style={{ marginTop: '-10px', zIndex: 10 }}>
                          <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
                            <p className="font-bold text-center" style={{ fontSize: '10px', color: '#111' }}>The Details</p>
                            <div className="flex flex-col items-center gap-0.5"><span className="material-symbols-outlined" style={{ fontSize: '11px', color: activeTemplate?.color || editData.theme_color, opacity: 0.85 }}>schedule</span><p className="uppercase font-bold tracking-widest" style={{ fontSize: '6px', color: '#9ca3af' }}>When</p><p className="font-semibold text-center" style={{ fontSize: '8px', color: '#111' }}>{editData.date ? new Date(editData.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p></div>
                            <div className="h-px mx-6" style={{ backgroundColor: activeTemplate?.color || editData.theme_color, opacity: 0.15 }}></div>
                            <div className="flex flex-col items-center gap-0.5"><span className="material-symbols-outlined" style={{ fontSize: '11px', color: activeTemplate?.color || editData.theme_color, opacity: 0.85 }}>location_on</span><p className="uppercase font-bold tracking-widest" style={{ fontSize: '6px', color: '#9ca3af' }}>Where</p><p className="font-semibold text-center" style={{ fontSize: '8px', color: '#111' }}>{editData.location || '—'}</p></div>
                            <div className="space-y-2 pt-1">
                              <div className="w-full rounded-full font-bold text-center" style={{ backgroundColor: activeTemplate?.color || editData.theme_color, color: '#fff', fontSize: '8px', padding: '6px 0' }}>RSVP Now</div>
                              <div className="w-full rounded-full font-bold text-center border-2" style={{ borderColor: activeTemplate?.color || editData.theme_color, color: activeTemplate?.color || editData.theme_color, fontSize: '8px', padding: '5px 0' }}>Upload Memories</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
              {canManageEvent && <Button onPress={handleExportCSV} variant="bordered" size="sm" className="font-semibold rounded-full">Export CSV</Button>}
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
                    <td className="py-4 px-4">{canManageEvent ? <button onClick={() => { if (confirm('Remove this guest?')) handleDeleteGuest(guest.id); }} className="text-text-subtle hover:text-red transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button> : <span className="text-text-subtle/30">-</span>}</td>
                  </tr>
                ))}
                {guests.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-text-muted font-medium">No guests have RSVP'd yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'collaboration' && (
        <div className="space-y-6">
          <div className="bg-surface p-4 sm:p-6 lg:p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h3 className="font-display text-2xl text-text-main">Collaboration</h3>
                <p className="text-text-muted font-medium mt-2">Invite trusted teammates and assign event roles for check-in or moderation.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-background border border-border text-xs font-semibold capitalize">{eventRole || 'viewer'}</span>
            </div>

            {canManageWithRole(eventRole) ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr),220px,auto] gap-3 mb-8">
                  <Input value={inviteEmail} onValueChange={setInviteEmail} type="email" placeholder="teammate@example.com" variant="bordered" />
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="h-12 rounded-xl border border-border bg-white px-4 text-sm font-medium text-text-main">
                    <option value="manager">Manager</option>
                    <option value="checkin_staff">Check-in staff</option>
                    <option value="media_moderator">Media moderator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <Button onPress={handleInviteCollaborator} color="primary" className="rounded-full font-semibold">Send Invite</Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="border border-border rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border bg-background/50"><h4 className="font-semibold text-text-main">Active Team</h4></div>
                    <div className="divide-y divide-border">
                      {staffRows.length > 0 ? staffRows.map((staff: any) => (
                        <div key={staff.id} className="p-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-text-main">{staff.profiles?.full_name || 'Team member'}</p>
                            <p className="text-sm text-text-muted">{staff.profiles?.email || 'No email'}</p>
                          </div>
                          <select value={staff.role} onChange={(e) => handleUpdateStaffRole(staff.id, e.target.value)} className="h-10 rounded-full border border-border bg-white px-4 text-xs font-semibold text-text-main">
                            <option value="manager">Manager</option>
                            <option value="checkin_staff">Check-in staff</option>
                            <option value="media_moderator">Media moderator</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </div>
                      )) : <div className="p-6 text-sm text-text-muted">No collaborators yet.</div>}
                    </div>
                  </div>

                  <div className="border border-border rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border bg-background/50"><h4 className="font-semibold text-text-main">Pending Invites</h4></div>
                    <div className="divide-y divide-border">
                      {inviteRows.length > 0 ? inviteRows.map((invite: any) => (
                        <div key={invite.id} className="p-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-text-main">{invite.email}</p>
                            <p className="text-sm text-text-muted capitalize">{invite.role.replace('_', ' ')} • {invite.status}</p><p className="text-[11px] text-text-subtle mt-1 break-all">{new URL(`/invite?token=${invite.invite_token}`, window.location.origin).toString()}</p>
                          </div>
                          {invite.status === 'pending' ? <div className="flex gap-2"><Button onPress={() => navigator.clipboard.writeText(new URL(`/invite?token=${invite.invite_token}`, window.location.origin).toString())} variant="light" className="rounded-full font-semibold">Copy Link</Button><Button onPress={() => handleRevokeInvite(invite.id)} variant="bordered" className="rounded-full font-semibold">Revoke</Button></div> : <span className="text-xs text-text-subtle font-semibold uppercase">{invite.status}</span>}
                        </div>
                      )) : <div className="p-6 text-sm text-text-muted">No invites yet.</div>}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-border bg-background/60 p-6 text-sm text-text-muted">You can view your event role here, but only owners and managers can manage collaborators.</div>
            )}
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
                    {canModerateMedia && <div className="flex gap-2 justify-end">
                      <button onClick={() => handleModerateMedia(item.id, 'featured')} className="bg-white/90 text-black rounded-full px-3 py-1 text-xs font-semibold">Feature</button>
                      <button onClick={() => handleModerateMedia(item.id, item.status === 'approved' ? 'hidden' : 'approved')} className="bg-white/90 text-black rounded-full px-3 py-1 text-xs font-semibold">{item.status === 'approved' ? 'Hide' : 'Approve'}</button>
                      <button onClick={() => handleDeleteMedia(item.id)} className="bg-red-500 text-white rounded-full px-3 py-1 text-xs font-semibold">Delete</button>
                    </div>}
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="py-12 text-center text-text-muted font-medium">No media found in this filter.</div>}
        </div>
      )}

      {canManageEvent && <div className="mt-8 flex justify-end">
        <Button color="danger" variant="bordered" onPress={handleDeleteEvent}>Delete Event</Button>
      </div>}
    </div>
  );
}
