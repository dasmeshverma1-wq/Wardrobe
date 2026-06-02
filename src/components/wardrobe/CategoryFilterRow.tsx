import { CATEGORY_FILTER_IMAGES } from '@/data/categoryFilterImages';
import { cn } from '@/lib/cn';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type Category,
} from '@/types';

type Props = {
  active: Category | 'all';
  onSelect: (category: Category | 'all') => void;
  counts: Partial<Record<Category, number>>;
  totalCount: number;
};

export function CategoryFilterRow({ active, onSelect, counts, totalCount }: Props) {
  const tiles: { id: Category | 'all'; label: string; image: string; count: number }[] = [
    {
      id: 'all',
      label: 'All',
      image: CATEGORY_FILTER_IMAGES.all,
      count: totalCount,
    },
    ...CATEGORY_ORDER.map((c) => ({
      id: c,
      label: CATEGORY_LABELS[c],
      image: CATEGORY_FILTER_IMAGES[c],
      count: counts[c] ?? 0,
    })),
  ];

  return (
    <div className="mt-2.5 px-5 pt-0.5 pb-0.5">
      <div
        role="tablist"
        aria-label="Filter by category"
        className="-mx-2 flex gap-3 overflow-x-auto px-2 py-2 no-scrollbar"
      >
        {tiles.map((tile) => (
          <CategoryFilterTile
            key={tile.id}
            label={tile.label}
            image={tile.image}
            count={tile.count}
            active={active === tile.id}
            onClick={() => onSelect(tile.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryFilterTile({
  label,
  image,
  count,
  active,
  onClick,
}: {
  label: string;
  image: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex w-[4.25rem] shrink-0 flex-col items-center gap-2',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
      )}
    >
      <span
        className={cn(
          'relative h-[3.75rem] w-[3.75rem] overflow-hidden rounded-3xl border border-border-subtle bg-bg p-1.5 transition-shadow',
          active && 'border-ink-strong ring-2 ring-ink-strong/15 ring-offset-2 ring-offset-bg',
        )}
      >
        <img
          src={image}
          alt=""
          draggable={false}
          className="h-full w-full object-contain object-center"
        />
        {count > 0 && (
          <span
            className={cn(
              'absolute right-1 top-1 grid min-w-[1.125rem] place-items-center rounded-full px-1 text-[9px] font-bold tabular-nums',
              active ? 'bg-white text-ink-strong' : 'bg-white/90 text-ink-subtle',
            )}
          >
            {count}
          </span>
        )}
      </span>
      <span
        className={cn(
          'max-w-full truncate text-center text-[11px] capitalize tracking-tightish',
          active ? 'font-bold text-ink-strong' : 'font-semibold text-ink-subtle',
        )}
      >
        {label}
      </span>
    </button>
  );
}
