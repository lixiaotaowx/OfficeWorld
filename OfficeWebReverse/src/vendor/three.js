// three.js r187 core + addons (GLTFLoader, DRACOLoader, KTX2Loader, RoomEnvironment,
// SimplexNoise, MTLLoader/OBJ materials) recovered verbatim from the production
// bundle. Only imports/exports added; app layer lives in chunks/portraitLighting.js.
import dracoDecoderWasmUrl from 'three/addons/libs/draco/draco_decoder.wasm?url';
import dracoWasmWrapperJsUrl from 'three/addons/libs/draco/draco_wasm_wrapper.js?url';
import dracoDecoderJsUrl from 'three/addons/libs/draco/draco_decoder.js?url';
import { S as Ra, y as Ca, c as Eu } from '../chunks/chatLocal.js';

/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
var yu = Object.defineProperty;
var Tu = (s, e, t) => e in s ? yu(s, e, {
  enumerable: !0,
  configurable: !0,
  writable: !0,
  value: t
}) : s[e] = t;
var _l = (s, e, t) => Tu(s, typeof e != "symbol" ? e + "" : e, t);
const wo = "187",
  Au = 0,
  xl = 1,
  wu = 2,
  mr = 1,
  Ru = 2,
  ls = 3,
  $n = 0,
  Wt = 1,
  xn = 2,
  Ui = 0,
  fs = 1,
  vl = 2,
  Ml = 3,
  Sl = 4,
  Cu = 5,
  Li = 100,
  Lu = 101,
  Pu = 102,
  Iu = 103,
  Nu = 104,
  Du = 200,
  Uu = 201,
  Fu = 202,
  Ou = 203,
  Zc = 204,
  $c = 205,
  Bu = 206,
  zu = 207,
  ku = 208,
  Hu = 209,
  Gu = 210,
  Vu = 211,
  Wu = 212,
  Xu = 213,
  qu = 214,
  La = 0,
  Pa = 1,
  Ia = 2,
  vs = 3,
  Na = 4,
  Da = 5,
  Ua = 6,
  Fa = 7,
  Ur = 0,
  Yu = 1,
  Ku = 2,
  Un = 0,
  Qc = 1,
  jc = 2,
  eh = 3,
  th = 4,
  nh = 5,
  ih = 6,
  sh = 7,
  yl = "attached",
  Ju = "detached",
  rh = 300,
  hi = 301,
  Ms = 302,
  Vr = 303,
  Wr = 304,
  zi = 1e3,
  on = 1001,
  yr = 1002,
  Rt = 1003,
  ah = 1004,
  cs = 1005,
  Ct = 1006,
  gr = 1007,
  vn = 1008,
  Jt = 1009,
  oh = 1010,
  lh = 1011,
  Ss = 1012,
  Ro = 1013,
  Sn = 1014,
  jt = 1015,
  yn = 1016,
  Co = 1017,
  Lo = 1018,
  ki = 1020,
  ch = 35902,
  hh = 35899,
  uh = 1021,
  dh = 1022,
  ln = 1023,
  Qn = 1026,
  Kn = 1027,
  Po = 1028,
  Io = 1029,
  ui = 1030,
  No = 1031,
  Do = 1033,
  _r = 33776,
  xr = 33777,
  vr = 33778,
  Mr = 33779,
  Oa = 35840,
  Ba = 35841,
  za = 35842,
  ka = 35843,
  Ha = 36196,
  Ga = 37492,
  Va = 37496,
  Wa = 37488,
  Xa = 37489,
  Tr = 37490,
  qa = 37491,
  Ya = 37808,
  Ka = 37809,
  Ja = 37810,
  Za = 37811,
  $a = 37812,
  Qa = 37813,
  ja = 37814,
  eo = 37815,
  to = 37816,
  no = 37817,
  io = 37818,
  so = 37819,
  ro = 37820,
  ao = 37821,
  oo = 36492,
  lo = 36494,
  co = 36495,
  ho = 36283,
  uo = 36284,
  Er = 36285,
  fo = 36286,
  Zu = 2200,
  $u = 2201,
  Qu = 2202,
  ys = 2300,
  Ts = 2301,
  Xr = 2302,
  Tl = 2303,
  Pi = 2400,
  Ii = 2401,
  br = 2402,
  Uo = 2500,
  ju = 2501,
  ed = 0,
  fh = 1,
  po = 2,
  td = 3200,
  Hi = 0,
  nd = 1,
  Yn = "",
  bt = "srgb",
  Xt = "srgb-linear",
  Ar = "linear",
  ct = "srgb",
  qr = 7680,
  id = 519,
  sd = 512,
  rd = 513,
  ad = 514,
  ph = 515,
  od = 516,
  ld = 517,
  mh = 518,
  gh = 519,
  _h = 35044,
  El = "300 es",
  cn = 2e3,
  Es = 2001;

function cd(s) {
  for (let e = s.length - 1; e >= 0; --e)
    if (s[e] >= 65535) return !0;
  return !1
}

function hd(s) {
  return ArrayBuffer.isView(s) && !(s instanceof DataView)
}

function bs(s) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", s)
}

function ud() {
  const s = bs("canvas");
  return s.style.display = "block", s
}
const bl = {};

function wr(...s) {
  const e = "THREE." + s.shift();
  console.log(e, ...s)
}

function xh(s) {
  const e = s[0];
  if (typeof e == "string" && e.startsWith("TSL:")) {
    const t = s[1];
    t && t.isStackTrace ? s[0] += " " + t.getLocation() : s[1] = 'Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'
  }
  return s
}

function Ce(...s) {
  s = xh(s);
  const e = "THREE." + s.shift();
  {
    const t = s[0];
    t && t.isStackTrace ? console.warn(t.getError(e)) : console.warn(e, ...s)
  }
}

function ze(...s) {
  s = xh(s);
  const e = "THREE." + s.shift();
  {
    const t = s[0];
    t && t.isStackTrace ? console.error(t.getError(e)) : console.error(e, ...s)
  }
}

function Fi(...s) {
  const e = s.join(" ");
  e in bl || (bl[e] = !0, Ce(...s))
}

function dd(s, e, t) {
  return new Promise(function(n, i) {
    function r() {
      switch (s.clientWaitSync(e, s.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case s.WAIT_FAILED:
          i();
          break;
        case s.TIMEOUT_EXPIRED:
          setTimeout(r, t);
          break;
        default:
          n()
      }
    }
    setTimeout(r, t)
  })
}
const fd = {
  [La]: La,
  [Ia]: Ua,
  [Na]: Na,
  [vs]: Da,
  [Pa]: Pa,
  [Ua]: Ia,
  [Fa]: Fa,
  [Da]: vs
};
class jn {
  addEventListener(e, t) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t)
  }
  hasEventListener(e, t) {
    const n = this._listeners;
    return n === void 0 ? !1 : n[e] !== void 0 && n[e].indexOf(t) !== -1
  }
  removeEventListener(e, t) {
    const n = this._listeners;
    if (n === void 0) return;
    const i = n[e];
    if (i !== void 0) {
      const r = i.indexOf(t);
      r !== -1 && i.splice(r, 1)
    }
  }
  dispatchEvent(e) {
    const t = this._listeners;
    if (t === void 0) return;
    const n = t[e.type];
    if (n !== void 0) {
      e.target = this;
      const i = n.slice(0);
      for (let r = 0, a = i.length; r < a; r++) i[r].call(this, e);
      e.target = null
    }
  }
}
const zt = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let Al = 1234567;
const ps = Math.PI / 180,
  Gi = 180 / Math.PI;

function hn() {
  const s = Math.random() * 4294967295 | 0,
    e = Math.random() * 4294967295 | 0,
    t = Math.random() * 4294967295 | 0,
    n = Math.random() * 4294967295 | 0;
  return (zt[s & 255] + zt[s >> 8 & 255] + zt[s >> 16 & 255] + zt[s >> 24 & 255] + "-" + zt[e & 255] + zt[e >> 8 & 255] + "-" + zt[e >> 16 & 15 | 64] + zt[e >> 24 & 255] + "-" + zt[t & 63 | 128] + zt[t >> 8 & 255] + "-" + zt[t >> 16 & 255] + zt[t >> 24 & 255] + zt[n & 255] + zt[n >> 8 & 255] + zt[n >> 16 & 255] + zt[n >> 24 & 255]).toLowerCase()
}

function Ke(s, e, t) {
  return Math.max(e, Math.min(t, s))
}

function Fo(s, e) {
  return (s % e + e) % e
}

function pd(s, e, t, n, i) {
  return n + (s - e) * (i - n) / (t - e)
}

function md(s, e, t) {
  return s !== e ? (t - s) / (e - s) : 0
}

function ms(s, e, t) {
  return (1 - t) * s + t * e
}

function gd(s, e, t, n) {
  return ms(s, e, 1 - Math.exp(-t * n))
}

function _d(s, e = 1) {
  return e - Math.abs(Fo(s, e * 2) - e)
}

function xd(s, e, t) {
  return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * (3 - 2 * s))
}

function vd(s, e, t) {
  return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * s * (s * (s * 6 - 15) + 10))
}

function Md(s, e) {
  return s + Math.floor(Math.random() * (e - s + 1))
}

function Sd(s, e) {
  return s + Math.random() * (e - s)
}

function yd(s) {
  return s * (.5 - Math.random())
}

function Td(s) {
  s !== void 0 && (Al = s);
  let e = Al += 1831565813;
  return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296
}

function Ed(s) {
  return s * ps
}

function bd(s) {
  return s * Gi
}

function Ad(s) {
  return s > 0 && Number.isInteger(s) && 2 ** Math.round(Math.log2(s)) === s
}

function wd(s) {
  return Math.pow(2, Math.ceil(Math.log(s) / Math.LN2))
}

function vh(s) {
  return Math.pow(2, Math.floor(Math.log(s) / Math.LN2))
}

function Rd(s, e, t, n, i) {
  const r = Math.cos,
    a = Math.sin,
    o = r(t / 2),
    l = a(t / 2),
    c = r((e + n) / 2),
    h = a((e + n) / 2),
    u = r((e - n) / 2),
    d = a((e - n) / 2),
    f = r((n - e) / 2),
    p = a((n - e) / 2);
  switch (i) {
    case "XYX":
      s.set(o * h, l * u, l * d, o * c);
      break;
    case "YZY":
      s.set(l * d, o * h, l * u, o * c);
      break;
    case "ZXZ":
      s.set(l * u, l * d, o * h, o * c);
      break;
    case "XZX":
      s.set(o * h, l * p, l * f, o * c);
      break;
    case "YXY":
      s.set(l * f, o * h, l * p, o * c);
      break;
    case "ZYZ":
      s.set(l * p, l * f, o * h, o * c);
      break;
    default:
      Ce("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + i)
  }
}

function Fr(s) {
  switch (s.constructor) {
    case Uint32Array:
      return 4294967295;
    case Uint16Array:
      return 65535;
    case Uint8Array:
    case Uint8ClampedArray:
      return 255;
    case Int32Array:
      return 2147483647;
    case Int16Array:
      return 32767;
    case Int8Array:
      return 127;
    default:
      return
  }
}

function Oo(s, e) {
  if (e.constructor === Float32Array) return s;
  const t = Fr(e);
  if (t === void 0) throw new Error("THREE.MathUtils: Invalid component type.");
  return Math.max(s / t, -1)
}

function Bo(s, e) {
  if (e.constructor === Float32Array) return s;
  const t = Fr(e);
  if (t === void 0) throw new Error("THREE.MathUtils: Invalid component type.");
  return Math.round(s * t)
}
const Cd = {
    DEG2RAD: ps,
    RAD2DEG: Gi,
    generateUUID: hn,
    clamp: Ke,
    euclideanModulo: Fo,
    mapLinear: pd,
    inverseLerp: md,
    lerp: ms,
    damp: gd,
    pingpong: _d,
    smoothstep: xd,
    smootherstep: vd,
    randInt: Md,
    randFloat: Sd,
    randFloatSpread: yd,
    seededRandom: Td,
    degToRad: Ed,
    radToDeg: bd,
    isPowerOfTwo: Ad,
    ceilPowerOfTwo: wd,
    floorPowerOfTwo: vh,
    setQuaternionFromProperEuler: Rd,
    normalize: Bo,
    denormalize: Oo
  },
  nl = class nl {
    constructor(e = 0, t = 0) {
      this.x = e, this.y = t
    }
    get width() {
      return this.x
    }
    set width(e) {
      this.x = e
    }
    get height() {
      return this.y
    }
    set height(e) {
      this.y = e
    }
    set(e, t) {
      return this.x = e, this.y = t, this
    }
    setScalar(e) {
      return this.x = e, this.y = e, this
    }
    setX(e) {
      return this.x = e, this
    }
    setY(e) {
      return this.y = e, this
    }
    setComponent(e, t) {
      switch (e) {
        case 0:
          this.x = t;
          break;
        case 1:
          this.y = t;
          break;
        default:
          throw new Error("THREE.Vector2: index is out of range: " + e)
      }
      return this
    }
    getComponent(e) {
      switch (e) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        default:
          throw new Error("THREE.Vector2: index is out of range: " + e)
      }
    }
    clone() {
      return new this.constructor(this.x, this.y)
    }
    copy(e) {
      return this.x = e.x, this.y = e.y, this
    }
    add(e) {
      return this.x += e.x, this.y += e.y, this
    }
    addScalar(e) {
      return this.x += e, this.y += e, this
    }
    addVectors(e, t) {
      return this.x = e.x + t.x, this.y = e.y + t.y, this
    }
    addScaledVector(e, t) {
      return this.x += e.x * t, this.y += e.y * t, this
    }
    sub(e) {
      return this.x -= e.x, this.y -= e.y, this
    }
    subScalar(e) {
      return this.x -= e, this.y -= e, this
    }
    subVectors(e, t) {
      return this.x = e.x - t.x, this.y = e.y - t.y, this
    }
    multiply(e) {
      return this.x *= e.x, this.y *= e.y, this
    }
    multiplyScalar(e) {
      return this.x *= e, this.y *= e, this
    }
    divide(e) {
      return this.x /= e.x, this.y /= e.y, this
    }
    divideScalar(e) {
      return this.multiplyScalar(1 / e)
    }
    applyMatrix3(e) {
      const t = this.x,
        n = this.y,
        i = e.elements;
      return this.x = i[0] * t + i[3] * n + i[6], this.y = i[1] * t + i[4] * n + i[7], this
    }
    min(e) {
      return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this
    }
    max(e) {
      return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this
    }
    clamp(e, t) {
      return this.x = Ke(this.x, e.x, t.x), this.y = Ke(this.y, e.y, t.y), this
    }
    clampScalar(e, t) {
      return this.x = Ke(this.x, e, t), this.y = Ke(this.y, e, t), this
    }
    clampLength(e, t) {
      const n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(Ke(n, e, t))
    }
    floor() {
      return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this
    }
    ceil() {
      return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this
    }
    round() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this
    }
    roundToZero() {
      return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this
    }
    negate() {
      return this.x = -this.x, this.y = -this.y, this
    }
    dot(e) {
      return this.x * e.x + this.y * e.y
    }
    cross(e) {
      return this.x * e.y - this.y * e.x
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y)
    }
    normalize() {
      return this.divideScalar(this.length() || 1)
    }
    angle() {
      return Math.atan2(-this.y, -this.x) + Math.PI
    }
    angleTo(e) {
      const t = Math.sqrt(this.lengthSq() * e.lengthSq());
      if (t === 0) return Math.PI / 2;
      const n = this.dot(e) / t;
      return Math.acos(Ke(n, -1, 1))
    }
    distanceTo(e) {
      return Math.sqrt(this.distanceToSquared(e))
    }
    distanceToSquared(e) {
      const t = this.x - e.x,
        n = this.y - e.y;
      return t * t + n * n
    }
    manhattanDistanceTo(e) {
      return Math.abs(this.x - e.x) + Math.abs(this.y - e.y)
    }
    setLength(e) {
      return this.normalize().multiplyScalar(e)
    }
    lerp(e, t) {
      return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this
    }
    lerpVectors(e, t, n) {
      return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this
    }
    equals(e) {
      return e.x === this.x && e.y === this.y
    }
    fromArray(e, t = 0) {
      return this.x = e[t], this.y = e[t + 1], this
    }
    toArray(e = [], t = 0) {
      return e[t] = this.x, e[t + 1] = this.y, e
    }
    fromBufferAttribute(e, t) {
      return this.x = e.getX(t), this.y = e.getY(t), this
    }
    rotateAround(e, t) {
      const n = Math.cos(t),
        i = Math.sin(t),
        r = this.x - e.x,
        a = this.y - e.y;
      return this.x = r * n - a * i + e.x, this.y = r * i + a * n + e.y, this
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this
    }*[Symbol.iterator]() {
      yield this.x, yield this.y
    }
  };
nl.prototype.isVector2 = !0;
let re = nl;
class en {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = i
  }
  static slerpFlat(e, t, n, i, r, a, o) {
    let l = n[i + 0],
      c = n[i + 1],
      h = n[i + 2],
      u = n[i + 3],
      d = r[a + 0],
      f = r[a + 1],
      p = r[a + 2],
      x = r[a + 3];
    if (u !== x || l !== d || c !== f || h !== p) {
      let m = l * d + c * f + h * p + u * x;
      m < 0 && (d = -d, f = -f, p = -p, x = -x, m = -m);
      let g = 1 - o;
      if (m < .9995) {
        const M = Math.acos(m),
          E = Math.sin(M);
        g = Math.sin(g * M) / E, o = Math.sin(o * M) / E, l = l * g + d * o, c = c * g + f * o, h = h * g + p * o, u = u * g + x * o
      } else {
        l = l * g + d * o, c = c * g + f * o, h = h * g + p * o, u = u * g + x * o;
        const M = 1 / Math.sqrt(l * l + c * c + h * h + u * u);
        l *= M, c *= M, h *= M, u *= M
      }
    }
    e[t] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = u
  }
  static multiplyQuaternionsFlat(e, t, n, i, r, a) {
    const o = n[i],
      l = n[i + 1],
      c = n[i + 2],
      h = n[i + 3],
      u = r[a],
      d = r[a + 1],
      f = r[a + 2],
      p = r[a + 3];
    return e[t] = o * p + h * u + l * f - c * d, e[t + 1] = l * p + h * d + c * u - o * f, e[t + 2] = c * p + h * f + o * d - l * u, e[t + 3] = h * p - o * u - l * d - c * f, e
  }
  get x() {
    return this._x
  }
  set x(e) {
    this._x = e, this._onChangeCallback()
  }
  get y() {
    return this._y
  }
  set y(e) {
    this._y = e, this._onChangeCallback()
  }
  get z() {
    return this._z
  }
  set z(e) {
    this._z = e, this._onChangeCallback()
  }
  get w() {
    return this._w
  }
  set w(e) {
    this._w = e, this._onChangeCallback()
  }
  set(e, t, n, i) {
    return this._x = e, this._y = t, this._z = n, this._w = i, this._onChangeCallback(), this
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w)
  }
  copy(e) {
    return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this
  }
  setFromEuler(e, t = !0) {
    const n = e._x,
      i = e._y,
      r = e._z,
      a = e._order,
      o = Math.cos,
      l = Math.sin,
      c = o(n / 2),
      h = o(i / 2),
      u = o(r / 2),
      d = l(n / 2),
      f = l(i / 2),
      p = l(r / 2);
    switch (a) {
      case "XYZ":
        this._x = d * h * u + c * f * p, this._y = c * f * u - d * h * p, this._z = c * h * p + d * f * u, this._w = c * h * u - d * f * p;
        break;
      case "YXZ":
        this._x = d * h * u + c * f * p, this._y = c * f * u - d * h * p, this._z = c * h * p - d * f * u, this._w = c * h * u + d * f * p;
        break;
      case "ZXY":
        this._x = d * h * u - c * f * p, this._y = c * f * u + d * h * p, this._z = c * h * p + d * f * u, this._w = c * h * u - d * f * p;
        break;
      case "ZYX":
        this._x = d * h * u - c * f * p, this._y = c * f * u + d * h * p, this._z = c * h * p - d * f * u, this._w = c * h * u + d * f * p;
        break;
      case "YZX":
        this._x = d * h * u + c * f * p, this._y = c * f * u + d * h * p, this._z = c * h * p - d * f * u, this._w = c * h * u - d * f * p;
        break;
      case "XZY":
        this._x = d * h * u - c * f * p, this._y = c * f * u - d * h * p, this._z = c * h * p + d * f * u, this._w = c * h * u + d * f * p;
        break;
      default:
        Ce("Quaternion: .setFromEuler() encountered an unknown order: " + a)
    }
    return t === !0 && this._onChangeCallback(), this
  }
  setFromAxisAngle(e, t) {
    const n = t / 2,
      i = Math.sin(n);
    return this._x = e.x * i, this._y = e.y * i, this._z = e.z * i, this._w = Math.cos(n), this._onChangeCallback(), this
  }
  setFromRotationMatrix(e) {
    const t = e.elements,
      n = t[0],
      i = t[4],
      r = t[8],
      a = t[1],
      o = t[5],
      l = t[9],
      c = t[2],
      h = t[6],
      u = t[10],
      d = n + o + u;
    if (d > 0) {
      const f = .5 / Math.sqrt(d + 1);
      this._w = .25 / f, this._x = (h - l) * f, this._y = (r - c) * f, this._z = (a - i) * f
    } else if (n > o && n > u) {
      const f = 2 * Math.sqrt(1 + n - o - u);
      this._w = (h - l) / f, this._x = .25 * f, this._y = (i + a) / f, this._z = (r + c) / f
    } else if (o > u) {
      const f = 2 * Math.sqrt(1 + o - n - u);
      this._w = (r - c) / f, this._x = (i + a) / f, this._y = .25 * f, this._z = (l + h) / f
    } else {
      const f = 2 * Math.sqrt(1 + u - n - o);
      this._w = (a - i) / f, this._x = (r + c) / f, this._y = (l + h) / f, this._z = .25 * f
    }
    return this._onChangeCallback(), this
  }
  setFromUnitVectors(e, t) {
    let n = e.dot(t) + 1;
    return n < 1e-8 ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize()
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(Ke(this.dot(e), -1, 1)))
  }
  rotateTowards(e, t) {
    const n = this.angleTo(e);
    if (n === 0) return this;
    const i = Math.min(1, t / n);
    return this.slerp(e, i), this
  }
  identity() {
    return this.set(0, 0, 0, 1)
  }
  invert() {
    return this.conjugate()
  }
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this
  }
  dot(e) {
    return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w)
  }
  normalize() {
    let e = this.length();
    return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this
  }
  multiply(e) {
    return this.multiplyQuaternions(this, e)
  }
  premultiply(e) {
    return this.multiplyQuaternions(e, this)
  }
  multiplyQuaternions(e, t) {
    const n = e._x,
      i = e._y,
      r = e._z,
      a = e._w,
      o = t._x,
      l = t._y,
      c = t._z,
      h = t._w;
    return this._x = n * h + a * o + i * c - r * l, this._y = i * h + a * l + r * o - n * c, this._z = r * h + a * c + n * l - i * o, this._w = a * h - n * o - i * l - r * c, this._onChangeCallback(), this
  }
  slerp(e, t) {
    let n = e._x,
      i = e._y,
      r = e._z,
      a = e._w,
      o = this.dot(e);
    o < 0 && (n = -n, i = -i, r = -r, a = -a, o = -o);
    let l = 1 - t;
    if (o < .9995) {
      const c = Math.acos(o),
        h = Math.sin(c);
      l = Math.sin(l * c) / h, t = Math.sin(t * c) / h, this._x = this._x * l + n * t, this._y = this._y * l + i * t, this._z = this._z * l + r * t, this._w = this._w * l + a * t, this._onChangeCallback()
    } else this._x = this._x * l + n * t, this._y = this._y * l + i * t, this._z = this._z * l + r * t, this._w = this._w * l + a * t, this.normalize();
    return this
  }
  slerpQuaternions(e, t, n) {
    return this.copy(e).slerp(t, n)
  }
  random() {
    const e = 2 * Math.PI * Math.random(),
      t = 2 * Math.PI * Math.random(),
      n = Math.random(),
      i = Math.sqrt(1 - n),
      r = Math.sqrt(n);
    return this.set(i * Math.sin(e), i * Math.cos(e), r * Math.sin(t), r * Math.cos(t))
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w
  }
  fromArray(e, t = 0) {
    return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e
  }
  fromBufferAttribute(e, t) {
    return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this
  }
  toJSON() {
    return this.toArray()
  }
  _onChange(e) {
    return this._onChangeCallback = e, this
  }
  _onChangeCallback() {}*[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w
  }
}
const il = class il {
  constructor(e = 0, t = 0, n = 0) {
    this.x = e, this.y = t, this.z = n
  }
  set(e, t, n) {
    return n === void 0 && (n = this.z), this.x = e, this.y = t, this.z = n, this
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this
  }
  setX(e) {
    return this.x = e, this
  }
  setY(e) {
    return this.y = e, this
  }
  setZ(e) {
    return this.z = e, this
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      default:
        throw new Error("THREE.Vector3: index is out of range: " + e)
    }
    return this
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("THREE.Vector3: index is out of range: " + e)
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z)
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this
  }
  multiplyVectors(e, t) {
    return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this
  }
  applyEuler(e) {
    return this.applyQuaternion(wl.setFromEuler(e))
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(wl.setFromAxisAngle(e, t))
  }
  applyMatrix3(e) {
    const t = this.x,
      n = this.y,
      i = this.z,
      r = e.elements;
    return this.x = r[0] * t + r[3] * n + r[6] * i, this.y = r[1] * t + r[4] * n + r[7] * i, this.z = r[2] * t + r[5] * n + r[8] * i, this
  }
  applyNormalMatrix(e) {
    return this.applyMatrix3(e).normalize()
  }
  applyMatrix4(e) {
    const t = this.x,
      n = this.y,
      i = this.z,
      r = e.elements,
      a = 1 / (r[3] * t + r[7] * n + r[11] * i + r[15]);
    return this.x = (r[0] * t + r[4] * n + r[8] * i + r[12]) * a, this.y = (r[1] * t + r[5] * n + r[9] * i + r[13]) * a, this.z = (r[2] * t + r[6] * n + r[10] * i + r[14]) * a, this
  }
  applyQuaternion(e) {
    const t = this.x,
      n = this.y,
      i = this.z,
      r = e.x,
      a = e.y,
      o = e.z,
      l = e.w,
      c = 2 * (a * i - o * n),
      h = 2 * (o * t - r * i),
      u = 2 * (r * n - a * t);
    return this.x = t + l * c + a * u - o * h, this.y = n + l * h + o * c - r * u, this.z = i + l * u + r * h - a * c, this
  }
  project(e) {
    return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)
  }
  unproject(e) {
    return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)
  }
  transformDirection(e) {
    const t = this.x,
      n = this.y,
      i = this.z,
      r = e.elements;
    return this.x = r[0] * t + r[4] * n + r[8] * i, this.y = r[1] * t + r[5] * n + r[9] * i, this.z = r[2] * t + r[6] * n + r[10] * i, this.normalize()
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e)
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this
  }
  clamp(e, t) {
    return this.x = Ke(this.x, e.x, t.x), this.y = Ke(this.y, e.y, t.y), this.z = Ke(this.z, e.z, t.z), this
  }
  clampScalar(e, t) {
    return this.x = Ke(this.x, e, t), this.y = Ke(this.y, e, t), this.z = Ke(this.z, e, t), this
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ke(n, e, t))
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
  }
  normalize() {
    return this.divideScalar(this.length() || 1)
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e)
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this
  }
  cross(e) {
    return this.crossVectors(this, e)
  }
  crossVectors(e, t) {
    const n = e.x,
      i = e.y,
      r = e.z,
      a = t.x,
      o = t.y,
      l = t.z;
    return this.x = i * l - r * o, this.y = r * a - n * l, this.z = n * o - i * a, this
  }
  projectOnVector(e) {
    const t = e.lengthSq();
    if (t === 0) return this.set(0, 0, 0);
    const n = e.dot(this) / t;
    return this.copy(e).multiplyScalar(n)
  }
  projectOnPlane(e) {
    return Yr.copy(this).projectOnVector(e), this.sub(Yr)
  }
  reflect(e) {
    return this.sub(Yr.copy(e).multiplyScalar(2 * this.dot(e)))
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(Ke(n, -1, 1))
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e))
  }
  distanceToSquared(e) {
    const t = this.x - e.x,
      n = this.y - e.y,
      i = this.z - e.z;
    return t * t + n * n + i * i
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z)
  }
  setFromSpherical(e) {
    return this.setFromSphericalCoords(e.radius, e.phi, e.theta)
  }
  setFromSphericalCoords(e, t, n) {
    const i = Math.sin(t) * e;
    return this.x = i * Math.sin(n), this.y = Math.cos(t) * e, this.z = i * Math.cos(n), this
  }
  setFromCylindrical(e) {
    return this.setFromCylindricalCoords(e.radius, e.theta, e.y)
  }
  setFromCylindricalCoords(e, t, n) {
    return this.x = e * Math.sin(t), this.y = n, this.z = e * Math.cos(t), this
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this
  }
  setFromMatrixScale(e) {
    const t = this.setFromMatrixColumn(e, 0).length(),
      n = this.setFromMatrixColumn(e, 1).length(),
      i = this.setFromMatrixColumn(e, 2).length();
    return this.x = t, this.y = n, this.z = i, this
  }
  setFromMatrixColumn(e, t) {
    return this.fromArray(e.elements, t * 4)
  }
  setFromMatrix3Column(e, t) {
    return this.fromArray(e.elements, t * 3)
  }
  setFromEuler(e) {
    return this.x = e._x, this.y = e._y, this.z = e._z, this
  }
  setFromColor(e) {
    return this.x = e.r, this.y = e.g, this.z = e.b, this
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this
  }
  randomDirection() {
    const e = Math.random() * Math.PI * 2,
      t = Math.random() * 2 - 1,
      n = Math.sqrt(1 - t * t);
    return this.x = n * Math.cos(e), this.y = t, this.z = n * Math.sin(e), this
  }*[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z
  }
};
il.prototype.isVector3 = !0;
let N = il;
const Yr = new N,
  wl = new en,
  sl = class sl {
    constructor(e, t, n, i, r, a, o, l, c) {
      this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1], e !== void 0 && this.set(e, t, n, i, r, a, o, l, c)
    }
    set(e, t, n, i, r, a, o, l, c) {
      const h = this.elements;
      return h[0] = e, h[1] = i, h[2] = o, h[3] = t, h[4] = r, h[5] = l, h[6] = n, h[7] = a, h[8] = c, this
    }
    identity() {
      return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this
    }
    copy(e) {
      const t = this.elements,
        n = e.elements;
      return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this
    }
    extractBasis(e, t, n) {
      return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this
    }
    setFromMatrix4(e) {
      const t = e.elements;
      return this.set(t[0], t[4], t[8], t[1], t[5], t[9], t[2], t[6], t[10]), this
    }
    multiply(e) {
      return this.multiplyMatrices(this, e)
    }
    premultiply(e) {
      return this.multiplyMatrices(e, this)
    }
    multiplyMatrices(e, t) {
      const n = e.elements,
        i = t.elements,
        r = this.elements,
        a = n[0],
        o = n[3],
        l = n[6],
        c = n[1],
        h = n[4],
        u = n[7],
        d = n[2],
        f = n[5],
        p = n[8],
        x = i[0],
        m = i[3],
        g = i[6],
        M = i[1],
        E = i[4],
        v = i[7],
        A = i[2],
        b = i[5],
        _ = i[8];
      return r[0] = a * x + o * M + l * A, r[3] = a * m + o * E + l * b, r[6] = a * g + o * v + l * _, r[1] = c * x + h * M + u * A, r[4] = c * m + h * E + u * b, r[7] = c * g + h * v + u * _, r[2] = d * x + f * M + p * A, r[5] = d * m + f * E + p * b, r[8] = d * g + f * v + p * _, this
    }
    multiplyScalar(e) {
      const t = this.elements;
      return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this
    }
    determinant() {
      const e = this.elements,
        t = e[0],
        n = e[1],
        i = e[2],
        r = e[3],
        a = e[4],
        o = e[5],
        l = e[6],
        c = e[7],
        h = e[8];
      return t * a * h - t * o * c - n * r * h + n * o * l + i * r * c - i * a * l
    }
    invert() {
      const e = this.elements,
        t = e[0],
        n = e[1],
        i = e[2],
        r = e[3],
        a = e[4],
        o = e[5],
        l = e[6],
        c = e[7],
        h = e[8],
        u = h * a - o * c,
        d = o * l - h * r,
        f = c * r - a * l,
        p = t * u + n * d + i * f;
      if (p === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      const x = 1 / p;
      return e[0] = u * x, e[1] = (i * c - h * n) * x, e[2] = (o * n - i * a) * x, e[3] = d * x, e[4] = (h * t - i * l) * x, e[5] = (i * r - o * t) * x, e[6] = f * x, e[7] = (n * l - c * t) * x, e[8] = (a * t - n * r) * x, this
    }
    transpose() {
      let e;
      const t = this.elements;
      return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this
    }
    getNormalMatrix(e) {
      return this.setFromMatrix4(e).invert().transpose()
    }
    transposeIntoArray(e) {
      const t = this.elements;
      return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this
    }
    setUvTransform(e, t, n, i, r, a, o) {
      const l = Math.cos(r),
        c = Math.sin(r);
      return this.set(n * l, n * c, -n * (l * a + c * o) + a + e, -i * c, i * l, -i * (-c * a + l * o) + o + t, 0, 0, 1), this
    }
    scale(e, t) {
      return Fi("Matrix3: .scale() is deprecated. Use .makeScale() instead."), this.premultiply(Kr.makeScale(e, t)), this
    }
    rotate(e) {
      return Fi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."), this.premultiply(Kr.makeRotation(-e)), this
    }
    translate(e, t) {
      return Fi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."), this.premultiply(Kr.makeTranslation(e, t)), this
    }
    makeTranslation(e, t) {
      return e.isVector2 ? this.set(1, 0, e.x, 0, 1, e.y, 0, 0, 1) : this.set(1, 0, e, 0, 1, t, 0, 0, 1), this
    }
    makeRotation(e) {
      const t = Math.cos(e),
        n = Math.sin(e);
      return this.set(t, -n, 0, n, t, 0, 0, 0, 1), this
    }
    makeScale(e, t) {
      return this.set(e, 0, 0, 0, t, 0, 0, 0, 1), this
    }
    equals(e) {
      const t = this.elements,
        n = e.elements;
      for (let i = 0; i < 9; i++)
        if (t[i] !== n[i]) return !1;
      return !0
    }
    fromArray(e, t = 0) {
      for (let n = 0; n < 9; n++) this.elements[n] = e[n + t];
      return this
    }
    toArray(e = [], t = 0) {
      const n = this.elements;
      return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e
    }
    clone() {
      return new this.constructor().fromArray(this.elements)
    }
  };
sl.prototype.isMatrix3 = !0;
let He = sl;
const Kr = new He,
  Rl = new He().set(.4123908, .3575843, .1804808, .212639, .7151687, .0721923, .0193308, .1191948, .9505322),
  Cl = new He().set(3.2409699, -1.5373832, -.4986108, -.9692436, 1.8759675, .0415551, .0556301, -.203977, 1.0569715);

function Ld() {
  const s = {
      enabled: !0,
      workingColorSpace: Xt,
      spaces: {},
      convert: function(i, r, a) {
        return this.enabled === !1 || r === a || !r || !a || (this.spaces[r].transfer === ct && (i.r = Fn(i.r), i.g = Fn(i.g), i.b = Fn(i.b)), this.spaces[r].primaries !== this.spaces[a].primaries && (i.applyMatrix3(this.spaces[r].toXYZ), i.applyMatrix3(this.spaces[a].fromXYZ)), this.spaces[a].transfer === ct && (i.r = Oi(i.r), i.g = Oi(i.g), i.b = Oi(i.b))), i
      },
      workingToColorSpace: function(i, r) {
        return this.convert(i, this.workingColorSpace, r)
      },
      colorSpaceToWorking: function(i, r) {
        return this.convert(i, r, this.workingColorSpace)
      },
      getPrimaries: function(i) {
        return this.spaces[i].primaries
      },
      getTransfer: function(i) {
        return i === Yn ? Ar : this.spaces[i].transfer
      },
      getToneMappingMode: function(i) {
        return this.spaces[i].outputColorSpaceConfig.toneMappingMode || "standard"
      },
      getLuminanceCoefficients: function(i, r = this.workingColorSpace) {
        return i.fromArray(this.spaces[r].luminanceCoefficients)
      },
      define: function(i) {
        Object.assign(this.spaces, i)
      },
      _getMatrix: function(i, r, a) {
        return i.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)
      },
      _getDrawingBufferColorSpace: function(i) {
        return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace
      },
      _getUnpackColorSpace: function(i = this.workingColorSpace) {
        return this.spaces[i].workingColorSpaceConfig.unpackColorSpace
      }
    },
    e = [.64, .33, .3, .6, .15, .06],
    t = [.2126, .7152, .0722],
    n = [.3127, .329];
  return s.define({
    [Xt]: {
      primaries: e,
      whitePoint: n,
      transfer: Ar,
      toXYZ: Rl,
      fromXYZ: Cl,
      luminanceCoefficients: t,
      workingColorSpaceConfig: {
        unpackColorSpace: bt
      },
      outputColorSpaceConfig: {
        drawingBufferColorSpace: bt
      }
    },
    [bt]: {
      primaries: e,
      whitePoint: n,
      transfer: ct,
      toXYZ: Rl,
      fromXYZ: Cl,
      luminanceCoefficients: t,
      outputColorSpaceConfig: {
        drawingBufferColorSpace: bt
      }
    }
  }), s
}
const Qe = Ld();

function Fn(s) {
  return s < .04045 ? s * .0773993808 : Math.pow(s * .9478672986 + .0521327014, 2.4)
}

function Oi(s) {
  return s < .0031308 ? s * 12.92 : 1.055 * Math.pow(s, .41666) - .055
}
let mi;
class Pd {
  static getDataURL(e, t = "image/png") {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u") return e.src;
    let n;
    if (e instanceof HTMLCanvasElement) n = e;
    else {
      mi === void 0 && (mi = bs("canvas")), mi.width = e.width, mi.height = e.height;
      const i = mi.getContext("2d");
      e instanceof ImageData ? i.putImageData(e, 0, 0) : i.drawImage(e, 0, 0, e.width, e.height), n = mi
    }
    return n.toDataURL(t)
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = bs("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const i = n.getImageData(0, 0, e.width, e.height),
        r = i.data;
      for (let a = 0; a < r.length; a++) r[a] = Fn(r[a] / 255) * 255;
      return n.putImageData(i, 0, 0), t
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++) t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(Fn(t[n] / 255) * 255) : t[n] = Fn(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      }
    } else return Ce("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e
  }
}
let Id = 0;
class zo {
  constructor(e = null) {
    this.isTextureSource = !0, Object.defineProperty(this, "id", {
      value: Id++
    }), this.uuid = hn(), this.data = e, this.dataReady = !0, this.version = 0
  }
  getSize(e) {
    const t = this.data;
    return typeof HTMLVideoElement < "u" && t instanceof HTMLVideoElement ? e.set(t.videoWidth, t.videoHeight, 0) : typeof VideoFrame < "u" && t instanceof VideoFrame ? e.set(t.displayWidth, t.displayHeight, 0) : t !== null ? e.set(t.width || 0, t.height || 0, t.depth || 0) : e.set(0, 0, 0), e
  }
  set needsUpdate(e) {
    e === !0 && this.version++
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
    const n = {
        uuid: this.uuid,
        url: ""
      },
      i = this.data;
    if (i !== null) {
      let r;
      if (Array.isArray(i)) {
        r = [];
        for (let a = 0, o = i.length; a < o; a++) i[a].isDataTexture ? r.push(Jr(i[a].image)) : r.push(Jr(i[a]))
      } else r = Jr(i);
      n.url = r
    }
    return t || (e.images[this.uuid] = n), n
  }
}

function Jr(s) {
  return typeof HTMLImageElement < "u" && s instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && s instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && s instanceof ImageBitmap ? Pd.getDataURL(s) : s.data ? {
    data: Array.from(s.data),
    width: s.width,
    height: s.height,
    type: s.data.constructor.name
  } : (Ce("Texture: Unable to serialize Texture."), {})
}
let Nd = 0;
const Zr = new N;
class vt extends jn {
  constructor(e = vt.DEFAULT_IMAGE, t = vt.DEFAULT_MAPPING, n = on, i = on, r = Ct, a = vn, o = ln, l = Jt, c = vt.DEFAULT_ANISOTROPY, h = Yn) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", {
      value: Nd++
    }), this.uuid = hn(), this.name = "", this.source = new zo(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = n, this.wrapT = i, this.magFilter = r, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new re(0, 0), this.repeat = new re(1, 1), this.center = new re(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new He, this.generateMipmaps = !0, this.mipmapsAutoUpdate = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(e && e.depth && e.depth > 1), this.pmremVersion = 0, this.isPMREMTexture = !1, this.normalized = !1
  }
  get width() {
    return this.source.getSize(Zr).x
  }
  get height() {
    return this.source.getSize(Zr).y
  }
  get depth() {
    return this.source.getSize(Zr).z
  }
  get image() {
    return this.source.data
  }
  set image(e) {
    this.source.data = e
  }
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y)
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({
      start: e,
      count: t
    })
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0
  }
  clone() {
    return new this.constructor().copy(this)
  }
  copy(e) {
    return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.normalized = e.normalized, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.mipmapsAutoUpdate = e.mipmapsAutoUpdate, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.renderTarget = e.renderTarget, this.isRenderTargetTexture = e.isRenderTargetTexture, this.isPMREMTexture = e.isPMREMTexture, this.isArrayTexture = e.isArrayTexture, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this
  }
  setValues(e) {
    for (const t in e) {
      const n = e[t];
      if (n === void 0) {
        Ce(`Texture.setValues(): parameter '${t}' has value of undefined.`);
        continue
      }
      const i = this[t];
      if (i === void 0) {
        Ce(`Texture.setValues(): property '${t}' does not exist.`);
        continue
      }
      i && n && i.isVector2 && n.isVector2 || i && n && i.isVector3 && n.isVector3 || i && n && i.isMatrix3 && n.isMatrix3 ? i.copy(n) : this[t] = n
    }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.textures[this.uuid] !== void 0) return e.textures[this.uuid];
    const n = {
      metadata: {
        version: 4.7,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(e).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      normalized: this.normalized,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      mipmapsAutoUpdate: this.mipmapsAutoUpdate,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    return Object.keys(this.userData).length > 0 && (n.userData = this.userData), t || (e.textures[this.uuid] = n), n
  }
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    })
  }
  transformUv(e) {
    if (this.mapping !== rh) return e;
    if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1) switch (this.wrapS) {
      case zi:
        e.x = e.x - Math.floor(e.x);
        break;
      case on:
        e.x = e.x < 0 ? 0 : 1;
        break;
      case yr:
        Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
        break
    }
    if (e.y < 0 || e.y > 1) switch (this.wrapT) {
      case zi:
        e.y = e.y - Math.floor(e.y);
        break;
      case on:
        e.y = e.y < 0 ? 0 : 1;
        break;
      case yr:
        Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y);
        break
    }
    return this.flipY && (e.y = 1 - e.y), e
  }
  set needsUpdate(e) {
    e === !0 && (this.version++, this.source.needsUpdate = !0)
  }
  set needsPMREMUpdate(e) {
    e === !0 && this.pmremVersion++
  }
}
vt.DEFAULT_IMAGE = null;
vt.DEFAULT_MAPPING = rh;
vt.DEFAULT_ANISOTROPY = 1;
const rl = class rl {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    this.x = e, this.y = t, this.z = n, this.w = i
  }
  get width() {
    return this.z
  }
  set width(e) {
    this.z = e
  }
  get height() {
    return this.w
  }
  set height(e) {
    this.w = e
  }
  set(e, t, n, i) {
    return this.x = e, this.y = t, this.z = n, this.w = i, this
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this.w = e, this
  }
  setX(e) {
    return this.x = e, this
  }
  setY(e) {
    return this.y = e, this
  }
  setZ(e) {
    return this.z = e, this
  }
  setW(e) {
    return this.w = e, this
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      case 3:
        this.w = t;
        break;
      default:
        throw new Error("THREE.Vector4: index is out of range: " + e)
    }
    return this
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("THREE.Vector4: index is out of range: " + e)
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w)
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w !== void 0 ? e.w : 1, this
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this.w += e, this
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this
  }
  applyMatrix4(e) {
    const t = this.x,
      n = this.y,
      i = this.z,
      r = this.w,
      a = e.elements;
    return this.x = a[0] * t + a[4] * n + a[8] * i + a[12] * r, this.y = a[1] * t + a[5] * n + a[9] * i + a[13] * r, this.z = a[2] * t + a[6] * n + a[10] * i + a[14] * r, this.w = a[3] * t + a[7] * n + a[11] * i + a[15] * r, this
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this.w /= e.w, this
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e)
  }
  setAxisAngleFromQuaternion(e) {
    this.w = 2 * Math.acos(e.w);
    const t = Math.sqrt(1 - e.w * e.w);
    return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this
  }
  setAxisAngleFromRotationMatrix(e) {
    let t, n, i, r;
    const l = e.elements,
      c = l[0],
      h = l[4],
      u = l[8],
      d = l[1],
      f = l[5],
      p = l[9],
      x = l[2],
      m = l[6],
      g = l[10];
    if (Math.abs(h - d) < .01 && Math.abs(u - x) < .01 && Math.abs(p - m) < .01) {
      if (Math.abs(h + d) < .1 && Math.abs(u + x) < .1 && Math.abs(p + m) < .1 && Math.abs(c + f + g - 3) < .1) return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const E = (c + 1) / 2,
        v = (f + 1) / 2,
        A = (g + 1) / 2,
        b = (h + d) / 4,
        _ = (u + x) / 4,
        T = (p + m) / 4;
      return E > v && E > A ? E < .01 ? (n = 0, i = .707106781, r = .707106781) : (n = Math.sqrt(E), i = b / n, r = _ / n) : v > A ? v < .01 ? (n = .707106781, i = 0, r = .707106781) : (i = Math.sqrt(v), n = b / i, r = T / i) : A < .01 ? (n = .707106781, i = .707106781, r = 0) : (r = Math.sqrt(A), n = _ / r, i = T / r), this.set(n, i, r, t), this
    }
    let M = Math.sqrt((m - p) * (m - p) + (u - x) * (u - x) + (d - h) * (d - h));
    return Math.abs(M) < .001 && (M = 1), this.x = (m - p) / M, this.y = (u - x) / M, this.z = (d - h) / M, this.w = Math.acos((c + f + g - 1) / 2), this
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this.w = t[15], this
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this
  }
  clamp(e, t) {
    return this.x = Ke(this.x, e.x, t.x), this.y = Ke(this.y, e.y, t.y), this.z = Ke(this.z, e.z, t.z), this.w = Ke(this.w, e.w, t.w), this
  }
  clampScalar(e, t) {
    return this.x = Ke(this.x, e, t), this.y = Ke(this.y, e, t), this.z = Ke(this.z, e, t), this.w = Ke(this.w, e, t), this
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ke(n, e, t))
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w)
  }
  normalize() {
    return this.divideScalar(this.length() || 1)
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e)
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this.w = e.w + (t.w - e.w) * n, this
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this
  }*[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w
  }
};
rl.prototype.isVector4 = !0;
let ht = rl;
class Dd extends jn {
  constructor(e = 1, t = 1, n = {}) {
    super(), n = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: Ct,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveColorBuffer: !0,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      storeMultisampledColorBuffer: !0,
      storeMultisampledDepthBuffer: !0,
      storeMultisampledStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1,
      depth: 1,
      multiview: !1,
      useArrayDepthTexture: !1
    }, n), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = n.depth, this.scissor = new ht(0, 0, e, t), this.scissorTest = !1, this.viewport = new ht(0, 0, e, t), this.textures = [];
    const i = n.count;
    for (let r = 0; r < i; r++) this.textures[r] = new vt({
      width: e,
      height: t,
      depth: n.depth
    }), this.textures[r].isRenderTargetTexture = !0, this.textures[r].renderTarget = this;
    this._setTextureOptions(n), this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveColorBuffer = n.resolveColorBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this.storeMultisampledColorBuffer = n.storeMultisampledColorBuffer, this.storeMultisampledDepthBuffer = n.storeMultisampledDepthBuffer, this.storeMultisampledStencilBuffer = n.storeMultisampledStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview, this.useArrayDepthTexture = n.useArrayDepthTexture
  }
  _setTextureOptions(e = {}) {
    const t = {
      minFilter: Ct,
      generateMipmaps: !1,
      flipY: !1,
      internalFormat: null
    };
    e.mapping !== void 0 && (t.mapping = e.mapping), e.wrapS !== void 0 && (t.wrapS = e.wrapS), e.wrapT !== void 0 && (t.wrapT = e.wrapT), e.wrapR !== void 0 && (t.wrapR = e.wrapR), e.magFilter !== void 0 && (t.magFilter = e.magFilter), e.minFilter !== void 0 && (t.minFilter = e.minFilter), e.format !== void 0 && (t.format = e.format), e.type !== void 0 && (t.type = e.type), e.anisotropy !== void 0 && (t.anisotropy = e.anisotropy), e.colorSpace !== void 0 && (t.colorSpace = e.colorSpace), e.flipY !== void 0 && (t.flipY = e.flipY), e.generateMipmaps !== void 0 && (t.generateMipmaps = e.generateMipmaps), e.mipmapsAutoUpdate !== void 0 && (t.mipmapsAutoUpdate = e.mipmapsAutoUpdate), e.internalFormat !== void 0 && (t.internalFormat = e.internalFormat);
    for (let n = 0; n < this.textures.length; n++) this.textures[n].setValues(t)
  }
  get texture() {
    return this.textures[0]
  }
  set texture(e) {
    this.textures[0] = e
  }
  set depthTexture(e) {
    this._depthTexture !== null && this._depthTexture.renderTarget === this && (this._depthTexture.renderTarget = null), e !== null && e.renderTarget === null && (e.renderTarget = this), this._depthTexture = e
  }
  get depthTexture() {
    return this._depthTexture
  }
  setSize(e, t, n = 1) {
    if (this.width !== e || this.height !== t || this.depth !== n) {
      this.width = e, this.height = t, this.depth = n;
      for (let i = 0, r = this.textures.length; i < r; i++) this.textures[i].image.width = e, this.textures[i].image.height = t, this.textures[i].image.depth = n, this.textures[i].isData3DTexture !== !0 && (this.textures[i].isArrayTexture = this.textures[i].image.depth > 1);
      this.dispose()
    }
    this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t)
  }
  clone() {
    return new this.constructor().copy(this)
  }
  copy(e) {
    this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
    for (let t = 0, n = e.textures.length; t < n; t++) {
      this.textures[t] = e.textures[t].clone(), this.textures[t].isRenderTargetTexture = !0, this.textures[t].renderTarget = this;
      const i = Object.assign({}, e.textures[t].image);
      this.textures[t].source = new zo(i)
    }
    if (this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveColorBuffer = e.resolveColorBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, this.storeMultisampledColorBuffer = e.storeMultisampledColorBuffer, this.storeMultisampledDepthBuffer = e.storeMultisampledDepthBuffer, this.storeMultisampledStencilBuffer = e.storeMultisampledStencilBuffer, e.depthTexture !== null)
      if (e.depthTexture.renderTarget === e) {
        const t = e.depthTexture.clone();
        t.renderTarget = null, this.depthTexture = t
      } else this.depthTexture = e.depthTexture;
    else this.depthTexture = null;
    return this.samples = e.samples, this.multiview = e.multiview, this.useArrayDepthTexture = e.useArrayDepthTexture, this
  }
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    })
  }
}
class Mn extends Dd {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0
  }
}
class Mh extends vt {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = {
      data: e,
      width: t,
      height: n,
      depth: i
    }, this.magFilter = Rt, this.minFilter = Rt, this.wrapR = on, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = new Set
  }
  copy(e) {
    return super.copy(e), this.wrapR = e.wrapR, this
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e)
  }
  clearLayerUpdates() {
    this.layerUpdates.clear()
  }
}
class Ud extends vt {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isData3DTexture = !0, this.image = {
      data: e,
      width: t,
      height: n,
      depth: i
    }, this.magFilter = Rt, this.minFilter = Rt, this.wrapR = on, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1
  }
  copy(e) {
    return super.copy(e), this.wrapR = e.wrapR, this
  }
}
const Dr = class Dr {
  constructor(e, t, n, i, r, a, o, l, c, h, u, d, f, p, x, m) {
    this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], e !== void 0 && this.set(e, t, n, i, r, a, o, l, c, h, u, d, f, p, x, m)
  }
  set(e, t, n, i, r, a, o, l, c, h, u, d, f, p, x, m) {
    const g = this.elements;
    return g[0] = e, g[4] = t, g[8] = n, g[12] = i, g[1] = r, g[5] = a, g[9] = o, g[13] = l, g[2] = c, g[6] = h, g[10] = u, g[14] = d, g[3] = f, g[7] = p, g[11] = x, g[15] = m, this
  }
  identity() {
    return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
  }
  clone() {
    return new Dr().fromArray(this.elements)
  }
  copy(e) {
    const t = this.elements,
      n = e.elements;
    return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this
  }
  copyPosition(e) {
    const t = this.elements,
      n = e.elements;
    return t[12] = n[12], t[13] = n[13], t[14] = n[14], this
  }
  setFromMatrix3(e) {
    const t = e.elements;
    return this.set(t[0], t[3], t[6], 0, t[1], t[4], t[7], 0, t[2], t[5], t[8], 0, 0, 0, 0, 1), this
  }
  extractBasis(e, t, n) {
    return this.determinantAffine() === 0 ? (e.set(1, 0, 0), t.set(0, 1, 0), n.set(0, 0, 1), this) : (e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this)
  }
  makeBasis(e, t, n) {
    return this.set(e.x, t.x, n.x, 0, e.y, t.y, n.y, 0, e.z, t.z, n.z, 0, 0, 0, 0, 1), this
  }
  extractRotation(e) {
    if (e.determinantAffine() === 0) return this.identity();
    const t = this.elements,
      n = e.elements,
      i = 1 / gi.setFromMatrixColumn(e, 0).length(),
      r = 1 / gi.setFromMatrixColumn(e, 1).length(),
      a = 1 / gi.setFromMatrixColumn(e, 2).length();
    return t[0] = n[0] * i, t[1] = n[1] * i, t[2] = n[2] * i, t[3] = 0, t[4] = n[4] * r, t[5] = n[5] * r, t[6] = n[6] * r, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this
  }
  makeRotationFromEuler(e) {
    const t = this.elements,
      n = e.x,
      i = e.y,
      r = e.z,
      a = Math.cos(n),
      o = Math.sin(n),
      l = Math.cos(i),
      c = Math.sin(i),
      h = Math.cos(r),
      u = Math.sin(r);
    if (e.order === "XYZ") {
      const d = a * h,
        f = a * u,
        p = o * h,
        x = o * u;
      t[0] = l * h, t[4] = -l * u, t[8] = c, t[1] = f + p * c, t[5] = d - x * c, t[9] = -o * l, t[2] = x - d * c, t[6] = p + f * c, t[10] = a * l
    } else if (e.order === "YXZ") {
      const d = l * h,
        f = l * u,
        p = c * h,
        x = c * u;
      t[0] = d + x * o, t[4] = p * o - f, t[8] = a * c, t[1] = a * u, t[5] = a * h, t[9] = -o, t[2] = f * o - p, t[6] = x + d * o, t[10] = a * l
    } else if (e.order === "ZXY") {
      const d = l * h,
        f = l * u,
        p = c * h,
        x = c * u;
      t[0] = d - x * o, t[4] = -a * u, t[8] = p + f * o, t[1] = f + p * o, t[5] = a * h, t[9] = x - d * o, t[2] = -a * c, t[6] = o, t[10] = a * l
    } else if (e.order === "ZYX") {
      const d = a * h,
        f = a * u,
        p = o * h,
        x = o * u;
      t[0] = l * h, t[4] = p * c - f, t[8] = d * c + x, t[1] = l * u, t[5] = x * c + d, t[9] = f * c - p, t[2] = -c, t[6] = o * l, t[10] = a * l
    } else if (e.order === "YZX") {
      const d = a * l,
        f = a * c,
        p = o * l,
        x = o * c;
      t[0] = l * h, t[4] = x - d * u, t[8] = p * u + f, t[1] = u, t[5] = a * h, t[9] = -o * h, t[2] = -c * h, t[6] = f * u + p, t[10] = d - x * u
    } else if (e.order === "XZY") {
      const d = a * l,
        f = a * c,
        p = o * l,
        x = o * c;
      t[0] = l * h, t[4] = -u, t[8] = c * h, t[1] = d * u + x, t[5] = a * h, t[9] = f * u - p, t[2] = p * u - f, t[6] = o * h, t[10] = x * u + d
    }
    return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this
  }
  makeRotationFromQuaternion(e) {
    return this.compose(Fd, e, Od)
  }
  lookAt(e, t, n) {
    const i = this.elements;
    return qt.subVectors(e, t), qt.lengthSq() === 0 && (qt.z = 1), qt.normalize(), zn.crossVectors(n, qt), zn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? qt.x += 1e-4 : qt.z += 1e-4, qt.normalize(), zn.crossVectors(n, qt)), zn.normalize(), zs.crossVectors(qt, zn), i[0] = zn.x, i[4] = zs.x, i[8] = qt.x, i[1] = zn.y, i[5] = zs.y, i[9] = qt.y, i[2] = zn.z, i[6] = zs.z, i[10] = qt.z, this
  }
  multiply(e) {
    return this.multiplyMatrices(this, e)
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this)
  }
  multiplyMatrices(e, t) {
    const n = e.elements,
      i = t.elements,
      r = this.elements,
      a = n[0],
      o = n[4],
      l = n[8],
      c = n[12],
      h = n[1],
      u = n[5],
      d = n[9],
      f = n[13],
      p = n[2],
      x = n[6],
      m = n[10],
      g = n[14],
      M = n[3],
      E = n[7],
      v = n[11],
      A = n[15],
      b = i[0],
      _ = i[4],
      T = i[8],
      I = i[12],
      R = i[1],
      D = i[5],
      F = i[9],
      V = i[13],
      L = i[2],
      k = i[6],
      X = i[10],
      H = i[14],
      te = i[3],
      W = i[7],
      Q = i[11],
      ee = i[15];
    return r[0] = a * b + o * R + l * L + c * te, r[4] = a * _ + o * D + l * k + c * W, r[8] = a * T + o * F + l * X + c * Q, r[12] = a * I + o * V + l * H + c * ee, r[1] = h * b + u * R + d * L + f * te, r[5] = h * _ + u * D + d * k + f * W, r[9] = h * T + u * F + d * X + f * Q, r[13] = h * I + u * V + d * H + f * ee, r[2] = p * b + x * R + m * L + g * te, r[6] = p * _ + x * D + m * k + g * W, r[10] = p * T + x * F + m * X + g * Q, r[14] = p * I + x * V + m * H + g * ee, r[3] = M * b + E * R + v * L + A * te, r[7] = M * _ + E * D + v * k + A * W, r[11] = M * T + E * F + v * X + A * Q, r[15] = M * I + E * V + v * H + A * ee, this
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this
  }
  determinant() {
    const e = this.elements,
      t = e[0],
      n = e[4],
      i = e[8],
      r = e[12],
      a = e[1],
      o = e[5],
      l = e[9],
      c = e[13],
      h = e[2],
      u = e[6],
      d = e[10],
      f = e[14],
      p = e[3],
      x = e[7],
      m = e[11],
      g = e[15],
      M = l * f - c * d,
      E = o * f - c * u,
      v = o * d - l * u,
      A = a * f - c * h,
      b = a * d - l * h,
      _ = a * u - o * h;
    return t * (x * M - m * E + g * v) - n * (p * M - m * A + g * b) + i * (p * E - x * A + g * _) - r * (p * v - x * b + m * _)
  }
  determinantAffine() {
    const e = this.elements,
      t = e[0],
      n = e[4],
      i = e[8],
      r = e[1],
      a = e[5],
      o = e[9],
      l = e[2],
      c = e[6],
      h = e[10];
    return t * (a * h - o * c) - n * (r * h - o * l) + i * (r * c - a * l)
  }
  transpose() {
    const e = this.elements;
    let t;
    return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this
  }
  setPosition(e, t, n) {
    const i = this.elements;
    return e.isVector3 ? (i[12] = e.x, i[13] = e.y, i[14] = e.z) : (i[12] = e, i[13] = t, i[14] = n), this
  }
  invert() {
    const e = this.elements,
      t = e[0],
      n = e[1],
      i = e[2],
      r = e[3],
      a = e[4],
      o = e[5],
      l = e[6],
      c = e[7],
      h = e[8],
      u = e[9],
      d = e[10],
      f = e[11],
      p = e[12],
      x = e[13],
      m = e[14],
      g = e[15],
      M = t * o - n * a,
      E = t * l - i * a,
      v = t * c - r * a,
      A = n * l - i * o,
      b = n * c - r * o,
      _ = i * c - r * l,
      T = h * x - u * p,
      I = h * m - d * p,
      R = h * g - f * p,
      D = u * m - d * x,
      F = u * g - f * x,
      V = d * g - f * m,
      L = M * V - E * F + v * D + A * R - b * I + _ * T;
    if (L === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const k = 1 / L;
    return e[0] = (o * V - l * F + c * D) * k, e[1] = (i * F - n * V - r * D) * k, e[2] = (x * _ - m * b + g * A) * k, e[3] = (d * b - u * _ - f * A) * k, e[4] = (l * R - a * V - c * I) * k, e[5] = (t * V - i * R + r * I) * k, e[6] = (m * v - p * _ - g * E) * k, e[7] = (h * _ - d * v + f * E) * k, e[8] = (a * F - o * R + c * T) * k, e[9] = (n * R - t * F - r * T) * k, e[10] = (p * b - x * v + g * M) * k, e[11] = (u * v - h * b - f * M) * k, e[12] = (o * I - a * D - l * T) * k, e[13] = (t * D - n * I + i * T) * k, e[14] = (x * E - p * A - m * M) * k, e[15] = (h * A - u * E + d * M) * k, this
  }
  scale(e) {
    const t = this.elements,
      n = e.x,
      i = e.y,
      r = e.z;
    return t[0] *= n, t[4] *= i, t[8] *= r, t[1] *= n, t[5] *= i, t[9] *= r, t[2] *= n, t[6] *= i, t[10] *= r, t[3] *= n, t[7] *= i, t[11] *= r, this
  }
  getMaxScaleOnAxis() {
    const e = this.elements,
      t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
      n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6],
      i = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
    return Math.sqrt(Math.max(t, n, i))
  }
  makeTranslation(e, t, n) {
    return e.isVector3 ? this.set(1, 0, 0, e.x, 0, 1, 0, e.y, 0, 0, 1, e.z, 0, 0, 0, 1) : this.set(1, 0, 0, e, 0, 1, 0, t, 0, 0, 1, n, 0, 0, 0, 1), this
  }
  makeRotationX(e) {
    const t = Math.cos(e),
      n = Math.sin(e);
    return this.set(1, 0, 0, 0, 0, t, -n, 0, 0, n, t, 0, 0, 0, 0, 1), this
  }
  makeRotationY(e) {
    const t = Math.cos(e),
      n = Math.sin(e);
    return this.set(t, 0, n, 0, 0, 1, 0, 0, -n, 0, t, 0, 0, 0, 0, 1), this
  }
  makeRotationZ(e) {
    const t = Math.cos(e),
      n = Math.sin(e);
    return this.set(t, -n, 0, 0, n, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
  }
  makeRotationAxis(e, t) {
    const n = Math.cos(t),
      i = Math.sin(t),
      r = 1 - n,
      a = e.x,
      o = e.y,
      l = e.z,
      c = r * a,
      h = r * o;
    return this.set(c * a + n, c * o - i * l, c * l + i * o, 0, c * o + i * l, h * o + n, h * l - i * a, 0, c * l - i * o, h * l + i * a, r * l * l + n, 0, 0, 0, 0, 1), this
  }
  makeScale(e, t, n) {
    return this.set(e, 0, 0, 0, 0, t, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this
  }
  makeShear(e, t, n, i, r, a) {
    return this.set(1, n, r, 0, e, 1, a, 0, t, i, 1, 0, 0, 0, 0, 1), this
  }
  compose(e, t, n) {
    const i = this.elements,
      r = t._x,
      a = t._y,
      o = t._z,
      l = t._w,
      c = r + r,
      h = a + a,
      u = o + o,
      d = r * c,
      f = r * h,
      p = r * u,
      x = a * h,
      m = a * u,
      g = o * u,
      M = l * c,
      E = l * h,
      v = l * u,
      A = n.x,
      b = n.y,
      _ = n.z;
    return i[0] = (1 - (x + g)) * A, i[1] = (f + v) * A, i[2] = (p - E) * A, i[3] = 0, i[4] = (f - v) * b, i[5] = (1 - (d + g)) * b, i[6] = (m + M) * b, i[7] = 0, i[8] = (p + E) * _, i[9] = (m - M) * _, i[10] = (1 - (d + x)) * _, i[11] = 0, i[12] = e.x, i[13] = e.y, i[14] = e.z, i[15] = 1, this
  }
  decompose(e, t, n) {
    const i = this.elements;
    e.x = i[12], e.y = i[13], e.z = i[14];
    const r = this.determinantAffine();
    if (r === 0) return n.set(1, 1, 1), t.identity(), this;
    let a = gi.set(i[0], i[1], i[2]).length();
    const o = gi.set(i[4], i[5], i[6]).length(),
      l = gi.set(i[8], i[9], i[10]).length();
    r < 0 && (a = -a), nn.copy(this);
    const c = 1 / a,
      h = 1 / o,
      u = 1 / l;
    return nn.elements[0] *= c, nn.elements[1] *= c, nn.elements[2] *= c, nn.elements[4] *= h, nn.elements[5] *= h, nn.elements[6] *= h, nn.elements[8] *= u, nn.elements[9] *= u, nn.elements[10] *= u, t.setFromRotationMatrix(nn), n.x = a, n.y = o, n.z = l, this
  }
  makePerspective(e, t, n, i, r, a, o = cn, l = !1) {
    const c = this.elements,
      h = 2 * r / (t - e),
      u = 2 * r / (n - i),
      d = (t + e) / (t - e),
      f = (n + i) / (n - i);
    let p, x;
    if (l) p = r / (a - r), x = a * r / (a - r);
    else if (o === cn) p = -(a + r) / (a - r), x = -2 * a * r / (a - r);
    else if (o === Es) p = -a / (a - r), x = -a * r / (a - r);
    else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return c[0] = h, c[4] = 0, c[8] = d, c[12] = 0, c[1] = 0, c[5] = u, c[9] = f, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = p, c[14] = x, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this
  }
  makeOrthographic(e, t, n, i, r, a, o = cn, l = !1) {
    const c = this.elements,
      h = 2 / (t - e),
      u = 2 / (n - i),
      d = -(t + e) / (t - e),
      f = -(n + i) / (n - i);
    let p, x;
    if (l) p = 1 / (a - r), x = a / (a - r);
    else if (o === cn) p = -2 / (a - r), x = -(a + r) / (a - r);
    else if (o === Es) p = -1 / (a - r), x = -r / (a - r);
    else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return c[0] = h, c[4] = 0, c[8] = 0, c[12] = d, c[1] = 0, c[5] = u, c[9] = 0, c[13] = f, c[2] = 0, c[6] = 0, c[10] = p, c[14] = x, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this
  }
  equals(e) {
    const t = this.elements,
      n = e.elements;
    for (let i = 0; i < 16; i++)
      if (t[i] !== n[i]) return !1;
    return !0
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 16; n++) this.elements[n] = e[n + t];
    return this
  }
  toArray(e = [], t = 0) {
    const n = this.elements;
    return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e
  }
};
Dr.prototype.isMatrix4 = !0;
let We = Dr;
const gi = new N,
  nn = new We,
  Fd = new N(0, 0, 0),
  Od = new N(1, 1, 1),
  zn = new N,
  zs = new N,
  qt = new N,
  Ll = new We,
  Pl = new en;
class Tn {
  constructor(e = 0, t = 0, n = 0, i = Tn.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = e, this._y = t, this._z = n, this._order = i
  }
  get x() {
    return this._x
  }
  set x(e) {
    this._x = e, this._onChangeCallback()
  }
  get y() {
    return this._y
  }
  set y(e) {
    this._y = e, this._onChangeCallback()
  }
  get z() {
    return this._z
  }
  set z(e) {
    this._z = e, this._onChangeCallback()
  }
  get order() {
    return this._order
  }
  set order(e) {
    this._order = e, this._onChangeCallback()
  }
  set(e, t, n, i = this._order) {
    return this._x = e, this._y = t, this._z = n, this._order = i, this._onChangeCallback(), this
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order)
  }
  copy(e) {
    return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this
  }
  setFromRotationMatrix(e, t = this._order, n = !0) {
    const i = e.elements,
      r = i[0],
      a = i[4],
      o = i[8],
      l = i[1],
      c = i[5],
      h = i[9],
      u = i[2],
      d = i[6],
      f = i[10];
    switch (t) {
      case "XYZ":
        this._y = Math.asin(Ke(o, -1, 1)), Math.abs(o) < .9999999 ? (this._x = Math.atan2(-h, f), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(d, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Ke(h, -1, 1)), Math.abs(h) < .9999999 ? (this._y = Math.atan2(o, f), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-u, r), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Ke(d, -1, 1)), Math.abs(d) < .9999999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, r));
        break;
      case "ZYX":
        this._y = Math.asin(-Ke(u, -1, 1)), Math.abs(u) < .9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-a, c));
        break;
      case "YZX":
        this._z = Math.asin(Ke(l, -1, 1)), Math.abs(l) < .9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-u, r)) : (this._x = 0, this._y = Math.atan2(o, f));
        break;
      case "XZY":
        this._z = Math.asin(-Ke(a, -1, 1)), Math.abs(a) < .9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-h, f), this._y = 0);
        break;
      default:
        Ce("Euler: .setFromRotationMatrix() encountered an unknown order: " + t)
    }
    return this._order = t, n === !0 && this._onChangeCallback(), this
  }
  setFromQuaternion(e, t, n) {
    return Ll.makeRotationFromQuaternion(e), this.setFromRotationMatrix(Ll, t, n)
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t)
  }
  reorder(e) {
    return Pl.setFromEuler(this), this.setFromQuaternion(Pl, e)
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order
  }
  fromArray(e) {
    return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e
  }
  _onChange(e) {
    return this._onChangeCallback = e, this
  }
  _onChangeCallback() {}*[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order
  }
}
Tn.DEFAULT_ORDER = "XYZ";
class ko {
  constructor() {
    this.mask = 1
  }
  set(e) {
    this.mask = (1 << e | 0) >>> 0
  }
  enable(e) {
    this.mask |= 1 << e | 0
  }
  enableAll() {
    this.mask = -1
  }
  toggle(e) {
    this.mask ^= 1 << e | 0
  }
  disable(e) {
    this.mask &= ~(1 << e | 0)
  }
  disableAll() {
    this.mask = 0
  }
  test(e) {
    return (this.mask & e.mask) !== 0
  }
  isEnabled(e) {
    return (this.mask & (1 << e | 0)) !== 0
  }
}
let Bd = 0;
const Il = new N,
  _i = new en,
  wn = new We,
  ks = new N,
  Qi = new N,
  zd = new N,
  kd = new en,
  Nl = new N(1, 0, 0),
  Dl = new N(0, 1, 0),
  Ul = new N(0, 0, 1),
  Fl = {
    type: "added"
  },
  Hd = {
    type: "removed"
  },
  xi = {
    type: "childadded",
    child: null
  },
  $r = {
    type: "childremoved",
    child: null
  };
class gt extends jn {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", {
      value: Bd++
    }), this.uuid = hn(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = gt.DEFAULT_UP.clone();
    const e = new N,
      t = new Tn,
      n = new en,
      i = new N(1, 1, 1);

    function r() {
      n.setFromEuler(t, !1)
    }

    function a() {
      t.setFromQuaternion(n, void 0, !1)
    }
    t._onChange(r), n._onChange(a), Object.defineProperties(this, {
      position: {
        configurable: !0,
        enumerable: !0,
        value: e
      },
      rotation: {
        configurable: !0,
        enumerable: !0,
        value: t
      },
      quaternion: {
        configurable: !0,
        enumerable: !0,
        value: n
      },
      scale: {
        configurable: !0,
        enumerable: !0,
        value: i
      },
      modelViewMatrix: {
        value: new We
      },
      normalMatrix: {
        value: new He
      }
    }), this.matrix = new We, this.matrixWorld = new We, this.matrixAutoUpdate = gt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new ko, this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.static = !1, this.userData = {}, this.pivot = null
  }
  onBeforeShadow() {}
  onAfterShadow() {}
  onBeforeRender() {}
  onAfterRender() {}
  applyMatrix4(e) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale), this.pivot !== null && this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)
  }
  applyQuaternion(e) {
    return this.quaternion.premultiply(e), this
  }
  setRotationFromAxisAngle(e, t) {
    this.quaternion.setFromAxisAngle(e, t)
  }
  setRotationFromEuler(e) {
    this.quaternion.setFromEuler(e, !0)
  }
  setRotationFromMatrix(e) {
    this.quaternion.setFromRotationMatrix(e)
  }
  setRotationFromQuaternion(e) {
    this.quaternion.copy(e)
  }
  rotateOnAxis(e, t) {
    return _i.setFromAxisAngle(e, t), this.quaternion.multiply(_i), this
  }
  rotateOnWorldAxis(e, t) {
    return _i.setFromAxisAngle(e, t), this.quaternion.premultiply(_i), this
  }
  rotateX(e) {
    return this.rotateOnAxis(Nl, e)
  }
  rotateY(e) {
    return this.rotateOnAxis(Dl, e)
  }
  rotateZ(e) {
    return this.rotateOnAxis(Ul, e)
  }
  translateOnAxis(e, t) {
    return Il.copy(e).applyQuaternion(this.quaternion), this.position.add(Il.multiplyScalar(t)), this
  }
  translateX(e) {
    return this.translateOnAxis(Nl, e)
  }
  translateY(e) {
    return this.translateOnAxis(Dl, e)
  }
  translateZ(e) {
    return this.translateOnAxis(Ul, e)
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld)
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(wn.copy(this.matrixWorld).invert())
  }
  lookAt(e, t, n) {
    e.isVector3 ? ks.copy(e) : ks.set(e, t, n);
    const i = this.parent;
    this.updateWorldMatrix(!0, !1), Qi.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? wn.lookAt(Qi, ks, this.up) : wn.lookAt(ks, Qi, this.up), this.quaternion.setFromRotationMatrix(wn), i && (wn.extractRotation(i.matrixWorld), _i.setFromRotationMatrix(wn), this.quaternion.premultiply(_i.invert()))
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++) this.add(arguments[t]);
      return this
    }
    return e === this ? (ze("Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(Fl), xi.child = e, this.dispatchEvent(xi), xi.child = null) : ze("Object3D.add: object not an instance of THREE.Object3D.", e), this)
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
      return this
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Hd), $r.child = e, this.dispatchEvent($r), $r.child = null), this
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this
  }
  clear() {
    return this.remove(...this.children)
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), wn.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), wn.multiply(e.parent.matrixWorld)), e.applyMatrix4(wn), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(Fl), xi.child = e, this.dispatchEvent(xi), xi.child = null, this
  }
  getObjectById(e) {
    return this.getObjectByProperty("id", e)
  }
  getObjectByName(e) {
    return this.getObjectByProperty("name", e)
  }
  getObjectByProperty(e, t) {
    if (this[e] === t) return this;
    for (let n = 0, i = this.children.length; n < i; n++) {
      const a = this.children[n].getObjectByProperty(e, t);
      if (a !== void 0) return a
    }
  }
  getObjectsByProperty(e, t, n = []) {
    this[e] === t && n.push(this);
    const i = this.children;
    for (let r = 0, a = i.length; r < a; r++) i[r].getObjectsByProperty(e, t, n);
    return n
  }
  getWorldPosition(e) {
    return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld)
  }
  getWorldQuaternion(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Qi, e, zd), e
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Qi, kd, e), e
  }
  getWorldDirection(e) {
    this.updateWorldMatrix(!0, !1);
    const t = this.matrixWorld.elements;
    return e.set(t[8], t[9], t[10]).normalize()
  }
  raycast() {}
  intersectsFrustum() {
    return !0
  }
  traverse(e) {
    e(this);
    const t = this.children;
    for (let n = 0, i = t.length; n < i; n++) t[n].traverse(e)
  }
  traverseVisible(e) {
    if (this.visible === !1) return;
    e(this);
    const t = this.children;
    for (let n = 0, i = t.length; n < i; n++) t[n].traverseVisible(e)
  }
  traverseAncestors(e) {
    const t = this.parent;
    t !== null && (e(t), t.traverseAncestors(e))
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale);
    const e = this.pivot;
    if (e !== null) {
      const t = e.x,
        n = e.y,
        i = e.z,
        r = this.matrix.elements;
      r[12] += t - r[0] * t - r[4] * n - r[8] * i, r[13] += n - r[1] * t - r[5] * n - r[9] * i, r[14] += i - r[2] * t - r[6] * n - r[10] * i
    }
    this.matrixWorldNeedsUpdate = !0
  }
  updateMatrixWorld(e) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, e = !0);
    const t = this.children;
    for (let n = 0, i = t.length; n < i; n++) t[n].updateMatrixWorld(e)
  }
  updateWorldMatrix(e, t, n = !1) {
    const i = this.parent;
    if (e === !0 && i !== null && i.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || n) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, n = !0), t === !0) {
      const r = this.children;
      for (let a = 0, o = r.length; a < o; a++) r[a].updateWorldMatrix(!1, !0, n)
    }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string",
      n = {};
    t && (e = {
      geometries: {},
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      skeletons: {},
      animations: {},
      nodes: {}
    }, n.metadata = {
      version: 4.7,
      type: "Object",
      generator: "Object3D.toJSON"
    });
    const i = {};
    i.uuid = this.uuid, i.type = this.type, i.name = this.name, i.castShadow = this.castShadow, i.receiveShadow = this.receiveShadow, i.visible = this.visible, i.frustumCulled = this.frustumCulled, i.renderOrder = this.renderOrder, i.static = this.static, i.matrixAutoUpdate = this.matrixAutoUpdate, Object.keys(this.userData).length > 0 && (i.userData = this.userData), i.layers = this.layers.mask, i.matrix = this.matrix.toArray(), i.up = this.up.toArray(), this.pivot !== null && (i.pivot = this.pivot.toArray()), this.morphTargetDictionary !== void 0 && (i.morphTargetDictionary = Object.assign({}, this.morphTargetDictionary)), this.morphTargetInfluences !== void 0 && (i.morphTargetInfluences = this.morphTargetInfluences.slice()), this.isInstancedMesh && (i.type = "InstancedMesh", i.count = this.count, i.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (i.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (i.type = "BatchedMesh", i.perObjectFrustumCulled = this.perObjectFrustumCulled, i.sortObjects = this.sortObjects, i.drawRanges = this._drawRanges, i.reservedRanges = this._reservedRanges, i.geometryInfo = this._geometryInfo.map(o => ({
      ...o,
      boundingBox: o.boundingBox ? o.boundingBox.toJSON() : void 0,
      boundingSphere: o.boundingSphere ? o.boundingSphere.toJSON() : void 0
    })), i.instanceInfo = this._instanceInfo.map(o => ({
      ...o
    })), i.availableInstanceIds = this._availableInstanceIds.slice(), i.availableGeometryIds = this._availableGeometryIds.slice(), i.nextIndexStart = this._nextIndexStart, i.nextVertexStart = this._nextVertexStart, i.geometryCount = this._geometryCount, i.maxInstanceCount = this._maxInstanceCount, i.maxVertexCount = this._maxVertexCount, i.maxIndexCount = this._maxIndexCount, i.geometryInitialized = this._geometryInitialized, i.matricesTexture = this._matricesTexture.toJSON(e), i.indirectTexture = this._indirectTexture.toJSON(e), this._colorsTexture !== null && (i.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (i.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (i.boundingBox = this.boundingBox.toJSON()));

    function r(o, l) {
      return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(e)), l.uuid
    }
    if (this.isScene) this.background && (this.background.isColor ? i.background = this.background.toJSON() : this.background.isTexture && (i.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (i.environment = this.environment.toJSON(e).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      i.geometry = r(e.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const l = o.shapes;
        if (Array.isArray(l))
          for (let c = 0, h = l.length; c < h; c++) {
            const u = l[c];
            r(e.shapes, u)
          } else r(e.shapes, l)
      }
    }
    if (this.isSkinnedMesh && (i.bindMode = this.bindMode, i.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(e.skeletons, this.skeleton), i.skeleton = this.skeleton.uuid)), this.material !== void 0)
      if (Array.isArray(this.material)) {
        const o = [];
        for (let l = 0, c = this.material.length; l < c; l++) o.push(r(e.materials, this.material[l]));
        i.material = o
      } else i.material = r(e.materials, this.material);
    if (this.children.length > 0) {
      i.children = [];
      for (let o = 0; o < this.children.length; o++) i.children.push(this.children[o].toJSON(e).object)
    }
    if (this.animations.length > 0) {
      i.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const l = this.animations[o];
        i.animations.push(r(e.animations, l))
      }
    }
    if (t) {
      const o = a(e.geometries),
        l = a(e.materials),
        c = a(e.textures),
        h = a(e.images),
        u = a(e.shapes),
        d = a(e.skeletons),
        f = a(e.animations),
        p = a(e.nodes);
      o.length > 0 && (n.geometries = o), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), u.length > 0 && (n.shapes = u), d.length > 0 && (n.skeletons = d), f.length > 0 && (n.animations = f), p.length > 0 && (n.nodes = p)
    }
    return n.object = i, n;

    function a(o) {
      const l = [];
      for (const c in o) {
        const h = o[c];
        delete h.metadata, l.push(h)
      }
      return l
    }
  }
  clone(e) {
    return new this.constructor().copy(this, e)
  }
  copy(e, t = !0) {
    if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.pivot = e.pivot !== null ? e.pivot.clone() : null, this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.static = e.static, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0)
      for (let n = 0; n < e.children.length; n++) {
        const i = e.children[n];
        this.add(i.clone())
      }
    return this
  }
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    })
  }
}
gt.DEFAULT_UP = new N(0, 1, 0);
gt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
class ci extends gt {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group"
  }
}
const Gd = {
  type: "move"
};
class Qr {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new ci, this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = {
      pinching: !1
    }), this._hand
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new ci, this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new N, this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new N), this._targetRay
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new ci, this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new N, this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new N, this._grip.eventsEnabled = !1), this._grip
  }
  dispatchEvent(e) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this
  }
  connect(e) {
    if (e && e.hand) {
      const t = this._hand;
      if (t)
        for (const n of e.hand.values()) this._getHandJoint(t, n)
    }
    return this.dispatchEvent({
      type: "connected",
      data: e
    }), this
  }
  disconnect(e) {
    return this.dispatchEvent({
      type: "disconnected",
      data: e
    }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this
  }
  update(e, t, n) {
    let i = null,
      r = null,
      a = null;
    const o = this._targetRay,
      l = this._grip,
      c = this._hand;
    if (e && t.session.visibilityState !== "visible-blurred") {
      if (c && e.hand) {
        a = !0;
        for (const x of e.hand.values()) {
          const m = t.getJointPose(x, n),
            g = this._getHandJoint(c, x);
          m !== null && (g.matrix.fromArray(m.transform.matrix), g.matrix.decompose(g.position, g.quaternion, g.scale), g.matrixWorldNeedsUpdate = !0, g.jointRadius = m.radius), g.visible = m !== null
        }
        const h = c.joints["index-finger-tip"],
          u = c.joints["thumb-tip"],
          d = h.position.distanceTo(u.position),
          f = .02,
          p = .005;
        c.inputState.pinching && d > f + p ? (c.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: e.handedness,
          target: this
        })) : !c.inputState.pinching && d <= f - p && (c.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: e.handedness,
          target: this
        }))
      } else l !== null && e.gripSpace && (r = t.getPose(e.gripSpace, n), r !== null && (l.matrix.fromArray(r.transform.matrix), l.matrix.decompose(l.position, l.quaternion, l.scale), l.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(r.linearVelocity)) : l.hasLinearVelocity = !1, r.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(r.angularVelocity)) : l.hasAngularVelocity = !1, l.eventsEnabled && l.dispatchEvent({
        type: "gripUpdated",
        data: e,
        target: this
      })));
      o !== null && (i = t.getPose(e.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (o.matrix.fromArray(i.transform.matrix), o.matrix.decompose(o.position, o.quaternion, o.scale), o.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(i.linearVelocity)) : o.hasLinearVelocity = !1, i.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(i.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(Gd)))
    }
    return o !== null && (o.visible = i !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = a !== null), this
  }
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new ci;
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n)
    }
    return e.joints[t.jointName]
  }
}
const Sh = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  },
  kn = {
    h: 0,
    s: 0,
    l: 0
  },
  Hs = {
    h: 0,
    s: 0,
    l: 0
  };

function jr(s, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? s + (e - s) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? s + (e - s) * 6 * (2 / 3 - t) : s
}
class Fe {
  constructor(e, t, n) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n)
  }
  set(e, t, n) {
    if (t === void 0 && n === void 0) {
      const i = e;
      i && i.isColor ? this.copy(i) : typeof i == "number" ? this.setHex(i) : typeof i == "string" && this.setStyle(i)
    } else this.setRGB(e, t, n);
    return this
  }
  setScalar(e) {
    return this.r = e, this.g = e, this.b = e, this
  }
  setHex(e, t = bt) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, Qe.colorSpaceToWorking(this, t), this
  }
  setRGB(e, t, n, i = Qe.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, Qe.colorSpaceToWorking(this, i), this
  }
  setHSL(e, t, n, i = Qe.workingColorSpace) {
    if (e = Fo(e, 1), t = Ke(t, 0, 1), n = Ke(n, 0, 1), t === 0) this.r = this.g = this.b = n;
    else {
      const r = n <= .5 ? n * (1 + t) : n + t - n * t,
        a = 2 * n - r;
      this.r = jr(a, r, e + 1 / 3), this.g = jr(a, r, e), this.b = jr(a, r, e - 1 / 3)
    }
    return Qe.colorSpaceToWorking(this, i), this
  }
  setStyle(e, t = bt) {
    function n(r) {
      r !== void 0 && parseFloat(r) < 1 && Ce("Color: Alpha component of " + e + " will be ignored.")
    }
    let i;
    if (i = /^(\w+)\(([^\)]*)\)/.exec(e)) {
      let r;
      const a = i[1],
        o = i[2];
      switch (a) {
        case "rgb":
        case "rgba":
          if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o)) return n(r[4]), this.setRGB(Math.min(255, parseInt(r[1], 10)) / 255, Math.min(255, parseInt(r[2], 10)) / 255, Math.min(255, parseInt(r[3], 10)) / 255, t);
          if (r = /^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o)) return n(r[4]), this.setRGB(Math.min(100, parseFloat(r[1])) / 100, Math.min(100, parseFloat(r[2])) / 100, Math.min(100, parseFloat(r[3])) / 100, t);
          break;
        case "hsl":
        case "hsla":
          if (r = /^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o)) return n(r[4]), this.setHSL(parseFloat(r[1]) / 360, parseFloat(r[2]) / 100, parseFloat(r[3]) / 100, t);
          break;
        default:
          Ce("Color: Unknown color model " + e)
      }
    } else if (i = /^\#([A-Fa-f\d]+)$/.exec(e)) {
      const r = i[1],
        a = r.length;
      if (a === 3) return this.setRGB(parseInt(r.charAt(0), 16) / 15, parseInt(r.charAt(1), 16) / 15, parseInt(r.charAt(2), 16) / 15, t);
      if (a === 6) return this.setHex(parseInt(r, 16), t);
      Ce("Color: Invalid hex color " + e)
    } else if (e && e.length > 0) return this.setColorName(e, t);
    return this
  }
  setColorName(e, t = bt) {
    const n = Sh[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : Ce("Color: Unknown color " + e), this
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b)
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this
  }
  copySRGBToLinear(e) {
    return this.r = Fn(e.r), this.g = Fn(e.g), this.b = Fn(e.b), this
  }
  copyLinearToSRGB(e) {
    return this.r = Oi(e.r), this.g = Oi(e.g), this.b = Oi(e.b), this
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this
  }
  getHex(e = bt) {
    return Qe.workingToColorSpace(kt.copy(this), e), Math.round(Ke(kt.r * 255, 0, 255)) * 65536 + Math.round(Ke(kt.g * 255, 0, 255)) * 256 + Math.round(Ke(kt.b * 255, 0, 255))
  }
  getHexString(e = bt) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6)
  }
  getHSL(e, t = Qe.workingColorSpace) {
    Qe.workingToColorSpace(kt.copy(this), t);
    const n = kt.r,
      i = kt.g,
      r = kt.b,
      a = Math.max(n, i, r),
      o = Math.min(n, i, r);
    let l, c;
    const h = (o + a) / 2;
    if (o === a) l = 0, c = 0;
    else {
      const u = a - o;
      switch (c = h <= .5 ? u / (a + o) : u / (2 - a - o), a) {
        case n:
          l = (i - r) / u + (i < r ? 6 : 0);
          break;
        case i:
          l = (r - n) / u + 2;
          break;
        case r:
          l = (n - i) / u + 4;
          break
      }
      l /= 6
    }
    return e.h = l, e.s = c, e.l = h, e
  }
  getRGB(e, t = Qe.workingColorSpace) {
    return Qe.workingToColorSpace(kt.copy(this), t), e.r = kt.r, e.g = kt.g, e.b = kt.b, e
  }
  getStyle(e = bt) {
    Qe.workingToColorSpace(kt.copy(this), e);
    const t = kt.r,
      n = kt.g,
      i = kt.b;
    return e !== bt ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`
  }
  offsetHSL(e, t, n) {
    return this.getHSL(kn), this.setHSL(kn.h + e, kn.s + t, kn.l + n)
  }
  add(e) {
    return this.r += e.r, this.g += e.g, this.b += e.b, this
  }
  addColors(e, t) {
    return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this
  }
  addScalar(e) {
    return this.r += e, this.g += e, this.b += e, this
  }
  sub(e) {
    return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this
  }
  multiply(e) {
    return this.r *= e.r, this.g *= e.g, this.b *= e.b, this
  }
  multiplyScalar(e) {
    return this.r *= e, this.g *= e, this.b *= e, this
  }
  lerp(e, t) {
    return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this
  }
  lerpColors(e, t, n) {
    return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this
  }
  lerpHSL(e, t) {
    this.getHSL(kn), e.getHSL(Hs);
    const n = ms(kn.h, Hs.h, t),
      i = ms(kn.s, Hs.s, t),
      r = ms(kn.l, Hs.l, t);
    return this.setHSL(n, i, r), this
  }
  setFromVector3(e) {
    return this.r = e.x, this.g = e.y, this.b = e.z, this
  }
  applyMatrix3(e) {
    const t = this.r,
      n = this.g,
      i = this.b,
      r = e.elements;
    return this.r = r[0] * t + r[3] * n + r[6] * i, this.g = r[1] * t + r[4] * n + r[7] * i, this.b = r[2] * t + r[5] * n + r[8] * i, this
  }
  equals(e) {
    return e.r === this.r && e.g === this.g && e.b === this.b
  }
  fromArray(e, t = 0) {
    return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this
  }
  toArray(e = [], t = 0) {
    return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e
  }
  fromBufferAttribute(e, t) {
    return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this
  }
  toJSON() {
    return this.getHex()
  }*[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b
  }
}
const kt = new Fe;
Fe.NAMES = Sh;
class yh {
  constructor(e, t = 1, n = 1e3) {
    this.isFog = !0, this.name = "", this.color = new Fe(e), this.near = t, this.far = n
  }
  clone() {
    return new yh(this.color, this.near, this.far)
  }
  toJSON() {
    return {
      type: "Fog",
      name: this.name,
      color: this.color.getHex(),
      near: this.near,
      far: this.far
    }
  }
}
class Vd extends gt {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Tn, this.environmentIntensity = 1, this.environmentRotation = new Tn, this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
      detail: this
    }))
  }
  copy(e, t) {
    return super.copy(e, t), this.background = e.background !== null ? e.background.clone() : null, this.environment = e.environment !== null ? e.environment.clone() : null, this.fog = e.fog !== null ? e.fog.clone() : null, this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), this.overrideMaterial = e.overrideMaterial !== null ? e.overrideMaterial.clone() : null, this.matrixAutoUpdate = e.matrixAutoUpdate, this
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), t.object.backgroundBlurriness = this.backgroundBlurriness, t.object.backgroundIntensity = this.backgroundIntensity, t.object.backgroundRotation = this.backgroundRotation.toArray(), t.object.environmentIntensity = this.environmentIntensity, t.object.environmentRotation = this.environmentRotation.toArray(), t
  }
}
const sn = new N,
  Rn = new N,
  ea = new N,
  Cn = new N,
  vi = new N,
  Mi = new N,
  Ol = new N,
  ta = new N,
  na = new N,
  ia = new N,
  sa = new ht,
  ra = new ht,
  aa = new ht;
class an {
  constructor(e = new N, t = new N, n = new N) {
    this.a = e, this.b = t, this.c = n
  }
  static getNormal(e, t, n, i) {
    i.subVectors(n, t), sn.subVectors(e, t), i.cross(sn);
    const r = i.lengthSq();
    return r > 0 ? i.multiplyScalar(1 / Math.sqrt(r)) : i.set(0, 0, 0)
  }
  static getBarycoord(e, t, n, i, r) {
    sn.subVectors(i, t), Rn.subVectors(n, t), ea.subVectors(e, t);
    const a = sn.dot(sn),
      o = sn.dot(Rn),
      l = sn.dot(ea),
      c = Rn.dot(Rn),
      h = Rn.dot(ea),
      u = a * c - o * o;
    if (u === 0) return r.set(0, 0, 0), null;
    const d = 1 / u,
      f = (c * l - o * h) * d,
      p = (a * h - o * l) * d;
    return r.set(1 - f - p, p, f)
  }
  static containsPoint(e, t, n, i) {
    return this.getBarycoord(e, t, n, i, Cn) === null ? !1 : Cn.x >= 0 && Cn.y >= 0 && Cn.x + Cn.y <= 1
  }
  static getInterpolation(e, t, n, i, r, a, o, l) {
    return this.getBarycoord(e, t, n, i, Cn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(r, Cn.x), l.addScaledVector(a, Cn.y), l.addScaledVector(o, Cn.z), l)
  }
  static getInterpolatedAttribute(e, t, n, i, r, a) {
    return sa.setScalar(0), ra.setScalar(0), aa.setScalar(0), sa.fromBufferAttribute(e, t), ra.fromBufferAttribute(e, n), aa.fromBufferAttribute(e, i), a.setScalar(0), a.addScaledVector(sa, r.x), a.addScaledVector(ra, r.y), a.addScaledVector(aa, r.z), a
  }
  static isFrontFacing(e, t, n, i) {
    return sn.subVectors(n, t), Rn.subVectors(e, t), sn.cross(Rn).dot(i) < 0
  }
  set(e, t, n) {
    return this.a.copy(e), this.b.copy(t), this.c.copy(n), this
  }
  setFromPointsAndIndices(e, t, n, i) {
    return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[i]), this
  }
  setFromAttributeAndIndices(e, t, n, i) {
    return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, i), this
  }
  clone() {
    return new this.constructor().copy(this)
  }
  copy(e) {
    return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this
  }
  getArea() {
    return sn.subVectors(this.c, this.b), Rn.subVectors(this.a, this.b), sn.cross(Rn).length() * .5
  }
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3)
  }
  getNormal(e) {
    return an.getNormal(this.a, this.b, this.c, e)
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c)
  }
  getBarycoord(e, t) {
    return an.getBarycoord(e, this.a, this.b, this.c, t)
  }
  getInterpolation(e, t, n, i, r) {
    return an.getInterpolation(e, this.a, this.b, this.c, t, n, i, r)
  }
  containsPoint(e) {
    return an.containsPoint(e, this.a, this.b, this.c)
  }
  isFrontFacing(e) {
    return an.isFrontFacing(this.a, this.b, this.c, e)
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this)
  }
  closestPointToPoint(e, t) {
    const n = this.a,
      i = this.b,
      r = this.c;
    let a, o;
    vi.subVectors(i, n), Mi.subVectors(r, n), ta.subVectors(e, n);
    const l = vi.dot(ta),
      c = Mi.dot(ta);
    if (l <= 0 && c <= 0) return t.copy(n);
    na.subVectors(e, i);
    const h = vi.dot(na),
      u = Mi.dot(na);
    if (h >= 0 && u <= h) return t.copy(i);
    const d = l * u - h * c;
    if (d <= 0 && l >= 0 && h <= 0 && l - h > 0) return a = l / (l - h), t.copy(n).addScaledVector(vi, a);
    ia.subVectors(e, r);
    const f = vi.dot(ia),
      p = Mi.dot(ia);
    if (p >= 0 && f <= p) return t.copy(r);
    const x = f * c - l * p;
    if (x <= 0 && c >= 0 && p <= 0) return o = c / (c - p), t.copy(n).addScaledVector(Mi, o);
    const m = h * p - f * u;
    if (m <= 0 && u - h >= 0 && f - p >= 0) return Ol.subVectors(r, i), o = (u - h) / (u - h + (f - p)), t.copy(i).addScaledVector(Ol, o);
    const g = 1 / (m + x + d);
    return a = x * g, o = d * g, t.copy(n).addScaledVector(vi, a).addScaledVector(Mi, o)
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c)
  }
}
class un {
  constructor(e = new N(1 / 0, 1 / 0, 1 / 0), t = new N(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t += 3) this.expandByPoint(rn.fromArray(e, t));
    return this
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++) this.expandByPoint(rn.fromBufferAttribute(e, t));
    return this
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
    return this
  }
  setFromCenterAndSize(e, t) {
    const n = rn.copy(t).multiplyScalar(.5);
    return this.min.copy(e).sub(n), this.max.copy(e).add(n), this
  }
  setFromObject(e, t = !1) {
    return this.makeEmpty(), this.expandByObject(e, t)
  }
  clone() {
    return new this.constructor().copy(this)
  }
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this
  }
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
  }
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(.5)
  }
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min)
  }
  expandByPoint(e) {
    return this.min.min(e), this.max.max(e), this
  }
  expandByVector(e) {
    return this.min.sub(e), this.max.add(e), this
  }
  expandByScalar(e) {
    return this.min.addScalar(-e), this.max.addScalar(e), this
  }
  expandByObject(e, t = !1) {
    e.updateWorldMatrix(!1, !1);
    const n = e.geometry;
    if (n !== void 0) {
      const r = n.getAttribute("position");
      if (t === !0 && r !== void 0 && e.isInstancedMesh !== !0 && e.isBatchedMesh !== !0)
        for (let a = 0, o = r.count; a < o; a++) e.isMesh === !0 ? e.getVertexPosition(a, rn) : rn.fromBufferAttribute(r, a), rn.applyMatrix4(e.matrixWorld), this.expandByPoint(rn);
      else e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), Gs.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Gs.copy(n.boundingBox)), Gs.applyMatrix4(e.matrixWorld), this.union(Gs)
    }
    const i = e.children;
    for (let r = 0, a = i.length; r < a; r++) this.expandByObject(i[r], t);
    return this
  }
  containsPoint(e) {
    return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z
  }
  containsBox(e) {
    return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z
  }
  getParameter(e, t) {
    return t.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z))
  }
  intersectsBox(e) {
    return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z
  }
  intersectsSphere(e) {
    return this.clampPoint(e.center, rn), rn.distanceToSquared(e.center) <= e.radius * e.radius
  }
  intersectsPlane(e) {
    let t, n;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant
  }
  intersectsTriangle(e) {
    if (this.isEmpty()) return !1;
    this.getCenter(ji), Vs.subVectors(this.max, ji), Si.subVectors(e.a, ji), yi.subVectors(e.b, ji), Ti.subVectors(e.c, ji), Hn.subVectors(yi, Si), Gn.subVectors(Ti, yi), ii.subVectors(Si, Ti);
    let t = [0, -Hn.z, Hn.y, 0, -Gn.z, Gn.y, 0, -ii.z, ii.y, Hn.z, 0, -Hn.x, Gn.z, 0, -Gn.x, ii.z, 0, -ii.x, -Hn.y, Hn.x, 0, -Gn.y, Gn.x, 0, -ii.y, ii.x, 0];
    return !oa(t, Si, yi, Ti, Vs) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !oa(t, Si, yi, Ti, Vs)) ? !1 : (Ws.crossVectors(Hn, Gn), t = [Ws.x, Ws.y, Ws.z], oa(t, Si, yi, Ti, Vs))
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max)
  }
  distanceToPoint(e) {
    return this.clampPoint(e, rn).distanceTo(e)
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(rn).length() * .5), e
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (Ln[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Ln[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Ln[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Ln[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Ln[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Ln[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Ln[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Ln[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Ln), this)
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max)
  }
  toJSON() {
    return {
      min: this.min.toArray(),
      max: this.max.toArray()
    }
  }
  fromJSON(e) {
    return this.min.fromArray(e.min), this.max.fromArray(e.max), this
  }
}
const Ln = [new N, new N, new N, new N, new N, new N, new N, new N],
  rn = new N,
  Gs = new un,
  Si = new N,
  yi = new N,
  Ti = new N,
  Hn = new N,
  Gn = new N,
  ii = new N,
  ji = new N,
  Vs = new N,
  Ws = new N,
  si = new N;

function oa(s, e, t, n, i) {
  for (let r = 0, a = s.length - 3; r <= a; r += 3) {
    si.fromArray(s, r);
    const o = i.x * Math.abs(si.x) + i.y * Math.abs(si.y) + i.z * Math.abs(si.z),
      l = e.dot(si),
      c = t.dot(si),
      h = n.dot(si);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o) return !1
  }
  return !0
}
const Nn = Wd();

function Wd() {
  const s = new ArrayBuffer(4),
    e = new Float32Array(s),
    t = new Uint32Array(s),
    n = new Uint32Array(512),
    i = new Uint32Array(512);
  for (let l = 0; l < 256; ++l) {
    const c = l - 127;
    c < -27 ? (n[l] = 0, n[l | 256] = 32768, i[l] = 24, i[l | 256] = 24) : c < -14 ? (n[l] = 1024 >> -c - 14, n[l | 256] = 1024 >> -c - 14 | 32768, i[l] = -c - 1, i[l | 256] = -c - 1) : c <= 15 ? (n[l] = c + 15 << 10, n[l | 256] = c + 15 << 10 | 32768, i[l] = 13, i[l | 256] = 13) : c < 128 ? (n[l] = 31744, n[l | 256] = 64512, i[l] = 24, i[l | 256] = 24) : (n[l] = 31744, n[l | 256] = 64512, i[l] = 13, i[l | 256] = 13)
  }
  const r = new Uint32Array(2048),
    a = new Uint32Array(64),
    o = new Uint32Array(64);
  for (let l = 1; l < 1024; ++l) {
    let c = l << 13,
      h = 0;
    for (; !(c & 8388608);) c <<= 1, h -= 8388608;
    c &= -8388609, h += 947912704, r[l] = c | h
  }
  for (let l = 1024; l < 2048; ++l) r[l] = 939524096 + (l - 1024 << 13);
  for (let l = 1; l < 31; ++l) a[l] = l << 23;
  a[31] = 1199570944, a[32] = 2147483648;
  for (let l = 33; l < 63; ++l) a[l] = 2147483648 + (l - 32 << 23);
  a[63] = 3347054592;
  for (let l = 1; l < 64; ++l) l !== 32 && (o[l] = 1024);
  return {
    floatView: e,
    uint32View: t,
    baseTable: n,
    shiftTable: i,
    mantissaTable: r,
    exponentTable: a,
    offsetTable: o
  }
}

function Xd(s) {
  Math.abs(s) > 65504 && Ce("DataUtils.toHalfFloat(): Value out of range."), s = Ke(s, -65504, 65504), Nn.floatView[0] = s;
  const e = Nn.uint32View[0],
    t = e >> 23 & 511;
  return Nn.baseTable[t] + ((e & 8388607) >> Nn.shiftTable[t])
}

function qd(s) {
  const e = s >> 10;
  return Nn.uint32View[0] = Nn.mantissaTable[Nn.offsetTable[e] + (s & 1023)] + Nn.exponentTable[e], Nn.floatView[0]
}
class Lv {
  static toHalfFloat(e) {
    return Xd(e)
  }
  static fromHalfFloat(e) {
    return qd(e)
  }
}
const Et = new N,
  Xs = new re;
let Yd = 0;
class Ft extends jn {
  constructor(e, t, n = !1) {
    if (super(), Array.isArray(e)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, Object.defineProperty(this, "id", {
      value: Yd++
    }), this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = _h, this.updateRanges = [], this.gpuType = jt, this.version = 0, this._normalizationScale = e !== void 0 ? Fr(e) : void 0
  }
  onUploadCallback() {}
  set needsUpdate(e) {
    e === !0 && this.version++
  }
  setUsage(e) {
    return this.usage = e, this
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({
      start: e,
      count: t
    })
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0
  }
  copy(e) {
    return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this._normalizationScale = e._normalizationScale, this
  }
  copyAt(e, t, n) {
    e *= this.itemSize, n *= t.itemSize;
    for (let i = 0, r = this.itemSize; i < r; i++) this.array[e + i] = t.array[n + i];
    return this
  }
  copyArray(e) {
    return this.array.set(e), this
  }
  applyMatrix3(e) {
    if (this.itemSize === 2)
      for (let t = 0, n = this.count; t < n; t++) Xs.fromBufferAttribute(this, t), Xs.applyMatrix3(e), this.setXY(t, Xs.x, Xs.y);
    else if (this.itemSize === 3)
      for (let t = 0, n = this.count; t < n; t++) Et.fromBufferAttribute(this, t), Et.applyMatrix3(e), this.setXYZ(t, Et.x, Et.y, Et.z);
    return this
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++) Et.fromBufferAttribute(this, t), Et.applyMatrix4(e), this.setXYZ(t, Et.x, Et.y, Et.z);
    return this
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++) Et.fromBufferAttribute(this, t), Et.applyNormalMatrix(e), this.setXYZ(t, Et.x, Et.y, Et.z);
    return this
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++) Et.fromBufferAttribute(this, t), Et.transformDirection(e), this.setXYZ(t, Et.x, Et.y, Et.z);
    return this
  }
  set(e, t = 0) {
    return this.array.set(e, t), this
  }
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = this._denormalize(n)), n
  }
  setComponent(e, t, n) {
    return this.normalized && (n = this._normalize(n)), this.array[e * this.itemSize + t] = n, this
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = this._denormalize(t)), t
  }
  setX(e, t) {
    return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize] = t, this
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = this._denormalize(t)), t
  }
  setY(e, t) {
    return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize + 1] = t, this
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = this._denormalize(t)), t
  }
  setZ(e, t) {
    return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize + 2] = t, this
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = this._denormalize(t)), t
  }
  setW(e, t) {
    return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize + 3] = t, this
  }
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = this._normalize(t), n = this._normalize(n)), this.array[e + 0] = t, this.array[e + 1] = n, this
  }
  setXYZ(e, t, n, i) {
    return e *= this.itemSize, this.normalized && (t = this._normalize(t), n = this._normalize(n), i = this._normalize(i)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this
  }
  setXYZW(e, t, n, i, r) {
    return e *= this.itemSize, this.normalized && (t = this._normalize(t), n = this._normalize(n), i = this._normalize(i), r = this._normalize(r)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this.array[e + 3] = r, this
  }
  onUpload(e) {
    return this.onUploadCallback = e, this
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this)
  }
  toJSON() {
    const e = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return e.name = this.name, e.usage = this.usage, e.gpuType = this.gpuType, e
  }
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    })
  }
  _denormalize(e) {
    const t = this._normalizationScale;
    return t !== void 0 ? Math.max(e / t, -1) : Oo(e, this.array)
  }
  _normalize(e) {
    const t = this._normalizationScale;
    return t !== void 0 ? Math.round(e * t) : Bo(e, this.array)
  }
}
class Th extends Ft {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n)
  }
}
class Eh extends Ft {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n)
  }
}
class ut extends Ft {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n)
  }
}
const Kd = new un,
  es = new N,
  la = new N;
class En {
  constructor(e = new N, t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : Kd.setFromPoints(e).getCenter(n);
    let i = 0;
    for (let r = 0, a = e.length; r < a; r++) i = Math.max(i, n.distanceToSquared(e[r]));
    return this.radius = Math.sqrt(i), this
  }
  copy(e) {
    return this.center.copy(e.center), this.radius = e.radius, this
  }
  isEmpty() {
    return this.radius < 0
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this
  }
  containsPoint(e) {
    return e.distanceToSquared(this.center) <= this.radius * this.radius
  }
  distanceToPoint(e) {
    return e.distanceTo(this.center) - this.radius
  }
  intersectsSphere(e) {
    const t = this.radius + e.radius;
    return e.center.distanceToSquared(this.center) <= t * t
  }
  intersectsBox(e) {
    return e.intersectsSphere(this)
  }
  intersectsPlane(e) {
    return Math.abs(e.distanceToPoint(this.center)) <= this.radius
  }
  clampPoint(e, t) {
    const n = this.center.distanceToSquared(e);
    return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t
  }
  getBoundingBox(e) {
    return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e)
  }
  applyMatrix4(e) {
    return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this
  }
  translate(e) {
    return this.center.add(e), this
  }
  expandByPoint(e) {
    if (this.isEmpty()) return this.center.copy(e), this.radius = 0, this;
    es.subVectors(e, this.center);
    const t = es.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t),
        i = (n - this.radius) * .5;
      this.center.addScaledVector(es, i / n), this.radius += i
    }
    return this
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (la.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(es.copy(e.center).add(la)), this.expandByPoint(es.copy(e.center).sub(la))), this)
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius
  }
  clone() {
    return new this.constructor().copy(this)
  }
  toJSON() {
    return {
      radius: this.radius,
      center: this.center.toArray()
    }
  }
  fromJSON(e) {
    return this.radius = e.radius, this.center.fromArray(e.center), this
  }
}
let Jd = 0;
const $t = new We,
  ca = new gt,
  Ei = new N,
  Yt = new un,
  ts = new un,
  Dt = new N;
class wt extends jn {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", {
      value: Jd++
    }), this.uuid = hn(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.indirectOffset = 0, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
      start: 0,
      count: 1 / 0
    }, this.userData = {}, this._transformed = !1
  }
  getIndex() {
    return this.index
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new(cd(e) ? Eh : Th)(e, 1) : this.index = e, this
  }
  setIndirect(e, t = 0) {
    return this.indirect = e, this.indirectOffset = t, this
  }
  getIndirect() {
    return this.indirect
  }
  getAttribute(e) {
    return this.attributes[e]
  }
  setAttribute(e, t) {
    return this.attributes[e] = t, this
  }
  deleteAttribute(e) {
    return delete this.attributes[e], this
  }
  hasAttribute(e) {
    return this.attributes[e] !== void 0
  }
  addGroup(e, t, n = 0) {
    this.groups.push({
      start: e,
      count: t,
      materialIndex: n
    })
  }
  clearGroups() {
    this.groups = []
  }
  setDrawRange(e, t) {
    this.drawRange.start = e, this.drawRange.count = t
  }
  applyMatrix4(e) {
    const t = this.attributes.position;
    t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
    const n = this.attributes.normal;
    if (n !== void 0) {
      const r = new He().getNormalMatrix(e);
      n.applyNormalMatrix(r), n.needsUpdate = !0
    }
    const i = this.attributes.tangent;
    return i !== void 0 && (i.transformDirection(e), i.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this._transformed = !0, this
  }
  applyQuaternion(e) {
    return $t.makeRotationFromQuaternion(e), this.applyMatrix4($t), this
  }
  rotateX(e) {
    return $t.makeRotationX(e), this.applyMatrix4($t), this
  }
  rotateY(e) {
    return $t.makeRotationY(e), this.applyMatrix4($t), this
  }
  rotateZ(e) {
    return $t.makeRotationZ(e), this.applyMatrix4($t), this
  }
  translate(e, t, n) {
    return $t.makeTranslation(e, t, n), this.applyMatrix4($t), this
  }
  scale(e, t, n) {
    return $t.makeScale(e, t, n), this.applyMatrix4($t), this
  }
  lookAt(e) {
    return ca.lookAt(e), ca.updateMatrix(), this.applyMatrix4(ca.matrix), this
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Ei).negate(), this.translate(Ei.x, Ei.y, Ei.z), this
  }
  setFromPoints(e) {
    const t = this.getAttribute("position");
    if (t === void 0) {
      const n = [];
      for (let i = 0, r = e.length; i < r; i++) {
        const a = e[i];
        n.push(a.x, a.y, a.z || 0)
      }
      this.setAttribute("position", new ut(n, 3))
    } else {
      const n = Math.min(e.length, t.count);
      for (let i = 0; i < n; i++) {
        const r = e[i];
        t.setXYZ(i, r.x, r.y, r.z || 0)
      }
      e.length > t.count && Ce("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), t.needsUpdate = !0
    }
    return this
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new un);
    const e = this.attributes.position,
      t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      ze("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new N(-1 / 0, -1 / 0, -1 / 0), new N(1 / 0, 1 / 0, 1 / 0));
      return
    }
    if (e !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(e), t)
        for (let n = 0, i = t.length; n < i; n++) {
          const r = t[n];
          Yt.setFromBufferAttribute(r), this.morphTargetsRelative ? (Dt.addVectors(this.boundingBox.min, Yt.min), this.boundingBox.expandByPoint(Dt), Dt.addVectors(this.boundingBox.max, Yt.max), this.boundingBox.expandByPoint(Dt)) : (this.boundingBox.expandByPoint(Yt.min), this.boundingBox.expandByPoint(Yt.max))
        }
    } else this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && ze('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this)
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new En);
    const e = this.attributes.position,
      t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      ze("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new N, 1 / 0);
      return
    }
    if (e) {
      const n = this.boundingSphere.center;
      if (Yt.setFromBufferAttribute(e), t)
        for (let r = 0, a = t.length; r < a; r++) {
          const o = t[r];
          ts.setFromBufferAttribute(o), this.morphTargetsRelative ? (Dt.addVectors(Yt.min, ts.min), Yt.expandByPoint(Dt), Dt.addVectors(Yt.max, ts.max), Yt.expandByPoint(Dt)) : (Yt.expandByPoint(ts.min), Yt.expandByPoint(ts.max))
        }
      Yt.getCenter(n);
      let i = 0;
      for (let r = 0, a = e.count; r < a; r++) Dt.fromBufferAttribute(e, r), i = Math.max(i, n.distanceToSquared(Dt));
      if (t)
        for (let r = 0, a = t.length; r < a; r++) {
          const o = t[r],
            l = this.morphTargetsRelative;
          for (let c = 0, h = o.count; c < h; c++) Dt.fromBufferAttribute(o, c), l && (Ei.fromBufferAttribute(e, c), Dt.add(Ei)), i = Math.max(i, n.distanceToSquared(Dt))
        }
      this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && ze('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this)
    }
  }
  computeTangents() {
    const e = this.index,
      t = this.attributes;
    if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
      ze("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return
    }
    const n = t.position,
      i = t.normal,
      r = t.uv;
    let a = this.getAttribute("tangent");
    (a === void 0 || a.count !== n.count) && (a = new Ft(new Float32Array(4 * n.count), 4), this.setAttribute("tangent", a));
    const o = [],
      l = [],
      c = new Uint8Array(n.count);
    for (let I = 0; I < n.count; I++) o[I] = new N, l[I] = new N;
    const h = new N,
      u = new N,
      d = new N,
      f = new re,
      p = new re,
      x = new re,
      m = new N,
      g = new N;

    function M(I, R, D) {
      c[I] = c[R] = c[D] = 1, h.fromBufferAttribute(n, I), u.fromBufferAttribute(n, R), d.fromBufferAttribute(n, D), f.fromBufferAttribute(r, I), p.fromBufferAttribute(r, R), x.fromBufferAttribute(r, D), u.sub(h), d.sub(h), p.sub(f), x.sub(f);
      const F = 1 / (p.x * x.y - x.x * p.y);
      isFinite(F) && (m.copy(u).multiplyScalar(x.y).addScaledVector(d, -p.y).multiplyScalar(F), g.copy(d).multiplyScalar(p.x).addScaledVector(u, -x.x).multiplyScalar(F), o[I].add(m), o[R].add(m), o[D].add(m), l[I].add(g), l[R].add(g), l[D].add(g))
    }
    let E = this.groups;
    E.length === 0 && (E = [{
      start: 0,
      count: e.count
    }]);
    for (let I = 0, R = E.length; I < R; ++I) {
      const D = E[I],
        F = D.start,
        V = D.count;
      for (let L = F, k = F + V; L < k; L += 3) M(e.getX(L + 0), e.getX(L + 1), e.getX(L + 2))
    }
    const v = new N,
      A = new N,
      b = new N,
      _ = new N;

    function T(I) {
      b.fromBufferAttribute(i, I), _.copy(b);
      const R = o[I];
      v.copy(R), v.sub(b.multiplyScalar(b.dot(R))).normalize(), A.crossVectors(_, R);
      const F = A.dot(l[I]) < 0 ? -1 : 1;
      a.setXYZW(I, v.x, v.y, v.z, F)
    }
    for (let I = 0, R = n.count; I < R; ++I) c[I] && T(I);
    this._transformed = !0
  }
  computeVertexNormals() {
    const e = this.index,
      t = this.getAttribute("position");
    if (t !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0 || n.count !== t.count) n = new Ft(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
      else
        for (let d = 0, f = n.count; d < f; d++) n.setXYZ(d, 0, 0, 0);
      const i = new N,
        r = new N,
        a = new N,
        o = new N,
        l = new N,
        c = new N,
        h = new N,
        u = new N;
      if (e)
        for (let d = 0, f = e.count; d < f; d += 3) {
          const p = e.getX(d + 0),
            x = e.getX(d + 1),
            m = e.getX(d + 2);
          i.fromBufferAttribute(t, p), r.fromBufferAttribute(t, x), a.fromBufferAttribute(t, m), h.subVectors(a, r), u.subVectors(i, r), h.cross(u), o.fromBufferAttribute(n, p), l.fromBufferAttribute(n, x), c.fromBufferAttribute(n, m), o.add(h), l.add(h), c.add(h), n.setXYZ(p, o.x, o.y, o.z), n.setXYZ(x, l.x, l.y, l.z), n.setXYZ(m, c.x, c.y, c.z)
        } else
          for (let d = 0, f = t.count; d < f; d += 3) i.fromBufferAttribute(t, d + 0), r.fromBufferAttribute(t, d + 1), a.fromBufferAttribute(t, d + 2), h.subVectors(a, r), u.subVectors(i, r), h.cross(u), n.setXYZ(d + 0, h.x, h.y, h.z), n.setXYZ(d + 1, h.x, h.y, h.z), n.setXYZ(d + 2, h.x, h.y, h.z);
      this.normalizeNormals(), n.needsUpdate = !0
    }
  }
  normalizeNormals() {
    const e = this.attributes.normal;
    for (let t = 0, n = e.count; t < n; t++) Dt.fromBufferAttribute(e, t), Dt.normalize(), e.setXYZ(t, Dt.x, Dt.y, Dt.z)
  }
  toNonIndexed() {
    function e(o, l) {
      const c = o.array,
        h = o.itemSize,
        u = o.normalized,
        d = new c.constructor(l.length * h);
      let f = 0,
        p = 0;
      for (let x = 0, m = l.length; x < m; x++) {
        o.isInterleavedBufferAttribute ? f = l[x] * o.data.stride + o.offset : f = l[x] * h;
        for (let g = 0; g < h; g++) d[p++] = c[f++]
      }
      return new Ft(d, h, u)
    }
    if (this.index === null) return Ce("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const t = new wt,
      n = this.index.array,
      i = this.attributes;
    for (const o in i) {
      const l = i[o],
        c = e(l, n);
      t.setAttribute(o, c)
    }
    const r = this.morphAttributes;
    for (const o in r) {
      const l = [],
        c = r[o];
      for (let h = 0, u = c.length; h < u; h++) {
        const d = c[h],
          f = e(d, n);
        l.push(f)
      }
      t.morphAttributes[o] = l
    }
    t.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, l = a.length; o < l; o++) {
      const c = a[o];
      t.addGroup(c.start, c.count, c.materialIndex)
    }
    return t
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.7,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON"
      }
    };
    if (e.uuid = this.uuid, e.type = this.parameters !== void 0 && this._transformed === !0 ? "BufferGeometry" : this.type, e.name = this.name, Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0 && this._transformed !== !0) {
      const l = this.parameters;
      for (const c in l) l[c] !== void 0 && (e[c] = l[c]);
      return e
    }
    e.data = {
      attributes: {}
    };
    const t = this.index;
    t !== null && (e.data.index = {
      type: t.array.constructor.name,
      array: Array.prototype.slice.call(t.array)
    });
    const n = this.attributes;
    for (const l in n) {
      const c = n[l];
      e.data.attributes[l] = c.toJSON(e.data)
    }
    const i = {};
    let r = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l],
        h = [];
      for (let u = 0, d = c.length; u < d; u++) {
        const f = c[u];
        h.push(f.toJSON(e.data))
      }
      h.length > 0 && (i[l] = h, r = !0)
    }
    r && (e.data.morphAttributes = i, e.data.morphTargetsRelative = this.morphTargetsRelative);
    const a = this.groups;
    a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return o !== null && (e.data.boundingSphere = o.toJSON()), e
  }
  clone() {
    return new this.constructor().copy(this)
  }
  copy(e) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const t = {};
    this.name = e.name;
    const n = e.index;
    n !== null && this.setIndex(n.clone());
    const i = e.attributes;
    for (const c in i) {
      const h = i[c];
      this.setAttribute(c, h.clone(t))
    }
    const r = e.morphAttributes;
    for (const c in r) {
      const h = [],
        u = r[c];
      for (let d = 0, f = u.length; d < f; d++) h.push(u[d].clone(t));
      this.morphAttributes[c] = h
    }
    this.morphTargetsRelative = e.morphTargetsRelative;
    const a = e.groups;
    for (let c = 0, h = a.length; c < h; c++) {
      const u = a[c];
      this.addGroup(u.start, u.count, u.materialIndex)
    }
    const o = e.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const l = e.boundingSphere;
    return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this._transformed = e._transformed, this
  }
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    })
  }
}
class bh {
  constructor(e, t) {
    this.isInterleavedBuffer = !0, this.array = e, this.stride = t, this.count = e !== void 0 ? e.length / t : 0, this.usage = _h, this.updateRanges = [], this.version = 0, this.uuid = hn()
  }
  onUploadCallback() {}
  set needsUpdate(e) {
    e === !0 && this.version++
  }
  setUsage(e) {
    return this.usage = e, this
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({
      start: e,
      count: t
    })
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0
  }
  copy(e) {
    return this.array = new e.array.constructor(e.array), this.count = e.count, this.stride = e.stride, this.usage = e.usage, this
  }
  copyAt(e, t, n) {
    e *= this.stride, n *= t.stride;
    for (let i = 0, r = this.stride; i < r; i++) this.array[e + i] = t.array[n + i];
    return this
  }
  set(e, t = 0) {
    return this.array.set(e, t), this
  }
  clone(e) {
    e.arrayBuffers === void 0 && (e.arrayBuffers = {});
    const t = Bl(this.array);
    e.arrayBuffers[t] === void 0 && (e.arrayBuffers[t] = this.array.slice(0).buffer);
    const n = new this.array.constructor(e.arrayBuffers[t]),
      i = new this.constructor(n, this.stride);
    return i.setUsage(this.usage), i
  }
  onUpload(e) {
    return this.onUploadCallback = e, this
  }
  toJSON(e) {
    e.arrayBuffers === void 0 && (e.arrayBuffers = {});
    const t = Bl(this.array);
    e.arrayBuffers[t] === void 0 && (e.arrayBuffers[t] = Array.from(new Uint32Array(this.array.slice(0).buffer)));
    const n = {
      uuid: this.uuid,
      buffer: t,
      type: this.array.constructor.name,
      stride: this.stride
    };
    return n.usage = this.usage, n
  }
}

function Bl(s) {
  return s.buffer._uuid === void 0 && (s.buffer._uuid = hn()), s.byteOffset === 0 && s.byteLength === s.buffer.byteLength ? s.buffer._uuid : s.buffer._uuid + ":" + s.byteOffset + ":" + s.byteLength
}
const Gt = new N;
class Or {
  constructor(e, t, n, i = !1) {
    this.isInterleavedBufferAttribute = !0, this.name = "", this.data = e, this.itemSize = t, this.offset = n, this.normalized = i, this._normalizationScale = e !== void 0 ? Fr(e.array) : void 0
  }
  get count() {
    return this.data.count
  }
  get array() {
    return this.data.array
  }
  set needsUpdate(e) {
    this.data.needsUpdate = e
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.data.count; t < n; t++) Gt.fromBufferAttribute(this, t), Gt.applyMatrix4(e), this.setXYZ(t, Gt.x, Gt.y, Gt.z);
    return this
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++) Gt.fromBufferAttribute(this, t), Gt.applyNormalMatrix(e), this.setXYZ(t, Gt.x, Gt.y, Gt.z);
    return this
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++) Gt.fromBufferAttribute(this, t), Gt.transformDirection(e), this.setXYZ(t, Gt.x, Gt.y, Gt.z);
    return this
  }
  getComponent(e, t) {
    let n = this.array[e * this.data.stride + this.offset + t];
    return this.normalized && (n = this._denormalize(n)), n
  }
  setComponent(e, t, n) {
    return this.normalized && (n = this._normalize(n)), this.data.array[e * this.data.stride + this.offset + t] = n, this
  }
  setX(e, t) {
    return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset] = t, this
  }
  setY(e, t) {
    return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset + 1] = t, this
  }
  setZ(e, t) {
    return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset + 2] = t, this
  }
  setW(e, t) {
    return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset + 3] = t, this
  }
  getX(e) {
    let t = this.data.array[e * this.data.stride + this.offset];
    return this.normalized && (t = this._denormalize(t)), t
  }
  getY(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 1];
    return this.normalized && (t = this._denormalize(t)), t
  }
  getZ(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 2];
    return this.normalized && (t = this._denormalize(t)), t
  }
  getW(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 3];
    return this.normalized && (t = this._denormalize(t)), t
  }
  setXY(e, t, n) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = this._normalize(t), n = this._normalize(n)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this
  }
  setXYZ(e, t, n, i) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = this._normalize(t), n = this._normalize(n), i = this._normalize(i)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this
  }
  setXYZW(e, t, n, i, r) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = this._normalize(t), n = this._normalize(n), i = this._normalize(i), r = this._normalize(r)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this.data.array[e + 3] = r, this
  }
  clone(e) {
    if (e === void 0) {
      wr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
      const t = [];
      for (let n = 0; n < this.count; n++) {
        const i = n * this.data.stride + this.offset;
        for (let r = 0; r < this.itemSize; r++) t.push(this.data.array[i + r])
      }
      return new Ft(new this.array.constructor(t), this.itemSize, this.normalized)
    } else return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.clone(e)), new Or(e.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized)
  }
  toJSON(e) {
    if (e === void 0) {
      wr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
      const t = [];
      for (let n = 0; n < this.count; n++) {
        const i = n * this.data.stride + this.offset;
        for (let r = 0; r < this.itemSize; r++) t.push(this.data.array[i + r])
      }
      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: t,
        normalized: this.normalized
      }
    } else return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.toJSON(e)), {
      isInterleavedBufferAttribute: !0,
      itemSize: this.itemSize,
      data: this.data.uuid,
      offset: this.offset,
      normalized: this.normalized
    }
  }
  _denormalize(e) {
    const t = this._normalizationScale;
    return t !== void 0 ? Math.max(e / t, -1) : Oo(e, this.data.array)
  }
  _normalize(e) {
    const t = this._normalizationScale;
    return t !== void 0 ? Math.round(e * t) : Bo(e, this.data.array)
  }
}
const ha = new N,
  Zd = new N,
  $d = new He;
class Xn {
  constructor(e = new N(1, 0, 0), t = 0) {
    this.isPlane = !0, this.normal = e, this.constant = t
  }
  set(e, t) {
    return this.normal.copy(e), this.constant = t, this
  }
  setComponents(e, t, n, i) {
    return this.normal.set(e, t, n), this.constant = i, this
  }
  setFromNormalAndCoplanarPoint(e, t) {
    return this.normal.copy(e), this.constant = -t.dot(this.normal), this
  }
  setFromCoplanarPoints(e, t, n) {
    const i = ha.subVectors(n, t).cross(Zd.subVectors(e, t)).normalize();
    return this.setFromNormalAndCoplanarPoint(i, e), this
  }
  copy(e) {
    return this.normal.copy(e.normal), this.constant = e.constant, this
  }
  normalize() {
    const e = 1 / this.normal.length();
    return this.normal.multiplyScalar(e), this.constant *= e, this
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this
  }
  distanceToPoint(e) {
    return this.normal.dot(e) + this.constant
  }
  distanceToSphere(e) {
    return this.distanceToPoint(e.center) - e.radius
  }
  projectPoint(e, t) {
    return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e))
  }
  intersectLine(e, t, n = !0) {
    const i = e.delta(ha),
      r = this.normal.dot(i);
    if (r === 0) return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
    const a = -(e.start.dot(this.normal) + this.constant) / r;
    return n === !0 && (a < 0 || a > 1) ? null : t.copy(e.start).addScaledVector(i, a)
  }
  intersectsLine(e) {
    const t = this.distanceToPoint(e.start),
      n = this.distanceToPoint(e.end);
    return t < 0 && n > 0 || n < 0 && t > 0
  }
  intersectsBox(e) {
    return e.intersectsPlane(this)
  }
  intersectsSphere(e) {
    return e.intersectsPlane(this)
  }
  coplanarPoint(e) {
    return e.copy(this.normal).multiplyScalar(-this.constant)
  }
  applyMatrix4(e, t) {
    const n = t || $d.getNormalMatrix(e),
      i = this.coplanarPoint(ha).applyMatrix4(e),
      r = this.normal.applyMatrix3(n).normalize();
    return this.constant = -i.dot(r), this
  }
  translate(e) {
    return this.constant -= e.dot(this.normal), this
  }
  equals(e) {
    return e.normal.equals(this.normal) && e.constant === this.constant
  }
  clone() {
    return new this.constructor().copy(this)
  }
  toJSON() {
    return {
      normal: this.normal.toArray(),
      constant: this.constant
    }
  }
  fromJSON(e) {
    return this.normal.fromArray(e.normal), this.constant = e.constant, this
  }
}
let Qd = 0;
class Zt extends jn {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", {
      value: Qd++
    }), this.uuid = hn(), this.name = "", this.type = "Material", this.blending = fs, this.side = $n, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = Zc, this.blendDst = $c, this.blendEquation = Li, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Fe(0, 0, 0), this.blendAlpha = 0, this.depthFunc = vs, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = id, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = qr, this.stencilZFail = qr, this.stencilZPass = qr, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0
  }
  get alphaTest() {
    return this._alphaTest
  }
  set alphaTest(e) {
    this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e
  }
  onBeforeRender() {}
  onBeforeCompile() {}
  customProgramCacheKey() {
    return this.onBeforeCompile.toString()
  }
  setValues(e) {
    if (e !== void 0)
      for (const t in e) {
        const n = e[t];
        if (n === void 0) {
          Ce(`Material: parameter '${t}' has value of undefined.`);
          continue
        }
        const i = this[t];
        if (i === void 0) {
          Ce(`Material: '${t}' is not a property of THREE.${this.type}.`);
          continue
        }
        i && i.isColor ? i.set(n) : i && i.isVector2 && n && n.isVector2 || i && i.isEuler && n && n.isEuler || i && i.isVector3 && n && n.isVector3 ? i.copy(n) : this[t] = n
      }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    t && (e = {
      textures: {},
      images: {}
    });
    const n = {
      metadata: {
        version: 4.7,
        type: "Material",
        generator: "Material.toJSON"
      }
    };
    n.uuid = this.uuid, n.type = this.type, n.blending = this.blending, n.side = this.side, n.shadowSide = this.shadowSide, n.vertexColors = this.vertexColors, n.opacity = this.opacity, n.transparent = this.transparent, n.blendSrc = this.blendSrc, n.blendDst = this.blendDst, n.blendEquation = this.blendEquation, n.blendSrcAlpha = this.blendSrcAlpha, n.blendDstAlpha = this.blendDstAlpha, n.blendEquationAlpha = this.blendEquationAlpha, n.blendColor = this.blendColor.getHex(), n.blendAlpha = this.blendAlpha, n.depthFunc = this.depthFunc, n.depthTest = this.depthTest, n.depthWrite = this.depthWrite, n.colorWrite = this.colorWrite, n.clipIntersection = this.clipIntersection, n.clipShadows = this.clipShadows, n.stencilWriteMask = this.stencilWriteMask, n.stencilFunc = this.stencilFunc, n.stencilRef = this.stencilRef, n.stencilFuncMask = this.stencilFuncMask, n.stencilFail = this.stencilFail, n.stencilZFail = this.stencilZFail, n.stencilZPass = this.stencilZPass, n.stencilWrite = this.stencilWrite, n.polygonOffset = this.polygonOffset, n.polygonOffsetFactor = this.polygonOffsetFactor, n.polygonOffsetUnits = this.polygonOffsetUnits, n.dithering = this.dithering, n.alphaTest = this.alphaTest, n.alphaHash = this.alphaHash, n.alphaToCoverage = this.alphaToCoverage, n.premultipliedAlpha = this.premultipliedAlpha, n.forceSinglePass = this.forceSinglePass, n.allowOverride = this.allowOverride, n.visible = this.visible, n.toneMapped = this.toneMapped, n.name = this.name, this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.diffuseRoughness !== void 0 && (n.diffuseRoughness = this.diffuseRoughness), this.diffuseRoughnessMap && this.diffuseRoughnessMap.isTexture && (n.diffuseRoughnessMap = this.diffuseRoughnessMap.toJSON(e).uuid), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.sheenColorMap && this.sheenColorMap.isTexture && (n.sheenColorMap = this.sheenColorMap.toJSON(e).uuid), this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture && (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(e).uuid), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.retroreflectivity !== void 0 && (n.retroreflectivity = this.retroreflectivity), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessMinimum !== void 0 && (n.iridescenceThicknessMinimum = this.iridescenceThicknessMinimum), this.iridescenceThicknessMaximum !== void 0 && (n.iridescenceThicknessMaximum = this.iridescenceThicknessMaximum), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), Array.isArray(this.clippingPlanes) && this.clippingPlanes.length > 0 && (n.clippingPlanes = this.clippingPlanes.map(r => r.toJSON())), this.rotation !== void 0 && (n.rotation = this.rotation), this.depthPacking !== void 0 && (n.depthPacking = this.depthPacking), this.linewidth !== void 0 && (n.linewidth = this.linewidth), this.linecap !== void 0 && (n.linecap = this.linecap), this.linejoin !== void 0 && (n.linejoin = this.linejoin), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.wireframe !== void 0 && (n.wireframe = this.wireframe), this.wireframeLinewidth !== void 0 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== void 0 && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== void 0 && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading !== void 0 && (n.flatShading = this.flatShading), this.fog !== void 0 && (n.fog = this.fog), Object.keys(this.userData).length > 0 && (n.userData = this.userData);

    function i(r) {
      const a = [];
      for (const o in r) {
        const l = r[o];
        delete l.metadata, a.push(l)
      }
      return a
    }
    if (t) {
      const r = i(e.textures),
        a = i(e.images);
      r.length > 0 && (n.textures = r), a.length > 0 && (n.images = a)
    }
    return n
  }
  fromJSON(e, t) {
    if (e.uuid !== void 0 && (this.uuid = e.uuid), e.name !== void 0 && (this.name = e.name), e.color !== void 0 && this.color !== void 0 && this.color.setHex(e.color), e.roughness !== void 0 && (this.roughness = e.roughness), e.metalness !== void 0 && (this.metalness = e.metalness), e.sheen !== void 0 && (this.sheen = e.sheen), e.sheenColor !== void 0 && (this.sheenColor = new Fe().setHex(e.sheenColor)), e.sheenRoughness !== void 0 && (this.sheenRoughness = e.sheenRoughness), e.emissive !== void 0 && this.emissive !== void 0 && this.emissive.setHex(e.emissive), e.specular !== void 0 && this.specular !== void 0 && this.specular.setHex(e.specular), e.specularIntensity !== void 0 && (this.specularIntensity = e.specularIntensity), e.specularColor !== void 0 && this.specularColor !== void 0 && this.specularColor.setHex(e.specularColor), e.shininess !== void 0 && (this.shininess = e.shininess), e.clearcoat !== void 0 && (this.clearcoat = e.clearcoat), e.clearcoatRoughness !== void 0 && (this.clearcoatRoughness = e.clearcoatRoughness), e.diffuseRoughness !== void 0 && (this.diffuseRoughness = e.diffuseRoughness), e.dispersion !== void 0 && (this.dispersion = e.dispersion), e.retroreflectivity !== void 0 && (this.retroreflectivity = e.retroreflectivity), e.iridescence !== void 0 && (this.iridescence = e.iridescence), e.iridescenceIOR !== void 0 && (this.iridescenceIOR = e.iridescenceIOR), e.iridescenceThicknessMinimum !== void 0 && (this.iridescenceThicknessMinimum = e.iridescenceThicknessMinimum), e.iridescenceThicknessMaximum !== void 0 && (this.iridescenceThicknessMaximum = e.iridescenceThicknessMaximum), e.iridescenceThicknessRange !== void 0 && (this.iridescenceThicknessMinimum = e.iridescenceThicknessRange[0], this.iridescenceThicknessMaximum = e.iridescenceThicknessRange[1]), e.transmission !== void 0 && (this.transmission = e.transmission), e.thickness !== void 0 && (this.thickness = e.thickness), e.attenuationDistance !== void 0 && (this.attenuationDistance = e.attenuationDistance), e.attenuationColor !== void 0 && this.attenuationColor !== void 0 && this.attenuationColor.setHex(e.attenuationColor), e.anisotropy !== void 0 && (this.anisotropy = e.anisotropy), e.anisotropyRotation !== void 0 && (this.anisotropyRotation = e.anisotropyRotation), e.fog !== void 0 && (this.fog = e.fog), e.flatShading !== void 0 && (this.flatShading = e.flatShading), e.blending !== void 0 && (this.blending = e.blending), e.combine !== void 0 && (this.combine = e.combine), e.side !== void 0 && (this.side = e.side), e.shadowSide !== void 0 && (this.shadowSide = e.shadowSide), e.opacity !== void 0 && (this.opacity = e.opacity), e.transparent !== void 0 && (this.transparent = e.transparent), e.alphaTest !== void 0 && (this.alphaTest = e.alphaTest), e.alphaHash !== void 0 && (this.alphaHash = e.alphaHash), e.depthFunc !== void 0 && (this.depthFunc = e.depthFunc), e.depthTest !== void 0 && (this.depthTest = e.depthTest), e.depthWrite !== void 0 && (this.depthWrite = e.depthWrite), e.colorWrite !== void 0 && (this.colorWrite = e.colorWrite), e.clippingPlanes !== void 0 && (this.clippingPlanes = e.clippingPlanes.map(n => new Xn().fromJSON(n))), e.clipIntersection !== void 0 && (this.clipIntersection = e.clipIntersection), e.clipShadows !== void 0 && (this.clipShadows = e.clipShadows), e.depthPacking !== void 0 && (this.depthPacking = e.depthPacking), e.blendSrc !== void 0 && (this.blendSrc = e.blendSrc), e.blendDst !== void 0 && (this.blendDst = e.blendDst), e.blendEquation !== void 0 && (this.blendEquation = e.blendEquation), e.blendSrcAlpha !== void 0 && (this.blendSrcAlpha = e.blendSrcAlpha), e.blendDstAlpha !== void 0 && (this.blendDstAlpha = e.blendDstAlpha), e.blendEquationAlpha !== void 0 && (this.blendEquationAlpha = e.blendEquationAlpha), e.blendColor !== void 0 && this.blendColor !== void 0 && this.blendColor.setHex(e.blendColor), e.blendAlpha !== void 0 && (this.blendAlpha = e.blendAlpha), e.stencilWriteMask !== void 0 && (this.stencilWriteMask = e.stencilWriteMask), e.stencilFunc !== void 0 && (this.stencilFunc = e.stencilFunc), e.stencilRef !== void 0 && (this.stencilRef = e.stencilRef), e.stencilFuncMask !== void 0 && (this.stencilFuncMask = e.stencilFuncMask), e.stencilFail !== void 0 && (this.stencilFail = e.stencilFail), e.stencilZFail !== void 0 && (this.stencilZFail = e.stencilZFail), e.stencilZPass !== void 0 && (this.stencilZPass = e.stencilZPass), e.stencilWrite !== void 0 && (this.stencilWrite = e.stencilWrite), e.wireframe !== void 0 && (this.wireframe = e.wireframe), e.wireframeLinewidth !== void 0 && (this.wireframeLinewidth = e.wireframeLinewidth), e.wireframeLinecap !== void 0 && (this.wireframeLinecap = e.wireframeLinecap), e.wireframeLinejoin !== void 0 && (this.wireframeLinejoin = e.wireframeLinejoin), e.rotation !== void 0 && (this.rotation = e.rotation), e.linewidth !== void 0 && (this.linewidth = e.linewidth), e.linecap !== void 0 && (this.linecap = e.linecap), e.linejoin !== void 0 && (this.linejoin = e.linejoin), e.dashSize !== void 0 && (this.dashSize = e.dashSize), e.gapSize !== void 0 && (this.gapSize = e.gapSize), e.scale !== void 0 && (this.scale = e.scale), e.polygonOffset !== void 0 && (this.polygonOffset = e.polygonOffset), e.polygonOffsetFactor !== void 0 && (this.polygonOffsetFactor = e.polygonOffsetFactor), e.polygonOffsetUnits !== void 0 && (this.polygonOffsetUnits = e.polygonOffsetUnits), e.dithering !== void 0 && (this.dithering = e.dithering), e.alphaToCoverage !== void 0 && (this.alphaToCoverage = e.alphaToCoverage), e.premultipliedAlpha !== void 0 && (this.premultipliedAlpha = e.premultipliedAlpha), e.forceSinglePass !== void 0 && (this.forceSinglePass = e.forceSinglePass), e.allowOverride !== void 0 && (this.allowOverride = e.allowOverride), e.visible !== void 0 && (this.visible = e.visible), e.toneMapped !== void 0 && (this.toneMapped = e.toneMapped), e.userData !== void 0 && (this.userData = e.userData), e.vertexColors !== void 0 && (typeof e.vertexColors == "number" ? this.vertexColors = e.vertexColors > 0 : this.vertexColors = e.vertexColors), e.size !== void 0 && (this.size = e.size), e.sizeAttenuation !== void 0 && (this.sizeAttenuation = e.sizeAttenuation), e.map !== void 0 && (this.map = t[e.map] || null), e.matcap !== void 0 && (this.matcap = t[e.matcap] || null), e.alphaMap !== void 0 && (this.alphaMap = t[e.alphaMap] || null), e.bumpMap !== void 0 && (this.bumpMap = t[e.bumpMap] || null), e.bumpScale !== void 0 && (this.bumpScale = e.bumpScale), e.normalMap !== void 0 && (this.normalMap = t[e.normalMap] || null), e.normalMapType !== void 0 && (this.normalMapType = e.normalMapType), e.normalScale !== void 0) {
      let n = e.normalScale;
      Array.isArray(n) === !1 && (n = [n, n]), this.normalScale = new re().fromArray(n)
    }
    return e.displacementMap !== void 0 && (this.displacementMap = t[e.displacementMap] || null), e.displacementScale !== void 0 && (this.displacementScale = e.displacementScale), e.displacementBias !== void 0 && (this.displacementBias = e.displacementBias), e.roughnessMap !== void 0 && (this.roughnessMap = t[e.roughnessMap] || null), e.metalnessMap !== void 0 && (this.metalnessMap = t[e.metalnessMap] || null), e.emissiveMap !== void 0 && (this.emissiveMap = t[e.emissiveMap] || null), e.emissiveIntensity !== void 0 && (this.emissiveIntensity = e.emissiveIntensity), e.specularMap !== void 0 && (this.specularMap = t[e.specularMap] || null), e.specularIntensityMap !== void 0 && (this.specularIntensityMap = t[e.specularIntensityMap] || null), e.specularColorMap !== void 0 && (this.specularColorMap = t[e.specularColorMap] || null), e.envMap !== void 0 && (this.envMap = t[e.envMap] || null), e.envMapRotation !== void 0 && this.envMapRotation.fromArray(e.envMapRotation), e.envMapIntensity !== void 0 && (this.envMapIntensity = e.envMapIntensity), e.reflectivity !== void 0 && (this.reflectivity = e.reflectivity), e.refractionRatio !== void 0 && (this.refractionRatio = e.refractionRatio), e.lightMap !== void 0 && (this.lightMap = t[e.lightMap] || null), e.lightMapIntensity !== void 0 && (this.lightMapIntensity = e.lightMapIntensity), e.aoMap !== void 0 && (this.aoMap = t[e.aoMap] || null), e.aoMapIntensity !== void 0 && (this.aoMapIntensity = e.aoMapIntensity), e.gradientMap !== void 0 && (this.gradientMap = t[e.gradientMap] || null), e.clearcoatMap !== void 0 && (this.clearcoatMap = t[e.clearcoatMap] || null), e.clearcoatRoughnessMap !== void 0 && (this.clearcoatRoughnessMap = t[e.clearcoatRoughnessMap] || null), e.clearcoatNormalMap !== void 0 && (this.clearcoatNormalMap = t[e.clearcoatNormalMap] || null), e.clearcoatNormalScale !== void 0 && (this.clearcoatNormalScale = new re().fromArray(e.clearcoatNormalScale)), e.diffuseRoughnessMap !== void 0 && (this.diffuseRoughnessMap = t[e.diffuseRoughnessMap] || null), e.iridescenceMap !== void 0 && (this.iridescenceMap = t[e.iridescenceMap] || null), e.iridescenceThicknessMap !== void 0 && (this.iridescenceThicknessMap = t[e.iridescenceThicknessMap] || null), e.transmissionMap !== void 0 && (this.transmissionMap = t[e.transmissionMap] || null), e.thicknessMap !== void 0 && (this.thicknessMap = t[e.thicknessMap] || null), e.anisotropyMap !== void 0 && (this.anisotropyMap = t[e.anisotropyMap] || null), e.sheenColorMap !== void 0 && (this.sheenColorMap = t[e.sheenColorMap] || null), e.sheenRoughnessMap !== void 0 && (this.sheenRoughnessMap = t[e.sheenRoughnessMap] || null), this
  }
  clone() {
    return new this.constructor().copy(this)
  }
  copy(e) {
    this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
    const t = e.clippingPlanes;
    let n = null;
    if (t !== null) {
      const i = t.length;
      n = new Array(i);
      for (let r = 0; r !== i; ++r) n[r] = t[r].clone()
    }
    return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.allowOverride = e.allowOverride, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this
  }
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    })
  }
  set needsUpdate(e) {
    e === !0 && this.version++
  }
}
const Pn = new N,
  ua = new N,
  qs = new N,
  Ys = new N;
class Ds {
  constructor(e = new N, t = new N(0, 0, -1)) {
    this.origin = e, this.direction = t
  }
  set(e, t) {
    return this.origin.copy(e), this.direction.copy(t), this
  }
  copy(e) {
    return this.origin.copy(e.origin), this.direction.copy(e.direction), this
  }
  at(e, t) {
    return t.copy(this.origin).addScaledVector(this.direction, e)
  }
  lookAt(e) {
    return this.direction.copy(e).sub(this.origin).normalize(), this
  }
  recast(e) {
    return this.origin.copy(this.at(e, Pn)), this
  }
  closestPointToPoint(e, t) {
    t.subVectors(e, this.origin);
    const n = t.dot(this.direction);
    return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n)
  }
  distanceToPoint(e) {
    return Math.sqrt(this.distanceSqToPoint(e))
  }
  distanceSqToPoint(e) {
    const t = Pn.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (Pn.copy(this.origin).addScaledVector(this.direction, t), Pn.distanceToSquared(e))
  }
  distanceSqToSegment(e, t, n, i) {
    ua.copy(e).add(t).multiplyScalar(.5), qs.copy(t).sub(e).normalize(), Ys.copy(this.origin).sub(ua);
    const r = e.distanceTo(t) * .5,
      a = -this.direction.dot(qs),
      o = Ys.dot(this.direction),
      l = -Ys.dot(qs),
      c = Ys.lengthSq(),
      h = Math.abs(1 - a * a);
    let u, d, f, p;
    if (h > 0)
      if (u = a * l - o, d = a * o - l, p = r * h, u >= 0)
        if (d >= -p)
          if (d <= p) {
            const x = 1 / h;
            u *= x, d *= x, f = u * (u + a * d + 2 * o) + d * (a * u + d + 2 * l) + c
          } else d = r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * l) + c;
    else d = -r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * l) + c;
    else d <= -p ? (u = Math.max(0, -(-a * r + o)), d = u > 0 ? -r : Math.min(Math.max(-r, -l), r), f = -u * u + d * (d + 2 * l) + c) : d <= p ? (u = 0, d = Math.min(Math.max(-r, -l), r), f = d * (d + 2 * l) + c) : (u = Math.max(0, -(a * r + o)), d = u > 0 ? r : Math.min(Math.max(-r, -l), r), f = -u * u + d * (d + 2 * l) + c);
    else d = a > 0 ? -r : r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * l) + c;
    return n && n.copy(this.origin).addScaledVector(this.direction, u), i && i.copy(ua).addScaledVector(qs, d), f
  }
  intersectSphere(e, t) {
    if (e.radius < 0) return null;
    Pn.subVectors(e.center, this.origin);
    const n = Pn.dot(this.direction),
      i = Pn.dot(Pn) - n * n,
      r = e.radius * e.radius;
    if (i > r) return null;
    const a = Math.sqrt(r - i),
      o = n - a,
      l = n + a;
    return l < 0 ? null : o < 0 ? this.at(l, t) : this.at(o, t)
  }
  intersectsSphere(e) {
    return e.radius < 0 ? !1 : this.distanceSqToPoint(e.center) <= e.radius * e.radius
  }
  distanceToPlane(e) {
    const t = e.normal.dot(this.direction);
    if (t === 0) return e.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(e.normal) + e.constant) / t;
    return n >= 0 ? n : null
  }
  intersectPlane(e, t) {
    const n = this.distanceToPlane(e);
    return n === null ? null : this.at(n, t)
  }
  intersectsPlane(e) {
    const t = e.distanceToPoint(this.origin);
    return t === 0 || e.normal.dot(this.direction) * t < 0
  }
  intersectBox(e, t) {
    let n, i, r, a, o, l;
    const c = 1 / this.direction.x,
      h = 1 / this.direction.y,
      u = 1 / this.direction.z,
      d = this.origin;
    return c >= 0 ? (n = (e.min.x - d.x) * c, i = (e.max.x - d.x) * c) : (n = (e.max.x - d.x) * c, i = (e.min.x - d.x) * c), h >= 0 ? (r = (e.min.y - d.y) * h, a = (e.max.y - d.y) * h) : (r = (e.max.y - d.y) * h, a = (e.min.y - d.y) * h), n > a || r > i || ((r > n || isNaN(n)) && (n = r), (a < i || isNaN(i)) && (i = a), u >= 0 ? (o = (e.min.z - d.z) * u, l = (e.max.z - d.z) * u) : (o = (e.max.z - d.z) * u, l = (e.min.z - d.z) * u), n > l || o > i) || ((o > n || n !== n) && (n = o), (l < i || i !== i) && (i = l), i < 0) ? null : this.at(n >= 0 ? n : i, t)
  }
  intersectsBox(e) {
    return this.intersectBox(e, Pn) !== null
  }
  intersectTriangle(e, t, n, i, r) {
    const a = this.origin,
      o = this.direction,
      l = o.x,
      c = o.y,
      h = o.z,
      u = e.x - a.x,
      d = e.y - a.y,
      f = e.z - a.z,
      p = t.x - a.x,
      x = t.y - a.y,
      m = t.z - a.z,
      g = n.x - a.x,
      M = n.y - a.y,
      E = n.z - a.z,
      v = Math.abs(l),
      A = Math.abs(c),
      b = Math.abs(h);
    let _, T, I, R, D, F, V, L, k, X, H, te;
    if (v >= A && v >= b ? (I = l, F = u, k = p, te = g, l >= 0 ? (_ = c, T = h, R = d, D = f, V = x, L = m, X = M, H = E) : (_ = h, T = c, R = f, D = d, V = m, L = x, X = E, H = M)) : A >= b ? (I = c, F = d, k = x, te = M, c >= 0 ? (_ = h, T = l, R = f, D = u, V = m, L = p, X = E, H = g) : (_ = l, T = h, R = u, D = f, V = p, L = m, X = g, H = E)) : (I = h, F = f, k = m, te = E, h >= 0 ? (_ = l, T = c, R = u, D = d, V = p, L = x, X = g, H = M) : (_ = c, T = l, R = d, D = u, V = x, L = p, X = M, H = g)), I === 0) return null;
    const W = _ / I,
      Q = T / I,
      ee = 1 / I,
      Te = R - W * F,
      Oe = D - Q * F,
      Y = V - W * k,
      _e = L - Q * k,
      Ee = X - W * te,
      Ne = H - Q * te,
      xe = Ee * _e - Ne * Y,
      De = Te * Ne - Oe * Ee,
      mt = Y * Oe - _e * Te;
    if (i) {
      if (xe < 0 || De < 0 || mt < 0) return null
    } else if ((xe < 0 || De < 0 || mt < 0) && (xe > 0 || De > 0 || mt > 0)) return null;
    const Be = xe + De + mt;
    if (Be === 0) return null;
    const Je = ee * (xe * F + De * k + mt * te);
    return (Be > 0 ? Je < 0 : Je > 0) ? null : this.at(Je / Be, r)
  }
  applyMatrix4(e) {
    return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this
  }
  equals(e) {
    return e.origin.equals(this.origin) && e.direction.equals(this.direction)
  }
  clone() {
    return new this.constructor().copy(this)
  }
}
class Ni extends Zt {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Fe(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Tn, this.combine = Ur, this.reflectivity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e)
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this
  }
}
const zl = new We,
  ri = new Ds,
  Ks = new En,
  kl = new N,
  Js = new N,
  Zs = new N,
  $s = new N,
  da = new N,
  Qs = new N,
  Hl = new N,
  js = new N;
class At extends gt {
  constructor(e = new wt, t = new Ni) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets()
  }
  copy(e, t) {
    return super.copy(e, t), e.morphTargetInfluences !== void 0 ? this.morphTargetInfluences = e.morphTargetInfluences.slice() : this.morphTargetInfluences = void 0, e.morphTargetDictionary !== void 0 ? this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary) : this.morphTargetDictionary = void 0, this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes,
      n = Object.keys(t);
    if (n.length > 0) {
      const i = t[n[0]];
      if (i !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, a = i.length; r < a; r++) {
          const o = i[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r
        }
      }
    }
  }
  getVertexPosition(e, t) {
    const n = this.geometry,
      i = n.attributes.position,
      r = n.morphAttributes.position,
      a = n.morphTargetsRelative;
    t.fromBufferAttribute(i, e);
    const o = this.morphTargetInfluences;
    if (r && o) {
      Qs.set(0, 0, 0);
      for (let l = 0, c = r.length; l < c; l++) {
        const h = o[l],
          u = r[l];
        h !== 0 && (da.fromBufferAttribute(u, e), a ? Qs.addScaledVector(da, h) : Qs.addScaledVector(da.sub(t), h))
      }
      t.add(Qs)
    }
    return t
  }
  intersectsFrustum(e) {
    return e.intersectsObject(this)
  }
  raycast(e, t) {
    const n = this.geometry,
      i = this.material,
      r = this.matrixWorld;
    i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Ks.copy(n.boundingSphere), Ks.applyMatrix4(r), ri.copy(e.ray).recast(e.near), !(Ks.containsPoint(ri.origin) === !1 && (ri.intersectSphere(Ks, kl) === null || ri.origin.distanceToSquared(kl) > (e.far - e.near) ** 2)) && (zl.copy(r).invert(), ri.copy(e.ray).applyMatrix4(zl), !(n.boundingBox !== null && ri.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, ri)))
  }
  _computeIntersections(e, t, n) {
    let i;
    const r = this.geometry,
      a = this.material,
      o = r.index,
      l = r.attributes.position,
      c = r.attributes.uv,
      h = r.attributes.uv1,
      u = r.attributes.normal,
      d = r.groups,
      f = r.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let p = 0, x = d.length; p < x; p++) {
          const m = d[p],
            g = a[m.materialIndex],
            M = Math.max(m.start, f.start),
            E = Math.min(o.count, Math.min(m.start + m.count, f.start + f.count));
          for (let v = M, A = E; v < A; v += 3) {
            const b = o.getX(v),
              _ = o.getX(v + 1),
              T = o.getX(v + 2);
            i = er(this, g, e, n, c, h, u, b, _, T), i && (i.faceIndex = Math.floor(v / 3), i.face.materialIndex = m.materialIndex, t.push(i))
          }
        } else {
          const p = Math.max(0, f.start),
            x = Math.min(o.count, f.start + f.count);
          for (let m = p, g = x; m < g; m += 3) {
            const M = o.getX(m),
              E = o.getX(m + 1),
              v = o.getX(m + 2);
            i = er(this, a, e, n, c, h, u, M, E, v), i && (i.faceIndex = Math.floor(m / 3), t.push(i))
          }
        } else if (l !== void 0)
          if (Array.isArray(a))
            for (let p = 0, x = d.length; p < x; p++) {
              const m = d[p],
                g = a[m.materialIndex],
                M = Math.max(m.start, f.start),
                E = Math.min(l.count, Math.min(m.start + m.count, f.start + f.count));
              for (let v = M, A = E; v < A; v += 3) {
                const b = v,
                  _ = v + 1,
                  T = v + 2;
                i = er(this, g, e, n, c, h, u, b, _, T), i && (i.faceIndex = Math.floor(v / 3), i.face.materialIndex = m.materialIndex, t.push(i))
              }
            } else {
              const p = Math.max(0, f.start),
                x = Math.min(l.count, f.start + f.count);
              for (let m = p, g = x; m < g; m += 3) {
                const M = m,
                  E = m + 1,
                  v = m + 2;
                i = er(this, a, e, n, c, h, u, M, E, v), i && (i.faceIndex = Math.floor(m / 3), t.push(i))
              }
            }
  }
}

function jd(s, e, t, n, i, r, a, o) {
  let l;
  if (e.side === Wt ? l = n.intersectTriangle(a, r, i, !0, o) : l = n.intersectTriangle(i, r, a, e.side === $n, o), l === null) return null;
  js.copy(o), js.applyMatrix4(s.matrixWorld);
  const c = t.ray.origin.distanceTo(js);
  return c < t.near || c > t.far ? null : {
    distance: c,
    point: js.clone(),
    object: s
  }
}

function er(s, e, t, n, i, r, a, o, l, c) {
  s.getVertexPosition(o, Js), s.getVertexPosition(l, Zs), s.getVertexPosition(c, $s);
  const h = jd(s, e, t, n, Js, Zs, $s, Hl);
  if (h) {
    const u = new N;
    an.getBarycoord(Hl, Js, Zs, $s, u), i && (h.uv = an.getInterpolatedAttribute(i, o, l, c, u, new re)), r && (h.uv1 = an.getInterpolatedAttribute(r, o, l, c, u, new re)), a && (h.normal = an.getInterpolatedAttribute(a, o, l, c, u, new N), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const d = {
      a: o,
      b: l,
      c,
      normal: new N,
      materialIndex: 0
    };
    an.getNormal(Js, Zs, $s, d.normal), h.face = d, h.barycoord = u
  }
  return h
}
const ns = new ht,
  Gl = new ht,
  Vl = new ht,
  ef = new ht,
  Wl = new We,
  tr = new N,
  fa = new En,
  Xl = new We,
  pa = new Ds;
class Ah extends At {
  constructor(e, t) {
    super(e, t), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = yl, this.bindMatrix = new We, this.bindMatrixInverse = new We, this.boundingBox = null, this.boundingSphere = null
  }
  computeBoundingBox() {
    const e = this.geometry;
    this.boundingBox === null && (this.boundingBox = new un), this.boundingBox.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++) this.getVertexPosition(n, tr), this.boundingBox.expandByPoint(tr)
  }
  computeBoundingSphere() {
    const e = this.geometry;
    this.boundingSphere === null && (this.boundingSphere = new En), this.boundingSphere.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++) this.getVertexPosition(n, tr), this.boundingSphere.expandByPoint(tr)
  }
  copy(e, t) {
    return super.copy(e, t), this.bindMode = e.bindMode, this.bindMatrix.copy(e.bindMatrix), this.bindMatrixInverse.copy(e.bindMatrixInverse), this.skeleton = e.skeleton, this.boundingBox = e.boundingBox !== null ? e.boundingBox.clone() : null, this.boundingSphere = e.boundingSphere !== null ? e.boundingSphere.clone() : null, this
  }
  raycast(e, t) {
    const n = this.material,
      i = this.matrixWorld;
    n !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), fa.copy(this.boundingSphere), fa.applyMatrix4(i), e.ray.intersectsSphere(fa) !== !1 && (Xl.copy(i).invert(), pa.copy(e.ray).applyMatrix4(Xl), !(this.boundingBox !== null && pa.intersectsBox(this.boundingBox) === !1) && this._computeIntersections(e, t, pa)))
  }
  getVertexPosition(e, t) {
    return super.getVertexPosition(e, t), this.applyBoneTransform(e, t), t
  }
  bind(e, t) {
    this.skeleton = e, t === void 0 && (this.updateMatrixWorld(!0), this.skeleton.calculateInverses(), t = this.matrixWorld), this.bindMatrix.copy(t), this.bindMatrixInverse.copy(t).invert()
  }
  pose() {
    this.skeleton.pose()
  }
  normalizeSkinWeights() {
    const e = new ht,
      t = this.geometry.attributes.skinWeight;
    for (let n = 0, i = t.count; n < i; n++) {
      e.fromBufferAttribute(t, n);
      const r = 1 / e.manhattanLength();
      r !== 1 / 0 ? e.multiplyScalar(r) : e.set(1, 0, 0, 0), t.setXYZW(n, e.x, e.y, e.z, e.w)
    }
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.bindMode === yl ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === Ju ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : Ce("SkinnedMesh: Unrecognized bindMode: " + this.bindMode)
  }
  applyBoneTransform(e, t) {
    const n = this.skeleton,
      i = this.geometry;
    Gl.fromBufferAttribute(i.attributes.skinIndex, e), Vl.fromBufferAttribute(i.attributes.skinWeight, e), t.isVector4 ? (ns.copy(t), t.set(0, 0, 0, 0)) : (ns.set(t.x, t.y, t.z, 1), t.set(0, 0, 0)), ns.applyMatrix4(this.bindMatrix);
    for (let r = 0; r < 4; r++) {
      const a = Vl.getComponent(r);
      if (a !== 0) {
        const o = Gl.getComponent(r);
        Wl.multiplyMatrices(n.bones[o].matrixWorld, n.boneInverses[o]), t.addScaledVector(ef.copy(ns).applyMatrix4(Wl), a)
      }
    }
    return t.isVector4 && (t.w = ns.w), t.applyMatrix4(this.bindMatrixInverse)
  }
}
class Ho extends gt {
  constructor() {
    super(), this.isBone = !0, this.type = "Bone"
  }
}
class Go extends vt {
  constructor(e = null, t = 1, n = 1, i, r, a, o, l, c = Rt, h = Rt, u, d) {
    super(null, a, o, l, c, h, i, r, u, d), this.isDataTexture = !0, this.image = {
      data: e,
      width: t,
      height: n
    }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1
  }
}
const ql = new We,
  tf = new We;
class Vo {
  constructor(e = [], t = []) {
    this.uuid = hn(), this.bones = e.slice(0), this.boneInverses = t, this.boneMatrices = null, this.previousBoneMatrices = null, this.boneTexture = null, this.previousBoneTexture = null, this.init()
  }
  init() {
    const e = this.bones,
      t = this.boneInverses;
    if (this.boneMatrices = new Float32Array(e.length * 16), t.length === 0) this.calculateInverses();
    else if (e.length !== t.length) {
      Ce("Skeleton: Number of inverse bone matrices does not match amount of bones."), this.boneInverses = [];
      for (let n = 0, i = this.bones.length; n < i; n++) this.boneInverses.push(new We)
    }
  }
  calculateInverses() {
    this.boneInverses.length = 0;
    for (let e = 0, t = this.bones.length; e < t; e++) {
      const n = new We;
      this.bones[e] && n.copy(this.bones[e].matrixWorld).invert(), this.boneInverses.push(n)
    }
  }
  pose() {
    for (let e = 0, t = this.bones.length; e < t; e++) {
      const n = this.bones[e];
      n && n.matrixWorld.copy(this.boneInverses[e]).invert()
    }
    for (let e = 0, t = this.bones.length; e < t; e++) {
      const n = this.bones[e];
      n && (n.parent && n.parent.isBone ? (n.matrix.copy(n.parent.matrixWorld).invert(), n.matrix.multiply(n.matrixWorld)) : n.matrix.copy(n.matrixWorld), n.matrix.decompose(n.position, n.quaternion, n.scale))
    }
  }
  update() {
    const e = this.bones,
      t = this.boneInverses,
      n = this.boneMatrices,
      i = this.boneTexture;
    for (let r = 0, a = e.length; r < a; r++) {
      const o = e[r] ? e[r].matrixWorld : tf;
      ql.multiplyMatrices(o, t[r]), ql.toArray(n, r * 16)
    }
    i !== null && (i.needsUpdate = !0)
  }
  clone() {
    return new Vo(this.bones, this.boneInverses)
  }
  computeBoneTexture() {
    let e = Math.sqrt(this.bones.length * 4);
    e = Math.ceil(e / 4) * 4, e = Math.max(e, 4);
    const t = new Float32Array(e * e * 4);
    t.set(this.boneMatrices);
    const n = new Go(t, e, e, ln, jt);
    return n.needsUpdate = !0, this.boneMatrices = t, this.boneTexture = n, this
  }
  getBoneByName(e) {
    for (let t = 0, n = this.bones.length; t < n; t++) {
      const i = this.bones[t];
      if (i.name === e) return i
    }
  }
  dispose() {
    this.boneTexture !== null && (this.boneTexture.dispose(), this.boneTexture = null), this.previousBoneTexture !== null && (this.previousBoneTexture.dispose(), this.previousBoneTexture = null)
  }
  fromJSON(e, t) {
    this.uuid = e.uuid;
    for (let n = 0, i = e.bones.length; n < i; n++) {
      const r = e.bones[n];
      let a = t[r];
      a === void 0 && (Ce("Skeleton: No bone found with UUID:", r), a = new Ho), this.bones.push(a), this.boneInverses.push(new We().fromArray(e.boneInverses[n]))
    }
    return this.init(), this
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.7,
        type: "Skeleton",
        generator: "Skeleton.toJSON"
      },
      bones: [],
      boneInverses: []
    };
    e.uuid = this.uuid;
    const t = this.bones,
      n = this.boneInverses;
    for (let i = 0, r = t.length; i < r; i++) {
      const a = t[i];
      e.bones.push(a.uuid);
      const o = n[i];
      e.boneInverses.push(o.toArray())
    }
    return e
  }
}
class Rr extends Ft {
  constructor(e, t, n, i = 1) {
    super(e, t, n), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = i
  }
  copy(e) {
    return super.copy(e), this.meshPerAttribute = e.meshPerAttribute, this
  }
  toJSON() {
    const e = super.toJSON();
    return e.meshPerAttribute = this.meshPerAttribute, e.isInstancedBufferAttribute = !0, e
  }
}
const bi = new We,
  Yl = new We,
  nr = [],
  Kl = new un,
  nf = new We,
  is = new At,
  ss = new En;
class wh extends At {
  constructor(e, t, n) {
    super(e, t), this.isInstancedMesh = !0, this.instanceMatrix = new Rr(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
    for (let i = 0; i < n; i++) this.setMatrixAt(i, nf)
  }
  computeBoundingBox() {
    const e = this.geometry,
      t = this.count;
    this.boundingBox === null && (this.boundingBox = new un), e.boundingBox === null && e.computeBoundingBox(), this.boundingBox.makeEmpty();
    for (let n = 0; n < t; n++) this.getMatrixAt(n, bi), Kl.copy(e.boundingBox).applyMatrix4(bi), this.boundingBox.union(Kl)
  }
  computeBoundingSphere() {
    const e = this.geometry,
      t = this.count;
    this.boundingSphere === null && (this.boundingSphere = new En), e.boundingSphere === null && e.computeBoundingSphere(), this.boundingSphere.makeEmpty();
    for (let n = 0; n < t; n++) this.getMatrixAt(n, bi), ss.copy(e.boundingSphere).applyMatrix4(bi), this.boundingSphere.union(ss)
  }
  copy(e, t) {
    return super.copy(e, t), this.instanceMatrix.copy(e.instanceMatrix), this.morphTexture = e.morphTexture !== null ? e.morphTexture.clone() : null, this.instanceColor = e.instanceColor !== null ? e.instanceColor.clone() : null, this.count = e.count, this.boundingBox = e.boundingBox !== null ? e.boundingBox.clone() : null, this.boundingSphere = e.boundingSphere !== null ? e.boundingSphere.clone() : null, this
  }
  getColorAt(e, t) {
    return this.instanceColor === null ? t.setRGB(1, 1, 1) : t.fromArray(this.instanceColor.array, e * 3)
  }
  getMatrixAt(e, t) {
    return t.fromArray(this.instanceMatrix.array, e * 16)
  }
  getMorphAt(e, t) {
    const n = t.morphTargetInfluences,
      i = this.morphTexture.source.data.data,
      r = n.length + 1,
      a = e * r + 1;
    for (let o = 0; o < n.length; o++) n[o] = i[a + o]
  }
  raycast(e, t) {
    const n = this.matrixWorld,
      i = this.count;
    if (is.geometry = this.geometry, is.material = this.material, is.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), ss.copy(this.boundingSphere), ss.applyMatrix4(n), e.ray.intersectsSphere(ss) !== !1))
      for (let r = 0; r < i; r++) {
        this.getMatrixAt(r, bi), Yl.multiplyMatrices(n, bi), is.matrixWorld = Yl, is.raycast(e, nr);
        for (let a = 0, o = nr.length; a < o; a++) {
          const l = nr[a];
          l.instanceId = r, l.object = this, t.push(l)
        }
        nr.length = 0
      }
  }
  setColorAt(e, t) {
    return this.instanceColor === null && (this.instanceColor = new Rr(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), t.toArray(this.instanceColor.array, e * 3), this
  }
  setMatrixAt(e, t) {
    return t.toArray(this.instanceMatrix.array, e * 16), this
  }
  setMorphAt(e, t) {
    const n = t.morphTargetInfluences,
      i = n.length + 1;
    this.morphTexture === null && (this.morphTexture = new Go(new Float32Array(i * this.count), i, this.count, Po, jt));
    const r = this.morphTexture.source.data.data;
    let a = 0;
    for (let c = 0; c < n.length; c++) a += n[c];
    const o = this.geometry.morphTargetsRelative ? 1 : 1 - a,
      l = i * e;
    return r[l] = o, r.set(n, l + 1), this
  }
  updateMorphTargets() {}
  dispose() {
    super.dispose(), this.instanceMatrix.dispose(), this.instanceColor !== null && this.instanceColor.dispose(), this.morphTexture !== null && (this.morphTexture.dispose(), this.morphTexture = null)
  }
}
const ai = new En,
  sf = new re(.5, .5),
  ir = new N;
class As {
  constructor(e = new Xn, t = new Xn, n = new Xn, i = new Xn, r = new Xn, a = new Xn) {
    this.planes = [e, t, n, i, r, a]
  }
  set(e, t, n, i, r, a) {
    const o = this.planes;
    return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(i), o[4].copy(r), o[5].copy(a), this
  }
  copy(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) t[n].copy(e.planes[n]);
    return this
  }
  setFromProjectionMatrix(e, t = cn, n = !1) {
    const i = this.planes,
      r = e.elements,
      a = r[0],
      o = r[1],
      l = r[2],
      c = r[3],
      h = r[4],
      u = r[5],
      d = r[6],
      f = r[7],
      p = r[8],
      x = r[9],
      m = r[10],
      g = r[11],
      M = r[12],
      E = r[13],
      v = r[14],
      A = r[15];
    if (i[0].setComponents(c - a, f - h, g - p, A - M).normalize(), i[1].setComponents(c + a, f + h, g + p, A + M).normalize(), i[2].setComponents(c + o, f + u, g + x, A + E).normalize(), i[3].setComponents(c - o, f - u, g - x, A - E).normalize(), n) i[4].setComponents(l, d, m, v).normalize(), i[5].setComponents(c - l, f - d, g - m, A - v).normalize();
    else if (i[4].setComponents(c - l, f - d, g - m, A - v).normalize(), t === cn) i[5].setComponents(c + l, f + d, g + m, A + v).normalize();
    else if (t === Es) i[5].setComponents(l, d, m, v).normalize();
    else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0) e.boundingSphere === null && e.computeBoundingSphere(), ai.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), ai.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)
    }
    return this.intersectsSphere(ai)
  }
  intersectsSprite(e) {
    ai.center.set(0, 0, 0);
    const t = sf.distanceTo(e.center);
    return ai.radius = .7071067811865476 + t, ai.applyMatrix4(e.matrixWorld), this.intersectsSphere(ai)
  }
  intersectsSphere(e) {
    const t = this.planes,
      n = e.center,
      i = -e.radius;
    for (let r = 0; r < 6; r++)
      if (t[r].distanceToPoint(n) < i) return !1;
    return !0
  }
  intersectsBox(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) {
      const i = t[n];
      if (ir.x = i.normal.x > 0 ? e.max.x : e.min.x, ir.y = i.normal.y > 0 ? e.max.y : e.min.y, ir.z = i.normal.z > 0 ? e.max.z : e.min.z, i.distanceToPoint(ir) < 0) return !1
    }
    return !0
  }
  containsPoint(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++)
      if (t[n].distanceToPoint(e) < 0) return !1;
    return !0
  }
  clone() {
    return new this.constructor().copy(this)
  }
}
const Jl = new We;
class Wo {
  constructor() {
    this.coordinateSystem = cn, this._frustums = [], this._count = 0
  }
  setFromArrayCamera(e) {
    const t = e.cameras,
      n = this._frustums;
    for (let i = 0; i < t.length; i++) {
      const r = t[i];
      Jl.multiplyMatrices(r.projectionMatrix, r.matrixWorldInverse), n[i] === void 0 && (n[i] = new As), n[i].setFromProjectionMatrix(Jl, r.coordinateSystem, r.reversedDepth)
    }
    return this._count = t.length, this
  }
  getFrustum(e) {
    return this._frustums[e]
  }
  intersectsObject(e) {
    const t = this._frustums;
    for (let n = 0; n < this._count; n++)
      if (t[n].intersectsObject(e)) return !0;
    return !1
  }
  intersectsSprite(e) {
    const t = this._frustums;
    for (let n = 0; n < this._count; n++)
      if (t[n].intersectsSprite(e)) return !0;
    return !1
  }
  intersectsSphere(e) {
    const t = this._frustums;
    for (let n = 0; n < this._count; n++)
      if (t[n].intersectsSphere(e)) return !0;
    return !1
  }
  intersectsBox(e) {
    const t = this._frustums;
    for (let n = 0; n < this._count; n++)
      if (t[n].intersectsBox(e)) return !0;
    return !1
  }
  containsPoint(e) {
    const t = this._frustums;
    for (let n = 0; n < this._count; n++)
      if (t[n].containsPoint(e)) return !0;
    return !1
  }
  copy(e) {
    this.coordinateSystem = e.coordinateSystem;
    const t = this._frustums,
      n = e._frustums;
    for (let i = 0; i < e._count; i++) t[i] === void 0 && (t[i] = new As), t[i].copy(n[i]);
    return this._count = e._count, this
  }
  clone() {
    return new Wo().copy(this)
  }
}
class Xo extends Zt {
  constructor(e) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Fe(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e)
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this
  }
}
const Cr = new N,
  Lr = new N,
  Zl = new We,
  rs = new Ds,
  sr = new En,
  ma = new N,
  $l = new N;
class qo extends gt {
  constructor(e = new wt, t = new Xo) {
    super(), this.isLine = !0, this.type = "Line", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets()
  }
  copy(e, t) {
    return super.copy(e, t), e.morphTargetInfluences !== void 0 ? this.morphTargetInfluences = e.morphTargetInfluences.slice() : this.morphTargetInfluences = void 0, e.morphTargetDictionary !== void 0 ? this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary) : this.morphTargetDictionary = void 0, this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position,
        n = [0];
      for (let i = 1, r = t.count; i < r; i++) Cr.fromBufferAttribute(t, i - 1), Lr.fromBufferAttribute(t, i), n[i] = n[i - 1], n[i] += Cr.distanceTo(Lr);
      e.setAttribute("lineDistance", new ut(n, 1))
    } else Ce("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this
  }
  intersectsFrustum(e) {
    return e.intersectsObject(this)
  }
  raycast(e, t) {
    const n = this.geometry,
      i = this.matrixWorld,
      r = e.params.Line.threshold,
      a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), sr.copy(n.boundingSphere), sr.applyMatrix4(i), sr.radius += r, e.ray.intersectsSphere(sr) === !1) return;
    Zl.copy(i).invert(), rs.copy(e.ray).applyMatrix4(Zl);
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3),
      l = o * o,
      c = this.isLineSegments ? 2 : 1,
      h = n.index,
      d = n.attributes.position;
    if (h !== null) {
      const f = Math.max(0, a.start),
        p = Math.min(h.count, a.start + a.count);
      for (let x = f, m = p - 1; x < m; x += c) {
        const g = h.getX(x),
          M = h.getX(x + 1),
          E = rr(this, e, rs, l, g, M, x);
        E && t.push(E)
      }
      if (this.isLineLoop) {
        const x = h.getX(p - 1),
          m = h.getX(f),
          g = rr(this, e, rs, l, x, m, p - 1);
        g && t.push(g)
      }
    } else {
      const f = Math.max(0, a.start),
        p = Math.min(d.count, a.start + a.count);
      for (let x = f, m = p - 1; x < m; x += c) {
        const g = rr(this, e, rs, l, x, x + 1, x);
        g && t.push(g)
      }
      if (this.isLineLoop) {
        const x = rr(this, e, rs, l, p - 1, f, p - 1);
        x && t.push(x)
      }
    }
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes,
      n = Object.keys(t);
    if (n.length > 0) {
      const i = t[n[0]];
      if (i !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, a = i.length; r < a; r++) {
          const o = i[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r
        }
      }
    }
  }
}

function rr(s, e, t, n, i, r, a) {
  const o = s.geometry.attributes.position;
  if (Cr.fromBufferAttribute(o, i), Lr.fromBufferAttribute(o, r), t.distanceSqToSegment(Cr, Lr, ma, $l) > n) return;
  ma.applyMatrix4(s.matrixWorld);
  const c = e.ray.origin.distanceTo(ma);
  if (!(c < e.near || c > e.far)) return {
    distance: c,
    point: $l.clone().applyMatrix4(s.matrixWorld),
    index: a,
    face: null,
    faceIndex: null,
    barycoord: null,
    object: s
  }
}
const Ql = new N,
  jl = new N;
class Rh extends qo {
  constructor(e, t) {
    super(e, t), this.isLineSegments = !0, this.type = "LineSegments"
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position,
        n = [];
      for (let i = 0, r = t.count; i < r; i += 2) Ql.fromBufferAttribute(t, i), jl.fromBufferAttribute(t, i + 1), n[i] = i === 0 ? 0 : n[i - 1], n[i + 1] = n[i] + Ql.distanceTo(jl);
      e.setAttribute("lineDistance", new ut(n, 1))
    } else Ce("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this
  }
}
class rf extends qo {
  constructor(e, t) {
    super(e, t), this.isLineLoop = !0, this.type = "LineLoop"
  }
}
class Ch extends Zt {
  constructor(e) {
    super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new Fe(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(e)
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.size = e.size, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this
  }
}
const ec = new We,
  mo = new Ds,
  ar = new En,
  or = new N;
class af extends gt {
  constructor(e = new wt, t = new Ch) {
    super(), this.isPoints = !0, this.type = "Points", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets()
  }
  copy(e, t) {
    return super.copy(e, t), e.morphTargetInfluences !== void 0 ? this.morphTargetInfluences = e.morphTargetInfluences.slice() : this.morphTargetInfluences = void 0, e.morphTargetDictionary !== void 0 ? this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary) : this.morphTargetDictionary = void 0, this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this
  }
  intersectsFrustum(e) {
    return e.intersectsObject(this)
  }
  raycast(e, t) {
    const n = this.geometry,
      i = this.matrixWorld,
      r = e.params.Points.threshold,
      a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), ar.copy(n.boundingSphere), ar.applyMatrix4(i), ar.radius += r, e.ray.intersectsSphere(ar) === !1) return;
    ec.copy(i).invert(), mo.copy(e.ray).applyMatrix4(ec);
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3),
      l = o * o,
      c = n.index,
      u = n.attributes.position;
    if (c !== null) {
      const d = Math.max(0, a.start),
        f = Math.min(c.count, a.start + a.count);
      for (let p = d, x = f; p < x; p++) {
        const m = c.getX(p);
        or.fromBufferAttribute(u, m), tc(or, m, l, i, e, t, this)
      }
    } else {
      const d = Math.max(0, a.start),
        f = Math.min(u.count, a.start + a.count);
      for (let p = d, x = f; p < x; p++) or.fromBufferAttribute(u, p), tc(or, p, l, i, e, t, this)
    }
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes,
      n = Object.keys(t);
    if (n.length > 0) {
      const i = t[n[0]];
      if (i !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, a = i.length; r < a; r++) {
          const o = i[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r
        }
      }
    }
  }
}

function tc(s, e, t, n, i, r, a) {
  const o = mo.distanceSqToPoint(s);
  if (o < t) {
    const l = new N;
    mo.closestPointToPoint(s, l), l.applyMatrix4(n);
    const c = i.ray.origin.distanceTo(l);
    if (c < i.near || c > i.far) return;
    r.push({
      distance: c,
      distanceToRay: Math.sqrt(o),
      point: l,
      index: e,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: a
    })
  }
}
class Pv extends vt {
  constructor(e, t, n, i, r = Ct, a = Ct, o, l, c) {
    super(e, t, n, i, r, a, o, l, c), this.isVideoTexture = !0, this.generateMipmaps = !1, this._requestVideoFrameCallbackId = 0;
    const h = this;

    function u() {
      h.needsUpdate = !0, h._requestVideoFrameCallbackId = e.requestVideoFrameCallback(u)
    }
    "requestVideoFrameCallback" in e && (this._requestVideoFrameCallbackId = e.requestVideoFrameCallback(u))
  }
  clone() {
    return new this.constructor(this.image).copy(this)
  }
  update() {
    const e = this.image;
    "requestVideoFrameCallback" in e === !1 && e.readyState >= e.HAVE_CURRENT_DATA && (this.needsUpdate = !0)
  }
  dispose() {
    this._requestVideoFrameCallbackId !== 0 && (this.source.data.cancelVideoFrameCallback(this._requestVideoFrameCallbackId), this._requestVideoFrameCallbackId = 0), super.dispose()
  }
}
class Lh extends vt {
  constructor(e = [], t, n, i, r, a, o, l, c, h, u, d) {
    super(null, a, o, l, c, h, i, r, u, d), this.isCompressedTexture = !0, this.image = {
      width: t,
      height: n
    }, this.mipmaps = e, this.flipY = !1, this.generateMipmaps = !1
  }
}
class Iv extends Lh {
  constructor(e, t, n, i, r, a) {
    super(e, t, n, r, a), this.isCompressedArrayTexture = !0, this.image.depth = i, this.wrapR = on, this.layerUpdates = new Set
  }
  copy(e) {
    return super.copy(e), this.wrapR = e.wrapR, this
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e)
  }
  clearLayerUpdates() {
    this.layerUpdates.clear()
  }
}
class Nv extends Lh {
  constructor(e, t, n) {
    super(void 0, e[0].width, e[0].height, t, n, hi), this.isCompressedCubeTexture = !0, this.isCubeTexture = !0, this.image = e
  }
}
class Ph extends vt {
  constructor(e = [], t = hi, n, i, r, a, o, l, c, h) {
    super(e, t, n, i, r, a, o, l, c, h), this.isCubeTexture = !0, this.flipY = !1
  }
  get images() {
    return this.image
  }
  set images(e) {
    this.image = e
  }
}
class of extends vt {
  constructor(e, t, n, i, r, a, o, l, c) {
    super(e, t, n, i, r, a, o, l, c), this.isCanvasTexture = !0, this.needsUpdate = !0
  }
}
class Vi extends vt {
  constructor(e, t, n = Sn, i, r, a, o = Rt, l = Rt, c, h = Qn, u = 1) {
    if (h !== Qn && h !== Kn) throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    const d = {
      width: e,
      height: t,
      depth: u
    };
    super(d, i, r, a, o, l, h, n, c), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null
  }
  copy(e) {
    return super.copy(e), this.source = new zo(Object.assign({}, e.image)), this.compareFunction = e.compareFunction, this
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.compareFunction = this.compareFunction, t
  }
}
class Ih extends Vi {
  constructor(e, t = Sn, n = hi, i, r, a = Rt, o = Rt, l, c = Qn) {
    const h = {
        width: e,
        height: e,
        depth: 1
      },
      u = [h, h, h, h, h, h];
    super(e, e, t, n, i, r, a, o, l, c), this.image = u, this.isCubeDepthTexture = !0, this.isCubeTexture = !0
  }
  get images() {
    return this.image
  }
  set images(e) {
    this.image = e
  }
}
class Nh extends vt {
  constructor(e = null) {
    super(), this.sourceTexture = e, this.isExternalTexture = !0
  }
  copy(e) {
    return super.copy(e), this.sourceTexture = e.sourceTexture, this
  }
}
class qi extends wt {
  constructor(e = 1, t = 1, n = 1, i = 1, r = 1, a = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: e,
      height: t,
      depth: n,
      widthSegments: i,
      heightSegments: r,
      depthSegments: a
    };
    const o = this;
    i = Math.floor(i), r = Math.floor(r), a = Math.floor(a);
    const l = [],
      c = [],
      h = [],
      u = [];
    let d = 0,
      f = 0;
    p("z", "y", "x", -1, -1, n, t, e, a, r, 0), p("z", "y", "x", 1, -1, n, t, -e, a, r, 1), p("x", "z", "y", 1, 1, e, n, t, i, a, 2), p("x", "z", "y", 1, -1, e, n, -t, i, a, 3), p("x", "y", "z", 1, -1, e, t, n, i, r, 4), p("x", "y", "z", -1, -1, e, t, -n, i, r, 5), this.setIndex(l), this.setAttribute("position", new ut(c, 3)), this.setAttribute("normal", new ut(h, 3)), this.setAttribute("uv", new ut(u, 2));

    function p(x, m, g, M, E, v, A, b, _, T, I) {
      const R = v / _,
        D = A / T,
        F = v / 2,
        V = A / 2,
        L = b / 2,
        k = _ + 1,
        X = T + 1;
      let H = 0,
        te = 0;
      const W = new N;
      for (let Q = 0; Q < X; Q++) {
        const ee = Q * D - V;
        for (let Te = 0; Te < k; Te++) {
          const Oe = Te * R - F;
          W[x] = Oe * M, W[m] = ee * E, W[g] = L, c.push(W.x, W.y, W.z), W[x] = 0, W[m] = 0, W[g] = b > 0 ? 1 : -1, h.push(W.x, W.y, W.z), u.push(Te / _), u.push(1 - Q / T), H += 1
        }
      }
      for (let Q = 0; Q < T; Q++)
        for (let ee = 0; ee < _; ee++) {
          const Te = d + ee + k * Q,
            Oe = d + ee + k * (Q + 1),
            Y = d + (ee + 1) + k * (Q + 1),
            _e = d + (ee + 1) + k * Q;
          l.push(Te, Oe, _e), l.push(Oe, Y, _e), te += 6
        }
      o.addGroup(f, te, I), f += te, d += H
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
  }
  static fromJSON(e) {
    return new qi(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments)
  }
}
class Yo extends wt {
  constructor(e = 1, t = 1, n = 1, i = 32, r = 1, a = !1, o = 0, l = Math.PI * 2) {
    super(), this.type = "CylinderGeometry", this.parameters = {
      radiusTop: e,
      radiusBottom: t,
      height: n,
      radialSegments: i,
      heightSegments: r,
      openEnded: a,
      thetaStart: o,
      thetaLength: l
    };
    const c = this;
    i = Math.floor(i), r = Math.floor(r);
    const h = [],
      u = [],
      d = [],
      f = [];
    let p = 0;
    const x = [],
      m = n / 2;
    let g = 0;
    M(), a === !1 && (e > 0 && E(!0), t > 0 && E(!1)), this.setIndex(h), this.setAttribute("position", new ut(u, 3)), this.setAttribute("normal", new ut(d, 3)), this.setAttribute("uv", new ut(f, 2));

    function M() {
      const v = new N,
        A = new N;
      let b = 0;
      const _ = (t - e) / n;
      for (let T = 0; T <= r; T++) {
        const I = [],
          R = T / r,
          D = R * (t - e) + e;
        for (let F = 0; F <= i; F++) {
          const V = F / i,
            L = V * l + o,
            k = Math.sin(L),
            X = Math.cos(L);
          A.x = D * k, A.y = -R * n + m, A.z = D * X, u.push(A.x, A.y, A.z), v.set(k, _, X).normalize(), d.push(v.x, v.y, v.z), f.push(V, 1 - R), I.push(p++)
        }
        x.push(I)
      }
      for (let T = 0; T < i; T++)
        for (let I = 0; I < r; I++) {
          const R = x[I][T],
            D = x[I + 1][T],
            F = x[I + 1][T + 1],
            V = x[I][T + 1];
          (e > 0 || I !== 0) && (h.push(R, D, V), b += 3), (t > 0 || I !== r - 1) && (h.push(D, F, V), b += 3)
        }
      c.addGroup(g, b, 0), g += b
    }

    function E(v) {
      const A = p,
        b = new re,
        _ = new N;
      let T = 0;
      const I = v === !0 ? e : t,
        R = v === !0 ? 1 : -1;
      for (let F = 1; F <= i; F++) u.push(0, m * R, 0), d.push(0, R, 0), f.push(.5, .5), p++;
      const D = p;
      for (let F = 0; F <= i; F++) {
        const L = F / i * l + o,
          k = Math.cos(L),
          X = Math.sin(L);
        _.x = I * X, _.y = m * R, _.z = I * k, u.push(_.x, _.y, _.z), d.push(0, R, 0), b.x = k * .5 + .5, b.y = X * .5 * R + .5, f.push(b.x, b.y), p++
      }
      for (let F = 0; F < i; F++) {
        const V = A + F,
          L = D + F;
        v === !0 ? h.push(L, L + 1, V) : h.push(L + 1, L, V), T += 3
      }
      c.addGroup(g, T, v === !0 ? 1 : 2), g += T
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
  }
  static fromJSON(e) {
    return new Yo(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength)
  }
}
class Dh extends Yo {
  constructor(e = 1, t = 1, n = 32, i = 1, r = !1, a = 0, o = Math.PI * 2) {
    super(0, e, t, n, i, r, a, o), this.type = "ConeGeometry", this.parameters = {
      radius: e,
      height: t,
      radialSegments: n,
      heightSegments: i,
      openEnded: r,
      thetaStart: a,
      thetaLength: o
    }
  }
  static fromJSON(e) {
    return new Dh(e.radius, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength)
  }
}
class Ko extends wt {
  constructor(e = [], t = [], n = 1, i = 0) {
    super(), this.type = "PolyhedronGeometry", this.parameters = {
      vertices: e,
      indices: t,
      radius: n,
      detail: i
    };
    const r = [],
      a = [];
    o(i), c(n), h(), this.setAttribute("position", new ut(r, 3)), this.setAttribute("normal", new ut(r.slice(), 3)), this.setAttribute("uv", new ut(a, 2)), i === 0 ? this.computeVertexNormals() : this.normalizeNormals();

    function o(M) {
      const E = new N,
        v = new N,
        A = new N;
      for (let b = 0; b < t.length; b += 3) f(t[b + 0], E), f(t[b + 1], v), f(t[b + 2], A), l(E, v, A, M)
    }

    function l(M, E, v, A) {
      const b = A + 1,
        _ = [];
      for (let T = 0; T <= b; T++) {
        _[T] = [];
        const I = M.clone().lerp(v, T / b),
          R = E.clone().lerp(v, T / b),
          D = b - T;
        for (let F = 0; F <= D; F++) F === 0 && T === b ? _[T][F] = I : _[T][F] = I.clone().lerp(R, F / D)
      }
      for (let T = 0; T < b; T++)
        for (let I = 0; I < 2 * (b - T) - 1; I++) {
          const R = Math.floor(I / 2);
          I % 2 === 0 ? (d(_[T][R + 1]), d(_[T + 1][R]), d(_[T][R])) : (d(_[T][R + 1]), d(_[T + 1][R + 1]), d(_[T + 1][R]))
        }
    }

    function c(M) {
      const E = new N;
      for (let v = 0; v < r.length; v += 3) E.x = r[v + 0], E.y = r[v + 1], E.z = r[v + 2], E.normalize().multiplyScalar(M), r[v + 0] = E.x, r[v + 1] = E.y, r[v + 2] = E.z
    }

    function h() {
      const M = new N;
      for (let E = 0; E < r.length; E += 3) {
        M.x = r[E + 0], M.y = r[E + 1], M.z = r[E + 2];
        const v = m(M) / 2 / Math.PI + .5,
          A = g(M) / Math.PI + .5;
        a.push(v, 1 - A)
      }
      p(), u()
    }

    function u() {
      for (let M = 0; M < a.length; M += 6) {
        const E = a[M + 0],
          v = a[M + 2],
          A = a[M + 4],
          b = Math.max(E, v, A),
          _ = Math.min(E, v, A);
        b > .9 && _ < .1 && (E < .2 && (a[M + 0] += 1), v < .2 && (a[M + 2] += 1), A < .2 && (a[M + 4] += 1))
      }
    }

    function d(M) {
      r.push(M.x, M.y, M.z)
    }

    function f(M, E) {
      const v = M * 3;
      E.x = e[v + 0], E.y = e[v + 1], E.z = e[v + 2]
    }

    function p() {
      const M = new N,
        E = new N,
        v = new N,
        A = new N,
        b = new re,
        _ = new re,
        T = new re;
      for (let I = 0, R = 0; I < r.length; I += 9, R += 6) {
        M.set(r[I + 0], r[I + 1], r[I + 2]), E.set(r[I + 3], r[I + 4], r[I + 5]), v.set(r[I + 6], r[I + 7], r[I + 8]), b.set(a[R + 0], a[R + 1]), _.set(a[R + 2], a[R + 3]), T.set(a[R + 4], a[R + 5]), A.copy(M).add(E).add(v).divideScalar(3);
        const D = m(A);
        x(b, R + 0, M, D), x(_, R + 2, E, D), x(T, R + 4, v, D)
      }
    }

    function x(M, E, v, A) {
      A < 0 && M.x === 1 && (a[E] = M.x - 1), v.x === 0 && v.z === 0 && (a[E] = A / 2 / Math.PI + .5)
    }

    function m(M) {
      return Math.atan2(M.z, -M.x)
    }

    function g(M) {
      return Math.atan2(-M.y, Math.sqrt(M.x * M.x + M.z * M.z))
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
  }
  static fromJSON(e) {
    return new Ko(e.vertices, e.indices, e.radius, e.detail)
  }
}
class bn {
  constructor() {
    this.type = "Curve", this.arcLengthDivisions = 200, this.needsUpdate = !1, this.cacheArcLengths = null
  }
  getPoint() {
    Ce("Curve: .getPoint() not implemented.")
  }
  getPointAt(e, t) {
    const n = this.getUtoTmapping(e);
    return this.getPoint(n, t)
  }
  getPoints(e = 5) {
    const t = [];
    for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
    return t
  }
  getSpacedPoints(e = 5) {
    const t = [];
    for (let n = 0; n <= e; n++) t.push(this.getPointAt(n / e));
    return t
  }
  getLength() {
    const e = this.getLengths();
    return e[e.length - 1]
  }
  getLengths(e = this.arcLengthDivisions) {
    if (this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate) return this.cacheArcLengths;
    this.needsUpdate = !1;
    const t = [];
    let n, i = this.getPoint(0),
      r = 0;
    t.push(0);
    for (let a = 1; a <= e; a++) n = this.getPoint(a / e), r += n.distanceTo(i), t.push(r), i = n;
    return this.cacheArcLengths = t, t
  }
  updateArcLengths() {
    this.needsUpdate = !0, this.getLengths()
  }
  getUtoTmapping(e, t = null) {
    const n = this.getLengths();
    let i = 0;
    const r = n.length;
    let a;
    t ? a = t : a = e * n[r - 1];
    let o = 0,
      l = r - 1,
      c;
    for (; o <= l;)
      if (i = Math.floor(o + (l - o) / 2), c = n[i] - a, c < 0) o = i + 1;
      else if (c > 0) l = i - 1;
    else {
      l = i;
      break
    }
    if (i = l, n[i] === a) return i / (r - 1);
    const h = n[i],
      d = n[i + 1] - h,
      f = (a - h) / d;
    return (i + f) / (r - 1)
  }
  getTangent(e, t) {
    let i = e - 1e-4,
      r = e + 1e-4;
    i < 0 && (i = 0), r > 1 && (r = 1);
    const a = this.getPoint(i),
      o = this.getPoint(r),
      l = t || (a.isVector2 ? new re : new N);
    return l.copy(o).sub(a).normalize(), l
  }
  getTangentAt(e, t) {
    const n = this.getUtoTmapping(e);
    return this.getTangent(n, t)
  }
  computeFrenetFrames(e, t = !1) {
    const n = new N,
      i = [],
      r = [],
      a = [],
      o = new N,
      l = new We;
    for (let f = 0; f <= e; f++) {
      const p = f / e;
      i[f] = this.getTangentAt(p, new N)
    }
    r[0] = new N, a[0] = new N;
    let c = Number.MAX_VALUE;
    const h = Math.abs(i[0].x),
      u = Math.abs(i[0].y),
      d = Math.abs(i[0].z);
    h <= c && (c = h, n.set(1, 0, 0)), u <= c && (c = u, n.set(0, 1, 0)), d <= c && n.set(0, 0, 1), o.crossVectors(i[0], n).normalize(), r[0].crossVectors(i[0], o), a[0].crossVectors(i[0], r[0]);
    for (let f = 1; f <= e; f++) {
      if (r[f] = r[f - 1].clone(), a[f] = a[f - 1].clone(), o.crossVectors(i[f - 1], i[f]), o.length() > Number.EPSILON) {
        o.normalize();
        const p = Math.acos(Ke(i[f - 1].dot(i[f]), -1, 1));
        r[f].applyMatrix4(l.makeRotationAxis(o, p))
      }
      a[f].crossVectors(i[f], r[f])
    }
    if (t === !0) {
      let f = Math.acos(Ke(r[0].dot(r[e]), -1, 1));
      f /= e, i[0].dot(o.crossVectors(r[0], r[e])) > 0 && (f = -f);
      for (let p = 1; p <= e; p++) r[p].applyMatrix4(l.makeRotationAxis(i[p], f * p)), a[p].crossVectors(i[p], r[p])
    }
    return {
      tangents: i,
      normals: r,
      binormals: a
    }
  }
  clone() {
    return new this.constructor().copy(this)
  }
  copy(e) {
    return this.arcLengthDivisions = e.arcLengthDivisions, this.cacheArcLengths = null, this
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.7,
        type: "Curve",
        generator: "Curve.toJSON"
      }
    };
    return e.arcLengthDivisions = this.arcLengthDivisions, e.type = this.type, e
  }
  fromJSON(e) {
    return this.arcLengthDivisions = e.arcLengthDivisions, this.cacheArcLengths = null, this
  }
}
class Jo extends bn {
  constructor(e = 0, t = 0, n = 1, i = 1, r = 0, a = Math.PI * 2, o = !1, l = 0) {
    super(), this.isEllipseCurve = !0, this.type = "EllipseCurve", this.aX = e, this.aY = t, this.xRadius = n, this.yRadius = i, this.aStartAngle = r, this.aEndAngle = a, this.aClockwise = o, this.aRotation = l
  }
  getPoint(e, t = new re) {
    const n = t,
      i = Math.PI * 2;
    let r = this.aEndAngle - this.aStartAngle;
    const a = Math.abs(r) < Number.EPSILON;
    for (; r < 0;) r += i;
    for (; r > i;) r -= i;
    r < Number.EPSILON && (a ? r = 0 : r = i), this.aClockwise === !0 && !a && (r === i ? r = -i : r = r - i);
    const o = this.aStartAngle + e * r;
    let l = this.aX + this.xRadius * Math.cos(o),
      c = this.aY + this.yRadius * Math.sin(o);
    if (this.aRotation !== 0) {
      const h = Math.cos(this.aRotation),
        u = Math.sin(this.aRotation),
        d = l - this.aX,
        f = c - this.aY;
      l = d * h - f * u + this.aX, c = d * u + f * h + this.aY
    }
    return n.set(l, c)
  }
  copy(e) {
    return super.copy(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this
  }
  toJSON() {
    const e = super.toJSON();
    return e.aX = this.aX, e.aY = this.aY, e.xRadius = this.xRadius, e.yRadius = this.yRadius, e.aStartAngle = this.aStartAngle, e.aEndAngle = this.aEndAngle, e.aClockwise = this.aClockwise, e.aRotation = this.aRotation, e
  }
  fromJSON(e) {
    return super.fromJSON(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this
  }
}
class lf extends Jo {
  constructor(e, t, n, i, r, a) {
    super(e, t, n, n, i, r, a), this.isArcCurve = !0, this.type = "ArcCurve"
  }
}

function Zo() {
  let s = 0,
    e = 0,
    t = 0,
    n = 0;

  function i(r, a, o, l) {
    s = r, e = o, t = -3 * r + 3 * a - 2 * o - l, n = 2 * r - 2 * a + o + l
  }
  return {
    initCatmullRom: function(r, a, o, l, c) {
      i(a, o, c * (o - r), c * (l - a))
    },
    initNonuniformCatmullRom: function(r, a, o, l, c, h, u) {
      let d = (a - r) / c - (o - r) / (c + h) + (o - a) / h,
        f = (o - a) / h - (l - a) / (h + u) + (l - o) / u;
      d *= h, f *= h, i(a, o, d, f)
    },
    calc: function(r) {
      const a = r * r,
        o = a * r;
      return s + e * r + t * a + n * o
    }
  }
}
const nc = new N,
  ic = new N,
  ga = new Zo,
  _a = new Zo,
  xa = new Zo;
class cf extends bn {
  constructor(e = [], t = !1, n = "centripetal", i = .5) {
    super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = e, this.closed = t, this.curveType = n, this.tension = i
  }
  getPoint(e, t = new N) {
    const n = t,
      i = this.points,
      r = i.length,
      a = (r - (this.closed ? 0 : 1)) * e;
    let o = Math.floor(a),
      l = a - o;
    this.closed ? o += o > 0 ? 0 : (Math.floor(Math.abs(o) / r) + 1) * r : l === 0 && o === r - 1 && (o = r - 2, l = 1);
    let c, h;
    this.closed || o > 0 ? c = i[(o - 1) % r] : (ic.subVectors(i[0], i[1]).add(i[0]), c = ic);
    const u = i[o % r],
      d = i[(o + 1) % r];
    if (this.closed || o + 2 < r ? h = i[(o + 2) % r] : (nc.subVectors(i[r - 1], i[r - 2]).add(i[r - 1]), h = nc), this.curveType === "centripetal" || this.curveType === "chordal") {
      const f = this.curveType === "chordal" ? .5 : .25;
      let p = Math.pow(c.distanceToSquared(u), f),
        x = Math.pow(u.distanceToSquared(d), f),
        m = Math.pow(d.distanceToSquared(h), f);
      x < 1e-4 && (x = 1), p < 1e-4 && (p = x), m < 1e-4 && (m = x), ga.initNonuniformCatmullRom(c.x, u.x, d.x, h.x, p, x, m), _a.initNonuniformCatmullRom(c.y, u.y, d.y, h.y, p, x, m), xa.initNonuniformCatmullRom(c.z, u.z, d.z, h.z, p, x, m)
    } else this.curveType === "catmullrom" && (ga.initCatmullRom(c.x, u.x, d.x, h.x, this.tension), _a.initCatmullRom(c.y, u.y, d.y, h.y, this.tension), xa.initCatmullRom(c.z, u.z, d.z, h.z, this.tension));
    return n.set(ga.calc(l), _a.calc(l), xa.calc(l)), n
  }
  copy(e) {
    super.copy(e), this.points = [];
    for (let t = 0, n = e.points.length; t < n; t++) {
      const i = e.points[t];
      this.points.push(i.clone())
    }
    return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this
  }
  toJSON() {
    const e = super.toJSON();
    e.points = [];
    for (let t = 0, n = this.points.length; t < n; t++) {
      const i = this.points[t];
      e.points.push(i.toArray())
    }
    return e.closed = this.closed, e.curveType = this.curveType, e.tension = this.tension, e
  }
  fromJSON(e) {
    super.fromJSON(e), this.points = [];
    for (let t = 0, n = e.points.length; t < n; t++) {
      const i = e.points[t];
      this.points.push(new N().fromArray(i))
    }
    return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this
  }
}

function sc(s, e, t, n, i) {
  const r = (n - e) * .5,
    a = (i - t) * .5,
    o = s * s,
    l = s * o;
  return (2 * t - 2 * n + r + a) * l + (-3 * t + 3 * n - 2 * r - a) * o + r * s + t
}

function hf(s, e) {
  const t = 1 - s;
  return t * t * e
}

function uf(s, e) {
  return 2 * (1 - s) * s * e
}

function df(s, e) {
  return s * s * e
}

function gs(s, e, t, n) {
  return hf(s, e) + uf(s, t) + df(s, n)
}

function ff(s, e) {
  const t = 1 - s;
  return t * t * t * e
}

function pf(s, e) {
  const t = 1 - s;
  return 3 * t * t * s * e
}

function mf(s, e) {
  return 3 * (1 - s) * s * s * e
}

function gf(s, e) {
  return s * s * s * e
}

function _s(s, e, t, n, i) {
  return ff(s, e) + pf(s, t) + mf(s, n) + gf(s, i)
}
class Uh extends bn {
  constructor(e = new re, t = new re, n = new re, i = new re) {
    super(), this.isCubicBezierCurve = !0, this.type = "CubicBezierCurve", this.v0 = e, this.v1 = t, this.v2 = n, this.v3 = i
  }
  getPoint(e, t = new re) {
    const n = t,
      i = this.v0,
      r = this.v1,
      a = this.v2,
      o = this.v3;
    return n.set(_s(e, i.x, r.x, a.x, o.x), _s(e, i.y, r.y, a.y, o.y)), n
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this
  }
}
class _f extends bn {
  constructor(e = new N, t = new N, n = new N, i = new N) {
    super(), this.isCubicBezierCurve3 = !0, this.type = "CubicBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = n, this.v3 = i
  }
  getPoint(e, t = new N) {
    const n = t,
      i = this.v0,
      r = this.v1,
      a = this.v2,
      o = this.v3;
    return n.set(_s(e, i.x, r.x, a.x, o.x), _s(e, i.y, r.y, a.y, o.y), _s(e, i.z, r.z, a.z, o.z)), n
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this
  }
}
class Fh extends bn {
  constructor(e = new re, t = new re) {
    super(), this.isLineCurve = !0, this.type = "LineCurve", this.v1 = e, this.v2 = t
  }
  getPoint(e, t = new re) {
    const n = t;
    return e === 1 ? n.copy(this.v2) : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(e).add(this.v1)), n
  }
  getPointAt(e, t) {
    return this.getPoint(e, t)
  }
  getTangent(e, t = new re) {
    return t.subVectors(this.v2, this.v1).normalize()
  }
  getTangentAt(e, t) {
    return this.getTangent(e, t)
  }
  copy(e) {
    return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this
  }
  toJSON() {
    const e = super.toJSON();
    return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this
  }
}
class xf extends bn {
  constructor(e = new N, t = new N) {
    super(), this.isLineCurve3 = !0, this.type = "LineCurve3", this.v1 = e, this.v2 = t
  }
  getPoint(e, t = new N) {
    const n = t;
    return e === 1 ? n.copy(this.v2) : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(e).add(this.v1)), n
  }
  getPointAt(e, t) {
    return this.getPoint(e, t)
  }
  getTangent(e, t = new N) {
    return t.subVectors(this.v2, this.v1).normalize()
  }
  getTangentAt(e, t) {
    return this.getTangent(e, t)
  }
  copy(e) {
    return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this
  }
  toJSON() {
    const e = super.toJSON();
    return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this
  }
}
class Oh extends bn {
  constructor(e = new re, t = new re, n = new re) {
    super(), this.isQuadraticBezierCurve = !0, this.type = "QuadraticBezierCurve", this.v0 = e, this.v1 = t, this.v2 = n
  }
  getPoint(e, t = new re) {
    const n = t,
      i = this.v0,
      r = this.v1,
      a = this.v2;
    return n.set(gs(e, i.x, r.x, a.x), gs(e, i.y, r.y, a.y)), n
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this
  }
}
class vf extends bn {
  constructor(e = new N, t = new N, n = new N) {
    super(), this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = n
  }
  getPoint(e, t = new N) {
    const n = t,
      i = this.v0,
      r = this.v1,
      a = this.v2;
    return n.set(gs(e, i.x, r.x, a.x), gs(e, i.y, r.y, a.y), gs(e, i.z, r.z, a.z)), n
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this
  }
}
class Bh extends bn {
  constructor(e = []) {
    super(), this.isSplineCurve = !0, this.type = "SplineCurve", this.points = e
  }
  getPoint(e, t = new re) {
    const n = t,
      i = this.points,
      r = (i.length - 1) * e,
      a = Math.floor(r),
      o = r - a,
      l = i[a === 0 ? a : a - 1],
      c = i[a],
      h = i[a > i.length - 2 ? i.length - 1 : a + 1],
      u = i[a > i.length - 3 ? i.length - 1 : a + 2];
    return n.set(sc(o, l.x, c.x, h.x, u.x), sc(o, l.y, c.y, h.y, u.y)), n
  }
  copy(e) {
    super.copy(e), this.points = [];
    for (let t = 0, n = e.points.length; t < n; t++) {
      const i = e.points[t];
      this.points.push(i.clone())
    }
    return this
  }
  toJSON() {
    const e = super.toJSON();
    e.points = [];
    for (let t = 0, n = this.points.length; t < n; t++) {
      const i = this.points[t];
      e.points.push(i.toArray())
    }
    return e
  }
  fromJSON(e) {
    super.fromJSON(e), this.points = [];
    for (let t = 0, n = e.points.length; t < n; t++) {
      const i = e.points[t];
      this.points.push(new re().fromArray(i))
    }
    return this
  }
}
var go = Object.freeze({
  __proto__: null,
  ArcCurve: lf,
  CatmullRomCurve3: cf,
  CubicBezierCurve: Uh,
  CubicBezierCurve3: _f,
  EllipseCurve: Jo,
  LineCurve: Fh,
  LineCurve3: xf,
  QuadraticBezierCurve: Oh,
  QuadraticBezierCurve3: vf,
  SplineCurve: Bh
});
class Mf extends bn {
  constructor() {
    super(), this.type = "CurvePath", this.curves = [], this.autoClose = !1, this.cacheLengths = null
  }
  add(e) {
    this.curves.push(e)
  }
  closePath() {
    const e = this.curves[0].getPoint(0),
      t = this.curves[this.curves.length - 1].getPoint(1);
    if (!e.equals(t)) {
      const n = e.isVector2 === !0 ? "LineCurve" : "LineCurve3";
      this.curves.push(new go[n](t, e))
    }
    return this
  }
  getPoint(e, t) {
    const n = e * this.getLength(),
      i = this.getCurveLengths();
    let r = 0;
    for (; r < i.length;) {
      if (i[r] >= n) {
        const a = i[r] - n,
          o = this.curves[r],
          l = o.getLength(),
          c = l === 0 ? 0 : 1 - a / l;
        return o.getPointAt(c, t)
      }
      r++
    }
    return null
  }
  getLength() {
    const e = this.getCurveLengths();
    return e[e.length - 1]
  }
  updateArcLengths() {
    this.needsUpdate = !0, this.cacheLengths = null, this.getCurveLengths()
  }
  getCurveLengths() {
    if (this.cacheLengths && this.cacheLengths.length === this.curves.length) return this.cacheLengths;
    const e = [];
    let t = 0;
    for (let n = 0, i = this.curves.length; n < i; n++) t += this.curves[n].getLength(), e.push(t);
    return this.cacheLengths = e, e
  }
  getSpacedPoints(e = 40) {
    const t = [];
    for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
    return this.autoClose && t.push(t[0]), t
  }
  getPoints(e = 12) {
    const t = [];
    let n;
    for (let i = 0, r = this.curves; i < r.length; i++) {
      const a = r[i],
        o = a.isEllipseCurve ? e * 2 : a.isLineCurve || a.isLineCurve3 ? 1 : a.isSplineCurve ? e * a.points.length : e,
        l = a.getPoints(o);
      for (let c = 0; c < l.length; c++) {
        const h = l[c];
        n && n.equals(h) || (t.push(h), n = h)
      }
    }
    return this.autoClose && t.length > 1 && !t[t.length - 1].equals(t[0]) && t.push(t[0]), t
  }
  copy(e) {
    super.copy(e), this.curves = [];
    for (let t = 0, n = e.curves.length; t < n; t++) {
      const i = e.curves[t];
      this.curves.push(i.clone())
    }
    return this.autoClose = e.autoClose, this.cacheLengths = null, this
  }
  toJSON() {
    const e = super.toJSON();
    e.autoClose = this.autoClose, e.curves = [];
    for (let t = 0, n = this.curves.length; t < n; t++) {
      const i = this.curves[t];
      e.curves.push(i.toJSON())
    }
    return e
  }
  fromJSON(e) {
    super.fromJSON(e), this.autoClose = e.autoClose, this.curves = [];
    for (let t = 0, n = e.curves.length; t < n; t++) {
      const i = e.curves[t];
      this.curves.push(new go[i.type]().fromJSON(i))
    }
    return this.cacheLengths = null, this
  }
}
class rc extends Mf {
  constructor(e) {
    super(), this.type = "Path", this.currentPoint = new re, e && this.setFromPoints(e)
  }
  setFromPoints(e) {
    this.moveTo(e[0].x, e[0].y);
    for (let t = 1, n = e.length; t < n; t++) this.lineTo(e[t].x, e[t].y);
    return this
  }
  moveTo(e, t) {
    return this.currentPoint.set(e, t), this
  }
  lineTo(e, t) {
    const n = new Fh(this.currentPoint.clone(), new re(e, t));
    return this.curves.push(n), this.currentPoint.set(e, t), this
  }
  quadraticCurveTo(e, t, n, i) {
    const r = new Oh(this.currentPoint.clone(), new re(e, t), new re(n, i));
    return this.curves.push(r), this.currentPoint.set(n, i), this
  }
  bezierCurveTo(e, t, n, i, r, a) {
    const o = new Uh(this.currentPoint.clone(), new re(e, t), new re(n, i), new re(r, a));
    return this.curves.push(o), this.currentPoint.set(r, a), this
  }
  splineThru(e) {
    const t = [this.currentPoint.clone()].concat(e),
      n = new Bh(t);
    return this.curves.push(n), this.currentPoint.copy(e[e.length - 1]), this
  }
  arc(e, t, n, i, r, a) {
    const o = this.currentPoint.x,
      l = this.currentPoint.y;
    return this.absarc(e + o, t + l, n, i, r, a), this
  }
  absarc(e, t, n, i, r, a) {
    return this.absellipse(e, t, n, n, i, r, a), this
  }
  ellipse(e, t, n, i, r, a, o, l) {
    const c = this.currentPoint.x,
      h = this.currentPoint.y;
    return this.absellipse(e + c, t + h, n, i, r, a, o, l), this
  }
  absellipse(e, t, n, i, r, a, o, l) {
    const c = new Jo(e, t, n, i, r, a, o, l);
    if (this.curves.length > 0) {
      const u = c.getPoint(0);
      u.equals(this.currentPoint) || this.lineTo(u.x, u.y)
    }
    this.curves.push(c);
    const h = c.getPoint(1);
    return this.currentPoint.copy(h), this
  }
  copy(e) {
    return super.copy(e), this.currentPoint.copy(e.currentPoint), this
  }
  toJSON() {
    const e = super.toJSON();
    return e.currentPoint = this.currentPoint.toArray(), e
  }
  fromJSON(e) {
    return super.fromJSON(e), this.currentPoint.fromArray(e.currentPoint), this
  }
}
class Sf extends rc {
  constructor(e) {
    super(e), this.uuid = hn(), this.type = "Shape", this.holes = []
  }
  getPointsHoles(e) {
    const t = [];
    for (let n = 0, i = this.holes.length; n < i; n++) t[n] = this.holes[n].getPoints(e);
    return t
  }
  extractPoints(e) {
    return {
      shape: this.getPoints(e),
      holes: this.getPointsHoles(e)
    }
  }
  copy(e) {
    super.copy(e), this.holes = [];
    for (let t = 0, n = e.holes.length; t < n; t++) {
      const i = e.holes[t];
      this.holes.push(i.clone())
    }
    return this
  }
  toJSON() {
    const e = super.toJSON();
    e.uuid = this.uuid, e.holes = [];
    for (let t = 0, n = this.holes.length; t < n; t++) {
      const i = this.holes[t];
      e.holes.push(i.toJSON())
    }
    return e
  }
  fromJSON(e) {
    super.fromJSON(e), this.uuid = e.uuid, this.holes = [];
    for (let t = 0, n = e.holes.length; t < n; t++) {
      const i = e.holes[t];
      this.holes.push(new rc().fromJSON(i))
    }
    return this
  }
}

function yf(s, e, t = 2) {
  const n = e && e.length,
    i = n ? e[0] * t : s.length;
  let r = zh(s, 0, i, t, !0);
  const a = [];
  if (!r || r.next === r.prev) return a;
  let o, l, c;
  if (n && (r = wf(s, e, r, t)), s.length > 80 * t) {
    o = s[0], l = s[1];
    let h = o,
      u = l;
    for (let d = t; d < i; d += t) {
      const f = s[d],
        p = s[d + 1];
      f < o && (o = f), p < l && (l = p), f > h && (h = f), p > u && (u = p)
    }
    c = Math.max(h - o, u - l), c = c !== 0 ? 32767 / c : 0
  }
  return ws(r, a, t, o, l, c, 0), a
}

function zh(s, e, t, n, i) {
  let r;
  if (i === Bf(s, e, t, n) > 0)
    for (let a = e; a < t; a += n) r = ac(a / n | 0, s[a], s[a + 1], r);
  else
    for (let a = t - n; a >= e; a -= n) r = ac(a / n | 0, s[a], s[a + 1], r);
  return r && Wi(r, r.next) && (Cs(r), r = r.next), r
}

function di(s, e) {
  if (!s) return s;
  e || (e = s);
  let t = s,
    n;
  do
    if (n = !1, !t.steiner && (Wi(t, t.next) || xt(t.prev, t, t.next) === 0)) {
      if (Cs(t), t = e = t.prev, t === t.next) break;
      n = !0
    } else t = t.next; while (n || t !== e);
  return e
}

function ws(s, e, t, n, i, r, a) {
  if (!s) return;
  !a && r && If(s, n, i, r);
  let o = s;
  for (; s.prev !== s.next;) {
    const l = s.prev,
      c = s.next;
    if (r ? Ef(s, n, i, r) : Tf(s)) {
      e.push(l.i, s.i, c.i), Cs(s), s = c.next, o = c.next;
      continue
    }
    if (s = c, s === o) {
      a ? a === 1 ? (s = bf(di(s), e), ws(s, e, t, n, i, r, 2)) : a === 2 && Af(s, e, t, n, i, r) : ws(di(s), e, t, n, i, r, 1);
      break
    }
  }
}

function Tf(s) {
  const e = s.prev,
    t = s,
    n = s.next;
  if (xt(e, t, n) >= 0) return !1;
  const i = e.x,
    r = t.x,
    a = n.x,
    o = e.y,
    l = t.y,
    c = n.y,
    h = Math.min(i, r, a),
    u = Math.min(o, l, c),
    d = Math.max(i, r, a),
    f = Math.max(o, l, c);
  let p = n.next;
  for (; p !== e;) {
    if (p.x >= h && p.x <= d && p.y >= u && p.y <= f && hs(i, o, r, l, a, c, p.x, p.y) && xt(p.prev, p, p.next) >= 0) return !1;
    p = p.next
  }
  return !0
}

function Ef(s, e, t, n) {
  const i = s.prev,
    r = s,
    a = s.next;
  if (xt(i, r, a) >= 0) return !1;
  const o = i.x,
    l = r.x,
    c = a.x,
    h = i.y,
    u = r.y,
    d = a.y,
    f = Math.min(o, l, c),
    p = Math.min(h, u, d),
    x = Math.max(o, l, c),
    m = Math.max(h, u, d),
    g = _o(f, p, e, t, n),
    M = _o(x, m, e, t, n);
  let E = s.prevZ,
    v = s.nextZ;
  for (; E && E.z >= g && v && v.z <= M;) {
    if (E.x >= f && E.x <= x && E.y >= p && E.y <= m && E !== i && E !== a && hs(o, h, l, u, c, d, E.x, E.y) && xt(E.prev, E, E.next) >= 0 || (E = E.prevZ, v.x >= f && v.x <= x && v.y >= p && v.y <= m && v !== i && v !== a && hs(o, h, l, u, c, d, v.x, v.y) && xt(v.prev, v, v.next) >= 0)) return !1;
    v = v.nextZ
  }
  for (; E && E.z >= g;) {
    if (E.x >= f && E.x <= x && E.y >= p && E.y <= m && E !== i && E !== a && hs(o, h, l, u, c, d, E.x, E.y) && xt(E.prev, E, E.next) >= 0) return !1;
    E = E.prevZ
  }
  for (; v && v.z <= M;) {
    if (v.x >= f && v.x <= x && v.y >= p && v.y <= m && v !== i && v !== a && hs(o, h, l, u, c, d, v.x, v.y) && xt(v.prev, v, v.next) >= 0) return !1;
    v = v.nextZ
  }
  return !0
}

function bf(s, e) {
  let t = s;
  do {
    const n = t.prev,
      i = t.next.next;
    !Wi(n, i) && Hh(n, t, t.next, i) && Rs(n, i) && Rs(i, n) && (e.push(n.i, t.i, i.i), Cs(t), Cs(t.next), t = s = i), t = t.next
  } while (t !== s);
  return di(t)
}

function Af(s, e, t, n, i, r) {
  let a = s;
  do {
    let o = a.next.next;
    for (; o !== a.prev;) {
      if (a.i !== o.i && Uf(a, o)) {
        let l = Gh(a, o);
        a = di(a, a.next), l = di(l, l.next), ws(a, e, t, n, i, r, 0), ws(l, e, t, n, i, r, 0);
        return
      }
      o = o.next
    }
    a = a.next
  } while (a !== s)
}

function wf(s, e, t, n) {
  const i = [];
  for (let r = 0, a = e.length; r < a; r++) {
    const o = e[r] * n,
      l = r < a - 1 ? e[r + 1] * n : s.length,
      c = zh(s, o, l, n, !1);
    c === c.next && (c.steiner = !0), i.push(Df(c))
  }
  i.sort(Rf);
  for (let r = 0; r < i.length; r++) t = Cf(i[r], t);
  return t
}

function Rf(s, e) {
  let t = s.x - e.x;
  if (t === 0 && (t = s.y - e.y, t === 0)) {
    const n = (s.next.y - s.y) / (s.next.x - s.x),
      i = (e.next.y - e.y) / (e.next.x - e.x);
    t = n - i
  }
  return t
}

function Cf(s, e) {
  const t = Lf(s, e);
  if (!t) return e;
  const n = Gh(t, s);
  return di(n, n.next), di(t, t.next)
}

function Lf(s, e) {
  let t = e;
  const n = s.x,
    i = s.y;
  let r = -1 / 0,
    a;
  if (Wi(s, t)) return t;
  do {
    if (Wi(s, t.next)) return t.next;
    if (i <= t.y && i >= t.next.y && t.next.y !== t.y) {
      const u = t.x + (i - t.y) * (t.next.x - t.x) / (t.next.y - t.y);
      if (u <= n && u > r && (r = u, a = t.x < t.next.x ? t : t.next, u === n)) return a
    }
    t = t.next
  } while (t !== e);
  if (!a) return null;
  const o = a,
    l = a.x,
    c = a.y;
  let h = 1 / 0;
  t = a;
  do {
    if (n >= t.x && t.x >= l && n !== t.x && kh(i < c ? n : r, i, l, c, i < c ? r : n, i, t.x, t.y)) {
      const u = Math.abs(i - t.y) / (n - t.x);
      Rs(t, s) && (u < h || u === h && (t.x > a.x || t.x === a.x && Pf(a, t))) && (a = t, h = u)
    }
    t = t.next
  } while (t !== o);
  return a
}

function Pf(s, e) {
  return xt(s.prev, s, e.prev) < 0 && xt(e.next, s, s.next) < 0
}

function If(s, e, t, n) {
  let i = s;
  do i.z === 0 && (i.z = _o(i.x, i.y, e, t, n)), i.prevZ = i.prev, i.nextZ = i.next, i = i.next; while (i !== s);
  i.prevZ.nextZ = null, i.prevZ = null, Nf(i)
}

function Nf(s) {
  let e, t = 1;
  do {
    let n = s,
      i;
    s = null;
    let r = null;
    for (e = 0; n;) {
      e++;
      let a = n,
        o = 0;
      for (let c = 0; c < t && (o++, a = a.nextZ, !!a); c++);
      let l = t;
      for (; o > 0 || l > 0 && a;) o !== 0 && (l === 0 || !a || n.z <= a.z) ? (i = n, n = n.nextZ, o--) : (i = a, a = a.nextZ, l--), r ? r.nextZ = i : s = i, i.prevZ = r, r = i;
      n = a
    }
    r.nextZ = null, t *= 2
  } while (e > 1);
  return s
}

function _o(s, e, t, n, i) {
  return s = (s - t) * i | 0, e = (e - n) * i | 0, s = (s | s << 8) & 16711935, s = (s | s << 4) & 252645135, s = (s | s << 2) & 858993459, s = (s | s << 1) & 1431655765, e = (e | e << 8) & 16711935, e = (e | e << 4) & 252645135, e = (e | e << 2) & 858993459, e = (e | e << 1) & 1431655765, s | e << 1
}

function Df(s) {
  let e = s,
    t = s;
  do(e.x < t.x || e.x === t.x && e.y < t.y) && (t = e), e = e.next; while (e !== s);
  return t
}

function kh(s, e, t, n, i, r, a, o) {
  return (i - a) * (e - o) >= (s - a) * (r - o) && (s - a) * (n - o) >= (t - a) * (e - o) && (t - a) * (r - o) >= (i - a) * (n - o)
}

function hs(s, e, t, n, i, r, a, o) {
  return !(s === a && e === o) && kh(s, e, t, n, i, r, a, o)
}

function Uf(s, e) {
  return s.next.i !== e.i && s.prev.i !== e.i && !Ff(s, e) && (Rs(s, e) && Rs(e, s) && Of(s, e) && (xt(s.prev, s, e.prev) || xt(s, e.prev, e)) || Wi(s, e) && xt(s.prev, s, s.next) > 0 && xt(e.prev, e, e.next) > 0)
}

function xt(s, e, t) {
  return (e.y - s.y) * (t.x - e.x) - (e.x - s.x) * (t.y - e.y)
}

function Wi(s, e) {
  return s.x === e.x && s.y === e.y
}

function Hh(s, e, t, n) {
  const i = cr(xt(s, e, t)),
    r = cr(xt(s, e, n)),
    a = cr(xt(t, n, s)),
    o = cr(xt(t, n, e));
  return !!(i !== r && a !== o || i === 0 && lr(s, t, e) || r === 0 && lr(s, n, e) || a === 0 && lr(t, s, n) || o === 0 && lr(t, e, n))
}

function lr(s, e, t) {
  return e.x <= Math.max(s.x, t.x) && e.x >= Math.min(s.x, t.x) && e.y <= Math.max(s.y, t.y) && e.y >= Math.min(s.y, t.y)
}

function cr(s) {
  return s > 0 ? 1 : s < 0 ? -1 : 0
}

function Ff(s, e) {
  let t = s;
  do {
    if (t.i !== s.i && t.next.i !== s.i && t.i !== e.i && t.next.i !== e.i && Hh(t, t.next, s, e)) return !0;
    t = t.next
  } while (t !== s);
  return !1
}

function Rs(s, e) {
  return xt(s.prev, s, s.next) < 0 ? xt(s, e, s.next) >= 0 && xt(s, s.prev, e) >= 0 : xt(s, e, s.prev) < 0 || xt(s, s.next, e) < 0
}

function Of(s, e) {
  let t = s,
    n = !1;
  const i = (s.x + e.x) / 2,
    r = (s.y + e.y) / 2;
  do t.y > r != t.next.y > r && t.next.y !== t.y && i < (t.next.x - t.x) * (r - t.y) / (t.next.y - t.y) + t.x && (n = !n), t = t.next; while (t !== s);
  return n
}

function Gh(s, e) {
  const t = xo(s.i, s.x, s.y),
    n = xo(e.i, e.x, e.y),
    i = s.next,
    r = e.prev;
  return s.next = e, e.prev = s, t.next = i, i.prev = t, n.next = t, t.prev = n, r.next = n, n.prev = r, n
}

function ac(s, e, t, n) {
  const i = xo(s, e, t);
  return n ? (i.next = n.next, i.prev = n, n.next.prev = i, n.next = i) : (i.prev = i, i.next = i), i
}

function Cs(s) {
  s.next.prev = s.prev, s.prev.next = s.next, s.prevZ && (s.prevZ.nextZ = s.nextZ), s.nextZ && (s.nextZ.prevZ = s.prevZ)
}

function xo(s, e, t) {
  return {
    i: s,
    x: e,
    y: t,
    prev: null,
    next: null,
    z: 0,
    prevZ: null,
    nextZ: null,
    steiner: !1
  }
}

function Bf(s, e, t, n) {
  let i = 0;
  for (let r = e, a = t - n; r < t; r += n) i += (s[a] - s[r]) * (s[r + 1] + s[a + 1]), a = r;
  return i
}
class zf {
  static triangulate(e, t, n = 2) {
    return yf(e, t, n)
  }
}
class Di {
  static area(e) {
    const t = e.length;
    let n = 0;
    for (let i = t - 1, r = 0; r < t; i = r++) n += e[i].x * e[r].y - e[r].x * e[i].y;
    return n * .5
  }
  static isClockWise(e) {
    return Di.area(e) < 0
  }
  static triangulateShape(e, t) {
    const n = [],
      i = [],
      r = [];
    oc(e), lc(n, e);
    let a = e.length;
    t.forEach(oc);
    for (let l = 0; l < t.length; l++) i.push(a), a += t[l].length, lc(n, t[l]);
    const o = zf.triangulate(n, i);
    for (let l = 0; l < o.length; l += 3) r.push(o.slice(l, l + 3));
    return r
  }
}

function oc(s) {
  const e = s.length;
  e > 2 && s[e - 1].equals(s[0]) && s.pop()
}

function lc(s, e) {
  for (let t = 0; t < e.length; t++) s.push(e[t].x), s.push(e[t].y)
}
class Vh extends wt {
  constructor(e = new Sf([new re(.5, .5), new re(-.5, .5), new re(-.5, -.5), new re(.5, -.5)]), t = {}) {
    super(), this.type = "ExtrudeGeometry", this.parameters = {
      shapes: e,
      options: t
    }, e = Array.isArray(e) ? e : [e];
    const n = this,
      i = [],
      r = [];
    for (let o = 0, l = e.length; o < l; o++) {
      const c = e[o];
      a(c)
    }
    this.setAttribute("position", new ut(i, 3)), this.setAttribute("uv", new ut(r, 2)), this.computeVertexNormals();

    function a(o) {
      const l = [],
        c = t.curveSegments !== void 0 ? t.curveSegments : 12,
        h = t.steps !== void 0 ? t.steps : 1,
        u = t.depth !== void 0 ? t.depth : 1;
      let d = t.bevelEnabled !== void 0 ? t.bevelEnabled : !0,
        f = t.bevelThickness !== void 0 ? t.bevelThickness : .2,
        p = t.bevelSize !== void 0 ? t.bevelSize : f - .1,
        x = t.bevelOffset !== void 0 ? t.bevelOffset : 0,
        m = t.bevelSegments !== void 0 ? t.bevelSegments : 3;
      const g = t.extrudePath,
        M = t.UVGenerator !== void 0 ? t.UVGenerator : kf;
      let E, v = !1,
        A, b, _, T;
      if (g) {
        E = g.getSpacedPoints(h), v = !0, d = !1;
        const j = g.isCatmullRomCurve3 ? g.closed : !1;
        A = g.computeFrenetFrames(h, j), b = new N, _ = new N, T = new N
      }
      d || (m = 0, f = 0, p = 0, x = 0);
      const I = o.extractPoints(c);
      let R = I.shape;
      const D = I.holes;
      if (!Di.isClockWise(R)) {
        R = R.reverse();
        for (let j = 0, ce = D.length; j < ce; j++) {
          const ae = D[j];
          Di.isClockWise(ae) && (D[j] = ae.reverse())
        }
      }

      function V(j) {
        const ae = 10000000000000001e-36;
        let ye = j[0];
        for (let ge = 1; ge <= j.length; ge++) {
          const Ve = ge % j.length,
            Le = j[Ve],
            et = Le.x - ye.x,
            tt = Le.y - ye.y,
            rt = et * et + tt * tt,
            U = Math.max(Math.abs(Le.x), Math.abs(Le.y), Math.abs(ye.x), Math.abs(ye.y)),
            yt = ae * U * U;
          if (rt <= yt) {
            j.splice(Ve, 1), ge--;
            continue
          }
          ye = Le
        }
      }
      V(R), D.forEach(V);
      const L = D.length,
        k = R;
      for (let j = 0; j < L; j++) {
        const ce = D[j];
        R = R.concat(ce)
      }

      function X(j, ce, ae) {
        return ce || ze("ExtrudeGeometry: vec does not exist"), j.clone().addScaledVector(ce, ae)
      }
      const H = R.length;

      function te(j, ce, ae) {
        let ye, ge, Ve;
        const Le = j.x - ce.x,
          et = j.y - ce.y,
          tt = ae.x - j.x,
          rt = ae.y - j.y,
          U = Le * Le + et * et,
          yt = Le * rt - et * tt;
        if (Math.abs(yt) > Number.EPSILON) {
          const $e = Math.sqrt(U),
            dt = Math.sqrt(tt * tt + rt * rt),
            fe = ce.x - et / $e,
            St = ce.y + Le / $e,
            Ue = ae.x - rt / dt,
            ke = ae.y + tt / dt,
            w = ((Ue - fe) * rt - (ke - St) * tt) / (Le * rt - et * tt);
          ye = fe + Le * w - j.x, ge = St + et * w - j.y;
          const S = ye * ye + ge * ge;
          if (S <= 2) return new re(ye, ge);
          Ve = Math.sqrt(S / 2)
        } else {
          let $e = !1;
          Le > Number.EPSILON ? tt > Number.EPSILON && ($e = !0) : Le < -Number.EPSILON ? tt < -Number.EPSILON && ($e = !0) : Math.sign(et) === Math.sign(rt) && ($e = !0), $e ? (ye = -et, ge = Le, Ve = Math.sqrt(U)) : (ye = Le, ge = et, Ve = Math.sqrt(U / 2))
        }
        return new re(ye / Ve, ge / Ve)
      }
      const W = [];
      for (let j = 0, ce = k.length, ae = ce - 1, ye = j + 1; j < ce; j++, ae++, ye++) ae === ce && (ae = 0), ye === ce && (ye = 0), W[j] = te(k[j], k[ae], k[ye]);
      const Q = [];
      let ee, Te = W.concat();
      for (let j = 0, ce = L; j < ce; j++) {
        const ae = D[j];
        ee = [];
        for (let ye = 0, ge = ae.length, Ve = ge - 1, Le = ye + 1; ye < ge; ye++, Ve++, Le++) Ve === ge && (Ve = 0), Le === ge && (Le = 0), ee[ye] = te(ae[ye], ae[Ve], ae[Le]);
        Q.push(ee), Te = Te.concat(ee)
      }
      let Oe;
      if (m === 0) Oe = Di.triangulateShape(k, D);
      else {
        const j = [],
          ce = [];
        for (let ae = 0; ae < m; ae++) {
          const ye = ae / m,
            ge = f * Math.cos(ye * Math.PI / 2),
            Ve = p * Math.sin(ye * Math.PI / 2) + x;
          for (let Le = 0, et = k.length; Le < et; Le++) {
            const tt = X(k[Le], W[Le], Ve);
            De(tt.x, tt.y, -ge), ye === 0 && j.push(tt)
          }
          for (let Le = 0, et = L; Le < et; Le++) {
            const tt = D[Le];
            ee = Q[Le];
            const rt = [];
            for (let U = 0, yt = tt.length; U < yt; U++) {
              const $e = X(tt[U], ee[U], Ve);
              De($e.x, $e.y, -ge), ye === 0 && rt.push($e)
            }
            ye === 0 && ce.push(rt)
          }
        }
        Oe = Di.triangulateShape(j, ce)
      }
      const Y = Oe.length,
        _e = p + x;
      for (let j = 0; j < H; j++) {
        const ce = d ? X(R[j], Te[j], _e) : R[j];
        v ? (_.copy(A.normals[0]).multiplyScalar(ce.x), b.copy(A.binormals[0]).multiplyScalar(ce.y), T.copy(E[0]).add(_).add(b), De(T.x, T.y, T.z)) : De(ce.x, ce.y, 0)
      }
      for (let j = 1; j <= h; j++)
        for (let ce = 0; ce < H; ce++) {
          const ae = d ? X(R[ce], Te[ce], _e) : R[ce];
          v ? (_.copy(A.normals[j]).multiplyScalar(ae.x), b.copy(A.binormals[j]).multiplyScalar(ae.y), T.copy(E[j]).add(_).add(b), De(T.x, T.y, T.z)) : De(ae.x, ae.y, u / h * j)
        }
      for (let j = m - 1; j >= 0; j--) {
        const ce = j / m,
          ae = f * Math.cos(ce * Math.PI / 2),
          ye = p * Math.sin(ce * Math.PI / 2) + x;
        for (let ge = 0, Ve = k.length; ge < Ve; ge++) {
          const Le = X(k[ge], W[ge], ye);
          De(Le.x, Le.y, u + ae)
        }
        for (let ge = 0, Ve = D.length; ge < Ve; ge++) {
          const Le = D[ge];
          ee = Q[ge];
          for (let et = 0, tt = Le.length; et < tt; et++) {
            const rt = X(Le[et], ee[et], ye);
            v ? De(rt.x, rt.y + E[h - 1].y, E[h - 1].x + ae) : De(rt.x, rt.y, u + ae)
          }
        }
      }
      Ee(), Ne();

      function Ee() {
        const j = i.length / 3;
        if (d) {
          let ce = 0,
            ae = H * ce;
          for (let ye = 0; ye < Y; ye++) {
            const ge = Oe[ye];
            mt(ge[2] + ae, ge[1] + ae, ge[0] + ae)
          }
          ce = h + m * 2, ae = H * ce;
          for (let ye = 0; ye < Y; ye++) {
            const ge = Oe[ye];
            mt(ge[0] + ae, ge[1] + ae, ge[2] + ae)
          }
        } else {
          for (let ce = 0; ce < Y; ce++) {
            const ae = Oe[ce];
            mt(ae[2], ae[1], ae[0])
          }
          for (let ce = 0; ce < Y; ce++) {
            const ae = Oe[ce];
            mt(ae[0] + H * h, ae[1] + H * h, ae[2] + H * h)
          }
        }
        n.addGroup(j, i.length / 3 - j, 0)
      }

      function Ne() {
        const j = i.length / 3;
        let ce = 0;
        xe(k, ce), ce += k.length;
        for (let ae = 0, ye = D.length; ae < ye; ae++) {
          const ge = D[ae];
          xe(ge, ce), ce += ge.length
        }
        n.addGroup(j, i.length / 3 - j, 1)
      }

      function xe(j, ce) {
        let ae = j.length;
        for (; --ae >= 0;) {
          const ye = ae;
          let ge = ae - 1;
          ge < 0 && (ge = j.length - 1);
          for (let Ve = 0, Le = h + m * 2; Ve < Le; Ve++) {
            const et = H * Ve,
              tt = H * (Ve + 1),
              rt = ce + ye + et,
              U = ce + ge + et,
              yt = ce + ge + tt,
              $e = ce + ye + tt;
            Be(rt, U, yt, $e)
          }
        }
      }

      function De(j, ce, ae) {
        l.push(j), l.push(ce), l.push(ae)
      }

      function mt(j, ce, ae) {
        Je(j), Je(ce), Je(ae);
        const ye = i.length / 3,
          ge = M.generateTopUV(n, i, ye - 3, ye - 2, ye - 1);
        je(ge[0]), je(ge[1]), je(ge[2])
      }

      function Be(j, ce, ae, ye) {
        Je(j), Je(ce), Je(ye), Je(ce), Je(ae), Je(ye);
        const ge = i.length / 3,
          Ve = M.generateSideWallUV(n, i, ge - 6, ge - 3, ge - 2, ge - 1);
        je(Ve[0]), je(Ve[1]), je(Ve[3]), je(Ve[1]), je(Ve[2]), je(Ve[3])
      }

      function Je(j) {
        i.push(l[j * 3 + 0]), i.push(l[j * 3 + 1]), i.push(l[j * 3 + 2])
      }

      function je(j) {
        r.push(j.x), r.push(j.y)
      }
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
  }
  toJSON() {
    const e = super.toJSON(),
      t = this.parameters.shapes,
      n = this.parameters.options;
    return Hf(t, n, e)
  }
  static fromJSON(e, t) {
    const n = [];
    for (let r = 0, a = e.shapes.length; r < a; r++) {
      const o = t[e.shapes[r]];
      n.push(o)
    }
    const i = e.options.extrudePath;
    return i !== void 0 && (e.options.extrudePath = new go[i.type]().fromJSON(i)), new Vh(n, e.options)
  }
}
const kf = {
  generateTopUV: function(s, e, t, n, i) {
    const r = e[t * 3],
      a = e[t * 3 + 1],
      o = e[n * 3],
      l = e[n * 3 + 1],
      c = e[i * 3],
      h = e[i * 3 + 1];
    return [new re(r, a), new re(o, l), new re(c, h)]
  },
  generateSideWallUV: function(s, e, t, n, i, r) {
    const a = e[t * 3],
      o = e[t * 3 + 1],
      l = e[t * 3 + 2],
      c = e[n * 3],
      h = e[n * 3 + 1],
      u = e[n * 3 + 2],
      d = e[i * 3],
      f = e[i * 3 + 1],
      p = e[i * 3 + 2],
      x = e[r * 3],
      m = e[r * 3 + 1],
      g = e[r * 3 + 2];
    return Math.abs(o - h) < Math.abs(a - c) ? [new re(a, 1 - l), new re(c, 1 - u), new re(d, 1 - p), new re(x, 1 - g)] : [new re(o, 1 - l), new re(h, 1 - u), new re(f, 1 - p), new re(m, 1 - g)]
  }
};

function Hf(s, e, t) {
  if (t.shapes = [], Array.isArray(s))
    for (let n = 0, i = s.length; n < i; n++) {
      const r = s[n];
      t.shapes.push(r.uuid)
    } else t.shapes.push(s.uuid);
  return t.options = Object.assign({}, e), e.extrudePath !== void 0 && (t.options.extrudePath = e.extrudePath.toJSON()), t
}
class Wh extends Ko {
  constructor(e = 1, t = 0) {
    const n = (1 + Math.sqrt(5)) / 2,
      i = [-1, n, 0, 1, n, 0, -1, -n, 0, 1, -n, 0, 0, -1, n, 0, 1, n, 0, -1, -n, 0, 1, -n, n, 0, -1, n, 0, 1, -n, 0, -1, -n, 0, 1],
      r = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];
    super(i, r, e, t), this.type = "IcosahedronGeometry", this.parameters = {
      radius: e,
      detail: t
    }
  }
  static fromJSON(e) {
    return new Wh(e.radius, e.detail)
  }
}
class Br extends wt {
  constructor(e = 1, t = 1, n = 1, i = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: n,
      heightSegments: i
    };
    const r = e / 2,
      a = t / 2,
      o = Math.floor(n),
      l = Math.floor(i),
      c = o + 1,
      h = l + 1,
      u = e / o,
      d = t / l,
      f = [],
      p = [],
      x = [],
      m = [];
    for (let g = 0; g < h; g++) {
      const M = g * d - a;
      for (let E = 0; E < c; E++) {
        const v = E * u - r;
        p.push(v, -M, 0), x.push(0, 0, 1), m.push(E / o), m.push(1 - g / l)
      }
    }
    for (let g = 0; g < l; g++)
      for (let M = 0; M < o; M++) {
        const E = M + c * g,
          v = M + c * (g + 1),
          A = M + 1 + c * (g + 1),
          b = M + 1 + c * g;
        f.push(E, v, b), f.push(v, A, b)
      }
    this.setIndex(f), this.setAttribute("position", new ut(p, 3)), this.setAttribute("normal", new ut(x, 3)), this.setAttribute("uv", new ut(m, 2))
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
  }
  static fromJSON(e) {
    return new Br(e.width, e.height, e.widthSegments, e.heightSegments)
  }
}
class Xh extends wt {
  constructor(e = .5, t = 1, n = 32, i = 1, r = 0, a = Math.PI * 2) {
    super(), this.type = "RingGeometry", this.parameters = {
      innerRadius: e,
      outerRadius: t,
      thetaSegments: n,
      phiSegments: i,
      thetaStart: r,
      thetaLength: a
    }, n = Math.max(3, n), i = Math.max(1, i);
    const o = [],
      l = [],
      c = [],
      h = [];
    let u = e;
    const d = (t - e) / i,
      f = new N,
      p = new re;
    for (let x = 0; x <= i; x++) {
      for (let m = 0; m <= n; m++) {
        const g = r + m / n * a;
        f.x = u * Math.cos(g), f.y = u * Math.sin(g), l.push(f.x, f.y, f.z), c.push(0, 0, 1), p.x = (f.x / t + 1) / 2, p.y = (f.y / t + 1) / 2, h.push(p.x, p.y)
      }
      u += d
    }
    for (let x = 0; x < i; x++) {
      const m = x * (n + 1);
      for (let g = 0; g < n; g++) {
        const M = g + m,
          E = M,
          v = M + n + 1,
          A = M + n + 2,
          b = M + 1;
        o.push(E, v, b), o.push(v, A, b)
      }
    }
    this.setIndex(o), this.setAttribute("position", new ut(l, 3)), this.setAttribute("normal", new ut(c, 3)), this.setAttribute("uv", new ut(h, 2))
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
  }
  static fromJSON(e) {
    return new Xh(e.innerRadius, e.outerRadius, e.thetaSegments, e.phiSegments, e.thetaStart, e.thetaLength)
  }
}
class qh extends wt {
  constructor(e = 1, t = 32, n = 16, i = 0, r = Math.PI * 2, a = 0, o = Math.PI) {
    super(), this.type = "SphereGeometry", this.parameters = {
      radius: e,
      widthSegments: t,
      heightSegments: n,
      phiStart: i,
      phiLength: r,
      thetaStart: a,
      thetaLength: o
    }, t = Math.max(3, Math.floor(t)), n = Math.max(2, Math.floor(n));
    const l = Math.min(a + o, Math.PI);
    let c = 0;
    const h = [],
      u = new N,
      d = new N,
      f = [],
      p = [],
      x = [],
      m = [];
    for (let g = 0; g <= n; g++) {
      const M = [],
        E = g / n,
        v = a + E * o,
        A = e * Math.cos(v),
        b = Math.sqrt(e * e - A * A);
      let _ = 0;
      g === 0 && a === 0 ? _ = .5 / t : g === n && l === Math.PI && (_ = -.5 / t);
      for (let T = 0; T <= t; T++) {
        const I = T / t,
          R = i + I * r;
        u.x = -b * Math.cos(R), u.y = A, u.z = b * Math.sin(R), p.push(u.x, u.y, u.z), d.copy(u).normalize(), x.push(d.x, d.y, d.z), m.push(I + _, 1 - E), M.push(c++)
      }
      h.push(M)
    }
    for (let g = 0; g < n; g++)
      for (let M = 0; M < t; M++) {
        const E = h[g][M + 1],
          v = h[g][M],
          A = h[g + 1][M],
          b = h[g + 1][M + 1];
        (g !== 0 || a > 0) && f.push(E, v, b), (g !== n - 1 || l < Math.PI) && f.push(v, A, b)
      }
    this.setIndex(f), this.setAttribute("position", new ut(p, 3)), this.setAttribute("normal", new ut(x, 3)), this.setAttribute("uv", new ut(m, 2))
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
  }
  static fromJSON(e) {
    return new qh(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength)
  }
}
class Yh extends wt {
  constructor(e = 1, t = .4, n = 12, i = 48, r = Math.PI * 2, a = 0, o = Math.PI * 2) {
    super(), this.type = "TorusGeometry", this.parameters = {
      radius: e,
      tube: t,
      radialSegments: n,
      tubularSegments: i,
      arc: r,
      thetaStart: a,
      thetaLength: o
    }, n = Math.floor(n), i = Math.floor(i);
    const l = [],
      c = [],
      h = [],
      u = [],
      d = new N,
      f = new N,
      p = new N;
    for (let x = 0; x <= n; x++) {
      const m = a + x / n * o;
      for (let g = 0; g <= i; g++) {
        const M = g / i * r;
        f.x = (e + t * Math.cos(m)) * Math.cos(M), f.y = (e + t * Math.cos(m)) * Math.sin(M), f.z = t * Math.sin(m), c.push(f.x, f.y, f.z), d.x = e * Math.cos(M), d.y = e * Math.sin(M), p.subVectors(f, d).normalize(), h.push(p.x, p.y, p.z), u.push(g / i), u.push(x / n)
      }
    }
    for (let x = 1; x <= n; x++)
      for (let m = 1; m <= i; m++) {
        const g = (i + 1) * x + m - 1,
          M = (i + 1) * (x - 1) + m - 1,
          E = (i + 1) * (x - 1) + m,
          v = (i + 1) * x + m;
        l.push(g, M, v), l.push(M, E, v)
      }
    this.setIndex(l), this.setAttribute("position", new ut(c, 3)), this.setAttribute("normal", new ut(h, 3)), this.setAttribute("uv", new ut(u, 2))
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
  }
  static fromJSON(e) {
    return new Yh(e.radius, e.tube, e.radialSegments, e.tubularSegments, e.arc, e.thetaStart, e.thetaLength)
  }
}

function Xi(s) {
  const e = {};
  for (const t in s) {
    e[t] = {};
    for (const n in s[t]) {
      const i = s[t][n];
      if (cc(i)) i.isRenderTargetTexture ? (Ce("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), e[t][n] = null) : e[t][n] = i.clone();
      else if (Array.isArray(i))
        if (cc(i[0])) {
          const r = [];
          for (let a = 0, o = i.length; a < o; a++) r[a] = i[a].clone();
          e[t][n] = r
        } else e[t][n] = i.slice();
      else e[t][n] = i
    }
  }
  return e
}

function Vt(s) {
  const e = {};
  for (let t = 0; t < s.length; t++) {
    const n = Xi(s[t]);
    for (const i in n) e[i] = n[i]
  }
  return e
}

function cc(s) {
  return s && (s.isColor || s.isMatrix3 || s.isMatrix4 || s.isVector2 || s.isVector3 || s.isVector4 || s.isTexture || s.isQuaternion)
}

function Gf(s) {
  const e = [];
  for (let t = 0; t < s.length; t++) e.push(s[t].clone());
  return e
}

function Kh(s) {
  const e = s.getRenderTarget();
  return e === null ? s.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : Qe.workingColorSpace
}
const Vf = {
  clone: Xi,
  merge: Vt
};
var Wf = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
  Xf = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class fi extends Zt {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Wf, this.fragmentShader = Xf, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      multiDraw: !1
    }, this.defaultAttributeValues = {
      color: [1, 1, 1],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e)
  }
  copy(e) {
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = Xi(e.uniforms), this.uniformsGroups = Gf(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this.defaultAttributeValues = Object.assign({}, e.defaultAttributeValues), this.index0AttributeName = e.index0AttributeName, this.uniformsNeedUpdate = e.uniformsNeedUpdate, this
  }
  toJSON(e) {
    const t = super.toJSON(e);
    t.glslVersion = this.glslVersion, t.uniforms = {};
    for (const i in this.uniforms) {
      const a = this.uniforms[i].value;
      a && a.isTexture ? t.uniforms[i] = {
        type: "t",
        value: a.toJSON(e).uuid
      } : a && a.isColor ? t.uniforms[i] = {
        type: "c",
        value: a.getHex()
      } : a && a.isVector2 ? t.uniforms[i] = {
        type: "v2",
        value: a.toArray()
      } : a && a.isVector3 ? t.uniforms[i] = {
        type: "v3",
        value: a.toArray()
      } : a && a.isVector4 ? t.uniforms[i] = {
        type: "v4",
        value: a.toArray()
      } : a && a.isMatrix3 ? t.uniforms[i] = {
        type: "m3",
        value: a.toArray()
      } : a && a.isMatrix4 ? t.uniforms[i] = {
        type: "m4",
        value: a.toArray()
      } : t.uniforms[i] = {
        value: a
      }
    }
    Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
    const n = {};
    for (const i in this.extensions) this.extensions[i] === !0 && (n[i] = !0);
    return Object.keys(n).length > 0 && (t.extensions = n), t
  }
  fromJSON(e, t) {
    if (super.fromJSON(e, t), e.uniforms !== void 0)
      for (const n in e.uniforms) {
        const i = e.uniforms[n];
        switch (this.uniforms[n] = {}, i.type) {
          case "t":
            this.uniforms[n].value = t[i.value] || null;
            break;
          case "c":
            this.uniforms[n].value = new Fe().setHex(i.value);
            break;
          case "v2":
            this.uniforms[n].value = new re().fromArray(i.value);
            break;
          case "v3":
            this.uniforms[n].value = new N().fromArray(i.value);
            break;
          case "v4":
            this.uniforms[n].value = new ht().fromArray(i.value);
            break;
          case "m3":
            this.uniforms[n].value = new He().fromArray(i.value);
            break;
          case "m4":
            this.uniforms[n].value = new We().fromArray(i.value);
            break;
          default:
            this.uniforms[n].value = i.value
        }
      }
    if (e.defines !== void 0 && (this.defines = e.defines), e.vertexShader !== void 0 && (this.vertexShader = e.vertexShader), e.fragmentShader !== void 0 && (this.fragmentShader = e.fragmentShader), e.glslVersion !== void 0 && (this.glslVersion = e.glslVersion), e.extensions !== void 0)
      for (const n in e.extensions) this.extensions[n] = e.extensions[n];
    return e.lights !== void 0 && (this.lights = e.lights), e.clipping !== void 0 && (this.clipping = e.clipping), this
  }
}
class qf extends fi {
  constructor(e) {
    super(e), this.isRawShaderMaterial = !0, this.type = "RawShaderMaterial"
  }
}
class Ls extends Zt {
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.type = "MeshStandardMaterial", this.defines = {
      STANDARD: ""
    }, this.color = new Fe(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Fe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Hi, this.normalScale = new re(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Tn, this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e)
  }
  copy(e) {
    return super.copy(e), this.defines = {
      STANDARD: ""
    }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this
  }
}
class dn extends Ls {
  constructor(e) {
    super(), this.isMeshPhysicalMaterial = !0, this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.type = "MeshPhysicalMaterial", this.anisotropyRotation = 0, this.anisotropyMap = null, this.clearcoatMap = null, this.clearcoatRoughness = 0, this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new re(1, 1), this.clearcoatNormalMap = null, this.diffuseRoughnessMap = null, this.ior = 1.5, Object.defineProperty(this, "reflectivity", {
      get: function() {
        return Ke(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1)
      },
      set: function(t) {
        this.ior = (1 + .4 * t) / (1 - .4 * t)
      }
    }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessMinimum = 100, this.iridescenceThicknessMaximum = 400, this.iridescenceThicknessMap = null, this.sheenColor = new Fe(0), this.sheenColorMap = null, this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, this.attenuationColor = new Fe(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, this.specularColor = new Fe(1, 1, 1), this.specularColorMap = null, this._anisotropy = 0, this._clearcoat = 0, this._diffuseRoughness = 0, this._dispersion = 0, this._iridescence = 0, this._retroreflectivity = 0, this._sheen = 0, this._transmission = 0, this.setValues(e)
  }
  get anisotropy() {
    return this._anisotropy
  }
  set anisotropy(e) {
    this._anisotropy > 0 != e > 0 && this.version++, this._anisotropy = e
  }
  get clearcoat() {
    return this._clearcoat
  }
  set clearcoat(e) {
    this._clearcoat > 0 != e > 0 && this.version++, this._clearcoat = e
  }
  get diffuseRoughness() {
    return this._diffuseRoughness
  }
  set diffuseRoughness(e) {
    this._diffuseRoughness > 0 != e > 0 && this.version++, this._diffuseRoughness = e
  }
  get iridescence() {
    return this._iridescence
  }
  set iridescence(e) {
    this._iridescence > 0 != e > 0 && this.version++, this._iridescence = e
  }
  get dispersion() {
    return this._dispersion
  }
  set dispersion(e) {
    this._dispersion > 0 != e > 0 && this.version++, this._dispersion = e
  }
  get retroreflectivity() {
    return this._retroreflectivity
  }
  set retroreflectivity(e) {
    this._retroreflectivity > 0 != e > 0 && this.version++, this._retroreflectivity = e
  }
  get sheen() {
    return this._sheen
  }
  set sheen(e) {
    this._sheen > 0 != e > 0 && this.version++, this._sheen = e
  }
  get transmission() {
    return this._transmission
  }
  set transmission(e) {
    this._transmission > 0 != e > 0 && this.version++, this._transmission = e
  }
  get iridescenceThicknessRange() {
    return Fi('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'), [this.iridescenceThicknessMinimum, this.iridescenceThicknessMaximum]
  }
  set iridescenceThicknessRange(e) {
    Fi('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'), this.iridescenceThicknessMinimum = e[0], this.iridescenceThicknessMaximum = e[1]
  }
  copy(e) {
    return super.copy(e), this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.anisotropy = e.anisotropy, this.anisotropyRotation = e.anisotropyRotation, this.anisotropyMap = e.anisotropyMap, this.clearcoat = e.clearcoat, this.clearcoatMap = e.clearcoatMap, this.clearcoatRoughness = e.clearcoatRoughness, this.clearcoatRoughnessMap = e.clearcoatRoughnessMap, this.clearcoatNormalMap = e.clearcoatNormalMap, this.clearcoatNormalScale.copy(e.clearcoatNormalScale), this.diffuseRoughness = e.diffuseRoughness, this.diffuseRoughnessMap = e.diffuseRoughnessMap, this.dispersion = e.dispersion, this.ior = e.ior, this.iridescence = e.iridescence, this.iridescenceMap = e.iridescenceMap, this.iridescenceIOR = e.iridescenceIOR, this.iridescenceThicknessMinimum = e.iridescenceThicknessMinimum, this.iridescenceThicknessMaximum = e.iridescenceThicknessMaximum, this.iridescenceThicknessMap = e.iridescenceThicknessMap, this.retroreflectivity = e.retroreflectivity, this.sheen = e.sheen, this.sheenColor.copy(e.sheenColor), this.sheenColorMap = e.sheenColorMap, this.sheenRoughness = e.sheenRoughness, this.sheenRoughnessMap = e.sheenRoughnessMap, this.transmission = e.transmission, this.transmissionMap = e.transmissionMap, this.thickness = e.thickness, this.thicknessMap = e.thicknessMap, this.attenuationDistance = e.attenuationDistance, this.attenuationColor.copy(e.attenuationColor), this.specularIntensity = e.specularIntensity, this.specularIntensityMap = e.specularIntensityMap, this.specularColor.copy(e.specularColor), this.specularColorMap = e.specularColorMap, this
  }
}
class Dv extends Zt {
  constructor(e) {
    super(), this.isMeshPhongMaterial = !0, this.type = "MeshPhongMaterial", this.color = new Fe(16777215), this.specular = new Fe(1118481), this.shininess = 30, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Fe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Hi, this.normalScale = new re(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Tn, this.combine = Ur, this.reflectivity = 1, this.envMapIntensity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e)
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.specular.copy(e.specular), this.shininess = e.shininess, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.envMapIntensity = e.envMapIntensity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this
  }
}
class Uv extends Zt {
  constructor(e) {
    super(), this.isMeshNormalMaterial = !0, this.type = "MeshNormalMaterial", this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Hi, this.normalScale = new re(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.flatShading = !1, this.setValues(e)
  }
  copy(e) {
    return super.copy(e), this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.flatShading = e.flatShading, this
  }
}
class Yf extends Zt {
  constructor(e) {
    super(), this.isMeshLambertMaterial = !0, this.type = "MeshLambertMaterial", this.color = new Fe(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Fe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Hi, this.normalScale = new re(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Tn, this.combine = Ur, this.reflectivity = 1, this.envMapIntensity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e)
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.envMapIntensity = e.envMapIntensity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this
  }
}
class Kf extends Zt {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = td, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e)
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this
  }
}
class Jf extends Zt {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e)
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this
  }
}

function qn(s, e) {
  return !s || s.constructor === e ? s : typeof e.BYTES_PER_ELEMENT == "number" ? new e(s) : Array.prototype.slice.call(s)
}

function us(s) {
  return s !== void 0 && s.inTangents !== void 0 && s.outTangents !== void 0
}

function Zf(s) {
  function e(i, r) {
    return s[i] - s[r]
  }
  const t = s.length,
    n = new Array(t);
  for (let i = 0; i !== t; ++i) n[i] = i;
  return n.sort(e), n
}

function hc(s, e, t) {
  const n = s.length,
    i = new s.constructor(n);
  for (let r = 0, a = 0; a !== n; ++r) {
    const o = t[r] * e;
    for (let l = 0; l !== e; ++l) i[a++] = s[o + l]
  }
  return i
}

function $f(s, e, t, n) {
  let i = 1,
    r = s[0];
  for (; r !== void 0 && r[n] === void 0;) r = s[i++];
  if (r === void 0) return;
  let a = r[n];
  if (a !== void 0)
    if (Array.isArray(a))
      do a = r[n], a !== void 0 && (e.push(r.time), t.push(...a)), r = s[i++]; while (r !== void 0);
    else if (a.toArray !== void 0)
    do a = r[n], a !== void 0 && (e.push(r.time), a.toArray(t, t.length)), r = s[i++]; while (r !== void 0);
  else
    do a = r[n], a !== void 0 && (e.push(r.time), t.push(a)), r = s[i++]; while (r !== void 0)
}
class Yi {
  constructor(e, t, n, i) {
    this.parameterPositions = e, this._cachedIndex = 0, this.resultBuffer = i !== void 0 ? i : new t.constructor(n), this.sampleValues = t, this.valueSize = n, this.settings = null, this.DefaultSettings_ = {}
  }
  evaluate(e) {
    const t = this.parameterPositions;
    let n = this._cachedIndex,
      i = t[n],
      r = t[n - 1];
    e: {
      t: {
        let a;n: {
          i: if (!(e < i)) {
            for (let o = n + 2;;) {
              if (i === void 0) {
                if (e < r) break i;
                return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1)
              }
              if (n === o) break;
              if (r = i, i = t[++n], e < i) break t
            }
            a = t.length;
            break n
          }if (!(e >= r)) {
            const o = t[1];
            e < o && (n = 2, r = o);
            for (let l = n - 2;;) {
              if (r === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
              if (n === l) break;
              if (i = r, r = t[--n - 1], e >= r) break t
            }
            a = n, n = 0;
            break n
          }
          break e
        }
        for (; n < a;) {
          const o = n + a >>> 1;
          e < t[o] ? a = o : n = o + 1
        }
        if (i = t[n], r = t[n - 1], r === void 0) return this._cachedIndex = 0,
        this.copySampleValue_(0);
        if (i === void 0) return n = t.length,
        this._cachedIndex = n,
        this.copySampleValue_(n - 1)
      }
      this._cachedIndex = n,
      this.intervalChanged_(n, r, i)
    }
    return this.interpolate_(n, r, e, i)
  }
  getSettings_() {
    return this.settings || this.DefaultSettings_
  }
  copySampleValue_(e) {
    const t = this.resultBuffer,
      n = this.sampleValues,
      i = this.valueSize,
      r = e * i;
    for (let a = 0; a !== i; ++a) t[a] = n[r + a];
    return t
  }
  interpolate_() {
    throw new Error("THREE.Interpolant: Call to abstract method.")
  }
  intervalChanged_() {}
}
class Qf extends Yi {
  constructor(e, t, n, i) {
    super(e, t, n, i), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
      endingStart: Pi,
      endingEnd: Pi
    }
  }
  intervalChanged_(e, t, n) {
    const i = this.parameterPositions;
    let r = e - 2,
      a = e + 1,
      o = i[r],
      l = i[a];
    if (o === void 0) switch (this.getSettings_().endingStart) {
      case Ii:
        r = e, o = 2 * t - n;
        break;
      case br:
        r = i.length - 2, o = t + i[r] - i[r + 1];
        break;
      default:
        r = e, o = n
    }
    if (l === void 0) switch (this.getSettings_().endingEnd) {
      case Ii:
        a = e, l = 2 * n - t;
        break;
      case br:
        a = 1, l = n + i[1] - i[0];
        break;
      default:
        a = e - 1, l = t
    }
    const c = (n - t) * .5,
      h = this.valueSize;
    this._weightPrev = c / (t - o), this._weightNext = c / (l - n), this._offsetPrev = r * h, this._offsetNext = a * h
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer,
      a = this.sampleValues,
      o = this.valueSize,
      l = e * o,
      c = l - o,
      h = this._offsetPrev,
      u = this._offsetNext,
      d = this._weightPrev,
      f = this._weightNext,
      p = (n - t) / (i - t),
      x = p * p,
      m = x * p,
      g = -d * m + 2 * d * x - d * p,
      M = (1 + d) * m + (-1.5 - 2 * d) * x + (-.5 + d) * p + 1,
      E = (-1 - f) * m + (1.5 + f) * x + .5 * p,
      v = f * m - f * x;
    for (let A = 0; A !== o; ++A) r[A] = g * a[h + A] + M * a[c + A] + E * a[l + A] + v * a[u + A];
    return r
  }
}
class Jh extends Yi {
  constructor(e, t, n, i) {
    super(e, t, n, i)
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer,
      a = this.sampleValues,
      o = this.valueSize,
      l = e * o,
      c = l - o,
      h = (n - t) / (i - t),
      u = 1 - h;
    for (let d = 0; d !== o; ++d) r[d] = a[c + d] * u + a[l + d] * h;
    return r
  }
}
class jf extends Yi {
  constructor(e, t, n, i) {
    super(e, t, n, i)
  }
  interpolate_(e) {
    return this.copySampleValue_(e - 1)
  }
}
class ep extends Yi {
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer,
      a = this.sampleValues,
      o = this.valueSize,
      l = e * o,
      c = l - o,
      h = this.inTangents,
      u = this.outTangents;
    if (!h || !u) {
      const p = (n - t) / (i - t),
        x = 1 - p;
      for (let m = 0; m !== o; ++m) r[m] = a[c + m] * x + a[l + m] * p;
      return r
    }
    const d = o * 2,
      f = e - 1;
    for (let p = 0; p !== o; ++p) {
      const x = a[c + p],
        m = a[l + p],
        g = f * d + p * 2,
        M = u[g],
        E = u[g + 1],
        v = e * d + p * 2,
        A = h[v],
        b = h[v + 1],
        _ = np(n, t, M, A, i);
      r[p] = Zh(_, x, E, b, m)
    }
    return r
  }
}

function Zh(s, e, t, n, i) {
  const r = 1 - s;
  return r * r * r * e + 3 * r * r * s * t + 3 * r * s * s * n + s * s * s * i
}

function tp(s, e, t, n, i) {
  const r = 1 - s;
  return 3 * r * r * (t - e) + 6 * r * s * (n - t) + 3 * s * s * (i - n)
}

function np(s, e, t, n, i) {
  let r = (s - e) / (i - e);
  for (let a = 0; a < 8; a++) {
    const o = Zh(r, e, t, n, i) - s;
    if (Math.abs(o) < 1e-10) break;
    const l = tp(r, e, t, n, i);
    if (Math.abs(l) < 1e-10) break;
    r = Math.max(0, Math.min(1, r - o / l))
  }
  return r
}
class fn {
  constructor(e, t, n, i) {
    if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
    if (t === void 0 || t.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
    this.name = e, this.times = qn(t, this.TimeBufferType), this.values = qn(n, this.ValueBufferType), this.setInterpolation(i || this.DefaultInterpolation)
  }
  static toJSON(e) {
    const t = e.constructor;
    let n;
    if (t.toJSON !== this.toJSON) n = t.toJSON(e);
    else {
      n = {
        name: e.name,
        times: qn(e.times, Array),
        values: qn(e.values, Array)
      };
      const i = e.getInterpolation();
      i !== e.DefaultInterpolation && (n.interpolation = i), us(e.settings) && (n.settings = {
        inTangents: qn(e.settings.inTangents, Array),
        outTangents: qn(e.settings.outTangents, Array)
      })
    }
    return n.type = e.ValueTypeName, n
  }
  InterpolantFactoryMethodDiscrete(e) {
    return new jf(this.times, this.values, this.getValueSize(), e)
  }
  InterpolantFactoryMethodLinear(e) {
    return new Jh(this.times, this.values, this.getValueSize(), e)
  }
  InterpolantFactoryMethodSmooth(e) {
    return new Qf(this.times, this.values, this.getValueSize(), e)
  }
  InterpolantFactoryMethodBezier(e) {
    const t = new ep(this.times, this.values, this.getValueSize(), e);
    return this.settings && (t.inTangents = this.settings.inTangents, t.outTangents = this.settings.outTangents), t
  }
  setInterpolation(e) {
    let t;
    switch (e) {
      case ys:
        t = this.InterpolantFactoryMethodDiscrete;
        break;
      case Ts:
        t = this.InterpolantFactoryMethodLinear;
        break;
      case Xr:
        t = this.InterpolantFactoryMethodSmooth;
        break;
      case Tl:
        t = this.InterpolantFactoryMethodBezier;
        break
    }
    if (t === void 0) {
      const n = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
      if (this.createInterpolant === void 0)
        if (e !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
        else throw new Error(n);
      return Ce("KeyframeTrack:", n), this
    }
    return this.createInterpolant = t, this
  }
  getInterpolation() {
    switch (this.createInterpolant) {
      case this.InterpolantFactoryMethodDiscrete:
        return ys;
      case this.InterpolantFactoryMethodLinear:
        return Ts;
      case this.InterpolantFactoryMethodSmooth:
        return Xr;
      case this.InterpolantFactoryMethodBezier:
        return Tl
    }
  }
  getValueSize() {
    return this.values.length / this.times.length
  }
  shift(e) {
    if (e !== 0) {
      const t = this.times;
      for (let n = 0, i = t.length; n !== i; ++n) t[n] += e;
      us(this.settings) && (uc(this.settings.inTangents, e), uc(this.settings.outTangents, e))
    }
    return this
  }
  scale(e) {
    if (e !== 1) {
      const t = this.times;
      for (let n = 0, i = t.length; n !== i; ++n) t[n] *= e;
      us(this.settings) && (dc(this.settings.inTangents, e), dc(this.settings.outTangents, e))
    }
    return this
  }
  trim(e, t) {
    const n = this.times,
      i = n.length;
    let r = 0,
      a = i - 1;
    for (; r !== i && n[r] < e;) ++r;
    for (; a !== -1 && n[a] > t;) --a;
    if (++a, r !== 0 || a !== i) {
      r >= a && (a = Math.max(a, 1), r = a - 1);
      const o = this.getValueSize();
      this.times = n.slice(r, a), this.values = this.values.slice(r * o, a * o)
    }
    return this
  }
  validate() {
    let e = !0;
    const t = this.getValueSize();
    t - Math.floor(t) !== 0 && (ze("KeyframeTrack: Invalid value size in track.", this), e = !1);
    const n = this.times,
      i = this.values,
      r = n.length;
    r === 0 && (ze("KeyframeTrack: Track is empty.", this), e = !1);
    let a = null;
    for (let o = 0; o !== r; o++) {
      const l = n[o];
      if (typeof l == "number" && isNaN(l)) {
        ze("KeyframeTrack: Time is not a valid number.", this, o, l), e = !1;
        break
      }
      if (a !== null && a > l) {
        ze("KeyframeTrack: Out of order keys.", this, o, l, a), e = !1;
        break
      }
      a = l
    }
    if (i !== void 0 && hd(i))
      for (let o = 0, l = i.length; o !== l; ++o) {
        const c = i[o];
        if (isNaN(c)) {
          ze("KeyframeTrack: Value is not a valid number.", this, o, c), e = !1;
          break
        }
      }
    return e
  }
  optimize() {
    const e = this.times.slice(),
      t = this.values.slice(),
      n = this.getValueSize(),
      i = this.getInterpolation() === Xr,
      r = e.length - 1;
    let a = 1;
    for (let o = 1; o < r; ++o) {
      let l = !1;
      const c = e[o],
        h = e[o + 1];
      if (c !== h && (o !== 1 || c !== e[0]))
        if (i) l = !0;
        else {
          const u = o * n,
            d = u - n,
            f = u + n;
          for (let p = 0; p !== n; ++p) {
            const x = t[u + p];
            if (x !== t[d + p] || x !== t[f + p]) {
              l = !0;
              break
            }
          }
        } if (l) {
        if (o !== a) {
          e[a] = e[o];
          const u = o * n,
            d = a * n;
          for (let f = 0; f !== n; ++f) t[d + f] = t[u + f]
        }++a
      }
    }
    if (r > 0) {
      e[a] = e[r];
      for (let o = r * n, l = a * n, c = 0; c !== n; ++c) t[l + c] = t[o + c];
      ++a
    }
    return a !== e.length ? (this.times = e.slice(0, a), this.values = t.slice(0, a * n)) : (this.times = e, this.values = t), this
  }
  clone() {
    const e = this.times.slice(),
      t = this.values.slice(),
      n = this.constructor,
      i = new n(this.name, e, t);
    return i.createInterpolant = this.createInterpolant, us(this.settings) && (i.settings = {
      inTangents: this.settings.inTangents.slice(),
      outTangents: this.settings.outTangents.slice()
    }), i
  }
}

function uc(s, e) {
  for (let t = 0, n = s.length; t !== n; t += 2) s[t] += e
}

function dc(s, e) {
  for (let t = 0, n = s.length; t !== n; t += 2) s[t] *= e
}
fn.prototype.ValueTypeName = "";
fn.prototype.TimeBufferType = Float32Array;
fn.prototype.ValueBufferType = Float32Array;
fn.prototype.DefaultInterpolation = Ts;
class Ki extends fn {
  constructor(e, t, n) {
    super(e, t, n)
  }
}
Ki.prototype.ValueTypeName = "bool";
Ki.prototype.ValueBufferType = Array;
Ki.prototype.DefaultInterpolation = ys;
Ki.prototype.InterpolantFactoryMethodLinear = void 0;
Ki.prototype.InterpolantFactoryMethodSmooth = void 0;
class $h extends fn {
  constructor(e, t, n, i) {
    super(e, t, n, i)
  }
}
$h.prototype.ValueTypeName = "color";
class Ps extends fn {
  constructor(e, t, n, i) {
    super(e, t, n, i)
  }
}
Ps.prototype.ValueTypeName = "number";
class ip extends Yi {
  constructor(e, t, n, i) {
    super(e, t, n, i)
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer,
      a = this.sampleValues,
      o = this.valueSize,
      l = (n - t) / (i - t);
    let c = e * o;
    for (let h = c + o; c !== h; c += 4) en.slerpFlat(r, 0, a, c - o, a, c, l);
    return r
  }
}
class Is extends fn {
  constructor(e, t, n, i) {
    super(e, t, n, i)
  }
  InterpolantFactoryMethodLinear(e) {
    return new ip(this.times, this.values, this.getValueSize(), e)
  }
}
Is.prototype.ValueTypeName = "quaternion";
Is.prototype.InterpolantFactoryMethodSmooth = void 0;
class Ji extends fn {
  constructor(e, t, n) {
    super(e, t, n)
  }
}
Ji.prototype.ValueTypeName = "string";
Ji.prototype.ValueBufferType = Array;
Ji.prototype.DefaultInterpolation = ys;
Ji.prototype.InterpolantFactoryMethodLinear = void 0;
Ji.prototype.InterpolantFactoryMethodSmooth = void 0;
class Pr extends fn {
  constructor(e, t, n, i) {
    super(e, t, n, i)
  }
}
Pr.prototype.ValueTypeName = "vector";
class vo {
  constructor(e = "", t = -1, n = [], i = Uo) {
    this.name = e, this.tracks = n, this.duration = t, this.blendMode = i, this.uuid = hn(), this.userData = {}, this.duration < 0 && this.resetDuration()
  }
  static parse(e) {
    const t = [],
      n = e.tracks,
      i = 1 / (e.fps || 1);
    for (let a = 0, o = n.length; a !== o; ++a) t.push(rp(n[a]).scale(i));
    const r = new this(e.name, e.duration, t, e.blendMode);
    return r.uuid = e.uuid, r.userData = JSON.parse(e.userData || "{}"), r
  }
  static toJSON(e) {
    const t = [],
      n = e.tracks,
      i = {
        name: e.name,
        duration: e.duration,
        tracks: t,
        uuid: e.uuid,
        blendMode: e.blendMode,
        userData: JSON.stringify(e.userData)
      };
    for (let r = 0, a = n.length; r !== a; ++r) t.push(fn.toJSON(n[r]));
    return i
  }
  static CreateFromMorphTargetSequence(e, t, n, i) {
    const r = t.length,
      a = [];
    for (let o = 0; o < r; o++) {
      let l = [],
        c = [];
      l.push((o + r - 1) % r, o, (o + 1) % r), c.push(0, 1, 0);
      const h = Zf(l);
      l = hc(l, 1, h), c = hc(c, 1, h), !i && l[0] === 0 && (l.push(r), c.push(c[0])), a.push(new Ps(".morphTargetInfluences[" + t[o].name + "]", l, c).scale(1 / n))
    }
    return new this(e, -1, a)
  }
  static findByName(e, t) {
    let n = e;
    if (!Array.isArray(e)) {
      const i = e;
      n = i.geometry && i.geometry.animations || i.animations
    }
    for (let i = 0; i < n.length; i++)
      if (n[i].name === t) return n[i];
    return null
  }
  static CreateClipsFromMorphTargetSequences(e, t, n) {
    const i = {},
      r = /^([\w-]*?)([\d]+)$/;
    for (let o = 0, l = e.length; o < l; o++) {
      const c = e[o],
        h = c.name.match(r);
      if (h && h.length > 1) {
        const u = h[1];
        let d = i[u];
        d || (i[u] = d = []), d.push(c)
      }
    }
    const a = [];
    for (const o in i) a.push(this.CreateFromMorphTargetSequence(o, i[o], t, n));
    return a
  }
  resetDuration() {
    const e = this.tracks;
    let t = 0;
    for (let n = 0, i = e.length; n !== i; ++n) {
      const r = this.tracks[n];
      t = Math.max(t, r.times[r.times.length - 1])
    }
    return this.duration = t, this
  }
  trim() {
    for (let e = 0; e < this.tracks.length; e++) this.tracks[e].trim(0, this.duration);
    return this
  }
  validate() {
    let e = !0;
    for (let t = 0; t < this.tracks.length; t++) e = e && this.tracks[t].validate();
    return e
  }
  optimize() {
    for (let e = 0; e < this.tracks.length; e++) this.tracks[e].optimize();
    return this
  }
  clone() {
    const e = [];
    for (let n = 0; n < this.tracks.length; n++) e.push(this.tracks[n].clone());
    const t = new this.constructor(this.name, this.duration, e, this.blendMode);
    return t.userData = JSON.parse(JSON.stringify(this.userData)), t
  }
  toJSON() {
    return this.constructor.toJSON(this)
  }
}

function sp(s) {
  switch (s.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return Ps;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return Pr;
    case "color":
      return $h;
    case "quaternion":
      return Is;
    case "bool":
    case "boolean":
      return Ki;
    case "string":
      return Ji
  }
  throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + s)
}

function rp(s) {
  if (s.type === void 0) throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
  const e = sp(s.type);
  if (s.times === void 0) {
    const n = [],
      i = [];
    $f(s.keys, n, i, "value"), s.times = n, s.values = i
  }
  let t;
  return e.parse !== void 0 ? t = e.parse(s) : t = new e(s.name, s.times, s.values, s.interpolation), us(s.settings) && (t.settings = {
    inTangents: qn(s.settings.inTangents, Float32Array),
    outTangents: qn(s.settings.outTangents, Float32Array)
  }), t
}
const Dn = {
  enabled: !1,
  files: {},
  add: function(s, e) {
    this.enabled !== !1 && (fc(s) || (this.files[s] = e))
  },
  get: function(s) {
    if (this.enabled !== !1 && !fc(s)) return this.files[s]
  },
  remove: function(s) {
    delete this.files[s]
  },
  clear: function() {
    this.files = {}
  }
};

function fc(s) {
  try {
    const e = s.slice(s.indexOf(":") + 1);
    return new URL(e).protocol === "blob:"
  } catch {
    return !1
  }
}
class ap {
  constructor(e, t, n) {
    const i = this;
    let r = !1,
      a = 0,
      o = 0,
      l;
    const c = [];
    this.onStart = void 0, this.onLoad = e, this.onProgress = t, this.onError = n, this._abortController = null, this.itemStart = function(h) {
      o++, r === !1 && i.onStart !== void 0 && i.onStart(h, a, o), r = !0
    }, this.itemEnd = function(h) {
      a++, i.onProgress !== void 0 && i.onProgress(h, a, o), a === o && (r = !1, i.onLoad !== void 0 && i.onLoad())
    }, this.itemError = function(h) {
      i.onError !== void 0 && i.onError(h)
    }, this.resolveURL = function(h) {
      return h = h.normalize("NFC"), l ? l(h) : h
    }, this.setURLModifier = function(h) {
      return l = h, this
    }, this.addHandler = function(h, u) {
      return c.push(h, u), this
    }, this.removeHandler = function(h) {
      const u = c.indexOf(h);
      return u !== -1 && c.splice(u, 2), this
    }, this.getHandler = function(h) {
      for (let u = 0, d = c.length; u < d; u += 2) {
        const f = c[u],
          p = c[u + 1];
        if (f.global && (f.lastIndex = 0), f.test(h)) return p
      }
      return null
    }, this.abort = function() {
      return this.abortController.abort(), this._abortController = null, this
    }
  }
  get abortController() {
    return this._abortController || (this._abortController = new AbortController), this._abortController
  }
}
const op = new ap;
class pi {
  constructor(e) {
    this.manager = e !== void 0 ? e : op, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {}, this.priority = "auto", this.cache = "default", typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
      detail: this
    }))
  }
  load() {}
  loadAsync(e, t) {
    const n = this;
    return new Promise(function(i, r) {
      n.load(e, i, t, r)
    })
  }
  parse() {}
  setCrossOrigin(e) {
    return this.crossOrigin = e, this
  }
  setWithCredentials(e) {
    return this.withCredentials = e, this
  }
  setPath(e) {
    return this.path = e, this
  }
  setResourcePath(e) {
    return this.resourcePath = e, this
  }
  setRequestHeader(e) {
    return this.requestHeader = e, this
  }
  setPriority(e) {
    return this.priority = e, this
  }
  setCache(e) {
    return this.cache = e, this
  }
  abort() {
    return this
  }
}
pi.DEFAULT_MATERIAL_NAME = "__DEFAULT";
const In = {};
class lp extends Error {
  constructor(e, t) {
    super(e), this.response = t
  }
}
class Ir extends pi {
  constructor(e) {
    super(e), this.mimeType = "", this.responseType = "", this._abortController = new AbortController
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = Dn.get(`file:${e}`);
    if (r !== void 0) {
      this.manager.itemStart(e), setTimeout(() => {
        t && t(r), this.manager.itemEnd(e)
      }, 0);
      return
    }
    if (In[e] !== void 0) {
      In[e].push({
        onLoad: t,
        onProgress: n,
        onError: i
      });
      return
    }
    In[e] = [], In[e].push({
      onLoad: t,
      onProgress: n,
      onError: i
    });
    const a = new Request(e, {
        headers: new Headers(this.requestHeader),
        credentials: this.withCredentials ? "include" : "same-origin",
        priority: this.priority,
        cache: this.cache,
        signal: typeof AbortSignal.any == "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal
      }),
      o = this.mimeType,
      l = this.responseType;
    fetch(a).then(c => {
      if (c.status === 200 || c.status === 0) {
        if (c.status === 0 && Ce("FileLoader: HTTP Status 0 received."), typeof ReadableStream > "u" || c.body === void 0 || c.body.getReader === void 0) return c;
        const h = In[e],
          u = c.body.getReader(),
          d = c.headers.get("X-File-Size") || c.headers.get("Content-Length"),
          f = d ? parseInt(d) : 0,
          p = f !== 0;
        let x = 0;
        const m = new ReadableStream({
          start(g) {
            M();

            function M() {
              u.read().then(({
                done: E,
                value: v
              }) => {
                if (E) g.close();
                else {
                  x += v.byteLength;
                  const A = new ProgressEvent("progress", {
                    lengthComputable: p,
                    loaded: x,
                    total: f
                  });
                  for (let b = 0, _ = h.length; b < _; b++) {
                    const T = h[b];
                    T.onProgress && T.onProgress(A)
                  }
                  g.enqueue(v), M()
                }
              }, E => {
                g.error(E)
              })
            }
          }
        });
        return new Response(m)
      } else throw new lp(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`, c)
    }).then(c => {
      switch (l) {
        case "arraybuffer":
          return c.arrayBuffer();
        case "blob":
          return c.blob();
        case "document":
          return c.text().then(h => new DOMParser().parseFromString(h, o));
        case "json":
          return c.json();
        default:
          if (o === "") return c.text();
          {
            const u = /charset="?([^;"\s]*)"?/i.exec(o),
              d = u && u[1] ? u[1].toLowerCase() : void 0,
              f = new TextDecoder(d);
            return c.arrayBuffer().then(p => f.decode(p))
          }
      }
    }).then(c => {
      Dn.add(`file:${e}`, c);
      const h = In[e];
      delete In[e];
      for (let u = 0, d = h.length; u < d; u++) {
        const f = h[u];
        f.onLoad && f.onLoad(c)
      }
    }).catch(c => {
      const h = In[e];
      if (h === void 0) throw this.manager.itemError(e), c;
      delete In[e];
      for (let u = 0, d = h.length; u < d; u++) {
        const f = h[u];
        f.onError && f.onError(c)
      }
      this.manager.itemError(e)
    }).finally(() => {
      this.manager.itemEnd(e)
    }), this.manager.itemStart(e)
  }
  setResponseType(e) {
    return this.responseType = e, this
  }
  setMimeType(e) {
    return this.mimeType = e, this
  }
  abort() {
    return this._abortController.abort(), this._abortController = new AbortController, this
  }
}
const Ai = new WeakMap;
class cp extends pi {
  constructor(e) {
    super(e)
  }
  load(e, t, n, i) {
    this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this,
      a = Dn.get(`image:${e}`);
    if (a !== void 0) {
      if (a.complete === !0) r.manager.itemStart(e), setTimeout(function() {
        t && t(a), r.manager.itemEnd(e)
      }, 0);
      else {
        let u = Ai.get(a);
        u === void 0 && (u = [], Ai.set(a, u)), u.push({
          onLoad: t,
          onError: i
        })
      }
      return a
    }
    const o = bs("img");

    function l() {
      h(), t && t(this);
      const u = Ai.get(this) || [];
      for (let d = 0; d < u.length; d++) {
        const f = u[d];
        f.onLoad && f.onLoad(this)
      }
      Ai.delete(this), r.manager.itemEnd(e)
    }

    function c(u) {
      h(), i && i(u), Dn.remove(`image:${e}`);
      const d = Ai.get(this) || [];
      for (let f = 0; f < d.length; f++) {
        const p = d[f];
        p.onError && p.onError(u)
      }
      Ai.delete(this), r.manager.itemError(e), r.manager.itemEnd(e)
    }

    function h() {
      o.removeEventListener("load", l, !1), o.removeEventListener("error", c, !1)
    }
    return o.addEventListener("load", l, !1), o.addEventListener("error", c, !1), e.slice(0, 5) !== "data:" && this.crossOrigin !== void 0 && (o.crossOrigin = this.crossOrigin), Dn.add(`image:${e}`, o), r.manager.itemStart(e), o.fetchPriority = this.priority, o.src = e, o
  }
}
class hp extends pi {
  constructor(e) {
    super(e)
  }
  load(e, t, n, i) {
    const r = new vt,
      a = new cp(this.manager);
    return a.setPriority(this.priority), a.setCache(this.cache), a.setCrossOrigin(this.crossOrigin), a.setPath(this.path), a.load(e, function(o) {
      r.image = o, r.needsUpdate = !0, t !== void 0 && t(r)
    }, n, i), r
  }
}
class Us extends gt {
  static registerNode(e) {
    this.prototype._lightNode = e
  }
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new Fe(e), this.intensity = t
  }
  copy(e, t) {
    return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, t
  }
}
class up extends Us {
  constructor(e, t, n) {
    super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(gt.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Fe(t)
  }
  copy(e, t) {
    return super.copy(e, t), this.groundColor.copy(e.groundColor), this
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.groundColor = this.groundColor.getHex(), t
  }
}
const va = new We,
  pc = new N,
  mc = new N;
class $o {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.biasNode = null, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new re(512, 512), this.mapType = Jt, this.map = null, this.mapPass = null, this.matrix = new We, this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new As, this._frameExtents = new re(1, 1), this._viewportCount = 1, this._viewports = [new ht(0, 0, 1, 1)]
  }
  getViewportCount() {
    return this._viewportCount
  }
  getCamera() {
    return this.camera
  }
  getFrustum() {
    return this._frustum
  }
  updateMatrices(e) {
    const t = this.camera;
    pc.setFromMatrixPosition(e.matrixWorld), t.position.copy(pc), mc.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(mc), t.updateMatrixWorld(), this._updateMatrix(t, this.matrix, this._frustum)
  }
  _updateMatrix(e, t, n, i) {
    va.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), n.setFromProjectionMatrix(va, e.coordinateSystem, e.reversedDepth);
    const r = this._frameExtents,
      a = i ? i.z / r.x : 1,
      o = i ? i.w / r.y : 1,
      l = i ? i.x / r.x : 0,
      c = i ? i.y / r.y : 0;
    e.coordinateSystem === Es || e.reversedDepth ? t.set(.5 * a, 0, 0, .5 * a + l, 0, .5 * o, 0, .5 * o + c, 0, 0, 1, 0, 0, 0, 0, 1) : t.set(.5 * a, 0, 0, .5 * a + l, 0, .5 * o, 0, .5 * o + c, 0, 0, .5, .5, 0, 0, 0, 1), t.multiply(va)
  }
  getViewport(e) {
    return this._viewports[e]
  }
  getFrameExtents() {
    return this._frameExtents
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose()
  }
  copy(e) {
    return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.autoUpdate = e.autoUpdate, this.needsUpdate = e.needsUpdate, this.normalBias = e.normalBias, this.blurSamples = e.blurSamples, this.mapSize.copy(e.mapSize), this.mapType = e.mapType, this.biasNode = e.biasNode, this
  }
  clone() {
    return new this.constructor().copy(this)
  }
  toJSON() {
    const e = {};
    return e.intensity = this.intensity, e.bias = this.bias, e.normalBias = this.normalBias, e.radius = this.radius, e.blurSamples = this.blurSamples, e.mapSize = this.mapSize.toArray(), e.mapType = this.mapType, e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e
  }
}
const hr = new N,
  ur = new en,
  pn = new N;
class Qh extends gt {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new We, this.projectionMatrix = new We, this.projectionMatrixInverse = new We, this.coordinateSystem = cn, this._reversedDepth = !1
  }
  get reversedDepth() {
    return this._reversedDepth
  }
  copy(e, t) {
    return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this
  }
  getWorldDirection(e) {
    return super.getWorldDirection(e).negate()
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.matrixWorld.decompose(hr, ur, pn), pn.x === 1 && pn.y === 1 && pn.z === 1 ? this.matrixWorldInverse.copy(this.matrixWorld).invert() : this.matrixWorldInverse.compose(hr, ur, pn.set(1, 1, 1)).invert()
  }
  updateWorldMatrix(e, t, n = !1) {
    super.updateWorldMatrix(e, t, n), this.matrixWorld.decompose(hr, ur, pn), pn.x === 1 && pn.y === 1 && pn.z === 1 ? this.matrixWorldInverse.copy(this.matrixWorld).invert() : this.matrixWorldInverse.compose(hr, ur, pn.set(1, 1, 1)).invert()
  }
  clone() {
    return new this.constructor().copy(this)
  }
}
const Vn = new N,
  gc = new re,
  _c = new re;
class Kt extends Qh {
  constructor(e = 50, t = 1, n = .1, i = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = i, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix()
  }
  copy(e, t) {
    return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this
  }
  setFocalLength(e) {
    const t = .5 * this.getFilmHeight() / e;
    this.fov = Gi * 2 * Math.atan(t), this.updateProjectionMatrix()
  }
  getFocalLength() {
    const e = Math.tan(ps * .5 * this.fov);
    return .5 * this.getFilmHeight() / e
  }
  getEffectiveFOV() {
    return Gi * 2 * Math.atan(Math.tan(ps * .5 * this.fov) / this.zoom)
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1)
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1)
  }
  getViewBounds(e, t, n) {
    Vn.set(-1, -1, .5).applyMatrix4(this.projectionMatrixInverse), t.set(Vn.x, Vn.y).multiplyScalar(-e / Vn.z), Vn.set(1, 1, .5).applyMatrix4(this.projectionMatrixInverse), n.set(Vn.x, Vn.y).multiplyScalar(-e / Vn.z)
  }
  getViewSize(e, t) {
    return this.getViewBounds(e, gc, _c), t.subVectors(_c, gc)
  }
  setViewOffset(e, t, n, i, r, a) {
    this.aspect = e / t, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = a, this.updateProjectionMatrix()
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix()
  }
  updateProjectionMatrix() {
    const e = this.near;
    let t = e * Math.tan(ps * .5 * this.fov) / this.zoom,
      n = 2 * t,
      i = this.aspect * n,
      r = -.5 * i;
    const a = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = a.fullWidth,
        c = a.fullHeight;
      r += a.offsetX * i / l, t -= a.offsetY * n / c, i *= a.width / l, n *= a.height / c
    }
    const o = this.filmOffset;
    o !== 0 && (r += e * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + i, t, t - n, e, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t
  }
}
class dp extends $o {
  constructor() {
    super(new Kt(50, 1, .5, 500)), this.isSpotLightShadow = !0, this.focus = 1, this.aspect = 1
  }
  updateMatrices(e) {
    const t = this.camera,
      n = Gi * 2 * e.angle * this.focus,
      i = this.mapSize.width / this.mapSize.height * this.aspect,
      r = e.distance || t.far;
    (n !== t.fov || i !== t.aspect || r !== t.far) && (t.fov = n, t.aspect = i, t.far = r, t.updateProjectionMatrix()), super.updateMatrices(e)
  }
  copy(e) {
    return super.copy(e), this.focus = e.focus, this.aspect = e.aspect, this
  }
  toJSON() {
    const e = super.toJSON();
    return e.focus = this.focus, e.aspect = this.aspect, e
  }
}
class fp extends Us {
  constructor(e, t, n = 0, i = Math.PI / 3, r = 0, a = 2) {
    super(e, t), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(gt.DEFAULT_UP), this.updateMatrix(), this.target = new gt, this.distance = n, this.angle = i, this.penumbra = r, this.decay = a, this.map = null, this.shadow = new dp
  }
  get power() {
    return this.intensity * Math.PI
  }
  set power(e) {
    this.intensity = e / Math.PI
  }
  dispose() {
    super.dispose(), this.shadow.dispose()
  }
  copy(e, t) {
    return super.copy(e, t), this.distance = e.distance, this.angle = e.angle, this.penumbra = e.penumbra, this.decay = e.decay, this.target = e.target.clone(), this.map = e.map, this.shadow = e.shadow.clone(), this
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.distance = this.distance, t.object.angle = this.angle, t.object.decay = this.decay, t.object.penumbra = this.penumbra, t.object.target = this.target.uuid, this.map && this.map.isTexture && (t.object.map = this.map.toJSON(e).uuid), t.object.shadow = this.shadow.toJSON(), t
  }
}
class pp extends $o {
  constructor() {
    super(new Kt(90, 1, .5, 500)), this.isPointLightShadow = !0
  }
}
class jh extends Us {
  constructor(e, t, n = 0, i = 2) {
    super(e, t), this.isPointLight = !0, this.type = "PointLight", this.distance = n, this.decay = i, this.shadow = new pp
  }
  get power() {
    return this.intensity * 4 * Math.PI
  }
  set power(e) {
    this.intensity = e / (4 * Math.PI)
  }
  dispose() {
    super.dispose(), this.shadow.dispose()
  }
  copy(e, t) {
    return super.copy(e, t), this.distance = e.distance, this.decay = e.decay, this.shadow = e.shadow.clone(), this
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.distance = this.distance, t.object.decay = this.decay, t.object.shadow = this.shadow.toJSON(), t
  }
}
class Qo extends Qh {
  constructor(e = -1, t = 1, n = 1, i = -1, r = .1, a = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = i, this.near = r, this.far = a, this.updateProjectionMatrix()
  }
  copy(e, t) {
    return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this
  }
  setViewOffset(e, t, n, i, r, a) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = a, this.updateProjectionMatrix()
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix()
  }
  updateProjectionMatrix() {
    const e = (this.right - this.left) / (2 * this.zoom),
      t = (this.top - this.bottom) / (2 * this.zoom),
      n = (this.right + this.left) / 2,
      i = (this.top + this.bottom) / 2;
    let r = n - e,
      a = n + e,
      o = i + t,
      l = i - t;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom,
        h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      r += c * this.view.offsetX, a = r + c * this.view.width, o -= h * this.view.offsetY, l = o - h * this.view.height
    }
    this.projectionMatrix.makeOrthographic(r, a, o, l, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t
  }
}
class mp extends $o {
  constructor() {
    super(new Qo(-5, 5, 5, -5, .5, 500)), this.isDirectionalLightShadow = !0
  }
}
class Mo extends Us {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(gt.DEFAULT_UP), this.updateMatrix(), this.target = new gt, this.shadow = new mp
  }
  dispose() {
    super.dispose(), this.shadow.dispose()
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.shadow = this.shadow.toJSON(), t.object.target = this.target.uuid, t
  }
}
class Fv extends Us {
  constructor(e, t, n = 10, i = 10) {
    super(e, t), this.isRectAreaLight = !0, this.type = "RectAreaLight", this.width = n, this.height = i
  }
  get power() {
    return this.intensity * this.width * this.height * Math.PI
  }
  set power(e) {
    this.intensity = e / (this.width * this.height * Math.PI)
  }
  copy(e) {
    return super.copy(e), this.width = e.width, this.height = e.height, this
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.width = this.width, t.object.height = this.height, t
  }
}
class Zn {
  static extractUrlBase(e) {
    const t = e.lastIndexOf("/");
    return t === -1 ? "./" : e.slice(0, t + 1)
  }
  static resolveURL(e, t) {
    return typeof e != "string" || e === "" ? "" : (/^https?:\/\//i.test(t) && /^\//.test(e) && (t = t.replace(/(^https?:\/\/[^\/]+).*/i, "$1")), /^(https?:)?\/\//i.test(e) || /^data:.*,.*$/i.test(e) || /^blob:.*$/i.test(e) ? e : t + e)
  }
}
const Ma = new WeakMap;
class gp extends pi {
  constructor(e) {
    super(e), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && Ce("ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && Ce("ImageBitmapLoader: fetch() not supported."), this.options = {
      premultiplyAlpha: "none"
    }, this._abortController = new AbortController
  }
  setOptions(e) {
    return this.options = e, this
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this,
      a = Dn.get(`image-bitmap:${e}`);
    if (a !== void 0) {
      if (r.manager.itemStart(e), a.then) {
        a.then(c => {
          Ma.has(a) === !0 ? (i && i(Ma.get(a)), r.manager.itemError(e), r.manager.itemEnd(e)) : (t && t(c), r.manager.itemEnd(e))
        });
        return
      }
      setTimeout(function() {
        t && t(a), r.manager.itemEnd(e)
      }, 0);
      return
    }
    const o = {};
    o.credentials = this.withCredentials || this.crossOrigin !== "anonymous" ? "include" : "same-origin", o.headers = this.requestHeader, o.priority = this.priority, o.cache = this.cache, o.signal = typeof AbortSignal.any == "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal;
    const l = fetch(e, o).then(function(c) {
      return c.blob()
    }).then(function(c) {
      return createImageBitmap(c, Object.assign({}, r.options, {
        colorSpaceConversion: "none"
      }))
    }).then(function(c) {
      return Dn.add(`image-bitmap:${e}`, c), t && t(c), r.manager.itemEnd(e), c
    }).catch(function(c) {
      i && i(c), Ma.set(l, c), Dn.remove(`image-bitmap:${e}`), r.manager.itemError(e), r.manager.itemEnd(e)
    });
    Dn.add(`image-bitmap:${e}`, l), r.manager.itemStart(e)
  }
  abort() {
    return this._abortController.abort(), this._abortController = new AbortController, this
  }
}
const wi = -90,
  Ri = 1;
class So extends gt {
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const i = new Kt(wi, Ri, e, t);
    i.layers = this.layers, this.add(i);
    const r = new Kt(wi, Ri, e, t);
    r.layers = this.layers, this.add(r);
    const a = new Kt(wi, Ri, e, t);
    a.layers = this.layers, this.add(a);
    const o = new Kt(wi, Ri, e, t);
    o.layers = this.layers, this.add(o);
    const l = new Kt(wi, Ri, e, t);
    l.layers = this.layers, this.add(l);
    const c = new Kt(wi, Ri, e, t);
    c.layers = this.layers, this.add(c)
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem,
      t = this.children.concat(),
      [n, i, r, a, o, l] = t;
    for (const c of t) this.remove(c);
    if (e === cn) n.up.set(0, 1, 0), n.lookAt(1, 0, 0), i.up.set(0, 1, 0), i.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (e === Es) n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), i.up.set(0, -1, 0), i.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
    else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
    for (const c of t) this.add(c), c.updateMatrixWorld()
  }
  update(e, t) {
    this.parent === null && this.updateMatrixWorld();
    const {
      renderTarget: n,
      activeMipmapLevel: i
    } = this;
    this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
    const [r, a, o, l, c, h] = this.children, u = e.getRenderTarget(), d = e.getActiveCubeFace(), f = e.getActiveMipmapLevel(), p = e.xr.enabled;
    e.xr.enabled = !1;
    const x = n.texture.mipmapsAutoUpdate;
    n.texture.mipmapsAutoUpdate = !1;
    let m = !1;
    e.isWebGLRenderer === !0 ? m = e.state.buffers.depth.getReversed() : m = e.reversedDepthBuffer, e.setRenderTarget(n, 0, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, r), e.setRenderTarget(n, 1, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, a), e.setRenderTarget(n, 2, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, o), e.setRenderTarget(n, 3, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, l), e.setRenderTarget(n, 4, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, c), n.texture.mipmapsAutoUpdate = x, e.setRenderTarget(n, 5, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, h), e.setRenderTarget(u, d, f), e.xr.enabled = p, n.texture.needsPMREMUpdate = !0
  }
}
class _p extends Kt {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = e, this.perCameraFrustumCulled = !1
  }
}
class Ov {
  constructor() {
    this._previousTime = 0, this._currentTime = 0, this._startTime = performance.now(), this._delta = 0, this._elapsed = 0, this._timescale = 1, this._document = null, this._pageVisibilityHandler = null
  }
  connect(e) {
    this._document = e, e.hidden !== void 0 && (this._pageVisibilityHandler = xp.bind(this), e.addEventListener("visibilitychange", this._pageVisibilityHandler, !1))
  }
  disconnect() {
    this._pageVisibilityHandler !== null && (this._document.removeEventListener("visibilitychange", this._pageVisibilityHandler), this._pageVisibilityHandler = null), this._document = null
  }
  getDelta() {
    return this._delta / 1e3
  }
  getElapsed() {
    return this._elapsed / 1e3
  }
  getTimescale() {
    return this._timescale
  }
  setTimescale(e) {
    return this._timescale = e, this
  }
  reset() {
    return this._currentTime = performance.now() - this._startTime, this
  }
  dispose() {
    this.disconnect()
  }
  update(e) {
    return this._pageVisibilityHandler !== null && this._document.hidden === !0 ? this._delta = 0 : (this._previousTime = this._currentTime, this._currentTime = (e !== void 0 ? e : performance.now()) - this._startTime, this._delta = (this._currentTime - this._previousTime) * this._timescale, this._elapsed += this._delta), this
  }
}

function xp() {
  this._document.hidden === !1 && this.reset()
}
class vp {
  constructor(e, t, n) {
    this.binding = e, this.valueSize = n;
    let i, r, a;
    switch (t) {
      case "quaternion":
        i = this._slerp, r = this._slerpAdditive, a = this._setAdditiveIdentityQuaternion, this.buffer = new Float64Array(n * 6), this._workIndex = 5;
        break;
      case "string":
      case "bool":
        i = this._select, r = this._select, a = this._setAdditiveIdentityOther, this.buffer = new Array(n * 5);
        break;
      default:
        i = this._lerp, r = this._lerpAdditive, a = this._setAdditiveIdentityNumeric, this.buffer = new Float64Array(n * 5)
    }
    this._mixBufferRegion = i, this._mixBufferRegionAdditive = r, this._setIdentity = a, this._origIndex = 3, this._addIndex = 4, this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, this.useCount = 0, this.referenceCount = 0
  }
  accumulate(e, t) {
    const n = this.buffer,
      i = this.valueSize,
      r = e * i + i;
    let a = this.cumulativeWeight;
    if (a === 0) {
      for (let o = 0; o !== i; ++o) n[r + o] = n[o];
      a = t
    } else {
      a += t;
      const o = t / a;
      this._mixBufferRegion(n, r, 0, o, i)
    }
    this.cumulativeWeight = a
  }
  accumulateAdditive(e) {
    const t = this.buffer,
      n = this.valueSize,
      i = n * this._addIndex;
    this.cumulativeWeightAdditive === 0 && this._setIdentity(), this._mixBufferRegionAdditive(t, i, 0, e, n), this.cumulativeWeightAdditive += e
  }
  apply(e) {
    const t = this.valueSize,
      n = this.buffer,
      i = e * t + t,
      r = this.cumulativeWeight,
      a = this.cumulativeWeightAdditive,
      o = this.binding;
    if (this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, r < 1) {
      const l = t * this._origIndex;
      this._mixBufferRegion(n, i, l, 1 - r, t)
    }
    a > 0 && this._mixBufferRegionAdditive(n, i, this._addIndex * t, 1, t);
    for (let l = t, c = t + t; l !== c; ++l)
      if (n[l] !== n[l + t]) {
        o.setValue(n, i);
        break
      }
  }
  saveOriginalState() {
    const e = this.binding,
      t = this.buffer,
      n = this.valueSize,
      i = n * this._origIndex;
    e.getValue(t, i);
    for (let r = n, a = i; r !== a; ++r) t[r] = t[i + r % n];
    this._setIdentity(), this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0
  }
  restoreOriginalState() {
    const e = this.valueSize * 3;
    this.binding.setValue(this.buffer, e)
  }
  _setAdditiveIdentityNumeric() {
    const e = this._addIndex * this.valueSize,
      t = e + this.valueSize;
    for (let n = e; n < t; n++) this.buffer[n] = 0
  }
  _setAdditiveIdentityQuaternion() {
    this._setAdditiveIdentityNumeric(), this.buffer[this._addIndex * this.valueSize + 3] = 1
  }
  _setAdditiveIdentityOther() {
    const e = this._origIndex * this.valueSize,
      t = this._addIndex * this.valueSize;
    for (let n = 0; n < this.valueSize; n++) this.buffer[t + n] = this.buffer[e + n]
  }
  _select(e, t, n, i, r) {
    if (i >= .5)
      for (let a = 0; a !== r; ++a) e[t + a] = e[n + a]
  }
  _slerp(e, t, n, i) {
    en.slerpFlat(e, t, e, t, e, n, i)
  }
  _slerpAdditive(e, t, n, i, r) {
    const a = this._workIndex * r;
    en.multiplyQuaternionsFlat(e, a, e, t, e, n), en.slerpFlat(e, t, e, t, e, a, i)
  }
  _lerp(e, t, n, i, r) {
    const a = 1 - i;
    for (let o = 0; o !== r; ++o) {
      const l = t + o;
      e[l] = e[l] * a + e[n + o] * i
    }
  }
  _lerpAdditive(e, t, n, i, r) {
    for (let a = 0; a !== r; ++a) {
      const o = t + a;
      e[o] = e[o] + e[n + a] * i
    }
  }
}
const jo = "\\[\\]\\.:\\/",
  Mp = new RegExp("[" + jo + "]", "g"),
  el = "[^" + jo + "]",
  Sp = "[^" + jo.replace("\\.", "") + "]",
  yp = /((?:WC+[\/:])*)/.source.replace("WC", el),
  Tp = /(WCOD+)?/.source.replace("WCOD", Sp),
  Ep = /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", el),
  bp = /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", el),
  Ap = new RegExp("^" + yp + Tp + Ep + bp + "$"),
  wp = ["material", "materials", "bones", "map"];
class Rp {
  constructor(e, t, n) {
    const i = n || ot.parseTrackName(t);
    this._targetGroup = e, this._bindings = e.subscribe_(t, i)
  }
  getValue(e, t) {
    this.bind();
    const n = this._targetGroup.nCachedObjects_,
      i = this._bindings[n];
    i !== void 0 && i.getValue(e, t)
  }
  setValue(e, t) {
    const n = this._bindings;
    for (let i = this._targetGroup.nCachedObjects_, r = n.length; i !== r; ++i) n[i].setValue(e, t)
  }
  bind() {
    const e = this._bindings;
    for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].bind()
  }
  unbind() {
    const e = this._bindings;
    for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].unbind()
  }
}
class ot {
  constructor(e, t, n) {
    this.path = t, this.parsedPath = n || ot.parseTrackName(t), this.node = ot.findNode(e, this.parsedPath.nodeName), this.rootNode = e, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound
  }
  static create(e, t, n) {
    return e && e.isAnimationObjectGroup ? new ot.Composite(e, t, n) : new ot(e, t, n)
  }
  static sanitizeNodeName(e) {
    return e.replace(/\s/g, "_").replace(Mp, "")
  }
  static parseTrackName(e) {
    const t = Ap.exec(e);
    if (t === null) throw new Error("THREE.PropertyBinding: Cannot parse trackName: " + e);
    const n = {
        nodeName: t[2],
        objectName: t[3],
        objectIndex: t[4],
        propertyName: t[5],
        propertyIndex: t[6]
      },
      i = n.nodeName && n.nodeName.lastIndexOf(".");
    if (i !== void 0 && i !== -1) {
      const r = n.nodeName.substring(i + 1);
      wp.indexOf(r) !== -1 && (n.nodeName = n.nodeName.substring(0, i), n.objectName = r)
    }
    if (n.propertyName === null || n.propertyName.length === 0) throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: " + e);
    return n
  }
  static findNode(e, t) {
    if (t === void 0 || t === "" || t === "." || t === -1 || t === e.name || t === e.uuid) return e;
    if (e.skeleton) {
      const n = e.skeleton.getBoneByName(t);
      if (n !== void 0) return n
    }
    if (e.children) {
      const n = function(r) {
          for (let a = 0; a < r.length; a++) {
            const o = r[a];
            if (o.name === t || o.uuid === t) return o;
            const l = n(o.children);
            if (l) return l
          }
          return null
        },
        i = n(e.children);
      if (i) return i
    }
    return null
  }
  _getValue_unavailable() {}
  _setValue_unavailable() {}
  _getValue_direct(e, t) {
    e[t] = this.targetObject[this.propertyName]
  }
  _getValue_array(e, t) {
    const n = this.resolvedProperty;
    for (let i = 0, r = n.length; i !== r; ++i) e[t++] = n[i]
  }
  _getValue_arrayElement(e, t) {
    e[t] = this.resolvedProperty[this.propertyIndex]
  }
  _getValue_toArray(e, t) {
    this.resolvedProperty.toArray(e, t)
  }
  _setValue_direct(e, t) {
    this.targetObject[this.propertyName] = e[t]
  }
  _setValue_direct_setNeedsUpdate(e, t) {
    this.targetObject[this.propertyName] = e[t], this.targetObject.needsUpdate = !0
  }
  _setValue_direct_setMatrixWorldNeedsUpdate(e, t) {
    this.targetObject[this.propertyName] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0
  }
  _setValue_array(e, t) {
    const n = this.resolvedProperty;
    for (let i = 0, r = n.length; i !== r; ++i) n[i] = e[t++]
  }
  _setValue_array_setNeedsUpdate(e, t) {
    const n = this.resolvedProperty;
    for (let i = 0, r = n.length; i !== r; ++i) n[i] = e[t++];
    this.targetObject.needsUpdate = !0
  }
  _setValue_array_setMatrixWorldNeedsUpdate(e, t) {
    const n = this.resolvedProperty;
    for (let i = 0, r = n.length; i !== r; ++i) n[i] = e[t++];
    this.targetObject.matrixWorldNeedsUpdate = !0
  }
  _setValue_arrayElement(e, t) {
    this.resolvedProperty[this.propertyIndex] = e[t]
  }
  _setValue_arrayElement_setNeedsUpdate(e, t) {
    this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.needsUpdate = !0
  }
  _setValue_arrayElement_setMatrixWorldNeedsUpdate(e, t) {
    this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0
  }
  _setValue_fromArray(e, t) {
    this.resolvedProperty.fromArray(e, t)
  }
  _setValue_fromArray_setNeedsUpdate(e, t) {
    this.resolvedProperty.fromArray(e, t), this.targetObject.needsUpdate = !0
  }
  _setValue_fromArray_setMatrixWorldNeedsUpdate(e, t) {
    this.resolvedProperty.fromArray(e, t), this.targetObject.matrixWorldNeedsUpdate = !0
  }
  _getValue_unbound(e, t) {
    this.bind(), this.getValue(e, t)
  }
  _setValue_unbound(e, t) {
    this.bind(), this.setValue(e, t)
  }
  bind() {
    let e = this.node;
    const t = this.parsedPath,
      n = t.objectName,
      i = t.propertyName;
    let r = t.propertyIndex;
    if (e || (e = ot.findNode(this.rootNode, t.nodeName), this.node = e), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !e) {
      Ce("PropertyBinding: No target node found for track: " + this.path + ".");
      return
    }
    if (n) {
      let c = t.objectIndex;
      switch (n) {
        case "materials":
          if (!e.material) {
            ze("PropertyBinding: Can not bind to material as node does not have a material.", this);
            return
          }
          if (!e.material.materials) {
            ze("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
            return
          }
          e = e.material.materials;
          break;
        case "bones":
          if (!e.skeleton) {
            ze("PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
            return
          }
          e = e.skeleton.bones;
          for (let h = 0; h < e.length; h++)
            if (e[h].name === c) {
              c = h;
              break
            } break;
        case "map":
          if ("map" in e) {
            e = e.map;
            break
          }
          if (!e.material) {
            ze("PropertyBinding: Can not bind to material as node does not have a material.", this);
            return
          }
          if (!e.material.map) {
            ze("PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
            return
          }
          e = e.material.map;
          break;
        default:
          if (e[n] === void 0) {
            ze("PropertyBinding: Can not bind to objectName of node undefined.", this);
            return
          }
          e = e[n]
      }
      if (c !== void 0) {
        if (e[c] === void 0) {
          ze("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, e);
          return
        }
        e = e[c]
      }
    }
    const a = e[i];
    if (a === void 0) {
      const c = t.nodeName;
      ze("PropertyBinding: Trying to update property for track: " + c + "." + i + " but it wasn't found.", e);
      return
    }
    let o = this.Versioning.None;
    this.targetObject = e, e.isMaterial === !0 ? o = this.Versioning.NeedsUpdate : e.isObject3D === !0 && (o = this.Versioning.MatrixWorldNeedsUpdate);
    let l = this.BindingType.Direct;
    if (r !== void 0) {
      if (i === "morphTargetInfluences") {
        if (!e.geometry) {
          ze("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
          return
        }
        if (!e.geometry.morphAttributes) {
          ze("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
          return
        }
        e.morphTargetDictionary[r] !== void 0 && (r = e.morphTargetDictionary[r])
      }
      l = this.BindingType.ArrayElement, this.resolvedProperty = a, this.propertyIndex = r
    } else a.fromArray !== void 0 && a.toArray !== void 0 ? (l = this.BindingType.HasFromToArray, this.resolvedProperty = a) : Array.isArray(a) ? (l = this.BindingType.EntireArray, this.resolvedProperty = a) : this.propertyName = i;
    this.getValue = this.GetterByBindingType[l], this.setValue = this.SetterByBindingTypeAndVersioning[l][o]
  }
  unbind() {
    this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound
  }
}
ot.Composite = Rp;
ot.prototype.BindingType = {
  Direct: 0,
  EntireArray: 1,
  ArrayElement: 2,
  HasFromToArray: 3
};
ot.prototype.Versioning = {
  None: 0,
  NeedsUpdate: 1,
  MatrixWorldNeedsUpdate: 2
};
ot.prototype.GetterByBindingType = [ot.prototype._getValue_direct, ot.prototype._getValue_array, ot.prototype._getValue_arrayElement, ot.prototype._getValue_toArray];
ot.prototype.SetterByBindingTypeAndVersioning = [
  [ot.prototype._setValue_direct, ot.prototype._setValue_direct_setNeedsUpdate, ot.prototype._setValue_direct_setMatrixWorldNeedsUpdate],
  [ot.prototype._setValue_array, ot.prototype._setValue_array_setNeedsUpdate, ot.prototype._setValue_array_setMatrixWorldNeedsUpdate],
  [ot.prototype._setValue_arrayElement, ot.prototype._setValue_arrayElement_setNeedsUpdate, ot.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],
  [ot.prototype._setValue_fromArray, ot.prototype._setValue_fromArray_setNeedsUpdate, ot.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]
];
class Cp {
  constructor(e, t, n = null, i = t.blendMode) {
    this._mixer = e, this._clip = t, this._localRoot = n, this.blendMode = i;
    const r = t.tracks,
      a = r.length,
      o = new Array(a),
      l = {
        endingStart: Pi,
        endingEnd: Pi
      };
    for (let c = 0; c !== a; ++c) {
      const h = r[c].createInterpolant(null);
      o[c] = h, h.settings = l
    }
    this._interpolantSettings = l, this._interpolants = o, this._propertyBindings = new Array(a), this._cacheIndex = null, this._byClipCacheIndex = null, this._timeScaleInterpolant = null, this._restoreTimeScale = null, this._weightInterpolant = null, this.loop = $u, this._loopCount = -1, this._startTime = null, this.time = 0, this.timeScale = 1, this._effectiveTimeScale = 1, this.weight = 1, this._effectiveWeight = 1, this.repetitions = 1 / 0, this.paused = !1, this.enabled = !0, this.clampWhenFinished = !1, this.zeroSlopeAtStart = !0, this.zeroSlopeAtEnd = !0
  }
  play() {
    return this._mixer._activateAction(this), this
  }
  stop() {
    return this._mixer._deactivateAction(this), this.reset()
  }
  reset() {
    return this.paused = !1, this.enabled = !0, this.time = 0, this._loopCount = -1, this._startTime = null, this.stopFading().stopWarping()
  }
  isRunning() {
    return this.enabled && !this.paused && this.timeScale !== 0 && this._startTime === null && this._mixer._isActiveAction(this)
  }
  isScheduled() {
    return this._mixer._isActiveAction(this)
  }
  startAt(e) {
    return this._startTime = e, this
  }
  setLoop(e, t) {
    return this.loop = e, this.repetitions = t, this
  }
  setEffectiveWeight(e) {
    return this.weight = e, this._effectiveWeight = this.enabled ? e : 0, this.stopFading()
  }
  getEffectiveWeight() {
    return this._effectiveWeight
  }
  fadeIn(e) {
    return this._scheduleFading(e, 0, 1)
  }
  fadeOut(e) {
    return this._scheduleFading(e, 1, 0)
  }
  crossFadeFrom(e, t, n = !1) {
    if (e.fadeOut(t), this.fadeIn(t), n === !0) {
      const i = this._clip.duration,
        r = e._clip.duration,
        a = r / i,
        o = i / r;
      e._restoreTimeScale = e.timeScale, this._restoreTimeScale = this.timeScale, e.warp(1, a, t), this.warp(o, 1, t)
    }
    return this
  }
  crossFadeTo(e, t, n = !1) {
    return e.crossFadeFrom(this, t, n)
  }
  stopFading() {
    const e = this._weightInterpolant;
    return e !== null && (this._weightInterpolant = null, this._mixer._takeBackControlInterpolant(e)), this
  }
  setEffectiveTimeScale(e) {
    return this.timeScale = e, this._effectiveTimeScale = this.paused ? 0 : e, this.stopWarping()
  }
  getEffectiveTimeScale() {
    return this._effectiveTimeScale
  }
  setDuration(e) {
    return this.timeScale = this._clip.duration / e, this.stopWarping()
  }
  syncWith(e) {
    return this.time = e.time, this.timeScale = e.timeScale, this.stopWarping()
  }
  halt(e) {
    return this.warp(this._effectiveTimeScale, 0, e)
  }
  warp(e, t, n) {
    const i = this._mixer,
      r = i.time,
      a = this.timeScale;
    let o = this._timeScaleInterpolant;
    o === null && (o = i._lendControlInterpolant(), this._timeScaleInterpolant = o);
    const l = o.parameterPositions,
      c = o.sampleValues;
    return l[0] = r, l[1] = r + n, c[0] = e / a, c[1] = t / a, this
  }
  stopWarping() {
    const e = this._timeScaleInterpolant;
    return e !== null && (this._timeScaleInterpolant = null, this._mixer._takeBackControlInterpolant(e)), this._restoreTimeScale = null, this
  }
  getMixer() {
    return this._mixer
  }
  getClip() {
    return this._clip
  }
  getRoot() {
    return this._localRoot || this._mixer._root
  }
  _update(e, t, n, i) {
    if (!this.enabled) {
      this._updateWeight(e);
      return
    }
    const r = this._startTime;
    if (r !== null) {
      const l = (e - r) * n;
      l < 0 || n === 0 ? t = 0 : (this._startTime = null, t = n * l)
    }
    t *= this._updateTimeScale(e);
    const a = this._updateTime(t),
      o = this._updateWeight(e);
    if (o > 0) {
      const l = this._interpolants,
        c = this._propertyBindings;
      switch (this.blendMode) {
        case ju:
          for (let h = 0, u = l.length; h !== u; ++h) l[h].evaluate(a), c[h].accumulateAdditive(o);
          break;
        case Uo:
        default:
          for (let h = 0, u = l.length; h !== u; ++h) l[h].evaluate(a), c[h].accumulate(i, o)
      }
    }
  }
  _updateWeight(e) {
    let t = 0;
    if (this.enabled) {
      t = this.weight;
      const n = this._weightInterpolant;
      if (n !== null) {
        const i = n.evaluate(e)[0];
        t *= i, e > n.parameterPositions[1] && (this.stopFading(), i === 0 && (this.enabled = !1))
      }
    }
    return this._effectiveWeight = t, t
  }
  _updateTimeScale(e) {
    let t = 0;
    if (!this.paused) {
      t = this.timeScale;
      const n = this._timeScaleInterpolant;
      if (n !== null) {
        const i = n.evaluate(e)[0];
        t *= i, e > n.parameterPositions[1] && (t === 0 ? this.paused = !0 : (this._restoreTimeScale !== null && (t = this._restoreTimeScale), this.timeScale = t), this.stopWarping())
      }
    }
    return this._effectiveTimeScale = t, t
  }
  _updateTime(e) {
    const t = this._clip.duration,
      n = this.loop;
    let i = this.time + e,
      r = this._loopCount;
    const a = n === Qu;
    if (e === 0) return r === -1 ? i : a && (r & 1) === 1 ? t - i : i;
    if (n === Zu) {
      r === -1 && (this._loopCount = 0, this._setEndings(!0, !0, !1));
      e: {
        if (i >= t) i = t;
        else if (i < 0) i = 0;
        else {
          this.time = i;
          break e
        }
        this.clampWhenFinished ? this.paused = !0 : this.enabled = !1,
        this.time = i,
        this._mixer.dispatchEvent({
          type: "finished",
          action: this,
          direction: e < 0 ? -1 : 1
        })
      }
    } else {
      if (r === -1 && (e >= 0 ? (r = 0, this._setEndings(!0, this.repetitions === 0, a)) : this._setEndings(this.repetitions === 0, !0, a)), i >= t || i < 0) {
        const o = Math.floor(i / t);
        i -= t * o, r += Math.abs(o);
        const l = this.repetitions - r;
        if (l <= 0) this.clampWhenFinished ? this.paused = !0 : this.enabled = !1, i = e > 0 ? t : 0, this.time = i, this._mixer.dispatchEvent({
          type: "finished",
          action: this,
          direction: e > 0 ? 1 : -1
        });
        else {
          if (l === 1) {
            const c = e < 0;
            this._setEndings(c, !c, a)
          } else this._setEndings(!1, !1, a);
          this._loopCount = r, this.time = i, this._mixer.dispatchEvent({
            type: "loop",
            action: this,
            loopDelta: o
          })
        }
      } else this._loopCount = r, this.time = i;
      if (a && (r & 1) === 1) return t - i
    }
    return i
  }
  _setEndings(e, t, n) {
    const i = this._interpolantSettings;
    n ? (i.endingStart = Ii, i.endingEnd = Ii) : (e ? i.endingStart = this.zeroSlopeAtStart ? Ii : Pi : i.endingStart = br, t ? i.endingEnd = this.zeroSlopeAtEnd ? Ii : Pi : i.endingEnd = br)
  }
  _scheduleFading(e, t, n) {
    const i = this._mixer,
      r = i.time;
    let a = this._weightInterpolant;
    a === null && (a = i._lendControlInterpolant(), this._weightInterpolant = a);
    const o = a.parameterPositions,
      l = a.sampleValues;
    return o[0] = r, l[0] = t, o[1] = r + e, l[1] = n, this
  }
}
const Lp = new Float32Array(1);
class Pp extends jn {
  constructor(e) {
    super(), this._root = e, this._initMemoryManager(), this._accuIndex = 0, this.time = 0, this.timeScale = 1, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
      detail: this
    }))
  }
  _bindAction(e, t) {
    const n = e._localRoot || this._root,
      i = e._clip.tracks,
      r = i.length,
      a = e._propertyBindings,
      o = e._interpolants,
      l = n.uuid,
      c = this._bindingsByRootAndName;
    let h = c[l];
    h === void 0 && (h = {}, c[l] = h);
    for (let u = 0; u !== r; ++u) {
      const d = i[u],
        f = d.name;
      let p = h[f];
      if (p !== void 0) ++p.referenceCount, a[u] = p;
      else {
        if (p = a[u], p !== void 0) {
          p._cacheIndex === null && (++p.referenceCount, this._addInactiveBinding(p, l, f));
          continue
        }
        const x = t && t._propertyBindings[u].binding.parsedPath;
        p = new vp(ot.create(n, f, x), d.ValueTypeName, d.getValueSize()), ++p.referenceCount, this._addInactiveBinding(p, l, f), a[u] = p
      }
      o[u].resultBuffer = p.buffer
    }
  }
  _activateAction(e) {
    if (!this._isActiveAction(e)) {
      if (e._cacheIndex === null) {
        const n = (e._localRoot || this._root).uuid,
          i = e._clip.uuid,
          r = this._actionsByClip[i];
        this._bindAction(e, r && r.knownActions[0]), this._addInactiveAction(e, i, n)
      }
      const t = e._propertyBindings;
      for (let n = 0, i = t.length; n !== i; ++n) {
        const r = t[n];
        r.useCount++ === 0 && (this._lendBinding(r), r.saveOriginalState())
      }
      this._lendAction(e)
    }
  }
  _deactivateAction(e) {
    if (this._isActiveAction(e)) {
      const t = e._propertyBindings;
      for (let n = 0, i = t.length; n !== i; ++n) {
        const r = t[n];
        --r.useCount === 0 && (r.restoreOriginalState(), this._takeBackBinding(r))
      }
      this._takeBackAction(e)
    }
  }
  _initMemoryManager() {
    this._actions = [], this._nActiveActions = 0, this._actionsByClip = {}, this._bindings = [], this._nActiveBindings = 0, this._bindingsByRootAndName = {}, this._controlInterpolants = [], this._nActiveControlInterpolants = 0;
    const e = this;
    this.stats = {
      actions: {
        get total() {
          return e._actions.length
        },
        get inUse() {
          return e._nActiveActions
        }
      },
      bindings: {
        get total() {
          return e._bindings.length
        },
        get inUse() {
          return e._nActiveBindings
        }
      },
      controlInterpolants: {
        get total() {
          return e._controlInterpolants.length
        },
        get inUse() {
          return e._nActiveControlInterpolants
        }
      }
    }
  }
  _isActiveAction(e) {
    const t = e._cacheIndex;
    return t !== null && t < this._nActiveActions
  }
  _addInactiveAction(e, t, n) {
    const i = this._actions,
      r = this._actionsByClip;
    let a = r[t];
    if (a === void 0) a = {
      knownActions: [e],
      actionByRoot: {}
    }, e._byClipCacheIndex = 0, r[t] = a;
    else {
      const o = a.knownActions;
      e._byClipCacheIndex = o.length, o.push(e)
    }
    e._cacheIndex = i.length, i.push(e), a.actionByRoot[n] = e
  }
  _removeInactiveAction(e) {
    const t = this._actions,
      n = t[t.length - 1],
      i = e._cacheIndex;
    n._cacheIndex = i, t[i] = n, t.pop(), e._cacheIndex = null;
    const r = e._clip.uuid,
      a = this._actionsByClip,
      o = a[r],
      l = o.knownActions,
      c = l[l.length - 1],
      h = e._byClipCacheIndex;
    c._byClipCacheIndex = h, l[h] = c, l.pop(), e._byClipCacheIndex = null;
    const u = o.actionByRoot,
      d = (e._localRoot || this._root).uuid;
    delete u[d], l.length === 0 && delete a[r], this._removeInactiveBindingsForAction(e)
  }
  _removeInactiveBindingsForAction(e) {
    const t = e._propertyBindings;
    for (let n = 0, i = t.length; n !== i; ++n) {
      const r = t[n];
      --r.referenceCount === 0 && this._removeInactiveBinding(r)
    }
  }
  _lendAction(e) {
    const t = this._actions,
      n = e._cacheIndex,
      i = this._nActiveActions++,
      r = t[i];
    e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
  }
  _takeBackAction(e) {
    const t = this._actions,
      n = e._cacheIndex,
      i = --this._nActiveActions,
      r = t[i];
    e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
  }
  _addInactiveBinding(e, t, n) {
    const i = this._bindingsByRootAndName,
      r = this._bindings;
    let a = i[t];
    a === void 0 && (a = {}, i[t] = a), a[n] = e, e._cacheIndex = r.length, r.push(e)
  }
  _removeInactiveBinding(e) {
    const t = this._bindings,
      n = e.binding,
      i = n.rootNode.uuid,
      r = n.path,
      a = this._bindingsByRootAndName,
      o = a[i],
      l = t[t.length - 1],
      c = e._cacheIndex;
    l._cacheIndex = c, t[c] = l, t.pop(), delete o[r], Object.keys(o).length === 0 && delete a[i]
  }
  _lendBinding(e) {
    const t = this._bindings,
      n = e._cacheIndex,
      i = this._nActiveBindings++,
      r = t[i];
    e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
  }
  _takeBackBinding(e) {
    const t = this._bindings,
      n = e._cacheIndex,
      i = --this._nActiveBindings,
      r = t[i];
    e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
  }
  _lendControlInterpolant() {
    const e = this._controlInterpolants,
      t = this._nActiveControlInterpolants++;
    let n = e[t];
    return n === void 0 && (n = new Jh(new Float32Array(2), new Float32Array(2), 1, Lp), n.__cacheIndex = t, e[t] = n), n
  }
  _takeBackControlInterpolant(e) {
    const t = this._controlInterpolants,
      n = e.__cacheIndex,
      i = --this._nActiveControlInterpolants,
      r = t[i];
    e.__cacheIndex = i, t[i] = e, r.__cacheIndex = n, t[n] = r
  }
  clipAction(e, t, n) {
    const i = t || this._root,
      r = i.uuid;
    let a = typeof e == "string" ? vo.findByName(i, e) : e;
    const o = a !== null ? a.uuid : e,
      l = this._actionsByClip[o];
    let c = null;
    if (n === void 0 && (a !== null ? n = a.blendMode : n = Uo), l !== void 0) {
      const u = l.actionByRoot[r];
      if (u !== void 0 && u.blendMode === n) return u;
      c = l.knownActions[0], a === null && (a = c._clip)
    }
    if (a === null) return null;
    const h = new Cp(this, a, t, n);
    return this._bindAction(h, c), this._addInactiveAction(h, o, r), h
  }
  existingAction(e, t) {
    const n = t || this._root,
      i = n.uuid,
      r = typeof e == "string" ? vo.findByName(n, e) : e,
      a = r ? r.uuid : e,
      o = this._actionsByClip[a];
    return o !== void 0 && o.actionByRoot[i] || null
  }
  stopAllAction() {
    const e = this._actions,
      t = this._nActiveActions;
    for (let n = t - 1; n >= 0; --n) e[n].stop();
    return this
  }
  update(e) {
    e *= this.timeScale;
    const t = this._actions,
      n = this._nActiveActions,
      i = this.time += e,
      r = Math.sign(e),
      a = this._accuIndex ^= 1;
    for (let c = 0; c !== n; ++c) t[c]._update(i, e, r, a);
    const o = this._bindings,
      l = this._nActiveBindings;
    for (let c = 0; c !== l; ++c) o[c].apply(a);
    return this
  }
  setTime(e) {
    this.time = 0;
    for (let t = 0; t < this._actions.length; t++) this._actions[t].time = 0;
    return this.update(e)
  }
  getRoot() {
    return this._root
  }
  uncacheClip(e) {
    const t = this._actions,
      n = e.uuid,
      i = this._actionsByClip,
      r = i[n];
    if (r !== void 0) {
      const a = r.knownActions;
      for (let o = 0, l = a.length; o !== l; ++o) {
        const c = a[o];
        this._deactivateAction(c);
        const h = c._cacheIndex,
          u = t[t.length - 1];
        c._cacheIndex = null, c._byClipCacheIndex = null, u._cacheIndex = h, t[h] = u, t.pop(), this._removeInactiveBindingsForAction(c)
      }
      delete i[n]
    }
  }
  uncacheRoot(e) {
    const t = e.uuid,
      n = this._actionsByClip;
    for (const a in n) {
      const o = n[a].actionByRoot,
        l = o[t];
      l !== void 0 && (this._deactivateAction(l), this._removeInactiveAction(l))
    }
    const i = this._bindingsByRootAndName,
      r = i[t];
    if (r !== void 0)
      for (const a in r) {
        const o = r[a];
        o.restoreOriginalState(), this._removeInactiveBinding(o)
      }
  }
  uncacheAction(e, t) {
    const n = this.existingAction(e, t);
    n !== null && (this._deactivateAction(n), this._removeInactiveAction(n))
  }
}
const xc = new We;
class Bv {
  constructor(e, t, n = 0, i = 1 / 0) {
    this.ray = new Ds(e, t), this.near = n, this.far = i, this.camera = null, this.layers = new ko, this.params = {
      Mesh: {},
      Line: {
        threshold: 1
      },
      LOD: {},
      Points: {
        threshold: 1
      },
      Sprite: {}
    }
  }
  set(e, t) {
    this.ray.set(e, t)
  }
  setFromCamera(e, t) {
    t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, .5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, t.projectionMatrix.elements[14]).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : ze("Raycaster: Unsupported camera type: " + t.type)
  }
  setFromXRController(e) {
    return xc.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(xc), this
  }
  intersectObject(e, t = !0, n = []) {
    return yo(e, this, n, t), n.sort(vc), n
  }
  intersectObjects(e, t = !0, n = []) {
    for (let i = 0, r = e.length; i < r; i++) yo(e[i], this, n, t);
    return n.sort(vc), n
  }
}

function vc(s, e) {
  return s.distance - e.distance
}

function yo(s, e, t, n) {
  let i = !0;
  if (s.layers.test(e.layers) && s.raycast(e, t) === !1 && (i = !1), i === !0 && n === !0) {
    const r = s.children;
    for (let a = 0, o = r.length; a < o; a++) yo(r[a], e, t, !0)
  }
}
class zv {
  constructor(e = !0) {
    this.autoStart = e, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1, Ce("Clock: This module has been deprecated. Please use THREE.Timer instead.")
  }
  start() {
    this.startTime = performance.now(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = !0
  }
  stop() {
    this.getElapsedTime(), this.running = !1, this.autoStart = !1
  }
  getElapsedTime() {
    return this.getDelta(), this.elapsedTime
  }
  getDelta() {
    let e = 0;
    if (this.autoStart && !this.running) return this.start(), 0;
    if (this.running) {
      const t = performance.now();
      e = (t - this.oldTime) / 1e3, this.oldTime = t, this.elapsedTime += e
    }
    return e
  }
}
const dr = new un;
class kv extends Rh {
  constructor(e, t = 16776960) {
    const n = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]),
      i = new Float32Array(8 * 3),
      r = new wt;
    r.setIndex(new Ft(n, 1)), r.setAttribute("position", new Ft(i, 3)), super(r, new Xo({
      color: t,
      toneMapped: !1
    })), this.object = e, this.type = "BoxHelper", this.matrixAutoUpdate = !1, this.update()
  }
  update() {
    if (this.object !== void 0 && dr.setFromObject(this.object), dr.isEmpty()) return;
    const e = dr.min,
      t = dr.max,
      n = this.geometry.attributes.position,
      i = n.array;
    i[0] = t.x, i[1] = t.y, i[2] = t.z, i[3] = e.x, i[4] = t.y, i[5] = t.z, i[6] = e.x, i[7] = e.y, i[8] = t.z, i[9] = t.x, i[10] = e.y, i[11] = t.z, i[12] = t.x, i[13] = t.y, i[14] = e.z, i[15] = e.x, i[16] = t.y, i[17] = e.z, i[18] = e.x, i[19] = e.y, i[20] = e.z, i[21] = t.x, i[22] = e.y, i[23] = e.z, n.needsUpdate = !0, this.geometry.computeBoundingSphere()
  }
  setFromObject(e) {
    return this.object = e, this.update(), this
  }
  copy(e, t) {
    return super.copy(e, t), this.object = e.object, this
  }
  dispose() {
    super.dispose(), this.geometry.dispose(), this.material.dispose()
  }
}

function Mc(s, e, t, n) {
  const i = Ip(n);
  switch (t) {
    case uh:
      return s * e;
    case Po:
      return s * e / i.components * i.byteLength;
    case Io:
      return s * e / i.components * i.byteLength;
    case ui:
      return s * e * 2 / i.components * i.byteLength;
    case No:
      return s * e * 2 / i.components * i.byteLength;
    case dh:
      return s * e * 3 / i.components * i.byteLength;
    case ln:
      return s * e * 4 / i.components * i.byteLength;
    case Do:
      return s * e * 4 / i.components * i.byteLength;
    case _r:
    case xr:
      return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case vr:
    case Mr:
      return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case Ba:
    case ka:
      return Math.max(s, 16) * Math.max(e, 8) / 4;
    case Oa:
    case za:
      return Math.max(s, 8) * Math.max(e, 8) / 2;
    case Ha:
    case Ga:
    case Wa:
    case Xa:
      return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case Va:
    case Tr:
    case qa:
      return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case Ya:
      return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case Ka:
      return Math.floor((s + 4) / 5) * Math.floor((e + 3) / 4) * 16;
    case Ja:
      return Math.floor((s + 4) / 5) * Math.floor((e + 4) / 5) * 16;
    case Za:
      return Math.floor((s + 5) / 6) * Math.floor((e + 4) / 5) * 16;
    case $a:
      return Math.floor((s + 5) / 6) * Math.floor((e + 5) / 6) * 16;
    case Qa:
      return Math.floor((s + 7) / 8) * Math.floor((e + 4) / 5) * 16;
    case ja:
      return Math.floor((s + 7) / 8) * Math.floor((e + 5) / 6) * 16;
    case eo:
      return Math.floor((s + 7) / 8) * Math.floor((e + 7) / 8) * 16;
    case to:
      return Math.floor((s + 9) / 10) * Math.floor((e + 4) / 5) * 16;
    case no:
      return Math.floor((s + 9) / 10) * Math.floor((e + 5) / 6) * 16;
    case io:
      return Math.floor((s + 9) / 10) * Math.floor((e + 7) / 8) * 16;
    case so:
      return Math.floor((s + 9) / 10) * Math.floor((e + 9) / 10) * 16;
    case ro:
      return Math.floor((s + 11) / 12) * Math.floor((e + 9) / 10) * 16;
    case ao:
      return Math.floor((s + 11) / 12) * Math.floor((e + 11) / 12) * 16;
    case oo:
    case lo:
    case co:
      return Math.ceil(s / 4) * Math.ceil(e / 4) * 16;
    case ho:
    case uo:
      return Math.ceil(s / 4) * Math.ceil(e / 4) * 8;
    case Er:
    case fo:
      return Math.ceil(s / 4) * Math.ceil(e / 4) * 16
  }
  throw new Error(`Unable to determine texture byte length for ${t} format.`)
}

function Ip(s) {
  switch (s) {
    case Jt:
    case oh:
      return {
        byteLength: 1, components: 1
      };
    case Ss:
    case lh:
    case yn:
      return {
        byteLength: 2, components: 1
      };
    case Co:
    case Lo:
      return {
        byteLength: 2, components: 4
      };
    case Sn:
    case Ro:
    case jt:
      return {
        byteLength: 4, components: 1
      };
    case ch:
    case hh:
      return {
        byteLength: 4, components: 3
      }
  }
  throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", {
  detail: {
    revision: wo
  }
}));
typeof window < "u" && (window.__THREE__ ? Ce("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = wo);
/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
function eu() {
  let s = null,
    e = !1,
    t = null,
    n = null;

  function i(r, a) {
    n = s.requestAnimationFrame(i), t(r, a)
  }
  return {
    start: function() {
      e !== !0 && t !== null && s !== null && (n = s.requestAnimationFrame(i), e = !0)
    },
    stop: function() {
      s !== null && s.cancelAnimationFrame(n), e = !1
    },
    setAnimationLoop: function(r) {
      t = r
    },
    setContext: function(r) {
      s = r
    }
  }
}

function Np(s) {
  const e = new WeakMap;

  function t(o, l) {
    const c = o.array,
      h = o.usage,
      u = c.byteLength,
      d = s.createBuffer();
    s.bindBuffer(l, d), s.bufferData(l, c, h), o.onUploadCallback();
    let f;
    if (c instanceof Float32Array) f = s.FLOAT;
    else if (typeof Float16Array < "u" && c instanceof Float16Array) f = s.HALF_FLOAT;
    else if (c instanceof Uint16Array) o.isFloat16BufferAttribute ? f = s.HALF_FLOAT : f = s.UNSIGNED_SHORT;
    else if (c instanceof Int16Array) f = s.SHORT;
    else if (c instanceof Uint32Array) f = s.UNSIGNED_INT;
    else if (c instanceof Int32Array) f = s.INT;
    else if (c instanceof Int8Array) f = s.BYTE;
    else if (c instanceof Uint8Array) f = s.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray) f = s.UNSIGNED_BYTE;
    else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return {
      buffer: d,
      type: f,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: o.version,
      size: u
    }
  }

  function n(o, l, c) {
    const h = l.array,
      u = l.updateRanges;
    if (s.bindBuffer(c, o), u.length === 0) s.bufferSubData(c, 0, h);
    else {
      u.sort((f, p) => f.start - p.start);
      let d = 0;
      for (let f = 1; f < u.length; f++) {
        const p = u[d],
          x = u[f];
        x.start <= p.start + p.count + 1 ? p.count = Math.max(p.count, x.start + x.count - p.start) : (++d, u[d] = x)
      }
      u.length = d + 1;
      for (let f = 0, p = u.length; f < p; f++) {
        const x = u[f];
        s.bufferSubData(c, x.start * h.BYTES_PER_ELEMENT, h, x.start, x.count)
      }
      l.clearUpdateRanges()
    }
    l.onUploadCallback()
  }

  function i(o) {
    return o.isInterleavedBufferAttribute && (o = o.data), e.get(o)
  }

  function r(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const l = e.get(o);
    l && (s.deleteBuffer(l.buffer), e.delete(o))
  }

  function a(o, l) {
    if (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute) {
      const h = e.get(o);
      (!h || h.version < o.version) && e.set(o, {
        buffer: o.buffer,
        type: o.type,
        bytesPerElement: o.elementSize,
        version: o.version
      });
      return
    }
    const c = e.get(o);
    if (c === void 0) e.set(o, t(o, l));
    else if (c.version < o.version) {
      if (c.size !== o.array.byteLength) throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      n(c.buffer, o, l), c.version = o.version
    }
  }
  return {
    get: i,
    remove: r,
    update: a
  }
}
var Dp = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,
  Up = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,
  Fp = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,
  Op = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  Bp = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,
  zp = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
  kp = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
  Hp = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
  Gp = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,
  Vp = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,
  Wp = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,
  Xp = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
  qp = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,
  Yp = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
  Kp = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
  Jp = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,
  Zp = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
  $p = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
  Qp = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
  jp = `#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,
  em = `#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,
  tm = `#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,
  nm = `#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,
  im = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,
  sm = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,
  rm = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
  am = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,
  om = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
  lm = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
  cm = "gl_FragColor = linearToOutputTexel( gl_FragColor );",
  hm = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
  um = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,
  dm = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,
  fm = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
  pm = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
  mm = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
  gm = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
  _m = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
  xm = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
  vm = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
  Mm = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
  Sm = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
  ym = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
  Tm = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
  Em = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,
  bm = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,
  Am = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
  wm = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
  Rm = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
  Cm = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
  Lm = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,
  Pm = `uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
  Im = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
  Nm = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
  Dm = `#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,
  Um = `#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,
  Fm = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
  Om = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  Bm = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  zm = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,
  km = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
  Hm = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
  Gm = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
  Vm = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  Wm = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
  Xm = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
  qm = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,
  Ym = `#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
  Km = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  Jm = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,
  Zm = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  $m = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,
  Qm = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
  jm = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  eg = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  tg = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,
  ng = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,
  ig = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,
  sg = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,
  rg = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,
  ag = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
  og = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
  lg = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,
  cg = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
  hg = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
  ug = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
  dg = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
  fg = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
  pg = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
  mg = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,
  gg = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
  _g = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
  xg = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
  vg = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
  Mg = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,
  Sg = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
  yg = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
  Tg = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
  Eg = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
  bg = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
  Ag = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
  wg = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,
  Rg = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,
  Cg = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  Lg = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  Pg = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,
  Ig = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const Ng = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
  Dg = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  Ug = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  Fg = `uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  Og = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  Bg = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  zg = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
  kg = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,
  Hg = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
  Gg = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,
  Vg = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
  Wg = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  Xg = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  qg = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  Yg = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
  Kg = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Jg = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Zg = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  $g = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
  Qg = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  jg = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
  e_ = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
  t_ = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  n_ = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  i_ = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
  s_ = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  r_ = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  a_ = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  o_ = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
  l_ = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  c_ = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  h_ = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  u_ = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  d_ = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  Ye = {
    alphahash_fragment: Dp,
    alphahash_pars_fragment: Up,
    alphamap_fragment: Fp,
    alphamap_pars_fragment: Op,
    alphatest_fragment: Bp,
    alphatest_pars_fragment: zp,
    aomap_fragment: kp,
    aomap_pars_fragment: Hp,
    batching_pars_vertex: Gp,
    batching_vertex: Vp,
    begin_vertex: Wp,
    beginnormal_vertex: Xp,
    bsdfs: qp,
    iridescence_fragment: Yp,
    bumpmap_pars_fragment: Kp,
    clipping_planes_fragment: Jp,
    clipping_planes_pars_fragment: Zp,
    clipping_planes_pars_vertex: $p,
    clipping_planes_vertex: Qp,
    color_fragment: jp,
    color_pars_fragment: em,
    color_pars_vertex: tm,
    color_vertex: nm,
    common: im,
    defaultnormal_vertex: sm,
    displacementmap_pars_vertex: rm,
    displacementmap_vertex: am,
    emissivemap_fragment: om,
    emissivemap_pars_fragment: lm,
    colorspace_fragment: cm,
    colorspace_pars_fragment: hm,
    envmap_fragment: um,
    envmap_common_pars_fragment: dm,
    envmap_pars_fragment: fm,
    envmap_pars_vertex: pm,
    envmap_physical_pars_fragment: bm,
    envmap_vertex: mm,
    fog_vertex: gm,
    fog_pars_vertex: _m,
    fog_fragment: xm,
    fog_pars_fragment: vm,
    gradientmap_pars_fragment: Mm,
    lightmap_pars_fragment: Sm,
    lights_lambert_fragment: ym,
    lights_lambert_pars_fragment: Tm,
    lights_pars_begin: Em,
    lights_toon_fragment: Am,
    lights_toon_pars_fragment: wm,
    lights_phong_fragment: Rm,
    lights_phong_pars_fragment: Cm,
    lights_physical_fragment: Lm,
    lights_physical_pars_fragment: Pm,
    lights_fragment_begin: Im,
    lights_fragment_maps: Nm,
    lights_fragment_end: Dm,
    lightprobes_pars_fragment: Um,
    logdepthbuf_fragment: Fm,
    logdepthbuf_pars_fragment: Om,
    logdepthbuf_pars_vertex: Bm,
    logdepthbuf_vertex: zm,
    map_fragment: km,
    map_pars_fragment: Hm,
    map_particle_fragment: Gm,
    map_particle_pars_fragment: Vm,
    metalnessmap_fragment: Wm,
    metalnessmap_pars_fragment: Xm,
    morphinstance_vertex: qm,
    morphcolor_vertex: Ym,
    morphnormal_vertex: Km,
    morphtarget_pars_vertex: Jm,
    morphtarget_vertex: Zm,
    normal_fragment_begin: $m,
    normal_fragment_maps: Qm,
    normal_pars_fragment: jm,
    normal_pars_vertex: eg,
    normal_vertex: tg,
    normalmap_pars_fragment: ng,
    clearcoat_normal_fragment_begin: ig,
    clearcoat_normal_fragment_maps: sg,
    clearcoat_pars_fragment: rg,
    iridescence_pars_fragment: ag,
    opaque_fragment: og,
    packing: lg,
    premultiplied_alpha_fragment: cg,
    project_vertex: hg,
    dithering_fragment: ug,
    dithering_pars_fragment: dg,
    roughnessmap_fragment: fg,
    roughnessmap_pars_fragment: pg,
    shadowmap_pars_fragment: mg,
    shadowmap_pars_vertex: gg,
    shadowmap_vertex: _g,
    shadowmask_pars_fragment: xg,
    skinbase_vertex: vg,
    skinning_pars_vertex: Mg,
    skinning_vertex: Sg,
    skinnormal_vertex: yg,
    specularmap_fragment: Tg,
    specularmap_pars_fragment: Eg,
    tonemapping_fragment: bg,
    tonemapping_pars_fragment: Ag,
    transmission_fragment: wg,
    transmission_pars_fragment: Rg,
    uv_pars_fragment: Cg,
    uv_pars_vertex: Lg,
    uv_vertex: Pg,
    worldpos_vertex: Ig,
    background_vert: Ng,
    background_frag: Dg,
    backgroundCube_vert: Ug,
    backgroundCube_frag: Fg,
    cube_vert: Og,
    cube_frag: Bg,
    depth_vert: zg,
    depth_frag: kg,
    distance_vert: Hg,
    distance_frag: Gg,
    equirect_vert: Vg,
    equirect_frag: Wg,
    linedashed_vert: Xg,
    linedashed_frag: qg,
    meshbasic_vert: Yg,
    meshbasic_frag: Kg,
    meshlambert_vert: Jg,
    meshlambert_frag: Zg,
    meshmatcap_vert: $g,
    meshmatcap_frag: Qg,
    meshnormal_vert: jg,
    meshnormal_frag: e_,
    meshphong_vert: t_,
    meshphong_frag: n_,
    meshphysical_vert: i_,
    meshphysical_frag: s_,
    meshtoon_vert: r_,
    meshtoon_frag: a_,
    points_vert: o_,
    points_frag: l_,
    shadow_vert: c_,
    shadow_frag: h_,
    sprite_vert: u_,
    sprite_frag: d_
  },
  Me = {
    common: {
      diffuse: {
        value: new Fe(16777215)
      },
      opacity: {
        value: 1
      },
      map: {
        value: null
      },
      mapTransform: {
        value: new He
      },
      alphaMap: {
        value: null
      },
      alphaMapTransform: {
        value: new He
      },
      alphaTest: {
        value: 0
      }
    },
    specularmap: {
      specularMap: {
        value: null
      },
      specularMapTransform: {
        value: new He
      }
    },
    envmap: {
      envMap: {
        value: null
      },
      envMapRotation: {
        value: new He
      },
      reflectivity: {
        value: 1
      },
      ior: {
        value: 1.5
      },
      refractionRatio: {
        value: .98
      },
      dfgLUT: {
        value: null
      }
    },
    aomap: {
      aoMap: {
        value: null
      },
      aoMapIntensity: {
        value: 1
      },
      aoMapTransform: {
        value: new He
      }
    },
    lightmap: {
      lightMap: {
        value: null
      },
      lightMapIntensity: {
        value: 1
      },
      lightMapTransform: {
        value: new He
      }
    },
    bumpmap: {
      bumpMap: {
        value: null
      },
      bumpMapTransform: {
        value: new He
      },
      bumpScale: {
        value: 1
      }
    },
    normalmap: {
      normalMap: {
        value: null
      },
      normalMapTransform: {
        value: new He
      },
      normalScale: {
        value: new re(1, 1)
      }
    },
    displacementmap: {
      displacementMap: {
        value: null
      },
      displacementMapTransform: {
        value: new He
      },
      displacementScale: {
        value: 1
      },
      displacementBias: {
        value: 0
      }
    },
    emissivemap: {
      emissiveMap: {
        value: null
      },
      emissiveMapTransform: {
        value: new He
      }
    },
    metalnessmap: {
      metalnessMap: {
        value: null
      },
      metalnessMapTransform: {
        value: new He
      }
    },
    roughnessmap: {
      roughnessMap: {
        value: null
      },
      roughnessMapTransform: {
        value: new He
      }
    },
    gradientmap: {
      gradientMap: {
        value: null
      }
    },
    fog: {
      fogDensity: {
        value: 25e-5
      },
      fogNear: {
        value: 1
      },
      fogFar: {
        value: 2e3
      },
      fogColor: {
        value: new Fe(16777215)
      }
    },
    lights: {
      ambientLightColor: {
        value: []
      },
      lightProbe: {
        value: []
      },
      sunLights: {
        value: [],
        properties: {
          direction: {},
          color: {}
        }
      },
      sunLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {}
        }
      },
      sunShadowMatrix: {
        value: []
      },
      sunShadowCascade: {
        value: []
      },
      directionalLights: {
        value: [],
        properties: {
          direction: {},
          color: {}
        }
      },
      directionalLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {}
        }
      },
      directionalShadowMatrix: {
        value: []
      },
      spotLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          direction: {},
          distance: {},
          coneCos: {},
          penumbraCos: {},
          decay: {}
        }
      },
      spotLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {}
        }
      },
      spotLightMap: {
        value: []
      },
      spotLightMatrix: {
        value: []
      },
      pointLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          decay: {},
          distance: {}
        }
      },
      pointLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
          shadowCameraNear: {},
          shadowCameraFar: {}
        }
      },
      pointShadowMatrix: {
        value: []
      },
      hemisphereLights: {
        value: [],
        properties: {
          direction: {},
          skyColor: {},
          groundColor: {}
        }
      },
      rectAreaLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          width: {},
          height: {}
        }
      },
      ltc_1: {
        value: null
      },
      ltc_2: {
        value: null
      },
      probesSH: {
        value: []
      },
      probesMin: {
        value: []
      },
      probesMax: {
        value: []
      },
      probesResolution: {
        value: []
      }
    },
    points: {
      diffuse: {
        value: new Fe(16777215)
      },
      opacity: {
        value: 1
      },
      size: {
        value: 1
      },
      scale: {
        value: 1
      },
      map: {
        value: null
      },
      alphaMap: {
        value: null
      },
      alphaMapTransform: {
        value: new He
      },
      alphaTest: {
        value: 0
      },
      uvTransform: {
        value: new He
      }
    },
    sprite: {
      diffuse: {
        value: new Fe(16777215)
      },
      opacity: {
        value: 1
      },
      center: {
        value: new re(.5, .5)
      },
      rotation: {
        value: 0
      },
      map: {
        value: null
      },
      mapTransform: {
        value: new He
      },
      alphaMap: {
        value: null
      },
      alphaMapTransform: {
        value: new He
      },
      alphaTest: {
        value: 0
      }
    }
  },
  _n = {
    basic: {
      uniforms: Vt([Me.common, Me.specularmap, Me.envmap, Me.aomap, Me.lightmap, Me.fog]),
      vertexShader: Ye.meshbasic_vert,
      fragmentShader: Ye.meshbasic_frag
    },
    lambert: {
      uniforms: Vt([Me.common, Me.specularmap, Me.envmap, Me.aomap, Me.lightmap, Me.emissivemap, Me.bumpmap, Me.normalmap, Me.displacementmap, Me.fog, Me.lights, {
        emissive: {
          value: new Fe(0)
        },
        envMapIntensity: {
          value: 1
        }
      }]),
      vertexShader: Ye.meshlambert_vert,
      fragmentShader: Ye.meshlambert_frag
    },
    phong: {
      uniforms: Vt([Me.common, Me.specularmap, Me.envmap, Me.aomap, Me.lightmap, Me.emissivemap, Me.bumpmap, Me.normalmap, Me.displacementmap, Me.fog, Me.lights, {
        emissive: {
          value: new Fe(0)
        },
        specular: {
          value: new Fe(1118481)
        },
        shininess: {
          value: 30
        },
        envMapIntensity: {
          value: 1
        }
      }]),
      vertexShader: Ye.meshphong_vert,
      fragmentShader: Ye.meshphong_frag
    },
    standard: {
      uniforms: Vt([Me.common, Me.envmap, Me.aomap, Me.lightmap, Me.emissivemap, Me.bumpmap, Me.normalmap, Me.displacementmap, Me.roughnessmap, Me.metalnessmap, Me.fog, Me.lights, {
        emissive: {
          value: new Fe(0)
        },
        roughness: {
          value: 1
        },
        metalness: {
          value: 0
        },
        envMapIntensity: {
          value: 1
        }
      }]),
      vertexShader: Ye.meshphysical_vert,
      fragmentShader: Ye.meshphysical_frag
    },
    toon: {
      uniforms: Vt([Me.common, Me.aomap, Me.lightmap, Me.emissivemap, Me.bumpmap, Me.normalmap, Me.displacementmap, Me.gradientmap, Me.fog, Me.lights, {
        emissive: {
          value: new Fe(0)
        }
      }]),
      vertexShader: Ye.meshtoon_vert,
      fragmentShader: Ye.meshtoon_frag
    },
    matcap: {
      uniforms: Vt([Me.common, Me.bumpmap, Me.normalmap, Me.displacementmap, Me.fog, {
        matcap: {
          value: null
        }
      }]),
      vertexShader: Ye.meshmatcap_vert,
      fragmentShader: Ye.meshmatcap_frag
    },
    points: {
      uniforms: Vt([Me.points, Me.fog]),
      vertexShader: Ye.points_vert,
      fragmentShader: Ye.points_frag
    },
    dashed: {
      uniforms: Vt([Me.common, Me.fog, {
        scale: {
          value: 1
        },
        dashSize: {
          value: 1
        },
        totalSize: {
          value: 2
        }
      }]),
      vertexShader: Ye.linedashed_vert,
      fragmentShader: Ye.linedashed_frag
    },
    depth: {
      uniforms: Vt([Me.common, Me.displacementmap]),
      vertexShader: Ye.depth_vert,
      fragmentShader: Ye.depth_frag
    },
    normal: {
      uniforms: Vt([Me.common, Me.bumpmap, Me.normalmap, Me.displacementmap, {
        opacity: {
          value: 1
        }
      }]),
      vertexShader: Ye.meshnormal_vert,
      fragmentShader: Ye.meshnormal_frag
    },
    sprite: {
      uniforms: Vt([Me.sprite, Me.fog]),
      vertexShader: Ye.sprite_vert,
      fragmentShader: Ye.sprite_frag
    },
    background: {
      uniforms: {
        uvTransform: {
          value: new He
        },
        t2D: {
          value: null
        },
        backgroundIntensity: {
          value: 1
        }
      },
      vertexShader: Ye.background_vert,
      fragmentShader: Ye.background_frag
    },
    backgroundCube: {
      uniforms: {
        envMap: {
          value: null
        },
        backgroundBlurriness: {
          value: 0
        },
        backgroundIntensity: {
          value: 1
        },
        backgroundRotation: {
          value: new He
        }
      },
      vertexShader: Ye.backgroundCube_vert,
      fragmentShader: Ye.backgroundCube_frag
    },
    cube: {
      uniforms: {
        tCube: {
          value: null
        },
        tFlip: {
          value: -1
        },
        opacity: {
          value: 1
        }
      },
      vertexShader: Ye.cube_vert,
      fragmentShader: Ye.cube_frag
    },
    equirect: {
      uniforms: {
        tEquirect: {
          value: null
        }
      },
      vertexShader: Ye.equirect_vert,
      fragmentShader: Ye.equirect_frag
    },
    distance: {
      uniforms: Vt([Me.common, Me.displacementmap, {
        referencePosition: {
          value: new N
        },
        nearDistance: {
          value: 1
        },
        farDistance: {
          value: 1e3
        }
      }]),
      vertexShader: Ye.distance_vert,
      fragmentShader: Ye.distance_frag
    },
    shadow: {
      uniforms: Vt([Me.lights, Me.fog, {
        color: {
          value: new Fe(0)
        },
        opacity: {
          value: 1
        }
      }]),
      vertexShader: Ye.shadow_vert,
      fragmentShader: Ye.shadow_frag
    }
  };
_n.physical = {
  uniforms: Vt([_n.standard.uniforms, {
    clearcoat: {
      value: 0
    },
    clearcoatMap: {
      value: null
    },
    clearcoatMapTransform: {
      value: new He
    },
    clearcoatNormalMap: {
      value: null
    },
    clearcoatNormalMapTransform: {
      value: new He
    },
    clearcoatNormalScale: {
      value: new re(1, 1)
    },
    clearcoatRoughness: {
      value: 0
    },
    clearcoatRoughnessMap: {
      value: null
    },
    clearcoatRoughnessMapTransform: {
      value: new He
    },
    diffuseRoughness: {
      value: 0
    },
    diffuseRoughnessMap: {
      value: null
    },
    diffuseRoughnessMapTransform: {
      value: new He
    },
    dispersion: {
      value: 0
    },
    retroreflectivity: {
      value: 0
    },
    iridescence: {
      value: 0
    },
    iridescenceMap: {
      value: null
    },
    iridescenceMapTransform: {
      value: new He
    },
    iridescenceIOR: {
      value: 1.3
    },
    iridescenceThicknessMinimum: {
      value: 100
    },
    iridescenceThicknessMaximum: {
      value: 400
    },
    iridescenceThicknessMap: {
      value: null
    },
    iridescenceThicknessMapTransform: {
      value: new He
    },
    sheen: {
      value: 0
    },
    sheenColor: {
      value: new Fe(0)
    },
    sheenColorMap: {
      value: null
    },
    sheenColorMapTransform: {
      value: new He
    },
    sheenRoughness: {
      value: 1
    },
    sheenRoughnessMap: {
      value: null
    },
    sheenRoughnessMapTransform: {
      value: new He
    },
    transmission: {
      value: 0
    },
    transmissionMap: {
      value: null
    },
    transmissionMapTransform: {
      value: new He
    },
    transmissionSamplerSize: {
      value: new re
    },
    transmissionSamplerMap: {
      value: null
    },
    thickness: {
      value: 0
    },
    thicknessMap: {
      value: null
    },
    thicknessMapTransform: {
      value: new He
    },
    attenuationDistance: {
      value: 0
    },
    attenuationColor: {
      value: new Fe(0)
    },
    specularColor: {
      value: new Fe(1, 1, 1)
    },
    specularColorMap: {
      value: null
    },
    specularColorMapTransform: {
      value: new He
    },
    specularIntensity: {
      value: 1
    },
    specularIntensityMap: {
      value: null
    },
    specularIntensityMapTransform: {
      value: new He
    },
    anisotropyVector: {
      value: new re
    },
    anisotropyMap: {
      value: null
    },
    anisotropyMapTransform: {
      value: new He
    }
  }]),
  vertexShader: Ye.meshphysical_vert,
  fragmentShader: Ye.meshphysical_frag
};
const fr = {
    r: 0,
    b: 0,
    g: 0
  },
  f_ = new We,
  tu = new He;
tu.set(-1, 0, 0, 0, 1, 0, 0, 0, 1);

function p_(s, e, t, n, i, r) {
  const a = new Fe(0);
  let o = i === !0 ? 0 : 1,
    l, c, h = null,
    u = 0,
    d = null;

  function f(M) {
    let E = M.isScene === !0 ? M.background : null;
    if (E && E.isTexture) {
      const v = M.backgroundBlurriness > 0;
      E = e.get(E, v)
    }
    return E
  }

  function p(M) {
    let E = !1;
    const v = f(M);
    v === null ? m(a, o) : v && v.isColor && (m(v, 1), E = !0);
    const A = s.xr.getEnvironmentBlendMode();
    A === "additive" ? t.buffers.color.setClear(0, 0, 0, 1, r) : A === "alpha-blend" && t.buffers.color.setClear(0, 0, 0, 0, r), (s.autoClear || E) && (t.buffers.depth.setTest(!0), t.buffers.depth.setMask(!0), t.buffers.color.setMask(!0), s.clear(s.autoClearColor, s.autoClearDepth, s.autoClearStencil))
  }

  function x(M, E) {
    const v = f(E);
    v && v.isCubeTexture ? (c === void 0 && (c = new At(new qi(1, 1, 1), new fi({
      name: "BackgroundCubeMaterial",
      uniforms: Xi(_n.backgroundCube.uniforms),
      vertexShader: _n.backgroundCube.vertexShader,
      fragmentShader: _n.backgroundCube.fragmentShader,
      side: Wt,
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      allowOverride: !1
    })), c.geometry.deleteAttribute("normal"), c.geometry.deleteAttribute("uv"), c.onBeforeRender = function(A, b, _) {
      this.matrixWorld.copyPosition(_.matrixWorld)
    }, Object.defineProperty(c.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value
      }
    }), n.update(c)), c.material.uniforms.envMap.value = v, c.material.uniforms.backgroundBlurriness.value = E.backgroundBlurriness, c.material.uniforms.backgroundIntensity.value = E.backgroundIntensity, c.material.uniforms.backgroundRotation.value.setFromMatrix4(f_.makeRotationFromEuler(E.backgroundRotation)).transpose(), v.isRenderTargetTexture === !1 && c.material.uniforms.backgroundRotation.value.premultiply(tu), c.material.toneMapped = Qe.getTransfer(v.colorSpace) !== ct, (h !== v || u !== v.version || d !== s.toneMapping) && (c.material.needsUpdate = !0, h = v, u = v.version, d = s.toneMapping), c.layers.enableAll(), M.unshift(c, c.geometry, c.material, 0, 0, null)) : v && v.isTexture && (l === void 0 && (l = new At(new Br(2, 2), new fi({
      name: "BackgroundMaterial",
      uniforms: Xi(_n.background.uniforms),
      vertexShader: _n.background.vertexShader,
      fragmentShader: _n.background.fragmentShader,
      side: $n,
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      allowOverride: !1
    })), l.geometry.deleteAttribute("normal"), Object.defineProperty(l.material, "map", {
      get: function() {
        return this.uniforms.t2D.value
      }
    }), n.update(l)), l.material.uniforms.t2D.value = v, l.material.uniforms.backgroundIntensity.value = E.backgroundIntensity, l.material.toneMapped = Qe.getTransfer(v.colorSpace) !== ct, v.matrixAutoUpdate === !0 && v.updateMatrix(), l.material.uniforms.uvTransform.value.copy(v.matrix), (h !== v || u !== v.version || d !== s.toneMapping) && (l.material.needsUpdate = !0, h = v, u = v.version, d = s.toneMapping), l.layers.enableAll(), M.unshift(l, l.geometry, l.material, 0, 0, null))
  }

  function m(M, E) {
    M.getRGB(fr, Kh(s)), t.buffers.color.setClear(fr.r, fr.g, fr.b, E, r)
  }

  function g() {
    c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0), l !== void 0 && (l.geometry.dispose(), l.material.dispose(), l = void 0)
  }
  return {
    getClearColor: function() {
      return a
    },
    setClearColor: function(M, E = 1) {
      a.set(M), o = E, m(a, o)
    },
    getClearAlpha: function() {
      return o
    },
    setClearAlpha: function(M) {
      o = M, m(a, o)
    },
    render: p,
    addToRenderList: x,
    dispose: g
  }
}

function m_(s, e) {
  const t = s.getParameter(s.MAX_VERTEX_ATTRIBS),
    n = {},
    i = d(null);
  let r = i,
    a = !1;

  function o(D, F, V, L, k) {
    let X = !1;
    const H = u(D, L, V, F);
    r !== H && (r = H, c(r.object)), X = f(D, L, V, k), X && p(D, L, V, k), k !== null && e.update(k, s.ELEMENT_ARRAY_BUFFER), (X || a) && (a = !1, v(D, F, V, L), k !== null && s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, e.get(k).buffer))
  }

  function l() {
    return s.createVertexArray()
  }

  function c(D) {
    return s.bindVertexArray(D)
  }

  function h(D) {
    return s.deleteVertexArray(D)
  }

  function u(D, F, V, L) {
    const k = L.wireframe === !0;
    let X = n[F.id];
    X === void 0 && (X = {}, n[F.id] = X);
    const H = D.isInstancedMesh === !0 ? D.id : 0;
    let te = X[H];
    te === void 0 && (te = {}, X[H] = te);
    let W = te[V.id];
    W === void 0 && (W = {}, te[V.id] = W);
    let Q = W[k];
    return Q === void 0 && (Q = d(l()), W[k] = Q), Q
  }

  function d(D) {
    const F = [],
      V = [],
      L = [];
    for (let k = 0; k < t; k++) F[k] = 0, V[k] = 0, L[k] = 0;
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: F,
      enabledAttributes: V,
      attributeDivisors: L,
      object: D,
      attributes: {},
      index: null
    }
  }

  function f(D, F, V, L) {
    const k = r.attributes,
      X = F.attributes;
    let H = 0;
    const te = V.getAttributes();
    for (const W in te)
      if (te[W].location >= 0) {
        const ee = k[W];
        let Te = X[W];
        if (Te === void 0 && (W === "instanceMatrix" && D.instanceMatrix && (Te = D.instanceMatrix), W === "instanceColor" && D.instanceColor && (Te = D.instanceColor)), ee === void 0 || ee.attribute !== Te || Te && ee.data !== Te.data) return !0;
        H++
      } return r.attributesNum !== H || r.index !== L
  }

  function p(D, F, V, L) {
    const k = {},
      X = F.attributes;
    let H = 0;
    const te = V.getAttributes();
    for (const W in te)
      if (te[W].location >= 0) {
        let ee = X[W];
        ee === void 0 && (W === "instanceMatrix" && D.instanceMatrix && (ee = D.instanceMatrix), W === "instanceColor" && D.instanceColor && (ee = D.instanceColor));
        const Te = {};
        Te.attribute = ee, ee && ee.data && (Te.data = ee.data), k[W] = Te, H++
      } r.attributes = k, r.attributesNum = H, r.index = L
  }

  function x() {
    const D = r.newAttributes;
    for (let F = 0, V = D.length; F < V; F++) D[F] = 0
  }

  function m(D) {
    g(D, 0)
  }

  function g(D, F) {
    const V = r.newAttributes,
      L = r.enabledAttributes,
      k = r.attributeDivisors;
    V[D] = 1, L[D] === 0 && (s.enableVertexAttribArray(D), L[D] = 1), k[D] !== F && (s.vertexAttribDivisor(D, F), k[D] = F)
  }

  function M() {
    const D = r.newAttributes,
      F = r.enabledAttributes;
    for (let V = 0, L = F.length; V < L; V++) F[V] !== D[V] && (s.disableVertexAttribArray(V), F[V] = 0)
  }

  function E(D, F, V, L, k, X, H) {
    H === !0 ? s.vertexAttribIPointer(D, F, V, k, X) : s.vertexAttribPointer(D, F, V, L, k, X)
  }

  function v(D, F, V, L) {
    x();
    const k = L.attributes,
      X = V.getAttributes(),
      H = F.defaultAttributeValues;
    for (const te in X) {
      const W = X[te];
      if (W.location >= 0) {
        let Q = k[te];
        if (Q === void 0 && (te === "instanceMatrix" && D.instanceMatrix && (Q = D.instanceMatrix), te === "instanceColor" && D.instanceColor && (Q = D.instanceColor)), Q !== void 0) {
          const ee = Q.normalized,
            Te = Q.itemSize,
            Oe = e.get(Q);
          if (Oe === void 0) continue;
          const Y = Oe.buffer,
            _e = Oe.type,
            Ee = Oe.bytesPerElement,
            Ne = _e === s.INT || _e === s.UNSIGNED_INT || Q.gpuType === Ro;
          if (Q.isInterleavedBufferAttribute) {
            const xe = Q.data,
              De = xe.isInterleavedBuffer === !0 ? xe.stride : xe.itemSize,
              mt = Q.offset;
            if (xe.isInstancedInterleavedBuffer || xe.isInstancedBufferAttribute) {
              for (let Be = 0; Be < W.locationSize; Be++) g(W.location + Be, xe.meshPerAttribute);
              D.isInstancedMesh !== !0 && L._maxInstanceCount === void 0 && (L._maxInstanceCount = xe.meshPerAttribute * xe.count)
            } else
              for (let Be = 0; Be < W.locationSize; Be++) m(W.location + Be);
            s.bindBuffer(s.ARRAY_BUFFER, Y);
            for (let Be = 0; Be < W.locationSize; Be++) E(W.location + Be, Te / W.locationSize, _e, ee, De * Ee, (mt + Te / W.locationSize * Be) * Ee, Ne)
          } else {
            if (Q.isInstancedBufferAttribute) {
              for (let xe = 0; xe < W.locationSize; xe++) g(W.location + xe, Q.meshPerAttribute);
              D.isInstancedMesh !== !0 && L._maxInstanceCount === void 0 && (L._maxInstanceCount = Q.meshPerAttribute * Q.count)
            } else
              for (let xe = 0; xe < W.locationSize; xe++) m(W.location + xe);
            s.bindBuffer(s.ARRAY_BUFFER, Y);
            for (let xe = 0; xe < W.locationSize; xe++) E(W.location + xe, Te / W.locationSize, _e, ee, Te * Ee, Te / W.locationSize * xe * Ee, Ne)
          }
        } else if (H !== void 0) {
          const ee = H[te];
          if (ee !== void 0) switch (ee.length) {
            case 2:
              s.vertexAttrib2fv(W.location, ee);
              break;
            case 3:
              s.vertexAttrib3fv(W.location, ee);
              break;
            case 4:
              s.vertexAttrib4fv(W.location, ee);
              break;
            default:
              s.vertexAttrib1fv(W.location, ee)
          }
        }
      }
    }
    M()
  }

  function A() {
    I();
    for (const D in n) {
      const F = n[D];
      for (const V in F) {
        const L = F[V];
        for (const k in L) {
          const X = L[k];
          for (const H in X) h(X[H].object), delete X[H];
          delete L[k]
        }
      }
      delete n[D]
    }
  }

  function b(D) {
    if (n[D.id] === void 0) return;
    const F = n[D.id];
    for (const V in F) {
      const L = F[V];
      for (const k in L) {
        const X = L[k];
        for (const H in X) h(X[H].object), delete X[H];
        delete L[k]
      }
    }
    delete n[D.id]
  }

  function _(D) {
    for (const F in n) {
      const V = n[F];
      for (const L in V) {
        const k = V[L];
        if (k[D.id] === void 0) continue;
        const X = k[D.id];
        for (const H in X) h(X[H].object), delete X[H];
        delete k[D.id]
      }
    }
  }

  function T(D) {
    for (const F in n) {
      const V = n[F],
        L = D.isInstancedMesh === !0 ? D.id : 0,
        k = V[L];
      if (k !== void 0) {
        for (const X in k) {
          const H = k[X];
          for (const te in H) h(H[te].object), delete H[te];
          delete k[X]
        }
        delete V[L], Object.keys(V).length === 0 && delete n[F]
      }
    }
  }

  function I() {
    R(), a = !0, r !== i && (r = i, c(r.object))
  }

  function R() {
    i.geometry = null, i.program = null, i.wireframe = !1
  }
  return {
    setup: o,
    reset: I,
    resetDefaultState: R,
    dispose: A,
    releaseStatesOfGeometry: b,
    releaseStatesOfObject: T,
    releaseStatesOfProgram: _,
    initAttributes: x,
    enableAttribute: m,
    disableUnusedAttributes: M
  }
}

function g_(s, e, t) {
  let n;

  function i(l) {
    n = l
  }

  function r(l, c) {
    s.drawArrays(n, l, c), t.update(c, n, 1)
  }

  function a(l, c, h) {
    h !== 0 && (s.drawArraysInstanced(n, l, c, h), t.update(c, n, h))
  }

  function o(l, c, h) {
    if (h === 0) return;
    e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, l, 0, c, 0, h);
    let d = 0;
    for (let f = 0; f < h; f++) d += c[f];
    t.update(d, n, 1)
  }
  this.setMode = i, this.render = r, this.renderInstances = a, this.renderMultiDraw = o
}

function __(s, e, t, n) {
  let i;

  function r() {
    if (i !== void 0) return i;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      const _ = e.get("EXT_texture_filter_anisotropic");
      i = s.getParameter(_.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
    } else i = 0;
    return i
  }

  function a(_) {
    return !(_ !== ln && n.convert(_) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))
  }

  function o(_) {
    const T = _ === yn && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(_ !== Jt && _ !== jt && !T && n.convert(_) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))
  }

  function l(_) {
    if (_ === "highp") {
      if (s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.HIGH_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.HIGH_FLOAT).precision > 0) return "highp";
      _ = "mediump"
    }
    return _ === "mediump" && s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.MEDIUM_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp"
  }
  let c = t.precision !== void 0 ? t.precision : "highp";
  const h = l(c);
  h !== c && (Ce("WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const u = t.reversedDepthBuffer === !0 && e.has("EXT_clip_control"),
    d = t.logarithmicDepthBuffer === !0 && u === !1;
  t.reversedDepthBuffer === !0 && u === !1 && Ce("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."), t.logarithmicDepthBuffer === !0 && u === !0 && Ce("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");
  const f = s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),
    p = s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    x = s.getParameter(s.MAX_TEXTURE_SIZE),
    m = s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),
    g = s.getParameter(s.MAX_VERTEX_ATTRIBS),
    M = s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),
    E = s.getParameter(s.MAX_VARYING_VECTORS),
    v = s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),
    A = s.getParameter(s.MAX_SAMPLES),
    b = s.getParameter(s.SAMPLES);
  return {
    isWebGL2: !0,
    getMaxAnisotropy: r,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: c,
    logarithmicDepthBuffer: d,
    reversedDepthBuffer: u,
    maxTextures: f,
    maxVertexTextures: p,
    maxTextureSize: x,
    maxCubemapSize: m,
    maxAttributes: g,
    maxVertexUniforms: M,
    maxVaryings: E,
    maxFragmentUniforms: v,
    maxSamples: A,
    samples: b
  }
}

function x_(s) {
  const e = this;
  let t = null,
    n = 0,
    i = !1,
    r = !1;
  const a = new Xn,
    o = new He,
    l = {
      value: null,
      needsUpdate: !1
    };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(u, d) {
    const f = u.length !== 0 || d || n !== 0 || i;
    return i = d, n = u.length, f
  }, this.beginShadows = function() {
    r = !0, h(null)
  }, this.endShadows = function() {
    r = !1
  }, this.setGlobalState = function(u, d) {
    t = h(u, d, 0)
  }, this.setState = function(u, d, f) {
    const p = u.clippingPlanes,
      x = u.clipIntersection,
      m = u.clipShadows,
      g = s.get(u);
    if (!i || p === null || p.length === 0 || r && !m) r ? h(null) : c();
    else {
      const M = r ? 0 : n,
        E = M * 4;
      let v = g.clippingState || null;
      l.value = v, v = h(p, d, E, f);
      for (let A = 0; A !== E; ++A) v[A] = t[A];
      g.clippingState = v, this.numIntersection = x ? this.numPlanes : 0, this.numPlanes += M
    }
  };

  function c() {
    l.value !== t && (l.value = t, l.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0
  }

  function h(u, d, f, p) {
    const x = u !== null ? u.length : 0;
    let m = null;
    if (x !== 0) {
      if (m = l.value, p !== !0 || m === null) {
        const g = f + x * 4,
          M = d.matrixWorldInverse;
        o.getNormalMatrix(M), (m === null || m.length < g) && (m = new Float32Array(g));
        for (let E = 0, v = f; E !== x; ++E, v += 4) a.copy(u[E]).applyMatrix4(M, o), a.normal.toArray(m, v), m[v + 3] = a.constant
      }
      l.value = m, l.needsUpdate = !0
    }
    return e.numPlanes = x, e.numIntersection = 0, m
  }
}
class tl extends Mn {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = {
        width: e,
        height: e,
        depth: 1
      },
      i = [n, n, n, n, n, n];
    this.texture = new Ph(i), this._setTextureOptions(t), this.texture.isRenderTargetTexture = !0
  }
  fromEquirectangularTexture(e, t) {
    this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
    const n = {
        uniforms: {
          tEquirect: {
            value: null
          }
        },
        vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
        fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
      },
      i = new qi(5, 5, 5),
      r = new fi({
        name: "CubemapFromEquirect",
        uniforms: Xi(n.uniforms),
        vertexShader: n.vertexShader,
        fragmentShader: n.fragmentShader,
        side: Wt,
        blending: Ui
      });
    r.uniforms.tEquirect.value = t;
    const a = new At(i, r),
      o = t.minFilter;
    return t.minFilter === vn && (t.minFilter = Ct), new So(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this
  }
  clear(e, t = !0, n = !0, i = !0) {
    const r = e.getRenderTarget();
    for (let a = 0; a < 6; a++) e.setRenderTarget(this, a), e.clear(t, n, i);
    e.setRenderTarget(r)
  }
}
const Sc = 256,
  v_ = 3,
  M_ = 20,
  nu = 256,
  iu = 16,
  S_ = 3,
  y_ = new N,
  T_ = new Fe;
class Ns {
  constructor(e) {
    this._renderer = e, this._cubeSize = 0, this._sourceTarget = null, this._cubeCamera = new So(1, 10, null), this._boxMesh = new At(new qi(5, 5, 5), null), this._cubemapMaterial = null, this._equirectMaterial = null, this._blurMaterial = null, this._ggxMaterial = null, this._integrationMaterial = null
  }
  fromScene(e, t = 0, n = .1, i = 100, r = {}) {
    const {
      size: a = 256,
      position: o = y_
    } = r, l = this._renderer;
    this._setSize(a);
    const c = this._allocateTarget(),
      h = this._getSourceTarget(!0);
    t > 0 && (h.texture.mipmapsAutoUpdate = !1);
    const u = l.autoClear,
      d = l.autoClearColor,
      f = l.autoClearDepth,
      p = l.autoClearStencil,
      x = e.background;
    l.autoClear = !0, l.autoClearColor = !0, l.autoClearDepth = !0, l.autoClearStencil = !0, x === null && (e.background = l.getClearColor(T_));
    const m = new So(n, i, h);
    return m.position.copy(o), m.update(l, e), l.autoClear = u, l.autoClearColor = d, l.autoClearDepth = f, l.autoClearStencil = p, e.background = x, t > 0 && (h.texture.mipmapsAutoUpdate = !0, this._blur(c, t)), this._applyPMREM(c), c
  }
  fromEquirectangular(e, t = null) {
    return this._fromTexture(e, t)
  }
  fromCubemap(e, t = null) {
    return this._fromTexture(e, t)
  }
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = Ec(), this._compileMaterial(this._cubemapMaterial))
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Tc(), this._compileMaterial(this._equirectMaterial))
  }
  dispose() {
    this._sourceTarget !== null && this._sourceTarget.dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose(), this._blurMaterial !== null && this._blurMaterial.dispose(), this._ggxMaterial !== null && this._ggxMaterial.dispose(), this._integrationMaterial !== null && this._integrationMaterial.dispose(), this._boxMesh.geometry.dispose()
  }
  static lodToRoughness(e, t) {
    return t > 0 ? 1 - Math.sqrt(1 - e / t) : 0
  }
  _setSize(e) {
    this._cubeSize = Math.max(Sc, vh(e))
  }
  _fromTexture(e, t) {
    e.mapping === hi || e.mapping === Ms ? this._setSize(e.image.length === 0 ? Sc : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4);
    const n = t || this._allocateTarget();
    return this._textureToCubemap(e), this._applyPMREM(n), n
  }
  _allocateTarget() {
    const e = this._cubeSize,
      t = yc(e, !1, !1),
      n = Math.log2(e) - v_;
    for (let i = 0; i <= n; i++) t.texture.mipmaps.push({
      width: e >> i,
      height: e >> i
    });
    return t.texture.name = "PMREM", t.texture.isPMREMTexture = !0, t
  }
  _getSourceTarget(e = !1) {
    const t = this._cubeSize,
      n = this._sourceTarget;
    return (n === null || n.width !== t || e && n.depthBuffer === !1) && (n !== null && n.dispose(), this._sourceTarget = yc(t, !0, e)), this._sourceTarget
  }
  _compileMaterial(e) {
    this._boxMesh.material = e, this._renderer.compile(this._boxMesh, this._cubeCamera.children[0])
  }
  _renderCube(e, t, n) {
    const i = this._boxMesh,
      r = this._cubeCamera;
    i.material = n, r.renderTarget = e, r.activeMipmapLevel = t;
    const a = e.width >> t;
    e.viewport.set(0, 0, a, a), r.update(this._renderer, i), e.viewport.set(0, 0, e.width, e.height)
  }
  _textureToCubemap(e) {
    let t;
    e.mapping === hi || e.mapping === Ms ? (this._cubemapMaterial === null && (this._cubemapMaterial = Ec()), t = this._cubemapMaterial, t.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : (this._equirectMaterial === null && (this._equirectMaterial = Tc()), t = this._equirectMaterial), t.uniforms.envMap.value = e, this._renderCube(this._getSourceTarget(), 0, t)
  }
  _applyPMREM(e) {
    this._ggxMaterial === null && (this._ggxMaterial = E_(), this._integrationMaterial = b_());
    const t = this._cubeSize,
      n = e.texture.mipmaps.length - 1,
      i = this._ggxMaterial.uniforms;
    i.envMap.value = this._sourceTarget.texture;
    const r = this._integrationMaterial.uniforms;
    r.envMap.value = this._sourceTarget.texture, r.sourceLod.value = Math.log2(t / iu);
    for (let a = 0; a <= n; a++) {
      const o = Ns.lodToRoughness(a, n);
      if (a > n - S_) r.roughness.value = o, this._renderCube(e, a, this._integrationMaterial);
      else {
        const l = o > 0 ? Math.log2(t) + .5 * Math.log2(6 / (nu * Math.pow(o, 4))) + .5 : 0;
        i.roughness.value = o, i.lodBias.value = l, this._renderCube(e, a, this._ggxMaterial)
      }
    }
  }
  _blur(e, t) {
    this._blurMaterial === null && (this._blurMaterial = A_());
    const n = this._blurMaterial,
      i = n.uniforms,
      r = this._sourceTarget;
    i.sigma.value = Math.min(t, Math.PI) / Math.SQRT2, i.envMap.value = r.texture, this._renderCube(e, 0, n), i.envMap.value = e.texture, this._renderCube(r, 0, n)
  }
}

function yc(s, e, t) {
  return new tl(s, {
    minFilter: vn,
    generateMipmaps: e,
    type: yn,
    colorSpace: Xt,
    depthBuffer: t
  })
}

function Fs(s, e, t) {
  return new fi({
    name: s,
    uniforms: e,
    vertexShader: Ye.cube_vert,
    fragmentShader: t,
    side: Wt,
    blending: Ui,
    depthTest: !1,
    depthWrite: !1
  })
}

function E_() {
  return Fs("PMREMGGXConvolution", {
    envMap: {
      value: null
    },
    roughness: {
      value: 0
    },
    lodBias: {
      value: 0
    }
  }, `

		#define GGX_SAMPLES ${nu}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)
}

function b_() {
  return Fs("PMREMGGXIntegration", {
    envMap: {
      value: null
    },
    roughness: {
      value: 0
    },
    sourceLod: {
      value: 0
    },
    sourceSize: {
      value: iu
    }
  }, `

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)
}

function A_() {
  return Fs("PMREMSphericalGaussianBlur", {
    envMap: {
      value: null
    },
    sigma: {
      value: 0
    }
  }, `

		#define SAMPLES ${M_}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)
}

function Tc() {
  return Fs("PMREMEquirectangularToCubemap", {
    envMap: {
      value: null
    }
  }, `

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)
}

function Ec() {
  return Fs("PMREMCubemapToCubemap", {
    envMap: {
      value: null
    },
    flipEnvMap: {
      value: -1
    }
  }, `

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)
}

function w_(s) {
  let e = new WeakMap,
    t = new WeakMap,
    n = null;

  function i(d, f = !1) {
    return d == null ? null : f ? a(d) : r(d)
  }

  function r(d) {
    if (d && d.isTexture) {
      const f = d.mapping;
      if (f === Vr || f === Wr)
        if (e.has(d)) {
          const p = e.get(d).texture;
          return o(p, d.mapping)
        } else {
          const p = d.image;
          if (p && p.height > 0) {
            const x = new tl(p.height);
            return x.fromEquirectangularTexture(s, d), e.set(d, x), d.addEventListener("dispose", c), o(x.texture, d.mapping)
          } else return null
        }
    }
    return d
  }

  function a(d) {
    if (d && d.isTexture && d.isPMREMTexture !== !0) {
      const f = d.mapping,
        p = f === Vr || f === Wr,
        x = f === hi || f === Ms;
      if (p || x) {
        let m = t.get(d);
        const g = m !== void 0 ? m.texture.pmremVersion : 0;
        if (d.isRenderTargetTexture && d.pmremVersion !== g) return n === null && (n = new Ns(s)), m = p ? n.fromEquirectangular(d, m) : n.fromCubemap(d, m), m.texture.pmremVersion = d.pmremVersion, t.set(d, m), m.texture;
        if (m !== void 0) return m.texture;
        {
          const M = d.image;
          return p && M && M.height > 0 || x && M && l(M) ? (n === null && (n = new Ns(s)), m = p ? n.fromEquirectangular(d) : n.fromCubemap(d), m.texture.pmremVersion = d.pmremVersion, t.set(d, m), d.addEventListener("dispose", h), m.texture) : null
        }
      }
    }
    return d
  }

  function o(d, f) {
    return f === Vr ? d.mapping = hi : f === Wr && (d.mapping = Ms), d
  }

  function l(d) {
    let f = 0;
    const p = 6;
    for (let x = 0; x < p; x++) d[x] !== void 0 && f++;
    return f === p
  }

  function c(d) {
    const f = d.target;
    f.removeEventListener("dispose", c);
    const p = e.get(f);
    p !== void 0 && (e.delete(f), p.dispose())
  }

  function h(d) {
    const f = d.target;
    f.removeEventListener("dispose", h);
    const p = t.get(f);
    p !== void 0 && (t.delete(f), p.dispose())
  }

  function u() {
    e = new WeakMap, t = new WeakMap, n !== null && (n.dispose(), n = null)
  }
  return {
    get: i,
    dispose: u
  }
}

function R_(s) {
  const e = {};

  function t(n) {
    if (e[n] !== void 0) return e[n];
    const i = s.getExtension(n);
    return e[n] = i, i
  }
  return {
    has: function(n) {
      return t(n) !== null
    },
    init: function() {
      t("EXT_color_buffer_float"), t("WEBGL_clip_cull_distance"), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture"), t("WEBGL_render_shared_exponent")
    },
    get: function(n) {
      const i = t(n);
      return i === null && Fi("WebGLRenderer: " + n + " extension not supported."), i
    }
  }
}

function C_(s, e, t, n) {
  const i = {},
    r = new WeakMap,
    a = new FinalizationRegistry(p => delete i[p]);

  function o(p) {
    l(p.target)
  }

  function l(p) {
    p.index !== null && e.remove(p.index);
    for (const m in p.attributes) e.remove(p.attributes[m]);
    p.removeEventListener("dispose", o), delete i[p.id], a.unregister(p);
    const x = r.get(p);
    x && (e.remove(x), r.delete(p)), n.releaseStatesOfGeometry(p), p.isInstancedBufferGeometry === !0 && delete p._maxInstanceCount, t.memory.geometries--
  }

  function c(p, x) {
    return i[x.id] !== void 0 || (x.addEventListener("dispose", o), i[x.id] = new WeakRef(x), a.register(x, x.id, x), t.memory.geometries++), x
  }

  function h(p) {
    const x = p.attributes;
    for (const m in x) e.update(x[m], s.ARRAY_BUFFER)
  }

  function u(p) {
    const x = p.index,
      m = p.attributes.position;
    let g = 0;
    if (m === void 0) return;
    const M = x !== null ? x.array.length : m.array.length / 3 - 1,
      E = m.count >= 65535 ? Eh : Th,
      v = new E(Math.ceil(M / 3) * 6, 1),
      A = v.array;
    if (x !== null) {
      const _ = x.array;
      g = x.version;
      for (let T = 0, I = 0; T < M; T += 3) {
        const R = _[T + 0],
          D = _[T + 1],
          F = _[T + 2];
        A[I++] = R, A[I++] = D, A[I++] = D, A[I++] = F, A[I++] = F, A[I++] = R
      }
    } else {
      g = m.version;
      for (let _ = 0, T = 0; _ < M; _ += 3) {
        const I = _ + 0,
          R = _ + 1,
          D = _ + 2;
        A[T++] = I, A[T++] = R, A[T++] = R, A[T++] = D, A[T++] = D, A[T++] = I
      }
    }
    v.version = g;
    const b = r.get(p);
    b && e.remove(b), r.set(p, v)
  }

  function d(p) {
    const x = r.get(p);
    if (x) {
      const m = p.index;
      m !== null && x.version < m.version && u(p)
    } else u(p);
    return r.get(p)
  }

  function f() {
    for (const p in i) {
      const x = i[p].deref();
      x !== void 0 && l(x)
    }
  }
  return {
    get: c,
    update: h,
    getWireframeAttribute: d,
    dispose: f
  }
}

function L_(s, e, t) {
  let n;

  function i(u) {
    n = u
  }
  let r, a;

  function o(u) {
    r = u.type, a = u.bytesPerElement
  }

  function l(u, d) {
    s.drawElements(n, d, r, u * a), t.update(d, n, 1)
  }

  function c(u, d, f) {
    f !== 0 && (s.drawElementsInstanced(n, d, r, u * a, f), t.update(d, n, f))
  }

  function h(u, d, f) {
    if (f === 0) return;
    e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, d, 0, r, u, 0, f);
    let x = 0;
    for (let m = 0; m < f; m++) x += d[m];
    t.update(x, n, 1)
  }
  this.setMode = i, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h
}

function P_(s) {
  const e = {
      geometries: 0,
      textures: 0
    },
    t = {
      frame: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };

  function n(r, a, o) {
    switch (t.calls++, a) {
      case s.TRIANGLES:
        t.triangles += o * (r / 3);
        break;
      case s.LINES:
        t.lines += o * (r / 2);
        break;
      case s.LINE_STRIP:
        t.lines += o * (r - 1);
        break;
      case s.LINE_LOOP:
        t.lines += o * r;
        break;
      case s.POINTS:
        t.points += o * r;
        break;
      default:
        ze("WebGLInfo: Unknown draw mode:", a);
        break
    }
  }

  function i() {
    t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0
  }
  return {
    memory: e,
    render: t,
    programs: null,
    autoReset: !0,
    reset: i,
    update: n
  }
}

function I_(s, e, t) {
  const n = new WeakMap,
    i = new ht;

  function r(a, o, l) {
    const c = a.morphTargetInfluences,
      h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color,
      u = h !== void 0 ? h.length : 0;
    let d = n.get(o);
    if (d === void 0 || d.count !== u) {
      let I = function() {
        _.dispose(), n.delete(o), o.removeEventListener("dispose", I)
      };
      d !== void 0 && d.texture.dispose();
      const f = o.morphAttributes.position !== void 0,
        p = o.morphAttributes.normal !== void 0,
        x = o.morphAttributes.color !== void 0,
        m = o.morphAttributes.position || [],
        g = o.morphAttributes.normal || [],
        M = o.morphAttributes.color || [];
      let E = 0;
      f === !0 && (E = 1), p === !0 && (E = 2), x === !0 && (E = 3);
      let v = o.attributes.position.count * E,
        A = 1;
      v > e.maxTextureSize && (A = Math.ceil(v / e.maxTextureSize), v = e.maxTextureSize);
      const b = new Float32Array(v * A * 4 * u),
        _ = new Mh(b, v, A, u);
      _.type = jt, _.needsUpdate = !0;
      const T = E * 4;
      for (let R = 0; R < u; R++) {
        const D = m[R],
          F = g[R],
          V = M[R],
          L = v * A * 4 * R;
        for (let k = 0; k < D.count; k++) {
          const X = k * T;
          f === !0 && (i.fromBufferAttribute(D, k), b[L + X + 0] = i.x, b[L + X + 1] = i.y, b[L + X + 2] = i.z, b[L + X + 3] = 0), p === !0 && (i.fromBufferAttribute(F, k), b[L + X + 4] = i.x, b[L + X + 5] = i.y, b[L + X + 6] = i.z, b[L + X + 7] = 0), x === !0 && (i.fromBufferAttribute(V, k), b[L + X + 8] = i.x, b[L + X + 9] = i.y, b[L + X + 10] = i.z, b[L + X + 11] = V.itemSize === 4 ? i.w : 1)
        }
      }
      d = {
        count: u,
        texture: _,
        size: new re(v, A)
      }, n.set(o, d), o.addEventListener("dispose", I)
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null) l.getUniforms().setValue(s, "morphTexture", a.morphTexture, t);
    else {
      let f = 0;
      for (let x = 0; x < c.length; x++) f += c[x];
      const p = o.morphTargetsRelative ? 1 : 1 - f;
      l.getUniforms().setValue(s, "morphTargetBaseInfluence", p), l.getUniforms().setValue(s, "morphTargetInfluences", c)
    }
    l.getUniforms().setValue(s, "morphTargetsTexture", d.texture, t), l.getUniforms().setValue(s, "morphTargetsTextureSize", d.size)
  }
  return {
    update: r
  }
}

function N_(s, e, t, n, i) {
  let r = new WeakMap;

  function a(c) {
    const h = i.render.frame,
      u = c.geometry,
      d = e.get(c, u);
    if (r.get(d) !== h && (e.update(d), r.set(d, h)), c.isInstancedMesh && (c.hasEventListener("dispose", l) === !1 && c.addEventListener("dispose", l), r.get(c) !== h && (t.update(c.instanceMatrix, s.ARRAY_BUFFER), c.instanceColor !== null && t.update(c.instanceColor, s.ARRAY_BUFFER), r.set(c, h))), c.isSkinnedMesh) {
      const f = c.skeleton;
      r.get(f) !== h && (f.update(), r.set(f, h))
    }
    return d
  }

  function o() {
    r = new WeakMap
  }

  function l(c) {
    const h = c.target;
    h.removeEventListener("dispose", l), n.releaseStatesOfObject(h), t.remove(h.instanceMatrix), h.instanceColor !== null && t.remove(h.instanceColor)
  }
  return {
    update: a,
    dispose: o
  }
}
const D_ = {
  [Qc]: "LINEAR_TONE_MAPPING",
  [jc]: "REINHARD_TONE_MAPPING",
  [eh]: "CINEON_TONE_MAPPING",
  [th]: "ACES_FILMIC_TONE_MAPPING",
  [ih]: "AGX_TONE_MAPPING",
  [sh]: "NEUTRAL_TONE_MAPPING",
  [nh]: "CUSTOM_TONE_MAPPING"
};

function U_(s, e, t, n, i, r) {
  const a = new Mn(e, t, {
    type: s,
    depthBuffer: i,
    stencilBuffer: r,
    samples: n ? 4 : 0,
    storeMultisampledDepthBuffer: !1,
    storeMultisampledStencilBuffer: !1,
    resolveDepthBuffer: !1,
    resolveStencilBuffer: !1
  });
  let o = null,
    l = null,
    c = null;
  const h = new wt;
  h.setAttribute("position", new ut([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), h.setAttribute("uv", new ut([0, 2, 0, 0, 2, 0], 2));
  const u = new qf({
      uniforms: {
        tDiffuse: {
          value: null
        }
      },
      vertexShader: `
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,
      fragmentShader: `
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,
      depthTest: !1,
      depthWrite: !1
    }),
    d = new At(h, u),
    f = new Qo(-1, 1, 1, -1, 0, 1);
  let p = null,
    x = null,
    m = !1,
    g, M = null,
    E = [],
    v = !1;
  this.setSize = function(A, b) {
    a.setSize(A, b), o !== null && o.setSize(A, b), l !== null && l.setSize(A, b);
    for (let _ = 0; _ < E.length; _++) {
      const T = E[_];
      T.setSize && T.setSize(A, b)
    }
  }, this.setEffects = function(A) {
    E = A, v = E.length > 0 && E[0].isRenderPass === !0;
    const b = a.width,
      _ = a.height;
    E.length > 0 && o === null && (o = new Mn(b, _, {
      type: yn,
      depthBuffer: !1,
      stencilBuffer: !1
    }), l = new Mn(b, _, {
      type: yn,
      depthBuffer: !1,
      stencilBuffer: !1
    }));
    const T = i === !0 && E.some(I => I.needsDepthTexture === !0);
    T !== (a.depthTexture !== null) && (T === !0 && c === null && (c = new Vi(b, _), r === !0 && (c.format = Kn, c.type = ki)), a.dispose(), a.depthTexture = T ? c : null, a.resolveDepthBuffer = T, a.storeMultisampledDepthBuffer = T);
    for (let I = 0; I < E.length; I++) {
      const R = E[I];
      R.setSize && R.setSize(b, _), T && R.needsDepthTexture === !0 && R.setDepthTexture && R.setDepthTexture(c)
    }
  }, this.begin = function(A, b) {
    if (m || A.toneMapping === Un && E.length === 0) return !1;
    if (M = b, b !== null) {
      const _ = b.width,
        T = b.height;
      (a.width !== _ || a.height !== T) && this.setSize(_, T)
    }
    return v === !1 && A.setRenderTarget(a), g = A.toneMapping, A.toneMapping = Un, !0
  }, this.hasRenderPass = function() {
    return v
  }, this.end = function(A, b) {
    A.toneMapping = g, m = !0;
    let _ = a,
      T = o;
    for (let I = 0; I < E.length; I++) {
      const R = E[I];
      R.enabled !== !1 && (R.render(A, T, _, b), R.needsSwap !== !1 && (_ = T, T = T === o ? l : o))
    }
    if (p !== A.outputColorSpace || x !== A.toneMapping) {
      p = A.outputColorSpace, x = A.toneMapping, u.defines = {}, Qe.getTransfer(p) === ct && (u.defines.SRGB_TRANSFER = "");
      const I = D_[x];
      I && (u.defines[I] = ""), u.needsUpdate = !0
    }
    u.uniforms.tDiffuse.value = _.texture, A.setRenderTarget(M), A.render(d, f), M = null, m = !1
  }, this.isCompositing = function() {
    return m
  }, this.dispose = function() {
    a.dispose(), o !== null && o.dispose(), l !== null && l.dispose(), h.dispose(), u.dispose()
  }
}
const su = new vt,
  ru = new Vi(1, 1),
  au = new Ih(1),
  ou = new Mh,
  lu = new Ud,
  cu = new Ph,
  bc = [],
  Ac = [],
  wc = new Float32Array(16),
  Rc = new Float32Array(9),
  Cc = new Float32Array(4);

function Zi(s, e, t) {
  const n = s[0];
  if (n <= 0 || n > 0) return s;
  const i = e * t;
  let r = bc[i];
  if (r === void 0 && (r = new Float32Array(i), bc[i] = r), e !== 0) {
    n.toArray(r, 0);
    for (let a = 1, o = 0; a !== e; ++a) o += t, s[a].toArray(r, o)
  }
  return r
}

function Lt(s, e) {
  if (s.length !== e.length) return !1;
  for (let t = 0, n = s.length; t < n; t++)
    if (s[t] !== e[t]) return !1;
  return !0
}

function Pt(s, e) {
  for (let t = 0, n = e.length; t < n; t++) s[t] = e[t]
}

function zr(s, e) {
  let t = Ac[e];
  t === void 0 && (t = new Int32Array(e), Ac[e] = t);
  for (let n = 0; n !== e; ++n) t[n] = s.allocateTextureUnit();
  return t
}

function F_(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1f(this.addr, e), t[0] = e)
}

function O_(s, e) {
  const t = this.cache;
  if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y) && (s.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Lt(t, e)) return;
    s.uniform2fv(this.addr, e), Pt(t, e)
  }
}

function B_(s, e) {
  const t = this.cache;
  if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else if (e.r !== void 0)(t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (s.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
  else {
    if (Lt(t, e)) return;
    s.uniform3fv(this.addr, e), Pt(t, e)
  }
}

function z_(s, e) {
  const t = this.cache;
  if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Lt(t, e)) return;
    s.uniform4fv(this.addr, e), Pt(t, e)
  }
}

function k_(s, e) {
  const t = this.cache,
    n = e.elements;
  if (n === void 0) {
    if (Lt(t, e)) return;
    s.uniformMatrix2fv(this.addr, !1, e), Pt(t, e)
  } else {
    if (Lt(t, n)) return;
    Cc.set(n), s.uniformMatrix2fv(this.addr, !1, Cc), Pt(t, n)
  }
}

function H_(s, e) {
  const t = this.cache,
    n = e.elements;
  if (n === void 0) {
    if (Lt(t, e)) return;
    s.uniformMatrix3fv(this.addr, !1, e), Pt(t, e)
  } else {
    if (Lt(t, n)) return;
    Rc.set(n), s.uniformMatrix3fv(this.addr, !1, Rc), Pt(t, n)
  }
}

function G_(s, e) {
  const t = this.cache,
    n = e.elements;
  if (n === void 0) {
    if (Lt(t, e)) return;
    s.uniformMatrix4fv(this.addr, !1, e), Pt(t, e)
  } else {
    if (Lt(t, n)) return;
    wc.set(n), s.uniformMatrix4fv(this.addr, !1, wc), Pt(t, n)
  }
}

function V_(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1i(this.addr, e), t[0] = e)
}

function W_(s, e) {
  const t = this.cache;
  if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y) && (s.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Lt(t, e)) return;
    s.uniform2iv(this.addr, e), Pt(t, e)
  }
}

function X_(s, e) {
  const t = this.cache;
  if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (Lt(t, e)) return;
    s.uniform3iv(this.addr, e), Pt(t, e)
  }
}

function q_(s, e) {
  const t = this.cache;
  if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Lt(t, e)) return;
    s.uniform4iv(this.addr, e), Pt(t, e)
  }
}

function Y_(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1ui(this.addr, e), t[0] = e)
}

function K_(s, e) {
  const t = this.cache;
  if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y) && (s.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Lt(t, e)) return;
    s.uniform2uiv(this.addr, e), Pt(t, e)
  }
}

function J_(s, e) {
  const t = this.cache;
  if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (Lt(t, e)) return;
    s.uniform3uiv(this.addr, e), Pt(t, e)
  }
}

function Z_(s, e) {
  const t = this.cache;
  if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Lt(t, e)) return;
    s.uniform4uiv(this.addr, e), Pt(t, e)
  }
}

function kr(s) {
  return s.version === 0 && (s.compareFunction = gh, s.needsUpdate = !0), s
}

function $_(s, e, t) {
  const n = this.cache,
    i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i);
  let r;
  this.type === s.SAMPLER_2D_SHADOW ? r = kr(ru) : r = su, t.setTexture2D(e || r, i)
}

function Q_(s, e, t) {
  const n = this.cache,
    i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture3D(e || lu, i)
}

function j_(s, e, t) {
  const n = this.cache,
    i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i);
  let r;
  this.type === s.SAMPLER_CUBE_SHADOW ? r = kr(au) : r = cu, t.setTextureCube(e || r, i)
}

function e0(s, e, t) {
  const n = this.cache,
    i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture2DArray(e || ou, i)
}

function t0(s) {
  switch (s) {
    case 5126:
      return F_;
    case 35664:
      return O_;
    case 35665:
      return B_;
    case 35666:
      return z_;
    case 35674:
      return k_;
    case 35675:
      return H_;
    case 35676:
      return G_;
    case 5124:
    case 35670:
      return V_;
    case 35667:
    case 35671:
      return W_;
    case 35668:
    case 35672:
      return X_;
    case 35669:
    case 35673:
      return q_;
    case 5125:
      return Y_;
    case 36294:
      return K_;
    case 36295:
      return J_;
    case 36296:
      return Z_;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return $_;
    case 35679:
    case 36299:
    case 36307:
      return Q_;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return j_;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return e0
  }
}

function n0(s, e) {
  s.uniform1fv(this.addr, e)
}

function i0(s, e) {
  const t = Zi(e, this.size, 2);
  s.uniform2fv(this.addr, t)
}

function s0(s, e) {
  const t = Zi(e, this.size, 3);
  s.uniform3fv(this.addr, t)
}

function r0(s, e) {
  const t = Zi(e, this.size, 4);
  s.uniform4fv(this.addr, t)
}

function a0(s, e) {
  const t = Zi(e, this.size, 4);
  s.uniformMatrix2fv(this.addr, !1, t)
}

function o0(s, e) {
  const t = Zi(e, this.size, 9);
  s.uniformMatrix3fv(this.addr, !1, t)
}

function l0(s, e) {
  const t = Zi(e, this.size, 16);
  s.uniformMatrix4fv(this.addr, !1, t)
}

function c0(s, e) {
  s.uniform1iv(this.addr, e)
}

function h0(s, e) {
  s.uniform2iv(this.addr, e)
}

function u0(s, e) {
  s.uniform3iv(this.addr, e)
}

function d0(s, e) {
  s.uniform4iv(this.addr, e)
}

function f0(s, e) {
  s.uniform1uiv(this.addr, e)
}

function p0(s, e) {
  s.uniform2uiv(this.addr, e)
}

function m0(s, e) {
  s.uniform3uiv(this.addr, e)
}

function g0(s, e) {
  s.uniform4uiv(this.addr, e)
}

function _0(s, e, t) {
  const n = this.cache,
    i = e.length,
    r = zr(t, i);
  Lt(n, r) || (s.uniform1iv(this.addr, r), Pt(n, r));
  let a;
  this.type === s.SAMPLER_2D_SHADOW ? a = kr(ru) : a = su;
  for (let o = 0; o !== i; ++o) t.setTexture2D(e[o] || a, r[o])
}

function x0(s, e, t) {
  const n = this.cache,
    i = e.length,
    r = zr(t, i);
  Lt(n, r) || (s.uniform1iv(this.addr, r), Pt(n, r));
  for (let a = 0; a !== i; ++a) t.setTexture3D(e[a] || lu, r[a])
}

function v0(s, e, t) {
  const n = this.cache,
    i = e.length,
    r = zr(t, i);
  Lt(n, r) || (s.uniform1iv(this.addr, r), Pt(n, r));
  let a;
  this.type === s.SAMPLER_CUBE_SHADOW ? a = kr(au) : a = cu;
  for (let o = 0; o !== i; ++o) t.setTextureCube(e[o] || a, r[o])
}

function M0(s, e, t) {
  const n = this.cache,
    i = e.length,
    r = zr(t, i);
  Lt(n, r) || (s.uniform1iv(this.addr, r), Pt(n, r));
  for (let a = 0; a !== i; ++a) t.setTexture2DArray(e[a] || ou, r[a])
}

function S0(s) {
  switch (s) {
    case 5126:
      return n0;
    case 35664:
      return i0;
    case 35665:
      return s0;
    case 35666:
      return r0;
    case 35674:
      return a0;
    case 35675:
      return o0;
    case 35676:
      return l0;
    case 5124:
    case 35670:
      return c0;
    case 35667:
    case 35671:
      return h0;
    case 35668:
    case 35672:
      return u0;
    case 35669:
    case 35673:
      return d0;
    case 5125:
      return f0;
    case 36294:
      return p0;
    case 36295:
      return m0;
    case 36296:
      return g0;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return _0;
    case 35679:
    case 36299:
    case 36307:
      return x0;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return v0;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return M0
  }
}
class y0 {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = t0(t.type)
  }
}
class T0 {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = S0(t.type)
  }
}
class E0 {
  constructor(e) {
    this.id = e, this.seq = [], this.map = {}
  }
  setValue(e, t, n) {
    const i = this.seq;
    for (let r = 0, a = i.length; r !== a; ++r) {
      const o = i[r];
      o.setValue(e, t[o.id], n)
    }
  }
}
const Sa = /(\w+)(\])?(\[|\.)?/g;

function Lc(s, e) {
  s.seq.push(e), s.map[e.id] = e
}

function b0(s, e, t) {
  const n = s.name,
    i = n.length;
  for (Sa.lastIndex = 0;;) {
    const r = Sa.exec(n),
      a = Sa.lastIndex;
    let o = r[1];
    const l = r[2] === "]",
      c = r[3];
    if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === i) {
      Lc(t, c === void 0 ? new y0(o, s, e) : new T0(o, s, e));
      break
    } else {
      let u = t.map[o];
      u === void 0 && (u = new E0(o), Lc(t, u)), t = u
    }
  }
}
class Sr {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let a = 0; a < n; ++a) {
      const o = e.getActiveUniform(t, a),
        l = e.getUniformLocation(t, o.name);
      b0(o, l, this)
    }
    const i = [],
      r = [];
    for (const a of this.seq) a.type === e.SAMPLER_2D_SHADOW || a.type === e.SAMPLER_CUBE_SHADOW || a.type === e.SAMPLER_2D_ARRAY_SHADOW ? i.push(a) : r.push(a);
    i.length > 0 && (this.seq = i.concat(r))
  }
  setValue(e, t, n, i) {
    const r = this.map[t];
    r !== void 0 && r.setValue(e, n, i)
  }
  setOptional(e, t, n) {
    const i = t[n];
    i !== void 0 && this.setValue(e, n, i)
  }
  static upload(e, t, n, i) {
    for (let r = 0, a = t.length; r !== a; ++r) {
      const o = t[r],
        l = n[o.id];
      l.needsUpdate !== !1 && o.setValue(e, l.value, i)
    }
  }
  static seqWithValue(e, t) {
    const n = [];
    for (let i = 0, r = e.length; i !== r; ++i) {
      const a = e[i];
      a.id in t && n.push(a)
    }
    return n
  }
}

function Pc(s, e, t) {
  const n = s.createShader(e);
  return s.shaderSource(n, t), s.compileShader(n), n
}
const A0 = 37297;
let w0 = 0;

function R0(s, e) {
  const t = s.split(`
`),
    n = [],
    i = Math.max(e - 6, 0),
    r = Math.min(e + 6, t.length);
  for (let a = i; a < r; a++) {
    const o = a + 1;
    n.push(`${o===e?">":" "} ${o}: ${t[a]}`)
  }
  return n.join(`
`)
}
const Ic = new He;

function C0(s) {
  Qe._getMatrix(Ic, Qe.workingColorSpace, s);
  const e = `mat3( ${Ic.elements.map(t=>t.toFixed(4))} )`;
  switch (Qe.getTransfer(s)) {
    case Ar:
      return [e, "LinearTransferOETF"];
    case ct:
      return [e, "sRGBTransferOETF"];
    default:
      return Ce("WebGLProgram: Unsupported color space: ", s), [e, "LinearTransferOETF"]
  }
}

function Nc(s, e, t) {
  const n = s.getShaderParameter(e, s.COMPILE_STATUS),
    r = (s.getShaderInfoLog(e) || "").trim();
  if (n && r === "") return "";
  const a = /ERROR: 0:(\d+)/.exec(r);
  if (a) {
    const o = parseInt(a[1]);
    return t.toUpperCase() + `

` + r + `

` + R0(s.getShaderSource(e), o)
  } else return r
}

function L0(s, e) {
  const t = C0(e);
  return [`vec4 ${s}( vec4 value ) {`, `	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`, "}"].join(`
`)
}
const P0 = {
  [Qc]: "Linear",
  [jc]: "Reinhard",
  [eh]: "Cineon",
  [th]: "ACESFilmic",
  [ih]: "AgX",
  [sh]: "Neutral",
  [nh]: "Custom"
};

function I0(s, e) {
  const t = P0[e];
  return t === void 0 ? (Ce("WebGLProgram: Unsupported toneMapping:", e), "vec3 " + s + "( vec3 color ) { return LinearToneMapping( color ); }") : "vec3 " + s + "( vec3 color ) { return " + t + "ToneMapping( color ); }"
}
const pr = new N;

function N0() {
  Qe.getLuminanceCoefficients(pr);
  const s = pr.x.toFixed(4),
    e = pr.y.toFixed(4),
    t = pr.z.toFixed(4);
  return ["float luminance( const in vec3 rgb ) {", `	const vec3 weights = vec3( ${s}, ${e}, ${t} );`, "	return dot( weights, rgb );", "}"].join(`
`)
}

function D0(s) {
  return [s.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", s.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(ds).join(`
`)
}

function U0(s) {
  const e = [];
  for (const t in s) {
    const n = s[t];
    n !== !1 && e.push("#define " + t + " " + n)
  }
  return e.join(`
`)
}

function F0(s, e) {
  const t = {},
    n = s.getProgramParameter(e, s.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < n; i++) {
    const r = s.getActiveAttrib(e, i),
      a = r.name;
    let o = 1;
    r.type === s.FLOAT_MAT2 && (o = 2), r.type === s.FLOAT_MAT3 && (o = 3), r.type === s.FLOAT_MAT4 && (o = 4), t[a] = {
      type: r.type,
      location: s.getAttribLocation(e, a),
      locationSize: o
    }
  }
  return t
}

function ds(s) {
  return s !== ""
}

function Dc(s, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return s.replace(/NUM_SUN_LIGHTS/g, e.numSunLights).replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g, e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g, e.numLightProbeGrids)
}

function Uc(s, e) {
  return s.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection)
}
const O0 = /^[ \t]*#include +<([\w\d./]+)>/gm;

function To(s) {
  return s.replace(O0, B0)
}

function B0(s, e) {
  const t = Ye[e];
  if (t === void 0) throw new Error("THREE.WebGLProgram: Can not resolve #include <" + e + ">");
  return To(t)
}
const z0 = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

function Fc(s) {
  return s.replace(z0, k0)
}

function k0(s, e, t, n) {
  let i = "";
  for (let r = parseInt(e); r < parseInt(t); r++) i += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
  return i
}

function Oc(s) {
  let e = `precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;
  return s.precision === "highp" ? e += `
#define HIGH_PRECISION` : s.precision === "mediump" ? e += `
#define MEDIUM_PRECISION` : s.precision === "lowp" && (e += `
#define LOW_PRECISION`), e
}
const H0 = {
  [mr]: "SHADOWMAP_TYPE_PCF",
  [ls]: "SHADOWMAP_TYPE_VSM"
};

function G0(s) {
  return H0[s.shadowMapType] || "SHADOWMAP_TYPE_BASIC"
}
const V0 = {
  [Ms]: "ENVMAP_MODE_REFRACTION"
};

function W0(s) {
  return s.envMap === !1 ? "ENVMAP_MODE_REFLECTION" : V0[s.envMapMode] || "ENVMAP_MODE_REFLECTION"
}
const X0 = {
  [Ur]: "ENVMAP_BLENDING_MULTIPLY",
  [Yu]: "ENVMAP_BLENDING_MIX",
  [Ku]: "ENVMAP_BLENDING_ADD"
};

function q0(s) {
  return s.envMap === !1 ? "ENVMAP_BLENDING_NONE" : X0[s.combine] || "ENVMAP_BLENDING_NONE"
}

function Y0(s, e, t, n) {
  const i = s.getContext(),
    r = t.defines;
  let a = t.vertexShader,
    o = t.fragmentShader;
  const l = G0(t),
    c = t.envMapPMREM === !0 ? "ENVMAP_TYPE_PMREM" : "ENVMAP_TYPE_CUBE",
    h = W0(t),
    u = q0(t),
    d = D0(t),
    f = U0(r),
    p = i.createProgram();
  let x, m, g = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (x = ["#define SHADER_TYPE " + t.shaderType, "#define SHADER_NAME " + t.shaderName, f].filter(ds).join(`
`), x.length > 0 && (x += `
`), m = ["#define SHADER_TYPE " + t.shaderType, "#define SHADER_NAME " + t.shaderName, f].filter(ds).join(`
`), m.length > 0 && (m += `
`)) : (x = [Oc(t), "#define SHADER_TYPE " + t.shaderType, "#define SHADER_NAME " + t.shaderName, f, t.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "", t.batching ? "#define USE_BATCHING" : "", t.batchingColor ? "#define USE_BATCHING_COLOR" : "", t.instancing ? "#define USE_INSTANCING" : "", t.instancingColor ? "#define USE_INSTANCING_COLOR" : "", t.instancingMorph ? "#define USE_INSTANCING_MORPH" : "", t.useFog && t.fog ? "#define USE_FOG" : "", t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "", t.map ? "#define USE_MAP" : "", t.envMap ? "#define USE_ENVMAP" : "", t.envMap ? "#define " + h : "", t.lightMap ? "#define USE_LIGHTMAP" : "", t.aoMap ? "#define USE_AOMAP" : "", t.bumpMap ? "#define USE_BUMPMAP" : "", t.normalMap ? "#define USE_NORMALMAP" : "", t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", t.displacementMap ? "#define USE_DISPLACEMENTMAP" : "", t.emissiveMap ? "#define USE_EMISSIVEMAP" : "", t.anisotropy ? "#define USE_ANISOTROPY" : "", t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", t.diffuseRoughnessMap ? "#define USE_DIFFUSE_ROUGHNESSMAP" : "", t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", t.specularMap ? "#define USE_SPECULARMAP" : "", t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", t.metalnessMap ? "#define USE_METALNESSMAP" : "", t.alphaMap ? "#define USE_ALPHAMAP" : "", t.alphaHash ? "#define USE_ALPHAHASH" : "", t.transmission ? "#define USE_TRANSMISSION" : "", t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", t.thicknessMap ? "#define USE_THICKNESSMAP" : "", t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", t.mapUv ? "#define MAP_UV " + t.mapUv : "", t.alphaMapUv ? "#define ALPHAMAP_UV " + t.alphaMapUv : "", t.lightMapUv ? "#define LIGHTMAP_UV " + t.lightMapUv : "", t.aoMapUv ? "#define AOMAP_UV " + t.aoMapUv : "", t.emissiveMapUv ? "#define EMISSIVEMAP_UV " + t.emissiveMapUv : "", t.bumpMapUv ? "#define BUMPMAP_UV " + t.bumpMapUv : "", t.normalMapUv ? "#define NORMALMAP_UV " + t.normalMapUv : "", t.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + t.displacementMapUv : "", t.metalnessMapUv ? "#define METALNESSMAP_UV " + t.metalnessMapUv : "", t.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + t.roughnessMapUv : "", t.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + t.anisotropyMapUv : "", t.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + t.clearcoatMapUv : "", t.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + t.clearcoatNormalMapUv : "", t.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + t.clearcoatRoughnessMapUv : "", t.diffuseRoughnessMapUv ? "#define DIFFUSE_ROUGHNESSMAP_UV " + t.diffuseRoughnessMapUv : "", t.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + t.iridescenceMapUv : "", t.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + t.iridescenceThicknessMapUv : "", t.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + t.sheenColorMapUv : "", t.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + t.sheenRoughnessMapUv : "", t.specularMapUv ? "#define SPECULARMAP_UV " + t.specularMapUv : "", t.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + t.specularColorMapUv : "", t.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + t.specularIntensityMapUv : "", t.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + t.transmissionMapUv : "", t.thicknessMapUv ? "#define THICKNESSMAP_UV " + t.thicknessMapUv : "", t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "", t.vertexNormals ? "#define HAS_NORMAL" : "", t.vertexColors ? "#define USE_COLOR" : "", t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", t.vertexUv1s ? "#define USE_UV1" : "", t.vertexUv2s ? "#define USE_UV2" : "", t.vertexUv3s ? "#define USE_UV3" : "", t.pointsUvs ? "#define USE_POINTS_UV" : "", t.flatShading ? "#define FLAT_SHADED" : "", t.skinning ? "#define USE_SKINNING" : "", t.morphTargets ? "#define USE_MORPHTARGETS" : "", t.morphNormals && t.flatShading === !1 ? "#define USE_MORPHNORMALS" : "", t.morphColors ? "#define USE_MORPHCOLORS" : "", t.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride : "", t.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "", t.doubleSided ? "#define DOUBLE_SIDED" : "", t.flipSided ? "#define FLIP_SIDED" : "", t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", t.shadowMapEnabled ? "#define " + l : "", t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", t.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "", t.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", "#ifdef USE_INSTANCING", "	attribute mat4 instanceMatrix;", "#endif", "#ifdef USE_INSTANCING_COLOR", "	attribute vec3 instanceColor;", "#endif", "#ifdef USE_INSTANCING_MORPH", "	uniform sampler2D morphTexture;", "#endif", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_UV1", "	attribute vec2 uv1;", "#endif", "#ifdef USE_UV2", "	attribute vec2 uv2;", "#endif", "#ifdef USE_UV3", "	attribute vec2 uv3;", "#endif", "#ifdef USE_TANGENT", "	attribute vec4 tangent;", "#endif", "#if defined( USE_COLOR_ALPHA )", "	attribute vec4 color;", "#elif defined( USE_COLOR )", "	attribute vec3 color;", "#endif", "#ifdef USE_SKINNING", "	attribute vec4 skinIndex;", "	attribute vec4 skinWeight;", "#endif", `
`].filter(ds).join(`
`), m = [Oc(t), "#define SHADER_TYPE " + t.shaderType, "#define SHADER_NAME " + t.shaderName, f, t.useFog && t.fog ? "#define USE_FOG" : "", t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "", t.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "", t.map ? "#define USE_MAP" : "", t.matcap ? "#define USE_MATCAP" : "", t.envMap ? "#define USE_ENVMAP" : "", t.envMap ? "#define " + c : "", t.envMap ? "#define " + h : "", t.envMap ? "#define " + u : "", t.envMapPMREM ? "#define ENVMAP_MAX_LOD " + t.envMapMaxLod + ".0" : "", t.envMapPMREM ? "#define ENVMAP_SIZE " + t.envMapSize + ".0" : "", t.lightMap ? "#define USE_LIGHTMAP" : "", t.aoMap ? "#define USE_AOMAP" : "", t.bumpMap ? "#define USE_BUMPMAP" : "", t.normalMap ? "#define USE_NORMALMAP" : "", t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", t.packedNormalMap ? "#define USE_PACKED_NORMALMAP" : "", t.emissiveMap ? "#define USE_EMISSIVEMAP" : "", t.anisotropy ? "#define USE_ANISOTROPY" : "", t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", t.clearcoat ? "#define USE_CLEARCOAT" : "", t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", t.diffuseRoughness ? "#define USE_DIFFUSE_ROUGHNESS" : "", t.diffuseRoughnessMap ? "#define USE_DIFFUSE_ROUGHNESSMAP" : "", t.dispersion ? "#define USE_DISPERSION" : "", t.retroreflection ? "#define USE_RETROREFLECTION" : "", t.iridescence ? "#define USE_IRIDESCENCE" : "", t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", t.specularMap ? "#define USE_SPECULARMAP" : "", t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", t.metalnessMap ? "#define USE_METALNESSMAP" : "", t.alphaMap ? "#define USE_ALPHAMAP" : "", t.alphaTest ? "#define USE_ALPHATEST" : "", t.alphaHash ? "#define USE_ALPHAHASH" : "", t.sheen ? "#define USE_SHEEN" : "", t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", t.transmission ? "#define USE_TRANSMISSION" : "", t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", t.thicknessMap ? "#define USE_THICKNESSMAP" : "", t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "", t.vertexColors || t.instancingColor ? "#define USE_COLOR" : "", t.vertexAlphas || t.batchingColor ? "#define USE_COLOR_ALPHA" : "", t.vertexUv1s ? "#define USE_UV1" : "", t.vertexUv2s ? "#define USE_UV2" : "", t.vertexUv3s ? "#define USE_UV3" : "", t.pointsUvs ? "#define USE_POINTS_UV" : "", t.gradientMap ? "#define USE_GRADIENTMAP" : "", t.flatShading ? "#define FLAT_SHADED" : "", t.doubleSided ? "#define DOUBLE_SIDED" : "", t.flipSided ? "#define FLIP_SIDED" : "", t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", t.shadowMapEnabled ? "#define " + l : "", t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "", t.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "", t.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "", t.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", t.toneMapping !== Un ? "#define TONE_MAPPING" : "", t.toneMapping !== Un ? Ye.tonemapping_pars_fragment : "", t.toneMapping !== Un ? I0("toneMapping", t.toneMapping) : "", t.dithering ? "#define DITHERING" : "", t.opaque ? "#define OPAQUE" : "", Ye.colorspace_pars_fragment, L0("linearToOutputTexel", t.outputColorSpace), N0(), t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "", `
`].filter(ds).join(`
`)), a = To(a), a = Dc(a, t), a = Uc(a, t), o = To(o), o = Dc(o, t), o = Uc(o, t), a = Fc(a), o = Fc(o), t.isRawShaderMaterial !== !0 && (g = `#version 300 es
`, x = [d, "#define attribute in", "#define varying out", "#define texture2D texture"].join(`
`) + `
` + x, m = ["#define varying in", t.glslVersion === El ? "" : "layout(location = 0) out highp vec4 pc_fragColor;", t.glslVersion === El ? "" : "#define gl_FragColor pc_fragColor", "#define gl_FragDepthEXT gl_FragDepth", "#define texture2D texture", "#define textureCube texture", "#define texture2DProj textureProj", "#define texture2DLodEXT textureLod", "#define texture2DProjLodEXT textureProjLod", "#define textureCubeLodEXT textureLod", "#define texture2DGradEXT textureGrad", "#define texture2DProjGradEXT textureProjGrad", "#define textureCubeGradEXT textureGrad"].join(`
`) + `
` + m);
  const M = g + x + a,
    E = g + m + o,
    v = Pc(i, i.VERTEX_SHADER, M),
    A = Pc(i, i.FRAGMENT_SHADER, E);
  i.attachShader(p, v), i.attachShader(p, A), t.index0AttributeName !== void 0 ? i.bindAttribLocation(p, 0, t.index0AttributeName) : t.hasPositionAttribute === !0 && i.bindAttribLocation(p, 0, "position"), i.linkProgram(p);

  function b(R) {
    if (s.debug.checkShaderErrors) {
      const D = i.getProgramInfoLog(p) || "",
        F = i.getShaderInfoLog(v) || "",
        V = i.getShaderInfoLog(A) || "",
        L = D.trim(),
        k = F.trim(),
        X = V.trim();
      let H = !0,
        te = !0;
      if (i.getProgramParameter(p, i.LINK_STATUS) === !1)
        if (H = !1, typeof s.debug.onShaderError == "function") s.debug.onShaderError(i, p, v, A);
        else {
          const W = Nc(i, v, "vertex"),
            Q = Nc(i, A, "fragment");
          ze("WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(p, i.VALIDATE_STATUS) + `

Material Name: ` + R.name + `
Material Type: ` + R.type + `

Program Info Log: ` + L + `
` + W + `
` + Q)
        }
      else L !== "" ? Ce("WebGLProgram: Program Info Log:", L) : (k === "" || X === "") && (te = !1);
      te && (R.diagnostics = {
        runnable: H,
        programLog: L,
        vertexShader: {
          log: k,
          prefix: x
        },
        fragmentShader: {
          log: X,
          prefix: m
        }
      })
    }
    i.deleteShader(v), i.deleteShader(A), _ = new Sr(i, p), T = F0(i, p)
  }
  let _;
  this.getUniforms = function() {
    return _ === void 0 && b(this), _
  };
  let T;
  this.getAttributes = function() {
    return T === void 0 && b(this), T
  };
  let I = t.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return I === !1 && (I = i.getProgramParameter(p, A0)), I
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), i.deleteProgram(p), this.program = void 0
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = w0++, this.cacheKey = e, this.usedTimes = 1, this.program = p, this.vertexShader = v, this.fragmentShader = A, this
}
let K0 = 0;
class J0 {
  constructor() {
    this.shaderCache = new Map, this.materialCache = new Map
  }
  update(e, t, n) {
    const i = this._getShaderCacheForMaterial(e);
    return i.has(t) === !1 && (i.add(t), t.usedTimes++), i.has(n) === !1 && (i.add(n), n.usedTimes++), this
  }
  remove(e) {
    const t = this.materialCache.get(e);
    for (const n of t) n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(e), this
  }
  getVertexShaderStage(e) {
    return this._getShaderStage(e.vertexShader)
  }
  getFragmentShaderStage(e) {
    return this._getShaderStage(e.fragmentShader)
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear()
  }
  _getShaderCacheForMaterial(e) {
    const t = this.materialCache;
    let n = t.get(e);
    return n === void 0 && (n = new Set, t.set(e, n)), n
  }
  _getShaderStage(e) {
    const t = this.shaderCache;
    let n = t.get(e);
    return n === void 0 && (n = new Z0(e), t.set(e, n)), n
  }
}
class Z0 {
  constructor(e) {
    this.id = K0++, this.code = e, this.usedTimes = 0
  }
}

function $0(s) {
  return s === ui || s === Tr || s === Er
}

function Q0(s, e, t, n, i, r) {
  const a = new ko,
    o = new J0,
    l = new Set,
    c = [],
    h = new Map,
    u = n.logarithmicDepthBuffer,
    d = {
      MeshDepthMaterial: "depth",
      MeshDistanceMaterial: "distance",
      MeshNormalMaterial: "normal",
      MeshBasicMaterial: "basic",
      MeshLambertMaterial: "lambert",
      MeshPhongMaterial: "phong",
      MeshToonMaterial: "toon",
      MeshStandardMaterial: "physical",
      MeshPhysicalMaterial: "physical",
      MeshMatcapMaterial: "matcap",
      LineBasicMaterial: "basic",
      LineDashedMaterial: "dashed",
      PointsMaterial: "points",
      ShadowMaterial: "shadow",
      SpriteMaterial: "sprite"
    };

  function f(_) {
    return l.add(_), _ === 0 ? "uv" : `uv${_}`
  }

  function p(_, T, I, R, D, F) {
    const V = R.fog,
      L = D.geometry,
      k = _.isMeshStandardMaterial || _.isMeshLambertMaterial || _.isMeshPhongMaterial ? R.environment : null,
      X = _.isMeshStandardMaterial || _.isMeshLambertMaterial && !_.envMap || _.isMeshPhongMaterial && !_.envMap,
      H = e.get(_.envMap || k, X),
      te = d[_.type];
    let W = n.precision;
    _.precision !== null && (W = n.getMaxPrecision(_.precision), W !== _.precision && Ce("WebGLProgram.getParameters:", _.precision, "not supported, using", W, "instead."));
    const Q = L.morphAttributes.position || L.morphAttributes.normal || L.morphAttributes.color,
      ee = Q !== void 0 ? Q.length : 0;
    let Te = 0;
    L.morphAttributes.position !== void 0 && (Te = 1), L.morphAttributes.normal !== void 0 && (Te = 2), L.morphAttributes.color !== void 0 && (Te = 3);
    let Oe, Y, _e, Ee;
    if (te) {
      const ve = _n[te];
      Oe = ve.vertexShader, Y = ve.fragmentShader
    } else {
      Oe = _.vertexShader, Y = _.fragmentShader;
      const ve = o.getVertexShaderStage(_),
        lt = o.getFragmentShaderStage(_);
      o.update(_, ve, lt), _e = ve.id, Ee = lt.id
    }
    const Ne = s.getRenderTarget(),
      xe = s.state.buffers.depth.getReversed(),
      De = D.isInstancedMesh === !0,
      mt = D.isBatchedMesh === !0,
      Be = !!_.map,
      Je = !!_.matcap,
      je = !!H,
      j = je && H.isPMREMTexture === !0,
      ce = !!_.aoMap,
      ae = !!_.lightMap,
      ye = !!_.bumpMap && _.wireframe === !1,
      ge = !!_.normalMap,
      Ve = !!_.displacementMap,
      Le = !!_.emissiveMap,
      et = !!_.metalnessMap,
      tt = !!_.roughnessMap,
      rt = _.anisotropy > 0,
      U = _.clearcoat > 0,
      yt = _.diffuseRoughness > 0,
      $e = _.dispersion > 0,
      dt = _.retroreflectivity > 0,
      fe = _.iridescence > 0,
      St = _.sheen > 0,
      Ue = _.transmission > 0,
      ke = rt && !!_.anisotropyMap,
      w = U && !!_.clearcoatMap,
      S = U && !!_.clearcoatNormalMap,
      B = U && !!_.clearcoatRoughnessMap,
      ne = yt && !!_.diffuseRoughnessMap,
      $ = fe && !!_.iridescenceMap,
      oe = fe && !!_.iridescenceThicknessMap,
      pe = St && !!_.sheenColorMap,
      K = St && !!_.sheenRoughnessMap,
      J = !!_.specularMap,
      he = !!_.specularColorMap,
      C = !!_.specularIntensityMap,
      Z = Ue && !!_.transmissionMap,
      q = Ue && !!_.thicknessMap,
      ue = !!_.gradientMap,
      se = !!_.alphaMap,
      le = _.alphaTest > 0,
      Pe = !!_.alphaHash,
      qe = !!_.extensions;
    let ie = Un;
    _.toneMapped && (Ne === null || Ne.isXRRenderTarget === !0) && (ie = s.toneMapping);
    const Ie = j ? H.isCompressedCubeTexture ? H.image[0].mipmaps : H.mipmaps : null,
      Xe = {
        shaderID: te,
        shaderType: _.type,
        shaderName: _.name,
        vertexShader: Oe,
        fragmentShader: Y,
        defines: _.defines,
        customVertexShaderID: _e,
        customFragmentShaderID: Ee,
        isRawShaderMaterial: _.isRawShaderMaterial === !0,
        glslVersion: _.glslVersion,
        precision: W,
        batching: mt,
        batchingColor: mt && D._colorsTexture !== null,
        instancing: De,
        instancingColor: De && D.instanceColor !== null,
        instancingMorph: De && D.morphTexture !== null,
        outputColorSpace: Ne === null ? s.outputColorSpace : Ne.isXRRenderTarget === !0 ? Ne.texture.colorSpace : Qe.workingColorSpace,
        alphaToCoverage: !!_.alphaToCoverage,
        map: Be,
        matcap: Je,
        envMap: je,
        envMapMode: je && H.mapping,
        envMapPMREM: j,
        envMapMaxLod: j ? Ie.length - 1 : null,
        envMapSize: j ? Ie[0].width : null,
        aoMap: ce,
        lightMap: ae,
        bumpMap: ye,
        normalMap: ge,
        displacementMap: Ve,
        emissiveMap: Le,
        normalMapObjectSpace: ge && _.normalMapType === nd,
        normalMapTangentSpace: ge && _.normalMapType === Hi,
        packedNormalMap: ge && _.normalMapType === Hi && $0(_.normalMap.format),
        metalnessMap: et,
        roughnessMap: tt,
        anisotropy: rt,
        anisotropyMap: ke,
        clearcoat: U,
        clearcoatMap: w,
        clearcoatNormalMap: S,
        clearcoatRoughnessMap: B,
        diffuseRoughness: yt,
        diffuseRoughnessMap: ne,
        dispersion: $e,
        retroreflection: dt,
        iridescence: fe,
        iridescenceMap: $,
        iridescenceThicknessMap: oe,
        sheen: St,
        sheenColorMap: pe,
        sheenRoughnessMap: K,
        specularMap: J,
        specularColorMap: he,
        specularIntensityMap: C,
        transmission: Ue,
        transmissionMap: Z,
        thicknessMap: q,
        gradientMap: ue,
        opaque: _.transparent === !1 && _.blending === fs && _.alphaToCoverage === !1,
        alphaMap: se,
        alphaTest: le,
        alphaHash: Pe,
        combine: _.combine,
        mapUv: Be && f(_.map.channel),
        aoMapUv: ce && f(_.aoMap.channel),
        lightMapUv: ae && f(_.lightMap.channel),
        bumpMapUv: ye && f(_.bumpMap.channel),
        normalMapUv: ge && f(_.normalMap.channel),
        displacementMapUv: Ve && f(_.displacementMap.channel),
        emissiveMapUv: Le && f(_.emissiveMap.channel),
        metalnessMapUv: et && f(_.metalnessMap.channel),
        roughnessMapUv: tt && f(_.roughnessMap.channel),
        anisotropyMapUv: ke && f(_.anisotropyMap.channel),
        clearcoatMapUv: w && f(_.clearcoatMap.channel),
        clearcoatNormalMapUv: S && f(_.clearcoatNormalMap.channel),
        clearcoatRoughnessMapUv: B && f(_.clearcoatRoughnessMap.channel),
        diffuseRoughnessMapUv: ne && f(_.diffuseRoughnessMap.channel),
        iridescenceMapUv: $ && f(_.iridescenceMap.channel),
        iridescenceThicknessMapUv: oe && f(_.iridescenceThicknessMap.channel),
        sheenColorMapUv: pe && f(_.sheenColorMap.channel),
        sheenRoughnessMapUv: K && f(_.sheenRoughnessMap.channel),
        specularMapUv: J && f(_.specularMap.channel),
        specularColorMapUv: he && f(_.specularColorMap.channel),
        specularIntensityMapUv: C && f(_.specularIntensityMap.channel),
        transmissionMapUv: Z && f(_.transmissionMap.channel),
        thicknessMapUv: q && f(_.thicknessMap.channel),
        alphaMapUv: se && f(_.alphaMap.channel),
        vertexTangents: !!L.attributes.tangent && (ge || rt),
        vertexNormals: !!L.attributes.normal,
        vertexColors: _.vertexColors,
        vertexAlphas: _.vertexColors === !0 && !!L.attributes.color && L.attributes.color.itemSize === 4,
        pointsUvs: D.isPoints === !0 && !!L.attributes.uv && (Be || se),
        fog: !!V,
        useFog: _.fog === !0,
        fogExp2: !!V && V.isFogExp2,
        flatShading: _.wireframe === !1 && (_.flatShading === !0 || L.attributes.normal === void 0 && ge === !1 && (_.isMeshLambertMaterial || _.isMeshPhongMaterial || _.isMeshStandardMaterial || _.isMeshPhysicalMaterial)),
        sizeAttenuation: _.sizeAttenuation === !0,
        logarithmicDepthBuffer: u,
        reversedDepthBuffer: xe,
        skinning: D.isSkinnedMesh === !0,
        hasPositionAttribute: L.attributes.position !== void 0,
        morphTargets: L.morphAttributes.position !== void 0,
        morphNormals: L.morphAttributes.normal !== void 0,
        morphColors: L.morphAttributes.color !== void 0,
        morphTargetsCount: ee,
        morphTextureStride: Te,
        numSunLights: T.sun.length,
        numDirLights: T.directional.length,
        numPointLights: T.point.length,
        numSpotLights: T.spot.length,
        numSpotLightMaps: T.spotLightMap.length,
        numRectAreaLights: T.rectArea.length,
        numHemiLights: T.hemi.length,
        numSunLightShadows: T.sunShadowMap.length,
        numDirLightShadows: T.directionalShadowMap.length,
        numPointLightShadows: T.pointShadowMap.length,
        numSpotLightShadows: T.spotShadowMap.length,
        numSpotLightShadowsWithMaps: T.numSpotLightShadowsWithMaps,
        numLightProbes: T.numLightProbes,
        numLightProbeGrids: F.filter(ve => ve.texture !== null).length,
        numClippingPlanes: r.numPlanes,
        numClipIntersection: r.numIntersection,
        dithering: _.dithering,
        shadowMapEnabled: s.shadowMap.enabled && I.length > 0,
        shadowMapType: s.shadowMap.type,
        toneMapping: ie,
        decodeVideoTexture: Be && _.map.isVideoTexture === !0 && Qe.getTransfer(_.map.colorSpace) === ct,
        decodeVideoTextureEmissive: Le && _.emissiveMap.isVideoTexture === !0 && Qe.getTransfer(_.emissiveMap.colorSpace) === ct,
        premultipliedAlpha: _.premultipliedAlpha,
        doubleSided: _.side === xn,
        flipSided: _.side === Wt,
        useDepthPacking: _.depthPacking >= 0,
        depthPacking: _.depthPacking || 0,
        index0AttributeName: _.index0AttributeName,
        extensionClipCullDistance: qe && _.extensions.clipCullDistance === !0 && t.has("WEBGL_clip_cull_distance"),
        extensionMultiDraw: (qe && _.extensions.multiDraw === !0 || mt) && t.has("WEBGL_multi_draw"),
        rendererExtensionParallelShaderCompile: t.has("KHR_parallel_shader_compile"),
        customProgramCacheKey: _.customProgramCacheKey()
      };
    return Xe.vertexUv1s = l.has(1), Xe.vertexUv2s = l.has(2), Xe.vertexUv3s = l.has(3), l.clear(), Xe
  }

  function x(_) {
    const T = [];
    if (_.shaderID ? T.push(_.shaderID) : (T.push(_.customVertexShaderID), T.push(_.customFragmentShaderID)), _.defines !== void 0)
      for (const I in _.defines) T.push(I), T.push(_.defines[I]);
    return _.isRawShaderMaterial === !1 && (m(T, _), g(T, _), T.push(s.outputColorSpace)), T.push(_.customProgramCacheKey), T.join()
  }

  function m(_, T) {
    _.push(T.precision), _.push(T.outputColorSpace), _.push(T.envMapMode), _.push(T.envMapPMREM), _.push(T.envMapMaxLod), _.push(T.envMapSize), _.push(T.mapUv), _.push(T.alphaMapUv), _.push(T.lightMapUv), _.push(T.aoMapUv), _.push(T.bumpMapUv), _.push(T.normalMapUv), _.push(T.displacementMapUv), _.push(T.emissiveMapUv), _.push(T.metalnessMapUv), _.push(T.roughnessMapUv), _.push(T.anisotropyMapUv), _.push(T.clearcoatMapUv), _.push(T.clearcoatNormalMapUv), _.push(T.clearcoatRoughnessMapUv), _.push(T.diffuseRoughnessMapUv), _.push(T.iridescenceMapUv), _.push(T.iridescenceThicknessMapUv), _.push(T.sheenColorMapUv), _.push(T.sheenRoughnessMapUv), _.push(T.specularMapUv), _.push(T.specularColorMapUv), _.push(T.specularIntensityMapUv), _.push(T.transmissionMapUv), _.push(T.thicknessMapUv), _.push(T.combine), _.push(T.fogExp2), _.push(T.sizeAttenuation), _.push(T.morphTargetsCount), _.push(T.numSunLights), _.push(T.numDirLights), _.push(T.numPointLights), _.push(T.numSpotLights), _.push(T.numSpotLightMaps), _.push(T.numHemiLights), _.push(T.numRectAreaLights), _.push(T.numSunLightShadows), _.push(T.numDirLightShadows), _.push(T.numPointLightShadows), _.push(T.numSpotLightShadows), _.push(T.numSpotLightShadowsWithMaps), _.push(T.numLightProbes), _.push(T.numLightProbeGrids), _.push(T.shadowMapType), _.push(T.toneMapping), _.push(T.numClippingPlanes), _.push(T.numClipIntersection), _.push(T.depthPacking)
  }

  function g(_, T) {
    a.disableAll(), T.instancing && a.enable(0), T.instancingColor && a.enable(1), T.instancingMorph && a.enable(2), T.matcap && a.enable(3), T.envMap && a.enable(4), T.normalMapObjectSpace && a.enable(5), T.normalMapTangentSpace && a.enable(6), T.clearcoat && a.enable(7), T.iridescence && a.enable(8), T.alphaTest && a.enable(9), T.vertexColors && a.enable(10), T.vertexAlphas && a.enable(11), T.vertexUv1s && a.enable(12), T.vertexUv2s && a.enable(13), T.vertexUv3s && a.enable(14), T.vertexTangents && a.enable(15), T.anisotropy && a.enable(16), T.alphaHash && a.enable(17), T.batching && a.enable(18), T.dispersion && a.enable(19), T.retroreflection && a.enable(24), T.diffuseRoughness && a.enable(25), T.batchingColor && a.enable(20), T.gradientMap && a.enable(21), T.packedNormalMap && a.enable(22), T.vertexNormals && a.enable(23), _.push(a.mask), a.disableAll(), T.fog && a.enable(0), T.useFog && a.enable(1), T.flatShading && a.enable(2), T.logarithmicDepthBuffer && a.enable(3), T.reversedDepthBuffer && a.enable(4), T.skinning && a.enable(5), T.morphTargets && a.enable(6), T.morphNormals && a.enable(7), T.morphColors && a.enable(8), T.premultipliedAlpha && a.enable(9), T.shadowMapEnabled && a.enable(10), T.doubleSided && a.enable(11), T.flipSided && a.enable(12), T.useDepthPacking && a.enable(13), T.dithering && a.enable(14), T.transmission && a.enable(15), T.sheen && a.enable(16), T.opaque && a.enable(17), T.pointsUvs && a.enable(18), T.decodeVideoTexture && a.enable(19), T.decodeVideoTextureEmissive && a.enable(20), T.alphaToCoverage && a.enable(21), T.numLightProbeGrids > 0 && a.enable(22), T.hasPositionAttribute && a.enable(23), _.push(a.mask)
  }

  function M(_) {
    const T = d[_.type];
    let I;
    if (T) {
      const R = _n[T];
      I = Vf.clone(R.uniforms)
    } else I = _.uniforms;
    return I
  }

  function E(_, T) {
    let I = h.get(T);
    return I !== void 0 ? ++I.usedTimes : (I = new Y0(s, T, _, i), c.push(I), h.set(T, I)), I
  }

  function v(_) {
    if (--_.usedTimes === 0) {
      const T = c.indexOf(_);
      c[T] = c[c.length - 1], c.pop(), h.delete(_.cacheKey), _.destroy()
    }
  }

  function A(_) {
    o.remove(_)
  }

  function b() {
    o.dispose()
  }
  return {
    getParameters: p,
    getProgramCacheKey: x,
    getUniforms: M,
    acquireProgram: E,
    releaseProgram: v,
    releaseShaderCache: A,
    programs: c,
    dispose: b
  }
}

function j0() {
  let s = new WeakMap;

  function e(a) {
    return s.has(a)
  }

  function t(a) {
    let o = s.get(a);
    return o === void 0 && (o = {}, s.set(a, o)), o
  }

  function n(a) {
    s.delete(a)
  }

  function i(a, o, l) {
    s.get(a)[o] = l
  }

  function r() {
    s = new WeakMap
  }
  return {
    has: e,
    get: t,
    remove: n,
    update: i,
    dispose: r
  }
}

function ex(s, e) {
  return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.material.id !== e.material.id ? s.material.id - e.material.id : s.materialVariant !== e.materialVariant ? s.materialVariant - e.materialVariant : s.z !== e.z ? s.z - e.z : s.id - e.id
}

function Bc(s, e) {
  return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.z !== e.z ? e.z - s.z : s.id - e.id
}

function zc() {
  const s = [];
  let e = 0;
  const t = [],
    n = [],
    i = [];

  function r() {
    e = 0, t.length = 0, n.length = 0, i.length = 0
  }

  function a(d) {
    let f = 0;
    return d.isInstancedMesh && (f += 2), d.isSkinnedMesh && (f += 1), f
  }

  function o(d, f, p, x, m, g) {
    let M = s[e];
    return M === void 0 ? (M = {
      id: d.id,
      object: d,
      geometry: f,
      material: p,
      materialVariant: a(d),
      groupOrder: x,
      renderOrder: d.renderOrder,
      z: m,
      group: g
    }, s[e] = M) : (M.id = d.id, M.object = d, M.geometry = f, M.material = p, M.materialVariant = a(d), M.groupOrder = x, M.renderOrder = d.renderOrder, M.z = m, M.group = g), e++, M
  }

  function l(d, f, p, x, m, g, M) {
    M.reversedDepth === !0 && (m = -m);
    const E = o(d, f, p, x, m, g);
    p.transmission > 0 ? n.push(E) : p.transparent === !0 ? i.push(E) : t.push(E)
  }

  function c(d, f, p, x, m, g) {
    const M = o(d, f, p, x, m, g);
    p.transmission > 0 ? n.unshift(M) : p.transparent === !0 ? i.unshift(M) : t.unshift(M)
  }

  function h(d, f) {
    t.length > 1 && t.sort(d || ex), n.length > 1 && n.sort(f || Bc), i.length > 1 && i.sort(f || Bc)
  }

  function u() {
    for (let d = e, f = s.length; d < f; d++) {
      const p = s[d];
      if (p.id === null) break;
      p.id = null, p.object = null, p.geometry = null, p.material = null, p.group = null
    }
  }
  return {
    opaque: t,
    transmissive: n,
    transparent: i,
    init: r,
    push: l,
    unshift: c,
    finish: u,
    sort: h
  }
}

function tx() {
  let s = new WeakMap;

  function e(n, i) {
    const r = s.get(n);
    let a;
    return r === void 0 ? (a = new zc, s.set(n, [a])) : i >= r.length ? (a = new zc, r.push(a)) : a = r[i], a
  }

  function t() {
    s = new WeakMap
  }
  return {
    get: e,
    dispose: t
  }
}

function nx() {
  const s = {};
  return {
    get: function(e) {
      if (s[e.id] !== void 0) return s[e.id];
      let t;
      switch (e.type) {
        case "SunLight":
        case "DirectionalLight":
          t = {
            direction: new N,
            color: new Fe
          };
          break;
        case "SpotLight":
          t = {
            position: new N,
            direction: new N,
            color: new Fe,
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new N,
            color: new Fe,
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new N,
            skyColor: new Fe,
            groundColor: new Fe
          };
          break;
        case "RectAreaLight":
          t = {
            color: new Fe,
            position: new N,
            halfWidth: new N,
            halfHeight: new N
          };
          break
      }
      return s[e.id] = t, t
    }
  }
}

function ix() {
  const s = {};
  return {
    get: function(e) {
      if (s[e.id] !== void 0) return s[e.id];
      let t;
      switch (e.type) {
        case "SunLight":
        case "DirectionalLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new re
          };
          break;
        case "SpotLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new re
          };
          break;
        case "PointLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new re,
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break
      }
      return s[e.id] = t, t
    }
  }
}
let sx = 0;

function rx(s, e) {
  return (e.castShadow ? 2 : 0) - (s.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (s.map ? 1 : 0)
}

function ax(s) {
  const e = new nx,
    t = ix(),
    n = {
      version: 0,
      hash: {
        sunLength: -1,
        directionalLength: -1,
        pointLength: -1,
        spotLength: -1,
        rectAreaLength: -1,
        hemiLength: -1,
        numSunShadows: -1,
        numDirectionalShadows: -1,
        numPointShadows: -1,
        numSpotShadows: -1,
        numSpotMaps: -1,
        numLightProbes: -1
      },
      ambient: [0, 0, 0],
      probe: [],
      sun: [],
      sunShadow: [],
      sunShadowMap: [],
      sunShadowMatrix: [],
      sunShadowCascade: [],
      directional: [],
      directionalShadow: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotLightMap: [],
      spotShadow: [],
      spotShadowMap: [],
      spotLightMatrix: [],
      rectArea: [],
      rectAreaLTC1: null,
      rectAreaLTC2: null,
      point: [],
      pointShadow: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],
      numSpotLightShadowsWithMaps: 0,
      numLightProbes: 0
    };
  for (let c = 0; c < 9; c++) n.probe.push(new N);
  const i = new N,
    r = new We,
    a = new We;

  function o(c) {
    let h = 0,
      u = 0,
      d = 0;
    for (let F = 0; F < 9; F++) n.probe[F].set(0, 0, 0);
    let f = 0,
      p = 0,
      x = 0,
      m = 0,
      g = 0,
      M = 0,
      E = 0,
      v = 0,
      A = 0,
      b = 0,
      _ = 0,
      T = 0,
      I = 0,
      R = 0;
    c.sort(rx);
    for (let F = 0, V = c.length; F < V; F++) {
      const L = c[F],
        k = L.color,
        X = L.intensity,
        H = L.distance;
      let te = null;
      if (L.shadow && L.shadow.map && (L.shadow.map.texture.format === ui ? te = L.shadow.map.texture : te = L.shadow.map.depthTexture || L.shadow.map.texture), L.isAmbientLight) h += k.r * X, u += k.g * X, d += k.b * X;
      else if (L.isLightProbe) {
        for (let W = 0; W < 9; W++) n.probe[W].addScaledVector(L.sh.coefficients[W], X);
        R++
      } else if (L.isSunLight) {
        const W = e.get(L);
        if (W.color.copy(L.color).multiplyScalar(L.intensity), L.castShadow) {
          const Q = L.shadow,
            ee = t.get(L);
          ee.shadowIntensity = Q.intensity, ee.shadowBias = Q.bias, ee.shadowNormalBias = Q.normalBias, ee.shadowRadius = Q.radius, ee.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()), n.sunShadow[p] = ee, n.sunShadowMap[p] = te;
          const Te = Q.getViewportCount();
          for (let Oe = 0; Oe < Te; Oe++) n.sunShadowMatrix[x + Oe] = Q.getMatrix(Oe), n.sunShadowCascade[x + Oe] = Q._cascadeData[Oe];
          x += Te, p++
        }
        n.sun[f] = W, f++
      } else if (L.isDirectionalLight) {
        const W = e.get(L);
        if (W.color.copy(L.color).multiplyScalar(L.intensity), L.castShadow) {
          const Q = L.shadow,
            ee = t.get(L);
          ee.shadowIntensity = Q.intensity, ee.shadowBias = Q.bias, ee.shadowNormalBias = Q.normalBias, ee.shadowRadius = Q.radius, ee.shadowMapSize = Q.mapSize, n.directionalShadow[m] = ee, n.directionalShadowMap[m] = te, n.directionalShadowMatrix[m] = L.shadow.matrix, A++
        }
        n.directional[m] = W, m++
      } else if (L.isSpotLight) {
        const W = e.get(L);
        W.position.setFromMatrixPosition(L.matrixWorld), W.color.copy(k).multiplyScalar(X), W.distance = H, W.coneCos = Math.cos(L.angle), W.penumbraCos = Math.cos(L.angle * (1 - L.penumbra)), W.decay = L.decay, n.spot[M] = W;
        const Q = L.shadow;
        if (L.map && (n.spotLightMap[T] = L.map, T++, Q.updateMatrices(L), L.castShadow && I++), n.spotLightMatrix[M] = Q.matrix, L.castShadow) {
          const ee = t.get(L);
          ee.shadowIntensity = Q.intensity, ee.shadowBias = Q.bias, ee.shadowNormalBias = Q.normalBias, ee.shadowRadius = Q.radius, ee.shadowMapSize = Q.mapSize, n.spotShadow[M] = ee, n.spotShadowMap[M] = te, _++
        }
        M++
      } else if (L.isRectAreaLight) {
        const W = e.get(L);
        W.color.copy(k).multiplyScalar(X), W.halfWidth.set(L.width * .5, 0, 0), W.halfHeight.set(0, L.height * .5, 0), n.rectArea[E] = W, E++
      } else if (L.isPointLight) {
        const W = e.get(L);
        if (W.color.copy(L.color).multiplyScalar(L.intensity), W.distance = L.distance, W.decay = L.decay, L.castShadow) {
          const Q = L.shadow,
            ee = t.get(L);
          ee.shadowIntensity = Q.intensity, ee.shadowBias = Q.bias, ee.shadowNormalBias = Q.normalBias, ee.shadowRadius = Q.radius, ee.shadowMapSize = Q.mapSize, ee.shadowCameraNear = Q.camera.near, ee.shadowCameraFar = Q.camera.far, n.pointShadow[g] = ee, n.pointShadowMap[g] = te, n.pointShadowMatrix[g] = L.shadow.matrix, b++
        }
        n.point[g] = W, g++
      } else if (L.isHemisphereLight) {
        const W = e.get(L);
        W.skyColor.copy(L.color).multiplyScalar(X), W.groundColor.copy(L.groundColor).multiplyScalar(X), n.hemi[v] = W, v++
      }
    }
    E > 0 && (s.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = Me.LTC_FLOAT_1, n.rectAreaLTC2 = Me.LTC_FLOAT_2) : (n.rectAreaLTC1 = Me.LTC_HALF_1, n.rectAreaLTC2 = Me.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = u, n.ambient[2] = d;
    const D = n.hash;
    (D.sunLength !== f || D.directionalLength !== m || D.pointLength !== g || D.spotLength !== M || D.rectAreaLength !== E || D.hemiLength !== v || D.numSunShadows !== p || D.numDirectionalShadows !== A || D.numPointShadows !== b || D.numSpotShadows !== _ || D.numSpotMaps !== T || D.numLightProbes !== R) && (n.sun.length = f, n.directional.length = m, n.spot.length = M, n.rectArea.length = E, n.point.length = g, n.hemi.length = v, n.sunShadow.length = p, n.sunShadowMap.length = p, n.sunShadowMatrix.length = x, n.sunShadowCascade.length = x, n.directionalShadow.length = A, n.directionalShadowMap.length = A, n.directionalShadowMatrix.length = A, n.pointShadow.length = b, n.pointShadowMap.length = b, n.pointShadowMatrix.length = b, n.spotShadow.length = _, n.spotShadowMap.length = _, n.spotLightMatrix.length = _ + T - I, n.spotLightMap.length = T, n.numSpotLightShadowsWithMaps = I, n.numLightProbes = R, D.sunLength = f, D.directionalLength = m, D.pointLength = g, D.spotLength = M, D.rectAreaLength = E, D.hemiLength = v, D.numSunShadows = p, D.numDirectionalShadows = A, D.numPointShadows = b, D.numSpotShadows = _, D.numSpotMaps = T, D.numLightProbes = R, n.version = sx++)
  }

  function l(c, h) {
    let u = 0,
      d = 0,
      f = 0,
      p = 0,
      x = 0,
      m = 0;
    const g = h.matrixWorldInverse;
    for (let M = 0, E = c.length; M < E; M++) {
      const v = c[M];
      if (v.isSunLight) {
        const A = n.sun[u];
        A.direction.setFromMatrixPosition(v.matrixWorld), A.direction.transformDirection(g), u++
      } else if (v.isDirectionalLight) {
        const A = n.directional[d];
        A.direction.setFromMatrixPosition(v.matrixWorld), i.setFromMatrixPosition(v.target.matrixWorld), A.direction.sub(i), A.direction.transformDirection(g), d++
      } else if (v.isSpotLight) {
        const A = n.spot[p];
        A.position.setFromMatrixPosition(v.matrixWorld), A.position.applyMatrix4(g), A.direction.setFromMatrixPosition(v.matrixWorld), i.setFromMatrixPosition(v.target.matrixWorld), A.direction.sub(i), A.direction.transformDirection(g), p++
      } else if (v.isRectAreaLight) {
        const A = n.rectArea[x];
        A.position.setFromMatrixPosition(v.matrixWorld), A.position.applyMatrix4(g), a.identity(), r.copy(v.matrixWorld), r.premultiply(g), a.extractRotation(r), A.halfWidth.set(v.width * .5, 0, 0), A.halfHeight.set(0, v.height * .5, 0), A.halfWidth.applyMatrix4(a), A.halfHeight.applyMatrix4(a), x++
      } else if (v.isPointLight) {
        const A = n.point[f];
        A.position.setFromMatrixPosition(v.matrixWorld), A.position.applyMatrix4(g), f++
      } else if (v.isHemisphereLight) {
        const A = n.hemi[m];
        A.direction.setFromMatrixPosition(v.matrixWorld), A.direction.transformDirection(g), m++
      }
    }
  }
  return {
    setup: o,
    setupView: l,
    state: n
  }
}

function kc(s) {
  const e = new ax(s),
    t = [],
    n = [],
    i = [];

  function r(u) {
    h.camera = u, t.length = 0, n.length = 0, i.length = 0
  }

  function a(u) {
    u.isLightProbeGrid ? i.push(u) : t.push(u)
  }

  function o(u) {
    n.push(u)
  }

  function l() {
    e.setup(t), i.sort((u, d) => u.priority - d.priority || u.id - d.id)
  }

  function c(u) {
    e.setupView(t, u)
  }
  const h = {
    lightsArray: t,
    shadowsArray: n,
    lightProbeGridArray: i,
    camera: null,
    lights: e,
    transmissionRenderTarget: {},
    textureUnits: 0
  };
  return {
    init: r,
    state: h,
    setupLights: l,
    setupLightsView: c,
    pushLight: a,
    pushShadow: o
  }
}

function ox(s) {
  let e = new WeakMap;

  function t(i, r = 0) {
    const a = e.get(i);
    let o;
    return a === void 0 ? (o = new kc(s), e.set(i, [o])) : r >= a.length ? (o = new kc(s), a.push(o)) : o = a[r], o
  }

  function n() {
    e = new WeakMap
  }
  return {
    get: t,
    dispose: n
  }
}
const lx = `void main() {
	gl_Position = vec4( position, 1.0 );
}`,
  cx = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,
  hx = [new N(1, 0, 0), new N(-1, 0, 0), new N(0, 1, 0), new N(0, -1, 0), new N(0, 0, 1), new N(0, 0, -1)],
  ux = [new N(0, -1, 0), new N(0, -1, 0), new N(0, 0, 1), new N(0, 0, -1), new N(0, -1, 0), new N(0, -1, 0)],
  Hc = new We,
  as = new N,
  ya = new N;

function dx(s, e, t) {
  let n = new As;
  const i = new re,
    r = new re,
    a = new ht,
    o = new Kf,
    l = new Jf,
    c = {},
    h = t.maxTextureSize,
    u = {
      [$n]: Wt,
      [Wt]: $n,
      [xn]: xn
    },
    d = new fi({
      defines: {
        VSM_SAMPLES: 8
      },
      uniforms: {
        shadow_pass: {
          value: null
        },
        resolution: {
          value: new re
        },
        radius: {
          value: 4
        }
      },
      vertexShader: lx,
      fragmentShader: cx
    }),
    f = d.clone();
  f.defines.HORIZONTAL_PASS = 1;
  const p = new wt;
  p.setAttribute("position", new Ft(new Float32Array([-1, -1, .5, 3, -1, .5, -1, 3, .5]), 3));
  const x = new At(p, d),
    m = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = mr;
  let g = this.type;
  this.render = function(b, _, T) {
    if (m.enabled === !1 || m.autoUpdate === !1 && m.needsUpdate === !1 || b.length === 0) return;
    this.type === Ru && (Ce("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."), this.type = mr);
    const I = s.getRenderTarget(),
      R = s.getActiveCubeFace(),
      D = s.getActiveMipmapLevel(),
      F = s.state;
    F.setBlending(Ui), F.buffers.depth.getReversed() === !0 ? F.buffers.color.setClear(0, 0, 0, 0) : F.buffers.color.setClear(1, 1, 1, 1), F.buffers.depth.setTest(!0), F.setScissorTest(!1);
    const V = g !== this.type;
    V && _.traverse(function(L) {
      L.material && (Array.isArray(L.material) ? L.material.forEach(k => k.needsUpdate = !0) : L.material.needsUpdate = !0)
    });
    for (let L = 0, k = b.length; L < k; L++) {
      const X = b[L],
        H = X.shadow;
      if (H === void 0) {
        Ce("WebGLShadowMap:", X, "has no shadow.");
        continue
      }
      if (H.autoUpdate === !1 && H.needsUpdate === !1) continue;
      i.copy(H.mapSize);
      const te = H.getFrameExtents();
      i.multiply(te), r.copy(H.mapSize), (i.x > h || i.y > h) && (i.x > h && (r.x = Math.floor(h / te.x), i.x = r.x * te.x, H.mapSize.x = r.x), i.y > h && (r.y = Math.floor(h / te.y), i.y = r.y * te.y, H.mapSize.y = r.y));
      const W = s.state.buffers.depth.getReversed();
      if (H.camera._reversedDepth = W, H.map === null || V === !0) {
        if (H.map !== null && (H.map.depthTexture !== null && (H.map.depthTexture.dispose(), H.map.depthTexture = null), H.map.dispose()), this.type === ls) {
          if (X.isPointLight) {
            Ce("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");
            continue
          }
          H.map = new Mn(i.x, i.y, {
            format: ui,
            type: yn,
            minFilter: Ct,
            magFilter: Ct,
            generateMipmaps: !1
          }), H.map.texture.name = X.name + ".shadowMap", H.map.depthTexture = new Vi(i.x, i.y, jt), H.map.depthTexture.name = X.name + ".shadowMapDepth", H.map.depthTexture.format = Qn, H.map.depthTexture.compareFunction = null, H.map.depthTexture.minFilter = Rt, H.map.depthTexture.magFilter = Rt
        } else X.isPointLight ? (H.map = new tl(i.x), H.map.depthTexture = new Ih(i.x, Sn)) : (H.map = new Mn(i.x, i.y), H.map.depthTexture = new Vi(i.x, i.y, Sn)), H.map.depthTexture.name = X.name + ".shadowMap", H.map.depthTexture.format = Qn, this.type === mr ? (H.map.depthTexture.compareFunction = W ? mh : ph, H.map.depthTexture.minFilter = Ct, H.map.depthTexture.magFilter = Ct) : (H.map.depthTexture.compareFunction = null, H.map.depthTexture.minFilter = Rt, H.map.depthTexture.magFilter = Rt);
        H.camera.updateProjectionMatrix()
      }
      H.map.isWebGLCubeRenderTarget !== !0 && (H.map.width !== i.x || H.map.height !== i.y) && H.map.setSize(i.x, i.y);
      const Q = H.map.isWebGLCubeRenderTarget ? 6 : H.getViewportCount();
      X.isPointLight !== !0 && H.updateMatrices(X, T);
      const ee = H.camera.layers.mask & 4294967294 ? H.camera.layers : T.layers;
      for (let Te = 0; Te < Q; Te++) {
        const Oe = H.getCamera(Te);
        if (X.isPointLight) {
          const Y = H.camera,
            _e = H.matrix,
            Ee = X.distance || Y.far;
          Ee !== Y.far && (Y.far = Ee, Y.updateProjectionMatrix()), as.setFromMatrixPosition(X.matrixWorld), Y.position.copy(as), ya.copy(Y.position), ya.add(hx[Te]), Y.up.copy(ux[Te]), Y.lookAt(ya), Y.updateMatrixWorld(), _e.makeTranslation(-as.x, -as.y, -as.z), Hc.multiplyMatrices(Y.projectionMatrix, Y.matrixWorldInverse), H._frustum.setFromProjectionMatrix(Hc, Y.coordinateSystem, Y.reversedDepth)
        }
        if (H.map.isWebGLCubeRenderTarget) s.setRenderTarget(H.map, Te), s.clear();
        else {
          Te === 0 && (s.setRenderTarget(H.map), s.clear());
          const Y = H.getViewport(Te);
          a.set(r.x * Y.x, r.y * Y.y, r.x * Y.z, r.y * Y.w), F.viewport(a)
        }
        n = H.getFrustum(Te), v(_, T, Oe, X, ee, this.type)
      }
      H.isPointLightShadow !== !0 && this.type === ls && M(H, T), H.needsUpdate = !1
    }
    g = this.type, m.needsUpdate = !1, s.setRenderTarget(I, R, D)
  };

  function M(b, _) {
    const T = e.update(x);
    d.defines.VSM_SAMPLES !== b.blurSamples && (d.defines.VSM_SAMPLES = b.blurSamples, f.defines.VSM_SAMPLES = b.blurSamples, d.needsUpdate = !0, f.needsUpdate = !0), b.mapPass === null ? b.mapPass = new Mn(i.x, i.y, {
      format: ui,
      type: yn
    }) : (b.mapPass.width !== b.map.width || b.mapPass.height !== b.map.height) && b.mapPass.setSize(b.map.width, b.map.height), d.uniforms.shadow_pass.value = b.map.depthTexture, d.uniforms.resolution.value.set(b.map.width, b.map.height), d.uniforms.radius.value = b.radius, s.setRenderTarget(b.mapPass), s.clear(), s.renderBufferDirect(_, null, T, d, x, null), f.uniforms.shadow_pass.value = b.mapPass.texture, f.uniforms.resolution.value.set(b.map.width, b.map.height), f.uniforms.radius.value = b.radius, s.setRenderTarget(b.map), s.clear(), s.renderBufferDirect(_, null, T, f, x, null)
  }

  function E(b, _, T, I) {
    let R = null;
    const D = T.isPointLight === !0 ? b.customDistanceMaterial : b.customDepthMaterial;
    if (D !== void 0) R = D;
    else if (R = T.isPointLight === !0 ? l : o, s.localClippingEnabled && _.clipShadows === !0 && Array.isArray(_.clippingPlanes) && _.clippingPlanes.length !== 0 || _.displacementMap && _.displacementScale !== 0 || _.alphaMap && _.alphaTest > 0 || _.map && _.alphaTest > 0 || _.alphaToCoverage === !0) {
      const F = R.uuid,
        V = _.uuid;
      let L = c[F];
      L === void 0 && (L = {}, c[F] = L);
      let k = L[V];
      k === void 0 && (k = R.clone(), L[V] = k, _.addEventListener("dispose", A)), R = k
    }
    if (R.visible = _.visible, R.wireframe = _.wireframe, I === ls ? R.side = _.shadowSide !== null ? _.shadowSide : _.side : R.side = _.shadowSide !== null ? _.shadowSide : u[_.side], R.alphaMap = _.alphaMap, R.alphaTest = _.alphaToCoverage === !0 ? .5 : _.alphaTest, R.map = _.map, R.clipShadows = _.clipShadows, R.clippingPlanes = _.clippingPlanes, R.clipIntersection = _.clipIntersection, R.displacementMap = _.displacementMap, R.displacementScale = _.displacementScale, R.displacementBias = _.displacementBias, R.wireframeLinewidth = _.wireframeLinewidth, R.linewidth = _.linewidth, T.isPointLight === !0 && R.isMeshDistanceMaterial === !0) {
      const F = s.properties.get(R);
      F.light = T
    }
    return R
  }

  function v(b, _, T, I, R, D) {
    if (b.visible === !1) return;
    if (b.layers.test(R) && (b.isMesh || b.isLine || b.isPoints) && (b.castShadow || b.receiveShadow && D === ls) && (!b.frustumCulled || b.intersectsFrustum(n))) {
      b.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse, b.matrixWorld);
      const L = e.update(b),
        k = b.material;
      if (Array.isArray(k)) {
        const X = L.groups;
        for (let H = 0, te = X.length; H < te; H++) {
          const W = X[H],
            Q = k[W.materialIndex];
          if (Q && Q.visible) {
            const ee = E(b, Q, I, D);
            b.onBeforeShadow(s, b, _, T, L, ee, W), s.renderBufferDirect(T, null, L, ee, b, W), b.onAfterShadow(s, b, _, T, L, ee, W)
          }
        }
      } else if (k.visible) {
        const X = E(b, k, I, D);
        b.onBeforeShadow(s, b, _, T, L, X, null), s.renderBufferDirect(T, null, L, X, b, null), b.onAfterShadow(s, b, _, T, L, X, null)
      }
    }
    const V = b.children;
    for (let L = 0, k = V.length; L < k; L++) v(V[L], _, T, I, R, D)
  }

  function A(b) {
    b.target.removeEventListener("dispose", A);
    for (const T in c) {
      const I = c[T],
        R = b.target.uuid;
      R in I && (I[R].dispose(), delete I[R])
    }
  }
}

function fx(s, e) {
  function t() {
    let C = !1;
    const Z = new ht;
    let q = null;
    const ue = new ht(0, 0, 0, 0);
    return {
      setMask: function(se) {
        q !== se && !C && (s.colorMask(se, se, se, se), q = se)
      },
      setLocked: function(se) {
        C = se
      },
      setClear: function(se, le, Pe, qe, ie) {
        ie === !0 && (se *= qe, le *= qe, Pe *= qe), Z.set(se, le, Pe, qe), ue.equals(Z) === !1 && (s.clearColor(se, le, Pe, qe), ue.copy(Z))
      },
      reset: function() {
        C = !1, q = null, ue.set(-1, 0, 0, 0)
      }
    }
  }

  function n() {
    let C = !1,
      Z = !1,
      q = null,
      ue = null,
      se = null;
    return {
      setReversed: function(le) {
        if (Z !== le) {
          const Pe = e.get("EXT_clip_control");
          le ? Pe.clipControlEXT(Pe.LOWER_LEFT_EXT, Pe.ZERO_TO_ONE_EXT) : Pe.clipControlEXT(Pe.LOWER_LEFT_EXT, Pe.NEGATIVE_ONE_TO_ONE_EXT), Z = le;
          const qe = se;
          se = null, this.setClear(qe)
        }
      },
      getReversed: function() {
        return Z
      },
      setTest: function(le) {
        le ? xe(s.DEPTH_TEST) : De(s.DEPTH_TEST)
      },
      setMask: function(le) {
        q !== le && !C && (s.depthMask(le), q = le)
      },
      setFunc: function(le) {
        if (Z && (le = fd[le]), ue !== le) {
          switch (le) {
            case La:
              s.depthFunc(s.NEVER);
              break;
            case Pa:
              s.depthFunc(s.ALWAYS);
              break;
            case Ia:
              s.depthFunc(s.LESS);
              break;
            case vs:
              s.depthFunc(s.LEQUAL);
              break;
            case Na:
              s.depthFunc(s.EQUAL);
              break;
            case Da:
              s.depthFunc(s.GEQUAL);
              break;
            case Ua:
              s.depthFunc(s.GREATER);
              break;
            case Fa:
              s.depthFunc(s.NOTEQUAL);
              break;
            default:
              s.depthFunc(s.LEQUAL)
          }
          ue = le
        }
      },
      setLocked: function(le) {
        C = le
      },
      setClear: function(le) {
        se !== le && (se = le, Z && (le = 1 - le), s.clearDepth(le))
      },
      reset: function() {
        C = !1, q = null, ue = null, se = null, Z = !1
      }
    }
  }

  function i() {
    let C = !1,
      Z = null,
      q = null,
      ue = null,
      se = null,
      le = null,
      Pe = null,
      qe = null,
      ie = null;
    return {
      setTest: function(Ie) {
        C || (Ie ? xe(s.STENCIL_TEST) : De(s.STENCIL_TEST))
      },
      setMask: function(Ie) {
        Z !== Ie && !C && (s.stencilMask(Ie), Z = Ie)
      },
      setFunc: function(Ie, Xe, ve) {
        (q !== Ie || ue !== Xe || se !== ve) && (s.stencilFunc(Ie, Xe, ve), q = Ie, ue = Xe, se = ve)
      },
      setOp: function(Ie, Xe, ve) {
        (le !== Ie || Pe !== Xe || qe !== ve) && (s.stencilOp(Ie, Xe, ve), le = Ie, Pe = Xe, qe = ve)
      },
      setLocked: function(Ie) {
        C = Ie
      },
      setClear: function(Ie) {
        ie !== Ie && (s.clearStencil(Ie), ie = Ie)
      },
      reset: function() {
        C = !1, Z = null, q = null, ue = null, se = null, le = null, Pe = null, qe = null, ie = null
      }
    }
  }
  const r = new t,
    a = new n,
    o = new i;
  let l = {};
  const c = new WeakMap;
  let h = {},
    u = {},
    d = {},
    f = new WeakMap,
    p = [],
    x = null,
    m = !1,
    g = null,
    M = null,
    E = null,
    v = null,
    A = null,
    b = null,
    _ = null,
    T = new Fe(0, 0, 0),
    I = 0,
    R = !1,
    D = null,
    F = null,
    V = null,
    L = null,
    k = null;
  const X = s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let H = !1,
    te = 0;
  const W = s.getParameter(s.VERSION);
  W.indexOf("WebGL") !== -1 ? (te = parseFloat(/^WebGL (\d)/.exec(W)[1]), H = te >= 1) : W.indexOf("OpenGL ES") !== -1 && (te = parseFloat(/^OpenGL ES (\d)/.exec(W)[1]), H = te >= 2);
  let Q = null,
    ee = {};
  const Te = s.getParameter(s.SCISSOR_BOX),
    Oe = s.getParameter(s.VIEWPORT),
    Y = new ht().fromArray(Te),
    _e = new ht().fromArray(Oe);

  function Ee(C, Z, q, ue) {
    const se = new Uint8Array(4),
      le = s.createTexture();
    s.bindTexture(C, le), s.texParameteri(C, s.TEXTURE_MIN_FILTER, s.NEAREST), s.texParameteri(C, s.TEXTURE_MAG_FILTER, s.NEAREST);
    for (let Pe = 0; Pe < q; Pe++) C === s.TEXTURE_3D || C === s.TEXTURE_2D_ARRAY ? s.texImage3D(Z, 0, s.RGBA, 1, 1, ue, 0, s.RGBA, s.UNSIGNED_BYTE, se) : s.texImage2D(Z + Pe, 0, s.RGBA, 1, 1, 0, s.RGBA, s.UNSIGNED_BYTE, se);
    return le
  }
  const Ne = {};
  Ne[s.TEXTURE_2D] = Ee(s.TEXTURE_2D, s.TEXTURE_2D, 1), Ne[s.TEXTURE_CUBE_MAP] = Ee(s.TEXTURE_CUBE_MAP, s.TEXTURE_CUBE_MAP_POSITIVE_X, 6), Ne[s.TEXTURE_2D_ARRAY] = Ee(s.TEXTURE_2D_ARRAY, s.TEXTURE_2D_ARRAY, 1, 1), Ne[s.TEXTURE_3D] = Ee(s.TEXTURE_3D, s.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), a.setClear(1), o.setClear(0), xe(s.DEPTH_TEST), a.setFunc(vs), ye(!1), ge(xl), xe(s.CULL_FACE), ce(Ui);

  function xe(C) {
    h[C] !== !0 && (s.enable(C), h[C] = !0)
  }

  function De(C) {
    h[C] !== !1 && (s.disable(C), h[C] = !1)
  }

  function mt(C, Z) {
    return d[C] !== Z ? (s.bindFramebuffer(C, Z), d[C] = Z, C === s.DRAW_FRAMEBUFFER && (d[s.FRAMEBUFFER] = Z), C === s.FRAMEBUFFER && (d[s.DRAW_FRAMEBUFFER] = Z), !0) : !1
  }

  function Be(C, Z) {
    let q = p,
      ue = !1;
    if (C) {
      q = f.get(Z), q === void 0 && (q = [], f.set(Z, q));
      const se = C.textures;
      if (q.length !== se.length || q[0] !== s.COLOR_ATTACHMENT0) {
        for (let le = 0, Pe = se.length; le < Pe; le++) q[le] = s.COLOR_ATTACHMENT0 + le;
        q.length = se.length, ue = !0
      }
    } else q[0] !== s.BACK && (q[0] = s.BACK, ue = !0);
    ue && s.drawBuffers(q)
  }

  function Je(C) {
    return x !== C ? (s.useProgram(C), x = C, !0) : !1
  }
  const je = {
    [Li]: s.FUNC_ADD,
    [Lu]: s.FUNC_SUBTRACT,
    [Pu]: s.FUNC_REVERSE_SUBTRACT
  };
  je[Iu] = s.MIN, je[Nu] = s.MAX;
  const j = {
    [Du]: s.ZERO,
    [Uu]: s.ONE,
    [Fu]: s.SRC_COLOR,
    [Zc]: s.SRC_ALPHA,
    [Gu]: s.SRC_ALPHA_SATURATE,
    [ku]: s.DST_COLOR,
    [Bu]: s.DST_ALPHA,
    [Ou]: s.ONE_MINUS_SRC_COLOR,
    [$c]: s.ONE_MINUS_SRC_ALPHA,
    [Hu]: s.ONE_MINUS_DST_COLOR,
    [zu]: s.ONE_MINUS_DST_ALPHA,
    [Vu]: s.CONSTANT_COLOR,
    [Wu]: s.ONE_MINUS_CONSTANT_COLOR,
    [Xu]: s.CONSTANT_ALPHA,
    [qu]: s.ONE_MINUS_CONSTANT_ALPHA
  };

  function ce(C, Z, q, ue, se, le, Pe, qe, ie, Ie) {
    if (C === Ui) {
      m === !0 && (De(s.BLEND), m = !1);
      return
    }
    if (m === !1 && (xe(s.BLEND), m = !0), C !== Cu) {
      if (C !== g || Ie !== R) {
        if ((M !== Li || A !== Li) && (s.blendEquation(s.FUNC_ADD), M = Li, A = Li), Ie) switch (C) {
          case fs:
            s.blendFuncSeparate(s.ONE, s.ONE_MINUS_SRC_ALPHA, s.ONE, s.ONE_MINUS_SRC_ALPHA);
            break;
          case vl:
            s.blendFunc(s.ONE, s.ONE);
            break;
          case Ml:
            s.blendFuncSeparate(s.ZERO, s.ONE_MINUS_SRC_COLOR, s.ZERO, s.ONE);
            break;
          case Sl:
            s.blendFuncSeparate(s.DST_COLOR, s.ONE_MINUS_SRC_ALPHA, s.ZERO, s.ONE);
            break;
          default:
            ze("WebGLState: Invalid blending: ", C);
            break
        } else switch (C) {
          case fs:
            s.blendFuncSeparate(s.SRC_ALPHA, s.ONE_MINUS_SRC_ALPHA, s.ONE, s.ONE_MINUS_SRC_ALPHA);
            break;
          case vl:
            s.blendFuncSeparate(s.SRC_ALPHA, s.ONE, s.ONE, s.ONE);
            break;
          case Ml:
            ze("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
            break;
          case Sl:
            ze("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
            break;
          default:
            ze("WebGLState: Invalid blending: ", C);
            break
        }
        E = null, v = null, b = null, _ = null, T.set(0, 0, 0), I = 0, g = C, R = Ie
      }
      return
    }
    se = se || Z, le = le || q, Pe = Pe || ue, (Z !== M || se !== A) && (s.blendEquationSeparate(je[Z], je[se]), M = Z, A = se), (q !== E || ue !== v || le !== b || Pe !== _) && (s.blendFuncSeparate(j[q], j[ue], j[le], j[Pe]), E = q, v = ue, b = le, _ = Pe), (qe.equals(T) === !1 || ie !== I) && (s.blendColor(qe.r, qe.g, qe.b, ie), T.copy(qe), I = ie), g = C, R = !1
  }

  function ae(C, Z) {
    C.side === xn ? De(s.CULL_FACE) : xe(s.CULL_FACE);
    let q = C.side === Wt;
    Z && (q = !q), ye(q), C.blending === fs && C.transparent === !1 ? ce(Ui) : ce(C.blending, C.blendEquation, C.blendSrc, C.blendDst, C.blendEquationAlpha, C.blendSrcAlpha, C.blendDstAlpha, C.blendColor, C.blendAlpha, C.premultipliedAlpha), a.setFunc(C.depthFunc), a.setTest(C.depthTest), a.setMask(C.depthWrite), r.setMask(C.colorWrite);
    const ue = C.stencilWrite;
    o.setTest(ue), ue && (o.setMask(C.stencilWriteMask), o.setFunc(C.stencilFunc, C.stencilRef, C.stencilFuncMask), o.setOp(C.stencilFail, C.stencilZFail, C.stencilZPass)), Le(C.polygonOffset, C.polygonOffsetFactor, C.polygonOffsetUnits), C.alphaToCoverage === !0 ? xe(s.SAMPLE_ALPHA_TO_COVERAGE) : De(s.SAMPLE_ALPHA_TO_COVERAGE)
  }

  function ye(C) {
    D !== C && (C ? s.frontFace(s.CW) : s.frontFace(s.CCW), D = C)
  }

  function ge(C) {
    C !== Au ? (xe(s.CULL_FACE), C !== F && (C === xl ? s.cullFace(s.BACK) : C === wu ? s.cullFace(s.FRONT) : s.cullFace(s.FRONT_AND_BACK))) : De(s.CULL_FACE), F = C
  }

  function Ve(C) {
    C !== V && (H && s.lineWidth(C), V = C)
  }

  function Le(C, Z, q) {
    C ? (xe(s.POLYGON_OFFSET_FILL), (L !== Z || k !== q) && (L = Z, k = q, a.getReversed() && (Z = -Z, q = -q), s.polygonOffset(Z, q))) : De(s.POLYGON_OFFSET_FILL)
  }

  function et(C) {
    C ? xe(s.SCISSOR_TEST) : De(s.SCISSOR_TEST)
  }

  function tt(C) {
    C === void 0 && (C = s.TEXTURE0 + X - 1), Q !== C && (s.activeTexture(C), Q = C)
  }

  function rt(C, Z, q) {
    q === void 0 && (Q === null ? q = s.TEXTURE0 + X - 1 : q = Q);
    let ue = ee[q];
    ue === void 0 && (ue = {
      type: void 0,
      texture: void 0
    }, ee[q] = ue), (ue.type !== C || ue.texture !== Z) && (Q !== q && (s.activeTexture(q), Q = q), s.bindTexture(C, Z || Ne[C]), ue.type = C, ue.texture = Z)
  }

  function U() {
    const C = ee[Q];
    C !== void 0 && C.type !== void 0 && (s.bindTexture(C.type, null), C.type = void 0, C.texture = void 0)
  }

  function yt() {
    try {
      s.compressedTexImage2D(...arguments)
    } catch (C) {
      ze("WebGLState:", C)
    }
  }

  function $e() {
    try {
      s.compressedTexImage3D(...arguments)
    } catch (C) {
      ze("WebGLState:", C)
    }
  }

  function dt() {
    try {
      s.texSubImage2D(...arguments)
    } catch (C) {
      ze("WebGLState:", C)
    }
  }

  function fe() {
    try {
      s.texSubImage3D(...arguments)
    } catch (C) {
      ze("WebGLState:", C)
    }
  }

  function St() {
    try {
      s.compressedTexSubImage2D(...arguments)
    } catch (C) {
      ze("WebGLState:", C)
    }
  }

  function Ue() {
    try {
      s.compressedTexSubImage3D(...arguments)
    } catch (C) {
      ze("WebGLState:", C)
    }
  }

  function ke() {
    try {
      s.texStorage2D(...arguments)
    } catch (C) {
      ze("WebGLState:", C)
    }
  }

  function w() {
    try {
      s.texStorage3D(...arguments)
    } catch (C) {
      ze("WebGLState:", C)
    }
  }

  function S() {
    try {
      s.texImage2D(...arguments)
    } catch (C) {
      ze("WebGLState:", C)
    }
  }

  function B() {
    try {
      s.texImage3D(...arguments)
    } catch (C) {
      ze("WebGLState:", C)
    }
  }

  function ne(C) {
    return u[C] !== void 0 ? u[C] : s.getParameter(C)
  }

  function $(C, Z) {
    u[C] !== Z && (s.pixelStorei(C, Z), u[C] = Z)
  }

  function oe(C) {
    Y.equals(C) === !1 && (s.scissor(C.x, C.y, C.z, C.w), Y.copy(C))
  }

  function pe(C) {
    _e.equals(C) === !1 && (s.viewport(C.x, C.y, C.z, C.w), _e.copy(C))
  }

  function K(C, Z) {
    let q = c.get(Z);
    q === void 0 && (q = new WeakMap, c.set(Z, q));
    let ue = q.get(C);
    ue === void 0 && (ue = s.getUniformBlockIndex(Z, C.name), s.uniformBlockBinding(Z, ue, ue), q.set(C, ue))
  }

  function J(C, Z, q) {
    const se = c.get(Z).get(C);
    l[se] !== q && (s.bindBufferBase(s.UNIFORM_BUFFER, se, q), l[se] = q)
  }

  function he() {
    s.disable(s.BLEND), s.disable(s.CULL_FACE), s.disable(s.DEPTH_TEST), s.disable(s.POLYGON_OFFSET_FILL), s.disable(s.SCISSOR_TEST), s.disable(s.STENCIL_TEST), s.disable(s.SAMPLE_ALPHA_TO_COVERAGE), s.blendEquation(s.FUNC_ADD), s.blendFunc(s.ONE, s.ZERO), s.blendFuncSeparate(s.ONE, s.ZERO, s.ONE, s.ZERO), s.blendColor(0, 0, 0, 0), s.colorMask(!0, !0, !0, !0), s.clearColor(0, 0, 0, 0), s.depthMask(!0), s.depthFunc(s.LESS), a.setReversed(!1), s.clearDepth(1), s.stencilMask(4294967295), s.stencilFunc(s.ALWAYS, 0, 4294967295), s.stencilOp(s.KEEP, s.KEEP, s.KEEP), s.clearStencil(0), s.cullFace(s.BACK), s.frontFace(s.CCW), s.polygonOffset(0, 0), s.activeTexture(s.TEXTURE0), s.bindFramebuffer(s.FRAMEBUFFER, null), s.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), s.bindFramebuffer(s.READ_FRAMEBUFFER, null), s.useProgram(null), s.lineWidth(1), s.scissor(0, 0, s.canvas.width, s.canvas.height), s.viewport(0, 0, s.canvas.width, s.canvas.height), s.pixelStorei(s.PACK_ALIGNMENT, 4), s.pixelStorei(s.UNPACK_ALIGNMENT, 4), s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, !1), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, s.BROWSER_DEFAULT_WEBGL), s.pixelStorei(s.PACK_ROW_LENGTH, 0), s.pixelStorei(s.PACK_SKIP_PIXELS, 0), s.pixelStorei(s.PACK_SKIP_ROWS, 0), s.pixelStorei(s.UNPACK_ROW_LENGTH, 0), s.pixelStorei(s.UNPACK_IMAGE_HEIGHT, 0), s.pixelStorei(s.UNPACK_SKIP_PIXELS, 0), s.pixelStorei(s.UNPACK_SKIP_ROWS, 0), s.pixelStorei(s.UNPACK_SKIP_IMAGES, 0), h = {}, u = {}, Q = null, ee = {}, d = {}, l = {}, f = new WeakMap, p = [], x = null, m = !1, g = null, M = null, E = null, v = null, A = null, b = null, _ = null, T = new Fe(0, 0, 0), I = 0, R = !1, D = null, F = null, V = null, L = null, k = null, Y.set(0, 0, s.canvas.width, s.canvas.height), _e.set(0, 0, s.canvas.width, s.canvas.height), r.reset(), a.reset(), o.reset()
  }
  return {
    buffers: {
      color: r,
      depth: a,
      stencil: o
    },
    enable: xe,
    disable: De,
    bindFramebuffer: mt,
    drawBuffers: Be,
    useProgram: Je,
    setBlending: ce,
    setMaterial: ae,
    setFlipSided: ye,
    setCullFace: ge,
    setLineWidth: Ve,
    setPolygonOffset: Le,
    setScissorTest: et,
    activeTexture: tt,
    bindTexture: rt,
    unbindTexture: U,
    compressedTexImage2D: yt,
    compressedTexImage3D: $e,
    texImage2D: S,
    texImage3D: B,
    pixelStorei: $,
    getParameter: ne,
    updateUBOMapping: K,
    uniformBlockBinding: J,
    texStorage2D: ke,
    texStorage3D: w,
    texSubImage2D: dt,
    texSubImage3D: fe,
    compressedTexSubImage2D: St,
    compressedTexSubImage3D: Ue,
    scissor: oe,
    viewport: pe,
    reset: he
  }
}

function px(s, e, t, n, i, r, a) {
  const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null,
    l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent),
    c = new re,
    h = new WeakMap,
    u = new Set;
  let d;
  const f = new WeakMap,
    p = new Set,
    x = new FinalizationRegistry(w => p.delete(w));
  let m = !1;
  try {
    m = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null
  } catch {}

  function g(w, S) {
    return m ? new OffscreenCanvas(w, S) : bs("canvas")
  }

  function M(w, S, B) {
    let ne = 1;
    const $ = ke(w);
    if (($.width > B || $.height > B) && (ne = B / Math.max($.width, $.height)), ne < 1)
      if (typeof HTMLImageElement < "u" && w instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && w instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && w instanceof ImageBitmap || typeof VideoFrame < "u" && w instanceof VideoFrame) {
        const oe = Math.floor(ne * $.width),
          pe = Math.floor(ne * $.height);
        d === void 0 && (d = g(oe, pe));
        const K = S ? g(oe, pe) : d;
        return K.width = oe, K.height = pe, K.getContext("2d").drawImage(w, 0, 0, oe, pe), Ce("WebGLRenderer: Texture has been resized from (" + $.width + "x" + $.height + ") to (" + oe + "x" + pe + ")."), K
      } else return "data" in w && Ce("WebGLRenderer: Image in DataTexture is too big (" + $.width + "x" + $.height + ")."), w;
    return w
  }

  function E(w) {
    return w.generateMipmaps
  }

  function v(w) {
    s.generateMipmap(w)
  }

  function A(w) {
    return w.isWebGLCubeRenderTarget ? s.TEXTURE_CUBE_MAP : w.isWebGL3DRenderTarget ? s.TEXTURE_3D : w.isWebGLArrayRenderTarget || w.isCompressedArrayTexture ? s.TEXTURE_2D_ARRAY : s.TEXTURE_2D
  }

  function b(w, S, B, ne, $, oe = !1) {
    if (w !== null) {
      if (s[w] !== void 0) return s[w];
      Ce("WebGLRenderer: Attempt to use non-existing WebGL internal format '" + w + "'")
    }
    let pe;
    ne && (pe = e.get("EXT_texture_norm16"), pe || Ce("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));
    let K = S;
    if (S === s.RED && (B === s.FLOAT && (K = s.R32F), B === s.HALF_FLOAT && (K = s.R16F), B === s.UNSIGNED_BYTE && (K = s.R8), B === s.UNSIGNED_SHORT && pe && (K = pe.R16_EXT), B === s.SHORT && pe && (K = pe.R16_SNORM_EXT)), S === s.RED_INTEGER && (B === s.UNSIGNED_BYTE && (K = s.R8UI), B === s.UNSIGNED_SHORT && (K = s.R16UI), B === s.UNSIGNED_INT && (K = s.R32UI), B === s.BYTE && (K = s.R8I), B === s.SHORT && (K = s.R16I), B === s.INT && (K = s.R32I)), S === s.RG && (B === s.FLOAT && (K = s.RG32F), B === s.HALF_FLOAT && (K = s.RG16F), B === s.UNSIGNED_BYTE && (K = s.RG8), B === s.UNSIGNED_SHORT && pe && (K = pe.RG16_EXT), B === s.SHORT && pe && (K = pe.RG16_SNORM_EXT)), S === s.RG_INTEGER && (B === s.UNSIGNED_BYTE && (K = s.RG8UI), B === s.UNSIGNED_SHORT && (K = s.RG16UI), B === s.UNSIGNED_INT && (K = s.RG32UI), B === s.BYTE && (K = s.RG8I), B === s.SHORT && (K = s.RG16I), B === s.INT && (K = s.RG32I)), S === s.RGB_INTEGER && (B === s.UNSIGNED_BYTE && (K = s.RGB8UI), B === s.UNSIGNED_SHORT && (K = s.RGB16UI), B === s.UNSIGNED_INT && (K = s.RGB32UI), B === s.BYTE && (K = s.RGB8I), B === s.SHORT && (K = s.RGB16I), B === s.INT && (K = s.RGB32I)), S === s.RGBA_INTEGER && (B === s.UNSIGNED_BYTE && (K = s.RGBA8UI), B === s.UNSIGNED_SHORT && (K = s.RGBA16UI), B === s.UNSIGNED_INT && (K = s.RGBA32UI), B === s.BYTE && (K = s.RGBA8I), B === s.SHORT && (K = s.RGBA16I), B === s.INT && (K = s.RGBA32I)), S === s.RGB && (B === s.UNSIGNED_SHORT && pe && (K = pe.RGB16_EXT), B === s.SHORT && pe && (K = pe.RGB16_SNORM_EXT), B === s.UNSIGNED_INT_5_9_9_9_REV && (K = s.RGB9_E5), B === s.UNSIGNED_INT_10F_11F_11F_REV && (K = s.R11F_G11F_B10F)), S === s.RGBA) {
      const J = oe ? Ar : Qe.getTransfer($);
      B === s.FLOAT && (K = s.RGBA32F), B === s.HALF_FLOAT && (K = s.RGBA16F), B === s.UNSIGNED_BYTE && (K = J === ct ? s.SRGB8_ALPHA8 : s.RGBA8), B === s.UNSIGNED_SHORT && pe && (K = pe.RGBA16_EXT), B === s.SHORT && pe && (K = pe.RGBA16_SNORM_EXT), B === s.UNSIGNED_SHORT_4_4_4_4 && (K = s.RGBA4), B === s.UNSIGNED_SHORT_5_5_5_1 && (K = s.RGB5_A1)
    }
    return (K === s.R16F || K === s.R32F || K === s.RG16F || K === s.RG32F || K === s.RGBA16F || K === s.RGBA32F) && e.get("EXT_color_buffer_float"), K
  }

  function _(w, S) {
    let B;
    return w ? S === null || S === Sn || S === ki ? B = s.DEPTH24_STENCIL8 : S === jt ? B = s.DEPTH32F_STENCIL8 : S === Ss && (B = s.DEPTH24_STENCIL8, Ce("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : S === null || S === Sn || S === ki ? B = s.DEPTH_COMPONENT24 : S === jt ? B = s.DEPTH_COMPONENT32F : S === Ss && (B = s.DEPTH_COMPONENT16), B
  }

  function T(w, S) {
    return E(w) === !0 || w.isFramebufferTexture && w.minFilter !== Rt && w.minFilter !== Ct ? Math.log2(Math.max(S.width, S.height)) + 1 : w.mipmaps.length > 0 ? w.mipmaps.length : w.isCompressedTexture && Array.isArray(w.image) ? S.mipmaps.length : 1
  }

  function I(w) {
    const S = new WeakRef(w);
    n.get(w).__ref = S, p.add(S), x.register(w, S, S)
  }

  function R(w) {
    const S = n.get(w).__ref;
    S !== void 0 && (p.delete(S), x.unregister(S))
  }

  function D(w) {
    V(w.target)
  }

  function F(w) {
    L(w.target)
  }

  function V(w) {
    w.removeEventListener("dispose", D), R(w), X(w), w.isVideoTexture && h.delete(w), w.isHTMLTexture && u.delete(w)
  }

  function L(w) {
    w.removeEventListener("dispose", F), R(w), te(w)
  }

  function k() {
    for (const w of p) {
      const S = w.deref();
      S !== void 0 && (S.isRenderTarget === !0 ? L(S) : V(S))
    }
    p.clear(), u.clear()
  }

  function X(w) {
    const S = n.get(w);
    if (S.__webglInit === void 0) return;
    const B = w.source,
      ne = f.get(B);
    if (ne) {
      const $ = ne[S.__cacheKey];
      $.usedTimes--, $.usedTimes === 0 && H(w), Object.keys(ne).length === 0 && f.delete(B)
    }
    n.remove(w)
  }

  function H(w) {
    const S = n.get(w);
    s.deleteTexture(S.__webglTexture);
    const B = w.source,
      ne = f.get(B);
    delete ne[S.__cacheKey], a.memory.textures--
  }

  function te(w) {
    const S = n.get(w);
    S.__depthDisposeCallback && S.__depthDisposeCallback();
    const B = w.depthTexture;
    if (B && B.renderTarget === w && V(B), w.isWebGLCubeRenderTarget)
      for (let $ = 0; $ < 6; $++) {
        if (Array.isArray(S.__webglFramebuffer[$]))
          for (let oe = 0; oe < S.__webglFramebuffer[$].length; oe++) s.deleteFramebuffer(S.__webglFramebuffer[$][oe]);
        else s.deleteFramebuffer(S.__webglFramebuffer[$]);
        S.__webglDepthbuffer && s.deleteRenderbuffer(S.__webglDepthbuffer[$])
      } else {
        if (Array.isArray(S.__webglFramebuffer))
          for (let $ = 0; $ < S.__webglFramebuffer.length; $++) s.deleteFramebuffer(S.__webglFramebuffer[$]);
        else s.deleteFramebuffer(S.__webglFramebuffer);
        if (S.__webglDepthbuffer && s.deleteRenderbuffer(S.__webglDepthbuffer), S.__webglMultisampledFramebuffer && s.deleteFramebuffer(S.__webglMultisampledFramebuffer), S.__webglColorRenderbuffer)
          for (let $ = 0; $ < S.__webglColorRenderbuffer.length; $++) S.__webglColorRenderbuffer[$] && s.deleteRenderbuffer(S.__webglColorRenderbuffer[$]);
        S.__webglDepthRenderbuffer && s.deleteRenderbuffer(S.__webglDepthRenderbuffer)
      }
    const ne = w.textures;
    for (let $ = 0, oe = ne.length; $ < oe; $++) {
      const pe = n.get(ne[$]);
      pe.__webglTexture && (s.deleteTexture(pe.__webglTexture), a.memory.textures--), n.remove(ne[$])
    }
    n.remove(w)
  }
  let W = 0;

  function Q() {
    W = 0
  }

  function ee() {
    return W
  }

  function Te(w) {
    W = w
  }

  function Oe() {
    const w = W;
    return w >= i.maxTextures && Ce("WebGLTextures: Trying to use " + (w + 1) + " texture units while this GPU supports only " + i.maxTextures), W += 1, w
  }

  function Y(w) {
    const S = [];
    return S.push(w.wrapS), S.push(w.wrapT), S.push(w.wrapR || 0), S.push(w.magFilter), S.push(w.minFilter), S.push(w.anisotropy), S.push(w.internalFormat), S.push(w.format), S.push(w.type), S.push(w.generateMipmaps), S.push(w.mipmapsAutoUpdate), S.push(w.premultiplyAlpha), S.push(w.flipY), S.push(w.unpackAlignment), S.push(w.colorSpace), S.join()
  }

  function _e(w, S) {
    const B = n.get(w);
    if (w.isVideoTexture && St(w), w.isRenderTargetTexture === !1 && w.isExternalTexture !== !0 && w.version > 0 && B.__version !== w.version) {
      const ne = w.image;
      if (ne === null) Ce("WebGLRenderer: Texture marked for update but no image data found.");
      else if (ne.complete === !1) Ce("WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        ae(B, w, S);
        return
      }
    } else w.isExternalTexture && (B.__webglTexture = w.sourceTexture ? w.sourceTexture : null);
    t.bindTexture(s.TEXTURE_2D, B.__webglTexture, s.TEXTURE0 + S)
  }

  function Ee(w, S) {
    const B = n.get(w);
    if (w.isRenderTargetTexture === !1 && w.version > 0 && B.__version !== w.version) {
      ae(B, w, S);
      return
    } else w.isExternalTexture && (B.__webglTexture = w.sourceTexture ? w.sourceTexture : null);
    t.bindTexture(s.TEXTURE_2D_ARRAY, B.__webglTexture, s.TEXTURE0 + S)
  }

  function Ne(w, S) {
    const B = n.get(w);
    if (w.isRenderTargetTexture === !1 && w.version > 0 && B.__version !== w.version) {
      ae(B, w, S);
      return
    }
    t.bindTexture(s.TEXTURE_3D, B.__webglTexture, s.TEXTURE0 + S)
  }

  function xe(w, S) {
    const B = n.get(w);
    if (w.version > 0 && B.__version !== w.version) {
      ye(B, w, S);
      return
    }
    t.bindTexture(s.TEXTURE_CUBE_MAP, B.__webglTexture, s.TEXTURE0 + S)
  }
  const De = {
      [zi]: s.REPEAT,
      [on]: s.CLAMP_TO_EDGE,
      [yr]: s.MIRRORED_REPEAT
    },
    mt = {
      [Rt]: s.NEAREST,
      [ah]: s.NEAREST_MIPMAP_NEAREST,
      [cs]: s.NEAREST_MIPMAP_LINEAR,
      [Ct]: s.LINEAR,
      [gr]: s.LINEAR_MIPMAP_NEAREST,
      [vn]: s.LINEAR_MIPMAP_LINEAR
    },
    Be = {
      [sd]: s.NEVER,
      [gh]: s.ALWAYS,
      [rd]: s.LESS,
      [ph]: s.LEQUAL,
      [ad]: s.EQUAL,
      [mh]: s.GEQUAL,
      [od]: s.GREATER,
      [ld]: s.NOTEQUAL
    };

  function Je(w, S) {
    if (S.type === jt && e.has("OES_texture_float_linear") === !1 && (S.magFilter === Ct || S.magFilter === gr || S.magFilter === cs || S.magFilter === vn || S.minFilter === Ct || S.minFilter === gr || S.minFilter === cs || S.minFilter === vn) && Ce("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), s.texParameteri(w, s.TEXTURE_WRAP_S, De[S.wrapS]), s.texParameteri(w, s.TEXTURE_WRAP_T, De[S.wrapT]), (w === s.TEXTURE_3D || w === s.TEXTURE_2D_ARRAY) && s.texParameteri(w, s.TEXTURE_WRAP_R, De[S.wrapR]), s.texParameteri(w, s.TEXTURE_MAG_FILTER, mt[S.magFilter]), s.texParameteri(w, s.TEXTURE_MIN_FILTER, mt[S.minFilter]), S.compareFunction && (s.texParameteri(w, s.TEXTURE_COMPARE_MODE, s.COMPARE_REF_TO_TEXTURE), s.texParameteri(w, s.TEXTURE_COMPARE_FUNC, Be[S.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (S.magFilter === Rt || S.minFilter !== cs && S.minFilter !== vn || S.type === jt && e.has("OES_texture_float_linear") === !1) return;
      if (S.anisotropy > 1 || n.get(S).__currentAnisotropy) {
        const B = e.get("EXT_texture_filter_anisotropic");
        s.texParameterf(w, B.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(S.anisotropy, i.getMaxAnisotropy())), n.get(S).__currentAnisotropy = S.anisotropy
      }
    }
  }

  function je(w, S) {
    let B = !1;
    w.__webglInit === void 0 && (w.__webglInit = !0, S.addEventListener("dispose", D), I(S));
    const ne = S.source;
    let $ = f.get(ne);
    $ === void 0 && ($ = {}, f.set(ne, $));
    const oe = Y(S);
    if (oe !== w.__cacheKey) {
      $[oe] === void 0 && ($[oe] = {
        texture: s.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, B = !0), $[oe].usedTimes++;
      const pe = $[w.__cacheKey];
      pe !== void 0 && ($[w.__cacheKey].usedTimes--, pe.usedTimes === 0 && H(S)), w.__cacheKey = oe, w.__webglTexture = $[oe].texture
    }
    return B
  }

  function j(w, S, B) {
    return Math.floor(Math.floor(w / B) / S)
  }

  function ce(w, S, B, ne) {
    const oe = w.updateRanges;
    if (oe.length === 0) t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, S.width, S.height, B, ne, S.data);
    else {
      oe.sort((C, Z) => C.start - Z.start);
      let pe = 0;
      for (let C = 1; C < oe.length; C++) {
        const Z = oe[pe],
          q = oe[C],
          ue = Z.start + Z.count,
          se = j(q.start, S.width, 4),
          le = j(Z.start, S.width, 4);
        q.start <= ue + 1 && se === le && j(q.start + q.count - 1, S.width, 4) === se ? Z.count = Math.max(Z.count, q.start + q.count - Z.start) : (++pe, oe[pe] = q)
      }
      oe.length = pe + 1;
      const K = t.getParameter(s.UNPACK_ROW_LENGTH),
        J = t.getParameter(s.UNPACK_SKIP_PIXELS),
        he = t.getParameter(s.UNPACK_SKIP_ROWS);
      t.pixelStorei(s.UNPACK_ROW_LENGTH, S.width);
      for (let C = 0, Z = oe.length; C < Z; C++) {
        const q = oe[C],
          ue = Math.floor(q.start / 4),
          se = Math.ceil(q.count / 4),
          le = ue % S.width,
          Pe = Math.floor(ue / S.width),
          qe = se,
          ie = 1;
        t.pixelStorei(s.UNPACK_SKIP_PIXELS, le), t.pixelStorei(s.UNPACK_SKIP_ROWS, Pe), t.texSubImage2D(s.TEXTURE_2D, 0, le, Pe, qe, ie, B, ne, S.data)
      }
      w.clearUpdateRanges(), t.pixelStorei(s.UNPACK_ROW_LENGTH, K), t.pixelStorei(s.UNPACK_SKIP_PIXELS, J), t.pixelStorei(s.UNPACK_SKIP_ROWS, he)
    }
  }

  function ae(w, S, B) {
    let ne = s.TEXTURE_2D;
    (S.isDataArrayTexture || S.isCompressedArrayTexture) && (ne = s.TEXTURE_2D_ARRAY), S.isData3DTexture && (ne = s.TEXTURE_3D);
    const $ = je(w, S),
      oe = S.source;
    t.bindTexture(ne, w.__webglTexture, s.TEXTURE0 + B);
    const pe = n.get(oe);
    if (oe.version !== pe.__version || $ === !0) {
      if (t.activeTexture(s.TEXTURE0 + B), (typeof ImageBitmap < "u" && S.image instanceof ImageBitmap) === !1) {
        const ie = Qe.getPrimaries(Qe.workingColorSpace),
          Ie = S.colorSpace === Yn ? null : Qe.getPrimaries(S.colorSpace),
          Xe = S.colorSpace === Yn || ie === Ie ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
        t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, S.flipY), t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, S.premultiplyAlpha), t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, Xe)
      }
      t.pixelStorei(s.UNPACK_ALIGNMENT, S.unpackAlignment);
      let J = M(S.image, !1, i.maxTextureSize);
      J = Ue(S, J);
      const he = r.convert(S.format, S.colorSpace),
        C = r.convert(S.type);
      let Z = b(S.internalFormat, he, C, S.normalized, S.colorSpace, S.isVideoTexture);
      Je(ne, S);
      let q;
      const ue = S.mipmaps,
        se = S.isVideoTexture !== !0,
        le = pe.__version === void 0 || $ === !0,
        Pe = oe.dataReady,
        qe = T(S, J);
      if (S.isDepthTexture) Z = _(S.format === Kn, S.type), le && (se ? t.texStorage2D(s.TEXTURE_2D, 1, Z, J.width, J.height) : t.texImage2D(s.TEXTURE_2D, 0, Z, J.width, J.height, 0, he, C, null));
      else if (S.isDataTexture)
        if (ue.length > 0) {
          se && le && t.texStorage2D(s.TEXTURE_2D, qe, Z, ue[0].width, ue[0].height);
          for (let ie = 0, Ie = ue.length; ie < Ie; ie++) q = ue[ie], se ? Pe && t.texSubImage2D(s.TEXTURE_2D, ie, 0, 0, q.width, q.height, he, C, q.data) : t.texImage2D(s.TEXTURE_2D, ie, Z, q.width, q.height, 0, he, C, q.data);
          S.generateMipmaps = !1
        } else se ? (le && t.texStorage2D(s.TEXTURE_2D, qe, Z, J.width, J.height), Pe && ce(S, J, he, C)) : t.texImage2D(s.TEXTURE_2D, 0, Z, J.width, J.height, 0, he, C, J.data);
      else if (S.isCompressedTexture)
        if (S.isCompressedArrayTexture) {
          se && le && t.texStorage3D(s.TEXTURE_2D_ARRAY, qe, Z, ue[0].width, ue[0].height, J.depth);
          for (let ie = 0, Ie = ue.length; ie < Ie; ie++)
            if (q = ue[ie], S.format !== ln)
              if (he !== null)
                if (se) {
                  if (Pe)
                    if (S.layerUpdates.size > 0) {
                      const Xe = Mc(q.width, q.height, S.format, S.type);
                      for (const ve of S.layerUpdates) {
                        const lt = q.data.subarray(ve * Xe / q.data.BYTES_PER_ELEMENT, (ve + 1) * Xe / q.data.BYTES_PER_ELEMENT);
                        t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, ie, 0, 0, ve, q.width, q.height, 1, he, lt)
                      }
                    } else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, ie, 0, 0, 0, q.width, q.height, J.depth, he, q.data)
                } else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY, ie, Z, q.width, q.height, J.depth, 0, q.data, 0, 0);
          else Ce("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
          else se ? Pe && t.texSubImage3D(s.TEXTURE_2D_ARRAY, ie, 0, 0, 0, q.width, q.height, J.depth, he, C, q.data) : t.texImage3D(s.TEXTURE_2D_ARRAY, ie, Z, q.width, q.height, J.depth, 0, he, C, q.data);
          S.layerUpdates.size > 0 && S.clearLayerUpdates()
        } else {
          se && le && t.texStorage2D(s.TEXTURE_2D, qe, Z, ue[0].width, ue[0].height);
          for (let ie = 0, Ie = ue.length; ie < Ie; ie++) q = ue[ie], S.format !== ln ? he !== null ? se ? Pe && t.compressedTexSubImage2D(s.TEXTURE_2D, ie, 0, 0, q.width, q.height, he, q.data) : t.compressedTexImage2D(s.TEXTURE_2D, ie, Z, q.width, q.height, 0, q.data) : Ce("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : se ? Pe && t.texSubImage2D(s.TEXTURE_2D, ie, 0, 0, q.width, q.height, he, C, q.data) : t.texImage2D(s.TEXTURE_2D, ie, Z, q.width, q.height, 0, he, C, q.data)
        }
      else if (S.isDataArrayTexture)
        if (se) {
          if (le && t.texStorage3D(s.TEXTURE_2D_ARRAY, qe, Z, J.width, J.height, J.depth), Pe)
            if (S.layerUpdates.size > 0) {
              const ie = Mc(J.width, J.height, S.format, S.type);
              for (const Ie of S.layerUpdates) {
                const Xe = J.data.subarray(Ie * ie / J.data.BYTES_PER_ELEMENT, (Ie + 1) * ie / J.data.BYTES_PER_ELEMENT);
                t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, Ie, J.width, J.height, 1, he, C, Xe)
              }
              S.clearLayerUpdates()
            } else t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, 0, J.width, J.height, J.depth, he, C, J.data)
        } else t.texImage3D(s.TEXTURE_2D_ARRAY, 0, Z, J.width, J.height, J.depth, 0, he, C, J.data);
      else if (S.isData3DTexture) se ? (le && t.texStorage3D(s.TEXTURE_3D, qe, Z, J.width, J.height, J.depth), Pe && t.texSubImage3D(s.TEXTURE_3D, 0, 0, 0, 0, J.width, J.height, J.depth, he, C, J.data)) : t.texImage3D(s.TEXTURE_3D, 0, Z, J.width, J.height, J.depth, 0, he, C, J.data);
      else if (S.isFramebufferTexture) {
        if (le)
          if (se) t.texStorage2D(s.TEXTURE_2D, qe, Z, J.width, J.height);
          else {
            let ie = J.width,
              Ie = J.height;
            for (let Xe = 0; Xe < qe; Xe++) t.texImage2D(s.TEXTURE_2D, Xe, Z, ie, Ie, 0, he, C, null), ie >>= 1, Ie >>= 1
          }
      } else if (S.isHTMLTexture) {
        if ("texElementImage2D" in s) {
          const ie = s.canvas;
          if (ie.hasAttribute("layoutsubtree") || ie.setAttribute("layoutsubtree", "true"), J.parentNode !== ie) {
            ie.appendChild(J), u.add(S), ie.onpaint = Ie => {
              const Xe = Ie.changedElements;
              for (const ve of u) Xe.includes(ve.image) && (ve.needsUpdate = !0)
            }, ie.requestPaint();
            return
          }
          if (s.texElementImage2D.length === 3) s.texElementImage2D(s.TEXTURE_2D, s.RGBA8, J);
          else {
            const Xe = s.RGBA,
              ve = s.RGBA,
              lt = s.UNSIGNED_BYTE;
            s.texElementImage2D(s.TEXTURE_2D, 0, Xe, ve, lt, J)
          }
          s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MIN_FILTER, s.LINEAR), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_S, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_T, s.CLAMP_TO_EDGE)
        }
      } else if (ue.length > 0) {
        if (se && le) {
          const ie = ke(ue[0]);
          t.texStorage2D(s.TEXTURE_2D, qe, Z, ie.width, ie.height)
        }
        for (let ie = 0, Ie = ue.length; ie < Ie; ie++) q = ue[ie], se ? Pe && t.texSubImage2D(s.TEXTURE_2D, ie, 0, 0, he, C, q) : t.texImage2D(s.TEXTURE_2D, ie, Z, he, C, q);
        S.generateMipmaps = !1
      } else if (se) {
        if (le) {
          const ie = ke(J);
          t.texStorage2D(s.TEXTURE_2D, qe, Z, ie.width, ie.height)
        }
        Pe && t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, he, C, J)
      } else t.texImage2D(s.TEXTURE_2D, 0, Z, he, C, J);
      E(S) && S.mipmapsAutoUpdate === !0 && v(ne), pe.__version = oe.version, S.onUpdate && S.onUpdate(S)
    }
    w.__version = S.version
  }

  function ye(w, S, B) {
    if (S.image.length !== 6) return;
    const ne = je(w, S),
      $ = S.source;
    t.bindTexture(s.TEXTURE_CUBE_MAP, w.__webglTexture, s.TEXTURE0 + B);
    const oe = n.get($);
    if ($.version !== oe.__version || ne === !0) {
      t.activeTexture(s.TEXTURE0 + B);
      const pe = Qe.getPrimaries(Qe.workingColorSpace),
        K = S.colorSpace === Yn ? null : Qe.getPrimaries(S.colorSpace),
        J = S.colorSpace === Yn || pe === K ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, S.flipY), t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, S.premultiplyAlpha), t.pixelStorei(s.UNPACK_ALIGNMENT, S.unpackAlignment), t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, J);
      const he = S.isCompressedTexture || S.image[0].isCompressedTexture,
        C = S.image[0] && S.image[0].isDataTexture,
        Z = [];
      for (let ve = 0; ve < 6; ve++) !he && !C ? Z[ve] = M(S.image[ve], !0, i.maxCubemapSize) : Z[ve] = C ? S.image[ve].image : S.image[ve], Z[ve] = Ue(S, Z[ve]);
      const q = Z[0],
        ue = r.convert(S.format, S.colorSpace),
        se = r.convert(S.type);
      let le = b(S.internalFormat, ue, se, S.normalized, S.colorSpace);
      const Pe = S.isVideoTexture !== !0,
        qe = oe.__version === void 0 || ne === !0,
        ie = $.dataReady;
      let Ie = T(S, q);
      Je(s.TEXTURE_CUBE_MAP, S);
      let Xe;
      if (S.isDepthTexture) {
        if (le = _(S.format === Kn, S.type), qe)
          if (Pe) t.texStorage2D(s.TEXTURE_CUBE_MAP, 1, le, q.width, q.height);
          else
            for (let ve = 0; ve < 6; ve++) t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, 0, le, q.width, q.height, 0, ue, se, null)
      } else if (he) {
        Pe && qe && t.texStorage2D(s.TEXTURE_CUBE_MAP, Ie, le, q.width, q.height);
        for (let ve = 0; ve < 6; ve++) {
          Xe = Z[ve].mipmaps;
          for (let lt = 0; lt < Xe.length; lt++) {
            const It = Xe[lt];
            S.format !== ln ? ue !== null ? Pe ? ie && t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt, 0, 0, It.width, It.height, ue, It.data) : t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt, le, It.width, It.height, 0, It.data) : Ce("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : Pe ? ie && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt, 0, 0, It.width, It.height, ue, se, It.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt, le, It.width, It.height, 0, ue, se, It.data)
          }
        }
      } else {
        if (Xe = S.mipmaps, Pe && qe) {
          Xe.length > 0 && Ie++;
          const ve = ke(Z[0]);
          t.texStorage2D(s.TEXTURE_CUBE_MAP, Ie, le, ve.width, ve.height)
        }
        for (let ve = 0; ve < 6; ve++)
          if (C) {
            Pe ? ie && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, 0, 0, 0, Z[ve].width, Z[ve].height, ue, se, Z[ve].data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, 0, le, Z[ve].width, Z[ve].height, 0, ue, se, Z[ve].data);
            for (let lt = 0; lt < Xe.length; lt++) {
              const On = Xe[lt].image[ve].image;
              Pe ? ie && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt + 1, 0, 0, On.width, On.height, ue, se, On.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt + 1, le, On.width, On.height, 0, ue, se, On.data)
            }
          } else {
            Pe ? ie && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, 0, 0, 0, ue, se, Z[ve]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, 0, le, ue, se, Z[ve]);
            for (let lt = 0; lt < Xe.length; lt++) {
              const It = Xe[lt];
              Pe ? ie && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt + 1, 0, 0, ue, se, It.image[ve]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt + 1, le, ue, se, It.image[ve])
            }
          }
      }
      E(S) && S.mipmapsAutoUpdate === !0 && v(s.TEXTURE_CUBE_MAP), oe.__version = $.version, S.onUpdate && S.onUpdate(S)
    }
    w.__version = S.version
  }

  function ge(w, S, B, ne, $, oe) {
    const pe = r.convert(B.format, B.colorSpace),
      K = r.convert(B.type),
      J = b(B.internalFormat, pe, K, B.normalized, B.colorSpace),
      he = n.get(S),
      C = n.get(B);
    if (C.__renderTarget = S, !he.__hasExternalTextures) {
      const Z = Math.max(1, S.width >> oe),
        q = Math.max(1, S.height >> oe);
      $ === s.TEXTURE_3D || $ === s.TEXTURE_2D_ARRAY ? t.texImage3D($, oe, J, Z, q, S.depth, 0, pe, K, null) : t.texImage2D($, oe, J, Z, q, 0, pe, K, null)
    }
    t.bindFramebuffer(s.FRAMEBUFFER, w), fe(S) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, ne, $, C.__webglTexture, 0, dt(S)) : ($ === s.TEXTURE_2D || $ >= s.TEXTURE_CUBE_MAP_POSITIVE_X && $ <= s.TEXTURE_CUBE_MAP_NEGATIVE_Z) && s.framebufferTexture2D(s.FRAMEBUFFER, ne, $, C.__webglTexture, oe), t.bindFramebuffer(s.FRAMEBUFFER, null)
  }

  function Ve(w, S, B) {
    if (s.bindRenderbuffer(s.RENDERBUFFER, w), S.depthBuffer) {
      const ne = S.depthTexture,
        $ = ne && ne.isDepthTexture ? ne.type : null,
        oe = _(S.stencilBuffer, $),
        pe = S.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
      fe(S) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, dt(S), oe, S.width, S.height) : B ? s.renderbufferStorageMultisample(s.RENDERBUFFER, dt(S), oe, S.width, S.height) : s.renderbufferStorage(s.RENDERBUFFER, oe, S.width, S.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, pe, s.RENDERBUFFER, w)
    } else {
      const ne = S.textures;
      for (let $ = 0; $ < ne.length; $++) {
        const oe = ne[$],
          pe = r.convert(oe.format, oe.colorSpace),
          K = r.convert(oe.type),
          J = b(oe.internalFormat, pe, K, oe.normalized, oe.colorSpace);
        fe(S) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, dt(S), J, S.width, S.height) : B ? s.renderbufferStorageMultisample(s.RENDERBUFFER, dt(S), J, S.width, S.height) : s.renderbufferStorage(s.RENDERBUFFER, J, S.width, S.height)
      }
    }
    s.bindRenderbuffer(s.RENDERBUFFER, null)
  }

  function Le(w, S, B) {
    const ne = S.isWebGLCubeRenderTarget === !0;
    if (t.bindFramebuffer(s.FRAMEBUFFER, w), !(S.depthTexture && S.depthTexture.isDepthTexture)) throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");
    const $ = n.get(S.depthTexture);
    $.__renderTarget = S;
    const oe = ne ? S.depthTexture.image[0] : S.depthTexture.image;
    (!$.__webglTexture || oe.width !== S.width || oe.height !== S.height) && (oe.width = S.width, oe.height = S.height, S.depthTexture.needsUpdate = !0), ne ? xe(S.depthTexture, 0) : _e(S.depthTexture, 0);
    const pe = $.__webglTexture,
      K = dt(S),
      J = ne ? s.TEXTURE_CUBE_MAP_POSITIVE_X + B : s.TEXTURE_2D,
      he = S.depthTexture.format === Kn ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
    if (S.depthTexture.format === Qn) fe(S) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, he, J, pe, 0, K) : s.framebufferTexture2D(s.FRAMEBUFFER, he, J, pe, 0);
    else if (S.depthTexture.format === Kn) fe(S) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, he, J, pe, 0, K) : s.framebufferTexture2D(s.FRAMEBUFFER, he, J, pe, 0);
    else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")
  }

  function et(w) {
    const S = n.get(w),
      B = w.isWebGLCubeRenderTarget === !0;
    if (S.__boundDepthTexture !== w.depthTexture) {
      const ne = w.depthTexture;
      if (S.__depthDisposeCallback && S.__depthDisposeCallback(), ne) {
        const $ = () => {
          delete S.__boundDepthTexture, delete S.__depthDisposeCallback, ne.removeEventListener("dispose", $)
        };
        ne.addEventListener("dispose", $), S.__depthDisposeCallback = $
      }
      S.__boundDepthTexture = ne
    }
    if (w.depthTexture && !S.__autoAllocateDepthBuffer)
      if (B)
        for (let ne = 0; ne < 6; ne++) Le(S.__webglFramebuffer[ne], w, ne);
      else w.texture.mipmaps.length > 0 ? Le(S.__webglFramebuffer[0], w, 0) : Le(S.__webglFramebuffer, w, 0);
    else if (B) {
      S.__webglDepthbuffer = [];
      for (let ne = 0; ne < 6; ne++)
        if (t.bindFramebuffer(s.FRAMEBUFFER, S.__webglFramebuffer[ne]), S.__webglDepthbuffer[ne] === void 0) S.__webglDepthbuffer[ne] = s.createRenderbuffer(), Ve(S.__webglDepthbuffer[ne], w, !1);
        else {
          const $ = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT,
            oe = S.__webglDepthbuffer[ne];
          s.bindRenderbuffer(s.RENDERBUFFER, oe), s.framebufferRenderbuffer(s.FRAMEBUFFER, $, s.RENDERBUFFER, oe)
        }
    } else if (w.texture.mipmaps.length > 0 ? t.bindFramebuffer(s.FRAMEBUFFER, S.__webglFramebuffer[0]) : t.bindFramebuffer(s.FRAMEBUFFER, S.__webglFramebuffer), S.__webglDepthbuffer === void 0) S.__webglDepthbuffer = s.createRenderbuffer(), Ve(S.__webglDepthbuffer, w, !1);
    else {
      const $ = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT,
        oe = S.__webglDepthbuffer;
      s.bindRenderbuffer(s.RENDERBUFFER, oe), s.framebufferRenderbuffer(s.FRAMEBUFFER, $, s.RENDERBUFFER, oe)
    }
    t.bindFramebuffer(s.FRAMEBUFFER, null)
  }

  function tt(w, S, B) {
    const ne = n.get(w);
    S !== void 0 && ge(ne.__webglFramebuffer, w, w.texture, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, 0), B !== void 0 && et(w)
  }

  function rt(w) {
    const S = w.texture,
      B = n.get(w),
      ne = n.get(S);
    w.addEventListener("dispose", F), I(w);
    const $ = w.textures,
      oe = w.isWebGLCubeRenderTarget === !0,
      pe = $.length > 1;
    if (pe || (ne.__webglTexture === void 0 && (ne.__webglTexture = s.createTexture()), ne.__version = S.version, a.memory.textures++), oe) {
      B.__webglFramebuffer = [];
      for (let K = 0; K < 6; K++)
        if (S.mipmaps.length > 0) {
          B.__webglFramebuffer[K] = [];
          for (let J = 0; J < S.mipmaps.length; J++) B.__webglFramebuffer[K][J] = s.createFramebuffer()
        } else B.__webglFramebuffer[K] = s.createFramebuffer()
    } else {
      if (S.mipmaps.length > 0) {
        B.__webglFramebuffer = [];
        for (let K = 0; K < S.mipmaps.length; K++) B.__webglFramebuffer[K] = s.createFramebuffer()
      } else B.__webglFramebuffer = s.createFramebuffer();
      if (pe)
        for (let K = 0, J = $.length; K < J; K++) {
          const he = n.get($[K]);
          he.__webglTexture === void 0 && (he.__webglTexture = s.createTexture(), a.memory.textures++)
        }
      if (w.samples > 0 && fe(w) === !1) {
        B.__webglMultisampledFramebuffer = s.createFramebuffer(), B.__webglColorRenderbuffer = [], t.bindFramebuffer(s.FRAMEBUFFER, B.__webglMultisampledFramebuffer);
        for (let K = 0; K < $.length; K++) {
          const J = $[K];
          B.__webglColorRenderbuffer[K] = s.createRenderbuffer(), s.bindRenderbuffer(s.RENDERBUFFER, B.__webglColorRenderbuffer[K]);
          const he = r.convert(J.format, J.colorSpace),
            C = r.convert(J.type),
            Z = b(J.internalFormat, he, C, J.normalized, J.colorSpace, w.isXRRenderTarget === !0),
            q = dt(w);
          s.renderbufferStorageMultisample(s.RENDERBUFFER, q, Z, w.width, w.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + K, s.RENDERBUFFER, B.__webglColorRenderbuffer[K])
        }
        s.bindRenderbuffer(s.RENDERBUFFER, null), w.depthBuffer && (B.__webglDepthRenderbuffer = s.createRenderbuffer(), Ve(B.__webglDepthRenderbuffer, w, !0)), t.bindFramebuffer(s.FRAMEBUFFER, null)
      }
    }
    if (oe) {
      t.bindTexture(s.TEXTURE_CUBE_MAP, ne.__webglTexture), Je(s.TEXTURE_CUBE_MAP, S);
      for (let K = 0; K < 6; K++)
        if (S.mipmaps.length > 0)
          for (let J = 0; J < S.mipmaps.length; J++) ge(B.__webglFramebuffer[K][J], w, S, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + K, J);
        else ge(B.__webglFramebuffer[K], w, S, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0);
      E(S) ? v(s.TEXTURE_CUBE_MAP) : S.mipmaps.length > 0 && s.texParameteri(s.TEXTURE_CUBE_MAP, s.TEXTURE_MAX_LEVEL, S.mipmaps.length - 1), t.unbindTexture()
    } else if (pe) {
      for (let K = 0, J = $.length; K < J; K++) {
        const he = $[K],
          C = n.get(he);
        let Z = s.TEXTURE_2D;
        (w.isWebGL3DRenderTarget || w.isWebGLArrayRenderTarget) && (Z = w.isWebGL3DRenderTarget ? s.TEXTURE_3D : s.TEXTURE_2D_ARRAY), t.bindTexture(Z, C.__webglTexture), Je(Z, he), ge(B.__webglFramebuffer, w, he, s.COLOR_ATTACHMENT0 + K, Z, 0), E(he) && v(Z)
      }
      t.unbindTexture()
    } else {
      let K = s.TEXTURE_2D;
      if ((w.isWebGL3DRenderTarget || w.isWebGLArrayRenderTarget) && (K = w.isWebGL3DRenderTarget ? s.TEXTURE_3D : s.TEXTURE_2D_ARRAY), t.bindTexture(K, ne.__webglTexture), Je(K, S), S.mipmaps.length > 0)
        for (let J = 0; J < S.mipmaps.length; J++) ge(B.__webglFramebuffer[J], w, S, s.COLOR_ATTACHMENT0, K, J);
      else ge(B.__webglFramebuffer, w, S, s.COLOR_ATTACHMENT0, K, 0);
      E(S) ? v(K) : S.mipmaps.length > 0 && s.texParameteri(K, s.TEXTURE_MAX_LEVEL, S.mipmaps.length - 1), t.unbindTexture()
    }
    w.depthBuffer && et(w)
  }

  function U(w) {
    const S = w.textures;
    for (let B = 0, ne = S.length; B < ne; B++) {
      const $ = S[B];
      if (E($) && $.mipmapsAutoUpdate === !0) {
        const oe = A(w),
          pe = n.get($).__webglTexture;
        t.bindTexture(oe, pe), v(oe), t.unbindTexture()
      }
    }
  }
  const yt = [];

  function $e(w) {
    if (w.samples > 0) {
      if (fe(w) === !1) {
        const S = w.textures,
          B = w.width,
          ne = w.height;
        let $ = s.COLOR_BUFFER_BIT;
        const oe = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT,
          pe = n.get(w),
          K = S.length > 1;
        if (K)
          for (let he = 0; he < S.length; he++) t.bindFramebuffer(s.FRAMEBUFFER, pe.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + he, s.RENDERBUFFER, null), t.bindFramebuffer(s.FRAMEBUFFER, pe.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + he, s.TEXTURE_2D, null, 0);
        t.bindFramebuffer(s.READ_FRAMEBUFFER, pe.__webglMultisampledFramebuffer), w.texture.mipmaps.length > 0 ? t.bindFramebuffer(s.DRAW_FRAMEBUFFER, pe.__webglFramebuffer[0]) : t.bindFramebuffer(s.DRAW_FRAMEBUFFER, pe.__webglFramebuffer);
        for (let he = 0; he < S.length; he++) {
          if (w.resolveDepthBuffer && (w.depthBuffer && ($ |= s.DEPTH_BUFFER_BIT), w.stencilBuffer && w.resolveStencilBuffer && ($ |= s.STENCIL_BUFFER_BIT)), K) {
            s.framebufferRenderbuffer(s.READ_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.RENDERBUFFER, pe.__webglColorRenderbuffer[he]);
            const C = n.get(S[he]).__webglTexture;
            s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, C, 0)
          }
          s.blitFramebuffer(0, 0, B, ne, 0, 0, B, ne, $, s.NEAREST), l === !0 && (yt.length = 0, yt.push(s.COLOR_ATTACHMENT0 + he), w.depthBuffer && w.storeMultisampledDepthBuffer === !1 && yt.push(oe), s.invalidateFramebuffer(s.READ_FRAMEBUFFER, yt))
        }
        if (t.bindFramebuffer(s.READ_FRAMEBUFFER, null), t.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), K)
          for (let he = 0; he < S.length; he++) {
            t.bindFramebuffer(s.FRAMEBUFFER, pe.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + he, s.RENDERBUFFER, pe.__webglColorRenderbuffer[he]);
            const C = n.get(S[he]).__webglTexture;
            t.bindFramebuffer(s.FRAMEBUFFER, pe.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + he, s.TEXTURE_2D, C, 0)
          }
        t.bindFramebuffer(s.DRAW_FRAMEBUFFER, pe.__webglMultisampledFramebuffer)
      } else if (w.depthBuffer && w.storeMultisampledDepthBuffer === !1 && l) {
        const S = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
        s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, [S])
      }
    }
  }

  function dt(w) {
    return Math.min(i.maxSamples, w.samples)
  }

  function fe(w) {
    const S = n.get(w);
    return w.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && S.__useRenderToTexture !== !1
  }

  function St(w) {
    const S = a.render.frame;
    h.get(w) !== S && (h.set(w, S), w.update())
  }

  function Ue(w, S) {
    const B = w.colorSpace,
      ne = w.format,
      $ = w.type;
    return w.isCompressedTexture === !0 || w.isVideoTexture === !0 || B !== Xt && B !== Yn && (Qe.getTransfer(B) === ct ? (ne !== ln || $ !== Jt) && Ce("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : ze("WebGLTextures: Unsupported texture color space:", B)), S
  }

  function ke(w) {
    return typeof HTMLImageElement < "u" && w instanceof HTMLImageElement ? (c.width = w.naturalWidth || w.width, c.height = w.naturalHeight || w.height) : typeof VideoFrame < "u" && w instanceof VideoFrame ? (c.width = w.displayWidth, c.height = w.displayHeight) : (c.width = w.width, c.height = w.height), c
  }
  this.allocateTextureUnit = Oe, this.resetTextureUnits = Q, this.getTextureUnits = ee, this.setTextureUnits = Te, this.setTexture2D = _e, this.setTexture2DArray = Ee, this.setTexture3D = Ne, this.setTextureCube = xe, this.rebindTextures = tt, this.setupRenderTarget = rt, this.updateRenderTargetMipmap = U, this.updateMultisampleRenderTarget = $e, this.setupDepthRenderbuffer = et, this.setupFrameBufferTexture = ge, this.useMultisampledRTT = fe, this.dispose = k
}

function mx(s, e) {
  function t(n, i = Yn) {
    let r;
    const a = Qe.getTransfer(i);
    if (n === Jt) return s.UNSIGNED_BYTE;
    if (n === Co) return s.UNSIGNED_SHORT_4_4_4_4;
    if (n === Lo) return s.UNSIGNED_SHORT_5_5_5_1;
    if (n === ch) return s.UNSIGNED_INT_5_9_9_9_REV;
    if (n === hh) return s.UNSIGNED_INT_10F_11F_11F_REV;
    if (n === oh) return s.BYTE;
    if (n === lh) return s.SHORT;
    if (n === Ss) return s.UNSIGNED_SHORT;
    if (n === Ro) return s.INT;
    if (n === Sn) return s.UNSIGNED_INT;
    if (n === jt) return s.FLOAT;
    if (n === yn) return s.HALF_FLOAT;
    if (n === uh) return s.ALPHA;
    if (n === dh) return s.RGB;
    if (n === ln) return s.RGBA;
    if (n === Qn) return s.DEPTH_COMPONENT;
    if (n === Kn) return s.DEPTH_STENCIL;
    if (n === Po) return s.RED;
    if (n === Io) return s.RED_INTEGER;
    if (n === ui) return s.RG;
    if (n === No) return s.RG_INTEGER;
    if (n === Do) return s.RGBA_INTEGER;
    if (n === _r || n === xr || n === vr || n === Mr)
      if (a === ct)
        if (r = e.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
          if (n === _r) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === xr) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === vr) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === Mr) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT
        } else return null;
    else if (r = e.get("WEBGL_compressed_texture_s3tc"), r !== null) {
      if (n === _r) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
      if (n === xr) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
      if (n === vr) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
      if (n === Mr) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT
    } else return null;
    if (n === Oa || n === Ba || n === za || n === ka)
      if (r = e.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
        if (n === Oa) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === Ba) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === za) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === ka) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
      } else return null;
    if (n === Ha || n === Ga || n === Va || n === Wa || n === Xa || n === Tr || n === qa)
      if (r = e.get("WEBGL_compressed_texture_etc"), r !== null) {
        if (n === Ha || n === Ga) return a === ct ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === Va) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
        if (n === Wa) return r.COMPRESSED_R11_EAC;
        if (n === Xa) return r.COMPRESSED_SIGNED_R11_EAC;
        if (n === Tr) return r.COMPRESSED_RG11_EAC;
        if (n === qa) return r.COMPRESSED_SIGNED_RG11_EAC
      } else return null;
    if (n === Ya || n === Ka || n === Ja || n === Za || n === $a || n === Qa || n === ja || n === eo || n === to || n === no || n === io || n === so || n === ro || n === ao)
      if (r = e.get("WEBGL_compressed_texture_astc"), r !== null) {
        if (n === Ya) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Ka) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === Ja) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === Za) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === $a) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === Qa) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === ja) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === eo) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === to) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === no) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === io) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === so) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === ro) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === ao) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR
      } else return null;
    if (n === oo || n === lo || n === co)
      if (r = e.get("EXT_texture_compression_bptc"), r !== null) {
        if (n === oo) return a === ct ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === lo) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === co) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT
      } else return null;
    if (n === ho || n === uo || n === Er || n === fo)
      if (r = e.get("EXT_texture_compression_rgtc"), r !== null) {
        if (n === ho) return r.COMPRESSED_RED_RGTC1_EXT;
        if (n === uo) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === Er) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === fo) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT
      } else return null;
    return n === ki ? s.UNSIGNED_INT_24_8 : s[n] !== void 0 ? s[n] : null
  }
  return {
    convert: t
  }
}
const gx = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`,
  _x = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class xx {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0
  }
  init(e, t) {
    if (this.texture === null) {
      const n = new Nh(e.texture);
      (e.depthNear !== t.depthNear || e.depthFar !== t.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = n
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport,
        n = new fi({
          vertexShader: gx,
          fragmentShader: _x,
          uniforms: {
            depthColor: {
              value: this.texture
            },
            depthWidth: {
              value: t.z
            },
            depthHeight: {
              value: t.w
            }
          }
        });
      this.mesh = new At(new Br(20, 20), n)
    }
    return this.mesh
  }
  reset() {
    this.texture = null, this.mesh = null
  }
  getDepthTexture() {
    return this.texture
  }
}
class vx extends jn {
  constructor(e, t) {
    super();
    const n = this;
    let i = null,
      r = 1,
      a = null,
      o = "local-floor",
      l = 1,
      c = null,
      h = null,
      u = null,
      d = null,
      f = null,
      p = null;
    const x = typeof XRWebGLBinding < "u",
      m = new xx,
      g = {},
      M = t.getContextAttributes();
    let E = null,
      v = null;
    const A = [],
      b = [],
      _ = new re;
    let T = null,
      I = null;
    const R = new Kt;
    R.viewport = new ht;
    const D = new Kt;
    D.viewport = new ht;
    const F = [R, D],
      V = new _p;
    let L = null,
      k = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(Y) {
      let _e = A[Y];
      return _e === void 0 && (_e = new Qr, A[Y] = _e), _e.getTargetRaySpace()
    }, this.getControllerGrip = function(Y) {
      let _e = A[Y];
      return _e === void 0 && (_e = new Qr, A[Y] = _e), _e.getGripSpace()
    }, this.getHand = function(Y) {
      let _e = A[Y];
      return _e === void 0 && (_e = new Qr, A[Y] = _e), _e.getHandSpace()
    };

    function X(Y) {
      const _e = b.indexOf(Y.inputSource);
      if (_e === -1) return;
      const Ee = A[_e];
      Ee !== void 0 && (Ee.update(Y.inputSource, Y.frame, c || a), Ee.dispatchEvent({
        type: Y.type,
        data: Y.inputSource
      }))
    }

    function H() {
      i.removeEventListener("select", X), i.removeEventListener("selectstart", X), i.removeEventListener("selectend", X), i.removeEventListener("squeeze", X), i.removeEventListener("squeezestart", X), i.removeEventListener("squeezeend", X), i.removeEventListener("end", H), i.removeEventListener("inputsourceschange", te);
      for (let Y = 0; Y < A.length; Y++) {
        const _e = b[Y];
        _e !== null && (b[Y] = null, A[Y].disconnect(_e))
      }
      L = null, k = null, m.reset();
      for (const Y in g) delete g[Y];
      if (e.setRenderTarget(E), f = null, d = null, u = null, i = null, v = null, Oe.stop(), n.isPresenting = !1, e.setPixelRatio(T), e.setSize(_.width, _.height, !1), I !== null) {
        const Y = I.camera;
        Y.fov = I.fov, Y.zoom = I.zoom, Y.updateProjectionMatrix(), I = null
      }
      n.dispatchEvent({
        type: "sessionend"
      })
    }
    this.setFramebufferScaleFactor = function(Y) {
      r = Y, n.isPresenting === !0 && Ce("WebXRManager: Cannot change framebuffer scale while presenting.")
    }, this.setReferenceSpaceType = function(Y) {
      o = Y, n.isPresenting === !0 && Ce("WebXRManager: Cannot change reference space type while presenting.")
    }, this.getReferenceSpace = function() {
      return c || a
    }, this.setReferenceSpace = function(Y) {
      c = Y
    }, this.getBaseLayer = function() {
      return d !== null ? d : f
    }, this.getBinding = function() {
      return u === null && x && (u = new XRWebGLBinding(i, t)), u
    }, this.getFrame = function() {
      return p
    }, this.getSession = function() {
      return i
    }, this.setSession = async function(Y) {
      if (i = Y, i !== null) {
        if (E = e.getRenderTarget(), i.addEventListener("select", X), i.addEventListener("selectstart", X), i.addEventListener("selectend", X), i.addEventListener("squeeze", X), i.addEventListener("squeezestart", X), i.addEventListener("squeezeend", X), i.addEventListener("end", H), i.addEventListener("inputsourceschange", te), M.xrCompatible !== !0 && await t.makeXRCompatible(), T = e.getPixelRatio(), e.getSize(_), x && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let Ee = null,
            Ne = null,
            xe = null;
          M.depth && (xe = M.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, Ee = M.stencil ? Kn : Qn, Ne = M.stencil ? ki : Sn);
          const De = {
            colorFormat: t.RGBA8,
            depthFormat: xe,
            scaleFactor: r
          };
          u = this.getBinding(), d = u.createProjectionLayer(De), i.updateRenderState({
            layers: [d]
          }), e.setPixelRatio(1), e.setSize(d.textureWidth, d.textureHeight, !1), v = new Mn(d.textureWidth, d.textureHeight, {
            format: ln,
            type: Jt,
            depthTexture: new Vi(d.textureWidth, d.textureHeight, Ne, void 0, void 0, void 0, void 0, void 0, void 0, Ee),
            stencilBuffer: M.stencil,
            colorSpace: e.outputColorSpace,
            samples: M.antialias ? 4 : 0,
            resolveDepthBuffer: d.ignoreDepthValues === !1,
            resolveStencilBuffer: d.ignoreDepthValues === !1,
            storeMultisampledDepthBuffer: d.ignoreDepthValues === !1,
            storeMultisampledStencilBuffer: d.ignoreDepthValues === !1
          })
        } else {
          const Ee = {
            antialias: M.antialias,
            alpha: !0,
            depth: M.depth,
            stencil: M.stencil,
            framebufferScaleFactor: r
          };
          f = new XRWebGLLayer(i, t, Ee), i.updateRenderState({
            baseLayer: f
          }), e.setPixelRatio(1), e.setSize(f.framebufferWidth, f.framebufferHeight, !1), v = new Mn(f.framebufferWidth, f.framebufferHeight, {
            format: ln,
            type: Jt,
            colorSpace: e.outputColorSpace,
            stencilBuffer: M.stencil,
            resolveDepthBuffer: f.ignoreDepthValues === !1,
            resolveStencilBuffer: f.ignoreDepthValues === !1,
            storeMultisampledDepthBuffer: f.ignoreDepthValues === !1,
            storeMultisampledStencilBuffer: f.ignoreDepthValues === !1
          })
        }
        v.isXRRenderTarget = !0, this.setFoveation(l), c = null, a = await i.requestReferenceSpace(o), Oe.setContext(i), Oe.start(), n.isPresenting = !0, n.dispatchEvent({
          type: "sessionstart"
        })
      }
    }, this.getEnvironmentBlendMode = function() {
      if (i !== null) return i.environmentBlendMode
    }, this.getDepthTexture = function() {
      return m.getDepthTexture()
    };

    function te(Y) {
      for (let _e = 0; _e < Y.removed.length; _e++) {
        const Ee = Y.removed[_e],
          Ne = b.indexOf(Ee);
        Ne >= 0 && (b[Ne] = null, A[Ne].disconnect(Ee))
      }
      for (let _e = 0; _e < Y.added.length; _e++) {
        const Ee = Y.added[_e];
        let Ne = b.indexOf(Ee);
        if (Ne === -1) {
          for (let De = 0; De < A.length; De++)
            if (De >= b.length) {
              b.push(Ee), Ne = De;
              break
            } else if (b[De] === null) {
            b[De] = Ee, Ne = De;
            break
          }
          if (Ne === -1) break
        }
        const xe = A[Ne];
        xe && xe.connect(Ee)
      }
    }

    function W(Y, _e) {
      _e === null ? Y.matrixWorld.copy(Y.matrix) : Y.matrixWorld.multiplyMatrices(_e.matrixWorld, Y.matrix), Y.matrixWorldInverse.copy(Y.matrixWorld).invert()
    }
    this.updateCamera = function(Y) {
      if (i === null) return;
      let _e = Y.near,
        Ee = Y.far;
      m.texture !== null && (m.depthNear > 0 && (_e = m.depthNear), m.depthFar > 0 && (Ee = m.depthFar)), V.near = D.near = R.near = _e, V.far = D.far = R.far = Ee, (L !== V.near || k !== V.far) && (i.updateRenderState({
        depthNear: V.near,
        depthFar: V.far
      }), L = V.near, k = V.far), V.layers.mask = Y.layers.mask | 6, R.layers.mask = V.layers.mask & -5, D.layers.mask = V.layers.mask & -3;
      const Ne = Y.parent,
        xe = V.cameras;
      W(V, Ne);
      for (let De = 0; De < xe.length; De++) W(xe[De], Ne);
      V.projectionMatrix.copy(R.projectionMatrix), V.projectionMatrixInverse.copy(R.projectionMatrixInverse), I === null && Y.isPerspectiveCamera && (I = {
        camera: Y,
        fov: Y.fov,
        zoom: Y.zoom
      }), Q(Y, V, Ne)
    };

    function Q(Y, _e, Ee) {
      Ee === null ? Y.matrix.copy(_e.matrixWorld) : (Y.matrix.copy(Ee.matrixWorld), Y.matrix.invert(), Y.matrix.multiply(_e.matrixWorld)), Y.matrix.decompose(Y.position, Y.quaternion, Y.scale), Y.updateMatrixWorld(!0), Y.projectionMatrix.copy(_e.projectionMatrix), Y.projectionMatrixInverse.copy(_e.projectionMatrixInverse), Y.isPerspectiveCamera && (Y.fov = Gi * 2 * Math.atan(1 / Y.projectionMatrix.elements[5]), Y.zoom = 1)
    }
    this.getCamera = function() {
      return V
    }, this.getFoveation = function() {
      if (!(d === null && f === null)) return l
    }, this.setFoveation = function(Y) {
      l = Y, d !== null && (d.fixedFoveation = Y), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = Y)
    }, this.hasDepthSensing = function() {
      return m.texture !== null
    }, this.getDepthSensingMesh = function() {
      return m.getMesh(V)
    }, this.getCameraTexture = function(Y) {
      return g[Y]
    };
    let ee = null;

    function Te(Y, _e) {
      if (h = _e.getViewerPose(c || a), p = _e, h !== null) {
        const Ee = h.views;
        f !== null && (e.setRenderTargetFramebuffer(v, f.framebuffer), e.setRenderTarget(v));
        let Ne = !1;
        Ee.length !== V.cameras.length && (V.cameras.length = 0, Ne = !0);
        for (let Be = 0; Be < Ee.length; Be++) {
          const Je = Ee[Be];
          let je = null;
          if (f !== null) je = f.getViewport(Je);
          else {
            const ce = u.getViewSubImage(d, Je);
            je = ce.viewport, Be === 0 && (e.setRenderTargetTextures(v, ce.colorTexture, ce.depthStencilTexture), e.setRenderTarget(v))
          }
          let j = F[Be];
          j === void 0 && (j = new Kt, j.layers.enable(Be), j.viewport = new ht, F[Be] = j), j.matrix.fromArray(Je.transform.matrix), j.matrix.decompose(j.position, j.quaternion, j.scale), j.projectionMatrix.fromArray(Je.projectionMatrix), j.projectionMatrixInverse.copy(j.projectionMatrix).invert(), j.viewport.set(je.x, je.y, je.width, je.height), Be === 0 && (V.matrix.copy(j.matrix), V.matrix.decompose(V.position, V.quaternion, V.scale)), Ne === !0 && V.cameras.push(j)
        }
        const xe = i.enabledFeatures;
        if (xe && xe.includes("depth-sensing") && i.depthUsage == "gpu-optimized" && x) {
          u = n.getBinding();
          const Be = u.getDepthInformation(Ee[0]);
          Be && Be.isValid && Be.texture && m.init(Be, i.renderState)
        }
        if (xe && xe.includes("camera-access") && x) {
          e.state.unbindTexture(), u = n.getBinding();
          for (let Be = 0; Be < Ee.length; Be++) {
            const Je = Ee[Be].camera;
            if (Je) {
              let je = g[Je];
              je || (je = new Nh, g[Je] = je);
              const j = u.getCameraImage(Je);
              je.sourceTexture = j
            }
          }
        }
      }
      for (let Ee = 0; Ee < A.length; Ee++) {
        const Ne = b[Ee],
          xe = A[Ee];
        Ne !== null && xe !== void 0 && xe.update(Ne, _e, c || a)
      }
      ee && ee(Y, _e), _e.detectedPlanes && n.dispatchEvent({
        type: "planesdetected",
        data: _e
      }), p = null
    }
    const Oe = new eu;
    Oe.setAnimationLoop(Te), this.setAnimationLoop = function(Y) {
      ee = Y
    }, this.dispose = function() {}
  }
}
const Mx = new We,
  hu = new He;
hu.set(-1, 0, 0, 0, 1, 0, 0, 0, 1);

function Sx(s, e) {
  function t(m, g) {
    m.matrixAutoUpdate === !0 && m.updateMatrix(), g.value.copy(m.matrix)
  }

  function n(m, g) {
    g.color.getRGB(m.fogColor.value, Kh(s)), g.isFog ? (m.fogNear.value = g.near, m.fogFar.value = g.far) : g.isFogExp2 && (m.fogDensity.value = g.density)
  }

  function i(m, g, M, E, v) {
    g.isNodeMaterial ? g.uniformsNeedUpdate = !1 : g.isMeshBasicMaterial ? r(m, g) : g.isMeshLambertMaterial ? (r(m, g), g.envMap && (m.envMapIntensity.value = g.envMapIntensity)) : g.isMeshToonMaterial ? (r(m, g), u(m, g)) : g.isMeshPhongMaterial ? (r(m, g), h(m, g), g.envMap && (m.envMapIntensity.value = g.envMapIntensity)) : g.isMeshStandardMaterial ? (r(m, g), d(m, g), g.isMeshPhysicalMaterial && f(m, g, v)) : g.isMeshMatcapMaterial ? (r(m, g), p(m, g)) : g.isMeshDepthMaterial ? r(m, g) : g.isMeshDistanceMaterial ? (r(m, g), x(m, g)) : g.isMeshNormalMaterial ? r(m, g) : g.isLineBasicMaterial ? (a(m, g), g.isLineDashedMaterial && o(m, g)) : g.isPointsMaterial ? l(m, g, M, E) : g.isSpriteMaterial ? c(m, g) : g.isShadowMaterial ? (m.color.value.copy(g.color), m.opacity.value = g.opacity) : g.isShaderMaterial && (g.uniformsNeedUpdate = !1)
  }

  function r(m, g) {
    m.opacity.value = g.opacity, g.color && m.diffuse.value.copy(g.color), g.emissive && m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity), g.map && (m.map.value = g.map, t(g.map, m.mapTransform)), g.alphaMap && (m.alphaMap.value = g.alphaMap, t(g.alphaMap, m.alphaMapTransform)), g.bumpMap && (m.bumpMap.value = g.bumpMap, t(g.bumpMap, m.bumpMapTransform), m.bumpScale.value = g.bumpScale, g.side === Wt && (m.bumpScale.value *= -1)), g.normalMap && (m.normalMap.value = g.normalMap, t(g.normalMap, m.normalMapTransform), m.normalScale.value.copy(g.normalScale), g.side === Wt && m.normalScale.value.negate()), g.displacementMap && (m.displacementMap.value = g.displacementMap, t(g.displacementMap, m.displacementMapTransform), m.displacementScale.value = g.displacementScale, m.displacementBias.value = g.displacementBias), g.emissiveMap && (m.emissiveMap.value = g.emissiveMap, t(g.emissiveMap, m.emissiveMapTransform)), g.specularMap && (m.specularMap.value = g.specularMap, t(g.specularMap, m.specularMapTransform)), g.alphaTest > 0 && (m.alphaTest.value = g.alphaTest);
    const M = e.get(g),
      E = M.envMap,
      v = M.envMapRotation;
    E && (m.envMap.value = E, m.envMapRotation.value.setFromMatrix4(Mx.makeRotationFromEuler(v)).transpose(), E.isCubeTexture && E.isRenderTargetTexture === !1 && m.envMapRotation.value.premultiply(hu), m.reflectivity.value = g.reflectivity, m.ior.value = g.ior, m.refractionRatio.value = g.refractionRatio), g.lightMap && (m.lightMap.value = g.lightMap, m.lightMapIntensity.value = g.lightMapIntensity, t(g.lightMap, m.lightMapTransform)), g.aoMap && (m.aoMap.value = g.aoMap, m.aoMapIntensity.value = g.aoMapIntensity, t(g.aoMap, m.aoMapTransform))
  }

  function a(m, g) {
    m.diffuse.value.copy(g.color), m.opacity.value = g.opacity, g.map && (m.map.value = g.map, t(g.map, m.mapTransform))
  }

  function o(m, g) {
    m.dashSize.value = g.dashSize, m.totalSize.value = g.dashSize + g.gapSize, m.scale.value = g.scale
  }

  function l(m, g, M, E) {
    m.diffuse.value.copy(g.color), m.opacity.value = g.opacity, m.size.value = g.size * M, m.scale.value = E * .5, g.map && (m.map.value = g.map, t(g.map, m.uvTransform)), g.alphaMap && (m.alphaMap.value = g.alphaMap, t(g.alphaMap, m.alphaMapTransform)), g.alphaTest > 0 && (m.alphaTest.value = g.alphaTest)
  }

  function c(m, g) {
    m.diffuse.value.copy(g.color), m.opacity.value = g.opacity, m.rotation.value = g.rotation, g.map && (m.map.value = g.map, t(g.map, m.mapTransform)), g.alphaMap && (m.alphaMap.value = g.alphaMap, t(g.alphaMap, m.alphaMapTransform)), g.alphaTest > 0 && (m.alphaTest.value = g.alphaTest)
  }

  function h(m, g) {
    m.specular.value.copy(g.specular), m.shininess.value = Math.max(g.shininess, 1e-4)
  }

  function u(m, g) {
    g.gradientMap && (m.gradientMap.value = g.gradientMap)
  }

  function d(m, g) {
    m.metalness.value = g.metalness, g.metalnessMap && (m.metalnessMap.value = g.metalnessMap, t(g.metalnessMap, m.metalnessMapTransform)), m.roughness.value = g.roughness, g.roughnessMap && (m.roughnessMap.value = g.roughnessMap, t(g.roughnessMap, m.roughnessMapTransform)), g.envMap && (m.envMapIntensity.value = g.envMapIntensity)
  }

  function f(m, g, M) {
    m.ior.value = g.ior, g.diffuseRoughness > 0 && (m.diffuseRoughness.value = g.diffuseRoughness, g.diffuseRoughnessMap && (m.diffuseRoughnessMap.value = g.diffuseRoughnessMap, t(g.diffuseRoughnessMap, m.diffuseRoughnessMapTransform))), g.sheen > 0 && (m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen), m.sheenRoughness.value = g.sheenRoughness, g.sheenColorMap && (m.sheenColorMap.value = g.sheenColorMap, t(g.sheenColorMap, m.sheenColorMapTransform)), g.sheenRoughnessMap && (m.sheenRoughnessMap.value = g.sheenRoughnessMap, t(g.sheenRoughnessMap, m.sheenRoughnessMapTransform))), g.clearcoat > 0 && (m.clearcoat.value = g.clearcoat, m.clearcoatRoughness.value = g.clearcoatRoughness, g.clearcoatMap && (m.clearcoatMap.value = g.clearcoatMap, t(g.clearcoatMap, m.clearcoatMapTransform)), g.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = g.clearcoatRoughnessMap, t(g.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), g.clearcoatNormalMap && (m.clearcoatNormalMap.value = g.clearcoatNormalMap, t(g.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale), g.side === Wt && m.clearcoatNormalScale.value.negate())), g.dispersion > 0 && (m.dispersion.value = g.dispersion), g.retroreflectivity > 0 && (m.retroreflectivity.value = g.retroreflectivity), g.iridescence > 0 && (m.iridescence.value = g.iridescence, m.iridescenceIOR.value = g.iridescenceIOR, m.iridescenceThicknessMinimum.value = g.iridescenceThicknessMinimum, m.iridescenceThicknessMaximum.value = g.iridescenceThicknessMaximum, g.iridescenceMap && (m.iridescenceMap.value = g.iridescenceMap, t(g.iridescenceMap, m.iridescenceMapTransform)), g.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = g.iridescenceThicknessMap, t(g.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), g.transmission > 0 && (m.transmission.value = g.transmission, m.transmissionSamplerMap.value = M.texture, m.transmissionSamplerSize.value.set(M.width, M.height), g.transmissionMap && (m.transmissionMap.value = g.transmissionMap, t(g.transmissionMap, m.transmissionMapTransform)), m.thickness.value = g.thickness, g.thicknessMap && (m.thicknessMap.value = g.thicknessMap, t(g.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = g.attenuationDistance, m.attenuationColor.value.copy(g.attenuationColor)), g.anisotropy > 0 && (m.anisotropyVector.value.set(g.anisotropy * Math.cos(g.anisotropyRotation), g.anisotropy * Math.sin(g.anisotropyRotation)), g.anisotropyMap && (m.anisotropyMap.value = g.anisotropyMap, t(g.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = g.specularIntensity, m.specularColor.value.copy(g.specularColor), g.specularColorMap && (m.specularColorMap.value = g.specularColorMap, t(g.specularColorMap, m.specularColorMapTransform)), g.specularIntensityMap && (m.specularIntensityMap.value = g.specularIntensityMap, t(g.specularIntensityMap, m.specularIntensityMapTransform))
  }

  function p(m, g) {
    g.matcap && (m.matcap.value = g.matcap)
  }

  function x(m, g) {
    const M = e.get(g).light;
    m.referencePosition.value.setFromMatrixPosition(M.matrixWorld), m.nearDistance.value = M.shadow.camera.near, m.farDistance.value = M.shadow.camera.far
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: i
  }
}

function yx(s, e, t, n) {
  let i = {},
    r = {};

  function a(M, E) {
    const v = E.program;
    n.uniformBlockBinding(M, v, i[M.id])
  }

  function o(M, E) {
    let v = i[M.id];
    v === void 0 && (p(M), v = l(M), i[M.id] = v, M.addEventListener("dispose", m));
    const A = E.program;
    n.updateUBOMapping(M, A);
    const b = e.render.frame;
    r[M.id] !== b && (c(M), r[M.id] = b)
  }

  function l(M) {
    const E = s.createBuffer(),
      v = M.__size,
      A = M.usage;
    return s.bindBuffer(s.UNIFORM_BUFFER, E), s.bufferData(s.UNIFORM_BUFFER, v, A), s.bindBuffer(s.UNIFORM_BUFFER, null), E
  }

  function c(M) {
    const E = i[M.id],
      v = M.uniforms,
      A = M.__cache;
    s.bindBuffer(s.UNIFORM_BUFFER, E);
    for (let b = 0, _ = v.length; b < _; b++) {
      const T = v[b];
      if (Array.isArray(T))
        for (let I = 0, R = T.length; I < R; I++) h(T[I], b, I, A);
      else h(T, b, 0, A)
    }
    s.bindBuffer(s.UNIFORM_BUFFER, null)
  }

  function h(M, E, v, A) {
    if (d(M, E, v, A) === !0) {
      const b = M.__offset,
        _ = M.value;
      if (Array.isArray(_)) {
        let T = 0;
        for (let I = 0; I < _.length; I++) {
          const R = _[I],
            D = x(R, !0);
          u(R, M.__data, T), T += D.storage / Float32Array.BYTES_PER_ELEMENT
        }
      } else u(_, M.__data, 0);
      s.bufferSubData(s.UNIFORM_BUFFER, b, M.__data)
    }
  }

  function u(M, E, v) {
    typeof M == "number" || typeof M == "boolean" ? E[v] = M : M.isMatrix3 ? (E[v] = M.elements[0], E[v + 1] = M.elements[1], E[v + 2] = M.elements[2], E[v + 3] = 0, E[v + 4] = M.elements[3], E[v + 5] = M.elements[4], E[v + 6] = M.elements[5], E[v + 7] = 0, E[v + 8] = M.elements[6], E[v + 9] = M.elements[7], E[v + 10] = M.elements[8], E[v + 11] = 0) : ArrayBuffer.isView(M) ? E.set(M.subarray(0, E.length - v), v) : M.toArray(E, v)
  }

  function d(M, E, v, A) {
    const b = M.value,
      _ = E + "_" + v;
    if (Array.isArray(b)) {
      A[_] === void 0 && (A[_] = []);
      const T = A[_];
      let I = !1;
      for (let R = 0; R < b.length; R++) f(b[R], T, R) === !0 && (I = !0);
      return I
    }
    return f(b, A, _)
  }

  function f(M, E, v) {
    if (E[v] === void 0) return typeof M == "number" || typeof M == "boolean" ? E[v] = M : ArrayBuffer.isView(M) ? E[v] = M.slice() : E[v] = M.clone(), !0;
    {
      const A = E[v];
      if (typeof M == "number" || typeof M == "boolean") {
        if (A !== M) return E[v] = M, !0
      } else {
        if (ArrayBuffer.isView(M)) return !0;
        if (A.equals(M) === !1) return A.copy(M), !0
      }
    }
    return !1
  }

  function p(M) {
    const E = M.uniforms;
    let v = 0;
    const A = 16;
    for (let _ = 0, T = E.length; _ < T; _++) {
      const I = Array.isArray(E[_]) ? E[_] : [E[_]];
      for (let R = 0, D = I.length; R < D; R++) {
        const F = I[R],
          V = Array.isArray(F.value) ? F.value : [F.value],
          L = Array.isArray(E[_]) || Array.isArray(F.value);
        let k = v;
        for (let H = 0, te = V.length; H < te; H++) {
          const W = V[H],
            Q = x(W, L),
            ee = v % A,
            Te = ee % Q.boundary,
            Oe = ee + Te;
          v += Te, Oe !== 0 && A - Oe < Q.storage && (v += A - Oe), H === 0 && (k = v), v += Q.storage
        }
        const X = F.type === "int" ? Int32Array : F.type === "uint" ? Uint32Array : Float32Array;
        F.__data = new X((v - k) / Float32Array.BYTES_PER_ELEMENT), F.__offset = k
      }
    }
    const b = v % A;
    return b > 0 && (v += A - b), M.__size = v, M.__cache = {}, this
  }

  function x(M, E) {
    const v = {
      boundary: 0,
      storage: 0
    };
    return typeof M == "number" || typeof M == "boolean" ? (v.boundary = 4, v.storage = 4) : M.isVector2 ? (v.boundary = 8, v.storage = 8) : M.isVector3 || M.isColor ? (v.boundary = 16, v.storage = 12) : M.isVector4 ? (v.boundary = 16, v.storage = 16) : M.isMatrix3 ? (v.boundary = 16, v.storage = 48) : M.isMatrix4 ? (v.boundary = 16, v.storage = 64) : M.isTexture ? Ce("WebGLRenderer: Texture samplers can not be part of an uniforms group.") : ArrayBuffer.isView(M) ? (v.boundary = 16, v.storage = M.byteLength) : Ce("WebGLRenderer: Unsupported uniform value type.", M), E === !0 && (v.boundary = 16, v.storage = Math.ceil(v.storage / 16) * 16), v
  }

  function m(M) {
    const E = M.target;
    E.removeEventListener("dispose", m), s.deleteBuffer(i[E.id]), delete i[E.id], delete r[E.id]
  }

  function g() {
    for (const M in i) s.deleteBuffer(i[M]);
    i = {}, r = {}
  }
  return {
    bind: a,
    update: o,
    dispose: g
  }
}
const Tx = new Uint16Array([12469, 15057, 12620, 14925, 13266, 14620, 13807, 14376, 14323, 13990, 14545, 13625, 14713, 13328, 14840, 12882, 14931, 12528, 14996, 12233, 15039, 11829, 15066, 11525, 15080, 11295, 15085, 10976, 15082, 10705, 15073, 10495, 13880, 14564, 13898, 14542, 13977, 14430, 14158, 14124, 14393, 13732, 14556, 13410, 14702, 12996, 14814, 12596, 14891, 12291, 14937, 11834, 14957, 11489, 14958, 11194, 14943, 10803, 14921, 10506, 14893, 10278, 14858, 9960, 14484, 14039, 14487, 14025, 14499, 13941, 14524, 13740, 14574, 13468, 14654, 13106, 14743, 12678, 14818, 12344, 14867, 11893, 14889, 11509, 14893, 11180, 14881, 10751, 14852, 10428, 14812, 10128, 14765, 9754, 14712, 9466, 14764, 13480, 14764, 13475, 14766, 13440, 14766, 13347, 14769, 13070, 14786, 12713, 14816, 12387, 14844, 11957, 14860, 11549, 14868, 11215, 14855, 10751, 14825, 10403, 14782, 10044, 14729, 9651, 14666, 9352, 14599, 9029, 14967, 12835, 14966, 12831, 14963, 12804, 14954, 12723, 14936, 12564, 14917, 12347, 14900, 11958, 14886, 11569, 14878, 11247, 14859, 10765, 14828, 10401, 14784, 10011, 14727, 9600, 14660, 9289, 14586, 8893, 14508, 8533, 15111, 12234, 15110, 12234, 15104, 12216, 15092, 12156, 15067, 12010, 15028, 11776, 14981, 11500, 14942, 11205, 14902, 10752, 14861, 10393, 14812, 9991, 14752, 9570, 14682, 9252, 14603, 8808, 14519, 8445, 14431, 8145, 15209, 11449, 15208, 11451, 15202, 11451, 15190, 11438, 15163, 11384, 15117, 11274, 15055, 10979, 14994, 10648, 14932, 10343, 14871, 9936, 14803, 9532, 14729, 9218, 14645, 8742, 14556, 8381, 14461, 8020, 14365, 7603, 15273, 10603, 15272, 10607, 15267, 10619, 15256, 10631, 15231, 10614, 15182, 10535, 15118, 10389, 15042, 10167, 14963, 9787, 14883, 9447, 14800, 9115, 14710, 8665, 14615, 8318, 14514, 7911, 14411, 7507, 14279, 7198, 15314, 9675, 15313, 9683, 15309, 9712, 15298, 9759, 15277, 9797, 15229, 9773, 15166, 9668, 15084, 9487, 14995, 9274, 14898, 8910, 14800, 8539, 14697, 8234, 14590, 7790, 14479, 7409, 14367, 7067, 14178, 6621, 15337, 8619, 15337, 8631, 15333, 8677, 15325, 8769, 15305, 8871, 15264, 8940, 15202, 8909, 15119, 8775, 15022, 8565, 14916, 8328, 14804, 8009, 14688, 7614, 14569, 7287, 14448, 6888, 14321, 6483, 14088, 6171, 15350, 7402, 15350, 7419, 15347, 7480, 15340, 7613, 15322, 7804, 15287, 7973, 15229, 8057, 15148, 8012, 15046, 7846, 14933, 7611, 14810, 7357, 14682, 7069, 14552, 6656, 14421, 6316, 14251, 5948, 14007, 5528, 15356, 5942, 15356, 5977, 15353, 6119, 15348, 6294, 15332, 6551, 15302, 6824, 15249, 7044, 15171, 7122, 15070, 7050, 14949, 6861, 14818, 6611, 14679, 6349, 14538, 6067, 14398, 5651, 14189, 5311, 13935, 4958, 15359, 4123, 15359, 4153, 15356, 4296, 15353, 4646, 15338, 5160, 15311, 5508, 15263, 5829, 15188, 6042, 15088, 6094, 14966, 6001, 14826, 5796, 14678, 5543, 14527, 5287, 14377, 4985, 14133, 4586, 13869, 4257, 15360, 1563, 15360, 1642, 15358, 2076, 15354, 2636, 15341, 3350, 15317, 4019, 15273, 4429, 15203, 4732, 15105, 4911, 14981, 4932, 14836, 4818, 14679, 4621, 14517, 4386, 14359, 4156, 14083, 3795, 13808, 3437, 15360, 122, 15360, 137, 15358, 285, 15355, 636, 15344, 1274, 15322, 2177, 15281, 2765, 15215, 3223, 15120, 3451, 14995, 3569, 14846, 3567, 14681, 3466, 14511, 3305, 14344, 3121, 14037, 2800, 13753, 2467, 15360, 0, 15360, 1, 15359, 21, 15355, 89, 15346, 253, 15325, 479, 15287, 796, 15225, 1148, 15133, 1492, 15008, 1749, 14856, 1882, 14685, 1886, 14506, 1783, 14324, 1608, 13996, 1398, 13702, 1183]);
let mn = null;

function Ex() {
  return mn === null && (mn = new Go(Tx, 16, 16, ui, yn), mn.name = "DFG_LUT", mn.minFilter = Ct, mn.magFilter = Ct, mn.wrapS = on, mn.wrapT = on, mn.generateMipmaps = !1, mn.needsUpdate = !0), mn
}
class Hv {
  constructor(e = {}) {
    const {
      canvas: t = ud(),
      context: n = null,
      depth: i = !0,
      stencil: r = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: u = !1,
      reversedDepthBuffer: d = !1,
      outputBufferType: f = Jt
    } = e;
    this.isWebGLRenderer = !0;
    let p;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      p = n.getContextAttributes().alpha
    } else p = a;
    const x = f,
      m = new Set([Do, No, Io]),
      g = new Set([Jt, Sn, Ss, ki, Co, Lo]),
      M = new Uint32Array(4),
      E = new Int32Array(4),
      v = {
        textures: [],
        min: [],
        max: [],
        resolution: []
      };
    let A = null,
      b = null;
    const _ = [],
      T = [];
    let I = null;
    this.domElement = t, this.debug = {
      checkShaderErrors: !0,
      diagnostics: {
        keywords: !1
      },
      onShaderError: null
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = Un, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
    const R = this;
    let D = !1,
      F = null,
      V = null,
      L = null,
      k = null;
    this._outputColorSpace = bt;
    let X = 0,
      H = 0,
      te = null,
      W = -1,
      Q = null;
    const ee = new ht,
      Te = new ht;
    let Oe = null;
    const Y = new Fe(0);
    let _e = 0,
      Ee = t.width,
      Ne = t.height,
      xe = 1,
      De = null,
      mt = null;
    const Be = new ht(0, 0, Ee, Ne),
      Je = new ht(0, 0, Ee, Ne);
    let je = !1;
    const j = new As,
      ce = new Wo;
    let ae = !1,
      ye = !1;
    const ge = new We,
      Ve = new N,
      Le = new ht,
      et = {
        background: null,
        fog: null,
        environment: null,
        overrideMaterial: null,
        isScene: !0
      };
    let tt = !1;

    function rt() {
      return te === null ? xe : 1
    }
    let U = n;

    function yt(y, P) {
      return t.getContext(y, P)
    }
    let $e, dt, fe, St, Ue, ke, w, S, B, ne, $, oe, pe, K, J, he, C, Z, q, ue, se, le, Pe;
    try {
      const y = {
        alpha: !0,
        depth: i,
        stencil: r,
        antialias: o,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: h,
        failIfMajorPerformanceCaveat: u
      };
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${wo}`), t.addEventListener("webglcontextlost", Ie, !1), t.addEventListener("webglcontextrestored", Xe, !1), t.addEventListener("webglcontextcreationerror", ve, !1), U === null) {
        const P = "webgl2";
        if (U = yt(P, y), U === null) throw yt(P) ? new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.") : new Error("THREE.WebGLRenderer: Error creating WebGL context.")
      }
      qe()
    } catch (y) {
      throw t.removeEventListener("webglcontextlost", Ie, !1), t.removeEventListener("webglcontextrestored", Xe, !1), t.removeEventListener("webglcontextcreationerror", ve, !1), ze("WebGLRenderer: " + y.message), y
    }

    function qe() {
      $e = new R_(U), $e.init(), se = new mx(U, $e), dt = new __(U, $e, e, se), fe = new fx(U, $e), dt.reversedDepthBuffer && d && fe.buffers.depth.setReversed(!0), V = U.createFramebuffer(), L = U.createFramebuffer(), k = U.createFramebuffer(), St = new P_(U), Ue = new j0, ke = new px(U, $e, fe, Ue, dt, se, St), w = new w_(R), S = new Np(U), le = new m_(U, S), B = new C_(U, S, St, le), ne = new N_(U, B, S, le, St), Z = new I_(U, dt, ke), J = new x_(Ue), $ = new Q0(R, w, $e, dt, le, J), oe = new Sx(R, Ue), pe = new tx, K = new ox($e), C = new p_(R, w, fe, ne, p, l), he = new dx(R, ne, dt), Pe = new yx(U, St, dt, fe), q = new g_(U, $e, St), ue = new L_(U, $e, St), St.programs = $.programs, R.capabilities = dt, R.extensions = $e, R.properties = Ue, R.renderLists = pe, R.shadowMap = he, R.state = fe, R.info = St
    }
    x !== Jt && (I = new U_(x, t.width, t.height, o, i, r));
    const ie = new vx(R, U);
    this.xr = ie, this.getContext = function() {
      return U
    }, this.getContextAttributes = function() {
      return U.getContextAttributes()
    }, this.forceContextLoss = function() {
      const y = $e.get("WEBGL_lose_context");
      y && y.loseContext()
    }, this.forceContextRestore = function() {
      const y = $e.get("WEBGL_lose_context");
      y && y.restoreContext()
    }, this.getPixelRatio = function() {
      return xe
    }, this.setPixelRatio = function(y) {
      y !== void 0 && (xe = y, this.setSize(Ee, Ne, !1))
    }, this.getSize = function(y) {
      return y.set(Ee, Ne)
    }, this.setSize = function(y, P, G = !0) {
      if (ie.isPresenting) {
        Ce("WebGLRenderer: Can't change size while VR device is presenting.");
        return
      }
      Ee = y, Ne = P, t.width = Math.floor(y * xe), t.height = Math.floor(P * xe), G === !0 && (t.style.width = y + "px", t.style.height = P + "px"), I !== null && I.setSize(t.width, t.height), this.setViewport(0, 0, y, P)
    }, this.getDrawingBufferSize = function(y) {
      return y.set(Ee * xe, Ne * xe).floor()
    }, this.setDrawingBufferSize = function(y, P, G) {
      Ee = y, Ne = P, xe = G, t.width = Math.floor(y * G), t.height = Math.floor(P * G), this.setViewport(0, 0, y, P)
    }, this.setEffects = function(y) {
      if (x === Jt) {
        ze("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");
        return
      }
      if (y) {
        for (let P = 0; P < y.length; P++)
          if (y[P].isOutputPass === !0) {
            Ce("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");
            break
          }
      }
      I.setEffects(y || [])
    }, this.getCurrentViewport = function(y) {
      return y.copy(ee)
    }, this.getViewport = function(y) {
      return y.copy(Be)
    }, this.setViewport = function(y, P, G, O) {
      y.isVector4 ? Be.set(y.x, y.y, y.z, y.w) : Be.set(y, P, G, O), fe.viewport(ee.copy(Be).multiplyScalar(rt()).round())
    }, this.getScissor = function(y) {
      return y.copy(Je)
    }, this.setScissor = function(y, P, G, O) {
      y.isVector4 ? Je.set(y.x, y.y, y.z, y.w) : Je.set(y, P, G, O), fe.scissor(Te.copy(Je).multiplyScalar(rt()).round())
    }, this.getScissorTest = function() {
      return je
    }, this.setScissorTest = function(y) {
      fe.setScissorTest(je = y)
    }, this.setOpaqueSort = function(y) {
      De = y
    }, this.setTransparentSort = function(y) {
      mt = y
    }, this.getClearColor = function(y) {
      return y.copy(C.getClearColor())
    }, this.setClearColor = function() {
      C.setClearColor(...arguments)
    }, this.getClearAlpha = function() {
      return C.getClearAlpha()
    }, this.setClearAlpha = function() {
      C.setClearAlpha(...arguments)
    }, this.clear = function(y = !0, P = !0, G = !0) {
      let O = 0;
      if (y) {
        let z = !1;
        if (te !== null) {
          const me = te.texture.format;
          z = m.has(me)
        }
        if (z) {
          const me = te.texture.type,
            be = g.has(me),
            de = C.getClearColor(),
            Se = C.getClearAlpha(),
            Re = de.r,
            Ge = de.g,
            nt = de.b;
          be ? (M[0] = Re, M[1] = Ge, M[2] = nt, M[3] = Se, U.clearBufferuiv(U.COLOR, 0, M)) : (E[0] = Re, E[1] = Ge, E[2] = nt, E[3] = Se, U.clearBufferiv(U.COLOR, 0, E))
        } else O |= U.COLOR_BUFFER_BIT
      }
      P && (O |= U.DEPTH_BUFFER_BIT, this.state.buffers.depth.setMask(!0)), G && (O |= U.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), O !== 0 && U.clear(O)
    }, this.clearColor = function() {
      this.clear(!0, !1, !1)
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1)
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0)
    }, this.setNodesHandler = function(y) {
      y.setRenderer(this), F = y
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", Ie, !1), t.removeEventListener("webglcontextrestored", Xe, !1), t.removeEventListener("webglcontextcreationerror", ve, !1), C.dispose(), pe.dispose(), K.dispose(), ke.dispose(), Ue.dispose(), w.dispose(), ne.dispose(), B.dispose(), le.dispose(), Pe.dispose(), $.dispose(), ie.dispose(), ie.removeEventListener("sessionstart", ol), ie.removeEventListener("sessionend", ll), ei.stop()
    };

    function Ie(y) {
      y.preventDefault(), wr("WebGLRenderer: Context Lost."), D = !0
    }

    function Xe() {
      wr("WebGLRenderer: Context Restored."), D = !1;
      const y = St.autoReset,
        P = he.enabled,
        G = he.autoUpdate,
        O = he.needsUpdate,
        z = he.type;
      qe(), St.autoReset = y, he.enabled = P, he.autoUpdate = G, he.needsUpdate = O, he.type = z
    }

    function ve(y) {
      ze("WebGLRenderer: A WebGL context could not be created. Reason: ", y.statusMessage)
    }

    function lt(y) {
      const P = y.target;
      P.removeEventListener("dispose", lt), It(P)
    }

    function It(y) {
      On(y), Ue.remove(y)
    }

    function On(y) {
      const P = Ue.get(y).programs;
      P !== void 0 && (P.forEach(function(G) {
        $.releaseProgram(G)
      }), y.isShaderMaterial && $.releaseShaderCache(y))
    }
    this.renderBufferDirect = function(y, P, G, O, z, me) {
      P === null && (P = et);
      const be = z.isMesh && z.matrixWorld.determinantAffine() < 0,
        de = vu(y, P, G, O, z);
      fe.setMaterial(O, be);
      let Se = G.index,
        Re = 1;
      if (O.wireframe === !0) {
        if (Se = B.getWireframeAttribute(G), Se === void 0) return;
        Re = 2
      }
      const Ge = G.drawRange,
        nt = G.attributes.position;
      let Ae = Ge.start * Re,
        it = (Ge.start + Ge.count) * Re;
      me !== null && (Ae = Math.max(Ae, me.start * Re), it = Math.min(it, (me.start + me.count) * Re)), Se !== null ? (Ae = Math.max(Ae, 0), it = Math.min(it, Se.count)) : nt != null && (Ae = Math.max(Ae, 0), it = Math.min(it, nt.count));
      const Tt = it - Ae;
      if (Tt < 0 || Tt === 1 / 0) return;
      le.setup(z, O, de, G, Se);
      let pt, ft = q;
      if (Se !== null && (pt = S.get(Se), ft = ue, ft.setIndex(pt)), z.isMesh) O.wireframe === !0 ? (fe.setLineWidth(O.wireframeLinewidth * rt()), ft.setMode(U.LINES)) : ft.setMode(U.TRIANGLES);
      else if (z.isLine) {
        let Ot = O.linewidth;
        Ot === void 0 && (Ot = 1), fe.setLineWidth(Ot * rt()), z.isLineSegments ? ft.setMode(U.LINES) : z.isLineLoop ? ft.setMode(U.LINE_LOOP) : ft.setMode(U.LINE_STRIP)
      } else z.isPoints ? ft.setMode(U.POINTS) : z.isSprite && ft.setMode(U.TRIANGLES);
      if (z.isBatchedMesh)
        if ($e.get("WEBGL_multi_draw")) ft.renderMultiDraw(z._multiDrawStarts, z._multiDrawCounts, z._multiDrawCount);
        else {
          const Ot = z._multiDrawStarts,
            we = z._multiDrawCounts,
            Ht = z._multiDrawCount,
            at = Se ? S.get(Se).bytesPerElement : 1,
            ti = Ue.get(O).currentProgram.getUniforms();
          for (let Bt = 0; Bt < Ht; Bt++) ti.setValue(U, "_gl_DrawID", Bt), ft.render(Ot[Bt] / at, we[Bt])
        }
      else if (z.isInstancedMesh) ft.renderInstances(Ae, Tt, z.count);
      else if (G.isInstancedBufferGeometry) {
        const Ot = G._maxInstanceCount !== void 0 ? G._maxInstanceCount : 1 / 0,
          we = Math.min(G.instanceCount, Ot);
        ft.renderInstances(Ae, Tt, we)
      } else ft.render(Ae, Tt)
    };

    function al(y, P, G, O) {
      F !== null && y.isNodeMaterial && F.setObject(O, y), ae === !0 && J.setState(y, G, !1), y.transparent === !0 && y.side === xn && y.forceSinglePass === !1 ? (y.side = Wt, y.needsUpdate = !0, $i(y, P, O), y.side = $n, y.needsUpdate = !0, $i(y, P, O), y.side = xn) : $i(y, P, O)
    }
    this.compile = function(y, P, G = null) {
      G === null && (G = y), F !== null && F.renderStart(y, P, G), b = K.get(G), b.init(P), T.push(b), G.traverseVisible(function(z) {
        z.isLight && z.layers.test(P.layers) && (b.pushLight(z), z.castShadow && b.pushShadow(z))
      }), y !== G && y.traverseVisible(function(z) {
        z.isLight && z.layers.test(P.layers) && (b.pushLight(z), z.castShadow && b.pushShadow(z))
      }), b.setupLights(), F !== null && F.updateLights(b.state.lightsArray), ye = this.localClippingEnabled, ae = J.init(this.clippingPlanes, ye), ae === !0 && J.setGlobalState(this.clippingPlanes, P), F !== null && he.render(b.state.shadowsArray, G, P);
      const O = new Set;
      return y.traverse(function(z) {
        if (!(z.isMesh || z.isPoints || z.isLine || z.isSprite)) return;
        const me = z.material;
        if (me)
          if (Array.isArray(me))
            for (let be = 0; be < me.length; be++) {
              const de = me[be];
              al(de, G, P, z), O.add(de)
            } else al(me, G, P, z), O.add(me)
      }), b = T.pop(), F !== null && F.renderEnd(), O
    }, this.compileAsync = function(y, P, G = null) {
      const O = this.compile(y, P, G);
      return new Promise(z => {
        function me() {
          if (O.forEach(function(be) {
              const Se = Ue.get(be).currentProgram;
              (Se === void 0 || Se.isReady()) && O.delete(be)
            }), O.size === 0) {
            z(y);
            return
          }
          setTimeout(me, 10)
        }
        $e.get("KHR_parallel_shader_compile") !== null ? me() : setTimeout(me, 10)
      })
    };
    let Hr = null;

    function _u(y) {
      Hr && Hr(y)
    }

    function ol() {
      ei.stop()
    }

    function ll() {
      ei.start()
    }
    const ei = new eu;
    ei.setAnimationLoop(_u), typeof self < "u" && ei.setContext(self), this.setAnimationLoop = function(y) {
      Hr = y, ie.setAnimationLoop(y), y === null ? ei.stop() : ei.start()
    }, ie.addEventListener("sessionstart", ol), ie.addEventListener("sessionend", ll), this.render = function(y, P) {
      if (P !== void 0 && P.isCamera !== !0) {
        ze("WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return
      }
      if (D === !0) return;
      F !== null && F.renderStart(y, P);
      const G = ie.enabled === !0 && ie.isPresenting === !0,
        O = I !== null && (te === null || G) && I.begin(R, te);
      if (y.matrixWorldAutoUpdate === !0 && y.updateMatrixWorld(), P.parent === null && P.matrixWorldAutoUpdate === !0 && P.updateMatrixWorld(), ie.enabled === !0 && ie.isPresenting === !0 && (I === null || I.isCompositing() === !1) && (ie.cameraAutoUpdate === !0 && ie.updateCamera(P), P = ie.getCamera()), y.isScene === !0 && y.onBeforeRender(R, y, P, te), b = K.get(y, T.length), b.init(P), b.state.textureUnits = ke.getTextureUnits(), T.push(b), ge.multiplyMatrices(P.projectionMatrix, P.matrixWorldInverse), P.isArrayCamera ? ce.setFromArrayCamera(P) : j.setFromProjectionMatrix(ge, cn, P.reversedDepth), ye = this.localClippingEnabled, ae = J.init(this.clippingPlanes, ye), A = pe.get(y, _.length), A.init(), _.push(A), this.info.render.frame++, ie.enabled === !0 && ie.isPresenting === !0) {
        const be = R.xr.getDepthSensingMesh();
        be !== null && Gr(be, P, -1 / 0, R.sortObjects)
      }
      Gr(y, P, 0, R.sortObjects), A.finish(), F !== null && F.updateLights(b.state.lightsArray), R.sortObjects === !0 && A.sort(De, mt), tt = ie.enabled === !1 || ie.isPresenting === !1 || ie.hasDepthSensing() === !1, tt && C.addToRenderList(A, y), this.info.autoReset === !0 && this.info.reset(), ae === !0 && J.beginShadows();
      const z = b.state.shadowsArray;
      if (he.render(z, y, P), ae === !0 && J.endShadows(), (O && I.hasRenderPass()) === !1) {
        const be = A.opaque,
          de = A.transmissive;
        if (b.setupLights(), P.isArrayCamera) {
          const Se = P.cameras;
          if (de.length > 0)
            for (let Re = 0, Ge = Se.length; Re < Ge; Re++) {
              const nt = Se[Re];
              hl(be, de, y, nt)
            }
          tt && C.render(y);
          for (let Re = 0, Ge = Se.length; Re < Ge; Re++) {
            const nt = Se[Re];
            cl(A, y, nt, nt.viewport)
          }
        } else de.length > 0 && hl(be, de, y, P), tt && C.render(y), cl(A, y, P)
      }
      te !== null && H === 0 && (ke.updateMultisampleRenderTarget(te), ke.updateRenderTargetMipmap(te)), O && I.end(R), y.isScene === !0 && y.onAfterRender(R, y, P), le.resetDefaultState(), W = -1, Q = null, T.pop(), T.length > 0 ? (b = T[T.length - 1], ke.setTextureUnits(b.state.textureUnits), ae === !0 && J.setGlobalState(R.clippingPlanes, b.state.camera)) : b = null, _.pop(), _.length > 0 ? A = _[_.length - 1] : A = null, F !== null && F.renderEnd()
    };

    function Gr(y, P, G, O) {
      if (y.visible === !1) return;
      if (y.layers.test(P.layers)) {
        if (y.isGroup) G = y.renderOrder;
        else if (y.isLOD) y.autoUpdate === !0 && y.update(P);
        else if (y.isLight) b.pushLight(y), y.castShadow && b.pushShadow(y);
        else if (y.isSprite) {
          const be = P.isArrayCamera ? ce : j;
          if (!y.frustumCulled || y.intersectsFrustum(be)) {
            O && Le.setFromMatrixPosition(y.matrixWorld).applyMatrix4(ge);
            const de = ne.update(y),
              Se = y.material;
            Se.visible && A.push(y, de, Se, G, Le.z, null, P)
          }
        } else if (y.isMesh || y.isLine || y.isPoints) {
          const be = P.isArrayCamera ? ce : j;
          if (!y.frustumCulled || y.intersectsFrustum(be)) {
            const de = ne.update(y),
              Se = y.material;
            if (O && (y.boundingSphere !== void 0 ? (y.boundingSphere === null && y.computeBoundingSphere(), Le.copy(y.boundingSphere.center)) : (de.boundingSphere === null && de.computeBoundingSphere(), Le.copy(de.boundingSphere.center)), Le.applyMatrix4(y.matrixWorld).applyMatrix4(ge)), Array.isArray(Se)) {
              const Re = de.groups;
              for (let Ge = 0, nt = Re.length; Ge < nt; Ge++) {
                const Ae = Re[Ge],
                  it = Se[Ae.materialIndex];
                it && it.visible && A.push(y, de, it, G, Le.z, Ae, P)
              }
            } else Se.visible && A.push(y, de, Se, G, Le.z, null, P)
          }
        }
      }
      const me = y.children;
      for (let be = 0, de = me.length; be < de; be++) Gr(me[be], P, G, O)
    }

    function cl(y, P, G, O) {
      const {
        opaque: z,
        transmissive: me,
        transparent: be
      } = y;
      b.setupLightsView(G), ae === !0 && J.setGlobalState(R.clippingPlanes, G), O && fe.viewport(ee.copy(O)), z.length > 0 && Os(z, P, G), me.length > 0 && Os(me, P, G), be.length > 0 && Os(be, P, G), fe.buffers.depth.setTest(!0), fe.buffers.depth.setMask(!0), fe.buffers.color.setMask(!0), fe.setPolygonOffset(!1)
    }

    function hl(y, P, G, O) {
      if ((G.isScene === !0 ? G.overrideMaterial : null) !== null) return;
      if (b.state.transmissionRenderTarget[O.id] === void 0) {
        const Ae = $e.has("EXT_color_buffer_half_float") || $e.has("EXT_color_buffer_float");
        b.state.transmissionRenderTarget[O.id] = new Mn(1, 1, {
          generateMipmaps: !0,
          type: Ae ? yn : Jt,
          minFilter: vn,
          samples: Math.max(4, dt.samples),
          stencilBuffer: r,
          resolveDepthBuffer: !1,
          resolveStencilBuffer: !1,
          storeMultisampledDepthBuffer: !1,
          storeMultisampledStencilBuffer: !1,
          colorSpace: Qe.workingColorSpace
        })
      }
      const me = b.state.transmissionRenderTarget[O.id],
        be = O.viewport || ee;
      me.setSize(be.z * R.transmissionResolutionScale, be.w * R.transmissionResolutionScale);
      const de = R.getRenderTarget(),
        Se = R.getActiveCubeFace(),
        Re = R.getActiveMipmapLevel();
      R.setRenderTarget(me), R.getClearColor(Y), _e = R.getClearAlpha(), _e < 1 && R.setClearColor(16777215, .5), R.clear(), tt && C.render(G);
      const Ge = R.toneMapping;
      R.toneMapping = Un;
      const nt = O.viewport;
      if (O.viewport !== void 0 && (O.viewport = void 0), b.setupLightsView(O), ae === !0 && J.setGlobalState(R.clippingPlanes, O), Os(y, G, O), ke.updateMultisampleRenderTarget(me), ke.updateRenderTargetMipmap(me), $e.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Ae = !1;
        for (let it = 0, Tt = P.length; it < Tt; it++) {
          const pt = P[it],
            {
              object: ft,
              geometry: Ot,
              material: we,
              group: Ht
            } = pt;
          if (we.side === xn && ft.layers.test(O.layers)) {
            const at = we.side;
            we.side = Wt, we.needsUpdate = !0, ul(ft, G, O, Ot, we, Ht), we.side = at, we.needsUpdate = !0, Ae = !0
          }
        }
        Ae === !0 && (ke.updateMultisampleRenderTarget(me), ke.updateRenderTargetMipmap(me))
      }
      R.setRenderTarget(de, Se, Re), R.setClearColor(Y, _e), nt !== void 0 && (O.viewport = nt), R.toneMapping = Ge
    }

    function Os(y, P, G) {
      const O = P.isScene === !0 ? P.overrideMaterial : null;
      for (let z = 0, me = y.length; z < me; z++) {
        const be = y[z],
          {
            object: de,
            geometry: Se,
            group: Re
          } = be;
        let Ge = be.material;
        Ge.allowOverride === !0 && O !== null && (Ge = O), de.layers.test(G.layers) && ul(de, P, G, Se, Ge, Re)
      }
    }

    function ul(y, P, G, O, z, me) {
      F !== null && z.isNodeMaterial && F.setObject(y, z), y.onBeforeRender(R, P, G, O, z, me), y.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse, y.matrixWorld), y.normalMatrix.getNormalMatrix(y.modelViewMatrix), z.onBeforeRender(R, P, G, O, y, me), z.transparent === !0 && z.side === xn && z.forceSinglePass === !1 ? (z.side = Wt, z.needsUpdate = !0, R.renderBufferDirect(G, P, O, z, y, me), z.side = $n, z.needsUpdate = !0, R.renderBufferDirect(G, P, O, z, y, me), z.side = xn) : R.renderBufferDirect(G, P, O, z, y, me), y.onAfterRender(R, P, G, O, z, me)
    }

    function dl(y) {
      let P = 0;
      for (const G of y) G.texture !== null && P++;
      return P
    }

    function $i(y, P, G) {
      P.isScene !== !0 && (P = et);
      const O = Ue.get(y),
        z = b.state.lights,
        me = b.state.shadowsArray,
        be = z.state.version,
        de = $.getParameters(y, z.state, me, P, G, b.state.lightProbeGridArray),
        Se = $.getProgramCacheKey(de);
      let Re = O.programs;
      O.environment = y.isMeshStandardMaterial || y.isMeshLambertMaterial || y.isMeshPhongMaterial ? P.environment : null, O.fog = P.fog;
      const Ge = y.isMeshStandardMaterial || y.isMeshLambertMaterial && !y.envMap || y.isMeshPhongMaterial && !y.envMap;
      O.envMap = w.get(y.envMap || O.environment, Ge), O.envMapRotation = O.environment !== null && y.envMap === null ? P.environmentRotation : y.envMapRotation, Re === void 0 && (y.addEventListener("dispose", lt), Re = new Map, O.programs = Re, O.programVariants = new Map);
      let nt = Re.get(Se);
      if (nt !== void 0) {
        if (O.currentProgram === nt && O.lightsStateVersion === be) return pl(y, de), nt
      } else de.uniforms = $.getUniforms(y), F !== null && y.isNodeMaterial && F.build(y, G, de), y.onBeforeCompile(de, R), nt = $.acquireProgram(de, Se), Re.set(Se, nt), O.uniforms = de.uniforms;
      const Ae = O.uniforms;
      return (!y.isShaderMaterial && !y.isRawShaderMaterial || y.clipping === !0) && (Ae.clippingPlanes = J.uniform), pl(y, de), O.needsLights = Su(y), O.lightsStateVersion = be, O.needsLights && (Ae.ambientLightColor.value = z.state.ambient, Ae.lightProbe.value = z.state.probe, Ae.sunLights.value = z.state.sun, Ae.sunLightShadows.value = z.state.sunShadow, Ae.directionalLights.value = z.state.directional, Ae.directionalLightShadows.value = z.state.directionalShadow, Ae.spotLights.value = z.state.spot, Ae.spotLightShadows.value = z.state.spotShadow, Ae.rectAreaLights.value = z.state.rectArea, Ae.ltc_1.value = z.state.rectAreaLTC1, Ae.ltc_2.value = z.state.rectAreaLTC2, Ae.pointLights.value = z.state.point, Ae.pointLightShadows.value = z.state.pointShadow, Ae.hemisphereLights.value = z.state.hemi, Ae.sunShadowMatrix.value = z.state.sunShadowMatrix, Ae.sunShadowCascade.value = z.state.sunShadowCascade, Ae.directionalShadowMatrix.value = z.state.directionalShadowMatrix, Ae.spotLightMatrix.value = z.state.spotLightMatrix, Ae.spotLightMap.value = z.state.spotLightMap, Ae.pointShadowMatrix.value = z.state.pointShadowMatrix), O.numLightProbeGrids = dl(b.state.lightProbeGridArray), O.currentProgram = nt, O.uniformsList = null, nt
    }

    function xu(y, P, G, O, z) {
      const me = Ue.get(y),
        be = me.currentProgram.id + "," + O + "," + z;
      let de = me.programVariants.get(be);
      return de === void 0 ? (de = $i(y, P, G), me.programVariants.set(be, de)) : (me.currentProgram = de, me.uniformsList = null, me.outputColorSpace = O, me.toneMapping = z), de
    }

    function fl(y) {
      if (y.uniformsList === null) {
        const P = y.currentProgram.getUniforms();
        y.uniformsList = Sr.seqWithValue(P.seq, y.uniforms)
      }
      return y.uniformsList
    }

    function pl(y, P) {
      const G = Ue.get(y);
      G.outputColorSpace = P.outputColorSpace, G.batching = P.batching, G.batchingColor = P.batchingColor, G.instancing = P.instancing, G.instancingColor = P.instancingColor, G.instancingMorph = P.instancingMorph, G.skinning = P.skinning, G.morphTargets = P.morphTargets, G.morphNormals = P.morphNormals, G.morphColors = P.morphColors, G.morphTargetsCount = P.morphTargetsCount, G.numClippingPlanes = P.numClippingPlanes, G.numIntersection = P.numClipIntersection, G.vertexAlphas = P.vertexAlphas, G.vertexTangents = P.vertexTangents, G.toneMapping = P.toneMapping
    }

    function vu(y, P, G, O, z) {
      P.isScene !== !0 && (P = et), ke.resetTextureUnits();
      const me = P.fog,
        be = O.isMeshStandardMaterial || O.isMeshLambertMaterial || O.isMeshPhongMaterial ? P.environment : null,
        de = te === null ? R.outputColorSpace : te.isXRRenderTarget === !0 ? te.texture.colorSpace : Qe.workingColorSpace,
        Se = O.isMeshStandardMaterial || O.isMeshLambertMaterial && !O.envMap || O.isMeshPhongMaterial && !O.envMap,
        Re = w.get(O.envMap || be, Se),
        Ge = O.vertexColors === !0 && !!G.attributes.color && G.attributes.color.itemSize === 4,
        nt = !!G.attributes.tangent && (!!O.normalMap || O.anisotropy > 0),
        Ae = !!G.morphAttributes.position,
        it = !!G.morphAttributes.normal,
        Tt = !!G.morphAttributes.color;
      let pt = Un;
      O.toneMapped && (te === null || te.isXRRenderTarget === !0) && (pt = R.toneMapping);
      const ft = G.morphAttributes.position || G.morphAttributes.normal || G.morphAttributes.color,
        Ot = ft !== void 0 ? ft.length : 0,
        we = Ue.get(O),
        Ht = b.state.lights;
      if (ae === !0 && (ye === !0 || y !== Q)) {
        const _t = y === Q && O.id === W;
        J.setState(O, y, _t)
      }
      let at = !1,
        ti = !1;
      O.version === we.__version ? we.needsLights && we.lightsStateVersion !== Ht.state.version || z.isBatchedMesh && we.batching === !1 || !z.isBatchedMesh && we.batching === !0 || z.isBatchedMesh && we.batchingColor === !0 && z._colorsTexture === null || z.isBatchedMesh && we.batchingColor === !1 && z._colorsTexture !== null || z.isInstancedMesh && we.instancing === !1 || !z.isInstancedMesh && we.instancing === !0 || z.isSkinnedMesh && we.skinning === !1 || !z.isSkinnedMesh && we.skinning === !0 || z.isInstancedMesh && we.instancingColor === !0 && z.instanceColor === null || z.isInstancedMesh && we.instancingColor === !1 && z.instanceColor !== null || z.isInstancedMesh && we.instancingMorph === !0 && z.morphTexture === null || z.isInstancedMesh && we.instancingMorph === !1 && z.morphTexture !== null || we.envMap !== Re || O.fog === !0 && we.fog !== me || we.numClippingPlanes !== void 0 && (we.numClippingPlanes !== J.numPlanes || we.numIntersection !== J.numIntersection) || we.vertexAlphas !== Ge || we.vertexTangents !== nt || we.morphTargets !== Ae || we.morphNormals !== it || we.morphColors !== Tt || we.morphTargetsCount !== Ot || we.numLightProbeGrids !== dl(b.state.lightProbeGridArray) ? at = !0 : (we.outputColorSpace !== de || we.toneMapping !== pt) && (ti = !0) : (at = !0, we.__version = O.version);
      let Bt = we.currentProgram;
      (at === !0 || ti === !0) && (Bt = ti === !0 ? xu(O, P, z, de, pt) : $i(O, P, z), F && O.isNodeMaterial && F.onUpdateProgram(O, Bt, we));
      let Bs = !1,
        Bn = !1,
        ni = !1;
      const st = Bt.getUniforms(),
        Ut = we.uniforms;
      if (fe.useProgram(Bt.program) && (Bs = !0, Bn = !0, ni = !0), O.id !== W && (W = O.id, Bn = !0), Bs || Q !== y) {
        fe.buffers.depth.getReversed() && y.reversedDepth !== !0 && (y._reversedDepth = !0, y.updateProjectionMatrix()), st.setValue(U, "projectionMatrix", y.projectionMatrix), st.setValue(U, "viewMatrix", y.matrixWorldInverse);
        const Nt = st.map.cameraPosition;
        Nt !== void 0 && Nt.setValue(U, Ve.setFromMatrixPosition(y.matrixWorld)), dt.logarithmicDepthBuffer && st.setValue(U, "logDepthBufFC", 2 / (Math.log(y.far + 1) / Math.LN2)), (O.isMeshPhongMaterial || O.isMeshToonMaterial || O.isMeshLambertMaterial || O.isMeshBasicMaterial || O.isMeshStandardMaterial || O.isShaderMaterial) && st.setValue(U, "isOrthographic", y.isOrthographicCamera === !0), Q !== y && (Q = y, Bn = !0, ni = !0)
      }
      if (we.needsLights && (Ht.state.sunShadowMap.length > 0 && st.setValue(U, "sunShadowMap", Ht.state.sunShadowMap, ke), Ht.state.directionalShadowMap.length > 0 && st.setValue(U, "directionalShadowMap", Ht.state.directionalShadowMap, ke), Ht.state.spotShadowMap.length > 0 && st.setValue(U, "spotShadowMap", Ht.state.spotShadowMap, ke), Ht.state.pointShadowMap.length > 0 && st.setValue(U, "pointShadowMap", Ht.state.pointShadowMap, ke)), z.isSkinnedMesh) {
        st.setOptional(U, z, "bindMatrix"), st.setOptional(U, z, "bindMatrixInverse");
        const _t = z.skeleton;
        _t && (_t.boneTexture === null && _t.computeBoneTexture(), st.setValue(U, "boneTexture", _t.boneTexture, ke))
      }
      z.isBatchedMesh && (st.setOptional(U, z, "batchingTexture"), st.setValue(U, "batchingTexture", z._matricesTexture, ke), st.setOptional(U, z, "batchingIdTexture"), st.setValue(U, "batchingIdTexture", z._indirectTexture, ke), st.setOptional(U, z, "batchingColorTexture"), z._colorsTexture !== null && st.setValue(U, "batchingColorTexture", z._colorsTexture, ke));
      const tn = G.morphAttributes;
      if ((tn.position !== void 0 || tn.normal !== void 0 || tn.color !== void 0) && Z.update(z, G, Bt), (Bn || we.receiveShadow !== z.receiveShadow) && (we.receiveShadow = z.receiveShadow, st.setValue(U, "receiveShadow", z.receiveShadow)), (O.isMeshStandardMaterial || O.isMeshLambertMaterial || O.isMeshPhongMaterial) && O.envMap === null && P.environment !== null && (Ut.envMapIntensity.value = P.environmentIntensity), Ut.dfgLUT !== void 0 && (Ut.dfgLUT.value = Ex()), Bn) {
        if (st.setValue(U, "toneMappingExposure", R.toneMappingExposure), we.needsLights && Mu(Ut, ni), me && O.fog === !0 && oe.refreshFogUniforms(Ut, me), oe.refreshMaterialUniforms(Ut, O, xe, Ne, b.state.transmissionRenderTarget[y.id]), we.needsLights && we.numLightProbeGrids > 0) {
          const _t = v;
          let Nt = 0;
          for (const An of b.state.lightProbeGridArray) An.texture !== null && (_t.textures[Nt] = An.texture, _t.min[Nt] = An.boundingBox.min, _t.max[Nt] = An.boundingBox.max, _t.resolution[Nt] = An.resolution, Nt++);
          for (const An in _t) _t[An].length = Nt;
          Ut.probesSH.value = _t.textures, Ut.probesMin.value = _t.min, Ut.probesMax.value = _t.max, Ut.probesResolution.value = _t.resolution
        }
        Sr.upload(U, fl(we), Ut, ke)
      }
      if (O.isShaderMaterial && O.uniformsNeedUpdate === !0 && (Sr.upload(U, fl(we), Ut, ke), O.uniformsNeedUpdate = !1), O.isSpriteMaterial && st.setValue(U, "center", z.center), st.setValue(U, "modelViewMatrix", z.modelViewMatrix), st.setValue(U, "normalMatrix", z.normalMatrix), st.setValue(U, "modelMatrix", z.matrixWorld), O.uniformsGroups !== void 0) {
        const _t = O.uniformsGroups;
        for (let Nt = 0, An = _t.length; Nt < An; Nt++) {
          const gl = _t[Nt];
          Pe.update(gl, Bt), Pe.bind(gl, Bt)
        }
      }
      return Bt
    }

    function Mu(y, P) {
      y.ambientLightColor.needsUpdate = P, y.lightProbe.needsUpdate = P, y.sunLights.needsUpdate = P, y.sunLightShadows.needsUpdate = P, y.directionalLights.needsUpdate = P, y.directionalLightShadows.needsUpdate = P, y.pointLights.needsUpdate = P, y.pointLightShadows.needsUpdate = P, y.spotLights.needsUpdate = P, y.spotLightShadows.needsUpdate = P, y.rectAreaLights.needsUpdate = P, y.hemisphereLights.needsUpdate = P
    }

    function Su(y) {
      return y.isMeshLambertMaterial || y.isMeshToonMaterial || y.isMeshPhongMaterial || y.isMeshStandardMaterial || y.isShadowMaterial || y.isShaderMaterial && y.lights === !0
    }
    this.getActiveCubeFace = function() {
      return X
    }, this.getActiveMipmapLevel = function() {
      return H
    }, this.getRenderTarget = function() {
      return te
    }, this.setRenderTargetTextures = function(y, P, G) {
      const O = Ue.get(y);
      O.__autoAllocateDepthBuffer = y.resolveDepthBuffer === !1, O.__autoAllocateDepthBuffer === !1 && (O.__useRenderToTexture = !1), Ue.get(y.texture).__webglTexture = P, Ue.get(y.depthTexture).__webglTexture = O.__autoAllocateDepthBuffer ? void 0 : G, O.__hasExternalTextures = !0
    }, this.setRenderTargetFramebuffer = function(y, P) {
      const G = Ue.get(y);
      G.__webglFramebuffer = P, G.__useDefaultFramebuffer = P === void 0
    }, this.setRenderTarget = function(y, P = 0, G = 0) {
      te = y, X = P, H = G;
      let O = null,
        z = !1,
        me = !1;
      if (y) {
        const de = Ue.get(y);
        if (de.__useDefaultFramebuffer !== void 0) {
          fe.bindFramebuffer(U.FRAMEBUFFER, de.__webglFramebuffer), ee.copy(y.viewport), Te.copy(y.scissor), Oe = y.scissorTest, fe.viewport(ee), fe.scissor(Te), fe.setScissorTest(Oe), W = -1;
          return
        } else if (de.__webglFramebuffer === void 0) ke.setupRenderTarget(y);
        else if (de.__hasExternalTextures) ke.rebindTextures(y, Ue.get(y.texture).__webglTexture, Ue.get(y.depthTexture).__webglTexture);
        else if (y.depthBuffer) {
          const Ge = y.depthTexture;
          if (de.__boundDepthTexture !== Ge) {
            if (Ge !== null && Ue.has(Ge) && (y.width !== Ge.image.width || y.height !== Ge.image.height)) throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");
            ke.setupDepthRenderbuffer(y)
          }
        }
        const Se = y.texture;
        (Se.isData3DTexture || Se.isDataArrayTexture || Se.isCompressedArrayTexture) && (me = !0);
        const Re = Ue.get(y).__webglFramebuffer;
        y.isWebGLCubeRenderTarget ? (Array.isArray(Re[P]) ? O = Re[P][G] : O = Re[P], z = !0) : y.samples > 0 && ke.useMultisampledRTT(y) === !1 ? O = Ue.get(y).__webglMultisampledFramebuffer : Array.isArray(Re) ? O = Re[G] : O = Re, ee.copy(y.viewport), Te.copy(y.scissor), Oe = y.scissorTest
      } else ee.copy(Be).multiplyScalar(xe).floor(), Te.copy(Je).multiplyScalar(xe).floor(), Oe = je;
      if (G !== 0 && (O = V), fe.bindFramebuffer(U.FRAMEBUFFER, O) && fe.drawBuffers(y, O), fe.viewport(ee), fe.scissor(Te), fe.setScissorTest(Oe), z) {
        const de = Ue.get(y.texture);
        U.framebufferTexture2D(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_CUBE_MAP_POSITIVE_X + P, de.__webglTexture, G)
      } else if (me) {
        const de = P;
        for (let Se = 0; Se < y.textures.length; Se++) {
          const Re = Ue.get(y.textures[Se]);
          U.framebufferTextureLayer(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0 + Se, Re.__webglTexture, G, de)
        }
      } else if (y !== null && G !== 0) {
        const de = Ue.get(y.texture);
        U.framebufferTexture2D(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_2D, de.__webglTexture, G)
      }
      W = -1
    };

    function ml(y) {
      const P = Ue.get(y);
      return (P.__readFormat !== y.format || P.__readType !== y.type) && (P.__readFormat = y.format, P.__readType = y.type, P.__formatReadable = dt.textureFormatReadable(y.format), P.__typeReadable = dt.textureTypeReadable(y.type)), P
    }
    this.readRenderTargetPixels = function(y, P, G, O, z, me, be, de = 0) {
      if (!(y && y.isWebGLRenderTarget)) {
        ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return
      }
      let Se = Ue.get(y).__webglFramebuffer;
      if (y.isWebGLCubeRenderTarget && be !== void 0 && (Se = Se[be], Array.isArray(Se) && (Se = Se[0])), Se) {
        fe.bindFramebuffer(U.FRAMEBUFFER, Se);
        try {
          const Re = y.textures[de],
            Ge = Re.format,
            nt = Re.type;
          y.textures.length > 1 && U.readBuffer(U.COLOR_ATTACHMENT0 + de);
          const Ae = ml(Re);
          if (Ae.__formatReadable === !1) {
            ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return
          }
          if (Ae.__typeReadable === !1) {
            ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return
          }
          P >= 0 && P <= y.width - O && G >= 0 && G <= y.height - z && U.readPixels(P, G, O, z, se.convert(Ge), se.convert(nt), me)
        } finally {
          const Re = te !== null ? Ue.get(te).__webglFramebuffer : null;
          fe.bindFramebuffer(U.FRAMEBUFFER, Re)
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(y, P, G, O, z, me, be, de = 0) {
      if (!(y && y.isWebGLRenderTarget)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let Se = Ue.get(y).__webglFramebuffer;
      if (y.isWebGLCubeRenderTarget && be !== void 0 && (Se = Se[be], Array.isArray(Se) && (Se = Se[0])), Se)
        if (P >= 0 && P <= y.width - O && G >= 0 && G <= y.height - z) {
          fe.bindFramebuffer(U.FRAMEBUFFER, Se);
          const Re = y.textures[de],
            Ge = Re.format,
            nt = Re.type;
          y.textures.length > 1 && U.readBuffer(U.COLOR_ATTACHMENT0 + de);
          const Ae = ml(Re);
          if (Ae.__formatReadable === !1) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (Ae.__typeReadable === !1) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          const it = U.createBuffer();
          U.bindBuffer(U.PIXEL_PACK_BUFFER, it), U.bufferData(U.PIXEL_PACK_BUFFER, me.byteLength, U.STREAM_READ), U.readPixels(P, G, O, z, se.convert(Ge), se.convert(nt), 0), U.bindBuffer(U.PIXEL_PACK_BUFFER, null);
          const Tt = te !== null ? Ue.get(te).__webglFramebuffer : null;
          fe.bindFramebuffer(U.FRAMEBUFFER, Tt);
          const pt = U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return U.flush(), await dd(U, pt, 4), U.bindBuffer(U.PIXEL_PACK_BUFFER, it), U.getBufferSubData(U.PIXEL_PACK_BUFFER, 0, me), U.bindBuffer(U.PIXEL_PACK_BUFFER, null), U.deleteBuffer(it), U.deleteSync(pt), me
        } else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")
    }, this.copyFramebufferToTexture = function(y, P = null, G = 0) {
      const O = Math.pow(2, -G),
        z = Math.floor(y.image.width * O),
        me = Math.floor(y.image.height * O),
        be = P !== null ? P.x : 0,
        de = P !== null ? P.y : 0;
      ke.setTexture2D(y, 0), U.copyTexSubImage2D(U.TEXTURE_2D, G, 0, 0, be, de, z, me), fe.unbindTexture()
    }, this.copyTextureToTexture = function(y, P, G = null, O = null, z = 0, me = 0) {
      let be, de, Se, Re, Ge, nt, Ae, it, Tt;
      const pt = y.isCompressedTexture ? y.mipmaps[me] : y.image;
      if (G !== null) be = G.max.x - G.min.x, de = G.max.y - G.min.y, Se = G.isBox3 ? G.max.z - G.min.z : 1, Re = G.min.x, Ge = G.min.y, nt = G.isBox3 ? G.min.z : 0;
      else {
        const st = Math.pow(2, -z);
        be = Math.floor(pt.width * st), de = Math.floor(pt.height * st), y.isDataArrayTexture ? Se = pt.depth : y.isData3DTexture ? Se = Math.floor(pt.depth * st) : Se = 1, Re = 0, Ge = 0, nt = 0
      }
      O !== null ? (Ae = O.x, it = O.y, Tt = O.z) : (Ae = 0, it = 0, Tt = 0);
      const ft = se.convert(P.format),
        Ot = se.convert(P.type);
      let we;
      P.isData3DTexture ? (ke.setTexture3D(P, 0), we = U.TEXTURE_3D) : P.isDataArrayTexture || P.isCompressedArrayTexture ? (ke.setTexture2DArray(P, 0), we = U.TEXTURE_2D_ARRAY) : (ke.setTexture2D(P, 0), we = U.TEXTURE_2D), fe.activeTexture(U.TEXTURE0), fe.pixelStorei(U.UNPACK_FLIP_Y_WEBGL, P.flipY), fe.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL, P.premultiplyAlpha), fe.pixelStorei(U.UNPACK_ALIGNMENT, P.unpackAlignment);
      const Ht = fe.getParameter(U.UNPACK_ROW_LENGTH),
        at = fe.getParameter(U.UNPACK_IMAGE_HEIGHT),
        ti = fe.getParameter(U.UNPACK_SKIP_PIXELS),
        Bt = fe.getParameter(U.UNPACK_SKIP_ROWS),
        Bs = fe.getParameter(U.UNPACK_SKIP_IMAGES);
      fe.pixelStorei(U.UNPACK_ROW_LENGTH, pt.width), fe.pixelStorei(U.UNPACK_IMAGE_HEIGHT, pt.height), fe.pixelStorei(U.UNPACK_SKIP_PIXELS, Re), fe.pixelStorei(U.UNPACK_SKIP_ROWS, Ge), fe.pixelStorei(U.UNPACK_SKIP_IMAGES, nt);
      const Bn = y.isDataArrayTexture || y.isData3DTexture,
        ni = P.isDataArrayTexture || P.isData3DTexture;
      if (y.isDepthTexture) {
        const st = Ue.get(y),
          Ut = Ue.get(P),
          tn = Ue.get(st.__renderTarget),
          _t = Ue.get(Ut.__renderTarget);
        fe.bindFramebuffer(U.READ_FRAMEBUFFER, tn.__webglFramebuffer), fe.bindFramebuffer(U.DRAW_FRAMEBUFFER, _t.__webglFramebuffer);
        for (let Nt = 0; Nt < Se; Nt++) Bn && (U.framebufferTextureLayer(U.READ_FRAMEBUFFER, U.COLOR_ATTACHMENT0, Ue.get(y).__webglTexture, z, nt + Nt), U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0, Ue.get(P).__webglTexture, me, Tt + Nt)), U.blitFramebuffer(Re, Ge, Re + be, Ge + de, Ae, it, Ae + be, it + de, U.DEPTH_BUFFER_BIT, U.NEAREST);
        fe.bindFramebuffer(U.READ_FRAMEBUFFER, null), fe.bindFramebuffer(U.DRAW_FRAMEBUFFER, null)
      } else if (z !== 0 || y.isRenderTargetTexture || Ue.has(y)) {
        const st = Ue.get(y),
          Ut = Ue.get(P);
        fe.bindFramebuffer(U.READ_FRAMEBUFFER, L), fe.bindFramebuffer(U.DRAW_FRAMEBUFFER, k);
        for (let tn = 0; tn < Se; tn++) Bn ? U.framebufferTextureLayer(U.READ_FRAMEBUFFER, U.COLOR_ATTACHMENT0, st.__webglTexture, z, nt + tn) : U.framebufferTexture2D(U.READ_FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_2D, st.__webglTexture, z), ni ? U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0, Ut.__webglTexture, me, Tt + tn) : U.framebufferTexture2D(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_2D, Ut.__webglTexture, me), z !== 0 ? U.blitFramebuffer(Re, Ge, Re + be, Ge + de, Ae, it, Ae + be, it + de, U.COLOR_BUFFER_BIT, U.NEAREST) : ni ? U.copyTexSubImage3D(we, me, Ae, it, Tt + tn, Re, Ge, be, de) : U.copyTexSubImage2D(we, me, Ae, it, Re, Ge, be, de);
        fe.bindFramebuffer(U.READ_FRAMEBUFFER, null), fe.bindFramebuffer(U.DRAW_FRAMEBUFFER, null)
      } else ni ? y.isDataTexture || y.isData3DTexture ? U.texSubImage3D(we, me, Ae, it, Tt, be, de, Se, ft, Ot, pt.data) : P.isCompressedArrayTexture ? U.compressedTexSubImage3D(we, me, Ae, it, Tt, be, de, Se, ft, pt.data) : U.texSubImage3D(we, me, Ae, it, Tt, be, de, Se, ft, Ot, pt) : y.isDataTexture ? U.texSubImage2D(U.TEXTURE_2D, me, Ae, it, be, de, ft, Ot, pt.data) : y.isCompressedTexture ? U.compressedTexSubImage2D(U.TEXTURE_2D, me, Ae, it, pt.width, pt.height, ft, pt.data) : U.texSubImage2D(U.TEXTURE_2D, me, Ae, it, be, de, ft, Ot, pt);
      fe.pixelStorei(U.UNPACK_ROW_LENGTH, Ht), fe.pixelStorei(U.UNPACK_IMAGE_HEIGHT, at), fe.pixelStorei(U.UNPACK_SKIP_PIXELS, ti), fe.pixelStorei(U.UNPACK_SKIP_ROWS, Bt), fe.pixelStorei(U.UNPACK_SKIP_IMAGES, Bs), me === 0 && P.generateMipmaps === !0 && P.mipmapsAutoUpdate === !0 && U.generateMipmap(we), fe.unbindTexture()
    }, this.initRenderTarget = function(y) {
      Ue.get(y).__webglFramebuffer === void 0 && ke.setupRenderTarget(y)
    }, this.initTexture = function(y) {
      y.isCubeTexture ? ke.setTextureCube(y, 0) : y.isData3DTexture ? ke.setTexture3D(y, 0) : y.isDataArrayTexture || y.isCompressedArrayTexture ? ke.setTexture2DArray(y, 0) : ke.setTexture2D(y, 0), fe.unbindTexture()
    }, this.resetState = function() {
      X = 0, H = 0, te = null, fe.reset(), le.reset()
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
      detail: this
    }))
  }
  get coordinateSystem() {
    return cn
  }
  get outputColorSpace() {
    return this._outputColorSpace
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    t.drawingBufferColorSpace = Qe._getDrawingBufferColorSpace(e), t.unpackColorSpace = Qe._getUnpackColorSpace()
  }
}
const Ta = new WeakMap,
  bx = dracoDecoderWasmUrl,
  Ax = dracoWasmWrapperJsUrl,
  wx = dracoDecoderJsUrl;
class Rx extends pi {
  constructor(e) {
    super(e), this.decoderPaths = {
      js: Ax,
      wasm: bx,
      dep_js: wx
    }, this.decoderConfig = {}, this.decoderBinary = null, this.decoderPending = null, this.workerLimit = 4, this.workerPool = [], this.workerNextTaskID = 1, this.workerSourceURL = "", this.defaultAttributeIDs = {
      position: "POSITION",
      normal: "NORMAL",
      color: "COLOR",
      uv: "TEX_COORD"
    }, this.defaultAttributeTypes = {
      position: "Float32Array",
      normal: "Float32Array",
      color: "Float32Array",
      uv: "Float32Array"
    }
  }
  setDecoderPath(e) {
    const {
      decoderPaths: t
    } = this;
    return typeof e == "object" ? (t.js = e.js, t.wasm = e.wasm, t.dep_js = null) : (t.js = Zn.resolveURL("draco_wasm_wrapper.js", e), t.wasm = Zn.resolveURL("draco_decoder.wasm", e), t.dep_js = Zn.resolveURL("draco_decoder.js", e)), this
  }
  setDecoderConfig(e) {
    return console.warn("THREE.DRACOLoader: setDecoderConfig to has been deprecated and will be removed in r194."), this.decoderConfig = e, this
  }
  setWorkerLimit(e) {
    return this.workerLimit = e, this
  }
  load(e, t, n, i) {
    const r = new Ir(this.manager);
    r.setPriority(this.priority), r.setCache(this.cache), r.setPath(this.path), r.setResponseType("arraybuffer"), r.setRequestHeader(this.requestHeader), r.setWithCredentials(this.withCredentials), r.load(e, a => {
      this.parse(a, t, i)
    }, n, i)
  }
  parse(e, t, n = () => {}) {
    this.decodeDracoFile(e, t, null, null, bt, n).catch(n)
  }
  decodeDracoFile(e, t, n, i, r = Xt, a = () => {}) {
    const o = {
      attributeIDs: n || this.defaultAttributeIDs,
      attributeTypes: i || this.defaultAttributeTypes,
      useUniqueIDs: !!n,
      vertexColorSpace: r
    };
    return this.decodeGeometry(e, o).then(t).catch(a)
  }
  decodeGeometry(e, t) {
    const n = JSON.stringify(t);
    if (Ta.has(e)) {
      const l = Ta.get(e);
      if (l.key === n) return l.promise;
      if (e.byteLength === 0) throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")
    }
    let i;
    const r = this.workerNextTaskID++,
      a = e.byteLength,
      o = this._getWorker(r, a).then(l => (i = l, new Promise((c, h) => {
        i._callbacks[r] = {
          resolve: c,
          reject: h
        }, i.postMessage({
          type: "decode",
          id: r,
          taskConfig: t,
          buffer: e
        }, [e])
      }))).then(l => this._createGeometry(l.geometry));
    return o.catch(() => !0).then(() => {
      i && r && this._releaseTask(i, r)
    }), Ta.set(e, {
      key: n,
      promise: o
    }), o
  }
  _createGeometry(e) {
    const t = new wt;
    e.index && t.setIndex(new Ft(e.index.array, 1));
    for (let n = 0; n < e.attributes.length; n++) {
      const {
        name: i,
        array: r,
        itemSize: a,
        stride: o,
        vertexColorSpace: l
      } = e.attributes[n];
      let c;
      if (a === o) c = new Ft(r, a);
      else {
        const h = new bh(r, o);
        c = new Or(h, a, 0)
      }
      i === "color" && (this._assignVertexColorSpace(c, l), c.normalized = !(r instanceof Float32Array)), t.setAttribute(i, c)
    }
    return t
  }
  _assignVertexColorSpace(e, t) {
    if (t !== bt) return;
    const n = new Fe;
    for (let i = 0, r = e.count; i < r; i++) n.fromBufferAttribute(e, i), Qe.colorSpaceToWorking(n, bt), e.setXYZ(i, n.r, n.g, n.b)
  }
  _loadLibrary(e, t) {
    const n = new Ir(this.manager);
    return n.setPriority(this.priority), n.setCache(this.cache), n.setResponseType(t), n.setWithCredentials(this.withCredentials), new Promise((i, r) => {
      n.load(e, i, void 0, r)
    })
  }
  preload() {
    return this._initDecoder(), this
  }
  _initDecoder() {
    if (this.decoderPending) return this.decoderPending;
    const e = typeof WebAssembly != "object" || this.decoderConfig.type === "js",
      t = [],
      {
        decoderPaths: n
      } = this;
    if (e) {
      if (n.dep_js === null) throw new Error("THREE.DRACOLoader: WebAssembly is required when using a custom decoder paths.");
      t.push(this._loadLibrary(n.dep_js, "text"))
    } else t.push(this._loadLibrary(n.js, "text")), t.push(this._loadLibrary(n.wasm, "arraybuffer"));
    return this.decoderPending = Promise.all(t).then(i => {
      const r = i[0];
      e || (this.decoderConfig.wasmBinary = i[1]);
      const a = Cx.toString(),
        o = ["/* draco decoder */", r, "", "/* worker */", a.substring(a.indexOf("{") + 1, a.lastIndexOf("}"))].join(`
`);
      this.workerSourceURL = URL.createObjectURL(new Blob([o]))
    }), this.decoderPending
  }
  _getWorker(e, t) {
    return this._initDecoder().then(() => {
      if (this.workerPool.length < this.workerLimit) {
        const i = new Worker(this.workerSourceURL);
        i._callbacks = {}, i._taskCosts = {}, i._taskLoad = 0, i.postMessage({
          type: "init",
          decoderConfig: this.decoderConfig
        }), i.onmessage = function(r) {
          const a = r.data;
          switch (a.type) {
            case "decode":
              i._callbacks[a.id].resolve(a);
              break;
            case "error":
              i._callbacks[a.id].reject(a);
              break;
            default:
              console.error('THREE.DRACOLoader: Unexpected message, "' + a.type + '"')
          }
        }, this.workerPool.push(i)
      } else this.workerPool.sort(function(i, r) {
        return i._taskLoad > r._taskLoad ? -1 : 1
      });
      const n = this.workerPool[this.workerPool.length - 1];
      return n._taskCosts[e] = t, n._taskLoad += t, n
    })
  }
  _releaseTask(e, t) {
    e._taskLoad -= e._taskCosts[t], delete e._callbacks[t], delete e._taskCosts[t]
  }
  debug() {
    console.log("Task load: ", this.workerPool.map(e => e._taskLoad))
  }
  dispose() {
    for (let e = 0; e < this.workerPool.length; ++e) this.workerPool[e].terminate();
    return this.workerPool.length = 0, this.workerSourceURL !== "" && URL.revokeObjectURL(this.workerSourceURL), this
  }
}

function Cx() {
  let s, e;
  onmessage = function(a) {
    const o = a.data;
    switch (o.type) {
      case "init":
        s = o.decoderConfig, e = new Promise(function(h) {
          s.onModuleLoaded = function(u) {
            h({
              draco: u
            })
          }, DracoDecoderModule(s)
        });
        break;
      case "decode":
        const l = o.buffer,
          c = o.taskConfig;
        e.then(h => {
          const u = h.draco,
            d = new u.Decoder;
          try {
            const f = t(u, d, new Int8Array(l), c),
              p = f.attributes.map(x => x.array.buffer);
            f.index && p.push(f.index.array.buffer), self.postMessage({
              type: "decode",
              id: o.id,
              geometry: f
            }, p)
          } catch (f) {
            console.error(f), self.postMessage({
              type: "error",
              id: o.id,
              error: f.message
            })
          } finally {
            u.destroy(d)
          }
        });
        break
    }
  };

  function t(a, o, l, c) {
    const h = c.attributeIDs,
      u = c.attributeTypes;
    let d, f;
    const p = o.GetEncodedGeometryType(l);
    if (p === a.TRIANGULAR_MESH) d = new a.Mesh, f = o.DecodeArrayToMesh(l, l.byteLength, d);
    else if (p === a.POINT_CLOUD) d = new a.PointCloud, f = o.DecodeArrayToPointCloud(l, l.byteLength, d);
    else throw new Error("THREE.DRACOLoader: Unexpected geometry type.");
    if (!f.ok() || d.ptr === 0) throw new Error("THREE.DRACOLoader: Decoding failed: " + f.error_msg());
    const x = {
      index: null,
      attributes: []
    };
    for (const m in h) {
      const g = self[u[m]];
      let M, E;
      if (c.useUniqueIDs) E = h[m], M = o.GetAttributeByUniqueId(d, E);
      else {
        if (E = o.GetAttributeId(d, a[h[m]]), E === -1) continue;
        M = o.GetAttribute(d, E)
      }
      const v = i(a, o, d, m, g, M);
      m === "color" && (v.vertexColorSpace = c.vertexColorSpace), x.attributes.push(v)
    }
    return p === a.TRIANGULAR_MESH && (x.index = n(a, o, d)), a.destroy(d), x
  }

  function n(a, o, l) {
    const h = l.num_faces() * 3,
      u = h * 4,
      d = a._malloc(u);
    o.GetTrianglesUInt32Array(l, u, d);
    const f = new Uint32Array(a.HEAPF32.buffer, d, h).slice();
    return a._free(d), {
      array: f,
      itemSize: 1
    }
  }

  function i(a, o, l, c, h, u) {
    const d = l.num_points(),
      f = u.num_components(),
      p = r(a, h),
      x = f * h.BYTES_PER_ELEMENT,
      m = Math.ceil(x / 4) * 4,
      g = m / h.BYTES_PER_ELEMENT,
      M = d * x,
      E = d * m,
      v = a._malloc(M);
    o.GetAttributeDataArrayForAllPoints(l, u, p, M, v);
    const A = new h(a.HEAPF32.buffer, v, M / h.BYTES_PER_ELEMENT);
    let b;
    if (x === m) b = A.slice();
    else {
      b = new h(E / h.BYTES_PER_ELEMENT);
      let _ = 0;
      for (let T = 0; T < d; T++) {
        for (let I = 0; I < f; I++) b[_ + I] = A[T * f + I];
        _ += g
      }
    }
    return a._free(v), {
      name: c,
      count: d,
      itemSize: f,
      array: b,
      stride: g
    }
  }

  function r(a, o) {
    switch (o) {
      case Float32Array:
        return a.DT_FLOAT32;
      case Int8Array:
        return a.DT_INT8;
      case Int16Array:
        return a.DT_INT16;
      case Int32Array:
        return a.DT_INT32;
      case Uint8Array:
        return a.DT_UINT8;
      case Uint16Array:
        return a.DT_UINT16;
      case Uint32Array:
        return a.DT_UINT32
    }
  }
}

function Gv(s, e = !1) {
  const t = s[0].index !== null,
    n = new Set(Object.keys(s[0].attributes)),
    i = new Set(Object.keys(s[0].morphAttributes)),
    r = {},
    a = {},
    o = s[0].morphTargetsRelative,
    l = new wt;
  l.morphTargetsRelative = o;
  let c = 0;
  for (let h = 0; h < s.length; ++h) {
    const u = s[h];
    let d = 0,
      f = 0;
    if (t !== (u.index !== null)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const p in u.attributes) {
      if (!n.has(p)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + '. All geometries must have compatible attributes; make sure "' + p + '" attribute exists among all geometries, or in none of them.'), null;
      r[p] === void 0 && (r[p] = []), r[p].push(u.attributes[p]), d++
    }
    if (d !== n.size) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". Make sure all geometries have the same number of attributes."), null;
    if (o !== u.morphTargetsRelative) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const p in u.morphAttributes) {
      if (!i.has(p)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ".  .morphAttributes must be consistent throughout all geometries."), null;
      if (u.morphAttributes[p].length !== s[0].morphAttributes[p].length) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + '. All geometries must have the same number of morph targets for the "' + p + '" morph attribute.'), null;
      a[p] === void 0 && (a[p] = []), a[p].push(u.morphAttributes[p]), f++
    }
    if (f !== i.size) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". Make sure all geometries have the same number of morph attributes."), null;
    if (e) {
      let p;
      if (t) p = u.index.count;
      else if (u.attributes.position !== void 0) p = u.attributes.position.count;
      else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". The geometry must have either an index or a position attribute"), null;
      l.addGroup(c, p, h), c += p
    }
  }
  if (t) {
    let h = 0;
    const u = [];
    for (let d = 0; d < s.length; ++d) {
      const f = s[d].index;
      for (let p = 0; p < f.count; ++p) u.push(f.getX(p) + h);
      h += s[d].attributes.position.count
    }
    l.setIndex(u)
  }
  for (const h in r) {
    const u = Gc(r[h]);
    if (!u) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + h + " attribute."), null;
    l.setAttribute(h, u)
  }
  for (const h in a) {
    const u = a[h][0].length;
    if (u !== 0) {
      l.morphAttributes = l.morphAttributes || {}, l.morphAttributes[h] = [];
      for (let d = 0; d < u; ++d) {
        const f = [];
        for (let x = 0; x < a[h].length; ++x) f.push(a[h][x][d]);
        const p = Gc(f);
        if (!p) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + h + " morphAttribute."), null;
        l.morphAttributes[h].push(p)
      }
    }
  }
  return l
}

function Gc(s) {
  let e, t, n, i = -1,
    r = 0;
  for (let c = 0; c < s.length; ++c) {
    const h = s[c];
    if (e === void 0 && (e = h.array.constructor), e !== h.array.constructor) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
    if (t === void 0 && (t = h.itemSize), t !== h.itemSize) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
    if (n === void 0 && (n = h.normalized), n !== h.normalized) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
    if (i === -1 && (i = h.gpuType), i !== h.gpuType) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
    r += h.count * t
  }
  const a = new e(r),
    o = new Ft(a, t, n);
  let l = 0;
  for (let c = 0; c < s.length; ++c) {
    const h = s[c];
    if (h.isInterleavedBufferAttribute) {
      const u = l / t;
      for (let d = 0, f = h.count; d < f; d++)
        for (let p = 0; p < t; p++) {
          const x = h.getComponent(d, p);
          o.setComponent(d + u, p, x)
        }
    } else a.set(h.array, l);
    l += h.count * t
  }
  return i !== void 0 && (o.gpuType = i), o
}

function Vc(s, e) {
  if (e === ed) return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), s;
  if (e === po || e === fh) {
    let t = s.getIndex();
    if (t === null) {
      const r = [],
        a = s.getAttribute("position");
      if (a !== void 0) {
        for (let o = 0; o < a.count; o++) r.push(o);
        s.setIndex(r), t = s.getIndex()
      } else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), s
    }
    const n = t.count - 2,
      i = [];
    if (e === po)
      for (let r = 1; r <= n; r++) i.push(t.getX(0)), i.push(t.getX(r)), i.push(t.getX(r + 1));
    else
      for (let r = 0; r < n; r++) r % 2 === 0 ? (i.push(t.getX(r)), i.push(t.getX(r + 1)), i.push(t.getX(r + 2))) : (i.push(t.getX(r + 2)), i.push(t.getX(r + 1)), i.push(t.getX(r)));
    return i.length / 3 !== n && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."), s.setIndex(i), s.clearGroups(), s
  } else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", e), s
}

function uu(s) {
  const e = new Map,
    t = new Map,
    n = s.clone();
  return du(s, n, function(i, r) {
    e.set(r, i), t.set(i, r)
  }), n.traverse(function(i) {
    if (!i.isSkinnedMesh) return;
    const r = i,
      a = e.get(i),
      o = a.skeleton.bones;
    r.skeleton = a.skeleton.clone(), r.bindMatrix.copy(a.bindMatrix), r.skeleton.bones = o.map(function(l) {
      return t.get(l)
    }), r.bind(r.skeleton, r.bindMatrix)
  }), n
}

function du(s, e, t) {
  t(s, e);
  for (let n = 0; n < s.children.length; n++) du(s.children[n], e.children[n], t)
}
class Lx extends pi {
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
      return new Ux(t)
    }), this.register(function(t) {
      return new Fx(t)
    }), this.register(function(t) {
      return new Ox(t)
    }), this.register(function(t) {
      return new qx(t)
    }), this.register(function(t) {
      return new Yx(t)
    }), this.register(function(t) {
      return new Kx(t)
    }), this.register(function(t) {
      return new zx(t)
    }), this.register(function(t) {
      return new kx(t)
    }), this.register(function(t) {
      return new Hx(t)
    }), this.register(function(t) {
      return new Gx(t)
    }), this.register(function(t) {
      return new Dx(t)
    }), this.register(function(t) {
      return new Vx(t)
    }), this.register(function(t) {
      return new Bx(t)
    }), this.register(function(t) {
      return new Xx(t)
    }), this.register(function(t) {
      return new Wx(t)
    }), this.register(function(t) {
      return new Ix(t)
    }), this.register(function(t) {
      return new Wc(t, Ze.EXT_MESHOPT_COMPRESSION)
    }), this.register(function(t) {
      return new Wc(t, Ze.KHR_MESHOPT_COMPRESSION)
    }), this.register(function(t) {
      return new Jx(t)
    })
  }
  load(e, t, n, i) {
    const r = this;
    let a;
    if (this.resourcePath !== "") a = this.resourcePath;
    else if (this.path !== "") {
      const c = Zn.extractUrlBase(e);
      a = Zn.resolveURL(c, this.path)
    } else a = Zn.extractUrlBase(e);
    this.manager.itemStart(e);
    const o = function(c) {
        i ? i(c) : console.error(c), r.manager.itemError(e), r.manager.itemEnd(e)
      },
      l = new Ir(this.manager);
    l.setPriority(this.priority), l.setCache(this.cache), l.setPath(this.path), l.setResponseType("arraybuffer"), l.setRequestHeader(this.requestHeader), l.setWithCredentials(this.withCredentials), l.load(e, function(c) {
      try {
        r.parse(c, a, function(h) {
          t(h), r.manager.itemEnd(e)
        }, o)
      } catch (h) {
        o(h)
      }
    }, n, o)
  }
  setDRACOLoader(e) {
    return this.dracoLoader = e, this
  }
  setKTX2Loader(e) {
    return this.ktx2Loader = e, this
  }
  setMeshoptDecoder(e) {
    return this.meshoptDecoder = e, this
  }
  register(e) {
    return this.pluginCallbacks.indexOf(e) === -1 && this.pluginCallbacks.push(e), this
  }
  unregister(e) {
    return this.pluginCallbacks.indexOf(e) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e), 1), this
  }
  parse(e, t, n, i) {
    let r;
    const a = {},
      o = {},
      l = new TextDecoder;
    if (typeof e == "string") r = JSON.parse(e);
    else if (e instanceof ArrayBuffer)
      if (l.decode(new Uint8Array(e, 0, 4)) === fu) {
        try {
          a[Ze.KHR_BINARY_GLTF] = new Zx(e)
        } catch (u) {
          i && i(u);
          return
        }
        r = JSON.parse(a[Ze.KHR_BINARY_GLTF].content)
      } else r = JSON.parse(l.decode(e));
    else r = e;
    if (r.asset === void 0 || r.asset.version[0] < 2) {
      i && i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return
    }
    const c = new cv(r, {
      path: t || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      priority: this.priority,
      cache: this.cache,
      withCredentials: this.withCredentials,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    c.fileLoader.setRequestHeader(this.requestHeader);
    for (let h = 0; h < this.pluginCallbacks.length; h++) {
      const u = this.pluginCallbacks[h](c);
      u.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), o[u.name] = u, a[u.name] = !0
    }
    if (r.extensionsUsed)
      for (let h = 0; h < r.extensionsUsed.length; ++h) {
        const u = r.extensionsUsed[h],
          d = r.extensionsRequired || [];
        switch (u) {
          case Ze.KHR_MATERIALS_UNLIT:
            a[u] = new Nx;
            break;
          case Ze.KHR_DRACO_MESH_COMPRESSION:
            a[u] = new $x(r, this.dracoLoader);
            break;
          case Ze.KHR_TEXTURE_TRANSFORM:
            a[u] = new Qx;
            break;
          case Ze.KHR_MESH_QUANTIZATION:
            a[u] = new jx;
            break;
          default:
            d.indexOf(u) >= 0 && o[u] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + u + '".')
        }
      }
    c.setExtensions(a), c.setPlugins(o), c.parse(n, i)
  }
  parseAsync(e, t) {
    const n = this;
    return new Promise(function(i, r) {
      n.parse(e, t, i, r)
    })
  }
}

function Px() {
  let s = {};
  return {
    get: function(e) {
      return s[e]
    },
    add: function(e, t) {
      s[e] = t
    },
    remove: function(e) {
      delete s[e]
    },
    removeAll: function() {
      s = {}
    }
  }
}

function Mt(s, e, t) {
  const n = s.json.materials[e];
  return n.extensions && n.extensions[t] ? n.extensions[t] : null
}
const Ze = {
  KHR_BINARY_GLTF: "KHR_binary_glTF",
  KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
  KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
  KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
  KHR_MATERIALS_DIFFUSE_ROUGHNESS: "KHR_materials_diffuse_roughness",
  KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
  KHR_MATERIALS_IOR: "KHR_materials_ior",
  KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
  KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
  KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
  KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
  KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
  KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
  KHR_MATERIALS_VOLUME: "KHR_materials_volume",
  KHR_TEXTURE_BASISU: "KHR_texture_basisu",
  KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
  KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
  KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
  EXT_MATERIALS_BUMP: "EXT_materials_bump",
  EXT_TEXTURE_WEBP: "EXT_texture_webp",
  EXT_TEXTURE_AVIF: "EXT_texture_avif",
  EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
  KHR_MESHOPT_COMPRESSION: "KHR_meshopt_compression",
  EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
class Ix {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_LIGHTS_PUNCTUAL, this.cache = {
      refs: {},
      uses: {}
    }
  }
  _markDefs() {
    const e = this.parser,
      t = this.parser.json.nodes || [];
    for (let n = 0, i = t.length; n < i; n++) {
      const r = t[n];
      r.extensions && r.extensions[this.name] && r.extensions[this.name].light !== void 0 && e._addNodeRef(this.cache, r.extensions[this.name].light)
    }
  }
  _loadLight(e) {
    const t = this.parser,
      n = "light:" + e;
    let i = t.cache.get(n);
    if (i) return i;
    const r = t.json,
      l = ((r.extensions && r.extensions[this.name] || {}).lights || [])[e];
    let c;
    const h = new Fe(16777215);
    l.color !== void 0 && h.setRGB(l.color[0], l.color[1], l.color[2], Xt);
    const u = l.range !== void 0 ? l.range : 0;
    switch (l.type) {
      case "directional":
        c = new Mo(h), c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      case "point":
        c = new jh(h), c.distance = u;
        break;
      case "spot":
        c = new fp(h), c.distance = u, l.spot = l.spot || {}, l.spot.innerConeAngle = l.spot.innerConeAngle !== void 0 ? l.spot.innerConeAngle : 0, l.spot.outerConeAngle = l.spot.outerConeAngle !== void 0 ? l.spot.outerConeAngle : Math.PI / 4, c.angle = l.spot.outerConeAngle, c.penumbra = 1 - l.spot.innerConeAngle / l.spot.outerConeAngle, c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + l.type)
    }
    return c.position.set(0, 0, 0), gn(c, l), l.intensity !== void 0 && (c.intensity = l.intensity), c.name = t.createUniqueName(l.name || "light_" + e), i = Promise.resolve(c), t.cache.add(n, i), i
  }
  getDependency(e, t) {
    if (e === "light") return this._loadLight(t)
  }
  createNodeAttachment(e) {
    const t = this,
      n = this.parser,
      r = n.json.nodes[e],
      o = (r.extensions && r.extensions[this.name] || {}).light;
    return o === void 0 ? null : this._loadLight(o).then(function(l) {
      return n._getNodeRef(t.cache, o, l)
    })
  }
}
class Nx {
  constructor() {
    this.name = Ze.KHR_MATERIALS_UNLIT
  }
  getMaterialType() {
    return Ni
  }
  extendParams(e, t, n) {
    const i = [];
    e.color = new Fe(1, 1, 1), e.opacity = 1;
    const r = t.pbrMetallicRoughness;
    if (r) {
      if (Array.isArray(r.baseColorFactor)) {
        const a = r.baseColorFactor;
        e.color.setRGB(a[0], a[1], a[2], Xt), e.opacity = a[3]
      }
      r.baseColorTexture !== void 0 && i.push(n.assignTexture(e, "map", r.baseColorTexture, bt))
    }
    return Promise.all(i)
  }
}
class Dx {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_EMISSIVE_STRENGTH
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    return n === null || n.emissiveStrength !== void 0 && (t.emissiveIntensity = n.emissiveStrength), Promise.resolve()
  }
}
class Ux {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_CLEARCOAT
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    if (n === null) return Promise.resolve();
    const i = [];
    if (n.clearcoatFactor !== void 0 && (t.clearcoat = n.clearcoatFactor), n.clearcoatTexture !== void 0 && i.push(this.parser.assignTexture(t, "clearcoatMap", n.clearcoatTexture)), n.clearcoatRoughnessFactor !== void 0 && (t.clearcoatRoughness = n.clearcoatRoughnessFactor), n.clearcoatRoughnessTexture !== void 0 && i.push(this.parser.assignTexture(t, "clearcoatRoughnessMap", n.clearcoatRoughnessTexture)), n.clearcoatNormalTexture !== void 0 && (i.push(this.parser.assignTexture(t, "clearcoatNormalMap", n.clearcoatNormalTexture)), n.clearcoatNormalTexture.scale !== void 0)) {
      const r = n.clearcoatNormalTexture.scale;
      t.clearcoatNormalScale = new re(r, r)
    }
    return Promise.all(i)
  }
}
class Fx {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_DIFFUSE_ROUGHNESS
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    if (n === null) return Promise.resolve();
    const i = [];
    return t.diffuseRoughness = n.diffuseRoughnessFactor !== void 0 ? n.diffuseRoughnessFactor : 0, n.diffuseRoughnessTexture !== void 0 && i.push(this.parser.assignTexture(t, "diffuseRoughnessMap", n.diffuseRoughnessTexture)), Promise.all(i)
  }
}
class Ox {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_DISPERSION
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    return n === null || (t.dispersion = n.dispersion !== void 0 ? n.dispersion : 0), Promise.resolve()
  }
}
class Bx {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_IRIDESCENCE
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    if (n === null) return Promise.resolve();
    const i = [];
    return n.iridescenceFactor !== void 0 && (t.iridescence = n.iridescenceFactor), n.iridescenceTexture !== void 0 && i.push(this.parser.assignTexture(t, "iridescenceMap", n.iridescenceTexture)), n.iridescenceIor !== void 0 && (t.iridescenceIOR = n.iridescenceIor), n.iridescenceThicknessMinimum !== void 0 && (t.iridescenceThicknessMinimum = n.iridescenceThicknessMinimum), n.iridescenceThicknessMaximum !== void 0 && (t.iridescenceThicknessMaximum = n.iridescenceThicknessMaximum), n.iridescenceThicknessTexture !== void 0 && i.push(this.parser.assignTexture(t, "iridescenceThicknessMap", n.iridescenceThicknessTexture)), Promise.all(i)
  }
}
class zx {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_SHEEN
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    if (n === null) return Promise.resolve();
    const i = [];
    if (t.sheenColor = new Fe(0, 0, 0), t.sheenRoughness = 0, t.sheen = 1, n.sheenColorFactor !== void 0) {
      const r = n.sheenColorFactor;
      t.sheenColor.setRGB(r[0], r[1], r[2], Xt)
    }
    return n.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = n.sheenRoughnessFactor), n.sheenColorTexture !== void 0 && i.push(this.parser.assignTexture(t, "sheenColorMap", n.sheenColorTexture, bt)), n.sheenRoughnessTexture !== void 0 && i.push(this.parser.assignTexture(t, "sheenRoughnessMap", n.sheenRoughnessTexture)), Promise.all(i)
  }
}
class kx {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_TRANSMISSION
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    if (n === null) return Promise.resolve();
    const i = [];
    return n.transmissionFactor !== void 0 && (t.transmission = n.transmissionFactor), n.transmissionTexture !== void 0 && i.push(this.parser.assignTexture(t, "transmissionMap", n.transmissionTexture)), Promise.all(i)
  }
}
class Hx {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_VOLUME
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    if (n === null) return Promise.resolve();
    const i = [];
    t.thickness = n.thicknessFactor !== void 0 ? n.thicknessFactor : 0, n.thicknessTexture !== void 0 && i.push(this.parser.assignTexture(t, "thicknessMap", n.thicknessTexture)), t.attenuationDistance = n.attenuationDistance || 1 / 0;
    const r = n.attenuationColor || [1, 1, 1];
    return t.attenuationColor = new Fe().setRGB(r[0], r[1], r[2], Xt), Promise.all(i)
  }
}
class Gx {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_IOR
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    return n === null || (t.ior = n.ior !== void 0 ? n.ior : 1.5, t.ior === 0 && (t.ior = 1e3)), Promise.resolve()
  }
}
class Vx {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_SPECULAR
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    if (n === null) return Promise.resolve();
    const i = [];
    t.specularIntensity = n.specularFactor !== void 0 ? n.specularFactor : 1, n.specularTexture !== void 0 && i.push(this.parser.assignTexture(t, "specularIntensityMap", n.specularTexture));
    const r = n.specularColorFactor || [1, 1, 1];
    return t.specularColor = new Fe().setRGB(r[0], r[1], r[2], Xt), n.specularColorTexture !== void 0 && i.push(this.parser.assignTexture(t, "specularColorMap", n.specularColorTexture, bt)), Promise.all(i)
  }
}
class Wx {
  constructor(e) {
    this.parser = e, this.name = Ze.EXT_MATERIALS_BUMP
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    if (n === null) return Promise.resolve();
    const i = [];
    return t.bumpScale = n.bumpFactor !== void 0 ? n.bumpFactor : 1, n.bumpTexture !== void 0 && i.push(this.parser.assignTexture(t, "bumpMap", n.bumpTexture)), Promise.all(i)
  }
}
class Xx {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_MATERIALS_ANISOTROPY
  }
  getMaterialType(e) {
    return Mt(this.parser, e, this.name) !== null ? dn : null
  }
  extendMaterialParams(e, t) {
    const n = Mt(this.parser, e, this.name);
    if (n === null) return Promise.resolve();
    const i = [];
    return n.anisotropyStrength !== void 0 && (t.anisotropy = n.anisotropyStrength), n.anisotropyRotation !== void 0 && (t.anisotropyRotation = n.anisotropyRotation), n.anisotropyTexture !== void 0 && i.push(this.parser.assignTexture(t, "anisotropyMap", n.anisotropyTexture)), Promise.all(i)
  }
}
class qx {
  constructor(e) {
    this.parser = e, this.name = Ze.KHR_TEXTURE_BASISU
  }
  loadTexture(e) {
    const t = this.parser,
      n = t.json,
      i = n.textures[e];
    if (!i.extensions || !i.extensions[this.name]) return null;
    const r = i.extensions[this.name],
      a = t.options.ktx2Loader;
    if (!a) {
      if (n.extensionsRequired && n.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null
    }
    return t.loadTextureImage(e, r.source, a)
  }
}
class Yx {
  constructor(e) {
    this.parser = e, this.name = Ze.EXT_TEXTURE_WEBP
  }
  loadTexture(e) {
    const t = this.name,
      n = this.parser,
      i = n.json,
      r = i.textures[e];
    if (!r.extensions || !r.extensions[t]) return null;
    const a = r.extensions[t],
      o = i.images[a.source];
    let l = n.textureLoader;
    if (o.uri) {
      const c = n.options.manager.getHandler(o.uri);
      c !== null && (l = c)
    }
    return n.loadTextureImage(e, a.source, l)
  }
}
class Kx {
  constructor(e) {
    this.parser = e, this.name = Ze.EXT_TEXTURE_AVIF
  }
  loadTexture(e) {
    const t = this.name,
      n = this.parser,
      i = n.json,
      r = i.textures[e];
    if (!r.extensions || !r.extensions[t]) return null;
    const a = r.extensions[t],
      o = i.images[a.source];
    let l = n.textureLoader;
    if (o.uri) {
      const c = n.options.manager.getHandler(o.uri);
      c !== null && (l = c)
    }
    return n.loadTextureImage(e, a.source, l)
  }
}
class Wc {
  constructor(e, t) {
    this.name = t, this.parser = e
  }
  loadBufferView(e) {
    const t = this.parser.json,
      n = t.bufferViews[e];
    if (n.extensions && n.extensions[this.name]) {
      const i = n.extensions[this.name],
        r = this.parser.getDependency("buffer", i.buffer),
        a = this.parser.options.meshoptDecoder;
      if (!a || !a.supported) {
        if (t.extensionsRequired && t.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null
      }
      return r.then(function(o) {
        const l = i.byteOffset || 0,
          c = i.byteLength || 0,
          h = i.count,
          u = i.byteStride,
          d = new Uint8Array(o, l, c);
        return a.decodeGltfBufferAsync ? a.decodeGltfBufferAsync(h, u, d, i.mode, i.filter).then(function(f) {
          return f.buffer
        }) : a.ready.then(function() {
          const f = new ArrayBuffer(h * u);
          return a.decodeGltfBuffer(new Uint8Array(f), h, u, d, i.mode, i.filter), f
        })
      })
    } else return null
  }
}
class Jx {
  constructor(e) {
    this.name = Ze.EXT_MESH_GPU_INSTANCING, this.parser = e
  }
  createNodeMesh(e) {
    const t = this.parser.json,
      n = t.nodes[e];
    if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0) return null;
    const i = t.meshes[n.mesh];
    for (const c of i.primitives)
      if (c.mode !== Qt.TRIANGLES && c.mode !== Qt.TRIANGLE_STRIP && c.mode !== Qt.TRIANGLE_FAN && c.mode !== void 0) return null;
    const a = n.extensions[this.name].attributes,
      o = [],
      l = {};
    for (const c in a) o.push(this.parser.getDependency("accessor", a[c]).then(h => (l[c] = h, l[c])));
    return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then(c => {
      const h = c.pop(),
        u = h.isGroup ? h.children : [h],
        d = c[0].count,
        f = [];
      for (const p of u) {
        const x = new We,
          m = new N,
          g = new en,
          M = new N(1, 1, 1),
          E = new wh(p.geometry, p.material, d);
        for (let A = 0; A < d; A++) l.TRANSLATION && m.fromBufferAttribute(l.TRANSLATION, A), l.ROTATION && g.fromBufferAttribute(l.ROTATION, A), l.SCALE && M.fromBufferAttribute(l.SCALE, A), E.setMatrixAt(A, x.compose(m, g, M));
        let v = null;
        for (const A in l)
          if (A === "_COLOR_0") {
            const b = l[A];
            E.instanceColor = new Rr(b.array, b.itemSize, b.normalized)
          } else if (A !== "TRANSLATION" && A !== "ROTATION" && A !== "SCALE") {
          if (v === null) {
            const _ = E.geometry;
            v = new wt, v.name = _.name;
            for (const T in _.attributes) v.setAttribute(T, _.attributes[T]);
            for (const T in _.morphAttributes) v.morphAttributes[T] = _.morphAttributes[T];
            _.index !== null && v.setIndex(_.index), v.morphTargetsRelative = _.morphTargetsRelative;
            for (const T of _.groups) v.addGroup(T.start, T.count, T.materialIndex);
            _.boundingBox !== null && (v.boundingBox = _.boundingBox.clone()), _.boundingSphere !== null && (v.boundingSphere = _.boundingSphere.clone()), v.drawRange.start = _.drawRange.start, v.drawRange.count = _.drawRange.count, v.userData = Object.assign({}, _.userData), E.geometry = v
          }
          const b = l[A];
          v.setAttribute(A, new Rr(b.array, b.itemSize, b.normalized))
        }
        gt.prototype.copy.call(E, p), this.parser.assignFinalMaterial(E), f.push(E)
      }
      return h.isGroup ? (h.clear(), h.add(...f), h) : f[0]
    }))
  }
}
const fu = "glTF",
  os = 12,
  Xc = {
    JSON: 1313821514,
    BIN: 5130562
  };
class Zx {
  constructor(e) {
    this.name = Ze.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const t = new DataView(e, 0, os),
      n = new TextDecoder;
    if (this.header = {
        magic: n.decode(new Uint8Array(e.slice(0, 4))),
        version: t.getUint32(4, !0),
        length: t.getUint32(8, !0)
      }, this.header.magic !== fu) throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2) throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const i = this.header.length - os,
      r = new DataView(e, os);
    let a = 0;
    for (; a < i;) {
      const o = r.getUint32(a, !0);
      a += 4;
      const l = r.getUint32(a, !0);
      if (a += 4, l === Xc.JSON) {
        const c = new Uint8Array(e, os + a, o);
        this.content = n.decode(c)
      } else if (l === Xc.BIN) {
        const c = os + a;
        this.body = e.slice(c, c + o)
      }
      a += o
    }
    if (this.content === null) throw new Error("THREE.GLTFLoader: JSON content not found.")
  }
}
class $x {
  constructor(e, t) {
    if (!t) throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = Ze.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload()
  }
  decodePrimitive(e, t) {
    const n = this.json,
      i = this.dracoLoader,
      r = e.extensions[this.name].bufferView,
      a = e.extensions[this.name].attributes,
      o = {},
      l = {},
      c = {};
    for (const h in a) {
      const u = Eo[h] || h.toLowerCase();
      o[u] = a[h]
    }
    for (const h in e.attributes) {
      const u = Eo[h] || h.toLowerCase();
      if (a[h] !== void 0) {
        const d = n.accessors[e.attributes[h]],
          f = Bi[d.componentType];
        c[u] = f.name, l[u] = d.normalized === !0
      }
    }
    return t.getDependency("bufferView", r).then(function(h) {
      return new Promise(function(u, d) {
        i.decodeDracoFile(h, function(f) {
          for (const p in f.attributes) {
            const x = f.attributes[p],
              m = l[p];
            m !== void 0 && (x.normalized = m)
          }
          u(f)
        }, o, c, Xt, d)
      })
    })
  }
}
class Qx {
  constructor() {
    this.name = Ze.KHR_TEXTURE_TRANSFORM
  }
  extendTexture(e, t) {
    if ((t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0) return e;
    if (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), t.rotation !== void 0) {
      const n = Math.cos(e.rotation),
        i = Math.sin(e.rotation);
      e.matrix.set(e.repeat.x * n, e.repeat.y * i, e.offset.x, -e.repeat.x * i, e.repeat.y * n, e.offset.y, 0, 0, 1), e.matrixAutoUpdate = !1
    }
    return e.needsUpdate = !0, e
  }
}
class jx {
  constructor() {
    this.name = Ze.KHR_MESH_QUANTIZATION
  }
}
class pu extends Yi {
  constructor(e, t, n, i) {
    super(e, t, n, i)
  }
  copySampleValue_(e) {
    const t = this.resultBuffer,
      n = this.sampleValues,
      i = this.valueSize,
      r = e * i * 3 + i;
    for (let a = 0; a !== i; a++) t[a] = n[r + a];
    return t
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer,
      a = this.sampleValues,
      o = this.valueSize,
      l = o * 2,
      c = o * 3,
      h = i - t,
      u = (n - t) / h,
      d = u * u,
      f = d * u,
      p = e * c,
      x = p - c,
      m = -2 * f + 3 * d,
      g = f - d,
      M = 1 - m,
      E = g - d + u;
    for (let v = 0; v !== o; v++) {
      const A = a[x + v + o],
        b = a[x + v + l] * h,
        _ = a[p + v + o],
        T = a[p + v] * h;
      r[v] = M * A + E * b + m * _ + g * T
    }
    return r
  }
}
const ev = new en;
class tv extends pu {
  interpolate_(e, t, n, i) {
    const r = super.interpolate_(e, t, n, i);
    return ev.fromArray(r).normalize().toArray(r), r
  }
}
const Qt = {
    POINTS: 0,
    LINES: 1,
    LINE_LOOP: 2,
    LINE_STRIP: 3,
    TRIANGLES: 4,
    TRIANGLE_STRIP: 5,
    TRIANGLE_FAN: 6
  },
  Bi = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
  },
  qc = {
    9728: Rt,
    9729: Ct,
    9984: ah,
    9985: gr,
    9986: cs,
    9987: vn
  },
  Yc = {
    33071: on,
    33648: yr,
    10497: zi
  },
  Ea = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
  },
  Eo = {
    POSITION: "position",
    NORMAL: "normal",
    TANGENT: "tangent",
    TEXCOORD_0: "uv",
    TEXCOORD_1: "uv1",
    TEXCOORD_2: "uv2",
    TEXCOORD_3: "uv3",
    COLOR_0: "color",
    WEIGHTS_0: "skinWeight",
    JOINTS_0: "skinIndex"
  },
  Wn = {
    scale: "scale",
    translation: "position",
    rotation: "quaternion",
    weights: "morphTargetInfluences"
  },
  nv = {
    CUBICSPLINE: void 0,
    LINEAR: Ts,
    STEP: ys
  },
  ba = {
    OPAQUE: "OPAQUE",
    MASK: "MASK",
    BLEND: "BLEND"
  };

function iv(s) {
  return s.DefaultMaterial === void 0 && (s.DefaultMaterial = new Ls({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: $n
  })), s.DefaultMaterial
}

function oi(s, e, t) {
  for (const n in t.extensions) s[n] === void 0 && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, e.userData.gltfExtensions[n] = t.extensions[n])
}

function gn(s, e) {
  e.extras !== void 0 && (typeof e.extras == "object" ? Object.assign(s.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras))
}

function sv(s, e, t) {
  let n = !1,
    i = !1,
    r = !1;
  for (let c = 0, h = e.length; c < h; c++) {
    const u = e[c];
    if (u.POSITION !== void 0 && (n = !0), u.NORMAL !== void 0 && (i = !0), u.COLOR_0 !== void 0 && (r = !0), n && i && r) break
  }
  if (!n && !i && !r) return Promise.resolve(s);
  const a = [],
    o = [],
    l = [];
  for (let c = 0, h = e.length; c < h; c++) {
    const u = e[c];
    if (n) {
      const d = u.POSITION !== void 0 ? t.getDependency("accessor", u.POSITION) : s.attributes.position;
      a.push(d)
    }
    if (i) {
      const d = u.NORMAL !== void 0 ? t.getDependency("accessor", u.NORMAL) : s.attributes.normal;
      o.push(d)
    }
    if (r) {
      const d = u.COLOR_0 !== void 0 ? t.getDependency("accessor", u.COLOR_0) : s.attributes.color;
      l.push(d)
    }
  }
  return Promise.all([Promise.all(a), Promise.all(o), Promise.all(l)]).then(function(c) {
    const h = c[0],
      u = c[1],
      d = c[2];
    return n && (s.morphAttributes.position = h), i && (s.morphAttributes.normal = u), r && (s.morphAttributes.color = d), s.morphTargetsRelative = !0, s
  })
}

function rv(s, e) {
  if (s.updateMorphTargets(), e.weights !== void 0)
    for (let t = 0, n = e.weights.length; t < n; t++) s.morphTargetInfluences[t] = e.weights[t];
  if (e.extras && Array.isArray(e.extras.targetNames)) {
    const t = e.extras.targetNames;
    if (s.morphTargetInfluences.length === t.length) {
      s.morphTargetDictionary = {};
      for (let n = 0, i = t.length; n < i; n++) s.morphTargetDictionary[t[n]] = n
    } else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")
  }
}

function av(s) {
  let e;
  const t = s.extensions && s.extensions[Ze.KHR_DRACO_MESH_COMPRESSION];
  if (t ? e = "draco:" + t.bufferView + ":" + t.indices + ":" + Aa(t.attributes) : e = s.indices + ":" + Aa(s.attributes) + ":" + s.mode, s.targets !== void 0)
    for (let n = 0, i = s.targets.length; n < i; n++) e += ":" + Aa(s.targets[n]);
  return e
}

function Aa(s) {
  let e = "";
  const t = Object.keys(s).sort();
  for (let n = 0, i = t.length; n < i; n++) e += t[n] + ":" + s[t[n]] + ";";
  return e
}

function bo(s) {
  switch (s) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")
  }
}

function ov(s) {
  return s.search(/\.jpe?g($|\?)/i) > 0 || s.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : s.search(/\.webp($|\?)/i) > 0 || s.search(/^data\:image\/webp/) === 0 ? "image/webp" : s.search(/\.ktx2($|\?)/i) > 0 || s.search(/^data\:image\/ktx2/) === 0 ? "image/ktx2" : "image/png"
}
const lv = new We;
class cv {
  constructor(e = {}, t = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new Px, this.associations = new Map, this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = {
      refs: {},
      uses: {}
    }, this.cameraCache = {
      refs: {},
      uses: {}
    }, this.lightCache = {
      refs: {},
      uses: {}
    }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1,
      i = -1,
      r = !1,
      a = -1;
    if (typeof navigator < "u" && typeof navigator.userAgent < "u") {
      const o = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(o) === !0;
      const l = o.match(/Version\/(\d+)/);
      i = n && l ? parseInt(l[1], 10) : -1, r = o.indexOf("Firefox") > -1, a = r ? o.match(/Firefox\/([0-9]+)\./)[1] : -1
    }
    typeof createImageBitmap > "u" || n && i < 17 || r && a < 98 ? (this.textureLoader = new hp(this.options.manager), this.textureLoader.setPriority(this.options.priority), this.textureLoader.setCache(this.options.cache)) : (this.textureLoader = new gp(this.options.manager), this.textureLoader.setPriority(this.options.priority), this.textureLoader.setCache(this.options.cache)), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setWithCredentials(this.options.withCredentials), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new Ir(this.options.manager), this.fileLoader.setPriority(this.options.priority), this.fileLoader.setCache(this.options.cache), this.fileLoader.setResponseType("arraybuffer"), (this.options.withCredentials || this.options.crossOrigin === "use-credentials") && this.fileLoader.setWithCredentials(!0)
  }
  setExtensions(e) {
    this.extensions = e
  }
  setPlugins(e) {
    this.plugins = e
  }
  parse(e, t) {
    const n = this,
      i = this.json,
      r = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(a) {
      return a._markDefs && a._markDefs()
    }), Promise.all(this._invokeAll(function(a) {
      return a.beforeRoot && a.beforeRoot()
    })).then(function() {
      return Promise.all([n.getDependencies("scene"), n.getDependencies("animation"), n.getDependencies("camera")])
    }).then(function(a) {
      const o = {
        scene: a[0][i.scene || 0],
        scenes: a[0],
        animations: a[1],
        cameras: a[2],
        asset: i.asset,
        parser: n,
        userData: {}
      };
      return oi(r, o, i), gn(o, i), Promise.all(n._invokeAll(function(l) {
        return l.afterRoot && l.afterRoot(o)
      })).then(function() {
        for (const l of o.scenes) l.updateMatrixWorld();
        e(o)
      })
    }).catch(t)
  }
  _markDefs() {
    const e = this.json.nodes || [],
      t = this.json.skins || [],
      n = this.json.meshes || [];
    for (let i = 0, r = t.length; i < r; i++) {
      const a = t[i].joints;
      for (let o = 0, l = a.length; o < l; o++) e[a[o]].isBone = !0
    }
    for (let i = 0, r = e.length; i < r; i++) {
      const a = e[i];
      a.mesh !== void 0 && (this._addNodeRef(this.meshCache, a.mesh), a.skin !== void 0 && (n[a.mesh].isSkinnedMesh = !0)), a.camera !== void 0 && this._addNodeRef(this.cameraCache, a.camera)
    }
  }
  _addNodeRef(e, t) {
    t !== void 0 && (e.refs[t] === void 0 && (e.refs[t] = e.uses[t] = 0), e.refs[t]++)
  }
  _getNodeRef(e, t, n) {
    if (e.refs[t] <= 1) return n;
    const i = n.clone(),
      r = (a, o) => {
        const l = this.associations.get(a);
        l != null && this.associations.set(o, l);
        for (const [c, h] of a.children.entries()) r(h, o.children[c])
      };
    return r(n, i), i.name += "_instance_" + e.uses[t]++, i
  }
  _invokeOne(e) {
    const t = Object.values(this.plugins);
    t.push(this);
    for (let n = 0; n < t.length; n++) {
      const i = e(t[n]);
      if (i) return i
    }
    return null
  }
  _invokeAll(e) {
    const t = Object.values(this.plugins);
    t.unshift(this);
    const n = [];
    for (let i = 0; i < t.length; i++) {
      const r = e(t[i]);
      r && n.push(r)
    }
    return n
  }
  getDependency(e, t) {
    const n = e + ":" + t;
    let i = this.cache.get(n);
    if (!i) {
      switch (e) {
        case "scene":
          i = this.loadScene(t);
          break;
        case "node":
          i = this._invokeOne(function(r) {
            return r.loadNode && r.loadNode(t)
          });
          break;
        case "mesh":
          i = this._invokeOne(function(r) {
            return r.loadMesh && r.loadMesh(t)
          });
          break;
        case "accessor":
          i = this.loadAccessor(t);
          break;
        case "bufferView":
          i = this._invokeOne(function(r) {
            return r.loadBufferView && r.loadBufferView(t)
          });
          break;
        case "buffer":
          i = this.loadBuffer(t);
          break;
        case "material":
          i = this._invokeOne(function(r) {
            return r.loadMaterial && r.loadMaterial(t)
          });
          break;
        case "texture":
          i = this._invokeOne(function(r) {
            return r.loadTexture && r.loadTexture(t)
          });
          break;
        case "skin":
          i = this.loadSkin(t);
          break;
        case "animation":
          i = this._invokeOne(function(r) {
            return r.loadAnimation && r.loadAnimation(t)
          });
          break;
        case "camera":
          i = this.loadCamera(t);
          break;
        default:
          if (i = this._invokeOne(function(r) {
              return r != this && r.getDependency && r.getDependency(e, t)
            }), !i) throw new Error("Unknown type: " + e);
          break
      }
      this.cache.add(n, i)
    }
    return i
  }
  getDependencies(e) {
    let t = this.cache.get(e);
    if (!t) {
      const n = this,
        i = this.json[e + (e === "mesh" ? "es" : "s")] || [];
      t = Promise.all(i.map(function(r, a) {
        return n.getDependency(e, a)
      })), this.cache.add(e, t)
    }
    return t
  }
  loadBuffer(e) {
    const t = this.json.buffers[e],
      n = this.fileLoader;
    if (t.type && t.type !== "arraybuffer") throw new Error("THREE.GLTFLoader: " + t.type + " buffer type is not supported.");
    if (t.uri === void 0 && e === 0) return Promise.resolve(this.extensions[Ze.KHR_BINARY_GLTF].body);
    const i = this.options;
    return new Promise(function(r, a) {
      n.load(Zn.resolveURL(t.uri, i.path), r, void 0, function() {
        a(new Error('THREE.GLTFLoader: Failed to load buffer "' + t.uri + '".'))
      })
    })
  }
  loadBufferView(e) {
    const t = this.json.bufferViews[e];
    return this.getDependency("buffer", t.buffer).then(function(n) {
      const i = t.byteLength || 0,
        r = t.byteOffset || 0;
      return n.slice(r, r + i)
    })
  }
  loadAccessor(e) {
    const t = this,
      n = this.json,
      i = this.json.accessors[e];
    if (i.bufferView === void 0 && i.sparse === void 0) {
      const a = Ea[i.type],
        o = Bi[i.componentType],
        l = i.normalized === !0,
        c = new o(i.count * a);
      return Promise.resolve(new Ft(c, a, l))
    }
    const r = [];
    return i.bufferView !== void 0 ? r.push(this.getDependency("bufferView", i.bufferView)) : r.push(null), i.sparse !== void 0 && (r.push(this.getDependency("bufferView", i.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", i.sparse.values.bufferView))), Promise.all(r).then(function(a) {
      const o = a[0],
        l = Ea[i.type],
        c = Bi[i.componentType],
        h = c.BYTES_PER_ELEMENT,
        u = h * l,
        d = i.byteOffset || 0,
        f = i.bufferView !== void 0 ? n.bufferViews[i.bufferView].byteStride : void 0,
        p = i.normalized === !0;
      let x, m;
      if (f && f !== u) {
        const g = Math.floor(d / f),
          M = "InterleavedBuffer:" + i.bufferView + ":" + i.componentType + ":" + g + ":" + i.count;
        let E = t.cache.get(M);
        E || (x = new c(o, g * f, i.count * f / h), E = new bh(x, f / h), t.cache.add(M, E)), m = new Or(E, l, d % f / h, p)
      } else o === null ? x = new c(i.count * l) : x = new c(o, d, i.count * l), m = new Ft(x, l, p);
      if (i.sparse !== void 0) {
        const g = Ea.SCALAR,
          M = Bi[i.sparse.indices.componentType],
          E = i.sparse.indices.byteOffset || 0,
          v = i.sparse.values.byteOffset || 0,
          A = new M(a[1], E, i.sparse.count * g),
          b = new c(a[2], v, i.sparse.count * l);
        o !== null && (m = new Ft(m.array.slice(), m.itemSize, m.normalized)), m.normalized = !1;
        for (let _ = 0, T = A.length; _ < T; _++) {
          const I = A[_];
          if (m.setX(I, b[_ * l]), l >= 2 && m.setY(I, b[_ * l + 1]), l >= 3 && m.setZ(I, b[_ * l + 2]), l >= 4 && m.setW(I, b[_ * l + 3]), l >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")
        }
        m.normalized = p
      }
      return m
    })
  }
  loadTexture(e) {
    const t = this.json,
      n = this.options,
      r = t.textures[e].source,
      a = t.images[r];
    let o = this.textureLoader;
    if (a.uri) {
      const l = n.manager.getHandler(a.uri);
      l !== null && (o = l)
    }
    return this.loadTextureImage(e, r, o)
  }
  loadTextureImage(e, t, n) {
    const i = this,
      r = this.json,
      a = r.textures[e],
      o = r.images[t],
      l = (o.uri || o.bufferView) + ":" + a.sampler;
    if (this.textureCache[l]) return this.textureCache[l];
    const c = this.loadImageSource(t, n).then(function(h) {
      h.flipY = !1, h.name = a.name || o.name || "", h.name === "" && typeof o.uri == "string" && o.uri.startsWith("data:image/") === !1 && (h.name = o.uri);
      const d = (r.samplers || {})[a.sampler] || {};
      return h.magFilter = qc[d.magFilter] || Ct, h.minFilter = qc[d.minFilter] || vn, h.wrapS = Yc[d.wrapS] || zi, h.wrapT = Yc[d.wrapT] || zi, h.generateMipmaps = !h.isCompressedTexture && h.minFilter !== Rt && h.minFilter !== Ct, i.associations.set(h, {
        textures: e
      }), h
    }).catch(function() {
      return null
    });
    return this.textureCache[l] = c, c
  }
  loadImageSource(e, t) {
    const n = this,
      i = this.json,
      r = this.options;
    if (this.sourceCache[e] !== void 0) return this.sourceCache[e].then(d => d.clone());
    const a = i.images[e],
      o = self.URL || self.webkitURL;
    let l = a.uri || "",
      c = !1,
      h;
    if (t.isKTX2Loader === !0 && a.bufferView !== void 0) h = n.getDependency("bufferView", a.bufferView).then(function(d) {
      return new Promise(function(f, p) {
        t.parse(d, f, p)
      })
    });
    else {
      if (a.bufferView !== void 0) l = n.getDependency("bufferView", a.bufferView).then(function(d) {
        c = !0;
        const f = new Blob([d], {
          type: a.mimeType
        });
        return l = o.createObjectURL(f), l
      });
      else if (a.uri === void 0) throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
      h = Promise.resolve(l).then(function(d) {
        return new Promise(function(f, p) {
          let x = f;
          t.isImageBitmapLoader === !0 && (x = function(m) {
            const g = new vt(m);
            g.needsUpdate = !0, f(g)
          }), t.load(Zn.resolveURL(d, r.path), x, void 0, p)
        })
      })
    }
    const u = h.then(function(d) {
      return c === !0 && o.revokeObjectURL(l), gn(d, a), d.userData.mimeType = a.mimeType || ov(a.uri), d
    }).catch(function(d) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", l), d
    });
    return this.sourceCache[e] = u, u
  }
  assignTexture(e, t, n, i) {
    const r = this;
    return this.getDependency("texture", n.index).then(function(a) {
      if (!a) return null;
      if (n.texCoord !== void 0 && n.texCoord > 0 && (a = a.clone(), a.channel = n.texCoord), r.extensions[Ze.KHR_TEXTURE_TRANSFORM]) {
        const o = n.extensions !== void 0 ? n.extensions[Ze.KHR_TEXTURE_TRANSFORM] : void 0;
        if (o) {
          const l = r.associations.get(a);
          a = r.extensions[Ze.KHR_TEXTURE_TRANSFORM].extendTexture(a, o), r.associations.set(a, l)
        }
      }
      return i !== void 0 && (a.colorSpace = i), e[t] = a, a
    })
  }
  assignFinalMaterial(e) {
    const t = e.geometry;
    let n = e.material;
    const i = t.attributes.tangent === void 0,
      r = t.attributes.color !== void 0,
      a = t.attributes.normal === void 0;
    if (e.isPoints) {
      const o = "PointsMaterial:" + n.uuid;
      let l = this.cache.get(o);
      l || (l = new Ch, Zt.prototype.copy.call(l, n), l.color.copy(n.color), l.map = n.map, l.sizeAttenuation = !1, this.cache.add(o, l)), n = l
    } else if (e.isLine) {
      const o = "LineBasicMaterial:" + n.uuid;
      let l = this.cache.get(o);
      l || (l = new Xo, Zt.prototype.copy.call(l, n), l.color.copy(n.color), l.map = n.map, this.cache.add(o, l)), n = l
    }
    if (i || r || a) {
      let o = "ClonedMaterial:" + n.uuid + ":";
      i && (o += "derivative-tangents:"), r && (o += "vertex-colors:"), a && (o += "flat-shading:");
      let l = this.cache.get(o);
      l || (l = n.clone(), r && (l.vertexColors = !0), a && (l.flatShading = !0), i && (l.normalScale && (l.normalScale.y *= -1), l.clearcoatNormalScale && (l.clearcoatNormalScale.y *= -1)), this.cache.add(o, l), this.associations.set(l, this.associations.get(n))), n = l
    }
    e.material = n
  }
  getMaterialType() {
    return Ls
  }
  loadMaterial(e) {
    const t = this,
      n = this.json,
      i = this.extensions,
      r = n.materials[e];
    let a;
    const o = {},
      l = r.extensions || {},
      c = [];
    if (l[Ze.KHR_MATERIALS_UNLIT]) {
      const u = i[Ze.KHR_MATERIALS_UNLIT];
      a = u.getMaterialType(), c.push(u.extendParams(o, r, t))
    } else {
      const u = r.pbrMetallicRoughness || {};
      if (o.color = new Fe(1, 1, 1), o.opacity = 1, Array.isArray(u.baseColorFactor)) {
        const d = u.baseColorFactor;
        o.color.setRGB(d[0], d[1], d[2], Xt), o.opacity = d[3]
      }
      u.baseColorTexture !== void 0 && c.push(t.assignTexture(o, "map", u.baseColorTexture, bt)), o.metalness = u.metallicFactor !== void 0 ? u.metallicFactor : 1, o.roughness = u.roughnessFactor !== void 0 ? u.roughnessFactor : 1, u.metallicRoughnessTexture !== void 0 && (c.push(t.assignTexture(o, "metalnessMap", u.metallicRoughnessTexture)), c.push(t.assignTexture(o, "roughnessMap", u.metallicRoughnessTexture))), a = this._invokeOne(function(d) {
        return d.getMaterialType && d.getMaterialType(e)
      }), c.push(Promise.all(this._invokeAll(function(d) {
        return d.extendMaterialParams && d.extendMaterialParams(e, o)
      })))
    }
    r.doubleSided === !0 && (o.side = xn);
    const h = r.alphaMode || ba.OPAQUE;
    if (h === ba.BLEND ? (o.transparent = !0, o.depthWrite = !1) : (o.transparent = !1, h === ba.MASK && (o.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : .5)), r.normalTexture !== void 0 && a !== Ni && (c.push(t.assignTexture(o, "normalMap", r.normalTexture)), o.normalScale = new re(1, 1), r.normalTexture.scale !== void 0)) {
      const u = r.normalTexture.scale;
      o.normalScale.set(u, u)
    }
    if (r.occlusionTexture !== void 0 && a !== Ni && (c.push(t.assignTexture(o, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (o.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && a !== Ni) {
      const u = r.emissiveFactor;
      o.emissive = new Fe().setRGB(u[0], u[1], u[2], Xt)
    }
    return r.emissiveTexture !== void 0 && a !== Ni && c.push(t.assignTexture(o, "emissiveMap", r.emissiveTexture, bt)), Promise.all(c).then(function() {
      const u = new a(o);
      return r.name && (u.name = r.name), gn(u, r), t.associations.set(u, {
        materials: e
      }), r.extensions && oi(i, u, r), u
    })
  }
  createUniqueName(e) {
    const t = ot.sanitizeNodeName(e || "");
    return t in this.nodeNamesUsed ? t + "_" + ++this.nodeNamesUsed[t] : (this.nodeNamesUsed[t] = 0, t)
  }
  loadGeometries(e) {
    const t = this,
      n = this.extensions,
      i = this.primitiveCache;

    function r(o) {
      return n[Ze.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o, t).then(function(l) {
        return Kc(l, o, t)
      })
    }
    const a = [];
    for (let o = 0, l = e.length; o < l; o++) {
      const c = e[o],
        h = av(c),
        u = i[h];
      if (u) a.push(u.promise);
      else {
        let d;
        c.extensions && c.extensions[Ze.KHR_DRACO_MESH_COMPRESSION] ? d = r(c) : d = Kc(new wt, c, t), c.mode === Qt.TRIANGLE_STRIP ? d = d.then(f => Vc(f, fh)) : c.mode === Qt.TRIANGLE_FAN && (d = d.then(f => Vc(f, po))), i[h] = {
          primitive: c,
          promise: d
        }, a.push(d)
      }
    }
    return Promise.all(a)
  }
  loadMesh(e) {
    const t = this,
      n = this.json,
      i = this.extensions,
      r = n.meshes[e],
      a = r.primitives,
      o = [];
    for (let l = 0, c = a.length; l < c; l++) {
      const h = a[l].material === void 0 ? iv(this.cache) : this.getDependency("material", a[l].material);
      o.push(h)
    }
    return o.push(t.loadGeometries(a)), Promise.all(o).then(async function(l) {
      const c = l.slice(0, l.length - 1),
        h = l[l.length - 1],
        u = [];
      for (let f = 0, p = h.length; f < p; f++) {
        const x = h[f],
          m = a[f];
        let g;
        const M = c[f];
        if (m.mode === Qt.TRIANGLES || m.mode === Qt.TRIANGLE_STRIP || m.mode === Qt.TRIANGLE_FAN || m.mode === void 0) {
          const E = r.isSkinnedMesh === !0,
            v = x.hasAttribute("skinIndex") && x.hasAttribute("skinWeight");
          E && v === !1 && console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."), g = E && v ? new Ah(x, M) : new At(x, M), g.isSkinnedMesh === !0 && g.normalizeSkinWeights()
        } else if (m.mode === Qt.LINES) g = new Rh(x, M);
        else if (m.mode === Qt.LINE_STRIP) g = new qo(x, M);
        else if (m.mode === Qt.LINE_LOOP) g = new rf(x, M);
        else if (m.mode === Qt.POINTS) g = new af(x, M);
        else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + m.mode);
        Object.keys(g.geometry.morphAttributes).length > 0 && rv(g, r), g.name = t.createUniqueName(r.name || "mesh_" + e), gn(g, r), m.extensions && oi(i, g, m), t.assignFinalMaterial(g), u.push(g)
      }
      for (let f = 0, p = u.length; f < p; f++) t.associations.set(u[f], {
        meshes: e,
        primitives: f
      });
      if (u.length === 1) return r.extensions && oi(i, u[0], r), u[0];
      const d = new ci;
      r.extensions && oi(i, d, r), t.associations.set(d, {
        meshes: e
      });
      for (let f = 0, p = u.length; f < p; f++) d.add(u[f]);
      return d
    })
  }
  loadCamera(e) {
    let t;
    const n = this.json.cameras[e],
      i = n[n.type];
    if (!i) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return
    }
    return n.type === "perspective" ? t = new Kt(Cd.radToDeg(i.yfov), i.aspectRatio || 1, i.znear || 1, i.zfar || 2e6) : n.type === "orthographic" && (t = new Qo(-i.xmag, i.xmag, i.ymag, -i.ymag, i.znear, i.zfar)), n.name && (t.name = this.createUniqueName(n.name)), gn(t, n), Promise.resolve(t)
  }
  loadSkin(e) {
    const t = this.json.skins[e],
      n = [];
    for (let i = 0, r = t.joints.length; i < r; i++) n.push(this._loadNodeShallow(t.joints[i]));
    return t.inverseBindMatrices !== void 0 ? n.push(this.getDependency("accessor", t.inverseBindMatrices)) : n.push(null), Promise.all(n).then(function(i) {
      const r = i.pop(),
        a = i,
        o = [],
        l = [];
      for (let c = 0, h = a.length; c < h; c++) {
        const u = a[c];
        if (u) {
          o.push(u);
          const d = new We;
          r !== null && d.fromArray(r.array, c * 16), l.push(d)
        } else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[c])
      }
      return new Vo(o, l)
    })
  }
  loadAnimation(e) {
    const t = this.json,
      n = this,
      i = t.animations[e],
      r = i.name ? i.name : "animation_" + e,
      a = [],
      o = [],
      l = [],
      c = [],
      h = [];
    for (let u = 0, d = i.channels.length; u < d; u++) {
      const f = i.channels[u],
        p = i.samplers[f.sampler],
        x = f.target,
        m = x.node,
        g = i.parameters !== void 0 ? i.parameters[p.input] : p.input,
        M = i.parameters !== void 0 ? i.parameters[p.output] : p.output;
      x.node !== void 0 && (a.push(this.getDependency("node", m)), o.push(this.getDependency("accessor", g)), l.push(this.getDependency("accessor", M)), c.push(p), h.push(x))
    }
    return Promise.all([Promise.all(a), Promise.all(o), Promise.all(l), Promise.all(c), Promise.all(h)]).then(function(u) {
      const d = u[0],
        f = u[1],
        p = u[2],
        x = u[3],
        m = u[4],
        g = [];
      for (let E = 0, v = d.length; E < v; E++) {
        const A = d[E],
          b = f[E],
          _ = p[E],
          T = x[E],
          I = m[E];
        if (A === void 0) continue;
        A.updateMatrix && A.updateMatrix();
        const R = n._createAnimationTracks(A, b, _, T, I);
        if (R)
          for (let D = 0; D < R.length; D++) g.push(R[D])
      }
      const M = new vo(r, void 0, g);
      return gn(M, i), M
    })
  }
  createNodeMesh(e) {
    const t = this.json,
      n = this,
      i = t.nodes[e];
    return i.mesh === void 0 ? null : n.getDependency("mesh", i.mesh).then(function(r) {
      const a = n._getNodeRef(n.meshCache, i.mesh, r);
      return i.weights !== void 0 && a.traverse(function(o) {
        if (o.isMesh)
          for (let l = 0, c = i.weights.length; l < c; l++) o.morphTargetInfluences[l] = i.weights[l]
      }), a
    })
  }
  loadNode(e) {
    const t = this.json,
      n = this,
      i = t.nodes[e],
      r = n._loadNodeShallow(e),
      a = [],
      o = i.children || [];
    for (let c = 0, h = o.length; c < h; c++) a.push(n.getDependency("node", o[c]));
    const l = i.skin === void 0 ? Promise.resolve(null) : n.getDependency("skin", i.skin);
    return Promise.all([r, Promise.all(a), l]).then(function(c) {
      const h = c[0],
        u = c[1],
        d = c[2];
      d !== null && h.traverse(function(f) {
        f.isSkinnedMesh && f.bind(d, lv)
      });
      for (let f = 0, p = u.length; f < p; f++) h.add(u[f]);
      if (h.userData.pivot !== void 0 && u.length > 0) {
        const f = h.userData.pivot,
          p = u[0];
        h.pivot = new N().fromArray(f), h.position.x -= f[0], h.position.y -= f[1], h.position.z -= f[2], p.position.set(0, 0, 0), delete h.userData.pivot
      }
      return h
    })
  }
  _loadNodeShallow(e) {
    const t = this.json,
      n = this.extensions,
      i = this;
    if (this.nodeCache[e] !== void 0) return this.nodeCache[e];
    const r = t.nodes[e],
      a = r.name ? i.createUniqueName(r.name) : "",
      o = [],
      l = i._invokeOne(function(c) {
        return c.createNodeMesh && c.createNodeMesh(e)
      });
    return l && o.push(l), r.camera !== void 0 && o.push(i.getDependency("camera", r.camera).then(function(c) {
      return i._getNodeRef(i.cameraCache, r.camera, c)
    })), i._invokeAll(function(c) {
      return c.createNodeAttachment && c.createNodeAttachment(e)
    }).forEach(function(c) {
      o.push(c)
    }), this.nodeCache[e] = Promise.all(o).then(function(c) {
      let h;
      if (r.isBone === !0 ? h = new Ho : c.length > 1 ? h = new ci : c.length === 1 ? h = c[0] : h = new gt, h !== c[0])
        for (let u = 0, d = c.length; u < d; u++) h.add(c[u]);
      if (r.name && (h.userData.name = r.name, h.name = a), gn(h, r), r.extensions && oi(n, h, r), r.matrix !== void 0) {
        const u = new We;
        u.fromArray(r.matrix), h.applyMatrix4(u)
      } else r.translation !== void 0 && h.position.fromArray(r.translation), r.rotation !== void 0 && h.quaternion.fromArray(r.rotation), r.scale !== void 0 && h.scale.fromArray(r.scale);
      if (!i.associations.has(h)) i.associations.set(h, {});
      else if (r.mesh !== void 0 && i.meshCache.refs[r.mesh] > 1) {
        const u = i.associations.get(h);
        i.associations.set(h, {
          ...u
        })
      }
      return i.associations.get(h).nodes = e, h
    }), this.nodeCache[e]
  }
  loadScene(e) {
    const t = this.extensions,
      n = this.json.scenes[e],
      i = this,
      r = new ci;
    n.name && (r.name = i.createUniqueName(n.name)), gn(r, n), n.extensions && oi(t, r, n);
    const a = n.nodes || [],
      o = [];
    for (let l = 0, c = a.length; l < c; l++) o.push(i.getDependency("node", a[l]));
    return Promise.all(o).then(function(l) {
      for (let h = 0, u = l.length; h < u; h++) {
        const d = l[h];
        d.parent !== null ? r.add(uu(d)) : r.add(d)
      }
      const c = h => {
        const u = new Map;
        for (const [d, f] of i.associations)(d instanceof Zt || d instanceof vt) && u.set(d, f);
        return h.traverse(d => {
          const f = i.associations.get(d);
          f != null && u.set(d, f)
        }), u
      };
      return i.associations = c(r), r
    })
  }
  _createAnimationTracks(e, t, n, i, r) {
    const a = [],
      o = e.name ? e.name : e.uuid,
      l = [];

    function c(f) {
      f.morphTargetInfluences && l.push(f.name ? f.name : f.uuid)
    }
    Wn[r.path] === Wn.weights ? (c(e), e.isGroup && e.children.forEach(c)) : l.push(o);
    let h;
    switch (Wn[r.path]) {
      case Wn.weights:
        h = Ps;
        break;
      case Wn.rotation:
        h = Is;
        break;
      case Wn.translation:
      case Wn.scale:
        h = Pr;
        break;
      default:
        switch (n.itemSize) {
          case 1:
            h = Ps;
            break;
          case 2:
          case 3:
          default:
            h = Pr;
            break
        }
        break
    }
    const u = i.interpolation !== void 0 ? nv[i.interpolation] : Ts,
      d = this._getArrayFromAccessor(n);
    for (let f = 0, p = l.length; f < p; f++) {
      const x = new h(l[f] + "." + Wn[r.path], t.array, d, u);
      i.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(x), a.push(x)
    }
    return a
  }
  _getArrayFromAccessor(e) {
    let t = e.array;
    if (e.normalized) {
      const n = bo(t.constructor),
        i = new Float32Array(t.length);
      for (let r = 0, a = t.length; r < a; r++) i[r] = t[r] * n;
      t = i
    }
    return t
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function(n) {
      const i = this instanceof Is ? tv : pu;
      return new i(this.times, this.values, this.getValueSize() / 3, n)
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0
  }
}

function hv(s, e, t) {
  const n = e.attributes,
    i = new un;
  if (n.POSITION !== void 0) {
    const o = t.json.accessors[n.POSITION],
      l = o.min,
      c = o.max;
    if (l !== void 0 && c !== void 0) {
      if (i.set(new N(l[0], l[1], l[2]), new N(c[0], c[1], c[2])), o.normalized) {
        const h = bo(Bi[o.componentType]);
        i.min.multiplyScalar(h), i.max.multiplyScalar(h)
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return
    }
  } else return;
  const r = e.targets;
  if (r !== void 0) {
    const o = new N,
      l = new N;
    for (let c = 0, h = r.length; c < h; c++) {
      const u = r[c];
      if (u.POSITION !== void 0) {
        const d = t.json.accessors[u.POSITION],
          f = d.min,
          p = d.max;
        if (f !== void 0 && p !== void 0) {
          if (l.setX(Math.max(Math.abs(f[0]), Math.abs(p[0]))), l.setY(Math.max(Math.abs(f[1]), Math.abs(p[1]))), l.setZ(Math.max(Math.abs(f[2]), Math.abs(p[2]))), d.normalized) {
            const x = bo(Bi[d.componentType]);
            l.multiplyScalar(x)
          }
          o.max(l)
        } else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")
      }
    }
    i.expandByVector(o)
  }
  s.boundingBox = i;
  const a = new En;
  i.getCenter(a.center), a.radius = i.min.distanceTo(i.max) / 2, s.boundingSphere = a
}

function Kc(s, e, t) {
  const n = e.attributes,
    i = [];

  function r(a, o) {
    return t.getDependency("accessor", a).then(function(l) {
      s.setAttribute(o, l)
    })
  }
  for (const a in n) {
    const o = Eo[a] || a.toLowerCase();
    o in s.attributes || i.push(r(n[a], o))
  }
  if (e.indices !== void 0 && !s.index) {
    const a = t.getDependency("accessor", e.indices).then(function(o) {
      s.setIndex(o)
    });
    i.push(a)
  }
  return Qe.workingColorSpace !== Xt && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Qe.workingColorSpace}" not supported.`), gn(s, e), hv(s, e, t), Promise.all(i).then(function() {
    return e.targets !== void 0 ? sv(s, e.targets, t) : s
  })
}

function uv(s) {
  const e = new Set,
    t = new Set,
    n = new Set,
    i = new Set,
    r = new Set;
  s.traverse(a => {
    if (a instanceof At) {
      e.add(a.geometry);
      for (const o of Array.isArray(a.material) ? a.material : [a.material]) {
        t.add(o);
        for (const l of Object.values(o)) l instanceof vt && (n.add(l), typeof ImageBitmap < "u" && l.image instanceof ImageBitmap && i.add(l.image))
      }
      a instanceof Ah && r.add(a.skeleton)
    }
  });
  for (const a of e) a.dispose();
  for (const a of t) a.dispose();
  for (const a of n) a.dispose();
  for (const a of r) a.dispose();
  for (const a of i) a.close()
}

function dv(s) {
  return s.isMeshStandardMaterial ? s : null
}

function fv(s, e, t) {
  var o, l;
  const n = ((l = (o = s == null ? void 0 : s.attributes) == null ? void 0 : o.position) == null ? void 0 : l.count) ?? 0,
    i = (s == null ? void 0 : s.groups) ?? [];
  if (!i.length || t <= 1) return n;
  const r = s == null ? void 0 : s.index;
  let a = 0;
  for (const c of i) c.materialIndex === e && (a += c.count);
  return a || n / t
}

function pv(s) {
  const e = new Map,
    t = new Map,
    n = new Map,
    i = new Map,
    r = new Set;
  for (const h of Ra)
    for (const u of Ca[h]) u.mesh && r.add(u.mesh);
  s.traverse(h => {
    const u = h;
    if (!u.isMesh && !u.isSkinnedMesh) return;
    const f = (Array.isArray(u.material) ? u.material : [u.material]).map(p => p.clone());
    u.material = Array.isArray(u.material) ? f : f[0], f.forEach((p, x) => {
      const m = dv(p);
      if (!m || ((m.name === "Material.005" || m.name === "Material.006") && (m.roughness = m.name === "Material.005" ? .2 : .42, m.metalness = 0), e.set(m.name, m), r.has(u.name))) return;
      const g = fv(u.geometry, x, f.length);
      i.set(m.name, (i.get(m.name) ?? 0) + g)
    }), r.has(u.name) && t.set(u.name, u)
  });
  for (const h of Ra)
    for (const u of Ca[h]) u.mesh && n.set(u.mesh, h);
  const a = [...i.keys()].filter(h => {
      var u;
      return (u = e.get(h)) == null ? void 0 : u.map
    }),
    o = a.length ? a : [...i.keys()];
  let l = null,
    c = -1;
  for (const h of o) {
    const u = i.get(h);
    u > c && (c = u, l = h)
  }
  return {
    materials: e,
    accessories: t,
    slots: n,
    bodyMaterial: l,
    weights: Object.fromEntries(i)
  }
}

function mu(s, e) {
  const t = s.bodyMaterial ? s.materials.get(s.bodyMaterial) : void 0;
  t && gv(t, e);
  const n = new Set;
  for (const i of Ra) {
    const r = e.accessories[i],
      a = Ca[i].find(o => o.id === r);
    a != null && a.mesh && n.add(a.mesh)
  }
  for (const [i, r] of s.accessories) r.visible = n.has(i)
}
const Jn = new WeakMap,
  xs = new WeakMap,
  Nr = new WeakMap;

function gu(s) {
  const e = Nr.get(s);
  if (!e) return;
  Nr.delete(s);
  const t = (xs.get(e.texture) || 1) - 1;
  if (t > 0) {
    xs.set(e.texture, t);
    return
  }
  xs.delete(e.texture);
  const n = Jn.get(e.source);
  (n == null ? void 0 : n.get(e.key)) === e.texture && n.delete(e.key), n && !n.size && Jn.delete(e.source), e.texture !== e.source && e.texture.dispose()
}

function mv(s, e) {
  const t = Jn.get(s);
  if (t)
    for (const n of t.values()) n !== s && n !== e && n.dispose();
  Jn.delete(s)
}

function gv(s, e) {
  var r;
  const t = Eu(e.color),
    n = s.userData.lookSource ?? s.map;
  let i = !1;
  if (n != null && n.image) {
    s.userData.lookSource = n;
    let a = Jn.get(n);
    a || (a = new Map, Jn.set(n, a));
    let o = a.get(t);
    o || (o = vv(n, t), a.set(t, o)), s.map = o;
    const l = Nr.get(s);
    (!l || l.texture !== o || l.source !== n || l.key !== t) && (gu(s), Jn.has(n) || Jn.set(n, a), a.set(t, o), xs.set(o, (xs.get(o) || 0) + 1), Nr.set(s, {
      source: n,
      key: t,
      texture: o
    })), s.color.setRGB(1, 1, 1), i = !0
  } else s.color.setStyle(t);
  s.needsUpdate = !0, s.userData.look = {
    color: e.color,
    hex: t,
    recolored: i,
    mapUuid: ((r = s.map) == null ? void 0 : r.uuid) ?? null
  }
}

function _v(s) {
  const e = s;
  return {
    width: e.naturalWidth || e.width || 0,
    height: e.naturalHeight || e.height || 0
  }
}
const xv = 206 / 255;

function vv(s, e) {
  const {
    width: t,
    height: n
  } = _v(s.image);
  if (!t || !n || typeof document > "u") return s;
  const i = document.createElement("canvas");
  i.width = t, i.height = n;
  const r = i.getContext("2d");
  if (!r) return s;
  r.drawImage(s.image, 0, 0);
  const a = r.getImageData(0, 0, t, n),
    o = a.data,
    l = [1, 3, 5].map(h => parseInt(e.slice(h, h + 2), 16) / 255);
  for (let h = 0; h < o.length; h += 4) {
    const u = Math.max(o[h], o[h + 1], o[h + 2]) / 255,
      d = Math.min(1, u / xv);
    o[h] = Math.round(l[0] * d * 255), o[h + 1] = Math.round(l[1] * d * 255), o[h + 2] = Math.round(l[2] * d * 255)
  }
  r.putImageData(a, 0, 0);
  const c = new of(i);
  return c.colorSpace = s.colorSpace, c.flipY = s.flipY, c.wrapS = s.wrapS, c.wrapT = s.wrapT, c.magFilter = s.magFilter, c.minFilter = s.minFilter, c.anisotropy = s.anisotropy, c.offset.copy(s.offset), c.repeat.copy(s.repeat), c.center.copy(s.center), c.rotation = s.rotation, c.needsUpdate = !0, c
}
class Mv {
  constructor(e, t) {
    _l(this, "current");
    this.create = e, this.destroy = t
  }
  async acquire() {
    let e = this.current;
    if (!e) {
      e = {
        refs: 0,
        promise: Promise.resolve().then(() => this.create())
      };
      const r = e;
      e.promise = e.promise.then(a => (r.value = a, a)), this.current = e
    }
    e.refs++;
    const t = e;
    let n = !1;
    const i = () => {
      n || (n = !0, --t.refs === 0 && (this.current === t && (this.current = void 0), t.value !== void 0 && this.destroy(t.value)))
    };
    try {
      return {
        value: await t.promise,
        release: i
      }
    } catch (r) {
      throw i(), r
    }
  }
}

export { dracoDecoderWasmUrl, dracoWasmWrapperJsUrl, dracoDecoderJsUrl, Rx, Mv, Lx, vt, mv, uv, gu, uu, un, Ho, At, pv, mu, N, Pp, Vd, qi, Ls, Wt, jh, wh, gt, Yf, Ns, up, Mo, Ga, Er, wt, Dh, xn, fo, Ir, ci, ho, uo, Mr, _r, pi, Yn, Qo, Xn, xr, Bv, bt, $a, Ya, Hv, qa, Tr, Xa, Wa, en, Va, dh, Po, ui, ln, Jt, yn, hh, ch, Ss, Vi, Kn, ki, qf, ct, Qc, jc, eh, th, ih, sh, nh, vl, rh, on, Lv, Me, Fv, Ft, Sf, Vh, Wh, jt, Go, Ud, ah, Rt, Oa, Ha, co, ap, ut, fi, Vf, re, Mn, Ui, Ov, Fe, We, zi, Uv, Li, Du, Bu, ku, Cu, of, Xo, Zt, Ch, Dv, Rh, af, wo, zo, Pd, ot, ys, cs, gr, yr, Ts, Kt, Yh, Tn, Pv, mr, zv, yh, Xh, Cd, kv, dn, Br, qh, Ni, Gv, Yo, Qe, Nv, Iv, Lh, Ct, vn, Xt, ka, za, oo };

// Semantic aliases for the app layer (portraitLighting.js wrapper).
export { Rx as DRACOLoader };
export { Lx as GLTFLoader };
export { Mv as ResourcePool };
export { vt as Texture };
export { un as Box3 };
export { Ho as Bone };
export { At as Mesh };
export { Pp as AnimationMixer };
export { Vd as Scene };
export { qi as BoxGeometry };
export { Ls as MeshStandardMaterial };
export { jh as PointLight };
export { wh as InstancedMesh };
export { gt as Object3D };
export { Yf as MeshLambertMaterial };
export { Ns as CubeCameraOperator };
export { Mo as DirectionalLight };
