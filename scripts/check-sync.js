#!/usr/bin/env node
/**
 * check-sync.js
 *
 * Verifies that docs, tests, and screenshots are in sync with the
 * Document First process. Exits with code 1 if any issues are found.
 *
 * Rules:
 *   1. Every docs/*.md must have a tests/e2e/*.spec.js (by matching stem name)
 *      (except docs marked as developer guides with no runtime behaviour)
 *   2. Every tests/e2e/screenshots/*.spec.js must have a docs/*.md (by matching stem name)
 *   3. Every screenshot image referenced in docs must exist on disk
 */

import { readdirSync, existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const DOCS_DIR = join(ROOT, "docs");
const TESTS_DIR = join(ROOT, "tests", "e2e");
const SCREENSHOTS_DIR = join(TESTS_DIR, "screenshots");
const ASSETS_DIR = join(ROOT, "assets");

// Docs that are developer guides with no runtime behaviour to test
const GUIDE_ONLY_DOCS = ["features.md", "testing.md"];

let issues = 0;

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  issues++;
}

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

/**
 * Collect { docFile, docDir, testsDir, screenshotsDir } pairs to check.
 * This includes the root docs/ directory and any named subdirectories
 * that follow the same convention (e.g. docs/features/ → tests/e2e/features/).
 */
function collectDocSections() {
  const sections = [
    { docDir: DOCS_DIR, testsDir: TESTS_DIR, screenshotsDir: SCREENSHOTS_DIR, label: "" },
  ];

  // Scan for subdirectories in docs/ and mirror them to tests/e2e/
  for (const entry of readdirSync(DOCS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      sections.push({
        docDir: join(DOCS_DIR, entry.name),
        testsDir: join(TESTS_DIR, entry.name),
        screenshotsDir: join(SCREENSHOTS_DIR, entry.name),
        label: `${entry.name}/`,
      });
    }
  }

  return sections;
}

// ─── Rule 1: every doc has a test spec ───────────────────────────────────────

console.log("\nRule 1: every doc has a corresponding test spec");

for (const { docDir, testsDir, label } of collectDocSections()) {
  if (!existsSync(docDir)) continue;

  const docFiles = readdirSync(docDir).filter((f) => f.endsWith(".md"));

  for (const doc of docFiles) {
    if (GUIDE_ONLY_DOCS.includes(doc)) {
      console.log(`  – ${label}${doc} (guide only, skipped)`);
      continue;
    }

    const stem = doc.replace(/\.md$/, "");

    if (!existsSync(testsDir)) {
      fail(`${label}${doc} has no matching tests/e2e/${label}${stem}.spec.js (tests dir missing)`);
      continue;
    }

    const expectedSpec = `${stem}.spec.js`;
    if (!existsSync(join(testsDir, expectedSpec))) {
      fail(`${label}${doc} has no matching tests/e2e/${label}${expectedSpec}`);
    } else {
      pass(`${label}${doc} → tests/e2e/${label}${expectedSpec}`);
    }
  }
}

// ─── Rule 2: every screenshot spec has a doc ─────────────────────────────────

console.log("\nRule 2: every screenshot spec has a corresponding doc");

for (const { docDir, screenshotsDir, label } of collectDocSections()) {
  if (!existsSync(screenshotsDir)) continue;

  const screenshotSpecs = readdirSync(screenshotsDir).filter(
    (f) => f.endsWith(".spec.js") && f !== "readme.spec.js",
  );

  for (const spec of screenshotSpecs) {
    const stem = spec.replace(/\.spec\.js$/, "");
    const expectedDoc = `${stem}.md`;

    if (!existsSync(docDir)) {
      fail(`tests/e2e/screenshots/${label}${spec} has no matching docs/${label}${expectedDoc}`);
      continue;
    }

    if (!existsSync(join(docDir, expectedDoc))) {
      fail(`tests/e2e/screenshots/${label}${spec} has no matching docs/${label}${expectedDoc}`);
    } else {
      pass(`tests/e2e/screenshots/${label}${spec} → docs/${label}${expectedDoc}`);
    }
  }
}

// ─── Rule 3: doc-referenced screenshots exist on disk ────────────────────────

console.log("\nRule 3: screenshot images referenced in docs exist on disk");

const imageRefPattern = /!\[.*?\]\((\.\.(?:\/\.\.)?\/assets\/screenshots\/[^)]+)\)/g;

for (const { docDir, label } of collectDocSections()) {
  if (!existsSync(docDir)) continue;

  const docFiles = readdirSync(docDir).filter((f) => f.endsWith(".md"));

  for (const doc of docFiles) {
    const content = readFileSync(join(docDir, doc), "utf8");
    const refs = [...content.matchAll(imageRefPattern)];

    for (const [, ref] of refs) {
      // ref is relative to docs/ (or docs/subdir/), so resolve from docDir
      const absPath = resolve(docDir, ref);
      if (!existsSync(absPath)) {
        fail(`${label}${doc} references missing image: ${ref}`);
      } else {
        pass(`${label}${doc} → ${ref}`);
      }
    }
  }
}

// ─── Result ──────────────────────────────────────────────────────────────────

console.log();
if (issues === 0) {
  console.log("✅ All sync checks passed.\n");
  process.exit(0);
} else {
  console.error(`❌ ${issues} sync issue${issues === 1 ? "" : "s"} found.\n`);
  process.exit(1);
}
