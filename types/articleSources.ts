/**
 * Article Source Types
 *
 * Defines interfaces for multi-source article fetching from Wikipedia, RSS feeds,
 * and external curated sources via Jina/Exa AI.
 */

import type { ArticleCategory } from './articles';

// ============================================
// Source Type Definitions
// ============================================

/**
 * Types of article sources supported
 */
export type ArticleSourceType = 'wikipedia' | 'rss' | 'jina' | 'exa';

/**
 * Unified article interface for all sources
 * Extends the core article fields with source attribution
 */
export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  image: string | null;
  thumbnail: string | null;
  summary: string;
  extract: string;
  url: string;
  source: ArticleSourceType;
  sourceName: string;
  publishedAt?: number;
  fetchedAt: number;
  author?: string;
  tags?: string[];
}

// ============================================
// RSS Feed Configuration
// ============================================

/**
 * Configuration for an RSS feed source
 */
export interface RSSFeedConfig {
  /** RSS feed URL */
  url: string;
  /** Human-readable source name */
  name: string;
  /** Default category for articles from this feed */
  category: ArticleCategory;
  /** Whether this feed is enabled */
  enabled: boolean;
}

/**
 * Parsed RSS item from a feed
 */
export interface RSSItem {
  title?: string;
  link?: string;
  url?: string;
  description?: string;
  content?: string;
  image?: string;
  thumbnail?: string;
  published?: string;
  pubDate?: string;
  author?: string;
}

// ============================================
// Curated Source Configuration
// ============================================

/**
 * Configuration for a curated external source
 */
export interface CuratedSourceConfig {
  /** Domain to search (e.g., 'gia.edu') */
  domain: string;
  /** Human-readable source name */
  name: string;
  /** Default category for articles from this source */
  category: ArticleCategory;
  /** Optional custom search query for this source */
  searchQuery?: string;
  /** Whether this source is enabled */
  enabled: boolean;
}

// ============================================
// Fetch Result Types
// ============================================

/**
 * Result of fetching from a single source
 */
export interface SourceFetchResult {
  source: ArticleSourceType;
  articles: Article[];
  success: boolean;
  error?: string;
  fetchedAt: number;
}

/**
 * Aggregated result from all sources
 */
export interface AggregatedFetchResult {
  articles: Article[];
  sources: {
    wikipedia: { success: boolean; count: number; error?: string };
    rss: { success: boolean; count: number; error?: string };
    external: { success: boolean; count: number; error?: string };
  };
  totalCount: number;
  fetchedAt: number;
}

// ============================================
// Cache Structures
// ============================================

/**
 * Cache structure for articles from a single source
 */
export interface SourceArticleCache {
  articles: Article[];
  lastFetchedAt: number;
  expiresAt: number;
  version: number;
}

/**
 * Combined cache structure for all sources
 */
export interface MultiSourceArticleCache {
  wikipedia: SourceArticleCache | null;
  rss: SourceArticleCache | null;
  external: SourceArticleCache | null;
}

// ============================================
// Service Interfaces
// ============================================

/**
 * Interface for article source services
 */
export interface ArticleSourceService {
  /** Check if this source is enabled and configured */
  isEnabled(): boolean;
  /** Fetch articles from this source */
  fetchArticles(): Promise<Article[]>;
  /** Clear cached articles */
  clearCache(): Promise<void>;
}
