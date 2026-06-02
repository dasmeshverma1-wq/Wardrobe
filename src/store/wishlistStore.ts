import { create } from 'zustand';
import { lsLoad, lsSave } from '@/lib/storage';

export type WishlistLine = {
  productId: string;
  name: string;
  brand: string;
  image: string;
  pricePaise: number;
  addedAt: number;
};

const SLICE = 'wishlist';

const DEFAULT_WISHLIST: WishlistLine[] = [
  {
    productId: 'wl-1001',
    name: 'Elegant Wrap Top',
    brand: 'Mango',
    image: '/seed-products/elegant-top.png',
    pricePaise: 329900,
    addedAt: Date.now() - 86400000 * 2,
  },
  {
    productId: 'wl-1002',
    name: 'Floral Hawaiian Shirt',
    brand: 'Roadster',
    image: '/seed-products/hawaiian-shirt.png',
    pricePaise: 169900,
    addedAt: Date.now() - 86400000,
  },
  {
    productId: 'wl-1003',
    name: 'Classic White Blouse',
    brand: 'Marks & Spencer',
    image: '/seed-products/white-blouse.png',
    pricePaise: 179900,
    addedAt: Date.now() - 3600000,
  },
];

type State = {
  lines: WishlistLine[];
  hydrated: boolean;
  hydrate: () => void;
  seedIfEmpty: () => void;
};

export const useWishlistStore = create<State>((set, get) => ({
  lines: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const stored = lsLoad<WishlistLine[]>(SLICE, []);
    set({ lines: stored.length > 0 ? stored : DEFAULT_WISHLIST, hydrated: true });
    if (stored.length === 0) lsSave(SLICE, DEFAULT_WISHLIST);
  },

  seedIfEmpty: () => {
    get().hydrate();
    if (get().lines.length === 0) {
      lsSave(SLICE, DEFAULT_WISHLIST);
      set({ lines: DEFAULT_WISHLIST });
    }
  },
}));

export function wishlistCount(lines: WishlistLine[]): number {
  return lines.length;
}
