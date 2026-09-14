// Whether this client should capture its screen at all. Capturing used to run
// whenever the client held a desk, even with nobody able to watch: one frame cost
// 552ms of main-process time, so the answer matters.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const js = ts.transpileModule(readFileSync(new URL("../src/previewGate.ts", import.meta.url), "utf8"),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { previewIntervalMs, previewReason, shouldPreview } =
  await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

const base = { desktop: true, connected: true, seated: true };

test("有工位就一直采集自己的屏幕", () => {
  assert.equal(shouldPreview(base), true);
  assert.equal(shouldPreview({ ...base, desktop: false }), false, "浏览器版不采集桌面");
  assert.equal(shouldPreview({ ...base, connected: false }), false, "断线不采集");
  assert.equal(shouldPreview({ ...base, seated: false }), false, "没有工位不采集");
  assert.equal(shouldPreview({ ...base, mayBroadcast: false }), false, "访客从不广播低清预览");
  assert.equal(shouldPreview({ ...base, mayBroadcast: true }), true);
});

test("没人在接收也照常采集：自己的显示器要一直有画面", () => {
  const source = readFileSync(new URL("../src/useDesktopPreview.ts", import.meta.url), "utf8");
  // The old rule stopped the capture when nobody else could receive it, which left
  // the desk monitor blank for somebody working alone (user, 2026-09-15).
  assert.doesNotMatch(source, /shouldPreview\(\{[^}]*wanted/, "wanted 不再参与是否采集的判断");
  assert.match(source, /shouldPreview\(\{ desktop, connected, seated, mayBroadcast \}\)/);
});

test("刷新间隔：焦点内 6 秒，焦点外 12 秒", () => {
  assert.equal(previewIntervalMs(true, true), 6000);
  assert.equal(previewIntervalMs(false, true), 12000, "没有焦点就放慢一半");
  assert.equal(previewIntervalMs(true, false), 12000, "窗口被隐藏也放慢");
  const source = readFileSync(new URL("../src/useDesktopPreview.ts", import.meta.url), "utf8");
  assert.match(source, /setTimeout\(frame, previewDelay\(\)\)/, "间隔必须按焦点动态决定");
  assert.match(source, /previewIntervalMs\(document\.hasFocus\(\), document\.visibilityState !== 'hidden'\)/);
  assert.match(source, /addEventListener\('focus', frame\)/, "回到焦点要立刻刷新一帧");
});

test("访客一律不广播，没有老板例外", () => {
  const gate = readFileSync(new URL("../src/previewGate.ts", import.meta.url), "utf8");
  const client = readFileSync(new URL("../src/useDesktopPreview.ts", import.meta.url), "utf8");
  const server = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(gate, /mayBroadcastPreview|bossSeat|BOSS_SEAT/, "客户端不再有老板专用分支");
  assert.doesNotMatch(client, /BOSS_SEAT/, "客户端不再引用老板工位");
  assert.doesNotMatch(server, /preview-policy|broadcastsPreview/, "服务端不再有老板专用分支");
  assert.match(server, /p\.previewSharing = value === true && p\.seat != null && p\.role !== "visitor"/);
});

test("状态行说得出为什么没有画面", () => {
  const idle = { active: false, desktop: true, connected: true, seated: true,
    mayBroadcast: true, failed: false, watched: true };
  assert.match(previewReason({ ...idle, active: true }), /采集中/);
  assert.match(previewReason({ ...idle, active: true, watched: false }), /暂时没人看/);
  assert.match(previewReason({ ...idle, desktop: false }), /授权工位预览/);
  assert.match(previewReason({ ...idle, connected: false }), /连接中/);
  assert.match(previewReason({ ...idle, seated: false }), /工位/);
  assert.match(previewReason({ ...idle, mayBroadcast: false }), /访客/);
  assert.match(previewReason({ ...idle, failed: true }), /采集失败/);
  assert.match(previewReason(idle), /准备中/);
});

test("释放采集的那条调用存在，且默认按“开启”渲染", () => {
  const source = readFileSync(new URL("../src/useDesktopPreview.ts", import.meta.url), "utf8");
  assert.match(source, /setPreviewActive\?\.\(false\)/, "不采集时必须让主进程释放常驻流");
  assert.match(source, /useState\(true\)/, "加载期间不得误显示为关闭");
  assert.match(source, /channel\.on\('ambient'/, "要订阅服务端的“有人可接收”状态");
});
