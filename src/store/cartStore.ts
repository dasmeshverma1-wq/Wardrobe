import { create } from 'zustand';
import { lsLoad, lsSave } from '@/lib/storage';

/**
 * Lightweight mock cart used by the Discover swipe feature.
 *
 * In a real Myntra integration this would hand off to the existing bag service;
 * here we only need enough state to confirm the action ("Added 4 items — 12,499")
 * and badge the bag icon.
 */

export type CartLine = {
  productId: string;
  name: string;
  brand: string;
  image: string;
  pricePaise: number;
  quantity: number;
  addedAt: number;
};

const SLICE = 'cart';

const DEFAULT_CART: CartLine[] = [
  {
    productId: 'mnt-2402',
    name: 'Classic White Blouse',
    brand: 'Roadster',
    image: '/seed-products/white-blouse.png',
    pricePaise: 79900,
    quantity: 1,
    addedAt: Date.now() - 86400000,
  },
  {
    productId: 'mnt-2405',
    name: 'Classic Blue Jeans',
    brand: "Levi's",
    image: '/seed-products/blue-jeans.png',
    pricePaise: 289900,
    quantity: 1,
    addedAt: Date.now() - 3600000,
  },
];

type State = {
  lines: CartLine[];
  hydrated: boolean;
  hydrate: () => void;
  addMany: (lines: Array<Omit<CartLine, 'quantity' | 'addedAt'>>) => number;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<State>((set, get) => ({
  lines: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const stored = lsLoad<CartLine[]>(SLICE, []);
    const lines = stored.length > 0 ? stored : DEFAULT_CART;
    set({ lines, hydrated: true });
    if (stored.length === 0) lsSave(SLICE, DEFAULT_CART);
  },

  addMany: (incoming) => {
    let added = 0;
    set((s) => {
      const map = new Map(s.lines.map((l) => [l.productId, { ...l }]));
      const now = Date.now();
      for (const inc of incoming) {
        const existing = map.get(inc.productId);
        if (existing) {
          existing.quantity += 1;
        } else {
          map.set(inc.productId, { ...inc, quantity: 1, addedAt: now });
          added += 1;
        }
      }
      const lines = [...map.values()].sort((a, b) => b.addedAt - a.addedAt);
      lsSave(SLICE, lines);
      return { lines };
    });
    return added || incoming.length;
  },

  remove: (productId) => {
    set((s) => {
      const lines = s.lines.filter((l) => l.productId !== productId);
      lsSave(SLICE, lines);
      return { lines };
    });
  },

  clear: () => {
    lsSave(SLICE, []);
    set({ lines: [] });
  },
}));

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

export function cartTotalPaise(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.pricePaise * l.quantity, 0);
}
