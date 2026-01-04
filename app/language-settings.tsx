import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Smartphone } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { Haptics } from "@/utils/haptics";
import { Platform } from 'react-native';
import { getColors } from "@/constants/internal/colors";
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { SupportedLanguage } from '@/locales';
import { useLanguage } from '@/hooks/useLanguage';

interface LanguageOptionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  actualTheme: string;
}

function LanguageOption({ title, subtitle, icon, isSelected, onPress, colors, actualTheme }: LanguageOptionProps) {
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
      style={[styles.languageOption, cardStyle]}
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
      <View style={styles.languageOptionContent}>
        <View style={styles.languageIconContainer}>
          {icon}
        </View>
        <View style={styles.languageTextContainer}>
          <Text style={[styles.languageTitle, { color: colors.text.primary }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.languageSubtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
          )}
        </View>
        {isSelected && (
          <Check size={20} color={actualTheme === 'light' ? colors.primary.vibrant : colors.accent.blue} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function LanguageSettingsScreen() {
  const { t } = useTranslation();
  const themeContext = useTheme();
  const actualTheme = themeContext?.actualTheme || 'dark';
  const colors = getColors(actualTheme);
  const { languagePreference, changeLanguage } = useLanguage();

  const handleBackPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await changeLanguage(newLanguage);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('ui.settings.language'),
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
              {t('ui.settings.languageSubtitle')}
            </Text>

            <LanguageOption
              title={t('ui.settings.languageAuto')}
              subtitle={t('ui.settings.languageAutoSubtitle')}
              icon={<Smartphone size={24} color={colors.accent.blue} />}
              isSelected={languagePreference === 'auto'}
              onPress={() => handleLanguageChange('auto')}
              colors={colors}
              actualTheme={actualTheme}
            />

            <LanguageOption
              title={t('ui.settings.languageEnglish')}
              subtitle={t('ui.settings.languageEnglishSubtitle')}
              icon={<Text style={styles.flagEmoji}>🇬🇧</Text>}
              isSelected={languagePreference === 'en'}
              onPress={() => handleLanguageChange('en')}
              colors={colors}
              actualTheme={actualTheme}
            />

            <LanguageOption
              title={t('ui.settings.languageFrench')}
              subtitle={t('ui.settings.languageFrenchSubtitle')}
              icon={<Text style={styles.flagEmoji}>🇫🇷</Text>}
              isSelected={languagePreference === 'fr'}
              onPress={() => handleLanguageChange('fr')}
              colors={colors}
              actualTheme={actualTheme}
            />

            <LanguageOption
              title={t('ui.settings.languageDutch')}
              subtitle={t('ui.settings.languageDutchSubtitle')}
              icon={<Text style={styles.flagEmoji}>🇳🇱</Text>}
              isSelected={languagePreference === 'nl'}
              onPress={() => handleLanguageChange('nl')}
              colors={colors}
              actualTheme={actualTheme}
            />

            <LanguageOption
              title={t('ui.settings.languageGerman')}
              subtitle={t('ui.settings.languageGermanSubtitle')}
              icon={<Text style={styles.flagEmoji}>🇩🇪</Text>}
              isSelected={languagePreference === 'de'}
              onPress={() => handleLanguageChange('de')}
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
  languageOption: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  languageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  flagEmoji: {
    fontSize: 28,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageSubtitle: {
    fontSize: 13,
  },
});
