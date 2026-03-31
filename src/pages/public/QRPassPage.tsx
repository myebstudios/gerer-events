import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { resolveTemplateTone } from '../../lib/catalog';
import { sanitizeId } from '../../lib/id';
import { format } from 'date-fns';
import { toPng } from 'html-to-image';
import { supabase } from '../../lib/supabase';

export default function QRPassPage() {
  const { id, guestId } = useParams();
  const safeEventId = sanitizeId(id);
  const [event, setEvent] = React.useState<any>(null);
  const [guest, setGuest] = React.useState<any>(null);
  const ticketRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const run = async () => {
      if (!safeEventId || !guestId) return;
      const [{ data: guestData }, { data: eventData }] = await Promise.all([
        supabase.from('guests').select('*').eq('id', guestId).maybeSingle(),
        supabase.from('events').select('*').eq('id', safeEventId).maybeSingle(),
      ]);
      setGuest(guestData);
      setEvent(eventData);
    };
    run();
  }, [safeEventId, guestId]);

  if (!safeEventId) return <div className="p-8 text-text-muted font-medium">Invalid event link.</div>;
  if (!guest || !event) return <div className="flex h-screen items-center justify-center bg-background"><div className="animate-pulse text-text-muted font-medium">Loading...</div></div>;

  const template = resolveTemplateTone(event.template_id);
  const templateStyles = {
    minimal: { bg: 'bg-background', text: 'text-text-main', accent: 'bg-primary text-white hover:bg-primary-hover rounded-full shadow-sm', secondary: 'bg-surface border border-border text-text-main hover:bg-background rounded-full', font: 'font-sans', card: 'bg-surface border border-border rounded-3xl shadow-[var(--shadow-elevated)]', cardHeader: 'bg-background border-b border-border', qrBg: 'bg-white', cutout: 'bg-background' },
    playful: { bg: 'bg-accent', text: 'text-text-main', accent: 'bg-orange text-white hover:bg-orange/90 rounded-full shadow-lg', secondary: 'bg-white border-2 border-text-main text-text-main hover:bg-gray-50 rounded-full', font: 'font-display', card: 'bg-white border-4 border-text-main rounded-[2rem] shadow-[8px_8px_0px_0px_#1A1A2E]', cardHeader: 'bg-accent-light border-b-4 border-dashed border-text-main', qrBg: 'bg-white', cutout: 'bg-accent' },
    elegant: { bg: 'bg-black', text: 'text-white', accent: 'bg-accent text-text-main hover:bg-accent-hover rounded-full tracking-widest uppercase shadow-md', secondary: 'border border-accent text-accent hover:bg-accent/10 rounded-full tracking-widest uppercase', font: 'font-display', card: 'bg-[#1F2937] border border-accent/30 rounded-2xl', cardHeader: 'bg-text-main border-b border-accent/30', qrBg: 'bg-white p-4', cutout: 'bg-black' }
  } as const;
  const styles = templateStyles[template] || templateStyles.minimal;

  const generateGoogleCalendarUrl = (evt: any) => {
    const title = encodeURIComponent(evt.title);
    const details = encodeURIComponent(evt.description || '');
    const location = encodeURIComponent(evt.location || '');
    const startDate = new Date(evt.starts_at);
    const formatDateForGoogle = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const start = formatDateForGoogle(startDate);
    const endDate = evt.ends_at ? new Date(evt.ends_at) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const end = formatDateForGoogle(endDate);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  const generateICS = (evt: any) => {
    const startDate = new Date(evt.starts_at);
    const endDate = evt.ends_at ? new Date(evt.ends_at) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const formatDateForICS = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nURL:${window.location.href}\nDTSTART:${formatDateForICS(startDate)}\nDTEND:${formatDateForICS(endDate)}\nSUMMARY:${evt.title}\nDESCRIPTION:${evt.description || ''}\nLOCATION:${evt.location || ''}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${evt.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToDevice = async () => {
    if (!ticketRef.current) return;
    try {
      const dataUrl = await toPng(ticketRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `EventPass_${event.title.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate pass image', err);
    }
  };

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden ${styles.bg} ${styles.text} ${styles.font}`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8"><Link to={`/e/${safeEventId}`} className="hover:opacity-70 text-sm font-semibold flex items-center justify-center gap-2 mb-6 transition-colors w-fit mx-auto"><span className="material-symbols-outlined text-sm">arrow_back</span> Back to Event</Link><h1 className="text-3xl md:text-4xl mb-2 font-bold">Your Event Pass</h1><p className="opacity-70 font-medium">Please present this QR code upon arrival.</p></div>
        <div ref={ticketRef} className={`overflow-hidden relative ${styles.card}`}>
          <div className={`p-8 text-center relative ${styles.cardHeader}`}><div className={`absolute -bottom-4 -left-4 w-8 h-8 rounded-full ${styles.cutout}`}></div><div className={`absolute -bottom-4 -right-4 w-8 h-8 rounded-full ${styles.cutout}`}></div><p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-70">Admit One</p><h2 className="text-3xl mb-1 font-bold">{event.title}</h2><p className="text-sm opacity-80">{format(new Date(event.starts_at), 'MMMM do, yyyy • h:mm a')}</p></div>
          <div className="p-8 flex flex-col items-center relative">
            <div className="w-full mb-8"><div className="flex justify-between items-end mb-4"><div><p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Guest</p><h3 className="text-2xl font-bold">{guest.full_name}</h3></div><div className="text-right"><p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Status</p><p className="text-xl capitalize font-bold">{guest.attendance_status}</p></div></div>{guest.plus_ones > 0 && <div className="mt-4 pt-4 border-t border-current/10"><p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Additional Guests</p><p className="text-xl font-bold">+{guest.plus_ones}</p></div>}</div>
            <div className={`rounded-2xl shadow-sm border border-current/10 mb-6 p-4 ${styles.qrBg}`}><QRCodeSVG value={guest.qr_token} size={220} bgColor="#ffffff" fgColor="#000000" level="H" includeMargin={false} /></div>
            <p className="text-xs font-mono tracking-widest uppercase opacity-50">{String(guest.qr_token).substring(0, 16)}...</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <button onClick={() => window.print()} className={`w-full transition-all px-8 py-4 font-semibold flex items-center justify-center gap-2 ${styles.accent}`}><span className="material-symbols-outlined text-lg">print</span> Print Pass</button>
          <div className="grid grid-cols-2 gap-3 w-full">
            <a href={generateGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={`w-full transition-all px-4 py-4 font-semibold flex items-center justify-center gap-2 text-sm text-center ${styles.secondary}`}><span className="material-symbols-outlined text-base">calendar_month</span> Google Cal</a>
            <button onClick={() => generateICS(event)} className={`w-full transition-all px-4 py-4 font-semibold flex items-center justify-center gap-2 text-sm text-center ${styles.secondary}`}><span className="material-symbols-outlined text-base">event</span> Apple/Outlook</button>
          </div>
          <button onClick={handleSaveToDevice} className={`w-full transition-all px-8 py-4 font-semibold flex items-center justify-center gap-2 ${styles.secondary}`}><span className="material-symbols-outlined text-lg">download</span> Save to Device</button>
        </div>
      </motion.div>
    </div>
  );
}
