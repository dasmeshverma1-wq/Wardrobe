export const STUDIO_BACKGROUNDS = [
  { id: 'white', label: 'White', value: '#FFFFFF' },
  { id: 'paper', label: 'Paper', value: '#F7F7F8' },
  { id: 'blush', label: 'Blush', value: '#FFEDF1' },
  { id: 'cream', label: 'Cream', value: '#FAF6EE' },
  { id: 'mint', label: 'Mint', value: '#E8F6F1' },
  { id: 'sky', label: 'Sky', value: '#E6F1FB' },
  { id: 'lilac', label: 'Lilac', value: '#F1EAF8' },
  { id: 'ink', label: 'Ink', value: '#0F1115' },
] as const;

export type StudioBackground = (typeof STUDIO_BACKGROUNDS)[number];
