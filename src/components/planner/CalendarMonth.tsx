import {
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { useMemo } from 'react';
import type { ForecastDay, Outfit, PlannerEntry } from '@/types';
import { cn } from '@/lib/cn';
import { getForecastForDate } from '@/lib/weather';
import { WeatherChip } from './WeatherChip';

type Props = {
  cursor: Date;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  forecastByDate: Map<string, ForecastDay>;
  entries: Record<string, PlannerEntry>;
  outfits: Outfit[];
};

/**
 * Calendar grid only — the month/year title and prev/next chevrons live on
 * the parent (`PlannerMonth`) so it can render an editorial header.
 *
 * The grid is designed to fill its parent's height: the day-of-week row is
 * fixed, then the day cells use `grid-auto-rows: 1fr` so every week-row gets
 * an equal share of the remaining vertical space. This avoids the page
 * scrolling when months span 5 vs. 6 rows.
 */
export function CalendarMonth({
  cursor,
  selectedDate,
  setSelectedDate,
  forecastByDate,
  entries,
  outfits,
}: Props) {
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    });
  }, [monthStart, monthEnd]);

  const today = new Date();
  const outfitById = new Map(outfits.map((o) => [o.id, o]));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-7 px-2 pb-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-[10px] font-semibold uppercase tracking-widish text-ink-faint">
            {d}
          </span>
        ))}
      </div>

      <div
        className="grid min-h-0 flex-1 grid-cols-7 gap-1 px-2"
        style={{ gridAutoRows: '1fr' }}
      >
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          const inMonth = isSameMonth(d, cursor);
          const isToday = isSameDay(d, today);
          const isSelected = key === selectedDate;
          const entry = entries[key];
          const outfit = entry ? outfitById.get(entry.outfitId) : undefined;
          const forecast = getForecastForDate(key, forecastByDate);
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(key)}
              aria-label={`${format(d, 'EEEE d MMMM')}${outfit ? ', outfit planned' : ''}, ${Math.round(forecast.tempMaxC)} degrees`}
              aria-current={isToday ? 'date' : undefined}
              aria-pressed={isSelected}
              className={cn(
                'group relative flex min-h-0 flex-col items-stretch overflow-hidden rounded-xl p-1 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isSelected
                  ? 'border-2 border-ink-strong bg-bg text-ink-strong'
                  : isToday
                  ? 'border border-ink-strong/40 bg-bg font-bold text-ink-strong'
                  : 'border border-border-subtle bg-bg text-ink',
                !inMonth && !isSelected && 'opacity-40',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-[12px] font-bold tracking-tightish',
                    isSelected ? 'text-ink-strong' : isToday ? 'text-ink-strong' : 'text-ink',
                  )}
                >
                  {format(d, 'd')}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-semibold tabular-nums',
                    isSelected ? 'text-ink-subtle' : 'text-ink-faint',
                  )}
                >
                  {Math.round(forecast.tempMaxC)}°
                </span>
              </div>
              {outfit && (
                <div className="mt-1 min-h-0 flex-1 overflow-hidden rounded-md bg-white/60">
                  <img
                    src={outfit.thumbnailDataUrl}
                    className="h-full w-full object-cover"
                    alt=""
                    draggable={false}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CompactWeatherRow({ forecast }: { forecast: ForecastDay | undefined }) {
  return <WeatherChip forecast={forecast} />;
}
