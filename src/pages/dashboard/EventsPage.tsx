import * as React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';

export default function EventsPage() {
  const userId = localStorage.getItem('userId');
  const events = useQuery((api as any).events.getEvents, userId ? { hostId: userId } : "skip");
  const stats = useQuery((api as any).events.getDashboardStats, userId ? { hostId: userId } : "skip");

  if (events === undefined || stats === undefined) return <div className="p-8">Loading events...</div>;

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-espresso mb-2">Dashboard</h1>
          <p className="text-clay">Welcome back. Here's an overview of your events.</p>
        </div>
        <Link to="/dashboard/events/new" className="bg-espresso text-gold hover:bg-cocoa transition-all px-6 py-3 text-sm font-bold tracking-widest uppercase inline-flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span>
          Create Event
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-ivory p-6 border border-gold/20 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold">
              <span className="material-symbols-outlined">event</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-clay">Total Events</p>
              <h3 className="font-serif text-3xl text-espresso">{stats.totalEvents}</h3>
            </div>
          </div>
        </div>
        <div className="bg-ivory p-6 border border-gold/20 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-clay">Total Guests</p>
              <h3 className="font-serif text-3xl text-espresso">{stats.totalGuests}</h3>
            </div>
          </div>
        </div>
        <div className="bg-ivory p-6 border border-gold/20 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold">
              <span className="material-symbols-outlined">how_to_reg</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-clay">Total RSVPs</p>
              <h3 className="font-serif text-3xl text-espresso">{stats.totalRSVPs}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-serif text-2xl text-espresso">Recent Events</h2>
        <button className="text-sm font-bold uppercase tracking-widest text-gold hover:text-clay transition-colors flex items-center gap-1">
          View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-ivory border border-dashed border-gold/40 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-gold mb-4">calendar_month</span>
          <h3 className="font-serif text-xl text-espresso mb-2">No events found</h3>
          <p className="text-clay mb-6">You haven't created any events yet.</p>
          <Link to="/dashboard/events/new" className="bg-gold text-espresso hover:bg-[#b09358] transition-all px-6 py-2 text-sm font-bold tracking-widest uppercase inline-block">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: any) => (
            <Link key={event._id} to={`/dashboard/events/${event._id}`} className="group block">
              <div className="bg-ivory border border-gold/20 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] relative overflow-hidden bg-espresso/5">
                  {event.coverImageUrl ? (
                    <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-gold/30">image</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-ivory/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-widest text-espresso">
                    {event.status}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-clay text-sm mb-3">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {format(new Date(event.date), 'MMMM d, yyyy')}
                  </div>
                  <h3 className="font-serif text-2xl text-espresso mb-2 group-hover:text-gold transition-colors">{event.title}</h3>
                  <p className="text-espresso/60 text-sm line-clamp-2 mb-4">{event.description}</p>
                  <div className="flex items-center justify-between border-t border-gold/10 pt-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-espresso/70">
                      <span className="material-symbols-outlined text-gold text-sm">location_on</span>
                      <span className="truncate max-w-[150px]">{event.location}</span>
                    </div>
                    <span className="material-symbols-outlined text-gold group-hover:translate-x-1 transition-transform">arrow_forward</span>
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


