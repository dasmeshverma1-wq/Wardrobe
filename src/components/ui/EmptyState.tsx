import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  /**
   * `pulse` — concentric halos animate outward from the icon
   *   (Whering-style, signals "tap to start").
   * `tile`  — flat tinted rounded-square (compact, for inline empty states).
   * `plain` — text-only.
   */
  variant?: 'pulse' | 'tile' | 'plain';
  tone?: 'primary' | 'ai' | 'neutral';
};

const toneStyles = {
  primary: { halo: 'bg-primary/12', halo2: 'bg-primary/6', icon: 'bg-primary text-white' },
  ai: { halo: 'bg-accent-ai/15', halo2: 'bg-accent-ai/8', icon: 'bg-accent-ai text-white' },
  neutral: { halo: 'bg-ink/8', halo2: 'bg-ink/4', icon: 'bg-ink text-white' },
};

export function EmptyState({
  icon,
  title,
  body,
  action,
  variant = 'pulse',
  tone = 'primary',
}: Props) {
  const styles = toneStyles[tone];

  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && variant === 'pulse' && (
        <div className="relative mb-6 grid h-28 w-28 place-items-center pointer-events-none">
          {/* Outer halo */}
          <span
            className={cn(
              'absolute inset-0 rounded-full animate-empty-pulse-slow',
              styles.halo2,
            )}
          />
          {/* Middle halo */}
          <span
            className={cn(
              'absolute inset-3 rounded-full animate-empty-pulse',
              styles.halo,
            )}
          />
          {/* Inner solid */}
          <span
            className={cn(
              'relative grid h-14 w-14 place-items-center rounded-full shadow-card',
              styles.icon,
            )}
          >
            {icon}
          </span>
        </div>
      )}
      {icon && variant === 'tile' && (
        <div
          className={cn(
            'mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-border-subtle bg-bg',
            tone === 'primary'
              ? 'text-primary'
              : tone === 'ai'
              ? 'text-accent-ai'
              : 'text-ink-subtle',
          )}
        >
          {icon}
        </div>
      )}
      <h2 className="text-[17px] font-bold tracking-tightish text-ink-strong">{title}</h2>
      {body && (
        <p className="mt-1.5 max-w-[16rem] text-[13px] leading-[1.45] text-ink-subtle text-balance">
          {body}
        </p>
      )}
      {action && <div className="relative z-10 mt-5 touch-manipulation">{action}</div>}
    </div>
  );
}
