// Pure annotation model: stroke merging, per-person colours and the letterbox
// maths that keeps a stroke in the same place on every window size.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const js = ts.transpileModule(readFileSync(new URL("../src/annotations.ts", import.meta.url), "utf8"),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const {
  applyAnnotate, applyClear, applyUndo, colorFor, contentBox, denormalize, normalizePoint, strokesFor,
} = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

const message = (over = {}) => ({ id: "s1", clientId: "acct-a", name: "甲", scope: "call-1", stroke: "k1", points: [[0.1, 0.2]], ...over });

test("同一条笔画按顺序追加，不同人各自成条", () => {
  let strokes = applyAnnotate([], message());
  assert.equal(strokes.length, 1);
  assert.equal(strokes[0].done, false);
  strokes = applyAnnotate(strokes, message({ points: [[0.2, 0.3]] }));
  assert.deepEqual(strokes[0].points, [[0.1, 0.2], [0.2, 0.3]]);
  strokes = applyAnnotate(strokes, message({ done: true, points: [[0.3, 0.4]] }));
  assert.equal(strokes[0].done, true);
  strokes = applyAnnotate(strokes, message({ id: "s2", clientId: "acct-b", name: "乙", points: [[0.5, 0.5]] }));
  assert.equal(strokes.length, 2);
  assert.notEqual(strokes[0].color, strokes[1].color);
});

test("空消息与只带 done 的收尾消息不会创建空笔画", () => {
  assert.deepEqual(applyAnnotate([], message({ points: [] })), []);
  assert.deepEqual(applyAnnotate([], message({ done: true })), []);
  assert.deepEqual(applyAnnotate([], message({ stroke: "" })), []);
  const existing = applyAnnotate([], message());
  assert.equal(applyAnnotate(existing, message({ points: [] })).length, 1, "空点集不应新增");
});

test("笔画带屏的命名空间：不同共享屏互不混画", () => {
  let strokes = applyAnnotate([], message({ scope: "call-1" }));
  strokes = applyAnnotate(strokes, message({ id: "s2", clientId: "acct-b", scope: "meeting-9", points: [[0.9, 0.9]] }));
  assert.equal(strokes.length, 2);
  assert.deepEqual(strokesFor(strokes, "call-1").map((stroke) => stroke.clientId), ["acct-a"]);
  assert.deepEqual(strokesFor(strokes, "meeting-9").map((stroke) => stroke.clientId), ["acct-b"]);
  assert.deepEqual(strokesFor(strokes, "call-2"), []);
  // 清空只影响那一块屏。
  const cleared = applyClear(strokes, "call-1");
  assert.equal(cleared.length, 1);
  assert.equal(cleared[0].scope, "meeting-9");
  // 撤销也只在该屏范围内找该发送者的最后一条。
  const undone = applyUndo(strokes, "acct-a", "meeting-9");
  assert.equal(undone.length, 2, "跨屏不应误删");
  assert.equal(applyUndo(strokes, "acct-a", "call-1").length, 1);
});

test("撤销只移除该发送者的最后一条，清空清掉整块板", () => {
  let strokes = applyAnnotate([], message({ id: "s1", clientId: "a", points: [[0, 0]] }));
  strokes = applyAnnotate(strokes, message({ id: "s2", clientId: "b", points: [[1, 1]] }));
  strokes = applyAnnotate(strokes, message({ id: "s1", stroke: "k2", clientId: "a", points: [[0.5, 0.5]] }));
  const undone = applyUndo(strokes, "a");
  assert.equal(undone.length, 2);
  assert.deepEqual(undone.map((stroke) => stroke.clientId), ["a", "b"]);
  assert.equal(applyUndo(strokes, "nobody").length, 3);
  assert.deepEqual(applyClear(strokes), [], "不传 scope 时清掉整块板");
  assert.deepEqual(applyClear([]), [], "已经空的板不应产生新数组");
});

test("同一个人的颜色稳定，不同的人颜色不同", () => {
  assert.equal(colorFor("acct-a"), colorFor("acct-a"));
  assert.match(colorFor("acct-a"), /^hsl\(\d+ 74% 46%\)$/);
  const colors = new Set(["a", "b", "c", "d", "e", "f", "g", "h"].map(colorFor));
  assert.ok(colors.size >= 6, `颜色区分度不足: ${colors.size}`);
});

test("留黑边时的坐标换算：只有画面区域算在内", () => {
  // Element 1000x400, media 16:9 -> picture 711x400, centred with 144px bars.
  const box = contentBox({ clientWidth: 1000, clientHeight: 400 }, 1920, 1080);
  assert.equal(Math.round(box.width), 711);
  assert.equal(Math.round(box.height), 400);
  assert.equal(Math.round(box.x), 144);
  assert.deepEqual(normalizePoint(box, 144, 0), [0, 0]);
  assert.deepEqual(normalizePoint(box, box.x + box.width, box.y + box.height), [1, 1]);
  assert.deepEqual(normalizePoint(box, 500, 200), [0.5, 0.5]);
  assert.equal(normalizePoint(box, 10, 200), null, "左侧黑边不应产生笔画");
  assert.equal(normalizePoint(box, 995, 200), null, "右侧黑边不应产生笔画");
  // 无黑边时是恒等映射。
  const exact = contentBox({ clientWidth: 960, clientHeight: 540 }, 1920, 1080);
  assert.deepEqual(normalizePoint(exact, 480, 270), [0.5, 0.5]);
  assert.deepEqual(denormalize(exact, 0.5, 0.5), [480, 270]);
  assert.equal(contentBox({ clientWidth: 0, clientHeight: 0 }, 1920, 1080), null);
});
