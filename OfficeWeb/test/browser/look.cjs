// 捏人：设置里的「我的角色」与首访弹窗必须是同一套两步面板（1 配色 → 2 配件），
// 换装配色/配件**只改材质与显隐、不重新下载模型**，而且刷新后仍然保留。
//
// Runs the real built bundle (Build/OfficeWeb) against an isolated server with a
// throwaway account, so it never touches the deployed roster.
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");
const { io } = require("socket.io-client");

(async () => {
  // 路径按文件位置算：从仓库根跑还是从 OfficeWeb/ 跑都一样。
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.resolve(process.env.CHARACTER_BUILD || path.join(ROOT, "Build/OfficeWeb"));
  const dir = fs.mkdtempSync(path.resolve(ROOT, "Build/look-qa-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(resolve => server.http.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const errors = [], requested = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 940 },
      permissions: ["microphone"] });
    const response = await context.request.post(base + "/api/auth/register", {
      headers: { origin: base }, data: { name: "外观测试", password: "qa" },
    });
    assert.equal(response.status(), 200);
    const role = await context.request.post(base + "/api/auth/role", {
      headers: { origin: base }, data: { role: "employee" },
    });
    assert.equal(role.status(), 200);
    // Take a desk from outside the page: the first-visit picker would otherwise
    // sit on top of the settings dialog.
    const cookies = await context.cookies(base);
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
        cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.once("seats", () => socket.emit("seat", 0, result => {
        socket.disconnect(); result.ok ? resolve() : reject(Error(result.error));
      }));
    });
    await context.route(base + "/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => requested.push(new URL(request.url()).pathname));
    await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position),
      null, { timeout: 60000 });

    // 1. 设置里是两步面板：第 1 步配色（缩略图 + 色点），第 2 步配件（四个分组）。
    // 全新账号会先弹一次「先捏一下你的角色」（用户 2026-09-28 要求）；本用例验的是设置里那个
    // 面板，所以先把首登面板关掉，免得两个面板的选择器打架。
    const onboarding = page.locator('.seat-picker-hint[aria-label="设置我的角色"]');
    if (await onboarding.count()) {
      await page.getByRole("button", { name: "就这样，进空间" }).click();
      await page.waitForTimeout(500);
    }
    const openSettings = () => page.locator('button[aria-label="设置"]').click();
    await openSettings();
    const colors = await page.locator(".character-setting .color-grid button").count();
    assert(colors >= 8, `配色只有 ${colors} 个`);
    assert.equal(await page.locator(".character-setting .accessory-list").count(), 0,
      "打开时不该直接显示配件（用户要求 1 先配色）");
    const srcsIn = selector => page.evaluate(sel => [...document.querySelectorAll(sel)]
      .map(img => img.getAttribute("src")), selector);
    const bodySrcs = await srcsIn(".character-setting .color-grid img");
    assert(bodySrcs.every(src => /^\/assets\/characters\/thumbnails\/body-.+\.png$/.test(src)),
      `配色缩略图地址不对：${bodySrcs.slice(0, 3).join(", ")}`);
    assert.equal(new Set(bodySrcs).size, bodySrcs.length, "配色缩略图有重复");
    await page.waitForFunction(() => [...document.querySelectorAll(".character-setting .color-grid img")]
      .every(img => img.complete && img.naturalWidth > 0), null, { timeout: 20000 });
    await page.screenshot({ path: path.join(ROOT, "Build/look-step1-colors.png") });

    // 2. 换一个配色：模型不许重新下载（只在原有 GLB 上改材质）。
    const modelsBefore = requested.filter(u => u.endsWith(".glb")).length;
    const rose = page.locator(".character-setting .color-grid button").nth(6);
    const roseName = await rose.getAttribute("aria-label");
    await rose.click();
    await page.waitForTimeout(400);
    const modelsAfterColor = requested.filter(u => u.endsWith(".glb")).length;
    assert.equal(modelsAfterColor, modelsBefore,
      `换配色不该重新下载模型，却多了 ${modelsAfterColor - modelsBefore} 次 GLB 请求`);

    // 3. 第 2 步：配件分组齐全，点一件就戴上（仍然是同一个模型）。
    await page.locator(".look-steps button", { hasText: "2 配件" }).click();
    const rows = await page.locator(".character-setting .accessory-row").count();
    assert.equal(rows, 4, `配件分组应有 4 个，实际 ${rows}`);
    for (const label of ["眼镜", "头发", "胡子", "帽子"]) {
      assert.equal(await page.locator(".character-setting .accessory-slot", { hasText: label }).count(), 1,
        `缺少「${label}」分组`);
    }
    const wearSrcs = await srcsIn(".character-setting .accessory-grid img");
    assert(wearSrcs.every(src => /^\/assets\/characters\/thumbnails\/wear-.+\.png$/.test(src)),
      `配件缩略图地址不对：${wearSrcs.slice(0, 3).join(", ")}`);
    await page.locator(".character-setting .accessory-row", { hasText: "帽子" })
      .locator("button", { hasText: "贝雷帽" }).click();
    const chosenHat = await page.locator(".character-setting .accessory-row", { hasText: "帽子" })
      .locator('button[aria-selected="true"]').getAttribute("title");
    assert.equal(chosenHat, "贝雷帽", "点击后没有高亮所选配件");
    const modelsAfterHat = requested.filter(u => u.endsWith(".glb")).length;
    assert.equal(modelsAfterHat, modelsBefore, "换配件也不该重新下载模型");
    await page.screenshot({ path: path.join(ROOT, "Build/look-step2-accessories.png") });

    // 真正落到模型上：板身基色 + 腿/脚的顶点色都应该等于所选配色，戴上的那件配件 visible。
    const painted = await page.evaluate(() => {
      const root = window.__officeDebug?.avatar?.root;
      const out = { body: null, legVertex: null, worn: [] };
      root?.traverse(obj => {
        if (!obj.isMesh && !obj.isSkinnedMesh) return;
        const list = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const material of list) {
          if (material?.name === "材质.017") out.body = material.color.getHexString();
        }
        const colour = obj.geometry?.getAttribute?.("color");
        if (colour && obj.visible) {
          out.legVertex = [colour.getX(0), colour.getY(0), colour.getZ(0)]
            .map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
        }
        if (obj.visible && obj.material?.name?.endsWith("_材质")) out.worn.push(obj.name);
      });
      return out;
    });
    assert.equal(painted.body, "e0a0a8", `板身没有变成所选配色，实际 #${painted.body}`);
    // 腿/脚用**顶点色**上色（不能改材质颜色，会把共用材质的眼睛一起染了）：
    // 玫粉的线性值 ≈ #e0a0a8 → 顶点色里存的是线性数，所以只断言它明显偏红而不是灰。
    assert.ok(painted.legVertex, "腿/脚没有顶点色，配色没落到它身上");
    assert.notEqual(painted.legVertex, "ffffff", "腿/脚还是白的：" + painted.legVertex);
    // 只戴了"默认短发 + 刚点的贝雷帽"：默认外观是带短发的（这条曾经因为回退成"不戴"
    // 而漏掉，默认头发的问题就是这么被抓到的）。
    assert.deepEqual(painted.worn.slice().sort(), ["帽子_贝雷帽", "头发_短发"].sort(),
      `戴上的配件不对：${JSON.stringify(painted.worn)}`);
    await page.getByRole("button", { name: "关闭", exact: true }).click();

    // 4. 首访弹窗是同一套面板（同一个组件，两处不可能长歪）。
    await openSettings();
    await page.getByRole("button", { name: "重新选座" }).click();
    await page.locator(".seat-picker-hint").waitFor({ timeout: 15000 });
    assert.equal(await page.locator(".seat-picker-hint .color-grid button").count(), colors,
      "首访弹窗的配色数量和设置里不一样");
    await page.getByRole("button", { name: "取消", exact: true }).click();

    // 5. 刷新后外观还在（存到账号里，也存了本机）。
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position),
      null, { timeout: 60000 });
    await openSettings();
    const storedColor = await page.locator('.character-setting .color-grid button[aria-selected="true"]')
      .getAttribute("aria-label");
    assert.equal(storedColor, roseName, `刷新后配色变成了 ${storedColor}`);
    await page.locator(".look-steps button", { hasText: "2 配件" }).click();
    const storedHat = await page.locator(".character-setting .accessory-row", { hasText: "帽子" })
      .locator('button[aria-selected="true"]').getAttribute("title");
    assert.equal(storedHat, "贝雷帽", `刷新后配件变成了 ${storedHat}`);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(ROOT, "Build/look-evidence.json"), JSON.stringify({ colors, rows,
      color: roseName, hat: storedHat, glbRequests: modelsBefore,
      screenshots: ["Build/look-step1-colors.png", "Build/look-step2-accessories.png"], errors }, null, 2));
    console.log(`PASS: 两步捏人（${colors} 配色 / ${rows} 组配件），换装不重下模型，刷新后保留 ${roseName}+贝雷帽`);
  } finally {
    await browser.close(); await new Promise(resolve => server.io.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
