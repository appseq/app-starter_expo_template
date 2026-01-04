// Mock data for Jewelry Identifier app

export type JewelryCategory = 'ring' | 'necklace' | 'earring' | 'bracelet' | 'brooch' | 'watch' | 'gemstone';
export type JewelryRarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';

export interface JewelryItem {
  id: string;
  name: string;
  category: JewelryCategory;
  materials: string[];
  estimatedValue: {
    min: number;
    max: number;
    currency: string;
  };
  era?: string;
  origin?: string;
  image: string;
  rarity: JewelryRarity;
  description?: string;
  careTips?: string[];
}

export interface WikiArticle {
  id: string;
  title: string;
  category: string;
  image: string;
  summary?: string;
}

export interface OnboardingSlide {
  id: string;
  type: 'showcase' | 'camera' | 'details' | 'collection';
  title: string;
  subtitle: string;
}

// Sample jewelry items for demo/mock purposes
export const mockJewelry: JewelryItem[] = [
  {
    id: '1',
    name: 'Victorian Diamond Ring',
    category: 'ring',
    materials: ['Gold', 'Diamond'],
    estimatedValue: { min: 2500, max: 5000, currency: 'USD' },
    era: 'Victorian (1837-1901)',
    origin: 'England',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
    rarity: 'rare',
    description: 'An exquisite Victorian-era engagement ring featuring a brilliant-cut diamond in an ornate gold setting.',
    careTips: ['Clean with mild soap and warm water', 'Store separately to prevent scratches'],
  },
  {
    id: '2',
    name: 'Art Deco Pearl Necklace',
    category: 'necklace',
    materials: ['Pearl', 'Platinum'],
    estimatedValue: { min: 1200, max: 2800, currency: 'USD' },
    era: 'Art Deco (1920-1940)',
    origin: 'France',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    rarity: 'uncommon',
    description: 'A stunning Art Deco pearl necklace with platinum clasp and geometric design elements.',
    careTips: ['Wipe with soft cloth after wearing', 'Keep away from perfumes and cosmetics'],
  },
  {
    id: '3',
    name: 'Emerald Drop Earrings',
    category: 'earring',
    materials: ['Emerald', 'Gold'],
    estimatedValue: { min: 3500, max: 7000, currency: 'USD' },
    era: 'Contemporary',
    origin: 'Colombia',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    rarity: 'rare',
    description: 'Elegant emerald drop earrings featuring natural Colombian emeralds in 18k gold settings.',
    careTips: ['Avoid ultrasonic cleaners', 'Store in soft pouch'],
  },
  {
    id: '4',
    name: 'Tennis Bracelet',
    category: 'bracelet',
    materials: ['Diamond', 'White Gold'],
    estimatedValue: { min: 4000, max: 8500, currency: 'USD' },
    era: 'Contemporary',
    origin: 'USA',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
    rarity: 'uncommon',
    description: 'Classic tennis bracelet with round brilliant diamonds set in 14k white gold.',
    careTips: ['Professional cleaning recommended yearly', 'Check clasp regularly'],
  },
  {
    id: '5',
    name: 'Vintage Cameo Brooch',
    category: 'brooch',
    materials: ['Shell', 'Gold'],
    estimatedValue: { min: 800, max: 1500, currency: 'USD' },
    era: 'Edwardian (1901-1910)',
    origin: 'Italy',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400',
    rarity: 'rare',
    description: 'A beautiful hand-carved shell cameo brooch with ornate gold frame.',
    careTips: ['Handle with care - shell is fragile', 'Keep away from direct sunlight'],
  },
  {
    id: '6',
    name: 'Cartier Tank Watch',
    category: 'watch',
    materials: ['Gold', 'Sapphire'],
    estimatedValue: { min: 5000, max: 12000, currency: 'USD' },
    era: 'Mid-Century Modern',
    origin: 'Switzerland',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
    rarity: 'very_rare',
    description: 'Iconic Cartier Tank watch with gold case and sapphire crown.',
    careTips: ['Service movement every 3-5 years', 'Avoid magnetic fields'],
  },
  {
    id: '7',
    name: 'Natural Blue Sapphire',
    category: 'gemstone',
    materials: ['Sapphire'],
    estimatedValue: { min: 2000, max: 6000, currency: 'USD' },
    era: 'Natural',
    origin: 'Sri Lanka',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400',
    rarity: 'rare',
    description: 'A stunning natural blue sapphire with excellent clarity and deep color saturation.',
    careTips: ['Can be cleaned ultrasonically', 'Store away from other gems'],
  },
  {
    id: '8',
    name: 'Rose Gold Engagement Ring',
    category: 'ring',
    materials: ['Rose Gold', 'Diamond'],
    estimatedValue: { min: 1800, max: 3500, currency: 'USD' },
    era: 'Contemporary',
    origin: 'USA',
    image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=400',
    rarity: 'common',
    description: 'Modern engagement ring featuring a round diamond in rose gold halo setting.',
    careTips: ['Rhodium plating may need refresh', 'Clean regularly with jewelry cloth'],
  },
];

// Jewelry types for rotating text animation
export const jewelryTypes = [
  'a ring',
  'a necklace',
  'earrings',
  'a bracelet',
  'a brooch',
  'a gemstone',
  'a watch',
  'vintage jewelry',
];

// Categories for filtering
export const categories = [
  'All',
  'Rings',
  'Necklaces',
  'Earrings',
  'Bracelets',
  'Brooches',
  'Watches',
  'Gemstones',
];

// Wiki articles for learn section
export const wikiArticles: WikiArticle[] = [
  {
    id: '1',
    title: 'The 4 Cs of Diamonds',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=400',
    summary: 'Learn about Cut, Color, Clarity, and Carat weight.',
  },
  {
    id: '2',
    title: 'Gold Purity Guide',
    category: 'Materials',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400',
    summary: 'Understanding karats: 24k, 18k, 14k, and more.',
  },
  {
    id: '3',
    title: 'Jewelry Through the Ages',
    category: 'History',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400',
    summary: 'From ancient Egypt to modern day.',
  },
  {
    id: '4',
    title: 'Gemstone Identification',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400',
    summary: 'How to identify precious and semi-precious stones.',
  },
  {
    id: '5',
    title: 'Caring for Your Jewelry',
    category: 'Care',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    summary: 'Tips to keep your jewelry sparkling.',
  },
  {
    id: '6',
    title: 'Art Deco Style',
    category: 'History',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
    summary: 'The glamour of 1920s jewelry design.',
  },
];

// Onboarding slides
export const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    type: 'showcase',
    title: 'Discover Your Jewelry',
    subtitle: 'Identify rings, necklaces, gemstones and more with AI-powered recognition.',
  },
  {
    id: '2',
    type: 'camera',
    title: 'Snap a Photo',
    subtitle: 'Point your camera at any piece of jewelry to get started.',
  },
  {
    id: '3',
    type: 'details',
    title: 'Get Instant Details',
    subtitle: 'Learn about materials, estimated value, era, and care tips.',
  },
  {
    id: '4',
    type: 'collection',
    title: 'Build Your Collection',
    subtitle: 'Save and organize all your identified pieces in one place.',
  },
];

// Carousel images for explore screen
export const carouselImages = [
  { id: '1', uri: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', label: 'Diamond Ring' },
  { id: '2', uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', label: 'Pearl Necklace' },
  { id: '3', uri: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', label: 'Emerald Earrings' },
  { id: '4', uri: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', label: 'Tennis Bracelet' },
  { id: '5', uri: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400', label: 'Blue Sapphire' },
];

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to format value range
export function formatValueRange(item: JewelryItem): string {
  const { min, max, currency } = item.estimatedValue;
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
}
