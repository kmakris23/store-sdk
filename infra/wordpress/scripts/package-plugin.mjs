#!/usr/bin/env node
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const srcDir = join(ROOT, 'plugins', 'store-sdk');
const distDir = join(ROOT, 'dist/plugin');
const zipPath = join(distDir, 'store-sdk.zip');

// Ensure dist directory exists
mkdirSync(distDir, { recursive: true });

// Create zip containing the store-sdk folder
try {
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Compress-Archive -Path '${srcDir}' -DestinationPath '${zipPath}' -Force`,
    ],
    { stdio: 'inherit' }
  );
  console.log(`[package-plugin] Plugin packaged at: ${zipPath}`);
} catch (error) {
  console.error(
    '[package-plugin] Failed to create zip:',
    error?.message || error
  );
  process.exit(1);
}
