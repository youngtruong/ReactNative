import React from 'react';
import {
  AccessibilityInfo,
  Animated,
  Text,
  TouchableOpacity,
} from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { MotionProvider, MotionTouchable } from '../src/chat/motion';

test('Reduce Motion disables press animation while preserving button actions and cleans up listener', async () => {
  const remove = jest.fn();
  const preference = jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(true);
  const listener = jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockReturnValue({ remove });
  const timing = jest.spyOn(Animated, 'timing');
  const spring = jest.spyOn(Animated, 'spring');
  const onPress = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(async () => {
      tree = Renderer.create(
        <MotionProvider>
          <MotionTouchable onPress={onPress}>
            <Text>Send</Text>
          </MotionTouchable>
        </MotionProvider>,
      );
    });
    const button = tree.root.findByType(TouchableOpacity);
    await act(async () => {
      button.props.onPressIn({});
      button.props.onPress();
      button.props.onPressOut({});
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(timing).not.toHaveBeenCalled();
    expect(spring).not.toHaveBeenCalled();
    await act(async () => tree.unmount());
    expect(remove).toHaveBeenCalledTimes(1);
  } finally {
    jest.restoreAllMocks();
  }
  expect(preference).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(
    'reduceMotionChanged',
    expect.any(Function),
  );
});
