import * as React from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function CheckInPage() {
  const { id } = useParams();
  const event = useQuery((api as any).events.getEvent, id ? { eventId: id } : "skip");
  const guests = useQuery((api as any).guests.getGuests, id ? { eventId: id } : "skip");
  const checkIn = useMutation((api as any).guests.checkIn);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleManualCheckIn = async (guestId: string, currentStatus: boolean) => {
    try {
      await checkIn({ guestId, checkedIn: !currentStatus });
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

  if (guests === undefined || event === undefined) return <div className="p-8">Loading...</div>;

  const filteredGuests = guests.filter((g: any) => 
    g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <Link to={`/dashboard/events/${id}`} className="text-gold hover:text-clay text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6 transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Event
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl text-espresso mb-2">Check-in Scanner</h1>
        <p className="text-clay">{event?.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Scanner Section */}
        <div className="bg-ivory border border-gold/20 shadow-sm p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="w-64 h-64 border-2 border-dashed border-gold/50 rounded-2xl flex flex-col items-center justify-center mb-8 relative z-10 bg-white/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-6xl text-gold/50 mb-4 animate-pulse">qr_code_scanner</span>
            <p className="text-sm font-bold uppercase tracking-widest text-espresso/50 text-center px-4">Camera Scanner<br/>Coming Soon</p>
          </div>

          <div className="w-full max-w-sm relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-clay mb-4 text-center">Or enter token manually</p>
            <form onSubmit={handleQRSubmit} className="flex gap-2">
              <input
                type="text"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                placeholder="Token (e.g., evt_...)"
                className="flex-1 border-b-2 border-espresso/20 bg-transparent py-3 px-0 text-espresso placeholder-espresso/30 focus:border-gold focus:outline-none focus:ring-0 transition-colors rounded-none"
              />
              <button 
                type="submit"
                className="bg-espresso text-gold hover:bg-cocoa transition-all px-6 py-3 text-sm font-bold tracking-widest uppercase"
              >
                Verify
              </button>
            </form>
            
            {message && (
              <div className={`mt-4 p-4 text-sm font-medium text-center ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Guest List Section */}
        <div className="bg-white border border-gold/20 shadow-sm flex flex-col h-[600px] lg:h-auto">
          <div className="p-6 border-b border-gold/10">
            <h3 className="font-serif text-2xl text-espresso mb-4">Guest List</h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-gold">search</span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b-2 border-espresso/10 bg-transparent py-3 pl-8 pr-0 text-espresso placeholder-espresso/30 focus:border-gold focus:outline-none focus:ring-0 transition-colors rounded-none"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {filteredGuests.map((guest: any) => (
              <div key={guest._id} className="flex items-center justify-between p-4 border border-gold/10 hover:border-gold/30 transition-colors bg-ivory/30">
                <div>
                  <p className="font-serif text-lg text-espresso">{guest.fullName}</p>
                  <p className="text-xs text-clay uppercase tracking-wider mt-1">
                    {guest.attendanceStatus} {guest.plusOnes > 0 && `• +${guest.plusOnes} Guests`}
                  </p>
                </div>
                <button
                  onClick={() => handleManualCheckIn(guest._id, guest.checkedIn)}
                  className={`px-4 py-2 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
                    guest.checkedIn 
                      ? 'bg-gold/10 text-espresso border border-gold/20 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                      : 'bg-espresso text-gold hover:bg-cocoa'
                  }`}
                >
                  {guest.checkedIn ? (
                    <><span className="material-symbols-outlined text-sm text-green-600">check_circle</span> Checked In</>
                  ) : (
                    'Check In'
                  )}
                </button>
              </div>
            ))}
            {filteredGuests.length === 0 && (
              <div className="text-center py-12 text-clay">
                <span className="material-symbols-outlined text-4xl text-gold/30 mb-2">search_off</span>
                <p>No guests found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
