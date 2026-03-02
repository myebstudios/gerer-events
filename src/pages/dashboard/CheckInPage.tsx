import * as React from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function CheckInPage() {
  const { id } = useParams();
  const userId = localStorage.getItem('userId');
  const event = useQuery((api as any).events.getEvent, id && userId ? { eventId: id } : "skip");
  const guests = useQuery((api as any).guests.getGuests, id && userId ? { eventId: id, hostId: userId } : "skip");
  const checkIn = useMutation((api as any).guests.checkIn);

  const [searchQuery, setSearchQuery] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleManualCheckIn = async (guestId: string, currentStatus: boolean) => {
    try {
      if (!userId) throw new Error("Not authenticated");
      await checkIn({ guestId, checkedIn: !currentStatus, hostId: userId });
      setMessage({ type: 'success', text: `Guest ${!currentStatus ? 'checked in' : 'checked out'} successfully.` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleQRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!guests) return;

    const guest = guests.find((g: any) => g.qrToken === qrToken);

    if (!guest) {
      setMessage({ type: 'error', text: 'Invalid QR Token or guest not found.' });
      setQrToken('');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (guest.checkedIn) {
      setMessage({ type: 'error', text: 'Guest is already checked in.' });
      setQrToken('');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    await handleManualCheckIn(guest._id, false);
    setQrToken('');
  };

  if (guests === undefined || event === undefined) return <div className="p-8 text-text-muted font-medium">Loading...</div>;

  const filteredGuests = guests.filter((g: any) =>
    g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <Link to={`/dashboard/events/${id}`} className="text-text-muted hover:text-primary text-sm font-semibold flex items-center gap-2 mb-6 transition-colors w-fit">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Event
        </Link>
        <h1 className="font-display text-3xl md:text-4xl text-text-main mb-2">Check-in Scanner</h1>
        <p className="text-text-muted">{event?.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Scanner Section */}
        <div className="bg-surface border border-border rounded-2xl shadow-[var(--shadow-card)] p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="w-64 h-64 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center mb-8 relative z-10 bg-primary/5 backdrop-blur-sm">
            <span className="material-symbols-outlined text-6xl text-primary/40 mb-4 animate-pulse">qr_code_scanner</span>
            <p className="text-sm font-semibold text-text-muted text-center px-4">Camera Scanner<br />Coming Soon</p>
          </div>

          <div className="w-full max-w-sm relative z-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4 text-center">Or enter token manually</p>
            <form onSubmit={handleQRSubmit} className="flex gap-2">
              <input
                type="text"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                placeholder="Token (e.g., evt_...)"
                className="flex-1 border border-border bg-background rounded-xl py-3 px-4 text-text-main placeholder-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-hover transition-all px-6 py-3 text-sm font-semibold rounded-xl"
              >
                Verify
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-4 text-sm font-medium text-center rounded-xl ${message.type === 'success' ? 'bg-primary-light text-primary border border-primary/20' : 'bg-red-light text-red border border-red/20'}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Guest List Section */}
        <div className="bg-surface border border-border rounded-2xl shadow-[var(--shadow-card)] flex flex-col h-[600px] lg:h-auto">
          <div className="p-6 border-b border-border">
            <h3 className="font-display text-2xl text-text-main mb-4">Guest List</h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle">search</span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-border bg-background rounded-xl py-3 pl-10 pr-4 text-text-main placeholder-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredGuests.map((guest: any) => (
              <div key={guest._id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/30 transition-all bg-background/50">
                <div>
                  <p className="font-semibold text-text-main">{guest.fullName}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {guest.attendanceStatus} {guest.plusOnes > 0 && `• +${guest.plusOnes} Guests`}
                  </p>
                </div>
                <button
                  onClick={() => handleManualCheckIn(guest._id, guest.checkedIn)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-2 ${guest.checkedIn
                    ? 'bg-primary-light text-primary border border-primary/20 hover:bg-red-light hover:text-red hover:border-red/20'
                    : 'bg-primary text-white hover:bg-primary-hover shadow-sm'
                    }`}
                >
                  {guest.checkedIn ? (
                    <><span className="material-symbols-outlined text-sm">check_circle</span> Checked In</>
                  ) : (
                    'Check In'
                  )}
                </button>
              </div>
            ))}
            {filteredGuests.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <span className="material-symbols-outlined text-4xl text-text-subtle/30 mb-2">search_off</span>
                <p>No guests found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
