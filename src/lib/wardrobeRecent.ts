import type { WardrobeItem } from '@/types';

/** Newest closet items first (user-added and synced seeds with later `addedAt`). */
export function sortWardrobeByRecent(items: WardrobeItem[]): WardrobeItem[] {
  return [...items].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
}

export function pickRecentWardrobe(items: WardrobeItem[], limit = 6): WardrobeItem[] {
  return sortWardrobeByRecent(items).slice(0, limit);
}
