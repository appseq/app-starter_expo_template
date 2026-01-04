import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { 
  PurchasesOffering,
  CustomerInfo,
  PurchasesPackage,
  PurchasesStoreProduct,
  LOG_LEVEL
} from 'react-native-purchases';
import {
  PRODUCT_IDS,
  SUBSCRIPTION_TIERS,
  FEATURE_LIMITS,
  getFreeDailyScans,
  SubscriptionTier,
  ProductId
} from '@/constants/subscription';
import { getRevenueCatApiKey } from '@/constants/revenuecat';
import { useTestMode } from '@/hooks/useTestMode';

interface DailyScanInfo {
  count: number;
  date: string;
  remaining: number;
}

interface SubscriptionContextType {
  // State
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  isLoading: boolean;
  
  // Scan limits
  dailyScans: DailyScanInfo;
  canScan: boolean;
  incrementScanCount: () => Promise<void>;
  resetDailyScans: () => Promise<void>;
  
  // Purchase actions
  purchaseSubscription: (productId: ProductId) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  
  // Utilities
  refreshSubscriptionStatus: () => Promise<void>;
  getProducts: () => Promise<PurchasesStoreProduct[]>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DAILY_SCANS: 'daily_scans_v2',
  SUBSCRIPTION_STATUS: 'subscription_status_cache',
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isTestMode } = useTestMode();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(SUBSCRIPTION_TIERS.FREE);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyScans, setDailyScans] = useState<DailyScanInfo>({
    count: 0,
    date: new Date().toDateString(),
    remaining: getFreeDailyScans(isTestMode),
  });

  // Initialize RevenueCat
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // Load daily scan count
  useEffect(() => {
    loadDailyScans();
  }, [subscriptionTier]);

  const initializeRevenueCat = async () => {
    try {
      // Get RevenueCat API key from centralized configuration
      const apiKey = getRevenueCatApiKey();

      if (!apiKey) {
        console.error('CRITICAL: RevenueCat API key not found - paywall will crash!');
        console.error('Please check constants/revenuecat.ts configuration');
        setIsLoading(false);
        return;
      }

      // Set log level for debugging (check for __DEV__ safely)
      try {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        } else {
          Purchases.setLogLevel(LOG_LEVEL.INFO);
        }
      } catch (logError) {
        console.warn('Could not set RevenueCat log level:', logError);
      }

      // Configure SDK with error handling
      try {
        await Purchases.configure({ apiKey });
        console.log('✅ RevenueCat SDK configured successfully');
        console.log('🔑 API Key (masked):', `${apiKey.substring(0, 15)}...`);
      } catch (configError) {
        console.error('❌ Failed to configure RevenueCat SDK:', configError);
        setIsLoading(false);
        return;
      }

      // Get initial customer info with timeout
      const customerInfoPromise = refreshSubscriptionStatus();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Customer info fetch timeout')), 5000)
      );
      
      try {
        await Promise.race([customerInfoPromise, timeoutPromise]);
      } catch (infoError) {
        console.warn('Could not fetch initial customer info:', infoError);
      }
      
      // Load offerings with error handling
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setOfferings(offerings.current);
          console.log('RevenueCat offerings loaded successfully');
        }
      } catch (offeringsError) {
        console.warn('Could not load RevenueCat offerings:', offeringsError);
      }

      // Listen for customer info updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        updateSubscriptionStatus(info);
      });
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscriptionStatus = async (info: CustomerInfo) => {
    setCustomerInfo(info);
    
    // Debug: Log all active entitlements
    console.log('🔍 Active entitlements:', Object.keys(info.entitlements.active));
    console.log('🔍 All entitlements:', Object.keys(info.entitlements.all));
    
    // Check if user has active subscription
    const hasActiveSubscription = 
      info.entitlements.active['pro'] !== undefined ||
      info.entitlements.active['lifetime'] !== undefined;
    
    console.log('💎 Subscription status:', {
      hasActiveSubscription,
      activeEntitlements: Object.keys(info.entitlements.active),
      tier: hasActiveSubscription ? SUBSCRIPTION_TIERS.PREMIUM : SUBSCRIPTION_TIERS.FREE
    });
    
    setIsSubscribed(hasActiveSubscription);
    setSubscriptionTier(hasActiveSubscription ? SUBSCRIPTION_TIERS.PREMIUM : SUBSCRIPTION_TIERS.FREE);
    
    // Cache subscription status for offline access
    await AsyncStorage.setItem(
      STORAGE_KEYS.SUBSCRIPTION_STATUS,
      JSON.stringify({
        isSubscribed: hasActiveSubscription,
        tier: hasActiveSubscription ? SUBSCRIPTION_TIERS.PREMIUM : SUBSCRIPTION_TIERS.FREE,
        timestamp: Date.now(),
      })
    );
  };

  const refreshSubscriptionStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      await updateSubscriptionStatus(customerInfo);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      
      // Try to load cached status if online check fails
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_STATUS);
        if (cached) {
          const { isSubscribed, tier } = JSON.parse(cached);
          setIsSubscribed(isSubscribed);
          setSubscriptionTier(tier);
        }
      } catch (cacheError) {
        console.error('Error loading cached subscription:', cacheError);
      }
    }
  };

  const loadDailyScans = async () => {
    try {
      const today = new Date().toDateString();
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_SCANS);
      
      if (stored) {
        const data = JSON.parse(stored);
        
        // Reset if it's a new day
        if (data.date !== today) {
          const newData = {
            count: 0,
            date: today,
            remaining: subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM
              ? -1
              : getFreeDailyScans(isTestMode),
          };
          setDailyScans(newData);
          await AsyncStorage.setItem(STORAGE_KEYS.DAILY_SCANS, JSON.stringify(newData));
        } else {
          // Calculate remaining scans
          const remaining = subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM
            ? -1
            : Math.max(0, getFreeDailyScans(isTestMode) - data.count);
          
          setDailyScans({
            ...data,
            remaining,
          });
        }
      } else {
        // First time - initialize
        const newData = {
          count: 0,
          date: today,
          remaining: subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM 
            ? -1 
            : FEATURE_LIMITS.FREE_DAILY_SCANS,
        };
        setDailyScans(newData);
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_SCANS, JSON.stringify(newData));
      }
    } catch (error) {
      console.error('Error loading daily scans:', error);
    }
  };

  const incrementScanCount = async () => {
    const today = new Date().toDateString();
    
    // Reset if new day
    if (dailyScans.date !== today) {
      await resetDailyScans();
      return;
    }
    
    const newCount = dailyScans.count + 1;
    const remaining = subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM 
      ? -1 
      : Math.max(0, FEATURE_LIMITS.FREE_DAILY_SCANS - newCount);
    
    const newData = {
      count: newCount,
      date: today,
      remaining,
    };
    
    setDailyScans(newData);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_SCANS, JSON.stringify(newData));
  };

  const resetDailyScans = async () => {
    const today = new Date().toDateString();
    const newData = {
      count: 0,
      date: today,
      remaining: subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM 
        ? -1 
        : FEATURE_LIMITS.FREE_DAILY_SCANS,
    };
    
    setDailyScans(newData);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_SCANS, JSON.stringify(newData));
  };

  const purchaseSubscription = async (productId: ProductId): Promise<boolean> => {
    try {
      if (!offerings?.availablePackages) {
        console.error('No offerings available');
        return false;
      }

      // Find the package for the product
      const packageToPurchase = offerings.availablePackages.find(
        pkg => pkg.product.identifier === productId
      );

      if (!packageToPurchase) {
        console.error('Product not found:', productId);
        return false;
      }

      // Make the purchase
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // Update subscription status
      await updateSubscriptionStatus(customerInfo);
      
      return true;
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Purchase error:', error);
      }
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      await updateSubscriptionStatus(customerInfo);
      
      const hasActiveSubscription = 
        customerInfo.entitlements.active['pro'] !== undefined ||
        customerInfo.entitlements.active['lifetime'] !== undefined;
      
      return hasActiveSubscription;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  };

  const getProducts = async (): Promise<PurchasesStoreProduct[]> => {
    try {
      const products = await Purchases.getProducts(Object.values(PRODUCT_IDS));
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const canScan = subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM || dailyScans.remaining > 0;

  const value: SubscriptionContextType = {
    isSubscribed,
    subscriptionTier,
    customerInfo,
    offerings,
    isLoading,
    dailyScans,
    canScan,
    incrementScanCount,
    resetDailyScans,
    purchaseSubscription,
    restorePurchases,
    refreshSubscriptionStatus,
    getProducts,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}