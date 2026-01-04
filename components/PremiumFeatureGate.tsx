import React from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { usePaywall } from '@/contexts/PaywallContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Haptics } from '@/utils/haptics';
import { Platform } from 'react-native';

interface PremiumFeatureGateProps {
  children: React.ReactNode;
  entitlementId: string;
  featureName?: string;
  onUnlocked?: () => void;
  disabled?: boolean;
}

/**
 * Component that wraps premium features and automatically presents
 * the RevenueCat paywall if the user doesn't have the required entitlement
 */
export default function PremiumFeatureGate({ 
  children, 
  entitlementId,
  featureName = 'this feature',
  onUnlocked,
  disabled = false
}: PremiumFeatureGateProps) {
  const { isSubscribed } = useSubscription();
  const { presentPaywallIfNeeded, isPresenting } = usePaywall();

  const handlePress = async () => {
    if (disabled || isPresenting) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Check if user has access
    if (!isSubscribed) {
      // Present paywall if user doesn't have the entitlement
      const success = await presentPaywallIfNeeded({ entitlementId, refined: true });
      
      if (success && onUnlocked) {
        // User now has access, trigger the callback
        onUnlocked();
      }
    } else {
      // User already has access, trigger the callback
      if (onUnlocked) {
        onUnlocked();
      }
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      disabled={disabled || isPresenting}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
}

/**
 * Hook version for programmatic usage
 */
export function usePremiumFeatureGate() {
  const { isSubscribed } = useSubscription();
  const { presentPaywallIfNeeded, isPresenting } = usePaywall();

  const checkAndRequestAccess = async (
    entitlementId: string,
    featureName: string = 'this feature'
  ): Promise<boolean> => {
    if (isSubscribed) {
      return true;
    }

    // User doesn't have access, present paywall
    const success = await presentPaywallIfNeeded({ entitlementId, refined: true });
    return success;
  };

  return {
    checkAndRequestAccess,
    isSubscribed,
    isCheckingAccess: isPresenting
  };
}