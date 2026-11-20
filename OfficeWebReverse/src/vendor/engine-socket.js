// engine.io Socket + url helper (vendored verbatim).
// Recovered verbatim from the production bundle; only imports/exports added.
import { M } from './engine-parser.js';
import { Dt } from './engine-transports.js';
import { pe } from './engine-transports.js';
import { ce } from './engine-transports.js';
import { $t } from './engine-transports.js';
import { me } from './engine-transports.js';
import { se } from './engine-transports.js';
import { xe } from './engine-parser.js';
import { xt } from './engine-transports.js';
import { ae } from './engine-transports.js';
import { nn } from './engine-transports.js';

class $ extends M {
  constructor(e, t) {
    if (super(), this.binaryType = Dt, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, e && typeof e == "object" && (t = e, e = null), e) {
      const s = pe(e);
      t.hostname = s.host, t.secure = s.protocol === "https" || s.protocol === "wss", t.port = s.port, s.query && (t.query = s.query)
    } else t.host && (t.hostname = pe(t.host).host);
    ce(this, t), this.secure = t.secure != null ? t.secure : typeof location < "u" && location.protocol === "https:", t.hostname && !t.port && (t.port = this.secure ? "443" : "80"), this.hostname = t.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = t.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, t.transports.forEach(s => {
      const r = s.prototype.name;
      this.transports.push(r), this._transportsByName[r] = s
    }), this.opts = Object.assign({
      path: "/engine.io",
      agent: !1,
      withCredentials: !1,
      upgrade: !0,
      timestampParam: "t",
      rememberUpgrade: !1,
      addTrailingSlash: !0,
      rejectUnauthorized: !0,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: !1
    }, t), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = $t(this.opts.query)), me && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close())
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      })
    }, se.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open()
  }
  createTransport(e) {
    const t = Object.assign({}, this.opts.query);
    t.EIO = xe, t.transport = e, this.id && (t.sid = this.id);
    const s = Object.assign({}, this.opts, {
      query: t,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[e]);
    return new this._transportsByName[e](s)
  }
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available")
      }, 0);
      return
    }
    const e = this.opts.rememberUpgrade && $.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const t = this.createTransport(e);
    t.open(), this.setTransport(t)
  }
  setTransport(e) {
    this.transport && this.transport.removeAllListeners(), this.transport = e, e.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", t => this._onClose("transport close", t))
  }
  onOpen() {
    this.readyState = "open", $.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush()
  }
  _onPacket(e) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") switch (this.emitReserved("packet", e), this.emitReserved("heartbeat"), e.type) {
      case "open":
        this.onHandshake(JSON.parse(e.data));
        break;
      case "ping":
        this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
        break;
      case "error":
        const t = new Error("server error");
        t.code = e.data, this._onError(t);
        break;
      case "message":
        this.emitReserved("data", e.data), this.emitReserved("message", e.data);
        break
    }
  }
  onHandshake(e) {
    this.emitReserved("handshake", e), this.id = e.sid, this.transport.query.sid = e.sid, this._pingInterval = e.pingInterval, this._pingTimeout = e.pingTimeout, this._maxPayload = e.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout()
  }
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const e = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + e, this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout")
    }, e), this.opts.autoUnref && this._pingTimeoutTimer.unref()
  }
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush()
  }
  flush() {
    if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const e = this._getWritablePackets();
      this.transport.send(e), this._prevBufferLen = e.length, this.emitReserved("flush")
    }
  }
  _getWritablePackets() {
    if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1)) return this.writeBuffer;
    let t = 1;
    for (let s = 0; s < this.writeBuffer.length; s++) {
      const r = this.writeBuffer[s].data;
      if (r && (t += xt(r)), s > 0 && t > this._maxPayload) return this.writeBuffer.slice(0, s);
      t += 2
    }
    return this.writeBuffer
  }
  _hasPingExpired() {
    if (!this._pingTimeoutTime) return !0;
    const e = Date.now() > this._pingTimeoutTime;
    return e && (this._pingTimeoutTime = 0, ae(() => {
      this._onClose("ping timeout")
    }, this.setTimeoutFn)), e
  }
  write(e, t, s) {
    return this._sendPacket("message", e, t, s), this
  }
  send(e, t, s) {
    return this._sendPacket("message", e, t, s), this
  }
  _sendPacket(e, t, s, r) {
    if (typeof t == "function" && (r = t, t = void 0), typeof s == "function" && (r = s, s = null), this.readyState === "closing" || this.readyState === "closed") return;
    s = s || {}, s.compress = s.compress !== !1;
    const i = {
      type: e,
      data: t,
      options: s
    };
    this.emitReserved("packetCreate", i), this.writeBuffer.push(i), r && this.once("flush", r), this.flush()
  }
  close() {
    const e = () => {
        this._onClose("forced close"), this.transport.close()
      },
      t = () => {
        this.off("upgrade", t), this.off("upgradeError", t), e()
      },
      s = () => {
        this.once("upgrade", t), this.once("upgradeError", t)
      };
    return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
      this.upgrading ? s() : e()
    }) : this.upgrading ? s() : e()), this
  }
  _onError(e) {
    if ($.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") return this.transports.shift(), this._open();
    this.emitReserved("error", e), this._onClose("transport error", e)
  }
  _onClose(e, t) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), me && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = se.indexOf(this._offlineEventListener);
        s !== -1 && se.splice(s, 1)
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", e, t), this.writeBuffer = [], this._prevBufferLen = 0
    }
  }
}
$.protocol = xe;
class cn extends $ {
  constructor() {
    super(...arguments), this._upgrades = []
  }
  onOpen() {
    if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
      for (let e = 0; e < this._upgrades.length; e++) this._probe(this._upgrades[e])
  }
  _probe(e) {
    let t = this.createTransport(e),
      s = !1;
    $.priorWebsocketSuccess = !1;
    const r = () => {
      s || (t.send([{
        type: "ping",
        data: "probe"
      }]), t.once("packet", _ => {
        if (!s)
          if (_.type === "pong" && _.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", t), !t) return;
            $.priorWebsocketSuccess = t.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (m(), this.setTransport(t), t.send([{
                type: "upgrade"
              }]), this.emitReserved("upgrade", t), t = null, this.upgrading = !1, this.flush())
            })
          } else {
            const y = new Error("probe error");
            y.transport = t.name, this.emitReserved("upgradeError", y)
          }
      }))
    };

    function i() {
      s || (s = !0, m(), t.close(), t = null)
    }
    const o = _ => {
      const y = new Error("probe error: " + _);
      y.transport = t.name, i(), this.emitReserved("upgradeError", y)
    };

    function a() {
      o("transport closed")
    }

    function f() {
      o("socket closed")
    }

    function d(_) {
      t && _.name !== t.name && i()
    }
    const m = () => {
      t.removeListener("open", r), t.removeListener("error", o), t.removeListener("close", a), this.off("close", f), this.off("upgrading", d)
    };
    t.once("open", r), t.once("error", o), t.once("close", a), this.once("close", f), this.once("upgrading", d), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
      s || t.open()
    }, 200) : t.open()
  }
  onHandshake(e) {
    this._upgrades = this._filterUpgrades(e.upgrades), super.onHandshake(e)
  }
  _filterUpgrades(e) {
    const t = [];
    for (let s = 0; s < e.length; s++) ~this.transports.indexOf(e[s]) && t.push(e[s]);
    return t
  }
}
let hn = class extends cn {
  constructor(e, t = {}) {
    const s = typeof e == "object",
      r = s ? {
        ...e
      } : {
        ...t
      };
    (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map(i => nn[i]).filter(i => !!i)), super(s ? r : e, r)
  }
};

function fn(n, e = "", t) {
  let s = n;
  t = t || typeof location < "u" && location, n == null && (n = t.protocol + "//" + t.host), typeof n == "string" && (n.charAt(0) === "/" && (n.charAt(1) === "/" ? n = t.protocol + n : n = t.host + n), /^(https?|wss?):\/\//.test(n) || (typeof t < "u" ? n = t.protocol + "//" + n : n = "https://" + n), s = pe(n)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + e, s.href = s.protocol + "://" + i + (t && t.port === s.port ? "" : ":" + s.port), s
}
const ln = typeof ArrayBuffer == "function",
  un = n => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(n) : n.buffer instanceof ArrayBuffer,
  Ye = Object.prototype.toString,
  dn = typeof Blob == "function" || typeof Blob < "u" && Ye.call(Blob) === "[object BlobConstructor]",
  pn = typeof File == "function" || typeof File < "u" && Ye.call(File) === "[object FileConstructor]";

function _e(n) {
  return ln && (n instanceof ArrayBuffer || un(n)) || dn && n instanceof Blob || pn && n instanceof File
}

function re(n, e) {
  if (!n || typeof n != "object") return !1;
  if (Array.isArray(n)) {
    for (let t = 0, s = n.length; t < s; t++)
      if (re(n[t])) return !0;
    return !1
  }
  if (_e(n)) return !0;
  if (n.toJSON && typeof n.toJSON == "function" && arguments.length === 1) return re(n.toJSON(), !0);
  for (const t in n)
    if (Object.prototype.hasOwnProperty.call(n, t) && re(n[t])) return !0;
  return !1
}

function mn(n) {
  const e = [],
    t = n.data,
    s = n;
  return s.data = ie(t, e), s.attachments = e.length, {
    packet: s,
    buffers: e
  }
}

function ie(n, e, t) {
  if (!n) return n;
  if (_e(n)) {
    const s = {
      _placeholder: !0,
      num: e.length
    };
    return e.push(n), s
  } else if (Array.isArray(n)) {
    const s = new Array(n.length);
    for (let r = 0; r < n.length; r++) s[r] = ie(n[r], e);
    return s
  } else if (typeof n == "object" && !(n instanceof Date)) {
    if (n.toJSON && typeof n.toJSON == "function" && !t) return ie(n.toJSON(), e, !0);
    const s = {};
    for (const r in n) Object.prototype.hasOwnProperty.call(n, r) && (s[r] = ie(n[r], e));
    return s
  }
  return n
}

function gn(n, e) {
  return n.data = ge(n.data, e), delete n.attachments, n
}

function ge(n, e) {
  if (!n) return n;
  if (n && n._placeholder === !0) {
    if (typeof n.num == "number" && n.num >= 0 && n.num < e.length) return e[n.num];
    throw new Error("illegal attachments")
  } else if (Array.isArray(n))
    for (let t = 0; t < n.length; t++) n[t] = ge(n[t], e);
  else if (typeof n == "object")
    for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && (n[t] = ge(n[t], e));
  return n
}

export { hn, fn, _e, re, mn, gn };
