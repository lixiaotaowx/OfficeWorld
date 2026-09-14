import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { loadAccounts, saveAccounts } from "./account-storage.mjs";

const scrypt = promisify(scryptCallback);
const COOKIE = "office_session";
const LIFE = 30 * 24 * 3600 * 1000;
/** Who somebody is in the office: a colleague or a visiting client. */
export const ROLES = new Set(["employee", "visitor"]);
const digest = (token) => createHash("sha256").update(token).digest("hex");
const cleanName = (name) => typeof name === "string" ? name.normalize("NFKC").trim() : "";

export function createAccounts(path, { secure = true, onLogin = () => {} } = {}) {
  const data = loadAccounts(path);
  const attempts = new Map();
  let pending = Promise.resolve();
  const commit = () => {
    data.sessions = data.users.flatMap(u => data.sessions.filter(s => s.userId === u.id && s.expires > Date.now()).slice(-12));
    saveAccounts(path, data);
  };
  const publicUser = (user) => ({ id: user.id, name: user.name, character: user.character,
    role: ROLES.has(user.role) ? user.role : "" });
  const tokenOf = (req) => {
    const match = /(?:^|;\s*)office_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || "");
    return match?.[1];
  };
  const authenticate = (req) => {
    const token = tokenOf(req);
    const session = token && data.sessions.find((s) => s.hash === digest(token) && s.expires > Date.now());
    return session ? data.users.find((u) => u.id === session.userId) : undefined;
  };
  const cookie = (token, age = LIFE / 1000) =>
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure ? "; Secure" : ""}`;
  const reply = (res, status, body, extra = {}) => {
    res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra });
    res.end(JSON.stringify(body));
  };
  const originAllowed = (req) => {
    try { return new URL(req.headers.origin).host === req.headers.host; }
    catch { return false; }
  };
  const MAX_TRACKED_SOURCES = 5000;
  const MAX_FAILURES = 30;
  const WINDOW_MS = 10 * 60000;
  /** Behind nginx the last X-Forwarded-For hop is the one our proxy appended. */
  const sourceKey = (req) => {
    const address = req.socket.remoteAddress;
    const proxy = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address);
    return proxy ? String(req.headers["x-forwarded-for"] || address).split(",").at(-1).trim() : address;
  };
  // Only failures count, so a whole office behind one NAT address is not locked
  // out by its own successful logins, and the table stays bounded by the number
  // of distinct sources seen in the window.
  const rateAllowed = (req) => {
    const now = Date.now();
    for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
    const entry = attempts.get(sourceKey(req));
    if (!entry) return attempts.size < MAX_TRACKED_SOURCES;
    return entry.count < MAX_FAILURES;
  };
  const rateFailed = (req) => {
    const key = sourceKey(req);
    const entry = attempts.get(key) || { count: 0, until: Date.now() + WINDOW_MS };
    entry.count++;
    attempts.set(key, entry);
  };
  async function bodyOf(req) {
    let body = "";
    for await (const part of req) {
      body += part;
      if (Buffer.byteLength(body) > 4096) throw Error("请求过大");
    }
    return JSON.parse(body);
  }
  async function handle(req, res) {
    const route = req.url?.split("?")[0];
    if (!route?.startsWith("/api/auth/")) return false;
    if (route === "/api/auth/me" && req.method === "GET") {
      const user = authenticate(req);
      reply(res, user ? 200 : 401, { user: user ? publicUser(user) : null,
        invalidSession: !user && !!tokenOf(req) });
      return true;
    }
    if (req.method !== "POST" || !originAllowed(req)) {
      reply(res, 403, { error: "请求来源无效，请刷新页面" }); return true;
    }
    if (route === "/api/auth/logout") {
      const token = tokenOf(req);
      data.sessions = data.sessions.filter((s) => s.hash !== digest(token || ""));
      commit(); reply(res, 200, { ok: true }, { "Set-Cookie": cookie("", 0) }); return true;
    }
    // Chosen once when somebody first enters the office (and changeable later).
    if (route === "/api/auth/role") {
      const user = authenticate(req);
      if (!user) { reply(res, 401, { error: "请先登录" }); return true; }
      try {
        const body = await bodyOf(req);
        if (!ROLES.has(body?.role)) { reply(res, 400, { error: "身份只能是成员或访客" }); return true; }
        user.role = body.role;
        commit();
        reply(res, 200, { user: publicUser(user) });
      } catch { if (!res.headersSent) reply(res, 400, { error: "请求未完成，请稍后重试" }); }
      return true;
    }
    if (!["/api/auth/login", "/api/auth/register"].includes(route)) {
      reply(res, 404, { error: "接口不存在" }); return true;
    }
    if (!rateAllowed(req)) {
      reply(res, 429, { error: "尝试过于频繁，请十分钟后再试" }); return true;
    }
    try {
      const body = await bodyOf(req);
      const name = cleanName(body.name), password = body.password;
      if (name.length < 2 || name.length > 24 || /[\p{C}]/u.test(name) ||
          typeof password !== "string" || password.length < 1 || password.length > 16) {
        reply(res, 400, { error: "姓名需 2–24 个字符，密码需 1–16 个字符" }); return true;
      }
      // Serialize registration and durable writes, including concurrent names.
      const task = pending.then(async () => {
        let user = data.users.find((u) => u.key === name.toLocaleLowerCase("en-US"));
        if (route.endsWith("register")) {
          if (user) { rateFailed(req); return reply(res, 409, { error: "这个姓名已注册，请登录或使用可区分的姓名" }); }
          const salt = randomBytes(16).toString("hex");
          const hash = (await scrypt(password, salt, 64)).toString("hex");
          user = { id: randomUUID(), name, key: name.toLocaleLowerCase("en-US"), salt, hash, character: "woman_casual" };
          data.users.push(user);
        } else {
          const actual = await scrypt(password, user?.salt || "unregistered-account", 64);
          if (!user || !timingSafeEqual(actual, Buffer.from(user.hash, "hex"))) {
            rateFailed(req);
            return reply(res, 401, { error: "姓名或密码不正确" });
          }
        }
        const token = randomBytes(32).toString("hex");
        const previousSessions = data.sessions;
        data.sessions = data.sessions.filter((s) => s.expires > Date.now() && s.userId !== user.id);
        data.sessions.push({ hash: digest(token), userId: user.id, expires: Date.now() + LIFE });
        try { commit(); }
        catch (error) { data.sessions = previousSessions; throw error; }
        onLogin(user.id);
        reply(res, 200, { user: publicUser(user) }, { "Set-Cookie": cookie(token) });
      });
      pending = task.catch(() => {});
      await task;
    } catch {
      if (!res.headersSent) reply(res, 400, { error: "请求未完成，请稍后重试" });
    }
    return true;
  }
  const setCharacter = (id, character) => {
    const user = data.users.find((u) => u.id === id);
    if (user) { user.character = character; commit(); }
  };
  const setRole = (id, role) => {
    const user = data.users.find((u) => u.id === id);
    if (user && ROLES.has(role)) { user.role = role; commit(); return true; }
    return false;
  };
  const listContacts = () => data.users.map(user => ({ id: user.id, name: user.name }));
  return { handle, authenticate, setCharacter, setRole, originAllowed, listContacts };
}
