import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/internal/colors';
import { Haptics } from '@/utils/haptics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePaywall } from '@/contexts/PaywallContext';

const { width } = Dimensions.get('window');

// Animation configurations
const ANIMATION = {
  spring: {
    stiff: { damping: 20, stiffness: 150 },
    soft: { damping: 15, stiffness: 90 },
  },
  timing: {
    medium: { duration: 400, easing: Easing.inOut(Easing.ease) },
  },
};

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const { isSubscribed, isLoading: isSubscriptionLoading } = useSubscription();
  const { presentPaywall } = usePaywall();

  // Content animation
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 600 });
    contentTranslateY.value = withSpring(0, ANIMATION.spring.soft);
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleOnboardingComplete = async () => {
    await completeOnboarding();

    setTimeout(() => {
      router.replace('/');

      if (!isSubscriptionLoading && !isSubscribed) {
        setTimeout(() => {
          presentPaywall({ refined: true });
        }, 500);
      }
    }, 300);
  };

  const handleContinue = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handleOnboardingComplete();
  };

  const handleSkip = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    handleOnboardingComplete();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Solid Background */}
      <LinearGradient
        colors={[Colors.primary.teal, Colors.primary.tealDark]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Top Skip Button */}
      <SafeAreaView style={styles.topContainer} edges={['top']}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>{t('onboarding.skipButtonText')}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <Text style={styles.title}>{t('onboarding.slides.slide1.title')}</Text>
          <View style={styles.accentLine} />
          <Text style={styles.subtitle}>{t('onboarding.slides.slide1.subtitle')}</Text>
          <Text style={styles.description}>{t('onboarding.slides.slide1.description')}</Text>
        </Animated.View>
      </View>

      {/* Bottom Controls */}
      <SafeAreaView style={styles.bottomContainer} edges={['bottom']}>
        <ContinueButton
          onPress={handleContinue}
          buttonText={t('onboarding.finalButtonText')}
        />
      </SafeAreaView>
    </View>
  );
}

// Continue Button with Shimmer Effect
function ContinueButton({
  onPress,
  buttonText,
}: {
  onPress: () => void;
  buttonText: string;
}) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [0, 1],
      [-150, width + 50],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <TouchableOpacity
      style={styles.continueButtonContainer}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Shimmer overlay */}
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={[
              'transparent',
              'rgba(255, 255, 255, 0.15)',
              'rgba(255, 255, 255, 0.25)',
              'rgba(255, 255, 255, 0.15)',
              'transparent',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </View>
      <Text style={styles.continueButtonText}>{buttonText}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.tealDark,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.neutral.white,
    marginBottom: 16,
    lineHeight: 48,
    letterSpacing: -1,
    textAlign: 'center',
  },
  accentLine: {
    height: 3,
    width: 60,
    backgroundColor: Colors.accent.gold,
    borderRadius: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent.gold,
    marginBottom: 16,
    lineHeight: 22,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  topContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
    zIndex: 100,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.white,
    opacity: 0.9,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: 28,
    zIndex: 100,
  },
  continueButtonContainer: {
    backgroundColor: Colors.accent.gold,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.accent.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 28,
  },
  shimmer: {
    width: 100,
    height: '100%',
    position: 'absolute',
  },
  shimmerGradient: {
    flex: 1,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral.white,
    letterSpacing: 0.5,
  },
});
