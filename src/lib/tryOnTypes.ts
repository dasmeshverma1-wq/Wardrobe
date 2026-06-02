import type { Category } from '@/types';
import type { ZoneId } from '@/components/studio/MannequinZones';

/** Garment passed into the try-on pipeline (wardrobe or Discover catalog). */
export type TryOnGarment = {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  zone?: ZoneId;
};

export type TryOnLocationState = {
  itemIds?: string[];
  outfitId?: string;
  discoverOutfitId?: string;
  garments?: TryOnGarment[];
  title?: string;
};

export type TryOnProgress = {
  step: number;
  total: number;
  label: string;
};
