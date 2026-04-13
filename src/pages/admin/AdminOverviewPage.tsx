import * as React from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminOverview } from '../../lib/admin';

export default function AdminOverviewPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchAdminOverview();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load admin overview');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <div className="p-10 text-gray-500 font-medium">Loading admin overview...</div>;
  if (error) return <div className="p-10 text-red-500 font-medium">{error}</div>;

  const statCards = [
    { label: 'Total users', value: data.totals.users },
    { label: 'Total events', value: data.totals.events },
    { label: 'Total guests', value: data.totals.guests },
    { label: 'Checked-ins', value: data.totals.checkedIns },
    { label: 'Active contracts', value: data.totals.activeContracts },
    { label: 'Pending contracts', value: data.totals.pendingContracts },
  ];

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Admin overview</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-black">Platform control room</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">See the health of the platform, track contracts, and jump into users or events without guessing where the fire is.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">{card.label}</p>
            <h2 className="mt-3 font-display text-4xl text-black">{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl text-black">Recent users</h2>
              <p className="text-sm text-gray-500">Newest profiles and contract states.</p>
            </div>
            <Link to="/admin/users" className="text-sm font-semibold text-black hover:text-gray-600">View all</Link>
          </div>
          <div className="space-y-4">
            {data.profiles.map((profile: any) => (
              <div key={profile.id} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-black">{profile.full_name || 'Unnamed user'}</p>
                  <p className="text-sm text-gray-500">{profile.email || 'No email'}</p>
                </div>
                <div className="text-right text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  <p>{profile.access_tier || 'free'}</p>
                  <p className="mt-1">{profile.contract_status || 'inactive'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-black">Recent events</h2>
                <p className="text-sm text-gray-500">Latest created events on the platform.</p>
              </div>
              <Link to="/admin/events" className="text-sm font-semibold text-black hover:text-gray-600">View all</Link>
            </div>
            <div className="space-y-4">
              {data.events.map((event: any) => (
                <div key={event.id} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-black">{event.title}</p>
                    <span className="rounded-full bg-black px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">{event.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{event.location || 'No location'}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl text-black">Operational notes</h2>
            <div className="mt-5 space-y-3 text-sm text-gray-600">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">Use the next admin pages to manage contract upgrades, inspect event health, and review user access without touching organizer UX.</div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">Phase 1 is intentionally restrained: overview first, then users, contracts, and full event management.</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
