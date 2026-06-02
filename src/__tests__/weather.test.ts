import { describe, expect, it } from 'vitest';
import { getForecastForDate, mockForecast, mockForecastForDate, weatherAdvice, scoreOutfitForDay } from '@/lib/weather';
import type { ForecastDay } from '@/types';

const hot: ForecastDay = { date: '2026-06-01', tempMaxC: 34, tempMinC: 26, precipMm: 0, condition: 'sunny' };
const cold: ForecastDay = { date: '2026-12-15', tempMaxC: 10, tempMinC: 4, precipMm: 0, condition: 'cloudy' };
const wet: ForecastDay = { date: '2026-07-20', tempMaxC: 24, tempMinC: 19, precipMm: 12, condition: 'rainy' };

describe('mockForecastForDate', () => {
  it('returns deterministic mock data for any date', () => {
    const a = mockForecastForDate('2026-08-15');
    const b = mockForecastForDate('2026-08-15');
    expect(a).toEqual(b);
    expect(a.tempMaxC).toBeGreaterThan(0);
    expect(a.date).toBe('2026-08-15');
  });
});

describe('getForecastForDate', () => {
  it('falls back to mock when date is missing from cache', () => {
    const cache = new Map(mockForecast(3).map((f) => [f.date, f]));
    const missing = getForecastForDate('2099-01-01', cache);
    expect(missing.date).toBe('2099-01-01');
    expect(missing.tempMaxC).toBeGreaterThan(0);
  });

  it('uses cache when available', () => {
    const hotDay: ForecastDay = { date: '2099-01-01', tempMaxC: 40, tempMinC: 30, precipMm: 0, condition: 'sunny' };
    const cache = new Map([['2099-01-01', hotDay]]);
    expect(getForecastForDate('2099-01-01', cache).tempMaxC).toBe(40);
  });
});

describe('weatherAdvice', () => {
  it('warns when wearing outerwear on a hot day', () => {
    const advice = weatherAdvice(hot, ['outerwear', 'tops'], ['wool', 'cotton']);
    expect(advice.ok).toBe(false);
    expect(advice.toneTip).toMatch(/warm/i);
  });

  it('warns when wearing suede on a wet day', () => {
    const advice = weatherAdvice(wet, ['footwear', 'tops'], ['suede', 'cotton']);
    expect(advice.ok).toBe(false);
    expect(advice.toneTip).toMatch(/rain/i);
  });

  it('warns when no outerwear on a cold day', () => {
    const advice = weatherAdvice(cold, ['tops', 'bottoms'], ['cotton', 'denim']);
    expect(advice.ok).toBe(false);
    expect(advice.toneTip).toMatch(/layer/i);
  });

  it('is happy when categories match the weather', () => {
    const advice = weatherAdvice(cold, ['outerwear', 'tops'], ['wool', 'cotton']);
    expect(advice.ok).toBe(true);
  });

  it('returns ok when there is no forecast', () => {
    const advice = weatherAdvice(undefined, ['tops'], ['cotton']);
    expect(advice.ok).toBe(true);
  });
});

describe('scoreOutfitForDay', () => {
  it('ranks outerwear higher on cold days', () => {
    const withCoat = scoreOutfitForDay(cold, ['outerwear', 'tops'], ['wool', 'cotton']);
    const withoutCoat = scoreOutfitForDay(cold, ['tops', 'bottoms'], ['cotton', 'denim']);
    expect(withCoat).toBeGreaterThan(withoutCoat);
  });

  it('penalises outerwear on hot days', () => {
    const withCoat = scoreOutfitForDay(hot, ['outerwear', 'tops'], ['wool', 'cotton']);
    const dress = scoreOutfitForDay(hot, ['dresses'], ['cotton']);
    expect(dress).toBeGreaterThan(withCoat);
  });

  it('penalises suede on wet days', () => {
    const suede = scoreOutfitForDay(wet, ['footwear'], ['suede']);
    const leather = scoreOutfitForDay(wet, ['footwear'], ['leather']);
    expect(leather).toBeGreaterThan(suede);
  });
});
