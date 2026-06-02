import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { TopNav } from '@/components/ui/TopNav';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { FAB } from '@/components/ui/FAB';
import { EmptyState } from '@/components/ui/EmptyState';
import { SelectionBar } from '@/components/ui/SelectionBar';
import {
  PlusIcon,
  SparklesIcon,
  PlanLookIcon,
  OutfitIcon,
  CollectionIcon,
  HangerIcon,
  SearchIcon,
  FunnelIcon,
  WandIcon,
} from '@/components/ui/Icon';
import { ProfileNavButton } from '@/components/ui/ProfileNavButton';
import { ItemCard } from '@/components/wardrobe/ItemCard';
import { OutfitCard } from '@/components/wardrobe/OutfitCard';
import { AddItemSheet } from '@/components/wardrobe/AddItemSheet';
import { CategoryFilterRow } from '@/components/wardrobe/CategoryFilterRow';
import { SettingsSheet } from '@/components/wardrobe/SettingsSheet';
import { CollectionCard } from '@/components/wardrobe/CollectionCard';
import { CreateCollectionSheet } from '@/components/wardrobe/CreateCollectionSheet';
import { CollectionDetailSheet } from '@/components/wardrobe/CollectionDetailSheet';
import { useCollectionsStore, type Collection } from '@/store/collectionsStore';
import {
  FilterSheet,
  activeFilterCount,
  type FilterState,
} from '@/components/wardrobe/FilterSheet';
import { QuotaBanner } from '@/components/wardrobe/QuotaBanner';
import { WeatherChip } from '@/components/planner/WeatherChip';
import { usePlannerWeather } from '@/components/planner/usePlannerWeather';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useChrome } from '@/store/chromeStore';
import type { Category, ForecastDay, Outfit } from '@/types';
import { toast } from '@/components/ui/Toast';
import { warmBgRemoval } from '@/lib/bgRemoval';
import { track } from '@/lib/telemetry';
import { navigateToTryOn, tryOnStateFromItems } from '@/lib/tryOnNavigation';
import { useVisibleOutfits, useTryOnPersona } from '@/lib/tryOnPersona';
import { bucketForColor } from '@/lib/color';
import { cn } from '@/lib/cn';

type Segment = 'closet' | 'outfits' | 'collections';

export function WardrobeHome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const items = useWardrobeStore((s) => s.items);
  const activeCategory = useWardrobeStore((s) => s.activeCategory);
  const setCategory = useWardrobeStore((s) => s.setCategory);
  const selectedIds = useWardrobeStore((s) => s.selectedIds);
  const toggleSelect = useWardrobeStore((s) => s.toggleSelect);
  const clearSelection = useWardrobeStore((s) => s.clearSelection);
  const outfits = useVisibleOutfits();
  const { hasTryOnProfile, isFirstTimeUser } = useTryOnPersona();
  const plannerEntries = usePlannerStore((s) => s.entries);
  const collections = useCollectionsStore((s) => s.collections);
  const setSelecting = useChrome((s) => s.setSelecting);
  const { forecastFor } = usePlannerWeather();

  const [segment, setSegment] = useState<Segment>('closet');
  const [addOpen, setAddOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ color: 'all', source: 'all' });

  // Collections
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [openCollection, setOpenCollection] = useState<Collection | null>(null);
  const [addItemsTo, setAddItemsTo] = useState<Collection | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [headerCompact, setHeaderCompact] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'outfits' || tab === 'collections' || tab === 'closet') {
      setSegment(tab);
    }
  }, [searchParams]);

  // Tell the layout to hide the bottom nav while a selection bar is up.
  useEffect(() => {
    setSelecting(selectMode && segment === 'closet' && selectedIds.size > 0);
  }, [selectMode, segment, selectedIds, setSelecting]);
  useEffect(() => () => setSelecting(false), [setSelecting]);

  useEffect(() => {
    track('wardrobe_view', { items: items.length, outfits: outfits.length });
    const id = window.setTimeout(() => warmBgRemoval(), 1500);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setHeaderCompact(el.scrollTop > 40);
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayForecast = forecastFor(todayKey);
  const todaysOutfit = useMemo(() => {
    const entry = plannerEntries[todayKey];
    if (!entry) return undefined;
    return outfits.find((o) => o.id === entry.outfitId);
  }, [plannerEntries, outfits, todayKey]);

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

  const selectedItems = useMemo(
    () => {
      const order = Array.from(selectedIds);
      return order
        .map((id) => items.find((it) => it.id === id))
        .filter((it): it is NonNullable<typeof it> => !!it);
    },
    [items, selectedIds],
  );

  const selectionOrder = useMemo(() => {
    const map = new Map<string, number>();
    Array.from(selectedIds).forEach((id, index) => map.set(id, index + 1));
    return map;
  }, [selectedIds]);

  const exitSelect = () => {
    setSelectMode(false);
    clearSelection();
  };

  const startStudio = () => {
    if (selectedIds.size < 1) {
      toast('Pick at least one item', 'warning');
      return;
    }
    navigate('/studio', { state: { seedIds: [...selectedIds] } });
  };

  const startTryOn = () => {
    if (selectedIds.size < 1) {
      toast('Pick at least one item', 'warning');
      return;
    }
    navigate('/studio/try-on', { state: { itemIds: [...selectedIds] } });
  };

  const showSelectChrome = selectMode && segment === 'closet';
  const showSelectionBar = showSelectChrome && selectedIds.size > 0;
  const filterBadge = activeFilterCount(filters);
  const showSetsFab = segment === 'collections' && collections.length > 0;
  const showClosetFab = segment !== 'collections';
  const showFab = !showSelectChrome && (showSetsFab || showClosetFab);

  return (
    <div className="relative flex flex-1 flex-col min-h-0 bg-bg">
      <TopNav
        title="Closet"
        borderless
        className={cn('transition-[height] duration-200', headerCompact && 'h-11')}
        trailing={<ProfileNavButton onClick={() => setSettingsOpen(true)} />}
      />

      {/*
        Layout: TopNav fixed at top, BottomNav fixed at bottom (from layout.tsx).
        Middle column = flex column with TWO regions:
          - Hero block (counts + Today card) which scrolls away as you reach for items
          - Sticky cluster (Tabs + search + filter pills) which pins to top
          - Grid that scrolls inside its own region
      */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Scrollable region wrapping the hero so it can slide away */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-y-contain">
          {/* Wardrobe summary + today's outfit */}
          <div className="px-5 pb-2 pt-1">
            <QuotaBanner />

            <TodayCard
              itemCount={items.length}
              outfitCount={outfits.length}
              outfit={todaysOutfit}
              forecast={todayForecast}
              onClick={() =>
                todaysOutfit ? navigate(`/outfit/${todaysOutfit.id}`) : navigate('/planner')
              }
            />
          </div>

          {/* Sticky chrome — Tabs + search + filter pills */}
          <div
            className={cn(
              'sticky top-0 z-10 bg-bg transition-shadow duration-200',
              headerCompact ? 'pb-1.5 shadow-[0_1px_0_var(--color-divider)]' : 'pb-2',
            )}
          >
            <div className={cn('px-5', headerCompact ? 'pt-0' : 'pt-1')}>
              <Tabs
                variant="underline"
                compact={headerCompact}
                tabs={[
                  { id: 'closet', label: 'Closet', icon: <HangerIcon size={14} /> },
                  { id: 'outfits', label: 'Outfits', icon: <OutfitIcon size={14} /> },
                  { id: 'collections', label: 'Sets', icon: <CollectionIcon size={14} /> },
                ]}
                active={segment}
                onChange={(id) => {
                  setSegment(id as Segment);
                  exitSelect();
                }}
              />
            </div>

            {segment === 'closet' && (
              <>
                {/* Search + filter trigger — one row, Whering pattern */}
                <div className={cn('flex items-center gap-2 px-5', headerCompact ? 'mt-2' : 'mt-3')}>
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
                      className="search-field h-10 w-full pl-10 pr-3 tracking-tightish placeholder:text-ink-ghost transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    onClick={() => setFiltersOpen(true)}
                    aria-label={filterBadge > 0 ? `Filters (${filterBadge} active)` : 'Open filters'}
                    aria-pressed={filterBadge > 0}
                    className={cn(
                      'relative grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                      filterBadge > 0
                        ? 'border border-primary bg-primary text-white hover:bg-primary-dark'
                        : 'border border-border bg-bg text-ink-subtle hover:text-ink',
                    )}
                  >
                    <FunnelIcon size={16} />
                    {filterBadge > 0 && (
                      <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[9px] font-bold text-primary ring-2 ring-bg">
                        {filterBadge}
                      </span>
                    )}
                  </button>
                  {items.length > 0 && (
                    <button
                      onClick={() => {
                        if (selectMode) exitSelect();
                        else setSelectMode(true);
                      }}
                      aria-label={selectMode ? 'Exit select mode' : 'Enter select mode'}
                      aria-pressed={selectMode}
                      className={cn(
                        'h-10 rounded-full px-3 text-[12px] font-semibold tracking-tightish transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                        selectMode
                          ? 'bg-ink-strong text-white'
                          : 'border border-border bg-bg text-ink-subtle hover:text-ink',
                      )}
                    >
                      {selectMode ? 'Done' : 'Select'}
                    </button>
                  )}
                </div>

                <CategoryFilterRow
                  active={activeCategory}
                  onSelect={setCategory}
                  counts={categoryCounts}
                  totalCount={items.length}
                />
              </>
            )}
          </div>

          {/* Content */}
          {segment === 'closet' && (
            <ClosetGrid
              items={filteredItems}
              allItemsCount={items.length}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={(id) => {
                if (!selectMode) setSelectMode(true);
                toggleSelect(id);
              }}
              selectionOrder={selectionOrder}
              onAdd={() => setAddOpen(true)}
              filtersActive={filterBadge > 0 || activeCategory !== 'all' || query.length > 0}
              onClearFilters={() => {
                setFilters({ color: 'all', source: 'all' });
                setCategory('all');
                setQuery('');
              }}
              hasSelectionBar={showSelectChrome}
            />
          )}
          {segment === 'outfits' && (
            <OutfitsView
              outfits={outfits}
              isFirstTimeUser={isFirstTimeUser}
              plannerEntries={plannerEntries}
              onOpen={(id) => navigate(`/outfit/${id}`)}
              onCreate={() => navigate('/create-outfit')}
              onAddPhoto={() => navigateToTryOn(navigate)}
            />
          )}
          {segment === 'collections' && (
            <CollectionsView
              collections={collections}
              items={items}
              onOpen={(c) => setOpenCollection(c)}
              onCreate={() => setCreateCollectionOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Floating selection action bar — Whering-style "Add (n)" */}
      {showSelectionBar && (
        <SelectionBar
          count={selectedIds.size}
          previews={selectedItems.map((it) => ({
            id: it.id,
            thumbnailDataUrl: it.thumbnailDataUrl,
            label: it.name ?? it.category,
          }))}
          ctaLabel="Create outfit"
          ctaIcon={<OutfitIcon size={16} />}
          onCta={startStudio}
          secondaryLabel={hasTryOnProfile ? 'Try on' : undefined}
          onSecondary={hasTryOnProfile ? startTryOn : undefined}
          onCancel={exitSelect}
        />
      )}

      {showSelectChrome && selectedIds.size === 0 && (
        <div
          className="pointer-events-none absolute inset-x-0 z-30 px-4"
          style={{ bottom: '0.625rem' }}
        >
          <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-3xl border border-border-subtle bg-bg px-4 py-3 shadow-pop">
            <p className="text-[12px] font-medium text-ink-subtle">
              Tap items to select them for a new outfit
            </p>
            <button
              type="button"
              onClick={exitSelect}
              className="shrink-0 text-[12px] font-semibold text-ink-strong"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FAB — hidden on empty Sets (empty-state CTA handles create) */}
      {showFab && (
        <div
          className="pointer-events-none absolute right-5 z-10"
          style={{ bottom: 'calc(0.75rem + var(--safe-bottom))' }}
        >
          <FAB
            className="pointer-events-auto"
            icon={<PlusIcon size={20} />}
            label={segment === 'collections' ? 'New set' : 'Add'}
            onClick={() => {
              if (segment === 'closet') setAddOpen(true);
              else if (segment === 'collections') setCreateCollectionOpen(true);
              else setSegment('closet');
            }}
          />
        </div>
      )}

      <AddItemSheet open={addOpen} onClose={() => setAddOpen(false)} />

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onChange={setFilters}
      />

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <CreateCollectionSheet
        open={createCollectionOpen || !!addItemsTo}
        onClose={() => {
          setCreateCollectionOpen(false);
          setAddItemsTo(null);
        }}
        mode={addItemsTo ? 'addToExisting' : 'create'}
        existingId={addItemsTo?.id}
        existingItemIds={addItemsTo?.itemIds ?? []}
      />

      <CollectionDetailSheet
        open={!!openCollection}
        onClose={() => setOpenCollection(null)}
        collection={openCollection ? collections.find((c) => c.id === openCollection.id) : undefined}
        onRequestAddItems={(id) => {
          const c = collections.find((x) => x.id === id);
          if (c) {
            setOpenCollection(null);
            setAddItemsTo(c);
          }
        }}
      />

    </div>
  );
}

export function WardrobeStats({ itemCount, outfitCount }: { itemCount: number; outfitCount: number }) {
  return (
    <div className="flex items-baseline gap-1.5 page-x pt-3 pb-2.5">
      <span className="text-[24px] font-bold leading-none tracking-tightish text-ink">{itemCount}</span>
      <span className="text-[11px] font-semibold uppercase tracking-widish text-ink-faint">items</span>
      <span className="mx-1.5 text-ink-ghost">·</span>
      <span className="text-[24px] font-bold leading-none tracking-tightish text-ink">{outfitCount}</span>
      <span className="text-[11px] font-semibold uppercase tracking-widish text-ink-faint">outfits</span>
    </div>
  );
}

export function TodayCard({
  itemCount,
  outfitCount,
  outfit,
  forecast,
  onClick,
}: {
  itemCount: number;
  outfitCount: number;
  outfit: Outfit | undefined;
  forecast: ForecastDay;
  onClick: () => void;
}) {
  if (outfit) {
    return (
      <div className="overflow-hidden rounded-3xl border border-border-subtle bg-bg">
        <WardrobeStats itemCount={itemCount} outfitCount={outfitCount} />
        <button
          onClick={onClick}
          aria-label={`Today's outfit: ${outfit.name ?? 'Saved look'}. ${Math.round(forecast.tempMaxC)} degrees. Tap to view or share.`}
          className={cn(
            'relative flex w-full items-stretch gap-3 border-t border-divider p-3 text-left transition-transform',
            'hover:bg-bg-soft active:scale-[0.99]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30',
          )}
        >
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-bg">
            <img src={outfit.thumbnailDataUrl} className="h-full w-full object-cover" alt="" />
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <div className="flex items-center gap-2">
              <div className="section-label text-primary">Today's outfit</div>
              <WeatherChip forecast={forecast} size="sm" />
            </div>
            <div className="mt-0.5 text-[15px] font-bold tracking-tightish text-ink-strong">
              {outfit.name ?? 'Saved look'}
            </div>
            <div className="text-[12px] text-ink-subtle">Tap to view or share</div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border-subtle bg-bg">
      <WardrobeStats itemCount={itemCount} outfitCount={outfitCount} />
      <button
        onClick={onClick}
        aria-label={`Plan today's look. ${Math.round(forecast.tempMaxC)} degrees. Pin an outfit to your calendar.`}
        className={cn(
          'relative flex w-full items-center gap-3 border-t border-divider p-3 text-left transition-transform',
          'active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30',
        )}
      >
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <span className="absolute inset-0 rounded-full bg-primary/12 animate-empty-pulse-slow" />
          <span className="relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-[#E5345F] text-white shadow-fab">
            <PlanLookIcon size={20} strokeWidth={2} />
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="section-label text-primary">Today</div>
            <WeatherChip forecast={forecast} size="sm" />
          </div>
          <div className="mt-0.5 text-[15px] font-bold tracking-tightish text-ink-strong">Plan a look</div>
          <div className="text-[12px] text-ink-subtle">Pin an outfit to your calendar</div>
        </div>
        <span className="text-ink-faint">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  );
}

export function ClosetGrid({
  items,
  allItemsCount,
  selectMode,
  selectedIds,
  selectionOrder,
  onToggleSelect,
  onAdd,
  filtersActive,
  onClearFilters,
  hasSelectionBar,
}: {
  items: ReturnType<typeof useWardrobeStore.getState>['items'];
  allItemsCount: number;
  selectMode: boolean;
  selectedIds: Set<string>;
  selectionOrder: Map<string, number>;
  onToggleSelect: (id: string) => void;
  onAdd: () => void;
  filtersActive: boolean;
  onClearFilters: () => void;
  hasSelectionBar: boolean;
}) {
  if (allItemsCount === 0) {
    return (
      <EmptyState
        icon={<HangerIcon size={24} />}
        title="Your closet is empty"
        body="Add a few items — we'll cut out backgrounds and tag them automatically."
        action={
          <Button onClick={onAdd} leadingIcon={<PlusIcon size={18} />}>
            Add your first item
          </Button>
        }
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        variant="tile"
        tone="neutral"
        icon={<SearchIcon size={20} />}
        title="Nothing matches"
        body={filtersActive ? 'Clear filters to see everything again.' : 'Try a different category.'}
        action={
          filtersActive ? (
            <Button variant="secondary" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div
      className={cn(
        'px-5 pt-3',
        hasSelectionBar ? 'pb-48' : 'pb-[calc(5rem+var(--safe-bottom))]',
      )}
    >
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => (
          <ItemCard
            key={it.id}
            item={it}
            selectable={selectMode}
            selected={selectedIds.has(it.id)}
            selectionIndex={selectionOrder.get(it.id)}
            onClick={() => onToggleSelect(it.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CollectionsView({
  collections,
  items,
  onOpen,
  onCreate,
}: {
  collections: ReturnType<typeof useCollectionsStore.getState>['collections'];
  items: ReturnType<typeof useWardrobeStore.getState>['items'];
  onOpen: (c: Collection) => void;
  onCreate: () => void;
}) {
  if (collections.length === 0) {
    return (
      <div className="flex min-h-[min(420px,55vh)] flex-col justify-center pb-[calc(5.5rem+var(--safe-bottom))]">
        <EmptyState
          variant="pulse"
          tone="ai"
          icon={<CollectionIcon size={24} />}
          title="Group your wardrobe"
          body="Build sets like Beach Day, Office Layers or Wedding Guest — pull together themes from across your closet."
          action={
            <Button type="button" onClick={onCreate} leadingIcon={<PlusIcon size={18} />}>
              Create your first set
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-5 pb-[calc(5rem+var(--safe-bottom))] pt-3">
      {collections.map((c) => (
        <CollectionCard
          key={c.id}
          collection={c}
          items={items}
          onClick={() => onOpen(c)}
        />
      ))}
    </div>
  );
}

function OutfitsView({
  outfits,
  isFirstTimeUser,
  plannerEntries,
  onOpen,
  onCreate,
  onAddPhoto,
}: {
  outfits: Outfit[];
  isFirstTimeUser: boolean;
  plannerEntries: Record<string, { date: string; outfitId: string }>;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onAddPhoto: () => void;
}) {
  if (outfits.length === 0) {
    return (
      <EmptyState
        icon={<SparklesIcon size={24} />}
        title={isFirstTimeUser ? 'Try-on looks unlock with your photo' : 'No outfits yet'}
        body={
          isFirstTimeUser
            ? 'Upload a full-body photo to save and preview outfits on you.'
            : 'Switch to your closet, tap a few items, then style them into a look.'
        }
        action={
          <Button
            onClick={isFirstTimeUser ? onAddPhoto : onCreate}
            leadingIcon={isFirstTimeUser ? <WandIcon size={18} /> : <SparklesIcon size={18} />}
          >
            {isFirstTimeUser ? 'Add your photo' : 'Pick items to start'}
          </Button>
        }
      />
    );
  }

  const outfitToDate: Record<string, string> = {};
  for (const e of Object.values(plannerEntries)) {
    outfitToDate[e.outfitId] = e.date;
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-5 pb-[calc(5rem+var(--safe-bottom))] pt-3">
      {outfits.map((o) => (
        <OutfitCard key={o.id} outfit={o} plannedDate={outfitToDate[o.id]} onClick={() => onOpen(o.id)} />
      ))}
    </div>
  );
}
