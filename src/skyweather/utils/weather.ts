import type { Value, Settings, ForecastResponse } from '../types';
export const missing = 'Chưa có dữ liệu';
export const valid = (v: Value | undefined): v is number =>
  typeof v === 'number' && Number.isFinite(v);
export function temperature(
  v: Value | undefined,
  unit: Settings['temperature'],
) {
  return valid(v)
    ? `${Math.round(unit === 'fahrenheit' ? (v * 9) / 5 + 32 : v)}°`
    : missing;
}
export function number(v: Value | undefined, suffix = '', divisor = 1) {
  return valid(v) ? `${+(v / divisor).toFixed(1)}${suffix}` : missing;
}
export function windDirection(v: Value | undefined) {
  return valid(v)
    ? [
        'Bắc',
        'Đông Bắc',
        'Đông',
        'Đông Nam',
        'Nam',
        'Tây Nam',
        'Tây',
        'Tây Bắc',
      ][Math.round(v / 45) % 8]
    : missing;
}
export function condition(
  code: Value | undefined,
  day = true,
): {
  label: string;
  icon:
    | 'sunny'
    | 'moon'
    | 'partly-sunny'
    | 'cloudy-night'
    | 'cloud'
    | 'rainy'
    | 'thunderstorm'
    | 'snow';
} {
  if (!valid(code)) return { label: missing, icon: 'cloud' };
  if (code === 0)
    return {
      label: day ? 'Trời quang' : 'Đêm quang đãng',
      icon: day ? 'sunny' : 'moon',
    };
  if (code === 1 || code === 2)
    return { label: 'Có mây', icon: day ? 'partly-sunny' : 'cloudy-night' };
  if (code === 3) return { label: 'Nhiều mây', icon: 'cloud' };
  if ([45, 48].includes(code)) return { label: 'Sương mù', icon: 'cloud' };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: 'Tuyết rơi', icon: 'snow' };
  if ([95, 96, 99].includes(code))
    return { label: 'Giông', icon: 'thunderstorm' };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: 'Có mưa', icon: 'rainy' };
  return { label: missing, icon: 'cloud' };
}
// ISO timestamps from Open-Meteo are already local to the requested timezone.
export const clock = (iso?: string | null) =>
  iso ? iso.slice(11, 16) : missing;
export function dayLabel(iso: string, index: number) {
  return index === 0
    ? 'Hôm nay'
    : new Intl.DateTimeFormat('vi-VN', {
        weekday: 'short',
        timeZone: 'UTC',
      }).format(new Date(`${iso}T12:00:00Z`));
}
export function nextHours(f: ForecastResponse) {
  return f.hourly.time
    .map((time, i) => ({ time, i }))
    .filter(h => h.time >= f.current.time.slice(0, 13) + ':00')
    .slice(0, 24);
}
