import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Settings, ArrowLeft, Search } from 'lucide-react-native';
import Colors, { getColors } from '@/constants/internal/colors';
import { useTheme } from '@/hooks/useTheme';

type IconType = 'settings' | 'back' | 'search' | 'none';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: IconType;
  rightIcon?: IconType;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  centerComponent?: React.ReactNode;
  variant?: 'dark' | 'light';
  style?: ViewStyle;
  testID?: string;
}

export default function Header({
  title,
  subtitle,
  leftIcon = 'none',
  rightIcon = 'none',
  onLeftPress,
  onRightPress,
  rightComponent,
  leftComponent,
  centerComponent,
  variant = 'dark',
  style,
  testID,
}: HeaderProps) {
  const themeContext = useTheme();
  const actualTheme = themeContext?.actualTheme || 'dark';
  const colors = getColors(actualTheme);

  // variant prop can override the theme for specific visual needs
  const isDark = variant === 'dark';
  const iconColor = colors.text.primary;
  const titleColor = colors.accent.gold;
  const subtitleColor = colors.text.muted;

  // Pill button for settings (matches Pro pill design)
  const renderPillButton = (children: React.ReactNode, onPress?: () => void) => {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.pillButton}>
        {children}
      </TouchableOpacity>
    );
  };

  const renderIcon = (icon: IconType, onPress?: () => void) => {
    if (icon === 'none') {
      return <View style={styles.iconPlaceholder} />;
    }

    const IconComponent = {
      settings: Settings,
      back: ArrowLeft,
      search: Search,
    }[icon];

    // Use pill button for settings icon (matches Pro pill on right side)
    if (icon === 'settings') {
      return renderPillButton(
        <IconComponent size={18} color={Colors.neutral.white} />,
        onPress
      );
    }

    return (
      <TouchableOpacity style={styles.iconButton} onPress={onPress}>
        <IconComponent size={24} color={iconColor} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Left side */}
      {leftComponent || renderIcon(leftIcon, onLeftPress)}

      {/* Center */}
      {centerComponent || (
        <View style={styles.centerContainer}>
          {title && <Text style={[styles.title, { color: titleColor }]}>{title}</Text>}
          {subtitle && (
            <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
          )}
        </View>
      )}

      {/* Right side */}
      {rightComponent || renderIcon(rightIcon, onRightPress)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    // Match pill button dimensions for consistent centering
    width: 44,
    height: 36,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.tealDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  centerContainer: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
