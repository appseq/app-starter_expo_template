import { useState, useCallback, useRef } from 'react';
import { exaSearchService } from '@/services/exaSearchService';
import { jinaSearchService } from '@/services/jinaSearchService';
import { visualSearchService } from '@/services/visualSearchService';
import type {
  VisualMatch,
  VisualMatchState,
  AppraisalData,
  AppraisalState,
} from '@/types';

/**
 * useJinaSearch - Hook for searching visual matches and appraisal values
 *
 * Provides search functionality with loading/error states for the
 * ItemDetailsScreen. Uses a hybrid approach:
 * - Visual matches: New VisualSearchService (domain-focused, better image extraction)
 * - Appraisal: JinaSearchService (good for price/text extraction)
 */
export function useJinaSearch() {
  const [visualMatches, setVisualMatches] = useState<VisualMatchState>({
    matches: [],
    isLoading: false,
    error: null,
  });

  const [appraisal, setAppraisal] = useState<AppraisalState>({
    data: null,
    isLoading: false,
    error: null,
  });

  // Track current search to prevent stale updates
  // IMPORTANT: Use separate refs for visual and appraisal to prevent race conditions
  // when both searches are triggered simultaneously
  const visualSearchIdRef = useRef(0);
  const appraisalSearchIdRef = useRef(0);

  /**
   * Search for visually similar jewelry items
   *
   * @param jewelryName - AI-identified jewelry name
   * @param category - Optional category for filtering
   * @param imageUri - Optional image URI for Vision API analysis (improves accuracy)
   */
  const fetchVisualMatches = useCallback(async (
    jewelryName: string,
    category?: string,
    imageUri?: string
  ): Promise<void> => {
    if (!jewelryName || jewelryName === 'Unable to Identify') {
      setVisualMatches({
        matches: [],
        isLoading: false,
        error: null,
      });
      return;
    }

    const currentSearchId = ++visualSearchIdRef.current;

    setVisualMatches(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // Search priority: Exa (best) → VisualSearchService → Jina (fallback)
      let matches: VisualMatch[] = [];

      // Try Exa first (best semantic search)
      if (exaSearchService.isEnabled()) {
        console.log('[useJinaSearch] Trying Exa search (primary)...');
        matches = await exaSearchService.searchVisualMatches(jewelryName, category);
      }

      // Fallback to VisualSearchService with Vision API
      if (matches.length === 0) {
        console.log('[useJinaSearch] Trying VisualSearchService (with Vision API if available)...');
        matches = await visualSearchService.searchVisualMatches(
          jewelryName,
          category,
          imageUri
        );
      }

      // Final fallback to Jina
      if (matches.length === 0) {
        console.log('[useJinaSearch] Trying Jina fallback...');
        matches = await jinaSearchService.searchVisualMatches(
          jewelryName,
          category
        );
      }

      console.log(`[useJinaSearch] Final matches: ${matches.length}`);

      // Only update if this is still the current search
      if (currentSearchId === visualSearchIdRef.current) {
        setVisualMatches({
          matches,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('[useJinaSearch] Visual search error:', error);
      if (currentSearchId === visualSearchIdRef.current) {
        setVisualMatches(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to find similar items',
        }));
      }
    }
  }, []);

  /**
   * Search for appraisal/market value information
   */
  const fetchAppraisal = useCallback(async (
    jewelryName: string,
    materials: string[]
  ): Promise<void> => {
    if (!jewelryName || jewelryName === 'Unable to Identify') {
      setAppraisal({
        data: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    const currentSearchId = ++appraisalSearchIdRef.current;

    setAppraisal(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const data = await jinaSearchService.searchAppraisalValue(
        jewelryName,
        materials
      );

      // Only update if this is still the current search
      if (currentSearchId === appraisalSearchIdRef.current) {
        setAppraisal({
          data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      if (currentSearchId === appraisalSearchIdRef.current) {
        setAppraisal(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to get appraisal value',
        }));
      }
    }
  }, []);

  /**
   * Reset all search state
   */
  const reset = useCallback(() => {
    visualSearchIdRef.current++;
    appraisalSearchIdRef.current++;
    setVisualMatches({
      matches: [],
      isLoading: false,
      error: null,
    });
    setAppraisal({
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Retry failed searches
   */
  const retry = useCallback(async (
    jewelryName: string,
    category?: string,
    materials?: string[],
    imageUri?: string
  ): Promise<void> => {
    const promises: Promise<void>[] = [];

    if (visualMatches.error) {
      promises.push(fetchVisualMatches(jewelryName, category, imageUri));
    }

    if (appraisal.error && materials) {
      promises.push(fetchAppraisal(jewelryName, materials));
    }

    await Promise.all(promises);
  }, [visualMatches.error, appraisal.error, fetchVisualMatches, fetchAppraisal]);

  return {
    // Visual matches state
    visualMatches,
    fetchVisualMatches,

    // Appraisal state
    appraisal,
    fetchAppraisal,

    // Combined loading state
    isLoading: visualMatches.isLoading || appraisal.isLoading,

    // Actions
    reset,
    retry,
  };
}

export default useJinaSearch;
