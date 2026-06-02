import type { WardrobeItem } from '@/types';
import { useMemo } from 'react';
import { cn } from '@/lib/cn';

/**
 * Lightweight outfit-composition heuristic.
 * Surfaces a single helpful nudge when the user has selected items but is
 * missing an obvious category (e.g. bottoms with a top, shoes with a dress).
 *
 * `variant="ink"` is for when the hint sits on top of a dark surface
 * (e.g. inside the floating SelectionBar).
 */
export function CompositionHintBar({
  items,
  variant = 'soft',
}: {
  items: WardrobeItem[];
  variant?: 'soft' | 'ink';
}) {
  const hint = useMemo(() => buildHint(items), [items]);
  if (!hint) return null;

  if (variant === 'ink') {
    return (
      <div className="flex items-start gap-2 text-[12px] text-white/85">
        <span className="mt-[5px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        <span>{hint}</span>
      </div>
    );
  }

  return (
    <div className="page-x pt-3">
      <div
        className={cn(
          'flex items-start gap-2 rounded-2xl bg-bg-soft px-3 py-2 text-[12px] text-ink-subtle',
        )}
      >
        <span className="mt-[2px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        <span>{hint}</span>
      </div>
    </div>
  );
}

function buildHint(items: WardrobeItem[]): string | null {
  if (items.length === 0) return null;
  const has = new Set(items.map((i) => i.category));
  const hasAny = (...cats: string[]) => cats.some((c) => has.has(c as never));

  if (hasAny('tops') && !hasAny('bottoms') && !hasAny('dresses')) {
    return 'Pair with a bottom to complete the look.';
  }
  if (hasAny('bottoms') && !hasAny('tops') && !hasAny('dresses')) {
    return 'Add a top to finish the silhouette.';
  }
  if (hasAny('tops', 'bottoms', 'dresses', 'outerwear') && !hasAny('footwear')) {
    return 'Shoes will ground the outfit. Add a pair?';
  }
  if (items.length === 1 && hasAny('accessories')) {
    return 'Accessories work best layered on top of a base look.';
  }
  if (items.length >= 5 && !hasAny('accessories', 'bags')) {
    return 'Tie it together with an accessory or bag.';
  }
  return null;
}
