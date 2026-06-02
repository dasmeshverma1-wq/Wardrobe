import { useMemo } from 'react';
import { COLOR_SWATCH, BUCKET_LABELS, bucketForColor, type ColorBucket } from '@/lib/color';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { cn } from '@/lib/cn';

type Props = {
  active: ColorBucket | 'all';
  onChange: (b: ColorBucket | 'all') => void;
};

export { type ColorBucket };

export function ColorFilter({ active, onChange }: Props) {
  const items = useWardrobeStore((s) => s.items);
  const buckets = useMemo(() => {
    const counts = new Map<ColorBucket, number>();
    for (const it of items) {
      const b = bucketForColor(it.dominantColor);
      counts.set(b, (counts.get(b) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  if (buckets.length <= 1) return null;

  return (
    <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1">
      <button
        onClick={() => onChange('all')}
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded-2xl px-2.5 text-[11px] font-semibold tracking-tightish transition-colors',
          active === 'all'
            ? 'border-2 border-ink-strong bg-bg font-bold text-ink-strong'
            : 'border border-border bg-bg font-semibold text-ink-faint hover:text-ink',
        )}
      >
        All colours
      </button>
      {buckets.map(([b, count]) => (
        <button
          key={b}
          onClick={() => onChange(b)}
          aria-label={BUCKET_LABELS[b]}
          className={cn(
            'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-2xl px-1.5 pr-2.5 transition-colors',
            active === b
              ? 'border-2 border-ink-strong bg-bg'
              : 'border border-border bg-bg text-ink-subtle',
          )}
        >
          <span
            className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-divider"
            style={{ background: COLOR_SWATCH[b] }}
          />
          <span className="text-[11px] font-semibold tabular-nums">{count}</span>
        </button>
      ))}
    </div>
  );
}
