// Hall part factory: general part placement (ar) with seat search and cat
// dialog geometry, plus the character motion/gait helpers (P0..I2).
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { q3, Y3 } from './hallBilliards.js';
import { G as E0, aX as o3, aY as a3, n as qe, aZ as l3, M as K, i as k9, k as Ye, V as T, a$ as Ve, c as ve, a_ as it, b1 as u3, b2 as d3 } from '../chunks/portraitLighting.js';
import { s9, or, rr, gs, K0, X0, b5 } from './hallCatalog.js';
import { V8, D9, T1 } from './hallMaterials.js';
import { definePrivate as m } from './hallPrelude.js';

function ar(r, e) {
  if (r.id === "water") return q3(e);
  if (r.id === "billiards") return new Y3().root;
  const t = new E0;
  if (r.arch) {
    const {
      outerRadius: i,
      innerRadius: n,
      springHeight: o,
      depth: a
    } = r.arch, l = new o3;
    l.moveTo(-i, 0), l.lineTo(-i, o), l.absarc(0, o, i, Math.PI, 0, !0), l.lineTo(i, 0), l.lineTo(n, 0), l.lineTo(n, o), l.absarc(0, o, n, 0, Math.PI, !1), l.lineTo(-n, 0), l.closePath();
    const A = new a3(l, {
      depth: a,
      bevelEnabled: !1,
      curveSegments: 32,
      steps: 1
    });
    A.translate(0, 0, -a / 2);
    const c = s9(A, e, "c", !1, "paint");
    c.castShadow = c.receiveShadow = !0, t.add(c)
  }
  const s = ["desk", "table", "chair", "stool", "round-table", "sofa", "plant", "lamp"].includes(r.id);
  for (const [i, n, o, a, l, A, c] of r.boxes || []) {
    const h = or.has(r.id) ? "paint" : r.surface ?? (c === "c" && ["desk", "table"].includes(r.id) ? "wood" : null),
      u = s9(s ? V8(i, n, o) : rr, gs(c, e), c, !1, h);
    u.scale.set(i, n, o), u.position.set(a, l, A), u.castShadow = h !== "water", u.receiveShadow = !0, t.add(u)
  }
  for (const i of r.shapes || []) {
    const [n, o] = i;
    let a;
    if (n === "cyl") {
      const [, , l, A, c, h, u] = i;
      a = s9(new qe(o, o, l, 40), gs(u, e), u), a.position.set(A, c, h)
    } else {
      const [, , l, A, c, h] = i, u = n === "ball" ? new l3(o, 0) : n === "cone" ? new qe(o * .7, o, .26, 20, 1, !0) : new qe(o, o, .05, 28);
      a = s9(u, gs(h, e), h, n === "disc"), a.position.set(l, A, c)
    }
    a.castShadow = a.receiveShadow = !0, t.add(a)
  }
  return t
}

function n1(r, e) {
  r.position.set(e.x, e.y, e.z), r.rotation.set((e.pitch || 0) * K0, (e.rotation || 0) * K0, (e.roll || 0) * K0, "YXZ");
  const t = e.scale || [1, 1, 1];
  r.scale.set(t[0], t[1], t[2]), r.userData.part = e
}

function di(r) {
  const e = X0(r.kind);
  if (!e) return null;
  const t = new E0;
  return t.name = "part:" + r.id, t.add(ar(e, r.color)), n1(t, r), t
}

function Ys(r, e) {
  r.traverse(t => {
    const s = t;
    if (!s.isMesh || s.userData.token !== "c") return;
    const i = s.userData.finish;
    if (!i) {
      s.material.color.set(e);
      return
    }
    const n = b5(e, i.emissive, i.surface ?? D9(e));
    if (!s.userData.plain) {
      s.material = n;
      return
    }
    const o = s.material,
      a = o.emissive.clone(),
      l = o.emissiveIntensity;
    o.copy(n), o.emissive.copy(a), o.emissiveIntensity = l, o.userData = {}, s.userData.plain = n
  })
}

function b1(r, e, t = "#f2c230") {
  r.traverse(s => {
    const i = s;
    if (!(!i.isMesh || i.userData.nohit)) {
      if (i.userData.plain && !e) {
        i.material.dispose(), i.material = i.userData.plain, delete i.userData.plain;
        return
      }
      e && !Array.isArray(i.material) && i.material.userData.shared && !i.material.userData.lit && (i.userData.plain = i.material, i.material = i.material.clone(), i.material.userData = {});
      for (const n of Array.isArray(i.material) ? i.material : [i.material]) n.emissive && !n.userData.lit && !n.userData.shared && (n.emissive.set(t), n.emissiveIntensity = e)
    }
  })
}

function d2(r, e, t) {
  const s = new K(new k9(r, e), T1(new Ye({
    map: t || null,
    color: t ? 16777215 : 1382683
  })));
  return s.userData.nohit = !0, s
}
const P0 = .42,
  Kt = 1.6,
  M0 = .22,
  g2 = 1.7,
  rt = 1;
class v5 {
  constructor() {
    m(this, "boxes", []);
    m(this, "grid", new Map);
    m(this, "stamp", new Uint32Array(0));
    m(this, "stampN", 0);
    m(this, "last", [])
  }
  set(e) {
    this.boxes = e, this.grid.clear(), this.stamp = new Uint32Array(e.length), e.forEach((t, s) => {
      for (let i = Math.floor(t.x0 / rt); i <= Math.floor(t.x1 / rt); i++)
        for (let n = Math.floor(t.z0 / rt); n <= Math.floor(t.z1 / rt); n++) {
          const o = i * 4096 + n;
          let a = this.grid.get(o);
          a || this.grid.set(o, a = []), a.push(s)
        }
    })
  }
  get list() {
    return this.boxes
  }
  near(e, t, s, i, n, o) {
    const a = [],
      l = Math.min(e, s) - .02,
      A = Math.max(e, s) + .02,
      c = Math.min(t, i) - .02,
      h = Math.max(t, i) + .02;
    this.stampN++;
    for (let u = Math.floor(l / rt); u <= Math.floor(A / rt); u++)
      for (let d = Math.floor(c / rt); d <= Math.floor(h / rt); d++)
        for (const g of this.grid.get(u * 4096 + d) || []) {
          if (this.stamp[g] === this.stampN) continue;
          this.stamp[g] = this.stampN;
          const p = this.boxes[g];
          p.x1 < l || p.x0 > A || p.z1 < c || p.z0 > h || p.y1 < n || p.y0 > o || a.push(g)
        }
    return this.last = a, a
  }
  groundAt(e, t, s) {
    let i = null;
    for (const n of this.near(e, t, e, t, -99, s)) {
      const o = this.boxes[n];
      e < o.x0 - .03 || e > o.x1 + .03 || t < o.z0 - .03 || t > o.z1 + .03 || o.y1 > s + .001 || !o.water && (i === null || o.y1 > i) && (i = o.y1)
    }
    return i !== null && this.waterAt(e, t, i) ? null : i
  }
  waterAt(e, t, s) {
    return this.near(e - M0, t - M0, e + M0, t + M0, s - .05, s + Kt).some(i => {
      const n = this.boxes[i];
      return n.water && s <= n.y1 + .05 && s >= n.y0 - .5
    })
  }
  blocksAt(e, t, s) {
    const i = M0 - .02;
    return this.waterAt(e, t, s) || this.near(e - i, t - i, e + i, t + i, s + P0 + .01, s + Kt).length > 0
  }
  canJump(e, t, s) {
    const i = this.groundAt(t, s, e.y + g2 + .05);
    return i === null || i <= e.y + P0 || i > e.y + g2 + .001 || this.blocksAt(t, s, i) || this.near(e.x - M0, e.z - M0, e.x + M0, e.z + M0, e.y + Kt, i + Kt).length ? null : i
  }
}

function v1(r, e, t) {
  if (!r.parent) return;
  const s = r.getWorldPosition(new T),
    i = e.getWorldPosition(new T).sub(s).normalize(),
    n = t.clone().sub(s).normalize(),
    o = r.getWorldQuaternion(new Ve).premultiply(new Ve().setFromUnitVectors(i, n));
  r.quaternion.copy(r.parent.getWorldQuaternion(new Ve).invert().multiply(o)), r.updateWorldMatrix(!1, !0)
}

function lr(r, e, t, s, i) {
  const n = r.getWorldPosition(new T),
    o = e.getWorldPosition(new T),
    a = t.getWorldPosition(new T),
    l = n.distanceTo(o),
    A = o.distanceTo(a);
  if (l < 1e-5 || A < 1e-5) return;
  const c = s.clone().sub(n),
    h = ve.clamp(c.length(), Math.abs(l - A) + 1e-5, l + A - 1e-5);
  c.normalize();
  const u = (l * l - A * A + h * h) / (2 * h),
    d = i.clone().addScaledVector(c, -i.dot(c)).normalize(),
    g = n.clone().addScaledVector(c, u).addScaledVector(d, Math.sqrt(Math.max(0, l * l - u * u)));
  v1(r, e, g), v1(e, t, n.addScaledVector(c, h))
}

function Ar(r, e, t, s, i) {
  e.updateWorldMatrix(!0, !0);
  const n = it(r.bones, "Hips");
  if (!n) return;
  const o = e.getWorldQuaternion(new Ve),
    a = new T(t.x, t.y + .07, t.z);
  if (e.position.add(a.sub(n.getWorldPosition(new T))), e.updateWorldMatrix(!0, !0), i === "sofa") {
    const l = new T(0, 0, 1).applyQuaternion(o),
      A = new T(0, -1, 0);
    for (const c of ["L", "R"]) {
      const h = it(r.bones, `UpperLeg${c}`),
        u = it(r.bones, `LowerLeg${c}`),
        d = it(r.bones, `Foot${c}`);
      !h || !u || !d || (v1(h, u, h.getWorldPosition(new T).add(l)), v1(u, d, u.getWorldPosition(new T).add(A)))
    }
  }
  if (s)
    for (const [l, A] of ["L", "R"].entries()) {
      const c = it(r.bones, `UpperArm${A}`),
        h = it(r.bones, `LowerArm${A}`),
        u = it(r.bones, `Wrist${A}`);
      if (!c || !h || !u || !s[l]) continue;
      const d = s[l];
      lr(c, h, u, new T(d.x, d.y, d.z), new T(l ? -.4 : .4, -1, 0).applyQuaternion(o));
      const g = it(r.bones, `mixamorig:${A==="L"?"Left":"Right"}HandMiddle1`);
      g && v1(u, g, u.getWorldPosition(new T).add(new T(0, -.015, .1).applyQuaternion(o)))
    }
}
const cr = 1,
  ps = .12,
  hr = .08,
  Q5 = (r, e) => Math.hypot(r.x - e.x, r.y - e.y, r.z - e.z);

function D1(r, e, t, s) {
  const i = Math.max(1, Math.ceil(Q5(e, t) / hr));
  for (let n = 0; n <= i; n++) {
    const o = n / i,
      a = e.x + (t.x - e.x) * o,
      l = e.y + (t.y - e.y) * o,
      A = e.z + (t.z - e.z) * o;
    if (r.list.some(c => !s.includes(c.partId || "") && c.x1 > a - M0 && c.x0 < a + M0 && c.z1 > A - M0 && c.z0 < A + M0 && c.y1 > l + .04 && c.y0 < l + Kt)) return !1
  }
  return !0
}

function S5(r, e, t, s) {
  if (Q5(e, t) > .75 || !D1(r, t, t, s)) return !1;
  const i = r.list.filter(o => o.x1 > e.x - M0 && o.x0 < e.x + M0 && o.z1 > e.z - M0 && o.z0 < e.z + M0 && o.y1 > e.y + .04 && o.y0 < e.y + Kt),
    n = new v5;
  return n.set(r.list.filter(o => !i.includes(o))), D1(n, e, t, s)
}

function f2(r, e, t, s, i) {
  let n = null;
  for (const o of r.list) !i.includes(o.partId || "") && e >= o.x0 && e <= o.x1 && t >= o.z0 && t <= o.z1 && o.y1 <= s && (n === null || o.y1 > n) && (n = o.y1);
  return n
}

function ur(r, e) {
  const t = [];
  for (const i of r) {
    if (i.kind !== "ladder" || i.pitch || i.roll) continue;
    const n = i.scale || [1, 1, 1];
    n.some(o => o <= 0) || t.push({
      ids: [i.id],
      x: i.x,
      z: i.z,
      low: i.y,
      high: i.y + 2 * n[1],
      angle: i.rotation * Math.PI / 12,
      depth: .03 * n[2]
    })
  }
  for (let i = 0; i < t.length; i++)
    for (let n = i + 1; n < t.length; n++) {
      const o = t[i],
        a = t[n];
      if (!(Math.hypot(o.x - a.x, o.z - a.z) > ps || Math.abs(Math.sin(o.angle - a.angle)) > .05 || o.low > a.high + ps || a.low > o.high + ps)) {
        o.low = Math.min(o.low, a.low), o.high = Math.max(o.high, a.high), o.depth = Math.max(o.depth, a.depth), o.ids.push(...a.ids), t.splice(n, 1), i = -1;
        break
      }
    }
  const s = [];
  for (const i of t)
    for (const n of [1, -1]) {
      const o = M0 + i.depth + .1,
        a = Math.sin(i.angle) * n,
        l = Math.cos(i.angle) * n,
        A = i.x + a * o,
        c = i.z + l * o,
        h = f2(e, A, c, i.low + P0, i.ids);
      if (h === null || Math.abs(h - i.low) > P0) continue;
      const u = {
        x: A,
        y: h,
        z: c
      };
      for (const d of [.35, .6, .85])
        for (let g = 0; g < 16; g++) {
          const p = i.angle + g * Math.PI / 8,
            I = i.x + Math.sin(p) * d,
            C = i.z + Math.cos(p) * d,
            E = f2(e, I, C, i.high + P0, i.ids);
          if (E === null || Math.abs(E - i.high) > P0) continue;
          const x = {
              x: I,
              y: E,
              z: C
            },
            B = Math.max(i.high, E),
            b = Math.atan2(-a, -l),
            v = [{
              x: A,
              y: B,
              z: c
            }, {
              x: I,
              y: B,
              z: C
            }, x].map(D => ({
              ...D,
              climb: i.ids,
              face: b
            }));
          let L = u;
          v.every(D => {
            const P = D1(e, L, D, i.ids);
            return L = D, P
          }) && s.push({
            ids: i.ids,
            bottom: u,
            top: x,
            up: v
          })
        }
    }
  return s
}

function dr(r, e, t) {
  const s = Math.abs(t.y - e.top.y) <= P0,
    i = e.bottom;
  if (t.y < i.y - P0 || t.y > e.up[0].y + P0 || Math.hypot(t.x - i.x, t.z - i.z) > .7) return null;
  const n = {
    x: i.x,
    y: Math.max(i.y, Math.min(t.y, e.up[0].y)),
    z: i.z,
    climb: e.ids,
    climbEntry: !0,
    face: e.up[0].face
  };
  if (s) {
    const o = [...e.up.slice(0, -1).reverse(), {
      ...e.bottom,
      climb: e.ids,
      face: e.up[0].face
    }];
    return D1(r, t, o[0], e.ids) ? o : null
  }
  return S5(r, t, n, e.ids) ? [n, ...e.up] : null
}

function gr(r, e, t, s) {
  for (const i of e) {
    const n = i.up[0].face,
      o = Math.abs(t.y - i.top.y) <= P0,
      a = o ? i.bottom.x - t.x : Math.sin(n),
      l = o ? i.bottom.z - t.z : Math.cos(n),
      A = Math.hypot(a, l);
    if (!A || (s.x * a + s.z * l) / A < .6) continue;
    const c = dr(r, i, t);
    if (c) return c
  }
  return null
}
const fr = 9.8,
  p2 = 1.3,
  m2 = 1.5;

function I2(r, e) {
  if (!e) return null;
  const t = u3(r.model),
    s = new d3(t);
  s.clipAction(e).play();
  const i = ["mixamorig:LeftFoot", "mixamorig:RightFoot", "mixamorigLeftFoot", "mixamorigRightFoot"].map(h => t.getObjectByName(h)).filter(Boolean);
  if (i.length < 2) return null;
  const n = 120,
    o = e.duration,
    a = new T,
    l = i.slice(0, 2).map(() => []);
  for (let h = 0; h <= n; h++) s.setTime(o * h / n), t.updateMatrixWorld(!0), i.slice(0, 2).forEach((u, d) => l[d].push(u.getWorldPosition(a).z));
  let A = 0,
    c = 0;
  for (const h of l)
    for (let u = 1; u <= n; u++) h[u] < h[u - 1] && (A += h[u - 1] - h[u], c += o / n);
  return c ? A / c : null
}

export { ar, n1, di, Ys, b1, d2, P0, rt, v5, v1, Ar, cr, hr, D1, S5, ur, gr, fr, p2, m2, I2 };
