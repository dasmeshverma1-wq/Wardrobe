import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { TopNav } from '@/components/ui/TopNav';
import { Button, AccentButton } from '@/components/ui/Button';
import {
  ShareIcon,
  CalendarIcon,
  TrashIcon,
  CheckIcon,
  EditIcon,
  ExternalLinkIcon,
  WandIcon,
} from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useOutfitStore } from '@/store/outfitStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { usePlannerStore } from '@/store/plannerStore';
import { shareOrDownload } from '@/lib/share';
import { toast } from '@/components/ui/Toast';
import { AddToPlannerSheet } from '@/components/planner/AddToPlannerSheet';
import { SavedCelebration } from '@/components/wardrobe/SavedCelebration';
import { formatRupees } from '@/data/myntraSamples';
import { pickCompleteTheLook } from '@/lib/completeTheLook';
import { track } from '@/lib/telemetry';
import { navigateToTryOn, tryOnStateFromOutfit } from '@/lib/tryOnNavigation';
import { resolveOutfitById, useTryOnPersona, isWireframeDemoOutfit } from '@/lib/tryOnPersona';
import { getOutfitPieceCount, resolveOutfitWardrobeItems } from '@/lib/outfitPieces';
import { useChrome } from '@/store/chromeStore';
import { cn } from '@/lib/cn';

export function OutfitDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const isV2 = useChrome((s) => s.wireframeVersion === 'v2');
  const [params, setParams] = useSearchParams();
  const storedOutfits = useOutfitStore((s) => s.outfits);
  const removeOutfit = useOutfitStore((s) => s.removeOutfit);
  const renameOutfit = useOutfitStore((s) => s.renameOutfit);
  const { persona } = useTryOnPersona();
  const outfit = useMemo(
    () => resolveOutfitById(id, storedOutfits, persona),
    [id, storedOutfits, persona],
  );
  const items = useWardrobeStore((s) => s.items);
  const markWorn = useWardrobeStore((s) => s.markWorn);
  const pin = usePlannerStore((s) => s.pin);
  const entries = usePlannerStore((s) => s.entries);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(outfit?.name ?? '');
  const [planOpen, setPlanOpen] = useState(false);
  const [askDelete, setAskDelete] = useState(false);

  const celebrate = params.get('celebrate') === '1';
  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      next.delete('celebrate');
      setParams(next, { replace: true });
    }, 2000);
    return () => clearTimeout(t);
  }, [celebrate, params, setParams]);

  const outfitItems = useMemo(
    () => (outfit ? resolveOutfitWardrobeItems(outfit, items) : []),
    [outfit, items],
  );
  const pieceCount = outfit ? getOutfitPieceCount(outfit) : 0;

  const ctl = useMemo(() => (outfit ? pickCompleteTheLook(outfit, outfitItems) : []), [outfit, outfitItems]);

  useEffect(() => {
    if (outfit) track('ctl_shown', { outfitId: outfit.id, items: outfitItems.length });
  }, [outfit, outfitItems.length]);

  if (!outfit) {
    return (
      <div className="flex flex-1 flex-col min-h-0">
        <TopNav title="Outfit" showBack />
        <EmptyState
          title="Outfit not found"
          body="It may have been deleted from your library."
          action={<Button onClick={() => navigate(isV2 ? '/home' : '/wardrobe')}>Back to wardrobe</Button>}
        />
      </div>
    );
  }

  const pinnedDate = Object.values(entries).find((e) => e.outfitId === outfit.id)?.date;

  const onShare = async () => {
    if (!outfit.thumbnailDataUrl) {
      toast('Re-open this outfit and try again', 'warning');
      return;
    }
    const result = await shareOrDownload(
      outfit.thumbnailDataUrl,
      `${(outfit.name ?? 'myntra-look').replace(/\s+/g, '-').toLowerCase()}.png`,
      'My look on Myntra Wardrobe',
    );
    if (result === 'shared') {
      track('outfit_shared', { outfitId: outfit.id, method: 'native' });
      toast('Shared!', 'success');
    } else if (result === 'downloaded') {
      track('outfit_shared', { outfitId: outfit.id, method: 'download' });
      toast('Saved to your downloads');
    }
  };

  const onWearToday = () => {
    if (!isV2) {
      pin(format(new Date(), 'yyyy-MM-dd'), outfit.id);
      track('planner_pin', { outfitId: outfit.id, target: 'today' });
    }
    markWorn(outfitItems.map((it) => it.id));
    toast(isV2 ? 'Marked as worn today' : "Pinned to today's planner", 'success');
  };

  const onPin = (date: string) => {
    pin(date, outfit.id);
    track('planner_pin', { outfitId: outfit.id, date });
    setPlanOpen(false);
    toast(`Pinned to ${format(new Date(date + 'T00:00:00'), 'EEE d MMM')}`, 'success');
  };

  const displayName = outfit.name ?? `Look ${outfit.id.slice(-4)}`;
  const modeLabel =
    outfit.mode === 'collage' ? 'Collage' : outfit.mode === 'try-on' ? 'AI Try-On' : 'Mix and Match';
  const pinnedLabel = pinnedDate ? format(new Date(pinnedDate + 'T00:00:00'), 'EEE d MMM') : null;

  const commitRename = () => {
    const next = nameInput.trim();
    if (next.length > 0) renameOutfit(outfit.id, next);
    setEditing(false);
  };

  return (
    <div className="relative flex flex-1 flex-col min-h-0 bg-bg">
      <TopNav
        title="Outfit"
        showBack
        borderless
        trailing={
          <button
            onClick={() => {
              setEditing(true);
              setNameInput(outfit.name ?? '');
            }}
            aria-label="Rename outfit"
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <EditIcon size={18} />
          </button>
        }
      />

      <div className="scroll-area page-x pt-1 pb-32">
        {/* Hero image */}
        <div className="overflow-hidden rounded-3xl border border-border-subtle bg-bg">
          {outfit.thumbnailDataUrl ? (
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-bg-soft">
              <img
                src={outfit.thumbnailDataUrl}
                alt={displayName}
                className="absolute inset-0 h-full w-full object-cover object-center"
                draggable={false}
              />
            </div>
          ) : (
            <div className="grid aspect-[9/16] place-items-center text-ink-faint">No preview</div>
          )}
        </div>

        {/* Editorial title block */}
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-subtle">
            {modeLabel} · {pieceCount} {pieceCount === 1 ? 'piece' : 'pieces'}
          </p>
          {editing ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') {
                  setEditing(false);
                  setNameInput(outfit.name ?? '');
                }
              }}
              maxLength={42}
              aria-label="Outfit name"
              placeholder="Name this look"
              className="mt-1.5 -ml-1 w-full rounded-md border border-border bg-bg px-1 text-[28px] font-bold leading-tight tracking-tightish text-ink-strong placeholder:text-ink-ghost focus:border-ink-strong focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          ) : (
            <button
              onClick={() => {
                setEditing(true);
                setNameInput(outfit.name ?? '');
              }}
              aria-label={`Rename "${displayName}"`}
              className="mt-1.5 block w-full rounded-md text-left text-[28px] font-bold leading-tight tracking-tightish text-ink-strong transition-colors hover:bg-bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {displayName}
            </button>
          )}
          {pinnedLabel && !isV2 && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold tracking-tightish text-ink-strong">
              <CalendarIcon size={12} />
              Pinned to {pinnedLabel}
            </p>
          )}
        </div>

        {/* Pieces in this look */}
        <p className="section-label mt-7 mb-2">Pieces in this look</p>
        <ul className="-mx-1 flex gap-2 overflow-x-auto no-scrollbar px-1 pb-1">
          {outfitItems.map((it) => (
            <li key={it.id} className="flex w-20 shrink-0 flex-col items-stretch gap-1">
              <div className="aspect-square overflow-hidden rounded-xl border border-border-subtle bg-bg p-1.5">
                <img src={it.thumbnailDataUrl} className="h-full w-full object-contain" alt="" />
              </div>
              <span className="truncate text-[11px] font-medium tracking-tightish text-ink-subtle">
                {it.brand ?? it.name ?? it.category}
              </span>
              {typeof it.timesWorn === 'number' && it.timesWorn > 0 && (
                <span className="truncate text-[10px] text-ink-faint">
                  worn {it.timesWorn}×
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* Complete the look */}
        <p className="section-label mt-7 mb-1">Complete the look</p>
        <p className="text-[12px] text-ink-faint">
          Picks that complement the colours and fill in missing pieces.
        </p>
        <ul className="mt-3 -mx-1 flex gap-3 overflow-x-auto no-scrollbar px-1">
          {ctl.map((p) => (
            <li key={p.productId} className="flex w-32 shrink-0 flex-col gap-1.5">
              <div className="aspect-square overflow-hidden rounded-2xl border border-border-subtle bg-bg">
                <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
              </div>
              <span className="truncate text-[12px] font-semibold tracking-tightish text-ink">{p.brand}</span>
              <span className="truncate text-[11px] text-ink-faint">{p.name}</span>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className="text-[12px] font-bold tabular-nums text-ink">{formatRupees(p.pricePaise)}</span>
                <button
                  onClick={() => {
                    track('ctl_clicked', { productId: p.productId });
                    toast('Demo only — Myntra cart not wired up');
                  }}
                  aria-label={`Bag ${p.brand} ${p.name}`}
                  className="flex items-center gap-1 rounded-xl bg-primary px-2.5 py-1 text-[10px] font-bold tracking-tightish text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Bag
                  <ExternalLinkIcon size={10} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <Button
          variant="ghost"
          className="mt-7 text-primary"
          leadingIcon={<TrashIcon size={16} />}
          onClick={() => setAskDelete(true)}
          disabled={isWireframeDemoOutfit(outfit.id)}
        >
          Delete outfit
        </Button>
      </div>

      {/* Sticky action footer */}
      <div className="border-t border-divider bg-bg px-page py-3 pb-[calc(0.75rem+var(--safe-bottom))]">
        <Button
          fullWidth
          variant="secondary"
          className="mb-2"
          leadingIcon={<WandIcon size={16} />}
          onClick={() => navigateToTryOn(navigate, tryOnStateFromOutfit(outfit, items))}
        >
          AI Try-On
        </Button>
        <div className={cn('grid gap-2', isV2 ? 'grid-cols-2' : 'grid-cols-3')}>
        {!isV2 && (
          <Button variant="secondary" leadingIcon={<CalendarIcon size={16} />} onClick={() => setPlanOpen(true)}>
            Plan
          </Button>
        )}
        <Button variant="secondary" leadingIcon={<ShareIcon size={16} />} onClick={onShare}>
          Share
        </Button>
        <AccentButton leadingIcon={<CheckIcon size={16} />} onClick={onWearToday}>
          Wear today
        </AccentButton>
        </div>
      </div>

      {!isV2 && (
        <AddToPlannerSheet
          open={planOpen}
          onClose={() => setPlanOpen(false)}
          onPick={onPin}
          initialDate={pinnedDate}
        />
      )}

      <ConfirmDialog
        open={askDelete}
        title="Delete this outfit?"
        body={isV2 ? 'This look will be removed from your library.' : 'It will also be unpinned from any planner days.'}
        confirmLabel="Delete"
        destructive
        onCancel={() => setAskDelete(false)}
        onConfirm={() => {
          setAskDelete(false);
          removeOutfit(outfit.id);
          navigate(isV2 ? '/home' : '/wardrobe', { replace: true });
        }}
      />

      <SavedCelebration trigger={celebrate} />
    </div>
  );
}
