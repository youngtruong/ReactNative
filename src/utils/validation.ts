// validation.ts
// Các hàm validate dùng chung cho màn Đăng nhập / Đăng ký.
// Nguyên tắc "validate thông minh":
// - Không báo lỗi ngay khi người dùng vừa gõ chữ đầu tiên (chỉ báo sau khi họ rời khỏi ô - "touched").
// - Sau khi đã touched, mỗi lần gõ tiếp sẽ tự cập nhật lỗi ngay (real-time).
// - Thông báo lỗi rõ ràng, cụ thể, không chung chung.

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s.\-()]/g, '');
}

export function isValidVietnamesePhone(raw: string): boolean {
  const phone = normalizePhone(raw);
  // Chấp nhận 0xxxxxxxxx (10 số) hoặc +84xxxxxxxxx
  const regex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return regex.test(phone);
}

export function getPhoneError(raw: string): string | null {
  const phone = normalizePhone(raw);
  if (!phone) return 'Vui lòng nhập số điện thoại';
  if (!/^[0-9+]+$/.test(phone)) return 'Số điện thoại chỉ được chứa chữ số';
  if (!isValidVietnamesePhone(phone)) return 'Số điện thoại không đúng định dạng (VD: 0912345678)';
  return null;
}

export function getPasswordError(password: string): string | null {
  if (!password) return 'Vui lòng nhập mật khẩu';
  if (password.length < 6) return 'Mật khẩu cần tối thiểu 6 ký tự';
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Mật khẩu cần gồm cả chữ và số';
  }
  return null;
}

export function getConfirmPasswordError(password: string, confirm: string): string | null {
  if (!confirm) return 'Vui lòng nhập lại mật khẩu';
  if (confirm !== password) return 'Mật khẩu nhập lại không khớp';
  return null;
}

export function getNameError(name: string): string | null {
  if (!name.trim()) return 'Vui lòng nhập họ và tên';
  if (name.trim().length < 2) return 'Họ và tên quá ngắn';
  return null;
}

// Ước lượng độ mạnh mật khẩu (0-3) để hiển thị thanh strength-meter
export function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 3);
}