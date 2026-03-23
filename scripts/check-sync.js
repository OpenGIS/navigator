#!/usr/bin/env node
/**
 * check-sync.js
 *
 * Verifies that docs, tests, and screenshots are in sync with the
 * Document First process. Exits with code 1 if any issues are found.
 *
 * Rules:
 *   1. Every docs/N.*.md must have a tests/e2e/N.*.spec.js
 *      (except docs marked as developer guides with no runtime behaviour)
 *   2. Every tests/e2e/screenshots/N.*.spec.js must have a docs/N.*.md
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
const GUIDE_ONLY_DOCS = ["3.features.md"];

let issues = 0;

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  issues++;
}

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

// ─── Rule 1: every doc has a test spec ───────────────────────────────────────

console.log("\nRule 1: every doc has a corresponding test spec");

const docFiles = readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"));

for (const doc of docFiles) {
  if (GUIDE_ONLY_DOCS.includes(doc)) {
    console.log(`  – ${doc} (guide only, skipped)`);
    continue;
  }

  const prefix = doc.match(/^\d+/)?.[0];
  if (!prefix) continue;

  const specPattern = join(TESTS_DIR, `${prefix}.`);
  const specFiles = readdirSync(TESTS_DIR).filter(
    (f) => f.startsWith(`${prefix}.`) && f.endsWith(".spec.js"),
  );

  if (specFiles.length === 0) {
    fail(`${doc} has no matching tests/e2e/${prefix}.*.spec.js`);
  } else {
    pass(`${doc} → tests/e2e/${specFiles[0]}`);
  }
}

// ─── Rule 2: every screenshot spec has a doc ─────────────────────────────────

console.log("\nRule 2: every screenshot spec has a corresponding doc");

const screenshotSpecs = existsSync(SCREENSHOTS_DIR)
  ? readdirSync(SCREENSHOTS_DIR).filter(
      (f) => f.endsWith(".spec.js") && f !== "readme.spec.js",
    )
  : [];

for (const spec of screenshotSpecs) {
  const prefix = spec.match(/^\d+/)?.[0];
  if (!prefix) continue;

  const docFiles2 = readdirSync(DOCS_DIR).filter((f) =>
    f.startsWith(`${prefix}.`),
  );

  if (docFiles2.length === 0) {
    fail(
      `tests/e2e/screenshots/${spec} has no matching docs/${prefix}.*.md`,
    );
  } else {
    pass(`tests/e2e/screenshots/${spec} → docs/${docFiles2[0]}`);
  }
}

// ─── Rule 3: doc-referenced screenshots exist on disk ────────────────────────

console.log("\nRule 3: screenshot images referenced in docs exist on disk");

const imageRefPattern = /!\[.*?\]\((\.\.\/assets\/screenshots\/[^)]+)\)/g;

for (const doc of docFiles) {
  const content = readFileSync(join(DOCS_DIR, doc), "utf8");
  const refs = [...content.matchAll(imageRefPattern)];

  for (const [, ref] of refs) {
    // ref is relative to docs/, so resolve from DOCS_DIR
    const absPath = resolve(DOCS_DIR, ref);
    if (!existsSync(absPath)) {
      fail(`${doc} references missing image: ${ref}`);
    } else {
      pass(`${doc} → ${ref}`);
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
