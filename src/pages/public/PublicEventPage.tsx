import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function PublicEventPage() {
  const { id } = useParams();
  const event = useQuery((api as any).events.getEvent, id ? { eventId: id } : "skip");

  if (event === undefined) return <div className="flex h-screen items-center justify-center bg-background">Loading...</div>;
  if (!event) return <div className="flex h-screen items-center justify-center bg-background">Event not found</div>;

  const template = event.templateId || 'minimal';

  // Template Styles
  const templateStyles = {
    minimal: {
      bg: 'bg-white',
      text: 'text-gray-900',
      accent: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      font: 'font-sans',
      hero: 'bg-gray-50',
      heroText: 'text-gray-900',
      card: 'bg-white border border-gray-200 rounded-2xl shadow-sm',
    },
    playful: {
      bg: 'bg-[#FFF9E6]',
      text: 'text-[#2D3748]',
      accent: 'bg-[#FF4F5A] text-white hover:bg-[#E03E48] rounded-full shadow-lg',
      secondary: 'bg-white border-2 border-[#FF4F5A] text-[#FF4F5A] hover:bg-[#FF4F5A]/10 rounded-full',
      font: 'font-display',
      hero: 'bg-[#FFC107]',
      heroText: 'text-[#2D3748]',
      card: 'bg-white border-4 border-[#2D3748] rounded-[2rem] shadow-[8px_8px_0px_0px_#2D3748]',
    },
    elegant: {
      bg: 'bg-[#111827]',
      text: 'text-[#F3F4F6]',
      accent: 'bg-[#D4AF37] text-[#111827] hover:bg-[#B5952F] rounded-none tracking-widest uppercase',
      secondary: 'border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-none tracking-widest uppercase',
      font: 'font-serif',
      hero: 'bg-[#000000]',
      heroText: 'text-[#D4AF37]',
      card: 'bg-[#1F2937] border border-[#D4AF37]/30 rounded-none',
    }
  };

  const styles = templateStyles[template] || templateStyles.minimal;

  return (
    <div className={`antialiased overflow-x-hidden min-h-screen flex flex-col ${styles.bg} ${styles.text} ${styles.font}`}>
      {/* Hero Section */}
      <div className={`relative min-h-[60vh] flex items-center justify-center overflow-hidden ${styles.hero}`}>
        {event.coverImageUrl && (
          <div className="absolute inset-0 z-0">
            <img alt={event.title} className="w-full h-full object-cover opacity-40" src={event.coverImageUrl} />
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-${styles.bg.replace('bg-', '')}`}></div>
          </div>
        )}
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className={`text-sm md:text-base uppercase tracking-widest mb-6 font-bold opacity-80 ${styles.heroText}`}>
              You are invited
            </p>
            <h1 className={`text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight font-bold ${styles.heroText}`}>
              {event.title}
            </h1>
            <p className={`text-xl md:text-2xl font-medium opacity-90 ${styles.heroText}`}>
              {format(new Date(event.date), 'MMMM do, yyyy')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex-1 relative py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`${styles.card} p-8 md:p-12 text-center relative z-10 -mt-32`}
        >
          <h2 className="text-3xl md:text-4xl mb-12 font-bold">The Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <span className="material-symbols-outlined text-4xl mb-4 opacity-70">schedule</span>
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-2">When</h3>
              <p className="text-xl font-semibold mb-1">{format(new Date(event.date), 'EEEE, MMMM do, yyyy')}</p>
              <p className="opacity-80">{format(new Date(event.date), 'h:mm a')}</p>
            </div>
            <div>
              <span className="material-symbols-outlined text-4xl mb-4 opacity-70">location_on</span>
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-2">Where</h3>
              <p className="text-xl font-semibold mb-1">{event.location}</p>
            </div>
          </div>

          {event.description && (
            <div className="mb-12 max-w-2xl mx-auto">
              <div className="h-px w-24 bg-current opacity-20 mx-auto mb-8"></div>
              <p className="leading-relaxed text-lg opacity-90">
                {event.description}
              </p>
              <div className="h-px w-24 bg-current opacity-20 mx-auto mt-8"></div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Link 
              to={`/e/${event._id}/rsvp`}
              className={`${styles.accent} transition-all px-10 py-4 font-bold w-full sm:w-auto text-center`}
            >
              RSVP Now
            </Link>
            <Link 
              to={`/e/${event._id}/upload`}
              className={`${styles.secondary} transition-all px-10 py-4 font-bold w-full sm:w-auto text-center`}
            >
              Upload Memories
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
