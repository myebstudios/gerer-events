import * as React from 'react';
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENT_TYPES, TEMPLATE_CATALOG, type EventType } from '../../lib/catalog';
import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react';

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

export default function CreateEventPage() {
  const navigate = useNavigate();
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

  const createEvent = useMutation((api as any).events.createEvent);
  const generateUploadUrl = useMutation((api as any).events.generateUploadUrl);

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
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('Not authenticated');

      let coverImageStorageId: string | undefined;
      if (coverFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": coverFile.type },
          body: coverFile,
        });
        const { storageId } = await result.json();
        coverImageStorageId = storageId;
      }

      const eventId = await createEvent({
        hostId: userId,
        title: formData.title,
        date: formData.date,
        ...(formData.endDate ? { endDate: formData.endDate } : {}),
        location: formData.location,
        description: formData.description,
        eventType: formData.event_type,
        templateId: formData.templateId,
        ...(coverImageStorageId ? { coverImageStorageId } : {}),
        status: 'draft',
      });

      navigate(`/dashboard/events/${eventId}`);
    } catch (error: any) {
      alert(error.message);
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

      {/* Progress Indicator */}
      <div className="flex items-center gap-3 mb-10 w-full max-w-md">
        <div className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-black' : 'bg-gray-100'}`}></div>
        <div className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-black' : 'bg-gray-100'}`}></div>
        <div className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${step >= 3 ? 'bg-black' : 'bg-gray-100'}`}></div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-12 flex-1 relative overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <AnimatePresence mode="wait">
            {/* STEP 1: EVENT DETAILS */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 flex-1">
                <div>
                  <h2 className="font-display text-2xl text-black font-semibold">Event Details</h2>
                  <p className="text-gray-500 text-sm mt-1">The basics of what's happening and when.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Event Title</label>
                  <Input
                    isRequired
                    value={formData.title}
                    onValueChange={(val) => setFormData({ ...formData, title: val })}
                    placeholder="e.g., Global Tech Summit 2026"
                    variant="bordered"
                    radius="lg"
                    classNames={{ inputWrapper: "border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm" }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-black">Start Date & Time</label>
                      <Input
                        type="datetime-local"
                        isRequired
                        value={formData.date}
                        onValueChange={(val) => setFormData({ ...formData, date: val })}
                        variant="bordered"
                        radius="lg"
                        classNames={{ inputWrapper: "border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm" }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-black">End Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={formData.endDate}
                        onValueChange={(val) => setFormData({ ...formData, endDate: val })}
                        variant="bordered"
                        radius="lg"
                        classNames={{ inputWrapper: "border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm" }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-black">Event Type</label>
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
                      radius="lg"
                      classNames={{ trigger: "border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm" }}
                    >
                      {EVENT_TYPES.map((eventType) => (
                        <SelectItem key={eventType.id}>{eventType.label}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Location</label>
                  <Input
                    isRequired
                    value={formData.location}
                    onValueChange={(val) => setFormData({ ...formData, location: val })}
                    placeholder="Venue Name, City"
                    variant="bordered"
                    radius="lg"
                    startContent={<span className="material-symbols-outlined text-gray-400 text-[18px]">location_on</span>}
                    classNames={{ inputWrapper: "border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm" }}
                  />
                </div>

                <div className="space-y-2 pb-8">
                  <label className="text-sm font-semibold text-black">Description (Optional)</label>
                  <Textarea
                    value={formData.description}
                    onValueChange={(val) => setFormData({ ...formData, description: val })}
                    placeholder="Tell your guests what to expect..."
                    minRows={4}
                    variant="bordered"
                    radius="lg"
                    classNames={{ inputWrapper: "border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm" }}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: TEMPLATE PREVIEW */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col md:flex-row gap-12">
                <div className="md:w-1/2 space-y-6">
                  <div>
                    <h2 className="font-display text-2xl text-black font-semibold">Choose a Layout</h2>
                    <p className="text-gray-500 text-sm mt-1">Select the structure of your invite. You can customize colors next.</p>
                  </div>

                  <div className="space-y-4">
                    {TEMPLATE_CATALOG.filter((template) => template.supportedEventTypes.includes(formData.event_type as EventType)).map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setFormData({ ...formData, templateId: template.id, themeColor: template.color, typographyPreset: template.typographyPreset })}
                        className={`cursor-pointer rounded-2xl p-4 transition-all flex items-center gap-4 border bg-white relative overflow-hidden ${formData.templateId === template.id
                          ? 'border-black ring-1 ring-black shadow-md'
                          : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        {formData.templateId === template.id && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-black"></div>
                        )}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: template.color }}
                        >
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

                {/* Visual Preview Side – mirrors PublicEventPage */}
                <div className="md:w-1/2 bg-gray-50 rounded-[32px] p-6 lg:p-8 flex flex-col items-center justify-center border border-gray-100">
                  <p className="text-xs text-center font-semibold tracking-widest uppercase text-gray-400 mb-6">Live Preview</p>

                  {/* Phone frame – Step 2 preview */}
                  <div
                    className="w-full max-w-[260px] rounded-[2.2rem] shadow-2xl border-[7px] border-gray-900 overflow-hidden flex flex-col bg-white"
                    style={{ aspectRatio: '9/19' }}
                  >
                    {/* Dynamic Island */}
                    <div className="bg-gray-900 flex justify-center pt-2 pb-1 flex-shrink-0">
                      <div className="bg-black w-20 h-4 rounded-full"></div>
                    </div>
                    {/* Hero */}
                    <div
                      className="relative flex-shrink-0 flex items-end justify-center overflow-hidden"
                      style={{ backgroundColor: currentTemplate?.color || '#111', height: '32%' }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.18 }}>
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '36px' }}>{currentTemplate?.icon}</span>
                      </div>
                      <div className="relative z-10 text-center px-3 pb-2 w-full">
                        <h4 className="text-white font-bold textShadow leading-tight mb-1" style={{ fontSize: '11px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                          {formData.title || 'Your Event Title'}
                        </h4>
                        <p className="font-bold" style={{ color: '#fff', fontSize: '9px', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                          {safeFormatDate(formData.date, 'short')}
                        </p>
                      </div>
                    </div>
                    {/* Details card */}
                    <div className="flex-1 bg-white rounded-t-2xl overflow-y-auto" style={{ marginTop: '-10px', zIndex: 10 }}>
                      <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
                        <p className="font-bold text-center" style={{ fontSize: '10px', color: '#111' }}>The Details</p>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="material-symbols-outlined" style={{ fontSize: '11px', color: currentTemplate?.color || '#111', opacity: 0.85 }}>schedule</span>
                          <p className="uppercase font-bold tracking-widest" style={{ fontSize: '6px', color: '#9ca3af' }}>When</p>
                          <p className="font-semibold" style={{ fontSize: '8px', color: '#111' }}>{safeFormatDate(formData.date, 'long', '—')}</p>
                        </div>
                        <div className="h-px mx-6" style={{ backgroundColor: currentTemplate?.color || '#111', opacity: 0.15 }}></div>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="material-symbols-outlined" style={{ fontSize: '11px', color: currentTemplate?.color || '#111', opacity: 0.85 }}>location_on</span>
                          <p className="uppercase font-bold tracking-widest" style={{ fontSize: '6px', color: '#9ca3af' }}>Where</p>
                          <p className="font-semibold" style={{ fontSize: '8px', color: '#111' }}>{formData.location || '—'}</p>
                        </div>
                        {formData.description && (
                          <>
                            <div className="h-px mx-6" style={{ backgroundColor: currentTemplate?.color || '#111', opacity: 0.15 }}></div>
                            <p className="text-center" style={{ fontSize: '7px', color: '#6b7280', lineHeight: 1.6 }}>{formData.description}</p>
                            <div className="h-px mx-6" style={{ backgroundColor: currentTemplate?.color || '#111', opacity: 0.15 }}></div>
                          </>
                        )}
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

            {/* STEP 3: CUSTOMIZATION */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 flex-1">
                <div>
                  <h2 className="font-display text-2xl text-black font-semibold">Make it yours</h2>
                  <p className="text-gray-500 text-sm mt-1">Upload memories and pick your aesthetic.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    {/* Cover Image Upload (Moved from Step 1) */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-black flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">image</span> Cover Image
                      </label>
                      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleCoverSelect} />
                      {coverPreview ? (
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-video shadow-sm">
                          <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-white text-black px-4 py-2 rounded-full text-xs font-semibold shadow-md"
                            >
                              Change Image
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur text-black p-1.5 rounded-full hover:bg-white transition-colors shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-black/20 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-black/5"
                        >
                          <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">add_photo_alternate</span>
                          <span className="text-sm text-gray-600 font-medium tracking-tight">Upload high-res photo</span>
                          <span className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Max 10MB</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-black flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">palette</span> Accentuating Color
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {THEME_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, themeColor: color }))}
                            className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-transform ${formData.themeColor === color ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${color}`}
                          >
                            {formData.themeColor === color && (
                              <span className="material-symbols-outlined text-white text-[18px]">check</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pb-6">
                      <label className="text-sm font-semibold text-black flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">text_format</span> Typography Look
                      </label>
                      <Select
                        selectedKeys={[formData.typographyPreset]}
                        onSelectionChange={(keys) => {
                          const typo = Array.from(keys)[0] as string;
                          if (typo) setFormData({ ...formData, typographyPreset: typo });
                        }}
                        variant="bordered"
                        radius="lg"
                        classNames={{ trigger: "border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm" }}
                      >
                        {TYPOGRAPHY_PRESETS.map((typo) => (
                          <SelectItem key={typo.id} className={typo.id === 'classic' ? 'font-serif' : typo.id === 'playful' ? 'font-display' : 'font-sans'}>
                            {typo.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="h-full bg-gray-50 rounded-[32px] p-6 lg:p-8 flex flex-col items-center justify-center border border-gray-100">
                    <p className="text-xs text-center font-semibold tracking-widest uppercase text-gray-400 mb-6">Live Preview</p>

                    {/* Phone frame – Step 3 preview */}
                    <div
                      className="w-full max-w-[260px] rounded-[2.2rem] shadow-2xl border-[7px] border-gray-900 overflow-hidden flex flex-col bg-white"
                      style={{ aspectRatio: '9/19', fontFamily: formData.typographyPreset === 'classic' ? "Georgia, 'Times New Roman', serif" : formData.typographyPreset === 'playful' ? "'CabinetGrotesk-Variable', 'Outfit', sans-serif" : "'Inter', sans-serif" }}
                    >
                      {/* Dynamic Island */}
                      <div className="bg-gray-900 flex justify-center pt-2 pb-1 flex-shrink-0">
                        <div className="bg-black w-20 h-4 rounded-full"></div>
                      </div>
                      {/* Hero */}
                      <div
                        className="relative flex-shrink-0 flex items-end justify-center overflow-hidden bg-cover bg-center"
                        style={{ backgroundColor: formData.themeColor || currentTemplate?.color || '#111', backgroundImage: coverPreview ? `url(${coverPreview})` : 'none', height: '32%' }}
                      >
                        {coverPreview && <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${formData.themeColor || currentTemplate?.color || '#111'}dd)` }}></div>}
                        {!coverPreview && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.18 }}>
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '36px' }}>{currentTemplate?.icon}</span>
                          </div>
                        )}
                        <div className="relative z-10 text-center px-3 pb-2 w-full">
                          <h4 className="text-white font-bold leading-tight mb-1" style={{ fontSize: '11px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                            {formData.title || 'Your Event Title'}
                          </h4>
                          <p className="font-bold" style={{ color: '#fff', fontSize: '9px', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                            {safeFormatDate(formData.date, 'short')}
                          </p>
                        </div>
                      </div>
                      {/* Details card */}
                      <div className="flex-1 bg-white rounded-t-2xl overflow-y-auto" style={{ marginTop: '-10px', zIndex: 10 }}>
                        <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
                          <p className="font-bold text-center" style={{ fontSize: '10px', color: '#111' }}>The Details</p>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="material-symbols-outlined" style={{ fontSize: '11px', color: formData.themeColor || currentTemplate?.color || '#111', opacity: 0.85 }}>schedule</span>
                            <p className="uppercase font-bold tracking-widest" style={{ fontSize: '6px', color: '#9ca3af' }}>When</p>
                            <p className="font-semibold" style={{ fontSize: '8px', color: '#111' }}>{safeFormatDate(formData.date, 'long', '—')}</p>
                          </div>
                          <div className="h-px mx-6" style={{ backgroundColor: formData.themeColor || currentTemplate?.color || '#111', opacity: 0.15 }}></div>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="material-symbols-outlined" style={{ fontSize: '11px', color: formData.themeColor || currentTemplate?.color || '#111', opacity: 0.85 }}>location_on</span>
                            <p className="uppercase font-bold tracking-widest" style={{ fontSize: '6px', color: '#9ca3af' }}>Where</p>
                            <p className="font-semibold" style={{ fontSize: '8px', color: '#111' }}>{formData.location || '—'}</p>
                          </div>
                          {formData.description && (
                            <>
                              <div className="h-px mx-6" style={{ backgroundColor: formData.themeColor || currentTemplate?.color || '#111', opacity: 0.15 }}></div>
                              <p className="text-center" style={{ fontSize: '7px', color: '#6b7280', lineHeight: 1.6 }}>{formData.description}</p>
                              <div className="h-px mx-6" style={{ backgroundColor: formData.themeColor || currentTemplate?.color || '#111', opacity: 0.15 }}></div>
                            </>
                          )}
                          <div className="space-y-2 pt-1">
                            <div className="w-full rounded-full font-bold text-center" style={{ backgroundColor: formData.themeColor || '#000', color: '#fff', fontSize: '8px', padding: '6px 0' }}>RSVP Now</div>
                            <div className="w-full rounded-full font-bold text-center border-2" style={{ borderColor: formData.themeColor || '#000', color: formData.themeColor || '#000', fontSize: '8px', padding: '5px 0' }}>Upload Memories</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fixed Footer Actions */}
          <div className="pt-6 mt-auto border-t border-gray-100 flex justify-between items-center bg-white z-10 sticky bottom-0">
            {step > 1 ? (
              <Button type="button" variant="light" onPress={() => setStep(step - 1)} className="font-semibold text-black hover:bg-gray-100 rounded-full px-6">
                Back
              </Button>
            ) : (
              <div></div>
            )}

            <Button type="submit" isDisabled={loading} className="font-medium rounded-full px-8 py-5 bg-[#18181B] text-white hover:bg-[#27272A] shadow-md transition-all">
              {step < 3 ? 'Continue' : (loading ? 'Creating...' : 'Launch Event')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
