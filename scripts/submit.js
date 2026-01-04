#!/usr/bin/env node

/**
 * Smart IPA submission script
 *
 * Usage:
 *   node scripts/submit.js                    # Find latest IPA and submit
 *   node scripts/submit.js /path/to/file.ipa  # Submit specific IPA
 *   node scripts/submit.js --auto             # No confirmation prompt
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
const isAuto = args.includes('--auto');
const specifiedPath = args.find((arg) => arg.endsWith('.ipa'));
const projectRoot = process.cwd();

/**
 * Prompt user for confirmation
 */
function prompt(question) {
  if (isAuto) return Promise.resolve('y');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}?${colors.reset} ${question} `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

/**
 * Find IPA files in directory (sorted by modification time, newest first)
 */
function findIPAFiles(dir) {
  try {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    return files
      .filter((f) => f.endsWith('.ipa'))
      .map((f) => {
        const fullPath = path.join(dir, f);
        const stats = fs.statSync(fullPath);
        return { path: fullPath, mtime: stats.mtime, size: stats.size };
      })
      .sort((a, b) => b.mtime - a.mtime);
  } catch {
    return [];
  }
}

/**
 * Format file size
 */
function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Format date
 */
function formatDate(date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Main submission function
 */
async function main() {
  log.header('📦 App Store Submission');

  let ipaPath = specifiedPath;

  // If no path specified, find latest IPA
  if (!ipaPath) {
    log.info('Searching for IPA files...\n');

    const searchDirs = [
      projectRoot,
      path.join(projectRoot, 'ios'),
      path.join(projectRoot, 'build'),
      path.join(projectRoot, 'dist'),
    ];

    const allIPAs = [];
    for (const dir of searchDirs) {
      allIPAs.push(...findIPAFiles(dir));
    }

    if (allIPAs.length === 0) {
      log.error('No IPA files found in project directory');
      log.info('\nBuild an IPA first with: npm run release:build');
      process.exit(1);
    }

    // Show found IPAs
    console.log(`${colors.bright}Found ${allIPAs.length} IPA file(s):${colors.reset}`);
    console.log('');

    allIPAs.slice(0, 5).forEach((ipa, index) => {
      const isLatest = index === 0;
      const prefix = isLatest ? `${colors.green}→${colors.reset}` : ' ';
      const filename = path.basename(ipa.path);
      const age = formatDate(ipa.mtime);
      const size = formatSize(ipa.size);
      console.log(`  ${prefix} ${filename}`);
      console.log(`      ${colors.cyan}${size}${colors.reset} | ${age}`);
      console.log(`      ${colors.dim}${ipa.path}${colors.reset}`);
      console.log('');
    });

    ipaPath = allIPAs[0].path;

    if (!isAuto) {
      const answer = await prompt(`Submit ${path.basename(ipaPath)}? (y/n)`);
      if (answer !== 'y') {
        log.info('Submission cancelled');
        process.exit(0);
      }
    }
  } else {
    // Verify specified path exists
    if (!fs.existsSync(ipaPath)) {
      log.error(`IPA file not found: ${ipaPath}`);
      process.exit(1);
    }

    const stats = fs.statSync(ipaPath);
    console.log(`${colors.bright}IPA File:${colors.reset}`);
    console.log(`  ${path.basename(ipaPath)}`);
    console.log(`  ${colors.cyan}${formatSize(stats.size)}${colors.reset} | ${formatDate(stats.mtime)}`);
    console.log(`  ${colors.dim}${ipaPath}${colors.reset}`);
    console.log('');

    if (!isAuto) {
      const answer = await prompt('Submit this IPA? (y/n)');
      if (answer !== 'y') {
        log.info('Submission cancelled');
        process.exit(0);
      }
    }
  }

  // Submit to App Store
  console.log('');
  log.info('Submitting to App Store Connect...');
  log.info('(This may take a few minutes)\n');

  try {
    execSync(`eas submit --platform ios --path "${ipaPath}"`, {
      stdio: 'inherit',
      cwd: projectRoot,
    });

    console.log('');
    log.success('Successfully submitted to App Store Connect!');
    log.info('Check App Store Connect for processing status');
    log.info('https://appstoreconnect.apple.com');
  } catch (err) {
    console.log('');
    log.error('Submission failed');
    log.info('\nCommon issues:');
    log.info('  - Invalid or expired App Store Connect API key');
    log.info('  - IPA was built with wrong provisioning profile');
    log.info('  - Version/build number already exists in App Store Connect');
    process.exit(1);
  }
}

main().catch((err) => {
  log.error(`Submission failed: ${err.message}`);
  process.exit(1);
});
