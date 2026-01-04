#!/usr/bin/env node

/**
 * Unified cleanup script for Expo/React Native projects
 *
 * Usage:
 *   node scripts/clean.js           # Standard cleanup
 *   node scripts/clean.js --aggressive  # Aggressive cleanup (adds simulators, device support)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
};

// Parse arguments
const args = process.argv.slice(2);
const isAggressive = args.includes('--aggressive') || args.includes('--all');

/**
 * Get disk space in GB
 */
function getDiskSpace() {
  try {
    const output = execSync('df -g / | tail -1', { encoding: 'utf-8' });
    const parts = output.trim().split(/\s+/);
    return {
      available: parseInt(parts[3], 10),
      used: parseInt(parts[2], 10),
      total: parseInt(parts[1], 10),
    };
  } catch {
    return null;
  }
}

/**
 * Get directory size in GB
 */
function getDirSize(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const output = execSync(`du -sg "${dirPath}" 2>/dev/null | cut -f1`, { encoding: 'utf-8' });
    return parseInt(output.trim(), 10) || 0;
  } catch {
    return 0;
  }
}

/**
 * Format size in GB
 */
function formatSize(sizeGB) {
  if (sizeGB === 0) return '0 GB';
  if (sizeGB < 1) return `${Math.round(sizeGB * 1024)} MB`;
  return `${sizeGB} GB`;
}

/**
 * Safely remove directory
 */
function removeDir(dirPath, description) {
  try {
    if (!fs.existsSync(dirPath)) {
      log.info(`${description}: Not found (skipped)`);
      return 0;
    }
    const sizeBefore = getDirSize(dirPath);
    execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
    log.success(`${description}: Removed ${formatSize(sizeBefore)}`);
    return sizeBefore;
  } catch (err) {
    log.error(`${description}: Failed to remove - ${err.message}`);
    return 0;
  }
}

/**
 * Main cleanup function
 */
async function main() {
  log.header('🧹 Expo/React Native Cleanup');

  // Show initial disk space
  const diskBefore = getDiskSpace();
  if (diskBefore) {
    log.info(`Disk space before: ${formatSize(diskBefore.available)} available`);
  }

  let totalFreed = 0;

  // Standard cleanup
  log.header('Standard Cleanup');

  // 1. DerivedData
  const derivedData = path.join(os.homedir(), 'Library/Developer/Xcode/DerivedData');
  totalFreed += removeDir(derivedData, 'Xcode DerivedData');

  // 2. Xcode caches
  const xcodeCache = path.join(os.homedir(), 'Library/Caches/com.apple.dt.Xcode');
  totalFreed += removeDir(xcodeCache, 'Xcode Caches');

  // 3. Project ios/android folders (prebuild clean)
  const projectRoot = process.cwd();
  const iosDir = path.join(projectRoot, 'ios');
  const androidDir = path.join(projectRoot, 'android');

  if (fs.existsSync(iosDir)) {
    totalFreed += removeDir(iosDir, 'Project ios/ folder');
  }
  if (fs.existsSync(androidDir)) {
    totalFreed += removeDir(androidDir, 'Project android/ folder');
  }

  // 4. Metro bundler cache
  const metroCache = path.join(os.tmpdir(), 'metro-*');
  try {
    execSync(`rm -rf ${os.tmpdir()}/metro-*`, { stdio: 'pipe' });
    log.success('Metro bundler cache: Cleared');
  } catch {
    log.info('Metro bundler cache: Nothing to clear');
  }

  // 5. Expo cache
  const expoCache = path.join(os.homedir(), '.expo');
  try {
    execSync(`rm -rf "${expoCache}/web-build" "${expoCache}/.cache"`, { stdio: 'pipe' });
    log.success('Expo cache: Cleared');
  } catch {
    log.info('Expo cache: Nothing to clear');
  }

  // 6. Node modules cache
  try {
    execSync('npm cache clean --force 2>/dev/null', { stdio: 'pipe' });
    log.success('npm cache: Cleared');
  } catch {
    log.info('npm cache: Nothing to clear');
  }

  // Aggressive cleanup
  if (isAggressive) {
    log.header('Aggressive Cleanup');

    // 7. iOS Device Support (old versions)
    const deviceSupport = path.join(os.homedir(), 'Library/Developer/Xcode/iOS DeviceSupport');
    totalFreed += removeDir(deviceSupport, 'iOS Device Support');

    // 8. Unavailable simulators
    log.info('Removing unavailable simulators...');
    try {
      execSync('xcrun simctl delete unavailable', { stdio: 'pipe' });
      log.success('Unavailable simulators: Removed');
    } catch {
      log.info('Unavailable simulators: None to remove');
    }

    // 9. Old simulator data
    const simulatorData = path.join(os.homedir(), 'Library/Developer/CoreSimulator/Caches');
    totalFreed += removeDir(simulatorData, 'Simulator Caches');

    // 10. Watchman cache
    try {
      execSync('watchman watch-del-all 2>/dev/null', { stdio: 'pipe' });
      log.success('Watchman cache: Cleared');
    } catch {
      log.info('Watchman: Not running or not installed');
    }

    // 11. CocoaPods cache
    const podsCache = path.join(os.homedir(), 'Library/Caches/CocoaPods');
    totalFreed += removeDir(podsCache, 'CocoaPods cache');
  }

  // Summary
  log.header('Summary');

  const diskAfter = getDiskSpace();
  if (diskBefore && diskAfter) {
    const actualFreed = diskAfter.available - diskBefore.available;
    log.success(`Disk space after: ${formatSize(diskAfter.available)} available`);
    if (actualFreed > 0) {
      log.success(`Freed approximately: ${formatSize(actualFreed)}`);
    }
  }

  if (!isAggressive) {
    log.info(`\nTip: Run with --aggressive for deeper cleanup (removes simulator data, device support)`);
  }

  log.info('\nNext step: Run "npx expo prebuild" to regenerate native projects');
}

main().catch((err) => {
  log.error(`Cleanup failed: ${err.message}`);
  process.exit(1);
});
