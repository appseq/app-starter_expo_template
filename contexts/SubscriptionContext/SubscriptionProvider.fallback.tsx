import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { 
  SUBSCRIPTION_TIERS, 
  FEATURE_LIMITS,
  SubscriptionTier,
  ProductId 
} from '@/constants/subscription';

interface DailyScanInfo {
  count: number;
  date: string;
  remaining: number;
}

interface SubscriptionContextType {
  // State
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  customerInfo: any | null;
  offerings: any | null;
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
  getProducts: () => Promise<any[]>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DAILY_SCANS: 'daily_scans_v2',
  SUBSCRIPTION_STATUS: 'subscription_status_cache',
  DEMO_SUBSCRIPTION: 'demo_subscription',
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(SUBSCRIPTION_TIERS.FREE);
  const [customerInfo, setCustomerInfo] = useState<any | null>(null);
  const [offerings, setOfferings] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyScans, setDailyScans] = useState<DailyScanInfo>({
    count: 0,
    date: new Date().toDateString(),
    remaining: FEATURE_LIMITS.FREE_DAILY_SCANS,
  });

  // Initialize subscription system
  useEffect(() => {
    initializeSubscription();
  }, []);
  
  // Set up RevenueCat listener
  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Listen for customer info updates
    // Note: RevenueCat SDK's addCustomerInfoUpdateListener returns an EmitterSubscription
    // but types may show void - using any to handle the cleanup properly
    const listener: any = Purchases.addCustomerInfoUpdateListener((customerInfo: CustomerInfo) => {
      checkSubscriptionStatus(customerInfo);
    });

    return () => {
      listener?.remove?.();
    };
  }, []);

  // Load daily scan count
  useEffect(() => {
    loadDailyScans();
  }, [subscriptionTier]);

  const initializeSubscription = async () => {
    try {
      if (Platform.OS === 'web') {
        console.log('Using fallback subscription system (Web platform)');
        // Check for demo subscription on web
        const demoSub = await AsyncStorage.getItem(STORAGE_KEYS.DEMO_SUBSCRIPTION);
        if (demoSub === 'premium') {
          setIsSubscribed(true);
          setSubscriptionTier(SUBSCRIPTION_TIERS.PREMIUM);
        }
      } else {
        // Use RevenueCat on mobile platforms
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          checkSubscriptionStatus(customerInfo);
          setCustomerInfo(customerInfo);
        } catch (error) {
          console.log('RevenueCat not initialized yet, using fallback');
          // Fallback for development
          const demoSub = await AsyncStorage.getItem(STORAGE_KEYS.DEMO_SUBSCRIPTION);
          if (demoSub === 'premium') {
            setIsSubscribed(true);
            setSubscriptionTier(SUBSCRIPTION_TIERS.PREMIUM);
          }
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Subscription initialization error:', error);
      setIsLoading(false);
    }
  };
  
  const checkSubscriptionStatus = (customerInfo: CustomerInfo) => {
    // Check if user has "pro" entitlement
    const hasProAccess = customerInfo.entitlements.active['pro'] !== undefined;
    setIsSubscribed(hasProAccess);
    setSubscriptionTier(hasProAccess ? SUBSCRIPTION_TIERS.PREMIUM : SUBSCRIPTION_TIERS.FREE);
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
              : FEATURE_LIMITS.FREE_DAILY_SCANS,
          };
          setDailyScans(newData);
          await AsyncStorage.setItem(STORAGE_KEYS.DAILY_SCANS, JSON.stringify(newData));
        } else {
          // Calculate remaining scans
          const remaining = subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM 
            ? -1 
            : Math.max(0, FEATURE_LIMITS.FREE_DAILY_SCANS - data.count);
          
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
      if (Platform.OS === 'web') {
        console.log('Demo purchase for:', productId);
        // Simulate purchase success on web
        await AsyncStorage.setItem(STORAGE_KEYS.DEMO_SUBSCRIPTION, 'premium');
        setIsSubscribed(true);
        setSubscriptionTier(SUBSCRIPTION_TIERS.PREMIUM);
        await loadDailyScans();
        return true;
      }
      
      // This is handled by the paywall UI now
      console.log('Purchase should be handled through RevenueCat paywall UI');
      return false;
    } catch (error) {
      console.error('Purchase error:', error);
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        const demoSub = await AsyncStorage.getItem(STORAGE_KEYS.DEMO_SUBSCRIPTION);
        if (demoSub === 'premium') {
          setIsSubscribed(true);
          setSubscriptionTier(SUBSCRIPTION_TIERS.PREMIUM);
          await loadDailyScans();
          return true;
        }
        return false;
      }
      
      // Use RevenueCat restore on mobile
      const customerInfo = await Purchases.restorePurchases();
      checkSubscriptionStatus(customerInfo);
      setCustomerInfo(customerInfo);
      await loadDailyScans();
      return customerInfo.entitlements.active['pro'] !== undefined;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  };

  const refreshSubscriptionStatus = async () => {
    try {
      if (Platform.OS === 'web') {
        // Reload from storage on web
        await initializeSubscription();
      } else {
        // Get latest customer info from RevenueCat
        const customerInfo = await Purchases.getCustomerInfo();
        checkSubscriptionStatus(customerInfo);
        setCustomerInfo(customerInfo);
        await loadDailyScans();
      }
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    }
  };

  const getProducts = async (): Promise<any[]> => {
    // Return mock products for demo
    return [
      { identifier: 'rockid_monthly_499', price: '$4.99' },
      { identifier: 'rockid_annual_2999', price: '$29.99' },
      { identifier: 'rockid_lifetime_9999', price: '$99.99' },
    ];
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