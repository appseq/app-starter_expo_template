import AsyncStorage from '@react-native-async-storage/async-storage';
import { ObjectIdentification } from '@/types';
import { APP_CONFIG } from '@/constants/appConfig';

// Demo data from configuration
// The actual demo samples are now defined in appConfig.ts
export const demoItems: ObjectIdentification[] = APP_CONFIG.demo.samples.map((sample, index) => ({
  ...sample,
  imageUri: `demo://${sample.name.toLowerCase().replace(/\s+/g, '-')}`,
}));

// Keep the original extended demo data for better screenshots
// NOTE: Demo images need to be added to assets/demo-items/ to match these items
const extendedDemoItems: ObjectIdentification[] = [
  // Rings
  {
    name: "Diamond Solitaire Ring",
    confidence: 96,
    category: "Ring",
    composition: ["18K White Gold", "Round Brilliant Diamond", "Platinum Prongs"],
    formation: "Classic six-prong Tiffany-style setting showcasing a brilliant-cut diamond with exceptional fire and scintillation",
    locations: ["Tiffany & Co., New York", "Cartier, Paris", "Harry Winston, USA"],
    uses: ["Engagement Ring", "Anniversary Gift", "Investment Piece", "Heirloom"],
    funFact: "The tradition of diamond engagement rings was popularized by De Beers' 1947 campaign 'A Diamond is Forever'!",
    imageUri: "demo://diamond-solitaire"
  },
  {
    name: "Vintage Art Deco Ring",
    confidence: 94,
    category: "Ring",
    composition: ["Platinum", "Old European Cut Diamond", "Sapphire Accents", "Milgrain Details"],
    formation: "Hand-crafted during the 1920s-1930s Art Deco period featuring geometric patterns and filigree work",
    locations: ["Estate Sales", "Christie's Auction", "Sotheby's", "Antique Dealers"],
    uses: ["Statement Piece", "Cocktail Ring", "Collection Item", "Special Occasions"],
    funFact: "Art Deco jewelry was inspired by the discovery of King Tutankhamun's tomb in 1922, bringing Egyptian motifs into fashion!",
    imageUri: "demo://art-deco-ring"
  },
  {
    name: "Ruby Eternity Band",
    confidence: 92,
    category: "Ring",
    composition: ["18K Yellow Gold", "Natural Burmese Rubies", "Channel Setting"],
    formation: "Continuous row of matched rubies set in a channel, symbolizing eternal love and commitment",
    locations: ["Burma (Myanmar)", "Thailand", "Mozambique", "Sri Lanka"],
    uses: ["Wedding Band", "Anniversary Ring", "Stacking Ring", "Right Hand Ring"],
    funFact: "Burmese rubies are called 'pigeon blood' red and are the most valuable rubies in the world!",
    imageUri: "demo://ruby-eternity"
  },
  // Necklaces
  {
    name: "Pearl Strand Necklace",
    confidence: 95,
    category: "Necklace",
    composition: ["Akoya Cultured Pearls", "14K White Gold Clasp", "Silk Thread"],
    formation: "Matched strand of lustrous Akoya pearls hand-knotted between each pearl for security and elegance",
    locations: ["Mikimoto, Japan", "South Sea Islands", "French Polynesia"],
    uses: ["Formal Events", "Bridal Jewelry", "Classic Everyday Wear", "Gift"],
    funFact: "Kokichi Mikimoto created the first cultured pearl in 1893, making pearls accessible to everyone!",
    imageUri: "demo://pearl-strand"
  },
  {
    name: "Gold Chain Necklace",
    confidence: 93,
    category: "Necklace",
    composition: ["14K Italian Gold", "Figaro Link Pattern", "Lobster Clasp"],
    formation: "Traditional Italian craftsmanship with alternating flat links creating the classic Figaro pattern",
    locations: ["Arezzo, Italy", "Vicenza, Italy", "New York Diamond District"],
    uses: ["Daily Wear", "Layering", "Pendant Chain", "Unisex Accessory"],
    funFact: "Italy produces 70% of the world's gold jewelry, with Arezzo being the global capital of gold chain manufacturing!",
    imageUri: "demo://gold-chain"
  },
  {
    name: "Emerald Pendant",
    confidence: 91,
    category: "Necklace",
    composition: ["Colombian Emerald", "18K Yellow Gold", "Diamond Halo", "Cable Chain"],
    formation: "Cushion-cut emerald surrounded by a halo of brilliant diamonds in a classic pendant setting",
    locations: ["Muzo Mine, Colombia", "Zambia", "Brazil", "Afghanistan"],
    uses: ["Special Occasions", "May Birthstone", "Statement Piece", "Investment"],
    funFact: "Cleopatra was famous for her love of emeralds, and she owned emerald mines in Egypt!",
    imageUri: "demo://emerald-pendant"
  },
  // Earrings
  {
    name: "Diamond Stud Earrings",
    confidence: 97,
    category: "Earrings",
    composition: ["14K White Gold", "Round Brilliant Diamonds", "4-Prong Martini Setting"],
    formation: "Perfectly matched pair of round brilliant diamonds in secure martini settings with screw backs",
    locations: ["Antwerp, Belgium", "Tel Aviv, Israel", "New York, USA", "Mumbai, India"],
    uses: ["Everyday Elegance", "Bridal", "Gift", "Investment"],
    funFact: "Diamond studs are the most popular diamond jewelry item, with over 30 million pairs sold annually worldwide!",
    imageUri: "demo://diamond-studs"
  },
  {
    name: "Gold Hoop Earrings",
    confidence: 90,
    category: "Earrings",
    composition: ["18K Yellow Gold", "Hollow Tube Construction", "Click-Top Closure"],
    formation: "Lightweight hollow construction allows for comfortable all-day wear with secure closure mechanism",
    locations: ["Italy", "Turkey", "United States", "Mexico"],
    uses: ["Casual Wear", "Office Appropriate", "Evening Out", "Gifting"],
    funFact: "Gold hoops date back to ancient Sumeria around 2500 BCE and were worn by both men and women!",
    imageUri: "demo://gold-hoops"
  },
  {
    name: "Sapphire Drop Earrings",
    confidence: 93,
    category: "Earrings",
    composition: ["Ceylon Blue Sapphires", "18K White Gold", "Pavé Diamonds", "French Wire"],
    formation: "Pear-shaped sapphires suspended from diamond-set drops with comfortable French wire backs",
    locations: ["Sri Lanka (Ceylon)", "Kashmir", "Madagascar", "Montana, USA"],
    uses: ["Black Tie Events", "September Birthstone", "Wedding", "Anniversary"],
    funFact: "Princess Diana's famous sapphire engagement ring, now worn by Kate Middleton, sparked a global sapphire trend!",
    imageUri: "demo://sapphire-drops"
  },
  // Bracelets
  {
    name: "Tennis Bracelet",
    confidence: 94,
    category: "Bracelet",
    composition: ["14K White Gold", "Round Brilliant Diamonds", "Four-Prong Settings", "Box Clasp"],
    formation: "Line of individually set diamonds in a flexible bracelet with hidden safety clasp",
    locations: ["New York Diamond District", "Antwerp", "Hong Kong", "Dubai"],
    uses: ["Formal Events", "Everyday Luxury", "Stacking", "Anniversary Gift"],
    funFact: "Called 'tennis bracelet' after Chris Evert's diamond bracelet flew off during the 1987 US Open, stopping the match!",
    imageUri: "demo://tennis-bracelet"
  },
  {
    name: "Charm Bracelet",
    confidence: 89,
    category: "Bracelet",
    composition: ["Sterling Silver", "Enamel Charms", "Crystal Accents", "Toggle Clasp"],
    formation: "Link bracelet designed to hold collectible charms representing memories and milestones",
    locations: ["Pandora, Denmark", "Tiffany & Co.", "James Avery, USA", "Thomas Sabo, Germany"],
    uses: ["Personal Expression", "Memory Keeping", "Gift Giving", "Collection Building"],
    funFact: "Queen Victoria popularized charm bracelets in the 1800s, wearing them as fashionable trinkets!",
    imageUri: "demo://charm-bracelet"
  },
  {
    name: "Gold Bangle",
    confidence: 92,
    category: "Bracelet",
    composition: ["22K Yellow Gold", "Solid Construction", "Traditional Indian Design"],
    formation: "Handcrafted solid gold bangle with intricate traditional patterns and high-polish finish",
    locations: ["India", "Dubai Gold Souk", "Singapore", "Bangkok"],
    uses: ["Wedding Jewelry", "Cultural Celebrations", "Investment", "Stacking"],
    funFact: "In Indian culture, gold bangles are considered auspicious and are an essential part of bridal jewelry!",
    imageUri: "demo://gold-bangle"
  },
  // Watches
  {
    name: "Luxury Dress Watch",
    confidence: 95,
    category: "Watch",
    composition: ["18K Rose Gold Case", "Swiss Automatic Movement", "Sapphire Crystal", "Alligator Strap"],
    formation: "Hand-assembled Swiss movement with decorated rotor visible through exhibition caseback",
    locations: ["Geneva, Switzerland", "Le Brassus", "Glashütte, Germany", "Tokyo, Japan"],
    uses: ["Formal Occasions", "Business Attire", "Collection", "Investment"],
    funFact: "A single Patek Philippe watch contains over 250 hand-finished parts and takes 9 months to produce!",
    imageUri: "demo://dress-watch"
  },
  // Brooches
  {
    name: "Vintage Cameo Brooch",
    confidence: 88,
    category: "Brooch",
    composition: ["Hand-Carved Shell", "14K Gold Frame", "Seed Pearl Border"],
    formation: "Relief carving technique on layered shell creating a portrait profile, popular since ancient Rome",
    locations: ["Torre del Greco, Italy", "Estate Sales", "Antique Markets", "Museums"],
    uses: ["Lapel Decoration", "Scarf Pin", "Collection Piece", "Heirloom"],
    funFact: "Queen Victoria owned over 600 cameos and made them the must-have accessory of the Victorian era!",
    imageUri: "demo://cameo-brooch"
  }
];

export class DemoDataService {
  private static DEMO_MODE_KEY = 'DEMO_MODE_ACTIVE';
  private static SAVED_ITEMS_KEY = 'savedItems';
  private static ORIGINAL_ITEMS_BACKUP_KEY = 'originalItemsBackup';

  /**
   * Check if demo mode is currently active
   * Always returns false in production builds for safety
   */
  static async isDemoMode(): Promise<boolean> {
    // Never allow demo mode in production
    if (!__DEV__) {
      return false;
    }

    try {
      const demoMode = await AsyncStorage.getItem(this.DEMO_MODE_KEY);
      return demoMode === 'true';
    } catch (error) {
      console.error('Error checking demo mode:', error);
      return false;
    }
  }

  /**
   * Enable demo mode and inject demo data
   * Only works in development builds
   */
  static async enableDemoMode(): Promise<void> {
    // Prevent enabling demo mode in production
    if (!__DEV__) {
      console.warn('Demo mode cannot be enabled in production builds');
      return;
    }

    try {
      console.log('🎬 Enabling Demo Mode for Screenshots...');
      
      // Backup existing data
      const existingItems = await AsyncStorage.getItem(this.SAVED_ITEMS_KEY);
      if (existingItems) {
        await AsyncStorage.setItem(this.ORIGINAL_ITEMS_BACKUP_KEY, existingItems);
        console.log('✅ Backed up existing items');
      }

      // Inject demo data - use extended data if available, otherwise use config data
      const dataToInject = extendedDemoItems.length > 0 ? extendedDemoItems : demoItems;
      await AsyncStorage.setItem(this.SAVED_ITEMS_KEY, JSON.stringify(dataToInject));
      await AsyncStorage.setItem(this.DEMO_MODE_KEY, 'true');
      
      console.log(`✅ Injected ${dataToInject.length} demo ${APP_CONFIG.ai.objectTypePlural}`);
      console.log('📸 Ready for App Store screenshots!');
    } catch (error) {
      console.error('Error enabling demo mode:', error);
      throw error;
    }
  }

  /**
   * Disable demo mode and restore original data
   */
  static async disableDemoMode(): Promise<void> {
    try {
      console.log('🔚 Disabling Demo Mode...');
      
      // Restore original data
      const originalData = await AsyncStorage.getItem(this.ORIGINAL_ITEMS_BACKUP_KEY);
      if (originalData) {
        await AsyncStorage.setItem(this.SAVED_ITEMS_KEY, originalData);
        await AsyncStorage.removeItem(this.ORIGINAL_ITEMS_BACKUP_KEY);
        console.log('✅ Restored original items');
      } else {
        // If no backup, just clear the demo data
        await AsyncStorage.removeItem(this.SAVED_ITEMS_KEY);
        console.log('✅ Cleared demo items');
      }

      await AsyncStorage.removeItem(this.DEMO_MODE_KEY);
      console.log('✅ Demo mode disabled');
    } catch (error) {
      console.error('Error disabling demo mode:', error);
      throw error;
    }
  }

  /**
   * Get a random demo item for identification result
   */
  static getRandomDemoItem(imageUri: string): ObjectIdentification {
    const randomIndex = Math.floor(Math.random() * demoItems.length);
    const item = { ...demoItems[randomIndex] };
    item.imageUri = imageUri; // Use the actual captured image
    item.confidence = 85 + Math.floor(Math.random() * 12); // Random confidence 85-96
    return item;
  }

  /**
   * Get demo items for collection view
   */
  static getDemoItems(): ObjectIdentification[] {
    return demoItems;
  }

  /**
   * Prefetch images - not needed for local assets but kept for compatibility
   */
  static async prefetchImages(): Promise<void> {
    // Local images don't need prefetching
    console.log('✅ Demo images ready (using local assets)');
    return Promise.resolve();
  }
}

export default DemoDataService;