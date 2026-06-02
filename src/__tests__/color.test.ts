import { describe, expect, it } from 'vitest';
import { bucketForColor, complementaryBucket } from '@/lib/color';

describe('bucketForColor', () => {
  it('returns neutral for missing input', () => {
    expect(bucketForColor(undefined)).toBe('neutral');
    expect(bucketForColor('not-a-color')).toBe('neutral');
  });

  it('classifies pure colours', () => {
    expect(bucketForColor('#000000')).toBe('black');
    expect(bucketForColor('#FFFFFF')).toBe('white');
    expect(bucketForColor('#FF0000')).toBe('red');
    expect(bucketForColor('#00FF00')).toBe('green');
    expect(bucketForColor('#0000FF')).toBe('blue');
  });

  it('classifies muddy browns as brown not orange', () => {
    expect(bucketForColor('#8C5A36')).toBe('brown');
  });
});

describe('complementaryBucket', () => {
  it('returns opposites for primary buckets', () => {
    expect(complementaryBucket('red')).toBe('green');
    expect(complementaryBucket('blue')).toBe('orange');
    expect(complementaryBucket('black')).toBe('white');
    expect(complementaryBucket('white')).toBe('black');
  });
});
