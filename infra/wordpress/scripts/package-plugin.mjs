#!/usr/bin/env node
import {
  mkdirSync,
  rmSync,
  cpSync,
  writeFileSync,
  readFileSync,
} from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.cwd();
// Source plugin directory (new unified slug)
const srcDir = join(ROOT, 'infra', 'wordpress', 'wp-plugin', 'store-sdk');
const distDir = join(ROOT, 'dist', 'wp-plugin');
const buildDir = join(distDir, 'store-sdk');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(buildDir, { recursive: true });

// Copy plugin files (minimal set)
cpSync(srcDir, buildDir, { recursive: true });

// Ensure no dev-only artifacts
// (In future: prune tests, examples, infra-only comments if added)

// Create zip (attempt native PowerShell first, fallback to *nix zip if available)
const zipName = 'store-sdk.zip';
const zipPath = join(distDir, zipName);
let zipCreated = false;
try {
  // Use double quotes for paths (handles spaces); Compress-Archive requires literal path to contents
  execSync(
    `powershell -NoProfile -Command Compress-Archive -Path "${buildDir}/*" -DestinationPath "${zipPath}" -Force`,
    {
      stdio: 'inherit',
    }
  );
  zipCreated = true;
} catch {
  // Ignore and try *nix zip
}

if (!zipCreated) {
  try {
    execSync(`zip -r ${zipPath} .`, { cwd: buildDir, stdio: 'inherit' });
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

console.log(`Plugin packaged at: ${zipPath}`);
