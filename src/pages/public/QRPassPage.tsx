import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { resolveTemplateTone } from '../../lib/catalog';
import { format } from 'date-fns';

export default function QRPassPage() {
  const { id, guestId } = useParams();
  
  const guest = useQuery((api as any).guests.getGuest, guestId ? { guestId } : "skip");
  const event = useQuery((api as any).events.getEvent, id ? { eventId: id } : "skip");

  if (guest === undefined || event === undefined) return <div className="flex h-screen items-center justify-center bg-background">Loading...</div>;
  if (!guest || !event) return <div className="flex h-screen items-center justify-center bg-background">Pass not found</div>;

  const template = resolveTemplateTone(event.templateId);

  // Template Styles
  const templateStyles = {
    minimal: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      accent: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50',
      font: 'font-sans',
      card: 'bg-white border border-gray-200 rounded-3xl shadow-xl',
      cardHeader: 'bg-gray-50 border-b border-gray-200',
      qrBg: 'bg-white',
      cutout: 'bg-gray-50',
    },
    playful: {
      bg: 'bg-[#FFC107]',
      text: 'text-[#2D3748]',
      accent: 'bg-[#FF4F5A] text-white hover:bg-[#E03E48] rounded-full shadow-lg',
      secondary: 'bg-white border-2 border-[#2D3748] text-[#2D3748] hover:bg-gray-50 rounded-full',
      font: 'font-display',
      card: 'bg-white border-4 border-[#2D3748] rounded-[2rem] shadow-[8px_8px_0px_0px_#2D3748]',
      cardHeader: 'bg-[#FFF9E6] border-b-4 border-dashed border-[#2D3748]',
      qrBg: 'bg-white',
      cutout: 'bg-[#FFC107]',
    },
    elegant: {
      bg: 'bg-[#000000]',
      text: 'text-[#F3F4F6]',
      accent: 'bg-[#D4AF37] text-[#111827] hover:bg-[#B5952F] rounded-none tracking-widest uppercase',
      secondary: 'border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-none tracking-widest uppercase',
      font: 'font-serif',
      card: 'bg-[#1F2937] border border-[#D4AF37]/30 rounded-none',
      cardHeader: 'bg-[#111827] border-b border-[#D4AF37]/30',
      qrBg: 'bg-white p-4',
      cutout: 'bg-[#000000]',
    }
  };

  const styles = templateStyles[template] || templateStyles.minimal;

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden ${styles.bg} ${styles.text} ${styles.font}`}>
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-current opacity-5 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-current opacity-5 rounded-full filter blur-[100px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to={`/e/${id}`} className="hover:opacity-70 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 mb-6 transition-colors w-fit mx-auto">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Event
          </Link>
          <h1 className="text-3xl md:text-4xl mb-2 font-bold">Your Event Pass</h1>
          <p className="opacity-70 font-medium">Please present this QR code upon arrival.</p>
        </div>

        {/* Ticket Card */}
        <div className={`overflow-hidden relative ${styles.card}`}>
          {/* Ticket Header */}
          <div className={`p-8 text-center relative ${styles.cardHeader}`}>
            {/* Cutouts */}
            <div className={`absolute -bottom-4 -left-4 w-8 h-8 rounded-full ${styles.cutout}`}></div>
            <div className={`absolute -bottom-4 -right-4 w-8 h-8 rounded-full ${styles.cutout}`}></div>
            
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-70">Admit One</p>
            <h2 className="text-3xl mb-1 font-bold">{event.title}</h2>
            <p className="text-sm opacity-80">{format(new Date(event.date), 'MMMM do, yyyy • h:mm a')}</p>
          </div>
          
          {/* Ticket Body */}
          <div className="p-8 flex flex-col items-center relative">
            <div className="w-full mb-8">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Guest</p>
                  <h3 className="text-2xl font-bold">{guest.fullName}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Status</p>
                  <p className="text-xl capitalize font-bold">{guest.attendanceStatus}</p>
                </div>
              </div>
              
              {guest.plusOnes > 0 && (
                <div className="mt-4 pt-4 border-t border-current/10">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Additional Guests</p>
                  <p className="text-xl font-bold">+{guest.plusOnes}</p>
                </div>
              )}
            </div>

            <div className={`rounded-2xl shadow-sm border border-current/10 mb-6 p-4 ${styles.qrBg}`}>
              <QRCodeSVG
                value={guest.qrToken}
                size={220}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={false}
              />
            </div>
            
            <p className="text-xs font-mono tracking-widest uppercase opacity-50">{guest.qrToken.substring(0, 16)}...</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-4">
          <button 
            onClick={() => window.print()}
            className={`w-full transition-all px-8 py-4 font-bold flex items-center justify-center gap-2 ${styles.accent}`}
          >
            <span className="material-symbols-outlined text-lg">print</span> Print Pass
          </button>
          <button 
            className={`w-full transition-all px-8 py-4 font-bold flex items-center justify-center gap-2 ${styles.secondary}`}
          >
            <span className="material-symbols-outlined text-lg">download</span> Save to Device
          </button>
        </div>
      </motion.div>
    </div>
  );
}
