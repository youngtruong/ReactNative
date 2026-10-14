import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  condition,
  temperature,
  number,
  windDirection,
  nextHours,
  clock,
} from '../src/skyweather/utils/weather';
import {
  forecastUrl,
  getWeather,
  searchPlaces,
  request,
} from '../src/skyweather/services/api';
import { currentPlace } from '../src/skyweather/services/location';
import type { ForecastResponse, Place } from '../src/skyweather/types';
const place: Place = {
  id: 'hanoi',
  name: 'Hà Nội',
  latitude: 21.0245,
  longitude: 105.8412,
};
test('đổi đơn vị và dữ liệu thiếu không tạo giá trị giả', () => {
  assert.equal(temperature(0, 'fahrenheit'), '32°');
  assert.equal(temperature(30, 'celsius'), '30°');
  assert.equal(temperature(null, 'celsius'), 'Chưa có dữ liệu');
  assert.equal(number(36, ' m/s', 3.6), '10 m/s');
  assert.equal(number(undefined), 'Chưa có dữ liệu');
  assert.equal(windDirection(359), 'Bắc');
});
test('mã WMO có mô tả và icon tiếng Việt', () => {
  assert.equal(condition(0, false).icon, 'moon');
  assert.equal(condition(95).icon, 'thunderstorm');
  assert.equal(condition(73).icon, 'snow');
  assert.equal(condition(61).icon, 'rainy');
  assert.equal(condition(3).icon, 'cloud');
  assert.equal(condition(999).label, 'Chưa có dữ liệu');
});
test('24 giờ tiếp theo dùng thời gian địa phương thay vì múi giờ thiết bị', () => {
  const f = {
    current: { time: '2026-10-07T23:15' },
    hourly: {
      time: ['2026-10-07T22:00', '2026-10-07T23:00', '2026-10-08T00:00'],
    },
  } as ForecastResponse;
  assert.deepEqual(
    nextHours(f).map(h => h.i),
    [1, 2],
  );
  assert.equal(clock('2026-10-08T06:04'), '06:04');
});
test('endpoint đúng tọa độ khi đổi địa điểm và đơn vị chuẩn cho cache', () => {
  const url = new URL(forecastUrl(place));
  assert.equal(url.searchParams.get('timezone'), 'auto');
  assert.equal(url.searchParams.get('forecast_days'), '7');
  assert.equal(url.searchParams.get('temperature_unit'), 'celsius');
  assert.notEqual(
    forecastUrl(place),
    forecastUrl({ ...place, longitude: 106 }),
  );
});
test('từ chối vị trí không gọi GPS và không chặn tìm thủ công', async () => {
  let called = false;
  const result = await currentPlace(
    {
      requestForegroundPermissionsAsync: async () => ({ granted: false }),
      hasServicesEnabledAsync: async () => {
        called = true;
        return true;
      },
      getCurrentPositionAsync: async () => {
        called = true;
        return { coords: place };
      },
    },
    3,
  );
  assert.equal(result, null);
  assert.equal(called, false);
});
test('API search nhận signal và phân biệt quốc gia / khu vực', async () => {
  const original = globalThis.fetch;
  let received = false;
  globalThis.fetch = async (input, options) => {
    received = !!options?.signal;
    assert.match(String(input), /language=vi/);
    return new Response(
      JSON.stringify({
        results: [
          {
            id: 1,
            name: 'Paris',
            latitude: 48,
            longitude: 2,
            country: 'Pháp',
            admin1: 'Île-de-France',
          },
        ],
      }),
    );
  };
  try {
    const result = await searchPlaces('Paris', new AbortController().signal);
    assert.equal(result[0]?.country, 'Pháp');
    assert.equal(result[0]?.id, '1');
    assert.ok(received);
  } finally {
    globalThis.fetch = original;
  }
});
test('lỗi mạng được chuyển thành thông báo dễ đọc', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError('offline');
  };
  try {
    await assert.rejects(
      request('https://api.open-meteo.com'),
      /Kiểm tra kết nối/,
    );
  } finally {
    globalThis.fetch = original;
  }
});
test('không chấp nhận phản hồi forecast bị lỗi cấu trúc', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}');
  try {
    await assert.rejects(getWeather(place), /không hợp lệ/);
  } finally {
    globalThis.fetch = original;
  }
});
import { toggleFavorite } from '../src/skyweather/utils/state';
import { QueryClient } from '@tanstack/react-query';
test('thêm / xóa yêu thích dựa trên ID, giữ thành phố trùng tên', () => {
  const first = toggleFavorite([], place);
  assert.equal(first.length, 1);
  const other = { ...place, id: 'hanoi2' };
  assert.equal(toggleFavorite(first, other).length, 2);
  assert.equal(toggleFavorite(first, place).length, 0);
  assert.equal(first.length, 1);
});
test('cache còn dữ liệu sau lỗi mạng, đổi tọa độ tách query', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const key = ['weather', 21, 105];
  const cached = { updatedAt: 100, forecast: { temperature: 30 } };
  client.setQueryData(key, cached);
  await assert.rejects(
    client.fetchQuery({
      queryKey: key,
      queryFn: async () => {
        throw new Error('offline');
      },
    }),
  );
  assert.deepEqual(client.getQueryData(key), cached);
  assert.equal(client.getQueryData(['weather', 10, 106]), undefined);
  client.clear();
});
test('hủy tìm kiếm cũ truyền abort xuống fetch', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (_, options) =>
    await new Promise<Response>((_, reject) => {
      options?.signal?.addEventListener('abort', () =>
        reject(new Error('cancelled')),
      );
    });
  try {
    const controller = new AbortController();
    const pending = searchPlaces('Ha', controller.signal);
    controller.abort();
    await assert.rejects(pending, /cancelled/);
  } finally {
    globalThis.fetch = original;
  }
});
import { normalizeForecast } from '../src/skyweather/services/api';
test('chỉ số bị API bỏ qua thành null và UI báo thiếu dữ liệu', () => {
  const partial = {
    timezone: 'Asia/Ho_Chi_Minh',
    current: { time: '2026-10-07T12:00', temperature_2m: 30 },
    hourly: { time: ['2026-10-07T12:00'], temperature_2m: [30] },
    daily: { time: ['2026-10-07'] },
  } as ForecastResponse;
  const f = normalizeForecast(partial);
  assert.equal(f.current.visibility, null);
  assert.deepEqual(f.daily.sunrise, [null]);
  assert.deepEqual(f.hourly.uv_index, [null]);
  assert.equal(number(f.current.visibility), 'Chưa có dữ liệu');
});
