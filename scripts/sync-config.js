#!/usr/bin/env node
/**
 * Configuration Sync Validation
 * ==============================
 *
 * This script validates that app.config.js and constants/appConfig.ts both
 * correctly read from config.json (the single source of truth).
 *
 * Architecture:
 * - config.json: Single source of truth for basic configuration
 * - app.config.js: Reads from config.json (for Expo prebuild)
 * - constants/appConfig.ts: Extends config.json with TypeScript features
 *
 * This script checks that:
 * 1. config.json exists and is valid
 * 2. app.config.js correctly imports and uses config.json
 * 3. appConfig.ts correctly imports from config.json
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

log('\n🔄 Configuration Sync Validation', 'bright');
log('='.repeat(60), 'cyan');

let errors = 0;
let warnings = 0;

// ============================================
// 1. Validate config.json exists and is valid
// ============================================
log('\n📄 Checking config.json...', 'blue');

const configJsonPath = path.join(__dirname, '..', 'config/config.json');
if (!fs.existsSync(configJsonPath)) {
  logError('config.json not found!');
  errors++;
} else {
  try {
    const configJson = JSON.parse(fs.readFileSync(configJsonPath, 'utf-8'));
    logSuccess('config.json exists and is valid JSON');

    // Validate required fields
    const requiredFields = [
      'app.name',
      'app.version',
      'bundleId.ios',
      'bundleId.android',
      'appStore.appleTeamId',
    ];

    requiredFields.forEach(field => {
      const keys = field.split('.');
      let value = configJson;
      for (const key of keys) {
        value = value?.[key];
      }

      if (!value) {
        logError(`config.json missing required field: ${field}`);
        errors++;
      } else {
        logSuccess(`config.json has ${field}: ${value}`);
      }
    });
  } catch (error) {
    logError(`config.json is invalid JSON: ${error.message}`);
    errors++;
  }
}

// ============================================
// 2. Validate app.config.js reads from config.json
// ============================================
log('\n📄 Checking app.config.js...', 'blue');

const appConfigJsPath = path.join(__dirname, '..', 'app.config.js');
if (!fs.existsSync(appConfigJsPath)) {
  logError('app.config.js not found!');
  errors++;
} else {
  try {
    const appConfigJsContent = fs.readFileSync(appConfigJsPath, 'utf-8');

    // Check if it imports config.json
    if (appConfigJsContent.includes("require('./config/config.json')")) {
      logSuccess('app.config.js imports config.json from config/ folder');
    } else {
      logError('app.config.js does not import config.json from config/ folder');
      errors++;
    }

    // Load and validate exported config
    const appConfig = require(appConfigJsPath).expo;
    const baseConfig = JSON.parse(fs.readFileSync(configJsonPath, 'utf-8'));

    const checks = [
      { name: 'App Name', actual: appConfig.name, expected: baseConfig.app.name },
      { name: 'Version', actual: appConfig.version, expected: baseConfig.app.version },
      { name: 'iOS Bundle ID', actual: appConfig.ios.bundleIdentifier, expected: baseConfig.bundleId.ios },
      { name: 'Android Package', actual: appConfig.android.package, expected: baseConfig.bundleId.android },
      { name: 'Apple Team ID', actual: appConfig.ios.appleTeamId, expected: baseConfig.appStore.appleTeamId },
    ];

    checks.forEach(check => {
      if (check.actual === check.expected) {
        logSuccess(`${check.name} matches config.json: ${check.actual}`);
      } else {
        logError(`${check.name} mismatch!`);
        logError(`  Expected (config.json): ${check.expected}`);
        logError(`  Actual (app.config.js): ${check.actual}`);
        errors++;
      }
    });
  } catch (error) {
    logError(`Failed to validate app.config.js: ${error.message}`);
    errors++;
  }
}

// ============================================
// 3. Validate appConfig.ts imports from config.json
// ============================================
log('\n📄 Checking constants/appConfig.ts...', 'blue');

const appConfigTsPath = path.join(__dirname, '..', 'constants', 'appConfig.ts');
if (!fs.existsSync(appConfigTsPath)) {
  logError('constants/appConfig.ts not found!');
  errors++;
} else {
  try {
    const appConfigTsContent = fs.readFileSync(appConfigTsPath, 'utf-8');

    // Check if it imports config.json
    if (appConfigTsContent.includes("from '../config/config.json'")) {
      logSuccess('appConfig.ts imports from config.json in config/ folder');
    } else if (appConfigTsContent.includes('from \'../config/config.json\'')) {
      logSuccess('appConfig.ts imports from config.json in config/ folder');
    } else {
      logError('appConfig.ts does not import from config.json in config/ folder');
      errors++;
    }

    // Check if it uses baseConfig
    if (appConfigTsContent.includes('baseConfig')) {
      logSuccess('appConfig.ts uses baseConfig to extend config.json');
    } else {
      logWarning('appConfig.ts does not reference baseConfig');
      warnings++;
    }
  } catch (error) {
    logError(`Failed to read appConfig.ts: ${error.message}`);
    errors++;
  }
}

// ============================================
// Summary
// ============================================
log('\n' + '='.repeat(60), 'cyan');

if (errors === 0 && warnings === 0) {
  logSuccess('All configuration files are properly synchronized!');
  log('\nconfig.json is the single source of truth ✨', 'green');
  process.exit(0);
} else if (errors === 0) {
  logWarning(`Configuration sync completed with ${warnings} warning(s)`);
  process.exit(0);
} else {
  logError(`Configuration sync failed with ${errors} error(s) and ${warnings} warning(s)`);
  log('\nPlease ensure:', 'red');
  log('  1. config.json exists and has all required fields', 'red');
  log('  2. app.config.js imports and uses config.json', 'red');
  log('  3. constants/appConfig.ts imports from config.json', 'red');
  log('\nSee: docs/CONFIGURATION.md for details', 'blue');
  process.exit(1);
}
