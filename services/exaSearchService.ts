import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/appConfig';
import type { VisualMatch } from '@/types';

/**
 * Cache structure for Exa search results
 */
interface ExaSearchCache {
  results: Record<string, {
    matches: VisualMatch[];
    cachedAt: number;
  }>;
  version: number;
}

/**
 * Exa API search result
 */
interface ExaSearchResult {
  title: string;
  url: string;
  text?: string;
  highlights?: string[];
  image?: string;
  publishedDate?: string;
  author?: string;
}

/**
 * Exa API response
 */
interface ExaSearchResponse {
  results: ExaSearchResult[];
  requestId?: string;
}

/**
 * ExaSearchService - Searches for visually similar jewelry using Exa AI
 *
 * Exa provides semantic search with better content extraction than traditional
 * search APIs. It excels at finding relevant product listings and images.
 *
 * API Docs: https://docs.exa.ai
 */
class ExaSearchService {
  private static instance: ExaSearchService;

  // Cache configuration
  private readonly CACHE_KEY = 'exa_search_cache';
  private readonly CACHE_VERSION = 1;

  // API configuration
  private readonly API_URL = 'https://api.exa.ai/search';
  private readonly TIMEOUT_MS = 15000;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ExaSearchService {
    if (!ExaSearchService.instance) {
      ExaSearchService.instance = new ExaSearchService();
    }
    return ExaSearchService.instance;
  }

  /**
   * Check if Exa API is configured
   */
  isEnabled(): boolean {
    return !!APP_CONFIG.exa?.apiKey;
  }

  /**
   * Search for visually similar jewelry items
   */
  async searchVisualMatches(
    jewelryName: string,
    category?: string
  ): Promise<VisualMatch[]> {
    if (!jewelryName || jewelryName === 'Unable to Identify') {
      console.log('[ExaSearchService] Skipping search: invalid jewelry name');
      return [];
    }

    if (!this.isEnabled()) {
      console.log('[ExaSearchService] API key not configured');
      return [];
    }

    const cacheKey = this.buildCacheKey(jewelryName, category);
    const config = APP_CONFIG.visualSearch;

    try {
      // Check cache first
      const cached = await this.getCachedResult(cacheKey);
      if (cached) {
        console.log('[ExaSearchService] Using cached results');
        return cached;
      }

      console.log(`[ExaSearchService] Searching for: ${jewelryName} ${category || ''}`);

      // Build search query
      const categoryPart = category ? ` ${category}` : '';
      const query = `${jewelryName}${categoryPart} jewelry for sale`;

      // Fetch from Exa API
      const results = await this.fetchFromExa(query);
      const matches = this.extractMatches(results, config.maxResults);

      // Cache the results
      const cacheDuration = matches.length > 0
        ? config.cacheSuccessMs
        : config.cacheEmptyResultsMs;
      await this.setCachedResult(cacheKey, matches, cacheDuration);

      console.log(`[ExaSearchService] Found ${matches.length} matches`);
      return matches;

    } catch (error) {
      console.error('[ExaSearchService] Search failed:', error);
      return [];
    }
  }

  /**
   * Fetch search results from Exa API
   */
  private async fetchFromExa(query: string): Promise<ExaSearchResult[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const exaConfig = APP_CONFIG.exa;

      console.log(`[ExaSearchService] Query: ${query}`);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': exaConfig.apiKey,
        },
        body: JSON.stringify({
          query,
          numResults: 10,
          type: 'auto',
          useAutoprompt: true,
          contents: {
            text: { maxCharacters: 500 },
            highlights: { numSentences: 2 },
          },
          includeDomains: APP_CONFIG.visualSearch.domains,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ExaSearchService] API error: ${response.status}`, errorText);
        throw new Error(`Exa API error: ${response.status}`);
      }

      const data: ExaSearchResponse = await response.json();
      console.log(`[ExaSearchService] Got ${data.results?.length || 0} results`);

      return data.results || [];

    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('[ExaSearchService] Request timed out');
        throw new Error('Exa API request timed out');
      }
      throw error;
    }
  }

  /**
   * Extract visual matches from Exa results
   */
  private extractMatches(
    results: ExaSearchResult[],
    maxResults: number
  ): VisualMatch[] {
    const matches: VisualMatch[] = [];

    for (const result of results) {
      if (matches.length >= maxResults) break;

      const domain = this.extractDomain(result.url);

      // Try to get image from result or extract from content
      let imageUrl = result.image || this.extractImageUrl(result);

      // Log each result for debugging
      console.log(`[ExaSearchService] Result: ${domain} | image: ${imageUrl ? 'FOUND' : 'MISSING'} | title: ${result.title?.substring(0, 50)}`);

      if (imageUrl) {
        matches.push({
          id: this.generateId(),
          imageUrl,
          title: result.title || 'Similar Item',
          sourceUrl: result.url,
          sourceDomain: domain,
        });
      }
    }

    return matches;
  }

  /**
   * Extract image URL from result content
   */
  private extractImageUrl(result: ExaSearchResult): string | null {
    const content = `${result.text || ''} ${(result.highlights || []).join(' ')}`;

    // Image URL patterns
    const imagePatterns = [
      // Etsy CDN
      /https?:\/\/i\.etsystatic\.com[^\s"'<>]+/gi,
      // eBay CDN
      /https?:\/\/i\.ebayimg\.com[^\s"'<>]+/gi,
      // Amazon images
      /https?:\/\/[^\s"'<>]*amazon[^\s"'<>]*\.(?:jpg|jpeg|png|webp)/gi,
      // Generic image URLs
      /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/gi,
      // CDN patterns
      /https?:\/\/[^\s"'<>]*cdn[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)/gi,
      /https?:\/\/images\.[^\s"'<>]+/gi,
    ];

    for (const pattern of imagePatterns) {
      pattern.lastIndex = 0; // Reset regex
      const matches = content.match(pattern);
      if (matches) {
        for (const url of matches) {
          if (this.isValidImageUrl(url)) {
            return url;
          }
        }
      }
    }

    return null;
  }

  /**
   * Validate image URL
   */
  private isValidImageUrl(url: string): boolean {
    if (!url || url.length > 500) return false;
    if (url.includes('tracking') || url.includes('pixel') || url.includes('beacon')) return false;
    if (url.includes('1x1') || url.includes('spacer')) return false;

    const lowerUrl = url.toLowerCase();
    const hasImageExtension = /\.(jpg|jpeg|png|webp|gif)/.test(lowerUrl);
    const hasImagePath = /\/images?\/|\/img\/|\/photos?\/|\/pics?\/|cdn|static/.test(lowerUrl);

    return hasImageExtension || hasImagePath;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'web';
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Build cache key
   */
  private buildCacheKey(name: string, category?: string): string {
    const normalized = [name, category || '']
      .filter(Boolean)
      .map(p => p.toLowerCase().trim().replace(/\s+/g, '_'))
      .join('_');
    return `exa_${normalized}`;
  }

  /**
   * Get cached result
   */
  private async getCachedResult(key: string): Promise<VisualMatch[] | null> {
    try {
      const cacheStr = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cacheStr) return null;

      const cache: ExaSearchCache = JSON.parse(cacheStr);
      if (cache.version !== this.CACHE_VERSION) return null;

      const entry = cache.results?.[key];
      if (!entry) return null;

      // Check if still valid
      const ttl = entry.matches.length > 0
        ? APP_CONFIG.visualSearch.cacheSuccessMs
        : APP_CONFIG.visualSearch.cacheEmptyResultsMs;

      if (Date.now() - entry.cachedAt > ttl) return null;

      return entry.matches;
    } catch (error) {
      console.error('[ExaSearchService] Cache read error:', error);
      return null;
    }
  }

  /**
   * Set cached result
   */
  private async setCachedResult(
    key: string,
    matches: VisualMatch[],
    _ttl: number
  ): Promise<void> {
    try {
      let cache: ExaSearchCache;

      const cacheStr = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cacheStr) {
        cache = JSON.parse(cacheStr);
        if (cache.version !== this.CACHE_VERSION) {
          cache = this.createEmptyCache();
        }
      } else {
        cache = this.createEmptyCache();
      }

      cache.results[key] = {
        matches,
        cachedAt: Date.now(),
      };

      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('[ExaSearchService] Cache write error:', error);
    }
  }

  /**
   * Create empty cache
   */
  private createEmptyCache(): ExaSearchCache {
    return {
      results: {},
      version: this.CACHE_VERSION,
    };
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('[ExaSearchService] Cache cleared');
    } catch (error) {
      console.error('[ExaSearchService] Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const exaSearchService = ExaSearchService.getInstance();

// Export class for testing
export { ExaSearchService };
