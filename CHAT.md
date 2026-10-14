# ChitChat

Ứng dụng chat React Native sử dụng dữ liệu mẫu, khởi động từ `App.tsx` và triển khai tại `src/chat/ChatApp.tsx`.

## Chạy ứng dụng

Trong thư mục `mobile`, chạy `npm start`. Trong terminal khác chạy `npm run ios` hoặc `npm run android` với simulator/thiết bị đã được cấu hình.

## Sử dụng

- Đăng nhập bằng tài khoản và mật khẩu bất kỳ không rỗng; đây là đăng nhập demo.
- Home hiển thị cuộc trò chuyện, thời gian, tin gần nhất và số chưa đọc. Tìm kiếm hỗ trợ tiếng Việt có hoặc không dấu.
- Mở hội thoại sẽ xóa số chưa đọc. Tin nhắn gửi cập nhật Home và đưa cuộc trò chuyện lên đầu.
- Danh bạ có trạng thái online; chọn người chưa có hội thoại để bắt đầu trò chuyện.
- Thông báo có trạng thái đã đọc, nút đánh dấu từng mục và đọc tất cả, liên kết đến hội thoại.
- Cài đặt hiển thị tài khoản; Switch bật/tắt huy hiệu thông báo. Đăng xuất quay về đăng nhập và đặt lại dữ liệu demo.

Tin nhắn chỉ lưu trong bộ nhớ phiên sử dụng; không có máy chủ, xác thực thật, phản hồi tự động hay push notification. Mã thời tiết cũ vẫn được giữ trong `src/skyweather`.

## Kiểm tra

`npm run typecheck`

`npm test -- --runInBand`

`npx eslint src/chat/ChatApp.tsx App.tsx __tests__/App.test.tsx`

Kiểm thử tự động kiểm tra đăng nhập, tìm kiếm, gửi tin, thông báo và đăng xuất. Cần kiểm tra thêm bố cục và bàn phím trên thiết bị iOS/Android.
