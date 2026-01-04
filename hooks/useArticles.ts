import { useState, useCallback, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { articleAggregatorService } from '@/services/articleAggregatorService';
import { articleService } from '@/services/articleService';
import type {
  WikipediaArticle,
  ArticleState,
  ArticleCategory,
  ArticleCardData,
  Article,
} from '@/types/articles';
import { APP_CONFIG } from '@/constants/appConfig';

/**
 * useArticles - Hook for managing articles state from all sources
 *
 * Provides access to cached articles (from Wikipedia, RSS, and external sources),
 * refresh functionality, and article filtering/lookup methods.
 */
export const [ArticlesProvider, useArticles] = createContextHook(() => {
  const [state, setState] = useState<ArticleState>({
    articles: [],
    isLoading: true,
    error: null,
    lastRefreshed: null,
  });

  /**
   * Load articles from all sources (Wikipedia, RSS, external)
   */
  const loadArticles = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const articles = await articleAggregatorService.fetchAllArticles();

      // Cast to WikipediaArticle[] for backwards compatibility
      // The Article type is a superset with additional source fields
      setState({
        articles: articles as unknown as WikipediaArticle[],
        isLoading: false,
        error: null,
        lastRefreshed: Date.now(),
      });

      return articles as unknown as WikipediaArticle[];
    } catch (error: any) {
      console.error('[useArticles] Failed to load articles:', error);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load articles',
      }));

      return [];
    }
  }, []);

  /**
   * Force refresh articles from all sources
   */
  const refreshArticles = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Clear all caches and fetch fresh
      await articleAggregatorService.clearAllCaches();
      const articles = await articleAggregatorService.fetchAllArticles();

      setState({
        articles: articles as unknown as WikipediaArticle[],
        isLoading: false,
        error: null,
        lastRefreshed: Date.now(),
      });

      return articles as unknown as WikipediaArticle[];
    } catch (error: any) {
      console.error('[useArticles] Failed to refresh articles:', error);

      // Get current articles before updating state for return value
      let currentArticles: WikipediaArticle[] = [];
      setState((prev) => {
        currentArticles = prev.articles;
        return {
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to refresh articles',
        };
      });

      return currentArticles;
    }
  }, []);

  /**
   * Get article by ID
   */
  const getArticleById = useCallback(
    (id: string): WikipediaArticle | null => {
      return state.articles.find((article) => article.id === id) || null;
    },
    [state.articles]
  );

  /**
   * Get articles filtered by category
   */
  const getArticlesByCategory = useCallback(
    (category: ArticleCategory): WikipediaArticle[] => {
      return state.articles.filter((article) => article.category === category);
    },
    [state.articles]
  );

  /**
   * Get articles formatted for WikiCard display
   */
  const getDisplayArticles = useCallback(
    (limit?: number): ArticleCardData[] => {
      const batchSize = limit || APP_CONFIG.articles.displayBatchSize;

      return state.articles.slice(0, batchSize).map((article) => ({
        id: article.id,
        title: article.title,
        category: article.category,
        image: article.thumbnail || article.image || APP_CONFIG.articles.fallbackImage,
        summary: article.summary,
      }));
    },
    [state.articles]
  );

  /**
   * Check if articles need refresh
   */
  const needsRefresh = useCallback(async (): Promise<boolean> => {
    return await articleService.isCacheStale();
  }, []);

  /**
   * Clear all article caches
   */
  const clearCache = useCallback(async () => {
    await articleAggregatorService.clearAllCaches();
    setState({
      articles: [],
      isLoading: false,
      error: null,
      lastRefreshed: null,
    });
  }, []);

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  return {
    // State
    articles: state.articles,
    isLoading: state.isLoading,
    error: state.error,
    lastRefreshed: state.lastRefreshed,

    // Actions
    loadArticles,
    refreshArticles,
    clearCache,

    // Selectors
    getArticleById,
    getArticlesByCategory,
    getDisplayArticles,
    needsRefresh,
  };
});

export default useArticles;
