import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { LoadingCrystal } from '@/components/LoadingCrystal';
import { getColors } from '@/constants/internal/colors';

interface AppLoadingScreenProps {
  theme?: 'light' | 'dark';
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  theme = 'dark'
}) => {
  const colors = getColors(theme);

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
      style={[styles.container, { backgroundColor: colors.background.dark }]}
      testID="app-loading-screen"
    >
      <LoadingCrystal size={100} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppLoadingScreen;
