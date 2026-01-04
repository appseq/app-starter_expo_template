// Demo jewelry images - using local require statements
// Images sourced from Unsplash (royalty-free, no attribution required)

// Demo item images mapped to local assets
const demoItemImages = {
  // Rings
  diamondSolitaire: require('../../assets/demo-items/diamond-solitaire.jpg'),
  artDecoRing: require('../../assets/demo-items/art-deco-ring.jpg'),
  rubyEternity: require('../../assets/demo-items/ruby-eternity.jpg'),
  // Necklaces
  pearlStrand: require('../../assets/demo-items/pearl-strand.jpg'),
  goldChain: require('../../assets/demo-items/gold-chain.jpg'),
  emeraldPendant: require('../../assets/demo-items/emerald-pendant.jpg'),
  // Earrings
  diamondStuds: require('../../assets/demo-items/diamond-studs.jpg'),
  goldHoops: require('../../assets/demo-items/gold-hoops.jpg'),
  sapphireDrops: require('../../assets/demo-items/sapphire-drops.jpg'),
  // Bracelets
  tennisBracelet: require('../../assets/demo-items/tennis-bracelet.jpg'),
  charmBracelet: require('../../assets/demo-items/charm-bracelet.jpg'),
  goldBangle: require('../../assets/demo-items/gold-bangle.jpg'),
  // Watch
  dressWatch: require('../../assets/demo-items/dress-watch.jpg'),
  // Brooch
  cameoBrooch: require('../../assets/demo-items/cameo-brooch.jpg'),
};

// Map demo URIs to local images
export const getDemoItemImageSource = (uri: string): any => {
  switch (uri) {
    // Rings
    case 'demo://diamond-solitaire':
      return demoItemImages.diamondSolitaire;
    case 'demo://art-deco-ring':
      return demoItemImages.artDecoRing;
    case 'demo://ruby-eternity':
      return demoItemImages.rubyEternity;
    // Necklaces
    case 'demo://pearl-strand':
      return demoItemImages.pearlStrand;
    case 'demo://gold-chain':
      return demoItemImages.goldChain;
    case 'demo://emerald-pendant':
      return demoItemImages.emeraldPendant;
    // Earrings
    case 'demo://diamond-studs':
      return demoItemImages.diamondStuds;
    case 'demo://gold-hoops':
      return demoItemImages.goldHoops;
    case 'demo://sapphire-drops':
      return demoItemImages.sapphireDrops;
    // Bracelets
    case 'demo://tennis-bracelet':
      return demoItemImages.tennisBracelet;
    case 'demo://charm-bracelet':
      return demoItemImages.charmBracelet;
    case 'demo://gold-bangle':
      return demoItemImages.goldBangle;
    // Watch
    case 'demo://dress-watch':
      return demoItemImages.dressWatch;
    // Brooch
    case 'demo://cameo-brooch':
      return demoItemImages.cameoBrooch;
    default:
      // Fallback to diamond solitaire for any unrecognized demo URIs
      return demoItemImages.diamondSolitaire;
  }
};
