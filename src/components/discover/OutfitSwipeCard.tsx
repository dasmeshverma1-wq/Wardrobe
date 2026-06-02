import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/lib/cn';
import { BagIcon, WandIcon } from '@/components/ui/Icon';
import {
  outfitTotalPaise,
  SURFACE_GRADIENT,
  type CreatorOutfit,
} from '@/data/creatorOutfits';
import { flatLayItemsForOutfit } from '@/lib/discoverFlatLay';
import { formatRupees } from '@/data/myntraSamples';
import { flatLayItemStyle } from '@/lib/flatLayStyle';

export type SwipeDir = 'left' | 'right';

type Props = {
  outfit: CreatorOutfit;
  depth: number;
  interactive: boolean;
  /** Horizontal drag on the top card — drives peek/follow on cards behind. */
  peekDragX?: number;
  onDragChange?: (x: number) => void;
  onSwipe: (dir: SwipeDir) => void;
  onTryOn?: () => void;
  onAddToBag?: () => void;
};

const COMMIT_THRESHOLD = 100;
const SCREEN_WIDTH_PAD = 520;
const SPRING_MS = 360;
const SPRING_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const PEEK_OFFSET = 44;

/**
 * Full-bleed swipe card with stack peek — cards behind fan out left/right and
 * ease toward centre as the top card is dragged.
 */
export function OutfitSwipeCard({
  outfit,
  depth,
  interactive,
  peekDragX = 0,
  onDragChange,
  onSwipe,
  onTryOn,
  onAddToBag,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [throwing, setThrowing] = useState<SwipeDir | null>(null);
  const startRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);

  useEffect(() => {
    if (!interactive) {
      setDrag({ x: 0, y: 0, active: false });
      setThrowing(null);
      startRef.current = null;
    }
  }, [interactive]);

  function onPointerDown(e: ReactPointerEvent) {
    if (!interactive || throwing) return;
    if ((e.target as HTMLElement).closest('[data-no-swipe]')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    setDrag({ x: 0, y: 0, active: true });
  }

  function onPointerMove(e: ReactPointerEvent) {
    const start = startRef.current;
    if (!start || start.pointerId !== e.pointerId) return;
    const x = e.clientX - start.x;
    const y = e.clientY - start.y;
    setDrag({ x, y, active: true });
    onDragChange?.(x);
  }

  function onPointerUp(e: ReactPointerEvent) {
    const start = startRef.current;
    if (!start || start.pointerId !== e.pointerId) return;
    const x = e.clientX - start.x;
    const y = e.clientY - start.y;
    startRef.current = null;
    onDragChange?.(0);

    if (Math.abs(x) > COMMIT_THRESHOLD) {
      setDrag({ x, y, active: false });
      commit(x > 0 ? 'right' : 'left');
    } else {
      setDrag({ x: 0, y: 0, active: false });
    }
  }

  function commit(dir: SwipeDir) {
    setThrowing(dir);
    onDragChange?.(0);
    window.setTimeout(() => onSwipe(dir), SPRING_MS + 40);
  }

  function cardTransform(): string {
    const dragNorm = Math.max(-1, Math.min(1, peekDragX / COMMIT_THRESHOLD));
    const absDrag = Math.abs(dragNorm);

    if (throwing) {
      const dx = throwing === 'right' ? SCREEN_WIDTH_PAD : -SCREEN_WIDTH_PAD;
      const rot = throwing === 'right' ? 10 : -10;
      return `translate3d(${dx}px, 16px, 0) rotate(${rot}deg) scale(0.95)`;
    }

    if (interactive && (drag.active || drag.x !== 0 || drag.y !== 0)) {
      const rot = drag.x * 0.035;
      return `translate3d(${drag.x}px, ${drag.y * 0.22}px, 0) rotate(${rot}deg)`;
    }

    if (depth === 1) {
      const restY = 12; // 12px vertical stacking offset
      const followY = -12 * absDrag;
      const scale = 0.955 + absDrag * 0.045;
      const rot = 1.6 - dragNorm * 1.6;
      return `translate3d(0, ${restY + followY}px, 0) scale(${scale}) rotate(${rot}deg)`;
    }

    if (depth === 2) {
      const restY = 24; // 24px vertical stacking offset
      const followY = -12 * absDrag;
      const scale = 0.91 + absDrag * 0.045;
      const rot = -1.2 + dragNorm * 2.8;
      return `translate3d(0, ${restY + followY}px, 0) scale(${scale}) rotate(${rot}deg)`;
    }

    return 'translate3d(0, 0, 0) rotate(-0.2deg)';
  }

  const dragFraction = Math.max(-1, Math.min(1, drag.x / COMMIT_THRESHOLD));
  const showSave = dragFraction > 0.12;
  const showPass = dragFraction < -0.12;
  const stampOpacity = Math.min(1, Math.abs(dragFraction) * 1.05);

  const displayItems = flatLayItemsForOutfit(outfit);
  const total = outfitTotalPaise(outfit);
  const isAnimating =
    throwing || (!interactive && depth > 0) || (!drag.active && interactive && (drag.x !== 0 || drag.y !== 0));

  return (
    <div
      ref={rootRef}
      className={cn(
        'absolute inset-0 select-none touch-none',
        interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
      )}
      style={{
        transform: cardTransform(),
        transformOrigin: '50% 88%',
        transition: drag.active
          ? 'none'
          : isAnimating
          ? `transform ${SPRING_MS}ms ${SPRING_EASE}, opacity ${SPRING_MS}ms ease-out`
          : depth > 0
          ? `transform ${SPRING_MS}ms ${SPRING_EASE}`
          : 'none',
        zIndex: 100 - depth,
        opacity: throwing ? 0 : depth === 2 ? 0.92 : 1,
        willChange: 'transform, opacity',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <article className="relative h-full w-full overflow-hidden rounded-frame bg-bg shadow-[0_12px_36px_rgba(0,0,0,0.14)] ring-1 ring-white/10">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: SURFACE_GRADIENT[outfit.surface] }}
        >
          <CreatorBadge outfit={outfit} />

          {onTryOn && interactive && (
            <button
              data-no-swipe
              onClick={onTryOn}
              aria-label="Try this look on"
              className={cn(
                'absolute right-3 top-3 z-20 inline-flex items-center gap-1',
                'rounded-full bg-bg/90 px-2.5 py-1.5 backdrop-blur-sm',
                'text-[11px] font-semibold text-ink-strong',
                'shadow-sm ring-1 ring-border-subtle transition-transform active:scale-95',
              )}
            >
              <WandIcon size={12} className="text-accent-ai" />
              Try on
            </button>
          )}

          <div className="absolute inset-0 pt-2">
            {outfit.heroImage ? (
              <img
                src={outfit.heroImage}
                alt={outfit.title}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : (
              [...displayItems]
                .sort((a, b) => (a.slot.z ?? 1) - (b.slot.z ?? 1))
                .map((it) => (
                  <img
                    key={it.productId}
                    src={it.image}
                    alt={it.name}
                    draggable={false}
                    style={flatLayItemStyle(it.slot)}
                  />
                ))
            )}
          </div>

          {interactive && showSave && (
            <DragStamp label="Save" tone="save" opacity={stampOpacity} positionClass="left-5 top-12" />
          )}
          {interactive && showPass && (
            <DragStamp label="Pass" tone="pass" opacity={stampOpacity} positionClass="right-5 top-12" />
          )}

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[52%]"
            style={{
              background:
                'linear-gradient(to top, rgba(11, 2, 28, 0.82) 0%, rgba(11, 2, 28, 0.45) 42%, rgba(11, 2, 28, 0) 100%)',
            }}
          />

          <div
            data-no-swipe
            className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[6.75rem] pt-10"
          >
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white/80 tracking-wide">
              <span>{displayItems.length} items</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>{outfit.occasion.split('·')[0]?.trim() ?? outfit.occasion}</span>
              {outfit.badge === 'myntra' && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span className="text-[#ff527b] font-bold">Myntra Pick</span>
                </>
              )}
            </div>

            <h3 className="mt-2.5 text-[22px] font-bold leading-tight tracking-tightish text-white">
              {outfit.title}
            </h3>

            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold tabular-nums text-white/90">
                {formatRupees(total)}
              </p>
              {onAddToBag && interactive && (
                <button
                  onClick={onAddToBag}
                  aria-label={`Add all ${displayItems.length} pieces to bag`}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full',
                    'bg-white/15 px-3 py-1.5 backdrop-blur-sm',
                    'text-[12px] font-semibold text-white ring-1 ring-white/20',
                    'transition-transform active:scale-95',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                  )}
                >
                  <BagIcon size={13} />
                  Add to bag
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

/* ---------- helpers ---------- */

function MetaTag({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm',
        accent
          ? 'bg-primary/90 text-white ring-1 ring-white/15'
          : 'bg-white/15 text-white/95 ring-1 ring-white/15',
      )}
    >
      {children}
    </span>
  );
}

function CreatorBadge({ outfit }: { outfit: CreatorOutfit }) {
  if (outfit.badge === 'myntra') return null;

  return (
    <div className="absolute left-3 top-3 z-20">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-bg/90 px-2.5 py-1.5 text-[11px] font-semibold text-ink shadow-sm ring-1 ring-border-subtle backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {outfit.creator}
      </span>
    </div>
  );
}

function DragStamp({
  label,
  tone,
  opacity,
  positionClass,
}: {
  label: string;
  tone: 'save' | 'pass';
  opacity: number;
  positionClass: string;
}) {
  const fill =
    tone === 'save'
      ? 'bg-primary text-white ring-2 ring-white/30'
      : 'bg-ink-strong text-white ring-2 ring-white/20';
  return (
    <div
      className={cn('pointer-events-none absolute z-30 select-none', positionClass)}
      style={{ opacity }}
    >
      <span
        className={cn(
          'inline-block rounded-2xl px-4 py-2 text-[20px] font-bold tracking-tightish shadow-pop',
          fill,
        )}
      >
        {label}
      </span>
    </div>
  );
}
