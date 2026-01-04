import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { getColors } from '@/constants/internal/colors';
import { useTheme } from '@/hooks/useTheme';

interface ScanningFrameProps {
  size?: number;
  cornerSize?: number;
  strokeWidth?: number;
  animated?: boolean;
}

export default function ScanningFrame({
  size = 280,
  cornerSize = 40,
  strokeWidth = 3,
  animated = true,
}: ScanningFrameProps) {
  const themeContext = useTheme();
  const actualTheme = themeContext?.actualTheme || 'dark';
  const colors = getColors(actualTheme);

  const frameColor = colors.zophi?.bronze || '#C4956A';

  // Animation for pulsing effect
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (animated) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const cornerStyle = {
    position: 'absolute' as const,
    width: cornerSize,
    height: cornerSize,
    borderColor: frameColor,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size },
        animated && animatedStyle
      ]}
    >
      {/* Top Left Corner */}
      <View
        style={[
          cornerStyle,
          styles.topLeft,
          {
            borderTopWidth: strokeWidth,
            borderLeftWidth: strokeWidth,
            borderTopLeftRadius: 8,
          },
        ]}
      />

      {/* Top Right Corner */}
      <View
        style={[
          cornerStyle,
          styles.topRight,
          {
            borderTopWidth: strokeWidth,
            borderRightWidth: strokeWidth,
            borderTopRightRadius: 8,
          },
        ]}
      />

      {/* Bottom Left Corner */}
      <View
        style={[
          cornerStyle,
          styles.bottomLeft,
          {
            borderBottomWidth: strokeWidth,
            borderLeftWidth: strokeWidth,
            borderBottomLeftRadius: 8,
          },
        ]}
      />

      {/* Bottom Right Corner */}
      <View
        style={[
          cornerStyle,
          styles.bottomRight,
          {
            borderBottomWidth: strokeWidth,
            borderRightWidth: strokeWidth,
            borderBottomRightRadius: 8,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
});
