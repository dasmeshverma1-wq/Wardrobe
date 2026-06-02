import type { Category, MaterialTag } from '@/types';

/**
 * Heuristic auto-categorizer used at upload time. Not ML; just a rule-based fallback.
 * Inputs we have available cheaply:
 *  - filename (camera/gallery)
 *  - URL host + path (paste-from-web)
 *  - image aspect ratio (post-downscale)
 *
 * The user can always override on the Review step, so misclassifications are recoverable.
 */

type Hint = { name?: string; url?: string; aspectRatio?: number };

const KEYWORDS: Record<Category, string[]> = {
  tops: ['shirt', 'tshirt', 't-shirt', 'tee', 'top', 'blouse', 'kurta', 'sweater', 'hoodie', 'polo'],
  bottoms: ['pant', 'jean', 'trouser', 'short', 'skirt', 'legging', 'chino', 'jogger'],
  outerwear: ['jacket', 'blazer', 'coat', 'cardigan', 'parka', 'overcoat', 'vest'],
  dresses: ['dress', 'gown', 'frock', 'jumpsuit', 'romper', 'maxi', 'midi'],
  footwear: ['shoe', 'sneaker', 'boot', 'sandal', 'heel', 'loafer', 'flat', 'flipflop'],
  bags: ['bag', 'tote', 'clutch', 'backpack', 'sling', 'handbag', 'purse'],
  accessories: ['watch', 'belt', 'hat', 'cap', 'sunglass', 'scarf', 'jewel', 'ring', 'necklace', 'earring', 'tie'],
};

const MATERIAL_KEYWORDS: Record<MaterialTag, string[]> = {
  suede: ['suede'],
  canvas: ['canvas'],
  leather: ['leather'],
  denim: ['denim', 'jean'],
  cotton: ['cotton'],
  silk: ['silk', 'satin'],
  wool: ['wool', 'cashmere'],
  other: [],
};

export function guessCategory(hint: Hint): Category {
  const text = `${hint.name ?? ''} ${hint.url ?? ''}`.toLowerCase();
  for (const cat of Object.keys(KEYWORDS) as Category[]) {
    if (KEYWORDS[cat].some((k) => text.includes(k))) return cat;
  }

  // Fallback by aspect ratio: tall-narrow tends to be bottoms/dresses, wide tends to be shoes.
  const ar = hint.aspectRatio ?? 1;
  if (ar > 1.6) return 'footwear';
  if (ar < 0.6) return 'bottoms';
  return 'tops';
}

export function guessMaterial(hint: Hint): MaterialTag | undefined {
  const text = `${hint.name ?? ''} ${hint.url ?? ''}`.toLowerCase();
  for (const m of Object.keys(MATERIAL_KEYWORDS) as MaterialTag[]) {
    if (MATERIAL_KEYWORDS[m].some((k) => k && text.includes(k))) return m;
  }
  return undefined;
}
