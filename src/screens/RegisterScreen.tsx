// RegisterScreen.tsx
// Màn Đăng ký: Họ tên + Số điện thoại + Mật khẩu + Xác nhận mật khẩu.
// Có thanh đo độ mạnh mật khẩu để tăng trải nghiệm ("smart validation").

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
import {
  getPhoneError,
  getPasswordError,
  getConfirmPasswordError,
  getNameError,
  getPasswordStrength,
} from '../utils/validation';

interface RegisterScreenProps {
  onRegisterSuccess: (phone: string) => void;
  onNavigateLogin: () => void;
}

const STRENGTH_LABEL = ['Yếu', 'Trung bình', 'Khá', 'Mạnh'];
const STRENGTH_COLOR = [colors.error, '#F59E0B', '#3B82F6', colors.success];

export default function RegisterScreen({
  onRegisterSuccess,
  onNavigateLogin,
}: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const nameError = touched.name ? getNameError(name) : null;
  const phoneError = touched.phone ? getPhoneError(phone) : null;
  const passwordError = touched.password ? getPasswordError(password) : null;
  const confirmError = touched.confirmPassword
    ? getConfirmPasswordError(password, confirmPassword)
    : null;

  const strength = getPasswordStrength(password);

  const isFormValid = useMemo(
    () =>
      !getNameError(name) &&
      !getPhoneError(phone) &&
      !getPasswordError(password) &&
      !getConfirmPasswordError(password, confirmPassword),
    [name, phone, password, confirmPassword]
  );

  const markAllTouched = () =>
    setTouched({ name: true, phone: true, password: true, confirmPassword: true });

  const handleSubmit = () => {
    markAllTouched();
    if (!isFormValid) return;
    setSubmitting(true);
    // Giả lập gọi API đăng ký
    setTimeout(() => {
      setSubmitting(false);
      onRegisterSuccess(phone);
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
          <Text style={styles.title}>Tạo tài khoản mới</Text>
          <Text style={styles.subtitle}>Chỉ mất chưa đến 1 phút</Text>

          <View style={[styles.card, shadow.card]}>
            <AppTextField
              label="Họ và tên"
              icon="🙂"
              placeholder="Nguyễn Văn A"
              value={name}
              onChangeText={setName}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              error={nameError}
              autoCapitalize="words"
            />

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
              placeholder="Tối thiểu 6 ký tự, gồm chữ và số"
              isPassword
              value={password}
              onChangeText={setPassword}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={passwordError}
            />

            {password.length > 0 && (
              <View style={styles.strengthWrapper}>
                <View style={styles.strengthTrack}>
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthSegment,
                        i <= strength - 1 && {
                          backgroundColor: STRENGTH_COLOR[strength],
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: STRENGTH_COLOR[strength] }]}>
                  {STRENGTH_LABEL[strength]}
                </Text>
              </View>
            )}

            <AppTextField
              label="Xác nhận mật khẩu"
              icon="🔒"
              placeholder="Nhập lại mật khẩu"
              isPassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
              error={confirmError}
            />

            <AppButton
              title="Đăng ký"
              onPress={handleSubmit}
              loading={submitting}
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <Pressable onPress={onNavigateLogin} hitSlop={8}>
              <Text style={styles.footerLink}>Đăng nhập</Text>
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
  strengthWrapper: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  strengthTrack: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
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