/**
 * useFreemiumLimits Hook
 * Centralized management of freemium tier restrictions
 *
 * Provides a clean API for checking limits and requesting upgrades.
 * Wraps the subscription context for simplified limit enforcement.
 */

import { useCallback } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePaywall } from '@/contexts/PaywallContext';
import { FEATURE_LIMITS } from '@/constants/subscription';

interface FreemiumLimits {
  // Scan limits
  canScan: boolean;
  scansRemaining: number;
  maxDailyScans: number;
  scanCount: number;

  // Actions
  requestUpgrade: () => Promise<boolean>;
  incrementUsage: () => Promise<void>;

  // Status
  isSubscribed: boolean;
  isLoading: boolean;
}

/**
 * Hook for managing freemium tier restrictions.
 * Centralizes all scan limit logic and provides upgrade functionality.
 *
 * @returns FreemiumLimits object with limit info and actions
 *
 * @example
 * ```tsx
 * const { canScan, scansRemaining, requestUpgrade } = useFreemiumLimits();
 *
 * const handleScan = async () => {
 *   if (!canScan) {
 *     const upgraded = await requestUpgrade();
 *     if (!upgraded) return;
 *   }
 *   // Proceed with scan
 * };
 * ```
 */
export function useFreemiumLimits(): FreemiumLimits {
  const {
    isSubscribed,
    isLoading,
    canScan,
    dailyScans,
    incrementScanCount,
  } = useSubscription();

  const { presentPaywallIfNeeded } = usePaywall();

  // Calculate derived values
  const scansRemaining = dailyScans?.remaining ?? 0;
  const scanCount = dailyScans?.count ?? 0;
  const maxDailyScans = isSubscribed
    ? -1 // Unlimited
    : FEATURE_LIMITS.FREE_DAILY_SCANS;

  /**
   * Request upgrade via paywall
   * @returns true if user upgraded, false if cancelled/failed
   */
  const requestUpgrade = useCallback(async (): Promise<boolean> => {
    return presentPaywallIfNeeded({
      entitlementId: 'pro',
      refined: true,
    });
  }, [presentPaywallIfNeeded]);

  /**
   * Increment usage count (call after successful scan)
   */
  const incrementUsage = useCallback(async (): Promise<void> => {
    await incrementScanCount();
  }, [incrementScanCount]);

  return {
    // Scan limits
    canScan,
    scansRemaining,
    maxDailyScans,
    scanCount,

    // Actions
    requestUpgrade,
    incrementUsage,

    // Status
    isSubscribed,
    isLoading,
  };
}
