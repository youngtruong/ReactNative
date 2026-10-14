import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

export const motion = {
  pressDuration: 100,
  enterDuration: 220,
  screenDuration: 220,
  pressedScale: 0.975,
  messageOffset: 8,
  easing: Easing.out(Easing.cubic),
  spring: { damping: 22, stiffness: 320, mass: 0.7 },
};
const ReducedMotion = createContext(true);
export const useReducedMotion = () => useContext(ReducedMotion);
export function MotionProvider({ children }: { children: React.ReactNode }) {
  // Avoid movement until the OS preference is known.
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    let changed = false;
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      value => {
        changed = true;
        if (active) setReduced(value);
      },
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (active && !changed) setReduced(value);
      })
      .catch(() => {});
    return () => {
      active = false;
      listener.remove();
    };
  }, []);
  return (
    <ReducedMotion.Provider value={reduced}>{children}</ReducedMotion.Provider>
  );
}
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
export function MotionTouchable({
  style,
  onPressIn,
  onPressOut,
  ...props
}: TouchableOpacityProps) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduced || props.disabled) {
      scale.stopAnimation();
      scale.setValue(1);
    }
    return () => scale.stopAnimation();
  }, [reduced, props.disabled, scale]);
  return (
    <AnimatedTouchable
      {...props}
      activeOpacity={0.75}
      style={[style, { transform: [{ scale }] }]}
      onPressIn={event => {
        if (!reduced && !props.disabled)
          Animated.timing(scale, {
            toValue: motion.pressedScale,
            duration: motion.pressDuration,
            useNativeDriver: true,
          }).start();
        onPressIn?.(event);
      }}
      onPressOut={event => {
        if (!reduced)
          Animated.spring(scale, {
            toValue: 1,
            ...motion.spring,
            useNativeDriver: true,
          }).start();
        onPressOut?.(event);
      }}
    />
  );
}
export function MessageEntrance({
  children,
  style,
  recent,
}: {
  children: React.ReactNode;
  style: React.ComponentProps<typeof Animated.View>['style'];
  recent: boolean;
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(1)).current;
  // Only messages created just now enter; old bubbles remain stable on navigation.
  const shouldEnter = useRef(recent && !reduced).current;
  useEffect(() => {
    if (reduced || !shouldEnter) {
      progress.stopAnimation();
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: motion.enterDuration,
      easing: motion.easing,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reduced, shouldEnter]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [motion.messageOffset, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
