import * as React from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

export default function AdminContractsPage() {
  const { pushToast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [profiles, setProfiles] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, access_tier, contract_status, role, created_at')
          .in('contract_status', ['pending_contract', 'active_contract', 'expired_contract'])
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProfiles(data || []);
      } catch (error: any) {
        pushToast(error.message || 'Failed to load contracts', 'error');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [pushToast]);

  const grouped = {
    pending: profiles.filter((p) => p.contract_status === 'pending_contract'),
    active: profiles.filter((p) => p.contract_status === 'active_contract'),
    expired: profiles.filter((p) => p.contract_status === 'expired_contract'),
  };

  const renderCard = (profile: any) => (
    <div key={profile.id} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
      <p className="font-semibold text-black">{profile.full_name || 'Unnamed user'}</p>
      <p className="mt-1 text-sm text-gray-500">{profile.email || 'No email'}</p>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
        <span className="rounded-full bg-gray-100 px-3 py-1">{profile.access_tier || 'free'}</span>
        <span className="rounded-full bg-black px-3 py-1 text-white">{profile.contract_status}</span>
      </div>
    </div>
  );

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Admin contracts</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-black">Contract pipeline</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">Keep an eye on who is waiting for contract access, who is active, and who has expired access that may need follow-up.</p>
      </div>

      {loading ? (
        <div className="text-gray-500 font-medium">Loading contracts...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <section>
            <h2 className="mb-4 font-display text-2xl text-black">Pending</h2>
            <div className="space-y-4">{grouped.pending.length ? grouped.pending.map(renderCard) : <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">No pending contracts.</div>}</div>
          </section>
          <section>
            <h2 className="mb-4 font-display text-2xl text-black">Active</h2>
            <div className="space-y-4">{grouped.active.length ? grouped.active.map(renderCard) : <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">No active contracts.</div>}</div>
          </section>
          <section>
            <h2 className="mb-4 font-display text-2xl text-black">Expired</h2>
            <div className="space-y-4">{grouped.expired.length ? grouped.expired.map(renderCard) : <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">No expired contracts.</div>}</div>
          </section>
        </div>
      )}
    </div>
  );
}
