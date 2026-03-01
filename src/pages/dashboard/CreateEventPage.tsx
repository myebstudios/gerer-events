import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion } from 'framer-motion';
import { EVENT_TYPES, TEMPLATE_CATALOG, type EventType } from '../../lib/catalog';
import { Button, Input, Select, SelectItem, Textarea, Card, CardBody } from '@heroui/react';


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

      <Card className="bg-surface rounded-3xl shadow-sm border border-border p-2"><CardBody className="p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-2xl mb-6">Event Details</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">Event Title</label>
                <Input
                  isRequired
                  value={formData.title}
                  onValueChange={(val) => setFormData({ ...formData, title: val })}
                  placeholder="e.g., Sarah's 30th Birthday Bash"
                  variant="bordered"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-main">Date & Time</label>
                  <Input
                    type="datetime-local"
                    isRequired
                    value={formData.date}
                    onValueChange={(val) => setFormData({ ...formData, date: val })}
                    variant="bordered"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-main">Event Type</label>
                  <Select
                    selectedKeys={[formData.event_type]}
                    onSelectionChange={(keys) => {
                      const eventType = Array.from(keys)[0] as EventType;
                      if (!eventType) return;
                      const firstTemplate = TEMPLATE_CATALOG.find((t) => t.supportedEventTypes.includes(eventType));
                      setFormData({
                        ...formData,
                        event_type: eventType,
                        templateId: firstTemplate?.id ?? formData.templateId,
                      });
                    }}
                    variant="bordered"
                  >
                    {EVENT_TYPES.map((eventType) => (
                      <SelectItem key={eventType.id}>{eventType.label}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">Location</label>
                <div className="relative">
                  <Input
                    isRequired
                    value={formData.location}
                    onValueChange={(val) => setFormData({ ...formData, location: val })}
                    placeholder="Venue Name, City"
                    variant="bordered"
                  />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">location_on</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">Description (Optional)</label>
                <Textarea
                  value={formData.description}
                  onValueChange={(val) => setFormData({ ...formData, description: val })}
                  placeholder="Tell your guests what to expect..."
                  minRows={4}
                  variant="bordered"
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
              <Button type="button" variant="light" onPress={() => setStep(1)} className="font-semibold">Back</Button>
            ) : (
              <div></div> // Spacer
            )}
            
            <Button type="submit" color="primary" isDisabled={loading} className="font-semibold">
              {step === 1 ? 'Continue' : (loading ? 'Creating...' : 'Create Event')}
            </Button>
          </div>
        </form>
      </CardBody></Card>
    </div>
  );
}
