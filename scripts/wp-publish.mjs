#!/usr/bin/env node
/**
 * WordPress.org Plugin Publishing Script
 *
 * This script automates the process of publishing a WordPress plugin to the WordPress.org repository.
 * It handles SVN operations, validation, and deployment to both trunk and tags.
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';

// Configuration
const CONFIG = {
  PLUGIN_SLUG: 'store-sdk',
  SVN_URL: 'https://plugins.svn.wordpress.org/store-sdk',
  PLUGIN_DIR: resolve('plugins/store-sdk'),
  BUILD_DIR: resolve('dist/wp-plugin'),
  SVN_DIR: resolve('dist/svn-checkout'),
  ASSETS_DIR: resolve('assets/wordpress-org'), // Screenshots, banners, icons
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Utility functions
function escapeShellArg(arg) {
  // Escape shell arguments to prevent command injection
  // On Windows, we need to escape quotes and handle spaces
  if (process.platform === 'win32') {
    // Escape double quotes and wrap in quotes if contains spaces or special chars
    const escaped = arg.replace(/"/g, '""');
    return /[\s&|<>^]/.test(escaped) ? `"${escaped}"` : escaped;
  } else {
    // On Unix-like systems, use single quotes and escape any single quotes
    return `'${arg.replace(/'/g, "'\"'\"'")}'`;
  }
}

function execCommand(command, options = {}) {
  try {
    let finalCommand;

    if (Array.isArray(command)) {
      // Safe execution with command and arguments separated
      const [cmd, ...args] = command;
      finalCommand = `${escapeShellArg(cmd)} ${args
        .map(escapeShellArg)
        .join(' ')}`;
    } else {
      // Legacy string command - keep for backward compatibility but warn about security
      finalCommand = command;
    }

    const result = execSync(finalCommand, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return result?.toString().trim();
  } catch (err) {
    if (!options.allowFailure) {
      error(
        `Command failed: ${
          Array.isArray(command) ? command.join(' ') : command
        }`
      );
      error(err.message);
      process.exit(1);
    }
    return null;
  }
}

function promptUser(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function getPluginVersion() {
  const pluginFile = join(CONFIG.PLUGIN_DIR, 'store-sdk.php');

  if (!existsSync(pluginFile)) {
    error(`Plugin file not found: ${pluginFile}`);
    process.exit(1);
  }

  const content = readFileSync(pluginFile, 'utf8');
  const versionMatch = content.match(/Version:\s*(.+)/);

  if (!versionMatch) {
    error('Could not find version in plugin header');
    process.exit(1);
  }

  return versionMatch[1].trim();
}

function validateReadmeFile() {
  const readmeFile = join(CONFIG.PLUGIN_DIR, 'readme.txt');

  if (!existsSync(readmeFile)) {
    error('readme.txt file not found');
    return false;
  }

  const content = readFileSync(readmeFile, 'utf8');
  const requiredSections = [
    '=== ',
    'Stable tag:',
    'License:',
    '== Description ==',
    '== Installation ==',
    '== Changelog ==',
  ];

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      error(`readme.txt missing required section: ${section}`);
      return false;
    }
  }

  success('readme.txt validation passed');
  return true;
}

function validatePluginStructure() {
  const requiredFiles = [
    'store-sdk.php',
    'readme.txt',
    'includes/class-store-sdk.php',
  ];

  for (const file of requiredFiles) {
    const filePath = join(CONFIG.PLUGIN_DIR, file);
    if (!existsSync(filePath)) {
      error(`Required file missing: ${file}`);
      return false;
    }
  }

  success('Plugin structure validation passed');
  return true;
}

async function checkoutSVN() {
  info('Checking out SVN repository...');

  // Clean up existing checkout
  if (existsSync(CONFIG.SVN_DIR)) {
    rmSync(CONFIG.SVN_DIR, { recursive: true, force: true });
  }

  mkdirSync(CONFIG.SVN_DIR, { recursive: true });

  execCommand(['svn', 'checkout', CONFIG.SVN_URL, CONFIG.SVN_DIR]);
  success('SVN checkout completed');
}

function copyPluginFiles(targetDir) {
  info(`Copying plugin files to ${targetDir}...`);

  // Remove existing files in target (except .svn)
  const files = execCommand(
    [
      'find',
      targetDir,
      '-maxdepth',
      '1',
      '-not',
      '-name',
      '.svn',
      '-not',
      '-path',
      targetDir,
    ],
    {
      silent: true,
      allowFailure: true,
    }
  );

  if (files) {
    files
      .split('\n')
      .filter(Boolean)
      .forEach((file) => {
        if (file !== targetDir) {
          rmSync(file, { recursive: true, force: true });
        }
      });
  }

  // Copy plugin files
  execCommand(['cp', '-r', CONFIG.PLUGIN_DIR + '/.', targetDir]);

  // Copy WordPress.org assets if they exist
  if (existsSync(CONFIG.ASSETS_DIR)) {
    const assetsTarget = join(CONFIG.SVN_DIR, 'assets');
    mkdirSync(assetsTarget, { recursive: true });
    execCommand(['cp', '-r', CONFIG.ASSETS_DIR + '/.', assetsTarget]);
  }

  success('Plugin files copied');
}

function updateTrunk() {
  info('Updating trunk...');
  const trunkDir = join(CONFIG.SVN_DIR, 'trunk');
  copyPluginFiles(trunkDir);
  success('Trunk updated');
}

function createTag(version) {
  info(`Creating tag for version ${version}...`);

  const tagsDir = join(CONFIG.SVN_DIR, 'tags');
  const tagDir = join(tagsDir, version);

  mkdirSync(tagsDir, { recursive: true });

  if (existsSync(tagDir)) {
    warning(`Tag ${version} already exists, removing...`);
    rmSync(tagDir, { recursive: true, force: true });
  }

  mkdirSync(tagDir, { recursive: true });
  copyPluginFiles(tagDir);

  success(`Tag ${version} created`);
}

function commitChanges(version, message) {
  info('Committing changes to SVN...');

  // Add all new files
  execCommand(['svn', 'add', '--force', CONFIG.SVN_DIR], {
    allowFailure: true,
  });

  // Remove deleted files
  const deletedFiles = execCommand(['svn', 'status', CONFIG.SVN_DIR], {
    silent: true,
    allowFailure: true,
  });

  if (deletedFiles) {
    // Parse svn status output to find deleted files (lines starting with '!')
    const filesToRemove = deletedFiles
      .split('\n')
      .filter((line) => line.startsWith('!'))
      .map((line) => line.substring(1).trim())
      .filter(Boolean);

    filesToRemove.forEach((file) => {
      execCommand(['svn', 'remove', file], { allowFailure: true });
    });
  }

  // Commit changes
  const commitMessage = message || `Release version ${version}`;
  execCommand(['svn', 'commit', '-m', commitMessage, CONFIG.SVN_DIR]);

  success('Changes committed to WordPress.org');
}

async function publishToWordPress() {
  log(colors.bold + '🚀 WordPress.org Plugin Publisher' + colors.reset);
  log('=====================================\n');

  // Pre-flight checks
  info('Running pre-flight checks...');

  if (!validatePluginStructure()) {
    process.exit(1);
  }

  if (!validateReadmeFile()) {
    process.exit(1);
  }

  const version = getPluginVersion();
  info(`Plugin version: ${version}`);

  // Check if SVN is available
  execCommand(['svn', '--version'], { silent: true });
  success('SVN is available');

  // Confirm with user
  const action = await promptUser(
    `\nReady to publish ${CONFIG.PLUGIN_SLUG} v${version} to WordPress.org?\n` +
      `This will:\n` +
      `1. Checkout the SVN repository\n` +
      `2. Update trunk with current plugin files\n` +
      `3. Create a new tag for version ${version}\n` +
      `4. Commit changes to WordPress.org\n\n` +
      `Continue? (y/N): `
  );

  if (action.toLowerCase() !== 'y' && action.toLowerCase() !== 'yes') {
    info('Publishing cancelled');
    process.exit(0);
  }

  try {
    // Build plugin package first
    info('Building plugin package...');
    execCommand(['npm', 'run', 'wp:plugin:package']);

    // SVN operations
    await checkoutSVN();
    updateTrunk();
    createTag(version);

    const commitMessage = await promptUser(
      `\nEnter commit message (default: "Release version ${version}"): `
    );
    commitChanges(version, commitMessage);

    success(
      `\n🎉 Plugin ${CONFIG.PLUGIN_SLUG} v${version} published successfully!`
    );
    info(
      `Plugin will be available at: https://wordpress.org/plugins/${CONFIG.PLUGIN_SLUG}/`
    );
    info(`It may take a few minutes to appear in the WordPress.org directory.`);
  } catch (err) {
    error(`Publishing failed: ${err.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'publish':
    publishToWordPress();
    break;
  case 'validate':
    if (validatePluginStructure() && validateReadmeFile()) {
      success('All validations passed');
    }
    break;
  case 'version':
    console.log(getPluginVersion());
    break;
  default:
    log('WordPress.org Plugin Publisher', 'bold');
    log('\nUsage:');
    log('  npm run wp:plugin:publish   - Publish plugin to WordPress.org');
    log('  npm run wp:plugin:validate  - Validate plugin structure and readme');
    log('  npm run wp:plugin:version   - Show current plugin version');
    break;
}
