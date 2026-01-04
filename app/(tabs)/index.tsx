import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { getColors } from '@/constants/internal/colors';
import { useTheme } from '@/hooks/useTheme';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePaywall } from '@/contexts/PaywallContext';
import { Haptics } from '@/utils/haptics';
import { APP_CONFIG } from '@/constants/appConfig';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isSubscribed } = useSubscription();
  const { presentPaywall } = usePaywall();
  const themeContext = useTheme();
  const actualTheme = themeContext?.actualTheme || 'dark';
  const colors = getColors(actualTheme);
  const isDark = actualTheme === 'dark';

  const handleSettingsPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  const handleUpgradePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await presentPaywall({ refined: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <LinearGradient
        colors={colors.background.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.background.secondary }]}
            onPress={handleSettingsPress}
          >
            <Settings size={22} color={colors.text.primary} />
          </TouchableOpacity>

          {!isSubscribed && (
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: colors.accent.gold }]}
              onPress={handleUpgradePress}
            >
              <Sparkles size={16} color="#000" />
              <Text style={styles.upgradeText}>{t('ui.subscription.upgrade')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.accent.gold }]}>
              <Sparkles size={48} color="#000" />
            </View>
          </View>

          <Text style={[styles.appName, { color: colors.text.primary }]}>
            {APP_CONFIG.app.displayName}
          </Text>

          <Text style={[styles.tagline, { color: colors.text.secondary }]}>
            {t('app.tagline')}
          </Text>

          <Text style={[styles.version, { color: colors.text.muted }]}>
            v{APP_CONFIG.app.version}
          </Text>

          {/* Template Notice */}
          <View style={[styles.templateBadge, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.templateText, { color: colors.text.secondary }]}>
              Template Ready
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: colors.background.secondary }]}
            onPress={handleSettingsPress}
          >
            <Settings size={20} color={colors.text.primary} />
            <Text style={[styles.settingsButtonText, { color: colors.text.primary }]}>
              {t('ui.settings.title')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  upgradeText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    marginBottom: 24,
  },
  templateBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  templateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
