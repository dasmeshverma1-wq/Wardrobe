import { useMemo } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import {
  COLOR_SWATCH,
  BUCKET_LABELS,
  bucketForColor,
  type ColorBucket,
} from '@/lib/color';
import { useWardrobeStore } from '@/store/wardrobeStore';

export type Source = 'all' | 'past' | 'wishlist' | 'cart';
const SOURCE_LABEL: Record<Source, string> = {
  all: 'All sources',
  past: 'Purchased',
  wishlist: 'Wishlist',
  cart: 'Cart',
};

export type FilterState = {
  color: ColorBucket | 'all';
  source: Source;
};

/**
 * The number of non-default filter dimensions currently active.
 * Used to badge the trigger button in the toolbar.
 */
export function activeFilterCount(f: FilterState): number {
  let n = 0;
  if (f.color !== 'all') n += 1;
  if (f.source !== 'all') n += 1;
  return n;
}

export function FilterSheet({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const items = useWardrobeStore((s) => s.items);

  const colorBuckets = useMemo(() => {
    const counts = new Map<ColorBucket, number>();
    for (const it of items) {
      const b = bucketForColor(it.dominantColor);
      counts.set(b, (counts.get(b) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const sourceCounts = useMemo(() => {
    const counts = { past: 0, wishlist: 0, cart: 0 } as Record<'past' | 'wishlist' | 'cart', number>;
    for (const it of items) {
      if (it.source === 'myntra-past' || it.source === 'myntra' || it.source === 'seed') {
        counts.past += 1;
      } else if (it.source === 'myntra-wishlist') {
        counts.wishlist += 1;
      } else if (it.source === 'myntra-cart') {
        counts.cart += 1;
      }
    }
    return counts;
  }, [items]);

  const reset = () => onChange({ color: 'all', source: 'all' });
  const activeCount = activeFilterCount(value);

  return (
    <Sheet open={open} onClose={onClose} title="Filters" maxHeight="70vh">
      {/* Colour */}
      {colorBuckets.length > 0 && (
        <section className="pt-2">
          <p className="section-label mb-3">Colour</p>
          <div className="-mx-1 flex flex-wrap gap-2 px-1">
            <FilterPill
              active={value.color === 'all'}
              onClick={() => onChange({ ...value, color: 'all' })}
              label="Any"
            />
            {colorBuckets.map(([b, count]) => (
              <FilterPill
                key={b}
                active={value.color === b}
                onClick={() => onChange({ ...value, color: b })}
                label={BUCKET_LABELS[b]}
                count={count}
                swatch={COLOR_SWATCH[b]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Source */}
      <section className="pt-6">
        <p className="section-label mb-3">Source</p>
        <div className="-mx-1 flex flex-wrap gap-2 px-1">
          <FilterPill
            active={value.source === 'all'}
            onClick={() => onChange({ ...value, source: 'all' })}
            label={SOURCE_LABEL.all}
          />
          <FilterPill
            active={value.source === 'past'}
            onClick={() => onChange({ ...value, source: 'past' })}
            label={SOURCE_LABEL.past}
            count={sourceCounts.past}
          />
          <FilterPill
            active={value.source === 'wishlist'}
            onClick={() => onChange({ ...value, source: 'wishlist' })}
            label={SOURCE_LABEL.wishlist}
            count={sourceCounts.wishlist}
          />
          <FilterPill
            active={value.source === 'cart'}
            onClick={() => onChange({ ...value, source: 'cart' })}
            label={SOURCE_LABEL.cart}
            count={sourceCounts.cart}
          />
        </div>
      </section>

      <div className="sticky bottom-0 -mx-5 mt-8 flex items-center gap-2 border-t border-divider bg-bg px-5 pb-[calc(0.5rem+var(--safe-bottom))] pt-3">
        <Button variant="ghost" onClick={reset} disabled={activeCount === 0}>
          Reset
        </Button>
        <div className="flex-1" />
        <Button onClick={onClose}>
          {activeCount > 0 ? `Show results` : 'Done'}
        </Button>
      </div>
    </Sheet>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  swatch,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  swatch?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={count !== undefined ? `${label}, ${count} items` : label}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-2xl px-3 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        active
          ? 'border-2 border-ink-strong bg-bg font-bold text-ink-strong'
          : 'border border-border bg-bg font-semibold text-ink-subtle hover:text-ink',
      )}
    >
      {swatch && (
        <span
          className="inline-block h-4 w-4 rounded-full ring-1 ring-divider"
          style={{ background: swatch }}
        />
      )}
      <span className="text-[13px] font-semibold tracking-tightish">{label}</span>
      {typeof count === 'number' && (
        <span
          className={cn(
            'text-[10px] font-semibold tabular-nums',
            active ? 'text-ink-subtle' : 'text-ink-faint',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
