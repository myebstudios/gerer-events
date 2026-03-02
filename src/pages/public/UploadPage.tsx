import * as React from 'react';
import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion } from 'framer-motion';
import { resolveTemplateTone } from '../../lib/catalog';

export default function UploadPage() {
  const { id } = useParams();
  const event = useQuery((api as any).events.getEvent, id ? { eventId: id } : "skip");

  const [qrToken, setQrToken] = useState('');
  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const verifyGuestQuery = useQuery((api as any).guests.verifyGuest, qrToken ? { eventId: id, qrToken } : "skip");
  const generateUploadUrl = useMutation((api as any).media.generateUploadUrl);
  const saveMedia = useMutation((api as any).media.saveMedia);

  const verifyGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (verifyGuestQuery === undefined) {
        throw new Error('Verifying...');
      }
      if (!verifyGuestQuery) {
        throw new Error('Invalid QR Token or guest not found.');
      }
      setGuest(verifyGuestQuery);
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

        // 1. Get upload URL
        const postUrl = await generateUploadUrl();

        // 2. Upload file
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        // 3. Save media
        await saveMedia({
          eventId: id,
          guestId: guest._id,
          storageId,
          fileType: file.type,
        });
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  if (event === undefined) return <div className="flex h-screen items-center justify-center bg-background"><div className="animate-pulse text-text-muted font-medium">Loading...</div></div>;
  if (!event) return <div className="flex h-screen items-center justify-center bg-background text-text-muted font-medium">Event not found</div>;

  const template = resolveTemplateTone(event.templateId);

  // Template Styles – modernized
  const templateStyles = {
    minimal: {
      bg: 'bg-surface',
      text: 'text-text-main',
      accent: 'bg-primary text-white hover:bg-primary-hover rounded-full shadow-sm',
      font: 'font-sans',
      hero: 'bg-background',
      heroText: 'text-text-main',
      input: 'bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary',
      dropzone: 'border-2 border-dashed border-border hover:border-primary bg-background hover:bg-primary/5 rounded-2xl',
      dropzoneActive: 'border-primary bg-primary/5',
    },
    playful: {
      bg: 'bg-accent-light',
      text: 'text-text-main',
      accent: 'bg-orange text-white hover:bg-orange/90 rounded-full shadow-lg',
      font: 'font-display',
      hero: 'bg-accent',
      heroText: 'text-text-main',
      input: 'bg-white border-2 border-text-main/20 rounded-2xl focus:ring-4 focus:ring-orange/20 focus:border-orange',
      dropzone: 'border-4 border-dashed border-text-main/30 hover:border-orange bg-white hover:bg-orange/5 rounded-[2rem]',
      dropzoneActive: 'border-orange bg-orange/10',
    },
    elegant: {
      bg: 'bg-text-main',
      text: 'text-white',
      accent: 'bg-accent text-text-main hover:bg-accent-hover rounded-full tracking-widest uppercase shadow-md',
      font: 'font-display',
      hero: 'bg-black',
      heroText: 'text-accent',
      input: 'bg-white/10 border border-accent/30 rounded-xl focus:border-accent text-white',
      dropzone: 'border border-dashed border-accent/40 hover:border-accent bg-white/5 hover:bg-accent/5 rounded-2xl',
      dropzoneActive: 'border-accent bg-accent/10',
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
          <Link to={`/e/${id}`} className={`hover:opacity-70 text-sm font-semibold flex items-center gap-2 mb-12 transition-colors w-fit ${styles.heroText}`}>
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Event
          </Link>
        </div>

        <div className="relative z-10 mt-auto">
          <p className={`text-sm uppercase tracking-[0.3em] mb-4 font-bold opacity-80 ${styles.heroText}`}>Share the magic</p>
          <h1 className={`text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight font-bold ${styles.heroText}`}>
            Upload Memories
          </h1>
          <p className={`font-medium opacity-90 leading-relaxed max-w-md ${styles.heroText}`}>
            Help us capture every moment of {event.title}. Upload your photos and videos to our shared gallery.
          </p>
        </div>
      </div>

      {/* Right Side - Form/Upload */}
      <div className={`w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-8 md:p-12 lg:p-16 ${styles.bg}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-xl"
        >
          {!guest ? (
            <div>
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl mb-3 font-bold">Verify Access</h2>
                <div className="h-1 w-12 bg-primary rounded-full mx-auto md:mx-0 mb-6"></div>
                <p className="opacity-70">Please enter your QR token to access the upload gallery.</p>
              </div>

              <form onSubmit={verifyGuest} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-70">QR Token *</label>
                  <input
                    required
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    placeholder="evt_..."
                    className={`w-full px-4 py-3 outline-none transition-all ${styles.input}`}
                  />
                  <p className="text-xs opacity-60 mt-2">You can find this on your digital pass.</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-light border border-red/20 text-red text-sm flex items-center gap-2 rounded-xl">
                    <span className="material-symbols-outlined text-red">error</span>
                    {error}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full transition-all px-8 py-4 font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${styles.accent}`}
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                        Verifying...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl mb-3 font-bold">Welcome, {guest.fullName.split(' ')[0]}</h2>
                <div className="h-1 w-12 bg-primary rounded-full mx-auto md:mx-0 mb-6"></div>
                <p className="opacity-70">Select or drag & drop your photos and videos below.</p>
              </div>

              <div
                className={`transition-all duration-300 flex flex-col items-center justify-center p-12 text-center cursor-pointer relative overflow-hidden ${dragActive ? styles.dropzoneActive : styles.dropzone
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={loading}
                />

                {loading ? (
                  <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-6xl animate-spin mb-4 opacity-70">sync</span>
                    <h3 className="text-xl mb-2 font-bold">Uploading...</h3>
                    <p className="text-sm opacity-70">Please don't close this window.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-50 transition-colors">cloud_upload</span>
                    <h3 className="text-xl mb-2 font-bold">Click or Drag to Upload</h3>
                    <p className="text-sm opacity-70">Supports JPG, PNG, MP4 (Max 50MB)</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-light border border-red/20 text-red text-sm flex items-center gap-2 rounded-xl">
                  <span className="material-symbols-outlined text-red">error</span>
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-6 p-4 bg-primary-light border border-primary/20 text-primary text-sm flex items-center gap-2 rounded-xl">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  Upload successful! Thank you for sharing.
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  onClick={() => setGuest(null)}
                  className="text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity"
                >
                  Not {guest.fullName.split(' ')[0]}? Sign out
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
