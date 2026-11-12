import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}

export interface FeedbackApi {
  toast: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const FeedbackContext = createContext<FeedbackApi | null>(null);

function useFeedback(): FeedbackApi {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('FeedbackProvider missing');
  return ctx;
}

export function useToast() {
  return useFeedback().toast;
}

export function useConfirm() {
  return useFeedback().confirm;
}
