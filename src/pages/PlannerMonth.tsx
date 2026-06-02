import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMonths, endOfMonth, format, isSameMonth, isToday, startOfMonth, subMonths } from 'date-fns';
import { TopNav } from '@/components/ui/TopNav';
import { Tabs } from '@/components/ui/Tabs';
import { CalendarMonth } from '@/components/planner/CalendarMonth';
import { DayDetailSheet } from '@/components/planner/DayDetailSheet';
import { usePlannerWeather } from '@/components/planner/usePlannerWeather';
import { useOutfitStore } from '@/store/outfitStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { weatherAdvice } from '@/lib/weather';
import { toast } from '@/components/ui/Toast';
import { track } from '@/lib/telemetry';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@/components/ui/Icon';
import type { Outfit, PlannerEntry } from '@/types';

/**
 * Planner — Month view (glance-able, no scroll).
 *
 * Vertical budget on a typical phone (~720dvh visible):
 *   TopNav            ~56
 *   Editorial header  ~80   (May / 2026 + chevrons + jump-today pill)
 *   Weather strip     ~32   (live · location)
 *   Day-of-week row   ~16
 *   Calendar grid     flex-1 (fills remaining space, rows distribute via auto-rows: 1fr)
 *   Look-of-the-month ~64   (slim horizontal row, or empty CTA)
 *   BottomNav         ~70
 *
 * The earlier "days planned · unique looks · avg max · coverage" stats card
 * is intentionally gone — the date numerals + outfit thumbs in the grid
 * already communicate that information at a glance.
 */
export function PlannerMonth() {
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

  useEffect(() => {
    const tomorrow = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const entry = entries[tomorrow];
    if (!entry) return;
    const outfit = outfits.find((o) => o.id === entry.outfitId);
    if (!outfit) return;
    const itemsById = new Map(items.map((it) => [it.id, it]));
    const cats: string[] = outfit.nodes
      .map((n) => itemsById.get(n.itemId)?.category)
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    const mats: (string | undefined)[] = outfit.nodes.map((n) => itemsById.get(n.itemId)?.material);
    const advice = weatherAdvice(forecastFor(tomorrow), cats, mats);
    if (!advice.ok && advice.toneTip) {
      toast(`Tomorrow: ${advice.toneTip}`, 'warning');
    }
  }, [entries, outfits, items, forecastFor]);

  const onDateClick = (date: string) => {
    setSelectedDate(date);
    setSheetOpen(true);
  };

  const handlePin = (date: string, outfitId: string) => {
    pin(date, outfitId);
    track('planner_pin', { date, outfitId });
    const o = outfits.find((x) => x.id === outfitId);
    if (o && isToday(new Date(date + 'T00:00:00'))) {
      markWorn(o.nodes.map((n) => n.itemId));
    }
    toast('Pinned to ' + format(new Date(date + 'T00:00:00'), 'EEE d MMM'), 'success');
  };

  const featured = useMemo(
    () => computeFeaturedOutfit(cursor, entries, outfits),
    [cursor, entries, outfits],
  );

  const isViewingThisMonth = isSameMonth(cursor, new Date());

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-bg overflow-hidden">
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
            active="month"
            onChange={(id) => id === 'week' && navigate('/planner')}
          />
        }
      />

      {/* Editorial header — compact */}
      <div className="flex items-center justify-between px-5 pt-1 pb-2">
        <div className="leading-none">
          <h1 className="text-[32px] font-bold tracking-tightish text-ink-strong leading-[0.9]">
            {format(cursor, 'MMMM')}
          </h1>
          <p className="mt-0.5 text-[14px] font-semibold tabular-nums tracking-tightish text-ink-faint">
            {format(cursor, 'yyyy')}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCursor(subMonths(cursor, 1))}
              aria-label="Previous month"
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-neutral-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <button
              onClick={() => setCursor(addMonths(cursor, 1))}
              aria-label="Next month"
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-neutral-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>
          {!isViewingThisMonth && (
            <button
              onClick={() => setCursor(new Date())}
              className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-bold tracking-tightish text-ink-strong transition-colors hover:bg-bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              Jump to today
            </button>
          )}
        </div>
      </div>

      {/* Weather strip */}
      <div className="page-x pb-2">
        <div className="flex items-center gap-2 rounded-2xl border border-border-subtle bg-bg px-3 py-1.5 text-[11px] text-ink-subtle">
          <span
            className={
              'inline-block h-1.5 w-1.5 rounded-full ' + (isLive ? 'bg-accent-mint' : 'bg-accent-gold')
            }
          />
          {isLive ? `Live forecast · ${locationName}` : `Sample weather · ${locationName}`}
        </div>
      </div>

      {/* Calendar — fills available vertical space */}
      <CalendarMonth
        cursor={cursor}
        selectedDate={selectedDate}
        setSelectedDate={onDateClick}
        forecastByDate={byDate}
        entries={entries}
        outfits={outfits}
      />

      {/* Slim "Look of the month" row */}
      <div className="page-x pb-3 pt-3">
        <LookOfTheMonthRow
          featured={featured}
          isViewingThisMonth={isViewingThisMonth}
          onOpen={(id) => navigate(`/outfit/${id}`)}
          onPlanToday={() => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            setSelectedDate(todayStr);
            setCursor(new Date());
            setSheetOpen(true);
          }}
        />
      </div>

      <DayDetailSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        date={selectedDate}
        forecast={forecastFor(selectedDate)}
        entry={entries[selectedDate]}
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

/* ---------- footer row ---------- */

type FeaturedOutfit = {
  outfit: Outfit;
  count: number;
  lastDate: string;
};

function LookOfTheMonthRow({
  featured,
  isViewingThisMonth,
  onOpen,
  onPlanToday,
}: {
  featured: FeaturedOutfit | null;
  isViewingThisMonth: boolean;
  onOpen: (id: string) => void;
  onPlanToday: () => void;
}) {
  if (!featured) {
    return (
      <button
        onClick={onPlanToday}
        disabled={!isViewingThisMonth}
        className="flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-bg px-3 py-2.5 text-left disabled:opacity-50"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-fab">
          <PlusIcon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-widish text-ink-subtle">
            {isViewingThisMonth ? 'Look of the month' : 'No looks this month'}
          </span>
          <span className="block text-[13px] font-bold tracking-tightish text-ink-strong">
            {isViewingThisMonth ? 'Plan today\u2019s outfit' : 'Try a different month'}
          </span>
        </span>
      </button>
    );
  }

  const o = featured.outfit;
  const lastWornLabel = format(new Date(featured.lastDate + 'T00:00:00'), 'd MMM');

  return (
    <button
      onClick={() => onOpen(o.id)}
      aria-label={`Look of the month: ${o.name ?? 'Saved look'}, planned ${featured.count} times. Last on ${lastWornLabel}. Tap to open.`}
      className="flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-border-subtle bg-bg px-3 py-2.5 text-left transition-colors hover:bg-bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-bg">
        <img src={o.thumbnailDataUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widish text-primary">
          Look of the month
        </p>
        <p className="truncate text-[14px] font-bold tracking-tightish text-ink">
          {o.name ?? 'Saved look'}
        </p>
      </div>
      <p className="shrink-0 text-right text-[11px] text-ink-faint">
        <span className="block font-semibold text-ink">{featured.count}× planned</span>
        <span>last {lastWornLabel}</span>
      </p>
    </button>
  );
}

/* ---------- featured outfit selection ---------- */

function computeFeaturedOutfit(
  cursor: Date,
  entries: Record<string, PlannerEntry>,
  outfits: Outfit[],
): FeaturedOutfit | null {
  const start = startOfMonth(cursor);
  const end = endOfMonth(cursor);

  const monthEntries = Object.values(entries).filter((e) => {
    const d = new Date(e.date + 'T00:00:00');
    return d >= start && d <= end;
  });

  if (monthEntries.length === 0) return null;

  const counts = new Map<string, { count: number; lastDate: string }>();
  for (const e of monthEntries) {
    const cur = counts.get(e.outfitId);
    if (!cur) counts.set(e.outfitId, { count: 1, lastDate: e.date });
    else {
      cur.count += 1;
      if (e.date > cur.lastDate) cur.lastDate = e.date;
    }
  }

  let bestId: string | null = null;
  let best: { count: number; lastDate: string } | null = null;
  for (const [id, c] of counts) {
    if (
      !best ||
      c.count > best.count ||
      (c.count === best.count && c.lastDate > best.lastDate)
    ) {
      bestId = id;
      best = c;
    }
  }

  if (!bestId || !best) return null;
  const outfit = outfits.find((o) => o.id === bestId);
  if (!outfit) return null;
  return { outfit, count: best.count, lastDate: best.lastDate };
}
