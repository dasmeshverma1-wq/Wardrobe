import { describe, expect, it } from 'vitest';
import { pickRecentWardrobe, sortWardrobeByRecent } from '@/lib/wardrobeRecent';
import type { WardrobeItem } from '@/types';

function item(id: string, addedAt: number): WardrobeItem {
  return {
    id,
    imageBlobKey: id,
    thumbnailDataUrl: '',
    category: 'tops',
    source: 'seed',
    addedAt,
    name: id,
  };
}

describe('wardrobeRecent', () => {
  it('sorts by addedAt descending', () => {
    const sorted = sortWardrobeByRecent([item('a', 1), item('b', 3), item('c', 2)]);
    expect(sorted.map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('picks the newest N items', () => {
    const picked = pickRecentWardrobe(
      [item('a', 1), item('b', 5), item('c', 3), item('d', 4)],
      2,
    );
    expect(picked.map((i) => i.id)).toEqual(['b', 'd']);
  });
});
