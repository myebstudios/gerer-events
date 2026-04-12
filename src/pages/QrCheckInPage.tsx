import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Spinner } from '@heroui/react';
import { supabase } from '../lib/supabase';
import { getEventRole, canCheckInWithRole, type EventRole } from '../lib/eventAccess';
import { useAuth } from '../contexts/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function QrCheckInPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [state, setState] = React.useState<'loading' | 'success' | 'already' | 'invalid' | 'forbidden' | 'error'>('loading');
  const [message, setMessage] = React.useState('Checking guest access...');
  const [eventTitle, setEventTitle] = React.useState<string>('Event');
  const [guestName, setGuestName] = React.useState<string>('Guest');
  const [role, setRole] = React.useState<EventRole>(null);

  const token = query.get('token') || '';
  const eventId = query.get('eventId') || '';
  const guestId = query.get('guestId') || '';

  React.useEffect(() => {
    if (loading) return;
    if (!token || !eventId || !guestId) {
      setState('invalid');
      setMessage('This check-in link is incomplete or invalid.');
      return;
    }

    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      return;
    }

    const run = async () => {
      try {
        const accessRole = await getEventRole(eventId);
        setRole(accessRole);

        if (!canCheckInWithRole(accessRole)) {
          setState('forbidden');
          setMessage('You do not have check-in permission for this event.');
          return;
        }

        const { data: guest, error: guestError } = await supabase
          .from('guests')
          .select('id, full_name, checked_in, qr_token, event_id, events(title)')
          .eq('id', guestId)
          .eq('event_id', eventId)
          .maybeSingle();

        if (guestError) throw guestError;
        if (!guest || guest.qr_token !== token) {
          setState('invalid');
          setMessage('This QR code is invalid or no longer matches a guest pass.');
          return;
        }

        setGuestName(guest.full_name || 'Guest');
        setEventTitle((guest as any).events?.title || 'Event');

        if (guest.checked_in) {
          setState('already');
          setMessage(`${guest.full_name} has already been checked in.`);
          return;
        }

        const { error: updateError } = await supabase
          .from('guests')
          .update({ checked_in: true, checked_in_at: new Date().toISOString() })
          .eq('id', guest.id)
          .eq('event_id', eventId);

        if (updateError) throw updateError;

        setState('success');
        setMessage(`${guest.full_name} is now checked in.`);
      } catch (error: any) {
        setState('error');
        setMessage(error.message || 'Unable to complete check-in.');
      }
    };

    void run();
  }, [token, eventId, guestId, user, loading, navigate, location.pathname, location.search]);

  const tone = {
    loading: 'border-border text-text-muted',
    success: 'border-primary/20 text-primary bg-primary-light',
    already: 'border-amber-200 text-amber-700 bg-amber-50',
    invalid: 'border-red-200 text-red bg-red-light',
    forbidden: 'border-red-200 text-red bg-red-light',
    error: 'border-red-200 text-red bg-red-light',
  } as const;

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-xl bg-surface border border-border rounded-3xl shadow-[var(--shadow-elevated)]">
        <CardBody className="p-8 sm:p-10 text-center">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-text-subtle font-semibold mb-3">QR Check-in</p>
            <h1 className="font-display text-3xl text-text-main mb-2">{eventTitle}</h1>
            <p className="text-text-muted">Guest: {guestName}</p>
            {role && <p className="text-xs text-text-subtle mt-2">Signed in as: {role}</p>}
          </div>

          <div className={`rounded-2xl border p-6 ${tone[state]}`}>
            {state === 'loading' && <div className="flex items-center justify-center gap-3"><Spinner size="sm" /> <span>{message}</span></div>}
            {state !== 'loading' && <p className="text-base font-medium">{message}</p>}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button as={Link as any} to={`/dashboard/events/${eventId}/checkin`} color="primary" className="rounded-full font-semibold">
              Open Event Check-in
            </Button>
            <Button as={Link as any} to="/dashboard" variant="bordered" className="rounded-full font-semibold">
              Go to Dashboard
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
