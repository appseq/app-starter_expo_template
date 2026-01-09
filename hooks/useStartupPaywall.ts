/**
 * useStartupPaywall Hook
 * Presents the paywall at app startup for non-subscribed users
 *
 * This hook waits for all startup processes to complete before presenting:
 * - Subscription status must be loaded
 * - Main app content must be mounted (call after onboarding)
 *
 * The paywall is only shown once per app session to avoid annoying users.
 */

import { useEffect, useRef } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePaywall } from '@/contexts/PaywallContext';
import { APP_CONFIG } from '@/constants/appConfig';

/**
 * Presents a paywall at startup for non-subscribed users.
 * Should be called in the main app layout after onboarding is complete.
 *
 * Features:
 * - Shows once per session (uses ref guard)
 * - Waits for subscription status to load
 * - 500ms delay for smooth UX
 * - Uses configurable placement from APP_CONFIG
 *
 * @example
 * ```tsx
 * function MainApp() {
 *   useStartupPaywall();
 *   return <YourAppContent />;
 * }
 * ```
 */
export function useStartupPaywall(): void {
  const { isSubscribed, isLoading: isSubscriptionLoading } = useSubscription();
  const { presentPaywall, isPresenting } = usePaywall();

  // Track if we've already attempted to show the startup paywall this session
  const hasAttemptedPaywall = useRef(false);

  useEffect(() => {
    // Guard: Only attempt once per session
    if (hasAttemptedPaywall.current) {
      return;
    }

    // Guard: Wait for subscription status to be loaded
    if (isSubscriptionLoading) {
      return;
    }

    // Guard: Don't show paywall if user is already subscribed
    if (isSubscribed) {
      hasAttemptedPaywall.current = true;
      return;
    }

    // Guard: Don't show if another paywall is already presenting
    if (isPresenting) {
      return;
    }

    // Mark as attempted before showing to prevent duplicate calls
    hasAttemptedPaywall.current = true;

    // Small delay to ensure UI has settled after startup
    // This prevents jarring UX and allows the main screen to render first
    const timeoutId = setTimeout(() => {
      // Get placement from config, with fallback
      const placement =
        APP_CONFIG?.critical?.services?.superwall?.placements?.onboarding ??
        APP_CONFIG?.critical?.services?.superwall?.placements?.main ??
        'app_launch';

      presentPaywall({ placement }).catch((error) => {
        // Silently handle errors - startup paywall is non-critical
        console.warn('Startup paywall presentation failed:', error);
      });
    }, 500);

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isSubscriptionLoading, isSubscribed, isPresenting, presentPaywall]);
}
