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
const aContext=await browser.newContext(),bContext=await browser.newContext();
const a=await aContext.newPage(),b=await bContext.newPage();
const errors=[];for(const page of [a,b])page.on('pageerror',e=>errors.push(e.message));
const auth=async(page,route,password='test')=>page.evaluate(async({route,password})=>{
 const r=await fetch('/api/auth/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'单账号验证',password})});return r.status;
},{route,password});
try {
 await a.goto(origin);assert.equal(await auth(a,'register'),200);await a.reload();
 await a.getByRole('button',{name:'空间聊天',exact:true}).waitFor();
 await a.waitForFunction(()=>document.body.textContent.includes('协作已连接'));
 await b.goto(origin);assert.equal(await auth(b,'login','wrong'),401);
 assert.equal(await a.evaluate(async()=>(await fetch('/api/auth/me')).status),200);
 assert.equal(await auth(b,'login'),200);
 await a.getByRole('alert').filter({hasText:'账号已在其他地方登录'}).waitFor();
 assert.equal(await a.evaluate(async()=>(await fetch('/api/auth/me')).status),401);
 await b.reload();await b.getByRole('button',{name:'空间聊天',exact:true}).waitFor();
 await b.waitForFunction(()=>document.body.textContent.includes('协作已连接'));
 await a.reload();await a.getByRole('heading',{name:'欢迎回来'}).waitFor();
 assert.equal(await b.evaluate(async()=>(await fetch('/api/auth/me')).status),200);
 // Latest login remains valid across a service restart; the old one cannot return.
 await new Promise(r=>server.io.close(r));server=createOfficeServer(options);
 await new Promise(r=>server.http.listen(port,'127.0.0.1',r));
 assert.equal(await a.evaluate(async()=>(await fetch('/api/auth/me')).status),401);
 assert.equal(await b.evaluate(async()=>(await fetch('/api/auth/me')).status),200);
 assert.deepEqual(errors,[]);
 console.log('PASS latest login immediately displaces old UI/session; wrong password does not kick; restart preserves revocation');
} finally {
 await browser.close();await vite.close();await new Promise(r=>server.io.close(r));rmSync(dir,{recursive:true,force:true});
}
