import { create } from 'zustand';
import { cn } from '@/lib/cn';
import { selectHideBottomNav, useChrome } from '@/store/chromeStore';

type ToastVariant = 'default' | 'success' | 'warning';

type ToastItem = { id: string; message: string; variant: ToastVariant };

type State = {
  toasts: ToastItem[];
  push: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
};

export const useToasts = create<State>((set) => ({
  toasts: [],
  push: (message, variant = 'default') => {
    const id = Math.random().toString(36).slice(2, 9);
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string, variant?: ToastVariant) {
  useToasts.getState().push(message, variant);
}

export function ToastHost() {
  const toasts = useToasts((s) => s.toasts);
  const hideBottomNav = useChrome(selectHideBottomNav);
  const dismiss = useToasts((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 z-[9999] flex flex-col items-center gap-2 px-page',
        // Sit clearly above whatever's at the bottom — bottom nav (~68px) or floating
        // selection bar (~72px). Same offset works for both because we hide
        // bottom nav while selecting.
        hideBottomNav ? 'bottom-[104px]' : 'bottom-[112px]',
      )}
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto max-w-full rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold tracking-tightish animate-rise-in flex items-center gap-2 transition-all active:scale-[0.98]',
            t.variant === 'success' && 'bg-white/95 border-emerald-500/25 text-[#262a39]',
            t.variant === 'warning' && 'bg-white/95 border-amber-500/25 text-[#262a39]',
            t.variant === 'default' && 'bg-white/95 border-slate-200 text-[#262a39]',
          )}
          style={{
            boxShadow: '0 4px 16px rgba(23, 26, 39, 0.08)',
          }}
        >
          {t.variant === 'success' && (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <svg className="h-[9px] w-[9px]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
          )}
          {t.variant === 'warning' && (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[9px] font-sans">
              !
            </span>
          )}
          <span>{t.message}</span>
        </button>
      ))}
    </div>
  );
}
