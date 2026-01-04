import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { X, HelpCircle, Zap, ZapOff, Image as ImageIcon } from 'lucide-react-native';
import Colors from '@/constants/internal/colors';
import ScanFrame from './ScanFrame';

interface CameraOverlayProps {
  flashEnabled?: boolean;
  onFlashToggle?: () => void;
  onGalleryPress?: () => void;
  onHelpPress?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  frameSize?: number;
  testID?: string;
}

export default function CameraOverlay({
  flashEnabled = false,
  onFlashToggle,
  onGalleryPress,
  onHelpPress,
  onClose,
  showCloseButton = true,
  frameSize = 280,
  testID,
}: CameraOverlayProps) {
  return (
    <View style={styles.container} testID={testID}>
      {/* Top controls */}
      <View style={styles.topControls}>
        {showCloseButton && onClose ? (
          <TouchableOpacity style={styles.iconButton} onPress={onClose}>
            <X size={24} color={Colors.neutral.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}

        {onHelpPress && (
          <TouchableOpacity style={styles.iconButton} onPress={onHelpPress}>
            <HelpCircle size={24} color={Colors.neutral.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center scan frame */}
      <View style={styles.centerContainer}>
        <ScanFrame size={frameSize} cornerLength={50} borderWidth={4} />
        <Text style={styles.hintText}>Position jewelry within frame</Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {/* Flash toggle */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onFlashToggle}
          activeOpacity={0.7}
        >
          {flashEnabled ? (
            <Zap size={24} color={Colors.accent.gold} fill={Colors.accent.gold} />
          ) : (
            <ZapOff size={24} color={Colors.neutral.white} />
          )}
        </TouchableOpacity>

        {/* Capture button placeholder - actual capture handled by parent */}
        <View style={styles.captureButtonOuter}>
          <View style={styles.captureButtonInner} />
        </View>

        {/* Gallery button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onGalleryPress}
          activeOpacity={0.7}
        >
          <ImageIcon size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    marginTop: 20,
    fontSize: 14,
    color: Colors.neutral.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
    gap: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.neutral.white,
  },
});
