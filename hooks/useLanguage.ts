import { useState, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import {
  getLanguagePreference,
  setLanguagePreference as saveLanguagePreference,
  getLanguageDisplayName,
  SupportedLanguage,
} from '@/locales';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [languagePreference, setLanguagePreferenceState] = useState<SupportedLanguage>('auto');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const preference = await getLanguagePreference();
      setLanguagePreferenceState(preference);
    } catch (error) {
      console.error('Error loading language preference:', error);
      // Fallback to 'auto' on error - already set as initial state
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (language: SupportedLanguage) => {
    setLanguagePreferenceState(language);
    await saveLanguagePreference(language);
  };

  // Compute display name from current preference
  const languageDisplayName = getLanguageDisplayName(languagePreference);

  return {
    languagePreference,
    languageDisplayName,
    changeLanguage,
    isLoading,
  };
});
