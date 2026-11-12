import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { FeedbackContext, type ConfirmOptions, type ToastType } from './feedback';
import { Button, Modal, cx } from '../ui';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

/** Toast notifications + promise-based confirmation modal. */
export default function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), type === 'error' ? 7000 : 4000);
    },
    [dismiss],
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setConfirmState(null);
  };

  const api = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  const tones = {
    success: 'text-emerald-600',
    error: 'text-rose-600',
    info: 'text-indigo-600',
  };

  return (
    <FeedbackContext.Provider value={api}>
      {children}

      <Modal
        open={Boolean(confirmState)}
        onClose={() => settle(false)}
        title={confirmState?.title ?? ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => settle(false)}>
              Cancel
            </Button>
            <Button variant={confirmState?.danger ? 'danger' : 'primary'} onClick={() => settle(true)} autoFocus>
              {confirmState?.confirmLabel ?? 'Confirm'}
            </Button>
          </>
        }
      >
        <div className="flex gap-3">
          {confirmState?.danger && (
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
          )}
          <p className="text-sm text-slate-600 leading-relaxed">{confirmState?.message}</p>
        </div>
      </Modal>

      <div translate="no" className="notranslate fixed z-[300] bottom-4 right-4 left-4 sm:left-auto flex flex-col gap-2 items-stretch sm:items-end pointer-events-none" aria-live="polite">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex items-start gap-3 w-full sm:w-96 bg-white border border-slate-200 shadow-lg shadow-slate-900/10 rounded-xl px-4 py-3 animate-[toastIn_.2s_ease-out]"
            >
              <Icon className={cx('w-5 h-5 shrink-0 mt-px', tones[t.type])} />
              <p className="text-sm text-slate-700 flex-1 break-words">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </FeedbackContext.Provider>
  );
}
