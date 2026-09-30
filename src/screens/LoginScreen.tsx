// LoginScreen.tsx
// Màn Đăng nhập: đăng nhập bằng SỐ ĐIỆN THOẠI + mật khẩu.
// Validate thông minh: chỉ hiện lỗi sau khi rời khỏi ô (touched), tự cập nhật realtime sau đó.
// Nút "Đăng nhập" chỉ bật khi toàn bộ dữ liệu hợp lệ.

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import AppTextField from '../components/AppTextField';
import AppButton from '../components/AppButton';
import { colors, spacing, radius, shadow, typography } from '../theme/theme';
import { getPhoneError, getPasswordError } from '../utils/validation';

interface LoginScreenProps {
  onLoginSuccess: (phone: string) => void;
  onNavigateRegister: () => void;
}

export default function LoginScreen({ onLoginSuccess, onNavigateRegister }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ phone: false, password: false });
  const [submitting, setSubmitting] = useState(false);

  const phoneError = touched.phone ? getPhoneError(phone) : null;
  const passwordError = touched.password ? getPasswordError(password) : null;

  const isFormValid = useMemo(
    () => !getPhoneError(phone) && !getPasswordError(password),
    [phone, password]
  );

  const handleSubmit = () => {
    setTouched({ phone: true, password: true });
    if (!isFormValid) return;
    setSubmitting(true);
    // Giả lập gọi API đăng nhập
    setTimeout(() => {
      setSubmitting(false);
      onLoginSuccess(phone);
    }, 700);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💬</Text>
          </View>

          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục sử dụng ứng dụng</Text>

          <View style={[styles.card, shadow.card]}>
            <AppTextField
              label="Số điện thoại"
              icon="📱"
              placeholder="VD: 0912 345 678"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              error={phoneError}
              maxLength={13}
            />
            <AppTextField
              label="Mật khẩu"
              icon="🔒"
              placeholder="Nhập mật khẩu"
              isPassword
              value={password}
              onChangeText={setPassword}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={passwordError}
            />

            <AppButton
              title="Đăng nhập"
              onPress={handleSubmit}
              loading={submitting}
              disabled={!isFormValid && (touched.phone || touched.password)}
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <Pressable onPress={onNavigateRegister} hitSlop={8}>
              <Text style={styles.footerLink}>Đăng ký ngay</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'stretch',
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: {
    fontSize: 34,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
});