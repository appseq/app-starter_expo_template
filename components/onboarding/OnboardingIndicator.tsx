/**
 * OnboardingIndicator Component
 * Animated page indicator dots for onboarding
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { ONBOARDING_SLIDES } from './slides';

interface OnboardingIndicatorProps {
  scrollOffset: SharedValue<number>;
  screenWidth: number;
}

const DOT_SIZE = 8;
const DOT_SPACING = 8;
const ACTIVE_DOT_WIDTH = 24;

export default function OnboardingIndicator({
  scrollOffset,
  screenWidth,
}: OnboardingIndicatorProps) {
  return (
    <View style={styles.container}>
      {ONBOARDING_SLIDES.map((_, index) => (
        <Dot
          key={index}
          index={index}
          scrollOffset={scrollOffset}
          screenWidth={screenWidth}
        />
      ))}
    </View>
  );
}

interface DotProps {
  index: number;
  scrollOffset: SharedValue<number>;
  screenWidth: number;
}

function Dot({ index, scrollOffset, screenWidth }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];

    const width = interpolate(
      scrollOffset.value,
      inputRange,
      [DOT_SIZE, ACTIVE_DOT_WIDTH, DOT_SIZE],
      'clamp'
    );

    const opacity = interpolate(
      scrollOffset.value,
      inputRange,
      [0.4, 1, 0.4],
      'clamp'
    );

    return {
      width,
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DOT_SPACING,
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#0D9488', // Teal accent color
  },
});
