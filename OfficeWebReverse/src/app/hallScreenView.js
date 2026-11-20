// Hall screen/cinema interaction: camera framing for workstation screens and
// cinema mode (C6/o4), occlusion culling (y6), daylight presets (w6/B6/Ns),
// and the cinema control bar component (E6).
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { definePrivate as m } from './hallPrelude.js';
import { V as T, c as ve, b as re, ar as be, ab as De, w as f4, u as pe } from '../chunks/portraitLighting.js';

class E6 {
  constructor(e, t, s, i) {
    m(this, "element", document.createElement("div"));
    m(this, "play", document.createElement("button"));
    m(this, "mute", document.createElement("button"));
    m(this, "seek", document.createElement("input"));
    m(this, "time", document.createElement("span"));
    m(this, "hint", document.createElement("small"));
    m(this, "lastState", "");
    this.video = e, this.notice = i, this.element.className = "hall-cinema-controls", this.element.setAttribute("role", "group"), this.element.setAttribute("aria-label", "影院屏观看控制");
    const n = (o, a, l) => (o.type = "button", o.textContent = a, o.addEventListener("click", l), o);
    n(this.play, "播放", () => this.toggle()), n(this.mute, "静音", () => {
      const o = this.video();
      o && (o.muted = !o.muted), this.update()
    }), this.seek.type = "range", this.seek.min = "0", this.seek.step = "0.1", this.seek.value = "0", this.seek.setAttribute("aria-label", "视频播放进度"), this.seek.addEventListener("input", () => {
      const o = this.video();
      o && Number.isFinite(o.duration) && (o.currentTime = Number(this.seek.value))
    }), this.element.append(this.play, this.seek, this.time, this.mute, n(document.createElement("button"), "换内容", t), n(document.createElement("button"), "退出观看", s), this.hint);
    for (const o of ["pointerdown", "pointerup", "click", "dblclick", "wheel", "keydown", "keyup"]) this.element.addEventListener(o, a => {
      a.stopPropagation(), o === "keydown" && a.key === "Escape" && s()
    });
    this.update()
  }
  toggle() {
    const e = this.video();
    e && (e.paused ? e.play().catch(() => this.notice("视频暂时无法播放，请检查链接或换一个文件")) : e.pause(), this.update())
  }
  update(e = "平台视频请使用播放器内的控制") {
    var o;
    const t = this.video(),
      s = JSON.stringify([!!t, t == null ? void 0 : t.paused, t == null ? void 0 : t.muted, (o = t == null ? void 0 : t.error) == null ? void 0 : o.code, t == null ? void 0 : t.duration, Math.floor(((t == null ? void 0 : t.currentTime) || 0) * 10), e]);
    if (s === this.lastState || (this.lastState = s, this.play.hidden = this.mute.hidden = this.seek.hidden = this.time.hidden = !t, this.hint.textContent = t ? t.error ? "视频加载失败，请换一个文件或链接" : "播放控制仅影响自己" : e, !t)) return;
    this.play.textContent = t.paused ? "播放" : "暂停", this.mute.textContent = t.muted ? "开启声音" : "静音", this.mute.setAttribute("aria-pressed", String(t.muted));
    const i = Number.isFinite(t.duration) && t.duration > 0;
    this.seek.disabled = !i, this.seek.max = String(i ? t.duration : 0), this.seek.value = String(t.currentTime || 0);
    const n = a => `${Math.floor(a/60)}:${String(Math.floor(a%60)).padStart(2,"0")}`;
    this.time.textContent = `${n(t.currentTime||0)} / ${i?n(t.duration):"--:--"}`
  }
  dispose() {
    this.element.remove()
  }
}

function C6(r, e, t, s) {
  const i = e.clone().setY(0).lengthSq() > 1e-6 ? e.clone().normalize() : new T(0, 0, 1),
    [n, o] = t;
  return {
    target: r.clone(),
    normal: i,
    yaw: Math.atan2(i.x, i.z),
    pitch: Math.asin(ve.clamp(i.y, -1, 1)),
    zoom: Math.min(24, 2 * 5.8 * s * .8 / Math.max(.05, n), 2 * 5.8 * .78 / Math.max(.05, o))
  }
}

function o4(r, e, t, s, i = () => !1) {
  const n = [],
    o = Math.max(...s) * .6 + .6,
    a = new re,
    l = new T,
    A = new T;
  for (const c of r) {
    if (!c.visible || i(c) || (a.setFromObject(c), a.isEmpty())) continue;
    a.getCenter(l).sub(e);
    const h = l.dot(t);
    h <= .3 || (l.addScaledVector(t, -h), l.length() - a.getSize(A).length() / 2 < o && n.push(c))
  }
  return n
}

function y6(r, e) {
  if (!e) return .1;
  e.updateWorldMatrix(!0, !0);
  const t = new re().setFromObject(e);
  if (t.isEmpty()) return .1;
  const s = r.getWorldDirection(new T),
    i = r.getWorldPosition(new T);
  let n = 1 / 0;
  for (const o of [t.min.x, t.max.x])
    for (const a of [t.min.y, t.max.y])
      for (const l of [t.min.z, t.max.z]) n = Math.min(n, new T(o, a, l).sub(i).dot(s));
  return Math.max(.1, n - .08)
}
const w6 = {
  morning: {
    key: [-3, 11, 7],
    kc: "#fff2e1",
    ki: 3,
    hs: "#e3ecf5",
    hg: "#b1a18b",
    hi: .5,
    sky: ["#a9cde2", "#f3e7d3"],
    exp: 1,
    lamps: 0
  },
  afternoon: {
    key: [-7, 9, 6],
    kc: "#ffe3bf",
    ki: 3.2,
    hs: "#dbe7f4",
    hg: "#af987c",
    hi: .45,
    sky: ["#bcd6e6", "#f6e9d2"],
    exp: 1,
    lamps: .1
  },
  night: {
    key: [-4, 9, 5],
    kc: "#c3d3ed",
    ki: 1.1,
    hs: "#9daec9",
    hg: "#726659",
    hi: .28,
    sky: ["#121826", "#2c3b50"],
    exp: 1.05,
    lamps: 1
  }
};

function B6(r, e) {
  const s = new Uint8Array(256),
    i = new be(e),
    n = new be(r),
    o = new be;
  for (let l = 0; l < 64; l++) {
    const A = l / 63;
    o.copy(i).lerp(n, A * A * (3 - 2 * A)), s.set([Math.round(o.r * 255), Math.round(o.g * 255), Math.round(o.b * 255), 255], l * 4)
  }
  const a = new De(s, 1, 64);
  return a.colorSpace = f4, a.magFilter = a.minFilter = pe, a.needsUpdate = !0, a
}
const Ns = () => {
    const r = new Date().getHours();
    return r >= 19 || r < 6 ? "night" : r < 12 ? "morning" : "afternoon"
  },
  ue = {
    yaw: .72,
    pitch: .6,
    zoom: .6,
    target: new T(0, 1.5, 0)
  },
  I1 = (r, e) => e + Math.round((r - e) / (Math.PI * 2)) * Math.PI * 2;

export { E6, C6, o4, y6, w6, B6, Ns, ue, I1 };
