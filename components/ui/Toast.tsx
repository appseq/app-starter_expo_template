/**
 * Toast Component
 * Animated notification that slides in from top and auto-dismisses
 */

import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, AlertCircle, Info } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { getColors } from '@/constants/internal/colors';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const ICON_SIZE = 18;
const ICON_STROKE_WIDTH = 2.5;
const ICON_COLOR = '#FFFFFF';

export function Toast({
  message,
  type = 'success',
  duration = 2500,
  onHide,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const { actualTheme } = useTheme();
  const colors = getColors(actualTheme);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    // Guard: Ensure minimum duration for animation
    const safeDuration = Math.max(duration, 600);
    const animationDuration = 200;
    const visibleDuration = safeDuration - animationDuration * 2;

    // Animate in -> hold -> animate out
    opacity.value = withSequence(
      withTiming(1, { duration: animationDuration }),
      withTiming(1, { duration: visibleDuration }),
      withTiming(0, { duration: animationDuration }, (finished) => {
        if (finished) {
          runOnJS(onHide)();
        }
      })
    );

    translateY.value = withSequence(
      withTiming(0, { duration: animationDuration }),
      withTiming(0, { duration: visibleDuration }),
      withTiming(-10, { duration: animationDuration })
    );
  }, [duration, onHide, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const getIcon = () => {
    const iconProps = {
      size: ICON_SIZE,
      strokeWidth: ICON_STROKE_WIDTH,
      color: ICON_COLOR,
    };

    switch (type) {
      case 'success':
        return <Check {...iconProps} />;
      case 'error':
        return <AlertCircle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      default:
        return <Check {...iconProps} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.accent.emerald ?? '#22C55E';
      case 'error':
        return colors.accent.red ?? '#EF4444';
      case 'info':
        return colors.accent.blue ?? '#3B82F6';
      default:
        return colors.accent.emerald ?? '#22C55E';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8, backgroundColor: getBackgroundColor() },
        animatedStyle,
      ]}
    >
      {getIcon()}
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
