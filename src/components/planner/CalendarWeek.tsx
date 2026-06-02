import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import type { ForecastDay, Outfit, PlannerEntry } from '@/types';
import { cn } from '@/lib/cn';
import { getForecastForDate } from '@/lib/weather';
import { WeatherChip } from './WeatherChip';
import { PlusIcon } from '@/components/ui/Icon';

type Props = {
  cursor: Date;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  forecastByDate: Map<string, ForecastDay>;
  entries: Record<string, PlannerEntry>;
  outfits: Outfit[];
};

export function CalendarWeek({ cursor, selectedDate, setSelectedDate, forecastByDate, entries, outfits }: Props) {
  const start = startOfWeek(cursor, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const today = new Date();
  const outfitById = new Map(outfits.map((o) => [o.id, o]));

  return (
    <div className="mt-2 flex flex-col gap-2 px-5">
      {days.map((d) => {
        const key = format(d, 'yyyy-MM-dd');
        const isToday = isSameDay(d, today);
        const isSelected = key === selectedDate;
        const forecast = getForecastForDate(key, forecastByDate);
        const entry = entries[key];
        const outfit = entry ? outfitById.get(entry.outfitId) : undefined;
        return (
          <button
            key={key}
            onClick={() => setSelectedDate(key)}
            className={cn(
              'flex items-center gap-3 rounded-2xl p-3 text-left transition-colors',
              isSelected
                ? 'border-2 border-ink-strong bg-bg text-ink-strong'
                : 'border border-border-subtle bg-bg text-ink-subtle hover:bg-bg-soft',
            )}
          >
            <div className="flex w-12 shrink-0 flex-col items-center">
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-widish',
                  isSelected ? 'text-ink-subtle' : 'text-ink-faint',
                )}
              >
                {format(d, 'EEE')}
              </span>
              <span
                className={cn(
                  'text-[19px] font-bold tracking-tightish',
                  isSelected ? 'text-ink-strong' : isToday ? 'font-bold text-ink-strong' : 'text-ink',
                )}
              >
                {format(d, 'd')}
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <WeatherChip forecast={forecast} />
              <span className={cn('text-[11px]', isSelected ? 'text-ink-subtle' : 'text-ink-faint')}>
                {Math.round(forecast.tempMinC)}° – {Math.round(forecast.tempMaxC)}°
              </span>
            </div>
            {outfit ? (
              <div className="h-12 w-12 overflow-hidden rounded-xl border border-border-subtle bg-bg">
                <img src={outfit.thumbnailDataUrl} className="h-full w-full object-cover" alt="" />
              </div>
            ) : (
              <div
                className={cn(
                  'grid h-12 w-12 place-items-center rounded-xl border-dashed',
                  isSelected ? 'border border-dashed border-border text-ink-faint' : 'border border-dashed border-border text-ink-faint',
                )}
              >
                <PlusIcon size={16} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
