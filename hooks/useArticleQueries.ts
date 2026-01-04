import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { Image } from 'expo-image';
import { articleAggregatorService } from '@/services/articleAggregatorService';
import { APP_CONFIG } from '@/constants/appConfig';
import type {
  WikipediaArticle,
  ArticleCategory,
  ArticleCardData,
  Article,
} from '@/types/articles';

const {
  staleTimeMs,
  cacheTimeMs,
  refetchIntervalMs,
  queryKeys,
  prefetchBatchSize,
  prefetchThumbnails,
  fallbackImage,
  displayBatchSize,
} = APP_CONFIG.articles;

/**
 * Prefetch article images using expo-image's native caching
 * Accepts both Article and WikipediaArticle types
 */
async function prefetchArticleImages(
  articles: Array<Article | WikipediaArticle>
): Promise<void> {
  const uris = articles
    .map((a) => a.thumbnail || a.image)
    .filter((uri): uri is string => !!uri);

  if (uris.length === 0) return;

  try {
    await Promise.allSettled(uris.map((uri) => Image.prefetch(uri)));
    console.log('[useArticleQueries] Prefetched', uris.length, 'images');
  } catch (error) {
    console.warn('[useArticleQueries] Image prefetch error:', error);
  }
}

/**
 * Main hook for fetching all articles with React Query
 *
 * Features:
 * - Multi-source aggregation (Wikipedia, RSS, external)
 * - 6-hour stale time (data considered fresh)
 * - 24-hour cache time (kept in memory)
 * - 24-hour automatic refresh interval
 * - Background refresh on app focus
 * - Automatic image prefetching
 */
export function useArticlesQuery() {
  const query = useQuery<Article[]>({
    queryKey: queryKeys.list,
    queryFn: () => articleAggregatorService.fetchAllArticles(),
    staleTime: staleTimeMs,
    gcTime: cacheTimeMs,
    refetchInterval: refetchIntervalMs,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Prefetch images when articles load
  useEffect(() => {
    if (prefetchThumbnails && query.data && query.data.length > 0) {
      prefetchArticleImages(query.data.slice(0, prefetchBatchSize));
    }
  }, [query.data]);

  return query;
}

/**
 * Hook for fetching a single article by ID
 *
 * Optimizes by checking the list cache first before fetching
 */
export function useArticleQuery(articleId: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.detail(articleId || ''),
    queryFn: async (): Promise<Article | null> => {
      // First try to get from the list cache
      const listData = queryClient.getQueryData<Article[]>(queryKeys.list);
      const cached = listData?.find((a) => a.id === articleId);
      if (cached) return cached;

      // Fallback: fetch all and find
      const articles = await articleAggregatorService.fetchAllArticles();
      return articles.find((a) => a.id === articleId) || null;
    },
    enabled: !!articleId,
    staleTime: staleTimeMs,
    gcTime: cacheTimeMs,
  });
}

/**
 * Hook for filtered articles by category
 *
 * Derives from the main articles query to avoid duplicate fetches
 */
export function useArticlesByCategory(category: ArticleCategory | 'All') {
  const { data: articles, ...rest } = useArticlesQuery();

  const filteredArticles =
    category === 'All'
      ? articles
      : articles?.filter((a) => a.category === category);

  return { data: filteredArticles, ...rest };
}

/**
 * Hook for display-ready articles formatted for WikiCard component
 *
 * Returns articles with guaranteed image URLs and limited to batch size
 * Includes source information for multi-source attribution
 */
export function useDisplayArticles(limit?: number) {
  const { data: articles, isLoading, error, isFetching } = useArticlesQuery();
  const batchSize = limit || displayBatchSize;

  const displayArticles: ArticleCardData[] | undefined = articles
    ?.slice(0, batchSize)
    .map((article) => ({
      id: article.id,
      title: article.title,
      category: article.category,
      image: article.thumbnail || article.image || fallbackImage,
      summary: article.summary,
      source: article.source,
      sourceName: article.sourceName,
    }));

  return {
    displayArticles,
    isLoading,
    error,
    isFetching,
  };
}

/**
 * Hook to get a single article by ID from the existing cache
 *
 * Useful for synchronous access when you know articles are loaded
 */
export function useArticleFromCache(articleId: string | undefined): Article | null {
  const queryClient = useQueryClient();
  const listData = queryClient.getQueryData<Article[]>(queryKeys.list);
  return listData?.find((a) => a.id === articleId) || null;
}

/**
 * Hook for manually refreshing articles
 *
 * Returns a refetch function that forces a new fetch
 */
export function useRefreshArticles() {
  const queryClient = useQueryClient();

  const refreshArticles = useCallback(async () => {
    // Invalidate and refetch
    await queryClient.invalidateQueries({ queryKey: queryKeys.all });
    return queryClient.refetchQueries({ queryKey: queryKeys.list });
  }, [queryClient]);

  return refreshArticles;
}

/**
 * Hook to clear the articles cache (all sources)
 */
export function useClearArticlesCache() {
  const queryClient = useQueryClient();

  const clearCache = useCallback(async () => {
    // Remove from React Query cache
    queryClient.removeQueries({ queryKey: queryKeys.all });
    // Clear AsyncStorage cache for all sources
    await articleAggregatorService.clearAllCaches();
  }, [queryClient]);

  return clearCache;
}

/**
 * Hook to prefetch articles (useful for navigation)
 */
export function usePrefetchArticles() {
  const queryClient = useQueryClient();

  const prefetchArticles = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.list,
      queryFn: () => articleAggregatorService.fetchAllArticles(),
      staleTime: staleTimeMs,
    });
  }, [queryClient]);

  return prefetchArticles;
}

/**
 * Hook to get the status of article sources
 */
export function useArticleSourcesStatus() {
  return articleAggregatorService.getSourcesStatus();
}
