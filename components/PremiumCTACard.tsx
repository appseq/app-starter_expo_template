import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Haptics } from '@/utils/haptics';
import Colors from '@/constants/internal/colors';

// Image assets
const CTA_BACKGROUND = require('@/assets/images/paywall/cta_background.jpeg');

interface PremiumCTACardProps {
  onPress: () => void;
  testID?: string;
}

/**
 * Premium CTA Card component for settings screen
 * Compact upgrade prompt with premium icon
 */
export function PremiumCTACard({ onPress, testID }: PremiumCTACardProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={testID}
        activeOpacity={1}
      >
        <ImageBackground
          source={CTA_BACKGROUND}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
          resizeMode="cover"
        >
          <View style={styles.contentWrapper}>
            {/* Text Content */}
            <View style={styles.textSection}>
              <Text style={styles.title}>
                {t('ui.settings.premiumUpgrade.ctaTitle', { defaultValue: '3-Day Free Trial' })}
              </Text>
              <Text style={styles.subtitle}>
                {t('ui.settings.premiumUpgrade.ctaSubtitle', { defaultValue: 'Claim your offer now' })}
              </Text>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {t('ui.settings.premiumUpgrade.ctaButton', { defaultValue: 'Get Started' })}
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  backgroundImage: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  backgroundImageStyle: {
    borderRadius: 14,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral.white,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
  },
  button: {
    backgroundColor: Colors.neutral.white,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary.main,
  },
});

export default PremiumCTACard;
