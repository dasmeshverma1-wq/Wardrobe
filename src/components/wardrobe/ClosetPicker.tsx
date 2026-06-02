import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryFilterRow } from '@/components/wardrobe/CategoryFilterRow';
import { ItemCard } from '@/components/wardrobe/ItemCard';
import { SelectionBar } from '@/components/ui/SelectionBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import {
  FunnelIcon,
  HangerIcon,
  OutfitIcon,
  PlusIcon,
  SearchIcon,
} from '@/components/ui/Icon';
import {
  FilterSheet,
  activeFilterCount,
  type FilterState,
} from '@/components/wardrobe/FilterSheet';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useChrome } from '@/store/chromeStore';
import type { Category } from '@/types';
import { bucketForColor } from '@/lib/color';
import { cn } from '@/lib/cn';

type Props = {
  /** Primary action when user confirms selection. */
  onContinue: (selectedIds: string[]) => void;
  continueLabel?: string;
  /** Show link to add more items. */
  onAddItems?: () => void;
  emptyTitle?: string;
  emptyBody?: string;
};

/**
 * Multi-select closet grid — shared by Create Outfit and legacy closet select mode.
 */
export function ClosetPicker({
  onContinue,
  continueLabel = 'Continue',
  onAddItems,
  emptyTitle = 'Nothing in your closet yet',
  emptyBody = 'Import from Myntra or add photos to start building looks.',
}: Props) {
  const navigate = useNavigate();
  const items = useWardrobeStore((s) => s.items);
  const activeCategory = useWardrobeStore((s) => s.activeCategory);
  const setCategory = useWardrobeStore((s) => s.setCategory);
  const selectedIds = useWardrobeStore((s) => s.selectedIds);
  const toggleSelect = useWardrobeStore((s) => s.toggleSelect);
  const clearSelection = useWardrobeStore((s) => s.clearSelection);
  const setSelecting = useChrome((s) => s.setSelecting);

  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ color: 'all', source: 'all' });

  useEffect(() => {
    clearSelection();
  }, [clearSelection]);

  useEffect(() => {
    setSelecting(selectedIds.size > 0);
    return () => setSelecting(false);
  }, [selectedIds.size, setSelecting]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (activeCategory !== 'all' && it.category !== activeCategory) return false;
      if (filters.color !== 'all' && bucketForColor(it.dominantColor) !== filters.color) return false;
      if (filters.source === 'myntra' && it.source !== 'myntra') return false;
      if (filters.source === 'added' && it.source === 'myntra') return false;
      if (!q) return true;
      return (
        it.name?.toLowerCase().includes(q) ||
        it.brand?.toLowerCase().includes(q) ||
        it.category.includes(q)
      );
    });
  }, [items, activeCategory, filters, query]);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    for (const it of items) counts[it.category] = (counts[it.category] ?? 0) + 1;
    return counts;
  }, [items]);

  const selectedItems = useMemo(() => {
    const order = Array.from(selectedIds);
    return order
      .map((id) => items.find((it) => it.id === id))
      .filter((it): it is NonNullable<typeof it> => !!it);
  }, [items, selectedIds]);

  const selectionOrder = useMemo(() => {
    const map = new Map<string, number>();
    Array.from(selectedIds).forEach((id, index) => map.set(id, index + 1));
    return map;
  }, [selectedIds]);

  const filterBadge = activeFilterCount(filters);
  const showBar = selectedIds.size > 0;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<HangerIcon size={24} />}
        title={emptyTitle}
        body={emptyBody}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => navigate('/wardrobe/add?tab=cart')} leadingIcon={<PlusIcon size={18} />}>
              Import from Myntra
            </Button>
            {onAddItems && (
              <Button variant="secondary" onClick={onAddItems}>
                Add a photo
              </Button>
            )}
          </div>
        }
      />
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className={cn('flex min-h-0 flex-1 flex-col', showBar ? 'pb-48' : 'pb-6')}>
        <div className="sticky top-0 z-10 bg-bg px-5 pb-2 pt-1 shadow-[0_1px_0_var(--color-divider)]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
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
            active={activeCategory}
            onSelect={setCategory}
            counts={categoryCounts}
            totalCount={items.length}
          />
        </div>

        <div className="px-5 pt-3">
          {filteredItems.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-subtle">No items match your filters.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredItems.map((it) => (
                <ItemCard
                  key={it.id}
                  item={it}
                  selectable
                  selected={selectedIds.has(it.id)}
                  selectionIndex={selectionOrder.get(it.id)}
                  onClick={() => toggleSelect(it.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showBar && (
        <SelectionBar
          count={selectedIds.size}
          previews={selectedItems.map((it) => ({
            id: it.id,
            thumbnailDataUrl: it.thumbnailDataUrl,
            label: it.name ?? it.category,
          }))}
          ctaLabel={continueLabel}
          ctaIcon={<OutfitIcon size={16} />}
          onCta={() => onContinue(Array.from(selectedIds))}
          onCancel={clearSelection}
        />
      )}

      {!showBar && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-3">
          <p className="pointer-events-none text-center text-[12px] font-medium text-ink-subtle">
            Tap items to build your outfit
          </p>
        </div>
      )}

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onChange={setFilters}
      />
    </div>
  );
}
