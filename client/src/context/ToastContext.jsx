import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all animate-fade-in ${
              t.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
              t.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' :
              t.type === 'warning' ? 'bg-amber-50 text-amber-900 border-amber-200' :
              'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <span className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600" />}
              {t.type === 'error' && <AlertCircle size={18} className="text-rose-600" />}
              {t.type === 'warning' && <AlertTriangle size={18} className="text-amber-600" />}
              {t.type === 'info' && <Info size={18} className="text-blue-600" />}
            </span>
            <div className="flex-1 leading-snug">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 transition shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
