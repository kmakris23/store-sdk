#!/usr/bin/env node
import {
  mkdirSync,
  rmSync,
  cpSync,
  writeFileSync,
  readFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.cwd();
// Canonical source plugin directory
const srcDir = join(ROOT, 'plugins', 'store-sdk');
const distDir = join(ROOT, 'dist', 'wp-plugin');
const buildDir = join(distDir, 'store-sdk');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(buildDir, { recursive: true });

// Copy plugin files (minimal set)
cpSync(srcDir, buildDir, { recursive: true });

// Ensure no dev-only artifacts
// (In future: prune tests, examples, infra-only comments if added)

// Create zip (attempt native PowerShell first, fallback to *nix zip if available)
// IMPORTANT: We archive the parent folder (store-sdk) itself so WordPress extracts to /wp-content/plugins/store-sdk/...
// If we only zip the *contents*, WP may place files directly or mis-detect structure, causing missing includes.
const zipName = 'store-sdk.zip';
const zipPath = join(distDir, zipName);
let zipCreated = false;
try {
  // Compress the directory (not its globbed children) so the top-level folder is preserved.
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      // Using -Path on the directory itself ensures the folder name becomes the root entry in the archive
      `Compress-Archive -Path '${buildDir}' -DestinationPath '${zipPath}' -Force`,
    ],
    { stdio: 'inherit' }
  );
  zipCreated = true;
} catch {
  // Ignore and try *nix zip
}

if (!zipCreated) {
  try {
    // Run from distDir so we can include the folder name explicitly
    execFileSync('zip', ['-r', zipPath, 'store-sdk'], {
      cwd: distDir,
      stdio: 'inherit',
    });
    zipCreated = true;
  } catch {
    console.error(
      '[package-plugin] Failed to create zip with both PowerShell Compress-Archive and zip command.'
    );
    process.exit(1);
  }
}

// Compute SHA256 hash in pure Node (cross-platform)
const hash = createHash('sha256').update(readFileSync(zipPath)).digest('hex');
writeFileSync(join(distDir, 'SHA256SUMS.txt'), `${hash}  ${zipName}\n`);

console.log(`[package-plugin] Source: ${srcDir}`);
console.log(`Plugin packaged at: ${zipPath}`);
