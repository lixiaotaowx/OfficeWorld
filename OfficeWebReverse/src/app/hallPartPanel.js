// Hall part panel: the notes/cinema board & screen content manager (Do), its
// thumbnail painter (To), palette (D2) and frame helpers (ut/ko/Lo/Ro/Fo/Xs).
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { definePrivate as m } from './hallPrelude.js';
import { X0 } from './hallCatalog.js';
import { d2 } from './hallParts.js';
import { b5 as f9, S as oe, i as k9, M as K, g as Ie, br as b3 } from '../chunks/portraitLighting.js';
import { T1 } from './hallMaterials.js';

function ut(r) {
  var i, n, o;
  let e;
  try {
    e = new URL(r)
  } catch {
    return null
  }
  if (!["https:", "http:"].includes(e.protocol) || e.username || e.password || e.port) return null;
  const t = e.hostname.toLowerCase();
  if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(t) || t === "youtu.be") {
    const a = t === "youtu.be" ? (i = e.pathname.match(/^\/([\w-]{11})\/?$/)) == null ? void 0 : i[1] : e.pathname === "/watch" ? e.searchParams.get("v") : (n = e.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})\/?$/)) == null ? void 0 : n[1];
    return !a || !/^[\w-]{11}$/.test(a) ? {
      platform: "YouTube",
      message: "要用某一个 YouTube 视频的链接"
    } : {
      platform: "YouTube",
      embed: `https://www.youtube-nocookie.com/embed/${a}?autoplay=0`
    }
  }
  if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(t)) {
    const a = (o = e.pathname.match(/^\/(?:video\/)?(\d{1,12})\/?$/)) == null ? void 0 : o[1];
    return a ? {
      platform: "Vimeo",
      embed: `https://player.vimeo.com/video/${a}?autoplay=0`
    } : {
      platform: "Vimeo",
      message: "要用某一个 Vimeo 视频的链接"
    }
  }
  return null
}
const D2 = ["#f6e27a", "#bfe3d6", "#f4c7b8", "#d9d2f2"],
  ko = r => {
    try {
      return new URL(r).host.replace(/^www\./, "")
    } catch {
      return ""
    }
  };

function To(r, e = 256, t = 192, s) {
  const i = document.createElement("canvas");
  i.width = e, i.height = t;
  const n = i.getContext("2d"),
    o = (l, A = 500) => `${A} ${Math.round(l)}px "Microsoft YaHei","PingFang SC",sans-serif`,
    a = (l, A, c, h, u, d) => {
      let g = "",
        p = c,
        I = 0;
      for (const C of l)
        if (n.measureText(g + C).width > h && g) {
          if (n.fillText(I === d - 1 ? g.slice(0, -1) + "…" : g, A, p), ++I >= d) return;
          g = C, p += u
        } else g += C;
      n.fillText(g, A, p)
    };
  if (r.type === "image") {
    if (n.fillStyle = "#2a2f33", n.fillRect(0, 0, e, t), s != null && s.complete && s.naturalWidth) {
      const l = Math.max(e / s.naturalWidth, t / s.naturalHeight),
        A = s.naturalWidth * l,
        c = s.naturalHeight * l;
      n.drawImage(s, (e - A) / 2, (t - c) / 2, A, c)
    }
  } else if (r.type === "note") {
    let l = 0;
    for (const A of r.id) l = (l + A.charCodeAt(0)) % D2.length;
    n.fillStyle = D2[l], n.fillRect(0, 0, e, t), n.fillStyle = "#3b3410", n.font = o(t / 7.5, 600), a(r.title, e * .09, t * .22, e * .82, t / 6.5, 2), n.font = o(t / 10, 400), n.fillStyle = "rgba(59,52,16,.75)", a(r.value, e * .09, t * .6, e * .82, t / 8, 3)
  } else {
    const l = ut(r.value);
    if (l) {
      const A = n.createLinearGradient(0, 0, e, t);
      A.addColorStop(0, "#22313a"), A.addColorStop(1, "#b8573a"), n.fillStyle = A, n.fillRect(0, 0, e, t), n.fillStyle = "rgba(255,255,255,.9)", n.beginPath(), n.moveTo(e / 2 - t * .09, t * .38), n.lineTo(e / 2 + t * .12, t * .5), n.lineTo(e / 2 - t * .09, t * .62), n.fill()
    } else n.fillStyle = "#f2f0ea", n.fillRect(0, 0, e, t), n.fillStyle = "#1c2321", n.font = `700 ${Math.round(t/3.4)}px Georgia,serif`, n.fillText("Aa", e * .09, t * .42);
    n.fillStyle = l ? "#fff" : "#1c2321", n.font = o(t / 9.5, 600), a(r.title, e * .09, t * (l ? .82 : .66), e * .82, t / 8, 1), n.fillStyle = l ? "rgba(255,255,255,.75)" : "#5d6a66", n.font = o(t / 12, 400), n.fillText((l == null ? void 0 : l.platform) || ko(r.value), e * .09, t * .92)
  }
  return i
}
class Do {
  constructor(e, t) {
    m(this, "boards", new Map);
    m(this, "screens", new Map);
    m(this, "placeholder", null);
    m(this, "revision", -1);
    m(this, "listening", null);
    this.readContents = e, this.readScreen = t
  }
  sync(e, t) {
    var i, n;
    const s = t !== this.revision;
    this.revision = t;
    for (const [o, a] of this.boards) {
      const l = e.get(o);
      (l !== a.root || !((i = X0(l.userData.part.kind)) != null && i.notes)) && (this.disposeBoard(a), this.boards.delete(o))
    }
    for (const [o, a] of this.screens) {
      const l = e.get(o);
      (l !== a.root || !((n = X0(l.userData.part.kind)) != null && n.cinema)) && (this.disposeScreen(a), this.screens.delete(o))
    }
    for (const [o, a] of e) {
      const l = a.userData.part,
        A = X0(l.kind);
      if (A != null && A.notes) {
        let c = this.boards.get(o);
        if (!c || c.root !== a) {
          const h = d2(A.notes.size[0], A.notes.size[1]);
          h.material.visible = !1, h.position.set(A.notes.at[0], A.notes.at[1], A.notes.at[2]), h.userData.display = {
            label: A.label,
            size: A.notes.size
          }, h.userData.livePart = o, a.add(h), c = {
            root: a,
            panel: h,
            notes: [],
            entries: [],
            key: ""
          }, this.boards.set(o, c)
        }(s || !c.key) && this.loadBoard(o)
      }
      if (A != null && A.cinema) {
        let c = this.screens.get(o);
        if (!c || c.root !== a) {
          const {
            canvas: u,
            texture: d
          } = this.emptyScreen(), g = d2(A.cinema.size[0], A.cinema.size[1], d);
          g.position.set(A.cinema.at[0], A.cinema.at[1], A.cinema.at[2]), g.userData.display = {
            label: A.label,
            size: A.cinema.size
          }, g.userData.livePart = o, a.add(g), c = {
            root: a,
            plane: g,
            canvas: u,
            texture: d,
            version: -1,
            content: null
          }, this.screens.set(o, c)
        }
        const h = l.cinemaVersion || 0;
        h !== c.version && (c.version = h, this.loadScreen(o))
      }
    }
    this.screens.size || this.releasePlaceholder()
  }
  refreshBoard(e) {
    return this.loadBoard(e)
  }
  refreshScreen(e) {
    return this.loadScreen(e)
  }
  async loadBoard(e) {
    const t = this.boards.get(e);
    if (!t) return;
    let s;
    try {
      ({
        entries: s
      } = await this.readContents(e))
    } catch {
      return
    }
    if (this.boards.get(e) !== t) return;
    const i = s.map(h => h.id).join();
    if (i === t.key && t.notes.length) return;
    t.key = i, t.entries = s, this.clearNotes(t);
    const n = X0(t.root.userData.part.kind).notes,
      [o, a] = n.size,
      l = 4,
      A = Math.min(.4, o / l - .03),
      c = A * .75;
    s.slice(-8).forEach((h, u) => {
      const d = u % l,
        g = Math.floor(u / l),
        p = x => To(h, 256, 192, x),
        I = new f9(p());
      I.colorSpace = oe;
      const C = new k9(A, c);
      C.translate(0, -c / 2, 0);
      const E = new K(C, T1(new Ie({
        map: I,
        roughness: .95
      })));
      if (E.material.polygonOffsetUnits = -4 - u, E.position.set(n.at[0] - o / 2 + (d + .5) * (o / l), n.at[1] + a / 2 - .06 - g * (c + .1), n.at[2] + .004 + u * .002), E.rotation.z = (u * 37 % 7 - 3) * .015, E.userData.nohit = !0, E.userData.entry = h, E.userData.livePart = e, E.userData.display = {
          label: h.title,
          size: [A, c]
        }, t.root.add(E), t.notes.push(E), h.type === "image") {
        const x = new Image;
        x.onload = () => {
          this.boards.get(e) !== t || !t.notes.includes(E) || (I.image = p(x), I.needsUpdate = !0)
        }, x.src = h.value
      }
    })
  }
  entriesOf(e) {
    var t;
    return ((t = this.boards.get(e)) == null ? void 0 : t.entries) || []
  }
  notes() {
    return [...this.boards.values()].flatMap(e => e.notes)
  }
  async loadScreen(e) {
    const t = this.screens.get(e);
    if (!t) return;
    let s;
    try {
      ({
        content: s
      } = await this.readScreen(e))
    } catch {
      return
    }
    this.screens.get(e) === t && JSON.stringify(t.content) !== JSON.stringify(s) && (this.stopVideo(t), t.content = s, this.paint(t), t.video && (t.video.muted = this.listening !== e))
  }
  contentOf(e) {
    var t;
    return ((t = this.screens.get(e)) == null ? void 0 : t.content) || null
  }
  videoOf(e) {
    var t;
    return ((t = this.screens.get(e)) == null ? void 0 : t.video) || null
  }
  screenOf(e) {
    var t;
    return ((t = this.screens.get(e)) == null ? void 0 : t.plane) || null
  }
  get playingVideo() {
    return [...this.screens.values()].some(e => !!e.video && !e.video.paused && !e.video.ended)
  }
  stopVideo(e) {
    var t;
    e.video && ((t = e.plane.material.map) == null || t.dispose(), e.video.pause(), e.video.removeAttribute("src"), e.video.load(), e.video = void 0, e.plane.material.map = e.texture, e.plane.material.needsUpdate = !0)
  }
  emptyScreen() {
    if (this.placeholder) return this.placeholder;
    const e = document.createElement("canvas");
    e.width = 640, e.height = 360;
    const t = e.getContext("2d");
    t.fillStyle = "#15191b", t.fillRect(0, 0, e.width, e.height), t.globalAlpha = .7, t.fillStyle = "#efe6d6", t.beginPath(), t.moveTo(e.width / 2 - 22, e.height / 2 - 26), t.lineTo(e.width / 2 + 28, e.height / 2), t.lineTo(e.width / 2 - 22, e.height / 2 + 26), t.closePath(), t.fill(), t.globalAlpha = .6, t.font = '500 22px "Microsoft YaHei",sans-serif', t.textAlign = "center", t.fillText("点一下放点什么", e.width / 2, e.height / 2 + 64), t.textAlign = "start", t.globalAlpha = 1;
    const s = new f9(e);
    return s.colorSpace = oe, this.placeholder = {
      canvas: e,
      texture: s
    }
  }
  releaseScreenPicture(e) {
    var t;
    e.texture !== ((t = this.placeholder) == null ? void 0 : t.texture) && (e.texture.dispose(), e.canvas.width = e.canvas.height = 0)
  }
  releasePlaceholder() {
    this.placeholder && (this.placeholder.texture.dispose(), this.placeholder.canvas.width = this.placeholder.canvas.height = 0, this.placeholder = null)
  }
  paint(e) {
    var h;
    if (!e.content) {
      this.releaseScreenPicture(e);
      const u = this.emptyScreen();
      e.canvas = u.canvas, e.texture = u.texture, e.plane.material.map = e.texture, e.plane.material.needsUpdate = !0;
      return
    }
    if (e.texture === ((h = this.placeholder) == null ? void 0 : h.texture)) {
      const u = document.createElement("canvas");
      u.width = 640, u.height = 360;
      const d = new f9(u);
      d.colorSpace = oe, e.canvas = u, e.texture = d, e.plane.material.map = d, e.plane.material.needsUpdate = !0
    }
    const {
      canvas: t,
      texture: s
    } = e, i = t.getContext("2d"), n = e.content;
    i.fillStyle = "#15191b", i.fillRect(0, 0, t.width, t.height);
    const o = u => {
        i.globalAlpha = .7, i.fillStyle = "#efe6d6", i.beginPath(), i.moveTo(t.width / 2 - 22, t.height / 2 - 26), i.lineTo(t.width / 2 + 28, t.height / 2), i.lineTo(t.width / 2 - 22, t.height / 2 + 26), i.closePath(), i.fill(), i.globalAlpha = .6, i.font = '500 22px "Microsoft YaHei",sans-serif', i.textAlign = "center", i.fillText(u, t.width / 2, t.height / 2 + 64), i.textAlign = "start", i.globalAlpha = 1
      },
      a = (u, d, g) => {
        if (n.fit === "stretch") return g(0, 0, t.width, t.height);
        const p = (n.fit === "cover" ? Math.max : Math.min)(t.width / u, t.height / d);
        g((t.width - u * p) / 2, (t.height - d * p) / 2, u * p, d * p)
      };
    if (s.needsUpdate = !0, n.type === "image") {
      const u = new Image;
      u.crossOrigin = "anonymous", u.onload = () => {
        e.content !== n || this.screens.get(e.plane.userData.livePart) !== e || (i.fillStyle = "#15191b", i.fillRect(0, 0, t.width, t.height), a(u.naturalWidth, u.naturalHeight, (d, g, p, I) => i.drawImage(u, d, g, p, I)), s.needsUpdate = !0)
      }, u.onerror = () => {
        e.content !== n || this.screens.get(e.plane.userData.livePart) !== e || (o("图片打不开"), s.needsUpdate = !0)
      }, u.src = n.src;
      return
    }
    const l = ut(n.src);
    if (l) {
      o(l.platform);
      return
    }
    const A = document.createElement("video");
    A.src = n.src, A.muted = !0, A.loop = !0, A.playsInline = !0, A.crossOrigin = "anonymous", e.video = A, A.play().catch(() => {});
    const c = new b3(A);
    c.colorSpace = oe, e.plane.material.map = c, e.plane.material.needsUpdate = !0, o("视频")
  }
  listen(e) {
    this.listening = e;
    for (const [t, s] of this.screens) s.video && (s.video.muted = t !== e)
  }
  clearNotes(e) {
    var t;
    for (const s of e.notes) {
      e.root.remove(s), s.geometry.dispose();
      const i = s.material;
      (t = i.map) == null || t.dispose(), i.dispose()
    }
    e.notes = []
  }
  disposeBoard(e) {
    this.clearNotes(e), e.root.remove(e.panel), e.panel.geometry.dispose(), e.panel.material.dispose()
  }
  disposeScreen(e) {
    this.stopVideo(e), e.content = null, e.root.remove(e.plane), e.plane.geometry.dispose(), e.plane.material.dispose(), this.releaseScreenPicture(e)
  }
  dispose() {
    for (const e of this.boards.values()) this.disposeBoard(e);
    this.boards.clear();
    for (const e of this.screens.values()) this.disposeScreen(e);
    this.screens.clear(), this.releasePlaceholder()
  }
}

function Lo(r) {
  return /^data:image\//.test(r) ? "image" : /^\/api\/build\?cinemaFile=/.test(r) || r.startsWith("https:") && ut(r) ? "video" : null
}

function Ro(r) {
  var t;
  const e = r.trim();
  return (((t = e.match(/https:\/\/[^\s<>"']+/)) == null ? void 0 : t[0]) || e).replace(/[)\]]+$/, "")
}
async function Fo(r, e) {
  const t = Lo(r);
  if (t) return t;
  let s;
  try {
    s = new URL(r)
  } catch {
    throw Error("粘贴完整的链接")
  }
  if (s.protocol !== "https:" || s.username || s.password) throw Error("要 https 开头的图片或视频链接");
  const i = new AbortController,
    n = AbortSignal.any([e, i.signal]),
    o = a => new Promise(l => {
      const A = a === "image" ? new Image : document.createElement("video");
      let c = !1;
      const h = g => {
          c || (c = !0, clearTimeout(d), n.removeEventListener("abort", u), A.onload = null, A.onerror = null, A instanceof HTMLVideoElement ? (A.onloadedmetadata = null, A.pause(), A.removeAttribute("src"), A.load()) : A.src = "", l(g))
        },
        u = () => h(!1),
        d = setTimeout(u, 7e3);
      n.addEventListener("abort", u, {
        once: !0
      }), A.onerror = u, A instanceof HTMLVideoElement ? (A.preload = "metadata", A.onloadedmetadata = () => h(!0)) : A.onload = () => h(!0), n.aborted ? u() : A.src = s.href
    });
  try {
    const a = await Promise.any([o("image").then(l => l ? "image" : Promise.reject()), o("video").then(l => l ? "video" : Promise.reject())]);
    return e.throwIfAborted(), a
  } finally {
    i.abort()
  }
}
async function Xs(r) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(r.type) || r.size > 20 * 1024 * 1024) throw Error("选一张 20 MB 以内的 PNG、JPEG 或 WebP 图片");
  const e = await createImageBitmap(r);
  try {
    const t = Math.min(1, 1e3 / Math.max(e.width, e.height)),
      s = document.createElement("canvas");
    s.width = Math.max(1, Math.round(e.width * t)), s.height = Math.max(1, Math.round(e.height * t)), s.getContext("2d").drawImage(e, 0, 0, s.width, s.height);
    let i = s.toDataURL("image/webp", .8);
    for (let n = 0; i.length > 22e4 && n < 5; n++) s.width = Math.max(1, Math.round(s.width * .8)), s.height = Math.max(1, Math.round(s.height * .8)), s.getContext("2d").drawImage(e, 0, 0, s.width, s.height), i = s.toDataURL("image/webp", .7);
    if (i.length > 22e4) throw Error("这张图太复杂了，换一张小一点的");
    return i
  } finally {
    e.close()
  }
}


export { ut, Do, Ro, Fo, Xs };
