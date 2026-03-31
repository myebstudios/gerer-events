import * as React from 'react';

type ToastTone = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextType = {
  pushToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = React.createContext<ToastContextType>({
  pushToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const pushToast = React.useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[min(92vw,380px)]">
        {toasts.map((toast) => {
          const toneStyles = {
            success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
            error: 'bg-red-50 border-red-200 text-red-700',
            info: 'bg-zinc-900 border-zinc-800 text-white',
          }[toast.tone];

          return (
            <div key={toast.id} className={`border rounded-2xl px-4 py-3 shadow-lg backdrop-blur ${toneStyles}`}>
              <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
