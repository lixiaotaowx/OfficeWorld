// standalone.js — legacy aggregation shim from the original main chunk split.
// Consumers should import from the focused modules (authSession, hostStateBridge,
// hostMedia, meeting, screen-share, update) instead of this file over time.
// Current internal sections, in order:
//   1. small utils (Cs..Zo)          — misc helpers
//   2. Es class + pn/Tr/Yl           — office runtime plumbing
//   3. re-exports at the bottom      — kept for the 15 consumers above
export { restoreLogin as Md, getHostStateBridge as Ss, getHostMediaBridge as Wo, readHostAccount as Bn, subscribeToHostAccount as Ad } from './authSession.js';

function Cs(i) {
  return i.atDesk !== !1
};

function Vd(i) {
  const e = Math.floor(i / 1e3);
  if (e < 60) return `Away for ${Math.max(1,e)} sec`;
  const t = Math.floor(e / 60);
  if (t < 60) return `Away for ${t} min`;
  const n = t / 60;
  return `Away for ${n>=10?Math.round(n):Math.round(n*10)/10} hr`
};

async function ar(i) {
  const e = await fetch("/api/presence-status", i === void 0 ? {
      cache: "no-store"
    } : {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: i
      }),
      signal: AbortSignal.timeout(8e3)
    }),
    t = await e.json();
  if (!e.ok) throw Error(t.error || "状态没存上");
  return t.statuses
};

function Vn(i) {
  let e = 7;
  for (let t = 0; t < i.length; t += 1) e = (e * 31 + i.charCodeAt(t)) % 360;
  return `hsl(${e} 74% 46%)`
};

function Hd(i, e, t) {
  const {
    clientWidth: n,
    clientHeight: s
  } = i;
  if (!n || !s || !e || !t) return null;
  const r = Math.min(n / e, s / t),
    a = e * r,
    o = t * r;
  return {
    x: (n - a) / 2,
    y: (s - o) / 2,
    width: a,
    height: o
  }
};

function Kd(i, e, t, n = .02) {
  const s = (e - i.x) / i.width,
    r = (t - i.y) / i.height;
  return s < -n || s > 1 + n || r < -n || r > 1 + n ? null : [Math.min(1, Math.max(0, s)), Math.min(1, Math.max(0, r))]
};

function cr(i) {
  return {
    live: "",
    waiting: "等第一帧画面…",
    paused: "画面暂停了，停在最后一帧",
    muted: "画面暂时没有，等一下…",
    disconnected: "屏幕共享断开了"
  } [i]
};

function ur(i) {
  return ["excellent", "good", "poor", "lost"].includes(String(i)) ? i : "unknown"
};

function mr(i) {
  const e = String(i ?? "").trim().replace(/^v/i, "");
  return /^\d+(\.\d+)*$/.test(e) ? e.split(".").map(t => Number(t) || 0) : [0]
};

function Pi(i) {
  const e = Number(i);
  return !Number.isFinite(e) || e <= 0 ? "" : e < 1024 ? Math.round(e) + " B" : e < 1024 * 1024 ? Math.round(e / 1024) + " KB" : Math.round(e / 1024 / 1024 * 10) / 10 + " MB"
};

function ll(i, e) {
  return !Number.isFinite(Number(i)) || !Number.isFinite(Number(e)) || Number(e) <= 0 ? null : Math.max(0, Math.min(100, Math.round(Number(i) / Number(e) * 100)))
};

function qn(i, e) {
  if (!i.trim()) return null;
  try {
    const t = new URL(i, e);
    return t.origin === e && /^https?:$/.test(t.protocol) && !t.username && !t.password ? t.href : null
  } catch {
    return null
  }
};

function gr(i) {
  if (!i) return i;
  const {
    micLevel: e,
    ...t
  } = i;
  return t
};

function Dl(i, e) {
  return !!i || /\bElectron\/\d/i.test(e)
};

function vr(i) {
  return i.mayBroadcast === !1 ? !1 : i.desktop && i.connected
};

function Nl(i, e) {
  return i && e ? 6e3 : 12e3
};

function Ll(i) {
  return i.active ? i.watched ? "正在显示你的画面" : "正在显示你的画面（现在没人在看）" : i.paused ? "离开 1 分钟后暂停了，让屏幕可以休眠" : i.desktop ? i.connected ? i.mayBroadcast ? i.failed ? "截屏失败，正在重试" : "正在准备…" : "访客不显示画面" : "正在连接…" : "在浏览器里要先点“允许”共享屏幕"
};

function Ul(i, e) {
  return e.forEach(function(t) {
    t && typeof t != "string" && !Array.isArray(t) && Object.keys(t).forEach(function(n) {
      if (n !== "default" && !(n in i)) {
        var s = Object.getOwnPropertyDescriptor(t, n);
        Object.defineProperty(i, n, s.get ? s : {
          enumerable: !0,
          get: function() {
            return t[n]
          }
        })
      }
    })
  }), Object.freeze(i)
};

function he(i, e) {
  if (!i) throw new Error(e)
};

function Zo(i) {
  return "localName" in i ? i : Object.assign(Object.assign({}, i), {
    localName: i.name
  })
};

class Es {
  equals(e) {
    return this.getType().runtime.util.equals(this.getType(), this, e)
  }
  clone() {
    return this.getType().runtime.util.clone(this)
  }
  fromBinary(e, t) {
    const n = this.getType(),
      s = n.runtime.bin,
      r = s.makeReadOptions(t);
    return s.readMessage(this, r.readerFactory(e), e.byteLength, r), this
  }
  fromJson(e, t) {
    const n = this.getType(),
      s = n.runtime.json,
      r = s.makeReadOptions(t);
    return s.readMessage(n, e, r, this), this
  }
  fromJsonString(e, t) {
    let n;
    try {
      n = JSON.parse(e)
    } catch (s) {
      throw new Error("cannot decode ".concat(this.getType().typeName, " from JSON: ").concat(s instanceof Error ? s.message : String(s)))
    }
    return this.fromJson(n, t)
  }
  toBinary(e) {
    const t = this.getType(),
      n = t.runtime.bin,
      s = n.makeWriteOptions(e),
      r = s.writerFactory();
    return n.writeMessage(this, r, s), r.finish()
  }
  toJson(e) {
    const t = this.getType(),
      n = t.runtime.json,
      s = n.makeWriteOptions(e);
    return n.writeMessage(this, s)
  }
  toJsonString(e) {
    var t;
    const n = this.toJson(e);
    return JSON.stringify(n, null, (t = e == null ? void 0 : e.prettySpaces) !== null && t !== void 0 ? t : 0)
  }
  toJSON() {
    return this.toJson({
      emitDefaultValues: !0
    })
  }
  getType() {
    return Object.getPrototypeOf(this).constructor
  }
};

function zl() {
  let i = 0,
    e = 0;
  for (let n = 0; n < 28; n += 7) {
    let s = this.buf[this.pos++];
    if (i |= (s & 127) << n, !(s & 128)) return this.assertBounds(), [i, e]
  }
  let t = this.buf[this.pos++];
  if (i |= (t & 15) << 28, e = (t & 112) >> 4, !(t & 128)) return this.assertBounds(), [i, e];
  for (let n = 3; n <= 31; n += 7) {
    let s = this.buf[this.pos++];
    if (e |= (s & 127) << n, !(s & 128)) return this.assertBounds(), [i, e]
  }
  throw new Error("invalid varint")
};

function pn(i, e, t) {
  for (let r = 0; r < 28; r = r + 7) {
    const a = i >>> r,
      o = !(!(a >>> 7) && e == 0),
      c = (o ? a | 128 : a) & 255;
    if (t.push(c), !o) return
  }
  const n = i >>> 28 & 15 | (e & 7) << 4,
    s = !!(e >> 3);
  if (t.push((s ? n | 128 : n) & 255), !!s) {
    for (let r = 3; r < 31; r = r + 7) {
      const a = e >>> r,
        o = !!(a >>> 7),
        c = (o ? a | 128 : a) & 255;
      if (t.push(c), !o) return
    }
    t.push(e >>> 31 & 1)
  }
};

function Tr(i, e) {
  if (i >= 0) {
    for (; i > 127;) e.push(i & 127 | 128), i = i >>> 7;
    e.push(i)
  } else {
    for (let t = 0; t < 9; t++) e.push(i & 127 | 128), i = i >> 7;
    e.push(1)
  }
};

function Yl() {
  let i = this.buf[this.pos++],
    e = i & 127;
  if (!(i & 128)) return this.assertBounds(), e;
  if (i = this.buf[this.pos++], e |= (i & 127) << 7, !(i & 128)) return this.assertBounds(), e;
  if (i = this.buf[this.pos++], e |= (i & 127) << 14, !(i & 128)) return this.assertBounds(), e;
  if (i = this.buf[this.pos++], e |= (i & 127) << 21, !(i & 128)) return this.assertBounds(), e;
  i = this.buf[this.pos++], e |= (i & 15) << 28;
  for (let t = 5; i & 128 && t < 10; t++) i = this.buf[this.pos++];
  if (i & 128) throw new Error("invalid varint");
  return this.assertBounds(), e >>> 0
};

function tu(i, e, t, n) {
  let s;
  return {
    typeName: e,
    extendee: t,
    get field() {
      if (!s) {
        const r = typeof n == "function" ? n() : n;
        r.name = e.split(".").pop(), r.jsonName = "[".concat(e, "]"), s = i.util.newFieldList([r]).list()[0]
      }
      return s
    },
    runtime: i
  }
};

function $e(i) {
  if (i === null) return "null";
  switch (typeof i) {
    case "object":
      return Array.isArray(i) ? "array" : "object";
    case "string":
      return i.length > 100 ? "string" : '"'.concat(i.split('"').join('\\"'), '"');
    default:
      return String(i)
  }
};

function lu(i) {
  return i.repeated || i.kind == "map" ? !0 : !(i.oneof || i.kind == "message" || i.opt || i.req)
};

function Xt(i) {
  return i instanceof Uint8Array ? i : new Uint8Array(i)
};

function ua(i) {
  let e = !1;
  const t = [];
  for (let n = 0; n < i.length; n++) {
    let s = i.charAt(n);
    switch (s) {
      case "_":
        e = !0;
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        t.push(s), e = !1;
        break;
      default:
        e && (e = !1, s = s.toUpperCase()), t.push(s);
        break
    }
  }
  return t.join("")
};

function Sh(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i
};

function Rh(i, e) {
  var t = {};
  for (var n in i) Object.prototype.hasOwnProperty.call(i, n) && e.indexOf(n) < 0 && (t[n] = i[n]);
  if (i != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, n = Object.getOwnPropertySymbols(i); s < n.length; s++) e.indexOf(n[s]) < 0 && Object.prototype.propertyIsEnumerable.call(i, n[s]) && (t[n[s]] = i[n[s]]);
  return t
};

function b(i, e, t, n) {
  function s(r) {
    return r instanceof t ? r : new t(function(a) {
      a(r)
    })
  }
  return new(t || (t = Promise))(function(r, a) {
    function o(l) {
      try {
        d(n.next(l))
      } catch (u) {
        a(u)
      }
    }

    function c(l) {
      try {
        d(n.throw(l))
      } catch (u) {
        a(u)
      }
    }

    function d(l) {
      l.done ? r(l.value) : s(l.value).then(o, c)
    }
    d((n = n.apply(i, e || [])).next())
  })
};

function Lr(i) {
  var e = typeof Symbol == "function" && Symbol.iterator,
    t = e && i[e],
    n = 0;
  if (t) return t.call(i);
  if (i && typeof i.length == "number") return {
    next: function() {
      return i && n >= i.length && (i = void 0), {
        value: i && i[n++],
        done: !i
      }
    }
  };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.")
};

function oi(i, e, t) {
  const n = i.match(e);
  return n && n.length >= t && parseFloat(n[t], 10)
};

function Nt(i, e, t) {
  if (!i.RTCPeerConnection) return;
  const n = i.RTCPeerConnection.prototype,
    s = n.addEventListener;
  n.addEventListener = function(a, o) {
    if (a !== e) return s.apply(this, arguments);
    const c = d => {
      const l = t(d);
      l && (o.handleEvent ? o.handleEvent(l) : o(l))
    };
    return this._eventMap = this._eventMap || {}, this._eventMap[e] || (this._eventMap[e] = new Map), this._eventMap[e].set(o, c), s.apply(this, [a, c])
  };
  const r = n.removeEventListener;
  n.removeEventListener = function(a, o) {
    if (a !== e || !this._eventMap || !this._eventMap[e]) return r.apply(this, arguments);
    if (!this._eventMap[e].has(o)) return r.apply(this, arguments);
    const c = this._eventMap[e].get(o);
    return this._eventMap[e].delete(o), this._eventMap[e].size === 0 && delete this._eventMap[e], Object.keys(this._eventMap).length === 0 && delete this._eventMap, r.apply(this, [a, c])
  }, Object.defineProperty(n, "on" + e, {
    get() {
      return this["_on" + e]
    },
    set(a) {
      this["_on" + e] && (this.removeEventListener(e, this["_on" + e]), delete this["_on" + e]), a && this.addEventListener(e, this["_on" + e] = a)
    },
    enumerable: !0,
    configurable: !0
  })
};

function jr(i) {
  return Object.prototype.toString.call(i) === "[object Object]"
};

function Ja(i) {
  i.MediaStream = i.MediaStream || i.webkitMediaStream
};

function $a(i) {
  if (typeof i == "object" && i.RTCPeerConnection && !("getSenders" in i.RTCPeerConnection.prototype) && "createDTMFSender" in i.RTCPeerConnection.prototype) {
    const e = function(s, r) {
      return {
        track: r,
        get dtmf() {
          return this._dtmf === void 0 && (r.kind === "audio" ? this._dtmf = s.createDTMFSender(r) : this._dtmf = null), this._dtmf
        },
        _pc: s
      }
    };
    if (!i.RTCPeerConnection.prototype.getSenders) {
      i.RTCPeerConnection.prototype.getSenders = function() {
        return this._senders = this._senders || [], this._senders.slice()
      };
      const s = i.RTCPeerConnection.prototype.addTrack;
      i.RTCPeerConnection.prototype.addTrack = function(o, c) {
        let d = s.apply(this, arguments);
        return d || (d = e(this, o), this._senders.push(d)), d
      };
      const r = i.RTCPeerConnection.prototype.removeTrack;
      i.RTCPeerConnection.prototype.removeTrack = function(o) {
        r.apply(this, arguments);
        const c = this._senders.indexOf(o);
        c !== -1 && this._senders.splice(c, 1)
      }
    }
    const t = i.RTCPeerConnection.prototype.addStream;
    i.RTCPeerConnection.prototype.addStream = function(r) {
      this._senders = this._senders || [], t.apply(this, [r]), r.getTracks().forEach(a => {
        this._senders.push(e(this, a))
      })
    };
    const n = i.RTCPeerConnection.prototype.removeStream;
    i.RTCPeerConnection.prototype.removeStream = function(r) {
      this._senders = this._senders || [], n.apply(this, [r]), r.getTracks().forEach(a => {
        const o = this._senders.find(c => c.track === a);
        o && this._senders.splice(this._senders.indexOf(o), 1)
      })
    }
  } else if (typeof i == "object" && i.RTCPeerConnection && "getSenders" in i.RTCPeerConnection.prototype && "createDTMFSender" in i.RTCPeerConnection.prototype && i.RTCRtpSender && !("dtmf" in i.RTCRtpSender.prototype)) {
    const e = i.RTCPeerConnection.prototype.getSenders;
    i.RTCPeerConnection.prototype.getSenders = function() {
      const n = e.apply(this, []);
      return n.forEach(s => s._pc = this), n
    }, Object.defineProperty(i.RTCRtpSender.prototype, "dtmf", {
      get() {
        return this._dtmf === void 0 && (this.track.kind === "audio" ? this._dtmf = this._pc.createDTMFSender(this.track) : this._dtmf = null), this._dtmf
      }
    })
  }
};

function Qn(i, e) {
  !i.RTCPeerConnection && i.webkitRTCPeerConnection && (i.RTCPeerConnection = i.webkitRTCPeerConnection), i.RTCPeerConnection && e.version < 53 && ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(t) {
    const n = i.RTCPeerConnection.prototype[t],
      s = {
        [t]() {
          return arguments[0] = new(t === "addIceCandidate" ? i.RTCIceCandidate : i.RTCSessionDescription)(arguments[0]), n.apply(this, arguments)
        }
      };
    i.RTCPeerConnection.prototype[t] = s[t]
  })
};

function Oh(i, e) {
  i.navigator.mediaDevices && "getDisplayMedia" in i.navigator.mediaDevices || i.navigator.mediaDevices && (i.navigator.mediaDevices.getDisplayMedia = function(n) {
    if (!(n && n.video)) {
      const s = new DOMException("getDisplayMedia without video constraints is undefined");
      return s.name = "NotFoundError", s.code = 8, Promise.reject(s)
    }
    return n.video === !0 ? n.video = {
      mediaSource: e
    } : n.video.mediaSource = e, i.navigator.mediaDevices.getUserMedia(n)
  })
};

function tc(i) {
  typeof i == "object" && i.RTCTrackEvent && "receiver" in i.RTCTrackEvent.prototype && !("transceiver" in i.RTCTrackEvent.prototype) && Object.defineProperty(i.RTCTrackEvent.prototype, "transceiver", {
    get() {
      return {
        receiver: this.receiver
      }
    }
  })
};

function Yn(i, e) {
  if (typeof i != "object" || !(i.RTCPeerConnection || i.mozRTCPeerConnection)) return;
  !i.RTCPeerConnection && i.mozRTCPeerConnection && (i.RTCPeerConnection = i.mozRTCPeerConnection), e.version < 53 && ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(s) {
    const r = i.RTCPeerConnection.prototype[s],
      a = {
        [s]() {
          return arguments[0] = new(s === "addIceCandidate" ? i.RTCIceCandidate : i.RTCSessionDescription)(arguments[0]), r.apply(this, arguments)
        }
      };
    i.RTCPeerConnection.prototype[s] = a[s]
  });
  const t = {
      inboundrtp: "inbound-rtp",
      outboundrtp: "outbound-rtp",
      candidatepair: "candidate-pair",
      localcandidate: "local-candidate",
      remotecandidate: "remote-candidate"
    },
    n = i.RTCPeerConnection.prototype.getStats;
  i.RTCPeerConnection.prototype.getStats = function() {
    const [r, a, o] = arguments;
    return n.apply(this, [r || null]).then(c => {
      if (e.version < 53 && !a) try {
        c.forEach(d => {
          d.type = t[d.type] || d.type
        })
      } catch (d) {
        if (d.name !== "TypeError") throw d;
        c.forEach((l, u) => {
          c.set(u, Object.assign({}, l, {
            type: t[l.type] || l.type
          }))
        })
      }
      return c
    }).then(a, o)
  }
};

function ic(i) {
  if (!(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender) || i.RTCRtpSender && "getStats" in i.RTCRtpSender.prototype) return;
  const e = i.RTCPeerConnection.prototype.getSenders;
  e && (i.RTCPeerConnection.prototype.getSenders = function() {
    const s = e.apply(this, []);
    return s.forEach(r => r._pc = this), s
  });
  const t = i.RTCPeerConnection.prototype.addTrack;
  t && (i.RTCPeerConnection.prototype.addTrack = function() {
    const s = t.apply(this, arguments);
    return s._pc = this, s
  }), i.RTCRtpSender.prototype.getStats = function() {
    return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map)
  }
};

function rc(i) {
  i.DataChannel && !i.RTCDataChannel && (i.RTCDataChannel = i.DataChannel)
};

function oc(i) {
  if (!(typeof i == "object" && i.RTCPeerConnection)) return;
  const e = i.RTCPeerConnection.prototype.addTransceiver;
  e && (i.RTCPeerConnection.prototype.addTransceiver = function() {
    this.setParametersPromises = [];
    let n = arguments[1] && arguments[1].sendEncodings;
    n === void 0 && (n = []), n = [...n];
    const s = n.length > 0;
    s && n.forEach(a => {
      if ("rid" in a && !/^[a-z0-9]{0,16}$/i.test(a.rid)) throw new TypeError("Invalid RID value provided.");
      if ("scaleResolutionDownBy" in a && !(parseFloat(a.scaleResolutionDownBy) >= 1)) throw new RangeError("scale_resolution_down_by must be >= 1.0");
      if ("maxFramerate" in a && !(parseFloat(a.maxFramerate) >= 0)) throw new RangeError("max_framerate must be >= 0.0")
    });
    const r = e.apply(this, arguments);
    if (s) {
      const {
        sender: a
      } = r, o = a.getParameters();
      (!("encodings" in o) || o.encodings.length === 1 && Object.keys(o.encodings[0]).length === 0) && (o.encodings = n, a.sendEncodings = n, this.setParametersPromises.push(a.setParameters(o).then(() => {
        delete a.sendEncodings
      }).catch(() => {
        delete a.sendEncodings
      })))
    }
    return r
  })
};

function ac(i) {
  if (!(typeof i == "object" && i.RTCRtpSender)) return;
  const e = i.RTCRtpSender.prototype.getParameters;
  e && (i.RTCRtpSender.prototype.getParameters = function() {
    const n = e.apply(this, arguments);
    return "encodings" in n || (n.encodings = [].concat(this.sendEncodings || [{}])), n
  })
};

function cc(i) {
  if (!(typeof i == "object" && i.RTCPeerConnection)) return;
  const e = i.RTCPeerConnection.prototype.createOffer;
  i.RTCPeerConnection.prototype.createOffer = function() {
    return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(() => e.apply(this, arguments)).finally(() => {
      this.setParametersPromises = []
    }) : e.apply(this, arguments)
  }
};

function dc(i) {
  if (!(typeof i == "object" && i.RTCPeerConnection)) return;
  const e = i.RTCPeerConnection.prototype.createAnswer;
  i.RTCPeerConnection.prototype.createAnswer = function() {
    return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(() => e.apply(this, arguments)).finally(() => {
      this.setParametersPromises = []
    }) : e.apply(this, arguments)
  }
};

function lc(i) {
  if (!(typeof i != "object" || !i.RTCPeerConnection)) {
    if ("getLocalStreams" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.getLocalStreams = function() {
        return this._localStreams || (this._localStreams = []), this._localStreams
      }), !("addStream" in i.RTCPeerConnection.prototype)) {
      const e = i.RTCPeerConnection.prototype.addTrack;
      i.RTCPeerConnection.prototype.addStream = function(n) {
        this._localStreams || (this._localStreams = []), this._localStreams.includes(n) || this._localStreams.push(n), n.getAudioTracks().forEach(s => e.call(this, s, n)), n.getVideoTracks().forEach(s => e.call(this, s, n))
      }, i.RTCPeerConnection.prototype.addTrack = function(n) {
        for (var s = arguments.length, r = new Array(s > 1 ? s - 1 : 0), a = 1; a < s; a++) r[a - 1] = arguments[a];
        return r && r.forEach(o => {
          this._localStreams ? this._localStreams.includes(o) || this._localStreams.push(o) : this._localStreams = [o]
        }), e.apply(this, arguments)
      }
    }
    "removeStream" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.removeStream = function(t) {
      this._localStreams || (this._localStreams = []);
      const n = this._localStreams.indexOf(t);
      if (n === -1) return;
      this._localStreams.splice(n, 1);
      const s = t.getTracks();
      this.getSenders().forEach(r => {
        s.includes(r.track) && this.removeTrack(r)
      })
    })
  }
};

function uc(i) {
  if (!(typeof i != "object" || !i.RTCPeerConnection) && ("getRemoteStreams" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.getRemoteStreams = function() {
      return this._remoteStreams ? this._remoteStreams : []
    }), !("onaddstream" in i.RTCPeerConnection.prototype))) {
    Object.defineProperty(i.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream
      },
      set(t) {
        this._onaddstream && (this.removeEventListener("addstream", this._onaddstream), this.removeEventListener("track", this._onaddstreampoly)), this.addEventListener("addstream", this._onaddstream = t), this.addEventListener("track", this._onaddstreampoly = n => {
          n.streams.forEach(s => {
            if (this._remoteStreams || (this._remoteStreams = []), this._remoteStreams.includes(s)) return;
            this._remoteStreams.push(s);
            const r = new Event("addstream");
            r.stream = s, this.dispatchEvent(r)
          })
        })
      }
    });
    const e = i.RTCPeerConnection.prototype.setRemoteDescription;
    i.RTCPeerConnection.prototype.setRemoteDescription = function() {
      const n = this;
      return this._onaddstreampoly || this.addEventListener("track", this._onaddstreampoly = function(s) {
        s.streams.forEach(r => {
          if (n._remoteStreams || (n._remoteStreams = []), n._remoteStreams.indexOf(r) >= 0) return;
          n._remoteStreams.push(r);
          const a = new Event("addstream");
          a.stream = r, n.dispatchEvent(a)
        })
      }), e.apply(n, arguments)
    }
  }
};

function hc(i) {
  if (typeof i != "object" || !i.RTCPeerConnection) return;
  const e = i.RTCPeerConnection.prototype,
    t = e.createOffer,
    n = e.createAnswer,
    s = e.setLocalDescription,
    r = e.setRemoteDescription,
    a = e.addIceCandidate;
  e.createOffer = function(d, l) {
    const u = arguments.length >= 2 ? arguments[2] : arguments[0],
      h = t.apply(this, [u]);
    return l ? (h.then(d, l), Promise.resolve()) : h
  }, e.createAnswer = function(d, l) {
    const u = arguments.length >= 2 ? arguments[2] : arguments[0],
      h = n.apply(this, [u]);
    return l ? (h.then(d, l), Promise.resolve()) : h
  };
  let o = function(c, d, l) {
    const u = s.apply(this, [c]);
    return l ? (u.then(d, l), Promise.resolve()) : u
  };
  e.setLocalDescription = o, o = function(c, d, l) {
    const u = r.apply(this, [c]);
    return l ? (u.then(d, l), Promise.resolve()) : u
  }, e.setRemoteDescription = o, o = function(c, d, l) {
    const u = a.apply(this, [c]);
    return l ? (u.then(d, l), Promise.resolve()) : u
  }, e.addIceCandidate = o
};

function gc(i) {
  typeof i == "object" && i.RTCTrackEvent && "receiver" in i.RTCTrackEvent.prototype && !("transceiver" in i.RTCTrackEvent.prototype) && Object.defineProperty(i.RTCTrackEvent.prototype, "transceiver", {
    get() {
      return {
        receiver: this.receiver
      }
    }
  })
};

function vc(i) {
  const e = i.RTCPeerConnection.prototype.createOffer;
  i.RTCPeerConnection.prototype.createOffer = function(n) {
    if (n) {
      typeof n.offerToReceiveAudio < "u" && (n.offerToReceiveAudio = !!n.offerToReceiveAudio);
      const s = this.getTransceivers().find(a => a.receiver.track.kind === "audio");
      n.offerToReceiveAudio === !1 && s ? s.direction === "sendrecv" ? s.setDirection ? s.setDirection("sendonly") : s.direction = "sendonly" : s.direction === "recvonly" && (s.setDirection ? s.setDirection("inactive") : s.direction = "inactive") : n.offerToReceiveAudio === !0 && !s && this.addTransceiver("audio", {
        direction: "recvonly"
      }), typeof n.offerToReceiveVideo < "u" && (n.offerToReceiveVideo = !!n.offerToReceiveVideo);
      const r = this.getTransceivers().find(a => a.receiver.track.kind === "video");
      n.offerToReceiveVideo === !1 && r ? r.direction === "sendrecv" ? r.setDirection ? r.setDirection("sendonly") : r.direction = "sendonly" : r.direction === "recvonly" && (r.setDirection ? r.setDirection("inactive") : r.direction = "inactive") : n.offerToReceiveVideo === !0 && !r && this.addTransceiver("video", {
        direction: "recvonly"
      })
    }
    return e.apply(this, arguments)
  }
};

function bc(i) {
  typeof i != "object" || i.AudioContext || (i.AudioContext = i.webkitAudioContext)
};

function Zn(i) {
  if (!i.RTCPeerConnection || "connectionState" in i.RTCPeerConnection.prototype) return;
  const e = i.RTCPeerConnection.prototype;
  Object.defineProperty(e, "connectionState", {
    get() {
      return {
        completed: "connected",
        checking: "connecting"
      } [this.iceConnectionState] || this.iceConnectionState
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(e, "onconnectionstatechange", {
    get() {
      return this._onconnectionstatechange || null
    },
    set(t) {
      this._onconnectionstatechange && (this.removeEventListener("connectionstatechange", this._onconnectionstatechange), delete this._onconnectionstatechange), t && this.addEventListener("connectionstatechange", this._onconnectionstatechange = t)
    },
    enumerable: !0,
    configurable: !0
  }), ["setLocalDescription", "setRemoteDescription"].forEach(t => {
    const n = e[t];
    e[t] = function() {
      return this._connectionstatechangepoly || (this._connectionstatechangepoly = s => {
        const r = s.target;
        if (r._lastConnectionState !== r.connectionState) {
          r._lastConnectionState = r.connectionState;
          const a = new Event("connectionstatechange", s);
          r.dispatchEvent(a)
        }
        return s
      }, this.addEventListener("iceconnectionstatechange", this._connectionstatechangepoly)), n.apply(this, arguments)
    }
  })
};

function es(i, e) {
  if (!i.RTCPeerConnection || e.browser === "chrome" && e.version >= 71 || e.browser === "safari" && e._safariVersion >= 13.1) return;
  const t = i.RTCPeerConnection.prototype.setRemoteDescription;
  i.RTCPeerConnection.prototype.setRemoteDescription = function(s) {
    if (s && s.sdp && s.sdp.indexOf(`
a=extmap-allow-mixed`) !== -1) {
      const r = s.sdp.split(`
`).filter(a => a.trim() !== "a=extmap-allow-mixed").join(`
`);
      i.RTCSessionDescription && s instanceof i.RTCSessionDescription ? arguments[0] = new i.RTCSessionDescription({
        type: s.type,
        sdp: r
      }) : s.sdp = r
    }
    return t.apply(this, arguments)
  }
};

function Li(i, e) {
  if (!(i.RTCPeerConnection && i.RTCPeerConnection.prototype)) return;
  const t = i.RTCPeerConnection.prototype.addIceCandidate;
  !t || t.length === 0 || (i.RTCPeerConnection.prototype.addIceCandidate = function() {
    return arguments[0] ? (e.browser === "chrome" && e.version < 78 || e.browser === "firefox" && e.version < 68 || e.browser === "safari") && arguments[0] && arguments[0].candidate === "" ? Promise.resolve() : t.apply(this, arguments) : (arguments[1] && arguments[1].apply(null), Promise.resolve())
  })
};

function Ui(i, e) {
  if (!(i.RTCPeerConnection && i.RTCPeerConnection.prototype)) return;
  const t = i.RTCPeerConnection.prototype.setLocalDescription;
  !t || t.length === 0 || (i.RTCPeerConnection.prototype.setLocalDescription = function() {
    let s = arguments[0] || {};
    if (typeof s != "object" || s.type && s.sdp) return t.apply(this, arguments);
    if (s = {
        type: s.type,
        sdp: s.sdp
      }, !s.type) switch (this.signalingState) {
      case "stable":
      case "have-local-offer":
      case "have-remote-pranswer":
        s.type = "offer";
        break;
      default:
        s.type = "answer";
        break
    }
    return s.sdp || s.type !== "offer" && s.type !== "answer" ? t.apply(this, [s]) : (s.type === "offer" ? this.createOffer : this.createAnswer).apply(this).then(a => t.apply(this, [a]))
  })
};

function ji(i, e) {
  let t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
  const n = e.match(i);
  return n && n.length >= t && n[t] || ""
};

class Tt extends Error {
  constructor(e, t, n) {
    super(t || "an error has occurred"), this.name = "LiveKitError", this.code = e, typeof(n == null ? void 0 : n.cause) < "u" && (this.cause = n == null ? void 0 : n.cause)
  }
};

class Te {};

function Wh(i) {
  return typeof i > "u" ? i : typeof structuredClone == "function" ? typeof i == "object" && i !== null ? structuredClone(Object.assign({}, i)) : structuredClone(i) : JSON.parse(JSON.stringify(i))
};

class oe {
  constructor(e, t, n, s, r) {
    if (typeof e == "object") this.width = e.width, this.height = e.height, this.aspectRatio = e.aspectRatio, this.encoding = {
      maxBitrate: e.maxBitrate,
      maxFramerate: e.maxFramerate,
      priority: e.priority
    };
    else if (t !== void 0 && n !== void 0) this.width = e, this.height = t, this.aspectRatio = e / t, this.encoding = {
      maxBitrate: n,
      maxFramerate: s,
      priority: r
    };
    else throw new TypeError("Unsupported options: provide at least width, height and maxBitrate")
  }
  get resolution() {
    return {
      width: this.width,
      height: this.height,
      frameRate: this.encoding.maxFramerate,
      aspectRatio: this.aspectRatio
    }
  }
};

function ss(i, e) {
  return Object.keys(e).forEach(t => {
    i[t] === void 0 && (i[t] = e[t])
  }), i
};

function li(i) {
  return i.split("/")[1].toLowerCase()
};

function Yh() {
  return typeof RTCRtpReceiver < "u" && "getSynchronizationSources" in RTCRtpReceiver
};

function Xh(i, e) {
  var t;
  i === void 0 && (i = {}), e === void 0 && (e = {});
  const n = [...Object.keys(e), ...Object.keys(i)],
    s = {};
  for (const r of n) i[r] !== e[r] && (s[r] = (t = e[r]) !== null && t !== void 0 ? t : "");
  return s
};

function zr(i, e) {
  return i.width * i.height < e.width * e.height
};

function em(i, e) {
  var t;
  return (t = i.layers) === null || t === void 0 ? void 0 : t.find(n => n.quality === e)
};

function Ht(i, e) {
  if (e.srcObject instanceof MediaStream) {
    const t = e.srcObject;
    t.removeTrack(i), t.getTracks().length > 0 ? e.srcObject = t : e.srcObject = null
  }
};

function os() {
  return "addTransceiver" in RTCPeerConnection.prototype
};

function as() {
  return "addTrack" in RTCPeerConnection.prototype
};

function We(i) {
  return i === "av1" || i === "vp9"
};

function Me() {
  return typeof document < "u"
};

function Xe() {
  return navigator.product == "ReactNative"
};

function zt(i) {
  return i.hostname.endsWith(".livekit.cloud") || i.hostname.endsWith(".livekit.run")
};

function Pc() {
  if (global && global.LiveKitReactNativeGlobal) return global.LiveKitReactNativeGlobal
};

function Ze(i, e) {
  const t = i.split("."),
    n = e.split("."),
    s = Math.min(t.length, n.length);
  for (let r = 0; r < s; ++r) {
    const a = parseInt(t[r], 10),
      o = parseInt(n[r], 10);
    if (a > o) return 1;
    if (a < o) return -1;
    if (r === s - 1 && a === o) return 0
  }
  return i === "" && e !== "" ? -1 : e === "" ? 1 : t.length == n.length ? 0 : t.length < n.length ? -1 : 1
};

function lm(i) {
  for (const e of i) e.target.handleResize(e)
};

function um(i) {
  for (const e of i) e.target.handleVisibilityChanged(e)
};

function eo() {
  let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 16,
    e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 16,
    t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1,
    n = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
  const s = document.createElement("canvas");
  s.width = i, s.height = e;
  const r = s.getContext("2d");
  r == null || r.fillRect(0, 0, s.width, s.height), n && r && (r.beginPath(), r.arc(i / 2, e / 2, 50, 0, Math.PI * 2, !0), r.closePath(), r.fillStyle = "grey", r.fill());
  const a = s.captureStream(),
    [o] = a.getTracks();
  if (!o) throw Error("Could not get empty media stream video track");
  return o.enabled = t, o
};

function It(i) {
  if (typeof i == "string" || typeof i == "number") return i;
  if (Array.isArray(i)) return i[0];
  if (i.exact !== void 0) return Array.isArray(i.exact) ? i.exact[0] : i.exact;
  if (i.ideal !== void 0) return Array.isArray(i.ideal) ? i.ideal[0] : i.ideal;
  throw Error("could not unwrap constraint")
};

function fm(i) {
  return i.startsWith("http") ? i.replace(/^(http)/, "ws") : i
};

function bi(i) {
  return i.startsWith("ws") ? i.replace(/^(ws)/, "http") : i
};

function Fi(i) {
  return i !== void 0 ? Number(i) : void 0
};

function Rt(i) {
  return i !== void 0 ? BigInt(i) : void 0
};

function Kt(i) {
  return !!i && !(i instanceof MediaStreamTrack) && i.isLocal
};

function ds(i) {
  return !!i && !i.isLocal
};

function vm(i) {
  return !!i && !i.isLocal
};

function bm(i) {
  return i.isLocal
};

function ym(i, e) {
  const t = [];
  let n = new TextEncoder().encode(i);
  for (; n.length > e;) {
    let s = e;
    for (; s > 0;) {
      const r = n[s];
      if (r !== void 0 && (r & 192) !== 128) break;
      s--
    }
    t.push(n.slice(0, s)), n = n.slice(s)
  }
  return n.length > 0 && t.push(n), t
};

function km(i) {
  var e;
  const t = i.get("Cache-Control");
  if (t) {
    const n = (e = t.match(/(?:^|[,\s])max-age=(\d+)/)) === null || e === void 0 ? void 0 : e[1];
    if (n) return parseInt(n, 10)
  }
};

function _c(i) {
  return i.endsWith("/") ? i : "".concat(i, "/")
};

function wm(i) {
  let e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Unknown reason";
  if (!(i instanceof AbortSignal)) return e;
  const t = i.reason;
  switch (typeof t) {
    case "string":
      return t;
    case "object":
      return t instanceof Error ? t.message : e;
    default:
      return "toString" in t ? t.toString() : e
  }
};

function ls() {
  return typeof window.RTCRtpScriptTransform < "u"
};

function Im() {
  return typeof window.RTCRtpSender < "u" && typeof window.RTCRtpSender.prototype.createEncodedStreams < "u"
};

function oo(i) {
  const e = {
    type: "offer",
    sdp: i.sdp
  };
  switch (i.type) {
    case "answer":
    case "offer":
    case "pranswer":
    case "rollback":
      e.type = i.type;
      break
  }
  return e
};

class ao {
  constructor() {
    this.buffer = [], this._totalSize = 0
  }
  push(e) {
    this.buffer.push(e), this._totalSize += e.data.byteLength
  }
  pop() {
    const e = this.buffer.shift();
    return e && (this._totalSize -= e.data.byteLength), e
  }
  getAll() {
    return this.buffer.slice()
  }
  popToSequence(e) {
    for (; this.buffer.length > 0 && this.buffer[0].sequence <= e;) this.pop()
  }
  alignBufferedAmount(e) {
    for (; this.buffer.length > 0;) {
      const t = this.buffer[0];
      if (this._totalSize - t.data.byteLength <= e) break;
      this.pop()
    }
  }
  get length() {
    return this.buffer.length
  }
};

class Vm {
  constructor(e) {
    this._map = new Map, this._lastCleanup = 0, this.ttl = e
  }
  set(e, t) {
    const n = Date.now();
    n - this._lastCleanup > this.ttl / 2 && this.cleanup();
    const s = n + this.ttl;
    return this._map.set(e, {
      value: t,
      expiresAt: s
    }), this
  }
  get(e) {
    const t = this._map.get(e);
    if (t) {
      if (t.expiresAt < Date.now()) {
        this._map.delete(e);
        return
      }
      return t.value
    }
  }
  has(e) {
    const t = this._map.get(e);
    return t ? t.expiresAt < Date.now() ? (this._map.delete(e), !1) : !0 : !1
  }
  delete(e) {
    return this._map.delete(e)
  }
  clear() {
    this._map.clear()
  }
  cleanup() {
    const e = Date.now();
    for (const [t, n] of this._map.entries()) n.expiresAt < e && this._map.delete(t);
    this._lastCleanup = e
  }
  get size() {
    return this.cleanup(), this._map.size
  }
  forEach(e) {
    this.cleanup();
    for (const [t, n] of this._map.entries()) n.expiresAt >= Date.now() && e(n.value, t, this.asValueMap())
  }
  map(e) {
    this.cleanup();
    const t = [],
      n = this.asValueMap();
    for (const [s, r] of n.entries()) t.push(e(r, s, n));
    return t
  }
  asValueMap() {
    const e = new Map;
    for (const [t, n] of this._map.entries()) n.expiresAt >= Date.now() && e.set(t, n.value);
    return e
  }
};

function Gs(i, e, t) {
  var n, s, r;
  e === void 0 && (e = 50), t === void 0 && (t = {});
  var a = (n = t.isImmediate) != null && n,
    o = (s = t.callback) != null && s,
    c = t.maxWait,
    d = Date.now(),
    l = [];

  function u() {
    if (c !== void 0) {
      var m = Date.now() - d;
      if (m + e >= c) return c - m
    }
    return e
  }
  var h = function() {
    var m = [].slice.call(arguments),
      f = this;
    return new Promise(function(p, _) {
      var w = a && r === void 0;
      if (r !== void 0 && clearTimeout(r), r = setTimeout(function() {
          if (r = void 0, d = Date.now(), !a) {
            var P = i.apply(f, m);
            o && o(P), l.forEach(function(y) {
              return (0, y.resolve)(P)
            }), l = []
          }
        }, u()), w) {
        var k = i.apply(f, m);
        return o && o(k), p(k)
      }
      l.push({
        resolve: p,
        reject: _
      })
    })
  };
  return h.cancel = function(m) {
    r !== void 0 && clearTimeout(r), l.forEach(function(f) {
      return (0, f.reject)(m)
    }), l = []
  }, h
};

function Js(i) {
  return typeof i == "number" ? i.toFixed(0) : i
};

function Xm(i) {
  return "".concat(i.protocol.replace("ws", "http"), "//").concat(i.host, "/settings")
};

function $s(i) {
  return new TextEncoder().encode(i).length
};

function un(i, e) {
  if (!e) return 0;
  let t, n;
  return "bytesReceived" in i ? (t = i.bytesReceived, n = e.bytesReceived) : "bytesSent" in i && (t = i.bytesSent, n = e.bytesSent), t === void 0 || n === void 0 || i.timestamp === void 0 || e.timestamp === void 0 ? 0 : (t - n) * 8 * 1e3 / (i.timestamp - e.timestamp)
};

class Zm {
  constructor() {
    throw new Error("MediaRecorder is not available in this environment")
  }
};

function bo(i) {
  if (i) return i.sort((e, t) => {
    const {
      encoding: n
    } = e, {
      encoding: s
    } = t;
    return n.maxBitrate > s.maxBitrate ? 1 : n.maxBitrate < s.maxBitrate ? -1 : n.maxBitrate === s.maxBitrate && n.maxFramerate && s.maxFramerate ? n.maxFramerate > s.maxFramerate ? 1 : -1 : 0
  })
};

class Ac {
  constructor(e) {
    const t = e.match(/^L(\d)T(\d)(h|_KEY|_KEY_SHIFT){0,1}$/);
    if (!t) throw new Error("invalid scalability mode");
    if (this.spatial = parseInt(t[1]), this.temporal = parseInt(t[2]), t.length > 3) switch (t[3]) {
      case "h":
      case "_KEY":
      case "_KEY_SHIFT":
        this.suffix = t[3]
    }
  }
  toString() {
    var e;
    return "L".concat(this.spatial, "T").concat(this.temporal).concat((e = this.suffix) !== null && e !== void 0 ? e : "")
  }
};

function Cf(i) {
  return i !== void 0 && i > 13
};

function Co(i, e) {
  const t = i.participantIdentity ? i.participantIdentity : e.participantIdentity;
  i.participantIdentity = t, e.participantIdentity = t;
  const n = i.destinationIdentities.length !== 0 ? i.destinationIdentities : e.destinationIdentities;
  i.destinationIdentities = n, e.destinationIdentities = n
};

function fs(i, e) {
  const t = e || window;
  let n = i.offsetTop,
    s = i.offsetLeft;
  const r = i.offsetWidth,
    a = i.offsetHeight,
    {
      hidden: o
    } = i,
    {
      display: c
    } = getComputedStyle(i);
  for (; i.offsetParent;) i = i.offsetParent, n += i.offsetTop, s += i.offsetLeft;
  return n < t.pageYOffset + t.innerHeight && s < t.pageXOffset + t.innerWidth && n + a > t.pageYOffset && s + r > t.pageXOffset && !o && c !== "none"
};

function Bc(i) {
  return i.map(e => {
    if (e) return Array.isArray(e) ? Bc(e) : typeof e == "object" ? "logContext" in e ? e.logContext : void 0 : e
  })
};

function Jf(i) {
  const e = i.split(".");
  if (e.length === 4) {
    if (e[0] === "10") return !0;
    if (e[0] === "192" && e[1] === "168") return !0;
    if (e[0] === "172") {
      const t = parseInt(e[1], 10);
      if (t >= 16 && t <= 31) return !0
    }
  }
  return !1
};

function $f(i, e) {
  if (typeof i != "object" || !i) return i;
  var t = i[Symbol.toPrimitive];
  if (t !== void 0) {
    var n = t.call(i, e);
    if (typeof n != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.")
  }
  return (e === "string" ? String : Number)(i)
};

function mt() {
  var i;
  return (i = window.officeDesktop) == null ? void 0 : i.annotations
};

async function Hc(i, e, t = !1) {
  const n = Date.now() + 1e4;
  for (; e() && i.state === "connected";) {
    const s = i.localParticipant.permissions;
    if (s != null && s.canPublish && (!s.canPublishSources.length || s.canPublishSources.includes(3) && (!t || s.canPublishSources.includes(4)))) return;
    if (Date.now() >= n) throw Error("Sharing permission is not ready. Please retry.");
    await new Promise(r => setTimeout(r, 40))
  }
  throw Error("Sharing was cancelled or replaced")
};

function Oo(i, e, t) {
  return `${i}:${(e==null?void 0:e.identity)||t||"unknown"}`
};

function Do(i, e, t, n) {
  return n ? t.get(n) : e && i.has(e) ? e : [...i][0]
};

function kp(i, e, t, n) {
  return e ? i.localParticipant.isMicrophoneEnabled && t ? "On" : n ? "Awaiting permission or could not start" : "Muted" : "Audio paused"
};

function wp(i) {
  let e = new Map;
  const t = new Set,
    n = () => {
      for (const s of t) s()
    };
  return {
    snapshot: s => e.get(s) || null,
    states: () => e,
    subscribe: s => (t.add(s), () => {
      t.delete(s)
    }),
    receive: s => {
      "removed" in s ? e.delete(s.tableId) : e.set(s.tableId, s), n()
    },
    replace(s) {
      e = new Map(Object.entries(s || {})), n()
    },
    act: async (s, r) => {
      const a = await i({
        kind: "billiards-action",
        tableId: s,
        command: r
      });
      if (a.ok === !1) throw Error(a.error || "球桌操作没成功")
    }
  }
};

function Ep(i) {
  return i.sessions > 0 || i.meeting || i.sharing || i.meetingSharing || i.meetingMic || i.micLive || i.videos > 0
};

function Pp(i) {
  let e;
  return (t, n = !1) => {
    !n && t === e || (e = t, i(t))
  }
};

function Np(i, e) {
  return {
    active: (i == null ? void 0 : i.meetings.active) ?? null,
    invitations: (i == null ? void 0 : i.meetings.invitations) ?? [],
    huddles: (i == null ? void 0 : i.meetings.huddles) ?? [],
    status: (i == null ? void 0 : i.meetings.status) ?? "断开了，等待重连",
    mic: (i == null ? void 0 : i.meetings.mic) ?? !1,
    sharing: (i == null ? void 0 : i.meetings.sharing) ?? !1,
    act: async t => {
      const n = await e({
        kind: "meeting-action",
        data: t
      });
      if (n.ok === !1) throw Error(n.error || "会议操作没成功")
    },
    stopShare: () => void e({
      kind: "meeting-share"
    }),
    toggleMic: () => void e({
      kind: "meeting-mute"
    }),
    toggleShare: () => void e({
      kind: "meeting-share"
    })
  }
};
export { $a, $e, $f, $s, Ac, Bc, Cf, Co, Cs, Dl, Do, Ep, Es, Fi, Gs, Hc, Hd, Ht, Im, It, Ja, Jf, Js, Kd, Kt, Li, Ll, Lr, Me, Nl, Np, Nt, Oh, Oo, Pc, Pi, Pp, Qn, Rh, Rt, Sh, Te, Tr, Tt, Ui, Ul, Vd, Vm, Vn, We, Wh, Xe, Xh, Xm, Xt, Yh, Yl, Yn, Ze, Zm, Zn, Zo, _c, ac, ao, ar, as, b, bc, bi, bm, bo, cc, cr, dc, ds, em, eo, es, fm, fs, gc, gr, hc, he, ic, ji, jr, km, kp, lc, li, ll, lm, ls, lu, mr, mt, oc, oe, oi, oo, os, pn, qn, rc, ss, tc, tu, ua, uc, um, un, ur, vc, vm, vr, wm, wp, ym, zl, zr, zt };
