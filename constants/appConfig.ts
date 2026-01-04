import baseConfig from '../config/config.json';
import Colors from './internal/colors';

/**
 * ============================================
 * APP TEMPLATE - MASTER CONFIGURATION
 * ============================================
 *
 * This file extends config.json with TypeScript-specific configuration.
 *
 * Base configuration (app name, version, bundle IDs, etc.) is in config.json
 * This file adds:
 * - TypeScript types
 * - Runtime configuration (env vars)
 * - Feature flags
 * - AI/Service configuration
 * - UI content and onboarding
 * - Demo data
 *
 * TEMPLATE USAGE:
 * 1. Update config.json with your app's identity (name, bundle IDs, etc.)
 * 2. Update AI prompts in ai.identificationPrompt for your domain
 * 3. Customize onboarding slides with your app's content
 * 4. Update demo.samples with domain-specific examples
 *
 * To change basic config: Edit config.json
 * To change features/logic: Edit this file
 */

export const APP_CONFIG = {
  // ============================================
  // CRITICAL CONFIGURATIONS (from config.json)
  // ============================================
  critical: {
    bundleId: baseConfig.bundleId,
    appStore: baseConfig.appStore,
    support: baseConfig.support,

    // Services configuration (from config.json)
    services: {
      revenueCat: baseConfig.services.revenueCat,
      superwall: baseConfig.services.superwall,
      aiProxy: {
        partialKey: process.env.EXPO_PUBLIC_AIPROXY_PARTIAL_KEY || '',
        serviceUrl: process.env.EXPO_PUBLIC_AIPROXY_SERVICE_URL || '',
        deviceCheckBypass: process.env.EXPO_PUBLIC_AIPROXY_DEVICECHECK_BYPASS || '',
      },
      eas: baseConfig.services.eas,
    },

    build: baseConfig.build,
  },

  // ============================================
  // APP IDENTITY (from config.json)
  // ============================================
  app: {
    ...baseConfig.app,
    name: baseConfig.app.name || 'App Template',
    displayName: baseConfig.app.name || 'App Template',
    orientation: 'portrait' as const,
  },

  // ============================================
  // PLATFORM SETTINGS (from config.json)
  // ============================================
  ios: {
    bundleIdentifier: baseConfig.bundleId.ios,
    supportsTablet: baseConfig.ios.supportsTablet,
    appleTeamId: baseConfig.appStore.appleTeamId,
    permissions: baseConfig.ios.permissions,
  },

  android: {
    package: baseConfig.bundleId.android,
    permissions: baseConfig.android.permissions,
  },

  // ============================================
  // AI SERVICE CONFIGURATION
  // ============================================
  ai: {
    serviceUrl: process.env.EXPO_PUBLIC_AIPROXY_SERVICE_URL || 'https://api.aiproxy.com/dcf3b5ed/ad5dcc2e',
    model: 'gpt-4o',
    maxTokens: 1000,
    temperature: 0.3,
    timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),

    // TEMPLATE: Update these for your domain (e.g., 'plant', 'bird', 'rock')
    objectType: 'item',
    objectTypePlural: 'items',

    // TEMPLATE: Customize this prompt for your identification domain
    identificationPrompt: `Analyze this image and identify the object.

IMPORTANT: You MUST respond with valid JSON format only, no other text.

If the image is unclear, too dark, or cannot be analyzed, respond with this JSON:
{
  "name": "Unable to Identify",
  "confidence": 0,
  "composition": [],
  "formation": "Image quality insufficient for analysis",
  "locations": [],
  "uses": [],
  "funFact": "Please provide a clear, well-lit image for accurate identification"
}

For identifiable objects, respond with:
{
  "name": "Object name and type",
  "confidence": 0-100,
  "composition": ["material1", "material2"] (components or materials - max 6),
  "formation": "How it was made, formed, or its origin story",
  "locations": ["region1", "region2"] (where found or originated),
  "uses": ["use1", "use2"] (purposes or applications - max 4),
  "funFact": "An interesting fact about this object"
}

Provide accurate, educational information about the identified object.`,

    responseFields: {
      name: 'name',
      confidence: 'confidence',
      composition: 'composition',
      formation: 'formation',
      locations: 'locations',
      uses: 'uses',
      funFact: 'funFact',
    },
  },

  // ============================================
  // SUBSCRIPTION & LIMITS (from config.json)
  // ============================================
  subscription: {
    freeDailyLimit: baseConfig?.subscription?.freeDailyLimit ?? 3,
    freeDailyLimitTestMode: baseConfig?.subscription?.freeDailyLimitTestMode ?? 10,
    paywallXButtonDelay: 1000,
    paywallProvider: 'superwall' as 'revenuecat' | 'superwall',
  },

  // ============================================
  // APPEARANCE SETTINGS (from config.json)
  // ============================================
  appearance: {
    makeThemeSelectorAvailable: (baseConfig as any)?.appearance?.makeThemeSelectorAvailable ?? true,
    defaultTheme: ((baseConfig as any)?.appearance?.defaultTheme ?? 'dark') as 'light' | 'dark',
  },

  // ============================================
  // ONBOARDING CONTENT
  // ============================================
  // TEMPLATE: Onboarding uses translations from locales/*/translation.json
  // The OnboardingScreen component displays a single slide with:
  // - Title, subtitle, description from translations
  // - Solid background color (teal gradient)
  // - Get Started button
  // To customize: Edit onboarding.slides.slide1 in translation files
  onboarding: {
    // Background colors for the onboarding screen
    backgroundColor: Colors.primary.teal,
    backgroundGradient: [Colors.primary.teal, Colors.primary.tealDark],
    accentColor: Colors.accent.gold,
  },

  // ============================================
  // EXTERNAL SERVICES (from config.json)
  // ============================================
  services: {
    aiproxy: {
      partialKey: process.env.EXPO_PUBLIC_AIPROXY_PARTIAL_KEY || '',
      deviceCheckBypass: process.env.EXPO_PUBLIC_AIPROXY_DEVICECHECK_BYPASS || '',
    },
    eas: baseConfig.services.eas,
    router: baseConfig.services.router,
  },

  // ============================================
  // ASSETS (from config.json)
  // ============================================
  assets: baseConfig.assets,

  // ============================================
  // VISUAL SEARCH CONFIGURATION
  // ============================================
  // TEMPLATE: Update domains for your domain-specific marketplaces
  visualSearch: {
    domains: [
      // General marketplaces
      'ebay.com',
      'etsy.com',
      'amazon.com',
      // TEMPLATE: Add domain-specific marketplaces here
    ],
    maxResults: 5,
    cacheEmptyResultsMs: 2 * 60 * 1000, // 2 min for failures (retry sooner)
    cacheSuccessMs: 15 * 60 * 1000,     // 15 min for success
    timeout: 15000, // 15 seconds
  },

  // ============================================
  // GOOGLE CLOUD VISION CONFIGURATION
  // ============================================
  // FREE tier: 1,000 units/month
  // Used to analyze jewelry images and extract labels for improved search
  googleVision: {
    enabled: !!process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY,
    apiKey: process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || '',
    minConfidence: 0.6,
    maxLabels: 10,
  },

  // ============================================
  // JINA AI CONFIGURATION
  // ============================================
  // Used for web search (visual matches and appraisal) - fallback
  jina: {
    apiKey: process.env.EXPO_PUBLIC_JINA_API_KEY || '',
    searchUrl: 'https://s.jina.ai/',
    readerUrl: 'https://r.jina.ai/',
  },

  // ============================================
  // EXA AI CONFIGURATION
  // ============================================
  // Primary search service for visual matches (better semantic search)
  // Get your API key from https://exa.ai
  exa: {
    apiKey: process.env.EXPO_PUBLIC_EXA_API_KEY || '',
  },

  // ============================================
  // ARTICLES CONFIGURATION
  // ============================================
  // TEMPLATE: Update topics and categories for your domain
  articles: {
    cacheKey: 'wikipedia_articles_cache',
    cacheDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    cacheVersion: 1,
    maxArticles: 10,
    displayBatchSize: 6,
    fallbackImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',

    // TEMPLATE: Add Wikipedia page titles for your domain
    topics: [] as string[],

    // TEMPLATE: Map topics to categories
    categoryMapping: {} as Record<string, string>,

    // TEMPLATE: Define categories for your domain
    categories: ['General', 'History', 'Types', 'Care'],

    // ============================================
    // React Query Configuration
    // ============================================
    staleTimeMs: 6 * 60 * 60 * 1000,        // 6 hours - data considered fresh
    cacheTimeMs: 24 * 60 * 60 * 1000,       // 24 hours - kept in memory
    refetchIntervalMs: 24 * 60 * 60 * 1000, // 24 hours - auto refresh interval
    prefetchBatchSize: 6,                    // Number of images to prefetch
    prefetchThumbnails: true,                // Enable thumbnail prefetching

    // Query keys for React Query cache management
    queryKeys: {
      all: ['articles'] as const,
      list: ['articles', 'list'] as const,
      detail: (id: string) => ['articles', 'detail', id] as const,
    },

    // ============================================
    // RSS Feeds Configuration
    // ============================================
    // TEMPLATE: Add RSS feeds for your domain
    rssFeeds: [] as Array<{ url: string; name: string; category: string; enabled: boolean }>,

    // ============================================
    // Curated External Sources Configuration
    // ============================================
    // TEMPLATE: Add domain-specific educational sources
    curatedSources: [] as Array<{ domain: string; name: string; category: string; searchQuery?: string; enabled: boolean }>,

    // Source-specific cache durations
    sourceCacheDurations: {
      wikipedia: 7 * 24 * 60 * 60 * 1000,   // 7 days
      rss: 24 * 60 * 60 * 1000,              // 24 hours
      external: 24 * 60 * 60 * 1000,         // 24 hours
    },
  },

  // ============================================
  // DEMO DATA
  // ============================================
  // TEMPLATE: Add domain-specific demo samples for App Store screenshots
  demo: {
    enabled: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
    samples: [
      {
        name: 'Sample Item 1',
        confidence: 95,
        composition: ['Material A', 'Material B'],
        formation: 'Description of how this item was created or formed',
        locations: ['Location 1', 'Location 2'],
        uses: ['Use Case 1', 'Use Case 2'],
        funFact: 'An interesting fact about this type of item',
      },
      {
        name: 'Sample Item 2',
        confidence: 92,
        composition: ['Material C', 'Material D'],
        formation: 'Description of item formation or manufacturing process',
        locations: ['Location 3', 'Location 4'],
        uses: ['Use Case 3', 'Use Case 4'],
        funFact: 'Another interesting fact for educational purposes',
      },
      {
        name: 'Sample Item 3',
        confidence: 88,
        composition: ['Material E', 'Material F'],
        formation: 'Details about craftsmanship or natural formation',
        locations: ['Location 5', 'Location 6'],
        uses: ['Use Case 5', 'Use Case 6'],
        funFact: 'A third educational fact about this category',
      },
    ],
  },
};

// Type exports for TypeScript support
export type AppConfig = typeof APP_CONFIG;
export type DemoSample = (typeof APP_CONFIG.demo.samples)[0];
export type CuratedSource = (typeof APP_CONFIG.articles.curatedSources)[0];

/**
 * Get only enabled curated sources
 * Useful for iterating over sources that should be fetched
 */
export function getEnabledCuratedSources(): CuratedSource[] {
  return APP_CONFIG.articles.curatedSources.filter((s) => s.enabled);
}

/**
 * Get curated sources by category
 */
export function getCuratedSourcesByCategory(category: string): CuratedSource[] {
  return APP_CONFIG.articles.curatedSources.filter(
    (s) => s.enabled && s.category === category
  );
}

// Helper function to get config value with fallback
export function getConfigValue<T>(path: string, fallback: T): T {
  const keys = path.split('.');
  let value: any = APP_CONFIG;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      return fallback;
    }
  }

  return value as T;
}

// Helper to get critical configs with validation
export function getCriticalConfig(key: keyof typeof APP_CONFIG.critical): any {
  const value = APP_CONFIG.critical[key];
  if (!value) {
    console.error(`Critical configuration missing: ${key}`);
    console.error('Please update config.json or APP_CONFIG.critical in appConfig.ts');
  }
  return value;
}

// Export default for backward compatibility
export default APP_CONFIG;
