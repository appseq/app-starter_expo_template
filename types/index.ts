// Rarity classification for jewelry pieces
export type JewelryRarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';

// Generic identification interface that can be used for any object type
// (rocks, plants, birds, art, etc.)
export interface ObjectIdentification {
  name: string;
  confidence: number;
  category?: string;      // Category/type (e.g., Ring, Necklace, Bracelet for jewelry)
  composition: string[];  // Could be materials, species, ingredients, etc.
  formation: string;      // Could be origin, habitat, creation process, etc.
  locations: string[];    // Where it's found, native to, created in, etc.
  uses: string[];         // Applications, purposes, significance, etc.
  funFact: string;        // Interesting information
  imageUri: string;
  description?: string;   // Brief description of the item
  // Optional jewelry-specific fields
  estimatedValue?: string;  // AI-provided value estimate (e.g., "$500 - $2,000")
  timePeriod?: string;      // Era or date range (e.g., "Art Deco Period, 1920-1935")
  history?: string;         // Historical context (max ~100 words)
  // Additional jewelry-specific fields
  rarity?: JewelryRarity;   // Rarity classification (common to legendary)
  gemstone?: string;        // Primary gemstone (e.g., "Diamond", "Ruby")
  caratWeight?: string;     // Gemstone weight (e.g., "1.5 carats")
  jewelryWeight?: string;   // Total piece weight (e.g., "8.2 grams")
}

// Visual match from web search
export interface VisualMatch {
  id: string;
  imageUrl: string;
  title: string;
  sourceUrl: string;
  sourceDomain: string;
}

// State for visual matches with loading/error
export interface VisualMatchState {
  matches: VisualMatch[];
  isLoading: boolean;
  error: string | null;
}

// Price reference from web research
export interface PriceReference {
  price: string;
  source: string;
  sourceUrl: string;
  itemDescription?: string;
}

// Appraisal data from web research
export interface AppraisalData {
  estimatedRange: string;
  confidence: 'high' | 'medium' | 'low';
  sources: PriceReference[];
}

// State for appraisal with loading/error
export interface AppraisalState {
  data: AppraisalData | null;
  isLoading: boolean;
  error: string | null;
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  imageUri: string | null;
  result: ObjectIdentification | null;
  error: string | null;
}