import * as React from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sanitizeId } from '../../lib/id';
import { Button, Input, Card, CardBody, Spinner } from '@heroui/react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

function extractToken(raw: string) {
  const value = raw.trim();
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.searchParams.get('token') || url.searchParams.get('qr') || url.pathname.split('/').filter(Boolean).pop() || value;
  } catch {
    return value;
  }
}

type GuestRecord = {
  id: string;
  full_name: string;
  email?: string | null;
  qr_token?: string | null;
  attendance_status?: string | null;
  plus_ones?: number | null;
  checked_in?: boolean | null;
  checked_in_at?: string | null;
};

export default function CheckInPage() {
  const { id } = useParams();
  const safeEventId = sanitizeId(id);
  const { user } = useAuth();
  const [event, setEvent] = React.useState<any>(null);
  const [guests, setGuests] = React.useState<GuestRecord[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busyGuestId, setBusyGuestId] = useState<string | null>(null);
  const messageTimerRef = React.useRef<number | null>(null);

  const showTemporaryMessage = React.useCallback((next: { type: 'success' | 'error'; text: string }) => {
    setMessage(next);
    if (messageTimerRef.current) {
      window.clearTimeout(messageTimerRef.current);
    }
    messageTimerRef.current = window.setTimeout(() => setMessage(null), 3200);
  }, []);

  const refresh = React.useCallback(async () => {
    if (!safeEventId || !user) return;
    setLoading(true);

    const [{ data: eventData, error: eventError }, { data: guestsData, error: guestsError }] = await Promise.all([
      supabase.from('events').select('*').eq('id', safeEventId).maybeSingle(),
      supabase
        .from('guests')
        .select('id, full_name, email, qr_token, attendance_status, plus_ones, checked_in, checked_in_at')
        .eq('event_id', safeEventId)
        .order('created_at', { ascending: false }),
    ]);

    if (eventError) throw eventError;
    if (guestsError) throw guestsError;

    setEvent(eventData);
    setGuests((guestsData || []) as GuestRecord[]);
    setLoading(false);
  }, [safeEventId, user]);

  React.useEffect(() => {
    const load = async () => {
      try {
        await refresh();
      } catch (error: any) {
        setLoading(false);
        showTemporaryMessage({ type: 'error', text: error.message || 'Unable to load check-in data.' });
      }
    };

    void load();
  }, [refresh, showTemporaryMessage]);

  React.useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  const updateGuestInState = React.useCallback((guestId: string, nextValues: Partial<GuestRecord>) => {
    setGuests((current) => current?.map((guest) => (guest.id === guestId ? { ...guest, ...nextValues } : guest)) ?? current);
  }, []);

  const handleManualCheckIn = async (guestId: string, currentStatus: boolean, guestName?: string) => {
    try {
      setBusyGuestId(guestId);
      const nextValues = currentStatus
        ? { checked_in: false, checked_in_at: null }
        : { checked_in: true, checked_in_at: new Date().toISOString() };

      const { error } = await supabase.from('guests').update(nextValues).eq('id', guestId).eq('event_id', safeEventId);
      if (error) throw error;

      updateGuestInState(guestId, nextValues);
      showTemporaryMessage({ type: 'success', text: `${guestName || 'Guest'} ${!currentStatus ? 'checked in' : 'checked out'} successfully.` });
    } catch (error: any) {
      showTemporaryMessage({ type: 'error', text: error.message || 'Unable to update guest check-in.' });
    } finally {
      setBusyGuestId(null);
    }
  };

  const resolveTokenCheckIn = async (token: string) => {
    if (!guests) return;
    const normalized = extractToken(token);
    if (!normalized) {
      return showTemporaryMessage({ type: 'error', text: 'Please enter a token or guest check-in link.' });
    }

    const guest = guests.find((g) => g.qr_token === normalized) || null;

    if (!guest) {
      setQrToken('');
      return showTemporaryMessage({ type: 'error', text: 'Invalid QR token or guest not found.' });
    }

    if (guest.checked_in) {
      setQrToken('');
      return showTemporaryMessage({ type: 'error', text: `${guest.full_name} is already checked in.` });
    }

    await handleManualCheckIn(guest.id, false, guest.full_name);
    setQrToken('');
  };

  const handleQRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resolveTokenCheckIn(qrToken);
  };

  if (!safeEventId) return <div className="p-8 text-text-muted font-medium">Invalid event link.</div>;
  if (loading || !event || !guests) return <div className="p-8 text-text-muted font-medium flex items-center gap-3"><Spinner size="sm" /> Loading check-in data...</div>;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredGuests = guests.filter((g) => g.full_name.toLowerCase().includes(normalizedQuery) || g.email?.toLowerCase().includes(normalizedQuery));
  const checkedInCount = guests.filter((guest) => guest.checked_in).length;

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto w-full flex flex-col">
      <div className="mb-8">
        <Link to={`/dashboard/events/${safeEventId}`} className="text-text-muted hover:text-primary text-sm font-semibold flex items-center gap-2 mb-6 transition-colors w-fit"><span className="material-symbols-outlined text-sm">arrow_back</span> Back to Event</Link>
        <h1 className="font-display text-3xl md:text-4xl text-text-main mb-2">Check-in Desk</h1>
        <p className="text-text-muted">{event?.title}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(360px,420px),minmax(0,1fr)] gap-6 items-start">
        <Card className="bg-surface border border-border rounded-2xl shadow-[var(--shadow-card)] h-fit xl:sticky xl:top-6">
          <CardBody className="p-6 sm:p-8 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-full max-w-md relative z-10 flex flex-col items-center">
              <div className="w-full rounded-2xl border border-border bg-background/60 p-6 mb-5 text-center">
                <span className="material-symbols-outlined text-5xl text-primary/50 mb-3">link</span>
                <h2 className="font-display text-2xl text-text-main mb-2">Use any QR scanner or camera app</h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  Organizers can scan guest QR codes with any phone QR app. The scanned link should open directly in the browser. Staff will be asked to log in first if needed, then the guest will be checked in automatically if they have permission.
                </p>
              </div>

              <div className="w-full rounded-2xl border border-border bg-background p-5 mb-5 text-sm text-text-muted space-y-3">
                <p className="font-semibold text-text-main">Recommended event-day flow</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Use any QR code scanner app or native phone camera.</li>
                  <li>Open the scanned link in the browser.</li>
                  <li>If the scanner app only shows text, paste the token or full check-in link below.</li>
                  <li>Verify the guest and continue with the line moving.</li>
                </ol>
              </div>

              <div className="w-full relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4 text-center">Enter token or scanned link</p>
                <form onSubmit={handleQRSubmit} className="flex flex-col gap-3 items-stretch">
                  <Input value={qrToken} onValueChange={setQrToken} placeholder="Paste token or guest check-in link" variant="bordered" className="w-full" />
                  <Button type="submit" color="primary" className="font-semibold rounded-full px-6 w-full sm:w-full">Verify</Button>
                </form>
                {message && <div className={`mt-4 p-4 text-sm font-medium text-center rounded-xl ${message.type === 'success' ? 'bg-primary-light text-primary border border-primary/20' : 'bg-red-light text-red border border-red/20'}`}>{message.text}</div>}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-surface border border-border rounded-2xl shadow-[var(--shadow-card)] flex flex-col min-h-[420px] xl:min-h-[600px]">
          <CardBody className="p-0 flex flex-col h-full">
            <div className="p-6 border-b border-border">
              <h3 className="font-display text-2xl text-text-main mb-4">Guest List</h3>
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                variant="bordered"
                startContent={<span className="material-symbols-outlined text-text-subtle">search</span>}
              />
            </div>
            <div className="px-6 py-4 border-b border-border bg-background/40 flex items-center justify-between gap-3 text-sm">
              <span className="text-text-muted">{checkedInCount} of {guests.length} guests checked in</span>
              <span className="text-text-subtle">{filteredGuests.length} shown</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredGuests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between gap-3 p-4 border border-border rounded-xl hover:border-primary/30 transition-all bg-background/50">
                  <div className="min-w-0">
                    <p className="font-semibold text-text-main truncate">{guest.full_name}</p>
                    <p className="text-xs text-text-muted mt-1 truncate">{guest.attendance_status} {guest.plus_ones && guest.plus_ones > 0 ? `• +${guest.plus_ones} Guests` : ''}</p>
                  </div>
                  <Button
                    isLoading={busyGuestId === guest.id}
                    onPress={() => handleManualCheckIn(guest.id, Boolean(guest.checked_in), guest.full_name)}
                    color={guest.checked_in ? 'success' : 'primary'}
                    variant={guest.checked_in ? 'flat' : 'solid'}
                    className="text-xs font-semibold rounded-full shrink-0"
                  >
                    {guest.checked_in ? 'Checked In' : 'Check In'}
                  </Button>
                </div>
              ))}

              {filteredGuests.length === 0 && (
                <div className="text-center py-12 text-text-muted">
                  <span className="material-symbols-outlined text-4xl text-text-subtle/30 mb-2">search_off</span>
                  <p>No guests found matching your search.</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
