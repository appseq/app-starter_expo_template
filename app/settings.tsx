import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Shield,
  Mail,
  Star,
  Palette,
  Sparkles,
  TestTube,
  FileText,
  RefreshCw,
  Camera,
  Languages,
  ChevronRight,
  RotateCcw,
  Grid2X2,
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Haptics } from '@/utils/haptics';
import { openInAppBrowser } from '@/utils/browser';
import Colors, { getColors } from '@/constants/internal/colors';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { useSubscription } from '@/contexts/SubscriptionContext';
import UpgradePrompt from '@/components/UpgradePrompt';
import { PremiumCTACard } from '@/components/PremiumCTACard';
import { DemoDataService } from '@/services/demoDataService';
import { APP_CONFIG } from '@/constants/appConfig';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAppRating } from '@/hooks/useAppRating';
import { useTestMode } from '@/hooks/useTestMode';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
  rightElement?: React.ReactNode;
  compact?: boolean;
  colors: ReturnType<typeof getColors>;
  isDark: boolean;
}

function SettingsItem({
  title,
  subtitle,
  icon,
  onPress,
  destructive = false,
  testID,
  rightElement,
  compact = false,
  colors,
  isDark,
}: SettingsItemProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} testID={testID} activeOpacity={0.8}>
      <View style={[
        styles.settingsItem,
        compact && styles.compactSettingsItem,
        { backgroundColor: isDark ? colors.surface.glass : colors.surface.card },
      ]}>
        <View style={[styles.itemContent, compact && styles.compactItemContent]}>
          <View style={[
            styles.iconContainer,
            compact && styles.compactIconContainer,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : Colors.neutral.stoneDark },
          ]}>
            {icon}
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                { color: colors.text.primary },
                destructive && { color: Colors.status.error },
                compact && styles.compactItemTitle,
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text style={[
                styles.itemSubtitle,
                { color: colors.text.secondary },
                compact && styles.compactItemSubtitle,
              ]}>
                {subtitle}
              </Text>
            )}
          </View>
          {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
          <ChevronRight size={18} color={colors.text.muted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { isSubscribed, restorePurchases } = useSubscription();
  const { resetOnboarding } = useOnboarding();
  useAppRating();
  const { isTestMode, toggleTestMode } = useTestMode();
  const themeContext = useTheme();
  const actualTheme = themeContext?.actualTheme || 'dark';
  const colors = getColors(actualTheme);
  const isDark = actualTheme === 'dark';
  const { languageDisplayName } = useLanguage();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  useEffect(() => {
    checkDemoMode();
  }, []);

  const checkDemoMode = async () => {
    const isDemoMode = await DemoDataService.isDemoMode();
    setDemoModeEnabled(isDemoMode);
  };

  const handleBackPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handlePrivacy = () => {
    openInAppBrowser(APP_CONFIG.critical.support.privacyPolicyUrl);
  };

  const handleTermsOfService = () => {
    openInAppBrowser(APP_CONFIG.critical.support.termsOfServiceUrl);
  };

  const handleCameraSettings = () => {
    Linking.openSettings();
  };

  const handleSupport = () => {
    const email = APP_CONFIG.critical.support.email;
    const subject = `${t('app.name')} Support`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.canOpenURL(mailtoUrl).then((supported) => {
      if (supported) {
        Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          t('ui.settings.premiumUpgrade.emailNotAvailableTitle'),
          t('ui.settings.premiumUpgrade.emailNotAvailableMessage', { email }),
          [{ text: t('ui.settings.alerts.ok') }]
        );
      }
    });
  };

  const handleRateApp = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      // For manual Rate App button, always open App Store directly
      // Native StoreReview prompt is reserved for automatic prompting (useAppRating)
      // as it may silently fail due to Apple's rate limiting
      const APPLE_APP_ID = APP_CONFIG.critical.appStore.appleAppId;
      const GOOGLE_PACKAGE_NAME = APP_CONFIG.critical.appStore.googlePackageName;

      const url = Platform.select({
        ios: `itms-apps://itunes.apple.com/app/id${APPLE_APP_ID}?action=write-review`,
        android: `market://details?id=${GOOGLE_PACKAGE_NAME}`,
      });

      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        }
      }
    } catch (error) {
      console.error('Error opening store for rating:', error);
    }
  };

  const handleUpgrade = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowUpgradePrompt(true);
  };

  const handleRestorePurchases = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      t('ui.settings.alerts.restoringPurchases'),
      t('ui.settings.alerts.restoringMessage'),
      [{ text: t('ui.settings.alerts.ok') }]
    );

    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert(
          t('ui.settings.alerts.purchasesRestored'),
          t('ui.settings.alerts.purchasesRestoredMessage'),
          [{ text: t('ui.settings.alerts.great') }]
        );
      } else {
        Alert.alert(
          t('ui.settings.alerts.noPurchasesFound'),
          t('ui.settings.alerts.noPurchasesFoundMessage'),
          [{ text: t('ui.settings.alerts.ok') }]
        );
      }
    } catch (error) {
      Alert.alert(
        t('ui.settings.alerts.restoreFailed'),
        t('ui.settings.alerts.restoreFailedMessage'),
        [{ text: t('ui.settings.alerts.ok') }]
      );
    }
  };

  const handleMoreApps = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const url = APP_CONFIG.critical.appStore.developerPageUrl;
    if (!url) return;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening developer page:', error);
    }
  };

  const handleToggleDemoMode = async (value: boolean) => {
    setIsLoadingDemo(true);

    try {
      if (value) {
        await DemoDataService.enableDemoMode();
        await DemoDataService.prefetchImages();
        setDemoModeEnabled(true);
      } else {
        await DemoDataService.disableDemoMode();
        setDemoModeEnabled(false);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error toggling demo mode:', error);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleRestartOnboarding = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    await resetOnboarding();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('ui.settings.title'),
          headerStyle: { backgroundColor: colors.background.dark },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBackPress} style={styles.headerBackButton}>
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <LinearGradient
          colors={colors.background.gradient}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Demo Mode Section (Development Only) */}
            {__DEV__ && (
              <View style={[
                styles.devCard,
                { backgroundColor: isDark ? colors.surface.glass : colors.surface.card },
              ]}>
                <View style={styles.devCardContent}>
                  <View style={styles.devHeader}>
                    <View style={styles.devIconContainer}>
                      <TestTube size={20} color={Colors.accent.gold} />
                    </View>
                    <Text style={[styles.devTitle, { color: colors.text.primary }]}>{t('ui.settings.demoMode.title')}</Text>
                  </View>

                  <View style={styles.devModeContainer}>
                    <View style={styles.devModeInfo}>
                      <Text style={[styles.devLabel, { color: colors.text.primary }]}>{t('ui.settings.demoMode.label')}</Text>
                      <Text style={[styles.devDescription, { color: colors.text.secondary }]}>
                        {t('ui.settings.demoMode.description')}
                      </Text>
                    </View>
                    <Switch
                      value={demoModeEnabled}
                      onValueChange={handleToggleDemoMode}
                      disabled={isLoadingDemo}
                      trackColor={{
                        false: isDark ? 'rgba(255, 255, 255, 0.2)' : Colors.neutral.stoneDark,
                        true: Colors.accent.gold,
                      }}
                      thumbColor={Colors.neutral.white}
                    />
                  </View>

                  {demoModeEnabled && (
                    <View style={styles.devAlert}>
                      <Text style={styles.devAlertText}>{t('ui.settings.demoMode.activeMessage')}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Test Mode Section (Development Only) */}
            {__DEV__ && (
              <View style={[
                styles.devCard,
                { borderColor: Colors.primary.teal, backgroundColor: isDark ? colors.surface.glass : colors.surface.card },
              ]}>
                <View style={styles.devCardContent}>
                  <View style={styles.devHeader}>
                    <View style={[styles.devIconContainer, { backgroundColor: 'rgba(45, 107, 92, 0.15)' }]}>
                      <Sparkles size={20} color={Colors.primary.teal} />
                    </View>
                    <Text style={[styles.devTitle, { color: colors.text.primary }]}>{t('ui.settings.testMode.title')}</Text>
                  </View>

                  <View style={styles.devModeContainer}>
                    <View style={styles.devModeInfo}>
                      <Text style={[styles.devLabel, { color: colors.text.primary }]}>{t('ui.settings.testMode.label')}</Text>
                      <Text style={[styles.devDescription, { color: colors.text.secondary }]}>
                        {t('ui.settings.testMode.description')}
                      </Text>
                    </View>
                    <Switch
                      value={isTestMode}
                      onValueChange={async (value) => {
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        const success = await toggleTestMode();
                        if (success && value) {
                          Alert.alert(
                            t('ui.settings.testMode.enabledTitle'),
                            t('ui.settings.testMode.enabledMessage'),
                            [{ text: t('ui.settings.alerts.ok') }]
                          );
                        }
                      }}
                      trackColor={{
                        false: isDark ? 'rgba(255, 255, 255, 0.2)' : Colors.neutral.stoneDark,
                        true: Colors.primary.teal,
                      }}
                      thumbColor={Colors.neutral.white}
                    />
                  </View>

                  {isTestMode && (
                    <View style={[styles.devAlert, { backgroundColor: 'rgba(45, 107, 92, 0.1)' }]}>
                      <Text style={[styles.devAlertText, { color: Colors.primary.teal }]}>
                        {t('ui.settings.testMode.activeMessage')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Premium Upgrade CTA - hidden in demo mode for clean screenshots */}
            {!isSubscribed && !demoModeEnabled && (
              <PremiumCTACard
                onPress={handleUpgrade}
                testID="upgrade-button"
              />
            )}

            {/* Support Section */}
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('ui.settings.sections.support')}</Text>

            <SettingsItem
              title={t('ui.settings.rateApp')}
              subtitle={t('ui.settings.rateAppSubtitle')}
              icon={<Star size={20} color={Colors.accent.gold} />}
              onPress={handleRateApp}
              testID="rate-button"
              colors={colors}
              isDark={isDark}
            />

            <SettingsItem
              title={t('ui.settings.contactSupport')}
              subtitle={t('ui.settings.contactSupportSubtitle')}
              icon={<Mail size={20} color={Colors.accent.gold} />}
              onPress={handleSupport}
              testID="support-button"
              colors={colors}
              isDark={isDark}
            />

            {/* App Settings */}
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('ui.settings.sections.preferences')}</Text>

            <SettingsItem
              title={t('ui.settings.language')}
              subtitle={languageDisplayName}
              icon={<Languages size={20} color={colors.primary.vibrant} />}
              onPress={() => router.push('/language-settings')}
              testID="language-button"
              colors={colors}
              isDark={isDark}
            />

            {APP_CONFIG.appearance?.makeThemeSelectorAvailable !== false && (
              <SettingsItem
                title={t('ui.settings.appearance')}
                subtitle={t('ui.settings.appearanceSubtitle')}
                icon={<Palette size={20} color={colors.primary.vibrant} />}
                onPress={() => router.push('/theme-settings')}
                testID="theme-button"
                colors={colors}
                isDark={isDark}
              />
            )}

            {/* About Section */}
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('ui.settings.sections.about')}</Text>

            <SettingsItem
              title={t('ui.settings.cameraSettings')}
              subtitle={t('ui.settings.cameraSettingsSubtitle')}
              icon={<Camera size={20} color={colors.text.secondary} />}
              onPress={handleCameraSettings}
              testID="camera-settings-button"
              compact
              colors={colors}
              isDark={isDark}
            />
            <SettingsItem
              title={t('ui.settings.restartOnboarding')}
              subtitle={t('ui.settings.restartOnboardingSubtitle')}
              icon={<RefreshCw size={20} color={colors.text.secondary} />}
              onPress={handleRestartOnboarding}
              testID="restart-onboarding-button"
              compact
              colors={colors}
              isDark={isDark}
            />
            <SettingsItem
              title={t('ui.settings.privacyPolicy')}
              icon={<Shield size={20} color={colors.text.secondary} />}
              onPress={handlePrivacy}
              testID="privacy-button"
              compact
              colors={colors}
              isDark={isDark}
            />
            <SettingsItem
              title={t('ui.settings.termsOfService')}
              icon={<FileText size={20} color={colors.text.secondary} />}
              onPress={handleTermsOfService}
              testID="terms-button"
              compact
              colors={colors}
              isDark={isDark}
            />

            {/* Footer */}
            <View style={styles.footerContainer}>
              <View style={[styles.footerSeparator, { backgroundColor: colors.text.muted }]} />

              <Text style={[styles.versionText, { color: colors.text.muted }]}>
                {t('app.name')} v{APP_CONFIG.app.version}
              </Text>

              <View style={styles.footerLinksContainer}>
                <TouchableOpacity
                  onPress={handleRestorePurchases}
                  style={styles.footerLink}
                  activeOpacity={0.7}
                >
                  <RotateCcw size={14} color={colors.text.muted} style={styles.footerLinkIcon} />
                  <Text style={[styles.footerLinkText, { color: colors.text.muted }]}>{t('ui.settings.restorePurchases')}</Text>
                </TouchableOpacity>

                <View style={[styles.footerLinkDivider, { backgroundColor: colors.text.muted }]} />

                <TouchableOpacity
                  onPress={handleMoreApps}
                  style={styles.footerLink}
                  activeOpacity={0.7}
                >
                  <Grid2X2 size={14} color={colors.text.muted} style={styles.footerLinkIcon} />
                  <Text style={[styles.footerLinkText, { color: colors.text.muted }]}>{t('ui.settings.moreApps')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        trigger="settings"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerBackButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsItem: {
    marginBottom: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  compactSettingsItem: {
    marginBottom: 8,
    borderRadius: 12,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  compactItemContent: {
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  compactIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactItemTitle: {
    fontSize: 15,
    marginBottom: 0,
  },
  itemSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  compactItemSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  rightElement: {
    marginLeft: 12,
  },
  footerContainer: {
    marginTop: 32,
    marginBottom: 24,
    alignItems: 'center',
  },
  footerSeparator: {
    width: 60,
    height: 1,
    marginBottom: 20,
    opacity: 0.2,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  footerLinksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  footerLinkIcon: {
    marginRight: 6,
    opacity: 0.8,
  },
  footerLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footerLinkDivider: {
    width: 1,
    height: 14,
    opacity: 0.3,
    marginHorizontal: 4,
  },
  // Dev cards
  devCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.accent.gold,
    overflow: 'hidden',
  },
  devCardContent: {
    padding: 18,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  devIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(201, 160, 85, 0.15)',
  },
  devTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  devModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  devModeInfo: {
    flex: 1,
    marginRight: 16,
  },
  devLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  devDescription: {
    fontSize: 12,
  },
  devAlert: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(201, 160, 85, 0.1)',
  },
  devAlertText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    color: Colors.accent.gold,
  },
});
