import { Tabs } from 'expo-router';
import { Home } from 'lucide-react-native';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/internal/colors';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { actualTheme } = useTheme();
  const isDark = actualTheme !== 'light';

  // Theme-aware colors
  const activeTint = Colors.accent.gold;
  const inactiveTint = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';
  const backgroundColor = isDark ? 'rgba(18, 18, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTint,
          tabBarInactiveTintColor: inactiveTint,
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarStyle: [
            styles.tabBar,
            { paddingBottom: Math.max(insets.bottom, 8) },
          ],
          tabBarBackground: () =>
            Platform.OS === 'web' ? (
              <View style={[styles.tabBarBackground, { backgroundColor, borderTopColor: borderColor }]} />
            ) : (
              <BlurView
                intensity={100}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.tabBarBackground, { backgroundColor, borderTopColor: borderColor }]}
              />
            ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('ui.tabs.home'),
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 0.5,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
