import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/internal/colors';

interface PageIndicatorProps {
  total: number;
  current: number;
  activeColor?: string;
  inactiveColor?: string;
  style?: ViewStyle;
  testID?: string;
}

export default function PageIndicator({
  total,
  current,
  activeColor = Colors.neutral.gray900,
  inactiveColor = Colors.neutral.gray500,
  style,
  testID,
}: PageIndicatorProps) {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === current ? styles.activeDot : styles.inactiveDot,
            { backgroundColor: index === current ? activeColor : inactiveColor },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 32,
  },
  inactiveDot: {
    width: 8,
    opacity: 0.4,
  },
});
