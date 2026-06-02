import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { ProfileNavButton } from '@/components/ui/ProfileNavButton';
import { OutfitCard } from '@/components/wardrobe/OutfitCard';
import { SettingsSheet } from '@/components/wardrobe/SettingsSheet';
import { WeatherChip } from '@/components/planner/WeatherChip';
import { HomeShortcutRow } from '@/components/home/HomeShortcutRow';
import { SuggestionCard } from '@/components/home/SuggestionCard';
import {
  CompleteClosetCard,
  tryOnGarmentsFromPairing,
} from '@/components/home/CompleteClosetCard';
import { HomeOutfitRail, HOME_RAIL_CARD_WIDTH } from '@/components/home/HomeOutfitRail';
import {
  HOME_FLAT_LAY_OUTFITS,
  HOME_TRY_ON_OUTFITS,
  homeRailToOutfit,
} from '@/data/homeCreatorRails';
import { buildClosetPairings } from '@/lib/closetPairings';
import {
  CalendarIcon,
  ChevronRightIcon,
  HangerIcon,
  LayersIcon,
  OutfitIcon,
  PlusIcon,
  UserIcon,
  WandIcon,
  SparklesIcon,
  SearchIcon,
  FunnelIcon,
} from '@/components/ui/Icon';
import { usePlannerWeather } from '@/components/planner/usePlannerWeather';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { buildHomeSuggestions } from '@/lib/recommendations';
import { navigateToTryOn, tryOnStateFromOutfit } from '@/lib/tryOnNavigation';
import { useTryOnPersona, useVisibleOutfits } from '@/lib/tryOnPersona';
import { track } from '@/lib/telemetry';
import { cn } from '@/lib/cn';
import { useChrome } from '@/store/chromeStore';
import { ClosetGrid, WardrobeStats } from '@/pages/WardrobeHome';
import { Tabs } from '@/components/ui/Tabs';
import { QuotaBanner } from '@/components/wardrobe/QuotaBanner';
import { CategoryFilterRow } from '@/components/wardrobe/CategoryFilterRow';
import { AddItemSheet } from '@/components/wardrobe/AddItemSheet';
import { FilterSheet, activeFilterCount, type FilterState } from '@/components/wardrobe/FilterSheet';
import { SelectionBar } from '@/components/ui/SelectionBar';
import { FAB } from '@/components/ui/FAB';
import { toast } from '@/components/ui/Toast';
import { bucketForColor } from '@/lib/color';
import { sortWardrobeByCategory } from '@/lib/categoryOrder';
import type { Category } from '@/types';

export function Home() {
  const wireframeVersion = useChrome((s) => s.wireframeVersion);
  if (wireframeVersion === 'v2') {
    return <HomeV2 />;
  }
  return <HomeV1 />;
}

/* ==========================================================================
   V2 Single Screen Layout
   ========================================================================== */
function HomeV2() {
  const navigate = useNavigate();
  const items = useWardrobeStore((s) => s.items);
  const activeCategory = useWardrobeStore((s) => s.activeCategory);
  const setCategory = useWardrobeStore((s) => s.setCategory);
  const selectedIds = useWardrobeStore((s) => s.selectedIds);
  const toggleSelect = useWardrobeStore((s) => s.toggleSelect);
  const clearSelection = useWardrobeStore((s) => s.clearSelection);
  const outfits = useVisibleOutfits();
  const { hasTryOnProfile, isFirstTimeUser } = useTryOnPersona();
  const cartLines = useCartStore((s) => s.lines);
  const hydrateCart = useCartStore((s) => s.hydrate);
  const wishlistLines = useWishlistStore((s) => s.lines);
  const hydrateWishlist = useWishlistStore((s) => s.hydrate);
  const setSelecting = useChrome((s) => s.setSelecting);

  const [activeTab, setActiveTab] = useState<'suggestions' | 'closet'>('suggestions');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ color: 'all', source: 'all' });

  useEffect(() => {
    hydrateCart();
    hydrateWishlist();
    track('home_view');
  }, [hydrateCart, hydrateWishlist]);

  // Sync multi-select state to bottom-nav auto-hide
  useEffect(() => {
    setSelecting(selectMode && activeTab === 'closet' && selectedIds.size > 0);
  }, [selectMode, activeTab, selectedIds, setSelecting]);
  useEffect(() => () => setSelecting(false), [setSelecting]);

  const suggestions = useMemo(
    () => buildHomeSuggestions({ cart: cartLines, wishlist: wishlistLines, outfits, hasTryOnProfile }),
    [cartLines, wishlistLines, outfits, hasTryOnProfile],
  );

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((it) => {
      if (activeCategory !== 'all' && it.category !== activeCategory) return false;
      if (filters.color !== 'all' && bucketForColor(it.dominantColor) !== filters.color) return false;
      if (filters.source === 'past' && !(it.source === 'myntra-past' || it.source === 'myntra' || it.source === 'seed')) return false;
      if (filters.source === 'wishlist' && it.source !== 'myntra-wishlist') return false;
      if (filters.source === 'cart' && it.source !== 'myntra-cart') return false;
      if (!q) return true;
      return (
        it.name?.toLowerCase().includes(q) ||
        it.brand?.toLowerCase().includes(q) ||
        it.category.includes(q)
      );
    });
    return activeCategory === 'all' ? sortWardrobeByCategory(filtered) : filtered;
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

  const filterBadge = activeFilterCount(filters);
  const showSelectionBar = selectMode && activeTab === 'closet' && selectedIds.size > 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-bg">
      {/* Top Header */}
      <header className="shrink-0 flex items-center justify-between px-5 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-divider/40 bg-bg z-30">
        <div className="flex items-center gap-3">
          <BackButton
            aria-label="Back to profile"
            onClick={() => {
              toast('Simulated: Navigating back to Profile', 'default');
            }}
          />
          <h1 className="text-[22px] font-bold tracking-tightish text-ink-strong">
            Wardrobe
          </h1>
        </div>
        <ProfileNavButton onClick={() => setSettingsOpen(true)} />
      </header>

      {/* Main scrolling content area */}
      <div className="scroll-area flex-1 pb-[calc(5rem+var(--safe-bottom))] overflow-y-auto">
        {/* Quota warning banner */}
        <div className="px-5 py-1 mt-1">
          <QuotaBanner />
        </div>

        {/* Closet summary */}
        <div className="px-5 pb-2 pt-1">
          <div className="overflow-hidden rounded-3xl border border-border-subtle bg-bg">
            <WardrobeStats itemCount={items.length} outfitCount={outfits.length} />
          </div>
        </div>

        {/* Main Tab Controller & Sticky Header Group */}
        <div className="sticky top-0 z-20 bg-bg border-b border-divider pb-2.5">
          {/* Tabs Navigation */}
          <div className="px-5 pt-1">
            <Tabs
              variant="underline"
              tabs={[
                { id: 'suggestions', label: 'Suggestions', icon: <SparklesIcon size={14} /> },
                { id: 'closet', label: 'Closet', icon: <HangerIcon size={14} /> },
              ]}
              active={activeTab}
              onChange={(id) => {
                setActiveTab(id as 'suggestions' | 'closet');
                exitSelect();
              }}
            />
          </div>

          {/* Search, Filter, Select & Categories Row - ONLY IN CLOSET TAB AND PART OF THE STICKY GROUP */}
          {activeTab === 'closet' && (
            <>
              <div className="flex items-center gap-2 px-5 mt-3 bg-bg">
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
                      selectMode
                        ? 'bg-ink-strong text-white'
                        : 'border border-border bg-bg text-ink-subtle hover:text-ink',
                    )}
                  >
                    {selectMode ? 'Done' : 'Select'}
                  </button>
                )}
              </div>

              {/* Closet Category Filters */}
              <CategoryFilterRow
                active={activeCategory}
                onSelect={setCategory}
                counts={categoryCounts}
                totalCount={items.length}
              />
            </>
          )}
        </div>

        {/* Tab 1: Suggestions Content */}
        {activeTab === 'suggestions' && (
          <div className="px-5 py-4 space-y-6">
            {/* AI Try-on — first-time users only (returning users already have photos) */}
            {isFirstTimeUser && (
              <button
                type="button"
                onClick={() => navigateToTryOn(navigate)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-3xl border border-border-subtle bg-bg p-4 text-left',
                  'shadow-[0_2px_12px_rgba(38,42,57,0.04)] transition-transform active:scale-[0.99]',
                )}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-aiSoft text-accent-ai">
                  <WandIcon size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-ink-strong">AI Try-On</span>
                  <span className="block text-[13px] text-ink-subtle">
                    Add your photo to unlock virtual try-on
                  </span>
                </span>
                <ChevronRightIcon size={18} className="shrink-0 text-ink-faint" />
              </button>
            )}

            {/* Your outfits */}
            <section>
              <SectionHeader
                title="Your outfits"
                trailing={
                  <button
                    type="button"
                    onClick={() => navigate('/create-outfit')}
                    className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg px-2.5 py-1 text-[11px] font-semibold text-ink-strong"
                  >
                    <PlusIcon size={12} />
                    Create
                  </button>
                }
              />
              {outfits.length === 0 ? (
                <div className="mt-3 rounded-3xl border border-dashed border-border-subtle bg-bg-soft px-4 py-8 text-center">
                  {isFirstTimeUser ? (
                    <>
                      <p className="text-[15px] font-semibold text-ink-strong">Try-on looks unlock with your photo</p>
                      <p className="mt-1 text-[13px] text-ink-subtle">
                        Upload a full-body photo to save and preview outfits on you
                      </p>
                      <Button className="mt-4" onClick={() => navigateToTryOn(navigate)}>
                        Add your photo
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-semibold text-ink-strong">No outfits yet</p>
                      <p className="mt-1 text-[13px] text-ink-subtle">Pick pieces from your closet and build a look</p>
                      <Button className="mt-4" onClick={() => navigate('/create-outfit')}>
                        Create outfit
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="touch-scroll-x -mx-5 mt-2 flex items-start gap-1.5 px-5 py-0.5 no-scrollbar">
                  {outfits.slice(0, 8).map((o) => (
                    <div key={o.id} className={cn(HOME_RAIL_CARD_WIDTH, 'shrink-0')}>
                      <OutfitCard
                        outfit={o}
                        size="compact"
                        imageAspect="square"
                        imageFit="fill"
                        imageFocus="top"
                        onClick={() => navigate(`/outfit/${o.id}`)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <HomeOutfitRail
              className="mt-6"
              title="AI try-on looks"
              subtitle="Model shots — try these on yourself"
              badge="try-on"
              outfits={HOME_TRY_ON_OUTFITS.map(homeRailToOutfit)}
            />

            <HomeOutfitRail
              className="mt-6"
              title="Outfits by creators"
              subtitle="Flat-lay edits from Myntra creators — open to mix & match"
              badge="flat-lay"
              outfits={HOME_FLAT_LAY_OUTFITS.map(homeRailToOutfit)}
            />

            <CompleteYourClosetWidget hasTryOnProfile={hasTryOnProfile} />

            <section>
              <SectionHeader title="Suggested for you" />
              <p className="mt-1 text-[13px] text-ink-subtle">
                From your cart and wishlist
              </p>
              <div className="touch-scroll-x -mx-5 mt-3 px-5 py-3 no-scrollbar">
                <div className="flex w-max gap-3">
                  {suggestions.map((s) => (
                    <SuggestionCard
                      key={s.id}
                      suggestion={s}
                      onAction={() => {
                        if (s.tryOn) navigateToTryOn(navigate, s.tryOn);
                        else navigate(s.href);
                      }}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Closet Grid Content */}
        {activeTab === 'closet' && (
          <div className="pt-2">
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
              hasSelectionBar={showSelectionBar}
            />
          </div>
        )}
      </div>

      {/* Floating selection action bar */}
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

      {/* Select Mode Hint bubble */}
      {selectMode && selectedIds.size === 0 && (
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

      {/* Floating Add Item Button */}
      {activeTab === 'closet' && !selectMode && (
        <div
          className="pointer-events-none absolute right-5 z-10"
          style={{ bottom: 'calc(0.75rem + var(--safe-bottom))' }}
        >
          <FAB
            className="pointer-events-auto"
            icon={<PlusIcon size={20} />}
            label="Add"
            onClick={() => setAddOpen(true)}
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
    </div>
  );
}

/* ==========================================================================
   V1 Dashboard Layout (Multi-tab structure)
   ========================================================================== */
function HomeV1() {
  const navigate = useNavigate();
  const items = useWardrobeStore((s) => s.items);
  const outfits = useVisibleOutfits();
  const { hasTryOnProfile, isFirstTimeUser } = useTryOnPersona();
  const plannerEntries = usePlannerStore((s) => s.entries);
  const cartLines = useCartStore((s) => s.lines);
  const hydrateCart = useCartStore((s) => s.hydrate);
  const wishlistLines = useWishlistStore((s) => s.lines);
  const hydrateWishlist = useWishlistStore((s) => s.hydrate);
  const { forecastFor } = usePlannerWeather();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    hydrateCart();
    hydrateWishlist();
    track('home_view');
  }, [hydrateCart, hydrateWishlist]);

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayForecast = forecastFor(todayKey);
  const todaysOutfit = useMemo(() => {
    if (!hasTryOnProfile) return undefined;
    const entry = plannerEntries[todayKey];
    if (!entry) return undefined;
    return outfits.find((o) => o.id === entry.outfitId);
  }, [hasTryOnProfile, plannerEntries, outfits, todayKey]);

  const suggestions = useMemo(
    () => buildHomeSuggestions({ cart: cartLines, wishlist: wishlistLines, outfits, hasTryOnProfile }),
    [cartLines, wishlistLines, outfits, hasTryOnProfile],
  );

  const closetPreview = items.slice(0, 4);

  const shortcuts = [
    {
      id: 'mix',
      label: 'Mix & Match',
      icon: <UserIcon size={18} />,
      onClick: () => navigate('/create-outfit'),
    },
    {
      id: 'plan',
      label: 'Plan look',
      icon: <CalendarIcon size={18} />,
      onClick: () => navigate('/planner'),
    },
    {
      id: 'tryon',
      label: 'Try on',
      icon: <WandIcon size={18} />,
      onClick: () => navigateToTryOn(navigate),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <div className="scroll-area flex-1 pb-[calc(5.5rem+var(--safe-bottom))]">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-primary/[0.07] to-transparent"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widish text-ink-faint">
                {format(new Date(), 'EEEE, d MMMM')}
              </p>
              <h1 className="mt-1.5 text-[28px] font-bold leading-[1.08] tracking-tightish text-ink-strong text-balance">
                What should you wear?
              </h1>
            </div>
            <ProfileNavButton onClick={() => setSettingsOpen(true)} className="mt-0.5" />
          </div>

          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            {todayForecast && <WeatherChip forecast={todayForecast} size="sm" />}
            <span className="inline-flex items-center rounded-full border border-line bg-bg px-3 py-1.5 text-[12px] font-semibold text-ink-subtle">
              {items.length} piece{items.length === 1 ? '' : 's'}
            </span>
            <span className="inline-flex items-center rounded-full border border-line bg-bg px-3 py-1.5 text-[12px] font-semibold text-ink-subtle">
              {outfits.length} outfit{outfits.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="relative mt-3">
            <HomeShortcutRow shortcuts={shortcuts} />
          </div>

          {isFirstTimeUser && (
            <button
              type="button"
              onClick={() => navigateToTryOn(navigate)}
              className={cn(
                'relative mt-4 flex w-full items-center gap-3 rounded-3xl border border-border-subtle bg-bg p-4 text-left',
                'shadow-[0_2px_12px_rgba(38,42,57,0.05)] transition-transform active:scale-[0.99]',
              )}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-aiSoft text-accent-ai">
                <WandIcon size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-ink-strong">AI Try-On</span>
                <span className="block text-[13px] text-ink-subtle">
                  Add your photo to unlock virtual try-on
                </span>
              </span>
              <ChevronRightIcon size={18} className="shrink-0 text-ink-faint" />
            </button>
          )}
        </section>

        {/* Today's plan */}
        {todaysOutfit && (
          <section className="mt-2 px-5">
            <SectionHeader
              title="Planned for today"
              actionLabel="Planner"
              onAction={() => navigate('/planner')}
            />
            <button
              type="button"
              onClick={() => navigate(`/outfit/${todaysOutfit.id}`)}
              className="mt-2.5 flex w-full items-center gap-3 rounded-3xl border border-border-subtle bg-bg p-3 text-left shadow-[0_2px_12px_rgba(38,42,57,0.04)] active:scale-[0.99]"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-bg-soft">
                {todaysOutfit.thumbnailDataUrl ? (
                  <img
                    src={todaysOutfit.thumbnailDataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-primary">
                    <OutfitIcon size={22} />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-bold text-ink-strong">
                  {todaysOutfit.name ?? "Today's look"}
                </p>
                <p className="mt-0.5 text-[13px] text-ink-subtle">
                  {todaysOutfit.nodes.length} items · Pinned for today
                </p>
              </div>
              <ChevronRightIcon size={18} className="shrink-0 text-ink-faint" />
            </button>
            <Button
              className="mt-2.5 w-full"
              variant="secondary"
              leadingIcon={<WandIcon size={16} />}
              onClick={() => navigateToTryOn(navigate, tryOnStateFromOutfit(todaysOutfit))}
            >
              Try on today&apos;s look
            </Button>
          </section>
        )}

        {/* Your outfits */}
        <section className="mt-7 px-5">
          <SectionHeader
            title="Your outfits"
            actionLabel={outfits.length > 0 ? 'See all' : undefined}
            onAction={outfits.length > 0 ? () => navigate('/wardrobe?tab=outfits') : undefined}
            trailing={
              <button
                type="button"
                onClick={() => navigate('/create-outfit')}
                className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg px-2.5 py-1 text-[11px] font-semibold text-ink-strong"
              >
                <PlusIcon size={12} />
                Create
              </button>
            }
          />
          {outfits.length === 0 ? (
            <div className="mt-3 rounded-3xl border border-dashed border-border-subtle bg-bg-soft px-4 py-8 text-center">
              {isFirstTimeUser ? (
                <>
                  <p className="text-[15px] font-semibold text-ink-strong">Try-on looks unlock with your photo</p>
                  <p className="mt-1 text-[13px] text-ink-subtle">
                    Upload a full-body photo to save and preview outfits on you
                  </p>
                  <Button className="mt-4" onClick={() => navigateToTryOn(navigate)}>
                    Add your photo
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-[15px] font-semibold text-ink-strong">No outfits yet</p>
                  <p className="mt-1 text-[13px] text-ink-subtle">Pick pieces from your closet and build a look</p>
                  <Button className="mt-4" onClick={() => navigate('/create-outfit')}>
                    Create outfit
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="touch-scroll-x -mx-1 mt-2 flex items-start gap-1.5 px-1 py-0.5 no-scrollbar">
              {outfits.slice(0, 8).map((o) => (
                <div key={o.id} className={cn(HOME_RAIL_CARD_WIDTH, 'shrink-0')}>
                  <OutfitCard
                    outfit={o}
                    size="compact"
                    imageAspect="square"
                    imageFit="fill"
                    imageFocus="top"
                    onClick={() => navigate(`/outfit/${o.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-7 px-5">
          <HomeOutfitRail
            title="AI try-on looks"
            subtitle="Model shots — try on yourself"
            badge="try-on"
            outfits={HOME_TRY_ON_OUTFITS.map(homeRailToOutfit)}
          />
        </div>

        <div className="mt-7 px-5">
          <HomeOutfitRail
            title="Outfits by creators"
            subtitle="Flat-lay edits — open to mix & match"
            badge="flat-lay"
            outfits={HOME_FLAT_LAY_OUTFITS.map(homeRailToOutfit)}
          />
        </div>

        <section className="mt-7 px-5">
          <CompleteYourClosetWidget hasTryOnProfile={hasTryOnProfile} />
        </section>

        {/* Suggested for you */}
        <section className="mt-7">
          <div className="px-5">
            <SectionHeader title="Suggested for you" />
            <p className="mt-1 text-[13px] text-ink-subtle">
              From your cart, wishlist, and calendar
            </p>
          </div>
          <div className="touch-scroll-x mt-3 px-5 py-3 no-scrollbar">
            <div className="flex w-max gap-3">
              {suggestions.map((s) => (
                <SuggestionCard
                  key={s.id}
                  suggestion={s}
                  onAction={() => {
                    if (s.tryOn) navigateToTryOn(navigate, s.tryOn);
                    else navigate(s.href);
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Closet teaser */}
        <section className="mt-7 px-5 pb-4">
          <SectionHeader
            title="Your closet"
            actionLabel="Open"
            onAction={() => navigate('/wardrobe')}
          />
          <button
            type="button"
            onClick={() => navigate('/wardrobe')}
            className={cn(
              'mt-2.5 flex w-full items-center gap-3 rounded-3xl border border-border-subtle bg-bg p-4 text-left',
              'shadow-[0_2px_12px_rgba(38,42,57,0.04)] transition-transform active:scale-[0.99]',
            )}
          >
            <div className="flex shrink-0 -space-x-2">
              {closetPreview.length > 0 ? (
                closetPreview.map((item) => (
                  <div
                    key={item.id}
                    className="h-11 w-11 overflow-hidden rounded-xl border-2 border-bg bg-bg-soft"
                  >
                    <img
                      src={item.thumbnailDataUrl}
                      alt=""
                      className="h-full w-full object-contain p-0.5"
                      draggable={false}
                    />
                  </div>
                ))
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-bg-soft text-ink-subtle">
                  <HangerIcon size={22} />
                </span>
              )}
            </div>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-ink-strong">
                {items.length} piece{items.length === 1 ? '' : 's'} saved
              </span>
              <span className="block text-[13px] text-ink-subtle">Browse, filter, and add more</span>
            </span>
            <ChevronRightIcon size={18} className="shrink-0 text-ink-faint" />
          </button>
        </section>
      </div>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function CompleteYourClosetWidget({ hasTryOnProfile }: { hasTryOnProfile: boolean }) {
  const items = useWardrobeStore((s) => s.items);
  const navigate = useNavigate();
  const pairings = useMemo(() => buildClosetPairings(items, 8), [items]);

  return (
    <section>
      <SectionHeader
        title="Complete your closet"
        trailing={
          pairings.length > 0 ? (
            <span className="rounded-full bg-accent-aiSoft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-ai">
              AI Match
            </span>
          ) : undefined
        }
      />
      <p className="mt-1 text-[13px] text-ink-subtle">
        Pair what you own with Myntra picks
      </p>

      {pairings.length === 0 ? (
        <div className="mt-3 rounded-3xl border border-dashed border-border-subtle bg-bg-soft px-4 py-6 text-center">
          <p className="text-[14px] font-semibold text-ink-strong">Add items to get pairings</p>
          <p className="mt-1 text-[13px] text-ink-subtle">
            We&apos;ll suggest matches for pieces in your closet
          </p>
        </div>
      ) : (
        <div className="touch-scroll-x -mx-5 mt-3 flex gap-3 px-5 pb-1 no-scrollbar">
          {pairings.map((pairing) => (
            <CompleteClosetCard
              key={pairing.id}
              pairing={pairing}
              showTryOn={hasTryOnProfile}
              onTryOn={() => {
                track('ctl_clicked', {
                  sourceItemId: pairing.ownedItem.id,
                  matchProductId: pairing.recommendation.productId,
                });
                navigateToTryOn(navigate, {
                  title: 'Complete your closet',
                  garments: tryOnGarmentsFromPairing(pairing),
                });
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
  trailing,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-[13px] font-bold uppercase tracking-widish text-ink-faint">{title}</h2>
      <div className="flex items-center gap-2">
        {trailing}
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="text-[12px] font-semibold text-primary"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
