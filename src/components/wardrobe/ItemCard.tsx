import type { WardrobeItem } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { cn } from '@/lib/cn';
import { CheckIcon } from '@/components/ui/Icon';

type Props = {
  item: WardrobeItem;
  selectable?: boolean;
  selected?: boolean;
  /** 1-based pick order when building an outfit. */
  selectionIndex?: number;
  onClick?: () => void;
};

const SOURCE_TAGS: Record<string, string> = {
  'myntra-past': 'Purchased',
  'myntra-wishlist': 'Wishlist',
  'myntra-cart': 'Cart',
  'myntra': 'Myntra',
  'seed': 'Myntra',
};

/**
 * Myntra-style product tile with clear multi-select affordances.
 * In select mode: empty ring when idle, primary ring + corner check + order badge when picked.
 */
export function ItemCard({ item, selectable, selected, selectionIndex, onClick }: Props) {
  const aria = describeItem(item, { selectable, selected, selectionIndex });
  const tagText = SOURCE_TAGS[item.source];

  return (
    <button
      onClick={onClick}
      aria-label={aria}
      aria-pressed={selectable || selected ? selected : undefined}
      className={cn(
        'group relative flex aspect-square w-full flex-col overflow-hidden rounded-2xl border bg-bg p-2 transition-all duration-150 active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        selectable && !selected && 'border-border-subtle',
        selectable && selected && 'border-2 border-primary bg-primary-soft/35 shadow-[0_0_0_3px_rgba(255,63,108,0.12)]',
        !selectable && !selected && 'border-border-subtle',
      )}
    >
      <img
        src={item.thumbnailDataUrl}
        alt={item.name ?? item.category}
        className={cn(
          'h-full w-full object-contain transition-all duration-150',
          selectable && selected && 'scale-[0.96]',
        )}
        draggable={false}
      />

      {selectable && (
        <span
          className={cn(
            'absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full transition-all duration-150',
            selected
              ? 'bg-primary text-white shadow-fab'
              : 'border-2 border-ink-ghost/70 bg-bg/95',
          )}
          aria-hidden
        >
          {selected && <CheckIcon size={14} strokeWidth={2.5} />}
        </span>
      )}

      {selectable && selected && selectionIndex != null && (
        <span
          className="absolute left-1.5 top-1.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-ink-strong px-1 text-[10px] font-bold tabular-nums text-white shadow-sm"
          aria-hidden
        >
          {selectionIndex}
        </span>
      )}

      {tagText && (
        <span
          className={cn(
            'absolute rounded-full bg-ink/85 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widish text-white',
            selectable ? 'bottom-1.5 left-1.5' : 'left-2 top-2',
          )}
        >
          {tagText}
        </span>
      )}
    </button>
  );
}

function describeItem(
  item: WardrobeItem,
  {
    selectable,
    selected,
    selectionIndex,
  }: { selectable?: boolean; selected?: boolean; selectionIndex?: number },
): string {
  const parts: string[] = [];
  if (item.brand) parts.push(item.brand);
  if (item.name) parts.push(item.name);
  parts.push(CATEGORY_LABELS[item.category]);
  let label = parts.join(' \u00b7 ');
  if (selectable || selected) {
    if (selected && selectionIndex != null) {
      label += `. Selected ${selectionIndex}. Tap to deselect.`;
    } else {
      label += selected ? '. Selected. Tap to deselect.' : '. Tap to select.';
    }
  } else {
    label += '. Tap to select.';
  }
  return label;
}
