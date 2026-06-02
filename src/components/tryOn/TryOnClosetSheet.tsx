import { useEffect, useMemo, useState } from 'react';
import { Sheet, HALF_SHEET_HEIGHT } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { CategoryFilterRow } from '@/components/wardrobe/CategoryFilterRow';
import { ItemCard } from '@/components/wardrobe/ItemCard';
import {
  FilterSheet,
  activeFilterCount,
  type FilterState,
} from '@/components/wardrobe/FilterSheet';
import { FunnelIcon, SearchIcon } from '@/components/ui/Icon';
import { bucketForColor } from '@/lib/color';
import { sortWardrobeByRecent } from '@/lib/wardrobeRecent';
import { cn } from '@/lib/cn';
import type { Category, WardrobeItem } from '@/types';

type Props = {
  open: boolean;
  onClose: () => void;
  items: WardrobeItem[];
  selectedIds: ReadonlySet<string>;
  onToggle: (item: WardrobeItem) => void;
};

/**
 * Half-card closet picker for AI Try-On — search, category pills, filters, multi-select.
 */
export function TryOnClosetSheet({
  open,
  onClose,
  items,
  selectedIds,
  onToggle,
}: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ color: 'all', source: 'all' });

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setCategory('all');
    setFilters({ color: 'all', source: 'all' });
  }, [open]);

  const sortedItems = useMemo(() => sortWardrobeByRecent(items), [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedItems.filter((it) => {
      if (category !== 'all' && it.category !== category) return false;
      if (filters.color !== 'all' && bucketForColor(it.dominantColor) !== filters.color) return false;
      if (filters.source === 'past' && !(it.source === 'myntra-past' || it.source === 'myntra' || it.source === 'seed')) return false;
      if (filters.source === 'wishlist' && it.source !== 'myntra-wishlist') return false;
      if (filters.source === 'cart' && it.source !== 'myntra-cart') return false;
      if (!q) return true;
      return (
        it.name?.toLowerCase().includes(q) ||
        it.brand?.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q)
      );
    });
  }, [sortedItems, category, filters, query]);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    for (const it of sortedItems) counts[it.category] = (counts[it.category] ?? 0) + 1;
    return counts;
  }, [sortedItems]);

  const filterBadge = activeFilterCount(filters);
  const selectedCount = selectedIds.size;

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title="Add from closet"
        maxHeight={HALF_SHEET_HEIGHT}
        height={HALF_SHEET_HEIGHT}
        showCloseButton
        contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden px-0"
        footer={
          <Button fullWidth onClick={onClose}>
            {selectedCount > 0 ? `Done · ${selectedCount} selected` : 'Done'}
          </Button>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 space-y-2 border-b border-divider px-5 pb-3">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <SearchIcon
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your closet"
                  aria-label="Search your closet"
                  className="search-field h-10 w-full pl-10 pr-3 tracking-tightish placeholder:text-ink-ghost focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                aria-label="Open filters"
                className={cn(
                  'relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors',
                  filterBadge > 0
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-bg text-ink-subtle',
                )}
              >
                <FunnelIcon size={16} />
              </button>
            </div>
            <CategoryFilterRow
              active={category}
              onSelect={setCategory}
              counts={categoryCounts}
              totalCount={sortedItems.length}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
            {filteredItems.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-ink-subtle">
                No items match your search or filters.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 pb-2">
                {filteredItems.map((it) => (
                  <ItemCard
                    key={it.id}
                    item={it}
                    selectable
                    selected={selectedIds.has(it.id)}
                    onClick={() => onToggle(it)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Sheet>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onChange={setFilters}
      />
    </>
  );
}
