import { outgoingTransfers as hi, incomingTransfers as jn } from './hostFileState.js';
import { P as st, S as id } from '../chunks/dockGreeting.js';
import { A as ir, b as Uo, d as Xc } from '../chunks/chatLocal.js';

import { conversationOfMessage as Wn } from './chatConversation.js';

function wl(i) {
  const {
    messages: e,
    contacts: t,
    people: n,
    seats: s,
    accountId: r,
    read: a,
    visitor: o,
    hidden: c
  } = i, d = new Map;
  for (const h of t) h.id !== r && d.set(h.id, h.name);
  for (const h of n) h.clientId !== r && d.set(h.clientId, h.name);
  for (const h of s) h && h.id !== r && d.set(h.id, h.name);
  for (const h of e) {
    const m = Wn(h, r);
    if (m === st || !m || d.has(m)) continue;
    const f = t.find(p => p.id === m);
    d.set(m, (f == null ? void 0 : f.name) || (h.senderId === r ? h.recipientName || "同事" : h.name))
  }
  const l = [...o ? [] : [{
      id: st,
      name: "iruler"
    }], ...[...d].map(([h, m]) => ({
      id: h,
      name: m
    }))].filter(h => !c.includes(h.id)),
    u = new Map;
  for (const h of e) {
    const m = Wn(h, r);
    u.has(m) || u.set(m, []), u.get(m).push(h)
  }
  return l.map(h => {
    const m = u.get(h.id) || [],
      f = m.at(-1);
    return {
      ...h,
      history: m,
      at: (f == null ? void 0 : f.time) || 0,
      lastFrom: f == null ? void 0 : f.senderId,
      lastName: f == null ? void 0 : f.name,
      last: f ? (f.attachment ? `[文件] ${f.attachment.name}` : f.text).replace(/\s+/g, " ").slice(0, 120) : "",
      online: h.id === st || n.some(p => p.clientId === h.id),
      unread: m.filter(p => p.senderId !== r && p.id > (a[h.id] || "")).length
    }
  }).sort((h, m) => h.id === st ? -1 : m.id === st ? 1 : m.at - h.at || h.name.localeCompare(m.name, "zh"))
};

async function Op(i) {
  const e = await fetch(`/api/chat/files/${encodeURIComponent(i.id)}`, {
    credentials: "same-origin",
    signal: AbortSignal.timeout(Uo(i.size))
  });
  if (e.status === 404 || e.status === 410) throw new ir("服务器上的已经过期，这台电脑上也没有存");
  if (!e.ok) throw Error("文件没收到，再试一次");
  const t = await e.blob();
  if (t.size !== i.size) throw new ir("文件没收完整，可能损坏了");
  return t
};

async function Dp(i) {
  var r;
  const e = hi.get(i.id);
  if ((e == null ? void 0 : e.status) === "done") return e;
  const t = jn.get(i.id);
  if (t) return t;
  const n = (r = window.officeDesktop) == null ? void 0 : r.files;
  if (!n) throw Error("收文件需要桌面客户端");
  const s = (async () => {
    const a = await n.receiveOpen({
      transferId: i.id,
      name: i.name,
      size: i.size
    });
    if (!(a != null && a.ok)) throw Error((a == null ? void 0 : a.error) || "文件没存上");
    const o = await fetch(i.url, {
      credentials: "same-origin",
      signal: AbortSignal.timeout(Uo(i.size))
    });
    if (o.status === 404 || o.status === 410) throw Error("服务器上的已经过期，让对方再发一次");
    if (!o.ok || !o.body) throw Error("文件没收到，再试一次");
    const c = o.body.getReader();
    try {
      for (;;) {
        const {
          done: u,
          value: h
        } = await c.read();
        if (u) break;
        const m = await n.receiveWrite(i.id, h);
        if (!(m != null && m.ok)) throw Error((m == null ? void 0 : m.error) || "写不进收文件的文件夹")
      }
      const d = await n.receiveEnd(i.id);
      if (!(d != null && d.ok)) throw Error((d == null ? void 0 : d.error) || "文件没存上");
      const l = {
        id: i.id,
        direction: "receive",
        status: "done",
        peerId: "",
        peerName: "Chat",
        name: d.savedName || i.name,
        size: i.size,
        transferred: i.size,
        path: d.path || "",
        folder: d.folder || a.folder || "",
        url: "",
        error: "",
        at: Date.now(),
        endedAt: Date.now(),
        handle: "",
        source: "chat"
      };
      return hi.set(i.id, l), l
    } catch (d) {
      throw n.receiveCancel(i.id).catch(() => {}), d
    }
  })();
  jn.set(i.id, s);
  try {
    return await s
  } finally {
    jn.delete(i.id)
  }
};

function Lp(i, e) {
  const t = (i == null ? void 0 : i.files.transfers) ?? [],
    n = r => t.find(a => a.id === r || a.attachmentId === r),
    s = r => void e(r);
  return {
    rows: t,
    lookup: r => hi.get(r) ?? n(r),
    localImage: async r => {
      var d;
      const a = hi.get(r) ?? n(r);
      if (a != null && a.url) return (await fetch(a.url)).blob();
      if (!(a != null && a.path)) throw Error("这台电脑没有该图片，请让对方重新发送");
      const o = (d = window.officeDesktop) == null ? void 0 : d.files;
      if (!o) throw Error("这台电脑没有该图片，请让对方重新发送");
      const c = await o.sendOpen(a.path);
      try {
        if (c.size > 20 * 1024 * 1024) throw Error("图片较大，请打开本地文件查看");
        const l = [];
        for (let u = 0; u < c.size; u += 256 * 1024) {
          const h = Math.min(262144, c.size - u),
            m = await o.sendRead(c.id, u, h);
          if (!m || m.byteLength !== h) throw Error("本地图片读取不完整，请确认文件未被移动或修改");
          l.push(m)
        }
        return new Blob(l)
      } finally {
        await o.sendClose(c.id).catch(() => {})
      }
    },
    fileAction: async (r, a) => {
      var d;
      const o = hi.get(r);
      if (o != null && o.path) {
        const l = (d = window.officeDesktop) == null ? void 0 : d.files;
        if (!l) throw Error("打开文件需要桌面客户端");
        if (!await (a === "reveal" ? l.reveal(o.path) : l.open(o.path))) throw Error("无法打开，请确认文件仍在原位置");
        return
      }
      const c = await e({
        kind: a === "open" ? "file-open" : "file-reveal",
        id: r
      });
      if (c.ok === !1) throw Error(c.error || "打不开文件")
    },
    attach: () => {},
    sendFiles: async (r, a, o = "") => {
      const c = await e({
        kind: "file-send",
        personId: r,
        paths: a,
        peerName: o
      });
      if (c.ok === !1) throw Error(c.error || "文件没发出去")
    },
    downloadAttachment: async r => {
      await Dp(r)
    },
    open: r => s({
      kind: "file-open",
      id: r
    }),
    reveal: r => s({
      kind: "file-reveal",
      id: r
    }),
    cancel: r => s({
      kind: "file-cancel",
      id: r
    }),
    dismiss: r => s({
      kind: "file-dismiss",
      id: r
    }),
    dismissAll: () => s({
      kind: "file-dismiss-all"
    }),
    dockRows: () => Xc(t, Date.now())
  }
};

export { Dp, Lp, Op, wl };
