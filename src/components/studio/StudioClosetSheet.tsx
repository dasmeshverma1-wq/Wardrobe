import { useMemo, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Chip } from '@/components/ui/Chip';
import { zoneAcceptsItem, type ZoneId } from '@/components/studio/MannequinZones';
import { CATEGORY_ORDER, CATEGORY_LABELS, type Category, type WardrobeItem } from '@/types';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  items: WardrobeItem[];
  onPick: (item: WardrobeItem) => void;
  /** Items already placed in this slot — shown dimmed. */
  onCanvasIds?: Set<string>;
  /** When set, only items valid for this outfit slot are shown. */
  filterZone?: ZoneId;
  title?: string;
};

/**
 * Half-card closet picker for adding pieces to an outfit slot.
 */
export function StudioClosetSheet({
  open,
  onClose,
  items,
  onPick,
  onCanvasIds,
  filterZone,
  title = 'Add from closet',
}: Props) {
  const [category, setCategory] = useState<Category | 'all'>('all');

  const zoneItems = useMemo(() => {
    if (!filterZone) return items;
    return items.filter((it) => zoneAcceptsItem(filterZone, it));
  }, [items, filterZone]);

  const filtered = useMemo(() => {
    if (category === 'all') return zoneItems;
    return zoneItems.filter((it) => it.category === category);
  }, [zoneItems, category]);

  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = {};
    for (const it of zoneItems) c[it.category] = (c[it.category] ?? 0) + 1;
    return c;
  }, [zoneItems]);

  return (
    <Sheet open={open} onClose={onClose} title={title} maxHeight="58vh">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto no-scrollbar pb-3">
        <Chip active={category === 'all'} onClick={() => setCategory('all')}>
          All ({zoneItems.length})
        </Chip>
        {CATEGORY_ORDER.map((cat) =>
          counts[cat] ? (
            <Chip key={cat} active={category === cat} onClick={() => setCategory(cat)}>
              {CATEGORY_LABELS[cat]} ({counts[cat]})
            </Chip>
          ) : null,
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-ink-faint">Nothing in this category yet.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2 pb-2">
          {filtered.map((it) => {
            const onCanvas = onCanvasIds?.has(it.id);
            return (
              <li key={it.id}>
                <button
                  type="button"
                  disabled={onCanvas}
                  onClick={() => {
                    onPick(it);
                    onClose();
                  }}
                  aria-label={
                    onCanvas
                      ? `${it.name ?? it.category} already in this slot`
                      : `Add ${it.name ?? it.category} to outfit`
                  }
                  className={cn(
                    'flex w-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg p-2 text-left transition-transform',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    onCanvas ? 'opacity-45' : 'active:scale-[0.98] hover:border-border',
                  )}
                >
                  <div className="aspect-square w-full">
                    <img
                      src={it.thumbnailDataUrl}
                      alt=""
                      className="h-full w-full object-contain"
                      draggable={false}
                    />
                  </div>
                  <span className="mt-1 truncate text-[10px] font-semibold text-ink">
                    {it.brand ?? it.name ?? CATEGORY_LABELS[it.category]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
