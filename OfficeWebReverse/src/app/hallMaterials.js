// Hall material infrastructure: wood/water procedural textures, color grading
// maps, the shared material cache (ht) and its geometry presets, outline helper.
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { V as T } from '../chunks/portraitLighting.js';
import { f as U0 } from '../chunks/portraitLighting.js';
import { ab as De } from '../chunks/portraitLighting.js';
import { at as e1 } from '../chunks/portraitLighting.js';
import { u as pe } from '../chunks/portraitLighting.js';
import { v as T9 } from '../chunks/portraitLighting.js';
import { g as Ie } from '../chunks/portraitLighting.js';

const u1 = new T;

function ce(r, e, t, s, i, n) {
  const o = 2 * Math.PI * i / 4,
    a = Math.max(n - 2 * i, 0),
    l = Math.PI / 4;
  u1.copy(e), u1[s] = 0, u1.normalize();
  const A = .5 * o / (o + a),
    c = 1 - u1.angleTo(r) / l;
  return Math.sign(u1[t]) === 1 ? c * A : a / (o + a) + A + A * (1 - c)
}
class hi extends U0 {
  constructor(e = 1, t = 1, s = 1, i = 2, n = .1) {
    const o = i * 2 + 1;
    if (n = Math.min(e / 2, t / 2, s / 2, n), super(1, 1, 1, o, o, o), this.type = "RoundedBoxGeometry", this.parameters = {
        width: e,
        height: t,
        depth: s,
        segments: i,
        radius: n
      }, o === 1) return;
    const a = this.toNonIndexed();
    this.index = null, this.attributes.position = a.attributes.position, this.attributes.normal = a.attributes.normal, this.attributes.uv = a.attributes.uv;
    const l = new T,
      A = new T,
      c = new T(e, t, s).divideScalar(2).subScalar(n),
      h = this.attributes.position.array,
      u = this.attributes.normal.array,
      d = this.attributes.uv.array,
      g = h.length / 6,
      p = new T,
      I = .5 / o;
    for (let C = 0, E = 0; C < h.length; C += 3, E += 2) switch (l.fromArray(h, C), A.copy(l), A.x -= Math.sign(A.x) * I, A.y -= Math.sign(A.y) * I, A.z -= Math.sign(A.z) * I, A.normalize(), h[C + 0] = c.x * Math.sign(l.x) + A.x * n, h[C + 1] = c.y * Math.sign(l.y) + A.y * n, h[C + 2] = c.z * Math.sign(l.z) + A.z * n, u[C + 0] = A.x, u[C + 1] = A.y, u[C + 2] = A.z, Math.floor(C / g)) {
      case 0:
        p.set(1, 0, 0), d[E + 0] = ce(p, A, "z", "y", n, s), d[E + 1] = 1 - ce(p, A, "y", "z", n, t);
        break;
      case 1:
        p.set(-1, 0, 0), d[E + 0] = 1 - ce(p, A, "z", "y", n, s), d[E + 1] = 1 - ce(p, A, "y", "z", n, t);
        break;
      case 2:
        p.set(0, 1, 0), d[E + 0] = 1 - ce(p, A, "x", "z", n, e), d[E + 1] = ce(p, A, "z", "x", n, s);
        break;
      case 3:
        p.set(0, -1, 0), d[E + 0] = 1 - ce(p, A, "x", "z", n, e), d[E + 1] = 1 - ce(p, A, "z", "x", n, s);
        break;
      case 4:
        p.set(0, 0, 1), d[E + 0] = 1 - ce(p, A, "x", "y", n, e), d[E + 1] = 1 - ce(p, A, "y", "x", n, t);
        break;
      case 5:
        p.set(0, 0, -1), d[E + 0] = ce(p, A, "x", "y", n, e), d[E + 1] = 1 - ce(p, A, "y", "x", n, t);
        break
    }
  }
  static fromJSON(e) {
    return new hi(e.width, e.height, e.depth, e.segments, e.radius)
  }
}

function D9(r) {
  return ["#dcc08c", "#e9d4aa", "#c9a979", "#e3c6a0"].includes(r.toLowerCase()) ? "wood" : ["#2c2e35", "#1f2325"].includes(r.toLowerCase()) ? "metal" : ["#ea9a84", "#9cc7c0"].includes(r.toLowerCase()) ? "fabric" : ["#efe9de", "#7f8eb6", "#555f82", "#f4f1ea"].includes(r.toLowerCase()) ? "plaster" : "paint"
}
const q8 = {
    "#e9d4aa": "#d1a56e",
    "#f4f1ea": "#faf6ee",
    "#dcc08c": "#b88a55",
    "#5c6b9c": "#7a9bb0",
    "#7f8eb6": "#e3d3b6",
    "#ea9a84": "#cfa273",
    "#9cc7c0": "#7fa08a",
    "#2c2e35": "#2c2620",
    "#48aebd": "#7a9bb0",
    "#c9a979": "#8a6a45",
    "#f3ead8": "#efe3d0",
    "#6f9468": "#4f7d5c",
    "#d8b98a": "#b88a55",
    "#f4efe4": "#faf6ee",
    "#e08f78": "#cfa273"
  },
  W8 = r => q8[r.toLowerCase()] || r,
  hs = new Map;

function qt(r) {
  if (hs.has(r)) return hs.get(r);
  const e = 128,
    t = new Uint8Array(e * e * 4);
  let s = 73;
  for (let n = 0; n < e; n++)
    for (let o = 0; o < e; o++) {
      s = s * 16807 % 2147483647;
      const a = s / 2147483647,
        l = Math.sin(n * .55 + Math.sin(o * .049) * 1.6 + Math.sin(n * .13)),
        A = o / e * Math.PI * 2,
        c = n / e * Math.PI * 2,
        h = Math.sin(A * 3 + Math.sin(c * 2)) + Math.sin(c * 4 + Math.cos(A * 2)),
        u = 176 + h * 14 + 48 * Math.pow(Math.max(0, 1 - Math.abs(h) * 2), 4),
        d = r === "water" ? u : r === "wood" ? 229 + l * 13 + a * 10 : r === "fabric" ? 225 + (o + n) % 2 * 15 + a * 12 : 238 + a * 17,
        g = (n * e + o) * 4;
      t[g] = t[g + 1] = t[g + 2] = Math.round(d), t[g + 3] = 255
    }
  const i = new De(t, e, e);
  return i.wrapS = i.wrapT = e1, i.magFilter = pe, i.minFilter = T9, i.generateMipmaps = !0, i.anisotropy = 4, i.needsUpdate = !0, hs.set(r, i), i
}

function w5(r) {
  return r === "water" ? {
    roughness: .16,
    metalness: .12,
    map: qt(r),
    bumpMap: qt(r),
    bumpScale: .025
  } : r === "metal" ? {
    roughness: .32,
    metalness: .7
  } : r === "wood" ? {
    roughness: .52,
    metalness: 0,
    map: qt(r),
    bumpMap: qt(r),
    bumpScale: .003
  } : r === "fabric" ? {
    roughness: .94,
    metalness: 0,
    bumpMap: qt(r),
    bumpScale: .002
  } : r === "plaster" ? {
    roughness: .82,
    metalness: 0,
    bumpMap: qt(r),
    bumpScale: .001
  } : {
    roughness: .62,
    metalness: .03
  }
}
const us = new Map;

function V8(r, e, t) {
  const s = `${r}/${e}/${t}`;
  if (!us.has(s)) {
    const i = new hi(r, e, t, 2, Math.min(.012, r * .12, e * .12, t * .12));
    i.scale(1 / r, 1 / e, 1 / t), us.set(s, i)
  }
  return us.get(s)
}
const l0 = {
    plinth: "#a9824f",
    floor: "#efe6d4",
    wall: "#e3d3b6",
    wallBack: "#ecdfc6",
    trim: "#8a6a45",
    wood: "#b88a55",
    sage: "#7fa08a",
    coral: "#d98f6c",
    ink: "#2c2620",
    shade: "#efe3d0",
    blue: "#7a9bb0",
    blueDark: "#4c6a7e",
    white: "#faf6ee"
  },
  x1 = new Map;
let h2 = 0;

function Y8() {
  h2++;
  let r = !1;
  return () => {
    if (!r && (r = !0, --h2 === 0)) {
      for (const e of x1.values()) e.dispose();
      x1.clear()
    }
  }
}
const ht = (r, e = {}) => {
    const t = r + JSON.stringify(e);
    return x1.has(t) || x1.set(t, new Ie({
      color: r,
      ...w5(D9(r)),
      ...e
    })), x1.get(t)
  },
  B5 = new U0(1, 1, 1),
  x5 = B5.toNonIndexed(),
  $1 = x5.getAttribute("position").array,
  ds = x5.getAttribute("normal").array;
let J8 = 0;
const K8 = () => 1 + (J8++ * 7 % 11 - 5) * 4e-4,
  T1 = r => (r.polygonOffset = !0, r.polygonOffsetFactor = -1, r.polygonOffsetUnits = -4, r);


export { hi, D9, W8, hs, w5, V8, l0, x1, h2, Y8, ht, B5, $1, ds, K8, T1 };
