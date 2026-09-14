// Whether this client should capture its screen at all. Capturing used to run
// whenever the client held a desk, even with nobody able to watch: one frame cost
// 552ms of main-process time, so the answer matters.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const js = ts.transpileModule(readFileSync(new URL("../src/previewGate.ts", import.meta.url), "utf8"),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { mayBroadcastPreview, shouldPreview } =
  await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

const base = { desktop: true, connected: true, seated: true, wanted: true };

test("四个条件缺一不可", () => {
  assert.equal(shouldPreview(base), true);
  assert.equal(shouldPreview({ ...base, desktop: false }), false, "浏览器版不采集桌面");
  assert.equal(shouldPreview({ ...base, connected: false }), false, "断线不采集");
  assert.equal(shouldPreview({ ...base, seated: false }), false, "没有工位不采集");
  assert.equal(shouldPreview({ ...base, wanted: false }), false, "没有人在接收就不采集");
  assert.equal(shouldPreview({ ...base, mayBroadcast: false }), false, "访客从不广播低清预览");
  assert.equal(shouldPreview({ ...base, mayBroadcast: true }), true);
});

test("老板坐老板工位时照常广播，普通访客不行", () => {
  const boss = 8;
  assert.equal(mayBroadcastPreview("employee", 2, boss), true, "成员都可以广播");
  assert.equal(mayBroadcastPreview("visitor", 8, boss), true, "老板即使是访客身份也要共享低清屏");
  assert.equal(mayBroadcastPreview("visitor", 3, boss), false, "普通访客仍然不广播");
  assert.equal(mayBroadcastPreview("visitor", null, boss), false, "访客坐沙发不广播");
  assert.equal(mayBroadcastPreview("", 1, boss), true, "还没选身份时按可广播处理");
});

test("释放采集的那条调用存在，且默认按“开启”渲染", () => {
  const source = readFileSync(new URL("../src/useDesktopPreview.ts", import.meta.url), "utf8");
  assert.match(source, /setPreviewActive\?\.\(false\)/, "不采集时必须让主进程释放常驻流");
  assert.match(source, /useState\(true\)/, "加载期间不得误显示为关闭");
  assert.match(source, /channel\.on\('ambient'/, "要订阅服务端的“有人可接收”状态");
  assert.match(source, /setTimeout\(frame, 6000\)/, "间隔为 6 秒");
  assert.match(source, /mayBroadcastPreview\(person\?\.role, person\?\.seat, BOSS_SEAT\)/,
    "客户端必须和服务端一样，让老板工位的人广播");
});
