import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Myntra-style filter chip:
 *   - corner radius 16
 *   - selected = 2px ink border + ink text on white
 *   - default  = 1px Grey/300 hairline + Grey/600 text on white
 */

type Props = {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  count?: number;
  size?: 'sm' | 'md';
  leadingIcon?: ReactNode;
  uppercase?: boolean;
};

export function Chip({ active, onClick, children, count, size = 'md', leadingIcon, uppercase }: Props) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-bg transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        size === 'md' ? 'h-8 px-3 text-[13px]' : 'h-7 px-2.5 text-xs',
        active
          ? 'border-2 border-ink-strong font-bold text-ink-strong'
          : 'border border-border font-semibold text-ink-subtle hover:text-ink',
      )}
    >
      {leadingIcon}
      <span
        className={cn(
          'tracking-tightish',
          uppercase && 'uppercase tracking-widish text-[11px]',
        )}
      >
        {children}
      </span>
      {typeof count === 'number' && (
        <span
          className={cn(
            'rounded-full text-[10px] font-semibold tabular-nums',
            active ? 'text-ink-subtle' : 'text-ink-faint',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
