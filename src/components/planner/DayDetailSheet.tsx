import { format } from 'date-fns';
import { useMemo } from 'react';
import type { ForecastDay, Outfit, PlannerEntry, WardrobeItem } from '@/types';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { WeatherChip } from './WeatherChip';
import { getForecastForDate, weatherAdvice, scoreOutfitForDay } from '@/lib/weather';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  date: string;
  forecast: ForecastDay | undefined;
  entry: PlannerEntry | undefined;
  outfits: Outfit[];
  items: WardrobeItem[];
  onPin: (outfitId: string) => void;
  onUnpin: () => void;
  onOpenOutfit: (outfitId: string) => void;
};

export function DayDetailSheet({
  open,
  onClose,
  date,
  forecast,
  entry,
  outfits,
  items,
  onPin,
  onUnpin,
  onOpenOutfit,
}: Props) {
  const dateLabel = format(new Date(date + 'T00:00:00'), 'EEEE d MMM');
  const resolvedForecast = forecast ?? getForecastForDate(date);
  const pinnedOutfit = entry ? outfits.find((o) => o.id === entry.outfitId) : undefined;
  const itemsById = useMemo(() => new Map(items.map((it) => [it.id, it])), [items]);

  const pinnedCategories: string[] = pinnedOutfit
    ? pinnedOutfit.nodes
        .map((n) => itemsById.get(n.itemId)?.category)
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
    : [];
  const pinnedMaterials: (string | undefined)[] = pinnedOutfit
    ? pinnedOutfit.nodes.map((n) => itemsById.get(n.itemId)?.material)
    : [];

  const advice = weatherAdvice(resolvedForecast, pinnedCategories, pinnedMaterials);

  // Score and sort suggestions by their fit for the forecast.
  const otherOutfits = useMemo(() => {
    return outfits
      .filter((o) => o.id !== entry?.outfitId)
      .map((o) => {
        const cats: string[] = o.nodes
          .map((n) => itemsById.get(n.itemId)?.category)
          .filter((c): c is NonNullable<typeof c> => Boolean(c));
        const mats: (string | undefined)[] = o.nodes.map((n) => itemsById.get(n.itemId)?.material);
        return { o, score: scoreOutfitForDay(resolvedForecast, cats, mats) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [outfits, entry, itemsById, resolvedForecast]);

  return (
    <Sheet open={open} onClose={onClose} title={dateLabel}>
      <div className="flex items-center gap-2">
        <WeatherChip forecast={resolvedForecast} />
        <span className="text-[12px] text-ink-faint">
          {Math.round(resolvedForecast.tempMinC)}° – {Math.round(resolvedForecast.tempMaxC)}°
          {resolvedForecast.precipMm > 0 && ` · ${resolvedForecast.precipMm.toFixed(1)}mm rain`}
        </span>
      </div>

      {pinnedOutfit ? (
        <div className="mt-4 rounded-2xl border border-border-subtle bg-bg p-3">
          <div className="flex gap-3">
            <button
              onClick={() => onOpenOutfit(pinnedOutfit.id)}
              className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg"
            >
              <img src={pinnedOutfit.thumbnailDataUrl} className="h-full w-full object-cover" alt="" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold tracking-tightish text-ink">
                {pinnedOutfit.name ?? `Look ${pinnedOutfit.id.slice(-4)}`}
              </div>
              <div className="text-[12px] text-ink-faint">{pinnedOutfit.nodes.length} items</div>
              {advice.toneTip && (
                <div
                  className={cn(
                    'mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    advice.ok ? 'bg-accent-mint/10 text-accent-mint' : 'bg-accent-gold/10 text-accent-gold',
                  )}
                >
                  {advice.toneTip}
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="ghost" size="sm" onClick={onUnpin}>
              Remove
            </Button>
            <Button size="sm" onClick={() => onOpenOutfit(pinnedOutfit.id)}>
              Open
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-ink-faint">No outfit planned. Pick one below.</p>
      )}

      <p className="section-label mt-5 mb-2">{pinnedOutfit ? 'Swap for' : 'Suggested for this day'}</p>
      {otherOutfits.length === 0 ? (
        <p className="text-[13px] text-ink-faint">Save some outfits first and they'll show up here.</p>
      ) : (
        <ul className="-mx-1 flex gap-3 overflow-x-auto no-scrollbar px-1">
          {otherOutfits.map(({ o, score }, i) => {
            const isBest = i === 0 && score > 0.5;
            const name = o.name ?? `Look ${o.id.slice(-4)}`;
            return (
              <li key={o.id}>
                <button
                  onClick={() => onPin(o.id)}
                  aria-label={`Pin ${name}${isBest ? ' (best match for the forecast)' : ''}`}
                  className="relative flex w-24 shrink-0 flex-col items-stretch gap-1 rounded-xl transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-xl border border-border-subtle bg-bg">
                    <img src={o.thumbnailDataUrl} className="h-full w-full object-cover" alt="" />
                  </div>
                  {isBest && (
                    <span className="absolute left-1 top-1 rounded-full bg-accent-mint px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widish text-white">
                      Best
                    </span>
                  )}
                  <span className="truncate text-[12px] font-semibold tracking-tightish text-ink">
                    {name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
