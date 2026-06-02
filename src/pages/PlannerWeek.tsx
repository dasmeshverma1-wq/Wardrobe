import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, format, isToday, subDays } from 'date-fns';
import { TopNav } from '@/components/ui/TopNav';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { DayStrip, WeekNav } from '@/components/planner/DayStrip';
import { PlannerOutfitHero } from '@/components/planner/PlannerOutfitHero';
import { WeatherChip } from '@/components/planner/WeatherChip';
import { DayDetailSheet } from '@/components/planner/DayDetailSheet';
import { usePlannerWeather } from '@/components/planner/usePlannerWeather';
import { useOutfitStore } from '@/store/outfitStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { toast } from '@/components/ui/Toast';
import { track } from '@/lib/telemetry';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ShareIcon,
  WandIcon,
} from '@/components/ui/Icon';
import type { Outfit } from '@/types';
import { cn } from '@/lib/cn';
import { weatherAdvice } from '@/lib/weather';
import { navigateToTryOn, tryOnStateFromOutfit } from '@/lib/tryOnNavigation';

/**
 * Planner — Week view (default).
 * Whering-inspired layout:
 *   - weather chip + actions on top
 *   - 7-day strip
 *   - BIG outfit display for the selected day, or a pulsing empty state
 *
 * Toggle to month view via the segmented control in the TopNav trailing slot.
 */
export function PlannerWeek() {
  const navigate = useNavigate();
  const outfits = useOutfitStore((s) => s.outfits);
  const items = useWardrobeStore((s) => s.items);
  const entries = usePlannerStore((s) => s.entries);
  const pin = usePlannerStore((s) => s.pin);
  const unpin = usePlannerStore((s) => s.unpin);
  const markWorn = useWardrobeStore((s) => s.markWorn);
  const { byDate, locationName, isLive, forecastFor } = usePlannerWeather();

  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectedForecast = forecastFor(selectedDate);
  const selectedEntry = entries[selectedDate];
  const selectedOutfit = useMemo(
    () => (selectedEntry ? outfits.find((o) => o.id === selectedEntry.outfitId) : undefined),
    [selectedEntry, outfits],
  );

  const itemsById = useMemo(() => new Map(items.map((it) => [it.id, it])), [items]);

  const advice = useMemo(() => {
    if (!selectedOutfit) return null;
    const cats = selectedOutfit.nodes
      .map((n) => itemsById.get(n.itemId)?.category)
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    const mats = selectedOutfit.nodes.map((n) => itemsById.get(n.itemId)?.material);
    return weatherAdvice(selectedForecast, cats, mats);
  }, [selectedOutfit, itemsById, selectedForecast]);

  const handlePin = (date: string, outfitId: string) => {
    pin(date, outfitId);
    track('planner_pin', { date, outfitId });
    const o = outfits.find((x) => x.id === outfitId);
    if (o && isToday(new Date(date + 'T00:00:00'))) {
      markWorn(o.nodes.map((n) => n.itemId));
    }
    toast('Pinned to ' + format(new Date(date + 'T00:00:00'), 'EEE d MMM'), 'success');
    setSheetOpen(false);
  };

  const onPickDay = (date: string) => {
    setSelectedDate(date);
    // Keep the strip aligned to the chosen day's week (week navigation
    // implicitly follows when you tap a day from a sibling week).
    setCursor(new Date(date + 'T00:00:00'));
    // Don't auto-open the sheet — the big outfit panel on the page below
    // already shows what's planned for that day. The sheet is only for
    // explicitly picking/swapping an outfit (Add / Swap actions).
  };

  const isSelectedToday = isToday(new Date(selectedDate + 'T00:00:00'));
  const selectedLabel = format(new Date(selectedDate + 'T00:00:00'), 'EEEE, d MMM');

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-bg">
      <TopNav
        title="Planner"
        borderless
        trailing={
          <Tabs
            variant="segmented"
            tabs={[
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
            ]}
            active="week"
            onChange={(id) => id === 'month' && navigate('/planner/month')}
          />
        }
      />

      {/*
        Whering-style split: ~20% date band, ~80% outfit hero.
        No page scroll — the clothes card owns the viewport.
      */}
      <section className="flex max-h-[22dvh] min-h-[108px] shrink-0 flex-col justify-end gap-1 border-b border-divider px-5 pb-2 pt-0.5">
        <div className="flex items-center gap-2">
          <WeatherChip forecast={selectedForecast} size="sm" />
          <span className="text-[14px] font-bold tabular-nums tracking-tightish text-ink">
            {Math.round(selectedForecast.tempMaxC)}°
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widish text-ink-faint">
            {isSelectedToday ? 'Today' : selectedLabel.split(',')[0]}
          </span>
          <div className="flex-1" />
          <span className="inline-flex max-w-[42%] items-center gap-1 truncate text-[9px] text-ink-faint">
            <span
              className={cn(
                'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
                isLive ? 'bg-accent-mint' : 'bg-accent-gold',
              )}
            />
            <span className="truncate">{isLive ? `Live · ${locationName}` : `Sample · ${locationName}`}</span>
          </span>
        </div>

        <WeekNav
          compact
          cursor={cursor}
          onPrev={() => setCursor(subDays(cursor, 7))}
          onNext={() => setCursor(addDays(cursor, 7))}
          onJumpToday={() => {
            setCursor(new Date());
            setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
          }}
        />

        <DayStrip
          compact
          cursor={cursor}
          selectedDate={selectedDate}
          onSelect={onPickDay}
          entries={entries}
          outfits={outfits}
          forecastByDate={byDate}
        />
      </section>

      <section className="relative flex min-h-0 flex-1 flex-col px-5 pb-3 pt-2">
        {selectedOutfit ? (
          <SelectedOutfitPanel
            date={selectedLabel}
            outfit={selectedOutfit}
            itemsById={itemsById}
            adviceTip={advice && !advice.ok ? advice.toneTip : undefined}
            onOpen={() => navigate(`/outfit/${selectedOutfit.id}`)}
            onSwap={() => setSheetOpen(true)}
            onRemove={() => {
              unpin(selectedDate);
              track('planner_unpin', { date: selectedDate });
              toast('Removed from calendar');
            }}
            onShare={() => {
              navigate(`/outfit/${selectedOutfit.id}?share=1`);
            }}
            onTryOn={() => navigateToTryOn(navigate, tryOnStateFromOutfit(selectedOutfit))}
          />
        ) : (
          <EmptyDayPanel
            dateLabel={selectedLabel}
            isToday={isSelectedToday}
            onPick={() => setSheetOpen(true)}
          />
        )}
      </section>

      <DayDetailSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        date={selectedDate}
        forecast={selectedForecast}
        entry={selectedEntry}
        outfits={outfits}
        items={items}
        onPin={(id) => handlePin(selectedDate, id)}
        onUnpin={() => {
          unpin(selectedDate);
          track('planner_unpin', { date: selectedDate });
          toast('Unpinned');
        }}
        onOpenOutfit={(id) => {
          setSheetOpen(false);
          navigate(`/outfit/${id}`);
        }}
      />
    </div>
  );
}

function SelectedOutfitPanel({
  date,
  outfit,
  itemsById,
  adviceTip,
  onOpen,
  onSwap,
  onRemove,
  onShare,
  onTryOn,
}: {
  date: string;
  outfit: Outfit;
  itemsById: Map<string, ReturnType<typeof useWardrobeStore.getState>['items'][number]>;
  adviceTip?: string;
  onOpen: () => void;
  onSwap: () => void;
  onRemove: () => void;
  onShare: () => void;
  onTryOn: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <p className="truncate text-[10px] font-semibold uppercase tracking-widish text-ink-faint">
          {date}
        </p>
        {outfit.name && (
          <p className="truncate text-[11px] font-semibold tracking-tightish text-ink">{outfit.name}</p>
        )}
      </div>

      <button
        onClick={onOpen}
        className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border border-border-subtle bg-bg"
      >
        <PlannerOutfitHero outfit={outfit} itemsById={itemsById} />
      </button>

      {adviceTip && (
        <div className="flex shrink-0 items-start gap-2 rounded-2xl bg-accent-gold/10 px-3 py-1.5 text-[11px] text-ink">
          <span className="mt-[3px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-gold" />
          <span>{adviceTip}</span>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <ActionButton icon={<WandIcon size={16} />} label="Try on" onClick={onTryOn} />
        <ActionButton icon={<EditIcon size={16} />} label="Swap" onClick={onSwap} />
        <ActionButton icon={<ShareIcon size={16} />} label="Share" onClick={onShare} />
        <ActionButton
          icon={<TrashIcon size={16} />}
          label="Remove"
          onClick={onRemove}
          tone="danger"
        />
        <div className="flex-1" />
        <Button size="sm" onClick={onOpen}>
          Open
        </Button>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold tracking-tightish transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        tone === 'danger'
          ? 'text-primary hover:bg-bg-soft'
          : 'text-ink-subtle hover:bg-neutral-150 hover:text-ink',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * Empty day — large hero card with a single Add outfit CTA (Whering-style).
 */
function EmptyDayPanel({
  dateLabel,
  isToday,
  onPick,
}: {
  dateLabel: string;
  isToday: boolean;
  onPick: () => void;
}) {
  const dayWord = dateLabel.split(',')[0] ?? 'that day';
  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="mb-2 shrink-0 text-center text-[11px] font-semibold uppercase tracking-widish text-ink-faint">
        {isToday ? 'Today' : dayWord}
      </p>

      <button
        type="button"
        onClick={onPick}
        className={cn(
          'flex min-h-0 flex-1 flex-col items-center justify-center rounded-3xl border border-border-subtle bg-bg',
          'transition-transform active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        )}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-fab">
          <PlusIcon size={18} />
          Add outfit
        </span>
      </button>
    </div>
  );
}
