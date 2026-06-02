import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import {
  BagIcon,
  CloseIcon,
  HeartIcon,
  MixIcon,
  UndoIcon,
  SparklesIcon,
} from '@/components/ui/Icon';
import {
  OutfitSwipeCard,
  type SwipeDir,
} from '@/components/discover/OutfitSwipeCard';
import {
  CREATOR_OUTFITS,
  outfitTotalPaise,
  type CreatorOutfit,
} from '@/data/creatorOutfits';
import { formatRupees } from '@/data/myntraSamples';
import { useDiscoverStore } from '@/store/discoverStore';
import { cartCount, useCartStore } from '@/store/cartStore';
import { prepareDiscoverMix, saveDiscoverOutfitToCloset } from '@/lib/discoverImport';
import { creatorToGarments } from '@/lib/tryOnResolveGarments';
import { navigateToTryOn, tryOnStateFromDiscover } from '@/lib/tryOnNavigation';
import { toast } from '@/components/ui/Toast';
import { track } from '@/lib/telemetry';

const PAGE_SURFACE_RADIAL: Record<CreatorOutfit['surface'], string> = {
  cream: 'radial-gradient(at 0% 0%, rgba(251, 250, 248, 0.7) 0%, transparent 60%), radial-gradient(at 100% 100%, rgba(242, 239, 234, 0.95) 0%, transparent 65%)',
  mint: 'radial-gradient(at 0% 0%, rgba(241, 249, 244, 0.7) 0%, transparent 60%), radial-gradient(at 100% 100%, rgba(227, 241, 233, 0.95) 0%, transparent 65%)',
  sky: 'radial-gradient(at 0% 0%, rgba(240, 245, 252, 0.7) 0%, transparent 60%), radial-gradient(at 100% 100%, rgba(222, 236, 248, 0.95) 0%, transparent 65%)',
  blush: 'radial-gradient(at 0% 0%, rgba(255, 244, 247, 0.7) 0%, transparent 60%), radial-gradient(at 100% 100%, rgba(252, 228, 236, 0.95) 0%, transparent 65%)',
  sand: 'radial-gradient(at 0% 0%, rgba(250, 247, 241, 0.7) 0%, transparent 60%), radial-gradient(at 100% 100%, rgba(240, 233, 220, 0.95) 0%, transparent 65%)',
  ivory: 'radial-gradient(at 0% 0%, rgba(251, 250, 247, 0.7) 0%, transparent 60%), radial-gradient(at 100% 100%, rgba(241, 238, 232, 0.95) 0%, transparent 65%)',
  stone: 'radial-gradient(at 0% 0%, rgba(247, 247, 248, 0.7) 0%, transparent 60%), radial-gradient(at 100% 100%, rgba(236, 236, 239, 0.95) 0%, transparent 65%)',
};

/**
 * Discover — editorial swipe feed with Tinder-style overlays.
 */
export function Discover() {
  const navigate = useNavigate();
  const hydrate = useDiscoverStore((s) => s.hydrate);
  const hydrateCart = useCartStore((s) => s.hydrate);
  const liked = useDiscoverStore((s) => s.liked);
  const passed = useDiscoverStore((s) => s.passed);
  const history = useDiscoverStore((s) => s.history);
  const record = useDiscoverStore((s) => s.record);
  const undo = useDiscoverStore((s) => s.undo);
  const reset = useDiscoverStore((s) => s.reset);
  const addManyToCart = useCartStore((s) => s.addMany);
  const cartLines = useCartStore((s) => s.lines);

  useEffect(() => {
    hydrate();
    hydrateCart();
    track('discover_view');
  }, [hydrate, hydrateCart]);

  const queue = useMemo<CreatorOutfit[]>(() => {
    const seen = new Set<string>([...liked, ...passed]);
    return CREATOR_OUTFITS.filter((o) => !seen.has(o.id));
  }, [liked, passed]);

  const totalCount = CREATOR_OUTFITS.length;
  const seenCount = totalCount - queue.length;
  const progress = totalCount > 0 ? Math.min(1, seenCount / totalCount) : 0;
  const inBag = cartCount(cartLines);
  const topOutfit = queue[0];
  const visible = queue.slice(0, 3);
  const [peekDragX, setPeekDragX] = useState(0);

  async function handleSwipe(outfit: CreatorOutfit, dir: SwipeDir) {
    if (dir === 'right') {
      track('discover_swipe', { outfitId: outfit.id, dir });
      try {
        await saveDiscoverOutfitToCloset(outfit);
        record(outfit.id, 'liked');
        toast(`"${outfit.title}" saved to your closet`, 'success');
      } catch (err) {
        console.error(err);
        toast('Could not save to closet', 'warning');
      }
      return;
    }
    record(outfit.id, 'passed');
    track('discover_swipe', { outfitId: outfit.id, dir });
  }

  function handleAddToBag(outfit: CreatorOutfit) {
    const added = addManyToCart(
      outfit.items.map((it) => ({
        productId: it.productId,
        name: it.name,
        brand: it.brand,
        image: it.image,
        pricePaise: it.pricePaise,
      })),
    );
    track('discover_add_to_bag', { outfitId: outfit.id, items: added });
    toast(
      `Added ${added} items · ${formatRupees(outfitTotalPaise(outfit))}`,
      'success',
    );
    record(outfit.id, 'liked');
  }

  async function handleMix(outfit: CreatorOutfit) {
    track('discover_mix', { outfitId: outfit.id });
    try {
      const seedIds = await prepareDiscoverMix(outfit);
      record(outfit.id, 'liked');
      toast('Added to your closet — swipe to mix!', 'success');
      navigate('/studio', { state: { discoverMix: { seedIds } } });
    } catch (err) {
      console.error(err);
      toast('Could not open Mix & Match', 'warning');
    }
  }

  function handleTryOn(outfit: CreatorOutfit) {
    track('discover_try_on', { outfitId: outfit.id });
    navigateToTryOn(navigate, {
      ...tryOnStateFromDiscover(outfit.id, outfit.title),
      garments: creatorToGarments(outfit),
    });
  }

  function handleUndo() {
    const last = undo();
    if (last) {
      toast('Brought back the last card', 'default');
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-bg overflow-hidden">
      {/* Dynamic page background matching the active card surface */}
      <div className="absolute inset-0 bg-[#ffffff] pointer-events-none z-0" />
      {(Object.keys(PAGE_SURFACE_RADIAL) as Array<CreatorOutfit['surface']>).map((surf) => (
        <div
          key={surf}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1200ms] ease-in-out pointer-events-none z-0",
            topOutfit?.surface === surf ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: PAGE_SURFACE_RADIAL[surf] }}
        />
      ))}

      {/* Content layout */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* Progress + header */}
        <header className="shrink-0 px-5 pt-3">
          <div className="h-[3px] overflow-hidden rounded-full bg-divider">
            <div
              className="h-full rounded-full bg-ink-strong transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max(progress * 100, queue.length === 0 ? 100 : 8)}%` }}
            />
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-ink-subtle flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Editor&apos;s Picks
              </p>
              <h1 className="mt-1 text-[28px] font-black editorial-display text-ink-strong tracking-tight">
                Today&apos;s Edit
              </h1>
            </div>
            <BagPill
              count={inBag}
              onClick={() =>
                toast(`${inBag} item${inBag === 1 ? '' : 's'} in your bag`, 'default')
              }
            />
          </div>

          <p className="mt-1.5 text-[12px] font-medium text-ink-subtle">
            {queue.length === 0
              ? 'You’ve seen every look'
              : `${String(Math.min(seenCount + 1, totalCount)).padStart(2, '0')} of ${String(totalCount).padStart(2, '0')} · swipe or tap below`}
          </p>
        </header>

        {/* Card stage — centrally aligned, 3:4 proportion forced to prevent stretching */}
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-visible pb-2 pt-2">
          {queue.length === 0 ? (
            <CaughtUp
              seenCount={seenCount}
              likedCount={liked.length}
              onReset={() => reset()}
            />
          ) : (
            <div className="relative w-full flex items-center justify-center overflow-visible px-6">
              <div className="relative h-[calc(100dvh-19.5rem)] max-h-[460px] min-h-[320px] aspect-[3/4] overflow-visible">
                {[...visible].reverse().map((o) => {
                  const depth = visible.findIndex((x) => x.id === o.id);
                  return (
                    <OutfitSwipeCard
                      key={o.id}
                      outfit={o}
                      depth={depth}
                      interactive={depth === 0}
                      peekDragX={peekDragX}
                      onDragChange={depth === 0 ? setPeekDragX : undefined}
                      onSwipe={(dir) => {
                        setPeekDragX(0);
                        void handleSwipe(o, dir);
                      }}
                      onTryOn={() => handleTryOn(o)}
                      onAddToBag={() => handleAddToBag(o)}
                    />
                  );
                })}

                {topOutfit && (
                  <DiscoverActionDock
                    canRewind={history.length > 0}
                    onRewind={handleUndo}
                    onPass={() => handleSwipe(topOutfit, 'left')}
                    onSave={() => void handleSwipe(topOutfit, 'right')}
                    onMix={() => void handleMix(topOutfit)}
                    onShop={() => handleAddToBag(topOutfit)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- action dock (over card) ---------- */

function DiscoverActionDock({
  canRewind,
  onRewind,
  onPass,
  onSave,
  onMix,
  onShop,
}: {
  canRewind: boolean;
  onRewind: () => void;
  onPass: () => void;
  onSave: () => void;
  onMix: () => void;
  onShop: () => void;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[110] px-3 pb-4"
      aria-label="Outfit actions"
    >
      <div className="pointer-events-auto mx-auto flex max-w-[320px] items-end justify-center gap-3">
        <DockButton
          size="sm"
          tone="glass"
          label="Rewind"
          disabled={!canRewind}
          onClick={onRewind}
        >
          <UndoIcon size={18} />
        </DockButton>

        <DockButton size="md" tone="pass" label="Pass" onClick={onPass}>
          <CloseIcon size={22} className="text-ink-strong" />
        </DockButton>

        <DockButton size="lg" tone="save" label="Save" onClick={onSave}>
          <HeartIcon size={28} className="fill-white text-white" />
        </DockButton>

        <DockButton size="md" tone="mix" label="Mix" onClick={onMix}>
          <MixIcon size={22} className="text-white" />
        </DockButton>

        <DockButton size="sm" tone="glass" label="Shop" onClick={onShop}>
          <BagIcon size={18} />
        </DockButton>
      </div>
    </div>
  );
}

function DockButton({
  children,
  onClick,
  label,
  tone,
  size = 'md',
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  tone: 'glass' | 'pass' | 'save' | 'mix';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}) {
  const dims =
    size === 'lg' ? 'h-[68px] w-[68px]' : size === 'md' ? 'h-[54px] w-[54px]' : 'h-[46px] w-[46px]';

  const fill =
    tone === 'save'
      ? 'bg-discover-gradient text-white shadow-[0_10px_28px_rgba(255,63,108,0.45)] ring-2 ring-white/30 hover:shadow-[0_12px_32px_rgba(255,63,108,0.55)] hover:scale-105'
      : tone === 'mix'
      ? 'bg-gradient-to-tr from-[#6e5dc6] to-[#b25bd6] text-white shadow-[0_8px_24px_rgba(110,93,198,0.35)] ring-2 ring-white/25 hover:shadow-[0_10px_28px_rgba(110,93,198,0.45)] hover:scale-105'
      : tone === 'pass'
      ? 'bg-white text-ink-strong ring-1 ring-border shadow-[0_6px_20px_rgba(38,42,57,0.08)] hover:bg-bg/50 hover:scale-105'
      : 'bg-white/80 text-ink-strong ring-1 ring-border-subtle backdrop-blur-md shadow-[0_6px_20px_rgba(38,42,57,0.06)] hover:bg-white hover:scale-105';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'grid shrink-0 place-items-center rounded-full transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'active:scale-95 disabled:opacity-30 disabled:active:scale-100',
        dims,
        fill,
      )}
    >
      {children}
    </button>
  );
}

/* ---------- helpers ---------- */

function BagPill({ count, onClick }: { count: number; onClick: () => void }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 350);
      return () => clearTimeout(t);
    }
  }, [count]);

  return (
    <button
      onClick={onClick}
      aria-label={`Bag has ${count} items`}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-bg/85 backdrop-blur-md px-3.5 py-1.5',
        'text-[13px] font-bold text-ink-strong shadow-[0_2px_12px_rgba(38,42,57,0.05)]',
        'transition-all duration-200 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        animate && 'animate-bag-pop'
      )}
    >
      <span className={cn(
        "grid h-[22px] w-[22px] place-items-center rounded-full text-white transition-all duration-300",
        count > 0 ? "bg-primary shadow-[0_2px_8px_rgba(255,63,108,0.35)]" : "bg-ink-ghost"
      )}>
        <BagIcon size={11} />
      </span>
      <span className="tabular-nums font-semibold tracking-tight">{count}</span>
    </button>
  );
}

function CaughtUp({
  seenCount,
  likedCount,
  onReset,
}: {
  seenCount: number;
  likedCount: number;
  onReset: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="relative flex flex-col items-center rounded-[32px] border border-border bg-white/70 backdrop-blur-md p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] max-w-[320px]">
        <div className="relative mb-6 grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 rounded-3xl bg-primary/10 animate-pulse" />
          <span className="absolute inset-2 rounded-2xl bg-accent-aiSoft" />
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-discover-gradient text-white shadow-[0_4px_16px_rgba(255,63,108,0.25)]">
            <SparklesIcon size={24} />
          </span>
        </div>
        <h2 className="text-[26px] font-black editorial-display text-ink-strong tracking-tight">
          That&apos;s a wrap
        </h2>
        <p className="mt-2.5 text-[13px] leading-[1.5] text-ink-subtle">
          You&apos;ve worked through all {seenCount} looks.
          {likedCount > 0
            ? ` ${likedCount} look${likedCount === 1 ? '' : 's'} saved in your closet.`
            : ' Pop back tomorrow for fresh creator picks.'}
        </p>
        <div className="mt-6 flex flex-col w-full gap-2.5">
          {likedCount > 0 && (
            <button
              onClick={() => navigate('/wardrobe?tab=outfits')}
              className="w-full rounded-full bg-discover-gradient px-5 py-3 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(255,63,108,0.3)] hover:shadow-[0_6px_20px_rgba(255,63,108,0.4)] active:scale-[0.98] transition-all"
            >
              View saved outfits
            </button>
          )}
          <button
            onClick={onReset}
            className="w-full rounded-full border border-border bg-white/90 backdrop-blur-sm px-5 py-3 text-[13px] font-bold text-ink-strong hover:bg-bg transition-all active:scale-[0.98]"
          >
            Reshuffle feed
          </button>
        </div>
      </div>
    </div>
  );
}
