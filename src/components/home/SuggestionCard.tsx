import { cn } from '@/lib/cn';
import type { HomeSuggestion } from '@/lib/recommendations';
import { BagIcon, HeartIcon, OutfitIcon, SparklesIcon } from '@/components/ui/Icon';
import type { ComponentType, SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const RAIL_META: Record<
  HomeSuggestion['reason'],
  { Icon: IconComponent; line1: (s: HomeSuggestion) => string }
> = {
  cart: { Icon: BagIcon, line1: () => 'Bag picks' },
  wishlist: { Icon: HeartIcon, line1: () => 'Saved looks' },
  festival: { Icon: SparklesIcon, line1: (s) => s.reasonLabel },
  today: { Icon: OutfitIcon, line1: () => "Today's look" },
};

type Props = {
  suggestion: HomeSuggestion;
  onAction: () => void;
};

export function SuggestionCard({ suggestion, onAction }: Props) {
  const { Icon, line1 } = RAIL_META[suggestion.reason];

  return (
    <button
      type="button"
      onClick={onAction}
      className={cn(
        'flex h-[7.75rem] w-[6.75rem] shrink-0 flex-col items-center justify-center rounded-3xl border border-border-subtle/60 bg-bg px-3 py-4',
        'shadow-[0_2px_8px_rgba(38,42,57,0.06),0_8px_24px_rgba(38,42,57,0.08)]',
        'transition-transform active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      )}
    >
      <span className="mb-3 text-ink-strong">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <p className="text-center text-[13px] font-semibold leading-[1.25] tracking-tightish text-ink-strong">
        {line1(suggestion)}
        <br />
        for you
      </p>
    </button>
  );
}
