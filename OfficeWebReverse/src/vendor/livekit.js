// Recovered LiveKit 2.17.2 runtime. Keep vendor initialization in original order.
import { $a, $e, $f, $s, Ac, Bc, Cf, Co, Es, Fi, Gs, Ht, Im, It, Ja, Jf, Js, Kt, Li, Lr, Me, Nt, Oh, Pc, Qn, Rh, Rt, Sh, Te, Tr, Tt, Ui, Ul, Vm, We, Wh, Xe, Xh, Xm, Xt, Yh, Yl, Yn, Ze, Zm, Zn, Zo, _c, ac, ao, as, b, bc, bi, bm, bo, cc, dc, ds, em, eo, es, fm, fs, gc, hc, he, ic, ji, jr, km, lc, li, lm, ls, lu, oc, oe, oi, oo, os, pn, rc, ss, tc, tu, ua, uc, um, un, vc, vm, wm, ym, zl, zr, zt } from '../app/standalone.js';

function Fr(i, e, t) {
  const n = t ? "outbound-rtp" : "inbound-rtp",
    s = new Map;
  if (e === null) return s;
  const r = [];
  return i.forEach(a => {
    a.type === "track" && a.trackIdentifier === e.id && r.push(a)
  }), r.forEach(a => {
    i.forEach(o => {
      o.type === n && o.trackId === a.id && $n(i, o, s)
    })
  }), s
}

function Jm(i) {
  var e;
  const t = [],
    n = [],
    s = ft.parse((e = i.sdp) !== null && e !== void 0 ? e : "");
  let r = 0;
  return s.media.forEach(a => {
    var o;
    const c = Js(a.mid);
    a.type === "audio" && (a.rtp.some(d => d.codec === "opus" ? (r = d.payload, !0) : !1), !((o = a.rtcpFb) === null || o === void 0) && o.some(d => d.payload === r && d.type === "nack") && n.push(c), a.fmtp.some(d => d.payload === r ? (d.config.includes("sprop-stereo=1") && t.push(c), !0) : !1))
  }), {
    stereoMids: t,
    nackMids: n
  }
}

function gf(i) {
  return i.source === O.Source.ScreenShare || i.constraints.height && It(i.constraints.height) >= 1080 ? "maintain-resolution" : "balanced"
}

var br = {};


var jl = Object.defineProperty,
  Fl = (i, e, t) => e in i ? jl(i, e, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: t
  }) : i[e] = t,
  yr = (i, e, t) => Fl(i, typeof e != "symbol" ? e + "" : e, t);
class _e {
  constructor() {
    yr(this, "_locking"), yr(this, "_locks"), this._locking = Promise.resolve(), this._locks = 0
  }
  isLocked() {
    return this._locks > 0
  }
  lock() {
    this._locks += 1;
    let e;
    const t = new Promise(s => e = () => {
        this._locks -= 1, s()
      }),
      n = this._locking.then(() => e);
    return this._locking = this._locking.then(() => t), n
  }
}


const Bl = 34028234663852886e22,
  Vl = -34028234663852886e22,
  ql = 4294967295,
  Wl = 2147483647,
  Hl = -2147483648;

function Ri(i) {
  if (typeof i != "number") throw new Error("invalid int 32: " + typeof i);
  if (!Number.isInteger(i) || i > Wl || i < Hl) throw new Error("invalid int 32: " + i)
}

function Hn(i) {
  if (typeof i != "number") throw new Error("invalid uint 32: " + typeof i);
  if (!Number.isInteger(i) || i > ql || i < 0) throw new Error("invalid uint 32: " + i)
}

function $o(i) {
  if (typeof i != "number") throw new Error("invalid float 32: " + typeof i);
  if (Number.isFinite(i) && (i > Bl || i < Vl)) throw new Error("invalid float 32: " + i)
}
const Qo = Symbol("@bufbuild/protobuf/enum-type");

function Kl(i) {
  const e = i[Qo];
  return he(e, "missing enum type on enum object"), e
}

function Yo(i, e, t, n) {
  i[Qo] = Xo(e, t.map(s => ({
    no: s.no,
    name: s.name,
    localName: i[s.no]
  })))
}

function Xo(i, e, t) {
  const n = Object.create(null),
    s = Object.create(null),
    r = [];
  for (const a of e) {
    const o = Zo(a);
    r.push(o), n[a.name] = o, s[a.no] = o
  }
  return {
    typeName: i,
    values: r,
    findName(a) {
      return n[a]
    },
    findNumber(a) {
      return s[a]
    }
  }
}

function Gl(i, e, t) {
  const n = {};
  for (const s of e) {
    const r = Zo(s);
    n[r.localName] = r.no, n[r.no] = r.localName
  }
  return Yo(n, i, e), n
}




function Jl(i, e, t, n) {
  var s;
  const r = (s = n == null ? void 0 : n.localName) !== null && s !== void 0 ? s : e.substring(e.lastIndexOf(".") + 1),
    a = {
      [r]: function(o) {
        i.util.initFields(this), i.util.initPartial(o, this)
      }
    } [r];
  return Object.setPrototypeOf(a.prototype, new Es), Object.assign(a, {
    runtime: i,
    typeName: e,
    fields: i.util.newFieldList(t),
    fromBinary(o, c) {
      return new a().fromBinary(o, c)
    },
    fromJson(o, c) {
      return new a().fromJson(o, c)
    },
    fromJsonString(o, c) {
      return new a().fromJsonString(o, c)
    },
    equals(o, c) {
      return i.util.equals(a, o, c)
    }
  }), a
}




const _i = 4294967296;

function kr(i) {
  const e = i[0] === "-";
  e && (i = i.slice(1));
  const t = 1e6;
  let n = 0,
    s = 0;

  function r(a, o) {
    const c = Number(i.slice(a, o));
    s *= t, n = n * t + c, n >= _i && (s = s + (n / _i | 0), n = n % _i)
  }
  return r(-24, -18), r(-18, -12), r(-12, -6), r(-6), e ? ta(n, s) : Ps(n, s)
}

function $l(i, e) {
  let t = Ps(i, e);
  const n = t.hi & 2147483648;
  n && (t = ta(t.lo, t.hi));
  const s = ea(t.lo, t.hi);
  return n ? "-" + s : s
}

function ea(i, e) {
  if ({
      lo: i,
      hi: e
    } = Ql(i, e), e <= 2097151) return String(_i * e + i);
  const t = i & 16777215,
    n = (i >>> 24 | e << 8) & 16777215,
    s = e >> 16 & 65535;
  let r = t + n * 6777216 + s * 6710656,
    a = n + s * 8147497,
    o = s * 2;
  const c = 1e7;
  return r >= c && (a += Math.floor(r / c), r %= c), a >= c && (o += Math.floor(a / c), a %= c), o.toString() + Sr(a) + Sr(r)
}

function Ql(i, e) {
  return {
    lo: i >>> 0,
    hi: e >>> 0
  }
}

function Ps(i, e) {
  return {
    lo: i | 0,
    hi: e | 0
  }
}

function ta(i, e) {
  return e = ~e, i ? i = ~i + 1 : e += 1, Ps(i, e)
}
const Sr = i => {
  const e = String(i);
  return "0000000".slice(e.length) + e
};





function Xl() {
  const i = new DataView(new ArrayBuffer(8));
  if (typeof BigInt == "function" && typeof i.getBigInt64 == "function" && typeof i.getBigUint64 == "function" && typeof i.setBigInt64 == "function" && typeof i.setBigUint64 == "function" && (typeof process != "object" || typeof br != "object" || br.BUF_BIGINT_DISABLE !== "1")) {
    const s = BigInt("-9223372036854775808"),
      r = BigInt("9223372036854775807"),
      a = BigInt("0"),
      o = BigInt("18446744073709551615");
    return {
      zero: BigInt(0),
      supported: !0,
      parse(c) {
        const d = typeof c == "bigint" ? c : BigInt(c);
        if (d > r || d < s) throw new Error("int64 invalid: ".concat(c));
        return d
      },
      uParse(c) {
        const d = typeof c == "bigint" ? c : BigInt(c);
        if (d > o || d < a) throw new Error("uint64 invalid: ".concat(c));
        return d
      },
      enc(c) {
        return i.setBigInt64(0, this.parse(c), !0), {
          lo: i.getInt32(0, !0),
          hi: i.getInt32(4, !0)
        }
      },
      uEnc(c) {
        return i.setBigInt64(0, this.uParse(c), !0), {
          lo: i.getInt32(0, !0),
          hi: i.getInt32(4, !0)
        }
      },
      dec(c, d) {
        return i.setInt32(0, c, !0), i.setInt32(4, d, !0), i.getBigInt64(0, !0)
      },
      uDec(c, d) {
        return i.setInt32(0, c, !0), i.setInt32(4, d, !0), i.getBigUint64(0, !0)
      }
    }
  }
  const t = s => he(/^-?[0-9]+$/.test(s), "int64 invalid: ".concat(s)),
    n = s => he(/^[0-9]+$/.test(s), "uint64 invalid: ".concat(s));
  return {
    zero: "0",
    supported: !1,
    parse(s) {
      return typeof s != "string" && (s = s.toString()), t(s), s
    },
    uParse(s) {
      return typeof s != "string" && (s = s.toString()), n(s), s
    },
    enc(s) {
      return typeof s != "string" && (s = s.toString()), t(s), kr(s)
    },
    uEnc(s) {
      return typeof s != "string" && (s = s.toString()), n(s), kr(s)
    },
    dec(s, r) {
      return $l(s, r)
    },
    uDec(s, r) {
      return ea(s, r)
    }
  }
}
const de = Xl();
var L;
(function(i) {
  i[i.DOUBLE = 1] = "DOUBLE", i[i.FLOAT = 2] = "FLOAT", i[i.INT64 = 3] = "INT64", i[i.UINT64 = 4] = "UINT64", i[i.INT32 = 5] = "INT32", i[i.FIXED64 = 6] = "FIXED64", i[i.FIXED32 = 7] = "FIXED32", i[i.BOOL = 8] = "BOOL", i[i.STRING = 9] = "STRING", i[i.BYTES = 12] = "BYTES", i[i.UINT32 = 13] = "UINT32", i[i.SFIXED32 = 15] = "SFIXED32", i[i.SFIXED64 = 16] = "SFIXED64", i[i.SINT32 = 17] = "SINT32", i[i.SINT64 = 18] = "SINT64"
})(L || (L = {}));
var kt;
(function(i) {
  i[i.BIGINT = 0] = "BIGINT", i[i.STRING = 1] = "STRING"
})(kt || (kt = {}));

function ut(i, e, t) {
  if (e === t) return !0;
  if (i == L.BYTES) {
    if (!(e instanceof Uint8Array) || !(t instanceof Uint8Array) || e.length !== t.length) return !1;
    for (let n = 0; n < e.length; n++)
      if (e[n] !== t[n]) return !1;
    return !0
  }
  switch (i) {
    case L.UINT64:
    case L.FIXED64:
    case L.INT64:
    case L.SFIXED64:
    case L.SINT64:
      return e == t
  }
  return !1
}

function Jt(i, e) {
  switch (i) {
    case L.BOOL:
      return !1;
    case L.UINT64:
    case L.FIXED64:
    case L.INT64:
    case L.SFIXED64:
    case L.SINT64:
      return e == 0 ? de.zero : "0";
    case L.DOUBLE:
    case L.FLOAT:
      return 0;
    case L.BYTES:
      return new Uint8Array(0);
    case L.STRING:
      return "";
    default:
      return 0
  }
}

function ia(i, e) {
  switch (i) {
    case L.BOOL:
      return e === !1;
    case L.STRING:
      return e === "";
    case L.BYTES:
      return e instanceof Uint8Array && !e.byteLength;
    default:
      return e == 0
  }
}
var pe;
(function(i) {
  i[i.Varint = 0] = "Varint", i[i.Bit64 = 1] = "Bit64", i[i.LengthDelimited = 2] = "LengthDelimited", i[i.StartGroup = 3] = "StartGroup", i[i.EndGroup = 4] = "EndGroup", i[i.Bit32 = 5] = "Bit32"
})(pe || (pe = {}));
class Zl {
  constructor(e) {
    this.stack = [], this.textEncoder = e ?? new TextEncoder, this.chunks = [], this.buf = []
  }
  finish() {
    this.chunks.push(new Uint8Array(this.buf));
    let e = 0;
    for (let s = 0; s < this.chunks.length; s++) e += this.chunks[s].length;
    let t = new Uint8Array(e),
      n = 0;
    for (let s = 0; s < this.chunks.length; s++) t.set(this.chunks[s], n), n += this.chunks[s].length;
    return this.chunks = [], t
  }
  fork() {
    return this.stack.push({
      chunks: this.chunks,
      buf: this.buf
    }), this.chunks = [], this.buf = [], this
  }
  join() {
    let e = this.finish(),
      t = this.stack.pop();
    if (!t) throw new Error("invalid state, fork stack empty");
    return this.chunks = t.chunks, this.buf = t.buf, this.uint32(e.byteLength), this.raw(e)
  }
  tag(e, t) {
    return this.uint32((e << 3 | t) >>> 0)
  }
  raw(e) {
    return this.buf.length && (this.chunks.push(new Uint8Array(this.buf)), this.buf = []), this.chunks.push(e), this
  }
  uint32(e) {
    for (Hn(e); e > 127;) this.buf.push(e & 127 | 128), e = e >>> 7;
    return this.buf.push(e), this
  }
  int32(e) {
    return Ri(e), Tr(e, this.buf), this
  }
  bool(e) {
    return this.buf.push(e ? 1 : 0), this
  }
  bytes(e) {
    return this.uint32(e.byteLength), this.raw(e)
  }
  string(e) {
    let t = this.textEncoder.encode(e);
    return this.uint32(t.byteLength), this.raw(t)
  }
  float(e) {
    $o(e);
    let t = new Uint8Array(4);
    return new DataView(t.buffer).setFloat32(0, e, !0), this.raw(t)
  }
  double(e) {
    let t = new Uint8Array(8);
    return new DataView(t.buffer).setFloat64(0, e, !0), this.raw(t)
  }
  fixed32(e) {
    Hn(e);
    let t = new Uint8Array(4);
    return new DataView(t.buffer).setUint32(0, e, !0), this.raw(t)
  }
  sfixed32(e) {
    Ri(e);
    let t = new Uint8Array(4);
    return new DataView(t.buffer).setInt32(0, e, !0), this.raw(t)
  }
  sint32(e) {
    return Ri(e), e = (e << 1 ^ e >> 31) >>> 0, Tr(e, this.buf), this
  }
  sfixed64(e) {
    let t = new Uint8Array(8),
      n = new DataView(t.buffer),
      s = de.enc(e);
    return n.setInt32(0, s.lo, !0), n.setInt32(4, s.hi, !0), this.raw(t)
  }
  fixed64(e) {
    let t = new Uint8Array(8),
      n = new DataView(t.buffer),
      s = de.uEnc(e);
    return n.setInt32(0, s.lo, !0), n.setInt32(4, s.hi, !0), this.raw(t)
  }
  int64(e) {
    let t = de.enc(e);
    return pn(t.lo, t.hi, this.buf), this
  }
  sint64(e) {
    let t = de.enc(e),
      n = t.hi >> 31,
      s = t.lo << 1 ^ n,
      r = (t.hi << 1 | t.lo >>> 31) ^ n;
    return pn(s, r, this.buf), this
  }
  uint64(e) {
    let t = de.uEnc(e);
    return pn(t.lo, t.hi, this.buf), this
  }
}
class eu {
  constructor(e, t) {
    this.varint64 = zl, this.uint32 = Yl, this.buf = e, this.len = e.length, this.pos = 0, this.view = new DataView(e.buffer, e.byteOffset, e.byteLength), this.textDecoder = t ?? new TextDecoder
  }
  tag() {
    let e = this.uint32(),
      t = e >>> 3,
      n = e & 7;
    if (t <= 0 || n < 0 || n > 5) throw new Error("illegal tag: field no " + t + " wire type " + n);
    return [t, n]
  }
  skip(e, t) {
    let n = this.pos;
    switch (e) {
      case pe.Varint:
        for (; this.buf[this.pos++] & 128;);
        break;
      case pe.Bit64:
        this.pos += 4;
      case pe.Bit32:
        this.pos += 4;
        break;
      case pe.LengthDelimited:
        let s = this.uint32();
        this.pos += s;
        break;
      case pe.StartGroup:
        for (;;) {
          const [r, a] = this.tag();
          if (a === pe.EndGroup) {
            if (t !== void 0 && r !== t) throw new Error("invalid end group tag");
            break
          }
          this.skip(a, r)
        }
        break;
      default:
        throw new Error("cant skip wire type " + e)
    }
    return this.assertBounds(), this.buf.subarray(n, this.pos)
  }
  assertBounds() {
    if (this.pos > this.len) throw new RangeError("premature EOF")
  }
  int32() {
    return this.uint32() | 0
  }
  sint32() {
    let e = this.uint32();
    return e >>> 1 ^ -(e & 1)
  }
  int64() {
    return de.dec(...this.varint64())
  }
  uint64() {
    return de.uDec(...this.varint64())
  }
  sint64() {
    let [e, t] = this.varint64(), n = -(e & 1);
    return e = (e >>> 1 | (t & 1) << 31) ^ n, t = t >>> 1 ^ n, de.dec(e, t)
  }
  bool() {
    let [e, t] = this.varint64();
    return e !== 0 || t !== 0
  }
  fixed32() {
    return this.view.getUint32((this.pos += 4) - 4, !0)
  }
  sfixed32() {
    return this.view.getInt32((this.pos += 4) - 4, !0)
  }
  fixed64() {
    return de.uDec(this.sfixed32(), this.sfixed32())
  }
  sfixed64() {
    return de.dec(this.sfixed32(), this.sfixed32())
  }
  float() {
    return this.view.getFloat32((this.pos += 4) - 4, !0)
  }
  double() {
    return this.view.getFloat64((this.pos += 8) - 8, !0)
  }
  bytes() {
    let e = this.uint32(),
      t = this.pos;
    return this.pos += e, this.assertBounds(), this.buf.subarray(t, t + e)
  }
  string() {
    return this.textDecoder.decode(this.bytes())
  }
}



function na(i) {
  const e = i.field.localName,
    t = Object.create(null);
  return t[e] = iu(i), [t, () => t[e]]
}

function iu(i) {
  const e = i.field;
  if (e.repeated) return [];
  if (e.default !== void 0) return e.default;
  switch (e.kind) {
    case "enum":
      return e.T.values[0].no;
    case "scalar":
      return Jt(e.T, e.L);
    case "message":
      const t = e.T,
        n = new t;
      return t.fieldWrapper ? t.fieldWrapper.unwrapField(n) : n;
    case "map":
      throw "map fields are not allowed to be extensions"
  }
}

function nu(i, e) {
  if (!e.repeated && (e.kind == "enum" || e.kind == "scalar")) {
    for (let t = i.length - 1; t >= 0; --t)
      if (i[t].no == e.no) return [i[t]];
    return []
  }
  return i.filter(t => t.no === e.no)
}
let rt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""),
  nn = [];
for (let i = 0; i < rt.length; i++) nn[rt[i].charCodeAt(0)] = i;
nn[45] = rt.indexOf("+");
nn[95] = rt.indexOf("/");
const sa = {
  dec(i) {
    let e = i.length * 3 / 4;
    i[i.length - 2] == "=" ? e -= 2 : i[i.length - 1] == "=" && (e -= 1);
    let t = new Uint8Array(e),
      n = 0,
      s = 0,
      r, a = 0;
    for (let o = 0; o < i.length; o++) {
      if (r = nn[i.charCodeAt(o)], r === void 0) switch (i[o]) {
        case "=":
          s = 0;
        case `
`:
        case "\r":
        case "	":
        case " ":
          continue;
        default:
          throw Error("invalid base64 string.")
      }
      switch (s) {
        case 0:
          a = r, s = 1;
          break;
        case 1:
          t[n++] = a << 2 | (r & 48) >> 4, a = r, s = 2;
          break;
        case 2:
          t[n++] = (a & 15) << 4 | (r & 60) >> 2, a = r, s = 3;
          break;
        case 3:
          t[n++] = (a & 3) << 6 | r, s = 0;
          break
      }
    }
    if (s == 1) throw Error("invalid base64 string.");
    return t.subarray(0, n)
  },
  enc(i) {
    let e = "",
      t = 0,
      n, s = 0;
    for (let r = 0; r < i.length; r++) switch (n = i[r], t) {
      case 0:
        e += rt[n >> 2], s = (n & 3) << 4, t = 1;
        break;
      case 1:
        e += rt[s | n >> 4], s = (n & 15) << 2, t = 2;
        break;
      case 2:
        e += rt[s | n >> 6], e += rt[n & 63], t = 0;
        break
    }
    return t && (e += rt[s], e += "=", t == 1 && (e += "=")), e
  }
};

function su(i, e, t) {
  oa(e, i);
  const n = e.runtime.bin.makeReadOptions(t),
    s = nu(i.getType().runtime.bin.listUnknownFields(i), e.field),
    [r, a] = na(e);
  for (const o of s) e.runtime.bin.readField(r, n.readerFactory(o.data), e.field, o.wireType, n);
  return a()
}

function ru(i, e, t, n) {
  oa(e, i);
  const s = e.runtime.bin.makeReadOptions(n),
    r = e.runtime.bin.makeWriteOptions(n);
  if (ra(i, e)) {
    const d = i.getType().runtime.bin.listUnknownFields(i).filter(l => l.no != e.field.no);
    i.getType().runtime.bin.discardUnknownFields(i);
    for (const l of d) i.getType().runtime.bin.onUnknownField(i, l.no, l.wireType, l.data)
  }
  const a = r.writerFactory();
  let o = e.field;
  !o.opt && !o.repeated && (o.kind == "enum" || o.kind == "scalar") && (o = Object.assign(Object.assign({}, e.field), {
    opt: !0
  })), e.runtime.bin.writeField(o, t, a, r);
  const c = s.readerFactory(a.finish());
  for (; c.pos < c.len;) {
    const [d, l] = c.tag(), u = c.skip(l, d);
    i.getType().runtime.bin.onUnknownField(i, d, l, u)
  }
}

function ra(i, e) {
  const t = i.getType();
  return e.extendee.typeName === t.typeName && !!t.runtime.bin.listUnknownFields(i).find(n => n.no == e.field.no)
}

function oa(i, e) {
  he(i.extendee.typeName == e.getType().typeName, "extension ".concat(i.typeName, " can only be applied to message ").concat(i.extendee.typeName))
}

function aa(i, e) {
  const t = i.localName;
  if (i.repeated) return e[t].length > 0;
  if (i.oneof) return e[i.oneof.localName].case === t;
  switch (i.kind) {
    case "enum":
    case "scalar":
      return i.opt || i.req ? e[t] !== void 0 : i.kind == "enum" ? e[t] !== i.T.values[0].no : !ia(i.T, e[t]);
    case "message":
      return e[t] !== void 0;
    case "map":
      return Object.keys(e[t]).length > 0
  }
}

function Cr(i, e) {
  const t = i.localName,
    n = !i.opt && !i.req;
  if (i.repeated) e[t] = [];
  else if (i.oneof) e[i.oneof.localName] = {
    case: void 0
  };
  else switch (i.kind) {
    case "map":
      e[t] = {};
      break;
    case "enum":
      e[t] = n ? i.T.values[0].no : void 0;
      break;
    case "scalar":
      e[t] = n ? Jt(i.T, i.L) : void 0;
      break;
    case "message":
      e[t] = void 0;
      break
  }
}

function ot(i, e) {
  if (i === null || typeof i != "object" || !Object.getOwnPropertyNames(Es.prototype).every(n => n in i && typeof i[n] == "function")) return !1;
  const t = i.getType();
  return t === null || typeof t != "function" || !("typeName" in t) || typeof t.typeName != "string" ? !1 : e === void 0 ? !0 : t.typeName == e.typeName
}

function ca(i, e) {
  return ot(e) || !i.fieldWrapper ? e : i.fieldWrapper.wrapField(e)
}
L.DOUBLE, L.FLOAT, L.INT64, L.UINT64, L.INT32, L.UINT32, L.BOOL, L.STRING, L.BYTES;
const wr = {
    ignoreUnknownFields: !1
  },
  Er = {
    emitDefaultValues: !1,
    enumAsInteger: !1,
    useProtoFieldName: !1,
    prettySpaces: 0
  };

function ou(i) {
  return i ? Object.assign(Object.assign({}, wr), i) : wr
}

function au(i) {
  return i ? Object.assign(Object.assign({}, Er), i) : Er
}
const Vi = Symbol(),
  Ii = Symbol();

function cu() {
  return {
    makeReadOptions: ou,
    makeWriteOptions: au,
    readMessage(i, e, t, n) {
      if (e == null || Array.isArray(e) || typeof e != "object") throw new Error("cannot decode message ".concat(i.typeName, " from JSON: ").concat($e(e)));
      n = n ?? new i;
      const s = new Map,
        r = t.typeRegistry;
      for (const [a, o] of Object.entries(e)) {
        const c = i.fields.findJsonName(a);
        if (c) {
          if (c.oneof) {
            if (o === null && c.kind == "scalar") continue;
            const d = s.get(c.oneof);
            if (d !== void 0) throw new Error("cannot decode message ".concat(i.typeName, ' from JSON: multiple keys for oneof "').concat(c.oneof.name, '" present: "').concat(d, '", "').concat(a, '"'));
            s.set(c.oneof, a)
          }
          Pr(n, o, c, t, i)
        } else {
          let d = !1;
          if (r != null && r.findExtension && a.startsWith("[") && a.endsWith("]")) {
            const l = r.findExtension(a.substring(1, a.length - 1));
            if (l && l.extendee.typeName == i.typeName) {
              d = !0;
              const [u, h] = na(l);
              Pr(u, o, l.field, t, l), ru(n, l, h(), t)
            }
          }
          if (!d && !t.ignoreUnknownFields) throw new Error("cannot decode message ".concat(i.typeName, ' from JSON: key "').concat(a, '" is unknown'))
        }
      }
      return n
    },
    writeMessage(i, e) {
      const t = i.getType(),
        n = {};
      let s;
      try {
        for (s of t.fields.byNumber()) {
          if (!aa(s, i)) {
            if (s.req) throw "required field not set";
            if (!e.emitDefaultValues || !lu(s)) continue
          }
          const a = s.oneof ? i[s.oneof.localName].value : i[s.localName],
            o = Rr(s, a, e);
          o !== void 0 && (n[e.useProtoFieldName ? s.name : s.jsonName] = o)
        }
        const r = e.typeRegistry;
        if (r != null && r.findExtensionFor)
          for (const a of t.runtime.bin.listUnknownFields(i)) {
            const o = r.findExtensionFor(t.typeName, a.no);
            if (o && ra(i, o)) {
              const c = su(i, o, e),
                d = Rr(o.field, c, e);
              d !== void 0 && (n[o.field.jsonName] = d)
            }
          }
      } catch (r) {
        const a = s ? "cannot encode field ".concat(t.typeName, ".").concat(s.name, " to JSON") : "cannot encode message ".concat(t.typeName, " to JSON"),
          o = r instanceof Error ? r.message : String(r);
        throw new Error(a + (o.length > 0 ? ": ".concat(o) : ""))
      }
      return n
    },
    readScalar(i, e, t) {
      return ci(i, e, t ?? kt.BIGINT, !0)
    },
    writeScalar(i, e, t) {
      if (e !== void 0 && (t || ia(i, e))) return xi(i, e)
    },
    debug: $e
  }
}



function Pr(i, e, t, n, s) {
  let r = t.localName;
  if (t.repeated) {
    if (he(t.kind != "map"), e === null) return;
    if (!Array.isArray(e)) throw new Error("cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(e)));
    const a = i[r];
    for (const o of e) {
      if (o === null) throw new Error("cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(o)));
      switch (t.kind) {
        case "message":
          a.push(t.T.fromJson(o, n));
          break;
        case "enum":
          const c = gn(t.T, o, n.ignoreUnknownFields, !0);
          c !== Ii && a.push(c);
          break;
        case "scalar":
          try {
            a.push(ci(t.T, o, t.L, !0))
          } catch (d) {
            let l = "cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(o));
            throw d instanceof Error && d.message.length > 0 && (l += ": ".concat(d.message)), new Error(l)
          }
          break
      }
    }
  } else if (t.kind == "map") {
    if (e === null) return;
    if (typeof e != "object" || Array.isArray(e)) throw new Error("cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(e)));
    const a = i[r];
    for (const [o, c] of Object.entries(e)) {
      if (c === null) throw new Error("cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: map value null"));
      let d;
      try {
        d = du(t.K, o)
      } catch (l) {
        let u = "cannot decode map key for field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(e));
        throw l instanceof Error && l.message.length > 0 && (u += ": ".concat(l.message)), new Error(u)
      }
      switch (t.V.kind) {
        case "message":
          a[d] = t.V.T.fromJson(c, n);
          break;
        case "enum":
          const l = gn(t.V.T, c, n.ignoreUnknownFields, !0);
          l !== Ii && (a[d] = l);
          break;
        case "scalar":
          try {
            a[d] = ci(t.V.T, c, kt.BIGINT, !0)
          } catch (u) {
            let h = "cannot decode map value for field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(e));
            throw u instanceof Error && u.message.length > 0 && (h += ": ".concat(u.message)), new Error(h)
          }
          break
      }
    }
  } else switch (t.oneof && (i = i[t.oneof.localName] = {
      case: r
    }, r = "value"), t.kind) {
    case "message":
      const a = t.T;
      if (e === null && a.typeName != "google.protobuf.Value") return;
      let o = i[r];
      ot(o) ? o.fromJson(e, n) : (i[r] = o = a.fromJson(e, n), a.fieldWrapper && !t.oneof && (i[r] = a.fieldWrapper.unwrapField(o)));
      break;
    case "enum":
      const c = gn(t.T, e, n.ignoreUnknownFields, !1);
      switch (c) {
        case Vi:
          Cr(t, i);
          break;
        case Ii:
          break;
        default:
          i[r] = c;
          break
      }
      break;
    case "scalar":
      try {
        const d = ci(t.T, e, t.L, !1);
        switch (d) {
          case Vi:
            Cr(t, i);
            break;
          default:
            i[r] = d;
            break
        }
      } catch (d) {
        let l = "cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(e));
        throw d instanceof Error && d.message.length > 0 && (l += ": ".concat(d.message)), new Error(l)
      }
      break
  }
}

function du(i, e) {
  if (i === L.BOOL) switch (e) {
    case "true":
      e = !0;
      break;
    case "false":
      e = !1;
      break
  }
  return ci(i, e, kt.BIGINT, !0).toString()
}

function ci(i, e, t, n) {
  if (e === null) return n ? Jt(i, t) : Vi;
  switch (i) {
    case L.DOUBLE:
    case L.FLOAT:
      if (e === "NaN") return Number.NaN;
      if (e === "Infinity") return Number.POSITIVE_INFINITY;
      if (e === "-Infinity") return Number.NEGATIVE_INFINITY;
      if (e === "" || typeof e == "string" && e.trim().length !== e.length || typeof e != "string" && typeof e != "number") break;
      const s = Number(e);
      if (Number.isNaN(s) || !Number.isFinite(s)) break;
      return i == L.FLOAT && $o(s), s;
    case L.INT32:
    case L.FIXED32:
    case L.SFIXED32:
    case L.SINT32:
    case L.UINT32:
      let r;
      if (typeof e == "number" ? r = e : typeof e == "string" && e.length > 0 && e.trim().length === e.length && (r = Number(e)), r === void 0) break;
      return i == L.UINT32 || i == L.FIXED32 ? Hn(r) : Ri(r), r;
    case L.INT64:
    case L.SFIXED64:
    case L.SINT64:
      if (typeof e != "number" && typeof e != "string") break;
      const a = de.parse(e);
      return t ? a.toString() : a;
    case L.FIXED64:
    case L.UINT64:
      if (typeof e != "number" && typeof e != "string") break;
      const o = de.uParse(e);
      return t ? o.toString() : o;
    case L.BOOL:
      if (typeof e != "boolean") break;
      return e;
    case L.STRING:
      if (typeof e != "string") break;
      try {
        encodeURIComponent(e)
      } catch {
        throw new Error("invalid UTF8")
      }
      return e;
    case L.BYTES:
      if (e === "") return new Uint8Array(0);
      if (typeof e != "string") break;
      return sa.dec(e)
  }
  throw new Error
}

function gn(i, e, t, n) {
  if (e === null) return i.typeName == "google.protobuf.NullValue" ? 0 : n ? i.values[0].no : Vi;
  switch (typeof e) {
    case "number":
      if (Number.isInteger(e)) return e;
      break;
    case "string":
      const s = i.findName(e);
      if (s !== void 0) return s.no;
      if (t) return Ii;
      break
  }
  throw new Error("cannot decode enum ".concat(i.typeName, " from JSON: ").concat($e(e)))
}



function Rr(i, e, t) {
  if (i.kind == "map") {
    he(typeof e == "object" && e != null);
    const n = {},
      s = Object.entries(e);
    switch (i.V.kind) {
      case "scalar":
        for (const [a, o] of s) n[a.toString()] = xi(i.V.T, o);
        break;
      case "message":
        for (const [a, o] of s) n[a.toString()] = o.toJson(t);
        break;
      case "enum":
        const r = i.V.T;
        for (const [a, o] of s) n[a.toString()] = vn(r, o, t.enumAsInteger);
        break
    }
    return t.emitDefaultValues || s.length > 0 ? n : void 0
  }
  if (i.repeated) {
    he(Array.isArray(e));
    const n = [];
    switch (i.kind) {
      case "scalar":
        for (let s = 0; s < e.length; s++) n.push(xi(i.T, e[s]));
        break;
      case "enum":
        for (let s = 0; s < e.length; s++) n.push(vn(i.T, e[s], t.enumAsInteger));
        break;
      case "message":
        for (let s = 0; s < e.length; s++) n.push(e[s].toJson(t));
        break
    }
    return t.emitDefaultValues || n.length > 0 ? n : void 0
  }
  switch (i.kind) {
    case "scalar":
      return xi(i.T, e);
    case "enum":
      return vn(i.T, e, t.enumAsInteger);
    case "message":
      return ca(i.T, e).toJson(t)
  }
}

function vn(i, e, t) {
  var n;
  if (he(typeof e == "number"), i.typeName == "google.protobuf.NullValue") return null;
  if (t) return e;
  const s = i.findNumber(e);
  return (n = s == null ? void 0 : s.name) !== null && n !== void 0 ? n : e
}

function xi(i, e) {
  switch (i) {
    case L.INT32:
    case L.SFIXED32:
    case L.SINT32:
    case L.FIXED32:
    case L.UINT32:
      return he(typeof e == "number"), e;
    case L.FLOAT:
    case L.DOUBLE:
      return he(typeof e == "number"), Number.isNaN(e) ? "NaN" : e === Number.POSITIVE_INFINITY ? "Infinity" : e === Number.NEGATIVE_INFINITY ? "-Infinity" : e;
    case L.STRING:
      return he(typeof e == "string"), e;
    case L.BOOL:
      return he(typeof e == "boolean"), e;
    case L.UINT64:
    case L.FIXED64:
    case L.INT64:
    case L.SFIXED64:
    case L.SINT64:
      return he(typeof e == "bigint" || typeof e == "string" || typeof e == "number"), e.toString();
    case L.BYTES:
      return he(e instanceof Uint8Array), sa.enc(e)
  }
}
const Lt = Symbol("@bufbuild/protobuf/unknown-fields"),
  _r = {
    readUnknownFields: !0,
    readerFactory: i => new eu(i)
  },
  Ir = {
    writeUnknownFields: !0,
    writerFactory: () => new Zl
  };

function uu(i) {
  return i ? Object.assign(Object.assign({}, _r), i) : _r
}

function hu(i) {
  return i ? Object.assign(Object.assign({}, Ir), i) : Ir
}

function mu() {
  return {
    makeReadOptions: uu,
    makeWriteOptions: hu,
    listUnknownFields(i) {
      var e;
      return (e = i[Lt]) !== null && e !== void 0 ? e : []
    },
    discardUnknownFields(i) {
      delete i[Lt]
    },
    writeUnknownFields(i, e) {
      const n = i[Lt];
      if (n)
        for (const s of n) e.tag(s.no, s.wireType).raw(s.data)
    },
    onUnknownField(i, e, t, n) {
      const s = i;
      Array.isArray(s[Lt]) || (s[Lt] = []), s[Lt].push({
        no: e,
        wireType: t,
        data: n
      })
    },
    readMessage(i, e, t, n, s) {
      const r = i.getType(),
        a = s ? e.len : e.pos + t;
      let o, c;
      for (; e.pos < a && ([o, c] = e.tag(), !(s === !0 && c == pe.EndGroup));) {
        const d = r.fields.find(o);
        if (!d) {
          const l = e.skip(c, o);
          n.readUnknownFields && this.onUnknownField(i, o, c, l);
          continue
        }
        xr(i, e, d, c, n)
      }
      if (s && (c != pe.EndGroup || o !== t)) throw new Error("invalid end group tag")
    },
    readField: xr,
    writeMessage(i, e, t) {
      const n = i.getType();
      for (const s of n.fields.byNumber()) {
        if (!aa(s, i)) {
          if (s.req) throw new Error("cannot encode field ".concat(n.typeName, ".").concat(s.name, " to binary: required field not set"));
          continue
        }
        const r = s.oneof ? i[s.oneof.localName].value : i[s.localName];
        Mr(s, r, e, t)
      }
      return t.writeUnknownFields && this.writeUnknownFields(i, e), e
    },
    writeField(i, e, t, n) {
      e !== void 0 && Mr(i, e, t, n)
    }
  }
}

function xr(i, e, t, n, s) {
  let {
    repeated: r,
    localName: a
  } = t;
  switch (t.oneof && (i = i[t.oneof.localName], i.case != a && delete i.value, i.case = a, a = "value"), t.kind) {
    case "scalar":
    case "enum":
      const o = t.kind == "enum" ? L.INT32 : t.T;
      let c = qi;
      if (t.kind == "scalar" && t.L > 0 && (c = pu), r) {
        let h = i[a];
        if (n == pe.LengthDelimited && o != L.STRING && o != L.BYTES) {
          let f = e.uint32() + e.pos;
          for (; e.pos < f;) h.push(c(e, o))
        } else h.push(c(e, o))
      } else i[a] = c(e, o);
      break;
    case "message":
      const d = t.T;
      r ? i[a].push(Mi(e, new d, s, t)) : ot(i[a]) ? Mi(e, i[a], s, t) : (i[a] = Mi(e, new d, s, t), d.fieldWrapper && !t.oneof && !t.repeated && (i[a] = d.fieldWrapper.unwrapField(i[a])));
      break;
    case "map":
      let [l, u] = fu(t, e, s);
      i[a][l] = u;
      break
  }
}

function Mi(i, e, t, n) {
  const s = e.getType().runtime.bin,
    r = n == null ? void 0 : n.delimited;
  return s.readMessage(e, i, r ? n.no : i.uint32(), t, r), e
}

function fu(i, e, t) {
  const n = e.uint32(),
    s = e.pos + n;
  let r, a;
  for (; e.pos < s;) {
    const [o] = e.tag();
    switch (o) {
      case 1:
        r = qi(e, i.K);
        break;
      case 2:
        switch (i.V.kind) {
          case "scalar":
            a = qi(e, i.V.T);
            break;
          case "enum":
            a = e.int32();
            break;
          case "message":
            a = Mi(e, new i.V.T, t, void 0);
            break
        }
        break
    }
  }
  if (r === void 0 && (r = Jt(i.K, kt.BIGINT)), typeof r != "string" && typeof r != "number" && (r = r.toString()), a === void 0) switch (i.V.kind) {
    case "scalar":
      a = Jt(i.V.T, kt.BIGINT);
      break;
    case "enum":
      a = i.V.T.values[0].no;
      break;
    case "message":
      a = new i.V.T;
      break
  }
  return [r, a]
}

function pu(i, e) {
  const t = qi(i, e);
  return typeof t == "bigint" ? t.toString() : t
}

function qi(i, e) {
  switch (e) {
    case L.STRING:
      return i.string();
    case L.BOOL:
      return i.bool();
    case L.DOUBLE:
      return i.double();
    case L.FLOAT:
      return i.float();
    case L.INT32:
      return i.int32();
    case L.INT64:
      return i.int64();
    case L.UINT64:
      return i.uint64();
    case L.FIXED64:
      return i.fixed64();
    case L.BYTES:
      return i.bytes();
    case L.FIXED32:
      return i.fixed32();
    case L.SFIXED32:
      return i.sfixed32();
    case L.SFIXED64:
      return i.sfixed64();
    case L.SINT64:
      return i.sint64();
    case L.UINT32:
      return i.uint32();
    case L.SINT32:
      return i.sint32()
  }
}

function Mr(i, e, t, n) {
  he(e !== void 0);
  const s = i.repeated;
  switch (i.kind) {
    case "scalar":
    case "enum":
      let r = i.kind == "enum" ? L.INT32 : i.T;
      if (s)
        if (he(Array.isArray(e)), i.packed) vu(t, r, i.no, e);
        else
          for (const a of e) di(t, r, i.no, a);
      else di(t, r, i.no, e);
      break;
    case "message":
      if (s) {
        he(Array.isArray(e));
        for (const a of e) Or(t, n, i, a)
      } else Or(t, n, i, e);
      break;
    case "map":
      he(typeof e == "object" && e != null);
      for (const [a, o] of Object.entries(e)) gu(t, n, i, a, o);
      break
  }
}

function gu(i, e, t, n, s) {
  i.tag(t.no, pe.LengthDelimited), i.fork();
  let r = n;
  switch (t.K) {
    case L.INT32:
    case L.FIXED32:
    case L.UINT32:
    case L.SFIXED32:
    case L.SINT32:
      r = Number.parseInt(n);
      break;
    case L.BOOL:
      he(n == "true" || n == "false"), r = n == "true";
      break
  }
  switch (di(i, t.K, 1, r), t.V.kind) {
    case "scalar":
      di(i, t.V.T, 2, s);
      break;
    case "enum":
      di(i, L.INT32, 2, s);
      break;
    case "message":
      he(s !== void 0), i.tag(2, pe.LengthDelimited).bytes(s.toBinary(e));
      break
  }
  i.join()
}

function Or(i, e, t, n) {
  const s = ca(t.T, n);
  t.delimited ? i.tag(t.no, pe.StartGroup).raw(s.toBinary(e)).tag(t.no, pe.EndGroup) : i.tag(t.no, pe.LengthDelimited).bytes(s.toBinary(e))
}

function di(i, e, t, n) {
  he(n !== void 0);
  let [s, r] = da(e);
  i.tag(t, s)[r](n)
}

function vu(i, e, t, n) {
  if (!n.length) return;
  i.tag(t, pe.LengthDelimited).fork();
  let [, s] = da(e);
  for (let r = 0; r < n.length; r++) i[s](n[r]);
  i.join()
}

function da(i) {
  let e = pe.Varint;
  switch (i) {
    case L.BYTES:
    case L.STRING:
      e = pe.LengthDelimited;
      break;
    case L.DOUBLE:
    case L.FIXED64:
    case L.SFIXED64:
      e = pe.Bit64;
      break;
    case L.FIXED32:
    case L.SFIXED32:
    case L.FLOAT:
      e = pe.Bit32;
      break
  }
  const t = L[i].toLowerCase();
  return [e, t]
}

function bu() {
  return {
    setEnumType: Yo,
    initPartial(i, e) {
      if (i === void 0) return;
      const t = e.getType();
      for (const n of t.fields.byMember()) {
        const s = n.localName,
          r = e,
          a = i;
        if (a[s] != null) switch (n.kind) {
          case "oneof":
            const o = a[s].case;
            if (o === void 0) continue;
            const c = n.findField(o);
            let d = a[s].value;
            c && c.kind == "message" && !ot(d, c.T) ? d = new c.T(d) : c && c.kind === "scalar" && c.T === L.BYTES && (d = Xt(d)), r[s] = {
              case: o,
              value: d
            };
            break;
          case "scalar":
          case "enum":
            let l = a[s];
            n.T === L.BYTES && (l = n.repeated ? l.map(Xt) : Xt(l)), r[s] = l;
            break;
          case "map":
            switch (n.V.kind) {
              case "scalar":
              case "enum":
                if (n.V.T === L.BYTES)
                  for (const [m, f] of Object.entries(a[s])) r[s][m] = Xt(f);
                else Object.assign(r[s], a[s]);
                break;
              case "message":
                const h = n.V.T;
                for (const m of Object.keys(a[s])) {
                  let f = a[s][m];
                  h.fieldWrapper || (f = new h(f)), r[s][m] = f
                }
                break
            }
            break;
          case "message":
            const u = n.T;
            if (n.repeated) r[s] = a[s].map(h => ot(h, u) ? h : new u(h));
            else {
              const h = a[s];
              u.fieldWrapper ? u.typeName === "google.protobuf.BytesValue" ? r[s] = Xt(h) : r[s] = h : r[s] = ot(h, u) ? h : new u(h)
            }
            break
        }
      }
    },
    equals(i, e, t) {
      return e === t ? !0 : !e || !t ? !1 : i.fields.byMember().every(n => {
        const s = e[n.localName],
          r = t[n.localName];
        if (n.repeated) {
          if (s.length !== r.length) return !1;
          switch (n.kind) {
            case "message":
              return s.every((a, o) => n.T.equals(a, r[o]));
            case "scalar":
              return s.every((a, o) => ut(n.T, a, r[o]));
            case "enum":
              return s.every((a, o) => ut(L.INT32, a, r[o]))
          }
          throw new Error("repeated cannot contain ".concat(n.kind))
        }
        switch (n.kind) {
          case "message":
            let a = s,
              o = r;
            return n.T.fieldWrapper && (a !== void 0 && !ot(a) && (a = n.T.fieldWrapper.wrapField(a)), o !== void 0 && !ot(o) && (o = n.T.fieldWrapper.wrapField(o))), n.T.equals(a, o);
          case "enum":
            return ut(L.INT32, s, r);
          case "scalar":
            return ut(n.T, s, r);
          case "oneof":
            if (s.case !== r.case) return !1;
            const c = n.findField(s.case);
            if (c === void 0) return !0;
            switch (c.kind) {
              case "message":
                return c.T.equals(s.value, r.value);
              case "enum":
                return ut(L.INT32, s.value, r.value);
              case "scalar":
                return ut(c.T, s.value, r.value)
            }
            throw new Error("oneof cannot contain ".concat(c.kind));
          case "map":
            const d = Object.keys(s).concat(Object.keys(r));
            switch (n.V.kind) {
              case "message":
                const l = n.V.T;
                return d.every(h => l.equals(s[h], r[h]));
              case "enum":
                return d.every(h => ut(L.INT32, s[h], r[h]));
              case "scalar":
                const u = n.V.T;
                return d.every(h => ut(u, s[h], r[h]))
            }
            break
        }
      })
    },
    clone(i) {
      const e = i.getType(),
        t = new e,
        n = t;
      for (const s of e.fields.byMember()) {
        const r = i[s.localName];
        let a;
        if (s.repeated) a = r.map(Ti);
        else if (s.kind == "map") {
          a = n[s.localName];
          for (const [o, c] of Object.entries(r)) a[o] = Ti(c)
        } else s.kind == "oneof" ? a = s.findField(r.case) ? {
          case: r.case,
          value: Ti(r.value)
        } : {
          case: void 0
        } : a = Ti(r);
        n[s.localName] = a
      }
      for (const s of e.runtime.bin.listUnknownFields(i)) e.runtime.bin.onUnknownField(n, s.no, s.wireType, s.data);
      return t
    }
  }
}

function Ti(i) {
  if (i === void 0) return i;
  if (ot(i)) return i.clone();
  if (i instanceof Uint8Array) {
    const e = new Uint8Array(i.byteLength);
    return e.set(i), e
  }
  return i
}



function yu(i, e, t) {
  return {
    syntax: i,
    json: cu(),
    bin: mu(),
    util: Object.assign(Object.assign({}, bu()), {
      newFieldList: e,
      initFields: t
    }),
    makeMessageType(n, s, r) {
      return Jl(this, n, s, r)
    },
    makeEnum: Gl,
    makeEnumType: Xo,
    getEnumType: Kl,
    makeExtension(n, s, r) {
      return tu(this, n, s, r)
    }
  }
}
class ku {
  constructor(e, t) {
    this._fields = e, this._normalizer = t
  }
  findJsonName(e) {
    if (!this.jsonNames) {
      const t = {};
      for (const n of this.list()) t[n.jsonName] = t[n.name] = n;
      this.jsonNames = t
    }
    return this.jsonNames[e]
  }
  find(e) {
    if (!this.numbers) {
      const t = {};
      for (const n of this.list()) t[n.no] = n;
      this.numbers = t
    }
    return this.numbers[e]
  }
  list() {
    return this.all || (this.all = this._normalizer(this._fields)), this.all
  }
  byNumber() {
    return this.numbersAsc || (this.numbersAsc = this.list().concat().sort((e, t) => e.no - t.no)), this.numbersAsc
  }
  byMember() {
    if (!this.members) {
      this.members = [];
      const e = this.members;
      let t;
      for (const n of this.list()) n.oneof ? n.oneof !== t && (t = n.oneof, e.push(t)) : e.push(n)
    }
    return this.members
  }
}

function la(i, e) {
  const t = ua(i);
  return e ? t : Pu(Eu(t))
}

function Su(i) {
  return la(i, !1)
}
const Tu = ua;


const Cu = new Set(["constructor", "toString", "toJSON", "valueOf"]),
  wu = new Set(["getType", "clone", "equals", "fromBinary", "fromJson", "fromJsonString", "toBinary", "toJson", "toJsonString", "toObject"]),
  ha = i => "".concat(i, "$"),
  Eu = i => wu.has(i) ? ha(i) : i,
  Pu = i => Cu.has(i) ? ha(i) : i;
class Ru {
  constructor(e) {
    this.kind = "oneof", this.repeated = !1, this.packed = !1, this.opt = !1, this.req = !1, this.default = void 0, this.fields = [], this.name = e, this.localName = Su(e)
  }
  addField(e) {
    he(e.oneof === this, "field ".concat(e.name, " not one of ").concat(this.name)), this.fields.push(e)
  }
  findField(e) {
    if (!this._lookup) {
      this._lookup = Object.create(null);
      for (let t = 0; t < this.fields.length; t++) this._lookup[this.fields[t].localName] = this.fields[t]
    }
    return this._lookup[e]
  }
}

function _u(i, e) {
  var t, n, s, r, a, o;
  const c = [];
  let d;
  for (const l of typeof i == "function" ? i() : i) {
    const u = l;
    if (u.localName = la(l.name, l.oneof !== void 0), u.jsonName = (t = l.jsonName) !== null && t !== void 0 ? t : Tu(l.name), u.repeated = (n = l.repeated) !== null && n !== void 0 ? n : !1, l.kind == "scalar" && (u.L = (s = l.L) !== null && s !== void 0 ? s : kt.BIGINT), u.delimited = (r = l.delimited) !== null && r !== void 0 ? r : !1, u.req = (a = l.req) !== null && a !== void 0 ? a : !1, u.opt = (o = l.opt) !== null && o !== void 0 ? o : !1, l.packed === void 0 && (u.packed = l.kind == "enum" || l.kind == "scalar" && l.T != L.BYTES && l.T != L.STRING), l.oneof !== void 0) {
      const h = typeof l.oneof == "string" ? l.oneof : l.oneof.name;
      (!d || d.name != h) && (d = new Ru(h)), u.oneof = d, d.addField(u)
    }
    c.push(u)
  }
  return c
}
const R = yu("proto3", i => new ku(i, e => _u(e)), i => {
  for (const e of i.getType().fields.byMember()) {
    if (e.opt) continue;
    const t = e.localName,
      n = i;
    if (e.repeated) {
      n[t] = [];
      continue
    }
    switch (e.kind) {
      case "oneof":
        n[t] = {
          case: void 0
        };
        break;
      case "enum":
        n[t] = 0;
        break;
      case "map":
        n[t] = {};
        break;
      case "scalar":
        n[t] = Jt(e.T, e.L);
        break
    }
  }
});
class xe extends Es {
  constructor(e) {
    super(), this.seconds = de.zero, this.nanos = 0, R.util.initPartial(e, this)
  }
  fromJson(e, t) {
    if (typeof e != "string") throw new Error("cannot decode google.protobuf.Timestamp from JSON: ".concat(R.json.debug(e)));
    const n = e.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:Z|\.([0-9]{3,9})Z|([+-][0-9][0-9]:[0-9][0-9]))$/);
    if (!n) throw new Error("cannot decode google.protobuf.Timestamp from JSON: invalid RFC 3339 string");
    const s = Date.parse(n[1] + "-" + n[2] + "-" + n[3] + "T" + n[4] + ":" + n[5] + ":" + n[6] + (n[8] ? n[8] : "Z"));
    if (Number.isNaN(s)) throw new Error("cannot decode google.protobuf.Timestamp from JSON: invalid RFC 3339 string");
    if (s < Date.parse("0001-01-01T00:00:00Z") || s > Date.parse("9999-12-31T23:59:59Z")) throw new Error("cannot decode message google.protobuf.Timestamp from JSON: must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive");
    return this.seconds = de.parse(s / 1e3), this.nanos = 0, n[7] && (this.nanos = parseInt("1" + n[7] + "0".repeat(9 - n[7].length)) - 1e9), this
  }
  toJson(e) {
    const t = Number(this.seconds) * 1e3;
    if (t < Date.parse("0001-01-01T00:00:00Z") || t > Date.parse("9999-12-31T23:59:59Z")) throw new Error("cannot encode google.protobuf.Timestamp to JSON: must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive");
    if (this.nanos < 0) throw new Error("cannot encode google.protobuf.Timestamp to JSON: nanos must not be negative");
    let n = "Z";
    if (this.nanos > 0) {
      const s = (this.nanos + 1e9).toString().substring(1);
      s.substring(3) === "000000" ? n = "." + s.substring(0, 3) + "Z" : s.substring(6) === "000" ? n = "." + s.substring(0, 6) + "Z" : n = "." + s + "Z"
    }
    return new Date(t).toISOString().replace(".000Z", n)
  }
  toDate() {
    return new Date(Number(this.seconds) * 1e3 + Math.ceil(this.nanos / 1e6))
  }
  static now() {
    return xe.fromDate(new Date)
  }
  static fromDate(e) {
    const t = e.getTime();
    return new xe({
      seconds: de.parse(Math.floor(t / 1e3)),
      nanos: t % 1e3 * 1e6
    })
  }
  static fromBinary(e, t) {
    return new xe().fromBinary(e, t)
  }
  static fromJson(e, t) {
    return new xe().fromJson(e, t)
  }
  static fromJsonString(e, t) {
    return new xe().fromJsonString(e, t)
  }
  static equals(e, t) {
    return R.util.equals(xe, e, t)
  }
}
xe.runtime = R;
xe.typeName = "google.protobuf.Timestamp";
xe.fields = R.util.newFieldList(() => [{
  no: 1,
  name: "seconds",
  kind: "scalar",
  T: 3
}, {
  no: 2,
  name: "nanos",
  kind: "scalar",
  T: 5
}]);
const Iu = R.makeMessageType("livekit.MetricsBatch", () => [{
    no: 1,
    name: "timestamp_ms",
    kind: "scalar",
    T: 3
  }, {
    no: 2,
    name: "normalized_timestamp",
    kind: "message",
    T: xe
  }, {
    no: 3,
    name: "str_data",
    kind: "scalar",
    T: 9,
    repeated: !0
  }, {
    no: 4,
    name: "time_series",
    kind: "message",
    T: xu,
    repeated: !0
  }, {
    no: 5,
    name: "events",
    kind: "message",
    T: Ou,
    repeated: !0
  }]),
  xu = R.makeMessageType("livekit.TimeSeriesMetric", () => [{
    no: 1,
    name: "label",
    kind: "scalar",
    T: 13
  }, {
    no: 2,
    name: "participant_identity",
    kind: "scalar",
    T: 13
  }, {
    no: 3,
    name: "track_sid",
    kind: "scalar",
    T: 13
  }, {
    no: 4,
    name: "samples",
    kind: "message",
    T: Mu,
    repeated: !0
  }, {
    no: 5,
    name: "rid",
    kind: "scalar",
    T: 13
  }]),
  Mu = R.makeMessageType("livekit.MetricSample", () => [{
    no: 1,
    name: "timestamp_ms",
    kind: "scalar",
    T: 3
  }, {
    no: 2,
    name: "normalized_timestamp",
    kind: "message",
    T: xe
  }, {
    no: 3,
    name: "value",
    kind: "scalar",
    T: 2
  }]),
  Ou = R.makeMessageType("livekit.EventMetric", () => [{
    no: 1,
    name: "label",
    kind: "scalar",
    T: 13
  }, {
    no: 2,
    name: "participant_identity",
    kind: "scalar",
    T: 13
  }, {
    no: 3,
    name: "track_sid",
    kind: "scalar",
    T: 13
  }, {
    no: 4,
    name: "start_timestamp_ms",
    kind: "scalar",
    T: 3
  }, {
    no: 5,
    name: "end_timestamp_ms",
    kind: "scalar",
    T: 3,
    opt: !0
  }, {
    no: 6,
    name: "normalized_start_timestamp",
    kind: "message",
    T: xe
  }, {
    no: 7,
    name: "normalized_end_timestamp",
    kind: "message",
    T: xe,
    opt: !0
  }, {
    no: 8,
    name: "metadata",
    kind: "scalar",
    T: 9
  }, {
    no: 9,
    name: "rid",
    kind: "scalar",
    T: 13
  }]),
  ma = R.makeEnum("livekit.BackupCodecPolicy", [{
    no: 0,
    name: "PREFER_REGRESSION"
  }, {
    no: 1,
    name: "SIMULCAST"
  }, {
    no: 2,
    name: "REGRESSION"
  }]),
  Ve = R.makeEnum("livekit.TrackType", [{
    no: 0,
    name: "AUDIO"
  }, {
    no: 1,
    name: "VIDEO"
  }, {
    no: 2,
    name: "DATA"
  }]),
  ye = R.makeEnum("livekit.TrackSource", [{
    no: 0,
    name: "UNKNOWN"
  }, {
    no: 1,
    name: "CAMERA"
  }, {
    no: 2,
    name: "MICROPHONE"
  }, {
    no: 3,
    name: "SCREEN_SHARE"
  }, {
    no: 4,
    name: "SCREEN_SHARE_AUDIO"
  }]),
  Rs = R.makeEnum("livekit.VideoQuality", [{
    no: 0,
    name: "LOW"
  }, {
    no: 1,
    name: "MEDIUM"
  }, {
    no: 2,
    name: "HIGH"
  }, {
    no: 3,
    name: "OFF"
  }]),
  ri = R.makeEnum("livekit.ConnectionQuality", [{
    no: 0,
    name: "POOR"
  }, {
    no: 1,
    name: "GOOD"
  }, {
    no: 2,
    name: "EXCELLENT"
  }, {
    no: 3,
    name: "LOST"
  }]),
  mi = R.makeEnum("livekit.ClientConfigSetting", [{
    no: 0,
    name: "UNSET"
  }, {
    no: 1,
    name: "DISABLED"
  }, {
    no: 2,
    name: "ENABLED"
  }]),
  He = R.makeEnum("livekit.DisconnectReason", [{
    no: 0,
    name: "UNKNOWN_REASON"
  }, {
    no: 1,
    name: "CLIENT_INITIATED"
  }, {
    no: 2,
    name: "DUPLICATE_IDENTITY"
  }, {
    no: 3,
    name: "SERVER_SHUTDOWN"
  }, {
    no: 4,
    name: "PARTICIPANT_REMOVED"
  }, {
    no: 5,
    name: "ROOM_DELETED"
  }, {
    no: 6,
    name: "STATE_MISMATCH"
  }, {
    no: 7,
    name: "JOIN_FAILURE"
  }, {
    no: 8,
    name: "MIGRATION"
  }, {
    no: 9,
    name: "SIGNAL_CLOSE"
  }, {
    no: 10,
    name: "ROOM_CLOSED"
  }, {
    no: 11,
    name: "USER_UNAVAILABLE"
  }, {
    no: 12,
    name: "USER_REJECTED"
  }, {
    no: 13,
    name: "SIP_TRUNK_FAILURE"
  }, {
    no: 14,
    name: "CONNECTION_TIMEOUT"
  }, {
    no: 15,
    name: "MEDIA_FAILURE"
  }]),
  Pt = R.makeEnum("livekit.ReconnectReason", [{
    no: 0,
    name: "RR_UNKNOWN"
  }, {
    no: 1,
    name: "RR_SIGNAL_DISCONNECTED"
  }, {
    no: 2,
    name: "RR_PUBLISHER_FAILED"
  }, {
    no: 3,
    name: "RR_SUBSCRIBER_FAILED"
  }, {
    no: 4,
    name: "RR_SWITCH_CANDIDATE"
  }]),
  Du = R.makeEnum("livekit.SubscriptionError", [{
    no: 0,
    name: "SE_UNKNOWN"
  }, {
    no: 1,
    name: "SE_CODEC_UNSUPPORTED"
  }, {
    no: 2,
    name: "SE_TRACK_NOTFOUND"
  }]),
  ke = R.makeEnum("livekit.AudioTrackFeature", [{
    no: 0,
    name: "TF_STEREO"
  }, {
    no: 1,
    name: "TF_NO_DTX"
  }, {
    no: 2,
    name: "TF_AUTO_GAIN_CONTROL"
  }, {
    no: 3,
    name: "TF_ECHO_CANCELLATION"
  }, {
    no: 4,
    name: "TF_NOISE_SUPPRESSION"
  }, {
    no: 5,
    name: "TF_ENHANCED_NOISE_CANCELLATION"
  }, {
    no: 6,
    name: "TF_PRECONNECT_BUFFER"
  }]),
  sn = R.makeMessageType("livekit.Room", () => [{
    no: 1,
    name: "sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "name",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "empty_timeout",
    kind: "scalar",
    T: 13
  }, {
    no: 14,
    name: "departure_timeout",
    kind: "scalar",
    T: 13
  }, {
    no: 4,
    name: "max_participants",
    kind: "scalar",
    T: 13
  }, {
    no: 5,
    name: "creation_time",
    kind: "scalar",
    T: 3
  }, {
    no: 15,
    name: "creation_time_ms",
    kind: "scalar",
    T: 3
  }, {
    no: 6,
    name: "turn_password",
    kind: "scalar",
    T: 9
  }, {
    no: 7,
    name: "enabled_codecs",
    kind: "message",
    T: Wi,
    repeated: !0
  }, {
    no: 8,
    name: "metadata",
    kind: "scalar",
    T: 9
  }, {
    no: 9,
    name: "num_participants",
    kind: "scalar",
    T: 13
  }, {
    no: 11,
    name: "num_publishers",
    kind: "scalar",
    T: 13
  }, {
    no: 10,
    name: "active_recording",
    kind: "scalar",
    T: 8
  }, {
    no: 13,
    name: "version",
    kind: "message",
    T: Pa
  }]),
  Wi = R.makeMessageType("livekit.Codec", () => [{
    no: 1,
    name: "mime",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "fmtp_line",
    kind: "scalar",
    T: 9
  }]),
  Au = R.makeMessageType("livekit.ParticipantPermission", () => [{
    no: 1,
    name: "can_subscribe",
    kind: "scalar",
    T: 8
  }, {
    no: 2,
    name: "can_publish",
    kind: "scalar",
    T: 8
  }, {
    no: 3,
    name: "can_publish_data",
    kind: "scalar",
    T: 8
  }, {
    no: 9,
    name: "can_publish_sources",
    kind: "enum",
    T: R.getEnumType(ye),
    repeated: !0
  }, {
    no: 7,
    name: "hidden",
    kind: "scalar",
    T: 8
  }, {
    no: 8,
    name: "recorder",
    kind: "scalar",
    T: 8
  }, {
    no: 10,
    name: "can_update_metadata",
    kind: "scalar",
    T: 8
  }, {
    no: 11,
    name: "agent",
    kind: "scalar",
    T: 8
  }, {
    no: 12,
    name: "can_subscribe_metrics",
    kind: "scalar",
    T: 8
  }]),
  Mt = R.makeMessageType("livekit.ParticipantInfo", () => [{
    no: 1,
    name: "sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "identity",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "state",
    kind: "enum",
    T: R.getEnumType(Vt)
  }, {
    no: 4,
    name: "tracks",
    kind: "message",
    T: jt,
    repeated: !0
  }, {
    no: 5,
    name: "metadata",
    kind: "scalar",
    T: 9
  }, {
    no: 6,
    name: "joined_at",
    kind: "scalar",
    T: 3
  }, {
    no: 17,
    name: "joined_at_ms",
    kind: "scalar",
    T: 3
  }, {
    no: 9,
    name: "name",
    kind: "scalar",
    T: 9
  }, {
    no: 10,
    name: "version",
    kind: "scalar",
    T: 13
  }, {
    no: 11,
    name: "permission",
    kind: "message",
    T: Au
  }, {
    no: 12,
    name: "region",
    kind: "scalar",
    T: 9
  }, {
    no: 13,
    name: "is_publisher",
    kind: "scalar",
    T: 8
  }, {
    no: 14,
    name: "kind",
    kind: "enum",
    T: R.getEnumType(fi)
  }, {
    no: 15,
    name: "attributes",
    kind: "map",
    K: 9,
    V: {
      kind: "scalar",
      T: 9
    }
  }, {
    no: 16,
    name: "disconnect_reason",
    kind: "enum",
    T: R.getEnumType(He)
  }, {
    no: 18,
    name: "kind_details",
    kind: "enum",
    T: R.getEnumType(Nu),
    repeated: !0
  }, {
    no: 19,
    name: "data_tracks",
    kind: "message",
    T: _s,
    repeated: !0
  }]),
  Vt = R.makeEnum("livekit.ParticipantInfo.State", [{
    no: 0,
    name: "JOINING"
  }, {
    no: 1,
    name: "JOINED"
  }, {
    no: 2,
    name: "ACTIVE"
  }, {
    no: 3,
    name: "DISCONNECTED"
  }]),
  fi = R.makeEnum("livekit.ParticipantInfo.Kind", [{
    no: 0,
    name: "STANDARD"
  }, {
    no: 1,
    name: "INGRESS"
  }, {
    no: 2,
    name: "EGRESS"
  }, {
    no: 3,
    name: "SIP"
  }, {
    no: 4,
    name: "AGENT"
  }, {
    no: 7,
    name: "CONNECTOR"
  }, {
    no: 8,
    name: "BRIDGE"
  }]),
  Nu = R.makeEnum("livekit.ParticipantInfo.KindDetail", [{
    no: 0,
    name: "CLOUD_AGENT"
  }, {
    no: 1,
    name: "FORWARDED"
  }, {
    no: 2,
    name: "CONNECTOR_WHATSAPP"
  }, {
    no: 3,
    name: "CONNECTOR_TWILIO"
  }, {
    no: 4,
    name: "BRIDGE_RTSP"
  }]),
  ge = R.makeEnum("livekit.Encryption.Type", [{
    no: 0,
    name: "NONE"
  }, {
    no: 1,
    name: "GCM"
  }, {
    no: 2,
    name: "CUSTOM"
  }]),
  Lu = R.makeMessageType("livekit.SimulcastCodecInfo", () => [{
    no: 1,
    name: "mime_type",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "mid",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "cid",
    kind: "scalar",
    T: 9
  }, {
    no: 4,
    name: "layers",
    kind: "message",
    T: bt,
    repeated: !0
  }, {
    no: 5,
    name: "video_layer_mode",
    kind: "enum",
    T: R.getEnumType(fa)
  }, {
    no: 6,
    name: "sdp_cid",
    kind: "scalar",
    T: 9
  }]),
  jt = R.makeMessageType("livekit.TrackInfo", () => [{
    no: 1,
    name: "sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "type",
    kind: "enum",
    T: R.getEnumType(Ve)
  }, {
    no: 3,
    name: "name",
    kind: "scalar",
    T: 9
  }, {
    no: 4,
    name: "muted",
    kind: "scalar",
    T: 8
  }, {
    no: 5,
    name: "width",
    kind: "scalar",
    T: 13
  }, {
    no: 6,
    name: "height",
    kind: "scalar",
    T: 13
  }, {
    no: 7,
    name: "simulcast",
    kind: "scalar",
    T: 8
  }, {
    no: 8,
    name: "disable_dtx",
    kind: "scalar",
    T: 8
  }, {
    no: 9,
    name: "source",
    kind: "enum",
    T: R.getEnumType(ye)
  }, {
    no: 10,
    name: "layers",
    kind: "message",
    T: bt,
    repeated: !0
  }, {
    no: 11,
    name: "mime_type",
    kind: "scalar",
    T: 9
  }, {
    no: 12,
    name: "mid",
    kind: "scalar",
    T: 9
  }, {
    no: 13,
    name: "codecs",
    kind: "message",
    T: Lu,
    repeated: !0
  }, {
    no: 14,
    name: "stereo",
    kind: "scalar",
    T: 8
  }, {
    no: 15,
    name: "disable_red",
    kind: "scalar",
    T: 8
  }, {
    no: 16,
    name: "encryption",
    kind: "enum",
    T: R.getEnumType(ge)
  }, {
    no: 17,
    name: "stream",
    kind: "scalar",
    T: 9
  }, {
    no: 18,
    name: "version",
    kind: "message",
    T: Pa
  }, {
    no: 19,
    name: "audio_features",
    kind: "enum",
    T: R.getEnumType(ke),
    repeated: !0
  }, {
    no: 20,
    name: "backup_codec_policy",
    kind: "enum",
    T: R.getEnumType(ma)
  }]),
  _s = R.makeMessageType("livekit.DataTrackInfo", () => [{
    no: 1,
    name: "pub_handle",
    kind: "scalar",
    T: 13
  }, {
    no: 2,
    name: "sid",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "name",
    kind: "scalar",
    T: 9
  }, {
    no: 4,
    name: "encryption",
    kind: "enum",
    T: R.getEnumType(ge)
  }]),
  Uu = R.makeMessageType("livekit.DataTrackSubscriptionOptions", () => [{
    no: 1,
    name: "target_fps",
    kind: "scalar",
    T: 13,
    opt: !0
  }]),
  bt = R.makeMessageType("livekit.VideoLayer", () => [{
    no: 1,
    name: "quality",
    kind: "enum",
    T: R.getEnumType(Rs)
  }, {
    no: 2,
    name: "width",
    kind: "scalar",
    T: 13
  }, {
    no: 3,
    name: "height",
    kind: "scalar",
    T: 13
  }, {
    no: 4,
    name: "bitrate",
    kind: "scalar",
    T: 13
  }, {
    no: 5,
    name: "ssrc",
    kind: "scalar",
    T: 13
  }, {
    no: 6,
    name: "spatial_layer",
    kind: "scalar",
    T: 5
  }, {
    no: 7,
    name: "rid",
    kind: "scalar",
    T: 9
  }, {
    no: 8,
    name: "repair_ssrc",
    kind: "scalar",
    T: 13
  }]),
  fa = R.makeEnum("livekit.VideoLayer.Mode", [{
    no: 0,
    name: "MODE_UNUSED"
  }, {
    no: 1,
    name: "ONE_SPATIAL_LAYER_PER_STREAM"
  }, {
    no: 2,
    name: "MULTIPLE_SPATIAL_LAYERS_PER_STREAM"
  }, {
    no: 3,
    name: "ONE_SPATIAL_LAYER_PER_STREAM_INCOMPLETE_RTCP_SR"
  }]),
  Re = R.makeMessageType("livekit.DataPacket", () => [{
    no: 1,
    name: "kind",
    kind: "enum",
    T: R.getEnumType(ee)
  }, {
    no: 4,
    name: "participant_identity",
    kind: "scalar",
    T: 9
  }, {
    no: 5,
    name: "destination_identities",
    kind: "scalar",
    T: 9,
    repeated: !0
  }, {
    no: 2,
    name: "user",
    kind: "message",
    T: Is,
    oneof: "value"
  }, {
    no: 3,
    name: "speaker",
    kind: "message",
    T: ju,
    oneof: "value"
  }, {
    no: 6,
    name: "sip_dtmf",
    kind: "message",
    T: ba,
    oneof: "value"
  }, {
    no: 7,
    name: "transcription",
    kind: "message",
    T: Fu,
    oneof: "value"
  }, {
    no: 8,
    name: "metrics",
    kind: "message",
    T: Iu,
    oneof: "value"
  }, {
    no: 9,
    name: "chat_message",
    kind: "message",
    T: Hi,
    oneof: "value"
  }, {
    no: 10,
    name: "rpc_request",
    kind: "message",
    T: xs,
    oneof: "value"
  }, {
    no: 11,
    name: "rpc_ack",
    kind: "message",
    T: Ms,
    oneof: "value"
  }, {
    no: 12,
    name: "rpc_response",
    kind: "message",
    T: Os,
    oneof: "value"
  }, {
    no: 13,
    name: "stream_header",
    kind: "message",
    T: Ki,
    oneof: "value"
  }, {
    no: 14,
    name: "stream_chunk",
    kind: "message",
    T: Gi,
    oneof: "value"
  }, {
    no: 15,
    name: "stream_trailer",
    kind: "message",
    T: Ji,
    oneof: "value"
  }, {
    no: 18,
    name: "encrypted_packet",
    kind: "message",
    T: pa,
    oneof: "value"
  }, {
    no: 16,
    name: "sequence",
    kind: "scalar",
    T: 13
  }, {
    no: 17,
    name: "participant_sid",
    kind: "scalar",
    T: 9
  }]),
  ee = R.makeEnum("livekit.DataPacket.Kind", [{
    no: 0,
    name: "RELIABLE"
  }, {
    no: 1,
    name: "LOSSY"
  }]),
  pa = R.makeMessageType("livekit.EncryptedPacket", () => [{
    no: 1,
    name: "encryption_type",
    kind: "enum",
    T: R.getEnumType(ge)
  }, {
    no: 2,
    name: "iv",
    kind: "scalar",
    T: 12
  }, {
    no: 3,
    name: "key_index",
    kind: "scalar",
    T: 13
  }, {
    no: 4,
    name: "encrypted_value",
    kind: "scalar",
    T: 12
  }]),
  ga = R.makeMessageType("livekit.EncryptedPacketPayload", () => [{
    no: 1,
    name: "user",
    kind: "message",
    T: Is,
    oneof: "value"
  }, {
    no: 3,
    name: "chat_message",
    kind: "message",
    T: Hi,
    oneof: "value"
  }, {
    no: 4,
    name: "rpc_request",
    kind: "message",
    T: xs,
    oneof: "value"
  }, {
    no: 5,
    name: "rpc_ack",
    kind: "message",
    T: Ms,
    oneof: "value"
  }, {
    no: 6,
    name: "rpc_response",
    kind: "message",
    T: Os,
    oneof: "value"
  }, {
    no: 7,
    name: "stream_header",
    kind: "message",
    T: Ki,
    oneof: "value"
  }, {
    no: 8,
    name: "stream_chunk",
    kind: "message",
    T: Gi,
    oneof: "value"
  }, {
    no: 9,
    name: "stream_trailer",
    kind: "message",
    T: Ji,
    oneof: "value"
  }]),
  ju = R.makeMessageType("livekit.ActiveSpeakerUpdate", () => [{
    no: 1,
    name: "speakers",
    kind: "message",
    T: va,
    repeated: !0
  }]),
  va = R.makeMessageType("livekit.SpeakerInfo", () => [{
    no: 1,
    name: "sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "level",
    kind: "scalar",
    T: 2
  }, {
    no: 3,
    name: "active",
    kind: "scalar",
    T: 8
  }]),
  Is = R.makeMessageType("livekit.UserPacket", () => [{
    no: 1,
    name: "participant_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 5,
    name: "participant_identity",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "payload",
    kind: "scalar",
    T: 12
  }, {
    no: 3,
    name: "destination_sids",
    kind: "scalar",
    T: 9,
    repeated: !0
  }, {
    no: 6,
    name: "destination_identities",
    kind: "scalar",
    T: 9,
    repeated: !0
  }, {
    no: 4,
    name: "topic",
    kind: "scalar",
    T: 9,
    opt: !0
  }, {
    no: 8,
    name: "id",
    kind: "scalar",
    T: 9,
    opt: !0
  }, {
    no: 9,
    name: "start_time",
    kind: "scalar",
    T: 4,
    opt: !0
  }, {
    no: 10,
    name: "end_time",
    kind: "scalar",
    T: 4,
    opt: !0
  }, {
    no: 11,
    name: "nonce",
    kind: "scalar",
    T: 12
  }]),
  ba = R.makeMessageType("livekit.SipDTMF", () => [{
    no: 3,
    name: "code",
    kind: "scalar",
    T: 13
  }, {
    no: 4,
    name: "digit",
    kind: "scalar",
    T: 9
  }]),
  Fu = R.makeMessageType("livekit.Transcription", () => [{
    no: 2,
    name: "transcribed_participant_identity",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "track_id",
    kind: "scalar",
    T: 9
  }, {
    no: 4,
    name: "segments",
    kind: "message",
    T: Bu,
    repeated: !0
  }]),
  Bu = R.makeMessageType("livekit.TranscriptionSegment", () => [{
    no: 1,
    name: "id",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "text",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "start_time",
    kind: "scalar",
    T: 4
  }, {
    no: 4,
    name: "end_time",
    kind: "scalar",
    T: 4
  }, {
    no: 5,
    name: "final",
    kind: "scalar",
    T: 8
  }, {
    no: 6,
    name: "language",
    kind: "scalar",
    T: 9
  }]),
  Hi = R.makeMessageType("livekit.ChatMessage", () => [{
    no: 1,
    name: "id",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "timestamp",
    kind: "scalar",
    T: 3
  }, {
    no: 3,
    name: "edit_timestamp",
    kind: "scalar",
    T: 3,
    opt: !0
  }, {
    no: 4,
    name: "message",
    kind: "scalar",
    T: 9
  }, {
    no: 5,
    name: "deleted",
    kind: "scalar",
    T: 8
  }, {
    no: 6,
    name: "generated",
    kind: "scalar",
    T: 8
  }]),
  xs = R.makeMessageType("livekit.RpcRequest", () => [{
    no: 1,
    name: "id",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "method",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "payload",
    kind: "scalar",
    T: 9
  }, {
    no: 4,
    name: "response_timeout_ms",
    kind: "scalar",
    T: 13
  }, {
    no: 5,
    name: "version",
    kind: "scalar",
    T: 13
  }]),
  Ms = R.makeMessageType("livekit.RpcAck", () => [{
    no: 1,
    name: "request_id",
    kind: "scalar",
    T: 9
  }]),
  Os = R.makeMessageType("livekit.RpcResponse", () => [{
    no: 1,
    name: "request_id",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "payload",
    kind: "scalar",
    T: 9,
    oneof: "value"
  }, {
    no: 3,
    name: "error",
    kind: "message",
    T: ya,
    oneof: "value"
  }]),
  ya = R.makeMessageType("livekit.RpcError", () => [{
    no: 1,
    name: "code",
    kind: "scalar",
    T: 13
  }, {
    no: 2,
    name: "message",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "data",
    kind: "scalar",
    T: 9
  }]),
  ka = R.makeMessageType("livekit.ParticipantTracks", () => [{
    no: 1,
    name: "participant_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "track_sids",
    kind: "scalar",
    T: 9,
    repeated: !0
  }]),
  Sa = R.makeMessageType("livekit.ServerInfo", () => [{
    no: 1,
    name: "edition",
    kind: "enum",
    T: R.getEnumType(Ta)
  }, {
    no: 2,
    name: "version",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "protocol",
    kind: "scalar",
    T: 5
  }, {
    no: 4,
    name: "region",
    kind: "scalar",
    T: 9
  }, {
    no: 5,
    name: "node_id",
    kind: "scalar",
    T: 9
  }, {
    no: 6,
    name: "debug_info",
    kind: "scalar",
    T: 9
  }, {
    no: 7,
    name: "agent_protocol",
    kind: "scalar",
    T: 5
  }]),
  Ta = R.makeEnum("livekit.ServerInfo.Edition", [{
    no: 0,
    name: "Standard"
  }, {
    no: 1,
    name: "Cloud"
  }]),
  Ca = R.makeMessageType("livekit.ClientInfo", () => [{
    no: 1,
    name: "sdk",
    kind: "enum",
    T: R.getEnumType(wa)
  }, {
    no: 2,
    name: "version",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "protocol",
    kind: "scalar",
    T: 5
  }, {
    no: 4,
    name: "os",
    kind: "scalar",
    T: 9
  }, {
    no: 5,
    name: "os_version",
    kind: "scalar",
    T: 9
  }, {
    no: 6,
    name: "device_model",
    kind: "scalar",
    T: 9
  }, {
    no: 7,
    name: "browser",
    kind: "scalar",
    T: 9
  }, {
    no: 8,
    name: "browser_version",
    kind: "scalar",
    T: 9
  }, {
    no: 9,
    name: "address",
    kind: "scalar",
    T: 9
  }, {
    no: 10,
    name: "network",
    kind: "scalar",
    T: 9
  }, {
    no: 11,
    name: "other_sdks",
    kind: "scalar",
    T: 9
  }]),
  wa = R.makeEnum("livekit.ClientInfo.SDK", [{
    no: 0,
    name: "UNKNOWN"
  }, {
    no: 1,
    name: "JS"
  }, {
    no: 2,
    name: "SWIFT"
  }, {
    no: 3,
    name: "ANDROID"
  }, {
    no: 4,
    name: "FLUTTER"
  }, {
    no: 5,
    name: "GO"
  }, {
    no: 6,
    name: "UNITY"
  }, {
    no: 7,
    name: "REACT_NATIVE"
  }, {
    no: 8,
    name: "RUST"
  }, {
    no: 9,
    name: "PYTHON"
  }, {
    no: 10,
    name: "CPP"
  }, {
    no: 11,
    name: "UNITY_WEB"
  }, {
    no: 12,
    name: "NODE"
  }, {
    no: 13,
    name: "UNREAL"
  }, {
    no: 14,
    name: "ESP32"
  }]),
  Ea = R.makeMessageType("livekit.ClientConfiguration", () => [{
    no: 1,
    name: "video",
    kind: "message",
    T: Dr
  }, {
    no: 2,
    name: "screen",
    kind: "message",
    T: Dr
  }, {
    no: 3,
    name: "resume_connection",
    kind: "enum",
    T: R.getEnumType(mi)
  }, {
    no: 4,
    name: "disabled_codecs",
    kind: "message",
    T: Vu
  }, {
    no: 5,
    name: "force_relay",
    kind: "enum",
    T: R.getEnumType(mi)
  }]),
  Dr = R.makeMessageType("livekit.VideoConfiguration", () => [{
    no: 1,
    name: "hardware_encoder",
    kind: "enum",
    T: R.getEnumType(mi)
  }]),
  Vu = R.makeMessageType("livekit.DisabledCodecs", () => [{
    no: 1,
    name: "codecs",
    kind: "message",
    T: Wi,
    repeated: !0
  }, {
    no: 2,
    name: "publish",
    kind: "message",
    T: Wi,
    repeated: !0
  }]),
  Pa = R.makeMessageType("livekit.TimedVersion", () => [{
    no: 1,
    name: "unix_micro",
    kind: "scalar",
    T: 3
  }, {
    no: 2,
    name: "ticks",
    kind: "scalar",
    T: 5
  }]),
  Kn = R.makeEnum("livekit.DataStream.OperationType", [{
    no: 0,
    name: "CREATE"
  }, {
    no: 1,
    name: "UPDATE"
  }, {
    no: 2,
    name: "DELETE"
  }, {
    no: 3,
    name: "REACTION"
  }]),
  Ra = R.makeMessageType("livekit.DataStream.TextHeader", () => [{
    no: 1,
    name: "operation_type",
    kind: "enum",
    T: R.getEnumType(Kn)
  }, {
    no: 2,
    name: "version",
    kind: "scalar",
    T: 5
  }, {
    no: 3,
    name: "reply_to_stream_id",
    kind: "scalar",
    T: 9
  }, {
    no: 4,
    name: "attached_stream_ids",
    kind: "scalar",
    T: 9,
    repeated: !0
  }, {
    no: 5,
    name: "generated",
    kind: "scalar",
    T: 8
  }], {
    localName: "DataStream_TextHeader"
  }),
  _a = R.makeMessageType("livekit.DataStream.ByteHeader", () => [{
    no: 1,
    name: "name",
    kind: "scalar",
    T: 9
  }], {
    localName: "DataStream_ByteHeader"
  }),
  Ki = R.makeMessageType("livekit.DataStream.Header", () => [{
    no: 1,
    name: "stream_id",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "timestamp",
    kind: "scalar",
    T: 3
  }, {
    no: 3,
    name: "topic",
    kind: "scalar",
    T: 9
  }, {
    no: 4,
    name: "mime_type",
    kind: "scalar",
    T: 9
  }, {
    no: 5,
    name: "total_length",
    kind: "scalar",
    T: 4,
    opt: !0
  }, {
    no: 7,
    name: "encryption_type",
    kind: "enum",
    T: R.getEnumType(ge)
  }, {
    no: 8,
    name: "attributes",
    kind: "map",
    K: 9,
    V: {
      kind: "scalar",
      T: 9
    }
  }, {
    no: 9,
    name: "text_header",
    kind: "message",
    T: Ra,
    oneof: "content_header"
  }, {
    no: 10,
    name: "byte_header",
    kind: "message",
    T: _a,
    oneof: "content_header"
  }], {
    localName: "DataStream_Header"
  }),
  Gi = R.makeMessageType("livekit.DataStream.Chunk", () => [{
    no: 1,
    name: "stream_id",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "chunk_index",
    kind: "scalar",
    T: 4
  }, {
    no: 3,
    name: "content",
    kind: "scalar",
    T: 12
  }, {
    no: 4,
    name: "version",
    kind: "scalar",
    T: 5
  }, {
    no: 5,
    name: "iv",
    kind: "scalar",
    T: 12,
    opt: !0
  }], {
    localName: "DataStream_Chunk"
  }),
  Ji = R.makeMessageType("livekit.DataStream.Trailer", () => [{
    no: 1,
    name: "stream_id",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "reason",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "attributes",
    kind: "map",
    K: 9,
    V: {
      kind: "scalar",
      T: 9
    }
  }], {
    localName: "DataStream_Trailer"
  }),
  qu = R.makeMessageType("livekit.SubscribedAudioCodec", () => [{
    no: 1,
    name: "codec",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "enabled",
    kind: "scalar",
    T: 8
  }]),
  qe = R.makeEnum("livekit.SignalTarget", [{
    no: 0,
    name: "PUBLISHER"
  }, {
    no: 1,
    name: "SUBSCRIBER"
  }]),
  Gn = R.makeEnum("livekit.StreamState", [{
    no: 0,
    name: "ACTIVE"
  }, {
    no: 1,
    name: "PAUSED"
  }]),
  Wu = R.makeEnum("livekit.CandidateProtocol", [{
    no: 0,
    name: "UDP"
  }, {
    no: 1,
    name: "TCP"
  }, {
    no: 2,
    name: "TLS"
  }]),
  Hu = R.makeMessageType("livekit.SignalRequest", () => [{
    no: 1,
    name: "offer",
    kind: "message",
    T: St,
    oneof: "message"
  }, {
    no: 2,
    name: "answer",
    kind: "message",
    T: St,
    oneof: "message"
  }, {
    no: 3,
    name: "trickle",
    kind: "message",
    T: rn,
    oneof: "message"
  }, {
    no: 4,
    name: "add_track",
    kind: "message",
    T: pi,
    oneof: "message"
  }, {
    no: 5,
    name: "mute",
    kind: "message",
    T: on,
    oneof: "message"
  }, {
    no: 6,
    name: "subscription",
    kind: "message",
    T: an,
    oneof: "message"
  }, {
    no: 7,
    name: "track_setting",
    kind: "message",
    T: Oa,
    oneof: "message"
  }, {
    no: 8,
    name: "leave",
    kind: "message",
    T: cn,
    oneof: "message"
  }, {
    no: 10,
    name: "update_layers",
    kind: "message",
    T: Aa,
    oneof: "message"
  }, {
    no: 11,
    name: "subscription_permission",
    kind: "message",
    T: Ua,
    oneof: "message"
  }, {
    no: 12,
    name: "sync_state",
    kind: "message",
    T: Us,
    oneof: "message"
  }, {
    no: 13,
    name: "simulate",
    kind: "message",
    T: ze,
    oneof: "message"
  }, {
    no: 14,
    name: "ping",
    kind: "scalar",
    T: 3,
    oneof: "message"
  }, {
    no: 15,
    name: "update_metadata",
    kind: "message",
    T: Ns,
    oneof: "message"
  }, {
    no: 16,
    name: "ping_req",
    kind: "message",
    T: Ba,
    oneof: "message"
  }, {
    no: 17,
    name: "update_audio_track",
    kind: "message",
    T: As,
    oneof: "message"
  }, {
    no: 18,
    name: "update_video_track",
    kind: "message",
    T: Da,
    oneof: "message"
  }, {
    no: 19,
    name: "publish_data_track_request",
    kind: "message",
    T: Ia,
    oneof: "message"
  }, {
    no: 20,
    name: "unpublish_data_track_request",
    kind: "message",
    T: Ma,
    oneof: "message"
  }, {
    no: 21,
    name: "update_data_subscription",
    kind: "message",
    T: Xu,
    oneof: "message"
  }]),
  Ar = R.makeMessageType("livekit.SignalResponse", () => [{
    no: 1,
    name: "join",
    kind: "message",
    T: zu,
    oneof: "message"
  }, {
    no: 2,
    name: "answer",
    kind: "message",
    T: St,
    oneof: "message"
  }, {
    no: 3,
    name: "offer",
    kind: "message",
    T: St,
    oneof: "message"
  }, {
    no: 4,
    name: "trickle",
    kind: "message",
    T: rn,
    oneof: "message"
  }, {
    no: 5,
    name: "update",
    kind: "message",
    T: Yu,
    oneof: "message"
  }, {
    no: 6,
    name: "track_published",
    kind: "message",
    T: Ds,
    oneof: "message"
  }, {
    no: 8,
    name: "leave",
    kind: "message",
    T: cn,
    oneof: "message"
  }, {
    no: 9,
    name: "mute",
    kind: "message",
    T: on,
    oneof: "message"
  }, {
    no: 10,
    name: "speakers_changed",
    kind: "message",
    T: eh,
    oneof: "message"
  }, {
    no: 11,
    name: "room_update",
    kind: "message",
    T: th,
    oneof: "message"
  }, {
    no: 12,
    name: "connection_quality",
    kind: "message",
    T: nh,
    oneof: "message"
  }, {
    no: 13,
    name: "stream_state_update",
    kind: "message",
    T: rh,
    oneof: "message"
  }, {
    no: 14,
    name: "subscribed_quality_update",
    kind: "message",
    T: ah,
    oneof: "message"
  }, {
    no: 15,
    name: "subscription_permission_update",
    kind: "message",
    T: dh,
    oneof: "message"
  }, {
    no: 16,
    name: "refresh_token",
    kind: "scalar",
    T: 9,
    oneof: "message"
  }, {
    no: 17,
    name: "track_unpublished",
    kind: "message",
    T: Qu,
    oneof: "message"
  }, {
    no: 18,
    name: "pong",
    kind: "scalar",
    T: 3,
    oneof: "message"
  }, {
    no: 19,
    name: "reconnect",
    kind: "message",
    T: $u,
    oneof: "message"
  }, {
    no: 20,
    name: "pong_resp",
    kind: "message",
    T: uh,
    oneof: "message"
  }, {
    no: 21,
    name: "subscription_response",
    kind: "message",
    T: fh,
    oneof: "message"
  }, {
    no: 22,
    name: "request_response",
    kind: "message",
    T: ph,
    oneof: "message"
  }, {
    no: 23,
    name: "track_subscribed",
    kind: "message",
    T: gh,
    oneof: "message"
  }, {
    no: 24,
    name: "room_moved",
    kind: "message",
    T: lh,
    oneof: "message"
  }, {
    no: 25,
    name: "media_sections_requirement",
    kind: "message",
    T: kh,
    oneof: "message"
  }, {
    no: 26,
    name: "subscribed_audio_codec_update",
    kind: "message",
    T: ch,
    oneof: "message"
  }, {
    no: 27,
    name: "publish_data_track_response",
    kind: "message",
    T: xa,
    oneof: "message"
  }, {
    no: 28,
    name: "unpublish_data_track_response",
    kind: "message",
    T: Ku,
    oneof: "message"
  }, {
    no: 29,
    name: "data_track_subscriber_handles",
    kind: "message",
    T: Gu,
    oneof: "message"
  }]),
  Jn = R.makeMessageType("livekit.SimulcastCodec", () => [{
    no: 1,
    name: "codec",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "cid",
    kind: "scalar",
    T: 9
  }, {
    no: 4,
    name: "layers",
    kind: "message",
    T: bt,
    repeated: !0
  }, {
    no: 5,
    name: "video_layer_mode",
    kind: "enum",
    T: R.getEnumType(fa)
  }]),
  pi = R.makeMessageType("livekit.AddTrackRequest", () => [{
    no: 1,
    name: "cid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "name",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "type",
    kind: "enum",
    T: R.getEnumType(Ve)
  }, {
    no: 4,
    name: "width",
    kind: "scalar",
    T: 13
  }, {
    no: 5,
    name: "height",
    kind: "scalar",
    T: 13
  }, {
    no: 6,
    name: "muted",
    kind: "scalar",
    T: 8
  }, {
    no: 7,
    name: "disable_dtx",
    kind: "scalar",
    T: 8
  }, {
    no: 8,
    name: "source",
    kind: "enum",
    T: R.getEnumType(ye)
  }, {
    no: 9,
    name: "layers",
    kind: "message",
    T: bt,
    repeated: !0
  }, {
    no: 10,
    name: "simulcast_codecs",
    kind: "message",
    T: Jn,
    repeated: !0
  }, {
    no: 11,
    name: "sid",
    kind: "scalar",
    T: 9
  }, {
    no: 12,
    name: "stereo",
    kind: "scalar",
    T: 8
  }, {
    no: 13,
    name: "disable_red",
    kind: "scalar",
    T: 8
  }, {
    no: 14,
    name: "encryption",
    kind: "enum",
    T: R.getEnumType(ge)
  }, {
    no: 15,
    name: "stream",
    kind: "scalar",
    T: 9
  }, {
    no: 16,
    name: "backup_codec_policy",
    kind: "enum",
    T: R.getEnumType(ma)
  }, {
    no: 17,
    name: "audio_features",
    kind: "enum",
    T: R.getEnumType(ke),
    repeated: !0
  }]),
  Ia = R.makeMessageType("livekit.PublishDataTrackRequest", () => [{
    no: 1,
    name: "pub_handle",
    kind: "scalar",
    T: 13
  }, {
    no: 2,
    name: "name",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "encryption",
    kind: "enum",
    T: R.getEnumType(ge)
  }]),
  xa = R.makeMessageType("livekit.PublishDataTrackResponse", () => [{
    no: 1,
    name: "info",
    kind: "message",
    T: _s
  }]),
  Ma = R.makeMessageType("livekit.UnpublishDataTrackRequest", () => [{
    no: 1,
    name: "pub_handle",
    kind: "scalar",
    T: 13
  }]),
  Ku = R.makeMessageType("livekit.UnpublishDataTrackResponse", () => [{
    no: 1,
    name: "info",
    kind: "message",
    T: _s
  }]),
  Gu = R.makeMessageType("livekit.DataTrackSubscriberHandles", () => [{
    no: 1,
    name: "sub_handles",
    kind: "map",
    K: 13,
    V: {
      kind: "message",
      T: Ju
    }
  }]),
  Ju = R.makeMessageType("livekit.DataTrackSubscriberHandles.PublishedDataTrack", () => [{
    no: 1,
    name: "publisher_identity",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "publisher_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }], {
    localName: "DataTrackSubscriberHandles_PublishedDataTrack"
  }),
  rn = R.makeMessageType("livekit.TrickleRequest", () => [{
    no: 1,
    name: "candidateInit",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "target",
    kind: "enum",
    T: R.getEnumType(qe)
  }, {
    no: 3,
    name: "final",
    kind: "scalar",
    T: 8
  }]),
  on = R.makeMessageType("livekit.MuteTrackRequest", () => [{
    no: 1,
    name: "sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "muted",
    kind: "scalar",
    T: 8
  }]),
  zu = R.makeMessageType("livekit.JoinResponse", () => [{
    no: 1,
    name: "room",
    kind: "message",
    T: sn
  }, {
    no: 2,
    name: "participant",
    kind: "message",
    T: Mt
  }, {
    no: 3,
    name: "other_participants",
    kind: "message",
    T: Mt,
    repeated: !0
  }, {
    no: 4,
    name: "server_version",
    kind: "scalar",
    T: 9
  }, {
    no: 5,
    name: "ice_servers",
    kind: "message",
    T: Na,
    repeated: !0
  }, {
    no: 6,
    name: "subscriber_primary",
    kind: "scalar",
    T: 8
  }, {
    no: 7,
    name: "alternative_url",
    kind: "scalar",
    T: 9
  }, {
    no: 8,
    name: "client_configuration",
    kind: "message",
    T: Ea
  }, {
    no: 9,
    name: "server_region",
    kind: "scalar",
    T: 9
  }, {
    no: 10,
    name: "ping_timeout",
    kind: "scalar",
    T: 5
  }, {
    no: 11,
    name: "ping_interval",
    kind: "scalar",
    T: 5
  }, {
    no: 12,
    name: "server_info",
    kind: "message",
    T: Sa
  }, {
    no: 13,
    name: "sif_trailer",
    kind: "scalar",
    T: 12
  }, {
    no: 14,
    name: "enabled_publish_codecs",
    kind: "message",
    T: Wi,
    repeated: !0
  }, {
    no: 15,
    name: "fast_publish",
    kind: "scalar",
    T: 8
  }]),
  $u = R.makeMessageType("livekit.ReconnectResponse", () => [{
    no: 1,
    name: "ice_servers",
    kind: "message",
    T: Na,
    repeated: !0
  }, {
    no: 2,
    name: "client_configuration",
    kind: "message",
    T: Ea
  }, {
    no: 3,
    name: "server_info",
    kind: "message",
    T: Sa
  }, {
    no: 4,
    name: "last_message_seq",
    kind: "scalar",
    T: 13
  }]),
  Ds = R.makeMessageType("livekit.TrackPublishedResponse", () => [{
    no: 1,
    name: "cid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "track",
    kind: "message",
    T: jt
  }]),
  Qu = R.makeMessageType("livekit.TrackUnpublishedResponse", () => [{
    no: 1,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }]),
  St = R.makeMessageType("livekit.SessionDescription", () => [{
    no: 1,
    name: "type",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "sdp",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "id",
    kind: "scalar",
    T: 13
  }, {
    no: 4,
    name: "mid_to_track_id",
    kind: "map",
    K: 9,
    V: {
      kind: "scalar",
      T: 9
    }
  }]),
  Yu = R.makeMessageType("livekit.ParticipantUpdate", () => [{
    no: 1,
    name: "participants",
    kind: "message",
    T: Mt,
    repeated: !0
  }]),
  an = R.makeMessageType("livekit.UpdateSubscription", () => [{
    no: 1,
    name: "track_sids",
    kind: "scalar",
    T: 9,
    repeated: !0
  }, {
    no: 2,
    name: "subscribe",
    kind: "scalar",
    T: 8
  }, {
    no: 3,
    name: "participant_tracks",
    kind: "message",
    T: ka,
    repeated: !0
  }]),
  Xu = R.makeMessageType("livekit.UpdateDataSubscription", () => [{
    no: 1,
    name: "updates",
    kind: "message",
    T: Zu,
    repeated: !0
  }]),
  Zu = R.makeMessageType("livekit.UpdateDataSubscription.Update", () => [{
    no: 1,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "subscribe",
    kind: "scalar",
    T: 8
  }, {
    no: 3,
    name: "options",
    kind: "message",
    T: Uu
  }], {
    localName: "UpdateDataSubscription_Update"
  }),
  Oa = R.makeMessageType("livekit.UpdateTrackSettings", () => [{
    no: 1,
    name: "track_sids",
    kind: "scalar",
    T: 9,
    repeated: !0
  }, {
    no: 3,
    name: "disabled",
    kind: "scalar",
    T: 8
  }, {
    no: 4,
    name: "quality",
    kind: "enum",
    T: R.getEnumType(Rs)
  }, {
    no: 5,
    name: "width",
    kind: "scalar",
    T: 13
  }, {
    no: 6,
    name: "height",
    kind: "scalar",
    T: 13
  }, {
    no: 7,
    name: "fps",
    kind: "scalar",
    T: 13
  }, {
    no: 8,
    name: "priority",
    kind: "scalar",
    T: 13
  }]),
  As = R.makeMessageType("livekit.UpdateLocalAudioTrack", () => [{
    no: 1,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "features",
    kind: "enum",
    T: R.getEnumType(ke),
    repeated: !0
  }]),
  Da = R.makeMessageType("livekit.UpdateLocalVideoTrack", () => [{
    no: 1,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "width",
    kind: "scalar",
    T: 13
  }, {
    no: 3,
    name: "height",
    kind: "scalar",
    T: 13
  }]),
  cn = R.makeMessageType("livekit.LeaveRequest", () => [{
    no: 1,
    name: "can_reconnect",
    kind: "scalar",
    T: 8
  }, {
    no: 2,
    name: "reason",
    kind: "enum",
    T: R.getEnumType(He)
  }, {
    no: 3,
    name: "action",
    kind: "enum",
    T: R.getEnumType(qt)
  }, {
    no: 4,
    name: "regions",
    kind: "message",
    T: hh
  }]),
  qt = R.makeEnum("livekit.LeaveRequest.Action", [{
    no: 0,
    name: "DISCONNECT"
  }, {
    no: 1,
    name: "RESUME"
  }, {
    no: 2,
    name: "RECONNECT"
  }]),
  Aa = R.makeMessageType("livekit.UpdateVideoLayers", () => [{
    no: 1,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "layers",
    kind: "message",
    T: bt,
    repeated: !0
  }]),
  Ns = R.makeMessageType("livekit.UpdateParticipantMetadata", () => [{
    no: 1,
    name: "metadata",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "name",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "attributes",
    kind: "map",
    K: 9,
    V: {
      kind: "scalar",
      T: 9
    }
  }, {
    no: 4,
    name: "request_id",
    kind: "scalar",
    T: 13
  }]),
  Na = R.makeMessageType("livekit.ICEServer", () => [{
    no: 1,
    name: "urls",
    kind: "scalar",
    T: 9,
    repeated: !0
  }, {
    no: 2,
    name: "username",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "credential",
    kind: "scalar",
    T: 9
  }]),
  eh = R.makeMessageType("livekit.SpeakersChanged", () => [{
    no: 1,
    name: "speakers",
    kind: "message",
    T: va,
    repeated: !0
  }]),
  th = R.makeMessageType("livekit.RoomUpdate", () => [{
    no: 1,
    name: "room",
    kind: "message",
    T: sn
  }]),
  ih = R.makeMessageType("livekit.ConnectionQualityInfo", () => [{
    no: 1,
    name: "participant_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "quality",
    kind: "enum",
    T: R.getEnumType(ri)
  }, {
    no: 3,
    name: "score",
    kind: "scalar",
    T: 2
  }]),
  nh = R.makeMessageType("livekit.ConnectionQualityUpdate", () => [{
    no: 1,
    name: "updates",
    kind: "message",
    T: ih,
    repeated: !0
  }]),
  sh = R.makeMessageType("livekit.StreamStateInfo", () => [{
    no: 1,
    name: "participant_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "state",
    kind: "enum",
    T: R.getEnumType(Gn)
  }]),
  rh = R.makeMessageType("livekit.StreamStateUpdate", () => [{
    no: 1,
    name: "stream_states",
    kind: "message",
    T: sh,
    repeated: !0
  }]),
  Ls = R.makeMessageType("livekit.SubscribedQuality", () => [{
    no: 1,
    name: "quality",
    kind: "enum",
    T: R.getEnumType(Rs)
  }, {
    no: 2,
    name: "enabled",
    kind: "scalar",
    T: 8
  }]),
  oh = R.makeMessageType("livekit.SubscribedCodec", () => [{
    no: 1,
    name: "codec",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "qualities",
    kind: "message",
    T: Ls,
    repeated: !0
  }]),
  ah = R.makeMessageType("livekit.SubscribedQualityUpdate", () => [{
    no: 1,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "subscribed_qualities",
    kind: "message",
    T: Ls,
    repeated: !0
  }, {
    no: 3,
    name: "subscribed_codecs",
    kind: "message",
    T: oh,
    repeated: !0
  }]),
  ch = R.makeMessageType("livekit.SubscribedAudioCodecUpdate", () => [{
    no: 1,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "subscribed_audio_codecs",
    kind: "message",
    T: qu,
    repeated: !0
  }]),
  La = R.makeMessageType("livekit.TrackPermission", () => [{
    no: 1,
    name: "participant_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "all_tracks",
    kind: "scalar",
    T: 8
  }, {
    no: 3,
    name: "track_sids",
    kind: "scalar",
    T: 9,
    repeated: !0
  }, {
    no: 4,
    name: "participant_identity",
    kind: "scalar",
    T: 9
  }]),
  Ua = R.makeMessageType("livekit.SubscriptionPermission", () => [{
    no: 1,
    name: "all_participants",
    kind: "scalar",
    T: 8
  }, {
    no: 2,
    name: "track_permissions",
    kind: "message",
    T: La,
    repeated: !0
  }]),
  dh = R.makeMessageType("livekit.SubscriptionPermissionUpdate", () => [{
    no: 1,
    name: "participant_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "allowed",
    kind: "scalar",
    T: 8
  }]),
  lh = R.makeMessageType("livekit.RoomMovedResponse", () => [{
    no: 1,
    name: "room",
    kind: "message",
    T: sn
  }, {
    no: 2,
    name: "token",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "participant",
    kind: "message",
    T: Mt
  }, {
    no: 4,
    name: "other_participants",
    kind: "message",
    T: Mt,
    repeated: !0
  }]),
  Us = R.makeMessageType("livekit.SyncState", () => [{
    no: 1,
    name: "answer",
    kind: "message",
    T: St
  }, {
    no: 2,
    name: "subscription",
    kind: "message",
    T: an
  }, {
    no: 3,
    name: "publish_tracks",
    kind: "message",
    T: Ds,
    repeated: !0
  }, {
    no: 4,
    name: "data_channels",
    kind: "message",
    T: Fa,
    repeated: !0
  }, {
    no: 5,
    name: "offer",
    kind: "message",
    T: St
  }, {
    no: 6,
    name: "track_sids_disabled",
    kind: "scalar",
    T: 9,
    repeated: !0
  }, {
    no: 7,
    name: "datachannel_receive_states",
    kind: "message",
    T: ja,
    repeated: !0
  }, {
    no: 8,
    name: "publish_data_tracks",
    kind: "message",
    T: xa,
    repeated: !0
  }]),
  ja = R.makeMessageType("livekit.DataChannelReceiveState", () => [{
    no: 1,
    name: "publisher_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "last_seq",
    kind: "scalar",
    T: 13
  }]),
  Fa = R.makeMessageType("livekit.DataChannelInfo", () => [{
    no: 1,
    name: "label",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "id",
    kind: "scalar",
    T: 13
  }, {
    no: 3,
    name: "target",
    kind: "enum",
    T: R.getEnumType(qe)
  }]),
  ze = R.makeMessageType("livekit.SimulateScenario", () => [{
    no: 1,
    name: "speaker_update",
    kind: "scalar",
    T: 5,
    oneof: "scenario"
  }, {
    no: 2,
    name: "node_failure",
    kind: "scalar",
    T: 8,
    oneof: "scenario"
  }, {
    no: 3,
    name: "migration",
    kind: "scalar",
    T: 8,
    oneof: "scenario"
  }, {
    no: 4,
    name: "server_leave",
    kind: "scalar",
    T: 8,
    oneof: "scenario"
  }, {
    no: 5,
    name: "switch_candidate_protocol",
    kind: "enum",
    T: R.getEnumType(Wu),
    oneof: "scenario"
  }, {
    no: 6,
    name: "subscriber_bandwidth",
    kind: "scalar",
    T: 3,
    oneof: "scenario"
  }, {
    no: 7,
    name: "disconnect_signal_on_resume",
    kind: "scalar",
    T: 8,
    oneof: "scenario"
  }, {
    no: 8,
    name: "disconnect_signal_on_resume_no_messages",
    kind: "scalar",
    T: 8,
    oneof: "scenario"
  }, {
    no: 9,
    name: "leave_request_full_reconnect",
    kind: "scalar",
    T: 8,
    oneof: "scenario"
  }]),
  Ba = R.makeMessageType("livekit.Ping", () => [{
    no: 1,
    name: "timestamp",
    kind: "scalar",
    T: 3
  }, {
    no: 2,
    name: "rtt",
    kind: "scalar",
    T: 3
  }]),
  uh = R.makeMessageType("livekit.Pong", () => [{
    no: 1,
    name: "last_ping_timestamp",
    kind: "scalar",
    T: 3
  }, {
    no: 2,
    name: "timestamp",
    kind: "scalar",
    T: 3
  }]),
  hh = R.makeMessageType("livekit.RegionSettings", () => [{
    no: 1,
    name: "regions",
    kind: "message",
    T: mh,
    repeated: !0
  }]),
  mh = R.makeMessageType("livekit.RegionInfo", () => [{
    no: 1,
    name: "region",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "url",
    kind: "scalar",
    T: 9
  }, {
    no: 3,
    name: "distance",
    kind: "scalar",
    T: 3
  }]),
  fh = R.makeMessageType("livekit.SubscriptionResponse", () => [{
    no: 1,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 2,
    name: "err",
    kind: "enum",
    T: R.getEnumType(Du)
  }]),
  ph = R.makeMessageType("livekit.RequestResponse", () => [{
    no: 1,
    name: "request_id",
    kind: "scalar",
    T: 13
  }, {
    no: 2,
    name: "reason",
    kind: "enum",
    T: R.getEnumType(js)
  }, {
    no: 3,
    name: "message",
    kind: "scalar",
    T: 9
  }, {
    no: 4,
    name: "trickle",
    kind: "message",
    T: rn,
    oneof: "request"
  }, {
    no: 5,
    name: "add_track",
    kind: "message",
    T: pi,
    oneof: "request"
  }, {
    no: 6,
    name: "mute",
    kind: "message",
    T: on,
    oneof: "request"
  }, {
    no: 7,
    name: "update_metadata",
    kind: "message",
    T: Ns,
    oneof: "request"
  }, {
    no: 8,
    name: "update_audio_track",
    kind: "message",
    T: As,
    oneof: "request"
  }, {
    no: 9,
    name: "update_video_track",
    kind: "message",
    T: Da,
    oneof: "request"
  }, {
    no: 10,
    name: "publish_data_track",
    kind: "message",
    T: Ia,
    oneof: "request"
  }, {
    no: 11,
    name: "unpublish_data_track",
    kind: "message",
    T: Ma,
    oneof: "request"
  }]),
  js = R.makeEnum("livekit.RequestResponse.Reason", [{
    no: 0,
    name: "OK"
  }, {
    no: 1,
    name: "NOT_FOUND"
  }, {
    no: 2,
    name: "NOT_ALLOWED"
  }, {
    no: 3,
    name: "LIMIT_EXCEEDED"
  }, {
    no: 4,
    name: "QUEUED"
  }, {
    no: 5,
    name: "UNSUPPORTED_TYPE"
  }, {
    no: 6,
    name: "UNCLASSIFIED_ERROR"
  }, {
    no: 7,
    name: "INVALID_HANDLE"
  }, {
    no: 8,
    name: "INVALID_NAME"
  }, {
    no: 9,
    name: "DUPLICATE_HANDLE"
  }, {
    no: 10,
    name: "DUPLICATE_NAME"
  }]),
  gh = R.makeMessageType("livekit.TrackSubscribed", () => [{
    no: 1,
    name: "track_sid",
    kind: "scalar",
    T: 9
  }]),
  Va = R.makeMessageType("livekit.ConnectionSettings", () => [{
    no: 1,
    name: "auto_subscribe",
    kind: "scalar",
    T: 8
  }, {
    no: 2,
    name: "adaptive_stream",
    kind: "scalar",
    T: 8
  }, {
    no: 3,
    name: "subscriber_allow_pause",
    kind: "scalar",
    T: 8,
    opt: !0
  }, {
    no: 4,
    name: "disable_ice_lite",
    kind: "scalar",
    T: 8
  }, {
    no: 5,
    name: "auto_subscribe_data_track",
    kind: "scalar",
    T: 8,
    opt: !0
  }]),
  vh = R.makeMessageType("livekit.JoinRequest", () => [{
    no: 1,
    name: "client_info",
    kind: "message",
    T: Ca
  }, {
    no: 2,
    name: "connection_settings",
    kind: "message",
    T: Va
  }, {
    no: 3,
    name: "metadata",
    kind: "scalar",
    T: 9
  }, {
    no: 4,
    name: "participant_attributes",
    kind: "map",
    K: 9,
    V: {
      kind: "scalar",
      T: 9
    }
  }, {
    no: 5,
    name: "add_track_requests",
    kind: "message",
    T: pi,
    repeated: !0
  }, {
    no: 6,
    name: "publisher_offer",
    kind: "message",
    T: St
  }, {
    no: 7,
    name: "reconnect",
    kind: "scalar",
    T: 8
  }, {
    no: 8,
    name: "reconnect_reason",
    kind: "enum",
    T: R.getEnumType(Pt)
  }, {
    no: 9,
    name: "participant_sid",
    kind: "scalar",
    T: 9
  }, {
    no: 10,
    name: "sync_state",
    kind: "message",
    T: Us
  }]),
  bh = R.makeMessageType("livekit.WrappedJoinRequest", () => [{
    no: 1,
    name: "compression",
    kind: "enum",
    T: R.getEnumType(yh)
  }, {
    no: 2,
    name: "join_request",
    kind: "scalar",
    T: 12
  }]),
  yh = R.makeEnum("livekit.WrappedJoinRequest.Compression", [{
    no: 0,
    name: "NONE"
  }, {
    no: 1,
    name: "GZIP"
  }]),
  kh = R.makeMessageType("livekit.MediaSectionsRequirement", () => [{
    no: 1,
    name: "num_audios",
    kind: "scalar",
    T: 13
  }, {
    no: 2,
    name: "num_videos",
    kind: "scalar",
    T: 13
  }]);


var Oi = {
    exports: {}
  },
  Th = Oi.exports,
  Nr;

function Ch() {
  return Nr || (Nr = 1, function(i) {
    (function(e, t) {
      i.exports ? i.exports = t() : e.log = t()
    })(Th, function() {
      var e = function() {},
        t = "undefined",
        n = typeof window !== t && typeof window.navigator !== t && /Trident\/|MSIE /.test(window.navigator.userAgent),
        s = ["trace", "debug", "info", "warn", "error"],
        r = {},
        a = null;

      function o(p, _) {
        var w = p[_];
        if (typeof w.bind == "function") return w.bind(p);
        try {
          return Function.prototype.bind.call(w, p)
        } catch {
          return function() {
            return Function.prototype.apply.apply(w, [p, arguments])
          }
        }
      }

      function c() {
        console.log && (console.log.apply ? console.log.apply(console, arguments) : Function.prototype.apply.apply(console.log, [console, arguments])), console.trace && console.trace()
      }

      function d(p) {
        return p === "debug" && (p = "log"), typeof console === t ? !1 : p === "trace" && n ? c : console[p] !== void 0 ? o(console, p) : console.log !== void 0 ? o(console, "log") : e
      }

      function l() {
        for (var p = this.getLevel(), _ = 0; _ < s.length; _++) {
          var w = s[_];
          this[w] = _ < p ? e : this.methodFactory(w, p, this.name)
        }
        if (this.log = this.debug, typeof console === t && p < this.levels.SILENT) return "No console available for logging"
      }

      function u(p) {
        return function() {
          typeof console !== t && (l.call(this), this[p].apply(this, arguments))
        }
      }

      function h(p, _, w) {
        return d(p) || u.apply(this, arguments)
      }

      function m(p, _) {
        var w = this,
          k, P, y, S = "loglevel";
        typeof p == "string" ? S += ":" + p : typeof p == "symbol" && (S = void 0);

        function E(g) {
          var T = (s[g] || "silent").toUpperCase();
          if (!(typeof window === t || !S)) {
            try {
              window.localStorage[S] = T;
              return
            } catch {}
            try {
              window.document.cookie = encodeURIComponent(S) + "=" + T + ";"
            } catch {}
          }
        }

        function x() {
          var g;
          if (!(typeof window === t || !S)) {
            try {
              g = window.localStorage[S]
            } catch {}
            if (typeof g === t) try {
              var T = window.document.cookie,
                A = encodeURIComponent(S),
                F = T.indexOf(A + "=");
              F !== -1 && (g = /^([^;]+)/.exec(T.slice(F + A.length + 1))[1])
            } catch {}
            return w.levels[g] === void 0 && (g = void 0), g
          }
        }

        function D() {
          if (!(typeof window === t || !S)) {
            try {
              window.localStorage.removeItem(S)
            } catch {}
            try {
              window.document.cookie = encodeURIComponent(S) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC"
            } catch {}
          }
        }

        function C(g) {
          var T = g;
          if (typeof T == "string" && w.levels[T.toUpperCase()] !== void 0 && (T = w.levels[T.toUpperCase()]), typeof T == "number" && T >= 0 && T <= w.levels.SILENT) return T;
          throw new TypeError("log.setLevel() called with invalid level: " + g)
        }
        w.name = p, w.levels = {
          TRACE: 0,
          DEBUG: 1,
          INFO: 2,
          WARN: 3,
          ERROR: 4,
          SILENT: 5
        }, w.methodFactory = _ || h, w.getLevel = function() {
          return y ?? P ?? k
        }, w.setLevel = function(g, T) {
          return y = C(g), T !== !1 && E(y), l.call(w)
        }, w.setDefaultLevel = function(g) {
          P = C(g), x() || w.setLevel(g, !1)
        }, w.resetLevel = function() {
          y = null, D(), l.call(w)
        }, w.enableAll = function(g) {
          w.setLevel(w.levels.TRACE, g)
        }, w.disableAll = function(g) {
          w.setLevel(w.levels.SILENT, g)
        }, w.rebuild = function() {
          if (a !== w && (k = C(a.getLevel())), l.call(w), a === w)
            for (var g in r) r[g].rebuild()
        }, k = C(a ? a.getLevel() : "WARN");
        var M = x();
        M != null && (y = C(M)), l.call(w)
      }
      a = new m, a.getLogger = function(_) {
        if (typeof _ != "symbol" && typeof _ != "string" || _ === "") throw new TypeError("You must supply a name when creating a logger.");
        var w = r[_];
        return w || (w = r[_] = new m(_, a.methodFactory)), w
      };
      var f = typeof window !== t ? window.log : void 0;
      return a.noConflict = function() {
        return typeof window !== t && window.log === a && (window.log = f), a
      }, a.getLoggers = function() {
        return r
      }, a.default = a, a
    })
  }(Oi)), Oi.exports
}
var dn = Ch(),
  zn;
(function(i) {
  i[i.trace = 0] = "trace", i[i.debug = 1] = "debug", i[i.info = 2] = "info", i[i.warn = 3] = "warn", i[i.error = 4] = "error", i[i.silent = 5] = "silent"
})(zn || (zn = {}));
var Ue;
(function(i) {
  i.Default = "livekit", i.Room = "livekit-room", i.TokenSource = "livekit-token-source", i.Participant = "livekit-participant", i.Track = "livekit-track", i.Publication = "livekit-track-publication", i.Engine = "livekit-engine", i.Signal = "livekit-signal", i.PCManager = "livekit-pc-manager", i.PCTransport = "livekit-pc-transport", i.E2EE = "lk-e2ee", i.DataTracks = "livekit-data-tracks"
})(Ue || (Ue = {}));

// Initialize the logger after the logging runtime and before setting its level.
let X = dn.getLogger("livekit");
Object.values(Ue).map(i => dn.getLogger(i));
X.setDefaultLevel(zn.info);

function Ye(i) {
  const e = dn.getLogger(i);
  return e.setDefaultLevel(X.getLevel()), e
}
const wh = dn.getLogger("lk-e2ee"),
  Zt = 7e3,
  Eh = [0, 300, 2 * 2 * 300, 3 * 3 * 300, 4 * 4 * 300, Zt, Zt, Zt, Zt, Zt];
class Ph {
  constructor(e) {
    this._retryDelays = e !== void 0 ? [...e] : Eh
  }
  nextRetryDelayInMs(e) {
    if (e.retryCount >= this._retryDelays.length) return null;
    const t = this._retryDelays[e.retryCount];
    return e.retryCount <= 1 ? t : t + Math.random() * 1e3
  }
}







function at(i) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var e = i[Symbol.asyncIterator],
    t;
  return e ? e.call(i) : (i = typeof Lr == "function" ? Lr(i) : i[Symbol.iterator](), t = {}, n("next"), n("throw"), n("return"), t[Symbol.asyncIterator] = function() {
    return this
  }, t);

  function n(r) {
    t[r] = i[r] && function(a) {
      return new Promise(function(o, c) {
        a = i[r](a), s(o, c, a.done, a.value)
      })
    }
  }

  function s(r, a, o, c) {
    Promise.resolve(c).then(function(d) {
      r({
        value: d,
        done: o
      })
    }, a)
  }
}
var Ci = {
    exports: {}
  },
  Ur;

function _h() {
  if (Ur) return Ci.exports;
  Ur = 1;
  var i = typeof Reflect == "object" ? Reflect : null,
    e = i && typeof i.apply == "function" ? i.apply : function(S, E, x) {
      return Function.prototype.apply.call(S, E, x)
    },
    t;
  i && typeof i.ownKeys == "function" ? t = i.ownKeys : Object.getOwnPropertySymbols ? t = function(S) {
    return Object.getOwnPropertyNames(S).concat(Object.getOwnPropertySymbols(S))
  } : t = function(S) {
    return Object.getOwnPropertyNames(S)
  };

  function n(y) {
    console && console.warn && console.warn(y)
  }
  var s = Number.isNaN || function(S) {
    return S !== S
  };

  function r() {
    r.init.call(this)
  }
  Ci.exports = r, Ci.exports.once = w, r.EventEmitter = r, r.prototype._events = void 0, r.prototype._eventsCount = 0, r.prototype._maxListeners = void 0;
  var a = 10;

  function o(y) {
    if (typeof y != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof y)
  }
  Object.defineProperty(r, "defaultMaxListeners", {
    enumerable: !0,
    get: function() {
      return a
    },
    set: function(y) {
      if (typeof y != "number" || y < 0 || s(y)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + y + ".");
      a = y
    }
  }), r.init = function() {
    (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0
  }, r.prototype.setMaxListeners = function(S) {
    if (typeof S != "number" || S < 0 || s(S)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + S + ".");
    return this._maxListeners = S, this
  };

  function c(y) {
    return y._maxListeners === void 0 ? r.defaultMaxListeners : y._maxListeners
  }
  r.prototype.getMaxListeners = function() {
    return c(this)
  }, r.prototype.emit = function(S) {
    for (var E = [], x = 1; x < arguments.length; x++) E.push(arguments[x]);
    var D = S === "error",
      C = this._events;
    if (C !== void 0) D = D && C.error === void 0;
    else if (!D) return !1;
    if (D) {
      var M;
      if (E.length > 0 && (M = E[0]), M instanceof Error) throw M;
      var g = new Error("Unhandled error." + (M ? " (" + M.message + ")" : ""));
      throw g.context = M, g
    }
    var T = C[S];
    if (T === void 0) return !1;
    if (typeof T == "function") e(T, this, E);
    else
      for (var A = T.length, F = f(T, A), x = 0; x < A; ++x) e(F[x], this, E);
    return !0
  };

  function d(y, S, E, x) {
    var D, C, M;
    if (o(E), C = y._events, C === void 0 ? (C = y._events = Object.create(null), y._eventsCount = 0) : (C.newListener !== void 0 && (y.emit("newListener", S, E.listener ? E.listener : E), C = y._events), M = C[S]), M === void 0) M = C[S] = E, ++y._eventsCount;
    else if (typeof M == "function" ? M = C[S] = x ? [E, M] : [M, E] : x ? M.unshift(E) : M.push(E), D = c(y), D > 0 && M.length > D && !M.warned) {
      M.warned = !0;
      var g = new Error("Possible EventEmitter memory leak detected. " + M.length + " " + String(S) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      g.name = "MaxListenersExceededWarning", g.emitter = y, g.type = S, g.count = M.length, n(g)
    }
    return y
  }
  r.prototype.addListener = function(S, E) {
    return d(this, S, E, !1)
  }, r.prototype.on = r.prototype.addListener, r.prototype.prependListener = function(S, E) {
    return d(this, S, E, !0)
  };

  function l() {
    if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments)
  }

  function u(y, S, E) {
    var x = {
        fired: !1,
        wrapFn: void 0,
        target: y,
        type: S,
        listener: E
      },
      D = l.bind(x);
    return D.listener = E, x.wrapFn = D, D
  }
  r.prototype.once = function(S, E) {
    return o(E), this.on(S, u(this, S, E)), this
  }, r.prototype.prependOnceListener = function(S, E) {
    return o(E), this.prependListener(S, u(this, S, E)), this
  }, r.prototype.removeListener = function(S, E) {
    var x, D, C, M, g;
    if (o(E), D = this._events, D === void 0) return this;
    if (x = D[S], x === void 0) return this;
    if (x === E || x.listener === E) --this._eventsCount === 0 ? this._events = Object.create(null) : (delete D[S], D.removeListener && this.emit("removeListener", S, x.listener || E));
    else if (typeof x != "function") {
      for (C = -1, M = x.length - 1; M >= 0; M--)
        if (x[M] === E || x[M].listener === E) {
          g = x[M].listener, C = M;
          break
        } if (C < 0) return this;
      C === 0 ? x.shift() : p(x, C), x.length === 1 && (D[S] = x[0]), D.removeListener !== void 0 && this.emit("removeListener", S, g || E)
    }
    return this
  }, r.prototype.off = r.prototype.removeListener, r.prototype.removeAllListeners = function(S) {
    var E, x, D;
    if (x = this._events, x === void 0) return this;
    if (x.removeListener === void 0) return arguments.length === 0 ? (this._events = Object.create(null), this._eventsCount = 0) : x[S] !== void 0 && (--this._eventsCount === 0 ? this._events = Object.create(null) : delete x[S]), this;
    if (arguments.length === 0) {
      var C = Object.keys(x),
        M;
      for (D = 0; D < C.length; ++D) M = C[D], M !== "removeListener" && this.removeAllListeners(M);
      return this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0, this
    }
    if (E = x[S], typeof E == "function") this.removeListener(S, E);
    else if (E !== void 0)
      for (D = E.length - 1; D >= 0; D--) this.removeListener(S, E[D]);
    return this
  };

  function h(y, S, E) {
    var x = y._events;
    if (x === void 0) return [];
    var D = x[S];
    return D === void 0 ? [] : typeof D == "function" ? E ? [D.listener || D] : [D] : E ? _(D) : f(D, D.length)
  }
  r.prototype.listeners = function(S) {
    return h(this, S, !0)
  }, r.prototype.rawListeners = function(S) {
    return h(this, S, !1)
  }, r.listenerCount = function(y, S) {
    return typeof y.listenerCount == "function" ? y.listenerCount(S) : m.call(y, S)
  }, r.prototype.listenerCount = m;

  function m(y) {
    var S = this._events;
    if (S !== void 0) {
      var E = S[y];
      if (typeof E == "function") return 1;
      if (E !== void 0) return E.length
    }
    return 0
  }
  r.prototype.eventNames = function() {
    return this._eventsCount > 0 ? t(this._events) : []
  };

  function f(y, S) {
    for (var E = new Array(S), x = 0; x < S; ++x) E[x] = y[x];
    return E
  }

  function p(y, S) {
    for (; S + 1 < y.length; S++) y[S] = y[S + 1];
    y.pop()
  }

  function _(y) {
    for (var S = new Array(y.length), E = 0; E < S.length; ++E) S[E] = y[E].listener || y[E];
    return S
  }

  function w(y, S) {
    return new Promise(function(E, x) {
      function D(M) {
        y.removeListener(S, C), x(M)
      }

      function C() {
        typeof y.removeListener == "function" && y.removeListener("error", D), E([].slice.call(arguments))
      }
      P(y, S, C, {
        once: !0
      }), S !== "error" && k(y, D, {
        once: !0
      })
    })
  }

  function k(y, S, E) {
    typeof y.on == "function" && P(y, "error", S, E)
  }

  function P(y, S, E, x) {
    if (typeof y.on == "function") x.once ? y.once(S, E) : y.on(S, E);
    else if (typeof y.addEventListener == "function") y.addEventListener(S, function D(C) {
      x.once && y.removeEventListener(S, D), E(C)
    });
    else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof y)
  }
  return Ci.exports
}
var et = _h();
let qa = !0,
  Wa = !0;





function Ih(i) {
  return typeof i != "boolean" ? new Error("Argument type: " + typeof i + ". Please use a boolean.") : (qa = i, i ? "adapter.js logging disabled" : "adapter.js logging enabled")
}

function xh(i) {
  return typeof i != "boolean" ? new Error("Argument type: " + typeof i + ". Please use a boolean.") : (Wa = !i, "adapter.js deprecation warnings " + (i ? "disabled" : "enabled"))
}

function Ha() {
  if (typeof window == "object") {
    if (qa) return;
    typeof console < "u" && typeof console.log == "function" && console.log.apply(console, arguments)
  }
}

function Fs(i, e) {
  Wa && console.warn(i + " is deprecated, please use " + e + " instead.")
}

function Mh(i) {
  const e = {
    browser: null,
    version: null
  };
  if (typeof i > "u" || !i.navigator || !i.navigator.userAgent) return e.browser = "Not a browser.", e;
  const {
    navigator: t
  } = i;
  if (t.userAgentData && t.userAgentData.brands) {
    const n = t.userAgentData.brands.find(s => s.brand === "Chromium");
    if (n) return {
      browser: "chrome",
      version: parseInt(n.version, 10)
    }
  }
  if (t.mozGetUserMedia) e.browser = "firefox", e.version = parseInt(oi(t.userAgent, /Firefox\/(\d+)\./, 1));
  else if (t.webkitGetUserMedia || i.isSecureContext === !1 && i.webkitRTCPeerConnection) e.browser = "chrome", e.version = parseInt(oi(t.userAgent, /Chrom(e|ium)\/(\d+)\./, 2));
  else if (i.RTCPeerConnection && t.userAgent.match(/AppleWebKit\/(\d+)\./)) e.browser = "safari", e.version = parseInt(oi(t.userAgent, /AppleWebKit\/(\d+)\./, 1)), e.supportsUnifiedPlan = i.RTCRtpTransceiver && "currentDirection" in i.RTCRtpTransceiver.prototype, e._safariVersion = oi(t.userAgent, /Version\/(\d+(\.?\d+))/, 1);
  else return e.browser = "Not a supported browser.", e;
  return e
}



function Ka(i) {
  return jr(i) ? Object.keys(i).reduce(function(e, t) {
    const n = jr(i[t]),
      s = n ? Ka(i[t]) : i[t],
      r = n && !Object.keys(s).length;
    return s === void 0 || r ? e : Object.assign(e, {
      [t]: s
    })
  }, {}) : i
}

function $n(i, e, t) {
  !e || t.has(e.id) || (t.set(e.id, e), Object.keys(e).forEach(n => {
    n.endsWith("Id") ? $n(i, i.get(e[n]), t) : n.endsWith("Ids") && e[n].forEach(s => {
      $n(i, i.get(s), t)
    })
  }))
}


const Br = Ha;

function Ga(i, e) {
  const t = i && i.navigator;
  if (!t.mediaDevices) return;
  const n = function(o) {
      if (typeof o != "object" || o.mandatory || o.optional) return o;
      const c = {};
      return Object.keys(o).forEach(d => {
        if (d === "require" || d === "advanced" || d === "mediaSource") return;
        const l = typeof o[d] == "object" ? o[d] : {
          ideal: o[d]
        };
        l.exact !== void 0 && typeof l.exact == "number" && (l.min = l.max = l.exact);
        const u = function(h, m) {
          return h ? h + m.charAt(0).toUpperCase() + m.slice(1) : m === "deviceId" ? "sourceId" : m
        };
        if (l.ideal !== void 0) {
          c.optional = c.optional || [];
          let h = {};
          typeof l.ideal == "number" ? (h[u("min", d)] = l.ideal, c.optional.push(h), h = {}, h[u("max", d)] = l.ideal, c.optional.push(h)) : (h[u("", d)] = l.ideal, c.optional.push(h))
        }
        l.exact !== void 0 && typeof l.exact != "number" ? (c.mandatory = c.mandatory || {}, c.mandatory[u("", d)] = l.exact) : ["min", "max"].forEach(h => {
          l[h] !== void 0 && (c.mandatory = c.mandatory || {}, c.mandatory[u(h, d)] = l[h])
        })
      }), o.advanced && (c.optional = (c.optional || []).concat(o.advanced)), c
    },
    s = function(o, c) {
      if (e.version >= 61) return c(o);
      if (o = JSON.parse(JSON.stringify(o)), o && typeof o.audio == "object") {
        const d = function(l, u, h) {
          u in l && !(h in l) && (l[h] = l[u], delete l[u])
        };
        o = JSON.parse(JSON.stringify(o)), d(o.audio, "autoGainControl", "googAutoGainControl"), d(o.audio, "noiseSuppression", "googNoiseSuppression"), o.audio = n(o.audio)
      }
      if (o && typeof o.video == "object") {
        let d = o.video.facingMode;
        d = d && (typeof d == "object" ? d : {
          ideal: d
        });
        const l = e.version < 66;
        if (d && (d.exact === "user" || d.exact === "environment" || d.ideal === "user" || d.ideal === "environment") && !(t.mediaDevices.getSupportedConstraints && t.mediaDevices.getSupportedConstraints().facingMode && !l)) {
          delete o.video.facingMode;
          let u;
          if (d.exact === "environment" || d.ideal === "environment" ? u = ["back", "rear"] : (d.exact === "user" || d.ideal === "user") && (u = ["front"]), u) return t.mediaDevices.enumerateDevices().then(h => {
            h = h.filter(f => f.kind === "videoinput");
            let m = h.find(f => u.some(p => f.label.toLowerCase().includes(p)));
            return !m && h.length && u.includes("back") && (m = h[h.length - 1]), m && (o.video.deviceId = d.exact ? {
              exact: m.deviceId
            } : {
              ideal: m.deviceId
            }), o.video = n(o.video), Br("chrome: " + JSON.stringify(o)), c(o)
          })
        }
        o.video = n(o.video)
      }
      return Br("chrome: " + JSON.stringify(o)), c(o)
    },
    r = function(o) {
      return e.version >= 64 ? o : {
        name: {
          PermissionDeniedError: "NotAllowedError",
          PermissionDismissedError: "NotAllowedError",
          InvalidStateError: "NotAllowedError",
          DevicesNotFoundError: "NotFoundError",
          ConstraintNotSatisfiedError: "OverconstrainedError",
          TrackStartError: "NotReadableError",
          MediaDeviceFailedDueToShutdown: "NotAllowedError",
          MediaDeviceKillSwitchOn: "NotAllowedError",
          TabCaptureError: "AbortError",
          ScreenCaptureError: "AbortError",
          DeviceCaptureError: "AbortError"
        } [o.name] || o.name,
        message: o.message,
        constraint: o.constraint || o.constraintName,
        toString() {
          return this.name + (this.message && ": ") + this.message
        }
      }
    },
    a = function(o, c, d) {
      s(o, l => {
        t.webkitGetUserMedia(l, c, u => {
          d && d(r(u))
        })
      })
    };
  if (t.getUserMedia = a.bind(t), t.mediaDevices.getUserMedia) {
    const o = t.mediaDevices.getUserMedia.bind(t.mediaDevices);
    t.mediaDevices.getUserMedia = function(c) {
      return s(c, d => o(d).then(l => {
        if (d.audio && !l.getAudioTracks().length || d.video && !l.getVideoTracks().length) throw l.getTracks().forEach(u => {
          u.stop()
        }), new DOMException("", "NotFoundError");
        return l
      }, l => Promise.reject(r(l))))
    }
  }
}



function za(i) {
  if (typeof i == "object" && i.RTCPeerConnection && !("ontrack" in i.RTCPeerConnection.prototype)) {
    Object.defineProperty(i.RTCPeerConnection.prototype, "ontrack", {
      get() {
        return this._ontrack
      },
      set(t) {
        this._ontrack && this.removeEventListener("track", this._ontrack), this.addEventListener("track", this._ontrack = t)
      },
      enumerable: !0,
      configurable: !0
    });
    const e = i.RTCPeerConnection.prototype.setRemoteDescription;
    i.RTCPeerConnection.prototype.setRemoteDescription = function() {
      return this._ontrackpoly || (this._ontrackpoly = n => {
        n.stream.addEventListener("addtrack", s => {
          let r;
          i.RTCPeerConnection.prototype.getReceivers ? r = this.getReceivers().find(o => o.track && o.track.id === s.track.id) : r = {
            track: s.track
          };
          const a = new Event("track");
          a.track = s.track, a.receiver = r, a.transceiver = {
            receiver: r
          }, a.streams = [n.stream], this.dispatchEvent(a)
        }), n.stream.getTracks().forEach(s => {
          let r;
          i.RTCPeerConnection.prototype.getReceivers ? r = this.getReceivers().find(o => o.track && o.track.id === s.id) : r = {
            track: s
          };
          const a = new Event("track");
          a.track = s, a.receiver = r, a.transceiver = {
            receiver: r
          }, a.streams = [n.stream], this.dispatchEvent(a)
        })
      }, this.addEventListener("addstream", this._ontrackpoly)), e.apply(this, arguments)
    }
  } else Nt(i, "track", e => (e.transceiver || Object.defineProperty(e, "transceiver", {
    value: {
      receiver: e.receiver
    }
  }), e))
}



function Qa(i) {
  if (!(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender && i.RTCRtpReceiver)) return;
  if (!("getStats" in i.RTCRtpSender.prototype)) {
    const t = i.RTCPeerConnection.prototype.getSenders;
    t && (i.RTCPeerConnection.prototype.getSenders = function() {
      const r = t.apply(this, []);
      return r.forEach(a => a._pc = this), r
    });
    const n = i.RTCPeerConnection.prototype.addTrack;
    n && (i.RTCPeerConnection.prototype.addTrack = function() {
      const r = n.apply(this, arguments);
      return r._pc = this, r
    }), i.RTCRtpSender.prototype.getStats = function() {
      const r = this;
      return this._pc.getStats().then(a => Fr(a, r.track, !0))
    }
  }
  if (!("getStats" in i.RTCRtpReceiver.prototype)) {
    const t = i.RTCPeerConnection.prototype.getReceivers;
    t && (i.RTCPeerConnection.prototype.getReceivers = function() {
      const s = t.apply(this, []);
      return s.forEach(r => r._pc = this), s
    }), Nt(i, "track", n => (n.receiver._pc = n.srcElement, n)), i.RTCRtpReceiver.prototype.getStats = function() {
      const s = this;
      return this._pc.getStats().then(r => Fr(r, s.track, !1))
    }
  }
  if (!("getStats" in i.RTCRtpSender.prototype && "getStats" in i.RTCRtpReceiver.prototype)) return;
  const e = i.RTCPeerConnection.prototype.getStats;
  i.RTCPeerConnection.prototype.getStats = function() {
    if (arguments.length > 0 && arguments[0] instanceof i.MediaStreamTrack) {
      const n = arguments[0];
      let s, r, a;
      return this.getSenders().forEach(o => {
        o.track === n && (s ? a = !0 : s = o)
      }), this.getReceivers().forEach(o => (o.track === n && (r ? a = !0 : r = o), o.track === n)), a || s && r ? Promise.reject(new DOMException("There are more than one sender or receiver for the track.", "InvalidAccessError")) : s ? s.getStats() : r ? r.getStats() : Promise.reject(new DOMException("There is no sender or receiver for the track.", "InvalidAccessError"))
    }
    return e.apply(this, arguments)
  }
}

function Ya(i) {
  i.RTCPeerConnection.prototype.getLocalStreams = function() {
    return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, Object.keys(this._shimmedLocalStreams).map(a => this._shimmedLocalStreams[a][0])
  };
  const e = i.RTCPeerConnection.prototype.addTrack;
  i.RTCPeerConnection.prototype.addTrack = function(a, o) {
    if (!o) return e.apply(this, arguments);
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    const c = e.apply(this, arguments);
    return this._shimmedLocalStreams[o.id] ? this._shimmedLocalStreams[o.id].indexOf(c) === -1 && this._shimmedLocalStreams[o.id].push(c) : this._shimmedLocalStreams[o.id] = [o, c], c
  };
  const t = i.RTCPeerConnection.prototype.addStream;
  i.RTCPeerConnection.prototype.addStream = function(a) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {}, a.getTracks().forEach(d => {
      if (this.getSenders().find(u => u.track === d)) throw new DOMException("Track already exists.", "InvalidAccessError")
    });
    const o = this.getSenders();
    t.apply(this, arguments);
    const c = this.getSenders().filter(d => o.indexOf(d) === -1);
    this._shimmedLocalStreams[a.id] = [a].concat(c)
  };
  const n = i.RTCPeerConnection.prototype.removeStream;
  i.RTCPeerConnection.prototype.removeStream = function(a) {
    return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, delete this._shimmedLocalStreams[a.id], n.apply(this, arguments)
  };
  const s = i.RTCPeerConnection.prototype.removeTrack;
  i.RTCPeerConnection.prototype.removeTrack = function(a) {
    return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, a && Object.keys(this._shimmedLocalStreams).forEach(o => {
      const c = this._shimmedLocalStreams[o].indexOf(a);
      c !== -1 && this._shimmedLocalStreams[o].splice(c, 1), this._shimmedLocalStreams[o].length === 1 && delete this._shimmedLocalStreams[o]
    }), s.apply(this, arguments)
  }
}

function Xa(i, e) {
  if (!i.RTCPeerConnection) return;
  if (i.RTCPeerConnection.prototype.addTrack && e.version >= 65) return Ya(i);
  const t = i.RTCPeerConnection.prototype.getLocalStreams;
  i.RTCPeerConnection.prototype.getLocalStreams = function() {
    const l = t.apply(this);
    return this._reverseStreams = this._reverseStreams || {}, l.map(u => this._reverseStreams[u.id])
  };
  const n = i.RTCPeerConnection.prototype.addStream;
  i.RTCPeerConnection.prototype.addStream = function(l) {
    if (this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, l.getTracks().forEach(u => {
        if (this.getSenders().find(m => m.track === u)) throw new DOMException("Track already exists.", "InvalidAccessError")
      }), !this._reverseStreams[l.id]) {
      const u = new i.MediaStream(l.getTracks());
      this._streams[l.id] = u, this._reverseStreams[u.id] = l, l = u
    }
    n.apply(this, [l])
  };
  const s = i.RTCPeerConnection.prototype.removeStream;
  i.RTCPeerConnection.prototype.removeStream = function(l) {
    this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, s.apply(this, [this._streams[l.id] || l]), delete this._reverseStreams[this._streams[l.id] ? this._streams[l.id].id : l.id], delete this._streams[l.id]
  }, i.RTCPeerConnection.prototype.addTrack = function(l, u) {
    if (this.signalingState === "closed") throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
    const h = [].slice.call(arguments, 1);
    if (h.length !== 1 || !h[0].getTracks().find(p => p === l)) throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
    if (this.getSenders().find(p => p.track === l)) throw new DOMException("Track already exists.", "InvalidAccessError");
    this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {};
    const f = this._streams[u.id];
    if (f) f.addTrack(l), Promise.resolve().then(() => {
      this.dispatchEvent(new Event("negotiationneeded"))
    });
    else {
      const p = new i.MediaStream([l]);
      this._streams[u.id] = p, this._reverseStreams[p.id] = u, this.addStream(p)
    }
    return this.getSenders().find(p => p.track === l)
  };

  function r(d, l) {
    let u = l.sdp;
    return Object.keys(d._reverseStreams || []).forEach(h => {
      const m = d._reverseStreams[h],
        f = d._streams[m.id];
      u = u.replace(new RegExp(f.id, "g"), m.id)
    }), new RTCSessionDescription({
      type: l.type,
      sdp: u
    })
  }

  function a(d, l) {
    let u = l.sdp;
    return Object.keys(d._reverseStreams || []).forEach(h => {
      const m = d._reverseStreams[h],
        f = d._streams[m.id];
      u = u.replace(new RegExp(m.id, "g"), f.id)
    }), new RTCSessionDescription({
      type: l.type,
      sdp: u
    })
  } ["createOffer", "createAnswer"].forEach(function(d) {
    const l = i.RTCPeerConnection.prototype[d],
      u = {
        [d]() {
          const h = arguments;
          return arguments.length && typeof arguments[0] == "function" ? l.apply(this, [f => {
            const p = r(this, f);
            h[0].apply(null, [p])
          }, f => {
            h[1] && h[1].apply(null, f)
          }, arguments[2]]) : l.apply(this, arguments).then(f => r(this, f))
        }
      };
    i.RTCPeerConnection.prototype[d] = u[d]
  });
  const o = i.RTCPeerConnection.prototype.setLocalDescription;
  i.RTCPeerConnection.prototype.setLocalDescription = function() {
    return !arguments.length || !arguments[0].type ? o.apply(this, arguments) : (arguments[0] = a(this, arguments[0]), o.apply(this, arguments))
  };
  const c = Object.getOwnPropertyDescriptor(i.RTCPeerConnection.prototype, "localDescription");
  Object.defineProperty(i.RTCPeerConnection.prototype, "localDescription", {
    get() {
      const d = c.get.apply(this);
      return d.type === "" ? d : r(this, d)
    }
  }), i.RTCPeerConnection.prototype.removeTrack = function(l) {
    if (this.signalingState === "closed") throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
    if (!l._pc) throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
    if (!(l._pc === this)) throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
    this._streams = this._streams || {};
    let h;
    Object.keys(this._streams).forEach(m => {
      this._streams[m].getTracks().find(p => l.track === p) && (h = this._streams[m])
    }), h && (h.getTracks().length === 1 ? this.removeStream(this._reverseStreams[h.id]) : h.removeTrack(l.track), this.dispatchEvent(new Event("negotiationneeded")))
  }
}



function Za(i, e) {
  Nt(i, "negotiationneeded", t => {
    const n = t.target;
    if (!((e.version < 72 || n.getConfiguration && n.getConfiguration().sdpSemantics === "plan-b") && n.signalingState !== "stable")) return t
  })
}
var Vr = Object.freeze({
  __proto__: null,
  fixNegotiationNeeded: Za,
  shimAddTrackRemoveTrack: Xa,
  shimAddTrackRemoveTrackWithNative: Ya,
  shimGetSendersWithDtmf: $a,
  shimGetUserMedia: Ga,
  shimMediaStream: Ja,
  shimOnTrack: za,
  shimPeerConnection: Qn,
  shimSenderReceiverGetStats: Qa
});

function ec(i, e) {
  const t = i && i.navigator,
    n = i && i.MediaStreamTrack;
  if (t.getUserMedia = function(s, r, a) {
      Fs("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia"), t.mediaDevices.getUserMedia(s).then(r, a)
    }, !(e.version > 55 && "autoGainControl" in t.mediaDevices.getSupportedConstraints())) {
    const s = function(a, o, c) {
        o in a && !(c in a) && (a[c] = a[o], delete a[o])
      },
      r = t.mediaDevices.getUserMedia.bind(t.mediaDevices);
    if (t.mediaDevices.getUserMedia = function(a) {
        return typeof a == "object" && typeof a.audio == "object" && (a = JSON.parse(JSON.stringify(a)), s(a.audio, "autoGainControl", "mozAutoGainControl"), s(a.audio, "noiseSuppression", "mozNoiseSuppression")), r(a)
      }, n && n.prototype.getSettings) {
      const a = n.prototype.getSettings;
      n.prototype.getSettings = function() {
        const o = a.apply(this, arguments);
        return s(o, "mozAutoGainControl", "autoGainControl"), s(o, "mozNoiseSuppression", "noiseSuppression"), o
      }
    }
    if (n && n.prototype.applyConstraints) {
      const a = n.prototype.applyConstraints;
      n.prototype.applyConstraints = function(o) {
        return this.kind === "audio" && typeof o == "object" && (o = JSON.parse(JSON.stringify(o)), s(o, "autoGainControl", "mozAutoGainControl"), s(o, "noiseSuppression", "mozNoiseSuppression")), a.apply(this, [o])
      }
    }
  }
}









function nc(i) {
  if (!(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender) || i.RTCRtpSender && "getStats" in i.RTCRtpReceiver.prototype) return;
  const e = i.RTCPeerConnection.prototype.getReceivers;
  e && (i.RTCPeerConnection.prototype.getReceivers = function() {
    const n = e.apply(this, []);
    return n.forEach(s => s._pc = this), n
  }), Nt(i, "track", t => (t.receiver._pc = t.srcElement, t)), i.RTCRtpReceiver.prototype.getStats = function() {
    return this._pc.getStats(this.track)
  }
}

function sc(i) {
  !i.RTCPeerConnection || "removeStream" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.removeStream = function(t) {
    Fs("removeStream", "removeTrack"), this.getSenders().forEach(n => {
      n.track && t.getTracks().includes(n.track) && this.removeTrack(n)
    })
  })
}










var qr = Object.freeze({
  __proto__: null,
  shimAddTransceiver: oc,
  shimCreateAnswer: dc,
  shimCreateOffer: cc,
  shimGetDisplayMedia: Oh,
  shimGetParameters: ac,
  shimGetUserMedia: ec,
  shimOnTrack: tc,
  shimPeerConnection: Yn,
  shimRTCDataChannel: rc,
  shimReceiverGetStats: nc,
  shimRemoveStream: sc,
  shimSenderGetStats: ic
});







function mc(i) {
  const e = i && i.navigator;
  if (e.mediaDevices && e.mediaDevices.getUserMedia) {
    const t = e.mediaDevices,
      n = t.getUserMedia.bind(t);
    e.mediaDevices.getUserMedia = s => n(fc(s))
  }!e.getUserMedia && e.mediaDevices && e.mediaDevices.getUserMedia && (e.getUserMedia = (function(n, s, r) {
    e.mediaDevices.getUserMedia(n).then(s, r)
  }).bind(e))
}

function fc(i) {
  return i && i.video !== void 0 ? Object.assign({}, i, {
    video: Ka(i.video)
  }) : i
}

function pc(i) {
  if (!i.RTCPeerConnection) return;
  const e = i.RTCPeerConnection;
  i.RTCPeerConnection = function(n, s) {
    if (n && n.iceServers) {
      const r = [];
      for (let a = 0; a < n.iceServers.length; a++) {
        let o = n.iceServers[a];
        o.urls === void 0 && o.url ? (Fs("RTCIceServer.url", "RTCIceServer.urls"), o = JSON.parse(JSON.stringify(o)), o.urls = o.url, delete o.url, r.push(o)) : r.push(n.iceServers[a])
      }
      n.iceServers = r
    }
    return new e(n, s)
  }, i.RTCPeerConnection.prototype = e.prototype, "generateCertificate" in e && Object.defineProperty(i.RTCPeerConnection, "generateCertificate", {
    get() {
      return e.generateCertificate
    }
  })
}






var Wr = Object.freeze({
    __proto__: null,
    shimAudioContext: bc,
    shimCallbacksAPI: hc,
    shimConstraints: fc,
    shimCreateOfferLegacy: vc,
    shimGetUserMedia: mc,
    shimLocalStreamsAPI: lc,
    shimRTCIceServerUrls: pc,
    shimRemoteStreamsAPI: uc,
    shimTrackEventTransceiver: gc
  }),
  bn = {
    exports: {}
  },
  Hr;

function Dh() {
  return Hr || (Hr = 1, function(i) {
    const e = {};
    e.generateIdentifier = function() {
      return Math.random().toString(36).substring(2, 12)
    }, e.localCName = e.generateIdentifier(), e.splitLines = function(t) {
      return t.trim().split(`
`).map(n => n.trim())
    }, e.splitSections = function(t) {
      return t.split(`
m=`).map((s, r) => (r > 0 ? "m=" + s : s).trim() + `\r
`)
    }, e.getDescription = function(t) {
      const n = e.splitSections(t);
      return n && n[0]
    }, e.getMediaSections = function(t) {
      const n = e.splitSections(t);
      return n.shift(), n
    }, e.matchPrefix = function(t, n) {
      return e.splitLines(t).filter(s => s.indexOf(n) === 0)
    }, e.parseCandidate = function(t) {
      let n;
      t.indexOf("a=candidate:") === 0 ? n = t.substring(12).split(" ") : n = t.substring(10).split(" ");
      const s = {
        foundation: n[0],
        component: {
          1: "rtp",
          2: "rtcp"
        } [n[1]] || n[1],
        protocol: n[2].toLowerCase(),
        priority: parseInt(n[3], 10),
        ip: n[4],
        address: n[4],
        port: parseInt(n[5], 10),
        type: n[7]
      };
      for (let r = 8; r < n.length; r += 2) switch (n[r]) {
        case "raddr":
          s.relatedAddress = n[r + 1];
          break;
        case "rport":
          s.relatedPort = parseInt(n[r + 1], 10);
          break;
        case "tcptype":
          s.tcpType = n[r + 1];
          break;
        case "ufrag":
          s.ufrag = n[r + 1], s.usernameFragment = n[r + 1];
          break;
        default:
          s[n[r]] === void 0 && (s[n[r]] = n[r + 1]);
          break
      }
      return s
    }, e.writeCandidate = function(t) {
      const n = [];
      n.push(t.foundation);
      const s = t.component;
      s === "rtp" ? n.push(1) : s === "rtcp" ? n.push(2) : n.push(s), n.push(t.protocol.toUpperCase()), n.push(t.priority), n.push(t.address || t.ip), n.push(t.port);
      const r = t.type;
      return n.push("typ"), n.push(r), r !== "host" && t.relatedAddress && t.relatedPort && (n.push("raddr"), n.push(t.relatedAddress), n.push("rport"), n.push(t.relatedPort)), t.tcpType && t.protocol.toLowerCase() === "tcp" && (n.push("tcptype"), n.push(t.tcpType)), (t.usernameFragment || t.ufrag) && (n.push("ufrag"), n.push(t.usernameFragment || t.ufrag)), "candidate:" + n.join(" ")
    }, e.parseIceOptions = function(t) {
      return t.substring(14).split(" ")
    }, e.parseRtpMap = function(t) {
      let n = t.substring(9).split(" ");
      const s = {
        payloadType: parseInt(n.shift(), 10)
      };
      return n = n[0].split("/"), s.name = n[0], s.clockRate = parseInt(n[1], 10), s.channels = n.length === 3 ? parseInt(n[2], 10) : 1, s.numChannels = s.channels, s
    }, e.writeRtpMap = function(t) {
      let n = t.payloadType;
      t.preferredPayloadType !== void 0 && (n = t.preferredPayloadType);
      const s = t.channels || t.numChannels || 1;
      return "a=rtpmap:" + n + " " + t.name + "/" + t.clockRate + (s !== 1 ? "/" + s : "") + `\r
`
    }, e.parseExtmap = function(t) {
      const n = t.substring(9).split(" ");
      return {
        id: parseInt(n[0], 10),
        direction: n[0].indexOf("/") > 0 ? n[0].split("/")[1] : "sendrecv",
        uri: n[1],
        attributes: n.slice(2).join(" ")
      }
    }, e.writeExtmap = function(t) {
      return "a=extmap:" + (t.id || t.preferredId) + (t.direction && t.direction !== "sendrecv" ? "/" + t.direction : "") + " " + t.uri + (t.attributes ? " " + t.attributes : "") + `\r
`
    }, e.parseFmtp = function(t) {
      const n = {};
      let s;
      const r = t.substring(t.indexOf(" ") + 1).split(";");
      for (let a = 0; a < r.length; a++) s = r[a].trim().split("="), n[s[0].trim()] = s[1];
      return n
    }, e.writeFmtp = function(t) {
      let n = "",
        s = t.payloadType;
      if (t.preferredPayloadType !== void 0 && (s = t.preferredPayloadType), t.parameters && Object.keys(t.parameters).length) {
        const r = [];
        Object.keys(t.parameters).forEach(a => {
          t.parameters[a] !== void 0 ? r.push(a + "=" + t.parameters[a]) : r.push(a)
        }), n += "a=fmtp:" + s + " " + r.join(";") + `\r
`
      }
      return n
    }, e.parseRtcpFb = function(t) {
      const n = t.substring(t.indexOf(" ") + 1).split(" ");
      return {
        type: n.shift(),
        parameter: n.join(" ")
      }
    }, e.writeRtcpFb = function(t) {
      let n = "",
        s = t.payloadType;
      return t.preferredPayloadType !== void 0 && (s = t.preferredPayloadType), t.rtcpFeedback && t.rtcpFeedback.length && t.rtcpFeedback.forEach(r => {
        n += "a=rtcp-fb:" + s + " " + r.type + (r.parameter && r.parameter.length ? " " + r.parameter : "") + `\r
`
      }), n
    }, e.parseSsrcMedia = function(t) {
      const n = t.indexOf(" "),
        s = {
          ssrc: parseInt(t.substring(7, n), 10)
        },
        r = t.indexOf(":", n);
      return r > -1 ? (s.attribute = t.substring(n + 1, r), s.value = t.substring(r + 1)) : s.attribute = t.substring(n + 1), s
    }, e.parseSsrcGroup = function(t) {
      const n = t.substring(13).split(" ");
      return {
        semantics: n.shift(),
        ssrcs: n.map(s => parseInt(s, 10))
      }
    }, e.getMid = function(t) {
      const n = e.matchPrefix(t, "a=mid:")[0];
      if (n) return n.substring(6)
    }, e.parseFingerprint = function(t) {
      const n = t.substring(14).split(" ");
      return {
        algorithm: n[0].toLowerCase(),
        value: n[1].toUpperCase()
      }
    }, e.getDtlsParameters = function(t, n) {
      return {
        role: "auto",
        fingerprints: e.matchPrefix(t + n, "a=fingerprint:").map(e.parseFingerprint)
      }
    }, e.writeDtlsParameters = function(t, n) {
      let s = "a=setup:" + n + `\r
`;
      return t.fingerprints.forEach(r => {
        s += "a=fingerprint:" + r.algorithm + " " + r.value + `\r
`
      }), s
    }, e.parseCryptoLine = function(t) {
      const n = t.substring(9).split(" ");
      return {
        tag: parseInt(n[0], 10),
        cryptoSuite: n[1],
        keyParams: n[2],
        sessionParams: n.slice(3)
      }
    }, e.writeCryptoLine = function(t) {
      return "a=crypto:" + t.tag + " " + t.cryptoSuite + " " + (typeof t.keyParams == "object" ? e.writeCryptoKeyParams(t.keyParams) : t.keyParams) + (t.sessionParams ? " " + t.sessionParams.join(" ") : "") + `\r
`
    }, e.parseCryptoKeyParams = function(t) {
      if (t.indexOf("inline:") !== 0) return null;
      const n = t.substring(7).split("|");
      return {
        keyMethod: "inline",
        keySalt: n[0],
        lifeTime: n[1],
        mkiValue: n[2] ? n[2].split(":")[0] : void 0,
        mkiLength: n[2] ? n[2].split(":")[1] : void 0
      }
    }, e.writeCryptoKeyParams = function(t) {
      return t.keyMethod + ":" + t.keySalt + (t.lifeTime ? "|" + t.lifeTime : "") + (t.mkiValue && t.mkiLength ? "|" + t.mkiValue + ":" + t.mkiLength : "")
    }, e.getCryptoParameters = function(t, n) {
      return e.matchPrefix(t + n, "a=crypto:").map(e.parseCryptoLine)
    }, e.getIceParameters = function(t, n) {
      const s = e.matchPrefix(t + n, "a=ice-ufrag:")[0],
        r = e.matchPrefix(t + n, "a=ice-pwd:")[0];
      return s && r ? {
        usernameFragment: s.substring(12),
        password: r.substring(10)
      } : null
    }, e.writeIceParameters = function(t) {
      let n = "a=ice-ufrag:" + t.usernameFragment + `\r
a=ice-pwd:` + t.password + `\r
`;
      return t.iceLite && (n += `a=ice-lite\r
`), n
    }, e.parseRtpParameters = function(t) {
      const n = {
          codecs: [],
          headerExtensions: [],
          fecMechanisms: [],
          rtcp: []
        },
        r = e.splitLines(t)[0].split(" ");
      n.profile = r[2];
      for (let o = 3; o < r.length; o++) {
        const c = r[o],
          d = e.matchPrefix(t, "a=rtpmap:" + c + " ")[0];
        if (d) {
          const l = e.parseRtpMap(d),
            u = e.matchPrefix(t, "a=fmtp:" + c + " ");
          switch (l.parameters = u.length ? e.parseFmtp(u[0]) : {}, l.rtcpFeedback = e.matchPrefix(t, "a=rtcp-fb:" + c + " ").map(e.parseRtcpFb), n.codecs.push(l), l.name.toUpperCase()) {
            case "RED":
            case "ULPFEC":
              n.fecMechanisms.push(l.name.toUpperCase());
              break
          }
        }
      }
      e.matchPrefix(t, "a=extmap:").forEach(o => {
        n.headerExtensions.push(e.parseExtmap(o))
      });
      const a = e.matchPrefix(t, "a=rtcp-fb:* ").map(e.parseRtcpFb);
      return n.codecs.forEach(o => {
        a.forEach(c => {
          o.rtcpFeedback.find(l => l.type === c.type && l.parameter === c.parameter) || o.rtcpFeedback.push(c)
        })
      }), n
    }, e.writeRtpDescription = function(t, n) {
      let s = "";
      s += "m=" + t + " ", s += n.codecs.length > 0 ? "9" : "0", s += " " + (n.profile || "UDP/TLS/RTP/SAVPF") + " ", s += n.codecs.map(a => a.preferredPayloadType !== void 0 ? a.preferredPayloadType : a.payloadType).join(" ") + `\r
`, s += `c=IN IP4 0.0.0.0\r
`, s += `a=rtcp:9 IN IP4 0.0.0.0\r
`, n.codecs.forEach(a => {
        s += e.writeRtpMap(a), s += e.writeFmtp(a), s += e.writeRtcpFb(a)
      });
      let r = 0;
      return n.codecs.forEach(a => {
        a.maxptime > r && (r = a.maxptime)
      }), r > 0 && (s += "a=maxptime:" + r + `\r
`), n.headerExtensions && n.headerExtensions.forEach(a => {
        s += e.writeExtmap(a)
      }), s
    }, e.parseRtpEncodingParameters = function(t) {
      const n = [],
        s = e.parseRtpParameters(t),
        r = s.fecMechanisms.indexOf("RED") !== -1,
        a = s.fecMechanisms.indexOf("ULPFEC") !== -1,
        o = e.matchPrefix(t, "a=ssrc:").map(h => e.parseSsrcMedia(h)).filter(h => h.attribute === "cname"),
        c = o.length > 0 && o[0].ssrc;
      let d;
      const l = e.matchPrefix(t, "a=ssrc-group:FID").map(h => h.substring(17).split(" ").map(f => parseInt(f, 10)));
      l.length > 0 && l[0].length > 1 && l[0][0] === c && (d = l[0][1]), s.codecs.forEach(h => {
        if (h.name.toUpperCase() === "RTX" && h.parameters.apt) {
          let m = {
            ssrc: c,
            codecPayloadType: parseInt(h.parameters.apt, 10)
          };
          c && d && (m.rtx = {
            ssrc: d
          }), n.push(m), r && (m = JSON.parse(JSON.stringify(m)), m.fec = {
            ssrc: c,
            mechanism: a ? "red+ulpfec" : "red"
          }, n.push(m))
        }
      }), n.length === 0 && c && n.push({
        ssrc: c
      });
      let u = e.matchPrefix(t, "b=");
      return u.length && (u[0].indexOf("b=TIAS:") === 0 ? u = parseInt(u[0].substring(7), 10) : u[0].indexOf("b=AS:") === 0 ? u = parseInt(u[0].substring(5), 10) * 1e3 * .95 - 50 * 40 * 8 : u = void 0, n.forEach(h => {
        h.maxBitrate = u
      })), n
    }, e.parseRtcpParameters = function(t) {
      const n = {},
        s = e.matchPrefix(t, "a=ssrc:").map(o => e.parseSsrcMedia(o)).filter(o => o.attribute === "cname")[0];
      s && (n.cname = s.value, n.ssrc = s.ssrc);
      const r = e.matchPrefix(t, "a=rtcp-rsize");
      n.reducedSize = r.length > 0, n.compound = r.length === 0;
      const a = e.matchPrefix(t, "a=rtcp-mux");
      return n.mux = a.length > 0, n
    }, e.writeRtcpParameters = function(t) {
      let n = "";
      return t.reducedSize && (n += `a=rtcp-rsize\r
`), t.mux && (n += `a=rtcp-mux\r
`), t.ssrc !== void 0 && t.cname && (n += "a=ssrc:" + t.ssrc + " cname:" + t.cname + `\r
`), n
    }, e.parseMsid = function(t) {
      let n;
      const s = e.matchPrefix(t, "a=msid:");
      if (s.length === 1) return n = s[0].substring(7).split(" "), {
        stream: n[0],
        track: n[1]
      };
      const r = e.matchPrefix(t, "a=ssrc:").map(a => e.parseSsrcMedia(a)).filter(a => a.attribute === "msid");
      if (r.length > 0) return n = r[0].value.split(" "), {
        stream: n[0],
        track: n[1]
      }
    }, e.parseSctpDescription = function(t) {
      const n = e.parseMLine(t),
        s = e.matchPrefix(t, "a=max-message-size:");
      let r;
      s.length > 0 && (r = parseInt(s[0].substring(19), 10)), isNaN(r) && (r = 65536);
      const a = e.matchPrefix(t, "a=sctp-port:");
      if (a.length > 0) return {
        port: parseInt(a[0].substring(12), 10),
        protocol: n.fmt,
        maxMessageSize: r
      };
      const o = e.matchPrefix(t, "a=sctpmap:");
      if (o.length > 0) {
        const c = o[0].substring(10).split(" ");
        return {
          port: parseInt(c[0], 10),
          protocol: c[1],
          maxMessageSize: r
        }
      }
    }, e.writeSctpDescription = function(t, n) {
      let s = [];
      return t.protocol !== "DTLS/SCTP" ? s = ["m=" + t.kind + " 9 " + t.protocol + " " + n.protocol + `\r
`, `c=IN IP4 0.0.0.0\r
`, "a=sctp-port:" + n.port + `\r
`] : s = ["m=" + t.kind + " 9 " + t.protocol + " " + n.port + `\r
`, `c=IN IP4 0.0.0.0\r
`, "a=sctpmap:" + n.port + " " + n.protocol + ` 65535\r
`], n.maxMessageSize !== void 0 && s.push("a=max-message-size:" + n.maxMessageSize + `\r
`), s.join("")
    }, e.generateSessionId = function() {
      return Math.random().toString().substr(2, 22)
    }, e.writeSessionBoilerplate = function(t, n, s) {
      let r;
      const a = n !== void 0 ? n : 2;
      return t ? r = t : r = e.generateSessionId(), `v=0\r
o=` + (s || "thisisadapterortc") + " " + r + " " + a + ` IN IP4 127.0.0.1\r
s=-\r
t=0 0\r
`
    }, e.getDirection = function(t, n) {
      const s = e.splitLines(t);
      for (let r = 0; r < s.length; r++) switch (s[r]) {
        case "a=sendrecv":
        case "a=sendonly":
        case "a=recvonly":
        case "a=inactive":
          return s[r].substring(2)
      }
      return n ? e.getDirection(n) : "sendrecv"
    }, e.getKind = function(t) {
      return e.splitLines(t)[0].split(" ")[0].substring(2)
    }, e.isRejected = function(t) {
      return t.split(" ", 2)[1] === "0"
    }, e.parseMLine = function(t) {
      const s = e.splitLines(t)[0].substring(2).split(" ");
      return {
        kind: s[0],
        port: parseInt(s[1], 10),
        protocol: s[2],
        fmt: s.slice(3).join(" ")
      }
    }, e.parseOLine = function(t) {
      const s = e.matchPrefix(t, "o=")[0].substring(2).split(" ");
      return {
        username: s[0],
        sessionId: s[1],
        sessionVersion: parseInt(s[2], 10),
        netType: s[3],
        addressType: s[4],
        address: s[5]
      }
    }, e.isValidSDP = function(t) {
      if (typeof t != "string" || t.length === 0) return !1;
      const n = e.splitLines(t);
      for (let s = 0; s < n.length; s++)
        if (n[s].length < 2 || n[s].charAt(1) !== "=") return !1;
      return !0
    }, i.exports = e
  }(bn)), bn.exports
}
var yc = Dh(),
  Wt = Sh(yc),
  Ah = Ul({
    __proto__: null,
    default: Wt
  }, [yc]);

function Di(i) {
  if (!i.RTCIceCandidate || i.RTCIceCandidate && "foundation" in i.RTCIceCandidate.prototype) return;
  const e = i.RTCIceCandidate;
  i.RTCIceCandidate = function(n) {
    if (typeof n == "object" && n.candidate && n.candidate.indexOf("a=") === 0 && (n = JSON.parse(JSON.stringify(n)), n.candidate = n.candidate.substring(2)), n.candidate && n.candidate.length) {
      const s = new e(n),
        r = Wt.parseCandidate(n.candidate);
      for (const a in r) a in s || Object.defineProperty(s, a, {
        value: r[a]
      });
      return s.toJSON = function() {
        return {
          candidate: s.candidate,
          sdpMid: s.sdpMid,
          sdpMLineIndex: s.sdpMLineIndex,
          usernameFragment: s.usernameFragment
        }
      }, s
    }
    return new e(n)
  }, i.RTCIceCandidate.prototype = e.prototype, Nt(i, "icecandidate", t => (t.candidate && Object.defineProperty(t, "candidate", {
    value: new i.RTCIceCandidate(t.candidate),
    writable: "false"
  }), t))
}

function Xn(i) {
  !i.RTCIceCandidate || i.RTCIceCandidate && "relayProtocol" in i.RTCIceCandidate.prototype || Nt(i, "icecandidate", e => {
    if (e.candidate) {
      const t = Wt.parseCandidate(e.candidate.candidate);
      t.type === "relay" && (e.candidate.relayProtocol = {
        0: "tls",
        1: "tcp",
        2: "udp"
      } [t.priority >> 24])
    }
    return e
  })
}

function Ai(i, e) {
  if (!i.RTCPeerConnection) return;
  "sctp" in i.RTCPeerConnection.prototype || Object.defineProperty(i.RTCPeerConnection.prototype, "sctp", {
    get() {
      return typeof this._sctp > "u" ? null : this._sctp
    }
  });
  const t = function(o) {
      if (!o || !o.sdp) return !1;
      const c = Wt.splitSections(o.sdp);
      return c.shift(), c.some(d => {
        const l = Wt.parseMLine(d);
        return l && l.kind === "application" && l.protocol.indexOf("SCTP") !== -1
      })
    },
    n = function(o) {
      const c = o.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
      if (c === null || c.length < 2) return -1;
      const d = parseInt(c[1], 10);
      return d !== d ? -1 : d
    },
    s = function(o) {
      let c = 65536;
      return e.browser === "firefox" && (e.version < 57 ? o === -1 ? c = 16384 : c = 2147483637 : e.version < 60 ? c = e.version === 57 ? 65535 : 65536 : c = 2147483637), c
    },
    r = function(o, c) {
      let d = 65536;
      e.browser === "firefox" && e.version === 57 && (d = 65535);
      const l = Wt.matchPrefix(o.sdp, "a=max-message-size:");
      return l.length > 0 ? d = parseInt(l[0].substring(19), 10) : e.browser === "firefox" && c !== -1 && (d = 2147483637), d
    },
    a = i.RTCPeerConnection.prototype.setRemoteDescription;
  i.RTCPeerConnection.prototype.setRemoteDescription = function() {
    if (this._sctp = null, e.browser === "chrome" && e.version >= 76) {
      const {
        sdpSemantics: c
      } = this.getConfiguration();
      c === "plan-b" && Object.defineProperty(this, "sctp", {
        get() {
          return typeof this._sctp > "u" ? null : this._sctp
        },
        enumerable: !0,
        configurable: !0
      })
    }
    if (t(arguments[0])) {
      const c = n(arguments[0]),
        d = s(c),
        l = r(arguments[0], c);
      let u;
      d === 0 && l === 0 ? u = Number.POSITIVE_INFINITY : d === 0 || l === 0 ? u = Math.max(d, l) : u = Math.min(d, l);
      const h = {};
      Object.defineProperty(h, "maxMessageSize", {
        get() {
          return u
        }
      }), this._sctp = h
    }
    return a.apply(this, arguments)
  }
}

function Ni(i) {
  if (!(i.RTCPeerConnection && "createDataChannel" in i.RTCPeerConnection.prototype)) return;

  function e(n, s) {
    const r = n.send;
    n.send = function() {
      const o = arguments[0],
        c = o.length || o.size || o.byteLength;
      if (n.readyState === "open" && s.sctp && c > s.sctp.maxMessageSize) throw new TypeError("Message too large (can send a maximum of " + s.sctp.maxMessageSize + " bytes)");
      return r.apply(n, arguments)
    }
  }
  const t = i.RTCPeerConnection.prototype.createDataChannel;
  i.RTCPeerConnection.prototype.createDataChannel = function() {
    const s = t.apply(this, arguments);
    return e(s, this), s
  }, Nt(i, "datachannel", n => (e(n.channel, n.target), n))
}








var Nh = Object.freeze({
  __proto__: null,
  removeExtmapAllowMixed: es,
  shimAddIceCandidateNullOrEmpty: Li,
  shimConnectionState: Zn,
  shimMaxMessageSize: Ai,
  shimParameterlessSetLocalDescription: Ui,
  shimRTCIceCandidate: Di,
  shimRTCIceCandidateRelayProtocol: Xn,
  shimSendThrowTypeError: Ni
});

function Lh() {
  let {
    window: i
  } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
    shimChrome: !0,
    shimFirefox: !0,
    shimSafari: !0
  };
  const t = Ha,
    n = Mh(i),
    s = {
      browserDetails: n,
      commonShim: Nh,
      extractVersion: oi,
      disableLog: Ih,
      disableWarnings: xh,
      sdp: Ah
    };
  switch (n.browser) {
    case "chrome":
      if (!Vr || !Qn || !e.shimChrome) return t("Chrome shim is not included in this adapter release."), s;
      if (n.version === null) return t("Chrome shim can not determine version, not shimming."), s;
      t("adapter.js shimming chrome."), s.browserShim = Vr, Li(i, n), Ui(i), Ga(i, n), Ja(i), Qn(i, n), za(i), Xa(i, n), $a(i), Qa(i), Za(i, n), Di(i), Xn(i), Zn(i), Ai(i, n), Ni(i), es(i, n);
      break;
    case "firefox":
      if (!qr || !Yn || !e.shimFirefox) return t("Firefox shim is not included in this adapter release."), s;
      t("adapter.js shimming firefox."), s.browserShim = qr, Li(i, n), Ui(i), ec(i, n), Yn(i, n), tc(i), sc(i), ic(i), nc(i), rc(i), oc(i), ac(i), cc(i), dc(i), Di(i), Zn(i), Ai(i, n), Ni(i);
      break;
    case "safari":
      if (!Wr || !e.shimSafari) return t("Safari shim is not included in this adapter release."), s;
      t("adapter.js shimming safari."), s.browserShim = Wr, Li(i, n), Ui(i), pc(i), vc(i), hc(i), lc(i), uc(i), gc(i), mc(i), bc(i), Di(i), Xn(i), Ai(i, n), Ni(i), es(i, n);
      break;
    default:
      t("Unsupported browser!");
      break
  }
  return s
}
Lh({
  window: typeof window > "u" ? void 0 : window
});
var ts, kc;
class Ee extends(kc = Promise) {
  constructor(e) {
    super(e)
  } catch (e) {
    return super.catch(e)
  }
  static reject(e) {
    return super.reject(e)
  }
  static all(e) {
    return super.all(e)
  }
  static race(e) {
    return super.race(e)
  }
}
ts = Ee;
Ee.resolve = i => Reflect.get(kc, "resolve", ts).call(ts, i);
const Uh = /version\/(\d+(\.?_?\d+)+)/i;
let yn;

function Oe(i) {
  let e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  if (typeof navigator > "u") return;
  const t = navigator.userAgent.toLowerCase();
  if (yn === void 0 || e) {
    const n = jh.find(s => {
      let {
        test: r
      } = s;
      return r.test(t)
    });
    yn = n == null ? void 0 : n.describe(t)
  }
  return yn
}
const jh = [{
  test: /firefox|iceweasel|fxios/i,
  describe(i) {
    return {
      name: "Firefox",
      version: ji(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, i),
      os: i.toLowerCase().includes("fxios") ? "iOS" : void 0,
      osVersion: kn(i)
    }
  }
}, {
  test: /chrom|crios|crmo/i,
  describe(i) {
    return {
      name: "Chrome",
      version: ji(/(?:chrome|chromium|crios|crmo)\/(\d+(\.?_?\d+)+)/i, i),
      os: i.toLowerCase().includes("crios") ? "iOS" : void 0,
      osVersion: kn(i)
    }
  }
}, {
  test: /safari|applewebkit/i,
  describe(i) {
    return {
      name: "Safari",
      version: ji(Uh, i),
      os: i.includes("mobile/") ? "iOS" : "macOS",
      osVersion: kn(i)
    }
  }
}];



function kn(i) {
  return i.includes("mac os") ? ji(/\(.+?(\d+_\d+(:?_\d+)?)/, i, 1).replace(/_/g, ".") : void 0
}
var Fh = "2.17.2";
const Bh = Fh,
  Vh = 16;

class Bs extends Tt {}
var ce;
(function(i) {
  i[i.NotAllowed = 0] = "NotAllowed", i[i.ServerUnreachable = 1] = "ServerUnreachable", i[i.InternalError = 2] = "InternalError", i[i.Cancelled = 3] = "Cancelled", i[i.LeaveRequest = 4] = "LeaveRequest", i[i.Timeout = 5] = "Timeout", i[i.WebSocket = 6] = "WebSocket", i[i.ServiceNotFound = 7] = "ServiceNotFound"
})(ce || (ce = {}));
class $ extends Bs {
  constructor(e, t, n, s) {
    super(1, e), this.name = "ConnectionError", this.status = n, this.reason = t, this.context = s, this.reasonName = ce[t]
  }
  static notAllowed(e, t, n) {
    return new $(e, ce.NotAllowed, t, n)
  }
  static timeout(e) {
    return new $(e, ce.Timeout)
  }
  static leaveRequest(e, t) {
    return new $(e, ce.LeaveRequest, void 0, t)
  }
  static internal(e, t) {
    return new $(e, ce.InternalError, void 0, t)
  }
  static cancelled(e) {
    return new $(e, ce.Cancelled)
  }
  static serverUnreachable(e, t) {
    return new $(e, ce.ServerUnreachable, t)
  }
  static websocket(e, t, n) {
    return new $(e, ce.WebSocket, t, n)
  }
  static serviceNotFound(e, t) {
    return new $(e, ce.ServiceNotFound, void 0, t)
  }
}
class Vs extends Tt {
  constructor(e) {
    super(21, e ?? "device is unsupported"), this.name = "DeviceUnsupportedError"
  }
}
class ct extends Tt {
  constructor(e) {
    super(20, e ?? "track is invalid"), this.name = "TrackInvalidError"
  }
}
class qh extends Tt {
  constructor(e) {
    super(10, e ?? "unsupported server"), this.name = "UnsupportedServer"
  }
}
class fe extends Tt {
  constructor(e) {
    super(12, e ?? "unexpected connection state"), this.name = "UnexpectedConnectionState"
  }
}
class _t extends Tt {
  constructor(e) {
    super(13, e ?? "unable to negotiate"), this.name = "NegotiationError"
  }
}
class Kr extends Tt {
  constructor(e, t) {
    super(15, e), this.name = "PublishTrackError", this.status = t
  }
}
class Gr extends Bs {
  constructor(e, t) {
    super(15, e), this.name = "SignalRequestError", this.reason = t, this.reasonName = typeof t == "string" ? t : js[t]
  }
}
var Pe;
(function(i) {
  i[i.AlreadyOpened = 0] = "AlreadyOpened", i[i.AbnormalEnd = 1] = "AbnormalEnd", i[i.DecodeFailed = 2] = "DecodeFailed", i[i.LengthExceeded = 3] = "LengthExceeded", i[i.Incomplete = 4] = "Incomplete", i[i.HandlerAlreadyRegistered = 7] = "HandlerAlreadyRegistered", i[i.EncryptionTypeMismatch = 8] = "EncryptionTypeMismatch"
})(Pe || (Pe = {}));
class Ne extends Bs {
  constructor(e, t) {
    super(16, e), this.name = "DataStreamError", this.reason = t, this.reasonName = Pe[t]
  }
}
class Ut extends Tt {
  constructor(e) {
    super(18, e), this.name = "SignalReconnectError"
  }
}
var zi;
(function(i) {
  i.PermissionDenied = "PermissionDenied", i.NotFound = "NotFound", i.DeviceInUse = "DeviceInUse", i.Other = "Other"
})(zi || (zi = {}));
(function(i) {
  function e(t) {
    if (t && "name" in t) return t.name === "NotFoundError" || t.name === "DevicesNotFoundError" ? i.NotFound : t.name === "NotAllowedError" || t.name === "PermissionDeniedError" ? i.PermissionDenied : t.name === "NotReadableError" || t.name === "TrackStartError" ? i.DeviceInUse : i.Other
  }
  i.getFailure = e
})(zi || (zi = {}));

Te.setTimeout = function() {
  return setTimeout(...arguments)
};
Te.setInterval = function() {
  return setInterval(...arguments)
};
Te.clearTimeout = function() {
  return clearTimeout(...arguments)
};
Te.clearInterval = function() {
  return clearInterval(...arguments)
};
var U;
(function(i) {
  i.Connected = "connected", i.Reconnecting = "reconnecting", i.SignalReconnecting = "signalReconnecting", i.Reconnected = "reconnected", i.Disconnected = "disconnected", i.ConnectionStateChanged = "connectionStateChanged", i.Moved = "moved", i.MediaDevicesChanged = "mediaDevicesChanged", i.ParticipantConnected = "participantConnected", i.ParticipantDisconnected = "participantDisconnected", i.TrackPublished = "trackPublished", i.TrackSubscribed = "trackSubscribed", i.TrackSubscriptionFailed = "trackSubscriptionFailed", i.TrackUnpublished = "trackUnpublished", i.TrackUnsubscribed = "trackUnsubscribed", i.TrackMuted = "trackMuted", i.TrackUnmuted = "trackUnmuted", i.LocalTrackPublished = "localTrackPublished", i.LocalTrackUnpublished = "localTrackUnpublished", i.LocalAudioSilenceDetected = "localAudioSilenceDetected", i.ActiveSpeakersChanged = "activeSpeakersChanged", i.ParticipantMetadataChanged = "participantMetadataChanged", i.ParticipantNameChanged = "participantNameChanged", i.ParticipantAttributesChanged = "participantAttributesChanged", i.ParticipantActive = "participantActive", i.RoomMetadataChanged = "roomMetadataChanged", i.DataReceived = "dataReceived", i.SipDTMFReceived = "sipDTMFReceived", i.TranscriptionReceived = "transcriptionReceived", i.ConnectionQualityChanged = "connectionQualityChanged", i.TrackStreamStateChanged = "trackStreamStateChanged", i.TrackSubscriptionPermissionChanged = "trackSubscriptionPermissionChanged", i.TrackSubscriptionStatusChanged = "trackSubscriptionStatusChanged", i.AudioPlaybackStatusChanged = "audioPlaybackChanged", i.VideoPlaybackStatusChanged = "videoPlaybackChanged", i.MediaDevicesError = "mediaDevicesError", i.ParticipantPermissionsChanged = "participantPermissionsChanged", i.SignalConnected = "signalConnected", i.RecordingStatusChanged = "recordingStatusChanged", i.ParticipantEncryptionStatusChanged = "participantEncryptionStatusChanged", i.EncryptionError = "encryptionError", i.DCBufferStatusChanged = "dcBufferStatusChanged", i.ActiveDeviceChanged = "activeDeviceChanged", i.ChatMessage = "chatMessage", i.LocalTrackSubscribed = "localTrackSubscribed", i.MetricsReceived = "metricsReceived"
})(U || (U = {}));
var W;
(function(i) {
  i.TrackPublished = "trackPublished", i.TrackSubscribed = "trackSubscribed", i.TrackSubscriptionFailed = "trackSubscriptionFailed", i.TrackUnpublished = "trackUnpublished", i.TrackUnsubscribed = "trackUnsubscribed", i.TrackMuted = "trackMuted", i.TrackUnmuted = "trackUnmuted", i.LocalTrackPublished = "localTrackPublished", i.LocalTrackUnpublished = "localTrackUnpublished", i.LocalTrackCpuConstrained = "localTrackCpuConstrained", i.LocalSenderCreated = "localSenderCreated", i.ParticipantMetadataChanged = "participantMetadataChanged", i.ParticipantNameChanged = "participantNameChanged", i.DataReceived = "dataReceived", i.SipDTMFReceived = "sipDTMFReceived", i.TranscriptionReceived = "transcriptionReceived", i.IsSpeakingChanged = "isSpeakingChanged", i.ConnectionQualityChanged = "connectionQualityChanged", i.TrackStreamStateChanged = "trackStreamStateChanged", i.TrackSubscriptionPermissionChanged = "trackSubscriptionPermissionChanged", i.TrackSubscriptionStatusChanged = "trackSubscriptionStatusChanged", i.TrackCpuConstrained = "trackCpuConstrained", i.MediaDevicesError = "mediaDevicesError", i.AudioStreamAcquired = "audioStreamAcquired", i.ParticipantPermissionsChanged = "participantPermissionsChanged", i.PCTrackAdded = "pcTrackAdded", i.AttributesChanged = "attributesChanged", i.LocalTrackSubscribed = "localTrackSubscribed", i.ChatMessage = "chatMessage", i.Active = "active"
})(W || (W = {}));
var V;
(function(i) {
  i.TransportsCreated = "transportsCreated", i.Connected = "connected", i.Disconnected = "disconnected", i.Resuming = "resuming", i.Resumed = "resumed", i.Restarting = "restarting", i.Restarted = "restarted", i.SignalResumed = "signalResumed", i.SignalRestarted = "signalRestarted", i.Closing = "closing", i.MediaTrackAdded = "mediaTrackAdded", i.ActiveSpeakersUpdate = "activeSpeakersUpdate", i.DataPacketReceived = "dataPacketReceived", i.RTPVideoMapUpdate = "rtpVideoMapUpdate", i.DCBufferStatusChanged = "dcBufferStatusChanged", i.ParticipantUpdate = "participantUpdate", i.RoomUpdate = "roomUpdate", i.SpeakersChanged = "speakersChanged", i.StreamStateChanged = "streamStateChanged", i.ConnectionQualityUpdate = "connectionQualityUpdate", i.SubscriptionError = "subscriptionError", i.SubscriptionPermissionUpdate = "subscriptionPermissionUpdate", i.RemoteMute = "remoteMute", i.SubscribedQualityUpdate = "subscribedQualityUpdate", i.LocalTrackUnpublished = "localTrackUnpublished", i.LocalTrackSubscribed = "localTrackSubscribed", i.Offline = "offline", i.SignalRequestResponse = "signalRequestResponse", i.SignalConnected = "signalConnected", i.RoomMoved = "roomMoved"
})(V || (V = {}));
var B;
(function(i) {
  i.Message = "message", i.Muted = "muted", i.Unmuted = "unmuted", i.Restarted = "restarted", i.Ended = "ended", i.Subscribed = "subscribed", i.Unsubscribed = "unsubscribed", i.CpuConstrained = "cpuConstrained", i.UpdateSettings = "updateSettings", i.UpdateSubscription = "updateSubscription", i.AudioPlaybackStarted = "audioPlaybackStarted", i.AudioPlaybackFailed = "audioPlaybackFailed", i.AudioSilenceDetected = "audioSilenceDetected", i.VisibilityChanged = "visibilityChanged", i.VideoDimensionsChanged = "videoDimensionsChanged", i.VideoPlaybackStarted = "videoPlaybackStarted", i.VideoPlaybackFailed = "videoPlaybackFailed", i.ElementAttached = "elementAttached", i.ElementDetached = "elementDetached", i.UpstreamPaused = "upstreamPaused", i.UpstreamResumed = "upstreamResumed", i.SubscriptionPermissionChanged = "subscriptionPermissionChanged", i.SubscriptionStatusChanged = "subscriptionStatusChanged", i.SubscriptionFailed = "subscriptionFailed", i.TrackProcessorUpdate = "trackProcessorUpdate", i.AudioTrackFeatureUpdate = "audioTrackFeatureUpdate", i.TranscriptionReceived = "transcriptionReceived", i.TimeSyncUpdate = "timeSyncUpdate", i.PreConnectBufferFlushed = "preConnectBufferFlushed"
})(B || (B = {}));



const Hh = ["vp8", "h264"],
  Kh = ["vp8", "h264", "vp9", "av1", "h265"];

function Gh(i) {
  return !!Hh.find(e => e === i)
}
const Jh = Gh;
var Jr;
(function(i) {
  i[i.PREFER_REGRESSION = 0] = "PREFER_REGRESSION", i[i.SIMULCAST = 1] = "SIMULCAST", i[i.REGRESSION = 2] = "REGRESSION"
})(Jr || (Jr = {}));
var is;
(function(i) {
  i.telephone = {
    maxBitrate: 12e3
  }, i.speech = {
    maxBitrate: 24e3
  }, i.music = {
    maxBitrate: 48e3
  }, i.musicStereo = {
    maxBitrate: 64e3
  }, i.musicHighQuality = {
    maxBitrate: 96e3
  }, i.musicHighQualityStereo = {
    maxBitrate: 128e3
  }
})(is || (is = {}));
const gi = {
    h90: new oe(160, 90, 9e4, 20),
    h180: new oe(320, 180, 16e4, 20),
    h216: new oe(384, 216, 18e4, 20),
    h360: new oe(640, 360, 45e4, 20),
    h540: new oe(960, 540, 8e5, 25),
    h720: new oe(1280, 720, 17e5, 30),
    h1080: new oe(1920, 1080, 3e6, 30),
    h1440: new oe(2560, 1440, 5e6, 30),
    h2160: new oe(3840, 2160, 8e6, 30)
  },
  ns = {
    h120: new oe(160, 120, 7e4, 20),
    h180: new oe(240, 180, 125e3, 20),
    h240: new oe(320, 240, 14e4, 20),
    h360: new oe(480, 360, 33e4, 20),
    h480: new oe(640, 480, 5e5, 20),
    h540: new oe(720, 540, 6e5, 25),
    h720: new oe(960, 720, 13e5, 30),
    h1080: new oe(1440, 1080, 23e5, 30),
    h1440: new oe(1920, 1440, 38e5, 30)
  },
  ln = {
    h360fps3: new oe(640, 360, 2e5, 3, "medium"),
    h360fps15: new oe(640, 360, 4e5, 15, "medium"),
    h720fps5: new oe(1280, 720, 8e5, 5, "medium"),
    h720fps15: new oe(1280, 720, 15e5, 15, "medium"),
    h720fps30: new oe(1280, 720, 2e6, 30, "medium"),
    h1080fps15: new oe(1920, 1080, 25e5, 15, "medium"),
    h1080fps30: new oe(1920, 1080, 5e6, 30, "medium"),
    original: new oe(0, 0, 7e6, 30, "medium")
  };

function Sc(i, e, t) {
  var n, s, r, a;
  const {
    optionsWithoutProcessor: o,
    audioProcessor: c,
    videoProcessor: d
  } = wc(i ?? {}), l = e == null ? void 0 : e.processor, u = t == null ? void 0 : t.processor, h = o ?? {};
  return h.audio === !0 && (h.audio = {}), h.video === !0 && (h.video = {}), h.audio && (ss(h.audio, e), (n = (r = h.audio).deviceId) !== null && n !== void 0 || (r.deviceId = {
    ideal: "default"
  }), (c || l) && (h.audio.processor = c ?? l)), h.video && (ss(h.video, t), (s = (a = h.video).deviceId) !== null && s !== void 0 || (a.deviceId = {
    ideal: "default"
  }), (d || u) && (h.video.processor = d ?? u)), h
}



function qs(i) {
  var e, t, n, s;
  const r = {};
  if (i.video)
    if (typeof i.video == "object") {
      const a = {},
        o = a,
        c = i.video;
      Object.keys(c).forEach(d => {
        switch (d) {
          case "resolution":
            ss(o, c.resolution);
            break;
          default:
            o[d] = c[d]
        }
      }), r.video = a, (e = (n = r.video).deviceId) !== null && e !== void 0 || (n.deviceId = {
        ideal: "default"
      })
    } else r.video = i.video ? {
      deviceId: {
        ideal: "default"
      }
    } : !1;
  else r.video = !1;
  return i.audio ? typeof i.audio == "object" ? (r.audio = i.audio, (t = (s = r.audio).deviceId) !== null && t !== void 0 || (s.deviceId = {
    ideal: "default"
  })) : r.audio = {
    deviceId: {
      ideal: "default"
    }
  } : r.audio = !1, r
}

function Tc(i) {
  return b(this, arguments, void 0, function(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 200;
    return function*() {
      const n = Cc();
      if (n) {
        const s = n.createAnalyser();
        s.fftSize = 2048;
        const r = s.frequencyBinCount,
          a = new Uint8Array(r);
        n.createMediaStreamSource(new MediaStream([e.mediaStreamTrack])).connect(s), yield Ce(t), s.getByteTimeDomainData(a);
        const c = a.some(d => d !== 128 && d !== 0);
        return n.close(), !c
      }
      return !1
    }()
  })
}

function Cc() {
  var i;
  const e = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  if (e) {
    const t = new e({
      latencyHint: "interactive"
    });
    if (t.state === "suspended" && typeof window < "u" && (!((i = window.document) === null || i === void 0) && i.body)) {
      const n = () => b(this, void 0, void 0, function*() {
        var s;
        try {
          t.state === "suspended" && (yield t.resume())
        } catch (r) {
          console.warn("Error trying to auto-resume audio context", r)
        } finally {
          (s = window.document.body) === null || s === void 0 || s.removeEventListener("click", n)
        }
      });
      t.addEventListener("statechange", () => {
        var s;
        t.state === "closed" && ((s = window.document.body) === null || s === void 0 || s.removeEventListener("click", n))
      }), window.document.body.addEventListener("click", n)
    }
    return t
  }
}

function zh(i) {
  return i === "audioinput" ? O.Source.Microphone : i === "videoinput" ? O.Source.Camera : O.Source.Unknown
}

function rs(i) {
  return i === O.Source.Microphone ? "audioinput" : i === O.Source.Camera ? "videoinput" : void 0
}

function $h(i) {
  var e, t;
  let n = (e = i.video) !== null && e !== void 0 ? e : !0;
  return i.resolution && i.resolution.width > 0 && i.resolution.height > 0 && (n = typeof n == "boolean" ? {} : n, Dt() ? n = Object.assign(Object.assign({}, n), {
    width: {
      max: i.resolution.width
    },
    height: {
      max: i.resolution.height
    },
    frameRate: i.resolution.frameRate
  }) : n = Object.assign(Object.assign({}, n), {
    width: {
      ideal: i.resolution.width
    },
    height: {
      ideal: i.resolution.height
    },
    frameRate: i.resolution.frameRate
  })), {
    audio: (t = i.audio) !== null && t !== void 0 ? t : !1,
    video: n,
    controller: i.controller,
    selfBrowserSurface: i.selfBrowserSurface,
    surfaceSwitching: i.surfaceSwitching,
    systemAudio: i.systemAudio,
    preferCurrentTab: i.preferCurrentTab
  }
}



function Qh(i) {
  const e = [];
  return i.forEach(t => {
    t.track !== void 0 && e.push(new Ds({
      cid: t.track.mediaStreamID,
      track: t.trackInfo
    }))
  }), e
}

function te(i) {
  return "mediaStreamTrack" in i ? {
    trackID: i.sid,
    source: i.source,
    muted: i.isMuted,
    enabled: i.mediaStreamTrack.enabled,
    kind: i.kind,
    streamID: i.mediaStreamID,
    streamTrackID: i.mediaStreamTrack.id
  } : {
    trackID: i.trackSid,
    enabled: i.isEnabled,
    muted: i.isMuted,
    trackInfo: Object.assign({
      mimeType: i.mimeType,
      name: i.trackName,
      encrypted: i.isEncrypted,
      kind: i.kind,
      source: i.source
    }, i.track ? te(i.track) : {})
  }
}





function wc(i) {
  const e = Object.assign({}, i);
  let t, n;
  return typeof e.audio == "object" && e.audio.processor && (t = e.audio.processor, e.audio = Object.assign(Object.assign({}, e.audio), {
    processor: void 0
  })), typeof e.video == "object" && e.video.processor && (n = e.video.processor, e.video = Object.assign(Object.assign({}, e.video), {
    processor: void 0
  })), {
    audioProcessor: t,
    videoProcessor: n,
    optionsWithoutProcessor: Wh(e)
  }
}

function Zh(i) {
  switch (i) {
    case ye.CAMERA:
      return O.Source.Camera;
    case ye.MICROPHONE:
      return O.Source.Microphone;
    case ye.SCREEN_SHARE:
      return O.Source.ScreenShare;
    case ye.SCREEN_SHARE_AUDIO:
      return O.Source.ScreenShareAudio;
    default:
      return O.Source.Unknown
  }
}




const tm = 5e3,
  ei = [];
var De;
(function(i) {
  i[i.LOW = 0] = "LOW", i[i.MEDIUM = 1] = "MEDIUM", i[i.HIGH = 2] = "HIGH"
})(De || (De = {}));
class O extends et.EventEmitter {
  get streamState() {
    return this._streamState
  }
  setStreamState(e) {
    this._streamState = e
  }
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var s;
    super(), this.attachedElements = [], this.isMuted = !1, this._streamState = O.StreamState.Active, this.isInBackground = !1, this._currentBitrate = 0, this.log = X, this.appVisibilityChangedListener = () => {
      this.backgroundTimeout && clearTimeout(this.backgroundTimeout), document.visibilityState === "hidden" ? this.backgroundTimeout = setTimeout(() => this.handleAppVisibilityChanged(), tm) : this.handleAppVisibilityChanged()
    }, this.log = Ye((s = n.loggerName) !== null && s !== void 0 ? s : Ue.Track), this.loggerContextCb = n.loggerContextCb, this.setMaxListeners(100), this.kind = t, this._mediaStreamTrack = e, this._mediaStreamID = e.id, this.source = O.Source.Unknown
  }
  get logContext() {
    var e;
    return Object.assign(Object.assign({}, (e = this.loggerContextCb) === null || e === void 0 ? void 0 : e.call(this)), te(this))
  }
  get currentBitrate() {
    return this._currentBitrate
  }
  get mediaStreamTrack() {
    return this._mediaStreamTrack
  }
  get mediaStreamID() {
    return this._mediaStreamID
  }
  attach(e) {
    let t = "audio";
    this.kind === O.Kind.Video && (t = "video"), this.attachedElements.length === 0 && this.kind === O.Kind.Video && this.addAppVisibilityListener(), e || (t === "audio" && (ei.forEach(r => {
      r.parentElement === null && !e && (e = r)
    }), e && ei.splice(ei.indexOf(e), 1)), e || (e = document.createElement(t))), this.attachedElements.includes(e) || this.attachedElements.push(e), Ft(this.mediaStreamTrack, e);
    const n = e.srcObject.getTracks(),
      s = n.some(r => r.kind === "audio");
    return e.play().then(() => {
      this.emit(s ? B.AudioPlaybackStarted : B.VideoPlaybackStarted)
    }).catch(r => {
      r.name === "NotAllowedError" ? this.emit(s ? B.AudioPlaybackFailed : B.VideoPlaybackFailed, r) : r.name === "AbortError" ? X.debug("".concat(s ? "audio" : "video", " playback aborted, likely due to new play request")) : X.warn("could not playback ".concat(s ? "audio" : "video"), r), s && e && n.some(a => a.kind === "video") && r.name === "NotAllowedError" && (e.muted = !0, e.play().catch(() => {}))
    }), this.emit(B.ElementAttached, e), e
  }
  detach(e) {
    try {
      if (e) {
        Ht(this.mediaStreamTrack, e);
        const n = this.attachedElements.indexOf(e);
        return n >= 0 && (this.attachedElements.splice(n, 1), this.recycleElement(e), this.emit(B.ElementDetached, e)), e
      }
      const t = [];
      return this.attachedElements.forEach(n => {
        Ht(this.mediaStreamTrack, n), t.push(n), this.recycleElement(n), this.emit(B.ElementDetached, n)
      }), this.attachedElements = [], t
    } finally {
      this.attachedElements.length === 0 && this.removeAppVisibilityListener()
    }
  }
  stop() {
    this.stopMonitor(), this._mediaStreamTrack.stop()
  }
  enable() {
    this._mediaStreamTrack.enabled = !0
  }
  disable() {
    this._mediaStreamTrack.enabled = !1
  }
  stopMonitor() {
    this.monitorInterval && clearInterval(this.monitorInterval), this.timeSyncHandle && cancelAnimationFrame(this.timeSyncHandle)
  }
  updateLoggerOptions(e) {
    e.loggerName && (this.log = Ye(e.loggerName)), e.loggerContextCb && (this.loggerContextCb = e.loggerContextCb)
  }
  recycleElement(e) {
    if (e instanceof HTMLAudioElement) {
      let t = !0;
      e.pause(), ei.forEach(n => {
        n.parentElement || (t = !1)
      }), t && ei.push(e)
    }
  }
  handleAppVisibilityChanged() {
    return b(this, void 0, void 0, function*() {
      this.isInBackground = document.visibilityState === "hidden", !this.isInBackground && this.kind === O.Kind.Video && setTimeout(() => this.attachedElements.forEach(e => e.play().catch(() => {})), 0)
    })
  }
  addAppVisibilityListener() {
    Me() ? (this.isInBackground = document.visibilityState === "hidden", document.addEventListener("visibilitychange", this.appVisibilityChangedListener)) : this.isInBackground = !1
  }
  removeAppVisibilityListener() {
    Me() && document.removeEventListener("visibilitychange", this.appVisibilityChangedListener)
  }
}

function Ft(i, e) {
  let t;
  e.srcObject instanceof MediaStream ? t = e.srcObject : t = new MediaStream;
  let n;
  i.kind === "audio" ? n = t.getAudioTracks() : n = t.getVideoTracks(), n.includes(i) || (n.forEach(s => {
    t.removeTrack(s)
  }), t.addTrack(i)), (!Dt() || !(e instanceof HTMLVideoElement)) && (e.autoplay = !0), e.muted = t.getAudioTracks().length === 0, e instanceof HTMLVideoElement && (e.playsInline = !0), e.srcObject !== t && (e.srcObject = t, (Dt() || Ot()) && e instanceof HTMLVideoElement && setTimeout(() => {
    e.srcObject = t, e.play().catch(() => {})
  }, 0))
}

(function(i) {
  let e;
  (function(d) {
    d.Audio = "audio", d.Video = "video", d.Unknown = "unknown"
  })(e = i.Kind || (i.Kind = {}));
  let t;
  (function(d) {
    d.Camera = "camera", d.Microphone = "microphone", d.ScreenShare = "screen_share", d.ScreenShareAudio = "screen_share_audio", d.Unknown = "unknown"
  })(t = i.Source || (i.Source = {}));
  let n;
  (function(d) {
    d.Active = "active", d.Paused = "paused", d.Unknown = "unknown"
  })(n = i.StreamState || (i.StreamState = {}));

  function s(d) {
    switch (d) {
      case e.Audio:
        return Ve.AUDIO;
      case e.Video:
        return Ve.VIDEO;
      default:
        return Ve.DATA
    }
  }
  i.kindToProto = s;

  function r(d) {
    switch (d) {
      case Ve.AUDIO:
        return e.Audio;
      case Ve.VIDEO:
        return e.Video;
      default:
        return e.Unknown
    }
  }
  i.kindFromProto = r;

  function a(d) {
    switch (d) {
      case t.Camera:
        return ye.CAMERA;
      case t.Microphone:
        return ye.MICROPHONE;
      case t.ScreenShare:
        return ye.SCREEN_SHARE;
      case t.ScreenShareAudio:
        return ye.SCREEN_SHARE_AUDIO;
      default:
        return ye.UNKNOWN
    }
  }
  i.sourceToProto = a;

  function o(d) {
    switch (d) {
      case ye.CAMERA:
        return t.Camera;
      case ye.MICROPHONE:
        return t.Microphone;
      case ye.SCREEN_SHARE:
        return t.ScreenShare;
      case ye.SCREEN_SHARE_AUDIO:
        return t.ScreenShareAudio;
      default:
        return t.Unknown
    }
  }
  i.sourceFromProto = o;

  function c(d) {
    switch (d) {
      case Gn.ACTIVE:
        return n.Active;
      case Gn.PAUSED:
        return n.Paused;
      default:
        return n.Unknown
    }
  }
  i.streamStateFromProto = c
})(O || (O = {}));
const im = "|",
  $r = "https://aomediacodec.github.io/av1-rtp-spec/#dependency-descriptor-rtp-header-extension";

function nm(i) {
  const e = i.split(im);
  return e.length > 1 ? [e[0], i.substr(e[0].length + 1)] : [i, ""]
}

function Ce(i) {
  return new Ee(e => Te.setTimeout(e, i))
}





function sm() {
  if (!("getCapabilities" in RTCRtpSender) || Dt() || Ot()) return !1;
  const i = RTCRtpSender.getCapabilities("video");
  let e = !1;
  if (i) {
    for (const t of i.codecs)
      if (t.mimeType.toLowerCase() === "video/av1") {
        e = !0;
        break
      }
  }
  return e
}

function rm() {
  if (!("getCapabilities" in RTCRtpSender) || Ot()) return !1;
  if (Dt()) {
    const t = Oe();
    if (t != null && t.version && Ze(t.version, "16") < 0 || (t == null ? void 0 : t.os) === "iOS" && (t != null && t.osVersion) && Ze(t.osVersion, "16") < 0) return !1
  }
  const i = RTCRtpSender.getCapabilities("video");
  let e = !1;
  if (i) {
    for (const t of i.codecs)
      if (t.mimeType.toLowerCase() === "video/vp9") {
        e = !0;
        break
      }
  }
  return e
}



function cs(i) {
  return !document || vi() ? !1 : (i || (i = document.createElement("audio")), "setSinkId" in i)
}

function om() {
  return typeof RTCPeerConnection > "u" ? !1 : os() || as()
}

function Ot() {
  var i;
  return ((i = Oe()) === null || i === void 0 ? void 0 : i.name) === "Firefox"
}

function Qr() {
  const i = Oe();
  return !!i && i.name === "Chrome" && i.os !== "iOS"
}

function Dt() {
  var i;
  return ((i = Oe()) === null || i === void 0 ? void 0 : i.name) === "Safari"
}

function vi() {
  const i = Oe();
  return (i == null ? void 0 : i.name) === "Safari" || (i == null ? void 0 : i.os) === "iOS"
}

function am() {
  const i = Oe();
  return (i == null ? void 0 : i.name) === "Safari" && i.version.startsWith("17.") || (i == null ? void 0 : i.os) === "iOS" && !!(i != null && i.osVersion) && Ze(i.osVersion, "17") >= 0
}

function cm(i) {
  return i || (i = Oe()), (i == null ? void 0 : i.name) === "Safari" && Ze(i.version, "18.3") > 0 || (i == null ? void 0 : i.os) === "iOS" && !!(i != null && i.osVersion) && Ze(i.osVersion, "18.3") > 0
}

function Ec() {
  var i, e;
  return Me() ? (e = (i = navigator.userAgentData) === null || i === void 0 ? void 0 : i.mobile) !== null && e !== void 0 ? e : /Tablet|iPad|Mobile|Android|BlackBerry/.test(navigator.userAgent) : !1
}

function dm() {
  const i = Oe(),
    e = "17.2";
  if (i) return i.name !== "Safari" && i.os !== "iOS" || i.os === "iOS" && i.osVersion && Ze(i.osVersion, e) >= 0 ? !0 : i.name === "Safari" && Ze(i.version, e) >= 0
}







function Sn(i) {
  return zt(i) ? i.hostname.split(".")[0] : null
}



function Rc() {
  if (!Xe()) return;
  let i = Pc();
  if (i) return i.platform
}

function Yr() {
  if (Me()) return window.devicePixelRatio;
  if (Xe()) {
    let i = Pc();
    if (i) return i.devicePixelRatio
  }
  return 1
}






let Tn = null;
const Xr = () => (Tn || (Tn = new ResizeObserver(lm)), Tn);
let Cn = null;
const Zr = () => (Cn || (Cn = new IntersectionObserver(um, {
  root: null,
  rootMargin: "0px"
})), Cn);

function hm() {
  var i;
  const e = new Ca({
    sdk: wa.JS,
    protocol: Vh,
    version: Bh
  });
  return Xe() && (e.os = (i = Rc()) !== null && i !== void 0 ? i : ""), e
}


let ti;

function wn() {
  if (!ti) {
    const i = new AudioContext,
      e = i.createOscillator(),
      t = i.createGain();
    t.gain.setValueAtTime(0, 0);
    const n = i.createMediaStreamDestination();
    if (e.connect(t), t.connect(n), e.start(), [ti] = n.stream.getAudioTracks(), !ti) throw Error("Could not get empty media stream audio track");
    ti.enabled = !1
  }
  return ti.clone()
}
class Le {
  get isResolved() {
    return this._isResolved
  }
  constructor(e, t) {
    this._isResolved = !1, this.onFinally = t, this.promise = new Promise((n, s) => b(this, void 0, void 0, function*() {
      this.resolve = n, this.reject = s, e && (yield e(n, s))
    })).finally(() => {
      var n;
      this._isResolved = !0, (n = this.onFinally) === null || n === void 0 || n.call(this)
    })
  }
}

function mm(i) {
  return Kh.includes(i)
}







function pm(i, e) {
  return i.segments.map(t => {
    let {
      id: n,
      text: s,
      language: r,
      startTime: a,
      endTime: o,
      final: c
    } = t;
    var d;
    const l = (d = e.get(n)) !== null && d !== void 0 ? d : Date.now(),
      u = Date.now();
    return c ? e.delete(n) : e.set(n, l), {
      id: n,
      text: s,
      startTime: Number.parseInt(a.toString()),
      endTime: Number.parseInt(o.toString()),
      final: c,
      language: r,
      firstReceivedTime: l,
      lastReceivedTime: u
    }
  })
}

function gm(i) {
  const {
    id: e,
    timestamp: t,
    message: n,
    editTimestamp: s
  } = i;
  return {
    id: e,
    timestamp: Number.parseInt(t.toString()),
    editTimestamp: s ? Number.parseInt(s.toString()) : void 0,
    message: n
  }
}

function to(i) {
  switch (i.reason) {
    case ce.LeaveRequest:
      return i.context;
    case ce.Cancelled:
      return He.CLIENT_INITIATED;
    case ce.NotAllowed:
      return He.USER_REJECTED;
    case ce.ServerUnreachable:
      return He.JOIN_FAILURE;
    default:
      return He.UNKNOWN_REASON
  }
}







function Qe(i) {
  return !!i && i.kind == O.Kind.Audio
}

function Ct(i) {
  return !!i && i.kind == O.Kind.Video
}

function ht(i) {
  return Kt(i) && Ct(i)
}

function it(i) {
  return Kt(i) && Qe(i)
}





function En(i) {
  return ds(i) && Ct(i)
}







function Sm(i, e) {
  let t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
  const n = Tm(i, e);
  return t ? n : Ws(n, "v1")
}

function Tm(i, e) {
  const t = new URL(fm(i));
  return e.forEach((n, s) => {
    t.searchParams.set(s, n)
  }), Ws(t, "rtc")
}

function Cm(i) {
  const e = new URL(bi(i));
  return Ws(e, "validate")
}



function Ws(i, e) {
  return i.pathname = "".concat(_c(i.pathname)).concat(e), i
}

function io(i) {
  if (typeof i == "string") return Ar.fromJson(JSON.parse(i), {
    ignoreUnknownFields: !0
  });
  if (i instanceof ArrayBuffer) return Ar.fromBinary(new Uint8Array(i));
  throw new Error("could not decode websocket message: ".concat(typeof i))
}


const Em = 10,
  ii = "lk_e2ee",
  Pm = "LKFrameEncryptionKey",
  Rm = {
    sharedKey: !1,
    ratchetSalt: Pm,
    ratchetWindowSize: 8,
    failureTolerance: Em,
    keyringSize: 16
  };
var yt;
(function(i) {
  i.SetKey = "setKey", i.RatchetRequest = "ratchetRequest", i.KeyRatcheted = "keyRatcheted"
})(yt || (yt = {}));
var no;
(function(i) {
  i.KeyRatcheted = "keyRatcheted"
})(no || (no = {}));
var vt;
(function(i) {
  i.ParticipantEncryptionStatusChanged = "participantEncryptionStatusChanged", i.EncryptionError = "encryptionError"
})(vt || (vt = {}));
var so;
(function(i) {
  i.Error = "cryptorError"
})(so || (so = {}));

function _m() {
  return Im() || ls()
}





function xm(i) {
  var e, t, n, s, r;
  if (((e = i.value) === null || e === void 0 ? void 0 : e.case) !== "sipDtmf" && ((t = i.value) === null || t === void 0 ? void 0 : t.case) !== "metrics" && ((n = i.value) === null || n === void 0 ? void 0 : n.case) !== "speaker" && ((s = i.value) === null || s === void 0 ? void 0 : s.case) !== "transcription" && ((r = i.value) === null || r === void 0 ? void 0 : r.case) !== "encryptedPacket") return new ga({
    value: i.value
  })
}
class Xp extends et.EventEmitter {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    super(), this.onKeyRatcheted = (t, n, s) => {
      X.debug("key ratcheted event received", {
        ratchetResult: t,
        participantId: n,
        keyIndex: s
      })
    }, this.keyInfoMap = new Map, this.options = Object.assign(Object.assign({}, Rm), e), this.on(yt.KeyRatcheted, this.onKeyRatcheted)
  }
  onSetEncryptionKey(e, t, n) {
    const s = {
      key: e,
      participantIdentity: t,
      keyIndex: n
    };
    if (!this.options.sharedKey && !t) throw new Error("participant identity needs to be passed for encryption key if sharedKey option is false");
    this.keyInfoMap.set("".concat(t ?? "shared", "-").concat(n ?? 0), s), this.emit(yt.SetKey, s)
  }
  getKeys() {
    return Array.from(this.keyInfoMap.values())
  }
  getOptions() {
    return this.options
  }
  ratchetKey(e, t) {
    this.emit(yt.RatchetRequest, e, t)
  }
}
var ro;
(function(i) {
  i[i.InvalidKey = 0] = "InvalidKey", i[i.MissingKey = 1] = "MissingKey", i[i.InternalError = 2] = "InternalError"
})(ro || (ro = {}));
class Mm extends et.EventEmitter {
  constructor(e, t) {
    super(), this.decryptDataRequests = new Map, this.encryptDataRequests = new Map, this.onWorkerMessage = n => {
      var s, r;
      const {
        kind: a,
        data: o
      } = n.data;
      switch (a) {
        case "error":
          if (X.error(o.error.message), o.uuid) {
            const l = this.decryptDataRequests.get(o.uuid);
            if (l != null && l.reject) {
              l.reject(o.error);
              break
            }
            const u = this.encryptDataRequests.get(o.uuid);
            if (u != null && u.reject) {
              u.reject(o.error);
              break
            }
          }
          this.emit(vt.EncryptionError, o.error, o.participantIdentity);
          break;
        case "initAck":
          o.enabled && this.keyProvider.getKeys().forEach(l => {
            this.postKey(l)
          });
          break;
        case "enable":
          if (o.enabled && this.keyProvider.getKeys().forEach(l => {
              this.postKey(l)
            }), this.encryptionEnabled !== o.enabled && o.participantIdentity === ((s = this.room) === null || s === void 0 ? void 0 : s.localParticipant.identity)) this.emit(vt.ParticipantEncryptionStatusChanged, o.enabled, this.room.localParticipant), this.encryptionEnabled = o.enabled;
          else if (o.participantIdentity) {
            const l = (r = this.room) === null || r === void 0 ? void 0 : r.getParticipantByIdentity(o.participantIdentity);
            if (!l) throw TypeError("couldn't set encryption status, participant not found".concat(o.participantIdentity));
            this.emit(vt.ParticipantEncryptionStatusChanged, o.enabled, l)
          }
          break;
        case "ratchetKey":
          this.keyProvider.emit(yt.KeyRatcheted, o.ratchetResult, o.participantIdentity, o.keyIndex);
          break;
        case "decryptDataResponse":
          const c = this.decryptDataRequests.get(o.uuid);
          c != null && c.resolve && c.resolve(o);
          break;
        case "encryptDataResponse":
          const d = this.encryptDataRequests.get(o.uuid);
          d != null && d.resolve && d.resolve(o);
          break
      }
    }, this.onWorkerError = n => {
      X.error("e2ee worker encountered an error:", {
        error: n.error
      }), this.emit(vt.EncryptionError, n.error, void 0)
    }, this.keyProvider = e.keyProvider, this.worker = e.worker, this.encryptionEnabled = !1, this.dataChannelEncryptionEnabled = t
  }
  get isEnabled() {
    return this.encryptionEnabled
  }
  get isDataChannelEncryptionEnabled() {
    return this.isEnabled && this.dataChannelEncryptionEnabled
  }
  setup(e) {
    if (!_m()) throw new Vs("tried to setup end-to-end encryption on an unsupported browser");
    if (X.info("setting up e2ee"), e !== this.room) {
      this.room = e, this.setupEventListeners(e, this.keyProvider);
      const t = {
        kind: "init",
        data: {
          keyProviderOptions: this.keyProvider.getOptions(),
          loglevel: wh.getLevel()
        }
      };
      this.worker && (X.info("initializing worker", {
        worker: this.worker
      }), this.worker.onmessage = this.onWorkerMessage, this.worker.onerror = this.onWorkerError, this.worker.postMessage(t))
    }
  }
  setParticipantCryptorEnabled(e, t) {
    X.debug("set e2ee to ".concat(e, " for participant ").concat(t)), this.postEnable(e, t)
  }
  setSifTrailer(e) {
    !e || e.length === 0 ? X.warn("ignoring server sent trailer as it's empty") : this.postSifTrailer(e)
  }
  setupEngine(e) {
    e.on(V.RTPVideoMapUpdate, t => {
      this.postRTPMap(t)
    })
  }
  setupEventListeners(e, t) {
    e.on(U.TrackPublished, (n, s) => this.setParticipantCryptorEnabled(n.trackInfo.encryption !== ge.NONE, s.identity)), e.on(U.ConnectionStateChanged, n => {
      n === re.Connected && e.remoteParticipants.forEach(s => {
        s.trackPublications.forEach(r => {
          this.setParticipantCryptorEnabled(r.trackInfo.encryption !== ge.NONE, s.identity)
        })
      })
    }).on(U.TrackUnsubscribed, (n, s, r) => {
      var a;
      const o = {
        kind: "removeTransform",
        data: {
          participantIdentity: r.identity,
          trackId: n.mediaStreamID
        }
      };
      (a = this.worker) === null || a === void 0 || a.postMessage(o)
    }).on(U.TrackSubscribed, (n, s, r) => {
      this.setupE2EEReceiver(n, r.identity, s.trackInfo)
    }).on(U.SignalConnected, () => {
      if (!this.room) throw new TypeError("expected room to be present on signal connect");
      t.getKeys().forEach(n => {
        this.postKey(n)
      }), this.setParticipantCryptorEnabled(this.room.localParticipant.isE2EEEnabled, this.room.localParticipant.identity)
    }), e.localParticipant.on(W.LocalSenderCreated, (n, s) => b(this, void 0, void 0, function*() {
      this.setupE2EESender(s, n)
    })), e.localParticipant.on(W.LocalTrackPublished, n => {
      if (!Ct(n.track) || !vi()) return;
      const s = {
        kind: "updateCodec",
        data: {
          trackId: n.track.mediaStreamID,
          codec: li(n.trackInfo.codecs[0].mimeType),
          participantIdentity: this.room.localParticipant.identity
        }
      };
      this.worker.postMessage(s)
    }), t.on(yt.SetKey, n => this.postKey(n)).on(yt.RatchetRequest, (n, s) => this.postRatchetRequest(n, s))
  }
  encryptData(e) {
    return b(this, void 0, void 0, function*() {
      if (!this.worker) throw Error("could not encrypt data, worker is missing");
      const t = crypto.randomUUID(),
        n = {
          kind: "encryptDataRequest",
          data: {
            uuid: t,
            payload: e,
            participantIdentity: this.room.localParticipant.identity
          }
        },
        s = new Le;
      return s.onFinally = () => {
        this.encryptDataRequests.delete(t)
      }, this.encryptDataRequests.set(t, s), this.worker.postMessage(n), s.promise
    })
  }
  handleEncryptedData(e, t, n, s) {
    if (!this.worker) throw Error("could not handle encrypted data, worker is missing");
    const r = crypto.randomUUID(),
      a = {
        kind: "decryptDataRequest",
        data: {
          uuid: r,
          payload: e,
          iv: t,
          participantIdentity: n,
          keyIndex: s
        }
      },
      o = new Le;
    return o.onFinally = () => {
      this.decryptDataRequests.delete(r)
    }, this.decryptDataRequests.set(r, o), this.worker.postMessage(a), o.promise
  }
  postRatchetRequest(e, t) {
    if (!this.worker) throw Error("could not ratchet key, worker is missing");
    const n = {
      kind: "ratchetRequest",
      data: {
        participantIdentity: e,
        keyIndex: t
      }
    };
    this.worker.postMessage(n)
  }
  postKey(e) {
    let {
      key: t,
      participantIdentity: n,
      keyIndex: s
    } = e;
    var r;
    if (!this.worker) throw Error("could not set key, worker is missing");
    const a = {
      kind: "setKey",
      data: {
        participantIdentity: n,
        isPublisher: n === ((r = this.room) === null || r === void 0 ? void 0 : r.localParticipant.identity),
        key: t,
        keyIndex: s
      }
    };
    this.worker.postMessage(a)
  }
  postEnable(e, t) {
    if (this.worker) {
      const n = {
        kind: "enable",
        data: {
          enabled: e,
          participantIdentity: t
        }
      };
      this.worker.postMessage(n)
    } else throw new ReferenceError("failed to enable e2ee, worker is not ready")
  }
  postRTPMap(e) {
    var t;
    if (!this.worker) throw TypeError("could not post rtp map, worker is missing");
    if (!(!((t = this.room) === null || t === void 0) && t.localParticipant.identity)) throw TypeError("could not post rtp map, local participant identity is missing");
    const n = {
      kind: "setRTPMap",
      data: {
        map: e,
        participantIdentity: this.room.localParticipant.identity
      }
    };
    this.worker.postMessage(n)
  }
  postSifTrailer(e) {
    if (!this.worker) throw Error("could not post SIF trailer, worker is missing");
    const t = {
      kind: "setSifTrailer",
      data: {
        trailer: e
      }
    };
    this.worker.postMessage(t)
  }
  setupE2EEReceiver(e, t, n) {
    if (e.receiver) {
      if (!(n != null && n.mimeType) || n.mimeType === "") throw new TypeError("MimeType missing from trackInfo, cannot set up E2EE cryptor");
      this.handleReceiver(e.receiver, e.mediaStreamID, t, e.kind === "video" ? li(n.mimeType) : void 0)
    }
  }
  setupE2EESender(e, t) {
    if (!Kt(e) || !t) {
      t || X.warn("early return because sender is not ready");
      return
    }
    this.handleSender(t, e.mediaStreamID, void 0)
  }
  handleReceiver(e, t, n, s) {
    return b(this, void 0, void 0, function*() {
      if (this.worker) {
        if (ls() && !Qr()) {
          const r = {
            kind: "decode",
            participantIdentity: n,
            trackId: t,
            codec: s
          };
          e.transform = new RTCRtpScriptTransform(this.worker, r)
        } else {
          if (ii in e && s) {
            const c = {
              kind: "updateCodec",
              data: {
                trackId: t,
                codec: s,
                participantIdentity: n
              }
            };
            this.worker.postMessage(c);
            return
          }
          let r = e.writableStream,
            a = e.readableStream;
          if (!r || !a) {
            const c = e.createEncodedStreams();
            e.writableStream = c.writable, r = c.writable, e.readableStream = c.readable, a = c.readable
          }
          const o = {
            kind: "decode",
            data: {
              readableStream: a,
              writableStream: r,
              trackId: t,
              codec: s,
              participantIdentity: n,
              isReuse: ii in e
            }
          };
          this.worker.postMessage(o, [a, r])
        }
        e[ii] = !0
      }
    })
  }
  handleSender(e, t, n) {
    var s;
    if (!(ii in e || !this.worker)) {
      if (!(!((s = this.room) === null || s === void 0) && s.localParticipant.identity) || this.room.localParticipant.identity === "") throw TypeError("local identity needs to be known in order to set up encrypted sender");
      if (ls() && !Qr()) {
        X.info("initialize script transform");
        const r = {
          kind: "encode",
          participantIdentity: this.room.localParticipant.identity,
          trackId: t,
          codec: n
        };
        e.transform = new RTCRtpScriptTransform(this.worker, r)
      } else {
        X.info("initialize encoded streams");
        const r = e.createEncodedStreams(),
          a = {
            kind: "encode",
            data: {
              readableStream: r.readable,
              writableStream: r.writable,
              codec: n,
              trackId: t,
              participantIdentity: this.room.localParticipant.identity,
              isReuse: !1
            }
          };
        this.worker.postMessage(a, [r.readable, r.writable])
      }
      e[ii] = !0
    }
  }
}
const Om = 500,
  Dm = 15e3;
class Gt {
  constructor() {
    this.failedConnectionAttempts = new Map, this.backOffPromises = new Map
  }
  static getInstance() {
    return this._instance || (this._instance = new Gt), this._instance
  }
  addFailedConnectionAttempt(e) {
    var t;
    const n = new URL(e),
      s = Sn(n);
    if (!s) return;
    let r = (t = this.failedConnectionAttempts.get(s)) !== null && t !== void 0 ? t : 0;
    this.failedConnectionAttempts.set(s, r + 1), this.backOffPromises.set(s, Ce(Math.min(Om * Math.pow(2, r), Dm)))
  }
  getBackOffPromise(e) {
    const t = new URL(e),
      n = t && Sn(t);
    return n && this.backOffPromises.get(n) || Promise.resolve()
  }
  resetFailedConnectionAttempts(e) {
    const t = new URL(e),
      n = t && Sn(t);
    n && (this.failedConnectionAttempts.set(n, 0), this.backOffPromises.set(n, Promise.resolve()))
  }
  resetAll() {
    this.backOffPromises.clear(), this.failedConnectionAttempts.clear()
  }
}
Gt._instance = null;
const Pn = "default";
class Se {
  constructor() {
    this._previousDevices = []
  }
  static getInstance() {
    return this.instance === void 0 && (this.instance = new Se), this.instance
  }
  get previousDevices() {
    return this._previousDevices
  }
  getDevices(e) {
    return b(this, arguments, void 0, function(t) {
      var n = this;
      let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
      return function*() {
        var r;
        if (((r = Se.userMediaPromiseMap) === null || r === void 0 ? void 0 : r.size) > 0) {
          X.debug("awaiting getUserMedia promise");
          try {
            t ? yield Se.userMediaPromiseMap.get(t): yield Promise.all(Se.userMediaPromiseMap.values())
          } catch {
            X.warn("error waiting for media permissons")
          }
        }
        let a = yield navigator.mediaDevices.enumerateDevices();
        if (s && !(Dt() && n.hasDeviceInUse(t)) && (a.filter(c => c.kind === t).length === 0 || a.some(c => {
            const d = c.label === "",
              l = t ? c.kind === t : !0;
            return d && l
          }))) {
          const c = {
              video: t !== "audioinput" && t !== "audiooutput",
              audio: t !== "videoinput" && {
                deviceId: {
                  ideal: "default"
                }
              }
            },
            d = yield navigator.mediaDevices.getUserMedia(c);
          a = yield navigator.mediaDevices.enumerateDevices(), d.getTracks().forEach(l => {
            l.stop()
          })
        }
        return n._previousDevices = a, t && (a = a.filter(o => o.kind === t)), a
      }()
    })
  }
  normalizeDeviceId(e, t, n) {
    return b(this, void 0, void 0, function*() {
      if (t !== Pn) return t;
      const s = yield this.getDevices(e), r = s.find(o => o.deviceId === Pn);
      if (!r) {
        X.warn("could not reliably determine default device");
        return
      }
      const a = s.find(o => o.deviceId !== Pn && o.groupId === (n ?? r.groupId));
      if (!a) {
        X.warn("could not reliably determine default device");
        return
      }
      return a == null ? void 0 : a.deviceId
    })
  }
  hasDeviceInUse(e) {
    return e ? Se.userMediaPromiseMap.has(e) : Se.userMediaPromiseMap.size > 0
  }
}
Se.mediaDeviceKinds = ["audioinput", "audiooutput", "videoinput"];
Se.userMediaPromiseMap = new Map;
var ui;
(function(i) {
  i[i.WAITING = 0] = "WAITING", i[i.RUNNING = 1] = "RUNNING", i[i.COMPLETED = 2] = "COMPLETED"
})(ui || (ui = {}));
class Am {
  constructor() {
    this.pendingTasks = new Map, this.taskMutex = new _e, this.nextTaskIndex = 0
  }
  run(e) {
    return b(this, void 0, void 0, function*() {
      const t = {
        id: this.nextTaskIndex++,
        enqueuedAt: Date.now(),
        status: ui.WAITING
      };
      this.pendingTasks.set(t.id, t);
      const n = yield this.taskMutex.lock();
      try {
        return t.executedAt = Date.now(), t.status = ui.RUNNING, yield e()
      } finally {
        t.status = ui.COMPLETED, this.pendingTasks.delete(t.id), n()
      }
    })
  }
  flush() {
    return b(this, void 0, void 0, function*() {
      return this.run(() => b(this, void 0, void 0, function*() {}))
    })
  }
  snapshot() {
    return Array.from(this.pendingTasks.values())
  }
}
class Nm {
  get readyState() {
    return this.ws.readyState
  }
  constructor(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var n, s;
    if (!((n = t.signal) === null || n === void 0) && n.aborted) throw new DOMException("This operation was aborted", "AbortError");
    this.url = e;
    const r = new WebSocket(e, (s = t.protocols) !== null && s !== void 0 ? s : []);
    r.binaryType = "arraybuffer", this.ws = r;
    const a = function() {
      let {
        closeCode: o,
        reason: c
      } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      return r.close(o, c)
    };
    this.opened = new Ee((o, c) => {
      const d = () => {
        c($.websocket("Encountered websocket error during connection establishment"))
      };
      r.onopen = () => {
        o({
          readable: new ReadableStream({
            start(l) {
              r.onmessage = u => {
                let {
                  data: h
                } = u;
                return l.enqueue(h)
              }, r.onerror = u => l.error(u)
            },
            cancel: a
          }),
          writable: new WritableStream({
            write(l) {
              r.send(l)
            },
            abort() {
              r.close()
            },
            close: a
          }),
          protocol: r.protocol,
          extensions: r.extensions
        }), r.removeEventListener("error", d)
      }, r.addEventListener("error", d)
    }), this.closed = new Ee((o, c) => {
      const d = () => b(this, void 0, void 0, function*() {
        const l = new Ee(h => {
            r.readyState !== WebSocket.CLOSED && r.addEventListener("close", m => {
              h(m)
            }, {
              once: !0
            })
          }),
          u = yield Ee.race([Ce(250), l]);
        u ? o(u) : c($.websocket("Encountered unspecified websocket error without a timely close event"))
      });
      r.onclose = l => {
        let {
          code: u,
          reason: h
        } = l;
        o({
          closeCode: u,
          reason: h
        }), r.removeEventListener("error", d)
      }, r.addEventListener("error", d)
    }), t.signal && (t.signal.onabort = () => r.close()), this.close = a
  }
}
const Lm = ["syncState", "trickle", "offer", "answer", "simulate", "leave"];

function Um(i) {
  const e = Lm.indexOf(i.case) >= 0;
  return X.trace("request allowed to bypass queue:", {
    canPass: e,
    req: i
  }), e
}
var ae;
(function(i) {
  i[i.CONNECTING = 0] = "CONNECTING", i[i.CONNECTED = 1] = "CONNECTED", i[i.RECONNECTING = 2] = "RECONNECTING", i[i.DISCONNECTING = 3] = "DISCONNECTING", i[i.DISCONNECTED = 4] = "DISCONNECTED"
})(ae || (ae = {}));
const jm = 250;
class Hs {
  get currentState() {
    return this.state
  }
  get isDisconnected() {
    return this.state === ae.DISCONNECTING || this.state === ae.DISCONNECTED
  }
  get isEstablishingConnection() {
    return this.state === ae.CONNECTING || this.state === ae.RECONNECTING
  }
  getNextRequestId() {
    return this._requestId += 1, this._requestId
  }
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !1,
      t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var n;
    this.rtt = 0, this.state = ae.DISCONNECTED, this.log = X, this._requestId = 0, this.useV0SignalPath = !1, this.resetCallbacks = () => {
      this.onAnswer = void 0, this.onLeave = void 0, this.onLocalTrackPublished = void 0, this.onLocalTrackUnpublished = void 0, this.onNegotiateRequested = void 0, this.onOffer = void 0, this.onRemoteMuteChanged = void 0, this.onSubscribedQualityUpdate = void 0, this.onTokenRefresh = void 0, this.onTrickle = void 0, this.onClose = void 0, this.onMediaSectionsRequirement = void 0
    }, this.log = Ye((n = t.loggerName) !== null && n !== void 0 ? n : Ue.Signal), this.loggerContextCb = t.loggerContextCb, this.useJSON = e, this.requestQueue = new Am, this.queuedRequests = [], this.closingLock = new _e, this.connectionLock = new _e, this.state = ae.DISCONNECTED
  }
  get logContext() {
    var e, t;
    return (t = (e = this.loggerContextCb) === null || e === void 0 ? void 0 : e.call(this)) !== null && t !== void 0 ? t : {}
  }
  join(e, t, n, s) {
    return b(this, arguments, void 0, function(r, a, o, c) {
      var d = this;
      let l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !1;
      return function*() {
        return d.state = ae.CONNECTING, d.options = o, yield d.connect(r, a, o, c, l)
      }()
    })
  }
  reconnect(e, t, n, s) {
    return b(this, void 0, void 0, function*() {
      if (!this.options) {
        this.log.warn("attempted to reconnect without signal options being set, ignoring", this.logContext);
        return
      }
      return this.state = ae.RECONNECTING, this.clearPingInterval(), yield this.connect(e, t, Object.assign(Object.assign({}, this.options), {
        reconnect: !0,
        sid: n,
        reconnectReason: s
      }), void 0, this.useV0SignalPath)
    })
  }
  connect(e, t, n, s) {
    return b(this, arguments, void 0, function(r, a, o, c) {
      var d = this;
      let l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !1;
      return function*() {
        const u = yield d.connectionLock.lock();
        d.connectOptions = o, d.useV0SignalPath = l;
        const h = hm(),
          m = l ? Fm(a, h, o) : Bm(a, h, o),
          f = Sm(r, m, l).toString(),
          p = Cm(f).toString();
        return new Promise((_, w) => b(d, void 0, void 0, function*() {
          var k, P;
          try {
            let y = !1;
            const S = M => b(this, void 0, void 0, function*() {
              if (y) return;
              y = !0;
              const g = M instanceof Event ? M.currentTarget : M,
                T = wm(g, "Abort handler called");
              this.streamWriter && !this.isDisconnected ? this.sendLeave().then(() => this.close(T)).catch(A => {
                this.log.error(A), this.close()
              }) : this.close(), E(), w($.cancelled(T))
            });
            c == null || c.addEventListener("abort", S);
            const E = () => {
                clearTimeout(x), c == null || c.removeEventListener("abort", S)
              },
              x = setTimeout(() => {
                S($.timeout("room connection has timed out (signal)"))
              }, o.websocketTimeout),
              D = (M, g) => {
                this.handleSignalConnected(M, x, g)
              },
              C = new URL(f);
            C.searchParams.has("access_token") && C.searchParams.set("access_token", "<redacted>"), this.log.debug("connecting to ".concat(C), Object.assign({
              reconnect: o.reconnect,
              reconnectReason: o.reconnectReason
            }, this.logContext)), this.ws && (yield this.close(!1)), this.ws = new Nm(f);
            try {
              this.ws.closed.then(N => {
                var Q;
                this.isEstablishingConnection && w($.internal("Websocket got closed during a (re)connection attempt: ".concat(N.reason))), N.closeCode !== 1e3 && (this.log.warn("websocket closed", Object.assign(Object.assign({}, this.logContext), {
                  reason: N.reason,
                  code: N.closeCode,
                  wasClean: N.closeCode === 1e3,
                  state: this.state
                })), this.state === ae.CONNECTED && this.handleOnClose((Q = N.reason) !== null && Q !== void 0 ? Q : "Unexpected WS error"))
              }).catch(N => {
                this.isEstablishingConnection && w($.internal("Websocket error during a (re)connection attempt: ".concat(N)))
              });
              const M = yield this.ws.opened.catch(N => b(this, void 0, void 0, function*() {
                if (this.state !== ae.CONNECTED) {
                  this.state = ae.DISCONNECTED, clearTimeout(x);
                  const Q = yield this.handleConnectionError(N, p);
                  w(Q);
                  return
                }
                this.handleWSError(N), w(N)
              }));
              if (clearTimeout(x), !M) return;
              const g = M.readable.getReader();
              this.streamWriter = M.writable.getWriter();
              const T = yield g.read();
              if (g.releaseLock(), !T.value) throw $.internal("no message received as first message");
              const A = io(T.value),
                F = this.validateFirstMessage(A, (k = o.reconnect) !== null && k !== void 0 ? k : !1);
              if (!F.isValid) {
                w(F.error);
                return
              }((P = A.message) === null || P === void 0 ? void 0 : P.case) === "join" && (this.pingTimeoutDuration = A.message.value.pingTimeout, this.pingIntervalDuration = A.message.value.pingInterval, this.pingTimeoutDuration && this.pingTimeoutDuration > 0 && this.log.debug("ping config", Object.assign(Object.assign({}, this.logContext), {
                timeout: this.pingTimeoutDuration,
                interval: this.pingIntervalDuration
              })));
              const H = F.shouldProcessFirstMessage ? A : void 0;
              D(M, H), _(F.response)
            } catch (M) {
              w(M)
            } finally {
              E()
            }
          } finally {
            u()
          }
        }))
      }()
    })
  }
  startReadingLoop(e, t) {
    return b(this, void 0, void 0, function*() {
      for (t && this.handleSignalResponse(t);;) {
        this.signalLatency && (yield Ce(this.signalLatency));
        const {
          done: n,
          value: s
        } = yield e.read();
        if (n) break;
        const r = io(s);
        this.handleSignalResponse(r)
      }
    })
  }
  close() {
    return b(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0,
        n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Close method called on signal client";
      return function*() {
        if ([ae.DISCONNECTING || ae.DISCONNECTED].includes(e.state)) {
          e.log.debug("ignoring signal close as it's already in disconnecting state");
          return
        }
        const s = yield e.closingLock.lock();
        try {
          if (e.clearPingInterval(), t && (e.state = ae.DISCONNECTING), e.ws) {
            e.ws.close({
              closeCode: 1e3,
              reason: n
            });
            const r = e.ws.closed;
            e.ws = void 0, e.streamWriter = void 0, yield Promise.race([r, Ce(jm)])
          }
        } catch (r) {
          e.log.debug("websocket error while closing", Object.assign(Object.assign({}, e.logContext), {
            error: r
          }))
        } finally {
          t && (e.state = ae.DISCONNECTED), s()
        }
      }()
    })
  }
  sendOffer(e, t) {
    this.log.debug("sending offer", Object.assign(Object.assign({}, this.logContext), {
      offerSdp: e.sdp
    })), this.sendRequest({
      case: "offer",
      value: Bt(e, t)
    })
  }
  sendAnswer(e, t) {
    return this.log.debug("sending answer", Object.assign(Object.assign({}, this.logContext), {
      answerSdp: e.sdp
    })), this.sendRequest({
      case: "answer",
      value: Bt(e, t)
    })
  }
  sendIceCandidate(e, t) {
    return this.log.debug("sending ice candidate", Object.assign(Object.assign({}, this.logContext), {
      candidate: e
    })), this.sendRequest({
      case: "trickle",
      value: new rn({
        candidateInit: JSON.stringify(e),
        target: t
      })
    })
  }
  sendMuteTrack(e, t) {
    return this.sendRequest({
      case: "mute",
      value: new on({
        sid: e,
        muted: t
      })
    })
  }
  sendAddTrack(e) {
    return this.sendRequest({
      case: "addTrack",
      value: e
    })
  }
  sendUpdateLocalMetadata(e, t) {
    return b(this, arguments, void 0, function(n, s) {
      var r = this;
      let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return function*() {
        const o = r.getNextRequestId();
        return yield r.sendRequest({
          case: "updateMetadata",
          value: new Ns({
            requestId: o,
            metadata: n,
            name: s,
            attributes: a
          })
        }), o
      }()
    })
  }
  sendUpdateTrackSettings(e) {
    this.sendRequest({
      case: "trackSetting",
      value: e
    })
  }
  sendUpdateSubscription(e) {
    return this.sendRequest({
      case: "subscription",
      value: e
    })
  }
  sendSyncState(e) {
    return this.sendRequest({
      case: "syncState",
      value: e
    })
  }
  sendUpdateVideoLayers(e, t) {
    return this.sendRequest({
      case: "updateLayers",
      value: new Aa({
        trackSid: e,
        layers: t
      })
    })
  }
  sendUpdateSubscriptionPermissions(e, t) {
    return this.sendRequest({
      case: "subscriptionPermission",
      value: new Ua({
        allParticipants: e,
        trackPermissions: t
      })
    })
  }
  sendSimulateScenario(e) {
    return this.sendRequest({
      case: "simulate",
      value: e
    })
  }
  sendPing() {
    return Promise.all([this.sendRequest({
      case: "ping",
      value: de.parse(Date.now())
    }), this.sendRequest({
      case: "pingReq",
      value: new Ba({
        timestamp: de.parse(Date.now()),
        rtt: de.parse(this.rtt)
      })
    })])
  }
  sendUpdateLocalAudioTrack(e, t) {
    return this.sendRequest({
      case: "updateAudioTrack",
      value: new As({
        trackSid: e,
        features: t
      })
    })
  }
  sendLeave() {
    return this.sendRequest({
      case: "leave",
      value: new cn({
        reason: He.CLIENT_INITIATED,
        action: qt.DISCONNECT
      })
    })
  }
  sendRequest(e) {
    return b(this, arguments, void 0, function(t) {
      var n = this;
      let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      return function*() {
        if (!s && !Um(t) && n.state === ae.RECONNECTING) {
          n.queuedRequests.push(() => b(n, void 0, void 0, function*() {
            yield this.sendRequest(t, !0)
          }));
          return
        }
        if (s || (yield n.requestQueue.flush()), n.signalLatency && (yield Ce(n.signalLatency)), n.isDisconnected) {
          n.log.debug("skipping signal request (type: ".concat(t.case, ") - SignalClient disconnected"));
          return
        }
        if (!n.streamWriter) {
          n.log.error("cannot send signal request before connected, type: ".concat(t == null ? void 0 : t.case), n.logContext);
          return
        }
        const a = new Hu({
          message: t
        });
        try {
          n.useJSON ? yield n.streamWriter.write(a.toJsonString()): yield n.streamWriter.write(a.toBinary())
        } catch (o) {
          n.log.error("error sending signal message", Object.assign(Object.assign({}, n.logContext), {
            error: o
          }))
        }
      }()
    })
  }
  handleSignalResponse(e) {
    var t, n;
    const s = e.message;
    if (s == null) {
      this.log.debug("received unsupported message", this.logContext);
      return
    }
    let r = !1;
    if (s.case === "answer") {
      const a = oo(s.value);
      this.onAnswer && this.onAnswer(a, s.value.id, s.value.midToTrackId)
    } else if (s.case === "offer") {
      const a = oo(s.value);
      this.onOffer && this.onOffer(a, s.value.id, s.value.midToTrackId)
    } else if (s.case === "trickle") {
      const a = JSON.parse(s.value.candidateInit);
      this.onTrickle && this.onTrickle(a, s.value.target)
    } else s.case === "update" ? this.onParticipantUpdate && this.onParticipantUpdate((t = s.value.participants) !== null && t !== void 0 ? t : []) : s.case === "trackPublished" ? this.onLocalTrackPublished && this.onLocalTrackPublished(s.value) : s.case === "speakersChanged" ? this.onSpeakersChanged && this.onSpeakersChanged((n = s.value.speakers) !== null && n !== void 0 ? n : []) : s.case === "leave" ? this.onLeave && this.onLeave(s.value) : s.case === "mute" ? this.onRemoteMuteChanged && this.onRemoteMuteChanged(s.value.sid, s.value.muted) : s.case === "roomUpdate" ? this.onRoomUpdate && s.value.room && this.onRoomUpdate(s.value.room) : s.case === "connectionQuality" ? this.onConnectionQuality && this.onConnectionQuality(s.value) : s.case === "streamStateUpdate" ? this.onStreamStateUpdate && this.onStreamStateUpdate(s.value) : s.case === "subscribedQualityUpdate" ? this.onSubscribedQualityUpdate && this.onSubscribedQualityUpdate(s.value) : s.case === "subscriptionPermissionUpdate" ? this.onSubscriptionPermissionUpdate && this.onSubscriptionPermissionUpdate(s.value) : s.case === "refreshToken" ? this.onTokenRefresh && this.onTokenRefresh(s.value) : s.case === "trackUnpublished" ? this.onLocalTrackUnpublished && this.onLocalTrackUnpublished(s.value) : s.case === "subscriptionResponse" ? this.onSubscriptionError && this.onSubscriptionError(s.value) : s.case === "pong" || (s.case === "pongResp" ? (this.rtt = Date.now() - Number.parseInt(s.value.lastPingTimestamp.toString()), this.resetPingTimeout(), r = !0) : s.case === "requestResponse" ? this.onRequestResponse && this.onRequestResponse(s.value) : s.case === "trackSubscribed" ? this.onLocalTrackSubscribed && this.onLocalTrackSubscribed(s.value.trackSid) : s.case === "roomMoved" ? (this.onTokenRefresh && this.onTokenRefresh(s.value.token), this.onRoomMoved && this.onRoomMoved(s.value)) : s.case === "mediaSectionsRequirement" ? this.onMediaSectionsRequirement && this.onMediaSectionsRequirement(s.value) : this.log.debug("unsupported message", Object.assign(Object.assign({}, this.logContext), {
      msgCase: s.case
    })));
    r || this.resetPingTimeout()
  }
  setReconnected() {
    for (; this.queuedRequests.length > 0;) {
      const e = this.queuedRequests.shift();
      e && this.requestQueue.run(e)
    }
  }
  handleOnClose(e) {
    return b(this, void 0, void 0, function*() {
      if (this.state === ae.DISCONNECTED) return;
      const t = this.onClose;
      yield this.close(void 0, e), this.log.debug("websocket connection closed: ".concat(e), Object.assign(Object.assign({}, this.logContext), {
        reason: e
      })), t && t(e)
    })
  }
  handleWSError(e) {
    this.log.error("websocket error", Object.assign(Object.assign({}, this.logContext), {
      error: e
    }))
  }
  resetPingTimeout() {
    if (this.clearPingTimeout(), !this.pingTimeoutDuration) {
      this.log.warn("ping timeout duration not set", this.logContext);
      return
    }
    this.pingTimeout = Te.setTimeout(() => {
      this.log.warn("ping timeout triggered. last pong received at: ".concat(new Date(Date.now() - this.pingTimeoutDuration * 1e3).toUTCString()), this.logContext), this.handleOnClose("ping timeout")
    }, this.pingTimeoutDuration * 1e3)
  }
  clearPingTimeout() {
    this.pingTimeout && Te.clearTimeout(this.pingTimeout)
  }
  startPingInterval() {
    if (this.clearPingInterval(), this.resetPingTimeout(), !this.pingIntervalDuration) {
      this.log.warn("ping interval duration not set", this.logContext);
      return
    }
    this.log.debug("start ping interval", this.logContext), this.pingInterval = Te.setInterval(() => {
      this.sendPing()
    }, this.pingIntervalDuration * 1e3)
  }
  clearPingInterval() {
    this.log.debug("clearing ping interval", this.logContext), this.clearPingTimeout(), this.pingInterval && Te.clearInterval(this.pingInterval)
  }
  handleSignalConnected(e, t, n) {
    this.state = ae.CONNECTED, clearTimeout(t), this.startPingInterval(), this.startReadingLoop(e.readable.getReader(), n)
  }
  validateFirstMessage(e, t) {
    var n, s, r, a, o;
    return ((n = e.message) === null || n === void 0 ? void 0 : n.case) === "join" ? {
      isValid: !0,
      response: e.message.value
    } : this.state === ae.RECONNECTING && ((s = e.message) === null || s === void 0 ? void 0 : s.case) !== "leave" ? ((r = e.message) === null || r === void 0 ? void 0 : r.case) === "reconnect" ? {
      isValid: !0,
      response: e.message.value
    } : (this.log.debug("declaring signal reconnected without reconnect response received", this.logContext), {
      isValid: !0,
      response: void 0,
      shouldProcessFirstMessage: !0
    }) : this.isEstablishingConnection && ((a = e.message) === null || a === void 0 ? void 0 : a.case) === "leave" ? {
      isValid: !1,
      error: $.leaveRequest("Received leave request while trying to (re)connect", e.message.value.reason)
    } : t ? {
      isValid: !1,
      error: $.internal("Unexpected first message")
    } : {
      isValid: !1,
      error: $.internal("did not receive join response, got ".concat((o = e.message) === null || o === void 0 ? void 0 : o.case, " instead"))
    }
  }
  handleConnectionError(e, t) {
    return b(this, void 0, void 0, function*() {
      try {
        const n = yield fetch(t);
        switch (n.status) {
          case 404:
            return $.serviceNotFound("v1 RTC path not found. Consider upgrading your LiveKit server version", "v0-rtc");
          case 401:
          case 403:
            const s = yield n.text();
            return $.notAllowed(s, n.status);
          default:
            break
        }
        return e instanceof $ ? e : $.internal("Encountered unknown websocket error during connection: ".concat(e), {
          status: n.status,
          statusText: n.statusText
        })
      } catch (n) {
        return n instanceof $ ? n : $.serverUnreachable(n instanceof Error ? n.message : "server was not reachable")
      }
    })
  }
}



function Bt(i, e) {
  return new St({
    sdp: i.sdp,
    type: i.type,
    id: e
  })
}

function Fm(i, e, t) {
  var n;
  const s = new URLSearchParams;
  return s.set("access_token", i), t.reconnect && (s.set("reconnect", "1"), t.sid && s.set("sid", t.sid)), s.set("auto_subscribe", t.autoSubscribe ? "1" : "0"), s.set("sdk", Xe() ? "reactnative" : "js"), s.set("version", e.version), s.set("protocol", e.protocol.toString()), e.deviceModel && s.set("device_model", e.deviceModel), e.os && s.set("os", e.os), e.osVersion && s.set("os_version", e.osVersion), e.browser && s.set("browser", e.browser), e.browserVersion && s.set("browser_version", e.browserVersion), t.adaptiveStream && s.set("adaptive_stream", "1"), t.reconnectReason && s.set("reconnect_reason", t.reconnectReason.toString()), !((n = navigator.connection) === null || n === void 0) && n.type && s.set("network", navigator.connection.type), s
}

function Bm(i, e, t) {
  const n = new URLSearchParams;
  n.set("access_token", i);
  const s = new vh({
    clientInfo: e,
    connectionSettings: new Va({
      autoSubscribe: !!t.autoSubscribe,
      adaptiveStream: !!t.adaptiveStream
    }),
    reconnect: !!t.reconnect,
    participantSid: t.sid ? t.sid : void 0
  });
  t.reconnectReason && (s.reconnectReason = t.reconnectReason);
  const r = new bh({
    joinRequest: s.toBinary()
  });
  return n.set("join_request", btoa(new TextDecoder("utf-8").decode(r.toBinary()))), n
}


var Fe = {},
  Rn = {},
  _n = {
    exports: {}
  },
  co;

function Ks() {
  if (co) return _n.exports;
  co = 1;
  var i = _n.exports = {
    v: [{
      name: "version",
      reg: /^(\d*)$/
    }],
    o: [{
      name: "origin",
      reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
      names: ["username", "sessionId", "sessionVersion", "netType", "ipVer", "address"],
      format: "%s %s %d %s IP%d %s"
    }],
    s: [{
      name: "name"
    }],
    i: [{
      name: "description"
    }],
    u: [{
      name: "uri"
    }],
    e: [{
      name: "email"
    }],
    p: [{
      name: "phone"
    }],
    z: [{
      name: "timezones"
    }],
    r: [{
      name: "repeats"
    }],
    t: [{
      name: "timing",
      reg: /^(\d*) (\d*)/,
      names: ["start", "stop"],
      format: "%d %d"
    }],
    c: [{
      name: "connection",
      reg: /^IN IP(\d) (\S*)/,
      names: ["version", "ip"],
      format: "IN IP%d %s"
    }],
    b: [{
      push: "bandwidth",
      reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
      names: ["type", "limit"],
      format: "%s:%s"
    }],
    m: [{
      reg: /^(\w*) (\d*) ([\w/]*)(?: (.*))?/,
      names: ["type", "port", "protocol", "payloads"],
      format: "%s %d %s %s"
    }],
    a: [{
      push: "rtp",
      reg: /^rtpmap:(\d*) ([\w\-.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
      names: ["payload", "codec", "rate", "encoding"],
      format: function(e) {
        return e.encoding ? "rtpmap:%d %s/%s/%s" : e.rate ? "rtpmap:%d %s/%s" : "rtpmap:%d %s"
      }
    }, {
      push: "fmtp",
      reg: /^fmtp:(\d*) ([\S| ]*)/,
      names: ["payload", "config"],
      format: "fmtp:%d %s"
    }, {
      name: "control",
      reg: /^control:(.*)/,
      format: "control:%s"
    }, {
      name: "rtcp",
      reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
      names: ["port", "netType", "ipVer", "address"],
      format: function(e) {
        return e.address != null ? "rtcp:%d %s IP%d %s" : "rtcp:%d"
      }
    }, {
      push: "rtcpFbTrrInt",
      reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
      names: ["payload", "value"],
      format: "rtcp-fb:%s trr-int %d"
    }, {
      push: "rtcpFb",
      reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
      names: ["payload", "type", "subtype"],
      format: function(e) {
        return e.subtype != null ? "rtcp-fb:%s %s %s" : "rtcp-fb:%s %s"
      }
    }, {
      push: "ext",
      reg: /^extmap:(\d+)(?:\/(\w+))?(?: (urn:ietf:params:rtp-hdrext:encrypt))? (\S*)(?: (\S*))?/,
      names: ["value", "direction", "encrypt-uri", "uri", "config"],
      format: function(e) {
        return "extmap:%d" + (e.direction ? "/%s" : "%v") + (e["encrypt-uri"] ? " %s" : "%v") + " %s" + (e.config ? " %s" : "")
      }
    }, {
      name: "extmapAllowMixed",
      reg: /^(extmap-allow-mixed)/
    }, {
      push: "crypto",
      reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
      names: ["id", "suite", "config", "sessionConfig"],
      format: function(e) {
        return e.sessionConfig != null ? "crypto:%d %s %s %s" : "crypto:%d %s %s"
      }
    }, {
      name: "setup",
      reg: /^setup:(\w*)/,
      format: "setup:%s"
    }, {
      name: "connectionType",
      reg: /^connection:(new|existing)/,
      format: "connection:%s"
    }, {
      name: "mid",
      reg: /^mid:([^\s]*)/,
      format: "mid:%s"
    }, {
      name: "msid",
      reg: /^msid:(.*)/,
      format: "msid:%s"
    }, {
      name: "ptime",
      reg: /^ptime:(\d*(?:\.\d*)*)/,
      format: "ptime:%d"
    }, {
      name: "maxptime",
      reg: /^maxptime:(\d*(?:\.\d*)*)/,
      format: "maxptime:%d"
    }, {
      name: "direction",
      reg: /^(sendrecv|recvonly|sendonly|inactive)/
    }, {
      name: "icelite",
      reg: /^(ice-lite)/
    }, {
      name: "iceUfrag",
      reg: /^ice-ufrag:(\S*)/,
      format: "ice-ufrag:%s"
    }, {
      name: "icePwd",
      reg: /^ice-pwd:(\S*)/,
      format: "ice-pwd:%s"
    }, {
      name: "fingerprint",
      reg: /^fingerprint:(\S*) (\S*)/,
      names: ["type", "hash"],
      format: "fingerprint:%s %s"
    }, {
      push: "candidates",
      reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
      names: ["foundation", "component", "transport", "priority", "ip", "port", "type", "raddr", "rport", "tcptype", "generation", "network-id", "network-cost"],
      format: function(e) {
        var t = "candidate:%s %d %s %d %s %d typ %s";
        return t += e.raddr != null ? " raddr %s rport %d" : "%v%v", t += e.tcptype != null ? " tcptype %s" : "%v", e.generation != null && (t += " generation %d"), t += e["network-id"] != null ? " network-id %d" : "%v", t += e["network-cost"] != null ? " network-cost %d" : "%v", t
      }
    }, {
      name: "endOfCandidates",
      reg: /^(end-of-candidates)/
    }, {
      name: "remoteCandidates",
      reg: /^remote-candidates:(.*)/,
      format: "remote-candidates:%s"
    }, {
      name: "iceOptions",
      reg: /^ice-options:(\S*)/,
      format: "ice-options:%s"
    }, {
      push: "ssrcs",
      reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
      names: ["id", "attribute", "value"],
      format: function(e) {
        var t = "ssrc:%d";
        return e.attribute != null && (t += " %s", e.value != null && (t += ":%s")), t
      }
    }, {
      push: "ssrcGroups",
      reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
      names: ["semantics", "ssrcs"],
      format: "ssrc-group:%s %s"
    }, {
      name: "msidSemantic",
      reg: /^msid-semantic:\s?(\w*) (\S*)/,
      names: ["semantic", "token"],
      format: "msid-semantic: %s %s"
    }, {
      push: "groups",
      reg: /^group:(\w*) (.*)/,
      names: ["type", "mids"],
      format: "group:%s %s"
    }, {
      name: "rtcpMux",
      reg: /^(rtcp-mux)/
    }, {
      name: "rtcpRsize",
      reg: /^(rtcp-rsize)/
    }, {
      name: "sctpmap",
      reg: /^sctpmap:([\w_/]*) (\S*)(?: (\S*))?/,
      names: ["sctpmapNumber", "app", "maxMessageSize"],
      format: function(e) {
        return e.maxMessageSize != null ? "sctpmap:%s %s %s" : "sctpmap:%s %s"
      }
    }, {
      name: "xGoogleFlag",
      reg: /^x-google-flag:([^\s]*)/,
      format: "x-google-flag:%s"
    }, {
      push: "rids",
      reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
      names: ["id", "direction", "params"],
      format: function(e) {
        return e.params ? "rid:%s %s %s" : "rid:%s %s"
      }
    }, {
      push: "imageattrs",
      reg: new RegExp("^imageattr:(\\d+|\\*)[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?"),
      names: ["pt", "dir1", "attrs1", "dir2", "attrs2"],
      format: function(e) {
        return "imageattr:%s %s %s" + (e.dir2 ? " %s %s" : "")
      }
    }, {
      name: "simulcast",
      reg: new RegExp("^simulcast:(send|recv) ([a-zA-Z0-9\\-_~;,]+)(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?$"),
      names: ["dir1", "list1", "dir2", "list2"],
      format: function(e) {
        return "simulcast:%s %s" + (e.dir2 ? " %s %s" : "")
      }
    }, {
      name: "simulcast_03",
      reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
      names: ["value"],
      format: "simulcast: %s"
    }, {
      name: "framerate",
      reg: /^framerate:(\d+(?:$|\.\d+))/,
      format: "framerate:%s"
    }, {
      name: "sourceFilter",
      reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
      names: ["filterMode", "netType", "addressTypes", "destAddress", "srcList"],
      format: "source-filter: %s %s %s %s %s"
    }, {
      name: "bundleOnly",
      reg: /^(bundle-only)/
    }, {
      name: "label",
      reg: /^label:(.+)/,
      format: "label:%s"
    }, {
      name: "sctpPort",
      reg: /^sctp-port:(\d+)$/,
      format: "sctp-port:%s"
    }, {
      name: "maxMessageSize",
      reg: /^max-message-size:(\d+)$/,
      format: "max-message-size:%s"
    }, {
      push: "tsRefClocks",
      reg: /^ts-refclk:([^\s=]*)(?:=(\S*))?/,
      names: ["clksrc", "clksrcExt"],
      format: function(e) {
        return "ts-refclk:%s" + (e.clksrcExt != null ? "=%s" : "")
      }
    }, {
      name: "mediaClk",
      reg: /^mediaclk:(?:id=(\S*))? *([^\s=]*)(?:=(\S*))?(?: *rate=(\d+)\/(\d+))?/,
      names: ["id", "mediaClockName", "mediaClockValue", "rateNumerator", "rateDenominator"],
      format: function(e) {
        var t = "mediaclk:";
        return t += e.id != null ? "id=%s %s" : "%v%s", t += e.mediaClockValue != null ? "=%s" : "", t += e.rateNumerator != null ? " rate=%s" : "", t += e.rateDenominator != null ? "/%s" : "", t
      }
    }, {
      name: "keywords",
      reg: /^keywds:(.+)$/,
      format: "keywds:%s"
    }, {
      name: "content",
      reg: /^content:(.+)/,
      format: "content:%s"
    }, {
      name: "bfcpFloorCtrl",
      reg: /^floorctrl:(c-only|s-only|c-s)/,
      format: "floorctrl:%s"
    }, {
      name: "bfcpConfId",
      reg: /^confid:(\d+)/,
      format: "confid:%s"
    }, {
      name: "bfcpUserId",
      reg: /^userid:(\d+)/,
      format: "userid:%s"
    }, {
      name: "bfcpFloorId",
      reg: /^floorid:(.+) (?:m-stream|mstrm):(.+)/,
      names: ["id", "mStream"],
      format: "floorid:%s mstrm:%s"
    }, {
      push: "invalid",
      names: ["value"]
    }]
  };
  return Object.keys(i).forEach(function(e) {
    var t = i[e];
    t.forEach(function(n) {
      n.reg || (n.reg = /(.*)/), n.format || (n.format = "%s")
    })
  }), _n.exports
}
var lo;

function qm() {
  return lo || (lo = 1, function(i) {
    var e = function(o) {
        return String(Number(o)) === o ? Number(o) : o
      },
      t = function(o, c, d, l) {
        if (l && !d) c[l] = e(o[1]);
        else
          for (var u = 0; u < d.length; u += 1) o[u + 1] != null && (c[d[u]] = e(o[u + 1]))
      },
      n = function(o, c, d) {
        var l = o.name && o.names;
        o.push && !c[o.push] ? c[o.push] = [] : l && !c[o.name] && (c[o.name] = {});
        var u = o.push ? {} : l ? c[o.name] : c;
        t(d.match(o.reg), u, o.names, o.name), o.push && c[o.push].push(u)
      },
      s = Ks(),
      r = RegExp.prototype.test.bind(/^([a-z])=(.*)/);
    i.parse = function(o) {
      var c = {},
        d = [],
        l = c;
      return o.split(/(\r\n|\r|\n)/).filter(r).forEach(function(u) {
        var h = u[0],
          m = u.slice(2);
        h === "m" && (d.push({
          rtp: [],
          fmtp: []
        }), l = d[d.length - 1]);
        for (var f = 0; f < (s[h] || []).length; f += 1) {
          var p = s[h][f];
          if (p.reg.test(m)) return n(p, l, m)
        }
      }), c.media = d, c
    };
    var a = function(o, c) {
      var d = c.split(/=(.+)/, 2);
      return d.length === 2 ? o[d[0]] = e(d[1]) : d.length === 1 && c.length > 1 && (o[d[0]] = void 0), o
    };
    i.parseParams = function(o) {
      return o.split(/;\s?/).reduce(a, {})
    }, i.parseFmtpConfig = i.parseParams, i.parsePayloads = function(o) {
      return o.toString().split(" ").map(Number)
    }, i.parseRemoteCandidates = function(o) {
      for (var c = [], d = o.split(" ").map(e), l = 0; l < d.length; l += 3) c.push({
        component: d[l],
        ip: d[l + 1],
        port: d[l + 2]
      });
      return c
    }, i.parseImageAttributes = function(o) {
      return o.split(" ").map(function(c) {
        return c.substring(1, c.length - 1).split(",").reduce(a, {})
      })
    }, i.parseSimulcastStreamList = function(o) {
      return o.split(";").map(function(c) {
        return c.split(",").map(function(d) {
          var l, u = !1;
          return d[0] !== "~" ? l = e(d) : (l = e(d.substring(1, d.length)), u = !0), {
            scid: l,
            paused: u
          }
        })
      })
    }
  }(Rn)), Rn
}
var In, uo;

function Wm() {
  if (uo) return In;
  uo = 1;
  var i = Ks(),
    e = /%[sdv%]/g,
    t = function(a) {
      var o = 1,
        c = arguments,
        d = c.length;
      return a.replace(e, function(l) {
        if (o >= d) return l;
        var u = c[o];
        switch (o += 1, l) {
          case "%%":
            return "%";
          case "%s":
            return String(u);
          case "%d":
            return Number(u);
          case "%v":
            return ""
        }
      })
    },
    n = function(a, o, c) {
      var d = o.format instanceof Function ? o.format(o.push ? c : c[o.name]) : o.format,
        l = [a + "=" + d];
      if (o.names)
        for (var u = 0; u < o.names.length; u += 1) {
          var h = o.names[u];
          o.name ? l.push(c[o.name][h]) : l.push(c[o.names[u]])
        } else l.push(c[o.name]);
      return t.apply(null, l)
    },
    s = ["v", "o", "s", "i", "u", "e", "p", "c", "b", "t", "r", "z", "a"],
    r = ["i", "c", "b", "a"];
  return In = function(a, o) {
    o = o || {}, a.version == null && (a.version = 0), a.name == null && (a.name = " "), a.media.forEach(function(u) {
      u.payloads == null && (u.payloads = "")
    });
    var c = o.outerOrder || s,
      d = o.innerOrder || r,
      l = [];
    return c.forEach(function(u) {
      i[u].forEach(function(h) {
        h.name in a && a[h.name] != null ? l.push(n(u, h, a)) : h.push in a && a[h.push] != null && a[h.push].forEach(function(m) {
          l.push(n(u, h, m))
        })
      })
    }), a.media.forEach(function(u) {
      l.push(n("m", i.m[0], u)), d.forEach(function(h) {
        i[h].forEach(function(m) {
          m.name in u && u[m.name] != null ? l.push(n(h, m, u)) : m.push in u && u[m.push] != null && u[m.push].forEach(function(f) {
            l.push(n(h, m, f))
          })
        })
      })
    }), l.join(`\r
`) + `\r
`
  }, In
}
var ho;

function Hm() {
  if (ho) return Fe;
  ho = 1;
  var i = qm(),
    e = Wm(),
    t = Ks();
  return Fe.grammar = t, Fe.write = e, Fe.parse = i.parse, Fe.parseParams = i.parseParams, Fe.parseFmtpConfig = i.parseFmtpConfig, Fe.parsePayloads = i.parsePayloads, Fe.parseRemoteCandidates = i.parseRemoteCandidates, Fe.parseImageAttributes = i.parseImageAttributes, Fe.parseSimulcastStreamList = i.parseSimulcastStreamList, Fe
}
var ft = Hm();


const Km = .7,
  Gm = 20,
  xt = {
    NegotiationStarted: "negotiationStarted",
    NegotiationComplete: "negotiationComplete",
    RTPVideoPayloadTypes: "rtpVideoPayloadTypes"
  };
class mo extends et.EventEmitter {
  get pc() {
    return this._pc || (this._pc = this.createPC()), this._pc
  }
  constructor(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var n;
    super(), this.log = X, this.ddExtID = 0, this.latestOfferId = 0, this.pendingCandidates = [], this.restartingIce = !1, this.renegotiate = !1, this.trackBitrates = [], this.remoteStereoMids = [], this.remoteNackMids = [], this.negotiate = Gs(s => b(this, void 0, void 0, function*() {
      this.emit(xt.NegotiationStarted);
      try {
        yield this.createAndSendOffer()
      } catch (r) {
        if (s) s(r);
        else throw r
      }
    }), Gm), this.close = () => {
      this._pc && (this._pc.close(), this._pc.onconnectionstatechange = null, this._pc.oniceconnectionstatechange = null, this._pc.onicegatheringstatechange = null, this._pc.ondatachannel = null, this._pc.onnegotiationneeded = null, this._pc.onsignalingstatechange = null, this._pc.onicecandidate = null, this._pc.ondatachannel = null, this._pc.ontrack = null, this._pc.onconnectionstatechange = null, this._pc.oniceconnectionstatechange = null, this._pc = null)
    }, this.log = Ye((n = t.loggerName) !== null && n !== void 0 ? n : Ue.PCTransport), this.loggerOptions = t, this.config = e, this._pc = this.createPC(), this.offerLock = new _e
  }
  createPC() {
    const e = new RTCPeerConnection(this.config);
    return e.onicecandidate = t => {
      var n;
      t.candidate && ((n = this.onIceCandidate) === null || n === void 0 || n.call(this, t.candidate))
    }, e.onicecandidateerror = t => {
      var n;
      (n = this.onIceCandidateError) === null || n === void 0 || n.call(this, t)
    }, e.oniceconnectionstatechange = () => {
      var t;
      (t = this.onIceConnectionStateChange) === null || t === void 0 || t.call(this, e.iceConnectionState)
    }, e.onsignalingstatechange = () => {
      var t;
      (t = this.onSignalingStatechange) === null || t === void 0 || t.call(this, e.signalingState)
    }, e.onconnectionstatechange = () => {
      var t;
      (t = this.onConnectionStateChange) === null || t === void 0 || t.call(this, e.connectionState)
    }, e.ondatachannel = t => {
      var n;
      (n = this.onDataChannel) === null || n === void 0 || n.call(this, t)
    }, e.ontrack = t => {
      var n;
      (n = this.onTrack) === null || n === void 0 || n.call(this, t)
    }, e
  }
  get logContext() {
    var e, t;
    return Object.assign({}, (t = (e = this.loggerOptions).loggerContextCb) === null || t === void 0 ? void 0 : t.call(e))
  }
  get isICEConnected() {
    return this._pc !== null && (this.pc.iceConnectionState === "connected" || this.pc.iceConnectionState === "completed")
  }
  addIceCandidate(e) {
    return b(this, void 0, void 0, function*() {
      if (this.pc.remoteDescription && !this.restartingIce) return this.pc.addIceCandidate(e);
      this.pendingCandidates.push(e)
    })
  }
  setRemoteDescription(e, t) {
    return b(this, void 0, void 0, function*() {
      var n;
      if (e.type === "answer" && this.latestOfferId > 0 && t > 0 && t !== this.latestOfferId) return this.log.warn("ignoring answer for old offer", Object.assign(Object.assign({}, this.logContext), {
        offerId: t,
        latestOfferId: this.latestOfferId
      })), !1;
      let s;
      if (e.type === "offer") {
        let {
          stereoMids: r,
          nackMids: a
        } = Jm(e);
        this.remoteStereoMids = r, this.remoteNackMids = a
      } else if (e.type === "answer") {
        const r = ft.parse((n = e.sdp) !== null && n !== void 0 ? n : "");
        r.media.forEach(a => {
          const o = Js(a.mid);
          a.type === "audio" && this.trackBitrates.some(c => {
            if (!c.transceiver || o != c.transceiver.mid) return !1;
            let d = 0;
            if (a.rtp.some(u => u.codec.toUpperCase() === c.codec.toUpperCase() ? (d = u.payload, !0) : !1), d === 0) return !0;
            let l = !1;
            for (const u of a.fmtp)
              if (u.payload === d) {
                u.config = u.config.split(";").filter(h => !h.includes("maxaveragebitrate")).join(";"), c.maxbr > 0 && (u.config += ";maxaveragebitrate=".concat(c.maxbr * 1e3)), l = !0;
                break
              } return l || c.maxbr > 0 && a.fmtp.push({
              payload: d,
              config: "maxaveragebitrate=".concat(c.maxbr * 1e3)
            }), !0
          })
        }), s = ft.write(r)
      }
      return yield this.setMungedSDP(e, s, !0), this.pendingCandidates.forEach(r => {
        this.pc.addIceCandidate(r)
      }), this.pendingCandidates = [], this.restartingIce = !1, this.renegotiate ? (this.renegotiate = !1, yield this.createAndSendOffer()) : e.type === "answer" && (this.emit(xt.NegotiationComplete), e.sdp && ft.parse(e.sdp).media.forEach(a => {
        a.type === "video" && this.emit(xt.RTPVideoPayloadTypes, a.rtp)
      })), !0
    })
  }
  createAndSendOffer(e) {
    return b(this, void 0, void 0, function*() {
      var t;
      const n = yield this.offerLock.lock();
      try {
        if (this.onOffer === void 0) return;
        if (e != null && e.iceRestart && (this.log.debug("restarting ICE", this.logContext), this.restartingIce = !0), this._pc && this._pc.signalingState === "have-local-offer") {
          const o = this._pc.remoteDescription;
          if (e != null && e.iceRestart && o) yield this._pc.setRemoteDescription(o);
          else {
            this.renegotiate = !0, this.log.debug("requesting renegotiation", Object.assign({}, this.logContext));
            return
          }
        } else if (!this._pc || this._pc.signalingState === "closed") {
          this.log.warn("could not createOffer with closed peer connection", this.logContext);
          return
        }
        this.log.debug("starting to negotiate", this.logContext);
        const s = this.latestOfferId + 1;
        this.latestOfferId = s;
        const r = yield this.pc.createOffer(e);
        this.log.debug("original offer", Object.assign({
          sdp: r.sdp
        }, this.logContext));
        const a = ft.parse((t = r.sdp) !== null && t !== void 0 ? t : "");
        if (a.media.forEach(o => {
            po(o), o.type === "audio" ? fo(o, ["all"], []) : o.type === "video" && this.trackBitrates.some(c => {
              if (!o.msid || !c.cid || !o.msid.includes(c.cid)) return !1;
              let d = 0;
              if (o.rtp.some(u => u.codec.toUpperCase() === c.codec.toUpperCase() ? (d = u.payload, !0) : !1), d === 0 || (We(c.codec) && !Dt() && this.ensureVideoDDExtensionForSVC(o, a), !We(c.codec))) return !0;
              const l = Math.round(c.maxbr * Km);
              for (const u of o.fmtp)
                if (u.payload === d) {
                  u.config.includes("x-google-start-bitrate") || (u.config += ";x-google-start-bitrate=".concat(l));
                  break
                } return !0
            })
          }), this.latestOfferId > s) {
          this.log.warn("latestOfferId mismatch", Object.assign(Object.assign({}, this.logContext), {
            latestOfferId: this.latestOfferId,
            offerId: s
          }));
          return
        }
        yield this.setMungedSDP(r, ft.write(a)), this.onOffer(r, this.latestOfferId)
      } finally {
        n()
      }
    })
  }
  createAndSetAnswer() {
    return b(this, void 0, void 0, function*() {
      var e;
      const t = yield this.pc.createAnswer(), n = ft.parse((e = t.sdp) !== null && e !== void 0 ? e : "");
      return n.media.forEach(s => {
        po(s), s.type === "audio" && fo(s, this.remoteStereoMids, this.remoteNackMids)
      }), yield this.setMungedSDP(t, ft.write(n)), t
    })
  }
  createDataChannel(e, t) {
    return this.pc.createDataChannel(e, t)
  }
  addTransceiver(e, t) {
    return this.pc.addTransceiver(e, t)
  }
  addTransceiverOfKind(e, t) {
    return this.pc.addTransceiver(e, t)
  }
  addTrack(e) {
    if (!this._pc) throw new fe("PC closed, cannot add track");
    return this._pc.addTrack(e)
  }
  setTrackCodecBitrate(e) {
    this.trackBitrates.push(e)
  }
  setConfiguration(e) {
    var t;
    if (!this._pc) throw new fe("PC closed, cannot configure");
    return (t = this._pc) === null || t === void 0 ? void 0 : t.setConfiguration(e)
  }
  canRemoveTrack() {
    var e;
    return !!(!((e = this._pc) === null || e === void 0) && e.removeTrack)
  }
  removeTrack(e) {
    var t;
    return (t = this._pc) === null || t === void 0 ? void 0 : t.removeTrack(e)
  }
  getConnectionState() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.connectionState) !== null && t !== void 0 ? t : "closed"
  }
  getICEConnectionState() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.iceConnectionState) !== null && t !== void 0 ? t : "closed"
  }
  getSignallingState() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.signalingState) !== null && t !== void 0 ? t : "closed"
  }
  getTransceivers() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.getTransceivers()) !== null && t !== void 0 ? t : []
  }
  getSenders() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.getSenders()) !== null && t !== void 0 ? t : []
  }
  getLocalDescription() {
    var e;
    return (e = this._pc) === null || e === void 0 ? void 0 : e.localDescription
  }
  getRemoteDescription() {
    var e;
    return (e = this.pc) === null || e === void 0 ? void 0 : e.remoteDescription
  }
  getStats() {
    return this.pc.getStats()
  }
  getConnectedAddress() {
    return b(this, void 0, void 0, function*() {
      var e;
      if (!this._pc) return;
      let t = "";
      const n = new Map,
        s = new Map;
      if ((yield this._pc.getStats()).forEach(o => {
          switch (o.type) {
            case "transport":
              t = o.selectedCandidatePairId;
              break;
            case "candidate-pair":
              t === "" && o.selected && (t = o.id), n.set(o.id, o);
              break;
            case "remote-candidate":
              s.set(o.id, "".concat(o.address, ":").concat(o.port));
              break
          }
        }), t === "") return;
      const a = (e = n.get(t)) === null || e === void 0 ? void 0 : e.remoteCandidateId;
      if (a !== void 0) return s.get(a)
    })
  }
  setMungedSDP(e, t, n) {
    return b(this, void 0, void 0, function*() {
      if (t) {
        const s = e.sdp;
        e.sdp = t;
        try {
          this.log.debug("setting munged ".concat(n ? "remote" : "local", " description"), this.logContext), n ? yield this.pc.setRemoteDescription(e): yield this.pc.setLocalDescription(e);
          return
        } catch (r) {
          this.log.warn("not able to set ".concat(e.type, ", falling back to unmodified sdp"), Object.assign(Object.assign({}, this.logContext), {
            error: r,
            sdp: t
          })), e.sdp = s
        }
      }
      try {
        n ? yield this.pc.setRemoteDescription(e): yield this.pc.setLocalDescription(e)
      } catch (s) {
        let r = "unknown error";
        s instanceof Error ? r = s.message : typeof s == "string" && (r = s);
        const a = {
          error: r,
          sdp: e.sdp
        };
        throw !n && this.pc.remoteDescription && (a.remoteSdp = this.pc.remoteDescription), this.log.error("unable to set ".concat(e.type), Object.assign(Object.assign({}, this.logContext), {
          fields: a
        })), new _t(r)
      }
    })
  }
  ensureVideoDDExtensionForSVC(e, t) {
    var n, s;
    if (!((n = e.ext) === null || n === void 0 ? void 0 : n.some(a => a.uri === $r))) {
      if (this.ddExtID === 0) {
        let a = 0;
        t.media.forEach(o => {
          var c;
          o.type === "video" && ((c = o.ext) === null || c === void 0 || c.forEach(d => {
            d.value > a && (a = d.value)
          }))
        }), this.ddExtID = a + 1
      }(s = e.ext) === null || s === void 0 || s.push({
        value: this.ddExtID,
        uri: $r
      })
    }
  }
}

function fo(i, e, t) {
  const n = Js(i.mid);
  let s = 0;
  i.rtp.some(r => r.codec === "opus" ? (s = r.payload, !0) : !1), s > 0 && (i.rtcpFb || (i.rtcpFb = []), t.includes(n) && !i.rtcpFb.some(r => r.payload === s && r.type === "nack") && i.rtcpFb.push({
    payload: s,
    type: "nack"
  }), (e.includes(n) || e.length === 1 && e[0] === "all") && i.fmtp.some(r => r.payload === s ? (r.config.includes("stereo=1") || (r.config += ";stereo=1"), !0) : !1))
}



function po(i) {
  if (i.connection) {
    const e = i.connection.ip.indexOf(":") >= 0;
    (i.connection.version === 4 && e || i.connection.version === 6 && !e) && (i.connection.ip = "0.0.0.0", i.connection.version = 4)
  }
}


const us = "vp8",
  zm = {
    audioPreset: is.music,
    dtx: !0,
    red: !0,
    forceStereo: !1,
    simulcast: !0,
    screenShareEncoding: ln.h1080fps15.encoding,
    stopMicTrackOnMute: !1,
    videoCodec: us,
    backupCodec: !0,
    preConnectBuffer: !1
  },
  Ic = {
    deviceId: {
      ideal: "default"
    },
    autoGainControl: !0,
    echoCancellation: !0,
    noiseSuppression: !0,
    voiceIsolation: !0
  },
  xc = {
    deviceId: {
      ideal: "default"
    },
    resolution: gi.h720.resolution
  },
  $m = {
    adaptiveStream: !1,
    dynacast: !1,
    stopLocalTrackOnUnpublish: !0,
    reconnectPolicy: new Ph,
    disconnectOnPageLeave: !0,
    webAudioMix: !1,
    singlePeerConnection: !0
  },
  zs = {
    autoSubscribe: !0,
    maxRetries: 1,
    peerConnectionTimeout: 15e3,
    websocketTimeout: 15e3
  };
var le;
(function(i) {
  i[i.NEW = 0] = "NEW", i[i.CONNECTING = 1] = "CONNECTING", i[i.CONNECTED = 2] = "CONNECTED", i[i.FAILED = 3] = "FAILED", i[i.CLOSING = 4] = "CLOSING", i[i.CLOSED = 5] = "CLOSED"
})(le || (le = {}));
class Qm {
  get needsPublisher() {
    return this.isPublisherConnectionRequired
  }
  get needsSubscriber() {
    return this.isSubscriberConnectionRequired
  }
  get currentState() {
    return this.state
  }
  get mode() {
    return this._mode
  }
  constructor(e, t, n) {
    var s;
    this.peerConnectionTimeout = zs.peerConnectionTimeout, this.log = X, this.updateState = () => {
      var r, a;
      const o = this.state,
        c = this.requiredTransports.map(d => d.getConnectionState());
      c.every(d => d === "connected") ? this.state = le.CONNECTED : c.some(d => d === "failed") ? this.state = le.FAILED : c.some(d => d === "connecting") ? this.state = le.CONNECTING : c.every(d => d === "closed") ? this.state = le.CLOSED : c.some(d => d === "closed") ? this.state = le.CLOSING : c.every(d => d === "new") && (this.state = le.NEW), o !== this.state && (this.log.debug("pc state change: from ".concat(le[o], " to ").concat(le[this.state]), this.logContext), (r = this.onStateChange) === null || r === void 0 || r.call(this, this.state, this.publisher.getConnectionState(), (a = this.subscriber) === null || a === void 0 ? void 0 : a.getConnectionState()))
    }, this.log = Ye((s = n.loggerName) !== null && s !== void 0 ? s : Ue.PCManager), this.loggerOptions = n, this.isPublisherConnectionRequired = t !== "subscriber-primary", this.isSubscriberConnectionRequired = t === "subscriber-primary", this.publisher = new mo(e, n), this._mode = t, t !== "publisher-only" && (this.subscriber = new mo(e, n), this.subscriber.onConnectionStateChange = this.updateState, this.subscriber.onIceConnectionStateChange = this.updateState, this.subscriber.onSignalingStatechange = this.updateState, this.subscriber.onIceCandidate = r => {
      var a;
      (a = this.onIceCandidate) === null || a === void 0 || a.call(this, r, qe.SUBSCRIBER)
    }, this.subscriber.onDataChannel = r => {
      var a;
      (a = this.onDataChannel) === null || a === void 0 || a.call(this, r)
    }, this.subscriber.onTrack = r => {
      var a;
      (a = this.onTrack) === null || a === void 0 || a.call(this, r)
    }), this.publisher.onConnectionStateChange = this.updateState, this.publisher.onIceConnectionStateChange = this.updateState, this.publisher.onSignalingStatechange = this.updateState, this.publisher.onIceCandidate = r => {
      var a;
      (a = this.onIceCandidate) === null || a === void 0 || a.call(this, r, qe.PUBLISHER)
    }, this.publisher.onTrack = r => {
      var a;
      (a = this.onTrack) === null || a === void 0 || a.call(this, r)
    }, this.publisher.onOffer = (r, a) => {
      var o;
      (o = this.onPublisherOffer) === null || o === void 0 || o.call(this, r, a)
    }, this.state = le.NEW, this.connectionLock = new _e, this.remoteOfferLock = new _e
  }
  get logContext() {
    var e, t;
    return Object.assign({}, (t = (e = this.loggerOptions).loggerContextCb) === null || t === void 0 ? void 0 : t.call(e))
  }
  requirePublisher() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
    this.isPublisherConnectionRequired = e, this.updateState()
  }
  createAndSendPublisherOffer(e) {
    return this.publisher.createAndSendOffer(e)
  }
  setPublisherAnswer(e, t) {
    return this.publisher.setRemoteDescription(e, t)
  }
  removeTrack(e) {
    return this.publisher.removeTrack(e)
  }
  close() {
    return b(this, void 0, void 0, function*() {
      var e;
      if (this.publisher && this.publisher.getSignallingState() !== "closed") {
        const t = this.publisher;
        for (const n of t.getSenders()) try {
          t.canRemoveTrack() && t.removeTrack(n)
        } catch (s) {
          this.log.warn("could not removeTrack", Object.assign(Object.assign({}, this.logContext), {
            error: s
          }))
        }
      }
      yield Promise.all([this.publisher.close(), (e = this.subscriber) === null || e === void 0 ? void 0 : e.close()]), this.updateState()
    })
  }
  triggerIceRestart() {
    return b(this, void 0, void 0, function*() {
      this.subscriber && (this.subscriber.restartingIce = !0), this.needsPublisher && (yield this.createAndSendPublisherOffer({
        iceRestart: !0
      }))
    })
  }
  addIceCandidate(e, t) {
    return b(this, void 0, void 0, function*() {
      var n;
      t === qe.PUBLISHER ? yield this.publisher.addIceCandidate(e): yield(n = this.subscriber) === null || n === void 0 ? void 0 : n.addIceCandidate(e)
    })
  }
  createSubscriberAnswerFromOffer(e, t) {
    return b(this, void 0, void 0, function*() {
      var n, s, r;
      this.log.debug("received server offer", Object.assign(Object.assign({}, this.logContext), {
        RTCSdpType: e.type,
        sdp: e.sdp,
        signalingState: (n = this.subscriber) === null || n === void 0 ? void 0 : n.getSignallingState().toString()
      }));
      const a = yield this.remoteOfferLock.lock();
      try {
        return (yield(s = this.subscriber) === null || s === void 0 ? void 0 : s.setRemoteDescription(e, t)) ? yield(r = this.subscriber) === null || r === void 0 ? void 0 : r.createAndSetAnswer(): void 0
      } finally {
        a()
      }
    })
  }
  updateConfiguration(e, t) {
    var n;
    this.publisher.setConfiguration(e), (n = this.subscriber) === null || n === void 0 || n.setConfiguration(e), t && this.triggerIceRestart()
  }
  ensurePCTransportConnection(e, t) {
    return b(this, void 0, void 0, function*() {
      var n;
      const s = yield this.connectionLock.lock();
      try {
        this.isPublisherConnectionRequired && this.publisher.getConnectionState() !== "connected" && this.publisher.getConnectionState() !== "connecting" && (this.log.debug("negotiation required, start negotiating", this.logContext), this.publisher.negotiate()), yield Promise.all((n = this.requiredTransports) === null || n === void 0 ? void 0 : n.map(r => this.ensureTransportConnected(r, e, t)))
      } finally {
        s()
      }
    })
  }
  negotiate(e) {
    return b(this, void 0, void 0, function*() {
      return new Ee((t, n) => b(this, void 0, void 0, function*() {
        let s = setTimeout(() => {
          n(new _t("negotiation timed out"))
        }, this.peerConnectionTimeout);
        const r = () => {
            clearTimeout(s), this.publisher.off(xt.NegotiationStarted, o), e.signal.removeEventListener("abort", a)
          },
          a = () => {
            r(), n(new _t("negotiation aborted"))
          },
          o = () => {
            e.signal.aborted || (clearTimeout(s), s = setTimeout(() => {
              r(), n(new _t("negotiation timed out"))
            }, this.peerConnectionTimeout))
          };
        e.signal.addEventListener("abort", a), this.publisher.on(xt.NegotiationStarted, o), this.publisher.once(xt.NegotiationComplete, () => {
          r(), t()
        }), yield this.publisher.negotiate(c => {
          r(), c instanceof Error ? n(c) : n(new Error(String(c)))
        })
      }))
    })
  }
  addPublisherTransceiver(e, t) {
    return this.publisher.addTransceiver(e, t)
  }
  addPublisherTransceiverOfKind(e, t) {
    return this.publisher.addTransceiverOfKind(e, t)
  }
  getMidForReceiver(e) {
    const n = (this.subscriber ? this.subscriber.getTransceivers() : this.publisher.getTransceivers()).find(s => s.receiver === e);
    return n == null ? void 0 : n.mid
  }
  addPublisherTrack(e) {
    return this.publisher.addTrack(e)
  }
  createPublisherDataChannel(e, t) {
    return this.publisher.createDataChannel(e, t)
  }
  getConnectedAddress(e) {
    return e === qe.PUBLISHER ? this.publisher.getConnectedAddress() : e === qe.SUBSCRIBER ? this.publisher.getConnectedAddress() : this.requiredTransports[0].getConnectedAddress()
  }
  get requiredTransports() {
    const e = [];
    return this.isPublisherConnectionRequired && e.push(this.publisher), this.isSubscriberConnectionRequired && this.subscriber && e.push(this.subscriber), e
  }
  ensureTransportConnected(e, t) {
    return b(this, arguments, void 0, function(n, s) {
      var r = this;
      let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : this.peerConnectionTimeout;
      return function*() {
        if (n.getConnectionState() !== "connected") return new Promise((c, d) => b(r, void 0, void 0, function*() {
          const l = () => {
            this.log.warn("abort transport connection", this.logContext), Te.clearTimeout(u), d($.cancelled("room connection has been cancelled"))
          };
          s != null && s.signal.aborted && l(), s == null || s.signal.addEventListener("abort", l);
          const u = Te.setTimeout(() => {
            s == null || s.signal.removeEventListener("abort", l), d($.internal("could not establish pc connection"))
          }, a);
          for (; this.state !== le.CONNECTED;)
            if (yield Ce(50), s != null && s.signal.aborted) {
              d($.cancelled("room connection has been cancelled"));
              return
            } Te.clearTimeout(u), s == null || s.signal.removeEventListener("abort", l), c()
        }))
      }()
    })
  }
}
const Mc = 5e3,
  Ym = 3e4;
class se {
  static fetchRegionSettings(e, t, n) {
    return b(this, void 0, void 0, function*() {
      const s = yield se.fetchLock.lock();
      try {
        const r = yield fetch("".concat(Xm(e), "/regions"), {
          headers: {
            authorization: "Bearer ".concat(t)
          },
          signal: n
        });
        if (r.ok) {
          const a = km(r.headers),
            o = a ? a * 1e3 : Mc;
          return {
            regionSettings: yield r.json(),
            updatedAtInMs: Date.now(),
            maxAgeInMs: o
          }
        } else throw r.status === 401 ? $.notAllowed("Could not fetch region settings: ".concat(r.statusText), r.status) : $.internal("Could not fetch region settings: ".concat(r.statusText))
      } catch (r) {
        throw r instanceof $ ? r : n != null && n.aborted ? $.cancelled("Region fetching was aborted") : $.serverUnreachable("Could not fetch region settings, ".concat(r instanceof Error ? "".concat(r.name, ": ").concat(r.message) : r))
      } finally {
        s()
      }
    })
  }
  static scheduleRefetch(e, t, n) {
    return b(this, void 0, void 0, function*() {
      const s = se.settingsTimeouts.get(e.hostname);
      clearTimeout(s), se.settingsTimeouts.set(e.hostname, setTimeout(() => b(this, void 0, void 0, function*() {
        try {
          const r = yield se.fetchRegionSettings(e, t);
          se.updateCachedRegionSettings(e, t, r)
        } catch (r) {
          if (r instanceof $ && r.reason === ce.NotAllowed) {
            X.debug("token is not valid, cancelling auto region refresh");
            return
          }
          X.debug("auto refetching of region settings failed", {
            error: r
          }), se.scheduleRefetch(e, t, n)
        }
      }), n))
    })
  }
  static updateCachedRegionSettings(e, t, n) {
    se.cache.set(e.hostname, n), se.scheduleRefetch(e, t, n.maxAgeInMs)
  }
  static stopRefetch(e) {
    const t = se.settingsTimeouts.get(e);
    t && (clearTimeout(t), se.settingsTimeouts.delete(e))
  }
  static scheduleCleanup(e) {
    let t = se.connectionTrackers.get(e);
    t && (t.cleanupTimeout && clearTimeout(t.cleanupTimeout), t.cleanupTimeout = setTimeout(() => {
      const n = se.connectionTrackers.get(e);
      n && n.connectionCount === 0 && (X.debug("stopping region refetch after disconnect delay", {
        hostname: e
      }), se.stopRefetch(e)), n && (n.cleanupTimeout = void 0)
    }, Ym))
  }
  static cancelCleanup(e) {
    const t = se.connectionTrackers.get(e);
    t != null && t.cleanupTimeout && (clearTimeout(t.cleanupTimeout), t.cleanupTimeout = void 0)
  }
  notifyConnected() {
    const e = this.serverUrl.hostname;
    let t = se.connectionTrackers.get(e);
    t || (t = {
      connectionCount: 0
    }, se.connectionTrackers.set(e, t)), t.connectionCount++, se.cancelCleanup(e)
  }
  notifyDisconnected() {
    const e = this.serverUrl.hostname,
      t = se.connectionTrackers.get(e);
    t && (t.connectionCount = Math.max(0, t.connectionCount - 1), t.connectionCount === 0 && se.scheduleCleanup(e))
  }
  constructor(e, t) {
    this.attemptedRegions = [], this.serverUrl = new URL(e), this.token = t
  }
  updateToken(e) {
    this.token = e
  }
  isCloud() {
    return zt(this.serverUrl)
  }
  getServerUrl() {
    return this.serverUrl
  }
  fetchRegionSettings(e) {
    return b(this, void 0, void 0, function*() {
      return se.fetchRegionSettings(this.serverUrl, this.token, e)
    })
  }
  getNextBestRegionUrl(e) {
    return b(this, void 0, void 0, function*() {
      if (!this.isCloud()) throw Error("region availability is only supported for LiveKit Cloud domains");
      let t = se.cache.get(this.serverUrl.hostname);
      (!t || Date.now() - t.updatedAtInMs > t.maxAgeInMs) && (t = yield this.fetchRegionSettings(e), se.updateCachedRegionSettings(this.serverUrl, this.token, t));
      const n = t.regionSettings.regions.filter(s => !this.attemptedRegions.find(r => r.url === s.url));
      if (n.length > 0) {
        const s = n[0];
        return this.attemptedRegions.push(s), X.debug("next region: ".concat(s.region)), s.url
      } else return null
    })
  }
  resetAttempts() {
    this.attemptedRegions = []
  }
  setServerReportedRegions(e) {
    se.updateCachedRegionSettings(this.serverUrl, this.token, e)
  }
}
se.cache = new Map;
se.settingsTimeouts = new Map;
se.connectionTrackers = new Map;
se.fetchLock = new _e;


class me extends Error {
  constructor(e, t, n) {
    super(t), this.code = e, this.message = go(t, me.MAX_MESSAGE_BYTES), this.data = n ? go(n, me.MAX_DATA_BYTES) : void 0
  }
  static fromProto(e) {
    return new me(e.code, e.message, e.data)
  }
  toProto() {
    return new ya({
      code: this.code,
      message: this.message,
      data: this.data
    })
  }
  static builtIn(e, t) {
    return new me(me.ErrorCode[e], me.ErrorMessage[e], t)
  }
}
me.MAX_MESSAGE_BYTES = 256;
me.MAX_DATA_BYTES = 15360;
me.ErrorCode = {
  APPLICATION_ERROR: 1500,
  CONNECTION_TIMEOUT: 1501,
  RESPONSE_TIMEOUT: 1502,
  RECIPIENT_DISCONNECTED: 1503,
  RESPONSE_PAYLOAD_TOO_LARGE: 1504,
  SEND_FAILED: 1505,
  UNSUPPORTED_METHOD: 1400,
  RECIPIENT_NOT_FOUND: 1401,
  REQUEST_PAYLOAD_TOO_LARGE: 1402,
  UNSUPPORTED_SERVER: 1403,
  UNSUPPORTED_VERSION: 1404
};
me.ErrorMessage = {
  APPLICATION_ERROR: "Application error in method handler",
  CONNECTION_TIMEOUT: "Connection timeout",
  RESPONSE_TIMEOUT: "Response timeout",
  RECIPIENT_DISCONNECTED: "Recipient disconnected",
  RESPONSE_PAYLOAD_TOO_LARGE: "Response payload too large",
  SEND_FAILED: "Failed to send",
  UNSUPPORTED_METHOD: "Method not supported at destination",
  RECIPIENT_NOT_FOUND: "Recipient not found",
  REQUEST_PAYLOAD_TOO_LARGE: "Request payload too large",
  UNSUPPORTED_SERVER: "RPC not supported by server",
  UNSUPPORTED_VERSION: "Unsupported RPC version"
};
const Oc = 15360;



function go(i, e) {
  if ($s(i) <= e) return i;
  let t = 0,
    n = i.length;
  const s = new TextEncoder;
  for (; t < n;) {
    const r = Math.floor((t + n + 1) / 2);
    s.encode(i.slice(0, r)).length <= e ? t = r : n = r - 1
  }
  return i.slice(0, t)
}
const Qs = 2e3;


const Ys = typeof MediaRecorder < "u";

const ef = Ys ? MediaRecorder : Zm;
class tf extends ef {
  constructor(e, t) {
    if (!Ys) throw new Error("MediaRecorder is not available in this environment");
    super(new MediaStream([e.mediaStreamTrack]), t);
    let n, s;
    const r = () => s === void 0,
      a = () => {
        this.removeEventListener("dataavailable", n), this.removeEventListener("stop", a), this.removeEventListener("error", o), s == null || s.close(), s = void 0
      },
      o = c => {
        s == null || s.error(c), this.removeEventListener("dataavailable", n), this.removeEventListener("stop", a), this.removeEventListener("error", o), s = void 0
      };
    this.byteStream = new ReadableStream({
      start: c => {
        s = c, n = d => b(this, void 0, void 0, function*() {
          let l;
          if (d.data.arrayBuffer) {
            const u = yield d.data.arrayBuffer();
            l = new Uint8Array(u)
          } else if (d.data.byteArray) l = d.data.byteArray;
          else throw new Error("no data available!");
          r() || c.enqueue(l)
        }), this.addEventListener("dataavailable", n)
      },
      cancel: () => {
        a()
      }
    }), this.addEventListener("stop", a), this.addEventListener("error", o)
  }
}

function nf() {
  return Ys
}
const sf = 1e3,
  rf = 1e4;
class Dc extends O {
  get sender() {
    return this._sender
  }
  set sender(e) {
    this._sender = e
  }
  get constraints() {
    return this._constraints
  }
  get hasPreConnectBuffer() {
    return !!this.localTrackRecorder
  }
  constructor(e, t, n) {
    let s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1,
      r = arguments.length > 4 ? arguments[4] : void 0;
    super(e, t, r), this.manuallyStopped = !1, this.pendingDeviceChange = !1, this._isUpstreamPaused = !1, this.handleTrackMuteEvent = () => this.debouncedTrackMuteHandler().catch(() => this.log.debug("track mute bounce got cancelled by an unmute event", this.logContext)), this.debouncedTrackMuteHandler = Gs(() => b(this, void 0, void 0, function*() {
      yield this.pauseUpstream()
    }), 5e3), this.handleTrackUnmuteEvent = () => b(this, void 0, void 0, function*() {
      this.debouncedTrackMuteHandler.cancel("unmute"), yield this.resumeUpstream()
    }), this.handleEnded = () => {
      this.isInBackground && (this.reacquireTrack = !0), this._mediaStreamTrack.removeEventListener("mute", this.handleTrackMuteEvent), this._mediaStreamTrack.removeEventListener("unmute", this.handleTrackUnmuteEvent), this.emit(B.Ended, this)
    }, this.reacquireTrack = !1, this.providedByUser = s, this.muteLock = new _e, this.pauseUpstreamLock = new _e, this.trackChangeLock = new _e, this.trackChangeLock.lock().then(a => b(this, void 0, void 0, function*() {
      try {
        yield this.setMediaStreamTrack(e, !0)
      } finally {
        a()
      }
    })), this._constraints = e.getConstraints(), n && (this._constraints = n)
  }
  get id() {
    return this._mediaStreamTrack.id
  }
  get dimensions() {
    if (this.kind !== O.Kind.Video) return;
    const {
      width: e,
      height: t
    } = this._mediaStreamTrack.getSettings();
    if (e && t) return {
      width: e,
      height: t
    }
  }
  get isUpstreamPaused() {
    return this._isUpstreamPaused
  }
  get isUserProvided() {
    return this.providedByUser
  }
  get mediaStreamTrack() {
    var e, t;
    return (t = (e = this.processor) === null || e === void 0 ? void 0 : e.processedTrack) !== null && t !== void 0 ? t : this._mediaStreamTrack
  }
  get isLocal() {
    return !0
  }
  getSourceTrackSettings() {
    return this._mediaStreamTrack.getSettings()
  }
  setMediaStreamTrack(e, t) {
    return b(this, void 0, void 0, function*() {
      var n;
      if (e === this._mediaStreamTrack && !t) return;
      this._mediaStreamTrack && (this.attachedElements.forEach(r => {
        Ht(this._mediaStreamTrack, r)
      }), this.debouncedTrackMuteHandler.cancel("new-track"), this._mediaStreamTrack.removeEventListener("ended", this.handleEnded), this._mediaStreamTrack.removeEventListener("mute", this.handleTrackMuteEvent), this._mediaStreamTrack.removeEventListener("unmute", this.handleTrackUnmuteEvent)), this.mediaStream = new MediaStream([e]), e && (e.addEventListener("ended", this.handleEnded), e.addEventListener("mute", this.handleTrackMuteEvent), e.addEventListener("unmute", this.handleTrackUnmuteEvent), this._constraints = e.getConstraints());
      let s;
      if (this.processor && e) {
        if (this.log.debug("restarting processor", this.logContext), this.kind === "unknown") throw TypeError("cannot set processor on track of unknown kind");
        this.processorElement && (Ft(e, this.processorElement), this.processorElement.muted = !0), yield this.processor.restart({
          track: e,
          kind: this.kind,
          element: this.processorElement
        }), s = this.processor.processedTrack
      }
      this.sender && ((n = this.sender.transport) === null || n === void 0 ? void 0 : n.state) !== "closed" && (yield this.sender.replaceTrack(s ?? e)), !this.providedByUser && this._mediaStreamTrack !== e && this._mediaStreamTrack.stop(), this._mediaStreamTrack = e, e && (this._mediaStreamTrack.enabled = !this.isMuted, yield this.resumeUpstream(), this.attachedElements.forEach(r => {
        Ft(s ?? e, r)
      }))
    })
  }
  waitForDimensions() {
    return b(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : sf;
      return function*() {
        var n;
        if (e.kind === O.Kind.Audio) throw new Error("cannot get dimensions for audio tracks");
        ((n = Oe()) === null || n === void 0 ? void 0 : n.os) === "iOS" && (yield Ce(10));
        const s = Date.now();
        for (; Date.now() - s < t;) {
          const r = e.dimensions;
          if (r) return r;
          yield Ce(50)
        }
        throw new ct("unable to get track dimensions after timeout")
      }()
    })
  }
  setDeviceId(e) {
    return b(this, void 0, void 0, function*() {
      return this._constraints.deviceId === e && this._mediaStreamTrack.getSettings().deviceId === It(e) ? !0 : (this._constraints.deviceId = e, this.isMuted ? (this.pendingDeviceChange = !0, !0) : (yield this.restartTrack(), It(e) === this._mediaStreamTrack.getSettings().deviceId))
    })
  }
  getDeviceId() {
    return b(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
      return function*() {
        if (e.source === O.Source.ScreenShare) return;
        const {
          deviceId: n,
          groupId: s
        } = e._mediaStreamTrack.getSettings(), r = e.kind === O.Kind.Audio ? "audioinput" : "videoinput";
        return t ? Se.getInstance().normalizeDeviceId(r, n, s) : n
      }()
    })
  }
  mute() {
    return b(this, void 0, void 0, function*() {
      return this.setTrackMuted(!0), this
    })
  }
  unmute() {
    return b(this, void 0, void 0, function*() {
      return this.setTrackMuted(!1), this
    })
  }
  replaceTrack(e, t) {
    return b(this, void 0, void 0, function*() {
      const n = yield this.trackChangeLock.lock();
      try {
        if (!this.sender) throw new ct("unable to replace an unpublished track");
        let s, r;
        return typeof t == "boolean" ? s = t : t !== void 0 && (s = t.userProvidedTrack, r = t.stopProcessor), this.providedByUser = s ?? !0, this.log.debug("replace MediaStreamTrack", this.logContext), yield this.setMediaStreamTrack(e), r && this.processor && (yield this.internalStopProcessor()), this
      } finally {
        n()
      }
    })
  }
  restart(e) {
    return b(this, void 0, void 0, function*() {
      this.manuallyStopped = !1;
      const t = yield this.trackChangeLock.lock();
      try {
        e || (e = this._constraints);
        const {
          deviceId: n,
          facingMode: s
        } = e, r = Rh(e, ["deviceId", "facingMode"]);
        this.log.debug("restarting track with constraints", Object.assign(Object.assign({}, this.logContext), {
          constraints: e
        }));
        const a = {
          audio: !1,
          video: !1
        };
        this.kind === O.Kind.Video ? a.video = n || s ? {
          deviceId: n,
          facingMode: s
        } : !0 : a.audio = n ? Object.assign({
          deviceId: n
        }, r) : !0, this.attachedElements.forEach(d => {
          Ht(this.mediaStreamTrack, d)
        }), this._mediaStreamTrack.removeEventListener("ended", this.handleEnded), this._mediaStreamTrack.stop();
        const c = (yield navigator.mediaDevices.getUserMedia(a)).getTracks()[0];
        return this.kind === O.Kind.Video && (yield c.applyConstraints(r)), c.addEventListener("ended", this.handleEnded), this.log.debug("re-acquired MediaStreamTrack", this.logContext), yield this.setMediaStreamTrack(c), this._constraints = e, this.pendingDeviceChange = !1, this.emit(B.Restarted, this), this.manuallyStopped && (this.log.warn("track was stopped during a restart, stopping restarted track", this.logContext), this.stop()), this
      } finally {
        t()
      }
    })
  }
  setTrackMuted(e) {
    this.log.debug("setting ".concat(this.kind, " track ").concat(e ? "muted" : "unmuted"), this.logContext), !(this.isMuted === e && this._mediaStreamTrack.enabled !== e) && (this.isMuted = e, this._mediaStreamTrack.enabled = !e, this.emit(e ? B.Muted : B.Unmuted, this))
  }
  get needsReAcquisition() {
    return this._mediaStreamTrack.readyState !== "live" || this._mediaStreamTrack.muted || !this._mediaStreamTrack.enabled || this.reacquireTrack
  }
  handleAppVisibilityChanged() {
    const e = Object.create(null, {
      handleAppVisibilityChanged: {
        get: () => super.handleAppVisibilityChanged
      }
    });
    return b(this, void 0, void 0, function*() {
      yield e.handleAppVisibilityChanged.call(this), Ec() && (this.log.debug("visibility changed, is in Background: ".concat(this.isInBackground), this.logContext), !this.isInBackground && this.needsReAcquisition && !this.isUserProvided && !this.isMuted && (this.log.debug("track needs to be reacquired, restarting ".concat(this.source), this.logContext), yield this.restart(), this.reacquireTrack = !1))
    })
  }
  stop() {
    var e;
    this.manuallyStopped = !0, super.stop(), this._mediaStreamTrack.removeEventListener("ended", this.handleEnded), this._mediaStreamTrack.removeEventListener("mute", this.handleTrackMuteEvent), this._mediaStreamTrack.removeEventListener("unmute", this.handleTrackUnmuteEvent), (e = this.processor) === null || e === void 0 || e.destroy(), this.processor = void 0
  }
  pauseUpstream() {
    return b(this, void 0, void 0, function*() {
      var e;
      const t = yield this.pauseUpstreamLock.lock();
      try {
        if (this._isUpstreamPaused === !0) return;
        if (!this.sender) {
          this.log.warn("unable to pause upstream for an unpublished track", this.logContext);
          return
        }
        this._isUpstreamPaused = !0, this.emit(B.UpstreamPaused, this);
        const n = Oe();
        if ((n == null ? void 0 : n.name) === "Safari" && Ze(n.version, "12.0") < 0) throw new Vs("pauseUpstream is not supported on Safari < 12.");
        ((e = this.sender.transport) === null || e === void 0 ? void 0 : e.state) !== "closed" && (yield this.sender.replaceTrack(null))
      } finally {
        t()
      }
    })
  }
  resumeUpstream() {
    return b(this, void 0, void 0, function*() {
      var e;
      const t = yield this.pauseUpstreamLock.lock();
      try {
        if (this._isUpstreamPaused === !1) return;
        if (!this.sender) {
          this.log.warn("unable to resume upstream for an unpublished track", this.logContext);
          return
        }
        this._isUpstreamPaused = !1, this.emit(B.UpstreamResumed, this), ((e = this.sender.transport) === null || e === void 0 ? void 0 : e.state) !== "closed" && (yield this.sender.replaceTrack(this.mediaStreamTrack))
      } finally {
        t()
      }
    })
  }
  getRTCStatsReport() {
    return b(this, void 0, void 0, function*() {
      var e;
      return !((e = this.sender) === null || e === void 0) && e.getStats ? yield this.sender.getStats(): void 0
    })
  }
  setProcessor(e) {
    return b(this, arguments, void 0, function(t) {
      var n = this;
      let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
      return function*() {
        var r;
        const a = yield n.trackChangeLock.lock();
        try {
          n.log.debug("setting up processor", n.logContext);
          const o = document.createElement(n.kind),
            c = {
              kind: n.kind,
              track: n._mediaStreamTrack,
              element: o,
              audioContext: n.audioContext
            };
          if (yield t.init(c), n.log.debug("processor initialized", n.logContext), n.processor && (yield n.internalStopProcessor()), n.kind === "unknown") throw TypeError("cannot set processor on track of unknown kind");
          if (Ft(n._mediaStreamTrack, o), o.muted = !0, o.play().catch(d => {
              d instanceof DOMException && d.name === "AbortError" ? (n.log.warn("failed to play processor element, retrying", Object.assign(Object.assign({}, n.logContext), {
                error: d
              })), setTimeout(() => {
                o.play().catch(l => {
                  n.log.error("failed to play processor element", Object.assign(Object.assign({}, n.logContext), {
                    err: l
                  }))
                })
              }, 100)) : n.log.error("failed to play processor element", Object.assign(Object.assign({}, n.logContext), {
                error: d
              }))
            }), n.processor = t, n.processorElement = o, n.processor.processedTrack) {
            for (const d of n.attachedElements) d !== n.processorElement && s && (Ht(n._mediaStreamTrack, d), Ft(n.processor.processedTrack, d));
            yield(r = n.sender) === null || r === void 0 ? void 0 : r.replaceTrack(n.processor.processedTrack)
          }
          n.emit(B.TrackProcessorUpdate, n.processor)
        } finally {
          a()
        }
      }()
    })
  }
  getProcessor() {
    return this.processor
  }
  stopProcessor() {
    return b(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
      return function*() {
        const n = yield e.trackChangeLock.lock();
        try {
          yield e.internalStopProcessor(t)
        } finally {
          n()
        }
      }()
    })
  }
  internalStopProcessor() {
    return b(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
      return function*() {
        var n, s;
        e.processor && (e.log.debug("stopping processor", e.logContext), (n = e.processor.processedTrack) === null || n === void 0 || n.stop(), yield e.processor.destroy(), e.processor = void 0, t || ((s = e.processorElement) === null || s === void 0 || s.remove(), e.processorElement = void 0), yield e._mediaStreamTrack.applyConstraints(e._constraints), yield e.setMediaStreamTrack(e._mediaStreamTrack, !0), e.emit(B.TrackProcessorUpdate))
      }()
    })
  }
  startPreConnectBuffer() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 100;
    if (!nf()) {
      this.log.warn("MediaRecorder is not available, cannot start preconnect buffer", this.logContext);
      return
    }
    if (this.localTrackRecorder) {
      this.log.warn("preconnect buffer already started");
      return
    } else {
      let t = "audio/webm;codecs=opus";
      MediaRecorder.isTypeSupported(t) || (t = "video/mp4"), this.localTrackRecorder = new tf(this, {
        mimeType: t
      })
    }
    this.localTrackRecorder.start(e), this.autoStopPreConnectBuffer = setTimeout(() => {
      this.log.warn("preconnect buffer timed out, stopping recording automatically", this.logContext), this.stopPreConnectBuffer()
    }, rf)
  }
  stopPreConnectBuffer() {
    clearTimeout(this.autoStopPreConnectBuffer), this.localTrackRecorder && (this.localTrackRecorder.stop(), this.localTrackRecorder = void 0)
  }
  getPreConnectBuffer() {
    var e;
    return (e = this.localTrackRecorder) === null || e === void 0 ? void 0 : e.byteStream
  }
  getPreConnectBufferMimeType() {
    var e;
    return (e = this.localTrackRecorder) === null || e === void 0 ? void 0 : e.mimeType
  }
}
class $i extends Dc {
  get enhancedNoiseCancellation() {
    return this.isKrispNoiseFilterEnabled
  }
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0,
      s = arguments.length > 3 ? arguments[3] : void 0,
      r = arguments.length > 4 ? arguments[4] : void 0;
    super(e, O.Kind.Audio, t, n, r), this.stopOnMute = !1, this.isKrispNoiseFilterEnabled = !1, this.monitorSender = () => b(this, void 0, void 0, function*() {
      if (!this.sender) {
        this._currentBitrate = 0;
        return
      }
      let a;
      try {
        a = yield this.getSenderStats()
      } catch (o) {
        this.log.error("could not get audio sender stats", Object.assign(Object.assign({}, this.logContext), {
          error: o
        }));
        return
      }
      a && this.prevStats && (this._currentBitrate = un(a, this.prevStats)), this.prevStats = a
    }), this.handleKrispNoiseFilterEnable = () => {
      this.isKrispNoiseFilterEnabled = !0, this.log.debug("Krisp noise filter enabled", this.logContext), this.emit(B.AudioTrackFeatureUpdate, this, ke.TF_ENHANCED_NOISE_CANCELLATION, !0)
    }, this.handleKrispNoiseFilterDisable = () => {
      this.isKrispNoiseFilterEnabled = !1, this.log.debug("Krisp noise filter disabled", this.logContext), this.emit(B.AudioTrackFeatureUpdate, this, ke.TF_ENHANCED_NOISE_CANCELLATION, !1)
    }, this.audioContext = s, this.checkForSilence()
  }
  mute() {
    const e = Object.create(null, {
      mute: {
        get: () => super.mute
      }
    });
    return b(this, void 0, void 0, function*() {
      const t = yield this.muteLock.lock();
      try {
        return this.isMuted ? (this.log.debug("Track already muted", this.logContext), this) : (this.source === O.Source.Microphone && this.stopOnMute && !this.isUserProvided && (this.log.debug("stopping mic track", this.logContext), this._mediaStreamTrack.stop()), yield e.mute.call(this), this)
      } finally {
        t()
      }
    })
  }
  unmute() {
    const e = Object.create(null, {
      unmute: {
        get: () => super.unmute
      }
    });
    return b(this, void 0, void 0, function*() {
      const t = yield this.muteLock.lock();
      try {
        return this.isMuted ? (this.source === O.Source.Microphone && (this.stopOnMute || this._mediaStreamTrack.readyState === "ended" || this.pendingDeviceChange) && !this.isUserProvided && (this.log.debug("reacquiring mic track", this.logContext), yield this.restartTrack()), yield e.unmute.call(this), this) : (this.log.debug("Track already unmuted", this.logContext), this)
      } finally {
        t()
      }
    })
  }
  restartTrack(e) {
    return b(this, void 0, void 0, function*() {
      let t;
      if (e) {
        const n = qs({
          audio: e
        });
        typeof n.audio != "boolean" && (t = n.audio)
      }
      yield this.restart(t)
    })
  }
  restart(e) {
    const t = Object.create(null, {
      restart: {
        get: () => super.restart
      }
    });
    return b(this, void 0, void 0, function*() {
      const n = yield t.restart.call(this, e);
      return this.checkForSilence(), n
    })
  }
  startMonitor() {
    Me() && (this.monitorInterval || (this.monitorInterval = setInterval(() => {
      this.monitorSender()
    }, Qs)))
  }
  setProcessor(e) {
    return b(this, void 0, void 0, function*() {
      var t;
      const n = yield this.trackChangeLock.lock();
      try {
        if (!Xe() && !this.audioContext) throw Error("Audio context needs to be set on LocalAudioTrack in order to enable processors");
        this.processor && (yield this.internalStopProcessor());
        const s = {
          kind: this.kind,
          track: this._mediaStreamTrack,
          audioContext: this.audioContext
        };
        this.log.debug("setting up audio processor ".concat(e.name), this.logContext), yield e.init(s), this.processor = e, this.processor.processedTrack && (yield(t = this.sender) === null || t === void 0 ? void 0 : t.replaceTrack(this.processor.processedTrack), this.processor.processedTrack.addEventListener("enable-lk-krisp-noise-filter", this.handleKrispNoiseFilterEnable), this.processor.processedTrack.addEventListener("disable-lk-krisp-noise-filter", this.handleKrispNoiseFilterDisable)), this.emit(B.TrackProcessorUpdate, this.processor)
      } finally {
        n()
      }
    })
  }
  setAudioContext(e) {
    this.audioContext = e
  }
  getSenderStats() {
    return b(this, void 0, void 0, function*() {
      var e;
      if (!(!((e = this.sender) === null || e === void 0) && e.getStats)) return;
      const t = yield this.sender.getStats();
      let n;
      return t.forEach(s => {
        s.type === "outbound-rtp" && (n = {
          type: "audio",
          streamId: s.id,
          packetsSent: s.packetsSent,
          packetsLost: s.packetsLost,
          bytesSent: s.bytesSent,
          timestamp: s.timestamp,
          roundTripTime: s.roundTripTime,
          jitter: s.jitter
        })
      }), n
    })
  }
  checkForSilence() {
    return b(this, void 0, void 0, function*() {
      const e = yield Tc(this);
      return e && (this.isMuted || this.log.debug("silence detected on local audio track", this.logContext), this.emit(B.AudioSilenceDetected)), e
    })
  }
}

function of(i, e, t) {
  switch (i.kind) {
    case "audio":
      return new $i(i, e, !1, void 0, t);
    case "video":
      return new Qi(i, e, !1, t);
    default:
      throw new ct("unsupported track type: ".concat(i.kind))
  }
}
const af = Object.values(gi),
  cf = Object.values(ns),
  df = Object.values(ln),
  lf = [gi.h180, gi.h360],
  uf = [ns.h180, ns.h360],
  hf = i => [{
    scaleResolutionDownBy: 2,
    fps: i.encoding.maxFramerate
  }].map(t => {
    var n, s;
    return new oe(Math.floor(i.width / t.scaleResolutionDownBy), Math.floor(i.height / t.scaleResolutionDownBy), Math.max(15e4, Math.floor(i.encoding.maxBitrate / (Math.pow(t.scaleResolutionDownBy, 2) * (((n = i.encoding.maxFramerate) !== null && n !== void 0 ? n : 30) / ((s = t.fps) !== null && s !== void 0 ? s : 30))))), t.fps, i.encoding.priority)
  }),
  hs = ["q", "h", "f"];

function ms(i, e, t, n) {
  var s, r;
  let a = n == null ? void 0 : n.videoEncoding;
  i && (a = n == null ? void 0 : n.screenShareEncoding);
  const o = n == null ? void 0 : n.simulcast,
    c = n == null ? void 0 : n.scalabilityMode,
    d = n == null ? void 0 : n.videoCodec;
  if (!a && !o && !c || !e || !t) return [{}];
  a || (a = ff(i, e, t, d), X.debug("using video encoding", a));
  const l = a.maxFramerate,
    u = new oe(e, t, a.maxBitrate, a.maxFramerate, a.priority);
  if (c && We(d)) {
    const f = new Ac(c),
      p = [];
    if (f.spatial > 3) throw new Error("unsupported scalabilityMode: ".concat(c));
    const _ = Oe();
    if (vi() || Xe() || (_ == null ? void 0 : _.name) === "Chrome" && Ze(_ == null ? void 0 : _.version, "113") < 0) {
      const w = f.suffix == "h" ? 2 : 3,
        k = cm(_);
      for (let P = 0; P < f.spatial; P += 1) p.push({
        rid: hs[2 - P],
        maxBitrate: a.maxBitrate / Math.pow(w, P),
        maxFramerate: u.encoding.maxFramerate,
        scaleResolutionDownBy: k ? Math.pow(2, P) : void 0
      });
      p[0].scalabilityMode = c
    } else p.push({
      maxBitrate: a.maxBitrate,
      maxFramerate: u.encoding.maxFramerate,
      scalabilityMode: c
    });
    return u.encoding.priority && (p[0].priority = u.encoding.priority, p[0].networkPriority = u.encoding.priority), X.debug("using svc encoding", {
      encodings: p
    }), p
  }
  if (!o) return [a];
  let h = [];
  i ? h = (s = bo(n == null ? void 0 : n.screenShareSimulcastLayers)) !== null && s !== void 0 ? s : vo(i, u) : h = (r = bo(n == null ? void 0 : n.videoSimulcastLayers)) !== null && r !== void 0 ? r : vo(i, u);
  let m;
  if (h.length > 0) {
    const f = h[0];
    h.length > 1 && ([, m] = h);
    const p = Math.max(e, t);
    if (p >= 960 && m) return xn(e, t, [f, m, u], l);
    if (p >= 480) return xn(e, t, [f, u], l)
  }
  return xn(e, t, [u])
}

function mf(i, e, t) {
  var n, s, r, a;
  if (!t.backupCodec || t.backupCodec === !0 || t.backupCodec.codec === t.videoCodec) return;
  e !== t.backupCodec.codec && X.warn("requested a different codec than specified as backup", {
    serverRequested: e,
    backup: t.backupCodec.codec
  }), t.videoCodec = e, t.videoEncoding = t.backupCodec.encoding;
  const o = i.mediaStreamTrack.getSettings(),
    c = (n = o.width) !== null && n !== void 0 ? n : (s = i.dimensions) === null || s === void 0 ? void 0 : s.width,
    d = (r = o.height) !== null && r !== void 0 ? r : (a = i.dimensions) === null || a === void 0 ? void 0 : a.height;
  return i.source === O.Source.ScreenShare && t.simulcast && (t.simulcast = !1), ms(i.source === O.Source.ScreenShare, c, d, t)
}

function ff(i, e, t, n) {
  const s = pf(i, e, t);
  let {
    encoding: r
  } = s[0];
  const a = Math.max(e, t);
  for (let o = 0; o < s.length; o += 1) {
    const c = s[o];
    if (r = c.encoding, c.width >= a) break
  }
  if (n) switch (n) {
    case "av1":
    case "h265":
      r = Object.assign({}, r), r.maxBitrate = r.maxBitrate * .7;
      break;
    case "vp9":
      r = Object.assign({}, r), r.maxBitrate = r.maxBitrate * .85;
      break
  }
  return r
}

function pf(i, e, t) {
  if (i) return df;
  const n = e > t ? e / t : t / e;
  return Math.abs(n - 16 / 9) < Math.abs(n - 4 / 3) ? af : cf
}

function vo(i, e) {
  if (i) return hf(e);
  const {
    width: t,
    height: n
  } = e, s = t > n ? t / n : n / t;
  return Math.abs(s - 16 / 9) < Math.abs(s - 4 / 3) ? lf : uf
}

function xn(i, e, t, n) {
  const s = [];
  if (t.forEach((r, a) => {
      if (a >= hs.length) return;
      const o = Math.min(i, e),
        d = {
          rid: hs[a],
          scaleResolutionDownBy: Math.max(1, o / Math.min(r.width, r.height)),
          maxBitrate: r.encoding.maxBitrate
        },
        l = n && r.encoding.maxFramerate ? Math.min(n, r.encoding.maxFramerate) : r.encoding.maxFramerate;
      l && (d.maxFramerate = l);
      const u = Ot() || a === 0;
      r.encoding.priority && u && (d.priority = r.encoding.priority, d.networkPriority = r.encoding.priority), s.push(d)
    }), Xe() && Rc() === "ios") {
    let r;
    s.forEach(o => {
      r ? o.maxFramerate && o.maxFramerate > r && (r = o.maxFramerate) : r = o.maxFramerate
    });
    let a = !0;
    s.forEach(o => {
      var c;
      o.maxFramerate != r && (a && (a = !1, X.info("Simulcast on iOS React-Native requires all encodings to share the same framerate.")), X.info('Setting framerate of encoding "'.concat((c = o.rid) !== null && c !== void 0 ? c : "", '" to ').concat(r)), o.maxFramerate = r)
    })
  }
  return s
}





const vf = 5e3;
class Qi extends Dc {
  get sender() {
    return this._sender
  }
  set sender(e) {
    this._sender = e, this.degradationPreference && this.setDegradationPreference(this.degradationPreference)
  }
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0,
      s = arguments.length > 3 ? arguments[3] : void 0;
    super(e, O.Kind.Video, t, n, s), this.simulcastCodecs = new Map, this.degradationPreference = "balanced", this.isCpuConstrained = !1, this.optimizeForPerformance = !1, this.monitorSender = () => b(this, void 0, void 0, function*() {
      if (!this.sender) {
        this._currentBitrate = 0;
        return
      }
      let r;
      try {
        r = yield this.getSenderStats()
      } catch (c) {
        this.log.error("could not get video sender stats", Object.assign(Object.assign({}, this.logContext), {
          error: c
        }));
        return
      }
      const a = new Map(r.map(c => [c.rid, c])),
        o = r.some(c => c.qualityLimitationReason === "cpu");
      if (o !== this.isCpuConstrained && (this.isCpuConstrained = o, this.isCpuConstrained && this.emit(B.CpuConstrained)), this.prevStats) {
        let c = 0;
        a.forEach((d, l) => {
          var u;
          const h = (u = this.prevStats) === null || u === void 0 ? void 0 : u.get(l);
          c += un(d, h)
        }), this._currentBitrate = c
      }
      this.prevStats = a
    }), this.senderLock = new _e
  }
  get isSimulcast() {
    return !!(this.sender && this.sender.getParameters().encodings.length > 1)
  }
  startMonitor(e) {
    var t;
    if (this.signalClient = e, !Me()) return;
    const n = (t = this.sender) === null || t === void 0 ? void 0 : t.getParameters();
    n && (this.encodings = n.encodings), !this.monitorInterval && (this.monitorInterval = setInterval(() => {
      this.monitorSender()
    }, Qs))
  }
  stop() {
    this._mediaStreamTrack.getConstraints(), this.simulcastCodecs.forEach(e => {
      e.mediaStreamTrack.stop()
    }), super.stop()
  }
  pauseUpstream() {
    const e = Object.create(null, {
      pauseUpstream: {
        get: () => super.pauseUpstream
      }
    });
    return b(this, void 0, void 0, function*() {
      var t, n, s, r, a;
      yield e.pauseUpstream.call(this);
      try {
        for (var o = !0, c = at(this.simulcastCodecs.values()), d; d = yield c.next(), t = d.done, !t; o = !0) r = d.value, o = !1, yield(a = r.sender) === null || a === void 0 ? void 0 : a.replaceTrack(null)
      } catch (l) {
        n = {
          error: l
        }
      } finally {
        try {
          !o && !t && (s = c.return) && (yield s.call(c))
        } finally {
          if (n) throw n.error
        }
      }
    })
  }
  resumeUpstream() {
    const e = Object.create(null, {
      resumeUpstream: {
        get: () => super.resumeUpstream
      }
    });
    return b(this, void 0, void 0, function*() {
      var t, n, s, r, a;
      yield e.resumeUpstream.call(this);
      try {
        for (var o = !0, c = at(this.simulcastCodecs.values()), d; d = yield c.next(), t = d.done, !t; o = !0) {
          r = d.value, o = !1;
          const l = r;
          yield(a = l.sender) === null || a === void 0 ? void 0 : a.replaceTrack(l.mediaStreamTrack)
        }
      } catch (l) {
        n = {
          error: l
        }
      } finally {
        try {
          !o && !t && (s = c.return) && (yield s.call(c))
        } finally {
          if (n) throw n.error
        }
      }
    })
  }
  mute() {
    const e = Object.create(null, {
      mute: {
        get: () => super.mute
      }
    });
    return b(this, void 0, void 0, function*() {
      const t = yield this.muteLock.lock();
      try {
        return this.isMuted ? (this.log.debug("Track already muted", this.logContext), this) : (this.source === O.Source.Camera && !this.isUserProvided && (this.log.debug("stopping camera track", this.logContext), this._mediaStreamTrack.stop()), yield e.mute.call(this), this)
      } finally {
        t()
      }
    })
  }
  unmute() {
    const e = Object.create(null, {
      unmute: {
        get: () => super.unmute
      }
    });
    return b(this, void 0, void 0, function*() {
      const t = yield this.muteLock.lock();
      try {
        return this.isMuted ? (this.source === O.Source.Camera && !this.isUserProvided && (this.log.debug("reacquiring camera track", this.logContext), yield this.restartTrack()), yield e.unmute.call(this), this) : (this.log.debug("Track already unmuted", this.logContext), this)
      } finally {
        t()
      }
    })
  }
  setTrackMuted(e) {
    super.setTrackMuted(e);
    for (const t of this.simulcastCodecs.values()) t.mediaStreamTrack.enabled = !e
  }
  getSenderStats() {
    return b(this, void 0, void 0, function*() {
      var e;
      if (!(!((e = this.sender) === null || e === void 0) && e.getStats)) return [];
      const t = [],
        n = yield this.sender.getStats();
      return n.forEach(s => {
        var r;
        if (s.type === "outbound-rtp") {
          const a = {
              type: "video",
              streamId: s.id,
              frameHeight: s.frameHeight,
              frameWidth: s.frameWidth,
              framesPerSecond: s.framesPerSecond,
              framesSent: s.framesSent,
              firCount: s.firCount,
              pliCount: s.pliCount,
              nackCount: s.nackCount,
              packetsSent: s.packetsSent,
              bytesSent: s.bytesSent,
              qualityLimitationReason: s.qualityLimitationReason,
              qualityLimitationDurations: s.qualityLimitationDurations,
              qualityLimitationResolutionChanges: s.qualityLimitationResolutionChanges,
              rid: (r = s.rid) !== null && r !== void 0 ? r : s.id,
              retransmittedPacketsSent: s.retransmittedPacketsSent,
              targetBitrate: s.targetBitrate,
              timestamp: s.timestamp
            },
            o = n.get(s.remoteId);
          o && (a.jitter = o.jitter, a.packetsLost = o.packetsLost, a.roundTripTime = o.roundTripTime), t.push(a)
        }
      }), t.sort((s, r) => {
        var a, o;
        return ((a = r.frameWidth) !== null && a !== void 0 ? a : 0) - ((o = s.frameWidth) !== null && o !== void 0 ? o : 0)
      }), t
    })
  }
  setPublishingQuality(e) {
    const t = [];
    for (let n = De.LOW; n <= De.HIGH; n += 1) t.push(new Ls({
      quality: n,
      enabled: n <= e
    }));
    this.log.debug("setting publishing quality. max quality ".concat(e), this.logContext), this.setPublishingLayers(We(this.codec), t)
  }
  restartTrack(e) {
    return b(this, void 0, void 0, function*() {
      var t, n, s, r, a;
      let o;
      if (e) {
        const u = qs({
          video: e
        });
        typeof u.video != "boolean" && (o = u.video)
      }
      yield this.restart(o), this.isCpuConstrained = !1;
      try {
        for (var c = !0, d = at(this.simulcastCodecs.values()), l; l = yield d.next(), t = l.done, !t; c = !0) {
          r = l.value, c = !1;
          const u = r;
          u.sender && ((a = u.sender.transport) === null || a === void 0 ? void 0 : a.state) !== "closed" && (u.mediaStreamTrack = this.mediaStreamTrack.clone(), yield u.sender.replaceTrack(u.mediaStreamTrack))
        }
      } catch (u) {
        n = {
          error: u
        }
      } finally {
        try {
          !c && !t && (s = d.return) && (yield s.call(d))
        } finally {
          if (n) throw n.error
        }
      }
    })
  }
  setProcessor(e) {
    const t = Object.create(null, {
      setProcessor: {
        get: () => super.setProcessor
      }
    });
    return b(this, arguments, void 0, function(n) {
      var s = this;
      let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
      return function*() {
        var a, o, c, d, l, u;
        if (yield t.setProcessor.call(s, n, r), !((l = s.processor) === null || l === void 0) && l.processedTrack) try {
          for (var h = !0, m = at(s.simulcastCodecs.values()), f; f = yield m.next(), a = f.done, !a; h = !0) d = f.value, h = !1, yield(u = d.sender) === null || u === void 0 ? void 0 : u.replaceTrack(s.processor.processedTrack)
        } catch (p) {
          o = {
            error: p
          }
        } finally {
          try {
            !h && !a && (c = m.return) && (yield c.call(m))
          } finally {
            if (o) throw o.error
          }
        }
      }()
    })
  }
  setDegradationPreference(e) {
    return b(this, void 0, void 0, function*() {
      if (this.degradationPreference = e, this.sender) try {
        this.log.debug("setting degradationPreference to ".concat(e), this.logContext);
        const t = this.sender.getParameters();
        t.degradationPreference = e, this.sender.setParameters(t)
      } catch (t) {
        this.log.warn("failed to set degradationPreference", Object.assign({
          error: t
        }, this.logContext))
      }
    })
  }
  addSimulcastTrack(e, t) {
    if (this.simulcastCodecs.has(e)) {
      this.log.error("".concat(e, " already added, skipping adding simulcast codec"), this.logContext);
      return
    }
    const n = {
      codec: e,
      mediaStreamTrack: this.mediaStreamTrack.clone(),
      sender: void 0,
      encodings: t
    };
    return this.simulcastCodecs.set(e, n), n
  }
  setSimulcastTrackSender(e, t) {
    const n = this.simulcastCodecs.get(e);
    n && (n.sender = t, setTimeout(() => {
      this.subscribedCodecs && this.setPublishingCodecs(this.subscribedCodecs)
    }, vf))
  }
  setPublishingCodecs(e) {
    return b(this, void 0, void 0, function*() {
      var t, n, s, r, a, o, c;
      if (this.log.debug("setting publishing codecs", Object.assign(Object.assign({}, this.logContext), {
          codecs: e,
          currentCodec: this.codec
        })), !this.codec && e.length > 0) return yield this.setPublishingLayers(We(e[0].codec), e[0].qualities), [];
      this.subscribedCodecs = e;
      const d = [];
      try {
        for (t = !0, n = at(e); s = yield n.next(), r = s.done, !r; t = !0) {
          c = s.value, t = !1;
          const l = c;
          if (!this.codec || this.codec === l.codec) yield this.setPublishingLayers(We(l.codec), l.qualities);
          else {
            const u = this.simulcastCodecs.get(l.codec);
            if (this.log.debug("try setPublishingCodec for ".concat(l.codec), Object.assign(Object.assign({}, this.logContext), {
                simulcastCodecInfo: u
              })), !u || !u.sender) {
              for (const h of l.qualities)
                if (h.enabled) {
                  d.push(l.codec);
                  break
                }
            } else u.encodings && (this.log.debug("try setPublishingLayersForSender ".concat(l.codec), this.logContext), yield yo(u.sender, u.encodings, l.qualities, this.senderLock, We(l.codec), this.log, this.logContext))
          }
        }
      } catch (l) {
        a = {
          error: l
        }
      } finally {
        try {
          !t && !r && (o = n.return) && (yield o.call(n))
        } finally {
          if (a) throw a.error
        }
      }
      return d
    })
  }
  setPublishingLayers(e, t) {
    return b(this, void 0, void 0, function*() {
      if (this.optimizeForPerformance) {
        this.log.info("skipping setPublishingLayers due to optimized publishing performance", Object.assign(Object.assign({}, this.logContext), {
          qualities: t
        }));
        return
      }
      this.log.debug("setting publishing layers", Object.assign(Object.assign({}, this.logContext), {
        qualities: t
      })), !(!this.sender || !this.encodings) && (yield yo(this.sender, this.encodings, t, this.senderLock, e, this.log, this.logContext))
    })
  }
  prioritizePerformance() {
    return b(this, void 0, void 0, function*() {
      if (!this.sender) throw new Error("sender not found");
      const e = yield this.senderLock.lock();
      try {
        this.optimizeForPerformance = !0;
        const t = this.sender.getParameters();
        t.encodings = t.encodings.map((n, s) => {
          var r;
          return Object.assign(Object.assign({}, n), {
            active: s === 0,
            scaleResolutionDownBy: Math.max(1, Math.ceil(((r = this.mediaStreamTrack.getSettings().height) !== null && r !== void 0 ? r : 360) / 360)),
            scalabilityMode: s === 0 && We(this.codec) ? "L1T3" : void 0,
            maxFramerate: s === 0 ? 15 : 0,
            maxBitrate: s === 0 ? n.maxBitrate : 0
          })
        }), this.log.debug("setting performance optimised encodings", Object.assign(Object.assign({}, this.logContext), {
          encodings: t.encodings
        })), this.encodings = t.encodings, yield this.sender.setParameters(t)
      } catch (t) {
        this.log.error("failed to set performance optimised encodings", Object.assign(Object.assign({}, this.logContext), {
          error: t
        })), this.optimizeForPerformance = !1
      } finally {
        e()
      }
    })
  }
  handleAppVisibilityChanged() {
    const e = Object.create(null, {
      handleAppVisibilityChanged: {
        get: () => super.handleAppVisibilityChanged
      }
    });
    return b(this, void 0, void 0, function*() {
      yield e.handleAppVisibilityChanged.call(this), Ec() && this.isInBackground && this.source === O.Source.Camera && (this._mediaStreamTrack.enabled = !1)
    })
  }
}

function yo(i, e, t, n, s, r, a) {
  return b(this, void 0, void 0, function*() {
    const o = yield n.lock();
    r.debug("setPublishingLayersForSender", Object.assign(Object.assign({}, a), {
      sender: i,
      qualities: t,
      senderEncodings: e
    }));
    try {
      const c = i.getParameters(),
        {
          encodings: d
        } = c;
      if (!d) return;
      if (d.length !== e.length) {
        r.warn("cannot set publishing layers, encodings mismatch", Object.assign(Object.assign({}, a), {
          encodings: d,
          senderEncodings: e
        }));
        return
      }
      let l = !1;
      !1 && d[0].scalabilityMode || (s && t.some(m => m.enabled) && t.forEach(m => m.enabled = !0), d.forEach((h, m) => {
        var f;
        let p = (f = h.rid) !== null && f !== void 0 ? f : "";
        p === "" && (p = "q");
        const _ = Nc(p),
          w = t.find(k => k.quality === _);
        w && h.active !== w.enabled && (l = !0, h.active = w.enabled, r.debug("setting layer ".concat(w.quality, " to ").concat(h.active ? "enabled" : "disabled"), a), Ot() && (w.enabled ? (h.scaleResolutionDownBy = e[m].scaleResolutionDownBy, h.maxBitrate = e[m].maxBitrate, h.maxFrameRate = e[m].maxFrameRate) : (h.scaleResolutionDownBy = 4, h.maxBitrate = 10, h.maxFrameRate = 2)))
      })), l && (c.encodings = d, r.debug("setting encodings", Object.assign(Object.assign({}, a), {
        encodings: c.encodings
      })), yield i.setParameters(c))
    } finally {
      o()
    }
  })
}

function Nc(i) {
  switch (i) {
    case "f":
      return De.HIGH;
    case "h":
      return De.MEDIUM;
    case "q":
      return De.LOW;
    default:
      return De.HIGH
  }
}

function ko(i, e, t, n) {
  if (!t) return [new bt({
    quality: De.HIGH,
    width: i,
    height: e,
    bitrate: 0,
    ssrc: 0
  })];
  if (n) {
    const s = t[0].scalabilityMode,
      r = new Ac(s),
      a = [],
      o = r.suffix == "h" ? 1.5 : 2,
      c = r.suffix == "h" ? 2 : 3;
    for (let d = 0; d < r.spatial; d += 1) a.push(new bt({
      quality: Math.min(De.HIGH, r.spatial - 1) - d,
      width: Math.ceil(i / Math.pow(o, d)),
      height: Math.ceil(e / Math.pow(o, d)),
      bitrate: t[0].maxBitrate ? Math.ceil(t[0].maxBitrate / Math.pow(c, d)) : 0,
      ssrc: 0
    }));
    return a
  }
  return t.map(s => {
    var r, a, o;
    const c = (r = s.scaleResolutionDownBy) !== null && r !== void 0 ? r : 1;
    let d = Nc((a = s.rid) !== null && a !== void 0 ? a : "");
    return new bt({
      quality: d,
      width: Math.ceil(i / c),
      height: Math.ceil(e / c),
      bitrate: (o = s.maxBitrate) !== null && o !== void 0 ? o : 0,
      ssrc: 0
    })
  })
}
const So = "_lossy",
  To = "_reliable",
  bf = 2 * 1e3,
  Mn = "leave-reconnect",
  yf = 3e4,
  kf = 8 * 1024,
  Sf = 256 * 1024;
var Ae;
(function(i) {
  i[i.New = 0] = "New", i[i.Connected = 1] = "Connected", i[i.Disconnected = 2] = "Disconnected", i[i.Reconnecting = 3] = "Reconnecting", i[i.Closed = 4] = "Closed"
})(Ae || (Ae = {}));
class Tf extends et.EventEmitter {
  get isClosed() {
    return this._isClosed
  }
  get pendingReconnect() {
    return !!this.reconnectTimeout
  }
  constructor(e) {
    var t;
    super(), this.options = e, this.rtcConfig = {}, this.peerConnectionTimeout = zs.peerConnectionTimeout, this.fullReconnectOnNext = !1, this.latestRemoteOfferId = 0, this.subscriberPrimary = !1, this.pcState = Ae.New, this._isClosed = !0, this.pendingTrackResolvers = {}, this.reconnectAttempts = 0, this.reconnectStart = 0, this.attemptingReconnect = !1, this.joinAttempts = 0, this.maxJoinAttempts = 1, this.shouldFailNext = !1, this.log = X, this.reliableDataSequence = 1, this.reliableMessageBuffer = new ao, this.reliableReceivedState = new Vm(yf), this.lossyDataStatCurrentBytes = 0, this.lossyDataStatByterate = 0, this.lossyDataDropCount = 0, this.midToTrackId = {}, this.isWaitingForNetworkReconnect = !1, this.handleDataChannel = n => b(this, [n], void 0, function(s) {
      var r = this;
      let {
        channel: a
      } = s;
      return function*() {
        if (a) {
          if (a.label === To) r.reliableDCSub = a;
          else if (a.label === So) r.lossyDCSub = a;
          else return;
          r.log.debug("on data channel ".concat(a.id, ", ").concat(a.label), r.logContext), a.onmessage = r.handleDataMessage
        }
      }()
    }), this.handleDataMessage = n => b(this, void 0, void 0, function*() {
      var s, r, a, o, c;
      const d = yield this.dataProcessLock.lock();
      try {
        let l;
        if (n.data instanceof ArrayBuffer) l = n.data;
        else if (n.data instanceof Blob) l = yield n.data.arrayBuffer();
        else {
          this.log.error("unsupported data type", Object.assign(Object.assign({}, this.logContext), {
            data: n.data
          }));
          return
        }
        const u = Re.fromBinary(new Uint8Array(l));
        if (u.sequence > 0 && u.participantSid !== "") {
          const h = this.reliableReceivedState.get(u.participantSid);
          if (h && u.sequence <= h) return;
          this.reliableReceivedState.set(u.participantSid, u.sequence)
        }
        if (((s = u.value) === null || s === void 0 ? void 0 : s.case) === "speaker") this.emit(V.ActiveSpeakersUpdate, u.value.value.speakers);
        else if (((r = u.value) === null || r === void 0 ? void 0 : r.case) === "encryptedPacket") {
          if (!this.e2eeManager) {
            this.log.error("Received encrypted packet but E2EE not set up", this.logContext);
            return
          }
          const h = yield(a = this.e2eeManager) === null || a === void 0 ? void 0 : a.handleEncryptedData(u.value.value.encryptedValue, u.value.value.iv, u.participantIdentity, u.value.value.keyIndex), m = ga.fromBinary(h.payload), f = new Re({
            value: m.value,
            participantIdentity: u.participantIdentity,
            participantSid: u.participantSid
          });
          ((o = f.value) === null || o === void 0 ? void 0 : o.case) === "user" && Co(f, f.value.value), this.emit(V.DataPacketReceived, f, u.value.value.encryptionType)
        } else((c = u.value) === null || c === void 0 ? void 0 : c.case) === "user" && Co(u, u.value.value), this.emit(V.DataPacketReceived, u, ge.NONE)
      } finally {
        d()
      }
    }), this.handleDataError = n => {
      const r = n.currentTarget.maxRetransmits === 0 ? "lossy" : "reliable";
      if (n instanceof ErrorEvent && n.error) {
        const {
          error: a
        } = n.error;
        this.log.error("DataChannel error on ".concat(r, ": ").concat(n.message), Object.assign(Object.assign({}, this.logContext), {
          error: a
        }))
      } else this.log.error("Unknown DataChannel error on ".concat(r), Object.assign(Object.assign({}, this.logContext), {
        event: n
      }))
    }, this.handleBufferedAmountLow = n => {
      const r = n.currentTarget.maxRetransmits === 0 ? ee.LOSSY : ee.RELIABLE;
      this.updateAndEmitDCBufferStatus(r)
    }, this.handleDisconnect = (n, s) => {
      if (this._isClosed) return;
      this.log.warn("".concat(n, " disconnected"), this.logContext), this.reconnectAttempts === 0 && (this.reconnectStart = Date.now());
      const r = c => {
          this.log.warn("could not recover connection after ".concat(this.reconnectAttempts, " attempts, ").concat(c, "ms. giving up"), this.logContext), this.emit(V.Disconnected), this.close()
        },
        a = Date.now() - this.reconnectStart;
      let o = this.getNextRetryDelay({
        elapsedMs: a,
        retryCount: this.reconnectAttempts
      });
      if (o === null) {
        r(a);
        return
      }
      n === Mn && (o = 0), this.log.debug("reconnecting in ".concat(o, "ms"), this.logContext), this.clearReconnectTimeout(), this.token && this.regionUrlProvider && this.regionUrlProvider.updateToken(this.token), this.reconnectTimeout = Te.setTimeout(() => this.attemptReconnect(s).finally(() => this.reconnectTimeout = void 0), o)
    }, this.waitForRestarted = () => new Promise((n, s) => {
      this.pcState === Ae.Connected && n();
      const r = () => {
          this.off(V.Disconnected, a), n()
        },
        a = () => {
          this.off(V.Restarted, r), s()
        };
      this.once(V.Restarted, r), this.once(V.Disconnected, a)
    }), this.updateAndEmitDCBufferStatus = n => {
      if (n === ee.RELIABLE) {
        const r = this.dataChannelForKind(n);
        r && this.reliableMessageBuffer.alignBufferedAmount(r.bufferedAmount)
      }
      const s = this.isBufferStatusLow(n);
      typeof s < "u" && s !== this.dcBufferStatus.get(n) && (this.dcBufferStatus.set(n, s), this.emit(V.DCBufferStatusChanged, s, n))
    }, this.isBufferStatusLow = n => {
      const s = this.dataChannelForKind(n);
      if (s) return s.bufferedAmount <= s.bufferedAmountLowThreshold
    }, this.handleBrowserOnLine = () => b(this, void 0, void 0, function*() {
      !this.url || !(yield fetch(bi(this.url), {
        method: "HEAD"
      }).then(s => s.ok).catch(() => !1)) || (this.log.info("detected network reconnected"), (this.client.currentState === ae.RECONNECTING || this.isWaitingForNetworkReconnect && this.client.currentState === ae.CONNECTED) && (this.clearReconnectTimeout(), this.attemptReconnect(Pt.RR_SIGNAL_DISCONNECTED), this.isWaitingForNetworkReconnect = !1))
    }), this.handleBrowserOffline = () => b(this, void 0, void 0, function*() {
      if (this.url) try {
        yield Promise.race([fetch(bi(this.url), {
          method: "HEAD"
        }), Ce(4e3).then(() => Promise.reject())])
      } catch {
        window.navigator.onLine === !1 && (this.log.info("detected network interruption"), this.isWaitingForNetworkReconnect = !0)
      }
    }), this.log = Ye((t = e.loggerName) !== null && t !== void 0 ? t : Ue.Engine), this.loggerOptions = {
      loggerName: e.loggerName,
      loggerContextCb: () => this.logContext
    }, this.client = new Hs(void 0, this.loggerOptions), this.client.signalLatency = this.options.expSignalLatency, this.reconnectPolicy = this.options.reconnectPolicy, this.closingLock = new _e, this.dataProcessLock = new _e, this.dcBufferStatus = new Map([
      [ee.LOSSY, !0],
      [ee.RELIABLE, !0]
    ]), this.client.onParticipantUpdate = n => this.emit(V.ParticipantUpdate, n), this.client.onConnectionQuality = n => this.emit(V.ConnectionQualityUpdate, n), this.client.onRoomUpdate = n => this.emit(V.RoomUpdate, n), this.client.onSubscriptionError = n => this.emit(V.SubscriptionError, n), this.client.onSubscriptionPermissionUpdate = n => this.emit(V.SubscriptionPermissionUpdate, n), this.client.onSpeakersChanged = n => this.emit(V.SpeakersChanged, n), this.client.onStreamStateUpdate = n => this.emit(V.StreamStateChanged, n), this.client.onRequestResponse = n => this.emit(V.SignalRequestResponse, n)
  }
  get logContext() {
    var e, t, n, s, r, a;
    return {
      room: (t = (e = this.latestJoinResponse) === null || e === void 0 ? void 0 : e.room) === null || t === void 0 ? void 0 : t.name,
      roomID: (s = (n = this.latestJoinResponse) === null || n === void 0 ? void 0 : n.room) === null || s === void 0 ? void 0 : s.sid,
      participant: (a = (r = this.latestJoinResponse) === null || r === void 0 ? void 0 : r.participant) === null || a === void 0 ? void 0 : a.identity,
      pID: this.participantSid
    }
  }
  join(e, t, n, s) {
    return b(this, arguments, void 0, function(r, a, o, c) {
      var d = this;
      let l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !1;
      return function*() {
        d.url = r, d.token = a, d.signalOpts = o, d.maxJoinAttempts = o.maxRetries;
        try {
          d.joinAttempts += 1, d.setupSignalClientCallbacks();
          const u = yield d.client.join(r, a, o, c, l);
          return d._isClosed = !1, d.latestJoinResponse = u, d.subscriberPrimary = u.subscriberPrimary, d.pcManager || (yield d.configure(u, !l)), (!d.subscriberPrimary || u.fastPublish) && d.negotiate().catch(h => {
            X.error(h, d.logContext)
          }), d.registerOnLineListener(), d.clientConfiguration = u.clientConfiguration, d.emit(V.SignalConnected, u), u
        } catch (u) {
          if (u instanceof $) {
            if (u.reason === ce.ServerUnreachable) {
              if (d.log.warn("Couldn't connect to server, attempt ".concat(d.joinAttempts, " of ").concat(d.maxJoinAttempts), d.logContext), d.joinAttempts < d.maxJoinAttempts) return d.join(r, a, o, c, l)
            } else if (u.reason === ce.ServiceNotFound) return d.log.warn("Initial connection failed: ".concat(u.message, " – Retrying")), d.join(r, a, o, c, !0)
          }
          throw u
        }
      }()
    })
  }
  close() {
    return b(this, void 0, void 0, function*() {
      const e = yield this.closingLock.lock();
      if (this.isClosed) {
        e();
        return
      }
      try {
        this._isClosed = !0, this.joinAttempts = 0, this.emit(V.Closing), this.removeAllListeners(), this.deregisterOnLineListener(), this.clearPendingReconnect(), this.cleanupLossyDataStats(), yield this.cleanupPeerConnections(), yield this.cleanupClient()
      } finally {
        e()
      }
    })
  }
  cleanupPeerConnections() {
    return b(this, void 0, void 0, function*() {
      var e;
      yield(e = this.pcManager) === null || e === void 0 ? void 0 : e.close(), this.pcManager = void 0;
      const t = n => {
        n && (n.close(), n.onbufferedamountlow = null, n.onclose = null, n.onclosing = null, n.onerror = null, n.onmessage = null, n.onopen = null)
      };
      t(this.lossyDC), t(this.lossyDCSub), t(this.reliableDC), t(this.reliableDCSub), this.lossyDC = void 0, this.lossyDCSub = void 0, this.reliableDC = void 0, this.reliableDCSub = void 0, this.reliableMessageBuffer = new ao, this.reliableDataSequence = 1, this.reliableReceivedState.clear()
    })
  }
  cleanupLossyDataStats() {
    this.lossyDataStatByterate = 0, this.lossyDataStatCurrentBytes = 0, this.lossyDataStatInterval && (clearInterval(this.lossyDataStatInterval), this.lossyDataStatInterval = void 0), this.lossyDataDropCount = 0
  }
  cleanupClient() {
    return b(this, void 0, void 0, function*() {
      yield this.client.close(), this.client.resetCallbacks()
    })
  }
  addTrack(e) {
    if (this.pendingTrackResolvers[e.cid]) throw new ct("a track with the same ID has already been published");
    return new Promise((t, n) => {
      const s = setTimeout(() => {
        delete this.pendingTrackResolvers[e.cid], n($.timeout("publication of local track timed out, no response from server"))
      }, 1e4);
      this.pendingTrackResolvers[e.cid] = {
        resolve: r => {
          clearTimeout(s), t(r)
        },
        reject: () => {
          clearTimeout(s), n(new Error("Cancelled publication by calling unpublish"))
        }
      }, this.client.sendAddTrack(e)
    })
  }
  removeTrack(e) {
    if (e.track && this.pendingTrackResolvers[e.track.id]) {
      const {
        reject: t
      } = this.pendingTrackResolvers[e.track.id];
      t && t(), delete this.pendingTrackResolvers[e.track.id]
    }
    try {
      return this.pcManager.removeTrack(e), !0
    } catch (t) {
      this.log.warn("failed to remove track", Object.assign(Object.assign({}, this.logContext), {
        error: t
      }))
    }
    return !1
  }
  updateMuteStatus(e, t) {
    this.client.sendMuteTrack(e, t)
  }
  get dataSubscriberReadyState() {
    var e;
    return (e = this.reliableDCSub) === null || e === void 0 ? void 0 : e.readyState
  }
  getConnectedServerAddress() {
    return b(this, void 0, void 0, function*() {
      var e;
      return (e = this.pcManager) === null || e === void 0 ? void 0 : e.getConnectedAddress()
    })
  }
  setRegionUrlProvider(e) {
    this.regionUrlProvider = e
  }
  configure(e, t) {
    return b(this, void 0, void 0, function*() {
      var n, s;
      if (this.pcManager && this.pcManager.currentState !== le.NEW) return;
      this.participantSid = (n = e.participant) === null || n === void 0 ? void 0 : n.sid;
      const r = this.makeRTCConfiguration(e);
      this.pcManager = new Qm(r, t ? "publisher-only" : e.subscriberPrimary ? "subscriber-primary" : "publisher-primary", this.loggerOptions), this.emit(V.TransportsCreated, this.pcManager.publisher, this.pcManager.subscriber), this.pcManager.onIceCandidate = (a, o) => {
        this.client.sendIceCandidate(a, o)
      }, this.pcManager.onPublisherOffer = (a, o) => {
        this.client.sendOffer(a, o)
      }, this.pcManager.onDataChannel = this.handleDataChannel, this.pcManager.onStateChange = (a, o, c) => b(this, void 0, void 0, function*() {
        if (this.log.debug("primary PC state changed ".concat(a), this.logContext), ["closed", "disconnected", "failed"].includes(o) && (this.publisherConnectionPromise = void 0), a === le.CONNECTED) {
          const u = this.pcState === Ae.New;
          this.pcState = Ae.Connected, u && this.emit(V.Connected, e)
        } else a === le.FAILED && (this.pcState === Ae.Connected || this.pcState === Ae.Reconnecting) && (this.pcState = Ae.Disconnected, this.handleDisconnect("peerconnection failed", c === "failed" ? Pt.RR_SUBSCRIBER_FAILED : Pt.RR_PUBLISHER_FAILED));
        const d = this.client.isDisconnected || this.client.currentState === ae.RECONNECTING,
          l = [le.FAILED, le.CLOSING, le.CLOSED].includes(a);
        d && l && !this._isClosed && this.emit(V.Offline)
      }), this.pcManager.onTrack = a => {
        a.streams.length !== 0 && this.emit(V.MediaTrackAdded, a.track, a.streams[0], a.receiver)
      }, Cf((s = e.serverInfo) === null || s === void 0 ? void 0 : s.protocol) || this.createDataChannels()
    })
  }
  setupSignalClientCallbacks() {
    this.client.onAnswer = (e, t, n) => b(this, void 0, void 0, function*() {
      this.pcManager && (this.log.debug("received server answer", Object.assign(Object.assign({}, this.logContext), {
        RTCSdpType: e.type,
        sdp: e.sdp,
        midToTrackId: n
      })), this.midToTrackId = n, yield this.pcManager.setPublisherAnswer(e, t))
    }), this.client.onTrickle = (e, t) => {
      this.pcManager && (this.log.debug("got ICE candidate from peer", Object.assign(Object.assign({}, this.logContext), {
        candidate: e,
        target: t
      })), this.pcManager.addIceCandidate(e, t))
    }, this.client.onOffer = (e, t, n) => b(this, void 0, void 0, function*() {
      if (this.latestRemoteOfferId = t, !this.pcManager) return;
      this.midToTrackId = n;
      const s = yield this.pcManager.createSubscriberAnswerFromOffer(e, t);
      s && this.client.sendAnswer(s, t)
    }), this.client.onLocalTrackPublished = e => {
      var t;
      if (this.log.debug("received trackPublishedResponse", Object.assign(Object.assign({}, this.logContext), {
          cid: e.cid,
          track: (t = e.track) === null || t === void 0 ? void 0 : t.sid
        })), !this.pendingTrackResolvers[e.cid]) {
        this.log.error("missing track resolver for ".concat(e.cid), Object.assign(Object.assign({}, this.logContext), {
          cid: e.cid
        }));
        return
      }
      const {
        resolve: n
      } = this.pendingTrackResolvers[e.cid];
      delete this.pendingTrackResolvers[e.cid], n(e.track)
    }, this.client.onLocalTrackUnpublished = e => {
      this.emit(V.LocalTrackUnpublished, e)
    }, this.client.onLocalTrackSubscribed = e => {
      this.emit(V.LocalTrackSubscribed, e)
    }, this.client.onTokenRefresh = e => {
      var t;
      this.token = e, (t = this.regionUrlProvider) === null || t === void 0 || t.updateToken(e)
    }, this.client.onRemoteMuteChanged = (e, t) => {
      this.emit(V.RemoteMute, e, t)
    }, this.client.onSubscribedQualityUpdate = e => {
      this.emit(V.SubscribedQualityUpdate, e)
    }, this.client.onRoomMoved = e => {
      var t;
      this.participantSid = (t = e.participant) === null || t === void 0 ? void 0 : t.sid, this.latestJoinResponse && (this.latestJoinResponse.room = e.room), this.emit(V.RoomMoved, e)
    }, this.client.onMediaSectionsRequirement = e => {
      var t, n;
      const s = {
        direction: "recvonly"
      };
      for (let r = 0; r < e.numAudios; r++)(t = this.pcManager) === null || t === void 0 || t.addPublisherTransceiverOfKind("audio", s);
      for (let r = 0; r < e.numVideos; r++)(n = this.pcManager) === null || n === void 0 || n.addPublisherTransceiverOfKind("video", s);
      this.negotiate()
    }, this.client.onClose = () => {
      this.handleDisconnect("signal", Pt.RR_SIGNAL_DISCONNECTED)
    }, this.client.onLeave = e => {
      switch (this.log.debug("client leave request", Object.assign(Object.assign({}, this.logContext), {
          reason: e == null ? void 0 : e.reason
        })), e.regions && this.regionUrlProvider && (this.log.debug("updating regions", this.logContext), this.regionUrlProvider.setServerReportedRegions({
          updatedAtInMs: Date.now(),
          maxAgeInMs: Mc,
          regionSettings: e.regions
        })), e.action) {
        case qt.DISCONNECT:
          this.emit(V.Disconnected, e == null ? void 0 : e.reason), this.close();
          break;
        case qt.RECONNECT:
          this.fullReconnectOnNext = !0, this.handleDisconnect(Mn);
          break;
        case qt.RESUME:
          this.handleDisconnect(Mn)
      }
    }
  }
  makeRTCConfiguration(e) {
    var t;
    const n = Object.assign({}, this.rtcConfig);
    if (!((t = this.signalOpts) === null || t === void 0) && t.e2eeEnabled && (this.log.debug("E2EE - setting up transports with insertable streams", this.logContext), n.encodedInsertableStreams = !0), e.iceServers && !n.iceServers) {
      const s = [];
      e.iceServers.forEach(r => {
        const a = {
          urls: r.urls
        };
        r.username && (a.username = r.username), r.credential && (a.credential = r.credential), s.push(a)
      }), n.iceServers = s
    }
    return e.clientConfiguration && e.clientConfiguration.forceRelay === mi.ENABLED && (n.iceTransportPolicy = "relay"), n.sdpSemantics = "unified-plan", n.continualGatheringPolicy = "gather_continually", n
  }
  createDataChannels() {
    this.pcManager && (this.lossyDC && (this.lossyDC.onmessage = null, this.lossyDC.onerror = null), this.reliableDC && (this.reliableDC.onmessage = null, this.reliableDC.onerror = null), this.lossyDC = this.pcManager.createPublisherDataChannel(So, {
      ordered: !1,
      maxRetransmits: 0
    }), this.reliableDC = this.pcManager.createPublisherDataChannel(To, {
      ordered: !0
    }), this.lossyDC.onmessage = this.handleDataMessage, this.reliableDC.onmessage = this.handleDataMessage, this.lossyDC.onerror = this.handleDataError, this.reliableDC.onerror = this.handleDataError, this.lossyDC.bufferedAmountLowThreshold = 65535, this.reliableDC.bufferedAmountLowThreshold = 65535, this.lossyDC.onbufferedamountlow = this.handleBufferedAmountLow, this.reliableDC.onbufferedamountlow = this.handleBufferedAmountLow, this.cleanupLossyDataStats(), this.lossyDataStatInterval = setInterval(() => {
      this.lossyDataStatByterate = this.lossyDataStatCurrentBytes, this.lossyDataStatCurrentBytes = 0;
      const e = this.dataChannelForKind(ee.LOSSY);
      if (e) {
        const t = this.lossyDataStatByterate / 10;
        e.bufferedAmountLowThreshold = Math.min(Math.max(t, kf), Sf)
      }
    }, 1e3))
  }
  createSender(e, t, n) {
    return b(this, void 0, void 0, function*() {
      if (os()) return yield this.createTransceiverRTCRtpSender(e, t, n);
      if (as()) return this.log.warn("using add-track fallback", this.logContext), yield this.createRTCRtpSender(e.mediaStreamTrack);
      throw new fe("Required webRTC APIs not supported on this device")
    })
  }
  createSimulcastSender(e, t, n, s) {
    return b(this, void 0, void 0, function*() {
      if (os()) return this.createSimulcastTransceiverSender(e, t, n, s);
      if (as()) return this.log.debug("using add-track fallback", this.logContext), this.createRTCRtpSender(e.mediaStreamTrack);
      throw new fe("Cannot stream on this device")
    })
  }
  createTransceiverRTCRtpSender(e, t, n) {
    return b(this, void 0, void 0, function*() {
      if (!this.pcManager) throw new fe("publisher is closed");
      const s = [];
      e.mediaStream && s.push(e.mediaStream), Ct(e) && (e.codec = t.videoCodec);
      const r = {
        direction: "sendonly",
        streams: s
      };
      return n && (r.sendEncodings = n), (yield this.pcManager.addPublisherTransceiver(e.mediaStreamTrack, r)).sender
    })
  }
  createSimulcastTransceiverSender(e, t, n, s) {
    return b(this, void 0, void 0, function*() {
      if (!this.pcManager) throw new fe("publisher is closed");
      const r = {
        direction: "sendonly"
      };
      s && (r.sendEncodings = s);
      const a = yield this.pcManager.addPublisherTransceiver(t.mediaStreamTrack, r);
      if (n.videoCodec) return e.setSimulcastTrackSender(n.videoCodec, a.sender), a.sender
    })
  }
  createRTCRtpSender(e) {
    return b(this, void 0, void 0, function*() {
      if (!this.pcManager) throw new fe("publisher is closed");
      return this.pcManager.addPublisherTrack(e)
    })
  }
  attemptReconnect(e) {
    return b(this, void 0, void 0, function*() {
      var t, n, s;
      if (!this._isClosed) {
        if (this.attemptingReconnect) {
          X.warn("already attempting reconnect, returning early", this.logContext);
          return
        }(((t = this.clientConfiguration) === null || t === void 0 ? void 0 : t.resumeConnection) === mi.DISABLED || ((s = (n = this.pcManager) === null || n === void 0 ? void 0 : n.currentState) !== null && s !== void 0 ? s : le.NEW) === le.NEW) && (this.fullReconnectOnNext = !0);
        try {
          this.attemptingReconnect = !0, this.fullReconnectOnNext ? yield this.restartConnection(): yield this.resumeConnection(e), this.clearPendingReconnect(), this.fullReconnectOnNext = !1
        } catch (r) {
          this.reconnectAttempts += 1;
          let a = !0;
          r instanceof fe ? (this.log.debug("received unrecoverable error", Object.assign(Object.assign({}, this.logContext), {
            error: r
          })), a = !1) : r instanceof Ut || (this.fullReconnectOnNext = !0), a ? this.handleDisconnect("reconnect", Pt.RR_UNKNOWN) : (this.log.info("could not recover connection after ".concat(this.reconnectAttempts, " attempts, ").concat(Date.now() - this.reconnectStart, "ms. giving up"), this.logContext), this.emit(V.Disconnected), yield this.close())
        } finally {
          this.attemptingReconnect = !1
        }
      }
    })
  }
  getNextRetryDelay(e) {
    try {
      return this.reconnectPolicy.nextRetryDelayInMs(e)
    } catch (t) {
      this.log.warn("encountered error in reconnect policy", Object.assign(Object.assign({}, this.logContext), {
        error: t
      }))
    }
    return null
  }
  restartConnection(e) {
    return b(this, void 0, void 0, function*() {
      var t, n, s;
      try {
        if (!this.url || !this.token) throw new fe("could not reconnect, url or token not saved");
        this.log.info("reconnecting, attempt: ".concat(this.reconnectAttempts), this.logContext), this.emit(V.Restarting), this.client.isDisconnected || (yield this.client.sendLeave()), yield this.cleanupPeerConnections(), yield this.cleanupClient();
        let r;
        try {
          if (!this.signalOpts) throw this.log.warn("attempted connection restart, without signal options present", this.logContext), new Ut;
          r = yield this.join(e ?? this.url, this.token, this.signalOpts, void 0, !this.options.singlePeerConnection)
        } catch (a) {
          throw a instanceof $ && a.reason === ce.NotAllowed ? new fe("could not reconnect, token might be expired") : new Ut
        }
        if (this.shouldFailNext) throw this.shouldFailNext = !1, new Error("simulated failure");
        if (this.client.setReconnected(), this.emit(V.SignalRestarted, r), yield this.waitForPCReconnected(), this.client.currentState !== ae.CONNECTED) throw new Ut("Signal connection got severed during reconnect");
        (t = this.regionUrlProvider) === null || t === void 0 || t.resetAttempts(), this.emit(V.Restarted)
      } catch (r) {
        const a = yield(n = this.regionUrlProvider) === null || n === void 0 ? void 0 : n.getNextBestRegionUrl();
        if (a) {
          yield this.restartConnection(a);
          return
        } else throw (s = this.regionUrlProvider) === null || s === void 0 || s.resetAttempts(), r
      }
    })
  }
  resumeConnection(e) {
    return b(this, void 0, void 0, function*() {
      var t;
      if (!this.url || !this.token) throw new fe("could not reconnect, url or token not saved");
      if (!this.pcManager) throw new fe("publisher and subscriber connections unset");
      this.log.info("resuming signal connection, attempt ".concat(this.reconnectAttempts), this.logContext), this.emit(V.Resuming);
      let n;
      try {
        this.setupSignalClientCallbacks(), n = yield this.client.reconnect(this.url, this.token, this.participantSid, e)
      } catch (s) {
        let r = "";
        throw s instanceof Error && (r = s.message, this.log.error(s.message, Object.assign(Object.assign({}, this.logContext), {
          error: s
        }))), s instanceof $ && s.reason === ce.NotAllowed ? new fe("could not reconnect, token might be expired") : s instanceof $ && s.reason === ce.LeaveRequest ? s : new Ut(r)
      }
      if (this.emit(V.SignalResumed), n) {
        const s = this.makeRTCConfiguration(n);
        this.pcManager.updateConfiguration(s), this.latestJoinResponse && (this.latestJoinResponse.serverInfo = n.serverInfo)
      } else this.log.warn("Did not receive reconnect response", this.logContext);
      if (this.shouldFailNext) throw this.shouldFailNext = !1, new Error("simulated failure");
      if (yield this.pcManager.triggerIceRestart(), yield this.waitForPCReconnected(), this.client.currentState !== ae.CONNECTED) throw new Ut("Signal connection got severed during reconnect");
      this.client.setReconnected(), ((t = this.reliableDC) === null || t === void 0 ? void 0 : t.readyState) === "open" && this.reliableDC.id === null && this.createDataChannels(), n != null && n.lastMessageSeq && this.resendReliableMessagesForResume(n.lastMessageSeq), this.emit(V.Resumed)
    })
  }
  waitForPCInitialConnection(e, t) {
    return b(this, void 0, void 0, function*() {
      if (!this.pcManager) throw new fe("PC manager is closed");
      yield this.pcManager.ensurePCTransportConnection(t, e)
    })
  }
  waitForPCReconnected() {
    return b(this, void 0, void 0, function*() {
      this.pcState = Ae.Reconnecting, this.log.debug("waiting for peer connection to reconnect", this.logContext);
      try {
        if (yield Ce(bf), !this.pcManager) throw new fe("PC manager is closed");
        yield this.pcManager.ensurePCTransportConnection(void 0, this.peerConnectionTimeout), this.pcState = Ae.Connected
      } catch (e) {
        throw this.pcState = Ae.Disconnected, $.internal("could not establish PC connection, ".concat(e.message))
      }
    })
  }
  publishRpcResponse(e, t, n, s) {
    return b(this, void 0, void 0, function*() {
      const r = new Re({
        destinationIdentities: [e],
        kind: ee.RELIABLE,
        value: {
          case: "rpcResponse",
          value: new Os({
            requestId: t,
            value: s ? {
              case: "error",
              value: s.toProto()
            } : {
              case: "payload",
              value: n ?? ""
            }
          })
        }
      });
      yield this.sendDataPacket(r, ee.RELIABLE)
    })
  }
  publishRpcAck(e, t) {
    return b(this, void 0, void 0, function*() {
      const n = new Re({
        destinationIdentities: [e],
        kind: ee.RELIABLE,
        value: {
          case: "rpcAck",
          value: new Ms({
            requestId: t
          })
        }
      });
      yield this.sendDataPacket(n, ee.RELIABLE)
    })
  }
  sendDataPacket(e, t) {
    return b(this, void 0, void 0, function*() {
      if (yield this.ensurePublisherConnected(t), this.e2eeManager && this.e2eeManager.isDataChannelEncryptionEnabled) {
        const r = xm(e);
        if (r) {
          const a = yield this.e2eeManager.encryptData(r.toBinary());
          e.value = {
            case: "encryptedPacket",
            value: new pa({
              encryptedValue: a.payload,
              iv: a.iv,
              keyIndex: a.keyIndex
            })
          }
        }
      }
      t === ee.RELIABLE && (e.sequence = this.reliableDataSequence, this.reliableDataSequence += 1);
      const n = e.toBinary(),
        s = this.dataChannelForKind(t);
      if (s) {
        if (t === ee.RELIABLE) yield this.waitForBufferStatusLow(t), this.reliableMessageBuffer.push({
          data: n,
          sequence: e.sequence
        });
        else {
          if (!this.isBufferStatusLow(t)) {
            this.lossyDataDropCount += 1, this.lossyDataDropCount % 100 === 0 && this.log.warn("dropping lossy data channel messages, total dropped: ".concat(this.lossyDataDropCount), this.logContext);
            return
          }
          this.lossyDataStatCurrentBytes += n.byteLength
        }
        if (this.attemptingReconnect) return;
        s.send(n)
      }
      this.updateAndEmitDCBufferStatus(t)
    })
  }
  resendReliableMessagesForResume(e) {
    return b(this, void 0, void 0, function*() {
      yield this.ensurePublisherConnected(ee.RELIABLE);
      const t = this.dataChannelForKind(ee.RELIABLE);
      t && (this.reliableMessageBuffer.popToSequence(e), this.reliableMessageBuffer.getAll().forEach(n => {
        t.send(n.data)
      })), this.updateAndEmitDCBufferStatus(ee.RELIABLE)
    })
  }
  waitForBufferStatusLow(e) {
    return new Ee((t, n) => b(this, void 0, void 0, function*() {
      if (this.isBufferStatusLow(e)) t();
      else {
        const s = () => n(new fe("engine closed"));
        for (this.once(V.Closing, s); !this.dcBufferStatus.get(e);) yield Ce(10);
        this.off(V.Closing, s), t()
      }
    }))
  }
  ensureDataTransportConnected(e) {
    return b(this, arguments, void 0, function(t) {
      var n = this;
      let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.subscriberPrimary;
      return function*() {
        var r;
        if (!n.pcManager) throw new fe("PC manager is closed");
        const a = s ? n.pcManager.subscriber : n.pcManager.publisher,
          o = s ? "Subscriber" : "Publisher";
        if (!a) throw $.internal("".concat(o, " connection not set"));
        let c = !1;
        !s && !n.dataChannelForKind(t, s) && (n.createDataChannels(), c = !0), !c && !s && !n.pcManager.publisher.isICEConnected && n.pcManager.publisher.getICEConnectionState() !== "checking" && (c = !0), c && n.negotiate().catch(u => {
          X.error(u, n.logContext)
        });
        const d = n.dataChannelForKind(t, s);
        if ((d == null ? void 0 : d.readyState) === "open") return;
        const l = new Date().getTime() + n.peerConnectionTimeout;
        for (; new Date().getTime() < l;) {
          if (a.isICEConnected && ((r = n.dataChannelForKind(t, s)) === null || r === void 0 ? void 0 : r.readyState) === "open") return;
          yield Ce(50)
        }
        throw $.internal("could not establish ".concat(o, " connection, state: ").concat(a.getICEConnectionState()))
      }()
    })
  }
  ensurePublisherConnected(e) {
    return b(this, void 0, void 0, function*() {
      this.publisherConnectionPromise || (this.publisherConnectionPromise = this.ensureDataTransportConnected(e, !1)), yield this.publisherConnectionPromise
    })
  }
  verifyTransport() {
    return !(!this.pcManager || ![le.CONNECTING, le.CONNECTED].includes(this.pcManager.currentState) || !this.client.ws || this.client.ws.readyState === WebSocket.CLOSED)
  }
  negotiate() {
    return b(this, void 0, void 0, function*() {
      return new Ee((e, t) => b(this, void 0, void 0, function*() {
        if (!this.pcManager) {
          t(new _t("PC manager is closed"));
          return
        }
        this.pcManager.requirePublisher(), this.pcManager.publisher.getTransceivers().length == 0 && !this.lossyDC && !this.reliableDC && this.createDataChannels();
        const n = new AbortController,
          s = () => {
            n.abort(), this.log.debug("engine disconnected while negotiation was ongoing", this.logContext), e()
          };
        this.isClosed && t(new _t("cannot negotiate on closed engine")), this.on(V.Closing, s), this.on(V.Restarting, s), this.pcManager.publisher.once(xt.RTPVideoPayloadTypes, r => {
          const a = new Map;
          r.forEach(o => {
            const c = o.codec.toLowerCase();
            mm(c) && a.set(o.payload, c)
          }), this.emit(V.RTPVideoMapUpdate, a)
        });
        try {
          yield this.pcManager.negotiate(n), e()
        } catch (r) {
          if (n.signal.aborted) {
            e();
            return
          }
          r instanceof _t && (this.fullReconnectOnNext = !0), this.handleDisconnect("negotiation", Pt.RR_UNKNOWN), r instanceof Error ? t(r) : t(new Error(String(r)))
        } finally {
          this.off(V.Closing, s), this.off(V.Restarting, s)
        }
      }))
    })
  }
  dataChannelForKind(e, t) {
    if (t) {
      if (e === ee.LOSSY) return this.lossyDCSub;
      if (e === ee.RELIABLE) return this.reliableDCSub
    } else {
      if (e === ee.LOSSY) return this.lossyDC;
      if (e === ee.RELIABLE) return this.reliableDC
    }
  }
  sendSyncState(e, t) {
    var n, s, r, a;
    if (!this.pcManager) {
      this.log.warn("sync state cannot be sent without peer connection setup", this.logContext);
      return
    }
    const o = this.pcManager.publisher.getLocalDescription(),
      c = this.pcManager.publisher.getRemoteDescription(),
      d = (n = this.pcManager.subscriber) === null || n === void 0 ? void 0 : n.getRemoteDescription(),
      l = (s = this.pcManager.subscriber) === null || s === void 0 ? void 0 : s.getLocalDescription(),
      u = (a = (r = this.signalOpts) === null || r === void 0 ? void 0 : r.autoSubscribe) !== null && a !== void 0 ? a : !0,
      h = new Array,
      m = new Array;
    e.forEach(f => {
      f.isDesired !== u && h.push(f.trackSid), f.isEnabled || m.push(f.trackSid)
    }), this.client.sendSyncState(new Us({
      answer: this.pcManager.mode === "publisher-only" ? c ? Bt({
        sdp: c.sdp,
        type: c.type
      }) : void 0 : l ? Bt({
        sdp: l.sdp,
        type: l.type
      }) : void 0,
      offer: this.pcManager.mode === "publisher-only" ? o ? Bt({
        sdp: o.sdp,
        type: o.type
      }) : void 0 : d ? Bt({
        sdp: d.sdp,
        type: d.type
      }) : void 0,
      subscription: new an({
        trackSids: h,
        subscribe: !u,
        participantTracks: []
      }),
      publishTracks: Qh(t),
      dataChannels: this.dataChannelsInfo(),
      trackSidsDisabled: m,
      datachannelReceiveStates: this.reliableReceivedState.map((f, p) => new ja({
        publisherSid: p,
        lastSeq: f
      }))
    }))
  }
  failNext() {
    this.shouldFailNext = !0
  }
  dataChannelsInfo() {
    const e = [],
      t = (n, s) => {
        (n == null ? void 0 : n.id) !== void 0 && n.id !== null && e.push(new Fa({
          label: n.label,
          id: n.id,
          target: s
        }))
      };
    return t(this.dataChannelForKind(ee.LOSSY), qe.PUBLISHER), t(this.dataChannelForKind(ee.RELIABLE), qe.PUBLISHER), t(this.dataChannelForKind(ee.LOSSY, !0), qe.SUBSCRIBER), t(this.dataChannelForKind(ee.RELIABLE, !0), qe.SUBSCRIBER), e
  }
  clearReconnectTimeout() {
    this.reconnectTimeout && Te.clearTimeout(this.reconnectTimeout)
  }
  clearPendingReconnect() {
    this.clearReconnectTimeout(), this.reconnectAttempts = 0
  }
  registerOnLineListener() {
    Me() && (window.addEventListener("online", this.handleBrowserOnLine), window.addEventListener("offline", this.handleBrowserOffline))
  }
  deregisterOnLineListener() {
    Me() && (window.removeEventListener("online", this.handleBrowserOnLine), window.removeEventListener("offline", this.handleBrowserOffline))
  }
  getTrackIdForReceiver(e) {
    var t;
    const n = (t = this.pcManager) === null || t === void 0 ? void 0 : t.getMidForReceiver(e);
    if (n) {
      const s = Object.entries(this.midToTrackId).find(r => {
        let [a] = r;
        return a === n
      });
      if (s) return s[1]
    }
  }
}




class Lc {
  get info() {
    return this._info
  }
  validateBytesReceived() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !1;
    if (!(typeof this.totalByteSize != "number" || this.totalByteSize === 0)) {
      if (e && this.bytesReceived < this.totalByteSize) throw new Ne("Not enough chunk(s) received - expected ".concat(this.totalByteSize, " bytes of data total, only received ").concat(this.bytesReceived, " bytes"), Pe.Incomplete);
      if (this.bytesReceived > this.totalByteSize) throw new Ne("Extra chunk(s) received - expected ".concat(this.totalByteSize, " bytes of data total, received ").concat(this.bytesReceived, " bytes"), Pe.LengthExceeded)
    }
  }
  constructor(e, t, n, s) {
    this.reader = t, this.totalByteSize = n, this._info = e, this.bytesReceived = 0, this.outOfBandFailureRejectingFuture = s
  }
}
class wf extends Lc {
  handleChunkReceived(e) {
    var t;
    this.bytesReceived += e.content.byteLength, this.validateBytesReceived();
    const n = this.totalByteSize ? this.bytesReceived / this.totalByteSize : void 0;
    (t = this.onProgress) === null || t === void 0 || t.call(this, n)
  } [Symbol.asyncIterator]() {
    const e = this.reader.getReader();
    let t = new Le,
      n = null,
      s = null;
    if (this.signal) {
      const a = this.signal;
      s = () => {
        var o;
        (o = t.reject) === null || o === void 0 || o.call(t, a.reason)
      }, a.addEventListener("abort", s), n = a
    }
    const r = () => {
      e.releaseLock(), n && s && n.removeEventListener("abort", s), this.signal = void 0
    };
    return {
      next: () => b(this, void 0, void 0, function*() {
        var a, o;
        try {
          const {
            done: c,
            value: d
          } = yield Promise.race([e.read(), t.promise, (o = (a = this.outOfBandFailureRejectingFuture) === null || a === void 0 ? void 0 : a.promise) !== null && o !== void 0 ? o : new Promise(() => {})]);
          return c ? (this.validateBytesReceived(!0), {
            done: !0,
            value: void 0
          }) : (this.handleChunkReceived(d), {
            done: !1,
            value: d.content
          })
        } catch (c) {
          throw r(), c
        }
      }),
      return () {
        return b(this, void 0, void 0, function*() {
          return r(), {
            done: !0,
            value: void 0
          }
        })
      }
    }
  }
  withAbortSignal(e) {
    return this.signal = e, this
  }
  readAll() {
    return b(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      return function*() {
        var n, s, r, a;
        let o = new Set;
        const c = t.signal ? e.withAbortSignal(t.signal) : e;
        try {
          for (var d = !0, l = at(c), u; u = yield l.next(), n = u.done, !n; d = !0) {
            a = u.value, d = !1;
            const h = a;
            o.add(h)
          }
        } catch (h) {
          s = {
            error: h
          }
        } finally {
          try {
            !d && !n && (r = l.return) && (yield r.call(l))
          } finally {
            if (s) throw s.error
          }
        }
        return Array.from(o)
      }()
    })
  }
}
class Ef extends Lc {
  constructor(e, t, n, s) {
    super(e, t, n, s), this.receivedChunks = new Map
  }
  handleChunkReceived(e) {
    var t;
    const n = Fi(e.chunkIndex),
      s = this.receivedChunks.get(n);
    if (s && s.version > e.version) return;
    this.receivedChunks.set(n, e), this.bytesReceived += e.content.byteLength, this.validateBytesReceived();
    const r = this.totalByteSize ? this.bytesReceived / this.totalByteSize : void 0;
    (t = this.onProgress) === null || t === void 0 || t.call(this, r)
  } [Symbol.asyncIterator]() {
    const e = this.reader.getReader(),
      t = new TextDecoder("utf-8", {
        fatal: !0
      });
    let n = new Le,
      s = null,
      r = null;
    if (this.signal) {
      const o = this.signal;
      r = () => {
        var c;
        (c = n.reject) === null || c === void 0 || c.call(n, o.reason)
      }, o.addEventListener("abort", r), s = o
    }
    const a = () => {
      e.releaseLock(), s && r && s.removeEventListener("abort", r), this.signal = void 0
    };
    return {
      next: () => b(this, void 0, void 0, function*() {
        var o, c;
        try {
          const {
            done: d,
            value: l
          } = yield Promise.race([e.read(), n.promise, (c = (o = this.outOfBandFailureRejectingFuture) === null || o === void 0 ? void 0 : o.promise) !== null && c !== void 0 ? c : new Promise(() => {})]);
          if (d) return this.validateBytesReceived(!0), {
            done: !0,
            value: void 0
          };
          {
            this.handleChunkReceived(l);
            let u;
            try {
              u = t.decode(l.content)
            } catch (h) {
              throw new Ne("Cannot decode datastream chunk ".concat(l.chunkIndex, " as text: ").concat(h), Pe.DecodeFailed)
            }
            return {
              done: !1,
              value: u
            }
          }
        } catch (d) {
          throw a(), d
        }
      }),
      return () {
        return b(this, void 0, void 0, function*() {
          return a(), {
            done: !0,
            value: void 0
          }
        })
      }
    }
  }
  withAbortSignal(e) {
    return this.signal = e, this
  }
  readAll() {
    return b(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      return function*() {
        var n, s, r, a;
        let o = "";
        const c = t.signal ? e.withAbortSignal(t.signal) : e;
        try {
          for (var d = !0, l = at(c), u; u = yield l.next(), n = u.done, !n; d = !0) a = u.value, d = !1, o += a
        } catch (h) {
          s = {
            error: h
          }
        } finally {
          try {
            !d && !n && (r = l.return) && (yield r.call(l))
          } finally {
            if (s) throw s.error
          }
        }
        return o
      }()
    })
  }
}
class Pf {
  constructor() {
    this.log = X, this.byteStreamControllers = new Map, this.textStreamControllers = new Map, this.byteStreamHandlers = new Map, this.textStreamHandlers = new Map
  }
  registerTextStreamHandler(e, t) {
    if (this.textStreamHandlers.has(e)) throw new Ne('A text stream handler for topic "'.concat(e, '" has already been set.'), Pe.HandlerAlreadyRegistered);
    this.textStreamHandlers.set(e, t)
  }
  unregisterTextStreamHandler(e) {
    this.textStreamHandlers.delete(e)
  }
  registerByteStreamHandler(e, t) {
    if (this.byteStreamHandlers.has(e)) throw new Ne('A byte stream handler for topic "'.concat(e, '" has already been set.'), Pe.HandlerAlreadyRegistered);
    this.byteStreamHandlers.set(e, t)
  }
  unregisterByteStreamHandler(e) {
    this.byteStreamHandlers.delete(e)
  }
  clearControllers() {
    this.byteStreamControllers.clear(), this.textStreamControllers.clear()
  }
  validateParticipantHasNoActiveDataStreams(e) {
    var t, n, s, r;
    const a = Array.from(this.textStreamControllers.entries()).filter(c => c[1].sendingParticipantIdentity === e),
      o = Array.from(this.byteStreamControllers.entries()).filter(c => c[1].sendingParticipantIdentity === e);
    if (a.length > 0 || o.length > 0) {
      const c = new Ne("Participant ".concat(e, " unexpectedly disconnected in the middle of sending data"), Pe.AbnormalEnd);
      for (const [d, l] of o)(n = (t = l.outOfBandFailureRejectingFuture).reject) === null || n === void 0 || n.call(t, c), this.byteStreamControllers.delete(d);
      for (const [d, l] of a)(r = (s = l.outOfBandFailureRejectingFuture).reject) === null || r === void 0 || r.call(s, c), this.textStreamControllers.delete(d)
    }
  }
  handleDataStreamPacket(e, t) {
    return b(this, void 0, void 0, function*() {
      switch (e.value.case) {
        case "streamHeader":
          return this.handleStreamHeader(e.value.value, e.participantIdentity, t);
        case "streamChunk":
          return this.handleStreamChunk(e.value.value, t);
        case "streamTrailer":
          return this.handleStreamTrailer(e.value.value, t);
        default:
          throw new Error('DataPacket of value "'.concat(e.value.case, '" is not data stream related!'))
      }
    })
  }
  handleStreamHeader(e, t, n) {
    return b(this, void 0, void 0, function*() {
      var s;
      if (e.contentHeader.case === "byteHeader") {
        const r = this.byteStreamHandlers.get(e.topic);
        if (!r) {
          this.log.debug("ignoring incoming byte stream due to no handler for topic", e.topic);
          return
        }
        let a;
        const o = new Le;
        o.promise.catch(l => {
          this.log.error(l)
        });
        const c = {
            id: e.streamId,
            name: (s = e.contentHeader.value.name) !== null && s !== void 0 ? s : "unknown",
            mimeType: e.mimeType,
            size: e.totalLength ? Number(e.totalLength) : void 0,
            topic: e.topic,
            timestamp: Fi(e.timestamp),
            attributes: e.attributes,
            encryptionType: n
          },
          d = new ReadableStream({
            start: l => {
              if (a = l, this.textStreamControllers.has(e.streamId)) throw new Ne("A data stream read is already in progress for a stream with id ".concat(e.streamId, "."), Pe.AlreadyOpened);
              this.byteStreamControllers.set(e.streamId, {
                info: c,
                controller: a,
                startTime: Date.now(),
                sendingParticipantIdentity: t,
                outOfBandFailureRejectingFuture: o
              })
            }
          });
        r(new wf(c, d, Fi(e.totalLength), o), {
          identity: t
        })
      } else if (e.contentHeader.case === "textHeader") {
        const r = this.textStreamHandlers.get(e.topic);
        if (!r) {
          this.log.debug("ignoring incoming text stream due to no handler for topic", e.topic);
          return
        }
        let a;
        const o = new Le;
        o.promise.catch(l => {
          this.log.error(l)
        });
        const c = {
            id: e.streamId,
            mimeType: e.mimeType,
            size: e.totalLength ? Number(e.totalLength) : void 0,
            topic: e.topic,
            timestamp: Number(e.timestamp),
            attributes: e.attributes,
            encryptionType: n,
            attachedStreamIds: e.contentHeader.value.attachedStreamIds
          },
          d = new ReadableStream({
            start: l => {
              if (a = l, this.textStreamControllers.has(e.streamId)) throw new Ne("A data stream read is already in progress for a stream with id ".concat(e.streamId, "."), Pe.AlreadyOpened);
              this.textStreamControllers.set(e.streamId, {
                info: c,
                controller: a,
                startTime: Date.now(),
                sendingParticipantIdentity: t,
                outOfBandFailureRejectingFuture: o
              })
            }
          });
        r(new Ef(c, d, Fi(e.totalLength), o), {
          identity: t
        })
      }
    })
  }
  handleStreamChunk(e, t) {
    const n = this.byteStreamControllers.get(e.streamId);
    n && (n.info.encryptionType !== t ? (n.controller.error(new Ne("Encryption type mismatch for stream ".concat(e.streamId, ". Expected ").concat(t, ", got ").concat(n.info.encryptionType), Pe.EncryptionTypeMismatch)), this.byteStreamControllers.delete(e.streamId)) : e.content.length > 0 && n.controller.enqueue(e));
    const s = this.textStreamControllers.get(e.streamId);
    s && (s.info.encryptionType !== t ? (s.controller.error(new Ne("Encryption type mismatch for stream ".concat(e.streamId, ". Expected ").concat(t, ", got ").concat(s.info.encryptionType), Pe.EncryptionTypeMismatch)), this.textStreamControllers.delete(e.streamId)) : e.content.length > 0 && s.controller.enqueue(e))
  }
  handleStreamTrailer(e, t) {
    const n = this.textStreamControllers.get(e.streamId);
    n && (n.info.encryptionType !== t ? n.controller.error(new Ne("Encryption type mismatch for stream ".concat(e.streamId, ". Expected ").concat(t, ", got ").concat(n.info.encryptionType), Pe.EncryptionTypeMismatch)) : (n.info.attributes = Object.assign(Object.assign({}, n.info.attributes), e.attributes), n.controller.close(), this.textStreamControllers.delete(e.streamId)));
    const s = this.byteStreamControllers.get(e.streamId);
    s && (s.info.encryptionType !== t ? s.controller.error(new Ne("Encryption type mismatch for stream ".concat(e.streamId, ". Expected ").concat(t, ", got ").concat(s.info.encryptionType), Pe.EncryptionTypeMismatch)) : (s.info.attributes = Object.assign(Object.assign({}, s.info.attributes), e.attributes), s.controller.close()), this.byteStreamControllers.delete(e.streamId))
  }
}
class Uc {
  constructor(e, t, n) {
    this.writableStream = e, this.defaultWriter = e.getWriter(), this.onClose = n, this.info = t
  }
  write(e) {
    return this.defaultWriter.write(e)
  }
  close() {
    return b(this, void 0, void 0, function*() {
      var e;
      yield this.defaultWriter.close(), this.defaultWriter.releaseLock(), (e = this.onClose) === null || e === void 0 || e.call(this)
    })
  }
}
class Rf extends Uc {}
class _f extends Uc {}
const wo = 15e3;
class If {
  constructor(e, t) {
    this.engine = e, this.log = t
  }
  setupEngine(e) {
    this.engine = e
  }
  sendText(e, t) {
    return b(this, void 0, void 0, function*() {
      var n;
      const s = crypto.randomUUID(),
        a = new TextEncoder().encode(e).byteLength,
        o = (n = t == null ? void 0 : t.attachments) === null || n === void 0 ? void 0 : n.map(() => crypto.randomUUID()),
        c = new Array(o ? o.length + 1 : 1).fill(0),
        d = (u, h) => {
          var m;
          c[h] = u;
          const f = c.reduce((p, _) => p + _, 0);
          (m = t == null ? void 0 : t.onProgress) === null || m === void 0 || m.call(t, f)
        },
        l = yield this.streamText({
          streamId: s,
          totalSize: a,
          destinationIdentities: t == null ? void 0 : t.destinationIdentities,
          topic: t == null ? void 0 : t.topic,
          attachedStreamIds: o,
          attributes: t == null ? void 0 : t.attributes
        });
      return yield l.write(e), d(1, 0), yield l.close(), t != null && t.attachments && o && (yield Promise.all(t.attachments.map((u, h) => b(this, void 0, void 0, function*() {
        return this._sendFile(o[h], u, {
          topic: t.topic,
          mimeType: u.type,
          onProgress: m => {
            d(m, h + 1)
          }
        })
      })))), l.info
    })
  }
  streamText(e) {
    return b(this, void 0, void 0, function*() {
      var t, n, s;
      const r = (t = e == null ? void 0 : e.streamId) !== null && t !== void 0 ? t : crypto.randomUUID(),
        a = {
          id: r,
          mimeType: "text/plain",
          timestamp: Date.now(),
          topic: (n = e == null ? void 0 : e.topic) !== null && n !== void 0 ? n : "",
          size: e == null ? void 0 : e.totalSize,
          attributes: e == null ? void 0 : e.attributes,
          encryptionType: !((s = this.engine.e2eeManager) === null || s === void 0) && s.isDataChannelEncryptionEnabled ? ge.GCM : ge.NONE,
          attachedStreamIds: e == null ? void 0 : e.attachedStreamIds
        },
        o = new Ki({
          streamId: r,
          mimeType: a.mimeType,
          topic: a.topic,
          timestamp: Rt(a.timestamp),
          totalLength: Rt(e == null ? void 0 : e.totalSize),
          attributes: a.attributes,
          contentHeader: {
            case: "textHeader",
            value: new Ra({
              version: e == null ? void 0 : e.version,
              attachedStreamIds: a.attachedStreamIds,
              replyToStreamId: e == null ? void 0 : e.replyToStreamId,
              operationType: (e == null ? void 0 : e.type) === "update" ? Kn.UPDATE : Kn.CREATE
            })
          }
        }),
        c = e == null ? void 0 : e.destinationIdentities,
        d = new Re({
          destinationIdentities: c,
          value: {
            case: "streamHeader",
            value: o
          }
        });
      yield this.engine.sendDataPacket(d, ee.RELIABLE);
      let l = 0;
      const u = this.engine,
        h = new WritableStream({
          write(p) {
            return b(this, void 0, void 0, function*() {
              for (const _ of ym(p, wo)) {
                const w = new Gi({
                    content: _,
                    streamId: r,
                    chunkIndex: Rt(l)
                  }),
                  k = new Re({
                    destinationIdentities: c,
                    value: {
                      case: "streamChunk",
                      value: w
                    }
                  });
                yield u.sendDataPacket(k, ee.RELIABLE), l += 1
              }
            })
          },
          close() {
            return b(this, void 0, void 0, function*() {
              const p = new Ji({
                  streamId: r
                }),
                _ = new Re({
                  destinationIdentities: c,
                  value: {
                    case: "streamTrailer",
                    value: p
                  }
                });
              yield u.sendDataPacket(_, ee.RELIABLE)
            })
          },
          abort(p) {
            console.log("Sink error:", p)
          }
        });
      let m = () => b(this, void 0, void 0, function*() {
        yield f.close()
      });
      u.once(V.Closing, m);
      const f = new Rf(h, a, () => this.engine.off(V.Closing, m));
      return f
    })
  }
  sendFile(e, t) {
    return b(this, void 0, void 0, function*() {
      const n = crypto.randomUUID();
      return yield this._sendFile(n, e, t), {
        id: n
      }
    })
  }
  _sendFile(e, t, n) {
    return b(this, void 0, void 0, function*() {
      var s;
      const r = yield this.streamBytes({
        streamId: e,
        totalSize: t.size,
        name: t.name,
        mimeType: (s = n == null ? void 0 : n.mimeType) !== null && s !== void 0 ? s : t.type,
        topic: n == null ? void 0 : n.topic,
        destinationIdentities: n == null ? void 0 : n.destinationIdentities
      }), a = t.stream().getReader();
      for (;;) {
        const {
          done: o,
          value: c
        } = yield a.read();
        if (o) break;
        yield r.write(c)
      }
      return yield r.close(), r.info
    })
  }
  streamBytes(e) {
    return b(this, void 0, void 0, function*() {
      var t, n, s, r, a, o;
      const c = (t = e == null ? void 0 : e.streamId) !== null && t !== void 0 ? t : crypto.randomUUID(),
        d = e == null ? void 0 : e.destinationIdentities,
        l = {
          id: c,
          mimeType: (n = e == null ? void 0 : e.mimeType) !== null && n !== void 0 ? n : "application/octet-stream",
          topic: (s = e == null ? void 0 : e.topic) !== null && s !== void 0 ? s : "",
          timestamp: Date.now(),
          attributes: e == null ? void 0 : e.attributes,
          size: e == null ? void 0 : e.totalSize,
          name: (r = e == null ? void 0 : e.name) !== null && r !== void 0 ? r : "unknown",
          encryptionType: !((a = this.engine.e2eeManager) === null || a === void 0) && a.isDataChannelEncryptionEnabled ? ge.GCM : ge.NONE
        },
        u = new Ki({
          totalLength: Rt((o = l.size) !== null && o !== void 0 ? o : 0),
          mimeType: l.mimeType,
          streamId: c,
          topic: l.topic,
          timestamp: Rt(Date.now()),
          attributes: l.attributes,
          contentHeader: {
            case: "byteHeader",
            value: new _a({
              name: l.name
            })
          }
        }),
        h = new Re({
          destinationIdentities: d,
          value: {
            case: "streamHeader",
            value: u
          }
        });
      yield this.engine.sendDataPacket(h, ee.RELIABLE);
      let m = 0;
      const f = new _e,
        p = this.engine,
        _ = this.log,
        w = new WritableStream({
          write(P) {
            return b(this, void 0, void 0, function*() {
              const y = yield f.lock();
              let S = 0;
              try {
                for (; S < P.byteLength;) {
                  const E = P.slice(S, S + wo),
                    x = new Re({
                      destinationIdentities: d,
                      value: {
                        case: "streamChunk",
                        value: new Gi({
                          content: E,
                          streamId: c,
                          chunkIndex: Rt(m)
                        })
                      }
                    });
                  yield p.sendDataPacket(x, ee.RELIABLE), m += 1, S += E.byteLength
                }
              } finally {
                y()
              }
            })
          },
          close() {
            return b(this, void 0, void 0, function*() {
              const P = new Ji({
                  streamId: c
                }),
                y = new Re({
                  destinationIdentities: d,
                  value: {
                    case: "streamTrailer",
                    value: P
                  }
                });
              yield p.sendDataPacket(y, ee.RELIABLE)
            })
          },
          abort(P) {
            _.error("Sink error:", P)
          }
        });
      return new _f(w, l)
    })
  }
}
class jc extends O {
  constructor(e, t, n, s, r) {
    super(e, n, r), this.sid = t, this.receiver = s
  }
  get isLocal() {
    return !1
  }
  setMuted(e) {
    this.isMuted !== e && (this.isMuted = e, this._mediaStreamTrack.enabled = !e, this.emit(e ? B.Muted : B.Unmuted, this))
  }
  setMediaStream(e) {
    this.mediaStream = e;
    const t = n => {
      n.track === this._mediaStreamTrack && (e.removeEventListener("removetrack", t), this.receiver && "playoutDelayHint" in this.receiver && (this.receiver.playoutDelayHint = void 0), this.receiver = void 0, this._currentBitrate = 0, this.emit(B.Ended, this))
    };
    e.addEventListener("removetrack", t)
  }
  start() {
    this.startMonitor(), super.enable()
  }
  stop() {
    this.stopMonitor(), super.disable()
  }
  getRTCStatsReport() {
    return b(this, void 0, void 0, function*() {
      var e;
      return !((e = this.receiver) === null || e === void 0) && e.getStats ? yield this.receiver.getStats(): void 0
    })
  }
  setPlayoutDelay(e) {
    this.receiver ? "playoutDelayHint" in this.receiver ? this.receiver.playoutDelayHint = e : this.log.warn("Playout delay not supported in this browser") : this.log.warn("Cannot set playout delay, track already ended")
  }
  getPlayoutDelay() {
    if (this.receiver) {
      if ("playoutDelayHint" in this.receiver) return this.receiver.playoutDelayHint;
      this.log.warn("Playout delay not supported in this browser")
    } else this.log.warn("Cannot get playout delay, track already ended");
    return 0
  }
  startMonitor() {
    this.monitorInterval || (this.monitorInterval = setInterval(() => this.monitorReceiver(), Qs)), Yh() && this.registerTimeSyncUpdate()
  }
  registerTimeSyncUpdate() {
    const e = () => {
      var t;
      this.timeSyncHandle = requestAnimationFrame(() => e());
      const n = (t = this.receiver) === null || t === void 0 ? void 0 : t.getSynchronizationSources()[0];
      if (n) {
        const {
          timestamp: s,
          rtpTimestamp: r
        } = n;
        r && this.rtpTimestamp !== r && (this.emit(B.TimeSyncUpdate, {
          timestamp: s,
          rtpTimestamp: r
        }), this.rtpTimestamp = r)
      }
    };
    e()
  }
}
class xf extends jc {
  constructor(e, t, n, s, r, a) {
    super(e, t, O.Kind.Audio, n, a), this.monitorReceiver = () => b(this, void 0, void 0, function*() {
      if (!this.receiver) {
        this._currentBitrate = 0;
        return
      }
      const o = yield this.getReceiverStats();
      o && this.prevStats && this.receiver && (this._currentBitrate = un(o, this.prevStats)), this.prevStats = o
    }), this.audioContext = s, this.webAudioPluginNodes = [], r && (this.sinkId = r.deviceId)
  }
  setVolume(e) {
    var t;
    for (const n of this.attachedElements) this.audioContext ? (t = this.gainNode) === null || t === void 0 || t.gain.setTargetAtTime(e, 0, .1) : n.volume = e;
    Xe() && this._mediaStreamTrack._setVolume(e), this.elementVolume = e
  }
  getVolume() {
    if (this.elementVolume) return this.elementVolume;
    if (Xe()) return 1;
    let e = 0;
    return this.attachedElements.forEach(t => {
      t.volume > e && (e = t.volume)
    }), e
  }
  setSinkId(e) {
    return b(this, void 0, void 0, function*() {
      this.sinkId = e, yield Promise.all(this.attachedElements.map(t => {
        if (cs(t)) return t.setSinkId(e)
      }))
    })
  }
  attach(e) {
    const t = this.attachedElements.length === 0;
    return e ? super.attach(e) : e = super.attach(), this.sinkId && cs(e) && e.setSinkId(this.sinkId).catch(n => {
      this.log.error("Failed to set sink id on remote audio track", n, this.logContext)
    }), this.audioContext && t && (this.log.debug("using audio context mapping", this.logContext), this.connectWebAudio(this.audioContext, e), e.volume = 0, e.muted = !0), this.elementVolume && this.setVolume(this.elementVolume), e
  }
  detach(e) {
    let t;
    return e ? (t = super.detach(e), this.audioContext && (this.attachedElements.length > 0 ? this.connectWebAudio(this.audioContext, this.attachedElements[0]) : this.disconnectWebAudio())) : (t = super.detach(), this.disconnectWebAudio()), t
  }
  setAudioContext(e) {
    this.audioContext = e, e && this.attachedElements.length > 0 ? this.connectWebAudio(e, this.attachedElements[0]) : e || this.disconnectWebAudio()
  }
  setWebAudioPlugins(e) {
    this.webAudioPluginNodes = e, this.attachedElements.length > 0 && this.audioContext && this.connectWebAudio(this.audioContext, this.attachedElements[0])
  }
  connectWebAudio(e, t) {
    this.disconnectWebAudio(), this.sourceNode = e.createMediaStreamSource(t.srcObject);
    let n = this.sourceNode;
    this.webAudioPluginNodes.forEach(s => {
      n.connect(s), n = s
    }), this.gainNode = e.createGain(), n.connect(this.gainNode), this.gainNode.connect(e.destination), this.elementVolume && this.gainNode.gain.setTargetAtTime(this.elementVolume, 0, .1), e.state !== "running" && e.resume().then(() => {
      e.state !== "running" && this.emit(B.AudioPlaybackFailed, new Error("Audio Context couldn't be started automatically"))
    }).catch(s => {
      this.emit(B.AudioPlaybackFailed, s)
    })
  }
  disconnectWebAudio() {
    var e, t;
    (e = this.gainNode) === null || e === void 0 || e.disconnect(), (t = this.sourceNode) === null || t === void 0 || t.disconnect(), this.gainNode = void 0, this.sourceNode = void 0
  }
  getReceiverStats() {
    return b(this, void 0, void 0, function*() {
      if (!this.receiver || !this.receiver.getStats) return;
      const e = yield this.receiver.getStats();
      let t;
      return e.forEach(n => {
        n.type === "inbound-rtp" && (t = {
          type: "audio",
          streamId: n.id,
          timestamp: n.timestamp,
          jitter: n.jitter,
          bytesReceived: n.bytesReceived,
          concealedSamples: n.concealedSamples,
          concealmentEvents: n.concealmentEvents,
          silentConcealedSamples: n.silentConcealedSamples,
          silentConcealmentEvents: n.silentConcealmentEvents,
          totalAudioEnergy: n.totalAudioEnergy,
          totalSamplesDuration: n.totalSamplesDuration
        })
      }), t
    })
  }
}
const On = 100;
class Mf extends jc {
  constructor(e, t, n, s, r) {
    super(e, t, O.Kind.Video, n, r), this.elementInfos = [], this.monitorReceiver = () => b(this, void 0, void 0, function*() {
      if (!this.receiver) {
        this._currentBitrate = 0;
        return
      }
      const a = yield this.getReceiverStats();
      a && this.prevStats && this.receiver && (this._currentBitrate = un(a, this.prevStats)), this.prevStats = a
    }), this.debouncedHandleResize = Gs(() => {
      this.updateDimensions()
    }, On), this.adaptiveStreamSettings = s
  }
  get isAdaptiveStream() {
    return this.adaptiveStreamSettings !== void 0
  }
  setStreamState(e) {
    super.setStreamState(e), this.log.debug("setStreamState", e), this.isAdaptiveStream && e === O.StreamState.Active && this.updateVisibility()
  }
  get mediaStreamTrack() {
    return this._mediaStreamTrack
  }
  setMuted(e) {
    super.setMuted(e), this.attachedElements.forEach(t => {
      e ? Ht(this._mediaStreamTrack, t) : Ft(this._mediaStreamTrack, t)
    })
  }
  attach(e) {
    if (e ? super.attach(e) : e = super.attach(), this.adaptiveStreamSettings && this.elementInfos.find(t => t.element === e) === void 0) {
      const t = new Of(e);
      this.observeElementInfo(t)
    }
    return e
  }
  observeElementInfo(e) {
    this.adaptiveStreamSettings && this.elementInfos.find(t => t === e) === void 0 ? (e.handleResize = () => {
      this.debouncedHandleResize()
    }, e.handleVisibilityChanged = () => {
      this.updateVisibility()
    }, this.elementInfos.push(e), e.observe(), this.debouncedHandleResize(), this.updateVisibility()) : this.log.warn("visibility resize observer not triggered", this.logContext)
  }
  stopObservingElementInfo(e) {
    if (!this.isAdaptiveStream) {
      this.log.warn("stopObservingElementInfo ignored", this.logContext);
      return
    }
    const t = this.elementInfos.filter(n => n === e);
    for (const n of t) n.stopObserving();
    this.elementInfos = this.elementInfos.filter(n => n !== e), this.updateVisibility(), this.debouncedHandleResize()
  }
  detach(e) {
    let t = [];
    if (e) return this.stopObservingElement(e), super.detach(e);
    t = super.detach();
    for (const n of t) this.stopObservingElement(n);
    return t
  }
  getDecoderImplementation() {
    var e;
    return (e = this.prevStats) === null || e === void 0 ? void 0 : e.decoderImplementation
  }
  getReceiverStats() {
    return b(this, void 0, void 0, function*() {
      if (!this.receiver || !this.receiver.getStats) return;
      const e = yield this.receiver.getStats();
      let t, n = "",
        s = new Map;
      return e.forEach(r => {
        r.type === "inbound-rtp" ? (n = r.codecId, t = {
          type: "video",
          streamId: r.id,
          framesDecoded: r.framesDecoded,
          framesDropped: r.framesDropped,
          framesReceived: r.framesReceived,
          packetsReceived: r.packetsReceived,
          packetsLost: r.packetsLost,
          frameWidth: r.frameWidth,
          frameHeight: r.frameHeight,
          pliCount: r.pliCount,
          firCount: r.firCount,
          nackCount: r.nackCount,
          jitter: r.jitter,
          timestamp: r.timestamp,
          bytesReceived: r.bytesReceived,
          decoderImplementation: r.decoderImplementation
        }) : r.type === "codec" && s.set(r.id, r)
      }), t && n !== "" && s.get(n) && (t.mimeType = s.get(n).mimeType), t
    })
  }
  stopObservingElement(e) {
    const t = this.elementInfos.filter(n => n.element === e);
    for (const n of t) this.stopObservingElementInfo(n)
  }
  handleAppVisibilityChanged() {
    const e = Object.create(null, {
      handleAppVisibilityChanged: {
        get: () => super.handleAppVisibilityChanged
      }
    });
    return b(this, void 0, void 0, function*() {
      yield e.handleAppVisibilityChanged.call(this), this.isAdaptiveStream && this.updateVisibility()
    })
  }
  updateVisibility(e) {
    var t, n;
    const s = this.elementInfos.reduce((c, d) => Math.max(c, d.visibilityChangedAt || 0), 0),
      r = !((n = (t = this.adaptiveStreamSettings) === null || t === void 0 ? void 0 : t.pauseVideoInBackground) !== null && n !== void 0) || n ? this.isInBackground : !1,
      a = this.elementInfos.some(c => c.pictureInPicture),
      o = this.elementInfos.some(c => c.visible) && !r || a;
    if (!(this.lastVisible === o && !e)) {
      if (!o && Date.now() - s < On) {
        Te.setTimeout(() => {
          this.updateVisibility()
        }, On);
        return
      }
      this.lastVisible = o, this.emit(B.VisibilityChanged, o, this)
    }
  }
  updateDimensions() {
    var e, t;
    let n = 0,
      s = 0;
    const r = this.getPixelDensity();
    for (const a of this.elementInfos) {
      const o = a.width() * r,
        c = a.height() * r;
      o + c > n + s && (n = o, s = c)
    }((e = this.lastDimensions) === null || e === void 0 ? void 0 : e.width) === n && ((t = this.lastDimensions) === null || t === void 0 ? void 0 : t.height) === s || (this.lastDimensions = {
      width: n,
      height: s
    }, this.emit(B.VideoDimensionsChanged, this.lastDimensions, this))
  }
  getPixelDensity() {
    var e;
    const t = (e = this.adaptiveStreamSettings) === null || e === void 0 ? void 0 : e.pixelDensity;
    return t === "screen" ? Yr() : t || (Yr() > 2 ? 2 : 1)
  }
}
class Of {
  get visible() {
    return this.isPiP || this.isIntersecting
  }
  get pictureInPicture() {
    return this.isPiP
  }
  constructor(e, t) {
    this.onVisibilityChanged = n => {
      var s;
      const {
        target: r,
        isIntersecting: a
      } = n;
      r === this.element && (this.isIntersecting = a, this.isPiP = ni(this.element), this.visibilityChangedAt = Date.now(), (s = this.handleVisibilityChanged) === null || s === void 0 || s.call(this))
    }, this.onEnterPiP = () => {
      var n, s, r;
      (s = (n = window.documentPictureInPicture) === null || n === void 0 ? void 0 : n.window) === null || s === void 0 || s.addEventListener("pagehide", this.onLeavePiP), this.isPiP = ni(this.element), (r = this.handleVisibilityChanged) === null || r === void 0 || r.call(this)
    }, this.onLeavePiP = () => {
      var n;
      this.isPiP = ni(this.element), (n = this.handleVisibilityChanged) === null || n === void 0 || n.call(this)
    }, this.element = e, this.isIntersecting = t ?? fs(e), this.isPiP = Me() && ni(e), this.visibilityChangedAt = 0
  }
  width() {
    return this.element.clientWidth
  }
  height() {
    return this.element.clientHeight
  }
  observe() {
    var e, t, n;
    this.isIntersecting = fs(this.element), this.isPiP = ni(this.element), this.element.handleResize = () => {
      var s;
      (s = this.handleResize) === null || s === void 0 || s.call(this)
    }, this.element.handleVisibilityChanged = this.onVisibilityChanged, Zr().observe(this.element), Xr().observe(this.element), this.element.addEventListener("enterpictureinpicture", this.onEnterPiP), this.element.addEventListener("leavepictureinpicture", this.onLeavePiP), (e = window.documentPictureInPicture) === null || e === void 0 || e.addEventListener("enter", this.onEnterPiP), (n = (t = window.documentPictureInPicture) === null || t === void 0 ? void 0 : t.window) === null || n === void 0 || n.addEventListener("pagehide", this.onLeavePiP)
  }
  stopObserving() {
    var e, t, n, s, r;
    (e = Zr()) === null || e === void 0 || e.unobserve(this.element), (t = Xr()) === null || t === void 0 || t.unobserve(this.element), this.element.removeEventListener("enterpictureinpicture", this.onEnterPiP), this.element.removeEventListener("leavepictureinpicture", this.onLeavePiP), (n = window.documentPictureInPicture) === null || n === void 0 || n.removeEventListener("enter", this.onEnterPiP), (r = (s = window.documentPictureInPicture) === null || s === void 0 ? void 0 : s.window) === null || r === void 0 || r.removeEventListener("pagehide", this.onLeavePiP)
  }
}

function ni(i) {
  var e, t;
  return document.pictureInPictureElement === i ? !0 : !((e = window.documentPictureInPicture) === null || e === void 0) && e.window ? fs(i, (t = window.documentPictureInPicture) === null || t === void 0 ? void 0 : t.window) : !1
}


class nt extends et.EventEmitter {
  constructor(e, t, n, s) {
    var r;
    super(), this.metadataMuted = !1, this.encryption = ge.NONE, this.log = X, this.handleMuted = () => {
      this.emit(B.Muted)
    }, this.handleUnmuted = () => {
      this.emit(B.Unmuted)
    }, this.log = Ye((r = s == null ? void 0 : s.loggerName) !== null && r !== void 0 ? r : Ue.Publication), this.loggerContextCb = this.loggerContextCb, this.setMaxListeners(100), this.kind = e, this.trackSid = t, this.trackName = n, this.source = O.Source.Unknown
  }
  setTrack(e) {
    this.track && (this.track.off(B.Muted, this.handleMuted), this.track.off(B.Unmuted, this.handleUnmuted)), this.track = e, e && (e.on(B.Muted, this.handleMuted), e.on(B.Unmuted, this.handleUnmuted))
  }
  get logContext() {
    var e;
    return Object.assign(Object.assign({}, (e = this.loggerContextCb) === null || e === void 0 ? void 0 : e.call(this)), te(this))
  }
  get isMuted() {
    return this.metadataMuted
  }
  get isEnabled() {
    return !0
  }
  get isSubscribed() {
    return this.track !== void 0
  }
  get isEncrypted() {
    return this.encryption !== ge.NONE
  }
  get audioTrack() {
    if (Qe(this.track)) return this.track
  }
  get videoTrack() {
    if (Ct(this.track)) return this.track
  }
  updateInfo(e) {
    this.trackSid = e.sid, this.trackName = e.name, this.source = O.sourceFromProto(e.source), this.mimeType = e.mimeType, this.kind === O.Kind.Video && e.width > 0 && (this.dimensions = {
      width: e.width,
      height: e.height
    }, this.simulcasted = e.simulcast), this.encryption = e.encryption, this.trackInfo = e, this.log.debug("update publication info", Object.assign(Object.assign({}, this.logContext), {
      info: e
    }))
  }
}(function(i) {
  (function(e) {
    e.Desired = "desired", e.Subscribed = "subscribed", e.Unsubscribed = "unsubscribed"
  })(i.SubscriptionStatus || (i.SubscriptionStatus = {})),
  function(e) {
    e.Allowed = "allowed", e.NotAllowed = "not_allowed"
  }(i.PermissionStatus || (i.PermissionStatus = {}))
})(nt || (nt = {}));
class ps extends nt {
  get isUpstreamPaused() {
    var e;
    return (e = this.track) === null || e === void 0 ? void 0 : e.isUpstreamPaused
  }
  constructor(e, t, n, s) {
    super(e, t.sid, t.name, s), this.track = void 0, this.handleTrackEnded = () => {
      this.emit(B.Ended)
    }, this.handleCpuConstrained = () => {
      this.track && Ct(this.track) && this.emit(B.CpuConstrained, this.track)
    }, this.updateInfo(t), this.setTrack(n)
  }
  setTrack(e) {
    this.track && (this.track.off(B.Ended, this.handleTrackEnded), this.track.off(B.CpuConstrained, this.handleCpuConstrained)), super.setTrack(e), e && (e.on(B.Ended, this.handleTrackEnded), e.on(B.CpuConstrained, this.handleCpuConstrained))
  }
  get isMuted() {
    return this.track ? this.track.isMuted : super.isMuted
  }
  get audioTrack() {
    return super.audioTrack
  }
  get videoTrack() {
    return super.videoTrack
  }
  get isLocal() {
    return !0
  }
  mute() {
    return b(this, void 0, void 0, function*() {
      var e;
      return (e = this.track) === null || e === void 0 ? void 0 : e.mute()
    })
  }
  unmute() {
    return b(this, void 0, void 0, function*() {
      var e;
      return (e = this.track) === null || e === void 0 ? void 0 : e.unmute()
    })
  }
  pauseUpstream() {
    return b(this, void 0, void 0, function*() {
      var e;
      yield(e = this.track) === null || e === void 0 ? void 0 : e.pauseUpstream()
    })
  }
  resumeUpstream() {
    return b(this, void 0, void 0, function*() {
      var e;
      yield(e = this.track) === null || e === void 0 ? void 0 : e.resumeUpstream()
    })
  }
  getTrackFeatures() {
    var e;
    if (Qe(this.track)) {
      const t = this.track.getSourceTrackSettings(),
        n = new Set;
      return t.autoGainControl && n.add(ke.TF_AUTO_GAIN_CONTROL), t.echoCancellation && n.add(ke.TF_ECHO_CANCELLATION), t.noiseSuppression && n.add(ke.TF_NOISE_SUPPRESSION), t.channelCount && t.channelCount > 1 && n.add(ke.TF_STEREO), !((e = this.options) === null || e === void 0) && e.dtx || n.add(ke.TF_NO_DTX), this.track.enhancedNoiseCancellation && n.add(ke.TF_ENHANCED_NOISE_CANCELLATION), Array.from(n.values())
    } else return []
  }
}

function hn(i, e) {
  return b(this, void 0, void 0, function*() {
    i ?? (i = {});
    let t = !1;
    const {
      audioProcessor: n,
      videoProcessor: s,
      optionsWithoutProcessor: r
    } = wc(i);
    let a = r.audio,
      o = r.video;
    if (n && typeof r.audio == "object" && (r.audio.processor = n), s && typeof r.video == "object" && (r.video.processor = s), i.audio && typeof r.audio == "object" && typeof r.audio.deviceId == "string") {
      const u = r.audio.deviceId;
      r.audio.deviceId = {
        exact: u
      }, t = !0, a = Object.assign(Object.assign({}, r.audio), {
        deviceId: {
          ideal: u
        }
      })
    }
    if (r.video && typeof r.video == "object" && typeof r.video.deviceId == "string") {
      const u = r.video.deviceId;
      r.video.deviceId = {
        exact: u
      }, t = !0, o = Object.assign(Object.assign({}, r.video), {
        deviceId: {
          ideal: u
        }
      })
    }
    r.audio === !0 ? r.audio = {
      deviceId: "default"
    } : typeof r.audio == "object" && r.audio !== null && (r.audio = Object.assign(Object.assign({}, r.audio), {
      deviceId: r.audio.deviceId || "default"
    })), r.video === !0 ? r.video = {
      deviceId: "default"
    } : typeof r.video == "object" && !r.video.deviceId && (r.video.deviceId = "default");
    const c = Sc(r, Ic, xc),
      d = qs(c),
      l = navigator.mediaDevices.getUserMedia(d);
    r.audio && (Se.userMediaPromiseMap.set("audioinput", l), l.catch(() => Se.userMediaPromiseMap.delete("audioinput"))), r.video && (Se.userMediaPromiseMap.set("videoinput", l), l.catch(() => Se.userMediaPromiseMap.delete("videoinput")));
    try {
      const u = yield l;
      return yield Promise.all(u.getTracks().map(h => b(this, void 0, void 0, function*() {
        const m = h.kind === "audio";
        let f = m ? c.audio : c.video;
        (typeof f == "boolean" || !f) && (f = {});
        let p;
        const _ = m ? d.audio : d.video;
        typeof _ != "boolean" && (p = _);
        const w = h.getSettings().deviceId;
        p != null && p.deviceId && It(p.deviceId) !== w ? p.deviceId = w : p || (p = {
          deviceId: w
        });
        const k = of(h, p, e);
        return k.kind === O.Kind.Video ? k.source = O.Source.Camera : k.kind === O.Kind.Audio && (k.source = O.Source.Microphone), k.mediaStream = u, Qe(k) && n ? yield k.setProcessor(n): Ct(k) && s && (yield k.setProcessor(s)), k
      })))
    } catch (u) {
      if (!t) throw u;
      return hn(Object.assign(Object.assign({}, i), {
        audio: a,
        video: o
      }), e)
    }
  })
}

function Df(i) {
  return b(this, void 0, void 0, function*() {
    return (yield hn({
      audio: !1,
      video: !0
    }))[0]
  })
}

function Af(i) {
  return b(this, void 0, void 0, function*() {
    return (yield hn({
      audio: !0,
      video: !1
    }))[0]
  })
}
var gt;
(function(i) {
  i.Excellent = "excellent", i.Good = "good", i.Poor = "poor", i.Lost = "lost", i.Unknown = "unknown"
})(gt || (gt = {}));

function Nf(i) {
  switch (i) {
    case ri.EXCELLENT:
      return gt.Excellent;
    case ri.GOOD:
      return gt.Good;
    case ri.POOR:
      return gt.Poor;
    case ri.LOST:
      return gt.Lost;
    default:
      return gt.Unknown
  }
}
class Fc extends et.EventEmitter {
  get logContext() {
    var e, t;
    return Object.assign({}, (t = (e = this.loggerOptions) === null || e === void 0 ? void 0 : e.loggerContextCb) === null || t === void 0 ? void 0 : t.call(e))
  }
  get isEncrypted() {
    return this.trackPublications.size > 0 && Array.from(this.trackPublications.values()).every(e => e.isEncrypted)
  }
  get isAgent() {
    var e;
    return ((e = this.permissions) === null || e === void 0 ? void 0 : e.agent) || this.kind === fi.AGENT
  }
  get isActive() {
    var e;
    return ((e = this.participantInfo) === null || e === void 0 ? void 0 : e.state) === Vt.ACTIVE
  }
  get kind() {
    return this._kind
  }
  get attributes() {
    return Object.freeze(Object.assign({}, this._attributes))
  }
  constructor(e, t, n, s, r, a) {
    let o = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : fi.STANDARD;
    var c;
    super(), this.audioLevel = 0, this.isSpeaking = !1, this._connectionQuality = gt.Unknown, this.log = X, this.log = Ye((c = a == null ? void 0 : a.loggerName) !== null && c !== void 0 ? c : Ue.Participant), this.loggerOptions = a, this.setMaxListeners(100), this.sid = e, this.identity = t, this.name = n, this.metadata = s, this.audioTrackPublications = new Map, this.videoTrackPublications = new Map, this.trackPublications = new Map, this._kind = o, this._attributes = r ?? {}
  }
  getTrackPublications() {
    return Array.from(this.trackPublications.values())
  }
  getTrackPublication(e) {
    for (const [, t] of this.trackPublications)
      if (t.source === e) return t
  }
  getTrackPublicationByName(e) {
    for (const [, t] of this.trackPublications)
      if (t.trackName === e) return t
  }
  waitUntilActive() {
    return this.isActive ? Promise.resolve() : this.activeFuture ? this.activeFuture.promise : (this.activeFuture = new Le, this.once(W.Active, () => {
      var e, t;
      (t = (e = this.activeFuture) === null || e === void 0 ? void 0 : e.resolve) === null || t === void 0 || t.call(e), this.activeFuture = void 0
    }), this.activeFuture.promise)
  }
  get connectionQuality() {
    return this._connectionQuality
  }
  get isCameraEnabled() {
    var e;
    const t = this.getTrackPublication(O.Source.Camera);
    return !(!((e = t == null ? void 0 : t.isMuted) !== null && e !== void 0) || e)
  }
  get isMicrophoneEnabled() {
    var e;
    const t = this.getTrackPublication(O.Source.Microphone);
    return !(!((e = t == null ? void 0 : t.isMuted) !== null && e !== void 0) || e)
  }
  get isScreenShareEnabled() {
    return !!this.getTrackPublication(O.Source.ScreenShare)
  }
  get isLocal() {
    return !1
  }
  get joinedAt() {
    return this.participantInfo ? new Date(Number.parseInt(this.participantInfo.joinedAt.toString()) * 1e3) : new Date
  }
  updateInfo(e) {
    var t;
    return this.participantInfo && this.participantInfo.sid === e.sid && this.participantInfo.version > e.version ? !1 : (this.identity = e.identity, this.sid = e.sid, this._setName(e.name), this._setMetadata(e.metadata), this._setAttributes(e.attributes), e.state === Vt.ACTIVE && ((t = this.participantInfo) === null || t === void 0 ? void 0 : t.state) !== Vt.ACTIVE && this.emit(W.Active), e.permission && this.setPermissions(e.permission), this.participantInfo = e, !0)
  }
  _setMetadata(e) {
    const t = this.metadata !== e,
      n = this.metadata;
    this.metadata = e, t && this.emit(W.ParticipantMetadataChanged, n)
  }
  _setName(e) {
    const t = this.name !== e;
    this.name = e, t && this.emit(W.ParticipantNameChanged, e)
  }
  _setAttributes(e) {
    const t = Xh(this.attributes, e);
    this._attributes = e, Object.keys(t).length > 0 && this.emit(W.AttributesChanged, t)
  }
  setPermissions(e) {
    var t, n, s, r, a, o;
    const c = this.permissions,
      d = e.canPublish !== ((t = this.permissions) === null || t === void 0 ? void 0 : t.canPublish) || e.canSubscribe !== ((n = this.permissions) === null || n === void 0 ? void 0 : n.canSubscribe) || e.canPublishData !== ((s = this.permissions) === null || s === void 0 ? void 0 : s.canPublishData) || e.hidden !== ((r = this.permissions) === null || r === void 0 ? void 0 : r.hidden) || e.recorder !== ((a = this.permissions) === null || a === void 0 ? void 0 : a.recorder) || e.canPublishSources.length !== this.permissions.canPublishSources.length || e.canPublishSources.some((l, u) => {
        var h;
        return l !== ((h = this.permissions) === null || h === void 0 ? void 0 : h.canPublishSources[u])
      }) || e.canSubscribeMetrics !== ((o = this.permissions) === null || o === void 0 ? void 0 : o.canSubscribeMetrics);
    return this.permissions = e, d && this.emit(W.ParticipantPermissionsChanged, c), d
  }
  setIsSpeaking(e) {
    e !== this.isSpeaking && (this.isSpeaking = e, e && (this.lastSpokeAt = new Date), this.emit(W.IsSpeakingChanged, e))
  }
  setConnectionQuality(e) {
    const t = this._connectionQuality;
    this._connectionQuality = Nf(e), t !== this._connectionQuality && this.emit(W.ConnectionQualityChanged, this._connectionQuality)
  }
  setDisconnected() {
    var e, t;
    this.activeFuture && ((t = (e = this.activeFuture).reject) === null || t === void 0 || t.call(e, new Error("Participant disconnected")), this.activeFuture = void 0)
  }
  setAudioContext(e) {
    this.audioContext = e, this.audioTrackPublications.forEach(t => Qe(t.track) && t.track.setAudioContext(e))
  }
  addTrackPublication(e) {
    e.on(B.Muted, () => {
      this.emit(W.TrackMuted, e)
    }), e.on(B.Unmuted, () => {
      this.emit(W.TrackUnmuted, e)
    });
    const t = e;
    switch (t.track && (t.track.sid = e.trackSid), this.trackPublications.set(e.trackSid, e), e.kind) {
      case O.Kind.Audio:
        this.audioTrackPublications.set(e.trackSid, e);
        break;
      case O.Kind.Video:
        this.videoTrackPublications.set(e.trackSid, e);
        break
    }
  }
}

function Lf(i) {
  var e, t, n;
  if (!i.participantSid && !i.participantIdentity) throw new Error("Invalid track permission, must provide at least one of participantIdentity and participantSid");
  return new La({
    participantIdentity: (e = i.participantIdentity) !== null && e !== void 0 ? e : "",
    participantSid: (t = i.participantSid) !== null && t !== void 0 ? t : "",
    allTracks: (n = i.allowAll) !== null && n !== void 0 ? n : !1,
    trackSids: i.allowedTrackSids || []
  })
}
class Uf extends Fc {
  constructor(e, t, n, s, r, a) {
    super(e, t, void 0, void 0, void 0, {
      loggerName: s.loggerName,
      loggerContextCb: () => this.engine.logContext
    }), this.pendingPublishing = new Set, this.pendingPublishPromises = new Map, this.participantTrackPermissions = [], this.allParticipantsAllowedToSubscribe = !0, this.encryptionType = ge.NONE, this.enabledPublishVideoCodecs = [], this.pendingAcks = new Map, this.pendingResponses = new Map, this.handleReconnecting = () => {
      this.reconnectFuture || (this.reconnectFuture = new Le)
    }, this.handleReconnected = () => {
      var o, c;
      (c = (o = this.reconnectFuture) === null || o === void 0 ? void 0 : o.resolve) === null || c === void 0 || c.call(o), this.reconnectFuture = void 0, this.updateTrackSubscriptionPermissions()
    }, this.handleClosing = () => {
      var o, c, d, l, u, h;
      this.reconnectFuture && (this.reconnectFuture.promise.catch(m => this.log.warn(m.message, this.logContext)), (c = (o = this.reconnectFuture) === null || o === void 0 ? void 0 : o.reject) === null || c === void 0 || c.call(o, new Error("Got disconnected during reconnection attempt")), this.reconnectFuture = void 0), this.signalConnectedFuture && ((l = (d = this.signalConnectedFuture).reject) === null || l === void 0 || l.call(d, new Error("Got disconnected without signal connected")), this.signalConnectedFuture = void 0), (h = (u = this.activeAgentFuture) === null || u === void 0 ? void 0 : u.reject) === null || h === void 0 || h.call(u, new Error("Got disconnected without active agent present")), this.activeAgentFuture = void 0, this.firstActiveAgent = void 0
    }, this.handleSignalConnected = o => {
      var c, d;
      o.participant && this.updateInfo(o.participant), this.signalConnectedFuture || (this.signalConnectedFuture = new Le), (d = (c = this.signalConnectedFuture).resolve) === null || d === void 0 || d.call(c)
    }, this.handleSignalRequestResponse = o => {
      const {
        requestId: c,
        reason: d,
        message: l
      } = o, u = this.pendingSignalRequests.get(c);
      u && (d !== js.OK && u.reject(new Gr(l, d)), this.pendingSignalRequests.delete(c))
    }, this.handleDataPacket = o => {
      switch (o.value.case) {
        case "rpcResponse":
          let c = o.value.value,
            d = null,
            l = null;
          c.value.case === "payload" ? d = c.value.value : c.value.case === "error" && (l = me.fromProto(c.value.value)), this.handleIncomingRpcResponse(c.requestId, d, l);
          break;
        case "rpcAck":
          let u = o.value.value;
          this.handleIncomingRpcAck(u.requestId);
          break
      }
    }, this.updateTrackSubscriptionPermissions = () => {
      this.log.debug("updating track subscription permissions", Object.assign(Object.assign({}, this.logContext), {
        allParticipantsAllowed: this.allParticipantsAllowedToSubscribe,
        participantTrackPermissions: this.participantTrackPermissions
      })), this.engine.client.sendUpdateSubscriptionPermissions(this.allParticipantsAllowedToSubscribe, this.participantTrackPermissions.map(o => Lf(o)))
    }, this.onTrackUnmuted = o => {
      this.onTrackMuted(o, o.isUpstreamPaused)
    }, this.onTrackMuted = (o, c) => {
      if (c === void 0 && (c = !0), !o.sid) {
        this.log.error("could not update mute status for unpublished track", Object.assign(Object.assign({}, this.logContext), te(o)));
        return
      }
      this.engine.updateMuteStatus(o.sid, c)
    }, this.onTrackUpstreamPaused = o => {
      this.log.debug("upstream paused", Object.assign(Object.assign({}, this.logContext), te(o))), this.onTrackMuted(o, !0)
    }, this.onTrackUpstreamResumed = o => {
      this.log.debug("upstream resumed", Object.assign(Object.assign({}, this.logContext), te(o))), this.onTrackMuted(o, o.isMuted)
    }, this.onTrackFeatureUpdate = o => {
      const c = this.audioTrackPublications.get(o.sid);
      if (!c) {
        this.log.warn("Could not update local audio track settings, missing publication for track ".concat(o.sid), this.logContext);
        return
      }
      this.engine.client.sendUpdateLocalAudioTrack(c.trackSid, c.getTrackFeatures())
    }, this.onTrackCpuConstrained = (o, c) => {
      this.log.debug("track cpu constrained", Object.assign(Object.assign({}, this.logContext), te(c))), this.emit(W.LocalTrackCpuConstrained, o, c)
    }, this.handleSubscribedQualityUpdate = o => b(this, void 0, void 0, function*() {
      var c, d, l, u, h;
      if (!(!((h = this.roomOptions) === null || h === void 0) && h.dynacast)) return;
      const m = this.videoTrackPublications.get(o.trackSid);
      if (!m) {
        this.log.warn("received subscribed quality update for unknown track", Object.assign(Object.assign({}, this.logContext), {
          trackSid: o.trackSid
        }));
        return
      }
      if (!m.videoTrack) return;
      const f = yield m.videoTrack.setPublishingCodecs(o.subscribedCodecs);
      try {
        for (var p = !0, _ = at(f), w; w = yield _.next(), c = w.done, !c; p = !0) {
          u = w.value, p = !1;
          const k = u;
          Jh(k) && (this.log.debug("publish ".concat(k, " for ").concat(m.videoTrack.sid), Object.assign(Object.assign({}, this.logContext), te(m))), yield this.publishAdditionalCodecForTrack(m.videoTrack, k, m.options))
        }
      } catch (k) {
        d = {
          error: k
        }
      } finally {
        try {
          !p && !c && (l = _.return) && (yield l.call(_))
        } finally {
          if (d) throw d.error
        }
      }
    }), this.handleLocalTrackUnpublished = o => {
      const c = this.trackPublications.get(o.trackSid);
      if (!c) {
        this.log.warn("received unpublished event for unknown track", Object.assign(Object.assign({}, this.logContext), {
          trackSid: o.trackSid
        }));
        return
      }
      this.unpublishTrack(c.track)
    }, this.handleTrackEnded = o => b(this, void 0, void 0, function*() {
      if (o.source === O.Source.ScreenShare || o.source === O.Source.ScreenShareAudio) this.log.debug("unpublishing local track due to TrackEnded", Object.assign(Object.assign({}, this.logContext), te(o))), this.unpublishTrack(o);
      else if (o.isUserProvided) yield o.mute();
      else if (it(o) || ht(o)) try {
        if (Me()) try {
          const c = yield navigator == null ? void 0 : navigator.permissions.query({
            name: o.source === O.Source.Camera ? "camera" : "microphone"
          });
          if (c && c.state === "denied") throw this.log.warn("user has revoked access to ".concat(o.source), Object.assign(Object.assign({}, this.logContext), te(o))), c.onchange = () => {
            c.state !== "denied" && (o.isMuted || o.restartTrack(), c.onchange = null)
          }, new Error("GetUserMedia Permission denied")
        } catch {}
        o.isMuted || (this.log.debug("track ended, attempting to use a different device", Object.assign(Object.assign({}, this.logContext), te(o))), it(o) ? yield o.restartTrack({
          deviceId: "default"
        }): yield o.restartTrack())
      } catch {
        this.log.warn("could not restart track, muting instead", Object.assign(Object.assign({}, this.logContext), te(o))), yield o.mute()
      }
    }), this.audioTrackPublications = new Map, this.videoTrackPublications = new Map, this.trackPublications = new Map, this.engine = n, this.roomOptions = s, this.setupEngine(n), this.activeDeviceMap = new Map([
      ["audioinput", "default"],
      ["videoinput", "default"],
      ["audiooutput", "default"]
    ]), this.pendingSignalRequests = new Map, this.rpcHandlers = r, this.roomOutgoingDataStreamManager = a
  }
  get lastCameraError() {
    return this.cameraError
  }
  get lastMicrophoneError() {
    return this.microphoneError
  }
  get isE2EEEnabled() {
    return this.encryptionType !== ge.NONE
  }
  getTrackPublication(e) {
    const t = super.getTrackPublication(e);
    if (t) return t
  }
  getTrackPublicationByName(e) {
    const t = super.getTrackPublicationByName(e);
    if (t) return t
  }
  setupEngine(e) {
    var t;
    this.engine = e, this.engine.on(V.RemoteMute, (n, s) => {
      const r = this.trackPublications.get(n);
      !r || !r.track || (s ? r.mute() : r.unmute())
    }), !((t = this.signalConnectedFuture) === null || t === void 0) && t.isResolved && (this.signalConnectedFuture = void 0), this.engine.on(V.Connected, this.handleReconnected).on(V.SignalConnected, this.handleSignalConnected).on(V.SignalRestarted, this.handleReconnected).on(V.SignalResumed, this.handleReconnected).on(V.Restarting, this.handleReconnecting).on(V.Resuming, this.handleReconnecting).on(V.LocalTrackUnpublished, this.handleLocalTrackUnpublished).on(V.SubscribedQualityUpdate, this.handleSubscribedQualityUpdate).on(V.Closing, this.handleClosing).on(V.SignalRequestResponse, this.handleSignalRequestResponse).on(V.DataPacketReceived, this.handleDataPacket)
  }
  setMetadata(e) {
    return b(this, void 0, void 0, function*() {
      yield this.requestMetadataUpdate({
        metadata: e
      })
    })
  }
  setName(e) {
    return b(this, void 0, void 0, function*() {
      yield this.requestMetadataUpdate({
        name: e
      })
    })
  }
  setAttributes(e) {
    return b(this, void 0, void 0, function*() {
      yield this.requestMetadataUpdate({
        attributes: e
      })
    })
  }
  requestMetadataUpdate(e) {
    return b(this, arguments, void 0, function(t) {
      var n = this;
      let {
        metadata: s,
        name: r,
        attributes: a
      } = t;
      return function*() {
        return new Ee((o, c) => b(n, void 0, void 0, function*() {
          var d, l;
          try {
            let u = !1;
            const h = yield this.engine.client.sendUpdateLocalMetadata((d = s ?? this.metadata) !== null && d !== void 0 ? d : "", (l = r ?? this.name) !== null && l !== void 0 ? l : "", a), m = performance.now();
            for (this.pendingSignalRequests.set(h, {
                resolve: o,
                reject: f => {
                  c(f), u = !0
                },
                values: {
                  name: r,
                  metadata: s,
                  attributes: a
                }
              }); performance.now() - m < 5e3 && !u;) {
              if ((!r || this.name === r) && (!s || this.metadata === s) && (!a || Object.entries(a).every(f => {
                  let [p, _] = f;
                  return this.attributes[p] === _ || _ === "" && !this.attributes[p]
                }))) {
                this.pendingSignalRequests.delete(h), o();
                return
              }
              yield Ce(50)
            }
            c(new Gr("Request to update local metadata timed out", "TimeoutError"))
          } catch (u) {
            u instanceof Error ? c(u) : c(new Error(String(u)))
          }
        }))
      }()
    })
  }
  setCameraEnabled(e, t, n) {
    return this.setTrackEnabled(O.Source.Camera, e, t, n)
  }
  setMicrophoneEnabled(e, t, n) {
    return this.setTrackEnabled(O.Source.Microphone, e, t, n)
  }
  setScreenShareEnabled(e, t, n) {
    return this.setTrackEnabled(O.Source.ScreenShare, e, t, n)
  }
  setE2EEEnabled(e) {
    return b(this, void 0, void 0, function*() {
      this.encryptionType = e ? ge.GCM : ge.NONE, yield this.republishAllTracks(void 0, !1)
    })
  }
  setTrackEnabled(e, t, n, s) {
    return b(this, void 0, void 0, function*() {
      var r, a;
      this.log.debug("setTrackEnabled", Object.assign(Object.assign({}, this.logContext), {
        source: e,
        enabled: t
      })), this.republishPromise && (yield this.republishPromise);
      let o = this.getTrackPublication(e);
      if (t)
        if (o) yield o.unmute();
        else {
          let c;
          if (this.pendingPublishing.has(e)) {
            const d = yield this.waitForPendingPublicationOfSource(e);
            return d || this.log.info("waiting for pending publication promise timed out", Object.assign(Object.assign({}, this.logContext), {
              source: e
            })), yield d == null ? void 0 : d.unmute(), d
          }
          this.pendingPublishing.add(e);
          try {
            switch (e) {
              case O.Source.Camera:
                c = yield this.createTracks({
                  video: (r = n) !== null && r !== void 0 ? r : !0
                });
                break;
              case O.Source.Microphone:
                c = yield this.createTracks({
                  audio: (a = n) !== null && a !== void 0 ? a : !0
                });
                break;
              case O.Source.ScreenShare:
                c = yield this.createScreenTracks(Object.assign({}, n));
                break;
              default:
                throw new ct(e)
            }
          } catch (d) {
            throw c == null || c.forEach(l => {
              l.stop()
            }), d instanceof Error && this.emit(W.MediaDevicesError, d, rs(e)), this.pendingPublishing.delete(e), d
          }
          for (const d of c) {
            const l = Object.assign(Object.assign({}, this.roomOptions.publishDefaults), n);
            e === O.Source.Microphone && Qe(d) && l.preConnectBuffer && (this.log.info("starting preconnect buffer for microphone", Object.assign({}, this.logContext)), d.startPreConnectBuffer())
          }
          try {
            const d = [];
            for (const u of c) this.log.info("publishing track", Object.assign(Object.assign({}, this.logContext), te(u))), d.push(this.publishTrack(u, s));
            [o] = yield Promise.all(d)
          } catch (d) {
            throw c == null || c.forEach(l => {
              l.stop()
            }), d
          } finally {
            this.pendingPublishing.delete(e)
          }
        }
      else if (!(o != null && o.track) && this.pendingPublishing.has(e) && (o = yield this.waitForPendingPublicationOfSource(e), o || this.log.info("waiting for pending publication promise timed out", Object.assign(Object.assign({}, this.logContext), {
          source: e
        }))), o && o.track)
        if (e === O.Source.ScreenShare) {
          o = yield this.unpublishTrack(o.track);
          const c = this.getTrackPublication(O.Source.ScreenShareAudio);
          c && c.track && this.unpublishTrack(c.track)
        } else yield o.mute();
      return o
    })
  }
  enableCameraAndMicrophone() {
    return b(this, void 0, void 0, function*() {
      if (!(this.pendingPublishing.has(O.Source.Camera) || this.pendingPublishing.has(O.Source.Microphone))) {
        this.pendingPublishing.add(O.Source.Camera), this.pendingPublishing.add(O.Source.Microphone);
        try {
          const e = yield this.createTracks({
            audio: !0,
            video: !0
          });
          yield Promise.all(e.map(t => this.publishTrack(t)))
        } finally {
          this.pendingPublishing.delete(O.Source.Camera), this.pendingPublishing.delete(O.Source.Microphone)
        }
      }
    })
  }
  createTracks(e) {
    return b(this, void 0, void 0, function*() {
      var t, n;
      e ?? (e = {});
      const s = Sc(e, (t = this.roomOptions) === null || t === void 0 ? void 0 : t.audioCaptureDefaults, (n = this.roomOptions) === null || n === void 0 ? void 0 : n.videoCaptureDefaults);
      try {
        return (yield hn(s, {
          loggerName: this.roomOptions.loggerName,
          loggerContextCb: () => this.logContext
        })).map(o => (Qe(o) && (this.microphoneError = void 0, o.setAudioContext(this.audioContext), o.source = O.Source.Microphone, this.emit(W.AudioStreamAcquired)), Ct(o) && (this.cameraError = void 0, o.source = O.Source.Camera), o))
      } catch (r) {
        throw r instanceof Error && (e.audio && (this.microphoneError = r), e.video && (this.cameraError = r)), r
      }
    })
  }
  createScreenTracks(e) {
    return b(this, void 0, void 0, function*() {
      if (e === void 0 && (e = {}), navigator.mediaDevices.getDisplayMedia === void 0) throw new Vs("getDisplayMedia not supported");
      e.resolution === void 0 && !am() && (e.resolution = ln.h1080fps30.resolution);
      const t = $h(e),
        n = yield navigator.mediaDevices.getDisplayMedia(t), s = n.getVideoTracks();
      if (s.length === 0) throw new ct("no video track found");
      const r = new Qi(s[0], void 0, !1, {
        loggerName: this.roomOptions.loggerName,
        loggerContextCb: () => this.logContext
      });
      r.source = O.Source.ScreenShare, e.contentHint && (r.mediaStreamTrack.contentHint = e.contentHint);
      const a = [r];
      if (n.getAudioTracks().length > 0) {
        this.emit(W.AudioStreamAcquired);
        const o = new $i(n.getAudioTracks()[0], void 0, !1, this.audioContext, {
          loggerName: this.roomOptions.loggerName,
          loggerContextCb: () => this.logContext
        });
        o.source = O.Source.ScreenShareAudio, a.push(o)
      }
      return a
    })
  }
  publishTrack(e, t) {
    return b(this, void 0, void 0, function*() {
      return this.publishOrRepublishTrack(e, t)
    })
  }
  publishOrRepublishTrack(e, t) {
    return b(this, arguments, void 0, function(n, s) {
      var r = this;
      let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
      return function*() {
        var o, c, d, l;
        it(n) && n.setAudioContext(r.audioContext), yield(o = r.reconnectFuture) === null || o === void 0 ? void 0 : o.promise, r.republishPromise && !a && (yield r.republishPromise), Kt(n) && r.pendingPublishPromises.has(n) && (yield r.pendingPublishPromises.get(n));
        let u;
        if (n instanceof MediaStreamTrack) u = n.getConstraints();
        else {
          u = n.constraints;
          let w;
          switch (n.source) {
            case O.Source.Microphone:
              w = "audioinput";
              break;
            case O.Source.Camera:
              w = "videoinput"
          }
          w && r.activeDeviceMap.has(w) && (u = Object.assign(Object.assign({}, u), {
            deviceId: r.activeDeviceMap.get(w)
          }))
        }
        if (n instanceof MediaStreamTrack) switch (n.kind) {
          case "audio":
            n = new $i(n, u, !0, r.audioContext, {
              loggerName: r.roomOptions.loggerName,
              loggerContextCb: () => r.logContext
            });
            break;
          case "video":
            n = new Qi(n, u, !0, {
              loggerName: r.roomOptions.loggerName,
              loggerContextCb: () => r.logContext
            });
            break;
          default:
            throw new ct("unsupported MediaStreamTrack kind ".concat(n.kind))
        } else n.updateLoggerOptions({
          loggerName: r.roomOptions.loggerName,
          loggerContextCb: () => r.logContext
        });
        let h;
        if (r.trackPublications.forEach(w => {
            w.track && w.track === n && (h = w)
          }), h) return r.log.warn("track has already been published, skipping", Object.assign(Object.assign({}, r.logContext), te(h))), h;
        const m = Object.assign(Object.assign({}, r.roomOptions.publishDefaults), s),
          f = "channelCount" in n.mediaStreamTrack.getSettings() && n.mediaStreamTrack.getSettings().channelCount === 2 || n.mediaStreamTrack.getConstraints().channelCount === 2,
          p = (c = m.forceStereo) !== null && c !== void 0 ? c : f;
        p && (m.dtx === void 0 && r.log.info("Opus DTX will be disabled for stereo tracks by default. Enable them explicitly to make it work.", Object.assign(Object.assign({}, r.logContext), te(n))), m.red === void 0 && r.log.info("Opus RED will be disabled for stereo tracks by default. Enable them explicitly to make it work."), (d = m.dtx) !== null && d !== void 0 || (m.dtx = !1), (l = m.red) !== null && l !== void 0 || (m.red = !1)), !dm() && r.roomOptions.e2ee && (r.log.info("End-to-end encryption is set up, simulcast publishing will be disabled on Safari versions and iOS browsers running iOS < v17.2", Object.assign({}, r.logContext)), m.simulcast = !1), m.source && (n.source = m.source);
        const _ = new Promise((w, k) => b(r, void 0, void 0, function*() {
          try {
            if (this.engine.client.currentState !== ae.CONNECTED) {
              this.log.debug("deferring track publication until signal is connected", Object.assign(Object.assign({}, this.logContext), {
                track: te(n)
              }));
              let P = !1;
              const y = setTimeout(() => {
                P = !0, n.stop(), k(new Kr("publishing rejected as engine not connected within timeout", 408))
              }, 15e3);
              if (yield this.waitUntilEngineConnected(), clearTimeout(y), P) return;
              const S = yield this.publish(n, m, p);
              w(S)
            } else try {
              const P = yield this.publish(n, m, p);
              w(P)
            } catch (P) {
              k(P)
            }
          } catch (P) {
            k(P)
          }
        }));
        r.pendingPublishPromises.set(n, _);
        try {
          return yield _
        } catch (w) {
          throw w
        } finally {
          r.pendingPublishPromises.delete(n)
        }
      }()
    })
  }
  waitUntilEngineConnected() {
    return this.signalConnectedFuture || (this.signalConnectedFuture = new Le), this.signalConnectedFuture.promise
  }
  hasPermissionsToPublish(e) {
    if (!this.permissions) return this.log.warn("no permissions present for publishing track", Object.assign(Object.assign({}, this.logContext), te(e))), !1;
    const {
      canPublish: t,
      canPublishSources: n
    } = this.permissions;
    return t && (n.length === 0 || n.map(s => Zh(s)).includes(e.source)) ? !0 : (this.log.warn("insufficient permissions to publish", Object.assign(Object.assign({}, this.logContext), te(e))), !1)
  }
  publish(e, t, n) {
    return b(this, void 0, void 0, function*() {
      var s, r, a, o, c, d, l, u, h, m;
      if (!this.hasPermissionsToPublish(e)) throw new Kr("failed to publish track, insufficient permissions", 403);
      Array.from(this.trackPublications.values()).find(C => Kt(e) && C.source === e.source) && e.source !== O.Source.Unknown && this.log.info("publishing a second track with the same source: ".concat(e.source), Object.assign(Object.assign({}, this.logContext), te(e))), t.stopMicTrackOnMute && Qe(e) && (e.stopOnMute = !0), e.source === O.Source.ScreenShare && Ot() && (t.simulcast = !1), t.videoCodec === "av1" && !sm() && (t.videoCodec = void 0), t.videoCodec === "vp9" && !rm() && (t.videoCodec = void 0), t.videoCodec === void 0 && (t.videoCodec = us), this.enabledPublishVideoCodecs.length > 0 && (this.enabledPublishVideoCodecs.some(C => t.videoCodec === li(C.mime)) || (t.videoCodec = li(this.enabledPublishVideoCodecs[0].mime)));
      const p = t.videoCodec;
      e.on(B.Muted, this.onTrackMuted), e.on(B.Unmuted, this.onTrackUnmuted), e.on(B.Ended, this.handleTrackEnded), e.on(B.UpstreamPaused, this.onTrackUpstreamPaused), e.on(B.UpstreamResumed, this.onTrackUpstreamResumed), e.on(B.AudioTrackFeatureUpdate, this.onTrackFeatureUpdate);
      const _ = [],
        w = !(!((s = t.dtx) !== null && s !== void 0) || s),
        k = e.getSourceTrackSettings();
      k.autoGainControl && _.push(ke.TF_AUTO_GAIN_CONTROL), k.echoCancellation && _.push(ke.TF_ECHO_CANCELLATION), k.noiseSuppression && _.push(ke.TF_NOISE_SUPPRESSION), k.channelCount && k.channelCount > 1 && _.push(ke.TF_STEREO), w && _.push(ke.TF_NO_DTX), it(e) && e.hasPreConnectBuffer && _.push(ke.TF_PRECONNECT_BUFFER);
      const P = new pi({
        cid: e.mediaStreamTrack.id,
        name: t.name,
        type: O.kindToProto(e.kind),
        muted: e.isMuted,
        source: O.sourceToProto(e.source),
        disableDtx: w,
        encryption: this.encryptionType,
        stereo: n,
        disableRed: this.isE2EEEnabled || !(!((r = t.red) !== null && r !== void 0) || r),
        stream: t == null ? void 0 : t.stream,
        backupCodecPolicy: t == null ? void 0 : t.backupCodecPolicy,
        audioFeatures: _
      });
      let y;
      if (e.kind === O.Kind.Video) {
        let C = {
          width: 0,
          height: 0
        };
        try {
          C = yield e.waitForDimensions()
        } catch {
          const g = (o = (a = this.roomOptions.videoCaptureDefaults) === null || a === void 0 ? void 0 : a.resolution) !== null && o !== void 0 ? o : gi.h720.resolution;
          C = {
            width: g.width,
            height: g.height
          }, this.log.error("could not determine track dimensions, using defaults", Object.assign(Object.assign(Object.assign({}, this.logContext), te(e)), {
            dims: C
          }))
        }
        P.width = C.width, P.height = C.height, ht(e) && (We(p) && (e.source === O.Source.ScreenShare && (t.scalabilityMode = "L1T3", "contentHint" in e.mediaStreamTrack && (e.mediaStreamTrack.contentHint = "motion", this.log.info("forcing contentHint to motion for screenshare with SVC codecs", Object.assign(Object.assign({}, this.logContext), te(e))))), t.scalabilityMode = (c = t.scalabilityMode) !== null && c !== void 0 ? c : "L3T3_KEY"), P.simulcastCodecs = [new Jn({
          codec: p,
          cid: e.mediaStreamTrack.id
        })], t.backupCodec === !0 && (t.backupCodec = {
          codec: us
        }), t.backupCodec && p !== t.backupCodec.codec && P.encryption === ge.NONE && (this.roomOptions.dynacast || (this.roomOptions.dynacast = !0), P.simulcastCodecs.push(new Jn({
          codec: t.backupCodec.codec,
          cid: ""
        })))), y = ms(e.source === O.Source.ScreenShare, P.width, P.height, t), P.layers = ko(P.width, P.height, y, We(t.videoCodec))
      } else e.kind === O.Kind.Audio && (y = [{
        maxBitrate: (d = t.audioPreset) === null || d === void 0 ? void 0 : d.maxBitrate,
        priority: (u = (l = t.audioPreset) === null || l === void 0 ? void 0 : l.priority) !== null && u !== void 0 ? u : "high",
        networkPriority: (m = (h = t.audioPreset) === null || h === void 0 ? void 0 : h.priority) !== null && m !== void 0 ? m : "high"
      }]);
      if (!this.engine || this.engine.isClosed) throw new fe("cannot publish track when not connected");
      const S = () => b(this, void 0, void 0, function*() {
        var C, M, g;
        if (!this.engine.pcManager) throw new fe("pcManager is not ready");
        if (e.sender = yield this.engine.createSender(e, t, y), this.emit(W.LocalSenderCreated, e.sender, e), ht(e) && ((C = t.degradationPreference) !== null && C !== void 0 || (t.degradationPreference = gf(e)), e.setDegradationPreference(t.degradationPreference)), y)
          if (Ot() && e.kind === O.Kind.Audio) {
            let T;
            for (const A of this.engine.pcManager.publisher.getTransceivers())
              if (A.sender === e.sender) {
                T = A;
                break
              } T && this.engine.pcManager.publisher.setTrackCodecBitrate({
              transceiver: T,
              codec: "opus",
              maxbr: !((M = y[0]) === null || M === void 0) && M.maxBitrate ? y[0].maxBitrate / 1e3 : 0
            })
          } else e.codec && We(e.codec) && (!((g = y[0]) === null || g === void 0) && g.maxBitrate) && this.engine.pcManager.publisher.setTrackCodecBitrate({
            cid: P.cid,
            codec: e.codec,
            maxbr: y[0].maxBitrate / 1e3
          });
        yield this.engine.negotiate()
      });
      let E;
      const x = new Promise((C, M) => b(this, void 0, void 0, function*() {
        var g;
        try {
          E = yield this.engine.addTrack(P), C(E)
        } catch (T) {
          e.sender && (!((g = this.engine.pcManager) === null || g === void 0) && g.publisher) && (this.engine.pcManager.publisher.removeTrack(e.sender), yield this.engine.negotiate().catch(A => {
            this.log.error("failed to negotiate after removing track due to failed add track request", Object.assign(Object.assign(Object.assign({}, this.logContext), te(e)), {
              error: A
            }))
          })), M(T)
        }
      }));
      if (this.enabledPublishVideoCodecs.length > 0) E = (yield Promise.all([x, S()]))[0];
      else {
        E = yield x;
        let C;
        if (E.codecs.forEach(M => {
            C === void 0 && (C = M.mimeType)
          }), C && e.kind === O.Kind.Video) {
          const M = li(C);
          M !== p && (this.log.debug("falling back to server selected codec", Object.assign(Object.assign(Object.assign({}, this.logContext), te(e)), {
            codec: M
          })), t.videoCodec = M, y = ms(e.source === O.Source.ScreenShare, P.width, P.height, t))
        }
        yield S()
      }
      const D = new ps(e.kind, E, e, {
        loggerName: this.roomOptions.loggerName,
        loggerContextCb: () => this.logContext
      });
      if (D.on(B.CpuConstrained, C => this.onTrackCpuConstrained(C, D)), D.options = t, e.sid = E.sid, this.log.debug("publishing ".concat(e.kind, " with encodings"), Object.assign(Object.assign({}, this.logContext), {
          encodings: y,
          trackInfo: E
        })), ht(e) ? e.startMonitor(this.engine.client) : it(e) && e.startMonitor(), this.addTrackPublication(D), this.emit(W.LocalTrackPublished, D), it(e) && E.audioFeatures.includes(ke.TF_PRECONNECT_BUFFER)) {
        const C = e.getPreConnectBuffer(),
          M = e.getPreConnectBufferMimeType();
        this.on(W.LocalTrackSubscribed, g => {
          if (g.trackSid === E.sid) {
            if (!e.hasPreConnectBuffer) {
              this.log.warn("subscribe event came to late, buffer already closed", this.logContext);
              return
            }
            this.log.debug("finished recording preconnect buffer", Object.assign(Object.assign({}, this.logContext), te(e))), e.stopPreConnectBuffer()
          }
        }), C && new Promise((T, A) => b(this, void 0, void 0, function*() {
          var F, H, N, Q, Z, ue;
          try {
            this.log.debug("waiting for agent", Object.assign(Object.assign({}, this.logContext), te(e)));
            const G = setTimeout(() => {
                A(new Error("agent not active within 10 seconds"))
              }, 1e4),
              J = yield this.waitUntilActiveAgentPresent();
            clearTimeout(G), this.log.debug("sending preconnect buffer", Object.assign(Object.assign({}, this.logContext), te(e)));
            const we = yield this.streamBytes({
              name: "preconnect-buffer",
              mimeType: M,
              topic: "lk.agent.pre-connect-audio-buffer",
              destinationIdentities: [J.identity],
              attributes: {
                trackId: D.trackSid,
                sampleRate: String((Z = k.sampleRate) !== null && Z !== void 0 ? Z : "48000"),
                channels: String((ue = k.channelCount) !== null && ue !== void 0 ? ue : "1")
              }
            });
            try {
              for (var K = !0, z = at(C), j; j = yield z.next(), F = j.done, !F; K = !0) {
                Q = j.value, K = !1;
                const ve = Q;
                yield we.write(ve)
              }
            } catch (ve) {
              H = {
                error: ve
              }
            } finally {
              try {
                !K && !F && (N = z.return) && (yield N.call(z))
              } finally {
                if (H) throw H.error
              }
            }
            yield we.close(), T()
          } catch (G) {
            A(G)
          }
        })).then(() => {
          this.log.debug("preconnect buffer sent successfully", Object.assign(Object.assign({}, this.logContext), te(e)))
        }).catch(T => {
          this.log.error("error sending preconnect buffer", Object.assign(Object.assign(Object.assign({}, this.logContext), te(e)), {
            error: T
          }))
        })
      }
      return D
    })
  }
  get isLocal() {
    return !0
  }
  publishAdditionalCodecForTrack(e, t, n) {
    return b(this, void 0, void 0, function*() {
      var s;
      if (this.encryptionType !== ge.NONE) return;
      let r;
      if (this.trackPublications.forEach(m => {
          m.track && m.track === e && (r = m)
        }), !r) throw new ct("track is not published");
      if (!ht(e)) throw new ct("track is not a video track");
      const a = Object.assign(Object.assign({}, (s = this.roomOptions) === null || s === void 0 ? void 0 : s.publishDefaults), n),
        o = mf(e, t, a);
      if (!o) {
        this.log.info("backup codec has been disabled, ignoring request to add additional codec for track", Object.assign(Object.assign({}, this.logContext), te(e)));
        return
      }
      const c = e.addSimulcastTrack(t, o);
      if (!c) return;
      const d = new pi({
        cid: c.mediaStreamTrack.id,
        type: O.kindToProto(e.kind),
        muted: e.isMuted,
        source: O.sourceToProto(e.source),
        sid: e.sid,
        simulcastCodecs: [{
          codec: a.videoCodec,
          cid: c.mediaStreamTrack.id
        }]
      });
      if (d.layers = ko(d.width, d.height, o), !this.engine || this.engine.isClosed) throw new fe("cannot publish track when not connected");
      const l = () => b(this, void 0, void 0, function*() {
          yield this.engine.createSimulcastSender(e, c, a, o), yield this.engine.negotiate()
        }),
        h = (yield Promise.all([this.engine.addTrack(d), l()]))[0];
      this.log.debug("published ".concat(t, " for track ").concat(e.sid), Object.assign(Object.assign({}, this.logContext), {
        encodings: o,
        trackInfo: h
      }))
    })
  }
  unpublishTrack(e, t) {
    return b(this, void 0, void 0, function*() {
      var n, s;
      if (Kt(e)) {
        const d = this.pendingPublishPromises.get(e);
        d && (this.log.info("awaiting publish promise before attempting to unpublish", Object.assign(Object.assign({}, this.logContext), te(e))), yield d)
      }
      const r = this.getPublicationForTrack(e),
        a = r ? te(r) : void 0;
      if (this.log.debug("unpublishing track", Object.assign(Object.assign({}, this.logContext), a)), !r || !r.track) {
        this.log.warn("track was not unpublished because no publication was found", Object.assign(Object.assign({}, this.logContext), a));
        return
      }
      e = r.track, e.off(B.Muted, this.onTrackMuted), e.off(B.Unmuted, this.onTrackUnmuted), e.off(B.Ended, this.handleTrackEnded), e.off(B.UpstreamPaused, this.onTrackUpstreamPaused), e.off(B.UpstreamResumed, this.onTrackUpstreamResumed), e.off(B.AudioTrackFeatureUpdate, this.onTrackFeatureUpdate), t === void 0 && (t = (s = (n = this.roomOptions) === null || n === void 0 ? void 0 : n.stopLocalTrackOnUnpublish) !== null && s !== void 0 ? s : !0), t ? e.stop() : e.stopMonitor();
      let o = !1;
      const c = e.sender;
      if (e.sender = void 0, this.engine.pcManager && this.engine.pcManager.currentState < le.FAILED && c) try {
        for (const d of this.engine.pcManager.publisher.getTransceivers()) d.sender === c && (d.direction = "inactive", o = !0);
        if (this.engine.removeTrack(c) && (o = !0), ht(e)) {
          for (const [, d] of e.simulcastCodecs) d.sender && (this.engine.removeTrack(d.sender) && (o = !0), d.sender = void 0);
          e.simulcastCodecs.clear()
        }
      } catch (d) {
        this.log.warn("failed to unpublish track", Object.assign(Object.assign(Object.assign({}, this.logContext), a), {
          error: d
        }))
      }
      switch (this.trackPublications.delete(r.trackSid), r.kind) {
        case O.Kind.Audio:
          this.audioTrackPublications.delete(r.trackSid);
          break;
        case O.Kind.Video:
          this.videoTrackPublications.delete(r.trackSid);
          break
      }
      return this.emit(W.LocalTrackUnpublished, r), r.setTrack(void 0), o && (yield this.engine.negotiate()), r
    })
  }
  unpublishTracks(e) {
    return b(this, void 0, void 0, function*() {
      return (yield Promise.all(e.map(n => this.unpublishTrack(n)))).filter(n => !!n)
    })
  }
  republishAllTracks(e) {
    return b(this, arguments, void 0, function(t) {
      var n = this;
      let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
      return function*() {
        n.republishPromise && (yield n.republishPromise), n.republishPromise = new Ee((r, a) => b(n, void 0, void 0, function*() {
          try {
            const o = [];
            this.trackPublications.forEach(c => {
              c.track && (t && (c.options = Object.assign(Object.assign({}, c.options), t)), o.push(c))
            }), yield Promise.all(o.map(c => b(this, void 0, void 0, function*() {
              const d = c.track;
              yield this.unpublishTrack(d, !1), s && !d.isMuted && d.source !== O.Source.ScreenShare && d.source !== O.Source.ScreenShareAudio && (it(d) || ht(d)) && !d.isUserProvided && (this.log.debug("restarting existing track", Object.assign(Object.assign({}, this.logContext), {
                track: c.trackSid
              })), yield d.restartTrack()), yield this.publishOrRepublishTrack(d, c.options, !0)
            }))), r()
          } catch (o) {
            o instanceof Error ? a(o) : a(new Error(String(o)))
          } finally {
            this.republishPromise = void 0
          }
        })), yield n.republishPromise
      }()
    })
  }
  publishData(e) {
    return b(this, arguments, void 0, function(t) {
      var n = this;
      let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return function*() {
        const r = s.reliable ? ee.RELIABLE : ee.LOSSY,
          a = s.destinationIdentities,
          o = s.topic;
        let c = new Is({
          participantIdentity: n.identity,
          payload: t,
          destinationIdentities: a,
          topic: o
        });
        const d = new Re({
          kind: r,
          value: {
            case: "user",
            value: c
          }
        });
        yield n.engine.sendDataPacket(d, r)
      }()
    })
  }
  publishDtmf(e, t) {
    return b(this, void 0, void 0, function*() {
      const n = new Re({
        kind: ee.RELIABLE,
        value: {
          case: "sipDtmf",
          value: new ba({
            code: e,
            digit: t
          })
        }
      });
      yield this.engine.sendDataPacket(n, ee.RELIABLE)
    })
  }
  sendChatMessage(e, t) {
    return b(this, void 0, void 0, function*() {
      const n = {
          id: crypto.randomUUID(),
          message: e,
          timestamp: Date.now(),
          attachedFiles: t == null ? void 0 : t.attachments
        },
        s = new Re({
          value: {
            case: "chatMessage",
            value: new Hi(Object.assign(Object.assign({}, n), {
              timestamp: de.parse(n.timestamp)
            }))
          }
        });
      return yield this.engine.sendDataPacket(s, ee.RELIABLE), this.emit(W.ChatMessage, n), n
    })
  }
  editChatMessage(e, t) {
    return b(this, void 0, void 0, function*() {
      const n = Object.assign(Object.assign({}, t), {
          message: e,
          editTimestamp: Date.now()
        }),
        s = new Re({
          value: {
            case: "chatMessage",
            value: new Hi(Object.assign(Object.assign({}, n), {
              timestamp: de.parse(n.timestamp),
              editTimestamp: de.parse(n.editTimestamp)
            }))
          }
        });
      return yield this.engine.sendDataPacket(s, ee.RELIABLE), this.emit(W.ChatMessage, n), n
    })
  }
  sendText(e, t) {
    return b(this, void 0, void 0, function*() {
      return this.roomOutgoingDataStreamManager.sendText(e, t)
    })
  }
  streamText(e) {
    return b(this, void 0, void 0, function*() {
      return this.roomOutgoingDataStreamManager.streamText(e)
    })
  }
  sendFile(e, t) {
    return b(this, void 0, void 0, function*() {
      return this.roomOutgoingDataStreamManager.sendFile(e, t)
    })
  }
  streamBytes(e) {
    return b(this, void 0, void 0, function*() {
      return this.roomOutgoingDataStreamManager.streamBytes(e)
    })
  }
  performRpc(e) {
    let {
      destinationIdentity: t,
      method: n,
      payload: s,
      responseTimeout: r = 15e3
    } = e;
    const a = 7e3,
      o = a + 1e3;
    return new Ee((c, d) => b(this, void 0, void 0, function*() {
      var l, u, h, m;
      if ($s(s) > Oc) {
        d(me.builtIn("REQUEST_PAYLOAD_TOO_LARGE"));
        return
      }
      if (!((u = (l = this.engine.latestJoinResponse) === null || l === void 0 ? void 0 : l.serverInfo) === null || u === void 0) && u.version && Ze((m = (h = this.engine.latestJoinResponse) === null || h === void 0 ? void 0 : h.serverInfo) === null || m === void 0 ? void 0 : m.version, "1.8.0") < 0) {
        d(me.builtIn("UNSUPPORTED_SERVER"));
        return
      }
      const f = Math.max(r, o),
        p = crypto.randomUUID();
      yield this.publishRpcRequest(t, p, n, s, f);
      const _ = setTimeout(() => {
        this.pendingAcks.delete(p), d(me.builtIn("CONNECTION_TIMEOUT")), this.pendingResponses.delete(p), clearTimeout(w)
      }, a);
      this.pendingAcks.set(p, {
        resolve: () => {
          clearTimeout(_)
        },
        participantIdentity: t
      });
      const w = setTimeout(() => {
        this.pendingResponses.delete(p), d(me.builtIn("RESPONSE_TIMEOUT"))
      }, r);
      this.pendingResponses.set(p, {
        resolve: (k, P) => {
          clearTimeout(w), this.pendingAcks.has(p) && (this.log.warn("RPC response received before ack", p), this.pendingAcks.delete(p), clearTimeout(_)), P ? d(P) : c(k ?? "")
        },
        participantIdentity: t
      })
    }))
  }
  registerRpcMethod(e, t) {
    this.rpcHandlers.has(e) && this.log.warn("you're overriding the RPC handler for method ".concat(e, ", in the future this will throw an error")), this.rpcHandlers.set(e, t)
  }
  unregisterRpcMethod(e) {
    this.rpcHandlers.delete(e)
  }
  setTrackSubscriptionPermissions(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
    this.participantTrackPermissions = t, this.allParticipantsAllowedToSubscribe = e, this.engine.client.isDisconnected || this.updateTrackSubscriptionPermissions()
  }
  handleIncomingRpcAck(e) {
    const t = this.pendingAcks.get(e);
    t ? (t.resolve(), this.pendingAcks.delete(e)) : console.error("Ack received for unexpected RPC request", e)
  }
  handleIncomingRpcResponse(e, t, n) {
    const s = this.pendingResponses.get(e);
    s ? (s.resolve(t, n), this.pendingResponses.delete(e)) : console.error("Response received for unexpected RPC request", e)
  }
  publishRpcRequest(e, t, n, s, r) {
    return b(this, void 0, void 0, function*() {
      const a = new Re({
        destinationIdentities: [e],
        kind: ee.RELIABLE,
        value: {
          case: "rpcRequest",
          value: new xs({
            id: t,
            method: n,
            payload: s,
            responseTimeoutMs: r,
            version: 1
          })
        }
      });
      yield this.engine.sendDataPacket(a, ee.RELIABLE)
    })
  }
  handleParticipantDisconnected(e) {
    for (const [t, {
        participantIdentity: n
      }] of this.pendingAcks) n === e && this.pendingAcks.delete(t);
    for (const [t, {
        participantIdentity: n,
        resolve: s
      }] of this.pendingResponses) n === e && (s(null, me.builtIn("RECIPIENT_DISCONNECTED")), this.pendingResponses.delete(t))
  }
  setEnabledPublishCodecs(e) {
    this.enabledPublishVideoCodecs = e.filter(t => t.mime.split("/")[0].toLowerCase() === "video")
  }
  updateInfo(e) {
    return super.updateInfo(e) ? (e.tracks.forEach(t => {
      var n, s;
      const r = this.trackPublications.get(t.sid);
      if (r) {
        const a = r.isMuted || ((s = (n = r.track) === null || n === void 0 ? void 0 : n.isUpstreamPaused) !== null && s !== void 0 ? s : !1);
        a !== t.muted && (this.log.debug("updating server mute state after reconcile", Object.assign(Object.assign(Object.assign({}, this.logContext), te(r)), {
          mutedOnServer: a
        })), this.engine.client.sendMuteTrack(t.sid, a))
      }
    }), !0) : !1
  }
  setActiveAgent(e) {
    var t, n, s, r;
    this.firstActiveAgent = e, e && !this.firstActiveAgent && (this.firstActiveAgent = e), e ? (n = (t = this.activeAgentFuture) === null || t === void 0 ? void 0 : t.resolve) === null || n === void 0 || n.call(t, e) : (r = (s = this.activeAgentFuture) === null || s === void 0 ? void 0 : s.reject) === null || r === void 0 || r.call(s, new Error("Agent disconnected")), this.activeAgentFuture = void 0
  }
  waitUntilActiveAgentPresent() {
    return this.firstActiveAgent ? Promise.resolve(this.firstActiveAgent) : (this.activeAgentFuture || (this.activeAgentFuture = new Le), this.activeAgentFuture.promise)
  }
  getPublicationForTrack(e) {
    let t;
    return this.trackPublications.forEach(n => {
      const s = n.track;
      s && (e instanceof MediaStreamTrack ? (it(s) || ht(s)) && s.mediaStreamTrack === e && (t = n) : e === s && (t = n))
    }), t
  }
  waitForPendingPublicationOfSource(e) {
    return b(this, void 0, void 0, function*() {
      const n = Date.now();
      for (; Date.now() < n + 1e4;) {
        const s = Array.from(this.pendingPublishPromises.entries()).find(r => {
          let [a] = r;
          return a.source === e
        });
        if (s) return s[1];
        yield Ce(20)
      }
    })
  }
}
class jf extends nt {
  constructor(e, t, n, s) {
    super(e, t.sid, t.name, s), this.track = void 0, this.allowed = !0, this.requestedDisabled = void 0, this.visible = !0, this.handleEnded = r => {
      this.setTrack(void 0), this.emit(B.Ended, r)
    }, this.handleVisibilityChange = r => {
      this.log.debug("adaptivestream video visibility ".concat(this.trackSid, ", visible=").concat(r), this.logContext), this.visible = r, this.emitTrackUpdate()
    }, this.handleVideoDimensionsChange = r => {
      this.log.debug("adaptivestream video dimensions ".concat(r.width, "x").concat(r.height), this.logContext), this.videoDimensionsAdaptiveStream = r, this.emitTrackUpdate()
    }, this.subscribed = n, this.updateInfo(t)
  }
  setSubscribed(e) {
    const t = this.subscriptionStatus,
      n = this.permissionStatus;
    this.subscribed = e, e && (this.allowed = !0);
    const s = new an({
      trackSids: [this.trackSid],
      subscribe: this.subscribed,
      participantTracks: [new ka({
        participantSid: "",
        trackSids: [this.trackSid]
      })]
    });
    this.emit(B.UpdateSubscription, s), this.emitSubscriptionUpdateIfChanged(t), this.emitPermissionUpdateIfChanged(n)
  }
  get subscriptionStatus() {
    return this.subscribed === !1 ? nt.SubscriptionStatus.Unsubscribed : super.isSubscribed ? nt.SubscriptionStatus.Subscribed : nt.SubscriptionStatus.Desired
  }
  get permissionStatus() {
    return this.allowed ? nt.PermissionStatus.Allowed : nt.PermissionStatus.NotAllowed
  }
  get isSubscribed() {
    return this.subscribed === !1 ? !1 : super.isSubscribed
  }
  get isDesired() {
    return this.subscribed !== !1
  }
  get isEnabled() {
    return this.requestedDisabled !== void 0 ? !this.requestedDisabled : this.isAdaptiveStream ? this.visible : !0
  }
  get isLocal() {
    return !1
  }
  setEnabled(e) {
    !this.isManualOperationAllowed() || this.requestedDisabled === !e || (this.requestedDisabled = !e, this.emitTrackUpdate())
  }
  setVideoQuality(e) {
    !this.isManualOperationAllowed() || this.requestedMaxQuality === e || (this.requestedMaxQuality = e, this.requestedVideoDimensions = void 0, this.emitTrackUpdate())
  }
  setVideoDimensions(e) {
    var t, n;
    this.isManualOperationAllowed() && (((t = this.requestedVideoDimensions) === null || t === void 0 ? void 0 : t.width) === e.width && ((n = this.requestedVideoDimensions) === null || n === void 0 ? void 0 : n.height) === e.height || (En(this.track) && (this.requestedVideoDimensions = e), this.requestedMaxQuality = void 0, this.emitTrackUpdate()))
  }
  setVideoFPS(e) {
    this.isManualOperationAllowed() && En(this.track) && this.fps !== e && (this.fps = e, this.emitTrackUpdate())
  }
  get videoQuality() {
    var e;
    return (e = this.requestedMaxQuality) !== null && e !== void 0 ? e : De.HIGH
  }
  setTrack(e) {
    const t = this.subscriptionStatus,
      n = this.permissionStatus,
      s = this.track;
    s !== e && (s && (s.off(B.VideoDimensionsChanged, this.handleVideoDimensionsChange), s.off(B.VisibilityChanged, this.handleVisibilityChange), s.off(B.Ended, this.handleEnded), s.detach(), s.stopMonitor(), this.emit(B.Unsubscribed, s)), super.setTrack(e), e && (e.sid = this.trackSid, e.on(B.VideoDimensionsChanged, this.handleVideoDimensionsChange), e.on(B.VisibilityChanged, this.handleVisibilityChange), e.on(B.Ended, this.handleEnded), this.emit(B.Subscribed, e)), this.emitPermissionUpdateIfChanged(n), this.emitSubscriptionUpdateIfChanged(t))
  }
  setAllowed(e) {
    const t = this.subscriptionStatus,
      n = this.permissionStatus;
    this.allowed = e, this.emitPermissionUpdateIfChanged(n), this.emitSubscriptionUpdateIfChanged(t)
  }
  setSubscriptionError(e) {
    this.emit(B.SubscriptionFailed, e)
  }
  updateInfo(e) {
    super.updateInfo(e);
    const t = this.metadataMuted;
    this.metadataMuted = e.muted, this.track ? this.track.setMuted(e.muted) : t !== e.muted && this.emit(e.muted ? B.Muted : B.Unmuted)
  }
  emitSubscriptionUpdateIfChanged(e) {
    const t = this.subscriptionStatus;
    e !== t && this.emit(B.SubscriptionStatusChanged, t, e)
  }
  emitPermissionUpdateIfChanged(e) {
    this.permissionStatus !== e && this.emit(B.SubscriptionPermissionChanged, this.permissionStatus, e)
  }
  isManualOperationAllowed() {
    return this.isDesired ? !0 : (this.log.warn("cannot update track settings when not subscribed", this.logContext), !1)
  }
  get isAdaptiveStream() {
    return En(this.track) && this.track.isAdaptiveStream
  }
  emitTrackUpdate() {
    const e = new Oa({
      trackSids: [this.trackSid],
      disabled: !this.isEnabled,
      fps: this.fps
    });
    if (this.kind === O.Kind.Video) {
      let t = this.requestedVideoDimensions;
      if (this.videoDimensionsAdaptiveStream !== void 0)
        if (t) zr(this.videoDimensionsAdaptiveStream, t) && (this.log.debug("using adaptive stream dimensions instead of requested", Object.assign(Object.assign({}, this.logContext), this.videoDimensionsAdaptiveStream)), t = this.videoDimensionsAdaptiveStream);
        else if (this.requestedMaxQuality !== void 0 && this.trackInfo) {
        const n = em(this.trackInfo, this.requestedMaxQuality);
        n && zr(this.videoDimensionsAdaptiveStream, n) && (this.log.debug("using adaptive stream dimensions instead of max quality layer", Object.assign(Object.assign({}, this.logContext), this.videoDimensionsAdaptiveStream)), t = this.videoDimensionsAdaptiveStream)
      } else this.log.debug("using adaptive stream dimensions", Object.assign(Object.assign({}, this.logContext), this.videoDimensionsAdaptiveStream)), t = this.videoDimensionsAdaptiveStream;
      t ? (e.width = Math.ceil(t.width), e.height = Math.ceil(t.height)) : this.requestedMaxQuality !== void 0 ? (this.log.debug("using requested max quality", Object.assign(Object.assign({}, this.logContext), {
        quality: this.requestedMaxQuality
      })), e.quality = this.requestedMaxQuality) : (this.log.debug("using default quality", Object.assign(Object.assign({}, this.logContext), {
        quality: De.HIGH
      })), e.quality = De.HIGH)
    }
    this.emit(B.UpdateSettings, e)
  }
}
class Yi extends Fc {
  static fromParticipantInfo(e, t, n) {
    return new Yi(e, t.sid, t.identity, t.name, t.metadata, t.attributes, n, t.kind)
  }
  get logContext() {
    return Object.assign(Object.assign({}, super.logContext), {
      rpID: this.sid,
      remoteParticipant: this.identity
    })
  }
  constructor(e, t, n, s, r, a, o) {
    let c = arguments.length > 7 && arguments[7] !== void 0 ? arguments[7] : fi.STANDARD;
    super(t, n || "", s, r, a, o, c), this.signalClient = e, this.trackPublications = new Map, this.audioTrackPublications = new Map, this.videoTrackPublications = new Map, this.volumeMap = new Map
  }
  addTrackPublication(e) {
    super.addTrackPublication(e), e.on(B.UpdateSettings, t => {
      this.log.debug("send update settings", Object.assign(Object.assign(Object.assign({}, this.logContext), te(e)), {
        settings: t
      })), this.signalClient.sendUpdateTrackSettings(t)
    }), e.on(B.UpdateSubscription, t => {
      t.participantTracks.forEach(n => {
        n.participantSid = this.sid
      }), this.signalClient.sendUpdateSubscription(t)
    }), e.on(B.SubscriptionPermissionChanged, t => {
      this.emit(W.TrackSubscriptionPermissionChanged, e, t)
    }), e.on(B.SubscriptionStatusChanged, t => {
      this.emit(W.TrackSubscriptionStatusChanged, e, t)
    }), e.on(B.Subscribed, t => {
      this.emit(W.TrackSubscribed, t, e)
    }), e.on(B.Unsubscribed, t => {
      this.emit(W.TrackUnsubscribed, t, e)
    }), e.on(B.SubscriptionFailed, t => {
      this.emit(W.TrackSubscriptionFailed, e.trackSid, t)
    })
  }
  getTrackPublication(e) {
    const t = super.getTrackPublication(e);
    if (t) return t
  }
  getTrackPublicationByName(e) {
    const t = super.getTrackPublicationByName(e);
    if (t) return t
  }
  setVolume(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : O.Source.Microphone;
    this.volumeMap.set(t, e);
    const n = this.getTrackPublication(t);
    n && n.track && n.track.setVolume(e)
  }
  getVolume() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : O.Source.Microphone;
    const t = this.getTrackPublication(e);
    return t && t.track ? t.track.getVolume() : this.volumeMap.get(e)
  }
  addSubscribedMediaTrack(e, t, n, s, r, a) {
    let o = this.getTrackPublicationBySid(t);
    if (o || t.startsWith("TR") || this.trackPublications.forEach(l => {
        !o && e.kind === l.kind.toString() && (o = l)
      }), !o) {
      if (a === 0) {
        this.log.error("could not find published track", Object.assign(Object.assign({}, this.logContext), {
          trackSid: t
        })), this.emit(W.TrackSubscriptionFailed, t);
        return
      }
      a === void 0 && (a = 20), setTimeout(() => {
        this.addSubscribedMediaTrack(e, t, n, s, r, a - 1)
      }, 150);
      return
    }
    if (e.readyState === "ended") {
      this.log.error("unable to subscribe because MediaStreamTrack is ended. Do not call MediaStreamTrack.stop()", Object.assign(Object.assign({}, this.logContext), te(o))), this.emit(W.TrackSubscriptionFailed, t);
      return
    }
    const c = e.kind === "video";
    let d;
    return c ? d = new Mf(e, t, s, r) : d = new xf(e, t, s, this.audioContext, this.audioOutput), d.source = o.source, d.isMuted = o.isMuted, d.setMediaStream(n), d.start(), o.setTrack(d), this.volumeMap.has(o.source) && ds(d) && Qe(d) && d.setVolume(this.volumeMap.get(o.source)), o
  }
  get hasMetadata() {
    return !!this.participantInfo
  }
  getTrackPublicationBySid(e) {
    return this.trackPublications.get(e)
  }
  updateInfo(e) {
    if (!super.updateInfo(e)) return !1;
    const t = new Map,
      n = new Map;
    return e.tracks.forEach(s => {
      var r, a;
      let o = this.getTrackPublicationBySid(s.sid);
      if (o) o.updateInfo(s);
      else {
        const c = O.kindFromProto(s.type);
        if (!c) return;
        o = new jf(c, s, (r = this.signalClient.connectOptions) === null || r === void 0 ? void 0 : r.autoSubscribe, {
          loggerContextCb: () => this.logContext,
          loggerName: (a = this.loggerOptions) === null || a === void 0 ? void 0 : a.loggerName
        }), o.updateInfo(s), n.set(s.sid, o);
        const d = Array.from(this.trackPublications.values()).find(l => l.source === (o == null ? void 0 : o.source));
        d && o.source !== O.Source.Unknown && this.log.debug("received a second track publication for ".concat(this.identity, " with the same source: ").concat(o.source), Object.assign(Object.assign({}, this.logContext), {
          oldTrack: te(d),
          newTrack: te(o)
        })), this.addTrackPublication(o)
      }
      t.set(s.sid, o)
    }), this.trackPublications.forEach(s => {
      t.has(s.trackSid) || (this.log.trace("detected removed track on remote participant, unpublishing", Object.assign(Object.assign({}, this.logContext), te(s))), this.unpublishTrack(s.trackSid, !0))
    }), n.forEach(s => {
      this.emit(W.TrackPublished, s)
    }), !0
  }
  unpublishTrack(e, t) {
    const n = this.trackPublications.get(e);
    if (!n) return;
    const {
      track: s
    } = n;
    switch (s && (s.stop(), n.setTrack(void 0)), this.trackPublications.delete(e), n.kind) {
      case O.Kind.Audio:
        this.audioTrackPublications.delete(e);
        break;
      case O.Kind.Video:
        this.videoTrackPublications.delete(e);
        break
    }
    t && this.emit(W.TrackUnpublished, n)
  }
  setAudioOutput(e) {
    return b(this, void 0, void 0, function*() {
      this.audioOutput = e;
      const t = [];
      this.audioTrackPublications.forEach(n => {
        var s;
        Qe(n.track) && ds(n.track) && t.push(n.track.setSinkId((s = e.deviceId) !== null && s !== void 0 ? s : "default"))
      }), yield Promise.all(t)
    })
  }
  emit(e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++) n[s - 1] = arguments[s];
    return this.log.trace("participant event", Object.assign(Object.assign({}, this.logContext), {
      event: e,
      args: n
    })), super.emit(e, ...n)
  }
}
var re;
(function(i) {
  i.Disconnected = "disconnected", i.Connecting = "connecting", i.Connected = "connected", i.Reconnecting = "reconnecting", i.SignalReconnecting = "signalReconnecting"
})(re || (re = {}));
const Ff = 4 * 1e3;
class $t extends et.EventEmitter {
  get hasE2EESetup() {
    return this.e2eeManager !== void 0
  }
  constructor(e) {
    var t, n, s, r, a;
    if (super(), t = this, this.state = re.Disconnected, this.activeSpeakers = [], this.isE2EEEnabled = !1, this.audioEnabled = !0, this.isVideoPlaybackBlocked = !1, this.log = X, this.bufferedEvents = [], this.isResuming = !1, this.rpcHandlers = new Map, this.connect = (o, c, d) => b(this, void 0, void 0, function*() {
        var l;
        if (!om()) throw Xe() ? Error("WebRTC isn't detected, have you called registerGlobals?") : Error("LiveKit doesn't seem to be supported on this browser. Try to update your browser and make sure no browser extensions are disabling webRTC.");
        const u = yield this.disconnectLock.lock();
        if (this.state === re.Connected) return this.log.info("already connected to room ".concat(this.name), this.logContext), u(), Promise.resolve();
        if (this.connectFuture) return u(), this.connectFuture.promise;
        this.setAndEmitConnectionState(re.Connecting), ((l = this.regionUrlProvider) === null || l === void 0 ? void 0 : l.getServerUrl().toString()) !== _c(o) && (this.regionUrl = void 0, this.regionUrlProvider = void 0), zt(new URL(o)) && (this.regionUrlProvider === void 0 ? this.regionUrlProvider = new se(o, c) : this.regionUrlProvider.updateToken(c), this.regionUrlProvider.fetchRegionSettings().then(f => {
          var p;
          (p = this.regionUrlProvider) === null || p === void 0 || p.setServerReportedRegions(f)
        }).catch(f => {
          this.log.warn("could not fetch region settings", Object.assign(Object.assign({}, this.logContext), {
            error: f
          }))
        }));
        const h = (f, p, _) => b(this, void 0, void 0, function*() {
            var w, k;
            this.abortController && this.abortController.abort();
            const P = new AbortController;
            this.abortController = P, u == null || u();
            try {
              if (yield Gt.getInstance().getBackOffPromise(o), P.signal.aborted) throw $.cancelled("Connection attempt aborted");
              yield this.attemptConnection(_ ?? o, c, d, P), this.abortController = void 0, f()
            } catch (y) {
              if (this.regionUrlProvider && y instanceof $ && y.reason !== ce.Cancelled && y.reason !== ce.NotAllowed) {
                let S = null;
                try {
                  this.log.debug("Fetching next region"), S = yield this.regionUrlProvider.getNextBestRegionUrl((w = this.abortController) === null || w === void 0 ? void 0 : w.signal)
                } catch (E) {
                  if (E instanceof $ && (E.status === 401 || E.reason === ce.Cancelled)) {
                    this.handleDisconnect(this.options.stopLocalTrackOnUnpublish), p(E);
                    return
                  }
                } [ce.InternalError, ce.ServerUnreachable, ce.Timeout].includes(y.reason) && (this.log.debug("Adding failed connection attempt to back off"), Gt.getInstance().addFailedConnectionAttempt(o)), S && !(!((k = this.abortController) === null || k === void 0) && k.signal.aborted) ? (this.log.info("Initial connection failed with ConnectionError: ".concat(y.message, ". Retrying with another region: ").concat(S), this.logContext), this.recreateEngine(), yield h(f, p, S)) : (this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, to(y)), p(y))
              } else {
                let S = He.UNKNOWN_REASON;
                y instanceof $ && (S = to(y)), this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, S), p(y)
              }
            }
          }),
          m = this.regionUrl;
        return this.regionUrl = void 0, this.connectFuture = new Le((f, p) => {
          h(f, p, m)
        }, () => {
          this.clearConnectionFutures()
        }), this.connectFuture.promise
      }), this.connectSignal = (o, c, d, l, u, h) => b(this, void 0, void 0, function*() {
        var m, f, p;
        const _ = yield d.join(o, c, {
          autoSubscribe: l.autoSubscribe,
          adaptiveStream: typeof u.adaptiveStream == "object" ? !0 : u.adaptiveStream,
          maxRetries: l.maxRetries,
          e2eeEnabled: !!this.e2eeManager,
          websocketTimeout: l.websocketTimeout
        }, h.signal, !u.singlePeerConnection);
        let w = _.serverInfo;
        if (w || (w = {
            version: _.serverVersion,
            region: _.serverRegion
          }), this.serverInfo = w, this.log.debug("connected to Livekit Server ".concat(Object.entries(w).map(k => {
            let [P, y] = k;
            return "".concat(P, ": ").concat(y)
          }).join(", ")), {
            room: (m = _.room) === null || m === void 0 ? void 0 : m.name,
            roomSid: (f = _.room) === null || f === void 0 ? void 0 : f.sid,
            identity: (p = _.participant) === null || p === void 0 ? void 0 : p.identity
          }), !w.version) throw new qh("unknown server version");
        return w.version === "0.15.1" && this.options.dynacast && (this.log.debug("disabling dynacast due to server version", this.logContext), u.dynacast = !1), _
      }), this.applyJoinResponse = o => {
        const c = o.participant;
        if (this.localParticipant.sid = c.sid, this.localParticipant.identity = c.identity, this.localParticipant.setEnabledPublishCodecs(o.enabledPublishCodecs), this.e2eeManager) try {
          this.e2eeManager.setSifTrailer(o.sifTrailer)
        } catch (d) {
          this.log.error(d instanceof Error ? d.message : "Could not set SifTrailer", Object.assign(Object.assign({}, this.logContext), {
            error: d
          }))
        }
        this.handleParticipantUpdates([c, ...o.otherParticipants]), o.room && this.handleRoomUpdate(o.room)
      }, this.attemptConnection = (o, c, d, l) => b(this, void 0, void 0, function*() {
        var u, h;
        this.state === re.Reconnecting || this.isResuming || !((u = this.engine) === null || u === void 0) && u.pendingReconnect ? (this.log.info("Reconnection attempt replaced by new connection attempt", this.logContext), this.recreateEngine()) : this.maybeCreateEngine(), !((h = this.regionUrlProvider) === null || h === void 0) && h.isCloud() && this.engine.setRegionUrlProvider(this.regionUrlProvider), this.acquireAudioContext(), this.connOptions = Object.assign(Object.assign({}, zs), d), this.connOptions.rtcConfig && (this.engine.rtcConfig = this.connOptions.rtcConfig), this.connOptions.peerConnectionTimeout && (this.engine.peerConnectionTimeout = this.connOptions.peerConnectionTimeout);
        try {
          const m = yield this.connectSignal(o, c, this.engine, this.connOptions, this.options, l);
          this.applyJoinResponse(m), this.setupLocalParticipantEvents(), this.emit(U.SignalConnected)
        } catch (m) {
          yield this.engine.close(), this.recreateEngine();
          const f = l.signal.aborted ? $.cancelled("Signal connection aborted") : $.serverUnreachable("could not establish signal connection");
          throw m instanceof Error && (f.message = "".concat(f.message, ": ").concat(m.message)), m instanceof $ && (f.reason = m.reason, f.status = m.status), this.log.debug("error trying to establish signal connection", Object.assign(Object.assign({}, this.logContext), {
            error: m
          })), f
        }
        if (l.signal.aborted) throw yield this.engine.close(), this.recreateEngine(), $.cancelled("Connection attempt aborted");
        try {
          yield this.engine.waitForPCInitialConnection(this.connOptions.peerConnectionTimeout, l)
        } catch (m) {
          throw yield this.engine.close(), this.recreateEngine(), m
        }
        Me() && this.options.disconnectOnPageLeave && (window.addEventListener("pagehide", this.onPageLeave), window.addEventListener("beforeunload", this.onPageLeave)), Me() && window.addEventListener("freeze", this.onPageLeave), this.setAndEmitConnectionState(re.Connected), this.emit(U.Connected), Gt.getInstance().resetFailedConnectionAttempts(o), this.registerConnectionReconcile(), this.regionUrlProvider && this.regionUrlProvider.notifyConnected()
      }), this.disconnect = function() {
        for (var o = arguments.length, c = new Array(o), d = 0; d < o; d++) c[d] = arguments[d];
        return b(t, [...c], void 0, function() {
          var l = this;
          let u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
          return function*() {
            var h, m, f;
            const p = yield l.disconnectLock.lock();
            try {
              if (l.state === re.Disconnected) {
                l.log.debug("already disconnected", l.logContext);
                return
              }
              if (l.log.info("disconnect from room", Object.assign({}, l.logContext)), l.state === re.Connecting || l.state === re.Reconnecting || l.isResuming) {
                const _ = "Abort connection attempt due to user initiated disconnect";
                l.log.warn(_, l.logContext), (h = l.abortController) === null || h === void 0 || h.abort(_), (f = (m = l.connectFuture) === null || m === void 0 ? void 0 : m.reject) === null || f === void 0 || f.call(m, $.cancelled("Client initiated disconnect")), l.connectFuture = void 0
              }
              l.engine && (l.engine.client.isDisconnected || (yield l.engine.client.sendLeave()), yield l.engine.close()), l.handleDisconnect(u, He.CLIENT_INITIATED), l.engine = void 0
            } finally {
              p()
            }
          }()
        })
      }, this.onPageLeave = () => b(this, void 0, void 0, function*() {
        this.log.info("Page leave detected, disconnecting", this.logContext), yield this.disconnect()
      }), this.startAudio = () => b(this, void 0, void 0, function*() {
        const o = [],
          c = Oe();
        if (c && c.os === "iOS") {
          const d = "livekit-dummy-audio-el";
          let l = document.getElementById(d);
          if (!l) {
            l = document.createElement("audio"), l.id = d, l.autoplay = !0, l.hidden = !0;
            const u = wn();
            u.enabled = !0;
            const h = new MediaStream([u]);
            l.srcObject = h, document.addEventListener("visibilitychange", () => {
              l && (l.srcObject = document.hidden ? null : h, document.hidden || (this.log.debug("page visible again, triggering startAudio to resume playback and update playback status", this.logContext), this.startAudio()))
            }), document.body.append(l), this.once(U.Disconnected, () => {
              l == null || l.remove(), l = null
            })
          }
          o.push(l)
        }
        this.remoteParticipants.forEach(d => {
          d.audioTrackPublications.forEach(l => {
            l.track && l.track.attachedElements.forEach(u => {
              o.push(u)
            })
          })
        });
        try {
          yield Promise.all([this.acquireAudioContext(), ...o.map(d => (d.muted = !1, d.play()))]), this.handleAudioPlaybackStarted()
        } catch (d) {
          throw this.handleAudioPlaybackFailed(d), d
        }
      }), this.startVideo = () => b(this, void 0, void 0, function*() {
        const o = [];
        for (const c of this.remoteParticipants.values()) c.videoTrackPublications.forEach(d => {
          var l;
          (l = d.track) === null || l === void 0 || l.attachedElements.forEach(u => {
            o.includes(u) || o.push(u)
          })
        });
        yield Promise.all(o.map(c => c.play())).then(() => {
          this.handleVideoPlaybackStarted()
        }).catch(c => {
          c.name === "NotAllowedError" ? this.handleVideoPlaybackFailed() : this.log.warn("Resuming video playback failed, make sure you call `startVideo` directly in a user gesture handler", this.logContext)
        })
      }), this.handleRestarting = () => {
        this.clearConnectionReconcile(), this.isResuming = !1;
        for (const o of this.remoteParticipants.values()) this.handleParticipantDisconnected(o.identity, o);
        this.setAndEmitConnectionState(re.Reconnecting) && this.emit(U.Reconnecting)
      }, this.handleSignalRestarted = o => b(this, void 0, void 0, function*() {
        this.log.debug("signal reconnected to server, region ".concat(o.serverRegion), Object.assign(Object.assign({}, this.logContext), {
          region: o.serverRegion
        })), this.bufferedEvents = [], this.applyJoinResponse(o);
        try {
          yield this.localParticipant.republishAllTracks(void 0, !0)
        } catch (c) {
          this.log.error("error trying to re-publish tracks after reconnection", Object.assign(Object.assign({}, this.logContext), {
            error: c
          }))
        }
        try {
          yield this.engine.waitForRestarted(), this.log.debug("fully reconnected to server", Object.assign(Object.assign({}, this.logContext), {
            region: o.serverRegion
          }))
        } catch {
          return
        }
        this.setAndEmitConnectionState(re.Connected), this.emit(U.Reconnected), this.registerConnectionReconcile(), this.emitBufferedEvents()
      }), this.handleParticipantUpdates = o => {
        o.forEach(c => {
          var d;
          if (c.identity === this.localParticipant.identity) {
            this.localParticipant.updateInfo(c);
            return
          }
          c.identity === "" && (c.identity = (d = this.sidToIdentity.get(c.sid)) !== null && d !== void 0 ? d : "");
          let l = this.remoteParticipants.get(c.identity);
          c.state === Vt.DISCONNECTED ? this.handleParticipantDisconnected(c.identity, l) : l = this.getOrCreateParticipant(c.identity, c)
        })
      }, this.handleActiveSpeakersUpdate = o => {
        const c = [],
          d = {};
        o.forEach(l => {
          if (d[l.sid] = !0, l.sid === this.localParticipant.sid) this.localParticipant.audioLevel = l.level, this.localParticipant.setIsSpeaking(!0), c.push(this.localParticipant);
          else {
            const u = this.getRemoteParticipantBySid(l.sid);
            u && (u.audioLevel = l.level, u.setIsSpeaking(!0), c.push(u))
          }
        }), d[this.localParticipant.sid] || (this.localParticipant.audioLevel = 0, this.localParticipant.setIsSpeaking(!1)), this.remoteParticipants.forEach(l => {
          d[l.sid] || (l.audioLevel = 0, l.setIsSpeaking(!1))
        }), this.activeSpeakers = c, this.emitWhenConnected(U.ActiveSpeakersChanged, c)
      }, this.handleSpeakersChanged = o => {
        const c = new Map;
        this.activeSpeakers.forEach(l => {
          const u = this.remoteParticipants.get(l.identity);
          u && u.sid !== l.sid || c.set(l.sid, l)
        }), o.forEach(l => {
          let u = this.getRemoteParticipantBySid(l.sid);
          l.sid === this.localParticipant.sid && (u = this.localParticipant), u && (u.audioLevel = l.level, u.setIsSpeaking(l.active), l.active ? c.set(l.sid, u) : c.delete(l.sid))
        });
        const d = Array.from(c.values());
        d.sort((l, u) => u.audioLevel - l.audioLevel), this.activeSpeakers = d, this.emitWhenConnected(U.ActiveSpeakersChanged, d)
      }, this.handleStreamStateUpdate = o => {
        o.streamStates.forEach(c => {
          const d = this.getRemoteParticipantBySid(c.participantSid);
          if (!d) return;
          const l = d.getTrackPublicationBySid(c.trackSid);
          if (!l || !l.track) return;
          const u = O.streamStateFromProto(c.state);
          l.track.setStreamState(u), u !== l.track.streamState && (d.emit(W.TrackStreamStateChanged, l, l.track.streamState), this.emitWhenConnected(U.TrackStreamStateChanged, l, l.track.streamState, d))
        })
      }, this.handleSubscriptionPermissionUpdate = o => {
        const c = this.getRemoteParticipantBySid(o.participantSid);
        if (!c) return;
        const d = c.getTrackPublicationBySid(o.trackSid);
        d && d.setAllowed(o.allowed)
      }, this.handleSubscriptionError = o => {
        const c = Array.from(this.remoteParticipants.values()).find(l => l.trackPublications.has(o.trackSid));
        if (!c) return;
        const d = c.getTrackPublicationBySid(o.trackSid);
        d && d.setSubscriptionError(o.err)
      }, this.handleDataPacket = (o, c) => {
        const d = this.remoteParticipants.get(o.participantIdentity);
        if (o.value.case === "user") this.handleUserPacket(d, o.value.value, o.kind, c);
        else if (o.value.case === "transcription") this.handleTranscription(d, o.value.value);
        else if (o.value.case === "sipDtmf") this.handleSipDtmf(d, o.value.value);
        else if (o.value.case === "chatMessage") this.handleChatMessage(d, o.value.value);
        else if (o.value.case === "metrics") this.handleMetrics(o.value.value, d);
        else if (o.value.case === "streamHeader" || o.value.case === "streamChunk" || o.value.case === "streamTrailer") this.handleDataStream(o, c);
        else if (o.value.case === "rpcRequest") {
          const l = o.value.value;
          this.handleIncomingRpcRequest(o.participantIdentity, l.id, l.method, l.payload, l.responseTimeoutMs, l.version)
        }
      }, this.handleUserPacket = (o, c, d, l) => {
        this.emit(U.DataReceived, c.payload, o, d, c.topic, l), o == null || o.emit(W.DataReceived, c.payload, d, l)
      }, this.handleSipDtmf = (o, c) => {
        this.emit(U.SipDTMFReceived, c, o), o == null || o.emit(W.SipDTMFReceived, c)
      }, this.handleTranscription = (o, c) => {
        const d = c.transcribedParticipantIdentity === this.localParticipant.identity ? this.localParticipant : this.getParticipantByIdentity(c.transcribedParticipantIdentity),
          l = d == null ? void 0 : d.trackPublications.get(c.trackId),
          u = pm(c, this.transcriptionReceivedTimes);
        l == null || l.emit(B.TranscriptionReceived, u), d == null || d.emit(W.TranscriptionReceived, u, l), this.emit(U.TranscriptionReceived, u, d, l)
      }, this.handleChatMessage = (o, c) => {
        const d = gm(c);
        this.emit(U.ChatMessage, d, o)
      }, this.handleMetrics = (o, c) => {
        this.emit(U.MetricsReceived, o, c)
      }, this.handleDataStream = (o, c) => {
        this.incomingDataStreamManager.handleDataStreamPacket(o, c)
      }, this.bufferedSegments = new Map, this.handleAudioPlaybackStarted = () => {
        this.canPlaybackAudio || (this.audioEnabled = !0, this.emit(U.AudioPlaybackStatusChanged, !0))
      }, this.handleAudioPlaybackFailed = o => {
        this.log.warn("could not playback audio", Object.assign(Object.assign({}, this.logContext), {
          error: o
        })), this.canPlaybackAudio && (this.audioEnabled = !1, this.emit(U.AudioPlaybackStatusChanged, !1))
      }, this.handleVideoPlaybackStarted = () => {
        this.isVideoPlaybackBlocked && (this.isVideoPlaybackBlocked = !1, this.emit(U.VideoPlaybackStatusChanged, !0))
      }, this.handleVideoPlaybackFailed = () => {
        this.isVideoPlaybackBlocked || (this.isVideoPlaybackBlocked = !0, this.emit(U.VideoPlaybackStatusChanged, !1))
      }, this.handleDeviceChange = () => b(this, void 0, void 0, function*() {
        var o;
        ((o = Oe()) === null || o === void 0 ? void 0 : o.os) !== "iOS" && (yield this.selectDefaultDevices()), this.emit(U.MediaDevicesChanged)
      }), this.handleRoomUpdate = o => {
        const c = this.roomInfo;
        this.roomInfo = o, c && c.metadata !== o.metadata && this.emitWhenConnected(U.RoomMetadataChanged, o.metadata), (c == null ? void 0 : c.activeRecording) !== o.activeRecording && this.emitWhenConnected(U.RecordingStatusChanged, o.activeRecording)
      }, this.handleConnectionQualityUpdate = o => {
        o.updates.forEach(c => {
          if (c.participantSid === this.localParticipant.sid) {
            this.localParticipant.setConnectionQuality(c.quality);
            return
          }
          const d = this.getRemoteParticipantBySid(c.participantSid);
          d && d.setConnectionQuality(c.quality)
        })
      }, this.onLocalParticipantMetadataChanged = o => {
        this.emit(U.ParticipantMetadataChanged, o, this.localParticipant)
      }, this.onLocalParticipantNameChanged = o => {
        this.emit(U.ParticipantNameChanged, o, this.localParticipant)
      }, this.onLocalAttributesChanged = o => {
        this.emit(U.ParticipantAttributesChanged, o, this.localParticipant)
      }, this.onLocalTrackMuted = o => {
        this.emit(U.TrackMuted, o, this.localParticipant)
      }, this.onLocalTrackUnmuted = o => {
        this.emit(U.TrackUnmuted, o, this.localParticipant)
      }, this.onTrackProcessorUpdate = o => {
        var c;
        (c = o == null ? void 0 : o.onPublish) === null || c === void 0 || c.call(o, this)
      }, this.onLocalTrackPublished = o => b(this, void 0, void 0, function*() {
        var c, d, l, u, h, m;
        (c = o.track) === null || c === void 0 || c.on(B.TrackProcessorUpdate, this.onTrackProcessorUpdate), (d = o.track) === null || d === void 0 || d.on(B.Restarted, this.onLocalTrackRestarted), (h = (u = (l = o.track) === null || l === void 0 ? void 0 : l.getProcessor()) === null || u === void 0 ? void 0 : u.onPublish) === null || h === void 0 || h.call(u, this), this.emit(U.LocalTrackPublished, o, this.localParticipant), it(o.track) && (yield o.track.checkForSilence()) && this.emit(U.LocalAudioSilenceDetected, o);
        const f = yield(m = o.track) === null || m === void 0 ? void 0 : m.getDeviceId(!1), p = rs(o.source);
        p && f && f !== this.localParticipant.activeDeviceMap.get(p) && (this.localParticipant.activeDeviceMap.set(p, f), this.emit(U.ActiveDeviceChanged, p, f))
      }), this.onLocalTrackUnpublished = o => {
        var c, d;
        (c = o.track) === null || c === void 0 || c.off(B.TrackProcessorUpdate, this.onTrackProcessorUpdate), (d = o.track) === null || d === void 0 || d.off(B.Restarted, this.onLocalTrackRestarted), this.emit(U.LocalTrackUnpublished, o, this.localParticipant)
      }, this.onLocalTrackRestarted = o => b(this, void 0, void 0, function*() {
        const c = yield o.getDeviceId(!1), d = rs(o.source);
        d && c && c !== this.localParticipant.activeDeviceMap.get(d) && (this.log.debug("local track restarted, setting ".concat(d, " ").concat(c, " active"), this.logContext), this.localParticipant.activeDeviceMap.set(d, c), this.emit(U.ActiveDeviceChanged, d, c))
      }), this.onLocalConnectionQualityChanged = o => {
        this.emit(U.ConnectionQualityChanged, o, this.localParticipant)
      }, this.onMediaDevicesError = (o, c) => {
        this.emit(U.MediaDevicesError, o, c)
      }, this.onLocalParticipantPermissionsChanged = o => {
        this.emit(U.ParticipantPermissionsChanged, o, this.localParticipant)
      }, this.onLocalChatMessageSent = o => {
        this.emit(U.ChatMessage, o, this.localParticipant)
      }, this.setMaxListeners(100), this.remoteParticipants = new Map, this.sidToIdentity = new Map, this.options = Object.assign(Object.assign({}, $m), e), this.log = Ye((n = this.options.loggerName) !== null && n !== void 0 ? n : Ue.Room), this.transcriptionReceivedTimes = new Map, this.options.audioCaptureDefaults = Object.assign(Object.assign({}, Ic), e == null ? void 0 : e.audioCaptureDefaults), this.options.videoCaptureDefaults = Object.assign(Object.assign({}, xc), e == null ? void 0 : e.videoCaptureDefaults), this.options.publishDefaults = Object.assign(Object.assign({}, zm), e == null ? void 0 : e.publishDefaults), this.maybeCreateEngine(), this.incomingDataStreamManager = new Pf, this.outgoingDataStreamManager = new If(this.engine, this.log), this.disconnectLock = new _e, this.localParticipant = new Uf("", "", this.engine, this.options, this.rpcHandlers, this.outgoingDataStreamManager), (this.options.e2ee || this.options.encryption) && this.setupE2EE(), this.engine.e2eeManager = this.e2eeManager, this.options.videoCaptureDefaults.deviceId && this.localParticipant.activeDeviceMap.set("videoinput", It(this.options.videoCaptureDefaults.deviceId)), this.options.audioCaptureDefaults.deviceId && this.localParticipant.activeDeviceMap.set("audioinput", It(this.options.audioCaptureDefaults.deviceId)), !((s = this.options.audioOutput) === null || s === void 0) && s.deviceId && this.switchActiveDevice("audiooutput", It(this.options.audioOutput.deviceId)).catch(o => this.log.warn("Could not set audio output: ".concat(o.message), this.logContext)), Me()) {
      const o = new AbortController;
      (a = (r = navigator.mediaDevices) === null || r === void 0 ? void 0 : r.addEventListener) === null || a === void 0 || a.call(r, "devicechange", this.handleDeviceChange, {
        signal: o.signal
      }), $t.cleanupRegistry && $t.cleanupRegistry.register(this, () => {
        o.abort()
      })
    }
  }
  registerTextStreamHandler(e, t) {
    return this.incomingDataStreamManager.registerTextStreamHandler(e, t)
  }
  unregisterTextStreamHandler(e) {
    return this.incomingDataStreamManager.unregisterTextStreamHandler(e)
  }
  registerByteStreamHandler(e, t) {
    return this.incomingDataStreamManager.registerByteStreamHandler(e, t)
  }
  unregisterByteStreamHandler(e) {
    return this.incomingDataStreamManager.unregisterByteStreamHandler(e)
  }
  registerRpcMethod(e, t) {
    if (this.rpcHandlers.has(e)) throw Error("RPC handler already registered for method ".concat(e, ", unregisterRpcMethod before trying to register again"));
    this.rpcHandlers.set(e, t)
  }
  unregisterRpcMethod(e) {
    this.rpcHandlers.delete(e)
  }
  setE2EEEnabled(e) {
    return b(this, void 0, void 0, function*() {
      if (this.e2eeManager) yield Promise.all([this.localParticipant.setE2EEEnabled(e)]), this.localParticipant.identity !== "" && this.e2eeManager.setParticipantCryptorEnabled(e, this.localParticipant.identity);
      else throw Error("e2ee not configured, please set e2ee settings within the room options")
    })
  }
  setupE2EE() {
    var e;
    const t = !!this.options.encryption,
      n = this.options.encryption || this.options.e2ee;
    n && ("e2eeManager" in n ? (this.e2eeManager = n.e2eeManager, this.e2eeManager.isDataChannelEncryptionEnabled = t) : this.e2eeManager = new Mm(n, t), this.e2eeManager.on(vt.ParticipantEncryptionStatusChanged, (s, r) => {
      bm(r) && (this.isE2EEEnabled = s), this.emit(U.ParticipantEncryptionStatusChanged, s, r)
    }), this.e2eeManager.on(vt.EncryptionError, (s, r) => {
      const a = r ? this.getParticipantByIdentity(r) : void 0;
      this.emit(U.EncryptionError, s, a)
    }), (e = this.e2eeManager) === null || e === void 0 || e.setup(this))
  }
  get logContext() {
    var e;
    return {
      room: this.name,
      roomID: (e = this.roomInfo) === null || e === void 0 ? void 0 : e.sid,
      participant: this.localParticipant.identity,
      pID: this.localParticipant.sid
    }
  }
  get isRecording() {
    var e, t;
    return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.activeRecording) !== null && t !== void 0 ? t : !1
  }
  getSid() {
    return this.state === re.Disconnected ? Ee.resolve("") : this.roomInfo && this.roomInfo.sid !== "" ? Ee.resolve(this.roomInfo.sid) : new Ee((e, t) => {
      const n = s => {
        s.sid !== "" && (this.engine.off(V.RoomUpdate, n), e(s.sid))
      };
      this.engine.on(V.RoomUpdate, n), this.once(U.Disconnected, () => {
        this.engine.off(V.RoomUpdate, n), t(new fe("Room disconnected before room server id was available"))
      })
    })
  }
  get name() {
    var e, t;
    return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.name) !== null && t !== void 0 ? t : ""
  }
  get metadata() {
    var e;
    return (e = this.roomInfo) === null || e === void 0 ? void 0 : e.metadata
  }
  get numParticipants() {
    var e, t;
    return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.numParticipants) !== null && t !== void 0 ? t : 0
  }
  get numPublishers() {
    var e, t;
    return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.numPublishers) !== null && t !== void 0 ? t : 0
  }
  maybeCreateEngine() {
    this.engine && !this.engine.isClosed || (this.engine = new Tf(this.options), this.engine.e2eeManager = this.e2eeManager, this.engine.on(V.ParticipantUpdate, this.handleParticipantUpdates).on(V.RoomUpdate, this.handleRoomUpdate).on(V.SpeakersChanged, this.handleSpeakersChanged).on(V.StreamStateChanged, this.handleStreamStateUpdate).on(V.ConnectionQualityUpdate, this.handleConnectionQualityUpdate).on(V.SubscriptionError, this.handleSubscriptionError).on(V.SubscriptionPermissionUpdate, this.handleSubscriptionPermissionUpdate).on(V.MediaTrackAdded, (e, t, n) => {
      this.onTrackAdded(e, t, n)
    }).on(V.Disconnected, e => {
      this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, e)
    }).on(V.ActiveSpeakersUpdate, this.handleActiveSpeakersUpdate).on(V.DataPacketReceived, this.handleDataPacket).on(V.Resuming, () => {
      this.clearConnectionReconcile(), this.isResuming = !0, this.log.info("Resuming signal connection", this.logContext), this.setAndEmitConnectionState(re.SignalReconnecting) && this.emit(U.SignalReconnecting)
    }).on(V.Resumed, () => {
      this.registerConnectionReconcile(), this.isResuming = !1, this.log.info("Resumed signal connection", this.logContext), this.updateSubscriptions(), this.emitBufferedEvents(), this.setAndEmitConnectionState(re.Connected) && this.emit(U.Reconnected)
    }).on(V.SignalResumed, () => {
      this.bufferedEvents = [], (this.state === re.Reconnecting || this.isResuming) && this.sendSyncState()
    }).on(V.Restarting, this.handleRestarting).on(V.SignalRestarted, this.handleSignalRestarted).on(V.Offline, () => {
      this.setAndEmitConnectionState(re.Reconnecting) && this.emit(U.Reconnecting)
    }).on(V.DCBufferStatusChanged, (e, t) => {
      this.emit(U.DCBufferStatusChanged, e, t)
    }).on(V.LocalTrackSubscribed, e => {
      const t = this.localParticipant.getTrackPublications().find(n => {
        let {
          trackSid: s
        } = n;
        return s === e
      });
      if (!t) {
        this.log.warn("could not find local track subscription for subscribed event", this.logContext);
        return
      }
      this.localParticipant.emit(W.LocalTrackSubscribed, t), this.emitWhenConnected(U.LocalTrackSubscribed, t, this.localParticipant)
    }).on(V.RoomMoved, e => {
      this.log.debug("room moved", e), e.room && this.handleRoomUpdate(e.room), this.remoteParticipants.forEach((t, n) => {
        this.handleParticipantDisconnected(n, t)
      }), this.emit(U.Moved, e.room.name), e.participant ? this.handleParticipantUpdates([e.participant, ...e.otherParticipants]) : this.handleParticipantUpdates(e.otherParticipants)
    }), this.localParticipant && this.localParticipant.setupEngine(this.engine), this.e2eeManager && this.e2eeManager.setupEngine(this.engine), this.outgoingDataStreamManager && this.outgoingDataStreamManager.setupEngine(this.engine))
  }
  static getLocalDevices(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
    return Se.getInstance().getDevices(e, t)
  }
  prepareConnection(e, t) {
    return b(this, void 0, void 0, function*() {
      if (this.state === re.Disconnected) {
        this.log.debug("prepareConnection to ".concat(e), this.logContext);
        try {
          if (zt(new URL(e)) && t) {
            this.regionUrlProvider = new se(e, t);
            const n = yield this.regionUrlProvider.getNextBestRegionUrl();
            n && this.state === re.Disconnected && (this.regionUrl = n, yield fetch(bi(n), {
              method: "HEAD"
            }), this.log.debug("prepared connection to ".concat(n), this.logContext))
          } else yield fetch(bi(e), {
            method: "HEAD"
          })
        } catch (n) {
          this.log.warn("could not prepare connection", Object.assign(Object.assign({}, this.logContext), {
            error: n
          }))
        }
      }
    })
  }
  getParticipantByIdentity(e) {
    return this.localParticipant.identity === e ? this.localParticipant : this.remoteParticipants.get(e)
  }
  clearConnectionFutures() {
    this.connectFuture = void 0
  }
  simulateScenario(e, t) {
    return b(this, void 0, void 0, function*() {
      let n = () => b(this, void 0, void 0, function*() {}),
        s;
      switch (e) {
        case "signal-reconnect":
          yield this.engine.client.handleOnClose("simulate disconnect");
          break;
        case "speaker":
          s = new ze({
            scenario: {
              case: "speakerUpdate",
              value: 3
            }
          });
          break;
        case "node-failure":
          s = new ze({
            scenario: {
              case: "nodeFailure",
              value: !0
            }
          });
          break;
        case "server-leave":
          s = new ze({
            scenario: {
              case: "serverLeave",
              value: !0
            }
          });
          break;
        case "migration":
          s = new ze({
            scenario: {
              case: "migration",
              value: !0
            }
          });
          break;
        case "resume-reconnect":
          this.engine.failNext(), yield this.engine.client.handleOnClose("simulate resume-disconnect");
          break;
        case "disconnect-signal-on-resume":
          n = () => b(this, void 0, void 0, function*() {
            yield this.engine.client.handleOnClose("simulate resume-disconnect")
          }), s = new ze({
            scenario: {
              case: "disconnectSignalOnResume",
              value: !0
            }
          });
          break;
        case "disconnect-signal-on-resume-no-messages":
          n = () => b(this, void 0, void 0, function*() {
            yield this.engine.client.handleOnClose("simulate resume-disconnect")
          }), s = new ze({
            scenario: {
              case: "disconnectSignalOnResumeNoMessages",
              value: !0
            }
          });
          break;
        case "full-reconnect":
          this.engine.fullReconnectOnNext = !0, yield this.engine.client.handleOnClose("simulate full-reconnect");
          break;
        case "force-tcp":
        case "force-tls":
          s = new ze({
            scenario: {
              case: "switchCandidateProtocol",
              value: e === "force-tls" ? 2 : 1
            }
          }), n = () => b(this, void 0, void 0, function*() {
            const r = this.engine.client.onLeave;
            r && r(new cn({
              reason: He.CLIENT_INITIATED,
              action: qt.RECONNECT
            }))
          });
          break;
        case "subscriber-bandwidth":
          if (t === void 0 || typeof t != "number") throw new Error("subscriber-bandwidth requires a number as argument");
          s = new ze({
            scenario: {
              case: "subscriberBandwidth",
              value: Rt(t)
            }
          });
          break;
        case "leave-full-reconnect":
          s = new ze({
            scenario: {
              case: "leaveRequestFullReconnect",
              value: !0
            }
          })
      }
      s && (yield this.engine.client.sendSimulateScenario(s), yield n())
    })
  }
  get canPlaybackAudio() {
    return this.audioEnabled
  }
  get canPlaybackVideo() {
    return !this.isVideoPlaybackBlocked
  }
  getActiveDevice(e) {
    return this.localParticipant.activeDeviceMap.get(e)
  }
  switchActiveDevice(e, t) {
    return b(this, arguments, void 0, function(n, s) {
      var r = this;
      let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      return function*() {
        var o, c, d, l, u, h, m;
        let f = !0,
          p = !1;
        const _ = a ? {
          exact: s
        } : s;
        if (n === "audioinput") {
          p = r.localParticipant.audioTrackPublications.size === 0;
          const w = (o = r.getActiveDevice(n)) !== null && o !== void 0 ? o : r.options.audioCaptureDefaults.deviceId;
          r.options.audioCaptureDefaults.deviceId = _;
          const k = Array.from(r.localParticipant.audioTrackPublications.values()).filter(y => y.source === O.Source.Microphone);
          try {
            f = (yield Promise.all(k.map(y => {
              var S;
              return (S = y.audioTrack) === null || S === void 0 ? void 0 : S.setDeviceId(_)
            }))).every(y => y === !0)
          } catch (y) {
            throw r.options.audioCaptureDefaults.deviceId = w, y
          }
          const P = k.some(y => {
            var S, E;
            return (E = (S = y.track) === null || S === void 0 ? void 0 : S.isMuted) !== null && E !== void 0 ? E : !1
          });
          f && P && (p = !0)
        } else if (n === "videoinput") {
          p = r.localParticipant.videoTrackPublications.size === 0;
          const w = (c = r.getActiveDevice(n)) !== null && c !== void 0 ? c : r.options.videoCaptureDefaults.deviceId;
          r.options.videoCaptureDefaults.deviceId = _;
          const k = Array.from(r.localParticipant.videoTrackPublications.values()).filter(y => y.source === O.Source.Camera);
          try {
            f = (yield Promise.all(k.map(y => {
              var S;
              return (S = y.videoTrack) === null || S === void 0 ? void 0 : S.setDeviceId(_)
            }))).every(y => y === !0)
          } catch (y) {
            throw r.options.videoCaptureDefaults.deviceId = w, y
          }
          const P = k.some(y => {
            var S, E;
            return (E = (S = y.track) === null || S === void 0 ? void 0 : S.isMuted) !== null && E !== void 0 ? E : !1
          });
          f && P && (p = !0)
        } else if (n === "audiooutput") {
          if (p = !0, !cs() && !r.options.webAudioMix || r.options.webAudioMix && r.audioContext && !("setSinkId" in r.audioContext)) throw new Error("cannot switch audio output, the current browser does not support it");
          r.options.webAudioMix && (s = (d = yield Se.getInstance().normalizeDeviceId("audiooutput", s)) !== null && d !== void 0 ? d : ""), (l = (m = r.options).audioOutput) !== null && l !== void 0 || (m.audioOutput = {});
          const w = (u = r.getActiveDevice(n)) !== null && u !== void 0 ? u : r.options.audioOutput.deviceId;
          r.options.audioOutput.deviceId = s;
          try {
            r.options.webAudioMix && ((h = r.audioContext) === null || h === void 0 || h.setSinkId(s)), yield Promise.all(Array.from(r.remoteParticipants.values()).map(k => k.setAudioOutput({
              deviceId: s
            })))
          } catch (k) {
            throw r.options.audioOutput.deviceId = w, k
          }
        }
        return p && (r.localParticipant.activeDeviceMap.set(n, s), r.emit(U.ActiveDeviceChanged, n, s)), f
      }()
    })
  }
  setupLocalParticipantEvents() {
    this.localParticipant.on(W.ParticipantMetadataChanged, this.onLocalParticipantMetadataChanged).on(W.ParticipantNameChanged, this.onLocalParticipantNameChanged).on(W.AttributesChanged, this.onLocalAttributesChanged).on(W.TrackMuted, this.onLocalTrackMuted).on(W.TrackUnmuted, this.onLocalTrackUnmuted).on(W.LocalTrackPublished, this.onLocalTrackPublished).on(W.LocalTrackUnpublished, this.onLocalTrackUnpublished).on(W.ConnectionQualityChanged, this.onLocalConnectionQualityChanged).on(W.MediaDevicesError, this.onMediaDevicesError).on(W.AudioStreamAcquired, this.startAudio).on(W.ChatMessage, this.onLocalChatMessageSent).on(W.ParticipantPermissionsChanged, this.onLocalParticipantPermissionsChanged)
  }
  recreateEngine() {
    var e;
    (e = this.engine) === null || e === void 0 || e.close(), this.engine = void 0, this.isResuming = !1, this.remoteParticipants.clear(), this.sidToIdentity.clear(), this.bufferedEvents = [], this.maybeCreateEngine()
  }
  onTrackAdded(e, t, n) {
    if (this.state === re.Connecting || this.state === re.Reconnecting) {
      const u = () => {
          this.log.debug("deferring on track for later", {
            mediaTrackId: e.id,
            mediaStreamId: t.id,
            tracksInStream: t.getTracks().map(m => m.id)
          }), this.onTrackAdded(e, t, n), h()
        },
        h = () => {
          this.off(U.Reconnected, u), this.off(U.Connected, u), this.off(U.Disconnected, h)
        };
      this.once(U.Reconnected, u), this.once(U.Connected, u), this.once(U.Disconnected, h);
      return
    }
    if (this.state === re.Disconnected) {
      this.log.warn("skipping incoming track after Room disconnected", this.logContext);
      return
    }
    if (e.readyState === "ended") {
      this.log.info("skipping incoming track as it already ended", this.logContext);
      return
    }
    const s = nm(t.id),
      r = s[0];
    let a = s[1],
      o = e.id;
    if (a && a.startsWith("TR") && (o = a), r === this.localParticipant.sid) {
      this.log.warn("tried to create RemoteParticipant for local participant", this.logContext);
      return
    }
    const c = Array.from(this.remoteParticipants.values()).find(u => u.sid === r);
    if (!c) {
      this.log.error("Tried to add a track for a participant, that's not present. Sid: ".concat(r), this.logContext);
      return
    }
    if (!o.startsWith("TR")) {
      const u = this.engine.getTrackIdForReceiver(n);
      if (!u) {
        this.log.error("Tried to add a track whose 'sid' could not be found for a participant, that's not present. Sid: ".concat(r), this.logContext);
        return
      }
      o = u
    }
    o.startsWith("TR") || this.log.warn("Tried to add a track whose 'sid' could not be determined for a participant, that's not present. Sid: ".concat(r, ", streamId: ").concat(a, ", trackId: ").concat(o), Object.assign(Object.assign({}, this.logContext), {
      rpID: r,
      streamId: a,
      trackId: o
    }));
    let d;
    this.options.adaptiveStream && (typeof this.options.adaptiveStream == "object" ? d = this.options.adaptiveStream : d = {});
    const l = c.addSubscribedMediaTrack(e, o, t, n, d);
    l != null && l.isEncrypted && !this.e2eeManager && this.emit(U.EncryptionError, new Error("Encrypted ".concat(l.source, " track received from participant ").concat(c.sid, ", but room does not have encryption enabled!")))
  }
  handleDisconnect() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0,
      t = arguments.length > 1 ? arguments[1] : void 0;
    var n, s;
    if (this.clearConnectionReconcile(), this.isResuming = !1, this.bufferedEvents = [], this.transcriptionReceivedTimes.clear(), this.incomingDataStreamManager.clearControllers(), this.state !== re.Disconnected) {
      this.regionUrl = void 0, this.regionUrlProvider && this.regionUrlProvider.notifyDisconnected();
      try {
        this.remoteParticipants.forEach(r => {
          r.trackPublications.forEach(a => {
            r.unpublishTrack(a.trackSid)
          })
        }), this.localParticipant.trackPublications.forEach(r => {
          var a, o, c;
          r.track && this.localParticipant.unpublishTrack(r.track, e), e ? ((a = r.track) === null || a === void 0 || a.detach(), (o = r.track) === null || o === void 0 || o.stop()) : (c = r.track) === null || c === void 0 || c.stopMonitor()
        }), this.localParticipant.off(W.ParticipantMetadataChanged, this.onLocalParticipantMetadataChanged).off(W.ParticipantNameChanged, this.onLocalParticipantNameChanged).off(W.AttributesChanged, this.onLocalAttributesChanged).off(W.TrackMuted, this.onLocalTrackMuted).off(W.TrackUnmuted, this.onLocalTrackUnmuted).off(W.LocalTrackPublished, this.onLocalTrackPublished).off(W.LocalTrackUnpublished, this.onLocalTrackUnpublished).off(W.ConnectionQualityChanged, this.onLocalConnectionQualityChanged).off(W.MediaDevicesError, this.onMediaDevicesError).off(W.AudioStreamAcquired, this.startAudio).off(W.ChatMessage, this.onLocalChatMessageSent).off(W.ParticipantPermissionsChanged, this.onLocalParticipantPermissionsChanged), this.localParticipant.trackPublications.clear(), this.localParticipant.videoTrackPublications.clear(), this.localParticipant.audioTrackPublications.clear(), this.remoteParticipants.clear(), this.sidToIdentity.clear(), this.activeSpeakers = [], this.audioContext && typeof this.options.webAudioMix == "boolean" && (this.audioContext.close(), this.audioContext = void 0), Me() && (window.removeEventListener("beforeunload", this.onPageLeave), window.removeEventListener("pagehide", this.onPageLeave), window.removeEventListener("freeze", this.onPageLeave), (s = (n = navigator.mediaDevices) === null || n === void 0 ? void 0 : n.removeEventListener) === null || s === void 0 || s.call(n, "devicechange", this.handleDeviceChange))
      } finally {
        this.setAndEmitConnectionState(re.Disconnected), this.emit(U.Disconnected, t)
      }
    }
  }
  handleParticipantDisconnected(e, t) {
    var n;
    this.remoteParticipants.delete(e), t && (this.incomingDataStreamManager.validateParticipantHasNoActiveDataStreams(e), t.trackPublications.forEach(s => {
      t.unpublishTrack(s.trackSid, !0)
    }), this.emit(U.ParticipantDisconnected, t), t.setDisconnected(), (n = this.localParticipant) === null || n === void 0 || n.handleParticipantDisconnected(t.identity))
  }
  handleIncomingRpcRequest(e, t, n, s, r, a) {
    return b(this, void 0, void 0, function*() {
      if (yield this.engine.publishRpcAck(e, t), a !== 1) {
        yield this.engine.publishRpcResponse(e, t, null, me.builtIn("UNSUPPORTED_VERSION"));
        return
      }
      const o = this.rpcHandlers.get(n);
      if (!o) {
        yield this.engine.publishRpcResponse(e, t, null, me.builtIn("UNSUPPORTED_METHOD"));
        return
      }
      let c = null,
        d = null;
      try {
        const l = yield o({
          requestId: t,
          callerIdentity: e,
          payload: s,
          responseTimeout: r
        });
        $s(l) > Oc ? (c = me.builtIn("RESPONSE_PAYLOAD_TOO_LARGE"), this.log.warn("RPC Response payload too large for ".concat(n))) : d = l
      } catch (l) {
        l instanceof me ? c = l : (this.log.warn("Uncaught error returned by RPC handler for ".concat(n, ". Returning APPLICATION_ERROR instead."), l), c = me.builtIn("APPLICATION_ERROR"))
      }
      yield this.engine.publishRpcResponse(e, t, d, c)
    })
  }
  selectDefaultDevices() {
    return b(this, void 0, void 0, function*() {
      var e, t, n;
      const s = Se.getInstance().previousDevices,
        r = yield Se.getInstance().getDevices(void 0, !1), a = Oe();
      if ((a == null ? void 0 : a.name) === "Chrome" && a.os !== "iOS")
        for (let c of r) {
          const d = s.find(l => l.deviceId === c.deviceId);
          d && d.label !== "" && d.kind === c.kind && d.label !== c.label && this.getActiveDevice(c.kind) === "default" && this.emit(U.ActiveDeviceChanged, c.kind, c.deviceId)
        }
      const o = ["audiooutput", "audioinput", "videoinput"];
      for (let c of o) {
        const d = zh(c),
          l = this.localParticipant.getTrackPublication(d);
        if (l && (!((e = l.track) === null || e === void 0) && e.isUserProvided)) continue;
        const u = r.filter(m => m.kind === c),
          h = this.getActiveDevice(c);
        if (h === ((t = s.filter(m => m.kind === c)[0]) === null || t === void 0 ? void 0 : t.deviceId) && u.length > 0 && ((n = u[0]) === null || n === void 0 ? void 0 : n.deviceId) !== h) {
          yield this.switchActiveDevice(c, u[0].deviceId);
          continue
        }
        c === "audioinput" && !vi() || c === "videoinput" || u.length > 0 && !u.find(m => m.deviceId === this.getActiveDevice(c)) && (c !== "audiooutput" || !vi()) && (yield this.switchActiveDevice(c, u[0].deviceId))
      }
    })
  }
  acquireAudioContext() {
    return b(this, void 0, void 0, function*() {
      var e, t;
      if (typeof this.options.webAudioMix != "boolean" && this.options.webAudioMix.audioContext ? this.audioContext = this.options.webAudioMix.audioContext : (!this.audioContext || this.audioContext.state === "closed") && (this.audioContext = (e = Cc()) !== null && e !== void 0 ? e : void 0), this.options.webAudioMix && this.remoteParticipants.forEach(s => s.setAudioContext(this.audioContext)), this.localParticipant.setAudioContext(this.audioContext), this.audioContext && this.audioContext.state === "suspended") try {
        yield Promise.race([this.audioContext.resume(), Ce(200)])
      } catch (s) {
        this.log.warn("Could not resume audio context", Object.assign(Object.assign({}, this.logContext), {
          error: s
        }))
      }
      const n = ((t = this.audioContext) === null || t === void 0 ? void 0 : t.state) === "running";
      n !== this.canPlaybackAudio && (this.audioEnabled = n, this.emit(U.AudioPlaybackStatusChanged, n))
    })
  }
  createParticipant(e, t) {
    var n;
    let s;
    return t ? s = Yi.fromParticipantInfo(this.engine.client, t, {
      loggerContextCb: () => this.logContext,
      loggerName: this.options.loggerName
    }) : s = new Yi(this.engine.client, "", e, void 0, void 0, void 0, {
      loggerContextCb: () => this.logContext,
      loggerName: this.options.loggerName
    }), this.options.webAudioMix && s.setAudioContext(this.audioContext), !((n = this.options.audioOutput) === null || n === void 0) && n.deviceId && s.setAudioOutput(this.options.audioOutput).catch(r => this.log.warn("Could not set audio output: ".concat(r.message), this.logContext)), s
  }
  getOrCreateParticipant(e, t) {
    if (this.remoteParticipants.has(e)) {
      const s = this.remoteParticipants.get(e);
      return t && s.updateInfo(t) && this.sidToIdentity.set(t.sid, t.identity), s
    }
    const n = this.createParticipant(e, t);
    return this.remoteParticipants.set(e, n), this.sidToIdentity.set(t.sid, t.identity), this.emitWhenConnected(U.ParticipantConnected, n), n.on(W.TrackPublished, s => {
      this.emitWhenConnected(U.TrackPublished, s, n)
    }).on(W.TrackSubscribed, (s, r) => {
      s.kind === O.Kind.Audio ? (s.on(B.AudioPlaybackStarted, this.handleAudioPlaybackStarted), s.on(B.AudioPlaybackFailed, this.handleAudioPlaybackFailed)) : s.kind === O.Kind.Video && (s.on(B.VideoPlaybackFailed, this.handleVideoPlaybackFailed), s.on(B.VideoPlaybackStarted, this.handleVideoPlaybackStarted)), this.emit(U.TrackSubscribed, s, r, n)
    }).on(W.TrackUnpublished, s => {
      this.emit(U.TrackUnpublished, s, n)
    }).on(W.TrackUnsubscribed, (s, r) => {
      this.emit(U.TrackUnsubscribed, s, r, n)
    }).on(W.TrackMuted, s => {
      this.emitWhenConnected(U.TrackMuted, s, n)
    }).on(W.TrackUnmuted, s => {
      this.emitWhenConnected(U.TrackUnmuted, s, n)
    }).on(W.ParticipantMetadataChanged, s => {
      this.emitWhenConnected(U.ParticipantMetadataChanged, s, n)
    }).on(W.ParticipantNameChanged, s => {
      this.emitWhenConnected(U.ParticipantNameChanged, s, n)
    }).on(W.AttributesChanged, s => {
      this.emitWhenConnected(U.ParticipantAttributesChanged, s, n)
    }).on(W.ConnectionQualityChanged, s => {
      this.emitWhenConnected(U.ConnectionQualityChanged, s, n)
    }).on(W.ParticipantPermissionsChanged, s => {
      this.emitWhenConnected(U.ParticipantPermissionsChanged, s, n)
    }).on(W.TrackSubscriptionStatusChanged, (s, r) => {
      this.emitWhenConnected(U.TrackSubscriptionStatusChanged, s, r, n)
    }).on(W.TrackSubscriptionFailed, (s, r) => {
      this.emit(U.TrackSubscriptionFailed, s, n, r)
    }).on(W.TrackSubscriptionPermissionChanged, (s, r) => {
      this.emitWhenConnected(U.TrackSubscriptionPermissionChanged, s, r, n)
    }).on(W.Active, () => {
      this.emitWhenConnected(U.ParticipantActive, n), n.kind === fi.AGENT && this.localParticipant.setActiveAgent(n)
    }), t && n.updateInfo(t), n
  }
  sendSyncState() {
    const e = Array.from(this.remoteParticipants.values()).reduce((n, s) => (n.push(...s.getTrackPublications()), n), []),
      t = this.localParticipant.getTrackPublications();
    this.engine.sendSyncState(e, t)
  }
  updateSubscriptions() {
    for (const e of this.remoteParticipants.values())
      for (const t of e.videoTrackPublications.values()) t.isSubscribed && vm(t) && t.emitTrackUpdate()
  }
  getRemoteParticipantBySid(e) {
    const t = this.sidToIdentity.get(e);
    if (t) return this.remoteParticipants.get(t)
  }
  registerConnectionReconcile() {
    this.clearConnectionReconcile();
    let e = 0;
    this.connectionReconcileInterval = Te.setInterval(() => {
      !this.engine || this.engine.isClosed || !this.engine.verifyTransport() ? (e++, this.log.warn("detected connection state mismatch", Object.assign(Object.assign({}, this.logContext), {
        numFailures: e,
        engine: this.engine ? {
          closed: this.engine.isClosed,
          transportsConnectedOrConnecting: this.engine.verifyTransport()
        } : void 0
      })), e >= 3 && (this.recreateEngine(), this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, He.STATE_MISMATCH))) : e = 0
    }, Ff)
  }
  clearConnectionReconcile() {
    this.connectionReconcileInterval && Te.clearInterval(this.connectionReconcileInterval)
  }
  setAndEmitConnectionState(e) {
    return e === this.state ? !1 : (this.state = e, this.emit(U.ConnectionStateChanged, this.state), !0)
  }
  emitBufferedEvents() {
    this.bufferedEvents.forEach(e => {
      let [t, n] = e;
      this.emit(t, ...n)
    }), this.bufferedEvents = []
  }
  emitWhenConnected(e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++) n[s - 1] = arguments[s];
    if (this.state === re.Reconnecting || this.isResuming || !this.engine || this.engine.pendingReconnect) this.bufferedEvents.push([e, n]);
    else if (this.state === re.Connected) return this.emit(e, ...n);
    return !1
  }
  simulateParticipants(e) {
    return b(this, void 0, void 0, function*() {
      var t, n, s, r;
      const a = Object.assign({
          audio: !0,
          video: !0,
          useRealTracks: !1
        }, e.publish),
        o = Object.assign({
          count: 9,
          audio: !1,
          video: !0,
          aspectRatios: [1.66, 1.7, 1.3]
        }, e.participants);
      if (this.handleDisconnect(), this.roomInfo = new sn({
          sid: "RM_SIMULATED",
          name: "simulated-room",
          emptyTimeout: 0,
          maxParticipants: 0,
          creationTime: de.parse(new Date().getTime()),
          metadata: "",
          numParticipants: 1,
          numPublishers: 1,
          turnPassword: "",
          enabledCodecs: [],
          activeRecording: !1
        }), this.localParticipant.updateInfo(new Mt({
          identity: "simulated-local",
          name: "local-name"
        })), this.setupLocalParticipantEvents(), this.emit(U.SignalConnected), this.emit(U.Connected), this.setAndEmitConnectionState(re.Connected), a.video) {
        const c = new ps(O.Kind.Video, new jt({
          source: ye.CAMERA,
          sid: Math.floor(Math.random() * 1e4).toString(),
          type: Ve.AUDIO,
          name: "video-dummy"
        }), new Qi(a.useRealTracks && (!((t = window.navigator.mediaDevices) === null || t === void 0) && t.getUserMedia) ? (yield window.navigator.mediaDevices.getUserMedia({
          video: !0
        })).getVideoTracks()[0] : eo(160 * ((n = o.aspectRatios[0]) !== null && n !== void 0 ? n : 1), 160, !0, !0), void 0, !1, {
          loggerName: this.options.loggerName,
          loggerContextCb: () => this.logContext
        }), {
          loggerName: this.options.loggerName,
          loggerContextCb: () => this.logContext
        });
        this.localParticipant.addTrackPublication(c), this.localParticipant.emit(W.LocalTrackPublished, c)
      }
      if (a.audio) {
        const c = new ps(O.Kind.Audio, new jt({
          source: ye.MICROPHONE,
          sid: Math.floor(Math.random() * 1e4).toString(),
          type: Ve.AUDIO
        }), new $i(a.useRealTracks && (!((s = navigator.mediaDevices) === null || s === void 0) && s.getUserMedia) ? (yield navigator.mediaDevices.getUserMedia({
          audio: !0
        })).getAudioTracks()[0] : wn(), void 0, !1, this.audioContext, {
          loggerName: this.options.loggerName,
          loggerContextCb: () => this.logContext
        }), {
          loggerName: this.options.loggerName,
          loggerContextCb: () => this.logContext
        });
        this.localParticipant.addTrackPublication(c), this.localParticipant.emit(W.LocalTrackPublished, c)
      }
      for (let c = 0; c < o.count - 1; c += 1) {
        let d = new Mt({
          sid: Math.floor(Math.random() * 1e4).toString(),
          identity: "simulated-".concat(c),
          state: Vt.ACTIVE,
          tracks: [],
          joinedAt: de.parse(Date.now())
        });
        const l = this.getOrCreateParticipant(d.identity, d);
        if (o.video) {
          const u = eo(160 * ((r = o.aspectRatios[c % o.aspectRatios.length]) !== null && r !== void 0 ? r : 1), 160, !1, !0),
            h = new jt({
              source: ye.CAMERA,
              sid: Math.floor(Math.random() * 1e4).toString(),
              type: Ve.AUDIO
            });
          l.addSubscribedMediaTrack(u, h.sid, new MediaStream([u]), new RTCRtpReceiver), d.tracks = [...d.tracks, h]
        }
        if (o.audio) {
          const u = wn(),
            h = new jt({
              source: ye.MICROPHONE,
              sid: Math.floor(Math.random() * 1e4).toString(),
              type: Ve.AUDIO
            });
          l.addSubscribedMediaTrack(u, h.sid, new MediaStream([u]), new RTCRtpReceiver), d.tracks = [...d.tracks, h]
        }
        l.updateInfo(d)
      }
    })
  }
  emit(e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++) n[s - 1] = arguments[s];
    if (e !== U.ActiveSpeakersChanged && e !== U.TranscriptionReceived) {
      const r = Bc(n).filter(a => a !== void 0);
      (e === U.TrackSubscribed || e === U.TrackUnsubscribed) && this.log.trace("subscribe trace: ".concat(e), Object.assign(Object.assign({}, this.logContext), {
        event: e,
        args: r
      })), this.log.debug("room event ".concat(e), Object.assign(Object.assign({}, this.logContext), {
        event: e,
        args: r
      }))
    }
    return super.emit(e, ...n)
  }
}
$t.cleanupRegistry = typeof FinalizationRegistry < "u" && new FinalizationRegistry(i => {
  i()
});


var Eo;
(function(i) {
  i[i.TooShort = 0] = "TooShort", i[i.HeaderOverrun = 1] = "HeaderOverrun", i[i.MissingExtWords = 2] = "MissingExtWords", i[i.UnsupportedVersion = 3] = "UnsupportedVersion", i[i.InvalidHandle = 4] = "InvalidHandle", i[i.MalformedExt = 5] = "MalformedExt"
})(Eo || (Eo = {}));
var Po;
(function(i) {
  i[i.TooSmallForHeader = 0] = "TooSmallForHeader", i[i.TooSmallForPayload = 1] = "TooSmallForPayload"
})(Po || (Po = {}));
var Xi;
(function(i) {
  i[i.UserTimestamp = 2] = "UserTimestamp", i[i.E2ee = 1] = "E2ee"
})(Xi || (Xi = {}));
Xi.UserTimestamp;
Xi.E2ee;
var Ro;
(function(i) {
  i[i.Reserved = 0] = "Reserved", i[i.TooLarge = 1] = "TooLarge"
})(Ro || (Ro = {}));
var _o;
(function(i) {
  i[i.Start = 0] = "Start", i[i.Inter = 1] = "Inter", i[i.Final = 2] = "Final", i[i.Single = 3] = "Single"
})(_o || (_o = {}));
var Io;
(function(i) {
  i[i.MtuTooShort = 0] = "MtuTooShort"
})(Io || (Io = {}));
Ye(Ue.DataTracks);
var xo;
(function(i) {
  i[i.Interrupted = 0] = "Interrupted", i[i.UnknownFrame = 1] = "UnknownFrame", i[i.BufferFull = 2] = "BufferFull", i[i.Incomplete = 3] = "Incomplete"
})(xo || (xo = {}));
var Be;
(function(i) {
  i[i.IDLE = 0] = "IDLE", i[i.RUNNING = 1] = "RUNNING", i[i.SKIPPED = 2] = "SKIPPED", i[i.SUCCESS = 3] = "SUCCESS", i[i.FAILED = 4] = "FAILED"
})(Be || (Be = {}));
class wt extends et.EventEmitter {
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    super(), this.status = Be.IDLE, this.logs = [], this.options = {}, this.url = e, this.token = t, this.name = this.constructor.name, this.room = new $t(n.roomOptions), this.connectOptions = n.connectOptions, this.options = n
  }
  run(e) {
    return b(this, void 0, void 0, function*() {
      if (this.status !== Be.IDLE) throw Error("check is running already");
      this.setStatus(Be.RUNNING);
      try {
        yield this.perform()
      } catch (t) {
        t instanceof Error && (this.options.errorsAsWarnings ? this.appendWarning(t.message) : this.appendError(t.message))
      }
      return yield this.disconnect(), yield new Promise(t => setTimeout(t, 500)), this.status !== Be.SKIPPED && this.setStatus(this.isSuccess() ? Be.SUCCESS : Be.FAILED), e && e(), this.getInfo()
    })
  }
  isSuccess() {
    return !this.logs.some(e => e.level === "error")
  }
  connect(e) {
    return b(this, void 0, void 0, function*() {
      return this.room.state === re.Connected ? this.room : (e || (e = this.url), yield this.room.connect(e, this.token, this.connectOptions), this.room)
    })
  }
  disconnect() {
    return b(this, void 0, void 0, function*() {
      this.room && this.room.state !== re.Disconnected && (yield this.room.disconnect(), yield new Promise(e => setTimeout(e, 500)))
    })
  }
  skip() {
    this.setStatus(Be.SKIPPED)
  }
  switchProtocol(e) {
    return b(this, void 0, void 0, function*() {
      let t = !1,
        n = !1;
      if (this.room.on(U.Reconnecting, () => {
          t = !0
        }), this.room.once(U.Reconnected, () => {
          n = !0
        }), this.room.simulateScenario("force-".concat(e)), yield new Promise(r => setTimeout(r, 1e3)), !t) return;
      const s = Date.now() + 1e4;
      for (; Date.now() < s;) {
        if (n) return;
        yield Ce(100)
      }
      throw new Error("Could not reconnect using ".concat(e, " protocol after 10 seconds"))
    })
  }
  appendMessage(e) {
    this.logs.push({
      level: "info",
      message: e
    }), this.emit("update", this.getInfo())
  }
  appendWarning(e) {
    this.logs.push({
      level: "warning",
      message: e
    }), this.emit("update", this.getInfo())
  }
  appendError(e) {
    this.logs.push({
      level: "error",
      message: e
    }), this.emit("update", this.getInfo())
  }
  setStatus(e) {
    this.status = e, this.emit("update", this.getInfo())
  }
  get engine() {
    var e;
    return (e = this.room) === null || e === void 0 ? void 0 : e.engine
  }
  getInfo() {
    return {
      logs: this.logs,
      name: this.name,
      status: this.status,
      description: this.description
    }
  }
}
class Bf extends wt {
  get description() {
    return "Cloud regions"
  }
  perform() {
    return b(this, void 0, void 0, function*() {
      const e = new se(this.url, this.token);
      if (!e.isCloud()) {
        this.skip();
        return
      }
      const t = [],
        n = new Set;
      for (let r = 0; r < 3; r++) {
        const a = yield e.getNextBestRegionUrl();
        if (!a) break;
        if (n.has(a)) continue;
        n.add(a);
        const o = yield this.checkCloudRegion(a);
        this.appendMessage("".concat(o.region, " RTT: ").concat(o.rtt, "ms, duration: ").concat(o.duration, "ms")), t.push(o)
      }
      t.sort((r, a) => (r.duration - a.duration) * .5 + (r.rtt - a.rtt) * .5);
      const s = t[0];
      this.bestStats = s, this.appendMessage("best Cloud region: ".concat(s.region))
    })
  }
  getInfo() {
    const e = super.getInfo();
    return e.data = this.bestStats, e
  }
  checkCloudRegion(e) {
    return b(this, void 0, void 0, function*() {
      var t, n;
      yield this.connect(e), this.options.protocol === "tcp" && (yield this.switchProtocol("tcp"));
      const s = (t = this.room.serverInfo) === null || t === void 0 ? void 0 : t.region;
      if (!s) throw new Error("Region not found");
      const r = yield this.room.localParticipant.streamText({
        topic: "test"
      }), a = 1e3, c = 1e6 / a, d = "A".repeat(a), l = Date.now();
      for (let f = 0; f < c; f++) yield r.write(d);
      yield r.close();
      const u = Date.now(),
        h = yield(n = this.room.engine.pcManager) === null || n === void 0 ? void 0 : n.publisher.getStats(), m = {
          region: s,
          rtt: 1e4,
          duration: u - l
        };
      return h == null || h.forEach(f => {
        f.type === "candidate-pair" && f.nominated && (m.rtt = f.currentRoundTripTime * 1e3)
      }), yield this.disconnect(), m
    })
  }
}
const Dn = 1e4;
class Vf extends wt {
  get description() {
    return "Connection via UDP vs TCP"
  }
  perform() {
    return b(this, void 0, void 0, function*() {
      const e = yield this.checkConnectionProtocol("udp"), t = yield this.checkConnectionProtocol("tcp");
      this.bestStats = e, e.qualityLimitationDurations.bandwidth - t.qualityLimitationDurations.bandwidth > .5 || (e.packetsLost - t.packetsLost) / e.packetsSent > .01 ? (this.appendMessage("best connection quality via tcp"), this.bestStats = t) : this.appendMessage("best connection quality via udp");
      const n = this.bestStats;
      this.appendMessage("upstream bitrate: ".concat((n.bitrateTotal / n.count / 1e3 / 1e3).toFixed(2), " mbps")), this.appendMessage("RTT: ".concat((n.rttTotal / n.count * 1e3).toFixed(2), " ms")), this.appendMessage("jitter: ".concat((n.jitterTotal / n.count * 1e3).toFixed(2), " ms")), n.packetsLost > 0 && this.appendWarning("packets lost: ".concat((n.packetsLost / n.packetsSent * 100).toFixed(2), "%")), n.qualityLimitationDurations.bandwidth > 1 && this.appendWarning("bandwidth limited ".concat((n.qualityLimitationDurations.bandwidth / (Dn / 1e3) * 100).toFixed(2), "%")), n.qualityLimitationDurations.cpu > 0 && this.appendWarning("cpu limited ".concat((n.qualityLimitationDurations.cpu / (Dn / 1e3) * 100).toFixed(2), "%"))
    })
  }
  getInfo() {
    const e = super.getInfo();
    return e.data = this.bestStats, e
  }
  checkConnectionProtocol(e) {
    return b(this, void 0, void 0, function*() {
      yield this.connect(), e === "tcp" ? yield this.switchProtocol("tcp"): yield this.switchProtocol("udp");
      const t = document.createElement("canvas");
      t.width = 1280, t.height = 720;
      const n = t.getContext("2d");
      if (!n) throw new Error("Could not get canvas context");
      let s = 0;
      const r = () => {
        s = (s + 1) % 360, n.fillStyle = "hsl(".concat(s, ", 100%, 50%)"), n.fillRect(0, 0, t.width, t.height), requestAnimationFrame(r)
      };
      r();
      const o = t.captureStream(30).getVideoTracks()[0],
        d = (yield this.room.localParticipant.publishTrack(o, {
          simulcast: !1,
          degradationPreference: "maintain-resolution",
          videoEncoding: {
            maxBitrate: 2e6
          }
        })).track,
        l = {
          protocol: e,
          packetsLost: 0,
          packetsSent: 0,
          qualityLimitationDurations: {},
          rttTotal: 0,
          jitterTotal: 0,
          bitrateTotal: 0,
          count: 0
        },
        u = setInterval(() => b(this, void 0, void 0, function*() {
          const h = yield d.getRTCStatsReport();
          h == null || h.forEach(m => {
            m.type === "outbound-rtp" ? (l.packetsSent = m.packetsSent, l.qualityLimitationDurations = m.qualityLimitationDurations, l.bitrateTotal += m.targetBitrate, l.count++) : m.type === "remote-inbound-rtp" && (l.packetsLost = m.packetsLost, l.rttTotal += m.roundTripTime, l.jitterTotal += m.jitter)
          })
        }), 1e3);
      return yield new Promise(h => setTimeout(h, Dn)), clearInterval(u), o.stop(), t.remove(), yield this.disconnect(), l
    })
  }
}

class qf extends wt {
  get description() {
    return "Can publish audio"
  }
  perform() {
    return b(this, void 0, void 0, function*() {
      var e;
      const t = yield this.connect(), n = yield Af();
      if (yield Tc(n, 1e3)) throw new Error("unable to detect audio from microphone");
      this.appendMessage("detected audio from microphone"), t.localParticipant.publishTrack(n), yield new Promise(o => setTimeout(o, 3e3));
      const r = yield(e = n.sender) === null || e === void 0 ? void 0 : e.getStats();
      if (!r) throw new Error("Could not get RTCStats");
      let a = 0;
      if (r.forEach(o => {
          o.type === "outbound-rtp" && (o.kind === "audio" || !o.kind && o.mediaType === "audio") && (a = o.packetsSent)
        }), a === 0) throw new Error("Could not determine packets are sent");
      this.appendMessage("published ".concat(a, " audio packets"))
    })
  }
}
class Wf extends wt {
  get description() {
    return "Can publish video"
  }
  perform() {
    return b(this, void 0, void 0, function*() {
      var e;
      const t = yield this.connect(), n = yield Df();
      yield this.checkForVideo(n.mediaStreamTrack), t.localParticipant.publishTrack(n), yield new Promise(a => setTimeout(a, 5e3));
      const s = yield(e = n.sender) === null || e === void 0 ? void 0 : e.getStats();
      if (!s) throw new Error("Could not get RTCStats");
      let r = 0;
      if (s.forEach(a => {
          a.type === "outbound-rtp" && (a.kind === "video" || !a.kind && a.mediaType === "video") && (r += a.packetsSent)
        }), r === 0) throw new Error("Could not determine packets are sent");
      this.appendMessage("published ".concat(r, " video packets"))
    })
  }
  checkForVideo(e) {
    return b(this, void 0, void 0, function*() {
      const t = new MediaStream;
      t.addTrack(e.clone());
      const n = document.createElement("video");
      n.srcObject = t, n.muted = !0, n.autoplay = !0, n.playsInline = !0, n.setAttribute("playsinline", "true"), document.body.appendChild(n), yield new Promise(s => {
        n.onplay = () => {
          setTimeout(() => {
            var r, a, o, c;
            const d = document.createElement("canvas"),
              l = e.getSettings(),
              u = (a = (r = l.width) !== null && r !== void 0 ? r : n.videoWidth) !== null && a !== void 0 ? a : 1280,
              h = (c = (o = l.height) !== null && o !== void 0 ? o : n.videoHeight) !== null && c !== void 0 ? c : 720;
            d.width = u, d.height = h;
            const m = d.getContext("2d");
            m.drawImage(n, 0, 0);
            const p = m.getImageData(0, 0, d.width, d.height).data;
            let _ = !0;
            for (let w = 0; w < p.length; w += 4)
              if (p[w] !== 0 || p[w + 1] !== 0 || p[w + 2] !== 0) {
                _ = !1;
                break
              } _ ? this.appendError("camera appears to be producing only black frames") : this.appendMessage("received video frames"), s()
          }, 1e3)
        }, n.play()
      }), t.getTracks().forEach(s => s.stop()), n.remove()
    })
  }
}
class Hf extends wt {
  get description() {
    return "Resuming connection after interruption"
  }
  perform() {
    return b(this, void 0, void 0, function*() {
      var e;
      const t = yield this.connect();
      let n = !1,
        s = !1,
        r;
      const a = new Promise(d => {
          setTimeout(d, 5e3), r = d
        }),
        o = () => {
          n = !0
        };
      t.on(U.SignalReconnecting, o).on(U.Reconnecting, o).on(U.Reconnected, () => {
        s = !0, r(!0)
      }), (e = t.engine.client.ws) === null || e === void 0 || e.close();
      const c = t.engine.client.onClose;
      if (c && c(""), yield a, n) {
        if (!s || t.state !== re.Connected) throw this.appendWarning("reconnection is only possible in Redis-based configurations"), new Error("Not able to reconnect")
      } else throw new Error("Did not attempt to reconnect")
    })
  }
}
class Kf extends wt {
  get description() {
    return "Can connect via TURN"
  }
  perform() {
    return b(this, void 0, void 0, function*() {
      var e, t, n;
      zt(new URL(this.url)) && (this.appendMessage("Using region specific url"), this.url = (e = yield new se(this.url, this.token).getNextBestRegionUrl()) !== null && e !== void 0 ? e : this.url);
      const s = new Hs,
        r = yield s.join(this.url, this.token, {
          autoSubscribe: !0,
          maxRetries: 0,
          e2eeEnabled: !1,
          websocketTimeout: 15e3
        }, void 0, !0);
      let a = !1,
        o = !1,
        c = !1;
      for (let d of r.iceServers)
        for (let l of d.urls) l.startsWith("turn:") ? (o = !0, c = !0) : l.startsWith("turns:") && (o = !0, c = !0, a = !0), l.startsWith("stun:") && (c = !0);
      c ? o && !a && this.appendWarning("TURN is configured server side, but TURN/TLS is unavailable.") : this.appendWarning("No STUN servers configured on server side."), yield s.close(), !((n = (t = this.connectOptions) === null || t === void 0 ? void 0 : t.rtcConfig) === null || n === void 0) && n.iceServers || o ? yield this.room.connect(this.url, this.token, {
        rtcConfig: {
          iceTransportPolicy: "relay"
        }
      }): (this.appendWarning("No TURN servers configured."), this.skip(), yield new Promise(d => setTimeout(d, 0)))
    })
  }
}
class Gf extends wt {
  get description() {
    return "Establishing WebRTC connection"
  }
  perform() {
    return b(this, void 0, void 0, function*() {
      let e = !1,
        t = !1;
      this.room.on(U.SignalConnected, () => {
        var n;
        const s = this.room.engine.client.onTrickle;
        this.room.engine.client.onTrickle = (r, a) => {
          if (r.candidate) {
            const o = new RTCIceCandidate(r);
            let c = "".concat(o.protocol, " ").concat(o.address, ":").concat(o.port, " ").concat(o.type);
            o.address && (Jf(o.address) ? c += " (private)" : o.protocol === "tcp" && o.tcpType === "passive" ? (e = !0, c += " (passive)") : o.protocol === "udp" && (t = !0)), this.appendMessage(c)
          }
          s && s(r, a)
        }, !((n = this.room.engine.pcManager) === null || n === void 0) && n.subscriber && (this.room.engine.pcManager.subscriber.onIceCandidateError = r => {
          r instanceof RTCPeerConnectionIceErrorEvent && this.appendWarning("error with ICE candidate: ".concat(r.errorCode, " ").concat(r.errorText, " ").concat(r.url))
        })
      });
      try {
        yield this.connect(), X.info("now the room is connected")
      } catch (n) {
        throw this.appendWarning("ports need to be open on firewall in order to connect."), n
      }
      e || this.appendWarning("Server is not configured for ICE/TCP"), t || this.appendWarning("No public IPv4 UDP candidates were found. Your server is likely not configured correctly")
    })
  }
}


class zf extends wt {
  get description() {
    return "Connecting to signal connection via WebSocket"
  }
  perform() {
    return b(this, void 0, void 0, function*() {
      var e, t, n;
      (this.url.startsWith("ws:") || this.url.startsWith("http:")) && this.appendWarning("Server is insecure, clients may block connections to it");
      let s = new Hs,
        r;
      try {
        r = yield s.join(this.url, this.token, {
          autoSubscribe: !0,
          maxRetries: 0,
          e2eeEnabled: !1,
          websocketTimeout: 15e3
        }, void 0, !0)
      } catch (a) {
        if (zt(new URL(this.url))) {
          this.appendMessage("Initial connection failed with error ".concat(a.message, ". Retrying with region fallback"));
          const c = yield new se(this.url, this.token).getNextBestRegionUrl();
          c && (r = yield s.join(c, this.token, {
            autoSubscribe: !0,
            maxRetries: 0,
            e2eeEnabled: !1,
            websocketTimeout: 15e3
          }, void 0, !0), this.appendMessage("Fallback to region worked. To avoid initial connections failing, ensure you're calling room.prepareConnection() ahead of time"))
        }
      }
      r ? (this.appendMessage("Connected to server, version ".concat(r.serverVersion, ".")), ((e = r.serverInfo) === null || e === void 0 ? void 0 : e.edition) === Ta.Cloud && (!((t = r.serverInfo) === null || t === void 0) && t.region) && this.appendMessage("LiveKit Cloud: ".concat((n = r.serverInfo) === null || n === void 0 ? void 0 : n.region))) : this.appendError("Websocket connection could not be established"), yield s.close()
    })
  }
}
class Zp extends et.EventEmitter {
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    super(), this.options = {}, this.checkResults = new Map, this.url = e, this.token = t, this.options = n
  }
  getNextCheckId() {
    const e = this.checkResults.size;
    return this.checkResults.set(e, {
      logs: [],
      status: Be.IDLE,
      name: "",
      description: ""
    }), e
  }
  updateCheck(e, t) {
    this.checkResults.set(e, t), this.emit("checkUpdate", e, t)
  }
  isSuccess() {
    return Array.from(this.checkResults.values()).every(e => e.status !== Be.FAILED)
  }
  getResults() {
    return Array.from(this.checkResults.values())
  }
  createAndRunCheck(e) {
    return b(this, void 0, void 0, function*() {
      const t = this.getNextCheckId(),
        n = new e(this.url, this.token, this.options),
        s = a => {
          this.updateCheck(t, a)
        };
      n.on("update", s);
      const r = yield n.run();
      return n.off("update", s), r
    })
  }
  checkWebsocket() {
    return b(this, void 0, void 0, function*() {
      return this.createAndRunCheck(zf)
    })
  }
  checkWebRTC() {
    return b(this, void 0, void 0, function*() {
      return this.createAndRunCheck(Gf)
    })
  }
  checkTURN() {
    return b(this, void 0, void 0, function*() {
      return this.createAndRunCheck(Kf)
    })
  }
  checkReconnect() {
    return b(this, void 0, void 0, function*() {
      return this.createAndRunCheck(Hf)
    })
  }
  checkPublishAudio() {
    return b(this, void 0, void 0, function*() {
      return this.createAndRunCheck(qf)
    })
  }
  checkPublishVideo() {
    return b(this, void 0, void 0, function*() {
      return this.createAndRunCheck(Wf)
    })
  }
  checkConnectionProtocol() {
    return b(this, void 0, void 0, function*() {
      const e = yield this.createAndRunCheck(Vf);
      if (e.data && "protocol" in e.data) {
        const t = e.data;
        this.options.protocol = t.protocol
      }
      return e
    })
  }
  checkCloudRegion() {
    return b(this, void 0, void 0, function*() {
      return this.createAndRunCheck(Bf)
    })
  }
}

function ie(i, e, t) {
  return (e = Qf(e)) in i ? Object.defineProperty(i, e, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : i[e] = t, i
}



function Qf(i) {
  var e = $f(i, "string");
  return typeof e == "symbol" ? e : e + ""
}
new TextEncoder;
new TextDecoder;
class Ie extends Error {
  constructor(e, t) {
    var n;
    super(e, t), ie(this, "code", "ERR_JOSE_GENERIC"), this.name = this.constructor.name, (n = Error.captureStackTrace) === null || n === void 0 || n.call(Error, this, this.constructor)
  }
}
ie(Ie, "code", "ERR_JOSE_GENERIC");
class Yf extends Ie {
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "unspecified",
      s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "unspecified";
    super(e, {
      cause: {
        claim: n,
        reason: s,
        payload: t
      }
    }), ie(this, "code", "ERR_JWT_CLAIM_VALIDATION_FAILED"), ie(this, "claim", void 0), ie(this, "reason", void 0), ie(this, "payload", void 0), this.claim = n, this.reason = s, this.payload = t
  }
}
ie(Yf, "code", "ERR_JWT_CLAIM_VALIDATION_FAILED");
class Xf extends Ie {
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "unspecified",
      s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "unspecified";
    super(e, {
      cause: {
        claim: n,
        reason: s,
        payload: t
      }
    }), ie(this, "code", "ERR_JWT_EXPIRED"), ie(this, "claim", void 0), ie(this, "reason", void 0), ie(this, "payload", void 0), this.claim = n, this.reason = s, this.payload = t
  }
}
ie(Xf, "code", "ERR_JWT_EXPIRED");
class Zf extends Ie {
  constructor() {
    super(...arguments), ie(this, "code", "ERR_JOSE_ALG_NOT_ALLOWED")
  }
}
ie(Zf, "code", "ERR_JOSE_ALG_NOT_ALLOWED");
class ep extends Ie {
  constructor() {
    super(...arguments), ie(this, "code", "ERR_JOSE_NOT_SUPPORTED")
  }
}
ie(ep, "code", "ERR_JOSE_NOT_SUPPORTED");
class tp extends Ie {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "decryption operation failed",
      t = arguments.length > 1 ? arguments[1] : void 0;
    super(e, t), ie(this, "code", "ERR_JWE_DECRYPTION_FAILED")
  }
}
ie(tp, "code", "ERR_JWE_DECRYPTION_FAILED");
class ip extends Ie {
  constructor() {
    super(...arguments), ie(this, "code", "ERR_JWE_INVALID")
  }
}
ie(ip, "code", "ERR_JWE_INVALID");
class np extends Ie {
  constructor() {
    super(...arguments), ie(this, "code", "ERR_JWS_INVALID")
  }
}
ie(np, "code", "ERR_JWS_INVALID");
class sp extends Ie {
  constructor() {
    super(...arguments), ie(this, "code", "ERR_JWT_INVALID")
  }
}
ie(sp, "code", "ERR_JWT_INVALID");
class rp extends Ie {
  constructor() {
    super(...arguments), ie(this, "code", "ERR_JWK_INVALID")
  }
}
ie(rp, "code", "ERR_JWK_INVALID");
class op extends Ie {
  constructor() {
    super(...arguments), ie(this, "code", "ERR_JWKS_INVALID")
  }
}
ie(op, "code", "ERR_JWKS_INVALID");
class ap extends Ie {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "no applicable key found in the JSON Web Key Set",
      t = arguments.length > 1 ? arguments[1] : void 0;
    super(e, t), ie(this, "code", "ERR_JWKS_NO_MATCHING_KEY")
  }
}
ie(ap, "code", "ERR_JWKS_NO_MATCHING_KEY");
class cp extends Ie {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "multiple matching keys found in the JSON Web Key Set",
      t = arguments.length > 1 ? arguments[1] : void 0;
    super(e, t), ie(this, Symbol.asyncIterator, void 0), ie(this, "code", "ERR_JWKS_MULTIPLE_MATCHING_KEYS")
  }
}
ie(cp, "code", "ERR_JWKS_MULTIPLE_MATCHING_KEYS");
class dp extends Ie {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "request timed out",
      t = arguments.length > 1 ? arguments[1] : void 0;
    super(e, t), ie(this, "code", "ERR_JWKS_TIMEOUT")
  }
}
ie(dp, "code", "ERR_JWKS_TIMEOUT");
class lp extends Ie {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "signature verification failed",
      t = arguments.length > 1 ? arguments[1] : void 0;
    super(e, t), ie(this, "code", "ERR_JWS_SIGNATURE_VERIFICATION_FAILED")
  }
}
ie(lp, "code", "ERR_JWS_SIGNATURE_VERIFICATION_FAILED");

export { $t as Room, O as Track, U as RoomEvent, ln as ScreenSharePresets };
