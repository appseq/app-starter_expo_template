import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert } from 'react-native';
import { Crown } from 'lucide-react-native';
import { usePaywall } from '@/contexts/PaywallContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Haptics } from '@/utils/haptics';
import { Platform } from 'react-native';

interface PremiumFeatureButtonProps {
  title: string;
  onUnlocked: () => void;
  icon?: React.ReactNode;
  style?: any;
}

/**
 * Example component that gates a premium feature
 * Shows the paywall if user doesn't have pro access
 */
export default function PremiumFeatureButton({ 
  title, 
  onUnlocked, 
  icon,
  style 
}: PremiumFeatureButtonProps) {
  const { isSubscribed } = useSubscription();
  const { presentPaywallIfNeeded, isPresenting } = usePaywall();

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Check if user has pro access
    if (isSubscribed) {
      // User has access, execute the feature
      onUnlocked();
    } else {
      // User doesn't have access, show paywall
      const hasAccess = await presentPaywallIfNeeded({ entitlementId: 'pro', refined: true });
      
      if (hasAccess) {
        // User now has access (purchased, restored, or already had it)
        Alert.alert(
          'Feature Unlocked!',
          `You can now use ${title}`,
          [{ 
            text: 'Great!', 
            onPress: onUnlocked 
          }]
        );
      }
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handlePress}
      disabled={isPresenting}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon || <Crown size={20} color="#FFD700" />}
        <Text style={styles.title}>{title}</Text>
        {!isSubscribed && (
          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  proBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
});