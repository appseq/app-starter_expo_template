import React from 'react';
import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';
import { getColors } from "@/constants/internal/colors";
import { useTheme } from '@/hooks/useTheme';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  style?: any;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  intensity = 50, 
  style, 
  ...props 
}) => {
  const themeContext = useTheme();
  const actualTheme = themeContext?.actualTheme || 'dark';
  const colors = getColors(actualTheme);
  
  const containerStyle = {
    backgroundColor: colors.surface.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surface.glassEdge,
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  };
  
  // On web, BlurView isn't fully supported, so we use a regular View with background
  if (Platform.OS === 'web') {
    return (
      <View
        style={[containerStyle, style]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={actualTheme === 'light' ? "light" : "dark"}
      style={[containerStyle, style]}
      {...props}
    >
      {children}
    </BlurView>
  );
};

export default GlassCard;