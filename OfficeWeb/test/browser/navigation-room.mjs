import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer as createVite } from "vite";
import react from "@vitejs/plugin-react";
import { createOfficeServer } from "../../server.mjs";
import { RETENTION } from "../../chat-store.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("./playwright.cjs");
const dir = mkdtempSync(join(tmpdir(), "navigation-browser-"));
const options = { statePath: join(dir, "state.json"), accountsPath: join(dir, "accounts.json"), secureCookies: false };
let server = createOfficeServer(options);
await new Promise(r => server.http.listen(0, "127.0.0.1", r));
const port = server.http.address().port;
const target = `http://127.0.0.1:${port}`;
const vite = await createVite({ configFile: false, root: resolve("."), plugins: [react()],
  server: { host: "127.0.0.1", port: 0, proxy: { "/socket.io": { target, ws: true }, "/api": { target } } } });
await vite.listen();
const origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
const url = origin + "/test/chat-files-harness.html";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto(origin+'/?debug=1');
  await page.evaluate(async()=>{
    const r=await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'通行验证',password:'test'})});
    if(!r.ok) throw Error(await r.text());
  });
  await page.reload();
  await page.getByRole('button',{name:'确认',exact:true}).click();
  await page.waitForFunction(()=>window.__officeDebug?.avatar?.model);
  await page.evaluate(()=>{
    const a=window.__officeDebug.avatar;
    a.moveTo(a.root.position.clone().set(8.65,0,-7.68));
  });
  await page.waitForFunction(()=>{
    const a=window.__officeDebug.avatar;
    return Math.hypot(a.root.position.x-8.65,a.root.position.z+7.68)<0.05;
  },null,{timeout:35000});
  await page.screenshot({path:'../Build/manager-room-arrival.png',fullPage:true});
  await page.evaluate(()=>{const a=window.__officeDebug.avatar;a.moveTo(a.root.position.clone().set(4,0,-2.7));});
  await page.waitForFunction(()=>{const a=window.__officeDebug.avatar;return Math.hypot(a.root.position.x-4,a.root.position.z+2.7)<0.05;},null,{timeout:30000});
  assert.deepEqual(errors,[]);
  console.log('PASS actual avatar enters manager room, walks behind desk, and exits; zero page errors');
} finally {
  await browser.close();await vite.close();await new Promise(r=>server.io.close(r));
  rmSync(dir,{recursive:true,force:true});
}
