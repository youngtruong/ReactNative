import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import type { LocationDriver } from './location';
Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'whenInUse',
  enableBackgroundLocationUpdates: false,
  locationProvider: 'auto',
});
export const nativeLocationDriver: LocationDriver = {
  async requestForegroundPermissionsAsync() {
    if (Platform.OS === 'android') {
      const permissions = PermissionsAndroid.PERMISSIONS;
      const results = await PermissionsAndroid.requestMultiple([
        permissions.ACCESS_FINE_LOCATION,
        permissions.ACCESS_COARSE_LOCATION,
      ]);
      return {
        granted:
          results[permissions.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          results[permissions.ACCESS_COARSE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED,
      };
    }
    return new Promise(resolve =>
      Geolocation.requestAuthorization(
        () => resolve({ granted: true }),
        () => resolve({ granted: false }),
      ),
    );
  },
  // The native GPS call reports POSITION_UNAVAILABLE when location services are off.
  async getCurrentPositionAsync() {
    return new Promise((resolve, reject) =>
      Geolocation.getCurrentPosition(
        resolve,
        error =>
          reject(
            new Error(
              error.code === 2
                ? 'Hãy bật dịch vụ vị trí của thiết bị.'
                : error.code === 1
                ? 'Chưa được cấp quyền vị trí.'
                : 'Lấy vị trí quá lâu. Hãy thử lại hoặc tìm thành phố.',
            ),
          ),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
      ),
    );
  },
};
