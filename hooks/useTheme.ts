import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { APP_CONFIG } from '@/constants/appConfig';

type ThemeMode = 'light' | 'dark' | 'automatic';

const THEME_KEY = 'theme';

// Get appearance config with defensive fallbacks
const { makeThemeSelectorAvailable = true, defaultTheme = 'dark' } = APP_CONFIG.appearance ?? {};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('automatic');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [isLoading, setIsLoading] = useState(true);

  // Determine the actual theme based on config and mode
  // If theme selector is disabled, always use the default theme from config
  const actualTheme = !makeThemeSelectorAvailable
    ? defaultTheme
    : themeMode === 'automatic'
      ? (systemColorScheme === 'light' ? 'light' : 'dark')
      : themeMode;

  useEffect(() => {
    loadTheme();
    
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme && ['light', 'dark', 'automatic'].includes(savedTheme)) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
      setThemeMode(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return {
    themeMode,
    actualTheme,
    systemColorScheme,
    isLoading,
    changeTheme,
  };
});