import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Sun, Moon, Smartphone } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { Haptics } from "@/utils/haptics";
import { Platform } from 'react-native';
import { getColors } from "@/constants/internal/colors";
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

interface ThemeOptionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  actualTheme: string;
}

function ThemeOption({ title, subtitle, icon, isSelected, onPress, colors, actualTheme }: ThemeOptionProps) {
  const cardStyle = actualTheme === 'light' ? {
    backgroundColor: isSelected ? colors.primary.vibrant + '10' : 'rgba(255, 255, 255, 0.95)',
    borderColor: isSelected ? colors.primary.vibrant : colors.primary.light + '30',
    borderWidth: isSelected ? 2 : 1,
    shadowColor: colors.primary.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isSelected ? 0.1 : 0.04,
    shadowRadius: 4,
    elevation: isSelected ? 3 : 1,
  } : {
    backgroundColor: isSelected ? colors.accent.blue + '15' : colors.surface.glass,
    borderColor: isSelected ? colors.accent.blue : colors.surface.glassEdge,
    borderWidth: isSelected ? 2 : 1,
  };

  return (
    <TouchableOpacity
      style={[styles.themeOption, cardStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {actualTheme === 'light' && !isSelected && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 249, 255, 0.8)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <View style={styles.themeOptionContent}>
        <View style={styles.themeIconContainer}>
          {icon}
        </View>
        <View style={styles.themeTextContainer}>
          <Text style={[styles.themeTitle, { color: colors.text.primary }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.themeSubtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
          )}
        </View>
        {isSelected && (
          <Check size={20} color={actualTheme === 'light' ? colors.primary.vibrant : colors.accent.blue} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ThemeSettingsScreen() {
  const { t } = useTranslation();
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode || 'dark';
  const actualTheme = themeContext?.actualTheme || 'dark';
  const changeTheme = themeContext?.changeTheme || (() => {});
  const colors = getColors(actualTheme);

  const handleBackPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'automatic') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    changeTheme(newTheme);

    // Small delay for visual feedback before going back
    setTimeout(() => {
      router.back();
    }, 300);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('ui.settings.theme'),
          headerStyle: { backgroundColor: colors.background.dark },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { fontWeight: '800' },
          headerLeft: () => (
            <TouchableOpacity onPress={handleBackPress}>
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <LinearGradient
        colors={colors.background.gradient}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
              {t('ui.settings.themeSubtitle')}
            </Text>

            <ThemeOption
              title={t('ui.settings.light')}
              subtitle={t('ui.settings.lightSubtitle')}
              icon={<Sun size={24} color={colors.accent.amber} />}
              isSelected={themeMode === 'light'}
              onPress={() => handleThemeChange('light')}
              colors={colors}
              actualTheme={actualTheme}
            />

            <ThemeOption
              title={t('ui.settings.dark')}
              subtitle={t('ui.settings.darkSubtitle')}
              icon={<Moon size={24} color={colors.accent.blue} />}
              isSelected={themeMode === 'dark'}
              onPress={() => handleThemeChange('dark')}
              colors={colors}
              actualTheme={actualTheme}
            />

            <ThemeOption
              title={t('ui.settings.auto')}
              subtitle={t('ui.settings.autoSubtitle')}
              icon={<Smartphone size={24} color={colors.accent.emerald} />}
              isSelected={themeMode === 'automatic'}
              onPress={() => handleThemeChange('automatic')}
              colors={colors}
              actualTheme={actualTheme}
            />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
    lineHeight: 20,
  },
  themeOption: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeSubtitle: {
    fontSize: 13,
  },
});
