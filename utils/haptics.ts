// Fallback haptics implementation
export const Haptics = {
  ImpactFeedbackStyle: {
    Light: 'light' as const,
    Medium: 'medium' as const,
    Heavy: 'heavy' as const,
  },
  NotificationFeedbackType: {
    Success: 'success' as const,
    Warning: 'warning' as const,
    Error: 'error' as const,
  },
  impactAsync: async (style: 'light' | 'medium' | 'heavy') => {
    console.log(`Haptic feedback: ${style} (fallback mode)`);
    // In a real implementation, you might use the Vibration API
    // or implement platform-specific vibration
    return Promise.resolve();
  },
  notificationAsync: async (type: 'success' | 'warning' | 'error') => {
    console.log(`Notification haptic: ${type} (fallback mode)`);
    return Promise.resolve();
  },
  selectionAsync: async () => {
    console.log('Selection haptic (fallback mode)');
    return Promise.resolve();
  },
};