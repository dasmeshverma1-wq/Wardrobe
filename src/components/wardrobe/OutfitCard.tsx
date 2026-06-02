import type { Outfit } from '@/types';
import { getOutfitPieceCount } from '@/lib/outfitPieces';
import { format } from 'date-fns';
import { cn } from '@/lib/cn';

export function OutfitCard({
  outfit,
  onClick,
  plannedDate,
  className,
}: {
  outfit: Outfit;
  onClick?: () => void;
  plannedDate?: string;
  className?: string;
}) {
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
        'group flex w-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg',
        'transition-transform active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        className,
      )}
    >
      <div className="relative aspect-[9/16] w-full shrink-0 overflow-hidden bg-bg-soft">
        <img
          src={outfit.thumbnailDataUrl}
          alt={outfit.name ?? 'Outfit'}
          className={cn(
            'absolute inset-0 h-full w-full object-cover object-center',
            outfit.generationStatus === 'generating' && 'opacity-40 blur-[1px]',
          )}
          draggable={false}
        />
        {outfit.generationStatus === 'generating' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/75 px-3 text-center">
            <div
              className="h-7 w-7 animate-spin rounded-full border-2 border-[#ff3f6c] border-t-transparent"
              aria-hidden
            />
            <p className="mt-2 text-[11px] font-bold leading-snug text-[#262a39]">Generating try-on…</p>
            <p className="mt-0.5 text-[10px] text-[#8d8e96]">This may take a minute</p>
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
      <div className="flex h-[3.25rem] shrink-0 flex-col justify-center px-2.5 text-left">
        <div className="truncate text-[13px] font-bold leading-tight tracking-tightish text-ink-strong">
          {name}
        </div>
        <div className="truncate text-[11px] leading-tight text-ink-subtle">
          {pieceCount > 0 ? `${pieceCount} items · ${modeLabel}` : modeLabel}
        </div>
      </div>
    </button>
  );
}
