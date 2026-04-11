import * as React from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { Button } from '@heroui/react';

type Props = {
  onResolveToken: (token: string) => Promise<void>;
};

export default function CheckInScanner({ onResolveToken }: Props) {
  const [isScannerSupported, setIsScannerSupported] = React.useState(true);
  const [isScanning, setIsScanning] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = React.useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const controlsRef = React.useRef<{ stop: () => void } | null>(null);
  const codeReaderRef = React.useRef<BrowserMultiFormatReader | null>(null);

  const stopScanner = React.useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    codeReaderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsScanning(false);
  }, []);

  React.useEffect(() => () => stopScanner(), [stopScanner]);

  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        if (!navigator.permissions || !('query' in navigator.permissions)) return;
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setCameraPermission(result.state as any);
        result.onchange = () => setCameraPermission(result.state as any);
      } catch {}
    };
    void checkPermission();
  }, []);

  const startScanner = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
      setIsScannerSupported(false);
      setCameraError('Camera scanner is not supported on this device/browser.');
      return;
    }
    try {
      if (typeof window !== 'undefined' && !window.isSecureContext) throw new Error('Camera access requires a secure HTTPS context.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = stream;
      setCameraPermission('granted');
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => {});
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      setIsScanning(true);
      controlsRef.current = await codeReader.decodeFromVideoElement(videoRef.current, async (result, error) => {
        if (result) {
          const text = result.getText();
          stopScanner();
          await onResolveToken(text);
          return;
        }
        if (error && !(error instanceof NotFoundException)) console.error(error);
      });
    } catch (error: any) {
      console.error(error);
      stopScanner();
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') return setCameraError('Camera permission was denied. In Chrome: Site settings → Camera → Allow, then reload this page.');
      if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') return setCameraError('No camera was found on this device.');
      if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') return setCameraError('Camera is busy or unavailable. Close other apps using the camera and try again.');
      setCameraError(error?.message || 'Unable to access camera scanner.');
    }
  };

  return (
    <>
      <div className="w-full aspect-square max-w-[320px] border-2 border-dashed border-primary/30 rounded-2xl overflow-hidden mb-6 bg-primary/5 backdrop-blur-sm flex items-center justify-center relative">
        {isScanning ? <><video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline autoPlay /><div className="absolute inset-0 border-[3px] border-white/70 rounded-2xl pointer-events-none m-6"></div><div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">Point camera at guest QR</div></> : <div className="flex flex-col items-center justify-center text-center px-4"><span className="material-symbols-outlined text-6xl text-primary/40 mb-4">qr_code_scanner</span><p className="text-sm font-semibold text-text-muted">{isScannerSupported ? 'Ready to scan with camera' : 'Camera scanner unavailable'}</p><p className="text-xs text-text-subtle mt-2">Use the camera for instant QR check-in, or verify a token manually below.</p><p className="text-[11px] text-text-subtle mt-3">Permission status: <span className="font-semibold capitalize">{cameraPermission}</span></p></div>}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-[360px]">{!isScanning ? <Button color="primary" onPress={startScanner} className="flex-1 font-semibold rounded-full">Start Camera Scanner</Button> : <Button variant="bordered" onPress={stopScanner} className="flex-1 font-semibold rounded-full">Stop Scanner</Button>}</div>
      {cameraError && <div className="w-full max-w-[360px] mb-4 p-4 text-sm font-medium text-center rounded-xl bg-red-light text-red border border-red/20">{cameraError}</div>}
      <div className="w-full max-w-[360px] mb-4 p-4 text-xs text-text-muted rounded-xl bg-background border border-border space-y-2"><p className="font-semibold text-text-main">If camera still does not open:</p><ol className="list-decimal pl-4 space-y-1"><li>Open Chrome site settings for this page</li><li>Set Camera to <span className="font-semibold">Allow</span></li><li>Check Android app permissions for Chrome, camera must be enabled</li><li>Reload and try again</li></ol></div>
    </>
  );
}
