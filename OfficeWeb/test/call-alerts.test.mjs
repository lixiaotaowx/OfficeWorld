// A missed call must be visible: the corner popup is derived from the invite that rang
// out, and only a timeout counts (user, 2026-09-15).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const js = ts.transpileModule(readFileSync(new URL("../src/callAlertRules.ts", import.meta.url), "utf8"),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { alertForExpiry, withCallAlert, MAX_CALL_ALERTS } =
  await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

const voice = { id: "r1", target: "peer", kind: "voice", from: "me", name: "我" };
const incoming = { id: "r2", from: "peer", target: "me", kind: "screen", name: "同事乙" };
const nameOf = (id) => (id === "peer" ? "同事乙" : "");

test("拨打 30 秒没人接：呼叫方看到未接通，被叫方看到未接来电", () => {
  const caller = alertForExpiry({ id: "r1", reason: "timeout" }, [voice], [], nameOf);
  assert.equal(caller?.kind, "unanswered");
  assert.equal(caller?.title, "未接通，稍后重试");
  assert.match(caller?.detail || "", /同事乙/);
  assert.equal(caller?.target, "peer", "弹窗要能一键回拨");
  assert.equal(caller?.callKind, "voice");

  const callee = alertForExpiry({ id: "r2", reason: "timeout" }, [], [incoming], nameOf);
  assert.equal(callee?.kind, "missed");
  assert.equal(callee?.title, "未接来电");
  assert.match(callee?.detail || "", /同事乙/);
  assert.equal(callee?.target, "peer");
  assert.equal(callee?.callKind, "screen");
});

test("自己取消、对方接听、或与自己无关的邀请都不弹窗", () => {
  assert.equal(alertForExpiry({ id: "r1", reason: "cancelled" }, [voice], [], nameOf), null,
    "主动取消不算未接");
  assert.equal(alertForExpiry({ id: "r1", reason: "answered" }, [voice], [], nameOf), null,
    "接通了就不该提示");
  assert.equal(alertForExpiry({ id: "r9", reason: "timeout" }, [voice], [], nameOf), null,
    "别的邀请过期与我无关");
  assert.equal(alertForExpiry("r1", [voice], [], nameOf), null, "旧版只带 id 的事件按取消处理");
});

test("未接来电一直显示，只有「知道了」才关掉", () => {
  const view = readFileSync(new URL("../src/CallAlerts.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(view, /setTimeout|setInterval/, "卡片不能自己消失（用户要求只能手动关闭）");
  const call = (id) => ({ id });
  let list = [];
  list = withCallAlert(list, call("a1"));
  list = withCallAlert(list, call("a2"));
  assert.deepEqual(list.map((a) => a.id), ["a1", "a2"], "新的在下面，旧的不动");
  list = withCallAlert(list, call("a1"));
  assert.deepEqual(list.map((a) => a.id), ["a2", "a1"], "同一通电话只留一条");
  for (let i = 0; i < 8; i++) list = withCallAlert(list, call("x" + i));
  assert.equal(list.length, MAX_CALL_ALERTS, "堆太多时最旧的被挤掉");
  assert.equal(list.at(-1).id, "x7", "最新的永远在最后");
  assert.equal(list.some((a) => a.id === "a1"), false);
});

test("服务端把响铃超时、取消、接听用 reason 区分开", () => {
  const server = readFileSync(new URL("../privateSessions.mjs", import.meta.url), "utf8");
  assert.match(server, /ringMs = 30000/, "默认响铃 30 秒");
  assert.match(server, /expire\(invite, 'timeout'\)/, "超时要标记 timeout");
  assert.match(server, /expire\(invite, 'answered'\)/, "接听要标记 answered");
  assert.match(server, /expire\(invite\)/, "取消走默认 cancelled");
  const boot = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
  assert.match(boot, /ringMs: options\.inviteRingMs \?\? 30000/, "server 要把响铃时长传下去");
});
