/**
 * OnboardingSlide Component
 * Individual slide with text and phone mockup
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { ANIMATION_CONFIG } from './slides';
import PhoneMockup from './PhoneMockup';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlideProps {
  titleKey: string;
  subtitleKey: string;
  icon: 'scan' | 'identify' | 'discover';
  index: number;
  scrollOffset: SharedValue<number>;
  isActive: boolean;
}

export default function OnboardingSlide({
  titleKey,
  subtitleKey,
  icon,
  index,
  scrollOffset,
  isActive,
}: OnboardingSlideProps) {
  const { t } = useTranslation();

  // Animation values for entrance
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const phoneScale = useSharedValue(0.9);
  const phoneOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Staggered entrance animations
      titleOpacity.value = withDelay(
        0,
        withTiming(1, { duration: ANIMATION_CONFIG.entrance.duration })
      );
      titleTranslateY.value = withDelay(
        0,
        withSpring(0, ANIMATION_CONFIG.spring)
      );

      subtitleOpacity.value = withDelay(
        ANIMATION_CONFIG.stagger,
        withTiming(1, { duration: ANIMATION_CONFIG.entrance.duration })
      );
      subtitleTranslateY.value = withDelay(
        ANIMATION_CONFIG.stagger,
        withSpring(0, ANIMATION_CONFIG.spring)
      );

      phoneScale.value = withDelay(
        ANIMATION_CONFIG.stagger * 2,
        withSpring(1, { damping: 15, stiffness: 100 })
      );
      phoneOpacity.value = withDelay(
        ANIMATION_CONFIG.stagger * 2,
        withTiming(1, { duration: 600 })
      );
    } else {
      // Reset when not active
      titleOpacity.value = 0;
      titleTranslateY.value = 20;
      subtitleOpacity.value = 0;
      subtitleTranslateY.value = 20;
      phoneScale.value = 0.9;
      phoneOpacity.value = 0;
    }
  }, [
    isActive,
    titleOpacity,
    titleTranslateY,
    subtitleOpacity,
    subtitleTranslateY,
    phoneScale,
    phoneOpacity,
  ]);

  // Parallax effect for phone
  const phoneAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const translateX = interpolate(
      scrollOffset.value,
      inputRange,
      [SCREEN_WIDTH * 0.3, 0, -SCREEN_WIDTH * 0.3],
      'clamp'
    );

    return {
      transform: [{ translateX }, { scale: phoneScale.value }],
      opacity: phoneOpacity.value,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Light gradient background */}
      <LinearGradient
        colors={['#FAFBFC', '#F5F7FA', '#EEF2F6']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative blob */}
      <View style={styles.blobContainer}>
        <View style={styles.blob} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Text at top */}
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.title, titleAnimatedStyle]}>
            {t(titleKey)}
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
            {t(subtitleKey)}
          </Animated.Text>
        </View>

        {/* Phone mockup in center */}
        <Animated.View style={[styles.phoneContainer, phoneAnimatedStyle]}>
          <PhoneMockup variant={icon} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  blobContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    left: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 1.4,
    height: SCREEN_HEIGHT * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: SCREEN_WIDTH * 0.45,
    backgroundColor: 'rgba(13, 148, 136, 0.1)', // Teal with opacity
  },
  content: {
    flex: 1,
    paddingTop: SCREEN_HEIGHT * 0.12,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0D9488', // Teal accent
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  phoneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 24,
    paddingBottom: 180,
  },
});
