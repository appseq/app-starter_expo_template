import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { StatusBar } from "expo-status-bar";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
// Removed: IdentifierProvider, ArticlesProvider (not needed for template)
import { OnboardingProvider, useOnboarding } from "@/hooks/useOnboarding";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AppRatingProvider } from "@/hooks/useAppRating";
import { TestModeProvider } from "@/hooks/useTestMode";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { PaywallProvider } from "@/components/PaywallProvider";
import OnboardingScreen from "@/components/OnboardingScreen";
import { getColors } from "@/constants/internal/colors";
import { I18nextProvider } from 'react-i18next';
// Import i18n early to ensure it's initialized before any components render
import i18n from "@/locales";
// RevenueCat import removed - initialization moved to SubscriptionProvider

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isOnboardingCompleted, isLoading: isOnboardingLoading } = useOnboarding();
  const themeContext = useTheme();
  const isThemeLoading = themeContext?.isLoading ?? false;
  const actualTheme = themeContext?.actualTheme || 'dark';
  const colors = getColors(actualTheme);

  // Track if splash has been hidden to prevent multiple calls
  const [splashHidden, setSplashHidden] = useState(false);

  // Animation value for fade-in after splash hides
  const contentOpacity = useSharedValue(0);

  // Hide splash when critical providers are ready (onboarding + theme)
  // These are fast local operations (AsyncStorage), so we wait for them
  // Don't wait for network operations (RevenueCat, Articles) to avoid slow startup
  useEffect(() => {
    const isReady = !isOnboardingLoading && !isThemeLoading;

    if (isReady && !splashHidden) {
      SplashScreen.hideAsync();
      setSplashHidden(true);
      // Trigger fade-in animation after splash hides
      contentOpacity.value = withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [isOnboardingLoading, isThemeLoading, splashHidden, contentOpacity]);

  // Fallback timeout to prevent infinite splash if something goes wrong
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!splashHidden) {
        console.warn('Splash screen fallback timeout triggered');
        SplashScreen.hideAsync();
        setSplashHidden(true);
        // Also trigger fade-in on fallback
        contentOpacity.value = withTiming(1, {
          duration: 1400,
          easing: Easing.out(Easing.ease),
        });
      }
    }, 3000); // 3 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [splashHidden, contentOpacity]);

  // Animated style for smooth fade-in after splash hides
  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    flex: 1,
  }));

  if (isOnboardingLoading) {
    return (
      <Animated.View style={fadeInStyle}>
        <AppLoadingScreen theme={actualTheme} />
      </Animated.View>
    );
  }

  if (!isOnboardingCompleted) {
    return (
      <Animated.View style={fadeInStyle}>
        <OnboardingScreen />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={fadeInStyle}>
      <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.dark },
        animation: 'fade_from_bottom',
      }}
      initialRouteName="(tabs)"
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
    </Animated.View>
  );
}

export default function RootLayout() {
  // Splash screen hiding is now handled in RootLayoutNav
  // where we have access to provider loading states
  // This ensures splash hides only when critical providers are ready

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <TestModeProvider>
              <SubscriptionProvider>
                <PaywallProvider>
                  <OnboardingProvider>
                    <AppRatingProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <StatusBar style="auto" />
                        <RootLayoutNav />
                      </GestureHandlerRootView>
                    </AppRatingProvider>
                  </OnboardingProvider>
                </PaywallProvider>
              </SubscriptionProvider>
            </TestModeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}