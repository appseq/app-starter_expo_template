import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en/translation.json';
import nl from './nl/translation.json';
import fr from './fr/translation.json';
import de from './de/translation.json';

const LANGUAGE_STORAGE_KEY = 'userLanguagePreference';

const resources = {
  en: { translation: en },
  nl: { translation: nl },
  fr: { translation: fr },
  de: { translation: de },
};

export const SUPPORTED_LANGUAGES = {
  auto: 'auto', // Device language
  en: 'en',
  fr: 'fr',
  nl: 'nl',
  de: 'de',
} as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];

// Get device language - check both language and locale
const getDeviceLanguage = (): string => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const primaryLocale = locales[0];
    // Extract language code (e.g., 'en' from 'en-US', 'nl' from 'nl-NL')
    const languageCode = primaryLocale.languageCode;

    // Check if we support this language
    if (languageCode && resources[languageCode as keyof typeof resources]) {
      return languageCode;
    }
  }

  // Fallback to English
  return 'en';
};

// Get stored language preference or device language
const getInitialLanguage = async (): Promise<string> => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (storedLanguage && storedLanguage !== 'auto') {
      // User has set a manual language preference
      return storedLanguage;
    }

    // Use device language (either stored as 'auto' or not set)
    return getDeviceLanguage();
  } catch (error) {
    console.error('Error loading language preference:', error);
    return getDeviceLanguage();
  }
};

// Save language preference
export const setLanguagePreference = async (language: SupportedLanguage): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    // If 'auto', use device language
    const languageToUse = language === 'auto' ? getDeviceLanguage() : language;

    // Change i18n language
    await i18n.changeLanguage(languageToUse);

    console.log(`✅ Language changed to: ${language} (using: ${languageToUse})`);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

// Get current language preference (including 'auto')
export const getLanguagePreference = async (): Promise<SupportedLanguage> => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (storedLanguage as SupportedLanguage) || 'auto';
  } catch (error) {
    console.error('Error loading language preference:', error);
    return 'auto';
  }
};

// Language display names (native names for each language)
const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  auto: 'Device Language',
  en: 'English',
  fr: 'Français',
  nl: 'Nederlands',
  de: 'Deutsch',
};

// Get human-readable display name for a language preference
export const getLanguageDisplayName = (language: SupportedLanguage): string => {
  return LANGUAGE_DISPLAY_NAMES[language] ?? LANGUAGE_DISPLAY_NAMES.auto;
};

// Initialize i18n with async language loading
const initializeI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Important for React Native
    },
  });

  console.log('✅ i18n initialized:', i18n.isInitialized, 'Language:', initialLanguage);
};

// Start initialization
initializeI18n();

export default i18n;
