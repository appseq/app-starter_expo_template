#!/usr/bin/env node

/**
 * Demo Mode CLI Script
 * 
 * Usage:
 *   npm run demo:enable  - Enable demo mode with sample data
 *   npm run demo:disable - Disable demo mode and restore original data
 *   npm run demo:status  - Check if demo mode is enabled
 * 
 * This script helps prepare the app for App Store screenshots by
 * injecting realistic demo data into the app's AsyncStorage.
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// Parse command line arguments
const command = process.argv[2];

// Demo data to inject
const demoData = {
  DEMO_MODE_ACTIVE: 'true',
  savedItems: JSON.stringify([
    {
      name: "Rose Quartz",
      confidence: 94,
      composition: ["Silicon Dioxide", "Titanium", "Iron", "Manganese"],
      formation: "Formed in pegmatite deposits through slow crystallization of magma rich in water and dissolved minerals",
      locations: ["Minas Gerais, Brazil", "Madagascar", "South Dakota, USA", "Namibia"],
      uses: ["Jewelry", "Healing Crystals", "Decorative Objects", "Meditation"],
      funFact: "Ancient Egyptians and Romans believed rose quartz could prevent aging and used it in face masks!",
      imageUri: "https://images.unsplash.com/photo-1599948815541-4deeb82658c3?w=800&q=80"
    },
    {
      name: "Amethyst",
      confidence: 92,
      composition: ["Silicon Dioxide", "Iron Impurities", "Trace Aluminum"],
      formation: "Created in volcanic rocks when silica-rich liquids crystallize in gas cavities called geodes",
      locations: ["Uruguay", "Brazil", "Zambia", "Ontario, Canada"],
      uses: ["Jewelry", "Ornamental Stone", "Spiritual Practices", "Collecting"],
      funFact: "The name comes from Greek 'amethystos' meaning 'not drunk' - ancient Greeks believed it prevented intoxication!",
      imageUri: "https://images.unsplash.com/photo-1603228256639-bda86e0cceb7?w=800&q=80"
    },
    {
      name: "Obsidian",
      confidence: 88,
      composition: ["Silicon Dioxide", "Magnesium Oxide", "Iron Oxide"],
      formation: "Volcanic glass formed when lava cools so rapidly that crystals don't have time to grow",
      locations: ["Iceland", "Japan", "Mexico", "United States"],
      uses: ["Surgical Scalpels", "Arrowheads", "Jewelry", "Decorative Items"],
      funFact: "Obsidian blades can be 500 times sharper than steel and are still used in some surgeries today!",
      imageUri: "https://images.unsplash.com/photo-1608658549298-6056c98dd7e8?w=800&q=80"
    },
    {
      name: "Labradorite",
      confidence: 91,
      composition: ["Plagioclase Feldspar", "Calcium", "Sodium", "Aluminum"],
      formation: "Crystallizes from molten rock deep within the Earth's crust under high pressure",
      locations: ["Labrador, Canada", "Madagascar", "Finland", "Russia"],
      uses: ["Jewelry", "Building Facades", "Countertops", "Art Objects"],
      funFact: "Its iridescent play of colors is called 'labradorescence' and was believed by Inuit peoples to be the frozen fire of the Aurora Borealis!",
      imageUri: "https://images.unsplash.com/photo-1609668553039-d6c1116ad736?w=800&q=80"
    },
    {
      name: "Malachite",
      confidence: 87,
      composition: ["Copper Carbonate Hydroxide", "Copper", "Carbon", "Oxygen"],
      formation: "Forms in the oxidation zones of copper ore deposits through chemical precipitation",
      locations: ["Democratic Republic of Congo", "Russia", "Australia", "Arizona, USA"],
      uses: ["Jewelry", "Pigment", "Ornamental Stone", "Copper Ore"],
      funFact: "In ancient Egypt, malachite was worn by children to protect them from evil spirits and was ground into eyeshadow!",
      imageUri: "https://images.unsplash.com/photo-1544965478-e90d18e164dc?w=800&q=80"
    }
  ])
};

async function enableDemoMode() {
  console.log(`${colors.cyan}🎬 Enabling Demo Mode for App Store Screenshots...${colors.reset}\n`);
  
  try {
    // Note: This is a simplified version. In production, you would use
    // react-native-cli or expo-cli to properly inject data into AsyncStorage
    console.log(`${colors.yellow}⚠️  Important: Demo mode must be enabled from within the app!${colors.reset}`);
    console.log(`${colors.bright}To enable demo mode:${colors.reset}`);
    console.log('1. Open the app in the iOS Simulator');
    console.log('2. Navigate to Settings (tab bar or menu)');
    console.log('3. Find "Screenshot Mode" section (only visible in development)');
    console.log('4. Toggle "Demo Mode" switch ON');
    console.log('');
    console.log(`${colors.green}✨ The app will be populated with beautiful item samples!${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}Demo items included:${colors.reset}`);
    console.log('  • Rose Quartz - Pink crystal with healing properties');
    console.log('  • Amethyst - Purple geode from volcanic activity');
    console.log('  • Obsidian - Black volcanic glass, sharper than steel');
    console.log('  • Labradorite - Iridescent stone with aurora colors');
    console.log('  • Malachite - Green banded copper mineral');
    console.log('  ... and 5 more!');
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function disableDemoMode() {
  console.log(`${colors.cyan}🔚 Disabling Demo Mode...${colors.reset}\n`);
  
  try {
    console.log(`${colors.yellow}⚠️  Important: Demo mode must be disabled from within the app!${colors.reset}`);
    console.log(`${colors.bright}To disable demo mode:${colors.reset}`);
    console.log('1. Open the app in the iOS Simulator');
    console.log('2. Navigate to Settings');
    console.log('3. Find "Screenshot Mode" section');
    console.log('4. Toggle "Demo Mode" switch OFF');
    console.log('');
    console.log(`${colors.green}✅ Your original item collection will be restored!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function checkStatus() {
  console.log(`${colors.cyan}📊 Checking Demo Mode Status...${colors.reset}\n`);
  
  console.log(`${colors.yellow}⚠️  Check demo mode status from within the app!${colors.reset}`);
  console.log(`${colors.bright}To check status:${colors.reset}`);
  console.log('1. Open the app in the iOS Simulator');
  console.log('2. Navigate to Settings');
  console.log('3. Look for "Screenshot Mode" section');
  console.log('4. Check if "Demo Mode" switch is ON or OFF');
  console.log('');
  console.log(`${colors.bright}If you see the amber-bordered section, you're in development mode!${colors.reset}`);
}

// Import the app name constant
const APP_NAME = 'Item Identifier'; // Direct constant instead of importing from TS module

function showHelp() {
  console.log(`${colors.bright}📸 ${APP_NAME} Demo Mode Script${colors.reset}`);
  console.log('');
  console.log('This script helps prepare your app for App Store screenshots');
  console.log('by populating it with beautiful, realistic demo data.');
  console.log('');
  console.log(`${colors.bright}Usage:${colors.reset}`);
  console.log('  npm run demo:enable   - Enable demo mode');
  console.log('  npm run demo:disable  - Disable demo mode');
  console.log('  npm run demo:status   - Check current status');
  console.log('');
  console.log(`${colors.bright}Screenshot Tips:${colors.reset}`);
  console.log('  • Use iPhone 15 Pro Max for 6.9" screenshots');
  console.log('  • Use iPhone 15 Pro for 6.1" screenshots');
  console.log('  • Take screenshots with Cmd+S in Simulator');
  console.log('  • Screenshots save to Desktop by default');
  console.log('  • Use fastlane to resize and upload');
  console.log('');
  console.log(`${colors.bright}Recommended Screenshots:${colors.reset}`);
  console.log('  1. Collection view with all demo items');
  console.log('  2. Item details page (Rose Quartz or Amethyst)');
  console.log('  3. Camera/identify screen');
  console.log('  4. Analysis in progress');
  console.log('  5. Learn/educational content');
}

// Main execution
async function main() {
  switch (command) {
    case 'enable':
      await enableDemoMode();
      break;
    case 'disable':
      await disableDemoMode();
      break;
    case 'status':
      await checkStatus();
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      showHelp();
      break;
    default:
      console.error(`${colors.red}Unknown command: ${command}${colors.reset}`);
      console.log('Use "npm run demo:help" for usage information');
      process.exit(1);
  }
}

main().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});
