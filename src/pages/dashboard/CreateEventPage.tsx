import * as React from 'react';
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENT_TYPES, TEMPLATE_CATALOG, type EventType } from '../../lib/catalog';
import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const safeFormatDate = (dateStr: string, fmt: 'short' | 'long' = 'long', fallback = 'Your Event Date') => {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('en-GB', fmt === 'long'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return fallback; }
};

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    endDate: '',
    location: '',
    description: '',
    event_type: 'wedding' as EventType,
    templateId: 'eternal-vows',
    themeColor: '#18181B',
    typographyPreset: 'modern',
  });

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const currentTemplate = TEMPLATE_CATALOG.find(t => t.id === formData.templateId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) return setStep(2);
    if (step === 2) return setStep(3);

    setLoading(true);
    try {
      if (!user) throw new Error('Not authenticated');

      let coverImageUrl: string | null = null;
      if (coverFile) {
        const ext = coverFile.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('event-media').upload(filePath, coverFile, {
          upsert: true,
          contentType: coverFile.type,
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('event-media').getPublicUrl(filePath);
        coverImageUrl = data.publicUrl;
      }

      const payload = {
        owner_id: user.id,
        title: formData.title,
        slug: slugify(formData.title),
        description: formData.description || null,
        location: formData.location,
        starts_at: new Date(formData.date).toISOString(),
        ends_at: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        event_type: formData.event_type,
        template_id: formData.templateId,
        theme_color: formData.themeColor,
        typography_preset: formData.typographyPreset,
        cover_image_url: coverImageUrl,
        status: 'draft',
      };

      const { data, error } = await supabase.from('events').insert(payload).select('id').single();
      if (error) throw error;
      pushToast('Event created successfully.', 'success');
      navigate(`/dashboard/events/${data.id}`);
    } catch (error: any) {
      pushToast(error.message || 'Failed to create event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const THEME_COLORS = ['#18181B', '#e11d48', '#2563eb', '#16a34a', '#d97706', '#9333ea'];
  const TYPOGRAPHY_PRESETS = [
    { id: 'modern', label: 'Modern (Sans-serif)' },
    { id: 'classic', label: 'Classic (Serif)' },
    { id: 'playful', label: 'Playful (Display)' }
  ];

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto min-h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-8">
        <Link to="/dashboard" className="text-gray-500 hover:text-black text-sm font-semibold flex items-center gap-2 mb-6 transition-colors w-fit">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Dashboard
        </Link>
        <h1 className="font-display text-4xl md:text-5xl mb-2 text-black font-semibold tracking-tight">Create New Event</h1>
        <p className="text-gray-500 text-[15px]">Let's set up your next amazing gathering.</p>
      </div>

      <div className="flex items-center gap-3 mb-10 w-full max-w-md">
        <div className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-black' : 'bg-gray-100'}`}></div>
        <div className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-black' : 'bg-gray-100'}`}></div>
        <div className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${step >= 3 ? 'bg-black' : 'bg-gray-100'}`}></div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-12 flex-1 relative overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 flex-1">
                <div>
                  <h2 className="font-display text-2xl text-black font-semibold">Event Details</h2>
                  <p className="text-gray-500 text-sm mt-1">The basics of what's happening and when.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Event Title</label>
                  <Input isRequired value={formData.title} onValueChange={(val) => setFormData({ ...formData, title: val })} placeholder="e.g., Global Tech Summit 2026" variant="bordered" radius="lg" classNames={{ inputWrapper: 'border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm' }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-black">Start Date & Time</label>
                      <Input type="datetime-local" isRequired value={formData.date} onValueChange={(val) => setFormData({ ...formData, date: val })} variant="bordered" radius="lg" classNames={{ inputWrapper: 'border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm' }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-black">End Date & Time</label>
                      <Input type="datetime-local" value={formData.endDate} onValueChange={(val) => setFormData({ ...formData, endDate: val })} variant="bordered" radius="lg" classNames={{ inputWrapper: 'border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-black">Event Type</label>
                    <Select selectedKeys={[formData.event_type]} onSelectionChange={(keys) => {
                      const eventType = Array.from(keys)[0] as EventType;
                      if (!eventType) return;
                      const firstTemplate = TEMPLATE_CATALOG.find((t) => t.supportedEventTypes.includes(eventType));
                      setFormData({ ...formData, event_type: eventType, templateId: firstTemplate?.id ?? formData.templateId });
                    }} variant="bordered" radius="lg" classNames={{ trigger: 'border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm' }}>
                      {EVENT_TYPES.map((eventType) => (<SelectItem key={eventType.id}>{eventType.label}</SelectItem>))}
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Location</label>
                  <Input isRequired value={formData.location} onValueChange={(val) => setFormData({ ...formData, location: val })} placeholder="Venue Name, City" variant="bordered" radius="lg" startContent={<span className="material-symbols-outlined text-gray-400 text-[18px]">location_on</span>} classNames={{ inputWrapper: 'border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm' }} />
                </div>
                <div className="space-y-2 pb-8">
                  <label className="text-sm font-semibold text-black">Description (Optional)</label>
                  <Textarea value={formData.description} onValueChange={(val) => setFormData({ ...formData, description: val })} placeholder="Tell your guests what to expect..." minRows={4} variant="bordered" radius="lg" classNames={{ inputWrapper: 'border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm' }} />
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col md:flex-row gap-12">
                <div className="md:w-1/2 space-y-6">
                  <div>
                    <h2 className="font-display text-2xl text-black font-semibold">Choose a Layout</h2>
                    <p className="text-gray-500 text-sm mt-1">Select the structure of your invite. You can customize colors next.</p>
                  </div>
                  <div className="space-y-4">
                    {TEMPLATE_CATALOG.filter((template) => template.supportedEventTypes.includes(formData.event_type as EventType)).map((template) => (
                      <div key={template.id} onClick={() => setFormData({ ...formData, templateId: template.id, themeColor: template.color, typographyPreset: template.typographyPreset })} className={`cursor-pointer rounded-2xl p-4 transition-all flex items-center gap-4 border bg-white relative overflow-hidden ${formData.templateId === template.id ? 'border-black ring-1 ring-black shadow-md' : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'}`}>
                        {formData.templateId === template.id && (<div className="absolute top-0 bottom-0 left-0 w-1 bg-black"></div>)}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0" style={{ backgroundColor: template.color }}>
                          <span className="material-symbols-outlined text-xl">{template.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[15px] text-black tracking-tight">{template.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-1">{template.tone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:w-1/2 bg-gray-50 rounded-[32px] p-6 lg:p-8 flex flex-col items-center justify-center border border-gray-100">
                  <p className="text-xs text-center font-semibold tracking-widest uppercase text-gray-400 mb-6">Live Preview</p>
                  <div className="w-full max-w-[260px] rounded-[2.2rem] shadow-2xl border-[7px] border-gray-900 overflow-hidden flex flex-col bg-white" style={{ aspectRatio: '9/19' }}>
                    <div className="bg-gray-900 flex justify-center pt-2 pb-1 flex-shrink-0"><div className="bg-black w-20 h-4 rounded-full"></div></div>
                    <div className="relative flex-shrink-0 flex items-end justify-center overflow-hidden" style={{ backgroundColor: currentTemplate?.color || '#111', height: '32%' }}>
                      <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.18 }}><span className="material-symbols-outlined text-white" style={{ fontSize: '36px' }}>{currentTemplate?.icon}</span></div>
                      <div className="relative z-10 text-center px-3 pb-2 w-full">
                        <h4 className="text-white font-bold leading-tight mb-1" style={{ fontSize: '11px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{formData.title || 'Your Event Title'}</h4>
                        <p className="font-bold" style={{ color: '#fff', fontSize: '9px', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{safeFormatDate(formData.date, 'short')}</p>
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-t-2xl overflow-y-auto" style={{ marginTop: '-10px', zIndex: 10 }}>
                      <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
                        <p className="font-bold text-center" style={{ fontSize: '10px', color: '#111' }}>The Details</p>
                        <div className="flex flex-col items-center gap-0.5"><span className="material-symbols-outlined" style={{ fontSize: '11px', color: currentTemplate?.color || '#111', opacity: 0.85 }}>schedule</span><p className="uppercase font-bold tracking-widest" style={{ fontSize: '6px', color: '#9ca3af' }}>When</p><p className="font-semibold" style={{ fontSize: '8px', color: '#111' }}>{safeFormatDate(formData.date, 'long', '—')}</p></div>
                        <div className="h-px mx-6" style={{ backgroundColor: currentTemplate?.color || '#111', opacity: 0.15 }}></div>
                        <div className="flex flex-col items-center gap-0.5"><span className="material-symbols-outlined" style={{ fontSize: '11px', color: currentTemplate?.color || '#111', opacity: 0.85 }}>location_on</span><p className="uppercase font-bold tracking-widest" style={{ fontSize: '6px', color: '#9ca3af' }}>Where</p><p className="font-semibold" style={{ fontSize: '8px', color: '#111' }}>{formData.location || '—'}</p></div>
                        <div className="space-y-2 pt-1">
                          <div className="w-full rounded-full font-bold text-center" style={{ backgroundColor: currentTemplate?.color || '#111', color: '#fff', fontSize: '8px', padding: '6px 0' }}>RSVP Now</div>
                          <div className="w-full rounded-full font-bold text-center border-2" style={{ borderColor: currentTemplate?.color || '#111', color: currentTemplate?.color || '#111', fontSize: '8px', padding: '5px 0' }}>Upload Memories</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 flex-1">
                <div>
                  <h2 className="font-display text-2xl text-black font-semibold">Make it yours</h2>
                  <p className="text-gray-500 text-sm mt-1">Upload memories and pick your aesthetic.</p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-black">Cover Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-[24px] p-6 bg-gray-50/80">
                    {coverPreview ? <img src={coverPreview} alt="Cover preview" className="w-full h-56 object-cover rounded-2xl mb-4" /> : <div className="h-56 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-5xl text-gray-300">image</span></div>}
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="bordered" className="rounded-full font-medium" onPress={() => fileInputRef.current?.click()}>Upload Cover</Button>
                      {coverPreview && <Button type="button" variant="light" className="rounded-full font-medium" onPress={() => { setCoverFile(null); setCoverPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>Remove</Button>}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-black">Theme Color</label>
                  <div className="flex flex-wrap gap-3">
                    {THEME_COLORS.map((color) => (
                      <button key={color} type="button" onClick={() => setFormData({ ...formData, themeColor: color })} className={`w-10 h-10 rounded-full border-2 transition-all ${formData.themeColor === color ? 'border-black scale-110' : 'border-white shadow-sm'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Typography</label>
                  <Select selectedKeys={[formData.typographyPreset]} onSelectionChange={(keys) => {
                    const next = Array.from(keys)[0] as string;
                    if (!next) return;
                    setFormData({ ...formData, typographyPreset: next });
                  }} variant="bordered" radius="lg" classNames={{ trigger: 'border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm' }}>
                    {TYPOGRAPHY_PRESETS.map((preset) => (<SelectItem key={preset.id}>{preset.label}</SelectItem>))}
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="light" className="font-medium rounded-full" onPress={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}>
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button type="submit" isLoading={loading} className="bg-[#18181B] text-white hover:bg-[#27272A] font-medium rounded-full px-8 py-5">
              {step < 3 ? 'Continue' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
