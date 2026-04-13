import * as React from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

const accessTierOptions = ['free', 'pro', 'agency'];
const contractStatusOptions = ['inactive', 'pending_contract', 'active_contract', 'expired_contract'];
const roleOptions = ['user', 'admin'];

export default function AdminUsersPage() {
  const { pushToast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<any[]>([]);
  const [query, setQuery] = React.useState('');

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, access_tier, contract_status, role, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      pushToast(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  React.useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const updateUser = async (id: string, patch: Record<string, string>) => {
    setSavingId(id);
    try {
      const { error } = await supabase.from('profiles').update(patch).eq('id', id);
      if (error) throw error;
      setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...patch } : user)));
      pushToast('User updated.', 'success');
    } catch (error: any) {
      pushToast(error.message || 'Failed to update user', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const hay = `${user.full_name || ''} ${user.email || ''} ${user.access_tier || ''} ${user.contract_status || ''}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Admin users</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-black">Manage user access</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">Search profiles, promote accounts, update contract states, and decide who gets admin access.</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, tier, or contract status"
          className="w-full lg:w-96 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
        />
      </div>

      <div className="rounded-[32px] border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-gray-500 font-medium">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-[0.18em] text-gray-400">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Access tier</th>
                  <th className="px-6 py-4">Contract</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100 align-top">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-black">{user.full_name || 'Unnamed user'}</p>
                      <p className="text-gray-500">{user.email || 'No email'}</p>
                      <p className="mt-1 text-[11px] text-gray-400">{user.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.access_tier || 'free'}
                        disabled={savingId === user.id}
                        onChange={(e) => void updateUser(user.id, { access_tier: e.target.value })}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                      >
                        {accessTierOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.contract_status || 'inactive'}
                        disabled={savingId === user.id}
                        onChange={(e) => void updateUser(user.id, { contract_status: e.target.value })}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                      >
                        {contractStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role || 'user'}
                        disabled={savingId === user.id}
                        onChange={(e) => void updateUser(user.id, { role: e.target.value })}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                      >
                        {roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
