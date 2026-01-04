import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/appConfig';
import { googleVisionService } from './googleVisionService';
import type { VisualMatch } from '@/types';

/**
 * Cache structure for visual search results
 */
interface VisualSearchCache {
  results: Record<string, {
    matches: VisualMatch[];
    cachedAt: number;
  }>;
  version: number;
}

/**
 * Jina search result from r.jina.ai (reader API)
 */
interface JinaReaderResult {
  code: number;
  status: number;
  data: {
    title: string;
    url: string;
    content: string;
    images?: Record<string, string>; // alt -> url mapping
  };
}

/**
 * Jina search result from s.jina.ai (search API)
 */
interface JinaSearchItem {
  title: string;
  url: string;
  description: string;
  content?: string;
}

/**
 * VisualSearchService - Searches for visually similar jewelry items
 *
 * Uses a hybrid approach:
 * 1. Primary: Jina Search API with image extraction
 * 2. Enhanced: Jina Reader API for full page content with images
 *
 * Focuses on curated jewelry marketplace domains for quality results.
 */
class VisualSearchService {
  private static instance: VisualSearchService;

  // Cache configuration
  private readonly CACHE_KEY = 'visual_search_cache';
  private readonly CACHE_VERSION = 1;

  // API configuration
  private readonly JINA_SEARCH_URL = 'https://s.jina.ai/';
  private readonly JINA_READER_URL = 'https://r.jina.ai/';

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): VisualSearchService {
    if (!VisualSearchService.instance) {
      VisualSearchService.instance = new VisualSearchService();
    }
    return VisualSearchService.instance;
  }

  /**
   * Search for visually similar jewelry items
   *
   * @param jewelryName - AI-identified jewelry name
   * @param category - Optional category for filtering
   * @param imageUri - Optional image URI for Vision API analysis
   */
  async searchVisualMatches(
    jewelryName: string,
    category?: string,
    imageUri?: string
  ): Promise<VisualMatch[]> {
    if (!jewelryName || jewelryName === 'Unable to Identify') {
      console.log('[VisualSearchService] Skipping search: invalid jewelry name');
      return [];
    }

    const cacheKey = this.buildCacheKey(jewelryName, category);
    const config = APP_CONFIG.visualSearch;

    try {
      // Check cache first
      const cached = await this.getCachedResult(cacheKey);
      if (cached) {
        console.log('[VisualSearchService] Using cached results');
        return cached;
      }

      console.log(`[VisualSearchService] Searching for: ${jewelryName} ${category || ''}`);

      // Try to get enhanced labels from Google Vision if imageUri provided
      let visionLabels: string[] = [];
      if (imageUri && googleVisionService.isEnabled()) {
        console.log('[VisualSearchService] Getting Vision API labels...');
        visionLabels = await googleVisionService.getImageLabels(imageUri);
        console.log(`[VisualSearchService] Vision labels: ${visionLabels.slice(0, 5).join(', ')}`);
      }

      // Strategy: Search with Vision-enhanced or domain-focused query
      const matches = visionLabels.length > 0
        ? await this.searchWithVisionLabels(visionLabels, category)
        : await this.searchWithDomains(jewelryName, category);

      // Cache the results
      const cacheDuration = matches.length > 0
        ? config.cacheSuccessMs
        : config.cacheEmptyResultsMs;
      await this.setCachedResult(cacheKey, matches, cacheDuration);

      console.log(`[VisualSearchService] Found ${matches.length} matches`);
      return matches;

    } catch (error) {
      console.error('[VisualSearchService] Search failed:', error);
      return [];
    }
  }

  /**
   * Search using Google Vision API labels
   */
  private async searchWithVisionLabels(
    labels: string[],
    category?: string
  ): Promise<VisualMatch[]> {
    const config = APP_CONFIG.visualSearch;
    const domains = config.domains.slice(0, 4);

    // Build query from Vision labels (most relevant first)
    const labelQuery = labels.slice(0, 5).join(' ');
    const categoryPart = category ? ` ${category}` : '';
    const domainQuery = domains.map(d => `site:${d}`).join(' OR ');
    const query = `${labelQuery}${categoryPart} jewelry for sale (${domainQuery})`;

    console.log(`[VisualSearchService] Vision query: ${query}`);

    const results = await this.fetchJinaSearch(query);

    if (results.length === 0) {
      console.log('[VisualSearchService] No Vision results, trying broader search');
      const broaderQuery = `${labelQuery}${categoryPart} jewelry for sale`;
      const broaderResults = await this.fetchJinaSearch(broaderQuery);
      return this.extractMatchesFromResults(broaderResults, config.maxResults);
    }

    return this.extractMatchesFromResults(results, config.maxResults);
  }

  /**
   * Search with curated domain focus
   */
  private async searchWithDomains(
    jewelryName: string,
    category?: string
  ): Promise<VisualMatch[]> {
    const config = APP_CONFIG.visualSearch;
    const domains = config.domains.slice(0, 4); // Focus on top 4 domains

    // Build domain-focused query
    const domainQuery = domains.map(d => `site:${d}`).join(' OR ');
    const categoryPart = category ? ` ${category}` : '';
    const query = `${jewelryName}${categoryPart} jewelry (${domainQuery})`;

    console.log(`[VisualSearchService] Query: ${query}`);

    // Fetch search results with image headers
    const results = await this.fetchJinaSearch(query);

    if (results.length === 0) {
      console.log('[VisualSearchService] No search results, trying broader search');
      // Fallback: broader search without domain restriction
      const broaderQuery = `${jewelryName}${categoryPart} jewelry for sale`;
      const broaderResults = await this.fetchJinaSearch(broaderQuery);
      return this.extractMatchesFromResults(broaderResults, config.maxResults);
    }

    return this.extractMatchesFromResults(results, config.maxResults);
  }

  /**
   * Fetch search results from Jina Search API
   */
  private async fetchJinaSearch(query: string): Promise<JinaSearchItem[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.visualSearch.timeout);

    try {
      const encodedQuery = encodeURIComponent(query);
      const jinaConfig = APP_CONFIG.jina;
      const url = `${jinaConfig.searchUrl}${encodedQuery}`;

      console.log(`[VisualSearchService] Fetching: ${url.substring(0, 100)}...`);

      // Build headers with API key if available
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Return-Format': 'json',
        'X-With-Images-Summary': 'true',
        'X-With-Generated-Alt': 'true',
      };

      // Add Authorization header if API key is configured
      if (jinaConfig.apiKey) {
        headers['Authorization'] = `Bearer ${jinaConfig.apiKey}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[VisualSearchService] API error: ${response.status}`);
        throw new Error(`Jina API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[VisualSearchService] Response keys: ${Object.keys(data || {}).join(', ')}`);

      // Handle different response formats
      if (data && Array.isArray(data.data)) {
        console.log(`[VisualSearchService] Got ${data.data.length} results`);
        return data.data;
      }

      if (Array.isArray(data)) {
        console.log(`[VisualSearchService] Got ${data.length} results (array format)`);
        return data;
      }

      console.log('[VisualSearchService] Unexpected response format');
      return [];

    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('[VisualSearchService] Request timed out');
      } else {
        console.error('[VisualSearchService] Fetch error:', error.message);
      }
      throw error;
    }
  }

  /**
   * Fetch full page content using Jina Reader API
   */
  private async fetchPageContent(pageUrl: string): Promise<string | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for reader

    try {
      const url = `${this.JINA_READER_URL}${encodeURIComponent(pageUrl)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Return-Format': 'json',
          'X-With-Images-Summary': 'true',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data: JinaReaderResult = await response.json();
      return data.data?.content || null;

    } catch (error) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  /**
   * Extract visual matches from search results
   */
  private extractMatchesFromResults(
    results: JinaSearchItem[],
    maxResults: number
  ): VisualMatch[] {
    const matches: VisualMatch[] = [];

    for (const result of results) {
      if (matches.length >= maxResults) break;

      const domain = this.extractDomain(result.url);
      const content = `${result.description || ''} ${result.content || ''}`;

      // Extract image URL using multiple patterns
      const imageUrl = this.extractImageUrl(content, domain);

      console.log(`[VisualSearchService] ${domain}: imageUrl=${imageUrl ? 'FOUND' : 'MISSING'}`);

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
   * Extract image URL from content
   */
  private extractImageUrl(content: string, domain: string): string | null {
    // Pattern 1: Markdown image syntax ![alt](url)
    const markdownPattern = /!\[[^\]]*\]\(([^)]+)\)/gi;
    let match = markdownPattern.exec(content);
    if (match && match[1]) {
      const url = match[1];
      if (this.isValidImageUrl(url)) {
        return url;
      }
    }

    // Pattern 2: Direct image URLs with common extensions
    const imageUrlPatterns = [
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

    for (const pattern of imageUrlPatterns) {
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

    // Must look like an image URL
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
    return `visual_${normalized}`;
  }

  /**
   * Get cached result
   */
  private async getCachedResult(key: string): Promise<VisualMatch[] | null> {
    try {
      const cacheStr = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cacheStr) return null;

      const cache: VisualSearchCache = JSON.parse(cacheStr);
      if (cache.version !== this.CACHE_VERSION) return null;

      const entry = cache.results?.[key];
      if (!entry) return null;

      // Check if still valid (dynamic TTL based on whether results were found)
      const ttl = entry.matches.length > 0
        ? APP_CONFIG.visualSearch.cacheSuccessMs
        : APP_CONFIG.visualSearch.cacheEmptyResultsMs;

      if (Date.now() - entry.cachedAt > ttl) return null;

      return entry.matches;
    } catch (error) {
      console.error('[VisualSearchService] Cache read error:', error);
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
      let cache: VisualSearchCache;

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
      console.error('[VisualSearchService] Cache write error:', error);
    }
  }

  /**
   * Create empty cache
   */
  private createEmptyCache(): VisualSearchCache {
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
      console.log('[VisualSearchService] Cache cleared');
    } catch (error) {
      console.error('[VisualSearchService] Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const visualSearchService = VisualSearchService.getInstance();

// Export class for testing
export { VisualSearchService };
