// Motion relay: players must see each other move, but a single client must not
// be able to flood the room or place an avatar outside the building.
import test from "node:test";
import assert from "node:assert/strict";
import {
  MOTION_BOUNDS,
  MOTION_INTERVAL_MS,
} from "../server.mjs";
import { withServer, wait } from "./helpers.mjs";

const move = (socket, motion) => socket.emit("motion", motion);

test("别人的移动会被转发给我", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    const seen = [];
    b.on("motion", (m) => seen.push(m));
    await wait(50);
    move(a, { x: 1.5, z: -2, rot: 0.5, moving: true, sitting: false });
    await wait(200);
    assert.equal(seen.length, 1);
    assert.equal(seen[0].x, 1.5);
    assert.equal(seen[0].z, -2);
    assert.equal(seen[0].moving, true);
  });
});

test("自己的移动不会回传给自己", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    let own = 0;
    a.on("motion", () => own++);
    await wait(50);
    move(a, { x: 2, z: 2, rot: 0, moving: true });
    await wait(200);
    assert.equal(own, 0);
  });
});

test("位置会被夹在建筑范围内", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    const seen = [];
    b.on("motion", (m) => seen.push(m));
    await wait(50);
    move(a, { x: 9999, z: -9999, rot: 0, moving: true });
    await wait(200);
    assert.equal(seen.length, 1);
    assert.equal(seen[0].x, MOTION_BOUNDS.maxX);
    assert.equal(seen[0].z, MOTION_BOUNDS.minZ);
  });
});

test("非法坐标被丢弃", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    const seen = [];
    b.on("motion", (m) => seen.push(m));
    await wait(50);
    for (const bad of [
      null,
      {},
      { x: NaN, z: 0, rot: 0 },
      { x: "1", z: 0, rot: 0 },
      { x: 1, z: Infinity, rot: 0 },
      { x: 1, z: 0, rot: "0" },
    ]) {
      move(a, bad);
      await wait(MOTION_INTERVAL_MS + 10);
    }
    assert.equal(seen.length, 0, "非法负载不应被转发");
  });
});

test("发送过快会被限流", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲");
    const b = await connect("乙");
    const seen = [];
    b.on("motion", (m) => seen.push(m));
    await wait(50);
    for (let i = 0; i < 20; i++)
      move(a, { x: i * 0.1, z: 0, rot: 0, moving: true });
    await wait(250);
    assert.ok(seen.length > 0, "至少应转发一次");
    assert.ok(
      seen.length < 20,
      `应被限流，实际转发了 ${seen.length} 次（20 次几乎同时发送）`,
    );
  });
});

test("未进入空间的连接不能广播移动", async () => {
  await withServer(async ({ connect, port }) => {
    const b = await connect("乙");
    const seen = [];
    b.on("motion", (m) => seen.push(m));
    // A raw socket that never emits `join`.
    const { io } = await import("socket.io-client");
    const stranger = io(`http://127.0.0.1:${port}`, {
      transports: ["websocket"],
    });
    await new Promise((resolve) => stranger.on("connect", resolve));
    stranger.emit("motion", { x: 1, z: 1, rot: 0, moving: true });
    await wait(250);
    stranger.disconnect();
    assert.equal(seen.length, 0);
  });
});

test("角色选择会随 people 广播出去", async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect("甲", { character: "man_casual_2" });
    assert.equal(peopleOf(a)[0].character, "man_casual_2");
    a.emit("character", "woman_casual");
    await wait(150);
    assert.equal(peopleOf(a)[0].character, "woman_casual");
    // Unknown ids are sanitised back to the default rather than relayed.
    a.emit("character", "bogus-id");
    await wait(150);
    assert.equal(peopleOf(a)[0].character, "woman_casual");
  });
});
