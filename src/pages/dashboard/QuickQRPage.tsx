import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QuickQRPage() {
  const [value, setValue] = React.useState('https://gerer-events.netlify.app');

  const handleDownload = () => {
    const svg = document.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `quick-qr-${Date.now()}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl mb-2 text-text-main">Quick QR Generator</h1>
      <p className="text-text-muted text-lg mb-8">
        Generate a generic event QR for flyers, posters, or quick sharing.
      </p>

      <div className="bg-surface rounded-3xl border border-border p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main">URL or text</label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://your-event-link"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main"
          />
        </div>

        <div className="bg-background rounded-2xl border border-border p-8 flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <QRCodeSVG value={value || ' '} size={220} level="H" />
          </div>
          <button
            onClick={handleDownload}
            className="bg-primary text-white hover:bg-primary-hover transition-all px-6 py-3 rounded-xl text-sm font-semibold"
          >
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}
