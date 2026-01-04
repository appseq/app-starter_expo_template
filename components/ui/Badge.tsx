import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Colors from '@/constants/internal/colors';

type BadgeVariant = 'default' | 'category' | 'rarity' | 'value';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export default function Badge({
  label,
  color,
  textColor,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
  testID,
}: BadgeProps) {
  const backgroundColor = color || getVariantColor(variant);
  const finalTextColor = textColor || Colors.neutral.white;

  const badgeStyles: ViewStyle[] = [
    styles.base,
    styles[`${size}Badge` as keyof typeof styles] as ViewStyle,
    { backgroundColor },
    style,
  ].filter(Boolean) as ViewStyle[];

  const labelStyles: TextStyle[] = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
    { color: finalTextColor },
    textStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <View style={badgeStyles} testID={testID}>
      <Text style={labelStyles}>{label}</Text>
    </View>
  );
}

function getVariantColor(variant: BadgeVariant): string {
  switch (variant) {
    case 'category':
      return Colors.accent.gold;
    case 'rarity':
      return Colors.rarity.rare;
    case 'value':
      return Colors.accent.coral;
    default:
      return Colors.neutral.granite;
  }
}

// Helper function to get category color
export function getCategoryColor(category: string): string {
  const categoryLower = category.toLowerCase();
  const categoryColors: Record<string, string> = {
    ring: Colors.categories.ring,
    necklace: Colors.categories.necklace,
    earring: Colors.categories.earring,
    bracelet: Colors.categories.bracelet,
    brooch: Colors.categories.brooch,
    watch: Colors.categories.watch,
    gemstone: Colors.categories.gemstone,
  };
  return categoryColors[categoryLower] || Colors.neutral.granite;
}

// Helper function to get rarity color
export function getRarityColor(rarity: string): string {
  const rarityLower = rarity.toLowerCase().replace('_', '');
  const rarityColors: Record<string, string> = {
    common: Colors.rarity.common,
    uncommon: Colors.rarity.uncommon,
    rare: Colors.rarity.rare,
    veryrare: Colors.rarity.veryRare,
    legendary: Colors.rarity.legendary,
  };
  return rarityColors[rarityLower] || Colors.rarity.common;
}

// Helper function to get jewelry material color
export function getMaterialColor(material: string): string {
  const materialLower = material.toLowerCase().replace(' ', '');
  const materialColors: Record<string, string> = {
    gold: Colors.jewelry.gold,
    rosegold: Colors.jewelry.roseGold,
    silver: Colors.jewelry.silver,
    platinum: Colors.jewelry.platinum,
    diamond: Colors.jewelry.diamond,
    ruby: Colors.jewelry.ruby,
    emerald: Colors.jewelry.emerald,
    sapphire: Colors.jewelry.sapphire,
    pearl: Colors.jewelry.pearl,
    amethyst: Colors.jewelry.amethyst,
    topaz: Colors.jewelry.topaz,
    opal: Colors.jewelry.opal,
  };
  return materialColors[materialLower] || Colors.neutral.granite;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  // Size styles for badge
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mediumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  largeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  // Text styles
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 11,
  },
  largeText: {
    fontSize: 13,
  },
});
