import * as React from 'react';
import { fetchAdminAuditLogs } from '../../lib/adminAudit';

export default function AdminAuditPage() {
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    const load = async () => {
      const data = await fetchAdminAuditLogs();
      setLogs(data);
      setLoading(false);
    };
    void load();
  }, []);

  const filtered = logs.filter((log) => `${log.action} ${JSON.stringify(log.details || {})}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Admin audit log</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-black">Trace sensitive admin actions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">Review who changed contracts, access, and event states. This is where future-you goes when present-you swears they did nothing.</p>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter audit actions" className="w-full lg:w-80 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black" />
      </div>

      <div className="rounded-[32px] border border-gray-200 bg-white shadow-sm">
        {loading ? <div className="p-8 text-gray-500 font-medium">Loading audit log...</div> : (
          <div className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="font-semibold text-black">{log.action}</p>
                  <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                </div>
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">{JSON.stringify(log.details || {}, null, 2)}</pre>
              </div>
            ))}
            {filtered.length === 0 && <div className="p-8 text-gray-500 font-medium">No audit logs match this filter.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
