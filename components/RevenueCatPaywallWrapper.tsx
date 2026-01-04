import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RevenueCatUI from 'react-native-purchases-ui';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { APP_CONFIG } from '@/constants/appConfig';

const PAYWALL_X_BUTTON_DELAY = APP_CONFIG.subscription.paywallXButtonDelay;
import { X } from 'lucide-react-native';

interface RevenueCatPaywallWrapperProps {
  visible: boolean;
  offering?: any;
  onDismiss: (result: PAYWALL_RESULT) => void;
  onPurchaseCompleted?: (customerInfo: any, storeTransaction: any) => void;
  onPurchaseError?: (error: any) => void;
  onRestoreCompleted?: (customerInfo: any) => void;
  onRestoreError?: (error: any) => void;
}

export const RevenueCatPaywallWrapper: React.FC<RevenueCatPaywallWrapperProps> = ({
  visible,
  offering,
  onDismiss,
  onPurchaseCompleted,
  onPurchaseError,
  onRestoreCompleted,
  onRestoreError,
}) => {
  const [showCloseButton, setShowCloseButton] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('🎬 RevenueCatPaywallWrapper visibility changed:', visible);
    if (visible) {
      console.log('⏰ Starting 2-second timer for close button');
      // Show close button after 2 seconds
      const timer = setTimeout(() => {
        console.log(`✅ ${PAYWALL_X_BUTTON_DELAY}ms passed, showing close button`);
        setShowCloseButton(true);
      }, PAYWALL_X_BUTTON_DELAY);

      return () => clearTimeout(timer);
    } else {
      console.log('🔄 Modal closed, resetting close button state');
      // Reset when modal is closed
      setShowCloseButton(false);
    }
  }, [visible]);

  const handleDismiss = () => {
    if (showCloseButton) {
      onDismiss(PAYWALL_RESULT.CANCELLED);
    }
  };

  const handleRequestClose = () => {
    // Prevent dismissal until close button is shown
    if (showCloseButton) {
      handleDismiss();
    }
    // Return false to prevent default modal dismissal
    return false;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleRequestClose}
    >
      <View style={styles.container}>
        {Platform.OS !== 'web' ? (
          <RevenueCatUI.Paywall
            options={{
              offering,
              displayCloseButton: false, // We handle the close button ourselves
            }}
            onPurchaseCompleted={({ customerInfo, storeTransaction }) => {
              onPurchaseCompleted?.(customerInfo, storeTransaction);
              onDismiss(PAYWALL_RESULT.PURCHASED);
            }}
            onPurchaseError={({ error }) => {
              console.error('Purchase error in paywall:', error);
              onPurchaseError?.(error);
            }}
            onRestoreCompleted={({ customerInfo }) => {
              onRestoreCompleted?.(customerInfo);
              onDismiss(PAYWALL_RESULT.RESTORED);
            }}
            onRestoreError={({ error }) => {
              console.error('Restore error in paywall:', error);
              onRestoreError?.(error);
            }}
            onPurchaseCancelled={() => {
              // Don't auto-dismiss on purchase cancelled
            }}
            onDismiss={() => {
              // This shouldn't be called since displayCloseButton is false
              // But handle it just in case
              if (showCloseButton) {
                onDismiss(PAYWALL_RESULT.CANCELLED);
              }
            }}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ padding: 20 }}>
              <TouchableOpacity onPress={() => onDismiss(PAYWALL_RESULT.CANCELLED)}>
                <View style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5 }}>
                  <X size={20} color="#000" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {showCloseButton && (
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 10 }]}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
