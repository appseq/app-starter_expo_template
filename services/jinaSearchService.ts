import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/appConfig';
import type {
  VisualMatch,
  AppraisalData,
  PriceReference,
} from '@/types';

/**
 * Cache structure for Jina search results
 */
interface JinaSearchCache {
  visualMatches: Record<string, {
    result: VisualMatchResult;
    cachedAt: number;
  }>;
  appraisals: Record<string, {
    result: AppraisalResult;
    cachedAt: number;
  }>;
  version: number;
}

interface VisualMatchResult {
  matches: VisualMatch[];
  searchQuery: string;
}

interface AppraisalResult {
  data: AppraisalData;
  searchQuery: string;
}

interface JinaSearchResult {
  title: string;
  url: string;
  description: string;
  content?: string;
}

/**
 * JinaSearchService - Searches the web for visual matches and appraisal values
 *
 * Uses Jina AI's search API to find similar jewelry images and market prices.
 * Implements caching with AsyncStorage persistence.
 */
class JinaSearchService {
  private static instance: JinaSearchService;

  // Cache configuration
  private readonly CACHE_KEY = 'jina_search_cache';
  private readonly CACHE_VERSION = 2; // Bumped to invalidate old cached empty results
  private readonly VISUAL_CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes
  private readonly APPRAISAL_CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

  // API configuration
  private readonly TIMEOUT_MS = 20000; // Increased from 15s for more reliable results
  private readonly MAX_VISUAL_MATCHES = 5;
  private readonly MAX_PRICE_REFERENCES = 5;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): JinaSearchService {
    if (!JinaSearchService.instance) {
      JinaSearchService.instance = new JinaSearchService();
    }
    return JinaSearchService.instance;
  }

  /**
   * Search for visually similar jewelry items
   */
  async searchVisualMatches(
    jewelryName: string,
    category?: string
  ): Promise<VisualMatch[]> {
    if (!jewelryName || jewelryName === 'Unable to Identify') {
      return [];
    }

    const cacheKey = this.buildCacheKey('visual', [jewelryName, category || '']);

    try {
      // Check cache first
      const cached = await this.getCachedResult<VisualMatchResult>(
        'visualMatches',
        cacheKey,
        this.VISUAL_CACHE_DURATION_MS
      );
      if (cached) {
        console.log('[JinaSearchService] Using cached visual matches');
        return cached.matches;
      }

      // Build search query
      const query = this.buildVisualSearchQuery(jewelryName, category);
      console.log('[JinaSearchService] Searching visual matches:', query);

      // Fetch from Jina
      const response = await this.fetchFromJina(query);
      const matches = this.parseVisualResults(response);

      // Cache result
      await this.setCachedResult('visualMatches', cacheKey, {
        matches,
        searchQuery: query,
      });

      return matches;
    } catch (error) {
      console.error('[JinaSearchService] Visual search failed:', error);
      // Return empty array on error (don't throw)
      return [];
    }
  }

  /**
   * Search for appraisal/market value information
   */
  async searchAppraisalValue(
    jewelryName: string,
    materials: string[]
  ): Promise<AppraisalData | null> {
    if (!jewelryName || jewelryName === 'Unable to Identify') {
      return null;
    }

    const cacheKey = this.buildCacheKey('appraisal', [jewelryName, ...materials]);

    try {
      // Check cache first
      const cached = await this.getCachedResult<AppraisalResult>(
        'appraisals',
        cacheKey,
        this.APPRAISAL_CACHE_DURATION_MS
      );
      if (cached) {
        console.log('[JinaSearchService] Using cached appraisal');
        return cached.data;
      }

      // Build search query
      const query = this.buildAppraisalSearchQuery(jewelryName, materials);
      console.log('[JinaSearchService] Searching appraisal:', query);

      // Fetch from Jina
      const response = await this.fetchFromJina(query);
      const appraisalData = this.parseAppraisalResults(response);

      // Cache result
      await this.setCachedResult('appraisals', cacheKey, {
        data: appraisalData,
        searchQuery: query,
      });

      return appraisalData;
    } catch (error) {
      console.error('[JinaSearchService] Appraisal search failed:', error);
      // Return null on error (don't throw)
      return null;
    }
  }

  /**
   * Build search query for visual matches
   */
  private buildVisualSearchQuery(name: string, category?: string): string {
    const categoryPart = category ? ` ${category}` : '';
    return `${name}${categoryPart} jewelry similar items for sale images`;
  }

  /**
   * Build search query for appraisal values
   */
  private buildAppraisalSearchQuery(name: string, materials: string[]): string {
    const materialStr = materials.slice(0, 2).join(' ');
    return `${name} ${materialStr} jewelry price value auction estimate 2024 2025`;
  }

  /**
   * Fetch search results from Jina API
   */
  private async fetchFromJina(query: string): Promise<JinaSearchResult[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const encodedQuery = encodeURIComponent(query);
      const jinaConfig = APP_CONFIG.jina;
      const url = `${jinaConfig.searchUrl}${encodedQuery}`;

      // Build headers with API key if available
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Return-Format': 'json',
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
        throw new Error(`Jina API error: ${response.status}`);
      }

      const data = await response.json();

      // Diagnostic: log raw response structure
      console.log(`[JinaSearchService] API response keys: ${Object.keys(data || {}).join(', ')}`);

      // Jina returns { data: [...] } format
      if (data && Array.isArray(data.data)) {
        console.log(`[JinaSearchService] Got ${data.data.length} results from Jina`);
        // Log first result structure for debugging
        if (data.data[0]) {
          const first = data.data[0];
          console.log(`[JinaSearchService] First result keys: ${Object.keys(first).join(', ')}`);
          console.log(`[JinaSearchService] First result has content: ${!!first.content}, description: ${!!first.description}`);
        }
        return data.data as JinaSearchResult[];
      }

      // Fallback for different response formats
      if (Array.isArray(data)) {
        console.log(`[JinaSearchService] Got ${data.length} results (array format)`);
        return data as JinaSearchResult[];
      }

      console.log('[JinaSearchService] Unexpected response format, returning empty');
      return [];
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Search request timed out');
      }
      throw error;
    }
  }

  /**
   * Parse Jina results into VisualMatch array
   */
  private parseVisualResults(results: JinaSearchResult[]): VisualMatch[] {
    const matches: VisualMatch[] = [];

    // Diagnostic logging
    console.log(`[JinaSearchService] Parsing ${results.length} results`);

    for (const result of results.slice(0, this.MAX_VISUAL_MATCHES * 2)) {
      // Extract domain from URL
      const domain = this.extractDomain(result.url);

      // Try to extract image URL from result
      const imageUrl = this.extractImageUrl(result);

      // Diagnostic: log each result
      console.log(`[JinaSearchService] Result: ${domain} | imageUrl: ${imageUrl ? 'FOUND' : 'MISSING'} | title: ${result.title?.substring(0, 50)}`);

      if (imageUrl && matches.length < this.MAX_VISUAL_MATCHES) {
        matches.push({
          id: this.generateId(),
          imageUrl,
          title: result.title || 'Similar Item',
          sourceUrl: result.url,
          sourceDomain: domain,
        });
      }
    }

    console.log(`[JinaSearchService] Final matches: ${matches.length}`);
    return matches;
  }

  /**
   * Parse Jina results into AppraisalData
   */
  private parseAppraisalResults(results: JinaSearchResult[]): AppraisalData {
    const priceReferences: PriceReference[] = [];
    const priceValues: number[] = [];

    for (const result of results.slice(0, this.MAX_PRICE_REFERENCES)) {
      const priceInfo = this.extractPriceInfo(result);

      if (priceInfo) {
        priceReferences.push({
          price: priceInfo.formatted,
          source: this.extractDomain(result.url),
          sourceUrl: result.url,
          itemDescription: result.title,
        });

        if (priceInfo.value) {
          priceValues.push(priceInfo.value);
        }
      }
    }

    // Calculate estimated range from found prices
    const estimatedRange = this.calculatePriceRange(priceValues);
    const confidence = this.calculateConfidence(priceReferences.length, priceValues.length);

    return {
      estimatedRange,
      confidence,
      sources: priceReferences,
    };
  }

  /**
   * Extract image URL from search result
   */
  private extractImageUrl(result: JinaSearchResult): string | null {
    // Common image hosting patterns
    const imagePatterns = [
      /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/gi,
      /https?:\/\/i\.etsystatic\.com[^\s"'<>]+/gi,
      /https?:\/\/i\.ebayimg\.com[^\s"'<>]+/gi,
      /https?:\/\/images\.[^\s"'<>]+/gi,
      /https?:\/\/[^\s"'<>]*\/images?\/[^\s"'<>]+/gi,
      /https?:\/\/[^\s"'<>]*cdn[^\s"'<>]*\.(?:jpg|jpeg|png|webp|gif)/gi,
    ];

    const content = `${result.description || ''} ${result.content || ''}`;
    const contentLength = content.length;

    // Diagnostic: log content length
    console.log(`[JinaSearchService] extractImageUrl: content length=${contentLength}, url=${result.url?.substring(0, 60)}`);

    for (const pattern of imagePatterns) {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0;
      const match = content.match(pattern);
      if (match && match[0]) {
        // Validate it's a reasonable image URL
        const imageUrl = match[0];
        if (imageUrl.length < 500 && !imageUrl.includes('tracking') && !imageUrl.includes('pixel')) {
          console.log(`[JinaSearchService] Found image: ${imageUrl.substring(0, 80)}...`);
          return imageUrl;
        }
      }
    }

    // Log when no image found
    console.log(`[JinaSearchService] No image found in content preview: ${content.substring(0, 200)}...`);

    return null;
  }

  /**
   * Extract price information from search result
   */
  private extractPriceInfo(result: JinaSearchResult): { formatted: string; value: number | null } | null {
    const content = `${result.title || ''} ${result.description || ''} ${result.content || ''}`;

    // Price patterns: $1,234.56, USD 1234, 1,234 USD, etc.
    const pricePatterns = [
      /\$[\d,]+(?:\.\d{2})?/g,
      /USD\s*[\d,]+(?:\.\d{2})?/gi,
      /[\d,]+(?:\.\d{2})?\s*USD/gi,
      /£[\d,]+(?:\.\d{2})?/g,
      /€[\d,]+(?:\.\d{2})?/g,
    ];

    for (const pattern of pricePatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const formatted = matches[0];
        const numericValue = this.parsePrice(formatted);

        // Filter out unrealistic prices (too low or too high)
        if (numericValue && numericValue >= 50 && numericValue <= 10000000) {
          return {
            formatted: this.formatPrice(numericValue),
            value: numericValue,
          };
        }
      }
    }

    return null;
  }

  /**
   * Parse price string to number
   */
  private parsePrice(priceStr: string): number | null {
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? null : value;
  }

  /**
   * Format price as USD
   */
  private formatPrice(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Calculate estimated price range from values
   */
  private calculatePriceRange(values: number[]): string {
    if (values.length === 0) {
      return 'Contact appraiser for estimate';
    }

    if (values.length === 1) {
      return `~${this.formatPrice(values[0])}`;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // If min and max are close, show single value
    if (max - min < min * 0.3) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return `~${this.formatPrice(avg)}`;
    }

    return `${this.formatPrice(min)} - ${this.formatPrice(max)}`;
  }

  /**
   * Calculate confidence level based on sources
   */
  private calculateConfidence(
    sourceCount: number,
    priceCount: number
  ): 'high' | 'medium' | 'low' {
    if (priceCount >= 3 && sourceCount >= 3) {
      return 'high';
    }
    if (priceCount >= 1 && sourceCount >= 2) {
      return 'medium';
    }
    return 'low';
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
   * Build cache key from parts
   */
  private buildCacheKey(type: string, parts: string[]): string {
    const normalized = parts
      .filter(Boolean)
      .map(p => p.toLowerCase().trim().replace(/\s+/g, '_'))
      .join('_');
    return `${type}_${normalized}`;
  }

  /**
   * Get cached result if valid
   */
  private async getCachedResult<T>(
    cacheType: 'visualMatches' | 'appraisals',
    key: string,
    maxAge: number
  ): Promise<T | null> {
    try {
      const cacheStr = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cacheStr) return null;

      const cache: JinaSearchCache = JSON.parse(cacheStr);

      // Version check
      if (cache.version !== this.CACHE_VERSION) return null;

      const entry = cache[cacheType]?.[key];
      if (!entry) return null;

      // Age check
      if (Date.now() - entry.cachedAt > maxAge) return null;

      return entry.result as T;
    } catch (error) {
      console.error('[JinaSearchService] Cache read error:', error);
      return null;
    }
  }

  /**
   * Save result to cache
   */
  private async setCachedResult<T>(
    cacheType: 'visualMatches' | 'appraisals',
    key: string,
    result: T
  ): Promise<void> {
    try {
      let cache: JinaSearchCache;

      const cacheStr = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cacheStr) {
        cache = JSON.parse(cacheStr);
        // Reset if version mismatch
        if (cache.version !== this.CACHE_VERSION) {
          cache = this.createEmptyCache();
        }
      } else {
        cache = this.createEmptyCache();
      }

      cache[cacheType][key] = {
        result: result as any,
        cachedAt: Date.now(),
      };

      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('[JinaSearchService] Cache write error:', error);
    }
  }

  /**
   * Create empty cache structure
   */
  private createEmptyCache(): JinaSearchCache {
    return {
      visualMatches: {},
      appraisals: {},
      version: this.CACHE_VERSION,
    };
  }

  /**
   * Clear all cached search results
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('[JinaSearchService] Cache cleared');
    } catch (error) {
      console.error('[JinaSearchService] Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const jinaSearchService = JinaSearchService.getInstance();

// Export class for testing
export { JinaSearchService };
