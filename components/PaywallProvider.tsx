
import React, { useState, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PaywallContext, PaywallState } from '@/contexts/PaywallContext';
import { RevenueCatPaywallWrapper } from './RevenueCatPaywallWrapper';
import { SuperwallPaywallProvider } from './SuperwallPaywallProvider';
import { APP_CONFIG } from '@/constants/appConfig';

interface PaywallProviderProps {
  children: React.ReactNode;
}

// RevenueCat implementation (original)
function RevenueCatPaywallProvider({ children }: PaywallProviderProps) {
  const [isPresenting, setIsPresenting] = useState(false);
  const [paywallState, setPaywallState] = useState<PaywallState>({ isVisible: false, refined: false });
  const { refreshSubscriptionStatus, isSubscribed } = useSubscription();

  // Ref to store the Promise resolver for the refined paywall
  const paywallResolverRef = useRef<((value: boolean) => void) | null>(null);

  const handlePaywallResult = useCallback(async (result: PAYWALL_RESULT) => {
    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        await refreshSubscriptionStatus();
        Alert.alert(
          'Welcome to Premium!',
          'You now have unlimited access to all features.',
          [{ text: 'Awesome!' }]
        );
        break;
      case PAYWALL_RESULT.RESTORED:
        await refreshSubscriptionStatus();
        Alert.alert(
          'Subscription Restored!',
          'Your premium access has been restored.',
          [{ text: 'Great!' }]
        );
        break;
      case PAYWALL_RESULT.ERROR:
        Alert.alert(
          'Error',
          'Unable to complete the purchase. Please try again.',
          [{ text: 'OK' }]
        );
        break;
    }
  }, [refreshSubscriptionStatus]);

  const dismissPaywall = useCallback((result: PAYWALL_RESULT) => {
    setPaywallState({ isVisible: false, refined: false });
    setIsPresenting(false);

    // Resolve the pending promise with the result
    if (paywallResolverRef.current) {
      const success = result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
      paywallResolverRef.current(success);
      paywallResolverRef.current = null;
    }

    handlePaywallResult(result);
  }, [handlePaywallResult]);

  const presentRefinedPaywall = useCallback(async (offering?: any, placement?: string): Promise<boolean> => {
    if (isPresenting) {
      return false;
    }
    setIsPresenting(true);
    setPaywallState({
      isVisible: true,
      offering,
      refined: true,
    });

    // Return a promise that resolves when the paywall is dismissed
    return new Promise<boolean>((resolve) => {
      paywallResolverRef.current = resolve;
    });
  }, [isPresenting]);

  const presentStandardPaywall = useCallback(async (offering?: any, placement?: string): Promise<boolean> => {
    if (isPresenting) return false;

    setIsPresenting(true);
    try {
      // Add safety check for RevenueCat initialization
      if (Platform.OS !== 'web') {
        try {
          // Test if RevenueCat is configured by trying to get customer info
          const testInfo = await Purchases.getCustomerInfo();
        } catch (testError) {
          console.error('RevenueCat not properly initialized:', testError);
          Alert.alert(
            'Service Unavailable',
            'The subscription service is temporarily unavailable. Please try again later.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }

      const result = offering
        ? await RevenueCatUI.presentPaywall({ offering })
        : await RevenueCatUI.presentPaywall();

      handlePaywallResult(result);
      return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
    } catch (error: any) {
      console.error('Error presenting paywall:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unable to show upgrade options. Please try again later.';
      if (error.message?.includes('not configured') || error.message?.includes('not initialized')) {
        errorMessage = 'The subscription service is not properly configured. Please restart the app and try again.';
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        errorMessage = 'Please check your internet connection and try again.';
      }
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      return false;
    } finally {
      setIsPresenting(false);
    }
  }, [isPresenting, handlePaywallResult]);

  const presentPaywall = useCallback(async (options?: {
    refined?: boolean;
    offering?: any;
    placement?: string;  // Ignored by RevenueCat, used by Superwall
  }): Promise<boolean> => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available',
        'Subscriptions are not available on web. Please use the mobile app.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (options?.refined) {
      return presentRefinedPaywall(options?.offering, options?.placement);
    } else {
      return presentStandardPaywall(options?.offering, options?.placement);
    }
  }, [presentRefinedPaywall, presentStandardPaywall]);

  const presentPaywallIfNeeded = useCallback(async (options: {
    entitlementId: string;
    refined?: boolean;
    offering?: any;
    placement?: string;  // Ignored by RevenueCat, used by Superwall
  }): Promise<boolean> => {
    if (isSubscribed) {
      return true;
    }

    return presentPaywall(options);
  }, [isSubscribed, presentPaywall]);

  const value = {
    presentPaywall,
    presentPaywallIfNeeded,
    dismissPaywall,
    paywallState,
    isPresenting,
  };

  return (
    <PaywallContext.Provider value={value}>
      {children}
      <RevenueCatPaywallWrapper
        visible={paywallState.isVisible && paywallState.refined}
        offering={paywallState.offering}
        onDismiss={dismissPaywall}
      />
    </PaywallContext.Provider>
  );
}

// Main PaywallProvider that routes to the correct implementation
export function PaywallProvider({ children }: PaywallProviderProps) {
  const paywallProvider = APP_CONFIG.subscription.paywallProvider;

  console.log('🎬 PaywallProvider initialized with provider:', paywallProvider);

  // Route to the correct provider based on config
  if (paywallProvider === 'superwall') {
    console.log('✅ Using Superwall paywall provider');
    return <SuperwallPaywallProvider>{children}</SuperwallPaywallProvider>;
  }

  // Default to RevenueCat
  console.log('✅ Using RevenueCat paywall provider');
  return <RevenueCatPaywallProvider>{children}</RevenueCatPaywallProvider>;
}
