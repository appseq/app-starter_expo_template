import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/internal/colors';

interface ScanFrameProps {
  size?: number;
  cornerLength?: number;
  borderWidth?: number;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

export default function ScanFrame({
  size = 200,
  cornerLength = 40,
  borderWidth = 4,
  color = Colors.accent.primary,
  style,
  testID,
}: ScanFrameProps) {
  const cornerStyle: ViewStyle = {
    position: 'absolute',
    width: cornerLength,
    height: cornerLength,
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]} testID={testID}>
      {/* Top Left Corner */}
      <View style={[cornerStyle, styles.topLeft]}>
        <View
          style={[
            styles.cornerBorder,
            styles.topBorder,
            { borderColor: color, borderTopWidth: borderWidth },
          ]}
        />
        <View
          style={[
            styles.cornerBorder,
            styles.leftBorder,
            { borderColor: color, borderLeftWidth: borderWidth },
          ]}
        />
      </View>

      {/* Top Right Corner */}
      <View style={[cornerStyle, styles.topRight]}>
        <View
          style={[
            styles.cornerBorder,
            styles.topBorder,
            { borderColor: color, borderTopWidth: borderWidth },
          ]}
        />
        <View
          style={[
            styles.cornerBorder,
            styles.rightBorder,
            { borderColor: color, borderRightWidth: borderWidth },
          ]}
        />
      </View>

      {/* Bottom Left Corner */}
      <View style={[cornerStyle, styles.bottomLeft]}>
        <View
          style={[
            styles.cornerBorder,
            styles.bottomBorder,
            { borderColor: color, borderBottomWidth: borderWidth },
          ]}
        />
        <View
          style={[
            styles.cornerBorder,
            styles.leftBorder,
            { borderColor: color, borderLeftWidth: borderWidth },
          ]}
        />
      </View>

      {/* Bottom Right Corner */}
      <View style={[cornerStyle, styles.bottomRight]}>
        <View
          style={[
            styles.cornerBorder,
            styles.bottomBorder,
            { borderColor: color, borderBottomWidth: borderWidth },
          ]}
        />
        <View
          style={[
            styles.cornerBorder,
            styles.rightBorder,
            { borderColor: color, borderRightWidth: borderWidth },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    // Accent glow effect
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  cornerBorder: {
    position: 'absolute',
  },
  topBorder: {
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  bottomBorder: {
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  leftBorder: {
    top: 0,
    left: 0,
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightBorder: {
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
});
