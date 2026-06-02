import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CloseIcon } from './Icon';

export type SelectionPreview = {
  id: string;
  thumbnailDataUrl: string;
  label?: string;
};

/**
 * Floating selection bar with picked-item previews, shown above the bottom nav.
 */
export function SelectionBar({
  count,
  previews = [],
  ctaLabel,
  ctaIcon,
  onCta,
  secondaryLabel,
  onSecondary,
  onCancel,
  hint,
}: {
  count: number;
  previews?: SelectionPreview[];
  ctaLabel: string;
  ctaIcon?: ReactNode;
  onCta: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onCancel: () => void;
  hint?: ReactNode;
}) {
  const visiblePreviews = previews.slice(0, 4);
  const overflow = previews.length - visiblePreviews.length;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30 px-4"
      style={{ bottom: '0.625rem' }}
      aria-hidden={count === 0}
      role="region"
      aria-label={`${count} items selected`}
    >
      <div className="pointer-events-auto animate-slide-up overflow-hidden rounded-3xl border border-border-subtle bg-bg shadow-pop">
        {hint && <div className="border-b border-divider px-4 py-2">{hint}</div>}

        {visiblePreviews.length > 0 && (
          <div className="flex items-center gap-2 border-b border-divider px-4 py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar">
              {visiblePreviews.map((item, index) => (
                <div
                  key={item.id}
                  className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 border-primary bg-primary-soft/40 p-1"
                  title={item.label}
                >
                  <img
                    src={item.thumbnailDataUrl}
                    alt={item.label ?? `Selected item ${index + 1}`}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-white">
                    {index + 1}
                  </span>
                </div>
              ))}
              {overflow > 0 && (
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border-subtle bg-bg-soft text-[11px] font-bold text-ink-subtle">
                  +{overflow}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-subtle transition-colors hover:bg-bg-soft"
            aria-label="Clear selection"
          >
            <CloseIcon size={18} />
          </button>

          <div className="min-w-0">
            <p className="text-[13px] font-bold tracking-tightish text-ink-strong">
              {count} selected
            </p>
            <p className="text-[11px] text-ink-subtle">Tap items to add or remove</p>
          </div>

          <div className="flex-1" />

          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className={cn(
                'inline-flex h-11 shrink-0 items-center gap-1.5 rounded-2xl border border-border-subtle px-3.5 text-[12px] font-bold tracking-tightish text-ink-strong',
                'transition-transform active:scale-[0.98] hover:bg-bg-soft',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              )}
            >
              {secondaryLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onCta}
            className={cn(
              'inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-primary px-4 text-[13px] font-bold tracking-tightish text-white shadow-fab',
              'transition-transform active:scale-[0.98] hover:bg-primary-dark',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            )}
          >
            {ctaIcon}
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
