#!/usr/bin/env node
/**
 * Generates a markdown document enumerating test suites and test cases
 * for the core package (extensible later for others). No runtime deps.
 */
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  mkdirSync,
} from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const TESTS_ROOT = join(ROOT, 'packages', 'core', 'src', 'lib', 'tests');
const OUTPUT_DIR = join(ROOT, 'docs');
const OUTPUT_FILE = join(OUTPUT_DIR, 'TESTS.md');

/** Simple recursive file gatherer */
function gather(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) return gather(full);
    if (/\.(spec|test)\.ts$/.test(entry)) return [full];
    return [];
  });
}

/** Extract minimal structure: describes + tests */
function parseTestFile(path) {
  const src = readFileSync(path, 'utf8');
  const describes = [];
  const describeRegex = /describe\(\s*(["'`])([^"'`]+)\1\s*,/g;
  let m;
  while ((m = describeRegex.exec(src))) {
    describes.push({ name: m[2], tests: [] });
  }
  // naive association: tests collected globally then pushed to last seen describe
  const testRegex = /\b(it|test)\(\s*(["'`])([^"'`]+)\2\s*,/g;
  while ((m = testRegex.exec(src))) {
    const testName = m[3];
    if (describes.length) describes[describes.length - 1].tests.push(testName);
    else {
      // file-level test without describe
      describes.push({ name: '(root)', tests: [testName] });
    }
  }
  return describes;
}

function categorize(relPath) {
  const parts = relPath.split(/\\|\//);
  const idx = parts.indexOf('tests');
  const cat = parts[idx + 1] || 'uncategorized';
  return cat;
}

function generate() {
  const files = gather(TESTS_ROOT);
  const data = [];
  for (const f of files) {
    const rel = relative(TESTS_ROOT, f).replace(/\\/g, '/');
    const category = categorize(f.replace(/\\/g, '/'));
    const suites = parseTestFile(f);
    const testCount = suites.reduce((s, d) => s + d.tests.length, 0);
    data.push({ file: rel, category, suites, testCount });
  }
  // group by category
  const grouped = Object.groupBy
    ? Object.groupBy(data, (d) => d.category)
    : data.reduce((acc, d) => {
        (acc[d.category] ||= []).push(d);
        return acc;
      }, {});
  const categoryOrder = Object.keys(grouped).sort();
  const total = data.reduce((s, d) => s + d.testCount, 0);

  let md = '';
  md += '# Test Suites Overview\n\n';
  md += `> Auto-generated test documentation. Total tests: **${total}** across **${data.length}** spec files.\n\n`;
  md += 'Regenerate with: `npm run docs:tests`\n\n';
  for (const cat of categoryOrder) {
    const filesInCat = grouped[cat];
    const catTotal = filesInCat.reduce((s, d) => s + d.testCount, 0);
    md += `<details><summary><strong>${cat}</strong> — ${catTotal} tests in ${filesInCat.length} files</summary>\n\n`;
    md += '| File | Suites | Tests |\n|------|--------|-------|\n';
    for (const file of filesInCat.sort((a, b) =>
      a.file.localeCompare(b.file)
    )) {
      md += `| ${file.file} | ${file.suites.length} | ${file.testCount} |\n`;
    }
    // expanded per file suites
    for (const file of filesInCat) {
      md += `\n<details><summary>${file.file} (${file.testCount} tests)</summary>\n\n`;
      for (const suite of file.suites) {
        md += `- **${suite.name}**\n`;
        for (const t of suite.tests) md += `  - ${t}\n`;
      }
      md += '\n</details>\n';
    }
    md += '\n</details>\n\n';
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, md, 'utf8');
  console.log(`Generated ${relative(ROOT, OUTPUT_FILE)} with ${total} tests.`);
}

generate();
