import { useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (date: string) => void;
  initialDate?: string;
};

export function AddToPlannerSheet({ open, onClose, onPick, initialDate }: Props) {
  const [cursor, setCursor] = useState(initialDate ? new Date(initialDate + 'T00:00:00') : new Date());
  const [picked, setPicked] = useState<string>(initialDate ?? format(new Date(), 'yyyy-MM-dd'));

  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  return (
    <Sheet open={open} onClose={onClose} title="Add to planner">
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setCursor(subMonths(cursor, 1))}
          aria-label="Previous month"
          className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <h3 className="text-sm font-bold text-ink">{format(cursor, 'MMMM yyyy')}</h3>
        <button
          onClick={() => setCursor(addMonths(cursor, 1))}
          aria-label="Next month"
          className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <ChevronRightIcon size={20} />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-[10px] font-semibold uppercase text-ink-faint">
            {d}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(d, cursor);
          const isPicked = key === picked;
          const today = isSameDay(d, new Date());
          return (
            <button
              key={key}
              onClick={() => setPicked(key)}
              aria-label={format(d, 'EEEE d MMMM')}
              aria-pressed={isPicked}
              aria-current={today ? 'date' : undefined}
              className={cn(
                'aspect-square rounded-full text-[13px] font-semibold tracking-tightish transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isPicked
                  ? 'bg-ink-strong font-bold text-white'
                  : today
                  ? 'border-2 border-ink-strong font-bold text-ink-strong'
                  : isCurrentMonth
                  ? 'text-ink hover:bg-bg-soft'
                  : 'text-ink-faint',
              )}
            >
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="ghost" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button fullWidth leadingIcon={<CheckIcon size={18} />} onClick={() => onPick(picked)}>
          Pin to {format(new Date(picked + 'T00:00:00'), 'EEE d MMM')}
        </Button>
      </div>
    </Sheet>
  );
}
