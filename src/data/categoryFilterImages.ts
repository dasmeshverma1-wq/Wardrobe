import type { Category } from '@/types';
import { SEED_PHOTOS } from './seedImages';

/** Representative product image per closet category for the filter row. */
export const CATEGORY_FILTER_IMAGES: Record<Category | 'all', string> = {
  all: SEED_PHOTOS.dressShirt,
  tops: SEED_PHOTOS.whiteBlouse,
  bottoms: SEED_PHOTOS.blackJeans,
  outerwear: SEED_PHOTOS.greenDenimJacket,
  dresses: SEED_PHOTOS.elegantTop,
  footwear: SEED_PHOTOS.whiteSneakers,
  bags: SEED_PHOTOS.brownLeatherHandbag,
  accessories: SEED_PHOTOS.blackSunglasses,
};
