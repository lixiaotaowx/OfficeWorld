// Resolve Playwright from wherever it is actually installed.
//
// These harnesses used to hard-code one machine's Codex runtime path, so they
// could only ever run on that machine. Resolution order:
//   1. PLAYWRIGHT_PACKAGE  - explicit path or module id
//   2. playwright          - installed as a dependency of this project
//   3. %APPDATA%\npm\node_modules\playwright  - a global npm install (Windows)
//   4. the historical Codex runtime path, still present on the original machine
//
// Install once with:  npm i -g playwright && npx playwright install msedge
// Then run from OfficeWeb, e.g.  node test/browser/single-login.mjs
const { existsSync } = require("node:fs");
const { join } = require("node:path");

const LEGACY =
  "C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";

const candidates = [
  process.env.PLAYWRIGHT_PACKAGE,
  "playwright",
  process.env.APPDATA ? join(process.env.APPDATA, "npm", "node_modules", "playwright") : undefined,
  LEGACY,
].filter(Boolean);

let chromium;
const tried = [];
for (const candidate of candidates) {
  // A missing path is worth skipping quietly; a broken install is worth naming.
  if (candidate !== "playwright" && !existsSync(candidate)) continue;
  try {
    chromium = require(candidate).chromium;
    break;
  } catch (error) {
    tried.push(`${candidate}: ${error?.code || error?.message || error}`);
  }
}

if (!chromium) {
  console.error("找不到可用的 playwright。请先安装：");
  console.error("  npm i -g playwright && npx playwright install msedge");
  console.error("或用 PLAYWRIGHT_PACKAGE 指定 playwright 包目录。");
  if (tried.length) console.error("已尝试：\n  " + tried.join("\n  "));
  process.exit(2);
}

/** Same defaults every harness used; override with PLAYWRIGHT_CHANNEL. */
const launch = (options = {}) =>
  chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "msedge", headless: true, ...options });

module.exports = { chromium, launch };
