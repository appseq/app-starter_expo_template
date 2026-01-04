/**
 * ExternalArticleService - Fetches articles from curated jewelry blogs
 *
 * Uses Exa AI (primary) or Jina AI (fallback) to search curated domains
 * for jewelry-related content. Implements AsyncStorage caching.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/appConfig';
import type {
  Article,
  ArticleSourceService,
  CuratedSourceConfig,
  SourceArticleCache,
} from '@/types/articleSources';
import type { ArticleCategory } from '@/types/articles';

class ExternalArticleService implements ArticleSourceService {
  private static instance: ExternalArticleService;

  private readonly CACHE_KEY = 'external_articles_cache';
  private readonly CACHE_VERSION = 1;
  private readonly TIMEOUT_MS = 30000; // Increased timeout for external APIs
  private readonly MAX_RESULTS = 10;
  private readonly EXA_API_URL = 'https://api.exa.ai/search';

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ExternalArticleService {
    if (!ExternalArticleService.instance) {
      ExternalArticleService.instance = new ExternalArticleService();
    }
    return ExternalArticleService.instance;
  }

  /**
   * Check if external article fetching is enabled
   */
  isEnabled(): boolean {
    const hasExa = !!APP_CONFIG.exa?.apiKey;
    const hasJina = !!APP_CONFIG.jina?.apiKey;
    const sources = APP_CONFIG.articles.curatedSources || [];
    const hasEnabledSources = sources.some((s) => s.enabled);

    if (!hasEnabledSources) {
      console.log('[ExternalArticleService] Disabled: No sources enabled');
      return false;
    }

    if (!hasExa && !hasJina) {
      console.log('[ExternalArticleService] Disabled: No API keys configured');
      return false;
    }

    return true;
  }

  /**
   * Fetch articles from curated external sources
   * Uses Exa as primary, falls back to Jina if Exa fails
   */
  async fetchArticles(): Promise<Article[]> {
    if (!this.isEnabled()) {
      return [];
    }

    try {
      // Check cache first
      const cached = await this.getCachedArticles();
      if (cached) {
        console.log('[ExternalArticleService] Using cached articles:', cached.length);
        return cached;
      }

      // Try Exa first, then Jina as fallback
      let articles: Article[] = [];

      if (APP_CONFIG.exa?.apiKey) {
        console.log('[ExternalArticleService] Fetching via Exa AI');
        articles = await this.fetchViaExa();
      }

      // If Exa failed or returned no results, try Jina
      if (articles.length === 0 && APP_CONFIG.jina?.apiKey) {
        console.log('[ExternalArticleService] Falling back to Jina AI');
        articles = await this.fetchViaJina();
      }

      console.log('[ExternalArticleService] Fetched total:', articles.length, 'articles');

      // Cache successful results
      if (articles.length > 0) {
        await this.saveToCache(articles);
      }

      return articles;
    } catch (error: any) {
      console.error('[ExternalArticleService] Fetch error:', error?.message || error);
      return [];
    }
  }

  /**
   * Fetch articles via Exa AI search
   */
  private async fetchViaExa(): Promise<Article[]> {
    const sources = (APP_CONFIG.articles.curatedSources || []).filter((s) => s.enabled) as CuratedSourceConfig[];
    const domains = sources.map((s) => s.domain);

    // Check if Exa API key is configured
    if (!APP_CONFIG.exa?.apiKey) {
      console.log('[ExternalArticleService] Exa API key not configured, skipping');
      return [];
    }

    // Build a jewelry-focused search query
    const query = 'jewelry gemstone diamond ring guide education';

    console.log('[ExternalArticleService] Exa searching domains:', domains.join(', '));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(this.EXA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': APP_CONFIG.exa.apiKey,
        },
        body: JSON.stringify({
          query,
          numResults: this.MAX_RESULTS,
          type: 'auto',
          useAutoprompt: true,
          contents: {
            text: { maxCharacters: 1000 },
          },
          includeDomains: domains,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.warn('[ExternalArticleService] Exa API error:', response.status, errorText);
        throw new Error(`Exa API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ExternalArticleService] Exa returned', data.results?.length || 0, 'results');
      return this.parseExaResults(data.results || [], sources);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.warn('[ExternalArticleService] Exa request timeout after', this.TIMEOUT_MS, 'ms');
      } else {
        console.warn('[ExternalArticleService] Exa fetch failed:', error?.message);
      }

      return [];
    }
  }

  /**
   * Fetch articles via Jina AI search (fallback)
   */
  private async fetchViaJina(): Promise<Article[]> {
    const sources = (APP_CONFIG.articles.curatedSources || []).filter((s) => s.enabled) as CuratedSourceConfig[];
    const articles: Article[] = [];

    // Limit to first 3 sources to avoid rate limits
    for (const source of sources.slice(0, 3)) {
      try {
        const query = source.searchQuery || `${source.domain} jewelry`;
        const jinaSearchUrl = `${APP_CONFIG.jina.searchUrl}${encodeURIComponent(query)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

        const response = await fetch(jinaSearchUrl, {
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

        if (response.ok) {
          const data = await response.json();
          const parsed = this.parseJinaResults(data.data || [], source);
          articles.push(...parsed);
        }
      } catch (error: any) {
        console.warn(
          `[ExternalArticleService] Jina fetch failed for ${source.name}:`,
          error?.message
        );
      }
    }

    return articles;
  }

  /**
   * Check if content appears to be a sales/promotional page
   */
  private isSalesPage(title: string, text: string): boolean {
    const salesPatterns = [
      // Shopping actions
      /\b(buy now|add to cart|shop now|order now|get yours|shop jewelry)\b/i,
      /\b(find your|your forever|perfect gift|gift for)\b/i,
      // Pricing and discounts
      /\b(sale|discount|\d+% off|\$\d+|free shipping|save up to)\b/i,
      /\b(starting at|from \$|price|pricing)\b/i,
      // Urgency tactics
      /\b(limited time|act now|don't miss|hurry|exclusive offer)\b/i,
      // Cart and checkout
      /\b(checkout|shopping cart|add to bag|add to wishlist)\b/i,
      // Product pages
      /\b(in stock|out of stock|ships in|delivery|returns)\b/i,
      // E-commerce indicators in summary/description
      /\b(browse our|shop our|explore our collection)\b/i,
    ];

    const combined = `${title} ${text}`;
    return salesPatterns.some((pattern) => pattern.test(combined));
  }

  /**
   * Parse Exa API results into Article format
   */
  private parseExaResults(
    results: any[],
    sources: CuratedSourceConfig[]
  ): Article[] {
    const now = Date.now();

    return results
      .filter((result) => result.url && result.title)
      .filter((result) => {
        const text = result.text || result.highlight || '';
        // Filter out sales pages
        if (this.isSalesPage(result.title, text)) {
          console.log('[ExternalArticleService] Filtered sales page:', result.title);
          return false;
        }
        // Filter out landing/index pages with mostly navigation
        if (this.isLandingPage(text)) {
          console.log('[ExternalArticleService] Filtered landing page:', result.title);
          return false;
        }
        return true;
      })
      .map((result, index): Article => {
        const domain = this.extractDomain(result.url);
        const source = sources.find((s) =>
          domain.toLowerCase().includes(s.domain.split('/')[0].toLowerCase())
        );

        return {
          id: `exa_${index}_${now}`,
          title: this.cleanText(result.title),
          category: (source?.category || 'Styles') as ArticleCategory,
          image: result.image || null,
          thumbnail: result.image || null,
          summary: this.extractSummary(result.text || result.highlight || ''),
          extract: this.cleanText(result.text || ''),
          url: result.url,
          source: 'exa',
          sourceName: source?.name || domain,
          publishedAt: result.publishedDate
            ? new Date(result.publishedDate).getTime()
            : undefined,
          fetchedAt: now,
          author: result.author,
        };
      });
  }

  /**
   * Parse Jina search results into Article format
   */
  private parseJinaResults(
    results: any[],
    source: CuratedSourceConfig
  ): Article[] {
    const now = Date.now();

    return results
      .filter((result) => {
        const text = result.content || result.description || '';
        // Filter out sales pages
        if (this.isSalesPage(result.title || '', text)) {
          console.log('[ExternalArticleService] Filtered sales page:', result.title);
          return false;
        }
        // Filter out landing/index pages with mostly navigation
        if (this.isLandingPage(text)) {
          console.log('[ExternalArticleService] Filtered landing page:', result.title);
          return false;
        }
        return true;
      })
      .slice(0, 3).map(
      (result, index): Article => ({
        id: `jina_${this.sanitizeForId(source.name)}_${index}_${now}`,
        title: this.cleanText(result.title || 'Untitled'),
        category: source.category as ArticleCategory,
        image: result.image || null,
        thumbnail: result.thumbnail || result.image || null,
        summary: this.extractSummary(result.description || result.content || ''),
        extract: this.cleanText(result.content || result.description || ''),
        url: result.url || '',
        source: 'jina',
        sourceName: source.name,
        fetchedAt: now,
      })
    );
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'web';
    }
  }

  /**
   * Extract first sentence for summary
   */
  private extractSummary(text: string): string {
    const cleaned = this.cleanText(text);
    const firstSentence = cleaned.match(/^[^.!?]*[.!?]/);

    if (firstSentence) {
      return firstSentence[0].trim();
    }

    return cleaned.length > 150 ? cleaned.slice(0, 150).trim() + '...' : cleaned;
  }

  /**
   * Check if content appears to be a landing/index page (mostly navigation)
   */
  private isLandingPage(text: string): boolean {
    // Count markdown links - landing pages have many navigation links
    const linkCount = (text.match(/\[[^\]]+\]\([^)]+\)/g) || []).length;
    const wordCount = text.split(/\s+/).length;

    // If more than 30% of content is links, it's likely a landing page
    if (linkCount > 5 && linkCount / (wordCount / 10) > 0.3) {
      return true;
    }

    // Check for navigation patterns
    const navPatterns = [
      /\* \[.*?\]\(.*?\) \* \[.*?\]\(/,  // Menu list pattern
      /\bnavigation\b.*\bmenu\b/i,
      /\bbreadcrumb/i,
    ];

    return navPatterns.some((p) => p.test(text));
  }

  /**
   * Clean text by removing HTML, markdown, and normalizing whitespace
   */
  private cleanText(text: string): string {
    return text
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Convert markdown links to just text: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove standalone URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove HTML entities
      .replace(/&#\d+;/g, '')
      .replace(/&[a-z]+;/gi, ' ')
      // Remove bullet points and asterisks used as list markers
      .replace(/^\s*[\*\-•]\s*/gm, '')
      // Normalize whitespace
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
   * Get cached articles if valid
   */
  private async getCachedArticles(): Promise<Article[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const parsed: SourceArticleCache = JSON.parse(cached);

      if (parsed.version !== this.CACHE_VERSION) {
        return null;
      }

      if (Date.now() > parsed.expiresAt) {
        return null;
      }

      if (!Array.isArray(parsed.articles) || parsed.articles.length === 0) {
        return null;
      }

      return parsed.articles;
    } catch {
      return null;
    }
  }

  /**
   * Save articles to cache
   */
  private async saveToCache(articles: Article[]): Promise<void> {
    const cacheDuration =
      APP_CONFIG.articles.sourceCacheDurations?.external || 24 * 60 * 60 * 1000;

    const cache: SourceArticleCache = {
      articles,
      lastFetchedAt: Date.now(),
      expiresAt: Date.now() + cacheDuration,
      version: this.CACHE_VERSION,
    };

    try {
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      console.log('[ExternalArticleService] Saved to cache:', articles.length, 'articles');
    } catch (error) {
      console.warn('[ExternalArticleService] Failed to save cache:', error);
    }
  }

  /**
   * Clear the external articles cache
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('[ExternalArticleService] Cache cleared');
    } catch (error) {
      console.warn('[ExternalArticleService] Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const externalArticleService = ExternalArticleService.getInstance();

// Export class for testing
export { ExternalArticleService };
