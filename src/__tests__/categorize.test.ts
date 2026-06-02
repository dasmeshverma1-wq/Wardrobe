import { describe, expect, it } from 'vitest';
import { guessCategory, guessMaterial } from '@/lib/categorize';

describe('guessCategory', () => {
  it('catches obvious keywords in the filename', () => {
    expect(guessCategory({ name: 'white-tshirt.jpg' })).toBe('tops');
    expect(guessCategory({ name: 'black-jeans.png' })).toBe('bottoms');
    expect(guessCategory({ name: 'wool blazer.webp' })).toBe('outerwear');
    expect(guessCategory({ name: 'red dress' })).toBe('dresses');
    expect(guessCategory({ name: 'suede boots' })).toBe('footwear');
    expect(guessCategory({ name: 'leather tote bag' })).toBe('bags');
    expect(guessCategory({ name: 'aviator sunglasses' })).toBe('accessories');
  });

  it('falls back to aspect-ratio when no keywords match', () => {
    expect(guessCategory({ name: 'unknown', aspectRatio: 2.0 })).toBe('footwear');
    expect(guessCategory({ name: 'unknown', aspectRatio: 0.4 })).toBe('bottoms');
    expect(guessCategory({ name: 'unknown', aspectRatio: 1.0 })).toBe('tops');
  });

  it('uses URL path as a hint too', () => {
    expect(guessCategory({ url: 'https://example.com/products/red-skirt-medium.jpg' })).toBe('bottoms');
  });
});

describe('guessMaterial', () => {
  it('recognises material keywords', () => {
    expect(guessMaterial({ name: 'suede chelsea boots' })).toBe('suede');
    expect(guessMaterial({ name: 'leather jacket' })).toBe('leather');
    expect(guessMaterial({ name: 'cotton tee' })).toBe('cotton');
    expect(guessMaterial({ name: 'wool overcoat' })).toBe('wool');
  });

  it('returns undefined when nothing matches', () => {
    expect(guessMaterial({ name: 'random thing' })).toBeUndefined();
  });
});
