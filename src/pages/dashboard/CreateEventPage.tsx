import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion } from 'framer-motion';
import { EVENT_TYPES, TEMPLATE_CATALOG, type EventType } from '../../lib/catalog';


export default function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    event_type: 'wedding' as EventType,
    templateId: 'eternal-vows',
  });

  const createEvent = useMutation((api as any).events.createEvent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('Not authenticated');

      const eventId = await createEvent({
        hostId: userId,
        title: formData.title,
        date: formData.date,
        location: formData.location,
        description: formData.description,
        eventType: formData.event_type,
        templateId: formData.templateId,
      });

      navigate(`/dashboard/events/${eventId}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link to="/dashboard" className="text-text-muted hover:text-primary text-sm font-semibold flex items-center gap-2 mb-6 transition-colors w-fit">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Dashboard
        </Link>
        <h1 className="text-4xl md:text-5xl mb-2 text-text-main">Create New Event</h1>
        <p className="text-text-muted text-lg">Let's set up your next amazing gathering.</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-border'}`}></div>
        <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-border'}`}></div>
      </div>

      <div className="bg-surface rounded-3xl shadow-sm border border-border p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-2xl mb-6">Event Details</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">Event Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Sarah's 30th Birthday Bash"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-main">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-main">Event Type</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => {
                      const eventType = e.target.value as EventType;
                      const firstTemplate = TEMPLATE_CATALOG.find((t) => t.supportedEventTypes.includes(eventType));
                      setFormData({
                        ...formData,
                        event_type: eventType,
                        templateId: firstTemplate?.id ?? formData.templateId,
                      });
                    }}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main appearance-none"
                  >
                    {EVENT_TYPES.map((eventType) => (
                      <option key={eventType.id} value={eventType.id}>{eventType.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">Location</label>
                <div className="relative">
                  <input
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Venue Name, City"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main"
                  />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">location_on</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell your guests what to expect..."
                  rows={4}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main resize-none"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-2xl mb-2">Choose a Template</h2>
              <p className="text-text-muted mb-6">Select a theme for your public event page. You can customize this later.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATE_CATALOG.filter((template) => template.supportedEventTypes.includes(formData.event_type as EventType)).map((template) => (
                  <div 
                    key={template.id}
                    onClick={() => setFormData({ ...formData, templateId: template.id })}
                    className={`cursor-pointer rounded-2xl border-2 p-6 transition-all flex flex-col items-center text-center gap-4 ${
                      formData.templateId === template.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/30 bg-surface'
                    }`}
                  >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: template.color }}
                    >
                      <span className="material-symbols-outlined text-3xl">{template.icon}</span>
                    </div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="pt-6 border-t border-border flex justify-between items-center">
            {step === 2 ? (
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="px-6 py-3 text-sm font-semibold text-text-muted hover:text-text-main transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div> // Spacer
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary text-white hover:bg-primary-hover transition-all px-8 py-3 rounded-xl text-sm font-semibold disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
            >
              {step === 1 ? 'Continue' : (loading ? 'Creating...' : 'Create Event')}
              {step === 1 && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
