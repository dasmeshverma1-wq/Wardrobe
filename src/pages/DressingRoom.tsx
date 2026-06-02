import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TopNav } from '@/components/ui/TopNav';
import { Button, AccentButton } from '@/components/ui/Button';
import { CheckIcon, PlusIcon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/Modal';
import { StudioClosetSheet } from '@/components/studio/StudioClosetSheet';
import {
  HeadMannequin,
  SlotSilhouette,
  ZONES,
  ZONE_LAYER,
  isApparelZone,
  zoneItemDisplayStyle,
  zoneAcceptsItem,
  zoneForWardrobeItem,
  FRAME_W,
  FRAME_H,
  type ZoneId,
  type ZoneSpec,
} from '@/components/studio/MannequinZones';
import {
  activeIdxByZone as idxForZone,
  bucketItemsByZone,
  displayBucketForZone,
  activeItemInDisplayBucket,
  defaultZoneIndex,
  type ZoneIndexMap,
} from '@/lib/studioSync';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useOutfitStore } from '@/store/outfitStore';
import { captureElement } from '@/lib/share';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { track } from '@/lib/telemetry';
import type { CanvasNode, WardrobeItem } from '@/types';

// Outfit builder frame — slots use % positioning against this size.
const SWIPE_THRESHOLD = 36;
const SWIPE_FRACTION = 0.18;
/** Horizontal space between items while swiping within one slot. */
const CAROUSEL_SLIDE_GAP_PX = 24;

/** Only the centered slide is fully visible; neighbors fade in as they reach the middle. */
function carouselSlideOpacity(
  index: number,
  currentIndex: number,
  dragX: number,
  stride: number,
): number {
  if (stride <= 0) return index === currentIndex ? 1 : 0;
  const visualOffset = index - currentIndex + dragX / stride;
  const dist = Math.abs(visualOffset);
  if (dist >= 1) return 0;
  return Math.max(0, 1 - dist);
}

const ZONE_CATEGORY_LABEL: Record<ZoneId, string> = {
  head: 'headwear',
  face: 'eyewear',
  outer: 'outerwear',
  torso: 'top',
  inner: 'inner layer',
  legs: 'bottom',
  feet: 'footwear',
  accessory: 'bag',
};

const DOTS_MAX_SIDE = 4;

type DiscoverMixState = { seedIds: string[] };

export type DressingRoomHandle = { save: () => Promise<void> };

type DressingRoomProps = {
  embedded?: boolean;
  /** Full closet pool in Studio (default when embedded). */
  useFullCloset?: boolean;
  locationState?: unknown;
  zoneIndex?: ZoneIndexMap;
  onZoneIndexChange?: Dispatch<SetStateAction<ZoneIndexMap>>;
  outfitName?: string;
};

/**
 * Best-effort haptic feedback. Only fires on devices that expose the
 * Vibration API (Android Chrome, some Android browsers). Silently no-ops
 * on iOS Safari and desktop.
 */
function vibrate(ms = 8) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(ms);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Mix and Match — pick a few items from your closet, then swipe left/right
 * across each body zone to cycle through items in that category. No tray,
 * no drag-and-drop: every selected item is automatically bucketed into the
 * appropriate zone (tops/dresses/outerwear → torso, bottoms → legs, etc.)
 * and the user picks favourites for each zone via swipe gestures.
 *
 * Saving captures whatever is currently shown across all zones.
 *
 * The route still lives at `/studio/dressing-room` and the persisted
 * `OutfitMode` is still `'dressing-room'` so existing saved outfits stay
 * intact — only the user-facing label changes.
 */
export const DressingRoom = forwardRef<DressingRoomHandle, DressingRoomProps>(function DressingRoom(
  {
    embedded = false,
    useFullCloset = false,
    locationState,
    zoneIndex: controlledZoneIndex,
    onZoneIndexChange,
    outfitName,
  },
  ref,
) {
  const navigate = useNavigate();
  const location = useLocation();
  const discoverMix = (
    embedded
      ? (locationState as { discoverMix?: DiscoverMixState } | null)?.discoverMix
      : (location.state as { discoverMix?: DiscoverMixState } | null)?.discoverMix
  );

  const items = useWardrobeStore((s) => s.items);
  const selectedIds = useWardrobeStore((s) => s.selectedIds);
  const clearSelection = useWardrobeStore((s) => s.clearSelection);
  const toggleSelect = useWardrobeStore((s) => s.toggleSelect);
  const saveOutfit = useOutfitStore((s) => s.saveOutfit);

  // Studio: entire closet. Standalone: selection or Discover full closet.
  const poolItems = useMemo(() => {
    if (embedded && useFullCloset) return items;
    if (discoverMix) return items;
    return items.filter((it) => selectedIds.has(it.id));
  }, [embedded, useFullCloset, discoverMix, items, selectedIds]);

  const [internalZoneIndex, setInternalZoneIndex] = useState<ZoneIndexMap>(defaultZoneIndex);
  const [zoneExtras, setZoneExtras] = useState<Partial<Record<ZoneId, string[]>>>({});
  const zoneIndex = controlledZoneIndex ?? internalZoneIndex;
  const setZoneIndex = onZoneIndexChange ?? setInternalZoneIndex;
  const [saving, setSaving] = useState(false);
  const [askDiscard, setAskDiscard] = useState(false);
  const [addZone, setAddZone] = useState<ZoneId | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const seededRef = useRef(false);

  const zoneItems = useMemo(() => {
    const buckets = bucketItemsByZone(poolItems);
    for (const [zone, ids] of Object.entries(zoneExtras) as [ZoneId, string[]][]) {
      for (const id of ids) {
        const item = items.find((it) => it.id === id);
        if (item && !buckets[zone].some((it) => it.id === id)) {
          buckets[zone].push(item);
        }
      }
    }
    return buckets;
  }, [poolItems, zoneExtras, items]);

  // Discover seeds — only when not controlled by Studio parent.
  useEffect(() => {
    if (controlledZoneIndex || !discoverMix?.seedIds.length || seededRef.current) return;
    const seedSet = new Set(discoverMix.seedIds);
    const next = defaultZoneIndex();
    for (const z of ZONES) {
      if (z.id === 'outer') continue;
      const idx = zoneItems[z.id].findIndex((it) => seedSet.has(it.id));
      if (idx >= 0) next[z.id] = idx;
    }
    setZoneIndex(next);
    seededRef.current = true;
  }, [controlledZoneIndex, discoverMix, zoneItems, setZoneIndex]);

  const isEmpty = embedded && useFullCloset ? items.length === 0 : !discoverMix && selectedIds.size === 0;

  const displayBucket = (z: ZoneId) =>
    displayBucketForZone(z, zoneItems, zoneExtras, items);

  const activeIdxByZone = (z: ZoneId) => {
    const bucket = displayBucket(z);
    return idxForZone(zoneIndex, { ...zoneItems, [z]: bucket }, z);
  };

  const activeByZone = (z: ZoneId): WardrobeItem | undefined =>
    activeItemInDisplayBucket(zoneIndex, z, zoneItems, zoneExtras, items);

  const advance = (z: ZoneId, delta: number) => {
    setZoneIndex((prev) => ({ ...prev, [z]: (prev[z] ?? 0) + delta }));
    vibrate(8);
  };

  const jump = (z: ZoneId, idx: number) => {
    setZoneIndex((prev) => ({ ...prev, [z]: idx }));
    vibrate(8);
  };

  const onPickForZone = (item: WardrobeItem, targetZone: ZoneId) => {
    if (!zoneAcceptsItem(targetZone, item)) return;

    let pool = poolItems;
    if (!pool.some((it) => it.id === item.id) && !embedded && !discoverMix) {
      toggleSelect(item.id);
      pool = [...pool, item];
    }

    const defaultZone = zoneForWardrobeItem(item);
    // Outer is opt-in — track explicit picks even when category maps to outer.
    if (targetZone !== defaultZone || targetZone === 'outer') {
      setZoneExtras((prev) => {
        const list = prev[targetZone] ?? [];
        if (list.includes(item.id)) return prev;
        return { ...prev, [targetZone]: [...list, item.id] };
      });
    }

    const bucket = [...zoneItems[targetZone]];
    if (!bucket.some((it) => it.id === item.id)) bucket.push(item);
    const idx = bucket.findIndex((it) => it.id === item.id);
    if (idx >= 0) jump(targetZone, idx);
    setAddZone(null);
  };

  const onSave = async () => {
    const placed: { z: ZoneSpec; item: WardrobeItem }[] = [];
    for (const z of ZONES) {
      const item = activeByZone(z.id);
      if (item) placed.push({ z, item });
    }
    if (placed.length === 0) {
      toast('Pick items before saving', 'warning');
      return;
    }
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 50));
      const el = canvasRef.current;
      const thumb = el ? await captureElement(el, 2) : '';
      const nodes: CanvasNode[] = placed.map(({ z, item }, i) => ({
        itemId: item.id,
        x: z.rect.x,
        y: z.rect.y,
        w: z.rect.w,
        h: z.rect.h,
        rotation: 0,
        z: i + 1,
      }));
      const outfit = saveOutfit({
        name: outfitName?.trim() || undefined,
        mode: 'dressing-room',
        nodes,
        thumbnailDataUrl: thumb,
      });
      track('outfit_saved', { mode: 'dressing-room', items: nodes.length });
      clearSelection();
      navigate(`/outfit/${outfit.id}?celebrate=1`, { replace: true });
    } catch (err) {
      console.error(err);
      toast('Could not save outfit', 'warning');
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({ save: onSave }), [onSave]);

  // How many zones have at least one candidate?
  const filledZoneCount = ZONES.filter((z) => displayBucket(z.id).length > 0).length;

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col',
        embedded ? 'overflow-visible bg-bg' : 'overflow-hidden flex-1 bg-bg',
      )}
    >
      {isEmpty ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm text-ink-subtle">
            {embedded && useFullCloset
              ? 'Your closet is empty — add items first.'
              : 'No items selected. Pick a few from your closet first.'}
          </p>
          {!embedded && <Button onClick={() => navigate('/wardrobe')}>Back to wardrobe</Button>}
        </div>
      ) : (
        <>
      {!embedded && (
        <TopNav
          title="Mix and Match"
          showBack
          onBack={() => setAskDiscard(true)}
          borderless
          trailing={
            <AccentButton
              size="sm"
              onClick={onSave}
              disabled={saving}
              leadingIcon={<CheckIcon size={16} />}
            >
              {saving ? 'Saving…' : 'Save'}
            </AccentButton>
          }
        />
      )}

      <div className={cn('flex min-h-0 flex-1 flex-col overflow-visible', !embedded && 'page-x pb-2 pt-1')}>
        <div
          className={cn(
            'flex min-h-0 flex-1 items-center justify-center overflow-visible',
            embedded && 'px-4 py-3',
          )}
        >
          <div
            ref={canvasRef}
            className={cn(
              'relative overflow-visible bg-bg',
              embedded
                ? 'aspect-[300/520] h-full max-h-full w-auto max-w-full'
                : 'h-full max-h-full w-auto max-w-full aspect-[300/520] studio-frame',
            )}
          >
            <HeadMannequin />

            {ZONES.map((zone) => {
              const bucket = displayBucket(zone.id);
              if (bucket.length > 0) {
                return (
                  <ZoneCarousel
                    key={zone.id}
                    zone={zone}
                    items={bucket}
                    currentIndex={activeIdxByZone(zone.id)}
                    onAdvance={(delta) => advance(zone.id, delta)}
                    onJump={(idx) => jump(zone.id, idx)}
                    showChromeOnSwipe={embedded}
                  />
                );
              }
              return (
                <ZoneAddButton
                  key={zone.id}
                  zone={zone}
                  label={ZONE_CATEGORY_LABEL[zone.id]}
                  onAdd={() => setAddZone(zone.id)}
                />
              );
            })}

            <div className="pointer-events-none absolute bottom-4 left-5 text-[9px] font-semibold uppercase tracking-widish text-ink-faint">
              Made on Myntra Wardrobe
            </div>
          </div>
        </div>

        {!embedded && (
          <p className="mt-2 max-w-[20rem] shrink-0 text-center text-[11px] leading-[1.45] text-ink-faint">
            {filledZoneCount > 0
              ? discoverMix
                ? 'Swipe any layer to swap pieces from your closet, then tap Save.'
                : 'Swipe a layer left or right to try a different piece, then tap Save.'
              : 'Add items to your closet to start mixing.'}
          </p>
        )}
      </div>

      {!embedded && (
        <ConfirmDialog
          open={askDiscard}
          title="Discard this outfit?"
          body="Your placements won't be saved."
          confirmLabel="Discard"
          destructive
          onCancel={() => setAskDiscard(false)}
          onConfirm={() => {
            setAskDiscard(false);
            clearSelection();
            navigate('/wardrobe', { replace: true });
          }}
        />
      )}

      <StudioClosetSheet
        open={addZone !== null}
        onClose={() => setAddZone(null)}
        items={items}
        filterZone={addZone ?? undefined}
        title={addZone ? `Add ${ZONE_CATEGORY_LABEL[addZone]}` : 'Add from closet'}
        onPick={(it) => addZone && onPickForZone(it, addZone)}
      />
        </>
      )}
    </div>
  );
});

/* ---------- ZoneCarousel ---------- */

function ZoneCarousel({
  zone,
  items,
  currentIndex,
  onAdvance,
  onJump,
  showChromeOnSwipe = false,
}: {
  zone: ZoneSpec;
  items: WardrobeItem[];
  currentIndex: number;
  onAdvance: (delta: number) => void;
  onJump: (idx: number) => void;
  showChromeOnSwipe?: boolean;
}) {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const dragXRef = useRef(0);
  const pendingAdvanceRef = useRef(0);
  const [drag, setDrag] = useState({ x: 0, dragging: false, animating: false });
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const el = zoneRef.current;
    if (!el) return;
    const measure = () => setViewportWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const slideStride = viewportWidth + CAROUSEL_SLIDE_GAP_PX;

  const total = items.length;
  const item = total > 0 ? items[currentIndex] : undefined;
  const canCycle = total > 1;
  const isSwiping = drag.dragging || drag.animating || Math.abs(drag.x) > 6;
  const showChrome = !showChromeOnSwipe || isSwiping;

  const finishSwipe = (delta: 0 | 1 | -1) => {
    const stride = slideStride || zoneRef.current?.offsetWidth || 120;
    if (delta === 0) {
      dragXRef.current = 0;
      setDrag({ x: 0, dragging: false, animating: true });
      return;
    }
    pendingAdvanceRef.current = delta;
    const commitX = delta > 0 ? -stride : stride;
    dragXRef.current = commitX;
    setDrag({ x: commitX, dragging: false, animating: true });
  };

  const startXRef = useRef(0);
  const activePointerRef = useRef<number | null>(null);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!canCycle || drag.animating) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    activePointerRef.current = e.pointerId;
    startXRef.current = e.clientX;
    pendingAdvanceRef.current = 0;
    dragXRef.current = 0;
    setDrag({ x: 0, dragging: true, animating: false });
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag.dragging || activePointerRef.current !== e.pointerId) return;
    const stride = slideStride || zoneRef.current?.offsetWidth || 120;
    const maxDrag = stride * 0.92;
    const dx = e.clientX - startXRef.current;
    const x = Math.max(-maxDrag, Math.min(maxDrag, dx));
    dragXRef.current = x;
    setDrag({ x, dragging: true, animating: false });
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (activePointerRef.current !== e.pointerId) return;
    activePointerRef.current = null;
    const stride = slideStride || zoneRef.current?.offsetWidth || 120;
    const x = dragXRef.current;
    const threshold = Math.max(SWIPE_THRESHOLD, stride * SWIPE_FRACTION);
    if (x < -threshold) finishSwipe(1);
    else if (x > threshold) finishSwipe(-1);
    else finishSwipe(0);
  };

  const onTrackTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const delta = pendingAdvanceRef.current;
    if (delta !== 0) {
      pendingAdvanceRef.current = 0;
      onAdvance(delta);
      dragXRef.current = 0;
      setDrag({ x: 0, dragging: false, animating: false });
      return;
    }
    if (drag.animating) {
      dragXRef.current = 0;
      setDrag({ x: 0, dragging: false, animating: false });
    }
  };

  const categoryLabel = ZONE_CATEGORY_LABEL[zone.id];

  if (!item) return null;

  const positionLabel = canCycle ? `${currentIndex + 1} of ${total}` : '';

  const pct = {
    left: `${(zone.rect.x / FRAME_W) * 100}%`,
    top: `${(zone.rect.y / FRAME_H) * 100}%`,
    width: `${(zone.rect.w / FRAME_W) * 100}%`,
    height: `${(zone.rect.h / FRAME_H) * 100}%`,
  };

  const trackOffset = slideStride > 0 ? -currentIndex * slideStride + drag.x : drag.x;
  const slideWidth = viewportWidth > 0 ? viewportWidth : undefined;
  const trackTransition = drag.dragging
    ? 'none'
    : 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)';
  const opacityTransition = drag.dragging
    ? 'none'
    : 'opacity 340ms cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div
      ref={zoneRef}
      role="group"
      aria-roledescription={canCycle ? 'carousel' : undefined}
      aria-label={`${zone.label}: ${item.brand ? item.brand + ' ' : ''}${item.name ?? categoryLabel}${canCycle ? ` (${positionLabel})` : ''}`}
      className={cn(
        'absolute touch-none overflow-visible',
        canCycle ? 'cursor-grab active:cursor-grabbing' : '',
      )}
      style={{ ...pct, zIndex: ZONE_LAYER[zone.id] }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="h-full w-full overflow-visible">
        <div
          className="flex h-full"
          style={{
            gap: `${CAROUSEL_SLIDE_GAP_PX}px`,
            transform: `translateX(${trackOffset}px)`,
            transition: trackTransition,
            willChange: drag.dragging || drag.animating ? 'transform' : undefined,
          }}
          onTransitionEnd={onTrackTransitionEnd}
        >
          {items.map((it, index) => {
            const display = zoneItemDisplayStyle(zone.id);
            const opacity = carouselSlideOpacity(index, currentIndex, drag.x, slideStride);
            return (
              <div
                key={it.id}
                className="flex h-full shrink-0 items-center justify-center overflow-visible"
                style={{
                  width: slideWidth ?? '100%',
                  opacity,
                  transition: opacityTransition,
                  pointerEvents: opacity < 0.05 ? 'none' : 'auto',
                }}
              >
                <img
                  src={it.thumbnailDataUrl}
                  alt={it.name ?? categoryLabel}
                  draggable={false}
                  className={cn(
                    'object-contain object-center drop-shadow-[0_10px_20px_rgba(17,17,19,0.12)]',
                    isApparelZone(zone.id) ? 'shrink-0' : 'max-h-full max-w-full',
                  )}
                  style={{
                    width: display.width,
                    height: display.height,
                    transform: display.transform,
                    transformOrigin: 'center center',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {canCycle && (
        <span aria-live="polite" className="sr-only">
          {item.name ?? categoryLabel}, {positionLabel}
        </span>
      )}

      {canCycle && showChrome && (
        <div
          className={cn(
            'absolute left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-200',
            showChromeOnSwipe ? 'bottom-0 translate-y-[105%]' : '-bottom-1 translate-y-full',
          )}
        >
          <span className="max-w-[120px] truncate rounded-full bg-ink/70 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
            {item.name ?? categoryLabel}
          </span>
          <div className="flex items-end gap-2">
            {visibleDotIndices(currentIndex, total, DOTS_MAX_SIDE).map((i) => {
              const dist = Math.abs(i - currentIndex);
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={items[i]!.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJump(i);
                  }}
                  aria-label={`Show ${items[i]!.name ?? categoryLabel} (${i + 1} of ${total})`}
                  aria-current={isCurrent}
                  className={cn(
                    'shrink-0 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    dotClassName(dist, isCurrent),
                  )}
                />
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

function visibleDotIndices(current: number, total: number, maxSide: number): number[] {
  if (total <= 1) return [];
  const lo = Math.max(0, current - maxSide);
  const hi = Math.min(total - 1, current + maxSide);
  return Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
}

/** Active dot stays full size; neighbours shrink with distance (max 4 each side). */
function dotClassName(distance: number, isCurrent: boolean): string {
  if (isCurrent) return 'h-1.5 w-4 bg-primary';
  switch (distance) {
    case 1:
      return 'h-1.5 w-1.5 bg-ink-faint';
    case 2:
      return 'h-[5px] w-[5px] bg-ink-ghost';
    case 3:
      return 'h-1 w-1 bg-ink-ghost/80';
    default:
      return 'h-[3px] w-[3px] bg-ink-ghost/60';
  }
}

function zoneFrameStyle(zone: ZoneSpec) {
  return {
    left: `${(zone.rect.x / FRAME_W) * 100}%`,
    top: `${(zone.rect.y / FRAME_H) * 100}%`,
    width: `${(zone.rect.w / FRAME_W) * 100}%`,
    height: `${(zone.rect.h / FRAME_H) * 100}%`,
  };
}

function ZoneAddButton({
  zone,
  label,
  onAdd,
}: {
  zone: ZoneSpec;
  label: string;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`Add ${label}`}
      className={cn(
        'absolute z-10 flex flex-col items-center justify-center gap-1 rounded-2xl p-1',
        'bg-bg-soft/50',
        'transition-colors active:scale-[0.98] hover:bg-primary/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      )}
      style={zoneFrameStyle(zone)}
    >
      <SlotSilhouette zone={zone.id} className="h-[72%] w-[72%] opacity-90" />
      <span className="grid absolute bottom-1 right-1 h-8 w-8 place-items-center rounded-full border border-border-subtle bg-bg text-ink-subtle shadow-sm">
        <PlusIcon size={16} />
      </span>
      <span className="pointer-events-none absolute left-2 top-2 text-[8px] font-bold uppercase tracking-widish text-ink-faint">
        {label}
      </span>
    </button>
  );
}
