import React, { useEffect, useRef } from 'react';
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { Icon as Ionicons } from '../components/Icon';
import { useTheme } from '../theme';
export function Card({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.card }]}>
      {title && <Text style={[styles.title, { color: t.muted }]}>{title}</Text>}
      {children}
    </View>
  );
}
export function Label({
  children,
  muted = false,
  large = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
  large?: boolean;
}) {
  const t = useTheme();
  return (
    <Text
      style={{
        color: muted ? t.muted : t.text,
        fontSize: large ? 22 : 15,
        lineHeight: large ? 30 : 23,
        fontWeight: large ? '600' : '400',
      }}
    >
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  icon,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: t.accent,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {icon && (
        <Ionicons name={icon} color={t.dark ? '#152746' : 'white'} size={18} />
      )}
      <Text
        style={{
          color: t.dark ? '#152746' : 'white',
          fontWeight: '600',
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Skeleton() {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
      if (!reduce && active) {
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 850,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.5,
              duration: 850,
              useNativeDriver: true,
            }),
          ]),
        );
        animation.start();
      }
    });
    return () => {
      active = false;
      animation?.stop();
    };
  }, [opacity]);
  const t = useTheme();
  return (
    <Animated.View
      accessibilityLabel="Đang tải dự báo"
      style={{ opacity, gap: 18, padding: 20 }}
    >
      {[220, 100, 180, 160].map((height, i) => (
        <View
          key={i}
          style={{ height, borderRadius: 24, backgroundColor: t.border }}
        />
      ))}
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, gap: 14, marginBottom: 16 },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  button: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
