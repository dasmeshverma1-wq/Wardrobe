import type { NavigateFunction } from 'react-router-dom';
import type { CartLine } from '@/store/cartStore';
import type { WishlistLine } from '@/store/wishlistStore';
import type { Outfit, WardrobeItem } from '@/types';
import { getWireframeDemoPieceSpecs, isWireframeDemoOutfit } from '@/data/wireframeDemoOutfits';
import { resolveOutfitItemIds } from '@/lib/outfitPieces';
import { guessCategory } from '@/lib/categorize';
import { zoneForGarment } from '@/lib/tryOnPlacement';
import type { TryOnGarment, TryOnLocationState } from '@/lib/tryOnTypes';

/** Launch the full try-on wizard (consent → avatar → garments → generate → result). */
export function navigateToTryOn(navigate: NavigateFunction, state?: TryOnLocationState) {
  navigate('/studio/try-on', { state });
}

function lineToGarment(line: { productId: string; name: string; image: string }): TryOnGarment {
  const category = guessCategory({ name: line.name });
  return {
    id: line.productId,
    name: line.name,
    category,
    imageUrl: line.image,
    zone: zoneForGarment({ category, name: line.name }),
  };
}

export function tryOnStateFromCart(cart: CartLine[], title = 'Bag picks'): TryOnLocationState {
  return { title, garments: cart.slice(0, 6).map(lineToGarment) };
}

export function tryOnStateFromWishlist(
  wishlist: WishlistLine[],
  title = 'Wishlist look',
): TryOnLocationState {
  return { title, garments: wishlist.slice(0, 6).map(lineToGarment) };
}

export function tryOnStateFromOutfit(outfit: Outfit, wardrobeItems: WardrobeItem[] = []): TryOnLocationState {
  const itemIds = resolveOutfitItemIds(outfit, wardrobeItems);
  if (itemIds.length > 0) {
    return {
      outfitId: outfit.id,
      title: outfit.name ?? 'Outfit',
      itemIds,
    };
  }

  if (isWireframeDemoOutfit(outfit.id)) {
    return {
      outfitId: outfit.id,
      title: outfit.name ?? 'Outfit',
      garments: getWireframeDemoPieceSpecs(outfit.id).map((spec) => ({
        id: spec.image,
        name: spec.name,
        category: spec.category,
        imageUrl: spec.image,
        zone: zoneForGarment({ category: spec.category, name: spec.name }),
      })),
    };
  }

  return {
    outfitId: outfit.id,
    title: outfit.name ?? 'Outfit',
    itemIds: [],
  };
}

export function tryOnStateFromItems(itemIds: string[], title?: string): TryOnLocationState {
  return { itemIds, title };
}

export function tryOnStateFromDiscover(discoverOutfitId: string, title?: string): TryOnLocationState {
  return { discoverOutfitId, title };
}
