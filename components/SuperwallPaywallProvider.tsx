import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Platform, Alert } from 'react-native';
// Using Expo Superwall SDK compat layer for backward compatibility
import Superwall, {
  PurchaseController,
  SubscriptionStatus,
  PurchaseResultPurchased,
  PurchaseResultCancelled,
  PurchaseResultFailed,
  RestorationResult,
  PaywallPresentationHandler,
  PurchaseResult
} from 'expo-superwall/compat';
import Purchases, { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PaywallContext, PaywallState } from '@/contexts/PaywallContext';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { APP_CONFIG } from '@/constants/appConfig';

interface SuperwallPaywallProviderProps {
  children: React.ReactNode;
}

// Purchase controller that uses RevenueCat
class RevenueCatPurchaseController extends PurchaseController {
  async purchaseFromAppStore(productId: string): Promise<PurchaseResult> {
    return this.purchaseProduct(productId);
  }

  async purchaseFromGooglePlay(productId: string, basePlanId?: string, offerId?: string): Promise<PurchaseResult> {
    return this.purchaseProduct(productId);
  }

  private async purchaseProduct(productId: string): Promise<PurchaseResult> {
    try {
      console.log('Superwall purchase initiated for:', productId);

      // Get RevenueCat offerings
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) {
        throw new Error('No offerings available');
      }

      // Find the package matching the product identifier
      const packageToPurchase = offerings.current.availablePackages.find(
        pkg => pkg.product.identifier === productId
      );

      if (!packageToPurchase) {
        throw new Error('Product not found in RevenueCat offerings');
      }

      // Make the purchase through RevenueCat
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

      console.log('Purchase successful via RevenueCat');

      return new PurchaseResultPurchased();
    } catch (error: any) {
      console.error('Purchase error:', error);

      if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        console.log('Purchase cancelled by user');
        return new PurchaseResultCancelled();
      }

      return new PurchaseResultFailed(error.message || 'Purchase failed');
    }
  }

  async restorePurchases(): Promise<RestorationResult> {
    try {
      console.log('Superwall restore initiated');

      // Restore purchases through RevenueCat
      const customerInfo = await Purchases.restorePurchases();

      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;

      console.log('Restore successful:', hasActiveSubscription);

      if (hasActiveSubscription) {
        return RestorationResult.restored();
      } else {
        return RestorationResult.failed();
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      return RestorationResult.failed(error);
    }
  }
}

// Paywall context provider - accepts isConfigured to avoid tree swap
interface SuperwallPaywallContextProps {
  children: React.ReactNode;
  isConfigured: boolean;
}

function SuperwallPaywallContextInternal({ children, isConfigured }: SuperwallPaywallContextProps) {
  const { refreshSubscriptionStatus, isSubscribed } = useSubscription();
  const [isPresenting, setIsPresenting] = useState(false);
  const [paywallState, setPaywallState] = useState<PaywallState>({
    isVisible: false,
    refined: false
  });

  // Ref to store the Promise resolver for the paywall result
  const paywallResolverRef = useRef<((value: boolean) => void) | null>(null);

  const presentPaywall = useCallback(async (options?: {
    refined?: boolean;
    offering?: any;
    placement?: string;
  }): Promise<boolean> => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available',
        'Subscriptions are not available on web. Please use the mobile app.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // Don't present paywall if Superwall is not configured yet
    if (!isConfigured) {
      console.log('Superwall not configured yet, paywall presentation skipped');
      return false;
    }

    // Check if Superwall API key is available
    const apiKey = Platform.OS === 'ios'
      ? APP_CONFIG.critical.services.superwall.ios
      : APP_CONFIG.critical.services.superwall.android;

    if (!apiKey) {
      Alert.alert(
        'Configuration Required',
        'Superwall is not configured. Please add API keys to appConfig.ts',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (isPresenting) {
      return false;
    }

    try {
      setIsPresenting(true);
      setPaywallState({ isVisible: true, offering: options?.offering, refined: options?.refined || false });

      // Get placement name from options or use default
      const placementName = options?.placement || APP_CONFIG.critical.services.superwall.placements.main;

      // Create a promise that will resolve when the paywall is dismissed
      return new Promise<boolean>((resolve) => {
        paywallResolverRef.current = resolve;

        // Create handler
        const handler = new PaywallPresentationHandler();
        handler.onPresent((info) => {
          console.log('Paywall presented:', info);
        });
        handler.onDismiss(async (info, result) => {
          console.log('Paywall dismissed:', info, result);
          setPaywallState({ isVisible: false, refined: false });
          setIsPresenting(false);

          // Check if user purchased by refreshing subscription status
          try {
            await refreshSubscriptionStatus();

            // Check subscription status to determine if purchase was successful
            const customerInfo = await Purchases.getCustomerInfo();
            const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;

            if (paywallResolverRef.current) {
              paywallResolverRef.current(hasActiveSubscription);
              paywallResolverRef.current = null;
            }
          } catch (error) {
            console.error('Error checking subscription status:', error);
            // Default to false if we can't verify subscription
            if (paywallResolverRef.current) {
              paywallResolverRef.current(false);
              paywallResolverRef.current = null;
            }
          }
        });
        handler.onError((error) => {
          console.error('Paywall error:', error);
          setPaywallState({ isVisible: false, refined: false });
          setIsPresenting(false);

          if (paywallResolverRef.current) {
            paywallResolverRef.current(false);
            paywallResolverRef.current = null;
          }
        });
        handler.onSkip((reason) => {
          console.log('Paywall skipped:', reason);
          setPaywallState({ isVisible: false, refined: false });
          setIsPresenting(false);

          if (paywallResolverRef.current) {
            paywallResolverRef.current(false);
            paywallResolverRef.current = null;
          }
        });

        // Register a paywall placement and present it
        console.log('🎨 Presenting Superwall placement:', placementName);
        Superwall.shared.register({
          placement: placementName,
          handler
        }).catch((error) => {
          console.error('Error registering Superwall placement:', error);
          setPaywallState({ isVisible: false, refined: false });
          setIsPresenting(false);

          if (paywallResolverRef.current) {
            paywallResolverRef.current(false);
            paywallResolverRef.current = null;
          }
        });
      });
    } catch (error) {
      console.error('Error presenting Superwall paywall:', error);
      setPaywallState({ isVisible: false, refined: false });
      setIsPresenting(false);

      Alert.alert(
        'Error',
        'Unable to show upgrade options. Please try again later.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }, [isConfigured, isPresenting, refreshSubscriptionStatus]);

  const presentPaywallIfNeeded = useCallback(async (options: {
    entitlementId: string;
    refined?: boolean;
    offering?: any;
    placement?: string;
  }): Promise<boolean> => {
    if (isSubscribed) {
      return true;
    }

    return presentPaywall(options);
  }, [isSubscribed, presentPaywall]);

  const dismissPaywall = useCallback((result: PAYWALL_RESULT) => {
    setPaywallState({ isVisible: false, refined: false });
    setIsPresenting(false);

    Superwall.shared.dismiss().catch((error) => {
      console.error('Error dismissing paywall:', error);
    });

    // Handle result
    if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
      refreshSubscriptionStatus();
    }
  }, [refreshSubscriptionStatus]);

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
    </PaywallContext.Provider>
  );
}

export function SuperwallPaywallProvider({ children }: SuperwallPaywallProviderProps) {
  const { refreshSubscriptionStatus } = useSubscription();
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const configureSuperwall = async () => {
      // Get Superwall API key from config
      const apiKey = Platform.OS === 'ios'
        ? APP_CONFIG.critical.services.superwall.ios
        : APP_CONFIG.critical.services.superwall.android;

      // Check if Superwall is configured
      if (!apiKey) {
        console.warn('⚠️ Superwall API keys not configured.');
        console.warn('Please add Superwall API keys to constants/appConfig.ts');
        setIsConfigured(true); // Mark as "configured" to show fallback UI
        return;
      }

      try {
        // Create purchase controller
        const purchaseController = new RevenueCatPurchaseController();

        // Configure Superwall
        await Superwall.configure({
          apiKey,
          purchaseController
        });

        console.log('✅ Superwall configured successfully');

        // Sync initial subscription status
        const customerInfo = await Purchases.getCustomerInfo();
        const entitlementIds = Object.keys(customerInfo.entitlements.active);
        const hasActiveSubscription = entitlementIds.length > 0;

        const subscriptionStatus = hasActiveSubscription
          ? SubscriptionStatus.Active(entitlementIds)
          : SubscriptionStatus.Inactive();

        await Superwall.shared.setSubscriptionStatus(subscriptionStatus);

        // Listen for RevenueCat subscription changes
        Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
          const entitlementIds = Object.keys(customerInfo.entitlements.active);
          const hasActiveSubscription = entitlementIds.length > 0;

          const subscriptionStatus = hasActiveSubscription
            ? SubscriptionStatus.Active(entitlementIds)
            : SubscriptionStatus.Inactive();

          await Superwall.shared.setSubscriptionStatus(subscriptionStatus);
        });

        setIsConfigured(true);
      } catch (error) {
        console.error('❌ Failed to configure Superwall:', error);
        setIsConfigured(true); // Mark as configured to show fallback
      }
    };

    configureSuperwall();
  }, []);

  // Always render the same component to prevent subtree remount
  // The isConfigured prop controls behavior internally, not the component tree
  return (
    <SuperwallPaywallContextInternal isConfigured={isConfigured}>
      {children}
    </SuperwallPaywallContextInternal>
  );
}
