'use client';

import React from 'react';
import { useReclaim } from '@/context/ReclaimContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useReclaim();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg border shadow-modal bg-white flex items-start gap-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'border-success-200 text-neutral-900'
                : isWarning
                ? 'border-warning-200 text-neutral-900'
                : isError
                ? 'border-danger-200 text-neutral-900'
                : 'border-brand-200 text-neutral-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-success-600" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-warning-600" />}
              {isError && <XCircle className="w-4 h-4 text-danger-600" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-brand-600" />}
            </div>

            <div className="flex-1 text-xs">
              <p className="font-semibold text-neutral-900">{toast.title}</p>
              <p className="text-neutral-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-700 shrink-0 p-1"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
