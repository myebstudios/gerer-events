import * as React from 'react';
import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resolveTemplateTone } from '../../lib/catalog';
import { sanitizeId } from '../../lib/id';
import { supabase } from '../../lib/supabase';

export default function UploadPage() {
  const { id } = useParams();
  const safeEventId = sanitizeId(id);
  const [event, setEvent] = React.useState<any>(null);
  const [qrToken, setQrToken] = useState('');
  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const run = async () => {
      if (!safeEventId) return;
      const { data } = await supabase.from('events').select('*').eq('id', safeEventId).maybeSingle();
      setEvent(data);
    };
    run();
  }, [safeEventId]);

  const verifyGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('guests').select('*').eq('event_id', safeEventId).eq('qr_token', qrToken).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Invalid QR Token or guest not found.');
      if (!data.checked_in) throw new Error('Only checked-in guests can upload media.');
      setGuest(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !guest) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop() || 'bin';
        const filePath = `${safeEventId}/${guest.id}/${Date.now()}-${i}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('event-media').upload(filePath, file, { upsert: true, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('event-media').getPublicUrl(filePath);
        const { error: saveError } = await supabase.from('media_uploads').insert({
          event_id: safeEventId,
          guest_id: guest.id,
          file_path: filePath,
          file_url: data.publicUrl,
          file_type: file.type,
          status: event?.moderation_mode === 'review' ? 'pending' : 'approved',
        });
        if (saveError) throw saveError;
      }
      setSuccess(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload files.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files);
  };

  if (!safeEventId) return <div className="p-8 text-text-muted font-medium">Invalid event link.</div>;
  if (!event) return <div className="flex h-screen items-center justify-center bg-background"><div className="animate-pulse text-text-muted font-medium">Loading...</div></div>;

  const template = resolveTemplateTone(event.template_id);
  const templateStyles = {
    minimal: { bg: 'bg-surface', text: 'text-text-main', accent: 'bg-primary text-white hover:bg-primary-hover rounded-full shadow-sm', font: 'font-sans', hero: 'bg-background', heroText: 'text-text-main', input: 'bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary', dropzone: 'border-2 border-dashed border-border hover:border-primary bg-background hover:bg-primary/5 rounded-2xl', dropzoneActive: 'border-primary bg-primary/5' },
    playful: { bg: 'bg-accent-light', text: 'text-text-main', accent: 'bg-orange text-white hover:bg-orange/90 rounded-full shadow-lg', font: 'font-display', hero: 'bg-accent', heroText: 'text-text-main', input: 'bg-white border-2 border-text-main/20 rounded-2xl focus:ring-4 focus:ring-orange/20 focus:border-orange', dropzone: 'border-4 border-dashed border-text-main/30 hover:border-orange bg-white hover:bg-orange/5 rounded-[2rem]', dropzoneActive: 'border-orange bg-orange/10' },
    elegant: { bg: 'bg-text-main', text: 'text-white', accent: 'bg-accent text-text-main hover:bg-accent-hover rounded-full tracking-widest uppercase shadow-md', font: 'font-display', hero: 'bg-black', heroText: 'text-accent', input: 'bg-white/10 border border-accent/30 rounded-xl focus:border-accent text-white', dropzone: 'border border-dashed border-accent/40 hover:border-accent bg-white/5 hover:bg-accent/5 rounded-2xl', dropzoneActive: 'border-accent bg-accent/10' }
  } as const;
  const styles = templateStyles[template] || templateStyles.minimal;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${styles.bg} ${styles.text} ${styles.font}`}>
      <div className={`w-full md:w-1/2 lg:w-5/12 relative flex flex-col justify-between p-8 md:p-12 lg:p-16 min-h-[40vh] md:min-h-screen ${styles.hero}`}>
        {event.cover_image_url && <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${event.cover_image_url})` }} />}
        <div className="relative z-10"><Link to={`/e/${safeEventId}`} className={`hover:opacity-70 text-sm font-semibold flex items-center gap-2 mb-12 transition-colors w-fit ${styles.heroText}`}><span className="material-symbols-outlined text-sm">arrow_back</span> Back to Event</Link></div>
        <div className="relative z-10 mt-auto"><p className={`text-sm uppercase tracking-[0.3em] mb-4 font-bold opacity-80 ${styles.heroText}`}>Share the magic</p><h1 className={`text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight font-bold ${styles.heroText}`}>Upload Memories</h1><p className={`font-medium opacity-90 leading-relaxed max-w-md ${styles.heroText}`}>Help us capture every moment of {event.title}. Upload your photos and videos to our shared gallery.</p></div>
      </div>
      <div className={`w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-8 md:p-12 lg:p-16 ${styles.bg}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full max-w-xl">
          {!guest ? (
            <div>
              <div className="mb-10 text-center md:text-left"><h2 className="text-3xl md:text-4xl mb-3 font-bold">Verify Access</h2><div className="h-1 w-12 bg-primary rounded-full mx-auto md:mx-0 mb-6"></div><p className="opacity-70">Please enter your QR token to access the upload gallery.</p></div>
              <form onSubmit={verifyGuest} className="space-y-5">
                <div className="space-y-2"><label className="text-sm font-semibold opacity-70">QR Token *</label><input required value={qrToken} onChange={(e) => setQrToken(e.target.value)} placeholder="evt_..." className={`w-full px-4 py-3 outline-none transition-all ${styles.input}`} /><p className="text-xs opacity-60 mt-2">You can find this on your digital pass.</p></div>
                {error && <div className="p-4 bg-red-light border border-red/20 text-red text-sm flex items-center gap-2 rounded-xl"><span className="material-symbols-outlined text-red">error</span>{error}</div>}
                <div className="pt-4"><button type="submit" disabled={loading} className={`w-full transition-all px-8 py-4 font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${styles.accent}`}>{loading ? 'Verifying...' : 'Continue'}</button></div>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-8"><h2 className="text-3xl md:text-4xl mb-3 font-bold">Welcome, {guest.full_name}</h2><p className="opacity-70">Drop your photos and videos below.</p></div>
              <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} className={`transition-all p-8 text-center ${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
                <span className="material-symbols-outlined text-5xl opacity-40">cloud_upload</span>
                <p className="mt-4 text-lg font-semibold">Drag and drop files here</p>
                <p className="opacity-70 text-sm mt-2 mb-6">Images and videos supported</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className={`px-6 py-3 font-semibold ${styles.accent}`}>Choose Files</button>
              </div>
              {error && <div className="mt-4 p-4 bg-red-light border border-red/20 text-red text-sm rounded-xl">{error}</div>}
              {success && <div className="mt-4 p-4 bg-primary-light border border-primary/20 text-primary text-sm rounded-xl">Upload successful.</div>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
