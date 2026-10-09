// Shared test helpers. Not a test file itself (the runner only globs
// `test/*.test.mjs`), so it can hold setup code without being executed.
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { io } from "socket.io-client";
import { createOfficeServer } from "../server.mjs";

/**
 * 把一个 `src/*.ts` 模块转译出来，返回一个可以直接 `import()` 的 data URL。
 *
 * 相对导入（`./fileTransferRules`）会被**递归**替换成同样转译过的 data URL：data URL 模块
 * 解析不了 `./x`，所以只要 `src` 里的模块开始互相 import，不这么做测试就会直接崩
 * （2026-09-21 `chatAttachments.ts` 开始 import `fileTransferRules.ts` 时踩到）。
 * 只看相对导入，包名（`socket.io-client` 之类）交给 Node 自己解析。
 *
 * 用法：`const { toBytes } = await import(await loadTs('fileTransferRules.ts'));`
 */
export async function loadTs(name, urls = new Map()) {
  const cached = urls.get(name);
  if (cached) return cached;
  const source = readFileSync(fileURLToPath(new URL(`../src/${name}`, import.meta.url)), "utf8");
  let js = ts.transpileModule(source,
    { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  const relatives = [...new Set([...js.matchAll(/from\s*['"](\.[^'"]+)['"]/g)].map(match => match[1]))];
  for (const specifier of relatives) {
    // JSON（`buildFixtures.ts` 要 import `../scene-scenery.json`）不能被当成 TS 转译：直接按
    // JSON 模块内联成 data URL，并带上 Node 要求的 import attribute。
    if (specifier.endsWith('.json')) {
      const raw = readFileSync(fileURLToPath(new URL(`../src/${specifier.replace(/^\.\//, "")}`, import.meta.url)));
      const json = "data:application/json;base64," + raw.toString("base64");
      js = js.split(`from '${specifier}'`).join(`from '${json}' with { type: 'json' }`)
        .split(`from "${specifier}"`).join(`from '${json}' with { type: 'json' }`);
      continue;
    }
    const url = await loadTs(`${specifier.replace(/^\.\//, "")}.ts`, urls);
    js = js.split(`from '${specifier}'`).join(`from '${url}'`)
      .split(`from "${specifier}"`).join(`from '${url}'`);
  }
  // 裸包名（`three`、`three/examples/jsm/...`）在 data URL 模块里解析不了，换成解析出来的地址。
  const packages = [...new Set([...js.matchAll(/from\s*['"]([^.'"][^'"]*)['"]/g)].map(match => match[1]))];
  for (const name of packages) {
    let resolved;
    try { resolved = import.meta.resolve(name); } catch { continue; }
    js = js.split(`from '${name}'`).join(`from '${resolved}'`)
      .split(`from "${name}"`).join(`from '${resolved}'`);
  }
  const url = "data:text/javascript;base64," + Buffer.from(js).toString("base64");
  urls.set(name, url);
  return url;
}

/**
 * Boot a signaling server on an ephemeral port, hand the callback a `connect`
 * helper that joins a client and resolves once the room has been published,
 * and tear everything down afterwards. A fresh state file keeps the permanent
 * seat roster from leaking between runs.
 */
export async function withServer(run, options = {}) {
  const dir = mkdtempSync(join(tmpdir(), "office-test-"));
  const { http } = createOfficeServer({ authentication: false, privatePermissions: async () => {},
    meetingPermissions: async () => {}, closePrivateMedia: async () => {}, statePath: join(dir, "state.json"),
    ...options });
  await new Promise((resolve) => http.listen(0, "127.0.0.1", resolve));
  const port = http.address().port;
  const sockets = [];
  const latest = new Map();
  const connect = (name, extra = {}) =>
    new Promise((resolve) => {
      const socket = io(`http://127.0.0.1:${port}`, {
        transports: ["websocket"],
      });
      sockets.push(socket);
      socket.on("connect", () => {
        socket.emit("join", { name, ...extra });
        socket.on("people", (people) => {
          latest.set(socket, people);
          if (people.length) resolve(socket);
        });
      });
    });
  try {
    await run({
      connect,
      port,
      peopleOf: (socket) => latest.get(socket) ?? [],
    });
  } finally {
    sockets.forEach((socket) => socket.disconnect());
    http.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
