import type { Category } from '@/types';

export type ZoneId =
  | 'head'
  | 'face'
  | 'outer'
  | 'torso'
  | 'inner'
  | 'legs'
  | 'feet'
  | 'accessory';

export type ZoneSpec = {
  id: ZoneId;
  label: string;
  /** rectangle on the 300×520 outfit builder frame */
  rect: { x: number; y: number; w: number; h: number };
};

/** Fixed auto-layout slots — center column + left outer + right inner/bag. */
export const ZONES: ZoneSpec[] = [
  { id: 'head', label: 'Headwear', rect: { x: 108, y: 6, w: 84, h: 54 } },
  { id: 'face', label: 'Eyewear', rect: { x: 114, y: 40, w: 72, h: 32 } },
  { id: 'outer', label: 'Outer', rect: { x: 6, y: 78, w: 80, h: 208 } },
  { id: 'torso', label: 'Top', rect: { x: 94, y: 82, w: 112, h: 118 } },
  { id: 'inner', label: 'Inner', rect: { x: 214, y: 86, w: 80, h: 92 } },
  { id: 'legs', label: 'Bottom', rect: { x: 95, y: 212, w: 110, h: 162 } },
  { id: 'feet', label: 'Footwear', rect: { x: 106, y: 372, w: 88, h: 68 } },
  { id: 'accessory', label: 'Bag', rect: { x: 212, y: 288, w: 82, h: 108 } },
];

export const FRAME_W = 300;
export const FRAME_H = 520;

/** Paint order when slots overlap slightly. */
export const ZONE_LAYER: Record<ZoneId, number> = {
  feet: 1,
  legs: 2,
  outer: 3,
  torso: 4,
  inner: 5,
  accessory: 6,
  head: 7,
  face: 8,
};

/** Target visual footprint multiplier (× zone slot size after CSS scale). */
export const ZONE_ITEM_BASE_FILL: Record<ZoneId, number> = {
  head: 0.94,
  face: 0.94,
  outer: 2,
  torso: 2,
  inner: 2,
  legs: 2.35,
  feet: 0.98,
  accessory: 0.98,
};

/**
 * CSS scale on the layout box. Apparel (top / outer / inner / bottom) uses 4× so
 * rendered size = baseFill × slot ≈ 2× the previous 2× pass — overflow-visible allows overlap.
 */
export const ZONE_ITEM_VISUAL_SCALE: Record<ZoneId, number> = {
  head: 1,
  face: 1,
  outer: 4,
  torso: 4,
  inner: 4,
  legs: 4,
  feet: 2,
  accessory: 2,
};

const APPAREL_ZONES = new Set<ZoneId>(['outer', 'torso', 'inner', 'legs']);

export function isApparelZone(zone: ZoneId): boolean {
  return APPAREL_ZONES.has(zone);
}

export function zoneItemDisplayStyle(zone: ZoneId): {
  width: string;
  height: string;
  transform?: string;
} {
  const fill = ZONE_ITEM_BASE_FILL[zone];
  const scale = ZONE_ITEM_VISUAL_SCALE[zone];
  const layout = fill / scale;
  return {
    width: `${layout * 100}%`,
    height: `${layout * 100}%`,
    transform: scale > 1 ? `scale(${scale})` : undefined,
  };
}

/** @deprecated Use zoneItemDisplayStyle */
export const ZONE_ITEM_SCALE = ZONE_ITEM_VISUAL_SCALE;

const EYEWEAR_RE = /sunglasses|eyeglasses|eyewear|glasses|specs|shade/i;
const HAT_RE = /hat|cap|beanie|bucket|beret/i;

export function isEyewearAccessory(name?: string): boolean {
  if (!name) return false;
  return EYEWEAR_RE.test(name);
}

export function zoneAcceptsItem(zone: ZoneId, item: { category: Category; name?: string }): boolean {
  switch (zone) {
    case 'head':
      return item.category === 'accessories' && !isEyewearAccessory(item.name);
    case 'face':
      return item.category === 'accessories' && isEyewearAccessory(item.name);
    case 'outer':
      return item.category === 'outerwear';
    case 'torso':
      return item.category === 'tops' || item.category === 'dresses';
    case 'inner':
      return item.category === 'tops';
    case 'legs':
      return item.category === 'bottoms';
    case 'feet':
      return item.category === 'footwear';
    case 'accessory':
      return item.category === 'bags';
  }
}

/** Default closet bucket for pre-selected / Discover seed items. */
export function zoneForWardrobeItem(item: { category: Category; name?: string }): ZoneId {
  if (item.category === 'outerwear') return 'outer';
  if (item.category === 'tops' || item.category === 'dresses') return 'torso';
  if (item.category === 'bottoms') return 'legs';
  if (item.category === 'footwear') return 'feet';
  if (item.category === 'bags') return 'accessory';
  if (item.category === 'accessories') {
    if (isEyewearAccessory(item.name)) return 'face';
    return 'head';
  }
  return 'torso';
}

/** Head mannequin kept at the top — slots are separate fixed regions below. */
export function HeadMannequin({ tint = '#ECECEF' }: { tint?: string }) {
  return (
    <svg viewBox="0 0 300 520" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <circle cx="150" cy="34" r="26" fill={tint} />
      <rect x="142" y="56" width="16" height="14" rx="6" fill={tint} />
    </svg>
  );
}

/** Grey placeholder silhouette shown inside an empty slot. */
export function SlotSilhouette({ zone, className }: { zone: ZoneId; className?: string }) {
  const fill = '#D8D8DC';
  switch (zone) {
    case 'head':
      return (
        <svg viewBox="0 0 84 54" className={className} aria-hidden>
          <ellipse cx="42" cy="28" rx="28" ry="22" fill={fill} />
        </svg>
      );
    case 'face':
      return (
        <svg viewBox="0 0 72 32" className={className} aria-hidden>
          <rect x="8" y="10" width="56" height="12" rx="6" fill={fill} />
        </svg>
      );
    case 'outer':
      return (
        <svg viewBox="0 0 80 208" className={className} aria-hidden>
          <path
            d="M18 8 L62 8 L70 36 L68 200 L12 200 L10 36 Z"
            fill={fill}
          />
        </svg>
      );
    case 'torso':
      return (
        <svg viewBox="0 0 112 118" className={className} aria-hidden>
          <path d="M16 8 L96 8 L104 36 L98 110 L14 110 L8 36 Z" fill={fill} />
        </svg>
      );
    case 'inner':
      return (
        <svg viewBox="0 0 80 92" className={className} aria-hidden>
          <path d="M12 8 L68 8 L72 28 L68 84 L12 84 L8 28 Z" fill={fill} />
        </svg>
      );
    case 'legs':
      return (
        <svg viewBox="0 0 110 162" className={className} aria-hidden>
          <path d="M18 8 L92 8 L98 162 L60 162 L55 74 L50 162 L12 162 Z" fill={fill} />
        </svg>
      );
    case 'feet':
      return (
        <svg viewBox="0 0 88 68" className={className} aria-hidden>
          <ellipse cx="28" cy="48" rx="22" ry="14" fill={fill} />
          <ellipse cx="60" cy="48" rx="22" ry="14" fill={fill} />
        </svg>
      );
    case 'accessory':
      return (
        <svg viewBox="0 0 82 108" className={className} aria-hidden>
          <path d="M16 28 C16 12 66 12 66 28 L66 88 C66 98 16 98 16 88 Z" fill={fill} />
          <rect x="36" y="8" width="10" height="24" rx="3" fill={fill} />
        </svg>
      );
  }
}

/** @deprecated Use HeadMannequin — kept for any legacy imports. */
export function MannequinSilhouette({ tint }: { tint?: string }) {
  return <HeadMannequin tint={tint} />;
}
