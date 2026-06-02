import type { ForecastDay, WeatherCondition } from '@/types';
import { format, addDays } from 'date-fns';

const BENGALURU = { latitude: 12.9716, longitude: 77.5946, name: 'Bengaluru' };

type Location = { latitude: number; longitude: number; name: string };

function codeToCondition(code: number): WeatherCondition {
  // WMO weather codes used by Open-Meteo.
  if ([0, 1].includes(code)) return 'sunny';
  if ([2, 3, 45, 48].includes(code)) return 'cloudy';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rainy';
  if ([95, 96, 99].includes(code)) return 'stormy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy';
  return 'cloudy';
}

export async function geolocate(): Promise<Location> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(BENGALURU);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          name: 'Your area',
        }),
      () => resolve(BENGALURU),
      { timeout: 4000, maximumAge: 60 * 60 * 1000 },
    );
  });
}

export async function fetchForecast(loc: Location): Promise<ForecastDay[]> {
  const params = new URLSearchParams({
    latitude: String(loc.latitude),
    longitude: String(loc.longitude),
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
    timezone: 'auto',
    forecast_days: '14',
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Forecast HTTP ' + res.status);
    const data = await res.json();
    const days: ForecastDay[] = data.daily.time.map((iso: string, i: number) => ({
      date: iso,
      tempMaxC: Math.round(data.daily.temperature_2m_max[i]),
      tempMinC: Math.round(data.daily.temperature_2m_min[i]),
      precipMm: data.daily.precipitation_sum[i] ?? 0,
      condition: codeToCondition(data.daily.weathercode[i]),
    }));
    return days;
  } catch (err) {
    console.warn('[weather] live forecast failed, using mock', err);
    return mockForecast();
  }
}

export function mockForecastForDate(isoDate: string): ForecastDay {
  const conditions: WeatherCondition[] = ['sunny', 'sunny', 'cloudy', 'rainy', 'sunny', 'cloudy', 'sunny'];
  const temps = [32, 31, 28, 25, 30, 27, 33, 29, 26, 24];
  const hash = isoDate.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const condition = conditions[hash % conditions.length];
  const tempMaxC = temps[hash % temps.length];
  return {
    date: isoDate,
    tempMaxC,
    tempMinC: tempMaxC - 7,
    precipMm: condition === 'rainy' ? 4 : 0,
    condition,
  };
}

export function mockForecast(dayCount = 90): ForecastDay[] {
  const today = new Date();
  return Array.from({ length: dayCount }, (_, i) =>
    mockForecastForDate(format(addDays(today, i), 'yyyy-MM-dd')),
  );
}

/** Resolve forecast for any calendar day — uses cache when present, else mock. */
export function getForecastForDate(
  isoDate: string,
  cache?: Map<string, ForecastDay>,
): ForecastDay {
  return cache?.get(isoDate) ?? mockForecastForDate(isoDate);
}

export type WeatherAdvice = { ok: boolean; toneTip?: string };

export function weatherAdvice(
  forecast: ForecastDay | undefined,
  itemCategories: string[],
  itemMaterials: (string | undefined)[],
): WeatherAdvice {
  if (!forecast) return { ok: true };
  const hot = forecast.tempMaxC > 28;
  const cold = forecast.tempMaxC < 18;
  const wet = forecast.precipMm > 0.5 || forecast.condition === 'rainy';

  const hasOuterwear = itemCategories.includes('outerwear');
  const hasSuede = itemMaterials.includes('suede');
  const hasCanvas = itemMaterials.includes('canvas');

  if (hot && hasOuterwear) return { ok: false, toneTip: `${forecast.tempMaxC}°C tomorrow — the jacket may be too warm` };
  if (wet && (hasSuede || hasCanvas)) return { ok: false, toneTip: 'Rain expected — swap suede or canvas for something water-friendly' };
  if (cold && !hasOuterwear) return { ok: false, toneTip: `Only ${forecast.tempMaxC}°C — consider adding a layer` };
  return { ok: true, toneTip: 'Looks great for the weather' };
}

/**
 * Score how well an outfit suits a given forecast.
 * Used to surface "best matches" in the Day sheet pin-suggestion list.
 * Higher is better. Range roughly -3 .. +3.
 */
export function scoreOutfitForDay(
  forecast: ForecastDay | undefined,
  itemCategories: string[],
  itemMaterials: (string | undefined)[],
): number {
  if (!forecast) return 0;
  let score = 0;
  const hot = forecast.tempMaxC > 28;
  const cold = forecast.tempMaxC < 18;
  const wet = forecast.precipMm > 0.5 || forecast.condition === 'rainy';

  const hasOuterwear = itemCategories.includes('outerwear');
  const hasDress = itemCategories.includes('dresses');
  const hasSuede = itemMaterials.includes('suede');
  const hasCanvas = itemMaterials.includes('canvas');
  const hasLeather = itemMaterials.includes('leather');
  const hasCotton = itemMaterials.includes('cotton');

  if (hot) {
    if (hasOuterwear) score -= 2;
    if (hasDress) score += 1;
    if (hasCotton) score += 0.5;
  }
  if (cold) {
    if (hasOuterwear) score += 2;
    else score -= 1;
  }
  if (wet) {
    if (hasSuede) score -= 2;
    if (hasCanvas) score -= 1;
    if (hasLeather) score += 0.5;
  }
  return score;
}
