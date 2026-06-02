/**
 * Tiny colour utilities: HSL conversion and bucket assignment
 * used by the closet colour filter and Complete-the-Look intelligence.
 */

export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export function hexToRgb(hex: string | undefined | null): RGB | null {
  if (!hex) return null;
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rr:
        h = (gg - bb) / d + (gg < bb ? 6 : 0);
        break;
      case gg:
        h = (bb - rr) / d + 2;
        break;
      default:
        h = (rr - gg) / d + 4;
    }
    h *= 60;
  }
  return { h, s, l };
}

export const COLOR_BUCKETS = [
  'neutral',
  'red',
  'pink',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'brown',
  'black',
  'white',
] as const;

export type ColorBucket = (typeof COLOR_BUCKETS)[number];

export const COLOR_SWATCH: Record<ColorBucket, string> = {
  neutral: '#9BA0A8',
  red: '#E0413B',
  pink: '#FF6F9E',
  orange: '#E27A1F',
  yellow: '#EFC439',
  green: '#3CA67E',
  blue: '#3A78D1',
  purple: '#8C5BD1',
  brown: '#8C5A36',
  black: '#1A1B1F',
  white: '#F4F4F6',
};

/** Map a hex colour (e.g. dominantColor of an item) to a coarse bucket. */
export function bucketForColor(hex: string | undefined | null): ColorBucket {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'neutral';
  const { h, s, l } = rgbToHsl(rgb);
  if (l < 0.12) return 'black';
  if (l > 0.92 && s < 0.15) return 'white';
  if (s < 0.18) return 'neutral';
  // Brown is low-saturation, low-lightness orange/red.
  if (h < 35 && l < 0.45 && s < 0.55) return 'brown';
  if (h < 12 || h >= 345) return 'red';
  if (h < 25) return 'orange';
  if (h < 50) return 'yellow';
  if (h < 75) return 'yellow';
  if (h < 165) return 'green';
  if (h < 200) return 'green';
  if (h < 255) return 'blue';
  if (h < 290) return 'purple';
  if (h < 345) return 'pink';
  return 'neutral';
}

/** Suggest a complementary bucket (rough opposite on the wheel). */
export function complementaryBucket(b: ColorBucket): ColorBucket {
  switch (b) {
    case 'red':
      return 'green';
    case 'pink':
      return 'green';
    case 'orange':
      return 'blue';
    case 'yellow':
      return 'purple';
    case 'green':
      return 'red';
    case 'blue':
      return 'orange';
    case 'purple':
      return 'yellow';
    case 'brown':
      return 'neutral';
    case 'black':
      return 'white';
    case 'white':
      return 'black';
    default:
      return 'neutral';
  }
}

export const BUCKET_LABELS: Record<ColorBucket, string> = {
  neutral: 'Neutral',
  red: 'Red',
  pink: 'Pink',
  orange: 'Orange',
  yellow: 'Yellow',
  green: 'Green',
  blue: 'Blue',
  purple: 'Purple',
  brown: 'Brown',
  black: 'Black',
  white: 'White',
};
