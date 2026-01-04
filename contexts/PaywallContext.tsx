
import { createContext, useContext } from 'react';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';

export interface PaywallState {
  isVisible: boolean;
  offering?: any;
  refined: boolean;
}

export interface PaywallContextType {
  presentPaywall: (options?: {
    refined?: boolean;
    offering?: any;
    placement?: string;  // Superwall placement name (optional)
  }) => Promise<boolean>;
  presentPaywallIfNeeded: (options: {
    entitlementId: string;
    refined?: boolean;
    offering?: any;
    placement?: string;  // Superwall placement name (optional)
  }) => Promise<boolean>;
  dismissPaywall: (result: PAYWALL_RESULT) => void;
  paywallState: PaywallState;
  isPresenting: boolean;
}

export const PaywallContext = createContext<PaywallContextType | null>(null);

export function usePaywall() {
  const context = useContext(PaywallContext);
  if (!context) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
}
