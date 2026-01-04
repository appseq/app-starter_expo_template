import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/appConfig';
import type {
  WikipediaArticle,
  ArticleCache,
  ArticleCategory,
  WikipediaQueryResponse,
  WikipediaPage,
  CacheValidation,
} from '@/types/articles';

/**
 * ArticleService - Fetches and caches jewelry-related Wikipedia articles
 *
 * Uses the MediaWiki API to fetch article summaries, images, and extracts.
 * Implements a 24-hour cache with AsyncStorage persistence.
 */
class ArticleService {
  private static instance: ArticleService;

  private readonly CACHE_KEY = APP_CONFIG.articles.cacheKey;
  private readonly CACHE_DURATION_MS = APP_CONFIG.articles.cacheDurationMs;
  private readonly CACHE_VERSION = APP_CONFIG.articles.cacheVersion;
  private readonly MAX_ARTICLES = APP_CONFIG.articles.maxArticles;
  private readonly FALLBACK_IMAGE = APP_CONFIG.articles.fallbackImage;
  private readonly TOPICS = APP_CONFIG.articles.topics;
  private readonly CATEGORY_MAPPING = APP_CONFIG.articles.categoryMapping;

  // Wikipedia API endpoint
  private readonly API_BASE = 'https://en.wikipedia.org/w/api.php';

  // Request timeout (15 seconds)
  private readonly TIMEOUT_MS = 15000;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ArticleService {
    if (!ArticleService.instance) {
      ArticleService.instance = new ArticleService();
    }
    return ArticleService.instance;
  }

  /**
   * Get articles, using cache if valid, otherwise fetch fresh
   */
  async getArticles(): Promise<WikipediaArticle[]> {
    try {
      // Try to get cached articles first
      const cached = await this.getCachedArticles();
      const validation = this.validateCache(cached);

      if (validation.isValid && cached) {
        console.log('[ArticleService] Using cached articles:', cached.articles.length);
        return cached.articles;
      }

      console.log('[ArticleService] Cache invalid:', validation.reason);

      // Fetch fresh articles
      const freshArticles = await this.fetchFromWikipedia();

      // Save to cache
      await this.saveToCache(freshArticles);

      return freshArticles;
    } catch (error) {
      console.error('[ArticleService] Error getting articles:', error);

      // Try to return stale cache as fallback
      const staleCache = await this.getCachedArticles();
      if (staleCache && staleCache.articles && staleCache.articles.length > 0) {
        console.log('[ArticleService] Returning stale cache as fallback');
        return staleCache.articles;
      }

      // Return empty array as last resort
      return [];
    }
  }

  /**
   * Force refresh articles from Wikipedia
   */
  async forceRefresh(): Promise<WikipediaArticle[]> {
    console.log('[ArticleService] Force refreshing articles...');
    try {
      const freshArticles = await this.fetchFromWikipedia();
      await this.saveToCache(freshArticles);
      return freshArticles;
    } catch (error) {
      console.error('[ArticleService] Force refresh failed:', error);
      throw error;
    }
  }

  /**
   * Fetch articles - alias for getArticles() for React Query compatibility
   */
  async fetchArticles(): Promise<WikipediaArticle[]> {
    return this.getArticles();
  }

  /**
   * Check if cache is stale and needs refresh
   */
  async isCacheStale(): Promise<boolean> {
    const cached = await this.getCachedArticles();
    const validation = this.validateCache(cached);
    return !validation.isValid;
  }

  /**
   * Clear the article cache
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('[ArticleService] Cache cleared');
    } catch (error) {
      console.error('[ArticleService] Failed to clear cache:', error);
    }
  }

  /**
   * Fetch articles from Wikipedia API
   */
  private async fetchFromWikipedia(): Promise<WikipediaArticle[]> {
    console.log('[ArticleService] Fetching from Wikipedia...');

    // Build query with multiple page titles
    const titles = this.TOPICS.slice(0, this.MAX_ARTICLES).join('|');

    const params = new URLSearchParams({
      action: 'query',
      titles: titles,
      prop: 'extracts|pageimages|info',
      exintro: '1', // Only intro section
      explaintext: '1', // Plain text, no HTML
      piprop: 'thumbnail|original',
      pithumbsize: '400',
      inprop: 'url',
      format: 'json',
      origin: '*', // CORS support
    });

    const url = `${this.API_BASE}?${params.toString()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }

      const data: WikipediaQueryResponse = await response.json();

      if (!data.query?.pages) {
        console.warn('[ArticleService] No pages in Wikipedia response');
        return [];
      }

      const articles = this.parseWikipediaResponse(data.query.pages);
      console.log('[ArticleService] Fetched articles:', articles.length);

      return articles;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Wikipedia request timed out');
      }
      throw error;
    }
  }

  /**
   * Parse Wikipedia API response into our article format
   */
  private parseWikipediaResponse(
    pages: Record<string, WikipediaPage>
  ): WikipediaArticle[] {
    const articles: WikipediaArticle[] = [];
    const now = Date.now();

    for (const pageId in pages) {
      const page = pages[pageId];

      // Skip missing pages
      if (page.missing || !page.pageid || !page.title) {
        continue;
      }

      // Get category from mapping, default to 'Gemstones'
      const categoryKey = page.title.replace(/ /g, '_');
      const category = (this.CATEGORY_MAPPING[categoryKey] ||
        this.CATEGORY_MAPPING[page.title] ||
        'Gemstones') as ArticleCategory;

      // Extract first sentence for summary
      const extract = page.extract || '';
      const summary = this.extractFirstSentence(extract);

      // Get image URLs
      const thumbnail = page.thumbnail?.source || null;
      const image = page.original?.source || thumbnail || this.FALLBACK_IMAGE;

      const article: WikipediaArticle = {
        id: String(page.pageid),
        pageId: page.pageid,
        title: this.cleanTitle(page.title),
        category,
        image,
        thumbnail: thumbnail || this.FALLBACK_IMAGE,
        summary,
        extract: this.cleanExtract(extract),
        url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
        lastModified: page.touched || new Date().toISOString(),
        fetchedAt: now,
      };

      articles.push(article);
    }

    // Sort by title for consistent ordering
    return articles.sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Extract first 2-3 sentences for a better summary
   */
  private extractFirstSentence(text: string): string {
    if (!text) return '';

    // Extract first 2 sentences for a more informative summary
    const sentences = text.match(/[^.!?]*[.!?]+/g);
    if (sentences && sentences.length > 0) {
      const summary = sentences.slice(0, 2).join(' ').trim();
      // Limit to ~200 chars if too long
      if (summary.length > 200) {
        return sentences[0].trim();
      }
      return summary;
    }

    // Fallback: take first 150 characters
    return text.slice(0, 150).trim() + (text.length > 150 ? '...' : '');
  }

  /**
   * Clean up article title (remove underscores, etc.)
   */
  private cleanTitle(title: string): string {
    return title.replace(/_/g, ' ').trim();
  }

  /**
   * Clean up extract text - preserve paragraphs, limit length
   */
  private cleanExtract(text: string): string {
    if (!text) return '';

    // First normalize line breaks (preserve paragraph structure)
    let cleaned = text
      .replace(/\r\n/g, '\n')           // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')       // Max 2 consecutive newlines
      .replace(/[ \t]+/g, ' ')          // Normalize spaces (not newlines)
      .trim();

    // Limit to ~500 words for readable length
    const words = cleaned.split(/\s+/);
    if (words.length > 500) {
      // Find a good break point (end of sentence near 500 words)
      const truncated = words.slice(0, 500).join(' ');
      const lastPeriod = truncated.lastIndexOf('.');
      if (lastPeriod > truncated.length * 0.7) {
        cleaned = truncated.slice(0, lastPeriod + 1);
      } else {
        cleaned = truncated + '...';
      }
    }

    return cleaned;
  }

  /**
   * Get cached articles from AsyncStorage
   */
  private async getCachedArticles(): Promise<ArticleCache | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached) as ArticleCache;
      return parsed;
    } catch (error) {
      console.error('[ArticleService] Failed to read cache:', error);
      return null;
    }
  }

  /**
   * Save articles to cache
   */
  private async saveToCache(articles: WikipediaArticle[]): Promise<void> {
    try {
      const cache: ArticleCache = {
        articles,
        lastFetchedAt: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION_MS,
        version: this.CACHE_VERSION,
      };

      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      console.log('[ArticleService] Saved to cache:', articles.length, 'articles');
    } catch (error) {
      console.error('[ArticleService] Failed to save cache:', error);
    }
  }

  /**
   * Validate cache structure and freshness
   */
  private validateCache(cache: ArticleCache | null): CacheValidation {
    if (!cache) {
      return { isValid: false, reason: 'empty' };
    }

    // Check version
    if (cache.version !== this.CACHE_VERSION) {
      return { isValid: false, reason: 'version_mismatch' };
    }

    // Check if expired
    if (Date.now() > cache.expiresAt) {
      return { isValid: false, reason: 'expired' };
    }

    // Check if articles array is valid
    if (!Array.isArray(cache.articles) || cache.articles.length === 0) {
      return { isValid: false, reason: 'corrupted' };
    }

    // Validate article structure (spot check first article)
    const firstArticle = cache.articles[0];
    if (!firstArticle.id || !firstArticle.title) {
      return { isValid: false, reason: 'corrupted' };
    }

    return { isValid: true };
  }

  /**
   * Get articles by category
   */
  filterByCategory(
    articles: WikipediaArticle[],
    category: ArticleCategory
  ): WikipediaArticle[] {
    return articles.filter((article) => article.category === category);
  }

  /**
   * Get a single article by ID
   */
  getArticleById(
    articles: WikipediaArticle[],
    id: string
  ): WikipediaArticle | null {
    return articles.find((article) => article.id === id) || null;
  }
}

// Export singleton instance
export const articleService = ArticleService.getInstance();

// Export class for testing
export { ArticleService };
