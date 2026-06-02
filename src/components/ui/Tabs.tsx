import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type Tab = { id: string; label: string; icon?: ReactNode };

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  variant?: 'segmented' | 'underline';
  /** Tighter vertical padding for sticky scroll headers. */
  compact?: boolean;
};

export function Tabs({ tabs, active, onChange, variant = 'underline', compact = false }: Props) {
  if (variant === 'segmented') {
    return (
      <div role="tablist" className="inline-flex rounded-full border border-divider bg-bg p-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] tracking-tightish transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
              active === t.id
                ? 'bg-bg font-bold text-ink-strong shadow-card'
                : 'font-semibold text-ink-subtle hover:text-ink',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div role="tablist" className="flex w-full items-end border-b border-divider">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'relative flex flex-1 items-center justify-center gap-1.5 px-2 text-[13px] tracking-tightish transition-colors',
            compact ? 'py-2' : 'py-3',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:rounded-md',
            active === t.id ? 'font-bold text-ink-strong' : 'font-semibold text-ink-subtle hover:text-ink',
          )}
        >
          <span className="flex items-center gap-1.5">
            {t.icon}
            {t.label}
          </span>
          <span
            className={cn(
              'absolute inset-x-2 -bottom-px h-[3px] rounded-t-full transition-colors',
              active === t.id ? 'bg-ink-strong' : 'bg-transparent',
            )}
          />
        </button>
      ))}
    </div>
  );
}
