// Hall build-mode helpers: the build-selection id (w1), box-transform scaling
// (xo), the arm/dispose controller base (bo) and size/measure utilities
// (N9/P5/vo/Ks/I9/M2/bs/vs).
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { K0, X0 } from './hallCatalog.js';
import { definePrivate as m } from './hallPrelude.js';
import { b1, n1 } from './hallParts.js';
import { d as h4, b as re, V as T, a$ as Ve, bp as x3 } from '../chunks/portraitLighting.js';

const w1 = "model:__build-selection__";

function xo(r, e, t) {
  var A;
  const s = ((A = t.scale) == null ? void 0 : A[0]) || 1;
  if (r.some(c => (c.scale || [1, 1, 1]).some(h => h * s < (c.kind.startsWith("model:") ? .05 : .1) - 1e-9 || h * s > (c.kind.startsWith("model:") ? 20 : 10) + 1e-9))) throw Error("缩放超出所选零件的范围，请缩小调整幅度");
  const i = (t.rotation || 0) - (e.rotation || 0),
    n = i * K0,
    o = Math.cos(n),
    a = Math.sin(n),
    l = c => Math.round(c * 1e3) / 1e3 + 0;
  return r.map(c => ({
    ...c,
    x: l(t.x + ((c.x - e.x) * o + (c.z - e.z) * a) * s),
    y: l(t.y + (c.y - e.y) * s),
    z: l(t.z + (-(c.x - e.x) * a + (c.z - e.z) * o) * s),
    rotation: ((c.rotation + i) % 24 + 24) % 24,
    ...s === 1 ? {} : {
      scale: (c.scale || [1, 1, 1]).map(h => h * s)
    }
  }))
}
class bo {
  constructor(e, t) {
    m(this, "ids", new Set);
    m(this, "boxes", new Map);
    m(this, "originals", []);
    m(this, "drafts", []);
    m(this, "proxy", null);
    m(this, "preview", null);
    m(this, "size", [1, 1, 1]);
    this.hall = e, this.draft = t
  }
  get primary() {
    return [...this.ids].at(-1) || null
  }
  get multiple() {
    return this.ids.size > 1
  }
  select(e, t = !1) {
    if (t || this.clear(), this.ids.has(e)) {
      this.remove(e);
      return
    }
    const s = this.hall.parts.get(e);
    if (!s) return;
    this.ids.add(e), b1(s, .22);
    const i = new h4(s, "#f2c230");
    Object.assign(i.material, {
      depthTest: !1,
      transparent: !0,
      opacity: .9
    }), i.userData.nohit = !0, i.renderOrder = 998, this.hall.scene.add(i), this.boxes.set(e, i)
  }
  remove(e) {
    const t = this.hall.parts.get(e);
    t && b1(t, 0), this.ids.delete(e);
    const s = this.boxes.get(e);
    s && (this.hall.scene.remove(s), s.geometry.dispose(), s.material.dispose(), this.boxes.delete(e))
  }
  clear() {
    for (const e of this.ids) this.remove(e);
    this.reset()
  }
  reset() {
    this.originals = [], this.drafts = [], this.proxy = this.preview = null
  }
  update() {
    for (const [e, t] of this.boxes) {
      const s = this.hall.parts.get(e);
      s && (b1(s, .22), t.setFromObject(s))
    }
  }
  bounds() {
    const e = new re;
    for (const t of this.ids) {
      const s = this.hall.parts.get(t);
      s && e.expandByObject(s)
    }
    return e
  }
  capture() {
    this.originals = [...this.ids].map(this.draft), this.drafts = [];
    const e = this.bounds(),
      t = e.getCenter(new T);
    return this.size = e.getSize(new T).toArray(), this.proxy = {
      ...this.originals[0],
      id: this.primary,
      kind: w1,
      x: t.x,
      y: e.min.y,
      z: t.z,
      rotation: 0,
      pitch: 0,
      roll: 0,
      scale: [1, 1, 1]
    }, structuredClone(this.proxy)
  }
  pose(e) {
    if (!this.proxy) return;
    const t = xo(this.originals, this.proxy, e);
    for (const s of t) {
      const i = this.hall.parts.get(s.id);
      if (!i) throw Error("选中的零件已经被删除");
      const n = i.userData.part;
      n1(i, s), i.userData.part = n
    }
    this.drafts = t, this.preview = structuredClone(e), this.hall.markDirty(), this.update()
  }
}
const N9 = r => Math.round(r * 1e3) / 1e3 + 0,
  Xt = .25,
  ge = r => N9(Math.round(r / Xt) * Xt);

function P5(r) {
  const e = X0(r);
  if (e != null && e.arch) {
    const {
      outerRadius: n,
      springHeight: o,
      depth: a
    } = e.arch;
    return {
      min: [-n, 0, -a / 2],
      max: [n, o + n, a / 2]
    }
  }
  const t = [1 / 0, 1 / 0, 1 / 0],
    s = [-1 / 0, -1 / 0, -1 / 0],
    i = (n, o) => n.forEach((a, l) => {
      t[l] = Math.min(t[l], a - o[l]), s[l] = Math.max(s[l], a + o[l])
    });
  for (const [n, o, a, l, A, c] of(e == null ? void 0 : e.boxes) || []) i([l, A, c], [n / 2, o / 2, a / 2]);
  for (const [n, ...o] of(e == null ? void 0 : e.shapes) || []) {
    const [a, l, A, c, h] = o.map(Number);
    n === "cyl" ? i([A, c, h], [a, l / 2, a]) : i([l, A, c], [a, n === "disc" ? .025 : n === "cone" ? .13 : a, a])
  }
  return {
    min: t,
    max: s
  }
}

function vo(r) {
  const {
    min: e,
    max: t
  } = P5(r);
  return t.map((s, i) => Number.isFinite(s - e[i]) ? N9(s - e[i]) : 1)
}

function Ks(r, e) {
  const t = r.kind.startsWith("model:") ? {
      min: [-e[0] / 2, 0, -e[2] / 2],
      max: [e[0] / 2, e[1], e[2] / 2]
    } : P5(r.kind),
    s = r.scale || [1, 1, 1],
    i = new Ve().setFromEuler(new x3((r.pitch || 0) * K0, r.rotation * K0, (r.roll || 0) * K0, "YXZ")),
    n = [1 / 0, 1 / 0, 1 / 0];
  for (let o = 0; o < 8; o++) new T(...[0, 1, 2].map(l => (o & 1 << l ? t.max[l] : t.min[l]) * s[l])).applyQuaternion(i).toArray().forEach((l, A) => {
    n[A] = Math.min(n[A], l)
  });
  return n.map((o, a) => o + [r.x, r.y, r.z][a])
}

function I9(r, e, t = ["x", "y", "z"]) {
  const s = Ks(r, e);
  for (const i of t) {
    const n = ["x", "y", "z"].indexOf(i);
    r[i] = N9(r[i] + ge(s[n]) - s[n])
  }
}

function M2(r, e, t) {
  const s = Ks(r, t),
    i = Ks(e, t);
  ["x", "y", "z"].forEach((n, o) => {
    e[n] = N9(e[n] + s[o] - i[o])
  }), I9(e, t)
}

function bs(r, e, t, s, i) {
  const n = r.scale || [1, 1, 1];
  t = ge(t);
  const o = e.map((d, g) => d * n[g]),
    a = i ? ["x", "y", "z"].indexOf(i) : o.indexOf(Math.max(...o));
  if (!Number.isFinite(t) || o[a] <= 0) return [...n];
  const l = s ? .05 : .1,
    A = s ? 20 : 10;
  if (i && !s) {
    const d = Math.ceil((e[a] * l - 1e-9) / Xt) * Xt,
      g = Math.floor((e[a] * A + 1e-9) / Xt) * Xt,
      p = d <= g ? Math.max(d, Math.min(g, ge(o[a] + t))) : o[a],
      I = [...n];
    return I[a] = p / e[a], I
  }
  let c = ge(o[a] + t) / o[a],
    h = Math.max(...n.map(d => l / d)),
    u = Math.min(...n.map(d => A / d));
  return s && r.kind !== "model:__build-selection__" && (h = Math.max(h, ...o.map(d => .01 / d)), u = Math.min(u, ...o.map(d => 30 / d))), c = Math.max(h, Math.min(u, c)), n.map(d => Math.max(l, Math.min(A, d * c)))
}
const vs = 24,
  k2 = .25,
  T2 = r => Math.round(r / k2) * k2 + 0,
  Et = r => Math.round(r * 1e3) / 1e3 + 0,
  Wt = r => (r % vs + vs) % vs;

export { K0, X0, m, b1, n1, h4, re, T, Ve, x3, w1, xo, bo, N9, Xt, ge, P5, vo, Ks, I9, M2, bs, vs, k2, T2, Et, Wt };
