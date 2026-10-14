export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}
export interface Settings {
  temperature: 'celsius' | 'fahrenheit';
  wind: 'kmh' | 'ms';
  theme: 'system' | 'light' | 'dark';
}
export type Value = number | null;
export interface Current {
  time: string;
  temperature_2m: Value;
  relative_humidity_2m: Value;
  apparent_temperature: Value;
  is_day: Value;
  precipitation: Value;
  weather_code: Value;
  pressure_msl: Value;
  wind_speed_10m: Value;
  wind_direction_10m: Value;
  visibility: Value;
}
export interface Hourly {
  time: string[];
  temperature_2m: Value[];
  weather_code: Value[];
  precipitation_probability: Value[];
  is_day: Value[];
  uv_index: Value[];
}
export interface Daily {
  time: string[];
  weather_code: Value[];
  temperature_2m_max: Value[];
  temperature_2m_min: Value[];
  precipitation_probability_max: Value[];
  sunrise: (string | null)[];
  sunset: (string | null)[];
}
export interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset_seconds: number;
  current: Current;
  hourly: Hourly;
  daily: Daily;
  current_units: Record<string, string>;
  hourly_units: Record<string, string>;
  daily_units: Record<string, string>;
}
export interface Weather {
  forecast: ForecastResponse;
  updatedAt: number;
}
export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}
export interface GeocodingResponse {
  results?: GeocodingResult[];
  generationtime_ms?: number;
}
