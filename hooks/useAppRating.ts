import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import createContextHook from '@nkzw/create-context-hook';
import { useTestMode } from './useTestMode';

// Storage keys
const RATING_STORAGE_KEYS = {
  IDENTIFICATION_COUNT: 'rating_identification_count',
  SESSION_COUNT: 'rating_session_count',
  LAST_PROMPT_DATE: 'rating_last_prompt_date',
  HAS_RATED: 'rating_has_rated',
  APP_VERSION: 'rating_app_version',
} as const;

// Production configuration following Apple's HIG guidelines
const PRODUCTION_CONFIG = {
  MIN_IDENTIFICATIONS: 3,
  MIN_SESSIONS: 3,
  DAYS_BETWEEN_PROMPTS: 90,
  PROMPT_ON_VERSION_UPDATE: true,
} as const;

// Test configuration for easier testing
const TEST_CONFIG = {
  MIN_IDENTIFICATIONS: 1,
  MIN_SESSIONS: 1,
  DAYS_BETWEEN_PROMPTS: 0, // No cooldown in test mode
  PROMPT_ON_VERSION_UPDATE: true,
} as const;

interface RatingData {
  identificationCount: number;
  sessionCount: number;
  lastPromptDate: string | null;
  hasRated: boolean;
  appVersion: string | null;
}

export const [AppRatingProvider, useAppRating] = createContextHook(() => {
  const { isTestMode } = useTestMode();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ratingData, setRatingData] = useState<RatingData>({
    identificationCount: 0,
    sessionCount: 0,
    lastPromptDate: null,
    hasRated: false,
    appVersion: null,
  });

  // Select config based on test mode
  const RATING_CONFIG = isTestMode ? TEST_CONFIG : PRODUCTION_CONFIG;

  useEffect(() => {
    initializeRatingData();
  }, []);

  /**
   * Initialize rating data from AsyncStorage
   */
  const initializeRatingData = async () => {
    try {
      const [
        identificationCount,
        sessionCount,
        lastPromptDate,
        hasRated,
        appVersion,
      ] = await Promise.all([
        AsyncStorage.getItem(RATING_STORAGE_KEYS.IDENTIFICATION_COUNT),
        AsyncStorage.getItem(RATING_STORAGE_KEYS.SESSION_COUNT),
        AsyncStorage.getItem(RATING_STORAGE_KEYS.LAST_PROMPT_DATE),
        AsyncStorage.getItem(RATING_STORAGE_KEYS.HAS_RATED),
        AsyncStorage.getItem(RATING_STORAGE_KEYS.APP_VERSION),
      ]);

      setRatingData({
        identificationCount: parseInt(identificationCount || '0', 10),
        sessionCount: parseInt(sessionCount || '0', 10),
        lastPromptDate,
        hasRated: hasRated === 'true',
        appVersion,
      });

      // Increment session count on app start
      await incrementSessionCount();
    } catch (error) {
      console.error('Error initializing rating data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Increment the session count
   */
  const incrementSessionCount = async () => {
    try {
      const newCount = ratingData.sessionCount + 1;
      await AsyncStorage.setItem(
        RATING_STORAGE_KEYS.SESSION_COUNT,
        newCount.toString()
      );
      setRatingData((prev) => ({ ...prev, sessionCount: newCount }));
    } catch (error) {
      console.error('Error incrementing session count:', error);
    }
  };

  /**
   * Increment identification count after a successful identification
   * Call this after each successful rock identification
   */
  const incrementIdentificationCount = useCallback(async () => {
    try {
      const newCount = ratingData.identificationCount + 1;
      await AsyncStorage.setItem(
        RATING_STORAGE_KEYS.IDENTIFICATION_COUNT,
        newCount.toString()
      );
      setRatingData((prev) => ({ ...prev, identificationCount: newCount }));
    } catch (error) {
      console.error('Error incrementing identification count:', error);
    }
  }, [ratingData.identificationCount]);

  /**
   * Check if we should show the rating prompt based on various conditions
   */
  const shouldShowRatingPrompt = useCallback(
    async (currentAppVersion: string): Promise<boolean> => {
      // Don't prompt if feature is not available
      const isAvailable = await StoreReview.isAvailableAsync();
      console.log('shouldShowRatingPrompt_1::isAvailable:' +  isAvailable);
      if (!isAvailable) {
        return false;
      }

      // Don't prompt if user has already rated this version
      if (
        ratingData.hasRated &&
        ratingData.appVersion === currentAppVersion &&
        !RATING_CONFIG.PROMPT_ON_VERSION_UPDATE
      ) {
        console.log('shouldShowRatingPrompt_2::hasRated:false');
        return false;
      }

      // Reset on major version update
      if (
        RATING_CONFIG.PROMPT_ON_VERSION_UPDATE &&
        ratingData.appVersion &&
        ratingData.appVersion !== currentAppVersion
      ) {
        const oldMajor = ratingData.appVersion.split('.')[0];
        const newMajor = currentAppVersion.split('.')[0];
        if (oldMajor !== newMajor) {
          await resetRatingData(currentAppVersion);

          console.log('shouldShowRatingPrompt_3::resetRatingData:false');
          return false; // Don't prompt immediately after version update
        }
      }

      // Check minimum thresholds
      if (ratingData.identificationCount < RATING_CONFIG.MIN_IDENTIFICATIONS) {
        console.log('shouldShowRatingPrompt_4::minimum thresholds:false');
        return false;
      }

      if (ratingData.sessionCount < RATING_CONFIG.MIN_SESSIONS) {
        console.log('shouldShowRatingPrompt_5::sessionCount:false');
        return false;
      }

      // Check time between prompts
      if (ratingData.lastPromptDate) {
        const lastPrompt = new Date(ratingData.lastPromptDate);
        const now = new Date();
        const daysSinceLastPrompt =
          (now.getTime() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceLastPrompt < RATING_CONFIG.DAYS_BETWEEN_PROMPTS) {
          console.log('shouldShowRatingPrompt_6::daysSinceLastPrompt:false');
          return false;
        }
      }

      return true;
    },
    [ratingData]
  );

  /**
   * Request the app store rating prompt
   * This will show the native iOS rating dialog
   */
  const requestRating = useCallback(
    async (currentAppVersion: string): Promise<boolean> => {
      try {
        const shouldShow = await shouldShowRatingPrompt(currentAppVersion);

        if (!shouldShow) {
          console.log('Rating prompt conditions not met');
          return false;
        }

        // Show the rating prompt
        await StoreReview.requestReview();

        // Update last prompt date
        const now = new Date().toISOString();
        await AsyncStorage.setItem(RATING_STORAGE_KEYS.LAST_PROMPT_DATE, now);
        await AsyncStorage.setItem(
          RATING_STORAGE_KEYS.APP_VERSION,
          currentAppVersion
        );

        setRatingData((prev) => ({
          ...prev,
          lastPromptDate: now,
          appVersion: currentAppVersion,
        }));

        console.log('Rating prompt shown');
        return true;
      } catch (error) {
        console.error('Error requesting rating:', error);
        return false;
      }
    },
    [shouldShowRatingPrompt]
  );

  /**
   * Mark that the user has rated the app
   * (Optional: call this if you track rating completion)
   */
  const markAsRated = async () => {
    try {
      await AsyncStorage.setItem(RATING_STORAGE_KEYS.HAS_RATED, 'true');
      setRatingData((prev) => ({ ...prev, hasRated: true }));
    } catch (error) {
      console.error('Error marking as rated:', error);
    }
  };

  /**
   * Reset rating data (useful for version updates or testing)
   */
  const resetRatingData = async (currentAppVersion?: string) => {
    try {
      await AsyncStorage.multiRemove([
        RATING_STORAGE_KEYS.IDENTIFICATION_COUNT,
        RATING_STORAGE_KEYS.SESSION_COUNT,
        RATING_STORAGE_KEYS.LAST_PROMPT_DATE,
        RATING_STORAGE_KEYS.HAS_RATED,
      ]);

      if (currentAppVersion) {
        await AsyncStorage.setItem(
          RATING_STORAGE_KEYS.APP_VERSION,
          currentAppVersion
        );
      }

      setRatingData({
        identificationCount: 0,
        sessionCount: 0,
        lastPromptDate: null,
        hasRated: false,
        appVersion: currentAppVersion || null,
      });
    } catch (error) {
      console.error('Error resetting rating data:', error);
    }
  };

  /**
   * Check if store review is available on this device
   */
  const isRatingAvailable = useCallback(async (): Promise<boolean> => {
    return await StoreReview.isAvailableAsync();
  }, []);

  return {
    isLoading,
    ratingData,
    incrementIdentificationCount,
    requestRating,
    shouldShowRatingPrompt,
    markAsRated,
    resetRatingData,
    isRatingAvailable,
  };
});
