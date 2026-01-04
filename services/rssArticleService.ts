/**
 * RSSArticleService - Fetches articles from jewelry industry RSS feeds
 *
 * Uses Jina Reader API to parse and extract content from RSS feeds.
 * Implements AsyncStorage caching with configurable TTL.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/appConfig';
import type {
  Article,
  ArticleSourceService,
  RSSFeedConfig,
  RSSItem,
  SourceArticleCache,
} from '@/types/articleSources';
import type { ArticleCategory } from '@/types/articles';

class RSSArticleService implements ArticleSourceService {
  private static instance: RSSArticleService;

  private readonly CACHE_KEY = 'rss_articles_cache';
  private readonly CACHE_VERSION = 1;
  private readonly TIMEOUT_MS = 15000;
  private readonly MAX_ARTICLES_PER_FEED = 5;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RSSArticleService {
    if (!RSSArticleService.instance) {
      RSSArticleService.instance = new RSSArticleService();
    }
    return RSSArticleService.instance;
  }

  /**
   * Check if RSS fetching is enabled and properly configured
   */
  isEnabled(): boolean {
    const feeds = APP_CONFIG.articles.rssFeeds || [];
    const hasApiKey = !!APP_CONFIG.jina?.apiKey;
    const hasEnabledFeeds = feeds.some((f) => f.enabled);

    if (!hasApiKey) {
      console.log('[RSSArticleService] Disabled: No Jina API key configured');
      return false;
    }

    if (!hasEnabledFeeds) {
      console.log('[RSSArticleService] Disabled: No feeds enabled');
      return false;
    }

    return true;
  }

  /**
   * Fetch articles from all enabled RSS feeds
   * Returns cached articles if available and not expired
   */
  async fetchArticles(): Promise<Article[]> {
    if (!this.isEnabled()) {
      return [];
    }

    try {
      // Check cache first
      const cached = await this.getCachedArticles();
      if (cached) {
        console.log('[RSSArticleService] Using cached articles:', cached.length);
        return cached;
      }

      // Fetch from all enabled feeds
      const feeds = (APP_CONFIG.articles.rssFeeds || []).filter((f) => f.enabled) as RSSFeedConfig[];
      console.log('[RSSArticleService] Fetching from', feeds.length, 'feeds');

      const results = await Promise.allSettled(
        feeds.map((feed) => this.fetchFeed(feed))
      );

      // Collect successful results
      const articles: Article[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          articles.push(...result.value);
        } else {
          console.warn(
            `[RSSArticleService] Feed "${feeds[index].name}" failed:`,
            result.reason?.message || 'Unknown error'
          );
        }
      });

      console.log('[RSSArticleService] Fetched total:', articles.length, 'articles');

      // Cache successful results
      if (articles.length > 0) {
        await this.saveToCache(articles);
      }

      return articles;
    } catch (error: any) {
      console.error('[RSSArticleService] Fetch error:', error?.message || error);
      // Return empty array on error - let aggregator handle fallback
      return [];
    }
  }

  /**
   * Fetch and parse a single RSS feed using Jina Reader
   */
  private async fetchFeed(feed: RSSFeedConfig): Promise<Article[]> {
    const jinaReaderUrl = `${APP_CONFIG.jina.readerUrl}${encodeURIComponent(feed.url)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(jinaReaderUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Return-Format': 'json',
          ...(APP_CONFIG.jina.apiKey && {
            Authorization: `Bearer ${APP_CONFIG.jina.apiKey}`,
          }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Jina Reader error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseRSSResponse(data, feed);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`Timeout fetching feed: ${feed.name}`);
      }

      throw error;
    }
  }

  /**
   * Parse Jina Reader response into Article format
   */
  private parseRSSResponse(data: any, feed: RSSFeedConfig): Article[] {
    // Jina Reader may return different formats depending on the feed
    const items: RSSItem[] = data.items || data.entries || data.data?.items || [];
    const now = Date.now();

    if (!Array.isArray(items) || items.length === 0) {
      console.log(`[RSSArticleService] No items found in feed: ${feed.name}`);
      return [];
    }

    return items.slice(0, this.MAX_ARTICLES_PER_FEED).map((item, index): Article => ({
      id: `rss_${this.sanitizeForId(feed.name)}_${index}_${now}`,
      title: this.cleanText(item.title || 'Untitled'),
      category: feed.category as ArticleCategory,
      image: item.image || item.thumbnail || null,
      thumbnail: item.thumbnail || item.image || null,
      summary: this.extractSummary(item.description || item.content || ''),
      extract: this.cleanText(item.content || item.description || ''),
      url: item.link || item.url || '',
      source: 'rss',
      sourceName: feed.name,
      publishedAt: this.parseDate(item.published || item.pubDate),
      fetchedAt: now,
      author: item.author,
    }));
  }

  /**
   * Extract first sentence for summary
   */
  private extractSummary(text: string): string {
    // Remove HTML tags
    const cleaned = text.replace(/<[^>]*>/g, '').trim();

    // Match first sentence
    const firstSentence = cleaned.match(/^[^.!?]*[.!?]/);
    if (firstSentence) {
      return firstSentence[0].trim();
    }

    // Fallback: first 150 characters
    return cleaned.length > 150 ? cleaned.slice(0, 150).trim() + '...' : cleaned;
  }

  /**
   * Clean text by removing HTML and normalizing whitespace
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Sanitize string for use in ID
   */
  private sanitizeForId(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  }

  /**
   * Parse date string to timestamp
   */
  private parseDate(dateString?: string): number | undefined {
    if (!dateString) return undefined;

    try {
      const timestamp = new Date(dateString).getTime();
      return isNaN(timestamp) ? undefined : timestamp;
    } catch {
      return undefined;
    }
  }

  /**
   * Get cached articles if valid
   */
  private async getCachedArticles(): Promise<Article[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const parsed: SourceArticleCache = JSON.parse(cached);

      // Validate cache
      if (parsed.version !== this.CACHE_VERSION) {
        console.log('[RSSArticleService] Cache version mismatch, invalidating');
        return null;
      }

      if (Date.now() > parsed.expiresAt) {
        console.log('[RSSArticleService] Cache expired');
        return null;
      }

      if (!Array.isArray(parsed.articles) || parsed.articles.length === 0) {
        return null;
      }

      return parsed.articles;
    } catch (error) {
      console.warn('[RSSArticleService] Failed to read cache:', error);
      return null;
    }
  }

  /**
   * Save articles to cache
   */
  private async saveToCache(articles: Article[]): Promise<void> {
    const cacheDuration =
      APP_CONFIG.articles.sourceCacheDurations?.rss || 24 * 60 * 60 * 1000;

    const cache: SourceArticleCache = {
      articles,
      lastFetchedAt: Date.now(),
      expiresAt: Date.now() + cacheDuration,
      version: this.CACHE_VERSION,
    };

    try {
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      console.log('[RSSArticleService] Saved to cache:', articles.length, 'articles');
    } catch (error) {
      console.warn('[RSSArticleService] Failed to save cache:', error);
    }
  }

  /**
   * Clear the RSS articles cache
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('[RSSArticleService] Cache cleared');
    } catch (error) {
      console.warn('[RSSArticleService] Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const rssArticleService = RSSArticleService.getInstance();

// Export class for testing
export { RSSArticleService };
