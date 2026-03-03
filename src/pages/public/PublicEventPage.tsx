import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion } from 'framer-motion';
import { TEMPLATE_CATALOG } from '../../lib/catalog';
import { sanitizeId, getStoredUserId } from '../../lib/id';

const safeFormat = (dateStr: string, endDateStr?: string, fallback = 'TBD') => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    const start = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (endDateStr) {
      const e = new Date(endDateStr);
      if (!isNaN(e.getTime())) {
        const end = e.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        // if same day, just return start
        if (start === end) return start;
        return `${start} - ${end}`;
      }
    }
    return start;
  } catch { return fallback; }
};

const safeFormatShort = (dateStr: string, endDateStr?: string, fallback = '') => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    const start = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    if (endDateStr) {
      const e = new Date(endDateStr);
      if (!isNaN(e.getTime())) {
        const end = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        if (start === end) return start;
        return `${start} - ${end}`;
      }
    }
    return start;
  } catch { return fallback; }
};

const safeFormatTime = (dateStr: string, endDateStr?: string, fallback = '') => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    const start = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    if (endDateStr) {
      const e = new Date(endDateStr);
      if (!isNaN(e.getTime())) {
        const end = e.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        return `${start} - ${end}`;
      }
    }
    return start;
  } catch { return fallback; }
};

const FONT_FAMILIES: Record<string, string> = {
  modern: "'Inter', 'Helvetica Neue', sans-serif",
  classic: "Georgia, 'Times New Roman', serif",
  playful: "'CabinetGrotesk-Variable', 'Outfit', sans-serif",
};

export default function PublicEventPage() {
  const { id } = useParams();
  const safeEventId = sanitizeId(id);

  if (!safeEventId) return <div className="p-8 text-text-muted font-medium">Invalid event link.</div>;
  const event = useQuery((api as any).events.getEvent, safeEventId ? { eventId: safeEventId } : 'skip');

  if (event === undefined) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="animate-pulse text-text-muted font-medium">Loading...</div>
    </div>
  );
  if (!event) return (
    <div className="flex h-screen items-center justify-center bg-background text-text-muted font-medium">
      Event not found
    </div>
  );

  // Resolve themeColor: try localStorage first (organizer's saved custom color),
  // then event field, then fall back to template catalog color.
  const catalogTemplate = TEMPLATE_CATALOG.find(t => t.id === event.templateId);
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem(`appearance_${event._id}`) || '{}'); } catch { return {}; }
  })();
  const themeColor: string = stored.themeColor || event.themeColor || catalogTemplate?.color || '#18181B';
  const typographyPreset: string = stored.typographyPreset || event.typographyPreset || 'modern';
  const fontFamily = FONT_FAMILIES[typographyPreset] || FONT_FAMILIES.modern;

  // Determine if we need a light or dark text colour on the accent background
  const hex = themeColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const accentText = luminance > 0.55 ? '#000000' : '#ffffff';

  return (
    <div
      className="antialiased overflow-x-hidden min-h-screen flex flex-col bg-white"
      style={{ fontFamily }}
    >
      {/* ── HERO ────────────────────────────────────────────────── */}
      <div
        className="relative min-h-[60vh] flex items-end justify-center overflow-hidden"
        style={{ backgroundColor: themeColor }}
      >
        {event.coverImageUrl && (
          <div className="absolute inset-0 z-0">
            <img
              alt={event.title}
              className="w-full h-full object-cover"
              src={event.coverImageUrl}
              style={{ opacity: 0.5 }}
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 20%, ${themeColor}cc)` }} />
          </div>
        )}

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pb-20 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm md:text-base uppercase tracking-widest mb-6 font-bold" style={{ color: accentText, opacity: 0.75 }}>
              You are invited
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight font-bold" style={{ color: accentText }}>
              {event.title}
            </h1>
            <p className="text-xl md:text-2xl font-medium" style={{ color: accentText, opacity: 0.9 }}>
              {safeFormatShort(event.date, event.endDate)}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── DETAILS CARD ────────────────────────────────────────── */}
      <div className="flex-1 relative py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-gray-100 rounded-3xl shadow-2xl p-8 md:p-12 text-center relative z-10 -mt-16"
        >
          <h2 className="text-3xl md:text-4xl mb-12 font-bold text-gray-900">The Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <span className="material-symbols-outlined text-4xl mb-4" style={{ color: themeColor, opacity: 0.8 }}>schedule</span>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">When</h3>
              <p className="text-xl font-semibold text-gray-900 mb-1">{safeFormat(event.date, event.endDate)}</p>
              <p className="text-gray-500">{safeFormatTime(event.date, event.endDate)}</p>
            </div>
            <div>
              <span className="material-symbols-outlined text-4xl mb-4" style={{ color: themeColor, opacity: 0.8 }}>location_on</span>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Where</h3>
              <p className="text-xl font-semibold text-gray-900 mb-1">{event.location}</p>
            </div>
          </div>

          {event.description && (
            <div className="mb-12 max-w-2xl mx-auto">
              <div className="h-px w-24 mx-auto mb-8" style={{ backgroundColor: themeColor, opacity: 0.25 }}></div>
              <p className="leading-relaxed text-lg text-gray-600">{event.description}</p>
              <div className="h-px w-24 mx-auto mt-8" style={{ backgroundColor: themeColor, opacity: 0.25 }}></div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Link
              to={`/e/${event._id}/rsvp`}
              className="transition-all px-10 py-4 font-semibold w-full sm:w-auto text-center rounded-full shadow-lg hover:opacity-90"
              style={{ backgroundColor: themeColor, color: accentText }}
            >
              RSVP Now
            </Link>
            <Link
              to={`/e/${event._id}/upload`}
              className="transition-all px-10 py-4 font-semibold w-full sm:w-auto text-center rounded-full border-2 hover:opacity-80"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              Upload Memories
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
