# SkyWeather — React Native CLI

Ứng dụng thời tiết tiếng Việt chạy trực tiếp trong dự án React Native CLI hiện có. React Native 0.87.1 + React 19.2.3 + TypeScript; không phụ thuộc Expo.

## Cài đặt

```bash
cd mobile
nvm use
npm ci
```

Node được dự án khóa ở 24.11.0 trong `.nvmrc`. Android cần Android Studio, SDK Platform 37, Build Tools 37.0.0, NDK 27.1.12297006 và JDK 17 theo cấu hình hiện có.

Terminal thứ nhất:

```bash
npm start
```

Terminal thứ hai:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
npm run android -- --no-packager
```

Có thể mở máy ảo hiện có: `emulator -avd MobileApp_Android`. Với Android thật, bật USB debugging và chấp nhận quyền gỡ lỗi, chạy `adb devices`, `adb reverse tcp:8081 tcp:8081` trước khi chạy app.

iOS cần macOS + Xcode và CocoaPods:

```bash
cd ios
pod install
cd ..
npm run ios -- --simulator MobileApp-iPhone --no-packager
```

`ios/Podfile` mặc định build React Native core và dependencies từ source để tránh trường hợp prebuilt core tải được nhưng prebuilt dependencies bị lỗi mạng. Lần build iOS đầu sẽ lâu hơn. Có thể bật prebuilt khi môi trường hỗ trợ bằng `RCT_USE_RN_DEP=1 RCT_USE_PREBUILT_RNCORE=1 pod install`.

Với iPhone thật, mở `ios/MobileApp.xcworkspace`, chọn Apple Development Team của bạn trong Signing & Capabilities rồi Run. Bundle ID và cấu hình signing hiện có được giữ nguyên; tên hiển thị đổi thành SkyWeather. Rebuild native app sau khi thêm dependency hoặc thay đổi quyền; reload JavaScript không đủ.

## Chức năng và kiến trúc

Màn hình mặc định là SkyWeather, dùng React Navigation bottom tabs: Thời tiết, Địa điểm, Cài đặt. Các màn hình cũ được giữ trong `src/screens/`; entry point mới nằm ở `App.tsx`.

```text
mobile/
  App.tsx                         # Entry SkyWeather
  src/skyweather/
    SkyWeatherApp.tsx              # Query provider, state, tabs
    screens/                      # Weather, Places, Settings
    components/                   # UI, SVG gradient, Lucide icons, chart
    services/                     # Open-Meteo, storage, location adapter native
    hooks/                        # Query/cache, state, debounce
    types/                        # Kiểu dữ liệu API/UI
    utils/                        # WMO tiếng Việt, đơn vị, thời gian
    theme/                        # Sáng/tối và màu bầu trời
  tests/weather.test.ts            # Kiểm thử logic (Node test runner)
  __tests__/App.test.tsx            # Smoke test render (Jest)
  scripts/check-api.ts             # Kiểm tra API thật
  android/                        # Manifest quyền, MainActivity
  ios/                            # Info.plist quyền và Pods
```

- Dữ liệu thời tiết hiện tại, 24 giờ (bao gồm giờ hiện tại), 7 ngày, biểu đồ nhiệt độ, độ ẩm, gió/hướng gió, lượng mưa hiện tại, UV theo giờ, tầm nhìn, áp suất mực biển, bình minh/hoàng hôn.
- Gradient theo mã thời tiết/ngày/đêm, thẻ bo tròn, Safe Area, giao diện sáng/tối/hệ thống. Skeleton dùng animation native driver và hỗ trợ Reduce Motion.
- Tìm thành phố Việt Nam/quốc tế với debounce 400 ms và AbortSignal hủy phản hồi cũ. Khu vực/quốc gia phân biệt thành phố trùng tên.
- Lưu/xóa yêu thích bằng ngôi sao; chạm địa điểm để đổi dự báo. Địa điểm GPS ghi “Vị trí hiện tại” vì Open-Meteo không có reverse geocoding.
- Đơn vị °C/°F và km/h/m/s chuyển trên thiết bị, không gọi lại API. Cài đặt, yêu thích và địa điểm được lưu bằng AsyncStorage.
- TanStack Query chia cache theo tọa độ, stale time 10 phút, timeout API 12 giây, retry một lần. Mở lại app đọc dự báo đã lưu trước khi gọi API; mất mạng hiển thị nhãn dữ liệu đã lưu và thời điểm tải theo múi giờ địa điểm. Lần đầu offline chưa có cache sẽ hiện lỗi và nút thử lại.
- Chỉ số thiếu là “Chưa có dữ liệu”, không tạo giá trị giả. Biểu đồ không nối qua điểm thiếu.

## Thư viện và quyền vị trí

Đã thêm React Navigation native/bottom-tabs, TanStack Query, AsyncStorage, NetInfo, @react-native-community/geolocation, react-native-screens, react-native-svg và lucide-react-native. Phiên bản chính xác nằm trong `package-lock.json`. Gradient và biểu đồ dùng SVG; StatusBar dùng React Native. Native modules autolink qua CLI và CocoaPods, không cần thêm bằng tay vào MainApplication.

`android/app/src/main/AndroidManifest.xml` có `ACCESS_COARSE_LOCATION` và `ACCESS_FINE_LOCATION`. Adapter dùng `PermissionsAndroid.requestMultiple` khi người dùng chọn vị trí hiện tại; chấp nhận cả vị trí gần đúng. `ios/MobileApp/Info.plist` có `NSLocationWhenInUseUsageDescription`; Geolocation cấu hình `authorizationLevel: 'whenInUse'`, không theo dõi vị trí nền. Tham khảo [tài liệu thư viện geolocation](https://github.com/michalchudziak/react-native-geolocation).

Từ chối quyền vẫn tìm thành phố thủ công được. GPS tắt, không có vị trí hoặc timeout sẽ có thông báo và không thay đổi địa điểm hiện tại.

Android `MainActivity` cấu hình `RNScreensFragmentFactory` theo [React Navigation](https://reactnavigation.org/docs/getting-started/) để khôi phục activity an toàn.

## API

Đã đối chiếu [Forecast API](https://open-meteo.com/en/docs) và [Geocoding API](https://open-meteo.com/en/docs/geocoding-api) chính thức.

- `https://api.open-meteo.com/v1/forecast`: `timezone=auto`, `forecast_days=7`, danh sách current/hourly/daily trong `services/api.ts`.
- `https://geocoding-api.open-meteo.com/v1/search`: `language=vi`, `count=15`, `format=json`.
- Giờ ISO từ forecast hiển thị theo giờ địa phương API, không chuyển sang múi giờ điện thoại. Thời điểm tải dùng IANA timezone API trả về.
- Không cần API key cho endpoint công cộng. [Điều khoản](https://open-meteo.com/en/terms) và [pricing](https://open-meteo.com/en/pricing) áp dụng khi phát hành/thương mại. Nguồn Open-Meteo / CC BY 4.0 được ghi trong UI.

## Kiểm tra

```bash
npm run typecheck
npm run test:weather
npm test -- --runInBand
npm run test:live
npm run lint
cd android
./gradlew assembleDebug
```

Ngày 07/10/2026, sau chuyển sang CLI: TypeScript qua, 12/12 tests logic qua và smoke test render Jest qua; ESLint cho mã SkyWeather không có lỗi (còn cảnh báo style). Metro đã đóng gói Android; Gradle assembleDebug build APK thành công; CocoaPods đã liên kết 6 thư viện native thành công bằng chế độ source. APK đã cài và mở trên máy ảo MobileApp_Android qua Metro CLI; không thấy lỗi JavaScript/native trong logcat khi khởi động. Luồng API thật đã được kiểm tra trước chuyển đổi, logic service được giữ nguyên.

Các tests logic kiểm tra đổi đơn vị, mã WMO, dữ liệu thiếu, thời gian qua nửa đêm, đổi tọa độ, từ chối quyền không gọi GPS, search/cancel, lỗi mạng, phản hồi không hợp lệ, yêu thích và cache sau lỗi. Jest mock native modules; không thay thế kiểm thử quyền/GPS trên thiết bị.

Đã kiểm tra màn hình thời tiết trên simulator iOS sau khi sửa nền gradient bị hụt do SVG nằm trong khung có padding; nền phủ kín, góc bo và biểu tượng SVG hiển thị đúng. Chưa kiểm tra đầy đủ các luồng UI iOS, build IPA, quyền/GPS iOS thật và hiệu năng animation. Npm báo advisories trong cây dependency; cần kiểm tra upstream trước phát hành, không chạy audit fix --force tự động vì có thể thay đổi phiên bản React Native.

Kiểm thử thiết bị cần làm: tìm thành phố trùng tên/nhập nhanh; thêm/xóa và khởi động lại app; đổi đơn vị/giao diện; từ chối rồi cấp quyền vị trí; tắt GPS; tải dữ liệu rồi bật máy bay và mở lại app; cài mới offline; màn hình nhỏ/tablet/cỡ chữ lớn/Reduce Motion.
