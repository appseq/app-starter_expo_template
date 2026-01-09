/**
 * EmptyState Component
 * Reusable component for displaying empty list/collection states
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { getColors } from '@/constants/internal/colors';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  /** Main title message */
  title: string;
  /** Secondary description text */
  subtitle?: string;
  /** Optional icon component to display above title */
  icon?: React.ReactNode;
  /** Optional action button */
  action?: EmptyStateAction;
}

/**
 * Empty state display component for lists and collections.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <EmptyState
 *   title="No items yet"
 *   subtitle="Add your first item to get started"
 * />
 *
 * // With icon and action
 * <EmptyState
 *   title="No scans"
 *   subtitle="Tap the button below to scan your first item"
 *   icon={<Camera size={48} color="#9CA3AF" />}
 *   action={{
 *     label: "Start Scanning",
 *     onPress: () => navigation.navigate('Scan')
 *   }}
 * />
 * ```
 */
export function EmptyState({
  title,
  subtitle,
  icon,
  action,
}: EmptyStateProps) {
  const { actualTheme } = useTheme();
  const colors = getColors(actualTheme);

  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Text style={[styles.title, { color: colors.text.primary }]}>
        {title}
      </Text>

      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          {subtitle}
        </Text>
      )}

      {action && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.accent.electric },
          ]}
          onPress={action.onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
