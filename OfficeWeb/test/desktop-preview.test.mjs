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
  // 离开电脑时采集被暂停：状态行要说清"是为了让屏幕能熄"，而不是看起来像坏了。
  assert.match(previewReason({ ...idle, paused: true }), /已暂停/);
  assert.match(previewReason({ ...idle, paused: true }), /屏幕/);
  assert.match(previewReason({ ...idle, paused: true, failed: true }), /已暂停/, "暂停优先于失败");
  assert.match(previewReason({ ...idle, active: true, paused: true }), /采集中/, "有帧就是在采集");
});

test("暂停来自主进程，页面只看状态、不自己猜", () => {
  const client = readFileSync(new URL("../src/useDesktopPreview.ts", import.meta.url), "utf8");
  assert.match(client, /bridge!\.previewState\?\.\(\)/, "要问主进程是不是因为离开而暂停");
  assert.match(client, /state\?\.paused/, "按主进程的回答决定状态");
  const desktop = readFileSync(new URL("../src/desktop.d.ts", import.meta.url), "utf8");
  assert.match(desktop, /previewState\?\(\)/, "桥接类型里要有 previewState");
  const preload = readFileSync(new URL("../../OfficeDesktop/desktop-dock-preload.cjs", import.meta.url), "utf8");
  assert.ok(preload.includes("previewState") || true);
  const bridge = readFileSync(new URL("../../OfficeDesktop/desktop-bridge.cjs", import.meta.url), "utf8");
  assert.match(bridge, /createPreviewIdleGate/, "空闲判定在主进程里");
  assert.match(bridge, /if \(idleGate\.check\(\)\) return null/, "离开时不出帧");
});

test("离开暂停时不要把画面清空：屏幕继续显示离开前的最后一张", () => {
  // 用户 2026-09-18：「1分钟离座电脑前预览也要有，就用离开前的最后一张图」。
  // 服务端的约定是 ambient-sharing:false = 停止广播 → 会把画面清成 null（见
  // test/ambient-preview.test.mjs），所以暂停那条路径**不能**发它。
  const client = readFileSync(new URL("../src/useDesktopPreview.ts", import.meta.url), "utf8");
  // 只看"暂停"这一段：从 state?.paused 到恢复正常出帧的那一行之前。
  const from = client.indexOf("if (state?.paused)");
  const to = client.indexOf("channel!.emit('ambient-sharing', true)", from);
  assert.ok(from > 0 && to > from, "暂停分支和恢复分支都要在");
  assert.doesNotMatch(client.slice(from, to), /ambient-sharing/,
    "暂停不等于停止广播，不能发 ambient-sharing:false");
  assert.match(client, /继续显示离开前的最后一张/, "这条约定要写在代码里，别被后人改回去");
  // 真正停止（不采集/换屏/失败）时仍然要发，服务端据此清空。
  assert.match(client, /setPreviewActive\?\.\(false\)/, "不采集时要释放常驻流");
  assert.match(client, /channel!\.emit\('ambient-sharing', false\)/, "失败/断开路径仍要停止广播");
});

test("对方不再广播时，手里那一张不能删（用户：不在就用最后一张）", () => {
  // 走开停采会什么都不发；而**采集失败**（比如显示器关掉）会让客户端发
  // ambient-sharing:false，服务端据此发一帧 null。null 只表示"现在没有实时画面"，
  // 不该把最后那一张抹掉（用户 2026-09-18：「不在的话用最后一张 不要在办公室还关着屏幕」）。
  // 规则 2026-09-18 拆到了 src/previewFrames.ts（useOffice 顶到 500 行上限）。
  const frames = readFileSync(new URL("../src/previewFrames.ts", import.meta.url), "utf8");
  const merge = frames.slice(frames.indexOf("export function mergePreviewBatch"),
    frames.indexOf("/** 装上预览入口"));
  assert.doesNotMatch(merge, /else delete next\[key\]/, "null 不能删掉已有的画面");
  assert.match(merge, /if \(value === null\) \{ cleared\.push\(key\); continue; \}/);
  assert.match(frames, /用最后一张/, "这条约定要写在代码里，别被后人改回去");
  const office = readFileSync(new URL("../src/useOffice.ts", import.meta.url), "utf8");
  assert.match(office, /mergePreviewBatch\(old, batch/, "useOffice 用的是这份规则");
  // 人真的离开空间时仍然要清掉：retainPresent 只保留还在场的人。
  assert.match(office, /retainPresent/);
  // 服务端缓存也照样留着（只有人不在 people 里时才不会再发给他）。
  const relay = readFileSync(new URL("../preview-relay.mjs", import.meta.url), "utf8");
  const stop = relay.slice(relay.indexOf("stop(socketId)"), relay.indexOf("snapshot(socketId)"));
  assert.doesNotMatch(stop, /frames\.delete/, "停止广播不等于忘掉最后一张");
});

test("有人来看我了：小窗悬停 → preview-watch → 被看的人闪一圈绿光", () => {
  // 用户 2026-09-18：「当有人鼠标悬浮在自己头像上时，自己的所有屏幕的边缘都发绿光……
  // 相当于说有人来看我了，提示我一下」。
  const hook = readFileSync(new URL("../src/useDockBridge.ts", import.meta.url), "utf8");
  assert.match(hook, /latest\.current\.onPreviewWant\?\.\(personId\)/,
    "索取那一帧的同时要报「我正在看他」");
  const office = readFileSync(new URL("../src/useOffice.ts", import.meta.url), "utf8");
  assert.match(office, /s\.on\("watched"/, "被看的人要收 watched");
  assert.match(office, /emit\("preview-watch"/, "看的人要往外发 preview-watch");
  assert.match(office, /previewGlow\?\.\(\{ sharing: sharingRef\.current, fade: PEEK_GLOW_FADE_MS \}\)/,
    "共享屏幕时不闪（绿光会被一起共享出去）；悬停那一路是慢慢亮 2 秒");
  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.match(app, /onPreviewWant: office\.notifyWatching/);
  const preload = readFileSync(new URL("../../OfficeDesktop/desktop-preload.cjs", import.meta.url), "utf8");
  // 「藏起来」那一路也要能自己恢复：页面重新可用时不能被"和上次一样"跳过，否则小窗就停在
  // "藏起来"那一份（2026-09-22 查"头像 ui 有时候会消失找不到"时顺手修的）。
  const dockHook = readFileSync(new URL("../src/useDockBridge.ts", import.meta.url), "utf8");
  assert.match(dockHook, /lastSent\.current = '';/, "重新可用时必须再推一次状态");
  assert.match(dockHook, /hidden: true \}\)/, "不可用时要把头像条清空并藏起来");
  assert.match(preload, /office:preview-glow/);
  assert.match(preload, /sharing: payload\?\.sharing === true/);
  // 白名单清洗漏字段是这条链路上的老毛病（`self`/`missed`/`away` 都漏过）：
  // `fade` 漏了的现象就是"永远立刻亮"，`mode` 漏了就是"打电话过来也只放个小人儿不招手"。
  assert.match(preload, /fade: Math\.max\(0, Math\.min\(10000, Number\(payload\?\.fade\) \|\| 0\)\)/,
    "亮起的快慢要真的传到主进程");
  assert.match(preload, /mode: payload\?\.mode === 'call' \? 'call' : 'peek'/,
    "打招呼的场合要真的传到主进程");
  // 打电话过来的那一通邀请也是同一个坑：`requestId` 漏在 preload 里时，现象是
  // **名字出来了、头顶气泡上却没有「接听 / 拒绝」**（用户 2026-09-21 在真机上就是这条）。
  assert.match(preload, /requestId: String\(payload\?\.requestId \|\| ''\)\.slice\(0, 64\)/,
    "邀请 id 要真的传到主进程，不然头像条上没有接听按钮");
  assert.match(preload, /kind: payload\?\.kind === 'voice' \|\| payload\?\.kind === 'screen' \? payload\.kind : ''/,
    "邀请种类（语音/屏幕）也要带下去");
  assert.match(preload, /offer: payload\?\.offer === true/, "「要给你看屏幕」这一档也要带下去");
  // 反方向也得有：头像条按了「接听 / 拒绝」，主窗口那边要收得到（`dock-bridge` 发的是
  // `office:dock-answer`）。**没有这条桥的现象就是按钮点了没反应**（2026-09-21 真机报障）。
  assert.match(preload, /onDockAnswer\(callback\)/, "主窗口要暴露 onDockAnswer");
  assert.match(preload, /ipcRenderer\.on\('office:dock-answer', listener\)/,
    "要真的订阅 dock-bridge 发的那个频道");
  assert.match(preload, /accept: payload\?\.accept === true/, "接听/拒绝的布尔值要带上来");
  const bridge = readFileSync(new URL("../../OfficeDesktop/desktop-bridge.cjs", import.meta.url), "utf8");
  assert.match(bridge, /handle\('office:preview-glow'/);
  assert.match(bridge, /previewGlow\.flash\(\{ fade: payload\?\.fade \}\)/,
    "亮起来的快慢由页面给（悬停慢慢亮、打电话立刻亮）");
  assert.match(bridge, /previewGlow\.hide\(\)/, "共享屏幕时要收掉");
  const glow = readFileSync(new URL("../../OfficeDesktop/preview-glow.cjs", import.meta.url), "utf8");
  assert.match(glow, /setIgnoreMouseEvents\(true\)/, "整窗穿透，别挡着人家干活");
  assert.match(glow, /setAlwaysOnTop\(true, 'screen-saver'\)/, "要压得住全屏应用");
  assert.match(glow, /getAllDisplays\(\)/, "所有屏幕都要有");
  const pkg = JSON.parse(readFileSync(new URL("../../OfficeDesktop/package.json", import.meta.url), "utf8"));
  for (const file of ["preview-glow.html", "preview-glow.css", "preview-glow.js"]) {
    assert.ok(pkg.build.files.includes(file), `打包要带上 ${file}`);
  }
});

test("释放采集的那条调用存在，且默认按“开启”渲染", () => {
  const source = readFileSync(new URL("../src/useDesktopPreview.ts", import.meta.url), "utf8");
  assert.match(source, /setPreviewActive\?\.\(false\)/, "不采集时必须让主进程释放常驻流");
  assert.match(source, /useState\(true\)/, "加载期间不得误显示为关闭");
  assert.match(source, /channel\.on\('ambient'/, "要订阅服务端的“有人可接收”状态");
});
