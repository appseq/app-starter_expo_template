/**
 * ArticleAggregatorService - Unified article fetching from all sources
 *
 * Orchestrates Wikipedia, RSS, and external article services.
 * Handles merging, deduplication, and priority-based sorting.
 * Implements graceful degradation when sources fail.
 */

import { articleService } from './articleService';
import { rssArticleService } from './rssArticleService';
import { externalArticleService } from './externalArticleService';
import type { Article, SourceFetchResult, ArticleSourceType } from '@/types/articleSources';
import type { WikipediaArticle } from '@/types/articles';

/**
 * Priority map for sorting articles by source
 * Lower number = higher priority (appears first)
 */
const SOURCE_PRIORITY: Record<ArticleSourceType, number> = {
  exa: 1,      // External curated content (freshest, most relevant)
  jina: 1,     // External curated content
  rss: 2,      // Industry news
  wikipedia: 3, // Educational baseline
};

class ArticleAggregatorService {
  private static instance: ArticleAggregatorService;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ArticleAggregatorService {
    if (!ArticleAggregatorService.instance) {
      ArticleAggregatorService.instance = new ArticleAggregatorService();
    }
    return ArticleAggregatorService.instance;
  }

  /**
   * Fetch articles from all enabled sources
   *
   * Uses Promise.allSettled for graceful partial failure handling.
   * Wikipedia always runs as baseline, external sources are optional.
   */
  async fetchAllArticles(): Promise<Article[]> {
    console.log('[ArticleAggregator] Fetching from all sources...');

    const startTime = Date.now();

    // Fetch from all sources in parallel
    const results = await Promise.allSettled([
      this.fetchWikipedia(),
      this.fetchRSS(),
      this.fetchExternal(),
    ]);

    // Convert to typed results
    const sourceResults: SourceFetchResult[] = [
      this.toSourceResult(results[0], 'wikipedia'),
      this.toSourceResult(results[1], 'rss'),
      this.toSourceResult(results[2], 'exa'), // External uses exa/jina
    ];

    // Log results summary
    sourceResults.forEach((r) => {
      const status = r.success
        ? `${r.articles.length} articles`
        : `FAILED - ${r.error}`;
      console.log(`[ArticleAggregator] ${r.source}: ${status}`);
    });

    // Collect all successful articles
    const allArticles = sourceResults
      .filter((r) => r.success)
      .flatMap((r) => r.articles);

    // Deduplicate and sort
    const deduped = this.deduplicateArticles(allArticles);
    const sorted = this.sortByPriority(deduped);

    const elapsed = Date.now() - startTime;
    console.log(
      `[ArticleAggregator] Total: ${sorted.length} unique articles (${elapsed}ms)`
    );

    return sorted;
  }

  /**
   * Fetch only Wikipedia articles (for backwards compatibility)
   */
  async fetchWikipediaOnly(): Promise<WikipediaArticle[]> {
    return articleService.getArticles();
  }

  /**
   * Fetch Wikipedia articles and convert to unified Article format
   */
  private async fetchWikipedia(): Promise<Article[]> {
    const articles = await articleService.getArticles();

    // Convert WikipediaArticle to unified Article format
    return articles.map((a) => ({
      ...a,
      source: 'wikipedia' as const,
      sourceName: 'Wikipedia',
    }));
  }

  /**
   * Fetch RSS articles
   */
  private async fetchRSS(): Promise<Article[]> {
    if (!rssArticleService.isEnabled()) {
      return [];
    }
    return rssArticleService.fetchArticles();
  }

  /**
   * Fetch external curated articles
   */
  private async fetchExternal(): Promise<Article[]> {
    if (!externalArticleService.isEnabled()) {
      return [];
    }
    return externalArticleService.fetchArticles();
  }

  /**
   * Convert Promise.allSettled result to typed SourceFetchResult
   */
  private toSourceResult(
    result: PromiseSettledResult<Article[]>,
    source: ArticleSourceType
  ): SourceFetchResult {
    if (result.status === 'fulfilled') {
      return {
        source,
        articles: result.value,
        success: true,
        fetchedAt: Date.now(),
      };
    }

    return {
      source,
      articles: [],
      success: false,
      error: result.reason?.message || 'Unknown error',
      fetchedAt: Date.now(),
    };
  }

  /**
   * Remove duplicate articles based on URL and image
   *
   * Deduplicates by:
   * 1. Exact URL matches (same article from different fetches)
   * 2. Same image URL (likely same article reposted)
   * 3. Very similar titles from same source (avoid near-duplicates)
   */
  private deduplicateArticles(articles: Article[]): Article[] {
    const seenUrls = new Map<string, Article>();
    const seenImages = new Map<string, Article>();

    for (const article of articles) {
      // Skip articles without URL
      if (!article.url) continue;

      const urlKey = this.normalizeUrl(article.url);

      // Check for exact URL match
      if (seenUrls.has(urlKey)) {
        const existing = seenUrls.get(urlKey)!;
        // Keep article with more content
        if (article.extract.length > existing.extract.length) {
          seenUrls.set(urlKey, article);
        }
        continue;
      }

      // Check for same image (likely duplicate content)
      const imageKey = this.normalizeImageUrl(article.image || article.thumbnail);
      if (imageKey && seenImages.has(imageKey)) {
        const existing = seenImages.get(imageKey)!;
        // Keep article with more content or better source
        const existingPriority = SOURCE_PRIORITY[existing.source] || 99;
        const articlePriority = SOURCE_PRIORITY[article.source] || 99;
        if (articlePriority < existingPriority ||
            (articlePriority === existingPriority && article.extract.length > existing.extract.length)) {
          // Replace with better version
          seenUrls.delete(this.normalizeUrl(existing.url));
          seenUrls.set(urlKey, article);
          seenImages.set(imageKey, article);
        }
        continue;
      }

      // Add to seen maps
      seenUrls.set(urlKey, article);
      if (imageKey) {
        seenImages.set(imageKey, article);
      }
    }

    return Array.from(seenUrls.values());
  }

  /**
   * Normalize image URL for comparison
   * Strips query params, CDN prefixes, and size indicators
   */
  private normalizeImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      let path = parsed.pathname.toLowerCase();

      // Remove common size/resolution indicators from path
      path = path.replace(/[-_]?\d+x\d+/g, '');  // Remove 400x300 etc
      path = path.replace(/[-_]?(small|medium|large|thumb|thumbnail)/gi, '');
      path = path.replace(/[-_]?w\d+/g, '');     // Remove w400 etc
      path = path.replace(/[-_]?h\d+/g, '');     // Remove h300 etc

      // Get hostname without common CDN prefixes
      let host = parsed.hostname.toLowerCase()
        .replace(/^(www|cdn|images|img|media|static)\d*\./i, '');

      return `${host}${path}`;
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Sort articles by source priority and recency
   */
  private sortByPriority(articles: Article[]): Article[] {
    return articles.sort((a, b) => {
      // First by priority (lower = higher priority)
      const priorityA = SOURCE_PRIORITY[a.source] || 99;
      const priorityB = SOURCE_PRIORITY[b.source] || 99;
      const priorityDiff = priorityA - priorityB;

      if (priorityDiff !== 0) return priorityDiff;

      // Then by recency (if publishedAt available)
      const aTime = a.publishedAt || a.fetchedAt;
      const bTime = b.publishedAt || b.fetchedAt;

      return bTime - aTime; // Newer first
    });
  }

  /**
   * Normalize URL for comparison
   */
  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove www, trailing slash, and lowercase
      return `${parsed.hostname.replace('www.', '')}${parsed.pathname}`
        .toLowerCase()
        .replace(/\/$/, '');
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Calculate title similarity using Jaccard index on words
   * Returns a value between 0 (no similarity) and 1 (identical)
   */
  private titleSimilarity(a: string, b: string): number {
    // Normalize titles
    const normalize = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    const na = normalize(a);
    const nb = normalize(b);

    // Exact match
    if (na === nb) return 1;

    // Substring match
    if (na.includes(nb) || nb.includes(na)) return 0.9;

    // Jaccard similarity on words
    const wordsA = new Set(na.split(/\s+/).filter((w) => w.length > 2));
    const wordsB = new Set(nb.split(/\s+/).filter((w) => w.length > 2));

    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
    const union = new Set([...wordsA, ...wordsB]).size;

    return union > 0 ? intersection / union : 0;
  }

  /**
   * Clear all article caches
   */
  async clearAllCaches(): Promise<void> {
    console.log('[ArticleAggregator] Clearing all caches...');

    await Promise.allSettled([
      articleService.clearCache(),
      rssArticleService.clearCache(),
      externalArticleService.clearCache(),
    ]);

    console.log('[ArticleAggregator] All caches cleared');
  }

  /**
   * Get status of all sources
   */
  getSourcesStatus(): {
    wikipedia: boolean;
    rss: boolean;
    external: boolean;
  } {
    return {
      wikipedia: true, // Always enabled
      rss: rssArticleService.isEnabled(),
      external: externalArticleService.isEnabled(),
    };
  }
}

// Export singleton instance
export const articleAggregatorService = ArticleAggregatorService.getInstance();

// Export class for testing
export { ArticleAggregatorService };
