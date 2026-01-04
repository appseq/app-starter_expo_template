import React, { useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ViewStyle, 
  TextStyle,
  Platform
} from 'react-native';
import { Haptics } from "@/utils/haptics";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import colors from "@/constants/internal/colors";

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  gradientColors?: [string, string, ...string[]];
  testID?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  icon,
  style,
  textStyle,
  disabled = false,
  gradientColors,
  testID,
}) => {
  const scale = useSharedValue(1);
  
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 10 });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 10 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? withTiming(0.6) : withTiming(1),
    };
  });

  const isPrimary = variant === 'primary';
  const defaultGradientColors = isPrimary 
    ? [colors.accent.blue, colors.accent.emerald] as const
    : ['transparent', 'transparent'] as const;
  
  const buttonColors = gradientColors || defaultGradientColors;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle]}
      disabled={disabled}
      testID={testID}
    >
      <LinearGradient
        colors={buttonColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.button,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          style,
        ]}
      >
        {icon && <Animated.View style={styles.iconContainer}>{icon}</Animated.View>}
        <Text 
          style={[
            styles.text, 
            isPrimary ? styles.primaryText : styles.secondaryText,
            textStyle
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primaryButton: {
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.surface.glassEdge,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.text.primary,
  },
  secondaryText: {
    color: colors.text.secondary,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default AnimatedButton;