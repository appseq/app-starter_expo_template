import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const TEST_MODE_KEY = 'app_test_mode_enabled';

/**
 * Test Mode Hook
 *
 * Provides a safe testing flag that:
 * - Can be toggled in development for testing
 * - ALWAYS returns false in production builds (safety guarantee)
 * - Persists across app sessions in development
 * - Used for: reduced rating thresholds, increased free scans, etc.
 *
 * IMPORTANT: Even if manually set to true in dev, this will ALWAYS be false
 * in production builds, preventing accidental test data in releases.
 */
export const [TestModeProvider, useTestMode] = createContextHook(() => {
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTestMode();
  }, []);

  /**
   * Load test mode setting from AsyncStorage
   * ALWAYS returns false if not in development mode
   */
  const loadTestMode = async () => {
    try {
      // Production safety: ALWAYS false in production builds
      if (!__DEV__) {
        setIsTestMode(false);
        setIsLoading(false);
        return;
      }

      // In development, load the stored preference
      const stored = await AsyncStorage.getItem(TEST_MODE_KEY);
      const enabled = stored === 'true';
      setIsTestMode(enabled);

      if (enabled) {
        console.log('🧪 TEST MODE ENABLED - Using test configurations');
      }
    } catch (error) {
      console.error('Error loading test mode:', error);
      setIsTestMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Enable test mode
   * Only works in development builds
   */
  const enableTestMode = useCallback(async () => {
    // Production safety: Cannot enable in production
    if (!__DEV__) {
      console.warn('Test mode cannot be enabled in production builds');
      return false;
    }

    try {
      await AsyncStorage.setItem(TEST_MODE_KEY, 'true');
      setIsTestMode(true);
      console.log('🧪 TEST MODE ENABLED');
      return true;
    } catch (error) {
      console.error('Error enabling test mode:', error);
      return false;
    }
  }, []);

  /**
   * Disable test mode
   */
  const disableTestMode = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(TEST_MODE_KEY);
      setIsTestMode(false);
      console.log('✅ TEST MODE DISABLED');
      return true;
    } catch (error) {
      console.error('Error disabling test mode:', error);
      return false;
    }
  }, []);

  /**
   * Toggle test mode on/off
   */
  const toggleTestMode = useCallback(async () => {
    if (isTestMode) {
      return await disableTestMode();
    } else {
      return await enableTestMode();
    }
  }, [isTestMode, enableTestMode, disableTestMode]);

  /**
   * Get test-aware configuration values
   * Use this to easily get different values for test vs production
   */
  const getTestValue = useCallback(<T,>(testValue: T, productionValue: T): T => {
    return isTestMode ? testValue : productionValue;
  }, [isTestMode]);

  return {
    /**
     * Whether test mode is currently enabled
     * ALWAYS false in production builds
     */
    isTestMode,

    /**
     * Whether we're still loading the test mode preference
     */
    isLoading,

    /**
     * Enable test mode (development only)
     */
    enableTestMode,

    /**
     * Disable test mode
     */
    disableTestMode,

    /**
     * Toggle test mode on/off
     */
    toggleTestMode,

    /**
     * Helper to get test vs production values
     * Example: getTestValue(1, 3) returns 1 in test mode, 3 in production
     */
    getTestValue,

    /**
     * Whether we're in a development build
     * Useful for showing/hiding dev-only UI
     */
    isDevelopmentBuild: __DEV__,
  };
});

export default useTestMode;
