import type {
  ForecastResponse,
  GeocodingResponse,
  Place,
  Weather,
} from '../types';
export async function request<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort);
  const timer = setTimeout(abort, 12000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Máy chủ trả lỗi ${res.status}`);
    return (await res.json()) as T;
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Không tải được dữ liệu. Kiểm tra kết nối và thử lại.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
export function forecastUrl(place: Place) {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    timezone: 'auto',
    forecast_days: '7',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,visibility',
    hourly:
      'temperature_2m,weather_code,precipitation_probability,is_day,uv_index',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}
export function isForecast(value: unknown): value is ForecastResponse {
  const f = value as ForecastResponse | null;
  return (
    !!f &&
    typeof f.timezone === 'string' &&
    typeof f.current?.time === 'string' &&
    Array.isArray(f.hourly?.time) &&
    Array.isArray(f.hourly?.temperature_2m) &&
    Array.isArray(f.daily?.time)
  );
}
// Missing API metrics stay null; never infer weather values.
export function normalizeForecast(f: ForecastResponse): ForecastResponse {
  const currentKeys = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'precipitation',
    'weather_code',
    'pressure_msl',
    'wind_speed_10m',
    'wind_direction_10m',
    'visibility',
  ] as const;
  const current = { ...f.current };
  for (const key of currentKeys)
    current[key] =
      typeof current[key] === 'number' && Number.isFinite(current[key])
        ? current[key]
        : null;
  const hourly = { ...f.hourly };
  for (const key of [
    'temperature_2m',
    'weather_code',
    'precipitation_probability',
    'is_day',
    'uv_index',
  ] as const)
    hourly[key] = f.hourly.time.map((_, i) =>
      typeof f.hourly[key]?.[i] === 'number' &&
      Number.isFinite(f.hourly[key]?.[i])
        ? f.hourly[key]![i]!
        : null,
    );
  const daily = { ...f.daily };
  for (const key of [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_probability_max',
  ] as const)
    daily[key] = f.daily.time.map((_, i) =>
      typeof f.daily[key]?.[i] === 'number' &&
      Number.isFinite(f.daily[key]?.[i])
        ? f.daily[key]![i]!
        : null,
    );
  daily.sunrise = f.daily.time.map((_, i) =>
    typeof f.daily.sunrise?.[i] === 'string' ? f.daily.sunrise[i]! : null,
  );
  daily.sunset = f.daily.time.map((_, i) =>
    typeof f.daily.sunset?.[i] === 'string' ? f.daily.sunset[i]! : null,
  );
  return { ...f, current, hourly, daily };
}
export async function getWeather(
  place: Place,
  signal?: AbortSignal,
): Promise<Weather> {
  const forecast = await request<ForecastResponse>(forecastUrl(place), signal);
  if (!isForecast(forecast))
    throw new Error('Phản hồi thời tiết không hợp lệ.');
  return { forecast: normalizeForecast(forecast), updatedAt: Date.now() };
}
export async function searchPlaces(
  name: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const data = await request<GeocodingResponse>(
    `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({
      name,
      count: '15',
      language: 'vi',
      format: 'json',
    })}`,
    signal,
  );
  return (data.results ?? []).map(p => ({ ...p, id: String(p.id) }));
}
