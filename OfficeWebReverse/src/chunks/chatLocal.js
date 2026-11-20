(function() {
  const r = document.createElement("link").relList;
  if (r && r.supports && r.supports("modulepreload")) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) s(n);
  new MutationObserver(n => {
    for (const o of n)
      if (o.type === "childList")
        for (const a of o.addedNodes) a.tagName === "LINK" && a.rel === "modulepreload" && s(a)
  }).observe(document, {
    childList: !0,
    subtree: !0
  });

  function t(n) {
    const o = {};
    return n.integrity && (o.integrity = n.integrity), n.referrerPolicy && (o.referrerPolicy = n.referrerPolicy), n.crossOrigin === "use-credentials" ? o.credentials = "include" : n.crossOrigin === "anonymous" ? o.credentials = "omit" : o.credentials = "same-origin", o
  }

  function s(n) {
    if (n.ep) return;
    n.ep = !0;
    const o = t(n);
    fetch(n.href, o)
  }
})();
const P = 256 * 1024,
  z = 4,
  C = 512 * 1024 * 1024,
  N = 200,
  B = 8e3,
  $ = 6;

function _(e) {
  const r = Math.max(0, Number(e) || 0);
  return Math.min(6 * 60 * 60 * 1e3, Math.max(12e4, Math.ceil(r / (64 * 1024)) * 1e3))
}

function w(e) {
  return e.status === "sending" || e.status === "receiving"
}
async function R(e) {
  if (!e) return new Uint8Array(0);
  if (e instanceof Uint8Array) return e;
  if (e instanceof ArrayBuffer) return new Uint8Array(e);
  if (ArrayBuffer.isView(e)) {
    const t = e;
    return new Uint8Array(t.buffer, t.byteOffset, t.byteLength)
  }
  if (typeof Blob < "u" && e instanceof Blob) return new Uint8Array(await e.arrayBuffer());
  const r = e;
  return r.type === "Buffer" && Array.isArray(r.data) ? Uint8Array.from(r.data) : new Uint8Array(0)
}

function U(e) {
  if (!e) return -1;
  if (e instanceof ArrayBuffer || ArrayBuffer.isView(e)) return e.byteLength;
  if (typeof Blob < "u" && e instanceof Blob) return e.size;
  const r = e;
  return r.type === "Buffer" && Array.isArray(r.data) ? r.data.length : -1
}

function j(e) {
  var r;
  return e ? e instanceof ArrayBuffer ? "ArrayBuffer" : ArrayBuffer.isView(e) ? ((r = e.constructor) == null ? void 0 : r.name) || "TypedArray" : typeof Blob < "u" && e instanceof Blob ? "Blob" : typeof e : String(e)
}

function x(e) {
  return e.size ? Math.max(0, Math.min(1, e.transferred / e.size)) : 0
}

function m(e) {
  const r = Math.max(0, Number(e) || 0);
  if (r < 1024) return `${Math.round(r)} B`;
  const t = ["KB", "MB", "GB", "TB"];
  let s = -1,
    n = r;
  do n /= 1024, s += 1; while (n >= 1024 && s < t.length - 1);
  return `${n>=10?Math.round(n):n.toFixed(1)} ${t[s]}`
}

function D(e) {
  const r = `${m(e.size)}`;
  if (e.status === "failed") return e.error || "传输中断了";
  if (e.status === "cancelled") return "已取消";
  if (e.status === "done") return e.direction === "send" ? `${r} · 已送达` : e.folder ? `${r} · 存到了 ${e.folder}` : `${r} · 已下载`;
  const t = `${m(e.transferred)} / ${r}`;
  return e.status === "receiving" ? `接收中 · ${t}` : `发送中 · ${t}`
}

function F(e) {
  const r = e instanceof Error ? e.message : typeof e == "string" ? e : "",
    t = /^Error invoking remote method '[^']*':\s*(?:Error:\s*)?([\s\S]*)$/.exec(r.trim());
  return ((t ? t[1] : r) || "").trim() || "没成功"
}

function k(e, r = Date.now()) {
  return e.filter(t => w(t) || t.status !== "cancelled" && r - (t.endedAt || t.at) < B).slice(0, 8).map(t => ({
    id: t.id,
    name: t.name,
    percent: t.status === "done" ? 1 : x(t),
    direction: t.direction,
    done: t.status === "done",
    failed: t.status === "failed"
  }))
}

function q(e, r) {
  if (e === r) return !0;
  if (e.length !== r.length) return !1;
  for (let t = 0; t < e.length; t += 1) {
    const s = e[t],
      n = r[t];
    if (s.id !== n.id || s.attachmentId !== n.attachmentId || s.status !== n.status || s.transferred !== n.transferred || s.path !== n.path || s.folder !== n.folder || s.error !== n.error) return !1
  }
  return !0
}
class h extends Error {}
const M = 2 * 1024 ** 3,
  O = 256 * 1024 * 1024,
  G = 4 * 1024 * 1024;

function W(e) {
  const r = new Map,
    t = new Set;
  async function s(o) {
    const a = await e(),
      i = await new Promise((u, d) => {
        const c = a.transaction("files").objectStore("files").get(o.id);
        c.onsuccess = () => u(c.result), c.onerror = () => d(c.error)
      });
    if (i) return i;
    if (t.has(o.id)) throw new h("服务器上的已经过期，这台电脑上也没有存");
    const f = await fetch(`/api/chat/files/${encodeURIComponent(o.id)}`, {
      credentials: "same-origin",
      signal: AbortSignal.timeout(_(o.size))
    });
    if (f.status === 404 || f.status === 410) throw t.add(o.id), new h("服务器上的已经过期，这台电脑上也没有存");
    if (!f.ok) throw Error("文件没收到，再试一次");
    const l = await f.blob();
    if (l.size !== o.size) throw new h("文件没收完整，可能损坏了");
    return l.size > O || await new Promise((u, d) => {
      const c = a.transaction("files", "readwrite");
      c.objectStore("files").put(l, o.id), c.oncomplete = () => u(), c.onabort = () => d(Error("文件没存上，检查一下空间够不够")), c.onerror = () => d(Error("文件没存上，检查一下空间够不够"))
    }), l
  }
  const n = o => {
    const a = r.get(o.id);
    if (a) return a;
    const i = s(o).finally(() => r.delete(o.id));
    return r.set(o.id, i), i
  };
  return n.isGone = o => t.has(o), n
}
async function Y(e, r, t, s) {
  if (r.size < 0 || r.size > M) throw Error("每个文件要在 0 字节到 2 GB 之间");
  if (r.name.length > 200) throw Error("文件名不能超过 200 个字");
  const n = crypto.randomUUID();
  let o = 0;
  if (r.size === 0) {
    if (!e.connected) throw Error("连接断了，再发一次");
    const a = await e.timeout(15e3).emitWithAck("chat-file", {
      requestId: n,
      name: r.name,
      size: 0,
      offset: 0,
      bytes: new ArrayBuffer(0),
      recipientId: s
    });
    if (!(a != null && a.ok)) throw Error((a == null ? void 0 : a.error) || "文件没发出去");
    if (!a.message) throw Error("服务器还没确认文件存好了");
    return t(100), a.message
  }
  for (; o < r.size;) {
    const a = await r.slice(o, o + 131072).arrayBuffer();
    let i;
    for (let f = 0; f < 2; f++) {
      if (!e.connected) throw Error("连接断了，再发一次");
      try {
        i = await e.timeout(15e3).emitWithAck("chat-file", {
          requestId: n,
          name: r.name,
          size: r.size,
          offset: o,
          bytes: a,
          recipientId: s
        });
        break
      } catch {
        if (f === 1) throw Error("没收到送达确认，先看看聊天里有没有再重发")
      }
    }
    if (!(i != null && i.ok)) throw Error((i == null ? void 0 : i.error) || "文件没发出去");
    if (i.message) return t(100), i.message;
    if (i.offset <= o || i.offset > r.size) throw Error("传输进度不对");
    o = i.offset, t(Math.floor(o / r.size * 100))
  }
  throw Error("服务器还没确认文件存好了")
}
const K = ["happy", "busy", "sleepy", "focused", "wave", "away"],
  H = [{
    id: "kraft",
    label: "原色",
    hex: "#d9a441"
  }, {
    id: "ink",
    label: "墨黑",
    hex: "#3a3a3e",
    accentHex: "#141416"
  }, {
    id: "snow",
    label: "雪白",
    hex: "#f2efe6",
    accentHex: "#43434a"
  }, {
    id: "sage",
    label: "鼠尾草绿",
    hex: "#9db08a"
  }, {
    id: "sky",
    label: "天蓝",
    hex: "#8fb6d9"
  }, {
    id: "mint",
    label: "薄荷",
    hex: "#8ed0b4"
  }, {
    id: "rose",
    label: "玫瑰",
    hex: "#e0a0a8"
  }, {
    id: "lilac",
    label: "丁香紫",
    hex: "#b3a3d9"
  }, {
    id: "navy",
    label: "藏青",
    hex: "#3f5680"
  }, {
    id: "rust",
    label: "陶土",
    hex: "#c1613f"
  }],
  b = new Map(H.map(e => [e.id, e])),
  y = {
    glasses: [{
      id: "none",
      label: "不戴",
      mesh: ""
    }, {
      id: "black",
      label: "黑框眼镜",
      mesh: "Glasses"
    }],
    beard: [{
      id: "none",
      label: "不留",
      mesh: ""
    }, {
      id: "mustache",
      label: "小胡子",
      mesh: "Beard_Mustache"
    }, {
      id: "goatee",
      label: "山羊胡",
      mesh: "Beard_Goatee"
    }, {
      id: "full",
      label: "络腮胡",
      mesh: "Beard_Full"
    }, {
      id: "longwhite",
      label: "白长须",
      mesh: "Beard_LongWhite"
    }, {
      id: "handlebar",
      label: "八字胡",
      mesh: "Beard_Handlebar"
    }, {
      id: "squared",
      label: "方胡子",
      mesh: "Beard_Squared"
    }],
    hair: [{
      id: "none",
      label: "光头",
      mesh: ""
    }, {
      id: "short",
      label: "短发",
      mesh: "Hair_Short"
    }, {
      id: "bangs",
      label: "刘海",
      mesh: "Hair_Bangs"
    }, {
      id: "afro",
      label: "爆炸头",
      mesh: "Hair_Afro"
    }, {
      id: "long",
      label: "长直发",
      mesh: "Hair_Long"
    }, {
      id: "bob",
      label: "波波头",
      mesh: "Hair_Bob"
    }, {
      id: "twintails",
      label: "双马尾",
      mesh: "Hair_TwinTails"
    }],
    hat: [{
      id: "none",
      label: "不戴",
      mesh: ""
    }, {
      id: "cap",
      label: "棒球帽",
      mesh: "Hat_Cap"
    }, {
      id: "tophat",
      label: "礼帽",
      mesh: "Hat_TopHat"
    }, {
      id: "beanie",
      label: "毛线帽",
      mesh: "Hat_Beanie"
    }, {
      id: "straw",
      label: "草帽",
      mesh: "Hat_Straw"
    }, {
      id: "party",
      label: "派对帽",
      mesh: "Hat_Party"
    }, {
      id: "beret",
      label: "贝雷帽",
      mesh: "Hat_Beret"
    }]
  },
  g = ["glasses", "hair", "beard", "hat"],
  X = {
    glasses: "眼镜",
    hair: "发型",
    beard: "胡子",
    hat: "帽子"
  },
  A = {
    color: "kraft",
    accessories: {
      glasses: "none",
      beard: "none",
      hair: "none",
      hat: "none"
    }
  };

function E(e) {
  return b.get(e ?? "") ?? b.get(A.color)
}

function V(e) {
  return E(e).hex
}

function T(e, r) {
  const t = y[e];
  return t.find(s => s.id === r) ?? t[0]
}

function I(e) {
  return T(e, A.accessories[e]).id
}

function p(e) {
  const r = e && typeof e == "object" ? e : {},
    t = r.accessories && typeof r.accessories == "object" ? r.accessories : {},
    s = {};
  for (const n of g) {
    const o = String(t[n] ?? "");
    s[n] = y[n].some(a => a.id === o) ? o : I(n)
  }
  return {
    color: E(String(r.color ?? "")).id,
    accessories: s
  }
}

function J(e) {
  return [e.color, ...g.map(t => e.accessories[t])].join("|")
}
const S = "office-appearance";

function Q() {
  try {
    return p(JSON.parse(localStorage.getItem(S) ?? "null"))
  } catch {
    return p(null)
  }
}

function Z(e) {
  try {
    localStorage.setItem(S, JSON.stringify(e))
  } catch {}
}

function v(e) {
  return new Promise((r, t) => {
    const s = indexedDB.open(`office-chat-${e}`, 2);
    s.onupgradeneeded = () => {
      s.result.objectStoreNames.contains("messages") || s.result.createObjectStore("messages", {
        keyPath: "id"
      }), s.result.objectStoreNames.contains("meta") || s.result.createObjectStore("meta"), s.result.createObjectStore("files")
    }, s.onsuccess = () => {
      s.result.onversionchange = () => s.result.close(), r(s.result)
    }, s.onerror = () => t(s.error), s.onblocked = () => t(Error("Another page is using local storage"))
  })
}

function ee(e) {
  return new Promise((r, t) => {
    const s = e.transaction(["messages", "meta"], "readonly"),
      n = s.objectStore("messages").getAll(),
      o = s.objectStore("meta").get("cursor");
    s.oncomplete = () => r({
      messages: n.result,
      cursor: o.result || ""
    }), s.onabort = () => t(s.error), s.onerror = () => t(s.error)
  })
}

function re(e, r, t) {
  return new Promise((s, n) => {
    const o = e.transaction(["messages", "meta"], "readwrite");
    for (const a of r) L(e.name.slice(12), a) && o.objectStore("messages").put(a);
    t !== void 0 && o.objectStore("meta").put(t, "cursor"), o.oncomplete = () => s(), o.onabort = () => n(o.error), o.onerror = () => n(o.error)
  })
}

function te(e, r) {
  const t = new Map(e.map(s => [s.id, s]));
  for (const s of r) t.set(s.id, s);
  return [...t.values()].sort((s, n) => s.id.localeCompare(n.id))
}

function L(e, r) {
  var t;
  try {
    const s = JSON.parse(localStorage.getItem(`office-chat-local:${e}`) || "{}"),
      n = r.recipientId ? r.senderId === e ? r.recipientId : r.senderId || "" : "public";
    return r.time > (((t = s[n]) == null ? void 0 : t.deletedThrough) ?? -1)
  } catch {
    return !0
  }
}
export {
  h as A, C as B, P as C, A as D, K as E, N as F, M, G as P, g as S, z as W, J as a, _ as b, V as c, k as d, Q as e, W as f, ee as g, re as h, F as i, w as j, $ as k, L as l, te as m, m as n, v as o, U as p, j as q, p as r, D as s, R as t, Y as u, q as v, Z as w, H as x, y, X as z
};