import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getColors } from '@/constants/internal/colors';
import { useTheme } from '@/hooks/useTheme';

interface StatsCardProps {
  label: string;
  value: string | number;
  variant?: 'large' | 'small';
  style?: ViewStyle;
  testID?: string;
}

export default function StatsCard({
  label,
  value,
  variant = 'large',
  style,
  testID,
}: StatsCardProps) {
  const themeContext = useTheme();
  const actualTheme = themeContext?.actualTheme || 'dark';
  const colors = getColors(actualTheme);

  const isLarge = variant === 'large';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.primary.vibrant },
        isLarge ? styles.large : styles.small,
        style,
      ]}
      testID={testID}
    >
      <Text style={[isLarge ? styles.labelLarge : styles.labelSmall, { color: 'rgba(255,255,255,0.7)' }]}>
        {label}
      </Text>
      <Text style={[isLarge ? styles.valueLarge : styles.valueSmall, { color: '#FFFFFF' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
  },
  large: {
    padding: 20,
  },
  small: {
    flex: 1,
    padding: 16,
  },
  labelLarge: {
    fontSize: 14,
    marginBottom: 4,
  },
  valueLarge: {
    fontSize: 32,
    fontWeight: '800',
  },
  labelSmall: {
    fontSize: 12,
    marginBottom: 4,
  },
  valueSmall: {
    fontSize: 20,
    fontWeight: '700',
  },
});
