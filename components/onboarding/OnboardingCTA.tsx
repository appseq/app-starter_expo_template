/**
 * OnboardingCTA Component
 * Call-to-action button and skip button for onboarding
 */

import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

interface OnboardingCTAProps {
  onPress: () => void;
  isVisible: boolean;
}

/**
 * Main CTA button (Continue/Get Started)
 */
export default function OnboardingCTA({
  onPress,
  isVisible,
}: OnboardingCTAProps) {
  const { t } = useTranslation();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isVisible ? 1 : 0),
    transform: [{ scale: withSpring(isVisible ? 1 : 0.9) }],
  }));

  return (
    <Animated.View style={[styles.ctaContainer, animatedStyle]}>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>
          {t('onboarding.continue', 'Continue')}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface SkipButtonProps {
  onPress: () => void;
  isVisible: boolean;
}

/**
 * Skip button for non-final slides
 */
export function SkipButton({ onPress, isVisible }: SkipButtonProps) {
  const { t } = useTranslation();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isVisible ? 1 : 0),
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>{t('onboarding.skip', 'Skip')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#0D9488', // Teal accent
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280', // Gray-500
  },
});
