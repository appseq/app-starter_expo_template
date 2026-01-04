
import React from 'react';
import { SubscriptionProvider as RealSubscriptionProvider, useSubscription as useRealSubscription } from './SubscriptionProvider';
import { SubscriptionProvider as FallbackSubscriptionProvider, useSubscription as useFallbackSubscription } from './SubscriptionProvider.fallback';

// IMPORTANT: Always use the real SubscriptionProvider in production builds
// This ensures RevenueCat is properly initialized for TestFlight and App Store builds
// The fallback is only for development environments without RevenueCat configured
const isDevelopment = false; // Force production mode to fix TestFlight crashes

export const SubscriptionProvider = isDevelopment ? FallbackSubscriptionProvider : RealSubscriptionProvider;
export const useSubscription = isDevelopment ? useFallbackSubscription : useRealSubscription;
