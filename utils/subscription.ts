/**
 * Subscription Utilities
 * Defensive validation helpers for RevenueCat subscription state
 */

import { CustomerInfo, PurchasesEntitlementInfo } from 'react-native-purchases';

/**
 * Parse expiration date string to milliseconds timestamp
 * @param expirationDate - ISO date string or null/undefined
 * @returns Milliseconds timestamp or null if invalid/missing
 */
const parseExpirationMs = (expirationDate?: string | null): number | null => {
  if (!expirationDate) {
    return null;
  }
  const parsed = Date.parse(expirationDate);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Check if an entitlement is active by verifying both the isActive flag
 * and the expiration time. This provides an extra layer of validation
 * beyond RevenueCat's built-in isActive check.
 *
 * @param entitlement - The entitlement info from RevenueCat
 * @param now - Current timestamp in milliseconds (defaults to Date.now())
 * @returns true if entitlement is active and not expired
 */
export const isEntitlementActiveByTime = (
  entitlement?: PurchasesEntitlementInfo | null,
  now: number = Date.now()
): boolean => {
  // Guard: Check if entitlement exists and is marked active
  if (!entitlement?.isActive) {
    return false;
  }

  // Parse expiration date
  const expirationMs = parseExpirationMs(entitlement.expirationDate);

  // If no expiration date, assume lifetime (active indefinitely)
  if (expirationMs === null) {
    return true;
  }

  // Check if current time is before expiration
  return expirationMs > now;
};

/**
 * Get a list of currently active entitlement IDs from customer info.
 * Performs time-based validation on each entitlement.
 *
 * @param info - CustomerInfo from RevenueCat
 * @param options - Optional filtering options
 * @param options.allowList - Only check these entitlement IDs (defaults to all)
 * @param options.now - Current timestamp for expiration check
 * @returns Array of active entitlement IDs
 */
export const getActiveEntitlementIds = (
  info?: CustomerInfo | null,
  options?: {
    allowList?: string[];
    now?: number;
  }
): string[] => {
  // Guard: Check if customer info has entitlements
  if (!info?.entitlements?.all) {
    return [];
  }

  const now = options?.now ?? Date.now();
  const entitlements = info.entitlements.all;
  const ids = options?.allowList ?? Object.keys(entitlements);

  // Filter to only active entitlements
  return ids.filter((id) => isEntitlementActiveByTime(entitlements[id], now));
};
