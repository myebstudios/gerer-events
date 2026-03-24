import * as React from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { sanitizeId, getStoredUserId } from '../../lib/id';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { Button, Input, Card, CardBody } from '@heroui/react';

export default function CheckInPage() {
  const { id } = useParams();
  const safeEventId = sanitizeId(id);

  if (!safeEventId) return <div className="p-8 text-text-muted font-medium">Invalid event link.</div>;
  const userId = getStoredUserId();
  const event = useQuery((api as any).events.getEvent, safeEventId && userId ? { eventId: safeEventId } : 'skip');
  const guests = useQuery((api as any).guests.getGuests, safeEventId && userId ? { eventId: safeEventId, hostId: userId } : 'skip');
  const checkIn = useMutation((api as any).guests.checkIn);

  const [searchQuery, setSearchQuery] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isScannerSupported, setIsScannerSupported] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const controlsRef = React.useRef<{ stop: () => void } | null>(null);
  const codeReaderRef = React.useRef<BrowserMultiFormatReader | null>(null);

  const showTemporaryMessage = (next: { type: 'success' | 'error'; text: string }) => {
    setMessage(next);
    window.setTimeout(() => setMessage(null), 3200);
  };

  const handleManualCheckIn = async (guestId: string, currentStatus: boolean) => {
    try {
      if (!userId) throw new Error('Not authenticated');
      await checkIn({ guestId, checkedIn: !currentStatus, hostId: userId });
      showTemporaryMessage({ type: 'success', text: `Guest ${!currentStatus ? 'checked in' : 'checked out'} successfully.` });
    } catch (error: any) {
      showTemporaryMessage({ type: 'error', text: error.message });
    }
  };

  const resolveTokenCheckIn = async (token: string) => {
    if (!guests) return;
    const normalized = token.trim();
    if (!normalized) {
      showTemporaryMessage({ type: 'error', text: 'Please enter a token.' });
      return;
    }

    const guest = guests.find((g: any) => g.qrToken === normalized);

    if (!guest) {
      showTemporaryMessage({ type: 'error', text: 'Invalid QR token or guest not found.' });
      setQrToken('');
      return;
    }

    if (guest.checkedIn) {
      showTemporaryMessage({ type: 'error', text: `${guest.fullName} is already checked in.` });
      setQrToken('');
      return;
    }

    await handleManualCheckIn(guest._id, false);
    setQrToken('');
  };

  const handleQRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resolveTokenCheckIn(qrToken);
  };

  const stopScanner = React.useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    codeReaderRef.current = null;
    setIsScanning(false);
  }, []);

  React.useEffect(() => {
    return () => stopScanner();
  }, [stopScanner]);

  const startScanner = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
      setIsScannerSupported(false);
      setCameraError('Camera scanner is not supported on this device/browser.');
      return;
    }

    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const preferredDeviceId = devices.find((d) => /back|rear|environment/i.test(d.label))?.deviceId ?? devices[0]?.deviceId;

      if (!preferredDeviceId) {
        throw new Error('No camera found on this device.');
      }

      setIsScanning(true);
      controlsRef.current = await codeReader.decodeFromVideoDevice(preferredDeviceId, videoRef.current, async (result, error) => {
        if (result) {
          const text = result.getText();
          stopScanner();
          await resolveTokenCheckIn(text);
          return;
        }

        if (error && !(error instanceof NotFoundException)) {
          console.error(error);
        }
      });
    } catch (error: any) {
      console.error(error);
      stopScanner();
      setCameraError(error?.message || 'Unable to access camera scanner.');
    }
  };

  if (guests === undefined || event === undefined) return <div className="p-8 text-text-muted font-medium">Loading...</div>;

  const filteredGuests = guests.filter((g: any) =>
    g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <Link to={`/dashboard/events/${safeEventId}`} className="text-text-muted hover:text-primary text-sm font-semibold flex items-center gap-2 mb-6 transition-colors w-fit">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Event
        </Link>
        <h1 className="font-display text-3xl md:text-4xl text-text-main mb-2">Check-in Scanner</h1>
        <p className="text-text-muted">{event?.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <Card className="bg-surface border border-border rounded-2xl shadow-[var(--shadow-card)]">
          <CardBody className="p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

            <div className="w-full max-w-md relative z-10 flex flex-col items-center">
              <div className="w-full aspect-square max-w-[320px] border-2 border-dashed border-primary/30 rounded-2xl overflow-hidden mb-6 bg-primary/5 backdrop-blur-sm flex items-center justify-center relative">
                {isScanning ? (
                  <>
                    <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline autoPlay />
                    <div className="absolute inset-0 border-[3px] border-white/70 rounded-2xl pointer-events-none m-6"></div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      Point camera at guest QR
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <span className="material-symbols-outlined text-6xl text-primary/40 mb-4">qr_code_scanner</span>
                    <p className="text-sm font-semibold text-text-muted">{isScannerSupported ? 'Ready to scan with camera' : 'Camera scanner unavailable'}</p>
                    <p className="text-xs text-text-subtle mt-2">Use the camera for instant QR check-in, or verify a token manually below.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mb-6 w-full max-w-[320px]">
                {!isScanning ? (
                  <Button color="primary" onPress={startScanner} className="flex-1 font-semibold rounded-full">
                    Start Camera Scanner
                  </Button>
                ) : (
                  <Button variant="bordered" onPress={stopScanner} className="flex-1 font-semibold rounded-full">
                    Stop Scanner
                  </Button>
                )}
              </div>

              {cameraError && (
                <div className="w-full max-w-[360px] mb-4 p-4 text-sm font-medium text-center rounded-xl bg-red-light text-red border border-red/20">
                  {cameraError}
                </div>
              )}

              <div className="w-full max-w-sm relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4 text-center">Or enter token manually</p>
                <form onSubmit={handleQRSubmit} className="flex gap-2 items-center">
                  <Input
                    value={qrToken}
                    onValueChange={setQrToken}
                    placeholder="Token (e.g., evt_...)"
                    variant="bordered"
                    className="flex-1"
                  />
                  <Button type="submit" color="primary" className="font-semibold rounded-full px-6">
                    Verify
                  </Button>
                </form>

                {message && (
                  <div className={`mt-4 p-4 text-sm font-medium text-center rounded-xl ${message.type === 'success' ? 'bg-primary-light text-primary border border-primary/20' : 'bg-red-light text-red border border-red/20'}`}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-surface border border-border rounded-2xl shadow-[var(--shadow-card)] flex flex-col h-[600px] lg:h-auto">
          <CardBody className="p-0 flex flex-col h-full">
            <div className="p-6 border-b border-border">
              <h3 className="font-display text-2xl text-text-main mb-4">Guest List</h3>
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                variant="bordered"
                startContent={<span className="material-symbols-outlined text-text-subtle">search</span>}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredGuests.map((guest: any) => (
                <div key={guest._id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/30 transition-all bg-background/50">
                  <div>
                    <p className="font-semibold text-text-main">{guest.fullName}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {guest.attendanceStatus} {guest.plusOnes > 0 && `• +${guest.plusOnes} Guests`}
                    </p>
                  </div>
                  <Button
                    onPress={() => handleManualCheckIn(guest._id, guest.checkedIn)}
                    color={guest.checkedIn ? 'success' : 'primary'}
                    variant={guest.checkedIn ? 'flat' : 'solid'}
                    className="text-xs font-semibold rounded-full"
                    startContent={guest.checkedIn ? <span className="material-symbols-outlined text-sm">check_circle</span> : undefined}
                  >
                    {guest.checkedIn ? 'Checked In' : 'Check In'}
                  </Button>
                </div>
              ))}
              {filteredGuests.length === 0 && (
                <div className="text-center py-12 text-text-muted">
                  <span className="material-symbols-outlined text-4xl text-text-subtle/30 mb-2">search_off</span>
                  <p>No guests found matching your search.</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
