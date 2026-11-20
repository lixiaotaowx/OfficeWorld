// engine.io parser + Emitter base (vendored verbatim).
// Recovered verbatim from the production bundle; only imports/exports added.
const H = Object.create(null);
H.open = "0";
H.close = "1";
H.ping = "2";
H.pong = "3";
H.message = "4";
H.upgrade = "5";
H.noop = "6";
const ne = Object.create(null);
Object.keys(H).forEach(n => {
  ne[H[n]] = n
});
const de = {
    type: "error",
    data: "parser error"
  },
  Fe = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]",
  De = typeof ArrayBuffer == "function",
  Ve = n => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(n) : n && n.buffer instanceof ArrayBuffer,
  we = ({
    type: n,
    data: e
  }, t, s) => Fe && e instanceof Blob ? t ? s(e) : Ne(e, s) : De && (e instanceof ArrayBuffer || Ve(e)) ? t ? s(e) : Ne(new Blob([e]), s) : s(H[n] + (e || "")),
  Ne = (n, e) => {
    const t = new FileReader;
    return t.onload = function() {
      const s = t.result.split(",")[1];
      e("b" + (s || ""))
    }, t.readAsDataURL(n)
  };

function Be(n) {
  return n instanceof Uint8Array ? n : n instanceof ArrayBuffer ? new Uint8Array(n) : new Uint8Array(n.buffer, n.byteOffset, n.byteLength)
}
let he;

function Rt(n, e) {
  if (Fe && n.data instanceof Blob) return n.data.arrayBuffer().then(Be).then(e);
  if (De && (n.data instanceof ArrayBuffer || Ve(n.data))) return e(Be(n.data));
  we(n, !1, t => {
    he || (he = new TextEncoder), e(he.encode(t))
  })
}
const qe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  Q = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let n = 0; n < qe.length; n++) Q[qe.charCodeAt(n)] = n;
const Nt = n => {
    let e = n.length * .75,
      t = n.length,
      s, r = 0,
      i, o, a, f;
    n[n.length - 1] === "=" && (e--, n[n.length - 2] === "=" && e--);
    const d = new ArrayBuffer(e),
      m = new Uint8Array(d);
    for (s = 0; s < t; s += 4) i = Q[n.charCodeAt(s)], o = Q[n.charCodeAt(s + 1)], a = Q[n.charCodeAt(s + 2)], f = Q[n.charCodeAt(s + 3)], m[r++] = i << 2 | o >> 4, m[r++] = (o & 15) << 4 | a >> 2, m[r++] = (a & 3) << 6 | f & 63;
    return d
  },
  Bt = typeof ArrayBuffer == "function",
  ve = (n, e) => {
    if (typeof n != "string") return {
      type: "message",
      data: Ue(n, e)
    };
    const t = n.charAt(0);
    return t === "b" ? {
      type: "message",
      data: qt(n.substring(1), e)
    } : ne[t] ? n.length > 1 ? {
      type: ne[t],
      data: n.substring(1)
    } : {
      type: ne[t]
    } : de
  },
  qt = (n, e) => {
    if (Bt) {
      const t = Nt(n);
      return Ue(t, e)
    } else return {
      base64: !0,
      data: n
    }
  },
  Ue = (n, e) => {
    switch (e) {
      case "blob":
        return n instanceof Blob ? n : new Blob([n]);
      case "arraybuffer":
      default:
        return n instanceof ArrayBuffer ? n : n.buffer
    }
  },
  ze = "",
  It = (n, e) => {
    const t = n.length,
      s = new Array(t);
    let r = 0;
    n.forEach((i, o) => {
      we(i, !1, a => {
        s[o] = a, ++r === t && e(s.join(ze))
      })
    })
  },
  Lt = (n, e) => {
    const t = n.split(ze),
      s = [];
    for (let r = 0; r < t.length; r++) {
      const i = ve(t[r], e);
      if (s.push(i), i.type === "error") break
    }
    return s
  };

function Mt() {
  return new TransformStream({
    transform(n, e) {
      Rt(n, t => {
        const s = t.length;
        let r;
        if (s < 126) r = new Uint8Array(1), new DataView(r.buffer).setUint8(0, s);
        else if (s < 65536) {
          r = new Uint8Array(3);
          const i = new DataView(r.buffer);
          i.setUint8(0, 126), i.setUint16(1, s)
        } else {
          r = new Uint8Array(9);
          const i = new DataView(r.buffer);
          i.setUint8(0, 127), i.setBigUint64(1, BigInt(s))
        }
        n.data && typeof n.data != "string" && (r[0] |= 128), e.enqueue(r), e.enqueue(t)
      })
    }
  })
}
let fe;

function Z(n) {
  return n.reduce((e, t) => e + t.length, 0)
}

function ee(n, e) {
  if (n[0].length === e) return n.shift();
  const t = new Uint8Array(e);
  let s = 0;
  for (let r = 0; r < e; r++) t[r] = n[0][s++], s === n[0].length && (n.shift(), s = 0);
  return n.length && s < n[0].length && (n[0] = n[0].slice(s)), t
}

function Pt(n, e) {
  fe || (fe = new TextDecoder);
  const t = [];
  let s = 0,
    r = -1,
    i = !1;
  return new TransformStream({
    transform(o, a) {
      for (t.push(o);;) {
        if (s === 0) {
          if (Z(t) < 1) break;
          const f = ee(t, 1);
          i = (f[0] & 128) === 128, r = f[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2
        } else if (s === 1) {
          if (Z(t) < 2) break;
          const f = ee(t, 2);
          r = new DataView(f.buffer, f.byteOffset, f.length).getUint16(0), s = 3
        } else if (s === 2) {
          if (Z(t) < 8) break;
          const f = ee(t, 8),
            d = new DataView(f.buffer, f.byteOffset, f.length),
            m = d.getUint32(0);
          if (m > Math.pow(2, 21) - 1) {
            a.enqueue(de);
            break
          }
          r = m * Math.pow(2, 32) + d.getUint32(4), s = 3
        } else {
          if (Z(t) < r) break;
          const f = ee(t, r);
          a.enqueue(ve(i ? f : fe.decode(f), e)), s = 0
        }
        if (r === 0 || r > n) {
          a.enqueue(de);
          break
        }
      }
    }
  })
}
const xe = 4;

function M(n) {
  if (n) return Ft(n)
}

function Ft(n) {
  for (var e in M.prototype) n[e] = M.prototype[e];
  return n
}
M.prototype.on = M.prototype.addEventListener = function(n, e) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + n] = this._callbacks["$" + n] || []).push(e), this
};
M.prototype.once = function(n, e) {
  function t() {
    this.off(n, t), e.apply(this, arguments)
  }
  return t.fn = e, this.on(n, t), this
};
M.prototype.off = M.prototype.removeListener = M.prototype.removeAllListeners = M.prototype.removeEventListener = function(n, e) {
  if (this._callbacks = this._callbacks || {}, arguments.length == 0) return this._callbacks = {}, this;
  var t = this._callbacks["$" + n];
  if (!t) return this;
  if (arguments.length == 1) return delete this._callbacks["$" + n], this;
  for (var s, r = 0; r < t.length; r++)
    if (s = t[r], s === e || s.fn === e) {
      t.splice(r, 1);
      break
    } return t.length === 0 && delete this._callbacks["$" + n], this
};
M.prototype.emit = function(n) {
  this._callbacks = this._callbacks || {};
  for (var e = new Array(arguments.length - 1), t = this._callbacks["$" + n], s = 1; s < arguments.length; s++) e[s - 1] = arguments[s];
  if (t) {
    t = t.slice(0);
    for (var s = 0, r = t.length; s < r; ++s) t[s].apply(this, e)
  }
  return this
};
M.prototype.emitReserved = M.prototype.emit;
M.prototype.listeners = function(n) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + n] || []
};
M.prototype.hasListeners = function(n) {
  return !!this.listeners(n).length
};

export { we, ve, It, Lt, Mt, Pt, xe, M };
