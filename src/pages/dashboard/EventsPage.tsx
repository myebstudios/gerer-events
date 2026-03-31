import * as React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardBody, Button } from '@heroui/react';
import { useSupabaseEvents, useSupabaseDashboardStats } from '../../hooks/useSupabaseEvents';

const safeFormatDate = (dateStr: string, fmt: string, fallback = 'TBD') => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return format(d, fmt);
  } catch { return fallback; }
};

export default function EventsPage() {
  const { events, loading, error } = useSupabaseEvents();
  const { stats } = useSupabaseDashboardStats();

  if (loading || !events) return <div className="p-8 text-text-muted font-medium">Loading events...</div>;
  if (error) return <div className="p-8 text-red-500 font-medium">{error}</div>;

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, icon: 'event', color: 'bg-primary/10 text-primary' },
    { label: 'Total Guests', value: stats.totalGuests, icon: 'group', color: 'bg-secondary/10 text-secondary' },
    { label: 'Total RSVPs', value: stats.totalRSVPs, icon: 'how_to_reg', color: 'bg-accent/10 text-amber-600' },
  ];

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-black mb-2 font-medium tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-[15px]">Welcome back. Here's an overview of your events.</p>
        </div>
        <Button as={Link as any} to="/dashboard/events/new" className="bg-[#18181B] text-white hover:bg-[#27272A] text-[15px] font-medium rounded-full px-6 py-5 shadow-sm transition-all" startContent={<span className="material-symbols-outlined text-lg">add</span>}>Create Event</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-white border border-gray-100 rounded-[24px] shadow-sm hover:shadow-md transition-shadow"><CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{stat.label}</p>
                <h3 className="font-display text-3xl text-black font-semibold mt-1">{stat.value}</h3>
              </div>
            </div>
          </CardBody></Card>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl text-black font-medium tracking-tight">Recent Events</h2>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">calendar_month</span>
          <h3 className="font-display text-xl text-black mb-2 font-medium">No events found</h3>
          <p className="text-gray-500 mb-6 text-[15px]">You haven't created any events yet.</p>
          <Button as={Link as any} to="/dashboard/events/new" className="bg-[#18181B] text-white hover:bg-[#27272A] font-medium rounded-full px-6 py-5">Create Your First Event</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => (
            <Link key={event.id} to={`/dashboard/events/${event.id}`} className="group block">
              <div className="bg-white border border-gray-100 rounded-[24px] overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                  {event.cover_image_url ? (
                    <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-black rounded-full shadow-sm">
                    {event.status}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-500 text-[13px] mb-2 font-medium">
                    <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                    {safeFormatDate(event.starts_at, 'MMMM d, yyyy')}
                  </div>
                  <h3 className="font-display text-xl text-black mb-2 group-hover:text-gray-600 transition-colors font-semibold tracking-tight leading-tight">{event.title}</h3>
                  <p className="text-gray-500 text-[15px] line-clamp-2 mb-4 leading-relaxed">{event.description}</p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                    <div className="flex items-center gap-2 text-[14px] text-gray-500">
                      <span className="material-symbols-outlined text-black text-[16px]">location_on</span>
                      <span className="truncate max-w-[150px] font-medium">{event.location}</span>
                    </div>
                    <span className="material-symbols-outlined text-black group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
