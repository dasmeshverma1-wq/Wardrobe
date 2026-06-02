import { CREATOR_OUTFITS } from '@/data/creatorOutfits';
import {
  tryOnStateFromCart,
  tryOnStateFromDiscover,
  tryOnStateFromOutfit,
  tryOnStateFromWishlist,
} from '@/lib/tryOnNavigation';
import type { TryOnLocationState } from '@/lib/tryOnTypes';
import type { CartLine } from '@/store/cartStore';
import type { WishlistLine } from '@/store/wishlistStore';
import type { Outfit } from '@/types';

export type SuggestionReason = 'cart' | 'wishlist' | 'festival' | 'today';

export type HomeSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  reason: SuggestionReason;
  reasonLabel: string;
  images: string[];
  priceLabel?: string;
  ctaLabel: string;
  /** Navigate target — outfit detail, discover, or external shop */
  href: string;
  /** When set, primary action opens the full AI try-on flow with these garments. */
  tryOn?: TryOnLocationState;
};

type Festival = { id: string; name: string; blurb: string; month: number; day: number };

const FESTIVALS: Festival[] = [
  { id: 'holi', name: 'Holi', blurb: 'Bright layers that pop in every splash', month: 3, day: 14 },
  { id: 'pongal', name: 'Pongal', blurb: 'Easy cotton fits for the long weekend', month: 1, day: 14 },
  { id: 'diwali', name: 'Diwali', blurb: 'Festive picks ready to shine', month: 11, day: 1 },
];

function nextFestival(from = new Date()): Festival {
  const candidates = FESTIVALS.map((f) => {
    const d = new Date(from.getFullYear(), f.month - 1, f.day);
    if (d < from) d.setFullYear(from.getFullYear() + 1);
    return { festival: f, date: d };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
  return candidates[0]?.festival ?? FESTIVALS[0];
}

function daysUntil(month: number, day: number, from = new Date()): number {
  const target = new Date(from.getFullYear(), month - 1, day);
  if (target < from) target.setFullYear(from.getFullYear() + 1);
  return Math.max(0, Math.ceil((target.getTime() - from.getTime()) / 86400000));
}

export function buildHomeSuggestions(input: {
  cart: CartLine[];
  wishlist: WishlistLine[];
  outfits: Outfit[];
  /** When false, suggestions avoid try-on CTAs (first-time user without photos). */
  hasTryOnProfile?: boolean;
}): HomeSuggestion[] {
  const hasTryOnProfile = input.hasTryOnProfile !== false;
  const suggestions: HomeSuggestion[] = [];
  const festival = nextFestival();
  const festivalOutfit =
    CREATOR_OUTFITS.find((o) => o.title.toLowerCase().includes('resort')) ??
    CREATOR_OUTFITS[0];
  const days = daysUntil(festival.month, festival.day);

  if (input.cart.length > 0) {
    const images = input.cart.slice(0, 4).map((l) => l.image);
    suggestions.push({
      id: 'sug-cart',
      title: 'Complete your bag',
      subtitle: hasTryOnProfile
        ? `${input.cart.length} item${input.cart.length === 1 ? '' : 's'} in cart — try the full look on you`
        : `${input.cart.length} item${input.cart.length === 1 ? '' : 's'} in cart — finish the look`,
      reason: 'cart',
      reasonLabel: 'From your cart',
      images,
      ctaLabel: hasTryOnProfile ? 'Try on' : 'View bag',
      href: '/discover',
      ...(hasTryOnProfile ? { tryOn: tryOnStateFromCart(input.cart) } : {}),
    });
  }

  if (input.wishlist.length > 0) {
    const images = input.wishlist.slice(0, 4).map((l) => l.image);
    suggestions.push({
      id: 'sug-wishlist',
      title: 'Saved on your wishlist',
      subtitle: hasTryOnProfile
        ? 'Preview your saved pieces together on your body'
        : 'Browse saved pieces and build a look',
      reason: 'wishlist',
      reasonLabel: 'From wishlist',
      images,
      ctaLabel: hasTryOnProfile ? 'Try on' : 'View saved',
      href: '/create-outfit',
      ...(hasTryOnProfile ? { tryOn: tryOnStateFromWishlist(input.wishlist) } : {}),
    });
  }

  suggestions.push({
    id: `sug-${festival.id}`,
    title: `${festival.name} is coming`,
    subtitle:
      days <= 14
        ? `${days} day${days === 1 ? '' : 's'} away · ${festival.blurb}`
        : festival.blurb,
    reason: 'festival',
    reasonLabel: festival.name,
    images: festivalOutfit.items.slice(0, 4).map((i) => i.image),
    priceLabel: 'Shop on Myntra',
    ctaLabel: hasTryOnProfile ? 'Try on' : 'Shop looks',
    href: '/discover',
    ...(hasTryOnProfile
      ? { tryOn: tryOnStateFromDiscover(festivalOutfit.id, festivalOutfit.title) }
      : {}),
  });

  const todayOutfit = input.outfits[0];
  if (hasTryOnProfile && todayOutfit && todayOutfit.thumbnailDataUrl) {
    suggestions.push({
      id: 'sug-today',
      title: 'Suggested for today',
      subtitle: todayOutfit.name ?? 'A look from your closet',
      reason: 'today',
      reasonLabel: 'Today',
      images: [todayOutfit.thumbnailDataUrl],
      ctaLabel: 'Try on',
      href: `/outfit/${todayOutfit.id}`,
      tryOn: tryOnStateFromOutfit(todayOutfit),
    });
  }

  return suggestions;
}
