#!/usr/bin/env node

/**
 * Generate Demo Item Images
 * Creates beautiful gradient placeholder images for demo items
 */

const fs = require('fs');
const path = require('path');

// Item colors for placeholders
const itemColors = {
  'rose-quartz': { gradient: ['#FFB6C1', '#FF69B4'], emoji: '💎' },
  'labradorite': { gradient: ['#4169E1', '#00CED1'], emoji: '🔮' },
  'malachite': { gradient: ['#00FF00', '#228B22'], emoji: '💚' },
  'turquoise': { gradient: ['#40E0D0', '#00CED1'], emoji: '🟦' },
  'fluorite': { gradient: ['#9370DB', '#8A2BE2'], emoji: '💜' },
  'selenite': { gradient: ['#F8F8FF', '#E6E6FA'], emoji: '⚪' },
};

// Create SVG placeholder images
function createPlaceholderSVG(name, colors) {
  const width = 800;
  const height = 800;
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.gradient[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.gradient[1]};stop-opacity:1" />
    </linearGradient>
    <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="25" cy="25" r="2" fill="${colors.gradient[0]}" opacity="0.3"/>
      <circle cx="75" cy="75" r="2" fill="${colors.gradient[1]}" opacity="0.3"/>
      <circle cx="25" cy="75" r="2" fill="${colors.gradient[0]}" opacity="0.3"/>
      <circle cx="75" cy="25" r="2" fill="${colors.gradient[1]}" opacity="0.3"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#gradient)"/>
  
  <!-- Pattern overlay -->
  <rect width="${width}" height="${height}" fill="url(#pattern)"/>
  
  <!-- Crystal shape -->
  <g transform="translate(${width/2}, ${height/2})">
    <!-- Main crystal -->
    <path d="M 0,-200 L 100,-100 L 100,100 L 0,200 L -100,100 L -100,-100 Z" 
          fill="${colors.gradient[0]}" 
          opacity="0.8" 
          stroke="${colors.gradient[1]}" 
          stroke-width="3"/>
    
    <!-- Inner facets -->
    <path d="M 0,-200 L 50,-50 L 0,0 Z" fill="${colors.gradient[1]}" opacity="0.6"/>
    <path d="M 0,-200 L -50,-50 L 0,0 Z" fill="${colors.gradient[0]}" opacity="0.5"/>
    <path d="M 0,200 L 50,50 L 0,0 Z" fill="${colors.gradient[1]}" opacity="0.5"/>
    <path d="M 0,200 L -50,50 L 0,0 Z" fill="${colors.gradient[0]}" opacity="0.6"/>
  </g>
  
  <!-- Item name -->
  <text x="${width/2}" y="${height - 50}" 
        font-family="Arial, sans-serif" 
        font-size="32" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="white" 
        opacity="0.9">
    ${name.replace('-', ' ').toUpperCase()}
  </text>
</svg>`;
  
  return svg;
}

// Generate placeholder images
const assetsDir = path.join(__dirname, '../assets/demo-items');

// Ensure directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate SVG placeholders for missing items
Object.entries(itemColors).forEach(([name, colors]) => {
  const svgPath = path.join(assetsDir, `${name}.svg`);
  const svg = createPlaceholderSVG(name, colors);
  fs.writeFileSync(svgPath, svg);
  console.log(`✅ Generated ${name}.svg`);
});

console.log('\n📸 Demo item images are ready!');
console.log('💡 Import demo images using: import { getDemoItemImageSource } from "@/constants/demoImages"');
