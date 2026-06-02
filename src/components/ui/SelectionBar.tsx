import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CloseIcon } from './Icon';

export type SelectionPreview = {
  id: string;
  thumbnailDataUrl: string;
  label?: string;
};

/** Reserve space above bottom chrome when the compact bar is visible. */
export const SELECTION_BAR_SCROLL_PAD = 'pb-[5.5rem]';

/**
 * Compact floating selection bar — single row so the closet grid keeps maximum height.
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
  const visiblePreviews = previews.slice(0, 3);
  const overflow = previews.length - visiblePreviews.length;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30 px-3"
      style={{ bottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      aria-hidden={count === 0}
      role="region"
      aria-label={`${count} items selected`}
    >
      <div className="pointer-events-auto animate-slide-up overflow-hidden rounded-2xl border border-border-subtle bg-bg shadow-pop">
        {hint && <div className="border-b border-divider px-3 py-1.5 text-[11px]">{hint}</div>}

        <div className="flex items-center gap-2 px-2.5 py-2">
          <button
            type="button"
            onClick={onCancel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-subtle transition-colors hover:bg-bg-soft"
            aria-label="Clear selection"
          >
            <CloseIcon size={16} />
          </button>

          <p className="shrink-0 text-[13px] font-bold tabular-nums tracking-tightish text-ink-strong">
            {count} <span className="font-semibold text-ink-subtle">selected</span>
          </p>

          <div className="min-w-2 flex-1" />

          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className={cn(
                'inline-flex h-8 shrink-0 items-center rounded-xl border border-border-subtle px-2.5 text-[11px] font-bold tracking-tightish text-ink-strong',
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
              'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12px] font-bold tracking-tightish text-white',
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
