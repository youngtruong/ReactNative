// theme.ts
// Bảng thiết kế dùng chung cho toàn bộ app (giống phong cách Zalo / iOS 26 / Material 3)
// Chỉnh 1 chỗ ở đây là đổi được tông màu / bo góc của toàn bộ app.

export const colors = {
  primary: '#0180FF',        // Xanh dương chủ đạo (giống Zalo)
  primaryDark: '#0058CC',
  primarySoft: '#E9F3FF',    // Nền input / badge nhạt
  background: '#F7F9FC',     // Nền màn hình
  surface: '#FFFFFF',        // Nền card
  border: '#E7ECF3',
  text: '#151B26',
  textSecondary: '#6B7684',
  textPlaceholder: '#A0A8B4',
  success: '#22C55E',
  error: '#F04452',
  disabled: '#C7CDD6',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodyMedium: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary },
};

// Shadow "mềm" kiểu iOS/Material 3 (đổ bóng nhẹ, không nặng nề)
export const shadow = {
  card: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
};