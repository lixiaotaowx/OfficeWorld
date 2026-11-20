// engine.io transports + polling/websocket classes (vendored verbatim).
// Recovered verbatim from the production bundle; only imports/exports added.
import { M } from './engine-parser.js';
import { ve } from './engine-parser.js';
import { Lt } from './engine-parser.js';
import { It } from './engine-parser.js';
import { we } from './engine-parser.js';
import { Pt } from './engine-parser.js';
import { Mt } from './engine-parser.js';

const ae = typeof Promise == "function" && typeof Promise.resolve == "function" ? e => Promise.resolve().then(e) : (e, t) => t(e, 0),
  U = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(),
  Dt = "arraybuffer";

function He(n, ...e) {
  return e.reduce((t, s) => (n.hasOwnProperty(s) && (t[s] = n[s]), t), {})
}
const Vt = U.setTimeout,
  Ut = U.clearTimeout;

function ce(n, e) {
  e.useNativeTimers ? (n.setTimeoutFn = Vt.bind(U), n.clearTimeoutFn = Ut.bind(U)) : (n.setTimeoutFn = U.setTimeout.bind(U), n.clearTimeoutFn = U.clearTimeout.bind(U))
}
const zt = 1.33;

function xt(n) {
  return typeof n == "string" ? Ht(n) : Math.ceil((n.byteLength || n.size) * zt)
}

function Ht(n) {
  let e = 0,
    t = 0;
  for (let s = 0, r = n.length; s < r; s++) e = n.charCodeAt(s), e < 128 ? t += 1 : e < 2048 ? t += 2 : e < 55296 || e >= 57344 ? t += 3 : (s++, t += 4);
  return t
}

function We() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5)
}

function Wt(n) {
  let e = "";
  for (let t in n) n.hasOwnProperty(t) && (e.length && (e += "&"), e += encodeURIComponent(t) + "=" + encodeURIComponent(n[t]));
  return e
}

function $t(n) {
  let e = {},
    t = n.split("&");
  for (let s = 0, r = t.length; s < r; s++) {
    let i = t[s].split("=");
    e[decodeURIComponent(i[0])] = decodeURIComponent(i[1])
  }
  return e
}
class jt extends Error {
  constructor(e, t, s) {
    super(e), this.description = t, this.context = s, this.type = "TransportError"
  }
}
class be extends M {
  constructor(e) {
    super(), this.writable = !1, ce(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64
  }
  onError(e, t, s) {
    return super.emitReserved("error", new jt(e, t, s)), this
  }
  open() {
    return this.readyState = "opening", this.doOpen(), this
  }
  close() {
    return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this
  }
  send(e) {
    this.readyState === "open" && this.write(e)
  }
  onOpen() {
    this.readyState = "open", this.writable = !0, super.emitReserved("open")
  }
  onData(e) {
    const t = ve(e, this.socket.binaryType);
    this.onPacket(t)
  }
  onPacket(e) {
    super.emitReserved("packet", e)
  }
  onClose(e) {
    this.readyState = "closed", super.emitReserved("close", e)
  }
  pause(e) {}
  createUri(e, t = {}) {
    return e + "://" + this._hostname() + this._port() + this.opts.path + this._query(t)
  }
  _hostname() {
    const e = this.opts.hostname;
    return e.indexOf(":") === -1 ? e : "[" + e + "]"
  }
  _port() {
    return this.opts.port && (this.opts.secure && Number(this.opts.port) !== 443 || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : ""
  }
  _query(e) {
    const t = Wt(e);
    return t.length ? "?" + t : ""
  }
}
class Kt extends be {
  constructor() {
    super(...arguments), this._polling = !1
  }
  get name() {
    return "polling"
  }
  doOpen() {
    this._poll()
  }
  pause(e) {
    this.readyState = "pausing";
    const t = () => {
      this.readyState = "paused", e()
    };
    if (this._polling || !this.writable) {
      let s = 0;
      this._polling && (s++, this.once("pollComplete", function() {
        --s || t()
      })), this.writable || (s++, this.once("drain", function() {
        --s || t()
      }))
    } else t()
  }
  _poll() {
    this._polling = !0, this.doPoll(), this.emitReserved("poll")
  }
  onData(e) {
    const t = s => {
      if (this.readyState === "opening" && s.type === "open" && this.onOpen(), s.type === "close") return this.onClose({
        description: "transport closed by the server"
      }), !1;
      this.onPacket(s)
    };
    Lt(e, this.socket.binaryType).forEach(t), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll())
  }
  doClose() {
    const e = () => {
      this.write([{
        type: "close"
      }])
    };
    this.readyState === "open" ? e() : this.once("open", e)
  }
  write(e) {
    this.writable = !1, It(e, t => {
      this.doWrite(t, () => {
        this.writable = !0, this.emitReserved("drain")
      })
    })
  }
  uri() {
    const e = this.opts.secure ? "https" : "http",
      t = this.query || {};
    return this.opts.timestampRequests !== !1 && (t[this.opts.timestampParam] = We()), !this.supportsBinary && !t.sid && (t.b64 = 1), this.createUri(e, t)
  }
}
let $e = !1;
try {
  $e = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest
} catch {}
const Yt = $e;

function Jt() {}
class Xt extends Kt {
  constructor(e) {
    if (super(e), typeof location < "u") {
      const t = location.protocol === "https:";
      let s = location.port;
      s || (s = t ? "443" : "80"), this.xd = typeof location < "u" && e.hostname !== location.hostname || s !== e.port
    }
  }
  doWrite(e, t) {
    const s = this.request({
      method: "POST",
      data: e
    });
    s.on("success", t), s.on("error", (r, i) => {
      this.onError("xhr post error", r, i)
    })
  }
  doPoll() {
    const e = this.request();
    e.on("data", this.onData.bind(this)), e.on("error", (t, s) => {
      this.onError("xhr poll error", t, s)
    }), this.pollXhr = e
  }
}
class x extends M {
  constructor(e, t, s) {
    super(), this.createRequest = e, ce(this, s), this._opts = s, this._method = s.method || "GET", this._uri = t, this._data = s.data !== void 0 ? s.data : null, this._create()
  }
  _create() {
    var e;
    const t = He(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    t.xdomain = !!this._opts.xd;
    const s = this._xhr = this.createRequest(t);
    try {
      s.open(this._method, this._uri, !0);
      try {
        if (this._opts.extraHeaders) {
          s.setDisableHeaderCheck && s.setDisableHeaderCheck(!0);
          for (let r in this._opts.extraHeaders) this._opts.extraHeaders.hasOwnProperty(r) && s.setRequestHeader(r, this._opts.extraHeaders[r])
        }
      } catch {}
      if (this._method === "POST") try {
        s.setRequestHeader("Content-type", "text/plain;charset=UTF-8")
      } catch {}
      try {
        s.setRequestHeader("Accept", "*/*")
      } catch {}(e = this._opts.cookieJar) === null || e === void 0 || e.addCookies(s), "withCredentials" in s && (s.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (s.timeout = this._opts.requestTimeout), s.onreadystatechange = () => {
        var r;
        s.readyState === 3 && ((r = this._opts.cookieJar) === null || r === void 0 || r.parseCookies(s.getResponseHeader("set-cookie"))), s.readyState === 4 && (s.status === 200 || s.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
          this._onError(typeof s.status == "number" ? s.status : 0)
        }, 0))
      }, s.send(this._data)
    } catch (r) {
      this.setTimeoutFn(() => {
        this._onError(r)
      }, 0);
      return
    }
    typeof document < "u" && (this._index = x.requestsCount++, x.requests[this._index] = this)
  }
  _onError(e) {
    this.emitReserved("error", e, this._xhr), this._cleanup(!0)
  }
  _cleanup(e) {
    if (!(typeof this._xhr > "u" || this._xhr === null)) {
      if (this._xhr.onreadystatechange = Jt, e) try {
        this._xhr.abort()
      } catch {}
      typeof document < "u" && delete x.requests[this._index], this._xhr = null
    }
  }
  _onLoad() {
    const e = this._xhr.responseText;
    e !== null && (this.emitReserved("data", e), this.emitReserved("success"), this._cleanup())
  }
  abort() {
    this._cleanup()
  }
}
x.requestsCount = 0;
x.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function") attachEvent("onunload", Ie);
  else if (typeof addEventListener == "function") {
    const n = "onpagehide" in U ? "pagehide" : "unload";
    addEventListener(n, Ie, !1)
  }
}

function Ie() {
  for (let n in x.requests) x.requests.hasOwnProperty(n) && x.requests[n].abort()
}
const Gt = function() {
  const n = je({
    xdomain: !1
  });
  return n && n.responseType !== null
}();
class Qt extends Xt {
  constructor(e) {
    super(e);
    const t = e && e.forceBase64;
    this.supportsBinary = Gt && !t
  }
  request(e = {}) {
    return Object.assign(e, {
      xd: this.xd
    }, this.opts), new x(je, this.uri(), e)
  }
}

function je(n) {
  const e = n.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!e || Yt)) return new XMLHttpRequest
  } catch {}
  if (!e) try {
    return new U[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP")
  } catch {}
}
const Ke = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Zt extends be {
  get name() {
    return "websocket"
  }
  doOpen() {
    const e = this.uri(),
      t = this.opts.protocols,
      s = Ke ? {} : He(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    this.opts.extraHeaders && (s.headers = this.opts.extraHeaders);
    try {
      this.ws = this.createSocket(e, t, s)
    } catch (r) {
      return this.emitReserved("error", r)
    }
    this.ws.binaryType = this.socket.binaryType, this.addEventListeners()
  }
  addEventListeners() {
    this.ws.onopen = () => {
      this.opts.autoUnref && this.ws._socket.unref(), this.onOpen()
    }, this.ws.onclose = e => this.onClose({
      description: "websocket connection closed",
      context: e
    }), this.ws.onmessage = e => this.onData(e.data), this.ws.onerror = e => this.onError("websocket error", e)
  }
  write(e) {
    this.writable = !1;
    for (let t = 0; t < e.length; t++) {
      const s = e[t],
        r = t === e.length - 1;
      we(s, this.supportsBinary, i => {
        try {
          this.doWrite(s, i)
        } catch {}
        r && ae(() => {
          this.writable = !0, this.emitReserved("drain")
        }, this.setTimeoutFn)
      })
    }
  }
  doClose() {
    typeof this.ws < "u" && (this.ws.onerror = () => {}, this.ws.close(), this.ws = null)
  }
  uri() {
    const e = this.opts.secure ? "wss" : "ws",
      t = this.query || {};
    return this.opts.timestampRequests && (t[this.opts.timestampParam] = We()), this.supportsBinary || (t.b64 = 1), this.createUri(e, t)
  }
}
const le = U.WebSocket || U.MozWebSocket;
class en extends Zt {
  createSocket(e, t, s) {
    return Ke ? new le(e, t, s) : t ? new le(e, t) : new le(e)
  }
  doWrite(e, t) {
    this.ws.send(t)
  }
}
class tn extends be {
  get name() {
    return "webtransport"
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name])
    } catch (e) {
      return this.emitReserved("error", e)
    }
    this._transport.closed.then(() => {
      this.onClose()
    }).catch(e => {
      this.onError("webtransport error", e)
    }), this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then(e => {
        const t = Pt(Number.MAX_SAFE_INTEGER, this.socket.binaryType),
          s = e.readable.pipeThrough(t).getReader(),
          r = Mt();
        r.readable.pipeTo(e.writable), this._writer = r.writable.getWriter();
        const i = () => {
          s.read().then(({
            done: a,
            value: f
          }) => {
            a || (this.onPacket(f), i())
          }).catch(a => {})
        };
        i();
        const o = {
          type: "open"
        };
        this.query.sid && (o.data = `{"sid":"${this.query.sid}"}`), this._writer.write(o).then(() => this.onOpen())
      })
    })
  }
  write(e) {
    this.writable = !1;
    for (let t = 0; t < e.length; t++) {
      const s = e[t],
        r = t === e.length - 1;
      this._writer.write(s).then(() => {
        r && ae(() => {
          this.writable = !0, this.emitReserved("drain")
        }, this.setTimeoutFn)
      })
    }
  }
  doClose() {
    var e;
    (e = this._transport) === null || e === void 0 || e.close()
  }
}
const nn = {
    websocket: en,
    webtransport: tn,
    polling: Qt
  },
  sn = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
  rn = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];

function pe(n) {
  if (n.length > 8e3) throw "URI too long";
  const e = n,
    t = n.indexOf("["),
    s = n.indexOf("]");
  t != -1 && s != -1 && (n = n.substring(0, t) + n.substring(t, s).replace(/:/g, ";") + n.substring(s, n.length));
  let r = sn.exec(n || ""),
    i = {},
    o = 14;
  for (; o--;) i[rn[o]] = r[o] || "";
  return t != -1 && s != -1 && (i.source = e, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = on(i, i.path), i.queryKey = an(i, i.query), i
}

function on(n, e) {
  const t = /\/{2,9}/g,
    s = e.replace(t, "/").split("/");
  return (e.slice(0, 1) == "/" || e.length === 0) && s.splice(0, 1), e.slice(-1) == "/" && s.splice(s.length - 1, 1), s
}

function an(n, e) {
  const t = {};
  return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (t[r] = i)
  }), t
}
const me = typeof addEventListener == "function" && typeof removeEventListener == "function",
  se = [];
me && addEventListener("offline", () => {
  se.forEach(n => n())
}, !1);

export { ae, Dt, ce, xt, $t, nn, pe, me, se };
