import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { io as connect } from "socket.io-client";
import { createOfficeServer } from "../server.mjs";

test("账号验证、工位抢占、注销与跨重启恢复", async () => {
  const dir = mkdtempSync(join(tmpdir(), "office-auth-"));
  const sockets = [];
  let server, url;
  async function start() {
    server = createOfficeServer({ statePath: join(dir, "state.json"), accountsPath: join(dir, "accounts.json"), secureCookies: false });
    await new Promise(r => server.http.listen(0, "127.0.0.1", r));
    url = `http://127.0.0.1:${server.http.address().port}`;
  }
  const post = async (route, body, cookie = "", origin = url) => {
    const response = await fetch(url + "/api/auth/" + route, {
      method: "POST", headers: { "Content-Type": "application/json", Origin: origin, Cookie: cookie }, body: JSON.stringify(body),
    });
    return { status: response.status, data: await response.json(), cookie: response.headers.get("set-cookie")?.split(";")[0], header: response.headers.get("set-cookie") };
  };
  const client = (cookie, extra = {}) => new Promise((resolve, reject) => {
    const s = connect(url, { transports: ["websocket"], reconnection: false, extraHeaders: { Cookie: cookie, Origin: url } });
    sockets.push(s); s.on("connect_error", reject);
    s.on("connect", () => s.emit("join", { name: "forged name", id: "forged-id", ...extra }));
    s.on("people", people => {
      const me = people.find(p => p.id === s.id);
      if (me) resolve({ s, me });
    });
  });
  try {
    await start();
    assert.equal((await fetch(url + "/api/auth/me")).status, 401);
    await assert.rejects(client(""));
    assert.equal((await post("register", { name: "同事甲", password: "" })).status, 400);
    assert.equal((await post("register", { name: "同事甲", password: "12345678901234567" })).status, 400);
    assert.equal((await post("register", { name: "短密码", password: "1" })).status, 200);
    assert.equal((await post("login", { name: "短密码", password: "1" })).status, 200);
    assert.equal((await post("register", { name: "最长密码", password: "1234567890123456" })).status, 200);
    assert.equal((await post("register", { name: "同事甲", password: "test-password-A" }, "", "https://attacker.invalid")).status, 403);
    const a = await post("register", { name: "同事甲", password: "test-password-A" });
    assert.equal(a.status, 200); assert.match(a.header, /HttpOnly/); assert.match(a.header, /SameSite=Strict/);
    assert.equal((await post("register", { name: "同事甲", password: "test-password-A" })).status, 409);
    assert.equal((await post("login", { name: "同事甲", password: "wrong-password" })).status, 401);
    const b = await post("register", { name: "同事乙", password: "test-password-B" });
    const ca = await client(a.cookie), cb = await client(b.cookie, { id: a.data.user.id });
    assert.equal(ca.me.name, "同事甲"); assert.equal(ca.me.clientId, a.data.user.id);
    assert.notEqual(cb.me.clientId, ca.me.clientId);
    const race = await Promise.all([ca.s.emitWithAck("seat", 2), cb.s.emitWithAck("seat", 2)]);
    assert.equal(race.filter(r => r.ok).length, 1);
    const winner = race[0].ok ? a : b, loser = race[0].ok ? cb : ca;
    assert.equal((await loser.s.emitWithAck("seat", 2)).ok, false);
    assert.equal((await ca.s.emitWithAck("rename", "冒充同事")).ok, false);
    sockets.forEach(s => s.disconnect());
    await new Promise(r => server.io.close(r));
    await start();
    const restored = await client(winner.cookie);
    assert.equal(restored.me.seat, 2);
    const disk = readFileSync(join(dir, "accounts.json.d", winner.data.user.id + ".json"), "utf8");
    assert.ok(!disk.includes("test-password")); assert.ok(!disk.includes(winner.cookie.split("=")[1]));
    const roster = JSON.parse(readFileSync(join(dir, "state.json"), "utf8"));
    assert.equal(roster.seats[2].name, winner.data.user.name);
    await post("logout", {}, winner.cookie);
    const me = await fetch(url + "/api/auth/me", { headers: { Cookie: winner.cookie } });
    assert.equal(me.status, 401);
    await assert.rejects(client(winner.cookie));
    const relogin = await post("login", { name: winner.data.user.name, password: winner === a ? "test-password-A" : "test-password-B" });
    assert.equal((await client(relogin.cookie)).me.seat, 2);
  } finally {
    sockets.forEach(s => s.disconnect());
    if (server) await new Promise(r => server.io.close(r));
    rmSync(dir, { recursive: true, force: true });
  }
});
