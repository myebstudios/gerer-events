import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Spinner } from '@heroui/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AcceptInvitePage() {
  const query = useQuery();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [state, setState] = React.useState<'loading' | 'success' | 'invalid' | 'error'>('loading');
  const [message, setMessage] = React.useState('Validating invite...');
  const [eventId, setEventId] = React.useState<string>('');

  const token = query.get('token') || '';

  React.useEffect(() => {
    if (loading) return;

    if (!token) {
      setState('invalid');
      setMessage('This invite link is missing its token.');
      return;
    }

    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      return;
    }

    const run = async () => {
      try {
        const { data, error } = await supabase.rpc('accept_event_invite', { token });
        if (error) throw error;
        setEventId(data);
        setState('success');
        setMessage('Invite accepted. You now have access to this event.');
      } catch (error: any) {
        const text = error.message || 'Unable to accept this invite.';
        if (/not found|valid|different email/i.test(text)) {
          setState('invalid');
        } else {
          setState('error');
        }
        setMessage(text);
      }
    };

    void run();
  }, [token, user, loading, navigate, location.pathname, location.search]);

  const tone = {
    loading: 'border-border text-text-muted',
    success: 'border-primary/20 text-primary bg-primary-light',
    invalid: 'border-red-200 text-red bg-red-light',
    error: 'border-red-200 text-red bg-red-light',
  } as const;

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-xl bg-surface border border-border rounded-3xl shadow-[var(--shadow-elevated)]">
        <CardBody className="p-8 sm:p-10 text-center">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-text-subtle font-semibold mb-3">Event Invite</p>
            <h1 className="font-display text-3xl text-text-main mb-2">Join Event Team</h1>
            <p className="text-text-muted">Accept access to collaborate on this event.</p>
          </div>

          <div className={`rounded-2xl border p-6 ${tone[state]}`}>
            {state === 'loading' && <div className="flex items-center justify-center gap-3"><Spinner size="sm" /> <span>{message}</span></div>}
            {state !== 'loading' && <p className="text-base font-medium">{message}</p>}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {eventId && <Button as={Link as any} to={`/dashboard/events/${eventId}`} color="primary" className="rounded-full font-semibold">Open Event</Button>}
            <Button as={Link as any} to="/dashboard" variant="bordered" className="rounded-full font-semibold">Go to Dashboard</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
