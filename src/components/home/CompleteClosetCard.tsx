import { Button } from '@/components/ui/Button';
import { PlusIcon, WandIcon } from '@/components/ui/Icon';
import { formatRupees } from '@/data/myntraSamples';
import type { ClosetPairing } from '@/lib/closetPairings';
import { zoneForGarment } from '@/lib/tryOnPlacement';
import { cn } from '@/lib/cn';

type Props = {
  pairing: ClosetPairing;
  onTryOn: () => void;
  showTryOn?: boolean;
};

export function CompleteClosetCard({ pairing, onTryOn, showTryOn = true }: Props) {
  const { ownedItem, recommendation } = pairing;
  const ownedLabel = ownedItem.name ?? ownedItem.category;

  return (
    <article
      className={cn(
        'flex w-[11.25rem] shrink-0 flex-col overflow-hidden rounded-3xl border border-border-subtle bg-bg',
        'shadow-[0_2px_12px_rgba(38,42,57,0.05)]',
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <span className="truncate text-[11px] font-bold text-ink-strong">{ownedLabel}</span>
        <span className="shrink-0 rounded-full bg-accent-aiSoft px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-accent-ai">
          AI
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-1.5 px-3">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-divider bg-bg-soft p-1.5">
          <img
            src={ownedItem.thumbnailDataUrl}
            alt=""
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-divider bg-bg text-ink-faint">
          <PlusIcon size={12} strokeWidth={2.5} />
        </span>
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-border bg-bg-soft p-1.5">
          <img
            src={recommendation.image}
            alt=""
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>
      </div>

      <p className="mt-2.5 truncate px-3 text-[11px] font-semibold text-ink-subtle">
        + {recommendation.name}
      </p>

      <div className="mt-auto flex items-end justify-between gap-2 border-t border-divider px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-faint">Myntra</p>
          <p className="text-[13px] font-bold tabular-nums text-ink-strong">
            {formatRupees(recommendation.pricePaise)}
          </p>
        </div>
        {showTryOn ? (
          <Button
            size="sm"
            variant="secondary"
            className="h-8 shrink-0 px-2.5 text-[11px]"
            leadingIcon={<WandIcon size={12} />}
            onClick={onTryOn}
          >
            Try on
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function tryOnGarmentsFromPairing(pairing: ClosetPairing) {
  const { ownedItem, recommendation } = pairing;
  return [
    {
      id: ownedItem.id,
      name: ownedItem.name ?? ownedItem.category,
      category: ownedItem.category,
      imageUrl: ownedItem.thumbnailDataUrl,
      zone: zoneForGarment({ category: ownedItem.category, name: ownedItem.name }),
    },
    {
      id: recommendation.productId,
      name: recommendation.name,
      category: recommendation.category,
      imageUrl: recommendation.image,
      zone: zoneForGarment({ category: recommendation.category, name: recommendation.name }),
    },
  ];
}
