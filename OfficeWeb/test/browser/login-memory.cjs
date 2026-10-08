// The desktop app must remember the account. It used to clear the saved login whenever
// a session ended - being displaced by a browser login with the same account was enough -
// so the next launch asked for the password again (user, 2026-09-15: "客户端老是记不住
// 用户账号和密码"). Only an explicit logout may forget it.
//
//   node test/browser/login-memory.cjs
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const vite = await createServer({
    configFile: false, root: resolve("."), plugins: [react()],
    server: { host: "127.0.0.1", port: 0 },
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/test/login-memory-harness.html`);
    await page.getByLabel("姓名", { exact: true }).waitFor({ timeout: 30000 });
    await page.waitForTimeout(300);

    // The saved account is read and put in the form, so coming back is one click.
    const prefilled = await page.evaluate(() => ({
      name: document.querySelector('input[autocomplete="username"]')?.value,
      password: document.querySelector('input[type="password"]')?.value,
      saved: window.__saved && window.__saved.name,
    }));
    console.log("prefilled:", JSON.stringify(prefilled));
    assert.equal(prefilled.name, "小文杰", "登录表单要带出保存的姓名");
    assert.equal(prefilled.password, "pw-1234", "登录表单要带出保存的密码");
    assert.equal(prefilled.saved, "小文杰", "保存的账号不能被读取动作清掉");

    // Displaced by another device: the login page comes back, the password stays.
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("office-session-ended",
      { detail: { message: "账号已在其他地方登录，请重新登录", forget: false } })));
    await page.waitForTimeout(400);
    const afterDisplacement = await page.evaluate(() => ({
      calls: window.__calls.filter(([kind]) => kind === "clear").length,
      saved: window.__saved && window.__saved.name,
      name: document.querySelector('input[autocomplete="username"]')?.value,
      password: document.querySelector('input[type="password"]')?.value,
    }));
    console.log("displaced:", JSON.stringify(afterDisplacement));
    assert.equal(afterDisplacement.calls, 0, "被顶下线不能调用 clearLogin");
    assert.equal(afterDisplacement.saved, "小文杰", "被顶下线后保存的账号必须还在");
    assert.equal(afterDisplacement.name, "小文杰", "回到登录页要把姓名填好");
    assert.equal(afterDisplacement.password, "pw-1234", "回到登录页要把密码填好");

    // A typo must not replace the known-good encrypted login.
    await page.getByLabel('密码', { exact: true }).fill('wrong-password');
    await page.getByRole('button', { name: '进入办公室 →', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: '测试环境不登录' }).waitFor();
    assert.equal(await page.evaluate(() => window.__saved.password), 'pw-1234');
    assert.equal(await page.evaluate(() => window.__calls.filter(([kind]) => kind === 'save').length), 0);

    // Reset updates the same saved identity only after server success.
    await page.getByRole('button', { name: '找回密码', exact: true }).click();
    assert.equal(await page.getByLabel('新密码', { exact: true }).inputValue(), '');
    assert.equal(await page.getByLabel('姓名', { exact: true }).inputValue(), '小文杰');
    await page.getByLabel('新密码', { exact: true }).fill('new-secret');
    await page.screenshot({ path: resolve('../Build/password-reset-form.png') });
    await page.getByRole('button', { name: '修改密码并进入 →', exact: true }).click();
    await page.getByRole('heading', { name: '你是哪一位？' }).waitFor();
    assert.equal(await page.evaluate(() => window.__saved.password), 'new-secret');
    await page.reload();
    await page.waitForFunction(() => document.querySelector('input[type="password"]')?.value === 'new-secret');
    assert.equal(await page.getByLabel('姓名', { exact: true }).inputValue(), '小文杰');

    // A deliberate exit is the one case that forgets the account.
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("office-session-ended",
      { detail: { message: "已退出登录", forget: true } })));
    await page.waitForTimeout(400);
    const afterForget = await page.evaluate(() => ({
      calls: window.__calls.filter(([kind]) => kind === "clear").length,
      saved: window.__saved,
      password: document.querySelector('input[type="password"]')?.value,
    }));
    console.log("forgotten:", JSON.stringify(afterForget));
    assert.equal(afterForget.calls, 1, "主动退出必须清掉保存的登录信息");
    assert.equal(afterForget.saved, null);
    assert.equal(afterForget.password, "", "清掉之后不能再把旧密码填进去");

    // And the source keeps both rules in place.
    const source = require("node:fs").readFileSync(resolve("src/AccountGate.tsx"), "utf8");
    assert.match(source, /if \(detail\.forget === true\)/, "只有明确要求时才清除");
    assert.ok(source.indexOf('if (!r.ok) throw') < source.indexOf('saveLogin({'),
      'save only after successful authentication');
    assert.deepEqual(errors, []);
    console.log("PASS 记住账号（被顶下线/会话失效都不清），只有主动退出才清");
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
