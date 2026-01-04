import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/internal/colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'dark';
  style?: ViewStyle;
  testID?: string;
}

export default function Card({
  children,
  variant = 'default',
  style,
  testID,
}: CardProps) {
  const cardStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    style,
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
  },
  default: {
    backgroundColor: Colors.background.card,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  glass: {
    backgroundColor: Colors.surface.glass,
    borderWidth: 1,
    borderColor: Colors.background.glassBorder,
  },
  elevated: {
    backgroundColor: Colors.background.card,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dark: {
    backgroundColor: Colors.primary.slate,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
});
