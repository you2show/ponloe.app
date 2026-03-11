import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick01Icon, Alert02Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
              animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto
              ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : ''}
              ${toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' : ''}
            `}
          >
            {toast.type === 'success' && <HugeiconsIcon icon={Tick01Icon} strokeWidth={2} className="w-5 h-5 text-emerald-600" />}
            {toast.type === 'error' && <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="w-5 h-5 text-red-600" />}
            {toast.type === 'info' && <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="w-5 h-5 text-blue-600" />}
            <span className="font-khmer text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
