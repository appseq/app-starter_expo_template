#!/usr/bin/env node
/**
 * Configuration Validation Script
 * ================================
 *
 * This script validates that all critical configuration values are set correctly.
 * Run this before builds to catch configuration errors early.
 *
 * Usage:
 *   node scripts/validate-config.js
 *   npm run validate-config (if added to package.json)
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    logWarning('.env file not found. Environment variables will not be loaded.');
    logInfo('Run: cp .env.example .env');
    return false;
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    logSuccess('.env file loaded successfully');
    return true;
  } catch (error) {
    logError(`Failed to load .env file: ${error.message}`);
    return false;
  }
}

// Load config.json (source of truth)
function loadConfig() {
  try {
    const configPath = path.join(__dirname, '..', 'config/config.json');
    if (!fs.existsSync(configPath)) {
      logError('config.json not found!');
      return null;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    logSuccess('config.json loaded');

    return {
      version: config.app.version,
      iosBundle: config.bundleId.ios,
      androidPackage: config.bundleId.android,
      appleTeamId: config.appStore.appleTeamId,
    };
  } catch (error) {
    logError(`Failed to load config.json: ${error.message}`);
    return null;
  }
}

// Validate environment variables
function validateEnvironmentVariables() {
  logHeader('ENVIRONMENT VARIABLES VALIDATION');

  const errors = [];
  const warnings = [];

  // Required variables
  const required = {
    EXPO_PUBLIC_AIPROXY_PARTIAL_KEY: {
      validator: (val) => val && val.startsWith('v2|') && !val.includes('your_'),
      message: 'Must start with "v2|" and not be a placeholder',
    },
    EXPO_PUBLIC_AIPROXY_SERVICE_URL: {
      validator: (val) => val && val.startsWith('https://') && !val.includes('your_'),
      message: 'Must be a valid HTTPS URL',
    },
    EXPO_PUBLIC_AIPROXY_DEVICECHECK_BYPASS: {
      validator: (val) => val && val.length > 20 && !val.includes('your_'),
      message: 'Must be a valid UUID',
    },
  };

  // Optional but recommended
  const optional = {
    EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: {
      validator: (val) => !val || val.startsWith('goog_'),
      message: 'Should start with "goog_" if set',
    },
    EXPO_PUBLIC_FREE_DAILY_LIMIT: {
      validator: (val) => !val || !isNaN(parseInt(val)),
      message: 'Should be a number if set',
    },
  };

  // Check required variables
  for (const [key, config] of Object.entries(required)) {
    const value = process.env[key];
    if (!value) {
      errors.push(`${key} is not set`);
    } else if (!config.validator(value)) {
      errors.push(`${key}: ${config.message}`);
    } else {
      logSuccess(`${key}: Valid (${value.substring(0, 15)}...)`);
    }
  }

  // Check optional variables
  for (const [key, config] of Object.entries(optional)) {
    const value = process.env[key];
    if (value && !config.validator(value)) {
      warnings.push(`${key}: ${config.message}`);
    } else if (value) {
      logInfo(`${key}: Set (${value.substring(0, 15)}...)`);
    }
  }

  return { errors, warnings };
}

// Validate version consistency
function validateVersionConsistency() {
  logHeader('VERSION CONSISTENCY CHECK');

  const errors = [];
  const versions = {};

  // Check package.json
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
    );
    versions.packageJson = packageJson.version;
    logInfo(`package.json: ${versions.packageJson}`);
  } catch (error) {
    errors.push('Failed to read package.json version');
  }

  // Check app.json (if exists)
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  if (fs.existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
      versions.appJson = appJson.expo.version;
      logInfo(`app.json: ${versions.appJson}`);
    } catch (error) {
      errors.push('Failed to read app.json version');
    }
  } else {
    logInfo('app.json: Not found (using app.config.js)');
  }

  // Check config.json
  const config = loadConfig();
  if (config && config.version) {
    versions.configJson = config.version;
    logInfo(`config.json: ${versions.configJson}`);
  } else {
    errors.push('Failed to read config.json version');
  }

  // Check consistency
  const uniqueVersions = [...new Set(Object.values(versions))];
  if (uniqueVersions.length === 1) {
    logSuccess(`All versions consistent: ${uniqueVersions[0]}`);
  } else {
    errors.push(`Version mismatch detected: ${JSON.stringify(versions)}`);
    logError('Versions should be identical across all files!');
  }

  return { errors };
}

// Validate bundle identifiers
function validateBundleIdentifiers() {
  logHeader('BUNDLE IDENTIFIER CHECK');

  const errors = [];

  // Read from config.json (source of truth)
  const config = loadConfig();

  if (!config || !config.iosBundle) {
    errors.push('Could not read iOS bundle ID from config.json');
    return { errors };
  }

  const expectedIosBundle = config.iosBundle;
  logInfo(`iOS Bundle ID: ${expectedIosBundle}`);

    // Check if it matches in app.json (if exists)
    const appJsonPath = path.join(__dirname, '..', 'app.json');
    if (fs.existsSync(appJsonPath)) {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
      if (appJson.expo.ios.bundleIdentifier !== expectedIosBundle) {
        errors.push(
          `iOS bundle ID mismatch: app.json (${appJson.expo.ios.bundleIdentifier}) vs config.json (${expectedIosBundle})`
        );
      } else {
        logSuccess('iOS bundle ID consistent in app.json');
      }
    }

    // Check Fastlane
    const fastfilePath = path.join(__dirname, '..', 'fastlane', 'Fastfile');
    if (fs.existsSync(fastfilePath)) {
      const fastfileContent = fs.readFileSync(fastfilePath, 'utf-8');
      const fastlaneMatch = fastfileContent.match(/APP_IDENTIFIER\s*=\s*["']([^"']+)["']/);
      if (fastlaneMatch && fastlaneMatch[1] !== expectedIosBundle) {
        errors.push(
          `iOS bundle ID mismatch: Fastfile (${fastlaneMatch[1]}) vs config.json (${expectedIosBundle})`
        );
      } else if (fastlaneMatch) {
        logSuccess('iOS bundle ID consistent in Fastfile');
      }
    }

  return { errors };
}

// Main validation function
function main() {
  log('\n🔍 Configuration Validation', 'bright');
  log('Starting comprehensive configuration check...\n', 'cyan');

  let totalErrors = 0;
  let totalWarnings = 0;

  // Load .env file
  const envLoaded = loadEnvFile();

  // Run validations
  const envValidation = validateEnvironmentVariables();
  const versionValidation = validateVersionConsistency();
  const bundleValidation = validateBundleIdentifiers();

  // Collect all errors and warnings
  totalErrors +=
    envValidation.errors.length +
    versionValidation.errors.length +
    bundleValidation.errors.length;
  totalWarnings += envValidation.warnings.length;

  // Display errors
  if (totalErrors > 0) {
    logHeader('ERRORS FOUND');
    [...envValidation.errors, ...versionValidation.errors, ...bundleValidation.errors].forEach(
      (error) => {
        logError(error);
      }
    );
  }

  // Display warnings
  if (totalWarnings > 0) {
    logHeader('WARNINGS');
    envValidation.warnings.forEach((warning) => {
      logWarning(warning);
    });
  }

  // Summary
  logHeader('VALIDATION SUMMARY');
  if (totalErrors === 0 && totalWarnings === 0) {
    logSuccess('All checks passed! Configuration is valid. ✨');
    log('\nYou can proceed with building your app.\n', 'green');
    process.exit(0);
  } else if (totalErrors === 0) {
    logWarning(`Validation completed with ${totalWarnings} warning(s).`);
    log('\nWarnings can be ignored, but should be addressed.\n', 'yellow');
    process.exit(0);
  } else {
    logError(`Validation failed with ${totalErrors} error(s) and ${totalWarnings} warning(s).`);
    log('\nPlease fix the errors before building your app.\n', 'red');
    log('For help, see: docs/SECRET-MANAGEMENT.md', 'blue');
    process.exit(1);
  }
}

// Run validation
main();
