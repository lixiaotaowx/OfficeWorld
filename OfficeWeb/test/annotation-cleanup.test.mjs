// Marks drawn on a shared screen must not survive the share: hanging up, being
// taken over, leaving a meeting or losing the session all have to clean up the
// desktop layer and tell the people watching the same screen to drop their board.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { EventEmitter } from "node:events";
import ts from "typescript";
import { loadMedia } from './media-test-loader.mjs';

function load(file, modules) {
  const source = readFileSync(new URL("../src/" + file, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("require", "exports", code)((id) => {
    const key = String(id).replace("./", "").replace(".ts", "");
    if (modules[key]) return modules[key];
    throw Error("unexpected dependency: " + id);
  }, exports);
  return exports;
}
const sourceOf = (file) => readFileSync(new URL("../src/" + file, import.meta.url), "utf8");
const tick = () => new Promise((resolve) => setImmediate(resolve));

/** A capture that only exists if the fake room hands one out. */
function screenShare({ capture = true } = {}) {
  const socket = new EventEmitter();
  socket.connected = true;
  socket.timeout = () => ({ emitWithAck: async () => ({ ok: true }) });
  const publication = { track: { stop() {} } };
  const room = { state: "connected", localParticipant: {
    getTrackPublication: () => (capture ? publication : undefined),
    unpublishTrack: async () => {},
    publishTrack: async () => {},
    createScreenTracks: async () => [{ stop() {},
      mediaStreamTrack: { addEventListener() {}, removeEventListener() {} } }],
  } };
  const rooms = { get: () => room, run: async (_name, work) => work(room, () => true) };
  const { MeetingScreenShare } = load("meetingScreenShare.ts", {
    "livekit-client": { Track: { Source: { ScreenShare: "screen" } } },
    screenAudio: { unpublishScreen: async () => {}, screenAudioConstraints: {}, noScreenAudio: "no audio" },
    screenPermission: { waitForScreenPermission: async () => {} },
    screenShareIndicator: loadMedia('screenShareIndicator'),
    // 换屏用的原地换轨；这里只关心开始/结束时谁被清理。
    screenSwitch: { swapScreenTrack: async () => true },
  });
  const share = new MeetingScreenShare(socket, rooms, () => "meeting-1", () => {});
  return { share, socket };
}

test("会议共享结束才通知清理：有采集才算结束", async () => {
  const running = screenShare();
  let stopped = 0;
  running.share.onStopped = () => { stopped++; };
  running.share.stop("meeting-1");
  assert.equal(stopped, 0, "没有采集时不得误清别人的标记");
  await running.share.start("meeting-1");
  await tick();
  running.share.stop("meeting-1");
  assert.equal(stopped, 1, "真的结束了才清理");
});

test("同意让出共享（被接替）也会走清理", async () => {
  const { share, socket } = screenShare();
  let stopped = 0;
  share.onStopped = () => { stopped++; };
  await share.start("meeting-1");
  await tick();
  const lease = share.captures.get("meeting-1").lease;
  socket.emit("meeting-screen-replaced", { room: "meeting-1", lease });
  await tick();
  assert.equal(stopped, 1, "被接替时必须清理");
});

test("私聊与会议的结束都汇到同一个 onScreenStopped", () => {
  const media = sourceOf("media.ts");
  assert.match(media, /onScreenStopped\?: \(\) => void/, "onScreenStopped 必须是公开回调");
  assert.match(media, /if \(hadScreen\) this\.onScreenStopped\?\.\(\)/,
    "只有真的在共享时停止才回调，避免误清");
  assert.match(media, /this\.meetingScreens\.onStopped = \(\) => this\.onScreenStopped\?\.\(\)/,
    "会议共享结束要汇到同一个回调");
  assert.match(media, /const hadScreen = Boolean\(this\.screen\)/);
});

test("所有会结束共享的路径都在 useOffice / annotationChannel 里清理标记", () => {
  const office = sourceOf("useOffice.ts");
  const channel = sourceOf("annotationChannel.ts");
  // The layering is split: useOffice knows WHEN a share ended, the channel knows HOW to
  // take the marks away. Both halves are asserted, so the split cannot silently lose a
  // path. (The channel was extracted when useOffice.ts reached the 500-line limit.)
  assert.match(office, /m\.onScreenStopped = \(\) => annotations\.clearShareMarks\(myShareScopes\.current\)/,
    "媒体层一报告结束就清理");
  // 退出会议那一条现在住在 channel 里（`trackMeetingRoom`），useOffice 只把房间号交过去。
  assert.match(office, /annotations\.trackMeetingRoom\(meetingRoom\)/,
    "离开会议要通知画布换房间了");
  assert.match(channel, /if \(meetingRoom && meetingRoom !== room\) channel\.clearShareMarks\(\[meetingRoom\]\)/,
    "退出会议要清掉该会议范围的标记（会议号会被复用）");
  assert.match(office, /s\.on\("disconnect"[\s\S]{0,200}annotations\.detach\(\)/,
    "断线/被顶下线不能把标记层留在桌面上");
  assert.match(channel, /socket\.current\.emit\('annotate-clear', \{ scope \}\)/,
    "要通知同屏的人一起清掉");
  assert.match(channel, /clearShareMarks\(scopes: string\[\]\)[\s\S]{0,300}channel\.detach\(\)/,
    "清理必须关掉桌面层");
  assert.match(channel, /void layer\(\)\?\.clear\(\)/,
    "隐藏桌面层前要先擦掉画布，否则下次共享会看到旧笔画");
});
