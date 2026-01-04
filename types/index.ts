// Rarity classification (generic, customize for your domain)
export type Rarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | string;

// Legacy alias for backward compatibility
export type JewelryRarity = Rarity;

// Generic identification interface that can be used for any object type
// (rocks, plants, birds, art, jewelry, etc.)
export interface ObjectIdentification {
  name: string;
  confidence: number;
  category?: string;      // Category/type (e.g., Ring, Necklace for jewelry; Oak, Maple for trees)
  composition: string[];  // Could be materials, species, ingredients, etc.
  formation: string;      // Could be origin, habitat, creation process, etc.
  locations: string[];    // Where it's found, native to, created in, etc.
  uses: string[];         // Applications, purposes, significance, etc.
  funFact: string;        // Interesting information
  imageUri: string;
  description?: string;   // Brief description of the item
  // Optional extended fields (customize for your domain)
  estimatedValue?: string;  // AI-provided value estimate
  timePeriod?: string;      // Era or date range
  history?: string;         // Historical context (max ~100 words)
  rarity?: Rarity;          // Rarity classification
  // Domain-specific fields (examples for jewelry apps)
  gemstone?: string;        // Primary gemstone
  caratWeight?: string;     // Gemstone weight
  jewelryWeight?: string;   // Total piece weight
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
