import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

export default function EventDetailsPage() {
  const { id } = useParams();
  
  const event = useQuery((api as any).events.getEvent, id ? { eventId: id } : "skip");
  const stats = useQuery((api as any).events.getEventStats, id ? { eventId: id } : "skip");
  const guests = useQuery((api as any).guests.getGuests, id ? { eventId: id } : "skip");
  const media = useQuery((api as any).media.getMedia, id ? { eventId: id } : "skip");

  const [activeTab, setActiveTab] = React.useState('overview');
  const [showQR, setShowQR] = React.useState(false);

  if (event === undefined || stats === undefined || guests === undefined || media === undefined) return <div className="p-8">Loading...</div>;
  if (!event) return <div className="p-8">Event not found</div>;

  const publicUrl = `${window.location.origin}/e/${event._id}`;

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <Link to="/dashboard" className="text-text-muted hover:text-primary text-sm font-semibold flex items-center gap-2 mb-6 transition-colors w-fit">
            <span className="material-symbols-outlined text-sm">arrow_back</span> All Events
          </Link>
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl md:text-5xl text-text-main">{event.title}</h1>
            <span className="bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
              {event.status}
            </span>
          </div>
          <div className="flex items-center gap-6 text-text-muted text-sm font-medium">
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">calendar_today</span> {format(new Date(event.date), 'MMMM d, yyyy')}</span>
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span> {event.location}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="bg-surface border border-border text-text-main hover:border-primary hover:text-primary transition-all px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">open_in_new</span> View Public Page
          </a>
          <Link to={`/dashboard/events/${event._id}/checkin`} className="bg-primary text-white hover:bg-primary-hover transition-all px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">qr_code_scanner</span> Check-in Scanner
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar border-b border-border pb-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-text-main text-white' : 'bg-surface text-text-muted hover:bg-border/50 border border-border'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('guests')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'guests' ? 'bg-text-main text-white' : 'bg-surface text-text-muted hover:bg-border/50 border border-border'}`}
        >
          Guests
        </button>
        <button 
          onClick={() => setActiveTab('media')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'media' ? 'bg-text-main text-white' : 'bg-surface text-text-muted hover:bg-border/50 border border-border'}`}
        >
          Media Gallery
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid (priority order) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">monitoring</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-muted">RSVP Rate</p>
                <h3 className="text-2xl text-text-main">{stats.rsvpRate}%</h3>
              </div>
            </div>
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined">qr_code_scanner</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-muted">Actual Check-ins</p>
                <h3 className="text-2xl text-text-main">{stats.checkedIn}</h3>
              </div>
            </div>
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <span className="material-symbols-outlined">photo_library</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-muted">Media Uploads</p>
                <h3 className="text-2xl text-text-main">{stats.mediaCount}</h3>
              </div>
            </div>
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-muted">Plus-ones</p>
                <h3 className="text-2xl text-text-main">{stats.plusOnes}</h3>
              </div>
            </div>
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center">
                <span className="material-symbols-outlined">trending_down</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-muted">No-show Rate</p>
                <h3 className="text-2xl text-text-main">{stats.noShowRate}%</h3>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl text-text-main mb-2">Share Invitation</h3>
                <p className="text-text-muted font-medium">Send this link to your guests so they can RSVP and access event details.</p>
              </div>
              <button 
                onClick={() => setShowQR(!showQR)}
                className="text-primary hover:text-primary-hover font-semibold flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined">qr_code_2</span>
                {showQR ? 'Hide QR Code' : 'Generate QR Code'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">link</span>
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  alert('Link copied to clipboard!');
                }}
                className="bg-text-main text-white hover:bg-text-main/90 transition-all px-8 py-3 rounded-xl text-sm font-semibold whitespace-nowrap shadow-sm"
              >
                Copy Link
              </button>
            </div>

            {showQR && (
              <div className="flex flex-col items-center justify-center p-8 bg-background rounded-2xl border border-border">
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                  <QRCodeSVG value={publicUrl} size={200} level="H" />
                </div>
                <p className="text-text-muted text-sm font-medium mb-4 text-center max-w-sm">
                  Print this QR code on your physical invitation cards. Guests can scan it to view the event and RSVP.
                </p>
                <button 
                  onClick={() => {
                    const svg = document.querySelector('svg');
                    if (!svg) return;
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx?.drawImage(img, 0, 0);
                      const pngFile = canvas.toDataURL('image/png');
                      const downloadLink = document.createElement('a');
                      downloadLink.download = `event-qr-${event._id}.png`;
                      downloadLink.href = `${pngFile}`;
                      downloadLink.click();
                    };
                    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
                  }}
                  className="text-primary font-semibold hover:underline flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">download</span> Download QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'guests' && (
        <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl text-text-main">Guest List</h3>
            <span className="bg-background px-4 py-1.5 rounded-full text-sm font-semibold text-text-muted border border-border">
              {guests.length} Total Guests
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Name</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Email</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Status</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Plus Ones</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Checked In</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest: any) => (
                  <tr key={guest._id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-text-main">{guest.fullName}</td>
                    <td className="py-4 px-4 text-sm text-text-muted font-medium">{guest.email || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-widest rounded-md ${
                        guest.attendanceStatus === 'yes' ? 'bg-green-100 text-green-800' :
                        guest.attendanceStatus === 'no' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {guest.attendanceStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-text-muted font-medium">{guest.plusOnes}</td>
                    <td className="py-4 px-4">
                      {guest.checkedIn ? (
                        <span className="material-symbols-outlined text-green-600">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-text-muted/30">cancel</span>
                      )}
                    </td>
                  </tr>
                ))}
                {guests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted font-medium">
                      No guests have RSVP'd yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl text-text-main">Media Gallery</h3>
            <span className="bg-background px-4 py-1.5 rounded-full text-sm font-semibold text-text-muted border border-border">
              {media.length} Items
            </span>
          </div>

          {media.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item: any) => (
                <div key={item._id} className="aspect-square relative group overflow-hidden rounded-2xl border border-border">
                  {item.fileType.startsWith('image/') ? (
                    <img src={item.fileUrl} alt="Event Media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <video src={item.fileUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" muted loop playsInline onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
                  )}
                  <div className="absolute inset-0 bg-text-main/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-text-main p-3 rounded-full hover:bg-primary hover:text-white transition-colors shadow-lg">
                      <span className="material-symbols-outlined">open_in_new</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-background rounded-2xl border border-border border-dashed">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                <span className="material-symbols-outlined text-3xl text-text-muted">photo_library</span>
              </div>
              <p className="text-text-muted font-medium">No media has been uploaded yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
