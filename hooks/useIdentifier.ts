import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { AnalysisState, ObjectIdentification } from '@/types';
import { Haptics } from "@/utils/haptics";
import { aiProxyService } from '@/services/aiproxy';
import { imageService } from '@/services/imageService';
import { DemoDataService } from '@/services/demoDataService';
import { APP_CONFIG } from '@/constants/appConfig';
import { useAppRating } from './useAppRating';

// Storage keys
const STORAGE_KEYS = {
  SAVED_ITEMS: 'savedItems',
  DAILY_SCANS: 'dailyScans',
  LAST_SCAN_DATE: 'lastScanDate',
};

export const [IdentifierProvider, useIdentifier] = createContextHook(() => {
  const { incrementIdentificationCount, requestRating } = useAppRating();

  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    imageUri: null,
    result: null,
    error: null,
  });

  const setSavedItems = async (items: ObjectIdentification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const getSavedItems = useCallback(async (): Promise<ObjectIdentification[]> => {
    try {
      const savedItems = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
      return savedItems ? JSON.parse(savedItems) : [];
    } catch (error) {
      console.error('Error getting saved items:', error);
      return [];
    }
  }, []);

  const analyzeItem = useCallback(async (imageUri: string) => {
    try {
      // Update state to analyzing
      setState({
        status: 'analyzing',
        imageUri,
        result: null,
        error: null,
      });

      // Check if we're in demo mode
      const isDemoMode = await DemoDataService.isDemoMode();
      
      if (isDemoMode) {
        console.log(`🎬 Using Demo Mode for ${APP_CONFIG.ai.objectType} analysis`);
        // Simulate processing time for realistic feel
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get a random demo item with the captured image
        const demoResult = DemoDataService.getRandomDemoItem(imageUri);

        setState({
          status: 'complete',
          imageUri,
          result: demoResult,
          error: null,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Track successful identification and potentially show rating prompt
        await incrementIdentificationCount();

        // Request rating after a delay to not interrupt the user experience
        setTimeout(async () => {
          await requestRating(APP_CONFIG.app.version);
        }, 2000); // 2 second delay

        return demoResult;
      }

      // Check if AIProxy is configured
      if (!aiProxyService.isConfigured()) {
        console.warn('AIProxy not configured, using fallback demo mode');
        // Fallback demo mode for development
        await new Promise(resolve => setTimeout(resolve, 2000));
        const demoResult: ObjectIdentification = {
          name: 'Demo Mode - Configure AIProxy',
          confidence: 75,
          composition: ['Demo Composition 1', 'Demo Composition 2'],
          formation: 'This is demo data. Add your AIProxy key to .env',
          locations: ['Demo Location 1', 'Demo Location 2'],
          uses: ['Demo Use 1', 'Demo Use 2'],
          funFact: `Configure AIProxy in .env to enable real ${APP_CONFIG.ai.objectType} identification!`,
          imageUri,
        };
        
        setState({
          status: 'complete',
          imageUri,
          result: demoResult,
          error: null,
        });
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return demoResult;
      }

      // Validate image
      const validation = await imageService.validateImage(imageUri);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image');
      }

      // Optimize image for upload - aggressive compression to avoid size limits
      const { base64, sizeKB } = await imageService.optimizeForUpload(imageUri, {
        maxWidth: 1024,   // Balanced size for good detail
        maxHeight: 1024,  // Balanced size for good detail
        quality: 0.6,     // Lower quality to ensure smaller file size
      });

      console.log(`Optimized image size: ${sizeKB}KB`);

      // Call AIProxy API
      const response = await aiProxyService.identify(base64);

      // Create thumbnail for storage
      const thumbnailUri = await imageService.createThumbnail(imageUri);

      // Prepare result with thumbnail
      const result: ObjectIdentification = {
        ...response,
        imageUri: thumbnailUri,
      };

      // Provide haptic feedback when analysis is complete
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setState({
        status: 'complete',
        imageUri,
        result,
        error: null,
      });

      // Track successful identification and potentially show rating prompt
      await incrementIdentificationCount();

      // Request rating after a delay to not interrupt the user experience
      setTimeout(async () => {
        await requestRating(APP_CONFIG.app.version);
      }, 2000); // 2 second delay

      return result;
    } catch (error: any) {
      console.error(`${APP_CONFIG.ai.objectType} analysis error:`, error);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMessage = error.message || `Failed to analyze ${APP_CONFIG.ai.objectType}. Please try again.`;
      
      setState({
        status: 'error',
        imageUri,
        result: null,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  }, []);

  const saveItem = useCallback(async (item: ObjectIdentification) => {
    try {
      const savedItems = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
      const existingItems = savedItems ? JSON.parse(savedItems) : [];
      
      // Check if item is already saved (by imageUri)
      const alreadySaved = existingItems.some((i: ObjectIdentification) => i.imageUri === item.imageUri);
      if (alreadySaved) {
        console.log('Item already saved');
        return true;
      }
      
      const updatedItems = [...existingItems, item];
      await setSavedItems(updatedItems);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } catch (error) {
      console.error('Error saving item:', error);
      return false;
    }
  }, []);

  const deleteItem = useCallback(async (imageUri: string) => {
    try {
      const savedItems = await getSavedItems();
      const updatedItems = savedItems.filter(item => item.imageUri !== imageUri);
      await setSavedItems(updatedItems);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  }, [getSavedItems]);

  const clearAllItems = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_ITEMS);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } catch (error) {
      console.error('Error clearing items:', error);
      return false;
    }
  }, []);

  const resetState = useCallback(() => {
    setState({
      status: 'idle',
      imageUri: null,
      result: null,
      error: null,
    });
  }, []);

  return {
    state,
    analyzeItem,
    saveItem,
    deleteItem,
    getSavedItems,
    clearAllItems,
    resetState,
  };
});

export default useIdentifier;