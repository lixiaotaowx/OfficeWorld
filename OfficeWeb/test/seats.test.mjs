// Workstation claiming is arbitrated by the server: only one player may hold a
// seat, and the ambient thumbnail is opt-out. Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { io } from "socket.io-client";
import { createOfficeServer, SEAT_COUNT } from "../server.mjs";

const JPEG = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA==";

async function withServer(run) {
  const { http } = createOfficeServer();
  await new Promise((resolve) => http.listen(0, "127.0.0.1", resolve));
  const port = http.address().port;
  const sockets = [];
  const latest = new Map();
  const connect = (name) =>
    new Promise((resolve) => {
      const socket = io(`http://127.0.0.1:${port}`, {
        transports: ["websocket"],
      });
      sockets.push(socket);
      socket.on("connect", () => {
        socket.emit("join", { name });
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
  }
}

const claim = (socket, seat) => socket.emitWithAck("seat", seat);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test("server 的工位数与 src/seats.ts 一致", () => {
  const source = readFileSync(new URL("../src/seats.ts", import.meta.url), "utf8");
  // Only the data rows: `seat_id` inside comments must not count.
  const ids = [...source.matchAll(/(?:^|\s)id:\s*"(Island_[^"]+)"/gm)].map(
    (m) => m[1],
  );
  assert.equal(ids.length, SEAT_COUNT, `seats.ts 有 ${ids.length} 个工位`);
  assert.equal(new Set(ids).size, ids.length, "工位 id 不应重复");
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
    // Note: socket.io turns `undefined` into null, which means "release", so it
    // is not a malformed value here.
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

test("传 null 释放工位后别人可以占用", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    await claim(a, 1);
    assert.equal((await claim(a, null)).ok, true);
    assert.equal((await claim(b, 1)).ok, true);
  });
});

test("断线会释放工位", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    await claim(a, 4);
    assert.equal((await claim(b, 4)).ok, false);
    a.disconnect();
    await wait(250);
    assert.equal((await claim(b, 4)).ok, true);
  });
});

test("缩略图默认广播，关闭后不再广播", async () => {
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

    a.emit("preview-allowed", false);
    await wait(120);
    a.emit("preview", JPEG);
    await wait(250);
    assert.equal(
      seen.filter((image) => image).length,
      1,
      "关闭后不应再收到新画面",
    );
    assert.equal(seen[seen.length - 1], null, "关闭时应收到一次清空");
  });
});
