import { MYNTRA_SAMPLES, type MyntraSample } from '@/data/myntraSamples';
import type { WardrobeItem } from '@/types';
import { bucketForColor, complementaryBucket } from './color';

export type ClosetPairing = {
  id: string;
  ownedItem: WardrobeItem;
  recommendation: MyntraSample;
};

function scorePairing(owned: WardrobeItem, sample: MyntraSample): number {
  let score = 0;
  if (sample.category !== owned.category) score += 40;
  const ownedBucket = bucketForColor(owned.dominantColor);
  const target = complementaryBucket(ownedBucket);
  if (bucketForColor(sample.dominantColor) === target) score += 25;
  if (sample.pricePaise < 400000) score += 5;
  return score;
}

/** One Myntra pairing per owned closet item for the home carousel. */
export function buildClosetPairings(items: WardrobeItem[], limit = 8): ClosetPairing[] {
  const usedRecIds = new Set<string>();
  const pairings: ClosetPairing[] = [];

  for (const owned of items.slice(0, limit)) {
    const candidates = MYNTRA_SAMPLES.filter(
      (s) => s.category !== owned.category && !usedRecIds.has(s.productId),
    )
      .map((s) => ({ s, score: scorePairing(owned, s) }))
      .sort((a, b) => b.score - a.score);

    const recommendation =
      candidates[0]?.s ??
      MYNTRA_SAMPLES.find((s) => s.category !== owned.category && !usedRecIds.has(s.productId));

    if (!recommendation) continue;

    usedRecIds.add(recommendation.productId);
    pairings.push({
      id: `${owned.id}-${recommendation.productId}`,
      ownedItem: owned,
      recommendation,
    });
  }

  return pairings;
}
