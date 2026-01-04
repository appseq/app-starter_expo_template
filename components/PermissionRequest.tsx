import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Camera, X, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from './GlassCard';
import AnimatedButton from './AnimatedButton';
import Colors, { getColors } from "@/constants/internal/colors";
import { useTheme } from '@/hooks/useTheme';

interface PermissionRequestProps {
  onRequestPermission: () => void;
  onDismiss?: () => void;
}

export const PermissionRequest: React.FC<PermissionRequestProps> = ({
  onRequestPermission,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const themeContext = useTheme();
  const actualTheme = themeContext?.actualTheme || 'dark';
  const colors = getColors(actualTheme);
  const isDark = actualTheme === 'dark';
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Gentle floating animation
    scale.value = withRepeat(
      withTiming(1.05, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    );

    // Subtle rotation
    rotation.value = withRepeat(
      withTiming(5, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    );
  }, [scale, rotation]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
    };
  });

  return (
    <LinearGradient
      colors={colors.background.gradient}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Dismiss button */}
        {onDismiss && (
          <TouchableOpacity
            style={[
              styles.dismissButton,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
            ]}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}

        {/* Animated particles */}
        <View style={styles.particlesContainer}>
          {[...Array(20)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.particle,
                {
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: Math.random() * 4 + 1,
                  height: Math.random() * 4 + 1,
                  opacity: Math.random() * 0.5 + 0.1,
                  backgroundColor: colors.text.primary,
                }
              ]}
            />
          ))}
        </View>

        <View style={styles.mainContent}>
          {/* Icon animation */}
          <Animated.View style={[styles.iconContainer, animatedStyle]}>
            <LinearGradient
              colors={[Colors.primary.main, Colors.primary.dark]}
              style={styles.iconBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Camera size={60} color={Colors.neutral.white} />
            </LinearGradient>
          </Animated.View>

          {/* Permission explanation */}
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('ui.permissions.camera.title')}
            </Text>

            <GlassCard style={[
              styles.card,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
            ]}>
              <Text style={[styles.description, { color: colors.text.secondary }]}>
                {t('ui.permissions.camera.description')}
              </Text>
            </GlassCard>

            <AnimatedButton
              title={t('ui.permissions.camera.button')}
              onPress={onRequestPermission}
              style={{
                ...styles.button,
                borderWidth: 2,
                borderColor: colors.text.primary,
                backgroundColor: 'transparent',
              }}
              gradientColors={['transparent', 'transparent']}
              textStyle={{
                color: colors.text.primary,
                fontWeight: '800',
                fontSize: 17,
              }}
              testID="permission-button"
            />

            <Text style={[styles.skipText, { color: colors.text.muted }]}>
              {t('ui.permissions.camera.skipText')}
            </Text>

            <TouchableOpacity
              style={[
                styles.settingsButton,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
              ]}
              onPress={() => Linking.openSettings()}
              activeOpacity={0.7}
            >
              <Settings size={18} color={colors.text.muted} />
              <Text style={[styles.settingsButtonText, { color: colors.text.muted }]}>
                {t('ui.permissions.camera.openSettings')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  dismissButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  button: {
    marginBottom: 20,
  },
  skipText: {
    fontSize: 14,
    textAlign: 'center',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
  },
  settingsButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default PermissionRequest;