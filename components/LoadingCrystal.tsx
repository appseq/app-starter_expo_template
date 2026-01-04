import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import colors from "@/constants/internal/colors";

interface LoadingCrystalProps {
  size?: number;
}

export const LoadingCrystal: React.FC<LoadingCrystalProps> = ({ 
  size = 80,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const innerRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Main rotation - smooth and continuous
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }), 
      -1,
      false
    );

    // Counter rotation for inner elements
    innerRotation.value = withRepeat(
      withTiming(-360, { duration: 6000, easing: Easing.linear }), 
      -1,
      false
    );

    // Gentle breathing effect
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle glow pulsing
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [rotation, scale, innerRotation, glowOpacity]);

  const mainAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  const innerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${innerRotation.value}deg` },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  return (
    <View style={styles.container} testID="loading-crystal">
      {/* Outer glow */}
      <Animated.View style={[styles.glowContainer, glowStyle]}>
        <LinearGradient
          colors={[colors.accent.blue + '40', 'transparent']}
          style={[styles.outerGlow, { width: size * 2, height: size * 2 }]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      {/* Main crystal container */}
      <Animated.View style={[styles.crystalContainer, mainAnimatedStyle]}>
        {/* Outer crystal ring */}
        <View style={[styles.crystalRing, { width: size, height: size }]}>
          <LinearGradient
            colors={[colors.accent.blue, colors.accent.purple]}
            style={styles.ringGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
        
        {/* Inner rotating elements */}
        <Animated.View style={[styles.innerContainer, innerAnimatedStyle]}>
          <View style={[styles.innerCrystal, { width: size * 0.6, height: size * 0.6 }]}>
            <LinearGradient
              colors={[colors.accent.emerald, colors.accent.blue]}
              style={styles.innerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          
          {/* Center core */}
          <View style={[styles.core, { width: size * 0.25, height: size * 0.25 }]}>
            <LinearGradient
              colors={[colors.text.primary, colors.accent.blue]}
              style={styles.coreGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    width: 120,
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    borderRadius: 1000,
  },
  crystalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crystalRing: {
    borderRadius: 1000,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  ringGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 1000,
  },
  innerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCrystal: {
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  innerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 1000,
  },
  core: {
    position: 'absolute',
    borderRadius: 1000,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  coreGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 1000,
  },
});

export default LoadingCrystal;