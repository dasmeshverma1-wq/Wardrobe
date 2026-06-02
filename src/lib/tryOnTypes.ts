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

export type LookReferenceStyle = 'model' | 'flat-lay';

export type TryOnLocationState = {
  itemIds?: string[];
  outfitId?: string;
  discoverOutfitId?: string;
  garments?: TryOnGarment[];
  title?: string;
  /** Curated look hero — combined with the user photo for try-on (not the model in the shot). */
  lookImageUrl?: string;
  lookReferenceStyle?: LookReferenceStyle;
};

export type TryOnProgress = {
  step: number;
  total: number;
  label: string;
};
