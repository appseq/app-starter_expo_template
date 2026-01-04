import { APP_CONFIG } from './appConfig';

// RevenueCat Product IDs
export const PRODUCT_IDS = {
  MONTHLY: 'rockid_monthly_499',
  ANNUAL: 'rockid_annual_2999',
  LIFETIME: 'rockid_lifetime_9999',
} as const;

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

// Feature Limits - Single source of truth from config.json via APP_CONFIG
// Defensive fallbacks (3, 10) ensure app doesn't crash if config fails to load
export const FEATURE_LIMITS = {
  FREE_DAILY_SCANS: APP_CONFIG?.subscription?.freeDailyLimit ?? 3,
  FREE_DAILY_SCANS_TEST: APP_CONFIG?.subscription?.freeDailyLimitTestMode ?? 10,
  PREMIUM_DAILY_SCANS: -1, // Unlimited
} as const;

/**
 * Get the free daily scan limit based on test mode
 * @param isTestMode - Whether test mode is enabled
 * @returns Number of free scans allowed (3 in production, 10 in test mode)
 */
export const getFreeDailyScans = (isTestMode: boolean = false): number => {
  return isTestMode ? FEATURE_LIMITS.FREE_DAILY_SCANS_TEST : FEATURE_LIMITS.FREE_DAILY_SCANS;
};

// Paywall Triggers
export const PAYWALL_TRIGGERS = {
  LIMIT_REACHED: 'limit_reached',
  APP_LAUNCH: 'app_launch',
  SETTINGS: 'settings',
  FEATURE_LOCKED: 'feature_locked',
  MANUAL: 'manual',
} as const;

// Subscription Benefits (translation key map for UI layers)
export const SUBSCRIPTION_BENEFITS = [
  {
    icon: '♾️',
    titleKey: 'ui.subscription.benefits.unlimitedScans.title',
    descriptionKey: 'ui.subscription.benefits.unlimitedScans.description',
    freeValueKey: 'ui.subscription.benefits.unlimitedScans.free',
    premiumValueKey: 'ui.subscription.benefits.unlimitedScans.premium',
  },
  {
    icon: '⚡',
    titleKey: 'ui.subscription.benefits.fasterProcessing.title',
    descriptionKey: 'ui.subscription.benefits.fasterProcessing.description',
    freeValueKey: 'ui.subscription.benefits.fasterProcessing.free',
    premiumValueKey: 'ui.subscription.benefits.fasterProcessing.premium',
  },
  {
    icon: '📊',
    titleKey: 'ui.subscription.benefits.detailedAnalysis.title',
    descriptionKey: 'ui.subscription.benefits.detailedAnalysis.description',
    freeValueKey: 'ui.subscription.benefits.detailedAnalysis.free',
    premiumValueKey: 'ui.subscription.benefits.detailedAnalysis.premium',
  },
  {
    icon: '☁️',
    titleKey: 'ui.subscription.benefits.cloudBackup.title',
    descriptionKey: 'ui.subscription.benefits.cloudBackup.description',
    freeValueKey: 'ui.subscription.benefits.cloudBackup.free',
    premiumValueKey: 'ui.subscription.benefits.cloudBackup.premium',
  },
  {
    icon: '🎯',
    titleKey: 'ui.subscription.benefits.accuracyBoost.title',
    descriptionKey: 'ui.subscription.benefits.accuracyBoost.description',
    freeValueKey: 'ui.subscription.benefits.accuracyBoost.free',
    premiumValueKey: 'ui.subscription.benefits.accuracyBoost.premium',
  },
  {
    icon: '💬',
    titleKey: 'ui.subscription.benefits.prioritySupport.title',
    descriptionKey: 'ui.subscription.benefits.prioritySupport.description',
    freeValueKey: 'ui.subscription.benefits.prioritySupport.free',
    premiumValueKey: 'ui.subscription.benefits.prioritySupport.premium',
  },
] as const;

// Pricing Display (for UI)
export const PRICING = {
  MONTHLY: {
    id: PRODUCT_IDS.MONTHLY,
    displayName: 'Monthly',
    price: '$4.99',
    period: 'month',
    savings: null,
  },
  ANNUAL: {
    id: PRODUCT_IDS.ANNUAL,
    displayName: 'Annual',
    price: '$29.99',
    period: 'year',
    savings: 'Save 50%',
    popular: true,
  },
  LIFETIME: {
    id: PRODUCT_IDS.LIFETIME,
    displayName: 'Lifetime',
    price: '$99.99',
    period: 'once',
    savings: 'Best Value',
  },
};

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];
export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];
export type PaywallTrigger = typeof PAYWALL_TRIGGERS[keyof typeof PAYWALL_TRIGGERS];
