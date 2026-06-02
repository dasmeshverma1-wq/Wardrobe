import type { Outfit } from '@/types';
import { getOutfitPieceCount } from '@/lib/outfitPieces';
import { format } from 'date-fns';
import { cn } from '@/lib/cn';

export function OutfitCard({
  outfit,
  onClick,
  plannedDate,
  className,
  imageAspect = 'portrait',
  size = 'default',
  imageFit,
  imageFocus = 'center',
}: {
  outfit: Outfit;
  onClick?: () => void;
  plannedDate?: string;
  className?: string;
  /** Portrait for saved try-ons; square for home creator / AI rails. */
  imageAspect?: 'portrait' | 'square';
  /** Smaller tile for horizontal home rails. */
  size?: 'default' | 'compact';
  /** Cover the frame (fill) or show full flat-lay (contain). */
  imageFit?: 'fill' | 'contain';
  /** Vertical anchor when using fill — center keeps model shots aligned in square tiles. */
  imageFocus?: 'center' | 'top';
}) {
  const compact = size === 'compact';
  const fit =
    imageFit ??
    (imageAspect === 'square' && outfit.mode === 'dressing-room' ? 'contain' : 'fill');
  const modeLabel =
    outfit.mode === 'collage'
      ? 'Collage'
      : outfit.mode === 'try-on'
      ? 'AI Try-On'
      : 'Mix & Match';
  const name = outfit.name ?? `Look ${outfit.id.slice(-4)}`;
  const pieceCount = getOutfitPieceCount(outfit);
  const planned = plannedDate ? `, planned for ${format(new Date(plannedDate + 'T00:00:00'), 'EEEE d MMMM')}` : '';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${name}, ${pieceCount} items, ${modeLabel}${planned}. Tap to open.`}
      className={cn(
        'group flex w-full flex-col overflow-hidden border border-border-subtle bg-bg',
        compact ? 'rounded-xl' : 'rounded-2xl',
        'transition-transform active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        className,
      )}
    >
      <div
        className={cn(
          'relative w-full shrink-0 overflow-hidden bg-bg-soft',
          imageAspect === 'square' ? 'aspect-square' : 'aspect-[9/16]',
        )}
      >
        <img
          src={outfit.thumbnailDataUrl}
          alt={outfit.name ?? 'Outfit'}
          className={cn(
            'absolute inset-0 h-full w-full',
            fit === 'contain'
              ? cn('object-contain', compact ? 'p-1' : 'p-1.5')
              : cn(
                  'object-cover',
                  imageFocus === 'top' ? 'object-top' : 'object-center',
                ),
            outfit.generationStatus === 'generating' && 'opacity-40 blur-[1px]',
          )}
          draggable={false}
        />
        {outfit.generationStatus === 'generating' && (
          <div
            className={cn(
              'absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/75 text-center',
              compact ? 'px-1.5' : 'px-3',
            )}
          >
            <div
              className={cn(
                'animate-spin rounded-full border-2 border-[#ff3f6c] border-t-transparent',
                compact ? 'h-5 w-5' : 'h-7 w-7',
              )}
              aria-hidden
            />
            <p
              className={cn(
                'font-bold leading-snug text-[#262a39]',
                compact ? 'mt-1 text-[9px]' : 'mt-2 text-[11px]',
              )}
            >
              Generating try-on…
            </p>
            {!compact && (
              <p className="mt-0.5 text-[10px] text-[#8d8e96]">This may take a minute</p>
            )}
          </div>
        )}
        {outfit.generationStatus === 'failed' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 px-3 text-center">
            <p className="text-[11px] font-bold text-[#262a39]">Generation failed</p>
            <p className="mt-0.5 text-[10px] text-[#8d8e96]">Open to retry from Try-On</p>
          </div>
        )}
        {plannedDate && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-semibold tracking-tightish text-white">
            {format(new Date(plannedDate + 'T00:00:00'), 'EEE d MMM')}
          </span>
        )}
      </div>
      <div
        className={cn(
          'flex shrink-0 flex-col justify-center text-left',
          compact ? 'h-[2.625rem] px-2' : 'h-[3.25rem] px-2.5',
        )}
      >
        <div
          className={cn(
            'truncate font-bold leading-tight tracking-tightish text-ink-strong',
            compact ? 'text-[12px]' : 'text-[13px]',
          )}
        >
          {name}
        </div>
        <div
          className={cn(
            'truncate leading-tight text-ink-subtle',
            compact ? 'text-[10px]' : 'text-[11px]',
          )}
        >
          {pieceCount > 0 ? `${pieceCount} items · ${modeLabel}` : modeLabel}
        </div>
      </div>
    </button>
  );
}
