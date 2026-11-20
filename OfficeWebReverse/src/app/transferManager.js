// transfer manager + received files store.
// Recovered verbatim from the production bundle; bindings renamed to semantic names.
import { createFileSender as Et } from './officeTransfers.js';
import { downloadToFile as kt } from './officeTransfers.js';
import { i as J } from '../chunks/chatLocal.js';
import { C as oe } from '../chunks/chatLocal.js';
import { j as K } from '../chunks/chatLocal.js';
import { d as at } from '../chunks/chatLocal.js';
import { t as Ae } from '../chunks/chatLocal.js';
import { b as ct } from '../chunks/chatLocal.js';
import { F as ht } from '../chunks/chatLocal.js';
import { k as Te } from '../chunks/chatLocal.js';
import { B as Oe } from '../chunks/chatLocal.js';
import { n as ft } from '../chunks/chatLocal.js';
import { p as lt } from '../chunks/chatLocal.js';
import { q as ut } from '../chunks/chatLocal.js';
import { v as dt } from '../chunks/chatLocal.js';

function createReceivedFilesStore(n) {
  const e = `office-received-files:${n}`;
  let t = {};
  try {
    t = JSON.parse(localStorage.getItem(e) || "{}"), (!t || Array.isArray(t) || typeof t != "object") && (t = {});
  } catch {}
  return {
    get: s => t[s],
    save(s) {
      var i, o;
      let r = !1;
      for (const a of s) {
        if (a.status !== "done" || !a.path) continue;
        const f = a.attachmentId || a.id;
        ((i = t[f]) == null ? void 0 : i.path) === a.path && ((o = t[f]) == null ? void 0 : o.endedAt) === a.endedAt || (t[f] = {
          ...a,
          handle: "",
          url: ""
        }, r = !0);
      }
      if (r) {
        t = Object.fromEntries(Object.entries(t).sort((a, f) => f[1].endedAt - a[1].endedAt).slice(0, 2e3));
        try {
          localStorage.setItem(e, JSON.stringify(t));
        } catch {}
      }
    }
  };
}
const getDesktopFilesBridge = () => {
  var n;
  return (n = window.officeDesktop) == null ? void 0 : n.files;
};
function createTransferManager(n) {
  const e = createReceivedFilesStore(n.accountId || "local");
  let t,
    s = [],
    r = [];
  const i = new Set(),
    o = new Map(),
    a = new Map();
  let f,
    d,
    m = -2;
  const _ = () => {
      if (e.save(s), !dt(r, s)) {
        r = s.map(h => ({
          ...h
        }));
        for (const h of i) h();
      }
    },
    y = () => {
      f || (f = setTimeout(() => {
        f = void 0, _();
      }, ht));
    },
    A = () => {
      f && (clearTimeout(f), f = void 0), _();
    },
    E = h => s.find(c => c.id === h || c.attachmentId === h),
    b = h => E(h) || e.get(h);
  function I(h, c = !0) {
    s = c ? [h, ...s] : [...s, h], A();
  }
  function L() {
    const h = s.filter(u => !K(u));
    if (h.length <= Te) return;
    const c = new Set(h.slice(Te).map(u => u.id));
    s = s.filter(u => !c.has(u.id));
    for (const u of c) N(u);
  }
  function N(h) {
    const c = a.get(h);
    if (c) {
      try {
        URL.revokeObjectURL(c);
      } catch {}
      a.delete(h);
    }
    o.delete(h);
  }
  function F(h, c, u) {
    const p = URL.createObjectURL(new Blob(u, {
      type: "application/octet-stream"
    }));
    a.set(h, p);
    const g = document.createElement("a");
    return g.href = p, g.download = c, g.rel = "noopener", document.body.append(g), g.click(), g.remove(), p;
  }
  function B() {
    const h = s.filter(K),
      c = u => {
        var p;
        u !== m && (m = u, (p = getDesktopFilesBridge()) == null || p.progress(u).catch(() => {}));
      };
    if (h.length) {
      d && (clearTimeout(d), d = void 0);
      const u = h.reduce((g, w) => g + Math.max(1, w.size), 0),
        p = h.reduce((g, w) => g + Math.min(w.transferred, w.size), 0);
      c(Math.max(0, Math.min(1, p / u)));
      return;
    }
    m >= 0 && m < 1 && (c(1), d || (d = setTimeout(() => {
      d = void 0, c(-1);
    }, 1500)));
  }
  function P(h, c) {
    const u = E(h);
    u && (u.status = "failed", u.error = c, u.endedAt = Date.now(), A(), B());
  }
  function S(h, c) {
    var p, g;
    const u = E(h);
    u && (u.direction === "receive" && ((p = getDesktopFilesBridge()) == null || p.receiveCancel(h).catch(() => {})), u.handle && ((g = getDesktopFilesBridge()) == null || g.sendClose(u.handle).catch(() => {}), u.handle = ""), N(h), P(h, c), n.notify(c), L());
  }
  const k = Et({
    bridge: getDesktopFilesBridge,
    socket: () => t,
    place: h => I(h),
    row: E,
    fail: P,
    soon: y,
    commit: A,
    taskbar: B,
    trim: L,
    notify: n.notify
  });
  function O(h) {
    h.on("file-in", async (c, u) => {
      if (typeof u != "function") return;
      const p = String((c == null ? void 0 : c.transferId) || ""),
        g = String((c == null ? void 0 : c.name) || "File"),
        w = Number(c == null ? void 0 : c.size) || 0,
        q = String((c == null ? void 0 : c.fromName) || "Colleague");
      if (!p || E(p)) return u({
        ok: !1,
        error: "Duplicate transfer"
      });
      if (w < 1) return u({
        ok: !1,
        error: "Invalid file size"
      });
      const R = getDesktopFilesBridge();
      if (!R && w > Oe) return u({
        ok: !1,
        error: `浏览器最多只能收 ${ft(Oe)}，请对方用桌面客户端`
      });
      I({
        id: p,
        direction: "receive",
        status: "receiving",
        peerId: String((c == null ? void 0 : c.fromId) || ""),
        ...(typeof (c == null ? void 0 : c.attachmentId) == "string" && /^direct-[a-z0-9-]+$/i.test(c.attachmentId) ? {
          attachmentId: c.attachmentId
        } : {}),
        peerName: q,
        name: g,
        size: w,
        transferred: 0,
        path: "",
        folder: "",
        url: "",
        error: "",
        at: Date.now(),
        endedAt: 0,
        handle: ""
      });
      try {
        if (R) {
          const T = await R.receiveOpen({
            transferId: p,
            name: g,
            size: w
          });
          if (!(T != null && T.ok)) throw Error((T == null ? void 0 : T.error) || "文件没收到");
          const W = E(p);
          W && (W.folder = T.folder || "");
        } else o.set(p, []);
      } catch (T) {
        const W = J(T);
        return h.emit("file-cancel", {
          transferId: p,
          reason: W
        }), S(p, W), u({
          ok: !1,
          error: W
        });
      }
      return u({
        ok: !0
      });
    }), h.on("file-in-part", async (c, u) => {
      if (typeof u != "function") return;
      const p = String((c == null ? void 0 : c.transferId) || ""),
        g = E(p);
      if (!g || g.status !== "receiving") return u({
        ok: !1,
        error: "传输过期了"
      });
      const w = await Ae(c == null ? void 0 : c.bytes);
      if (!w.length) {
        const R = lt(c == null ? void 0 : c.bytes);
        return u({
          ok: !1,
          error: R < 0 ? `Invalid file chunk (received ${ut(c == null ? void 0 : c.bytes)})` : "Invalid file chunk (zero length)"
        });
      }
      const q = getDesktopFilesBridge();
      try {
        if (q) {
          const R = await q.receiveWrite(p, w);
          if (!(R != null && R.ok)) throw Error((R == null ? void 0 : R.error) || "写不进收文件的文件夹");
          g.transferred = Number(R.written) || g.transferred + w.length;
        } else {
          const R = o.get(p);
          if (!R) throw Error("传输过期了");
          R.push(w), g.transferred += w.length;
        }
        return y(), B(), u({
          ok: !0
        });
      } catch (R) {
        const T = J(R);
        return h.emit("file-cancel", {
          transferId: p,
          reason: T
        }), S(p, T), u({
          ok: !1,
          error: T
        });
      }
    }), h.on("file-in-end", async (c, u) => {
      if (typeof u != "function") return;
      const p = String((c == null ? void 0 : c.transferId) || ""),
        g = E(p);
      if (!g || g.status !== "receiving") return u({
        ok: !1,
        error: "传输过期了"
      });
      const w = getDesktopFilesBridge();
      try {
        if (!w) return g.url = F(p, g.name, o.get(p) || []), o.delete(p), g.status = "done", g.transferred = g.size, g.endedAt = Date.now(), A(), B(), L(), u({
          ok: !0,
          savedName: g.name
        });
        const q = await w.receiveEnd(p);
        if (!(q != null && q.ok)) throw Error((q == null ? void 0 : q.error) || "文件没存上");
        return g.status = "done", g.transferred = g.size, g.endedAt = Date.now(), g.path = q.path || "", g.folder = q.folder || g.folder, g.name = q.savedName || g.name, A(), B(), L(), u({
          ok: !0,
          path: g.path,
          savedName: g.name
        });
      } catch (q) {
        const R = J(q);
        return h.emit("file-cancel", {
          transferId: p,
          reason: R
        }), S(p, R), u({
          ok: !1,
          error: R
        });
      }
    }), h.on("file-in-cancel", c => {
      const u = String((c == null ? void 0 : c.transferId) || ""),
        p = E(u);
      !p || !K(p) || S(u, String((c == null ? void 0 : c.reason) || "对方取消了传输"));
    });
  }
  function l(h) {
    t = h, O(h);
  }
  async function v(h) {
    var q;
    const c = String((h == null ? void 0 : h.id) || "");
    if (!c || !(h != null && h.url)) return;
    const u = E(c);
    if (u && K(u) || u && u.status === "done") return;
    u && (N(c), s = s.filter(R => R.id !== c));
    const p = Math.max(0, Number(h.size) || 0),
      g = getDesktopFilesBridge();
    I({
      id: c,
      direction: "receive",
      status: "receiving",
      peerId: "",
      peerName: "Chat",
      name: h.name || "File",
      size: p,
      transferred: 0,
      path: "",
      folder: "",
      url: "",
      error: "",
      at: Date.now(),
      endedAt: 0,
      handle: "",
      source: "chat"
    });
    const w = E(c);
    if (w) try {
      if (g) {
        const T = await g.receiveOpen({
          transferId: c,
          name: w.name,
          size: p
        });
        if (!(T != null && T.ok)) throw Error((T == null ? void 0 : T.error) || "文件没存上");
        w.folder = T.folder || "";
      } else o.set(c, []);
      if (!(await kt({
        url: h.url,
        timeoutMs: ct(p),
        onStart: ({
          declared: T
        }) => {
          T && (w.size = T);
        },
        onChunk: async T => {
          var W;
          if (g) {
            const j = await g.receiveWrite(c, T);
            if (!(j != null && j.ok)) throw Error((j == null ? void 0 : j.error) || "写不进收文件的文件夹");
            w.transferred = Number(j.written) || w.transferred + T.length;
          } else (W = o.get(c)) == null || W.push(T), w.transferred += T.length;
          y(), B();
        }
      })).received) throw Error("下载到的是空的，再试一次");
      if (g) {
        const T = await g.receiveEnd(c);
        if (!(T != null && T.ok)) throw Error((T == null ? void 0 : T.error) || "文件没存上");
        w.status = "done", w.transferred = w.size, w.endedAt = Date.now(), w.path = T.path || "", w.folder = T.folder || w.folder, w.name = T.savedName || w.name, A(), B(), L();
        return;
      }
      w.url = F(c, w.name, o.get(c) || []), o.delete(c), w.status = "done", w.transferred = w.size, w.endedAt = Date.now(), A(), B(), L();
    } catch (R) {
      const T = J(R);
      g && ((q = getDesktopFilesBridge()) == null || q.receiveCancel(c).catch(() => {})), N(c), P(c, T), n.notify(`Download failed: ${T}`);
    }
  }
  return {
    lookup: b,
    async localImage(h) {
      const c = b(h),
        u = getDesktopFilesBridge();
      if (c != null && c.url) return (await fetch(c.url)).blob();
      if (!(c != null && c.path) || !u) throw Error("这台电脑没有该图片，请让对方重新发送");
      const p = await u.sendOpen(c.path);
      try {
        if (p.size > 20 * 1024 * 1024) throw Error("图片较大，请打开本地文件查看");
        const g = [];
        for (let w = 0; w < p.size; w += oe) {
          const q = Math.min(oe, p.size - w),
            R = await Ae(await u.sendRead(p.id, w, q));
          if (R.byteLength !== q) throw Error("本地图片读取不完整，请确认文件未被移动或修改");
          g.push(R);
        }
        return new Blob(g);
      } finally {
        await u.sendClose(p.id);
      }
    },
    async fileAction(h, c) {
      const u = b(h),
        p = getDesktopFilesBridge();
      if ((u == null ? void 0 : u.status) !== "done") throw Error("文件尚未保存到这台电脑");
      if (u.url && c === "open") {
        window.open(u.url, "_blank", "noopener");
        return;
      }
      if (!p || !u.path) throw Error("打开文件夹需要桌面客户端");
      const g = await p.sendOpen(u.path);
      if (await p.sendClose(g.id), !(await (c === "reveal" ? p.reveal(u.path) : p.open(u.path)))) throw Error("无法打开，请确认文件仍在原位置");
    },
    attach: l,
    sendFiles: k.sendFiles,
    downloadAttachment: v,
    subscribe(h) {
      return i.add(h), () => {
        i.delete(h);
      };
    },
    snapshot: () => r,
    dockRows: (h = Date.now()) => at(s, h),
    open(h) {
      var u;
      const c = E(h);
      if (c) {
        if (c.url) {
          window.open(c.url, "_blank", "noopener");
          return;
        }
        c.path && ((u = getDesktopFilesBridge()) == null || u.open(c.path).catch(() => {}));
      }
    },
    reveal(h) {
      var u, p;
      const c = E(h);
      c && (c.path ? (u = getDesktopFilesBridge()) == null || u.reveal(c.path).catch(() => {}) : c.folder && ((p = getDesktopFilesBridge()) == null || p.openFolder(c.folder).catch(() => {})));
    },
    cancel(h) {
      const c = E(h);
      !c || !K(c) || (t == null || t.emit("file-cancel", {
        transferId: h,
        reason: "Cancelled"
      }), S(h, "Cancelled"));
    },
    dismiss(h) {
      const c = E(h);
      c && (K(c) && (t == null || t.emit("file-cancel", {
        transferId: h,
        reason: "Cancelled"
      }), S(h, "Cancelled")), s = s.filter(u => u.id !== h), N(h), A());
    },
    dismissAll() {
      var h;
      for (const c of s) K(c) && (t == null || t.emit("file-cancel", {
        transferId: c.id,
        reason: "Cancelled"
      }));
      for (const c of s) N(c.id);
      s = [], A(), m = -2, (h = getDesktopFilesBridge()) == null || h.progress(-1).catch(() => {});
    }
  };
}

export { createTransferManager };
