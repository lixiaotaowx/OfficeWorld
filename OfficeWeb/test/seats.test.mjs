// Workstation claiming is arbitrated by the server and now permanent: only one
// player may hold a seat, desks survive disconnects and restarts, and the
// administrator (password-gated) is the only one who can free a desk. Run with
// `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { io } from "socket.io-client";
import {
  createOfficeServer,
  SEAT_COUNT,
} from "../server.mjs";
const ADMIN_PASSWORD = "isolated-seat-test-password";

const JPEG = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA==";

async function withServer(run, adminPassword = ADMIN_PASSWORD) {
  // A fresh state file per test keeps the permanent roster from leaking between
  // cases, which would otherwise cross-contaminate a shared state.json.
  const dir = mkdtempSync(join(tmpdir(), "office-test-"));
  const { http } = createOfficeServer({ authentication: false, statePath: join(dir, "state.json"), adminPassword });
  await new Promise((resolve) => http.listen(0, "127.0.0.1", resolve));
  const port = http.address().port;
  const sockets = [];
  const latest = new Map();
  const connect = (name, id) =>
    new Promise((resolve) => {
      const socket = io(`http://127.0.0.1:${port}`, {
        transports: ["websocket"],
      });
      sockets.push(socket);
      socket.on("connect", () => {
        socket.emit("join", { name, id });
        socket.on("people", (people) => {
          latest.set(socket, people);
          if (people.length) resolve(socket);
        });
      });
    });
  try {
    await run({ connect, peopleOf: (socket) => latest.get(socket) ?? [] });
  } finally {
    sockets.forEach((s) => s.disconnect());
    http.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

const claim = (socket, seat) => socket.emitWithAck("seat", seat);
const rename = (socket, name) => socket.emitWithAck("rename", name);
const kick = (socket, seat, password) =>
  socket.emitWithAck("admin", { seat, password });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test("未配置管理员密码时拒绝空密码和旧默认密码", async () => {
  await withServer(async ({ connect }) => {
    const person = await connect("owner", "owner-no-admin");
    assert.equal((await claim(person, 0)).ok, true);
    for (const password of ["", "admin123"])
      assert.equal((await kick(person, 0, password)).ok, false);
  }, "");
});

test("server 的工位数与 src/seats.ts 一致", () => {
  const source = readFileSync(new URL("../src/seats.ts", import.meta.url), "utf8");
  // Only the data rows: `seat_id` inside comments must not count.
  const ids = [...source.matchAll(/(?:^|\s)id:\s*"(Island_[^"]+|Manager)"/gm)].map(
    (m) => m[1],
  );
  assert.equal(ids.length, SEAT_COUNT, `seats.ts 有 ${ids.length} 个工位`);
  assert.equal(new Set(ids).size, ids.length, "工位 id 不应重复");
  assert.equal(ids[8], "Manager", "老板工位追加在原有八个工位之后");
});

test("老板工位可以认领且拒绝并发抢占与越界座位", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲"), b = await connect("乙");
    const results = await Promise.all([claim(a, 8), claim(b, 8)]);
    assert.equal(results.filter(r => r.ok).length, 1);
    assert.equal((await claim(a, 9)).ok, false);
  });
});

test("加入时不自动分座", async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect("甲");
    assert.equal(peopleOf(a)[0].seat, null);
    // A second player triggers another broadcast; nobody should hold a seat.
    await connect("乙");
    assert.ok(
      peopleOf(a).every((p) => p.seat === null),
      "所有人初始都不占工位",
    );
  });
});

test("空闲工位可以被占用", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const reply = await claim(a, 3);
    assert.equal(reply.ok, true);
    assert.equal(reply.seat, 3);
  });
});

test("同一工位只能一个人占用", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    assert.equal((await claim(a, 0)).ok, true);
    const second = await claim(b, 0);
    assert.equal(second.ok, false);
    assert.match(second.error, /甲/);
  });
});

test("并发抢同一工位只有一个成功", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    const [ra, rb] = await Promise.all([claim(a, 5), claim(b, 5)]);
    const winners = [ra, rb].filter((r) => r.ok);
    assert.equal(winners.length, 1, "必须恰好一个人抢到");
  });
});

test("非法工位被拒绝", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    for (const bad of [-1, SEAT_COUNT, 1.5, "3", {}, true]) {
      const reply = await claim(a, bad);
      assert.equal(reply.ok, false, `${JSON.stringify(bad)} 不应被接受`);
    }
  });
});

test("换工位会释放原来的工位", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    await claim(a, 2);
    await claim(a, 6);
    // Seat 2 must be free for somebody else now.
    assert.equal((await claim(b, 2)).ok, true);
  });
});

test("工位永久：传 null 不能释放", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    await claim(a, 1);
    const release = await claim(a, null);
    assert.equal(release.ok, false, "用户不能自己放弃工位");
    assert.equal((await claim(b, 1)).ok, false, "工位仍然归甲所有");
  });
});

test("工位永久：断线不释放，重连自动恢复", async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect("甲", "id-a");
    const b = await connect("乙", "id-b");
    await claim(a, 4);
    a.disconnect();
    await wait(150);
    // 乙仍无法占用：工位永久属于甲的身份。
    assert.equal((await claim(b, 4)).ok, false);
    // 甲用同一身份重连，工位自动恢复。
    const a2 = await connect("甲", "id-a");
    assert.equal(peopleOf(a2).find((p) => p.id === a2.id).seat, 4);
  });
});

test("改名会更新在线名字", async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect("甲", "id-a");
    const reply = await rename(a, "阿甲");
    assert.equal(reply.ok, true);
    await wait(100);
    assert.equal(peopleOf(a).find((p) => p.id === a.id).name, "阿甲");
  });
});

test("管理员踢出会释放工位并通知在线成员", async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect("甲", "id-a");
    const b = await connect("乙", "id-b");
    await claim(a, 3);
    // 密码错误不会生效。
    assert.equal((await kick(b, 3, "wrong")).ok, false);
    assert.equal((await claim(b, 3)).ok, false);
    // 正确密码释放工位，并通知在线的甲。
    const kicked = new Promise((resolve) => a.once("kicked", resolve));
    const reply = await kick(b, 3, ADMIN_PASSWORD);
    assert.equal(reply.ok, true);
    assert.equal(reply.name, "甲");
    const info = await kicked;
    assert.equal(info.seat, 3);
    await wait(100);
    assert.equal(peopleOf(a).find((p) => p.id === a.id).seat, null);
    assert.equal((await claim(b, 3)).ok, true);
  });
});

test("管理员可以踢出离线的永久工位", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲", "id-a");
    await claim(a, 5);
    a.disconnect();
    await wait(150);
    const b = await connect("乙", "id-b");
    assert.equal((await kick(b, 5, ADMIN_PASSWORD)).ok, true);
    assert.equal((await claim(b, 5)).ok, true);
  });
});

test("缩略图默认接收，关闭接收后服务器停止下发他人画面", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    const seen = [];
    b.on("preview", (payload) => seen.push(payload.image));

    a.emit("sharing", true);
    await wait(120);
    a.emit("preview", JPEG);
    await wait(250);
    assert.equal(seen.length, 1, "默认应收到缩略图");

    b.emit("preview-allowed", false);
    await wait(120);
    a.emit("preview", JPEG);
    await wait(250);
    assert.equal(
      seen.filter((image) => image).length,
      1,
      "关闭后不应再收到新画面",
    );
    assert.equal(seen.length, 1, "关闭后不再下发他人预览事件");
  });
});
