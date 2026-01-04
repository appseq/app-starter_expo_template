// Jewelry Identifier Theme - Teal/Gold Luxury Palette
// Inspired by premium jewelry aesthetics

// Flat color object for reference app compatibility
const Colors = {
  // Primary teal colors (main backgrounds)
  primary: {
    teal: '#2D6B5C',        // Deep forest teal (main background)
    tealDark: '#1A4D3E',    // Darker teal variant
    tealLight: '#3D8B7A',   // Lighter teal variant
    slate: '#2D3436',       // Secondary dark (tab bar)
    slateDark: '#1E2526',   // Darker slate
    slateLight: '#404647',  // Lighter slate
  },
  // Gold accent colors (buttons, highlights)
  accent: {
    gold: '#C9A055',        // Warm gold (primary accent)
    goldLight: '#DDB86A',   // Lighter gold
    goldDark: '#A88A45',    // Darker gold
    amber: '#E07C24',       // Vibrant amber (alternative accent)
    amberLight: '#F09D4A',  // Lighter amber
    amberDark: '#C46A1A',   // Darker amber
    coral: '#E85A5A',       // Value/price highlights
    crystal: '#5BB3C9',     // Teal accent for badges
    crystalLight: '#7ECCE0',// Lighter crystal
  },
  // Neutral colors
  neutral: {
    cream: '#F5F1E8',       // Light backgrounds
    creamLight: '#FAF8F3',  // Lighter cream
    creamDark: '#E8E2D5',   // Darker cream
    stone: '#F0EDE5',       // Stone background (cards)
    stoneLight: '#F7F5F0',  // Lighter stone
    stoneDark: '#DDD8CC',   // Darker stone
    charcoal: '#1A1A1A',    // Dark text
    obsidian: '#1A1A1A',    // Black variant
    obsidianLight: '#2D2D2D',
    granite: '#6B7280',     // Muted text
    graniteLight: '#9CA3AF',// Lighter granite
    white: '#FFFFFF',
    black: '#000000',
  },
  // Background colors
  background: {
    dark: '#2D6B5C',        // Primary dark bg (teal)
    light: '#F5F1E8',       // Light bg (cream)
    card: '#FFFDF8',        // Card background
    overlay: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(30, 30, 30, 0.92)',  // Glass morphism
    glassBorder: 'rgba(255, 255, 255, 0.08)',
  },
  // Text colors
  text: {
    primary: '#1A1A1A',     // Dark text on light bg
    secondary: '#4B5563',   // Secondary text
    light: '#FFFFFF',       // Light text on dark bg
    muted: '#6B7280',       // Muted/disabled text
    accent: '#C9A055',      // Gold accent text
  },
  // Status colors
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  // Jewelry-specific colors (for badges and categories)
  jewelry: {
    gold: '#FFD700',        // Pure gold
    roseGold: '#B76E79',    // Rose gold
    silver: '#C0C0C0',      // Silver
    platinum: '#E5E4E2',    // Platinum
    diamond: '#B9F2FF',     // Diamond blue
    ruby: '#E0115F',        // Ruby red
    emerald: '#50C878',     // Emerald green
    sapphire: '#0F52BA',    // Sapphire blue
    pearl: '#F0EAD6',       // Pearl cream
    amethyst: '#9966CC',    // Amethyst purple
    topaz: '#FFC87C',       // Topaz yellow
    opal: '#A8C3BC',        // Opal iridescent
  },
  // Category colors (for type badges) - unified slate color for clean look
  categories: {
    ring: '#2D3436',        // Slate (unified)
    necklace: '#2D3436',    // Slate (unified)
    earring: '#2D3436',     // Slate (unified)
    bracelet: '#2D3436',    // Slate (unified)
    brooch: '#2D3436',      // Slate (unified)
    watch: '#2D3436',       // Slate
    gemstone: '#2D3436',    // Slate (unified)
  },
  // Rarity colors
  rarity: {
    common: '#6B7280',      // Gray
    uncommon: '#10B981',    // Green
    rare: '#3B82F6',        // Blue
    veryRare: '#8B5CF6',    // Purple
    legendary: '#F59E0B',   // Gold
  },
  // Surface colors (glass morphism, overlays)
  surface: {
    glass: 'rgba(255, 255, 255, 0.05)',
    glassStrong: 'rgba(255, 255, 255, 0.12)',
    glassEdge: 'rgba(201, 160, 85, 0.2)',  // Gold tinted edge
    dark: 'rgba(0, 0, 0, 0.4)',
    card: '#FFFDF8',
    cardDark: '#2D3B35',
  },
};

// Theme-specific color sets for backward compatibility
export const darkColors = {
  primary: {
    dark: Colors.primary.tealDark,
    medium: Colors.primary.teal,
    light: Colors.primary.tealLight,
    vibrant: Colors.primary.tealLight,
  },
  accent: {
    electric: Colors.accent.gold,
    neon: Colors.accent.goldLight,
    lime: Colors.accent.goldDark,
    gold: Colors.accent.gold,
    purple: Colors.jewelry.amethyst,
    coral: Colors.accent.coral,
    blue: Colors.accent.crystal,
    emerald: Colors.jewelry.emerald,
    amber: Colors.accent.amber,
    red: Colors.accent.coral,
  },
  surface: {
    glass: Colors.surface.glass,
    glassStrong: Colors.surface.glassStrong,
    glassEdge: Colors.surface.glassEdge,
    dark: Colors.surface.dark,
    card: Colors.neutral.cream,
    cardDark: Colors.surface.cardDark,
  },
  text: {
    primary: '#FAF8F3',           // Cream - bright on dark backgrounds
    secondary: '#E8DFD0',         // Warm cream - secondary text
    muted: '#B8A88A',             // Muted gold-tinted
    accent: Colors.accent.gold,   // Gold accent
    light: '#FFFFFF',             // Pure white option
  },
  background: {
    primary: Colors.primary.teal,
    secondary: Colors.primary.tealDark,
    tertiary: Colors.primary.tealLight,
    dark: Colors.primary.tealDark,
    darker: '#0D201B',
    gradient: [Colors.primary.tealLight, Colors.primary.teal, Colors.primary.tealDark] as const,
    mesh: [Colors.primary.teal, Colors.primary.tealLight, Colors.primary.tealDark, '#0D201B'] as const,
  },
  zophi: {
    forestGreen: Colors.primary.teal,
    darkGreen: Colors.primary.tealDark,
    bronze: Colors.accent.gold,
    gold: Colors.accent.gold,
    cream: Colors.neutral.cream,
    beige: Colors.neutral.creamDark,
    warmBrown: Colors.accent.goldDark,
    scanFrame: Colors.accent.gold,
    tabBarDark: Colors.neutral.charcoal,
  },
};

export const lightColors = {
  primary: {
    dark: Colors.primary.teal,
    medium: Colors.primary.tealLight,
    light: '#4A9D8A',
    vibrant: Colors.primary.teal,
  },
  accent: {
    electric: Colors.accent.gold,
    neon: Colors.accent.goldLight,
    lime: Colors.accent.goldDark,
    gold: Colors.accent.gold,
    purple: Colors.jewelry.amethyst,
    coral: Colors.accent.coral,
    blue: Colors.accent.crystal,
    emerald: Colors.jewelry.emerald,
    amber: Colors.accent.amber,
    red: Colors.accent.coral,
  },
  surface: {
    glass: 'rgba(255, 255, 255, 0.9)',
    glassStrong: 'rgba(255, 255, 255, 0.95)',
    glassEdge: Colors.surface.glassEdge,
    dark: 'rgba(0, 0, 0, 0.05)',
    card: Colors.neutral.white,
    cardDark: Colors.neutral.cream,
  },
  text: {
    primary: Colors.text.primary,
    secondary: Colors.text.secondary,
    muted: Colors.text.muted,
    accent: Colors.primary.teal,
  },
  background: {
    primary: Colors.neutral.cream,
    secondary: Colors.neutral.creamDark,
    tertiary: Colors.neutral.stoneDark,
    dark: Colors.neutral.creamLight,
    darker: Colors.neutral.stone,
    gradient: [Colors.neutral.cream, Colors.neutral.creamDark, Colors.neutral.stoneDark] as const,
    mesh: [Colors.neutral.cream, Colors.neutral.creamLight, Colors.neutral.creamDark, Colors.neutral.stoneDark] as const,
  },
  zophi: {
    forestGreen: Colors.primary.teal,
    darkGreen: Colors.primary.tealDark,
    bronze: Colors.accent.gold,
    gold: Colors.accent.gold,
    cream: Colors.neutral.cream,
    beige: Colors.neutral.creamDark,
    warmBrown: Colors.accent.goldDark,
    scanFrame: Colors.accent.gold,
    tabBarDark: Colors.neutral.charcoal,
  },
};

// Legacy exports for backward compatibility
export const colors = darkColors;

export const getColors = (theme: 'light' | 'dark') => {
  return theme === 'light' ? lightColors : darkColors;
};

// New default export - flat color object (reference app style)
export default Colors;