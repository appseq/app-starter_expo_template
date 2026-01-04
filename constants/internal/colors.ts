// Neutral Template Theme - Gray/Teal Palette
// Versatile neutral theme suitable for any app type

// Flat color object for reference app compatibility
const Colors = {
  // Primary gray colors (main backgrounds)
  primary: {
    main: '#1F2937',         // Gray-800 (main background)
    dark: '#111827',         // Gray-900
    light: '#374151',        // Gray-700
    slate: '#2D3436',        // Secondary dark (tab bar)
    slateDark: '#1E2526',    // Darker slate
    slateLight: '#404647',   // Lighter slate
  },
  // Teal/Cyan accent colors (buttons, highlights)
  accent: {
    primary: '#0D9488',      // Teal-600 (main accent)
    light: '#14B8A6',        // Teal-500
    dark: '#0F766E',         // Teal-700
    secondary: '#06B6D4',    // Cyan-500
    secondaryLight: '#22D3EE', // Cyan-400
    secondaryDark: '#0891B2',  // Cyan-600
    highlight: '#F59E0B',    // Amber for highlights
    danger: '#EF4444',       // Red for destructive actions
    // Backward compatibility aliases
    blue: '#06B6D4',         // Alias for secondary (cyan)
    emerald: '#10B981',      // Green accent
    purple: '#8B5CF6',       // Purple accent
    coral: '#EF4444',        // Alias for danger
    gold: '#F59E0B',         // Alias for highlight
  },
  // Neutral gray scale
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    black: '#000000',
  },
  // Background colors
  background: {
    dark: '#111827',         // Gray-900
    light: '#F9FAFB',        // Gray-50
    card: '#FFFFFF',         // White card background
    overlay: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(30, 30, 30, 0.92)',  // Glass morphism
    glassBorder: 'rgba(255, 255, 255, 0.08)',
  },
  // Text colors
  text: {
    primary: '#111827',      // Gray-900
    secondary: '#4B5563',    // Gray-600
    light: '#FFFFFF',        // Light text on dark bg
    muted: '#6B7280',        // Gray-500
    accent: '#0D9488',       // Teal-600
  },
  // Status colors
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  // Rarity colors (generic, useful for gamification)
  rarity: {
    common: '#6B7280',       // Gray
    uncommon: '#10B981',     // Green
    rare: '#3B82F6',         // Blue
    veryRare: '#8B5CF6',     // Purple
    legendary: '#F59E0B',    // Gold
  },
  // Surface colors (glass morphism, overlays)
  surface: {
    glass: 'rgba(255, 255, 255, 0.05)',
    glassStrong: 'rgba(255, 255, 255, 0.12)',
    glassEdge: 'rgba(255, 255, 255, 0.1)',  // Neutral edge
    dark: 'rgba(0, 0, 0, 0.4)',
    card: '#FFFFFF',
    cardDark: '#1F2937',
  },
};

// Theme-specific color sets for backward compatibility
export const darkColors = {
  primary: {
    dark: Colors.primary.dark,
    medium: Colors.primary.main,
    light: Colors.primary.light,
    vibrant: Colors.accent.primary,
  },
  accent: {
    electric: Colors.accent.primary,
    neon: Colors.accent.light,
    lime: Colors.accent.dark,
    gold: Colors.accent.highlight,
    purple: '#8B5CF6',
    coral: Colors.accent.danger,
    blue: Colors.accent.secondary,
    emerald: '#10B981',
    amber: Colors.accent.highlight,
    red: Colors.accent.danger,
  },
  surface: {
    glass: Colors.surface.glass,
    glassStrong: Colors.surface.glassStrong,
    glassEdge: Colors.surface.glassEdge,
    dark: Colors.surface.dark,
    card: Colors.neutral.gray100,
    cardDark: Colors.surface.cardDark,
  },
  text: {
    primary: '#F9FAFB',           // Gray-50 - bright on dark backgrounds
    secondary: '#E5E7EB',         // Gray-200 - secondary text
    muted: '#9CA3AF',             // Gray-400 - muted text
    accent: Colors.accent.primary,
    light: '#FFFFFF',
  },
  background: {
    primary: Colors.primary.main,
    secondary: Colors.primary.dark,
    tertiary: Colors.primary.light,
    dark: Colors.primary.dark,
    darker: '#030712',
    gradient: [Colors.primary.light, Colors.primary.main, Colors.primary.dark] as const,
    mesh: [Colors.primary.main, Colors.primary.light, Colors.primary.dark, '#030712'] as const,
  },
  app: {
    primary: Colors.primary.main,
    primaryDark: Colors.primary.dark,
    accent: Colors.accent.primary,
    accentLight: Colors.accent.light,
    light: Colors.neutral.gray50,
    lightAlt: Colors.neutral.gray100,
    dark: Colors.neutral.gray700,
    scanFrame: Colors.accent.primary,
    tabBarDark: Colors.neutral.gray900,
  },
};

export const lightColors = {
  primary: {
    dark: Colors.primary.main,
    medium: Colors.primary.light,
    light: Colors.neutral.gray400,
    vibrant: Colors.accent.primary,
  },
  accent: {
    electric: Colors.accent.primary,
    neon: Colors.accent.light,
    lime: Colors.accent.dark,
    gold: Colors.accent.highlight,
    purple: '#8B5CF6',
    coral: Colors.accent.danger,
    blue: Colors.accent.secondary,
    emerald: '#10B981',
    amber: Colors.accent.highlight,
    red: Colors.accent.danger,
  },
  surface: {
    glass: 'rgba(255, 255, 255, 0.9)',
    glassStrong: 'rgba(255, 255, 255, 0.95)',
    glassEdge: Colors.surface.glassEdge,
    dark: 'rgba(0, 0, 0, 0.05)',
    card: Colors.neutral.white,
    cardDark: Colors.neutral.gray100,
  },
  text: {
    primary: Colors.text.primary,
    secondary: Colors.text.secondary,
    muted: Colors.text.muted,
    accent: Colors.accent.primary,
    light: '#FFFFFF',
  },
  background: {
    primary: Colors.neutral.gray50,
    secondary: Colors.neutral.gray100,
    tertiary: Colors.neutral.gray200,
    dark: Colors.neutral.gray100,
    darker: Colors.neutral.gray200,
    gradient: [Colors.neutral.gray50, Colors.neutral.gray100, Colors.neutral.gray200] as const,
    mesh: [Colors.neutral.gray50, Colors.neutral.white, Colors.neutral.gray100, Colors.neutral.gray200] as const,
  },
  app: {
    primary: Colors.neutral.gray50,
    primaryDark: Colors.neutral.gray100,
    accent: Colors.accent.primary,
    accentLight: Colors.accent.light,
    light: Colors.neutral.gray50,
    lightAlt: Colors.neutral.gray100,
    dark: Colors.neutral.gray700,
    scanFrame: Colors.accent.primary,
    tabBarDark: Colors.neutral.gray900,
  },
};

// Legacy exports for backward compatibility
export const colors = darkColors;

export const getColors = (theme: 'light' | 'dark') => {
  return theme === 'light' ? lightColors : darkColors;
};

// New default export - flat color object (reference app style)
export default Colors;
