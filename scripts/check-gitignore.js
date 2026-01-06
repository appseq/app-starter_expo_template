#!/usr/bin/env node

/**
 * Pre-flight security check for .gitignore
 *
 * Validates that .gitignore exists and contains required patterns
 * to prevent accidental exposure of sensitive files.
 *
 * Exit codes:
 *   0 = All checks passed
 *   1 = Check failed (missing .gitignore or required patterns)
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
};

// Required patterns that must be in .gitignore
const requiredPatterns = [
  { pattern: '.env', description: 'Root .env file' },
  { pattern: 'fastlane/.env', description: 'Fastlane credentials file' },
];

const projectRoot = process.cwd();
const gitignorePath = path.join(projectRoot, '.gitignore');

console.log(`${colors.bold}Gitignore Security Check${colors.reset}`);
console.log('─'.repeat(40));

// Check if .gitignore exists
if (!fs.existsSync(gitignorePath)) {
  log.error('.gitignore file not found!');
  log.info('Create a .gitignore file with proper exclusions before deploying.');
  process.exit(1);
}

const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
let hasErrors = false;

// Check each required pattern
for (const { pattern, description } of requiredPatterns) {
  // Check if the pattern exists in gitignore (as a line or part of a line)
  const lines = gitignoreContent.split('\n');
  const found = lines.some((line) => {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') return false;
    // Exact match or pattern that would cover this file
    return trimmed === pattern || trimmed === `${pattern}*` || trimmed === `${pattern}.*`;
  });

  if (found) {
    log.success(`${description} is gitignored (${pattern})`);
  } else {
    log.error(`${description} is NOT gitignored!`);
    log.info(`  Add "${pattern}" to .gitignore to prevent credential exposure.`);
    hasErrors = true;
  }
}

console.log('');

if (hasErrors) {
  log.error('Security check failed. Fix .gitignore before proceeding.');
  process.exit(1);
}

log.success('All security checks passed.');
process.exit(0);
