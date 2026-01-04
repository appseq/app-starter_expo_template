/**
 * Article Types for Wikipedia Integration
 *
 * Defines types for fetching, caching, and displaying jewelry-related
 * articles from Wikipedia and other sources.
 */

// Re-export multi-source types for convenience
export type {
  Article,
  ArticleSourceType,
  RSSFeedConfig,
  CuratedSourceConfig,
  SourceFetchResult,
  ArticleSourceService,
} from './articleSources';

// Article category for filtering and display
export type ArticleCategory =
  | 'Gemstones'
  | 'Jewelry History'
  | 'Materials'
  | 'Techniques'
  | 'Styles'
  | 'Care';

// Main article interface - represents a Wikipedia article
// Extended with optional source fields for multi-source compatibility
export interface WikipediaArticle {
  id: string;                  // Unique identifier (pageId as string)
  pageId: number;              // Wikipedia page ID
  title: string;               // Article title
  category: ArticleCategory;   // Display category
  image: string | null;        // Full-size image URL
  thumbnail: string | null;    // Thumbnail image URL (400px)
  summary: string;             // Short description (first sentence)
  extract: string;             // Full intro text
  url: string;                 // Wikipedia article URL
  lastModified: string;        // ISO date of last Wikipedia update
  fetchedAt: number;           // Timestamp when we fetched it
  // Optional source fields for multi-source compatibility
  source?: 'wikipedia';        // Source type
  sourceName?: string;         // Human-readable source name
}

// Cache structure stored in AsyncStorage
export interface ArticleCache {
  articles: WikipediaArticle[];
  lastFetchedAt: number;       // When cache was last populated
  expiresAt: number;           // When cache should be refreshed
  version: number;             // Cache version for migrations
}

// State for the useArticles hook
export interface ArticleState {
  articles: WikipediaArticle[];
  isLoading: boolean;
  error: string | null;
  lastRefreshed: number | null;
}

// Display-friendly article format for WikiCard component
export interface ArticleCardData {
  id: string;
  title: string;
  category: string;
  image: string;
  summary?: string;
  // Optional source fields for multi-source articles
  source?: string;
  sourceName?: string;
}

// Wikipedia API response types
export interface WikipediaQueryResponse {
  query?: {
    pages?: Record<string, WikipediaPage>;
  };
}

export interface WikipediaPage {
  pageid?: number;
  ns?: number;
  title?: string;
  extract?: string;
  thumbnail?: {
    source?: string;
    width?: number;
    height?: number;
  };
  original?: {
    source?: string;
    width?: number;
    height?: number;
  };
  fullurl?: string;
  touched?: string;
  missing?: boolean;
}

// Cache validation result
export interface CacheValidation {
  isValid: boolean;
  reason?: 'expired' | 'corrupted' | 'empty' | 'version_mismatch';
}
