import * as React from 'react';
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion } from 'framer-motion';
import { resolveTemplateTone } from '../../lib/catalog';

export default function RSVPPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = useQuery((api as any).events.getEvent, id ? { eventId: id } : "skip");
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    attendance_status: 'yes',
    plus_ones: 0,
    meal_preference: '',
    message: '',
  });

  const rsvp = useMutation((api as any).guests.rsvp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const qrToken = `evt_${id}_gst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const guestId = await rsvp({
        eventId: id,
        fullName: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        attendanceStatus: formData.attendance_status,
        plusOnes: formData.plus_ones,
        mealPreference: formData.meal_preference,
        message: formData.message,
        qrToken,
      });

      navigate(`/e/${id}/pass/${guestId}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (event === undefined) return <div className="flex h-screen items-center justify-center bg-background">Loading...</div>;
  if (!event) return <div className="flex h-screen items-center justify-center bg-background">Event not found</div>;

  const template = resolveTemplateTone(event.templateId);

  // Template Styles
  const templateStyles = {
    minimal: {
      bg: 'bg-white',
      text: 'text-gray-900',
      accent: 'bg-blue-600 text-white hover:bg-blue-700',
      font: 'font-sans',
      hero: 'bg-gray-50',
      heroText: 'text-gray-900',
      input: 'bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600',
    },
    playful: {
      bg: 'bg-[#FFF9E6]',
      text: 'text-[#2D3748]',
      accent: 'bg-[#FF4F5A] text-white hover:bg-[#E03E48] rounded-full shadow-lg',
      font: 'font-display',
      hero: 'bg-[#FFC107]',
      heroText: 'text-[#2D3748]',
      input: 'bg-white border-2 border-[#2D3748] rounded-2xl focus:ring-4 focus:ring-[#FF4F5A]/20 focus:border-[#FF4F5A]',
    },
    elegant: {
      bg: 'bg-[#111827]',
      text: 'text-[#F3F4F6]',
      accent: 'bg-[#D4AF37] text-[#111827] hover:bg-[#B5952F] rounded-none tracking-widest uppercase',
      font: 'font-serif',
      hero: 'bg-[#000000]',
      heroText: 'text-[#D4AF37]',
      input: 'bg-[#1F2937] border border-[#D4AF37]/30 rounded-none focus:border-[#D4AF37] text-white',
    }
  };

  const styles = templateStyles[template] || templateStyles.minimal;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${styles.bg} ${styles.text} ${styles.font}`}>
      {/* Left Side - Image/Info */}
      <div className={`w-full md:w-1/2 lg:w-5/12 relative flex flex-col justify-between p-8 md:p-12 lg:p-16 min-h-[40vh] md:min-h-screen ${styles.hero}`}>
        {event.coverImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${event.coverImageUrl})` }}
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-${styles.bg.replace('bg-', '')}`} />
        
        <div className="relative z-10">
          <Link to={`/e/${id}`} className={`hover:opacity-70 text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-12 transition-colors w-fit ${styles.heroText}`}>
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Event
          </Link>
        </div>

        <div className="relative z-10 mt-auto">
          <p className={`text-sm uppercase tracking-[0.3em] mb-4 font-bold opacity-80 ${styles.heroText}`}>You are invited to</p>
          <h1 className={`text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight font-bold ${styles.heroText}`}>
            {event.title}
          </h1>
          <p className={`font-medium opacity-90 leading-relaxed max-w-md ${styles.heroText}`}>
            We kindly request the honor of your presence. Please let us know if you can make it.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={`w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-8 md:p-12 lg:p-16 ${styles.bg}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-xl"
        >
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl mb-2 font-bold">RSVP</h2>
            <div className="h-1 w-12 bg-current opacity-20 mx-auto md:mx-0 rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70">Full Name *</label>
                <input
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Jane Doe"
                  className={`w-full px-4 py-3 outline-none transition-all ${styles.input}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane@example.com"
                  className={`w-full px-4 py-3 outline-none transition-all ${styles.input}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-4 py-3 outline-none transition-all ${styles.input}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70">Will you attend? *</label>
                <div className="relative">
                  <select
                    className={`w-full px-4 py-3 outline-none transition-all appearance-none cursor-pointer ${styles.input}`}
                    value={formData.attendance_status}
                    onChange={(e) => setFormData({ ...formData, attendance_status: e.target.value })}
                  >
                    <option value="yes" className="text-gray-900">Joyfully Accept</option>
                    <option value="no" className="text-gray-900">Regretfully Decline</option>
                    <option value="maybe" className="text-gray-900">Maybe</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            {formData.attendance_status === 'yes' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-70">Plus Ones</label>
                  <div className="relative">
                    <select
                      className={`w-full px-4 py-3 outline-none transition-all appearance-none cursor-pointer ${styles.input}`}
                      value={formData.plus_ones}
                      onChange={(e) => setFormData({ ...formData, plus_ones: parseInt(e.target.value) })}
                    >
                      <option value={0} className="text-gray-900">0</option>
                      <option value={1} className="text-gray-900">1</option>
                      <option value={2} className="text-gray-900">2</option>
                      <option value={3} className="text-gray-900">3</option>
                      <option value={4} className="text-gray-900">4</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-70">Meal Preference / Diet</label>
                  <input
                    value={formData.meal_preference}
                    onChange={(e) => setFormData({ ...formData, meal_preference: e.target.value })}
                    placeholder="E.g., Vegetarian, No nuts"
                    className={`w-full px-4 py-3 outline-none transition-all ${styles.input}`}
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-2 pt-2">
              <label className="text-sm font-bold opacity-70">Message to Host</label>
              <textarea
                className={`w-full px-4 py-3 outline-none transition-all min-h-[100px] resize-y ${styles.input}`}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Leave a note or special request..."
              />
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full transition-all px-8 py-4 font-bold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${styles.accent}`}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Submitting...
                  </>
                ) : (
                  'Confirm RSVP'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
