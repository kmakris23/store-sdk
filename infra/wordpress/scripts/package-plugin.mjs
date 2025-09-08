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

// Create zip containing ONLY the contents of the plugin directory (no wrapping folder)
// WordPress will place these into a folder named after the zip (store-sdk) during installation.
const zipName = 'store-sdk.zip';
const zipPath = join(distDir, zipName);
let zipCreated = false;

// Preferred: tar (bsdtar) with -C into buildDir and archive '.' contents
try {
  execFileSync('tar', ['-a', '-c', '-f', zipPath, '-C', buildDir, '.'], {
    stdio: 'inherit',
  });
  zipCreated = true;
} catch (tarErr) {
  console.warn(
    '[package-plugin] tar content-only packaging failed:',
    tarErr?.message || tarErr
  );
}

if (!zipCreated) {
  // PowerShell fallback: use wildcard to include children only
  try {
    execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        // Compress all child entries; quoting * so expansion happens inside PowerShell
        `Compress-Archive -Path '${buildDir}/*' -DestinationPath '${zipPath}' -Force`,
      ],
      { stdio: 'inherit' }
    );
    zipCreated = true;
  } catch (psErr) {
    console.warn(
      '[package-plugin] PowerShell content-only packaging failed:',
      psErr?.message || psErr
    );
  }
}

if (!zipCreated) {
  try {
    // zip CLI fallback (run inside buildDir so adding . adds contents only)
    execFileSync('zip', ['-r', zipPath, '.'], {
      cwd: buildDir,
      stdio: 'inherit',
    });
    zipCreated = true;
  } catch (zipErr) {
    console.error(
      '[package-plugin] Failed to create zip with tar, PowerShell, and zip:',
      zipErr?.message || zipErr
    );
    process.exit(1);
  }
}

// Verify archive DOES NOT contain a top-level store-sdk/ folder entry (heuristic scan)
try {
  const raw = readFileSync(zipPath).toString('latin1');
  // If we see 'store-sdk/store-sdk.php' it indicates we accidentally nested a folder.
  if (/store-sdk\/store-sdk\.php/.test(raw)) {
    console.warn(
      '[package-plugin] Detected nested folder in zip; expected flat content.'
    );
  }
} catch (verifyErr) {
  console.warn(
    '[package-plugin] Verification read failed:',
    verifyErr?.message || verifyErr
  );
}

// Compute SHA256 hash in pure Node (cross-platform)
const hash = createHash('sha256').update(readFileSync(zipPath)).digest('hex');
writeFileSync(join(distDir, 'SHA256SUMS.txt'), `${hash}  ${zipName}\n`);

console.log(`[package-plugin] Source: ${srcDir}`);
console.log(`Plugin (contents-only) packaged at: ${zipPath}`);
