// Identity on entry: an iruler employee or a visiting client. The client is seated
// in the public area and never broadcasts the low-resolution preview, but keeps
// every other feature. A name containing 文杰 goes straight to the manager's chair.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { io as connect } from "socket.io-client";
import { BOSS_SEAT, createOfficeServer } from "../server.mjs";

/** One plausible low-resolution frame, in the shape the desktop client sends. */
const FRAME = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA==";

async function withAuthServer(run, options = {}) {
  const dir = mkdtempSync(join(tmpdir(), "office-roles-"));
  const sockets = [];
  let server;
  server = createOfficeServer({ statePath: join(dir, "state.json"),
    accountsPath: join(dir, "accounts.json"), secureCookies: false, ...options });
  await new Promise((resolve) => server.http.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.http.address().port}`;
  const post = async (route, body, cookie = "") => {
    const response = await fetch(url + "/api/auth/" + route, { method: "POST",
      headers: { "Content-Type": "application/json", Origin: url, Cookie: cookie },
      body: JSON.stringify(body) });
    return { status: response.status, data: await response.json(),
      cookie: response.headers.get("set-cookie")?.split(";")[0] };
  };
  const enter = (cookie, name) => new Promise((resolve, reject) => {
    const socket = connect(url, { transports: ["websocket"], reconnection: false,
      extraHeaders: { Cookie: cookie, Origin: url } });
    sockets.push(socket);
    socket.on("connect_error", reject);
    socket.on("connect", () => socket.emit("join", { name }));
    socket.on("people", (people) => {
      const me = people.find((person) => person.id === socket.id);
      if (me) resolve({ socket, me: () => people.find((person) => person.id === socket.id), people });
    });
  });
  try {
    await run({ post, enter, dir, url });
  } finally {
    sockets.forEach((socket) => socket.disconnect());
    await new Promise((resolve) => server.io.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
}

test("访客身份落库，进空间就坐沙发，且不广播低清预览", async () => {
  await withAuthServer(async ({ post, enter, dir }) => {
    const guest = await post("register", { name: "客户甲", password: "1" });
    assert.equal(guest.data.user.role, "", "注册后还没选身份");
    const chosen = await post("role", { role: "visitor" }, guest.cookie);
    assert.equal(chosen.status, 200);
    assert.equal(chosen.data.user.role, "visitor");
    const bad = await post("role", { role: "老板" }, guest.cookie);
    assert.equal(bad.status, 400, "只允许成员或访客");
    // 身份会持久化：重新登录仍是访客。
    const again = await post("login", { name: "客户甲", password: "1" });
    assert.equal(again.data.user.role, "visitor");

    const { socket, me, people } = await enter(again.cookie, "客户甲");
    assert.equal(me().role, "visitor");
    assert.equal(me().seat, null, "访客不占工位");
    assert.match(me().sittingSpot || "", /^sofa-/, "应被安排到沙发");
    // 访客照旧可以接收别人的预览。
    assert.equal(me().previewAllowed, true);

    const owner = await post("register", { name: "同事乙", password: "1" });
    await post("role", { role: "employee" }, owner.cookie);
    const other = await enter(owner.cookie, "同事乙");
    const frames = [];
    other.socket.on("preview", (value) => frames.push(value));
    // 前台会把访客的预览强行关掉，即使客户端硬发也不转发。
    socket.emit("ambient-sharing", true);
    socket.emit("preview", FRAME);
    await new Promise((resolve) => setTimeout(resolve, 150));
    // 只允许"清空"（image 为 null）传过去，不允许任何画面。
    assert.equal(frames.filter((value) => value.image).length, 0, "同事不应收到访客的低清画面");
    assert.equal(frames.some((value) => value.image === null), true, "服务端要主动清掉访客占用的显示器");
    assert.equal(other.people.length, 2, "两人都在线");
  });
});

test("访客不能占工位，员工可以；名字含文杰直接进老板工位并持久化", async () => {
  await withAuthServer(async ({ post, enter, dir }) => {
    const guest = await post("register", { name: "客户丙", password: "1" });
    await post("role", { role: "visitor" }, guest.cookie);
    const { socket } = await enter(guest.cookie, "客户丙");
    const denied = await socket.emitWithAck("seat", 2);
    assert.equal(denied.ok, false);
    assert.match(denied.error, /访客/);
    const sat = await socket.emitWithAck("sit", "sofa-1");
    assert.equal(sat.ok, true, "访客可以自己选公共座位");

    const boss = await post("register", { name: "李文杰", password: "1" });
    await post("role", { role: "employee" }, boss.cookie);
    const { me } = await enter(boss.cookie, "李文杰");
    assert.equal(me().seat, BOSS_SEAT, "名字含文杰应直接坐进老板工位");
    const roster = JSON.parse(readFileSync(join(dir, "state.json"), "utf8"));
    assert.equal(roster.seats[BOSS_SEAT].name, "李文杰", "老板工位必须落盘");

    // 重启后仍然保留。
    const rosterAgain = JSON.parse(readFileSync(join(dir, "state.json"), "utf8"));
    assert.equal(String(rosterAgain.seats[BOSS_SEAT].id).length > 0, true);
  });
});

test("老板工位的人即使是访客身份，也照常共享低清预览", async () => {
  await withAuthServer(async ({ post, enter }) => {
    const boss = await post("register", { name: "李文杰", password: "1" });
    await post("role", { role: "visitor" }, boss.cookie);
    const { socket, me } = await enter(boss.cookie, "李文杰");
    assert.equal(me().role, "visitor");
    assert.equal(me().seat, BOSS_SEAT, "名字含文杰照样坐进老板工位");

    const colleague = await post("register", { name: "同事丁", password: "1" });
    await post("role", { role: "employee" }, colleague.cookie);
    const other = await enter(colleague.cookie, "同事丁");
    const frames = [];
    other.socket.on("preview", (value) => frames.push(value));

    socket.emit("ambient-sharing", true);
    socket.emit("preview", FRAME);
    await new Promise((resolve) => setTimeout(resolve, 150));
    assert.deepEqual(frames.filter((value) => value.image).map((value) => value.image), [FRAME],
      "同事应收到老板的低清画面");
    assert.equal(frames.some((value) => value.image === null), false, "不得把老板的画面清掉");
  });
});
