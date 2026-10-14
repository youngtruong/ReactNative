import type { Place } from '../types';
export interface LocationDriver {
  requestForegroundPermissionsAsync: () => Promise<{ granted: boolean }>;
  hasServicesEnabledAsync?: () => Promise<boolean>;
  getCurrentPositionAsync: (options: {
    accuracy: number;
  }) => Promise<{ coords: { latitude: number; longitude: number } }>;
}
export async function currentPlace(
  driver: LocationDriver,
  accuracy: number,
): Promise<Place | null> {
  const permission = await driver.requestForegroundPermissionsAsync();
  if (!permission.granted) return null;
  if (
    driver.hasServicesEnabledAsync &&
    !(await driver.hasServicesEnabledAsync())
  )
    throw new Error('Hãy bật dịch vụ vị trí của thiết bị.');
  let timer: ReturnType<typeof setTimeout> | undefined;
  const position = await Promise.race([
    driver.getCurrentPositionAsync({ accuracy }),
    new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new Error(
              'Lấy vị trí quá lâu. Vui lòng thử lại hoặc tìm thành phố.',
            ),
          ),
        15000,
      );
    }),
  ]).finally(() => clearTimeout(timer));
  const { latitude, longitude } = position.coords;
  return {
    id: `gps:${latitude.toFixed(3)},${longitude.toFixed(3)}`,
    name: 'Vị trí hiện tại',
    latitude,
    longitude,
  };
}
