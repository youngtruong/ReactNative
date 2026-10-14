import { useQuery, useQueryClient, onlineManager } from '@tanstack/react-query';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { getWeather, isForecast, normalizeForecast } from '../services/api';
import { read, write } from '../services/storage';
import type { Place, Weather } from '../types';
export const weatherKey = (p: Place) =>
  ['weather', p.latitude, p.longitude] as const;
export function useWeather(place: Place) {
  const client = useQueryClient();
  const online = useSyncExternalStore(
    onlineManager.subscribe.bind(onlineManager),
    onlineManager.isOnline.bind(onlineManager),
    () => true,
  );
  const key = `${place.latitude},${place.longitude}`;
  const [hydrated, setHydrated] = useState('');
  const [cacheError, setCacheError] = useState(false);
  useEffect(() => {
    let active = true;
    setCacheError(false);
    read<Weather>(`weather:${key}`)
      .then(saved => {
        if (
          active &&
          saved &&
          isForecast(saved.forecast) &&
          Number.isFinite(saved.updatedAt) &&
          !client.getQueryData(weatherKey(place))
        )
          client.setQueryData(
            weatherKey(place),
            { ...saved, forecast: normalizeForecast(saved.forecast) },
            { updatedAt: saved.updatedAt },
          );
      })
      .catch(() => {
        if (active) setCacheError(true);
      })
      .finally(() => {
        if (active) setHydrated(key);
      });
    return () => {
      active = false;
    };
  }, [key, client, place]);
  const query = useQuery({
    queryKey: weatherKey(place),
    enabled: hydrated === key,
    networkMode: 'always',
    refetchOnReconnect: true,
    queryFn: async ({ signal }) => {
      const data = await getWeather(place, signal);
      try {
        await write(`weather:${key}`, data);
        setCacheError(false);
      } catch {
        setCacheError(true);
      }
      return data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
  return {
    ...query,
    cacheError,
    cached:
      !!query.data &&
      (!online ||
        query.isError ||
        Date.now() - query.data.updatedAt > 10 * 60 * 1000),
  };
}
