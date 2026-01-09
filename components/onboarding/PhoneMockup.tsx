/**
 * PhoneMockup Component
 * Device frame mockup for onboarding slides
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Camera, Sparkles, BookOpen } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHONE_WIDTH = SCREEN_WIDTH * 0.55;
const PHONE_HEIGHT = PHONE_WIDTH * 2;

interface PhoneMockupProps {
  variant: 'scan' | 'identify' | 'discover';
}

/**
 * Phone device mockup showing feature previews
 */
export default function PhoneMockup({ variant }: PhoneMockupProps) {
  return (
    <View style={styles.container}>
      {/* Phone frame */}
      <View style={styles.phone}>
        {/* Notch */}
        <View style={styles.notch} />

        {/* Screen content */}
        <View style={styles.screen}>
          {variant === 'scan' && <ScanContent />}
          {variant === 'identify' && <IdentifyContent />}
          {variant === 'discover' && <DiscoverContent />}
        </View>
      </View>
    </View>
  );
}

/**
 * Scan feature preview
 */
function ScanContent() {
  return (
    <View style={styles.contentContainer}>
      {/* Camera viewfinder */}
      <View style={styles.viewfinder}>
        {/* Corner brackets */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Camera icon */}
        <Camera size={40} color="#0D9488" strokeWidth={1.5} />

        {/* Scan line */}
        <View style={styles.scanLine} />
      </View>

      {/* Hint text */}
      <Text style={styles.hintText}>Point at any item</Text>
    </View>
  );
}

/**
 * Identify feature preview
 */
function IdentifyContent() {
  return (
    <View style={styles.contentContainer}>
      {/* Result card */}
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.resultIcon}>
            <Sparkles size={20} color="#0D9488" />
          </View>
          <View style={styles.resultLines}>
            <View style={[styles.line, { width: '70%' }]} />
            <View style={[styles.line, { width: '50%', marginTop: 6 }]} />
          </View>
        </View>

        {/* Confidence bar */}
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceFill, { width: '85%' }]} />
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={[styles.line, { width: '100%' }]} />
          <View style={[styles.line, { width: '90%' }]} />
          <View style={[styles.line, { width: '80%' }]} />
        </View>
      </View>
    </View>
  );
}

/**
 * Discover feature preview
 */
function DiscoverContent() {
  return (
    <View style={styles.contentContainer}>
      {/* Collection preview */}
      <View style={styles.collectionContainer}>
        <View style={styles.collectionHeader}>
          <BookOpen size={20} color="#0D9488" />
          <Text style={styles.collectionTitle}>Your Collection</Text>
        </View>

        {/* Item cards */}
        <View style={styles.itemGrid}>
          <View style={styles.itemCard}>
            <View style={styles.itemImage} />
            <View style={[styles.miniLine, { width: '80%' }]} />
          </View>
          <View style={styles.itemCard}>
            <View style={styles.itemImage} />
            <View style={[styles.miniLine, { width: '60%' }]} />
          </View>
          <View style={styles.itemCard}>
            <View style={styles.itemImage} />
            <View style={[styles.miniLine, { width: '70%' }]} />
          </View>
          <View style={styles.itemCard}>
            <View style={styles.itemImage} />
            <View style={[styles.miniLine, { width: '55%' }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    backgroundColor: '#1A1A1A',
    borderRadius: 36,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  notch: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 24,
    backgroundColor: '#1A1A1A',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 10,
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  // Scan styles
  viewfinder: {
    width: '85%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#0D9488',
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#0D9488',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  hintText: {
    marginTop: 16,
    fontSize: 12,
    color: '#6B7280',
  },
  // Identify styles
  resultCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultLines: {
    flex: 1,
  },
  line: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 3,
  },
  detailsContainer: {
    gap: 8,
  },
  // Discover styles
  collectionContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  collectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemCard: {
    width: '47%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
  },
  miniLine: {
    height: 6,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
});
