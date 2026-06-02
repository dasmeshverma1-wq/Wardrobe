import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

type Shortcut = {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

export function HomeShortcutRow({ shortcuts }: { shortcuts: Shortcut[] }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto py-1 no-scrollbar">
      {shortcuts.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={s.onClick}
          className={cn(
            'inline-flex shrink-0 items-center gap-2.5 rounded-full border border-line bg-bg px-4 py-3',
            'text-[13px] font-semibold tracking-tightish text-ink-strong transition-transform active:scale-[0.98]',
            'shadow-[0_1px_2px_rgba(38,42,57,0.04)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          )}
        >
          <span className="text-primary [&_svg]:stroke-[1.75]">{s.icon}</span>
          {s.label}
        </button>
      ))}
    </div>
  );
}
