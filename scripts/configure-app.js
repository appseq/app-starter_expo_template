#!/usr/bin/env node

/**
 * Configure App Script
 * 
 * This script reads the app configuration from constants/appConfig.ts
 * and updates the necessary project files.
 */

const fs = require('fs');
const path = require('path');

// Function to extract the APP_CONFIG object from the appConfig.ts file
function getAppConfig() {
  const configPath = path.join(__dirname, '../constants/appConfig.ts');
  const fileContent = fs.readFileSync(configPath, 'utf8');

  const getConfigValue = (key) => {
    const regex = new RegExp(`${key}:\\s*'(.+?)'`);
    const match = fileContent.match(regex);
    return match ? match[1] : null;
  };

  return {
    app: {
      name: getConfigValue('name'),
      slug: getConfigValue('slug'),
      version: getConfigValue('version'),
      scheme: getConfigValue('scheme'),
    },
    ios: {
      bundleIdentifier: getConfigValue('bundleIdentifier'),
    },
    android: {
      package: getConfigValue('package'),
    },
  };
}

const config = getAppConfig();

// Update app.json
const appJsonPath = path.join(__dirname, '../app.json');
const appJson = require(appJsonPath);

appJson.expo.name = config.app.name;
appJson.expo.slug = config.app.slug;
appJson.expo.version = config.app.version;
appJson.expo.scheme = config.app.scheme;
appJson.expo.ios.bundleIdentifier = config.ios.bundleIdentifier;
appJson.expo.android.package = config.android.package;

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log('✅ Updated app.json');

// Update package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = require(packageJsonPath);

packageJson.name = config.app.slug;
packageJson.version = config.app.version;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json');

// Update Info.plist
const infoPlistPath = path.join(__dirname, `../ios/${config.app.slug}/Info.plist`);
if (fs.existsSync(infoPlistPath)) {
  let infoPlist = fs.readFileSync(infoPlistPath, 'utf8');

  infoPlist = infoPlist.replace(
    /<key>CFBundleDisplayName<\/key>\s*<string>.*<\/string>/,
    `<key>CFBundleDisplayName</key>\n\t<string>${config.app.name}<\/string>`
  );

  fs.writeFileSync(infoPlistPath, infoPlist);
  console.log('✅ Updated Info.plist');
} else {
    console.log('⚠️ Could not find Info.plist. Please run "npx expo prebuild" to generate the ios directory.');
}

console.log('\n🚀 App configured successfully!\n');