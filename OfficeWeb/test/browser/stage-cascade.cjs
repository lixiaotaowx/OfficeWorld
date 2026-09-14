// Which rule wins for the inline control? Report computed positioning and the
// cascade for the bar and its button.
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve } = require("node:path");

(async () => {
  const vite = await createServer({ configFile: false, root: resolve("."), plugins: [react()],
    server: { host: "127.0.0.1", port: 0 } });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}/test/private-call-stage-harness.html`);
    await page.waitForFunction(() => window.__stageReady === true, null, { timeout: 30000 });
    await page.waitForTimeout(1200);
    const report = await page.evaluate(() => {
      const bar = document.querySelector(".screen-stage-bar.minimal");
      const button = bar.querySelector("button");
      const stage = document.querySelector(".screen-stage");
      const pick = (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return { position: style.position, inset: `${style.top}/${style.right}/${style.bottom}/${style.left}`,
          display: style.display, marginTop: style.marginTop, height: Math.round(rect.height),
          top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
      };
      const sheets = [];
      for (const sheet of document.styleSheets) {
        let rules;
        try { rules = sheet.cssRules; } catch { continue; }
        for (const rule of rules) {
          if (!rule.selectorText) continue;
          if (/(^|,)\s*\.screen-stage-bar/.test(rule.selectorText) && /position|inset|bottom|margin/.test(rule.style.cssText))
            sheets.push({ selector: rule.selectorText, css: rule.style.cssText });
        }
      }
      return { stage: pick(stage), bar: pick(bar), button: pick(button), rules: sheets };
    });
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
    await vite.close();
  }
})();
