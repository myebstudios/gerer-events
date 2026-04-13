import * as React from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminAuditLogs, getAuditActionLabel } from '../../lib/adminAudit';

export default function AdminAuditPage() {
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [query, setQuery] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState('all');

  React.useEffect(() => {
    const load = async () => {
      const data = await fetchAdminAuditLogs();
      setLogs(data);
      setLoading(false);
    };
    void load();
  }, []);

  const actionOptions = ['all', ...Array.from(new Set(logs.map((log) => String(log.action))))];

  const filtered = logs.filter((log) => {
    const hay = [
      log.action,
      log.admin_profile?.full_name,
      log.admin_profile?.email,
      log.target_profile?.full_name,
      log.target_profile?.email,
      log.target_event?.title,
      JSON.stringify(log.details || {}),
    ].join(' ').toLowerCase();

    const matchesQuery = hay.includes(query.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesQuery && matchesAction;
  });

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Admin audit log</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-black">Trace sensitive admin actions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">Readable actor, readable target, filterable action trail. Finally, a log for humans.</p>
        </div>
        <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search actor, target, event, or details" className="w-full xl:w-80 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black" />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black">
            {actionOptions.map((option) => { const label = String(option); return <option key={label} value={label}>{label === 'all' ? 'All actions' : getAuditActionLabel(label)}</option>; })}
          </select>
        </div>
      </div>

      <div className="rounded-[32px] border border-gray-200 bg-white shadow-sm">
        {loading ? <div className="p-8 text-gray-500 font-medium">Loading audit log...</div> : (
          <div className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="font-semibold text-black">{getAuditActionLabel(log.action)}</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold text-black">Actor:</span>{' '}
                        {log.admin_profile?.full_name || log.admin_profile?.email || log.admin_user_id}
                      </p>
                      {log.target_profile && (
                        <p>
                          <span className="font-semibold text-black">User target:</span>{' '}
                          <Link to="/admin/users" className="underline decoration-gray-300 underline-offset-4 hover:text-black">
                            {log.target_profile.full_name || log.target_profile.email || log.target_user_id}
                          </Link>
                        </p>
                      )}
                      {log.target_event && (
                        <p>
                          <span className="font-semibold text-black">Event target:</span>{' '}
                          <Link to="/admin/events" className="underline decoration-gray-300 underline-offset-4 hover:text-black">
                            {log.target_event.title}
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                </div>
                {log.details && (
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">{JSON.stringify(log.details, null, 2)}</pre>
                )}
              </div>
            ))}
            {filtered.length === 0 && <div className="p-8 text-gray-500 font-medium">No audit logs match this filter.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
