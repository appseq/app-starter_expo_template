/**
 * Example Collection Store
 * Zustand store with AsyncStorage persistence
 *
 * This is a template store demonstrating best practices.
 * Rename and customize for your domain (e.g., useScanStore, usePDFStore).
 *
 * Features:
 * - CRUD operations for items
 * - UI state management (view mode, sort, search)
 * - AsyncStorage persistence
 * - Selective persistence (partialize)
 * - Computed helpers (filtering, sorting)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SavedItem,
  CollectionState,
  ViewMode,
  SortOption,
  SortDirection,
} from '@/types/store';

/**
 * Storage key for persistence
 * Change this when creating a new store to avoid conflicts
 */
const STORAGE_KEY = 'collection-storage';

/**
 * Example collection store with persistence
 *
 * @example
 * ```tsx
 * // In a component
 * const { items, addItem, getFilteredItems } = useCollectionStore();
 *
 * // Add an item
 * addItem({
 *   id: 'unique-id',
 *   name: 'My Item',
 *   createdAt: Date.now(),
 *   updatedAt: Date.now(),
 * });
 *
 * // Get filtered items
 * const filtered = getFilteredItems();
 * ```
 */
export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      viewMode: 'list',
      sortOption: 'date',
      sortDirection: 'desc',
      searchQuery: '',

      // Item CRUD operations
      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items],
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: Date.now() }
              : item
          ),
        })),

      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },

      // UI state setters
      setViewMode: (mode) => set({ viewMode: mode }),
      setSortOption: (option) => set({ sortOption: option }),
      setSortDirection: (direction) => set({ sortDirection: direction }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Computed helpers
      getFilteredItems: () => {
        const { items, searchQuery, sortOption, sortDirection } = get();

        // Filter by search query
        let filtered = items;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = items.filter((item) =>
            item.name.toLowerCase().includes(query)
          );
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
          let comparison = 0;
          switch (sortOption) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'date':
            default:
              comparison = a.createdAt - b.createdAt;
              break;
          }
          return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
      },

      getRecentItems: (count) => {
        const { items } = get();
        return [...items]
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, count);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist data and UI preferences, not transient state
      partialize: (state) => ({
        items: state.items,
        viewMode: state.viewMode,
        sortOption: state.sortOption,
        sortDirection: state.sortDirection,
      }),
    }
  )
);

/**
 * Utility function to generate a unique ID
 * Use this when creating new items
 */
export const generateItemId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Utility function to create a new item with defaults
 *
 * @example
 * ```tsx
 * const newItem = createItem({ name: 'My Rock' });
 * addItem(newItem);
 * ```
 */
export const createItem = (
  partial: Partial<SavedItem> & Pick<SavedItem, 'name'>
): SavedItem => {
  const now = Date.now();
  return {
    id: generateItemId(),
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
};
