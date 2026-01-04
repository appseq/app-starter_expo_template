import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/internal/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const handlePress = async () => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`${variant}Button` as keyof typeof styles] as ViewStyle,
    styles[`${size}Button` as keyof typeof styles] as ViewStyle,
    disabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
    disabled && styles.disabledText,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.neutral.white : Colors.accent.primary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  // Variant styles
  primaryButton: {
    backgroundColor: Colors.accent.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.primary.main,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.accent.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  // Size styles
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  mediumButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  largeButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  // State styles
  disabled: {
    opacity: 0.5,
  },
  // Text styles
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.neutral.white,
  },
  secondaryText: {
    color: Colors.neutral.white,
  },
  outlineText: {
    color: Colors.accent.primary,
  },
  ghostText: {
    color: Colors.accent.primary,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.7,
  },
});
