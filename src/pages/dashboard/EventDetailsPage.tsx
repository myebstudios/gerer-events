import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Input, Textarea, Select, SelectItem } from '@heroui/react';
import { TEMPLATE_CATALOG, type EventType } from '../../lib/catalog';
import { sanitizeId, getStoredUserId } from '../../lib/id';

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

  if (!safeEventId) return <div className="p-8 text-text-muted font-medium">Invalid event link.</div>;
  const navigate = useNavigate();
  const userId = getStoredUserId();

  const event = useQuery((api as any).events.getEvent, safeEventId ? { eventId: safeEventId } : "skip");
  const stats = useQuery((api as any).events.getEventStats, safeEventId && userId ? { eventId: safeEventId, hostId: userId } : "skip");
  const guests = useQuery((api as any).guests.getGuests, safeEventId && userId ? { eventId: safeEventId, hostId: userId } : "skip");
  const media = useQuery((api as any).media.getMedia, safeEventId && userId ? { eventId: safeEventId, hostId: userId } : "skip");
  const guestsExport = useQuery((api as any).guests.getGuestsForExport, safeEventId && userId ? { eventId: safeEventId, hostId: userId } : "skip");

  const updateEventStatus = useMutation((api as any).events.updateEventStatus);
  const updateEvent = useMutation((api as any).events.updateEvent);
  const deleteEvent = useMutation((api as any).events.deleteEvent);
  const deleteGuest = useMutation((api as any).guests.deleteGuest);
  const moderateMedia = useMutation((api as any).media.moderateMedia);
  const deleteMedia = useMutation((api as any).media.deleteMedia);
  const generateUploadUrl = useMutation((api as any).events.generateUploadUrl);

  const [activeTab, setActiveTab] = React.useState('overview');
  const [showQR, setShowQR] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({ title: '', date: '', endDate: '', location: '', description: '' });
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | undefined>(undefined);
  const [themeColor, setThemeColor] = React.useState('#18181B');
  const [typographyPreset, setTypographyPreset] = React.useState('modern');
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
  const [appearanceSaving, setAppearanceSaving] = React.useState(false);
  const coverRef = React.useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [mediaFilter, setMediaFilter] = React.useState('all');

  const THEME_COLORS = ['#18181B', '#e11d48', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#db2777'];
  const TYPOGRAPHY_PRESETS = [
    { id: 'modern', label: 'Modern (Sans-serif)' },
    { id: 'classic', label: 'Classic (Serif)' },
    { id: 'playful', label: 'Playful (Display)' },
  ];
  const FONT_FAMILIES: Record<string, string> = {
    modern: "'Inter', 'Helvetica Neue', sans-serif",
    classic: "Georgia, 'Times New Roman', serif",
    playful: "'CabinetGrotesk-Variable', 'Outfit', sans-serif",
  };
  const previewFontFamily = FONT_FAMILIES[typographyPreset] || FONT_FAMILIES.modern;

  React.useEffect(() => {
    if (event) {
      setEditData({
        title: event.title,
        date: event.date,
        endDate: event.endDate || '',
        location: event.location,
        description: event.description ?? '',
      });
      setSelectedTemplateId(event.templateId);
      // Load color/typography from localStorage (cloud schema doesn't support them yet)
      const stored = localStorage.getItem(`appearance_${event._id}`);
      if (stored) {
        try {
          const { themeColor: c, typographyPreset: t } = JSON.parse(stored);
          if (c) setThemeColor(c);
          if (t) setTypographyPreset(t);
        } catch { }
      } else {
        if (event.themeColor) setThemeColor(event.themeColor);
        if (event.typographyPreset) setTypographyPreset(event.typographyPreset);
      }
      if (event.coverImageUrl && !coverPreview) setCoverPreview(event.coverImageUrl);
    }
  }, [event]);

  if (event === undefined || stats === undefined || guests === undefined || media === undefined) return <div className="p-8 text-text-muted font-medium">Loading...</div>;
  if (!event) return <div className="p-8 text-text-muted font-medium">Event not found</div>;

  const publicUrl = new URL(`/e/${event._id}`, window.location.origin).toString();

  const handleSaveEdit = async () => {
    if (!userId) return;
    await updateEvent({
      eventId: event._id,
      hostId: userId,
      title: editData.title,
      date: editData.date,
      ...(editData.endDate ? { endDate: editData.endDate } : {}),
      location: editData.location,
      description: editData.description || undefined,
    });
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!userId) return;
    await updateEventStatus({ eventId: event._id, hostId: userId, status: newStatus });
  };

  const handleDeleteEvent = async () => {
    if (!userId) return;
    await deleteEvent({ eventId: event._id, hostId: userId });
    navigate('/dashboard');
  };

  const handleExportCSV = () => {
    if (!guestsExport) return;
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Plus Ones', 'Meal Preference', 'Checked In', 'Checked In At', 'Message'];
    const rows = guestsExport.map((g: any) => [g.name, g.email, g.phone, g.status, g.plusOnes, g.mealPreference, g.checkedIn, g.checkedInAt, g.message]);
    const csv = [headers.join(','), ...rows.map((r: any) => r.map((v: any) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}-guests.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleModerateMedia = async (mediaId: string, status: string) => {
    if (!userId) return;
    await moderateMedia({ mediaId, status, moderatedBy: userId });
  };

  const filteredMedia = media.filter((m: any) => mediaFilter === 'all' || m.status === mediaFilter);

  const statusFlow = ['draft', 'published', 'live', 'ended'];
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
    { id: 'settings', label: 'Event Settings' },
  ];

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <Link to="/dashboard" className="text-text-muted hover:text-primary text-sm font-semibold flex items-center gap-2 mb-6 transition-colors w-fit">
            <span className="material-symbols-outlined text-sm">arrow_back</span> All Events
          </Link>
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <h1 className="font-display text-4xl md:text-5xl text-text-main">{event.title}</h1>
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${statusColors[event.status] ?? statusColors.draft}`}>
              {event.status}
            </span>
          </div>
          <div className="flex items-center gap-6 text-text-muted text-sm font-medium flex-wrap">
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">calendar_today</span> {safeFormatDate(event.date, event.endDate, 'MMMM d, yyyy')}</span>
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span> {event.location}</span>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {/* Status Controls */}
          {event.status === 'draft' && (
            <Button onPress={() => handleStatusChange('published')} color="primary" variant="bordered" className="text-sm font-semibold rounded-full" startContent={<span className="material-symbols-outlined text-sm">publish</span>}>Publish</Button>
          )}
          {event.status === 'published' && (
            <Button onPress={() => handleStatusChange('live')} className="text-sm font-semibold rounded-full bg-emerald text-white" startContent={<span className="material-symbols-outlined text-sm">play_arrow</span>}>Go Live</Button>
          )}
          {event.status === 'live' && (
            <Button onPress={() => handleStatusChange('ended')} color="danger" variant="bordered" className="text-sm font-semibold rounded-full" startContent={<span className="material-symbols-outlined text-sm">stop</span>}>End Event</Button>
          )}
          <Button as="a" href={publicUrl} target="_blank" rel="noopener noreferrer" variant="bordered" className="text-sm font-semibold rounded-full" startContent={<span className="material-symbols-outlined text-sm">open_in_new</span>}>View Public Page</Button>
          <Button as={Link as any} to={`/dashboard/events/${event._id}/checkin`} color="primary" className="text-sm font-semibold rounded-full" startContent={<span className="material-symbols-outlined text-sm">qr_code_scanner</span>}>Check-in Scanner</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar border-b border-border pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
              ? 'bg-text-main text-white shadow-sm'
              : 'bg-surface text-text-muted hover:bg-background border border-border'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statItems.map((stat) => (
              <div key={stat.label} className="bg-surface p-5 rounded-2xl border border-border shadow-[var(--shadow-card)] flex items-center gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.color}`}>
                  <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-muted">{stat.label}</p>
                  <h3 className="text-2xl font-display text-text-main">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Event Section */}
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl text-text-main">Event Details</h3>
              {!isEditing ? (
                <Button onPress={() => setIsEditing(true)} variant="bordered" size="sm" className="font-semibold rounded-full" startContent={<span className="material-symbols-outlined text-sm">edit</span>}>Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onPress={() => setIsEditing(false)} variant="light" size="sm" className="font-semibold">Cancel</Button>
                  <Button onPress={handleSaveEdit} color="primary" size="sm" className="font-semibold rounded-full">Save</Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-main">Title</label>
                  <Input value={editData.title} onValueChange={(v) => setEditData({ ...editData, title: v })} variant="bordered" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-main">Start Date</label>
                      <Input type="datetime-local" value={editData.date} onValueChange={(v) => setEditData({ ...editData, date: v })} variant="bordered" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-main">End Date</label>
                      <Input type="datetime-local" value={editData.endDate} onValueChange={(v) => setEditData({ ...editData, endDate: v })} variant="bordered" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-main">Location</label>
                    <Input value={editData.location} onValueChange={(v) => setEditData({ ...editData, location: v })} variant="bordered" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-main">Description</label>
                  <Textarea value={editData.description} onValueChange={(v) => setEditData({ ...editData, description: v })} variant="bordered" minRows={3} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><p className="text-xs font-semibold text-text-muted mb-1">Date</p><p className="text-text-main font-medium">{safeFormatDate(event.date, event.endDate, 'EEEE, MMMM d, yyyy · h:mm a')}</p></div>
                  <div><p className="text-xs font-semibold text-text-muted mb-1">Location</p><p className="text-text-main font-medium">{event.location}</p></div>
                  <div><p className="text-xs font-semibold text-text-muted mb-1">Type</p><p className="text-text-main font-medium capitalize">{event.eventType}</p></div>
                </div>
                {event.description && <div><p className="text-xs font-semibold text-text-muted mb-1">Description</p><p className="text-text-main">{event.description}</p></div>}
              </div>
            )}
          </div>

          {/* Share Section */}
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display text-2xl text-text-main mb-2">Share Invitation</h3>
                <p className="text-text-muted font-medium">Send this link to your guests so they can RSVP.</p>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-primary hover:text-primary-hover font-semibold flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined">qr_code_2</span>
                {showQR ? 'Hide QR' : 'QR Code'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input type="text" isReadOnly value={publicUrl} variant="bordered" startContent={<span className="material-symbols-outlined text-text-subtle text-sm">link</span>} />
              </div>
              <Button onPress={() => { navigator.clipboard.writeText(publicUrl); }} color="primary" className="text-sm font-semibold rounded-full">Copy Link</Button>
            </div>

            {showQR && (
              <div className="flex flex-col items-center justify-center p-8 bg-background rounded-2xl border border-border">
                <div className="bg-white p-4 rounded-2xl shadow-[var(--shadow-card)] mb-4">
                  <QRCodeSVG value={publicUrl} size={200} level="H" />
                </div>
                <p className="text-text-muted text-sm font-medium text-center max-w-sm">Scan to view event and RSVP.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GUESTS TAB */}
      {activeTab === 'guests' && (
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h3 className="font-display text-2xl text-text-main">Guest List</h3>
            <div className="flex gap-3">
              <Button onPress={handleExportCSV} variant="bordered" size="sm" className="font-semibold rounded-full" startContent={<span className="material-symbols-outlined text-sm">download</span>} isDisabled={!guestsExport || guestsExport.length === 0}>Export CSV</Button>
              <span className="bg-background px-4 py-1.5 rounded-full text-sm font-semibold text-text-muted border border-border">{guests.length} Total</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">Name</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">Email</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">Status</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">+</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">Checked In</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest: any) => (
                  <tr key={guest._id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-text-main">{guest.fullName}</td>
                    <td className="py-4 px-4 text-sm text-text-muted font-medium">{guest.email || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${guest.attendanceStatus === 'yes' ? 'bg-primary-light text-primary' :
                        guest.attendanceStatus === 'no' ? 'bg-red-light text-red' :
                          'bg-accent-light text-amber-700'
                        }`}>{guest.attendanceStatus}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-text-muted font-medium">{guest.plusOnes}</td>
                    <td className="py-4 px-4">
                      {guest.checkedIn ? <span className="material-symbols-outlined text-primary">check_circle</span> : <span className="material-symbols-outlined text-text-subtle/30">cancel</span>}
                    </td>
                    <td className="py-4 px-4">
                      <button onClick={() => { if (confirm('Remove this guest?')) deleteGuest({ guestId: guest._id, hostId: userId! }); }} className="text-text-subtle hover:text-red transition-colors">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {guests.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-text-muted font-medium">No guests have RSVP'd yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MEDIA TAB */}
      {activeTab === 'media' && (
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h3 className="font-display text-2xl text-text-main">Media Gallery</h3>
            <div className="flex gap-2">
              {['all', 'approved', 'pending', 'featured', 'rejected', 'hidden'].map((f) => (
                <button
                  key={f}
                  onClick={() => setMediaFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${mediaFilter === f ? 'bg-text-main text-white' : 'bg-background text-text-muted border border-border hover:border-primary/30'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item: any) => (
                <div key={item._id} className="relative group overflow-hidden rounded-2xl border border-border">
                  <div className="aspect-square">
                    {item.fileType.startsWith('image/') ? (
                      <img src={item.fileUrl} alt="Event Media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <video src={item.fileUrl} className="w-full h-full object-cover" muted loop playsInline onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
                    )}
                  </div>
                  {/* Status Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${item.status === 'featured' ? 'bg-accent text-text-main' :
                    item.status === 'approved' ? 'bg-primary text-white' :
                      item.status === 'pending' ? 'bg-orange text-white' :
                        item.status === 'rejected' ? 'bg-red text-white' :
                          'bg-text-subtle text-white'
                    }`}>{item.status}</div>
                  {/* Moderation Controls */}
                  <div className="absolute inset-0 bg-text-main/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => handleModerateMedia(item._id, 'approved')} className="bg-primary text-white p-1.5 rounded-lg hover:bg-primary-hover transition-colors" title="Approve"><span className="material-symbols-outlined text-sm">check</span></button>
                      <button onClick={() => handleModerateMedia(item._id, 'featured')} className="bg-accent text-text-main p-1.5 rounded-lg hover:bg-accent-hover transition-colors" title="Feature"><span className="material-symbols-outlined text-sm">star</span></button>
                      <button onClick={() => handleModerateMedia(item._id, 'hidden')} className="bg-text-subtle text-white p-1.5 rounded-lg hover:bg-text-muted transition-colors" title="Hide"><span className="material-symbols-outlined text-sm">visibility_off</span></button>
                      <button onClick={() => handleModerateMedia(item._id, 'rejected')} className="bg-orange text-white p-1.5 rounded-lg hover:bg-orange/80 transition-colors" title="Reject"><span className="material-symbols-outlined text-sm">block</span></button>
                    </div>
                    <button onClick={() => { if (confirm('Delete this media permanently?')) deleteMedia({ mediaId: item._id, hostId: userId! }); }} className="bg-red text-white p-1.5 rounded-lg hover:bg-red/80 transition-colors" title="Delete"><span className="material-symbols-outlined text-sm">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-background rounded-2xl border-2 border-border border-dashed">
              <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-card)] border border-border">
                <span className="material-symbols-outlined text-3xl text-text-subtle">photo_library</span>
              </div>
              <p className="text-text-muted font-medium">{mediaFilter === 'all' ? 'No media has been uploaded yet.' : `No ${mediaFilter} media.`}</p>
            </div>
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Invitation Template + Customization */}
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl text-text-main">Invitation Appearance</h3>
                <p className="text-text-muted text-sm">Customise how your public invitation page looks to guests.</p>
              </div>
              <Button
                isLoading={appearanceSaving}
                onPress={async () => {
                  setAppearanceSaving(true);
                  try {
                    let coverImageStorageId: string | undefined;
                    if (coverFile) {
                      const uploadUrl = await generateUploadUrl();
                      const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': coverFile.type }, body: coverFile });
                      const { storageId } = await result.json();
                      coverImageStorageId = storageId;
                    }
                    // Save templateId + cover to Convex; color/typography go to localStorage
                    // until the cloud schema is updated to accept these fields.
                    await updateEvent({
                      eventId: event._id,
                      hostId: userId!,
                      templateId: selectedTemplateId,
                      ...(coverImageStorageId ? { coverImageStorageId } : {}),
                    });
                    localStorage.setItem(`appearance_${event._id}`, JSON.stringify({ themeColor, typographyPreset }));
                  } catch (e) { console.error(e); }
                  finally { setAppearanceSaving(false); }
                }}
                className="rounded-full bg-text-main text-white font-semibold text-sm px-6"
              >
                Save Appearance
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: Controls */}
              <div className="space-y-8">
                {/* Template Layout */}
                <div>
                  <p className="text-sm font-semibold text-text-main mb-3">Layout</p>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATE_CATALOG.filter(t => t.supportedEventTypes.includes(event.eventType as EventType)).map(template => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          setThemeColor(template.color);
                          setTypographyPreset(template.typographyPreset);
                        }}
                        className={`relative cursor-pointer rounded-2xl p-4 transition-all flex flex-col items-center text-center gap-2 border-2 ${(selectedTemplateId ?? event.templateId) === template.id
                          ? 'border-text-main ring-2 ring-text-main/10 shadow-md'
                          : 'border-border hover:border-primary/30 hover:shadow-sm'
                          }`}
                      >
                        {(selectedTemplateId ?? event.templateId) === template.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-text-main flex items-center justify-center">
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>check</span>
                          </div>
                        )}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: template.color }}>
                          <span className="material-symbols-outlined">{template.icon}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-text-main leading-tight">{template.name}</p>
                          <p className="text-xs text-text-muted capitalize">{template.tone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <p className="text-sm font-semibold text-text-main mb-3">Cover Image</p>
                  <input type="file" accept="image/*" ref={coverRef} className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setCoverFile(f);
                    const reader = new FileReader();
                    reader.onload = () => setCoverPreview(reader.result as string);
                    reader.readAsDataURL(f);
                  }} />
                  {coverPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-border aspect-video shadow-sm">
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" onClick={() => coverRef.current?.click()} className="bg-white text-black px-4 py-2 rounded-full text-xs font-semibold shadow-md">Change</button>
                        <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="bg-white text-black px-3 py-2 rounded-full text-xs font-semibold shadow-md">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => coverRef.current?.click()} className="w-full border-2 border-dashed border-border bg-background rounded-2xl p-8 flex flex-col items-center justify-center hover:border-primary/30 hover:bg-surface transition-all">
                      <span className="material-symbols-outlined text-3xl text-text-subtle mb-2">add_photo_alternate</span>
                      <span className="text-sm text-text-muted font-medium">Upload cover photo</span>
                      <span className="text-xs text-text-subtle mt-1 uppercase tracking-wider font-semibold">Max 10MB</span>
                    </button>
                  )}
                </div>

                {/* Accent Color */}
                <div>
                  <p className="text-sm font-semibold text-text-main mb-3">Accent Color</p>
                  <div className="flex flex-wrap gap-3">
                    {THEME_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setThemeColor(color)}
                        className={`w-9 h-9 rounded-full border-2 transition-transform focus:outline-none ${themeColor === color ? 'border-text-main scale-110 shadow-md' : 'border-transparent hover:scale-105'
                          }`}
                        style={{ backgroundColor: color }}
                      >
                        {themeColor === color && <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>check</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <p className="text-sm font-semibold text-text-main mb-3">Typography</p>
                  <Select
                    selectedKeys={[typographyPreset]}
                    onSelectionChange={(keys) => {
                      const t = Array.from(keys)[0] as string;
                      if (t) setTypographyPreset(t);
                    }}
                    variant="bordered"
                    radius="lg"
                    classNames={{ trigger: 'border-border hover:border-primary/30' }}
                  >
                    {TYPOGRAPHY_PRESETS.map(t => (
                      <SelectItem key={t.id}>{t.label}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="bg-background rounded-[28px] p-5 flex flex-col items-center justify-start border border-border">
                <p className="text-xs font-semibold tracking-widest uppercase text-text-subtle mb-4">Live Preview</p>
                {/* Phone frame */}
                <div
                  className="w-full max-w-[220px] rounded-[2.2rem] shadow-2xl border-[7px] border-zinc-900 overflow-hidden flex flex-col bg-white"
                  style={{ fontFamily: previewFontFamily, aspectRatio: '9/19' }}
                >
                  {/* Dynamic Island */}
                  <div className="bg-zinc-900 flex justify-center pt-2 pb-1 flex-shrink-0">
                    <div className="bg-black w-20 h-4 rounded-full"></div>
                  </div>

                  {/* Hero — compact, ~32% height */}
                  <div
                    className="relative flex-shrink-0 flex items-end justify-center overflow-hidden bg-cover bg-center"
                    style={{
                      backgroundColor: themeColor,
                      backgroundImage: coverPreview ? `url(${coverPreview})` : 'none',
                      height: '32%',
                    }}
                  >
                    {coverPreview && <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${themeColor}dd)` }}></div>}
                    {!coverPreview && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.18 }}>
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '36px' }}>
                          {TEMPLATE_CATALOG.find(t => t.id === (selectedTemplateId ?? event.templateId))?.icon || 'celebration'}
                        </span>
                      </div>
                    )}
                    <div className="relative z-10 text-center px-3 pb-2 w-full">
                      <h4 className="text-white font-bold leading-tight mb-1" style={{ fontSize: '11px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        {event.title}
                      </h4>
                      <p className="font-bold" style={{ color: '#fff', fontSize: '9px', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        {safeFormatDate(event.date, 'd MMMM yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Details card — overlapping, scrollable area */}
                  <div
                    className="flex-1 bg-white rounded-t-2xl relative overflow-y-auto"
                    style={{ marginTop: '-10px', zIndex: 10 }}
                  >
                    <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
                      {/* Heading */}
                      <p className="font-bold text-center" style={{ fontSize: '10px', color: '#111' }}>The Details</p>

                      {/* WHEN */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="material-symbols-outlined" style={{ fontSize: '11px', color: themeColor, opacity: 0.85 }}>schedule</span>
                        <p className="uppercase font-bold tracking-widest" style={{ fontSize: '6px', color: '#9ca3af' }}>When</p>
                        <p className="font-semibold" style={{ fontSize: '8px', color: '#111' }}>{safeFormatDate(event.date, 'EEEE, d MMMM yyyy')}</p>
                        <p style={{ fontSize: '7px', color: '#9ca3af' }}>{safeFormatDate(event.date, 'HH:mm')}</p>
                      </div>
                      <div className="h-px mx-6" style={{ backgroundColor: themeColor, opacity: 0.15 }}></div>

                      {/* WHERE */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="material-symbols-outlined" style={{ fontSize: '11px', color: themeColor, opacity: 0.85 }}>location_on</span>
                        <p className="uppercase font-bold tracking-widest" style={{ fontSize: '6px', color: '#9ca3af' }}>Where</p>
                        <p className="font-semibold" style={{ fontSize: '8px', color: '#111' }}>{event.location}</p>
                      </div>

                      {/* Description */}
                      {event.description && (
                        <>
                          <div className="h-px mx-6" style={{ backgroundColor: themeColor, opacity: 0.15 }}></div>
                          <p className="text-center" style={{ fontSize: '7px', color: '#6b7280', lineHeight: 1.6 }}>{event.description}</p>
                          <div className="h-px mx-6" style={{ backgroundColor: themeColor, opacity: 0.15 }}></div>
                        </>
                      )}

                      {/* Buttons */}
                      <div className="space-y-2 pt-1">
                        <div
                          className="w-full rounded-full font-bold text-center"
                          style={{ backgroundColor: themeColor, color: '#fff', fontSize: '8px', padding: '6px 0' }}
                        >
                          RSVP Now
                        </div>
                        <div
                          className="w-full rounded-full font-bold text-center border-2"
                          style={{ borderColor: themeColor, color: themeColor, fontSize: '8px', padding: '5px 0', backgroundColor: 'transparent' }}
                        >
                          Upload Memories
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Status */}
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <h3 className="font-display text-xl text-text-main mb-4">Event Lifecycle</h3>
            <div className="flex items-center gap-3 flex-wrap">
              {statusFlow.map((s, i) => (
                <React.Fragment key={s}>
                  <button
                    onClick={() => handleStatusChange(s)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${event.status === s
                      ? `${statusColors[s]} ring-2 ring-offset-2 ring-current`
                      : 'bg-background text-text-muted border border-border hover:border-primary/30'
                      }`}
                  >
                    {s}
                  </button>
                  {i < statusFlow.length - 1 && <span className="material-symbols-outlined text-text-subtle text-sm">arrow_forward</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Moderation Mode */}
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <h3 className="font-display text-xl text-text-main mb-2">Media Moderation</h3>
            <p className="text-text-muted text-sm mb-4">Control how guest uploads are handled.</p>
            <div className="flex gap-4">
              {[
                { value: 'auto-approve', label: 'Auto-Approve', desc: 'All uploads go live immediately' },
                { value: 'review', label: 'Review First', desc: 'Uploads require your approval' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateEvent({ eventId: event._id, hostId: userId!, moderationMode: opt.value })}
                  className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${(event.moderationMode ?? 'auto-approve') === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                    }`}
                >
                  <p className="font-semibold text-text-main mb-1">{opt.label}</p>
                  <p className="text-xs text-text-muted">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-surface p-8 rounded-2xl border-2 border-red/20 shadow-[var(--shadow-card)]">
            <h3 className="font-display text-xl text-red mb-2">Danger Zone</h3>
            <p className="text-text-muted text-sm mb-4">Deleting an event removes all guests, media, and data. This cannot be undone.</p>
            {!showDeleteConfirm ? (
              <Button onPress={() => setShowDeleteConfirm(true)} color="danger" variant="bordered" className="font-semibold rounded-full" startContent={<span className="material-symbols-outlined text-sm">delete_forever</span>}>Delete Event</Button>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-light rounded-xl border border-red/20">
                <span className="material-symbols-outlined text-red">warning</span>
                <p className="text-sm text-red font-medium flex-1">Are you sure? This will permanently delete this event and all associated data.</p>
                <Button onPress={handleDeleteEvent} color="danger" size="sm" className="font-semibold rounded-full">Confirm Delete</Button>
                <Button onPress={() => setShowDeleteConfirm(false)} variant="light" size="sm" className="font-semibold">Cancel</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
