// AppTextField.tsx
// Input hiện đại: bo góc lớn, nền xanh nhạt khi focus, icon trái, nút ẩn/hiện mật khẩu,
// dòng lỗi rõ ràng có icon cảnh báo.

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, TextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

interface AppTextFieldProps extends TextInputProps {
  label: string;
  icon?: string; // emoji / ký tự icon, ví dụ '📱'
  error?: string | null;
  isPassword?: boolean;
}

export default function AppTextField({
  label,
  icon,
  error,
  isPassword,
  onFocus,
  onBlur,
  ...rest
}: AppTextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(!!isPassword);

  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          hasError && styles.inputRowError,
        ]}
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <TextInput
          {...rest}
          secureTextEntry={secure}
          placeholderTextColor={colors.textPlaceholder}
          style={styles.input}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {isPassword ? (
          <Pressable onPress={() => setSecure((s) => !s)} hitSlop={8}>
            <Text style={styles.icon}>{secure ? '🙈' : '👁️'}</Text>
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 54,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputRowFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputRowError: {
    borderColor: colors.error,
    backgroundColor: colors.surface,
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    flexShrink: 1,
  },
});