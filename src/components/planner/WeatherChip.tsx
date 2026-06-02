import { format } from 'date-fns';
import type { ForecastDay } from '@/types';
import { cn } from '@/lib/cn';
import { getForecastForDate } from '@/lib/weather';
import { SunIcon, CloudIcon, RainIcon, SnowIcon, WindIcon } from '@/components/ui/Icon';

type Props = { forecast?: ForecastDay; date?: string; size?: 'sm' | 'md' };

export function WeatherChip({ forecast, date, size = 'md' }: Props) {
  const isoDate = date ?? forecast?.date ?? format(new Date(), 'yyyy-MM-dd');
  const { tempMaxC, condition } = forecast ?? getForecastForDate(isoDate);
  const Icon =
    condition === 'sunny'
      ? SunIcon
      : condition === 'rainy'
      ? RainIcon
      : condition === 'stormy'
      ? WindIcon
      : condition === 'snowy'
      ? SnowIcon
      : CloudIcon;
  const tone =
    condition === 'sunny'
      ? 'text-accent-gold'
      : condition === 'rainy' || condition === 'stormy'
      ? 'text-accent-sky'
      : condition === 'snowy'
      ? 'text-ink-faint'
      : 'text-ink-subtle';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-line bg-bg font-semibold tracking-tightish shadow-[0_1px_2px_rgba(38,42,57,0.04)]',
        size === 'md' ? 'h-7 px-3 text-[12px] text-ink-strong' : 'h-6 px-2.5 text-[11px] text-ink-strong',
      )}
    >
      <Icon size={size === 'md' ? 14 : 12} className={tone} strokeWidth={1.75} />
      {Math.round(tempMaxC)}°
    </span>
  );
}
