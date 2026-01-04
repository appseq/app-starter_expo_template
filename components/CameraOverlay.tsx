import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming,
  withDelay
} from 'react-native-reanimated';
import colors from "@/constants/internal/colors";

interface CameraOverlayProps {
  instruction?: string;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ 
  instruction = 'Position rock in the center of frame'
}) => {
  const bracketOpacity = useSharedValue(0.6);
  const instructionOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Pulsing animation for brackets
    bracketOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 })
      ),
      -1,
      true
    );
    
    // Fade in instruction text after a delay
    instructionOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 800 })
    );
  }, [bracketOpacity, instructionOpacity]);
  
  const bracketStyle = useAnimatedStyle(() => {
    return {
      opacity: bracketOpacity.value,
    };
  });
  
  const instructionStyle = useAnimatedStyle(() => {
    return {
      opacity: instructionOpacity.value,
    };
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={styles.topGradient}
      />
      
      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.bottomGradient}
      />
      
      {/* Vignette effect */}
      <View style={styles.vignette} />
      
      {/* Scanning brackets */}
      <View style={styles.scanFrame}>
        <Animated.View style={[styles.bracket, styles.topLeft, bracketStyle]} />
        <Animated.View style={[styles.bracket, styles.topRight, bracketStyle]} />
        <Animated.View style={[styles.bracket, styles.bottomLeft, bracketStyle]} />
        <Animated.View style={[styles.bracket, styles.bottomRight, bracketStyle]} />
      </View>
      
      {/* Instruction text */}
      <Animated.View style={[styles.instructionContainer, instructionStyle]}>
        <Text style={styles.instructionText}>{instruction}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 150,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bracket: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.accent.blue,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 150,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  instructionText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CameraOverlay;