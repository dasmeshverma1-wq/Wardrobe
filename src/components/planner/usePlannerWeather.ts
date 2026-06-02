import { useEffect, useMemo, useState } from 'react';
import type { ForecastDay } from '@/types';
import { fetchForecast, geolocate, getForecastForDate, mockForecast } from '@/lib/weather';

const CACHE_KEY = 'myntra-wardrobe/v1/weather-cache';
const CACHE_TTL_MS = 60 * 60 * 1000;
const MOCK_DAYS = 90;

type CachePayload = { fetchedAt: number; loc: string; forecast: ForecastDay[] };

function buildMockMap(): Map<string, ForecastDay> {
  return new Map(mockForecast(MOCK_DAYS).map((f) => [f.date, f]));
}

export function usePlannerWeather(): {
  byDate: Map<string, ForecastDay>;
  locationName: string;
  isLive: boolean;
  refresh: () => void;
  forecastFor: (isoDate: string) => ForecastDay;
} {
  const [byDate, setByDate] = useState<Map<string, ForecastDay>>(buildMockMap);
  const [locationName, setLocationName] = useState('Bengaluru');
  const [isLive, setIsLive] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const forecastFor = useMemo(
    () => (isoDate: string) => getForecastForDate(isoDate, byDate),
    [byDate],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cache = JSON.parse(raw) as CachePayload;
          if (Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
            const merged = buildMockMap();
            for (const f of cache.forecast) merged.set(f.date, f);
            if (cancelled) return;
            setByDate(merged);
            setLocationName(cache.loc);
            setIsLive(true);
            return;
          }
        }
      } catch {
        /* ignore cache errors */
      }

      try {
        const loc = await geolocate();
        const live = await fetchForecast(loc);
        if (cancelled) return;
        const merged = buildMockMap();
        for (const f of live) merged.set(f.date, f);
        setByDate(merged);
        setLocationName(loc.name);
        setIsLive(true);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ fetchedAt: Date.now(), loc: loc.name, forecast: live } satisfies CachePayload),
        );
      } catch {
        if (cancelled) return;
        setByDate(buildMockMap());
        setLocationName('Bengaluru');
        setIsLive(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { byDate, locationName, isLive, refresh: () => setReloadKey((k) => k + 1), forecastFor };
}
