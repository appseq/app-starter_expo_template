#!/usr/bin/env node

/**
 * Release pipeline script for Expo/React Native projects
 *
 * Usage:
 *   node scripts/release.js           # Interactive mode (prompts for confirmation)
 *   node scripts/release.js --auto    # Fully automated (no prompts, for CI/CD)
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.blue}══════════════════════════════════════════${colors.reset}`),
  title: (msg) => console.log(`${colors.bright}${colors.blue}  ${msg}${colors.reset}`),
  divider: () => console.log(`${colors.dim}──────────────────────────────────────────${colors.reset}`),
};

// Parse arguments
const args = process.argv.slice(2);
const isAuto = args.includes('--auto');
const projectRoot = process.cwd();

// Minimum disk space required (in GB)
const MIN_DISK_SPACE_GB = 15;

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
 * Execute command and return output
 */
function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf-8', ...options }).trim();
  } catch {
    return null;
  }
}

/**
 * Execute command with live output
 */
function execLive(cmd, description) {
  log.info(`${description}...`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: projectRoot });
    return true;
  } catch (err) {
    log.error(`${description} failed`);
    return false;
  }
}

/**
 * Get disk space in GB
 */
function getDiskSpace() {
  const output = exec('df -g / | tail -1');
  if (!output) return null;
  const parts = output.split(/\s+/);
  return {
    available: parseInt(parts[3], 10),
    used: parseInt(parts[2], 10),
    total: parseInt(parts[1], 10),
  };
}

/**
 * Get version of a CLI tool
 */
function getVersion(cmd) {
  return exec(`${cmd} --version 2>/dev/null`) || 'not installed';
}

/**
 * Get package.json info
 */
function getProjectInfo() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
    return { name: pkg.name, version: pkg.version };
  } catch {
    return { name: 'unknown', version: 'unknown' };
  }
}

/**
 * Display system information
 */
function displaySystemInfo() {
  log.header();
  log.title('🚀 RELEASE PIPELINE');
  log.header();

  const project = getProjectInfo();
  const disk = getDiskSpace();

  console.log(`\n${colors.bright}System Info${colors.reset}`);
  log.divider();
  console.log(`  Project:     ${colors.cyan}${project.name}${colors.reset} v${project.version}`);
  console.log(`  Node:        ${getVersion('node')}`);
  console.log(`  npm:         ${getVersion('npm')}`);
  console.log(`  Expo CLI:    ${getVersion('npx expo')}`);
  console.log(`  EAS CLI:     ${getVersion('npx eas')}`);

  if (disk) {
    const diskColor = disk.available < MIN_DISK_SPACE_GB ? colors.red : colors.green;
    console.log(`  Disk:        ${diskColor}${disk.available} GB available${colors.reset} (${disk.used}/${disk.total} GB used)`);
  }

  console.log(`  Mode:        ${isAuto ? `${colors.magenta}AUTO${colors.reset} (no prompts)` : `${colors.cyan}Interactive${colors.reset}`}`);
  console.log('');
}

/**
 * Check credentials setup
 */
function checkCredentials() {
  console.log(`${colors.bright}Credential Check${colors.reset}`);
  log.divider();

  let hasErrors = false;
  let hasWarnings = false;

  // Check fastlane/.env exists
  const fastlaneEnv = path.join(projectRoot, 'fastlane', '.env');
  if (!fs.existsSync(fastlaneEnv)) {
    log.error('fastlane/.env not found - App Store credentials missing');
    hasErrors = true;
  } else {
    const envContent = fs.readFileSync(fastlaneEnv, 'utf-8');

    // Check required keys
    const requiredKeys = ['ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_KEY_FILEPATH'];
    for (const key of requiredKeys) {
      if (!envContent.includes(key)) {
        log.error(`Missing ${key} in fastlane/.env`);
        hasErrors = true;
      }
    }

    // Check if .p8 file exists
    const keyPathMatch = envContent.match(/ASC_KEY_FILEPATH="?([^"\n]+)"?/);
    if (keyPathMatch) {
      const keyPath = keyPathMatch[1];
      if (!fs.existsSync(keyPath)) {
        log.error(`API key file not found: ${keyPath}`);
        hasErrors = true;
      } else {
        log.success(`API key file exists: ${path.basename(keyPath)}`);
      }
    }

    if (!hasErrors) {
      log.success('fastlane/.env configured correctly');
    }
  }

  // Security checks - warn if credentials in wrong places
  const projectEnv = path.join(projectRoot, '.env');
  if (fs.existsSync(projectEnv)) {
    const content = fs.readFileSync(projectEnv, 'utf-8');
    if (content.includes('ASC_KEY_ID') || content.includes('ASC_ISSUER_ID')) {
      log.warning('⚠️  SECURITY: App Store credentials found in project .env');
      log.warning('   These should only be in fastlane/.env (which is gitignored)');
      hasWarnings = true;
    }
  }

  // Check fastlane/.env is gitignored
  const gitignore = path.join(projectRoot, '.gitignore');
  if (fs.existsSync(gitignore)) {
    const gitignoreContent = fs.readFileSync(gitignore, 'utf-8');
    if (!gitignoreContent.includes('fastlane/.env') && !gitignoreContent.includes('.env')) {
      log.warning('⚠️  SECURITY: fastlane/.env may not be gitignored');
      log.warning('   Add "fastlane/.env" to .gitignore to prevent credential exposure');
      hasWarnings = true;
    }
  }

  // Check for credentials in potentially committed files
  const dangerousFiles = ['app.json', 'app.config.js', 'eas.json'];
  for (const file of dangerousFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('ASC_KEY_ID') || content.includes('AuthKey_')) {
        log.warning(`⚠️  SECURITY: Possible credentials in ${file}`);
        hasWarnings = true;
      }
    }
  }

  console.log('');

  if (hasErrors && !isAuto) {
    return false;
  } else if (hasErrors && isAuto) {
    log.error('Credential check failed. Aborting in auto mode.');
    process.exit(1);
  }

  return true;
}

/**
 * Check disk space and offer cleanup
 */
async function checkDiskSpace() {
  console.log(`${colors.bright}Disk Space Check${colors.reset}`);
  log.divider();

  const disk = getDiskSpace();
  if (!disk) {
    log.warning('Could not determine disk space');
    return true;
  }

  if (disk.available >= MIN_DISK_SPACE_GB) {
    log.success(`${disk.available} GB available (minimum: ${MIN_DISK_SPACE_GB} GB)`);
    console.log('');
    return true;
  }

  log.warning(`Only ${disk.available} GB available (minimum: ${MIN_DISK_SPACE_GB} GB)`);

  if (isAuto) {
    log.info('Auto mode: Running cleanup...');
    execSync('node scripts/clean.js --aggressive', { stdio: 'inherit', cwd: projectRoot });

    const diskAfter = getDiskSpace();
    if (diskAfter && diskAfter.available >= MIN_DISK_SPACE_GB) {
      log.success(`Cleanup complete: ${diskAfter.available} GB available`);
      console.log('');
      return true;
    } else {
      log.error(`Still not enough disk space: ${diskAfter?.available || '?'} GB`);
      process.exit(1);
    }
  }

  const answer = await prompt('Run cleanup? (y/n)');
  if (answer === 'y') {
    execSync('node scripts/clean.js --aggressive', { stdio: 'inherit', cwd: projectRoot });

    const diskAfter = getDiskSpace();
    if (diskAfter) {
      log.success(`Cleanup complete: ${diskAfter.available} GB available`);
    }
  }

  console.log('');
  return true;
}

/**
 * Check and disable demo mode
 */
async function checkDemoMode() {
  console.log(`${colors.bright}Demo Mode Check${colors.reset}`);
  log.divider();

  try {
    const result = exec('node scripts/demo-mode.js status');
    const isEnabled = result && result.toLowerCase().includes('enabled');

    if (!isEnabled) {
      log.success('Demo mode is disabled');
      console.log('');
      return true;
    }

    log.warning('Demo mode is currently ENABLED');

    if (isAuto) {
      log.info('Auto mode: Disabling demo mode...');
      execSync('node scripts/demo-mode.js disable', { stdio: 'inherit', cwd: projectRoot });
      log.success('Demo mode disabled');
      console.log('');
      return true;
    }

    const answer = await prompt('Disable demo mode before release? (y/n)');
    if (answer === 'y') {
      execSync('node scripts/demo-mode.js disable', { stdio: 'inherit', cwd: projectRoot });
      log.success('Demo mode disabled');
    } else {
      log.warning('Proceeding with demo mode ENABLED - not recommended for production!');
    }

    console.log('');
    return true;
  } catch {
    log.info('Demo mode check skipped (script not found)');
    console.log('');
    return true;
  }
}

/**
 * Validate configuration
 */
function validateConfig() {
  console.log(`${colors.bright}Configuration Validation${colors.reset}`);
  log.divider();

  try {
    execSync('npm run validate-config', { stdio: 'inherit', cwd: projectRoot });
    log.success('Configuration validated');
    console.log('');
    return true;
  } catch {
    log.error('Configuration validation failed');
    if (isAuto) process.exit(1);
    console.log('');
    return false;
  }
}

/**
 * Build production IPA
 */
async function buildProduction() {
  console.log(`${colors.bright}Building Production IPA${colors.reset}`);
  log.divider();

  // Clean prebuild
  if (!execLive('npx expo prebuild --clean', 'Cleaning native projects')) {
    if (isAuto) process.exit(1);
    return null;
  }

  // Install dependencies
  if (!execLive('npm install', 'Installing dependencies')) {
    if (isAuto) process.exit(1);
    return null;
  }

  // Build with EAS
  log.info('Building IPA (this may take 10-30 minutes)...');
  try {
    const output = execSync(
      'eas build --platform ios --local --profile production --non-interactive 2>&1',
      { encoding: 'utf-8', cwd: projectRoot, stdio: 'pipe', maxBuffer: 50 * 1024 * 1024 }
    );

    // Find IPA path in output
    const ipaMatch = output.match(/(?:Successfully built|Artifact).*?(\S+\.ipa)/i) ||
                     output.match(/Build successful.*?(\S+\.ipa)/i);

    // Also check for IPA files in common locations
    const possiblePaths = [
      ...findIPAFiles(projectRoot),
      ...findIPAFiles(path.join(projectRoot, 'ios')),
    ];

    const ipaPath = ipaMatch?.[1] || possiblePaths[0];

    if (ipaPath && fs.existsSync(ipaPath)) {
      log.success(`Build complete: ${path.basename(ipaPath)}`);
      console.log(`  Path: ${ipaPath}`);
      console.log('');
      return ipaPath;
    }

    // If no IPA found, show output and let user find it
    console.log(output);
    log.warning('Build may have completed but IPA path not detected');
    console.log('');
    return 'manual';
  } catch (err) {
    console.log(err.stdout || err.message);
    log.error('Build failed');
    if (isAuto) process.exit(1);
    return null;
  }
}

/**
 * Find IPA files in directory
 */
function findIPAFiles(dir) {
  try {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    return files
      .filter((f) => f.endsWith('.ipa'))
      .map((f) => path.join(dir, f))
      .sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime);
  } catch {
    return [];
  }
}

/**
 * Submit to App Store
 */
async function submitToAppStore(ipaPath) {
  console.log(`${colors.bright}App Store Submission${colors.reset}`);
  log.divider();

  if (!ipaPath || ipaPath === 'manual') {
    // Find latest IPA
    const ipas = [
      ...findIPAFiles(projectRoot),
      ...findIPAFiles(path.join(projectRoot, 'ios')),
    ];

    if (ipas.length === 0) {
      log.error('No IPA file found. Build may have failed or IPA is in unexpected location.');
      if (isAuto) process.exit(1);
      return false;
    }

    ipaPath = ipas[0];
    log.info(`Found IPA: ${path.basename(ipaPath)}`);
  }

  if (!isAuto) {
    console.log(`\n  IPA: ${colors.cyan}${ipaPath}${colors.reset}\n`);
    const answer = await prompt('Submit to App Store Connect? (y/n)');
    if (answer !== 'y') {
      log.info('Submission skipped. IPA saved for manual submission.');
      return true;
    }
  }

  log.info('Submitting to App Store Connect...');
  try {
    execSync(`eas submit --platform ios --path "${ipaPath}"`, {
      stdio: 'inherit',
      cwd: projectRoot,
    });
    log.success('Submitted to App Store Connect!');
    return true;
  } catch {
    log.error('Submission failed');
    if (isAuto) process.exit(1);
    return false;
  }
}

/**
 * Main release pipeline
 */
async function main() {
  displaySystemInfo();

  // Step 1: Check credentials
  if (!checkCredentials()) {
    const answer = await prompt('Continue without valid credentials? (y/n)');
    if (answer !== 'y') process.exit(1);
  }

  // Step 2: Check disk space
  await checkDiskSpace();

  // Step 3: Validate configuration
  if (!validateConfig()) {
    const answer = await prompt('Continue despite validation errors? (y/n)');
    if (answer !== 'y') process.exit(1);
  }

  // Step 4: Check demo mode
  await checkDemoMode();

  // Step 5: Build
  if (!isAuto) {
    const answer = await prompt('Start production build? (y/n)');
    if (answer !== 'y') {
      log.info('Build cancelled');
      process.exit(0);
    }
  }

  const ipaPath = await buildProduction();
  if (!ipaPath) {
    process.exit(1);
  }

  // Step 6: Submit
  await submitToAppStore(ipaPath);

  log.header();
  log.title('🎉 RELEASE COMPLETE');
  log.header();
  console.log('');
}

main().catch((err) => {
  log.error(`Release failed: ${err.message}`);
  process.exit(1);
});
