import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
          info: <Info className="w-4 h-4 text-sky-600 shrink-0" />,
        };

        const borderMap = {
          success: 'border-l-4 border-l-emerald-600',
          warning: 'border-l-4 border-l-amber-600',
          error: 'border-l-4 border-l-rose-600',
          info: 'border-l-4 border-l-sky-600',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white rounded-lg shadow-xl border border-slate-200 p-3.5 flex items-start gap-3 transition-all duration-200 transform translate-y-0 ${borderMap[toast.type]}`}
          >
            <div className="mt-0.5">{iconMap[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-semibold text-slate-900">{toast.title}</h5>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
