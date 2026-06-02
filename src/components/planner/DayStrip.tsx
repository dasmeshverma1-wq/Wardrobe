import { addDays, format, isSameDay, isToday, startOfWeek } from 'date-fns';
import { cn } from '@/lib/cn';
import { getForecastForDate } from '@/lib/weather';
import type { Outfit, ForecastDay } from '@/types';

/**
 * 7-day strip — Myntra-style: bold selected day + ink underline, no pink pills.
 */
export function DayStrip({
  cursor,
  selectedDate,
  onSelect,
  entries,
  outfits,
  forecastByDate,
  compact = false,
}: {
  cursor: Date;
  selectedDate: string;
  onSelect: (date: string) => void;
  entries: Record<string, { date: string; outfitId: string }>;
  outfits: Outfit[];
  forecastByDate: Map<string, ForecastDay>;
  compact?: boolean;
}) {
  const start = startOfWeek(cursor, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className={cn('grid grid-cols-7', compact ? 'gap-1' : 'gap-1.5')}>
      {days.map((d) => {
        const key = format(d, 'yyyy-MM-dd');
        const isSelected = key === selectedDate;
        const today = isToday(d);
        const dow = format(d, 'EEEEE');
        const dnum = format(d, 'd');
        const outfitId = entries[key]?.outfitId;
        const outfit = outfitId ? outfits.find((o) => o.id === outfitId) : undefined;
        const fc = getForecastForDate(key, forecastByDate);

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            aria-label={`${format(d, 'EEEE d MMMM')}${outfit ? ', outfit planned' : ''}, ${Math.round(fc.tempMaxC)} degrees`}
            aria-current={isSelected ? 'date' : undefined}
            className={cn(
              'group relative flex flex-col items-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              compact ? 'gap-0.5 rounded-2xl py-1' : 'gap-1 rounded-2xl py-2',
              isSelected
                ? 'text-ink-strong'
                : today
                ? 'font-semibold text-ink-strong'
                : 'text-ink-subtle hover:bg-bg-soft hover:text-ink',
            )}
          >
            <span
              className={cn(
                compact ? 'text-[9px] uppercase tracking-widish' : 'text-[10px] uppercase tracking-widish',
                isSelected ? 'font-bold text-ink-strong' : today ? 'font-semibold text-ink-subtle' : 'font-semibold text-ink-faint',
              )}
            >
              {dow}
            </span>
            <span
              className={cn(
                'grid place-items-center tracking-tightish',
                compact ? 'h-7 w-7 text-[13px] rounded-full' : 'h-9 w-9 rounded-full text-[14px]',
                isSelected ? 'font-bold' : 'font-semibold',
              )}
            >
              {dnum}
            </span>
            <span className={cn('relative grid place-items-center', compact ? 'h-2.5 w-full' : 'h-3 w-3')}>
              {outfit ? (
                <span
                  className={cn(
                    'overflow-hidden rounded-full ring-1 ring-border',
                    compact ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5',
                  )}
                >
                  <img src={outfit.thumbnailDataUrl} alt="" className="h-full w-full object-cover" />
                </span>
              ) : (
                <span className={cn(compact ? 'text-[8px] tabular-nums leading-none' : 'text-[9px] tabular-nums', 'font-semibold text-ink-faint')}>
                  {Math.round(fc.tempMaxC)}°
                </span>
              )}
            </span>
            <span
              className={cn(
                'absolute inset-x-1 bottom-0 h-[3px] rounded-t-full transition-colors',
                isSelected ? 'bg-ink-strong' : 'bg-transparent',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function WeekNav({
  cursor,
  onPrev,
  onNext,
  onJumpToday,
  compact = false,
}: {
  cursor: Date;
  onPrev: () => void;
  onNext: () => void;
  onJumpToday: () => void;
  compact?: boolean;
}) {
  const start = startOfWeek(cursor, { weekStartsOn: 1 });
  const end = addDays(start, 6);
  const label = `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`;
  const isThisWeek =
    isSameDay(start, startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className={cn('flex items-center gap-1', compact ? 'min-h-0' : 'gap-2')}>
      <button
        onClick={onPrev}
        aria-label="Previous week"
        className={cn(
          'grid place-items-center rounded-full text-ink transition-colors hover:bg-neutral-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          compact ? 'h-8 w-8' : 'h-10 w-10',
        )}
      >
        <svg width={compact ? 16 : 18} height={compact ? 16 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h2 className={cn('flex-1 truncate font-bold tracking-tightish text-ink-strong', compact ? 'text-[13px]' : 'text-[15px]')}>
        {label}
      </h2>
      {!isThisWeek && (
        <button
          onClick={onJumpToday}
          className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold tracking-tightish text-ink-strong transition-colors hover:bg-bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Today
        </button>
      )}
      <button
        onClick={onNext}
        aria-label="Next week"
        className={cn(
          'grid place-items-center rounded-full text-ink transition-colors hover:bg-neutral-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          compact ? 'h-8 w-8' : 'h-10 w-10',
        )}
      >
        <svg width={compact ? 16 : 18} height={compact ? 16 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
