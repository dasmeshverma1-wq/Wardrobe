import type { Outfit, WardrobeItem, Category } from '@/types';
import { MYNTRA_SAMPLES } from '@/data/myntraSamples';
import { bucketForColor, complementaryBucket, type ColorBucket } from './color';

type Sample = (typeof MYNTRA_SAMPLES)[number];

/**
 * Light "complete the look" heuristic:
 * 1. Identify missing categories from the outfit (top/bottom/footwear/etc.).
 * 2. Bias picks toward complementary colour buckets vs the outfit's dominant palette.
 * 3. Fall back to category match → first samples → identity.
 *
 * No real ML, just deterministic ranking that responds to colour & gaps.
 */
export function pickCompleteTheLook(_outfit: Outfit, outfitItems: WardrobeItem[]): Sample[] {
  const presentCategories = new Set<Category>(outfitItems.map((i) => i.category));

  const ESSENTIALS: Category[] = ['tops', 'bottoms', 'footwear', 'outerwear', 'bags', 'accessories'];
  const missingPriority = ESSENTIALS.filter((c) => !presentCategories.has(c));

  const buckets = outfitItems.map((it) => bucketForColor(it.dominantColor));
  const targetBucket: ColorBucket | undefined = buckets.length
    ? complementaryBucket(majority(buckets))
    : undefined;

  const scored = MYNTRA_SAMPLES.map((s) => {
    let score = 0;
    if (s.category && missingPriority.length > 0) {
      const idx = missingPriority.indexOf(s.category as Category);
      if (idx >= 0) score += 60 - idx * 10;
    }
    if (targetBucket && s.dominantColor) {
      if (bucketForColor(s.dominantColor) === targetBucket) score += 20;
    }
    if (s.pricePaise && s.pricePaise < 400000) score += 5;
    return { s, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((x) => x.s);
}

function majority<T>(arr: T[]): T {
  const counts = new Map<T, number>();
  for (const x of arr) counts.set(x, (counts.get(x) ?? 0) + 1);
  let best = arr[0];
  let bestCount = -1;
  for (const [k, v] of counts) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }
  return best;
}
