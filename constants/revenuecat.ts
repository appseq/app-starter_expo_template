/**
 * RevenueCat Configuration - Single Source of Truth
 * ================================================
 *
 * Keys are stored in config/config.json under services.revenueCat
 * This eliminates the need for environment variables in production builds.
 *
 * To change keys: Edit config/config.json → services.revenueCat.ios/android
 */

import { Platform } from 'react-native';
import { APP_CONFIG } from './appConfig';

// Extract test configuration flags
const ENABLE_VERBOSE_LOGS = APP_CONFIG.critical.services.revenueCat.ENABLE_VERBOSE_LOGS ?? false;

/**
 * Get the RevenueCat API key for the current platform
 * Keys come from config.json (single source of truth)
 * @returns The API key or null if not configured
 */
export const getRevenueCatApiKey = (): string | null => {
  const selectedKey = Platform.select({
    ios: APP_CONFIG.critical.services.revenueCat.ios,
    android: APP_CONFIG.critical.services.revenueCat.android,
    default: null,
  });

  // Validate key exists and is not a placeholder
  if (selectedKey && selectedKey.length > 0 && !selectedKey.includes('your_')) {
    if (ENABLE_VERBOSE_LOGS || __DEV__) {
      console.log('🔑 RevenueCat API Key Source: config.json');
      console.log(`🔑 Using key: ${selectedKey.substring(0, 10)}...`);
    }
    return selectedKey;
  }

  console.error('❌ No valid RevenueCat API key found!');
  console.error('Please configure your API key in config/config.json → services.revenueCat');
  return null;
};

/**
 * Check if RevenueCat is properly configured
 */
export const isRevenueCatConfigured = (): boolean => {
  return getRevenueCatApiKey() !== null;
};