/**
 * Store Type Definitions
 * Types for Zustand stores with persistence
 */

/**
 * Generic saved item interface
 * Extend or modify for your domain (e.g., PDFDocument, ScanResult, etc.)
 */
export interface SavedItem {
  id: string;
  name: string;
  imageUri?: string;
  createdAt: number;
  updatedAt: number;
  // Add domain-specific fields here
  // Example for rock identification app:
  // confidence?: number;
  // category?: string;
  // composition?: string[];
}

/**
 * View mode options for list displays
 */
export type ViewMode = 'list' | 'grid';

/**
 * Sort options for item lists
 */
export type SortOption = 'name' | 'date' | 'size';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * UI state for collection management
 */
export interface CollectionUIState {
  viewMode: ViewMode;
  sortOption: SortOption;
  sortDirection: SortDirection;
  searchQuery: string;
}

/**
 * Generic collection store state
 * Rename/modify for your domain (e.g., PDFState, ScanState, etc.)
 */
export interface CollectionState extends CollectionUIState {
  // Data
  items: SavedItem[];
  isLoading: boolean;

  // Item CRUD operations
  addItem: (item: SavedItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<SavedItem>) => void;
  getItemById: (id: string) => SavedItem | undefined;

  // UI state setters
  setViewMode: (mode: ViewMode) => void;
  setSortOption: (option: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;

  // Computed helpers
  getFilteredItems: () => SavedItem[];
  getRecentItems: (count: number) => SavedItem[];
}
