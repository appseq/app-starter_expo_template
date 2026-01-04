import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Haptics } from "@/utils/haptics";
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePaywall } from '@/contexts/PaywallContext';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';

interface UpgradePromptProps {
  visible: boolean;
  onClose: () => void;
  trigger?: string;
}

export default function UpgradePrompt({ visible, onClose, trigger }: UpgradePromptProps) {
  const { t } = useTranslation();
  const { refreshSubscriptionStatus } = useSubscription();
  const { presentPaywallIfNeeded } = usePaywall();

  useEffect(() => {
    if (visible) {
      presentRevenueCatPaywall();
    }
  }, [visible]);

  const presentRevenueCatPaywall = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        t('ui.subscription.notAvailable'),
        t('ui.subscription.webNotSupported'),
        [{ text: t('ui.alerts.ok'), onPress: onClose }]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Use the refined paywall implementation
      const success = await presentPaywallIfNeeded({ entitlementId: 'pro', refined: true });

      if (!success) {
        // User cancelled or error occurred
        onClose();
      } else {
        // Success handled automatically by the refined paywall hook
        onClose();
      }
    } catch (error) {
      console.error('Error presenting paywall:', error);
      Alert.alert(
        t('ui.settings.alerts.error'),
        t('ui.subscription.errorMessage'),
        [{ text: t('ui.alerts.ok'), onPress: onClose }]
      );
    }
  };

  // Return null since RevenueCat will handle the UI
  return null;
}