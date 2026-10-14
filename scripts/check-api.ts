import assert from 'node:assert/strict';
import { getWeather, searchPlaces } from '../src/skyweather/services/api';
async function main() {
  const results = await searchPlaces('Hanoi');
  const place = results.find(p => p.country === 'Việt Nam');
  assert.ok(place, 'Tìm thấy Hà Nội / Việt Nam');
  const weather = await getWeather(place);
  assert.equal(weather.forecast.daily.time.length, 7);
  assert.ok(weather.forecast.hourly.time.length >= 24);
  assert.ok(weather.forecast.timezone);
  console.log(
    JSON.stringify(
      {
        city: place.name,
        timezone: weather.forecast.timezone,
        current: weather.forecast.current.time,
        days: weather.forecast.daily.time.length,
        hours: weather.forecast.hourly.time.length,
      },
      null,
      2,
    ),
  );
}
main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
