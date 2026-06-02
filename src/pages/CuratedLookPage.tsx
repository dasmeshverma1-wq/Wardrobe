import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopNav } from '@/components/ui/TopNav';
import { Button, AccentButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LayersIcon, WandIcon, ExternalLinkIcon } from '@/components/ui/Icon';
import { getHomeRailOutfit } from '@/data/homeCreatorRails';
import { MYNTRA_SAMPLES, formatRupees } from '@/data/myntraSamples';
import { resolveOutfitWardrobeItems } from '@/lib/outfitPieces';
import { navigateToTryOn, tryOnStateFromHomeRail } from '@/lib/tryOnNavigation';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { toast } from '@/components/ui/Toast';
import { track } from '@/lib/telemetry';
import { cn } from '@/lib/cn';
import type { WardrobeItem } from '@/types';

function mockPricePaise(item: WardrobeItem): number {
  const sample = MYNTRA_SAMPLES.find(
    (s) => s.name === item.name || s.image === item.thumbnailDataUrl,
  );
  return sample?.pricePaise ?? 149900;
}

/**
 * Editorial look page for home rails (AI try-on + creator flat lays).
 * Hero reference image on top, shoppable-style product list below (mock catalog for now).
 */
export function CuratedLookPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const look = getHomeRailOutfit(id);
  const wardrobeItems = useWardrobeStore((s) => s.items);

  const pieces = useMemo(() => {
    if (!look) return [];
    return resolveOutfitWardrobeItems(look, wardrobeItems);
  }, [look, wardrobeItems]);

  if (!look) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-bg">
        <TopNav title="Look" showBack borderless />
        <EmptyState
          title="Look not found"
          body="This curated look may have been removed."
          action={<Button onClick={() => navigate('/home')}>Back to home</Button>}
        />
      </div>
    );
  }

  const isFlatLay = look.mode === 'dressing-room';
  const tryOnState = tryOnStateFromHomeRail(look.id);

  const onTryOn = () => {
    if (!tryOnState) return;
    track('try_on_started', { source: 'curated_look', lookId: look.id, mode: look.mode });
    navigateToTryOn(navigate, tryOnState);
  };

  const onMixMatch = () => {
    track('discover_mix', { source: 'curated_look', lookId: look.id });
    const seedIds = pieces
      .map(
        (p) =>
          wardrobeItems.find((w) => w.thumbnailDataUrl === p.thumbnailDataUrl)?.id ?? p.id,
      )
      .filter((pid) => wardrobeItems.some((w) => w.id === pid));
    navigate('/studio', { state: { seedIds: seedIds.length > 0 ? seedIds : [] } });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-bg">
      <TopNav title="Look" showBack borderless />

      <div className="scroll-area flex-1 page-x pt-1 pb-32">
        <div className="overflow-hidden rounded-3xl border border-border-subtle bg-bg">
          <div
            className={cn(
              'relative w-full overflow-hidden bg-bg-soft',
              isFlatLay ? 'aspect-[4/5]' : 'aspect-[9/16]',
            )}
          >
            <img
              src={look.thumbnailDataUrl}
              alt={look.name}
              className="absolute inset-0 h-full w-full object-cover object-center"
              draggable={false}
            />
          </div>
        </div>

        <div className="pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-subtle">
            {isFlatLay ? 'Outfit by creator' : 'AI try-on look'} · {look.creator}
          </p>
          <h1 className="mt-1.5 text-[26px] font-bold leading-tight tracking-tightish text-ink-strong">
            {look.name}
          </h1>
          <p className="mt-2 text-[13px] leading-snug text-ink-subtle">
            {isFlatLay
              ? 'Shop the pieces in this flat lay, or open them in Mix & Match.'
              : 'Try this styled look on your photo — we use the outfit reference, not the model.'}
          </p>

          <p className="section-label mt-7 mb-3">In this look</p>
          <p className="mb-3 text-[12px] text-ink-faint">
            Product details are placeholders until catalog sync is wired up.
          </p>

          <ul className="flex flex-col gap-3">
            {pieces.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 rounded-2xl border border-border-subtle bg-bg p-3"
              >
                <div className="h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-soft p-1.5">
                  <img
                    src={item.thumbnailDataUrl}
                    alt=""
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-ink">{item.brand ?? 'Myntra'}</p>
                  <p className="truncate text-[13px] font-semibold text-ink-strong">
                    {item.name ?? item.category}
                  </p>
                  <p className="mt-0.5 text-[11px] capitalize text-ink-faint">{item.category}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold tabular-nums text-ink">
                      {formatRupees(mockPricePaise(item))}
                    </span>
                    <button
                      type="button"
                      onClick={() => toast('Demo only — Myntra bag not wired up')}
                      className="inline-flex items-center gap-1 rounded-xl bg-primary px-2.5 py-1 text-[10px] font-bold text-white"
                    >
                      Bag
                      <ExternalLinkIcon size={10} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sticky action footer — contained in mobile shell (same as Outfit detail) */}
      <div className="shrink-0 border-t border-divider bg-bg px-page py-3 pb-[calc(0.75rem+var(--safe-bottom))]">
        {isFlatLay ? (
          <>
            <AccentButton
              fullWidth
              className="mb-2"
              leadingIcon={<LayersIcon size={16} />}
              onClick={onMixMatch}
            >
              Open in Mix &amp; Match
            </AccentButton>
            <Button
              fullWidth
              variant="secondary"
              leadingIcon={<WandIcon size={16} />}
              onClick={onTryOn}
            >
              Try it on yourself
            </Button>
          </>
        ) : (
          <Button
            fullWidth
            variant="secondary"
            leadingIcon={<WandIcon size={16} />}
            onClick={onTryOn}
          >
            Try it on yourself
          </Button>
        )}
      </div>
    </div>
  );
}
