import * as React from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

const contractStatusOptions = ['inactive', 'pending_contract', 'active_contract', 'expired_contract'];
const accessTierMap: Record<string, string> = {
  inactive: 'free',
  pending_contract: 'pro',
  active_contract: 'pro',
  expired_contract: 'free',
};

export default function AdminContractsPage() {
  const { pushToast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [profiles, setProfiles] = React.useState<any[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, access_tier, contract_status, role, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      pushToast(error.message || 'Failed to load contracts', 'error');
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const updateContract = async (profile: any, status: string) => {
    setSavingId(profile.id);
    try {
      const patch = {
        contract_status: status,
        access_tier: accessTierMap[status] || profile.access_tier || 'free',
      };
      const { error } = await supabase.from('profiles').update(patch).eq('id', profile.id);
      if (error) throw error;
      setProfiles((current) => current.map((item) => (item.id === profile.id ? { ...item, ...patch } : item)));
      pushToast('Contract updated.', 'success');
    } catch (error: any) {
      pushToast(error.message || 'Failed to update contract', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const grouped = {
    pending: profiles.filter((p) => p.contract_status === 'pending_contract'),
    active: profiles.filter((p) => p.contract_status === 'active_contract'),
    expired: profiles.filter((p) => p.contract_status === 'expired_contract'),
    inactive: profiles.filter((p) => !p.contract_status || p.contract_status === 'inactive'),
  };

  const renderCard = (profile: any) => (
    <div key={profile.id} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
      <p className="font-semibold text-black">{profile.full_name || 'Unnamed user'}</p>
      <p className="mt-1 text-sm text-gray-500">{profile.email || 'No email'}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
        <span className="rounded-full bg-gray-100 px-3 py-1">{profile.access_tier || 'free'}</span>
        <span className="rounded-full bg-black px-3 py-1 text-white">{profile.contract_status || 'inactive'}</span>
      </div>
      <div className="mt-4">
        <select
          value={profile.contract_status || 'inactive'}
          disabled={savingId === profile.id}
          onChange={(e) => void updateContract(profile, e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-black"
        >
          {contractStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Admin contracts</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-black">Contract pipeline</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">Approve pending contract requests, activate access, expire contracts, and keep tiers aligned with the current commercial model.</p>
      </div>

      {loading ? (
        <div className="text-gray-500 font-medium">Loading contracts...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-4">
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
          <section>
            <h2 className="mb-4 font-display text-2xl text-black">Inactive</h2>
            <div className="space-y-4">{grouped.inactive.length ? grouped.inactive.slice(0, 12).map(renderCard) : <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">No inactive accounts.</div>}</div>
          </section>
        </div>
      )}
    </div>
  );
}
