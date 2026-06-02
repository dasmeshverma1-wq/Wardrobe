import { CATEGORY_ORDER, type Category, type WardrobeItem } from '@/types';

const CATEGORY_RANK: Record<Category, number> = Object.fromEntries(
  CATEGORY_ORDER.map((c, i) => [c, i]),
) as Record<Category, number>;

/** Sort closet items so tops appear first, then the rest per `CATEGORY_ORDER`. */
export function sortWardrobeByCategory<T extends { category: Category }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (CATEGORY_RANK[a.category] ?? 99) - (CATEGORY_RANK[b.category] ?? 99),
  );
}
