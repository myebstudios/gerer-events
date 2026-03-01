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
      dropzone: 'border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 rounded-2xl',
      dropzoneActive: 'border-blue-500 bg-blue-50',
    },
    playful: {
      bg: 'bg-[#FFF9E6]',
      text: 'text-[#2D3748]',
      accent: 'bg-[#FF4F5A] text-white hover:bg-[#E03E48] rounded-full shadow-lg',
      font: 'font-display',
      hero: 'bg-[#FFC107]',
      heroText: 'text-[#2D3748]',
      input: 'bg-white border-2 border-[#2D3748] rounded-2xl focus:ring-4 focus:ring-[#FF4F5A]/20 focus:border-[#FF4F5A]',
      dropzone: 'border-4 border-dashed border-[#2D3748] hover:border-[#FF4F5A] bg-white hover:bg-[#FF4F5A]/5 rounded-[2rem]',
      dropzoneActive: 'border-[#FF4F5A] bg-[#FF4F5A]/10',
    },
    elegant: {
      bg: 'bg-[#111827]',
      text: 'text-[#F3F4F6]',
      accent: 'bg-[#D4AF37] text-[#111827] hover:bg-[#B5952F] rounded-none tracking-widest uppercase',
      font: 'font-serif',
      hero: 'bg-[#000000]',
      heroText: 'text-[#D4AF37]',
      input: 'bg-[#1F2937] border border-[#D4AF37]/30 rounded-none focus:border-[#D4AF37] text-white',
      dropzone: 'border border-dashed border-[#D4AF37]/50 hover:border-[#D4AF37] bg-[#1F2937] hover:bg-[#1F2937]/80 rounded-none',
      dropzoneActive: 'border-[#D4AF37] bg-[#D4AF37]/10',
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
                <h2 className="text-3xl md:text-4xl mb-2 font-bold">Verify Access</h2>
                <div className="h-1 w-12 bg-current opacity-20 mx-auto md:mx-0 mb-6 rounded-full"></div>
                <p className="opacity-70">Please enter your QR token to access the upload gallery.</p>
              </div>

              <form onSubmit={verifyGuest} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-70">QR Token *</label>
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
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2 rounded-lg">
                    <span className="material-symbols-outlined text-red-500">error</span>
                    {error}
                  </div>
                )}

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full transition-all px-8 py-4 font-bold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${styles.accent}`}
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
                <h2 className="text-3xl md:text-4xl mb-2 font-bold">Welcome, {guest.fullName.split(' ')[0]}</h2>
                <div className="h-1 w-12 bg-current opacity-20 mx-auto md:mx-0 mb-6 rounded-full"></div>
                <p className="opacity-70">Select or drag & drop your photos and videos below.</p>
              </div>

              <div 
                className={`transition-all duration-300 flex flex-col items-center justify-center p-12 text-center cursor-pointer relative overflow-hidden ${
                  dragActive ? styles.dropzoneActive : styles.dropzone
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
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2 rounded-lg">
                  <span className="material-symbols-outlined text-red-500">error</span>
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2 rounded-lg">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  Upload successful! Thank you for sharing.
                </div>
              )}

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setGuest(null)}
                  className="text-sm font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
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
