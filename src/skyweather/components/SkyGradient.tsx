// @refresh reset
import React, { useId } from 'react';
import { View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export function SkyGradient({
  colors,
  style,
  children,
}: {
  colors: readonly [string, string];
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const id = `sky${useId().replace(/:/g, '')}`;
  return (
    <View style={[styles.container, { backgroundColor: colors[0] }, style]}>
      {/* A separate, unpadded background layer keeps SVG percentages independent
      of the hero's content padding, including its safe-area inset. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0" stopColor={colors[0]} />
              <Stop offset="1" stopColor={colors[1]} />
            </LinearGradient>
          </Defs>
          <Rect width={100} height={100} fill={`url(#${id})`} />
        </Svg>
      </View>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({ container: { overflow: 'hidden' } });
