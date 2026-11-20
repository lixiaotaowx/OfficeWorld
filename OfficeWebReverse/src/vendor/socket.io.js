// socket.io-client Manager/Socket/io (vendored verbatim).
// Recovered verbatim from the production bundle; only imports/exports added.
import { M } from './engine-parser.js';
import { z } from './socket-parser.js';
import { kn } from './socket-parser.js';
import { C } from './socket-parser.js';
import { ce } from './engine-transports.js';
import { _n } from './socket-parser.js';
import { hn } from './engine-socket.js';
import { ae } from './engine-transports.js';
import { fn } from './engine-socket.js';

class Je extends M {
  constructor(e, t, s) {
    super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = e, this.nsp = t, s && s.auth && (this.auth = s.auth), this._opts = Object.assign({}, s), this.io._autoConnect && this.open()
  }
  get disconnected() {
    return !this.connected
  }
  subEvents() {
    if (this.subs) return;
    const e = this.io;
    this.subs = [z(e, "open", this.onopen.bind(this)), z(e, "packet", this.onpacket.bind(this)), z(e, "error", this.onerror.bind(this)), z(e, "close", this.onclose.bind(this))]
  }
  get active() {
    return !!this.subs
  }
  connect() {
    return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this)
  }
  open() {
    return this.connect()
  }
  send(...e) {
    return e.unshift("message"), this.emit.apply(this, e), this
  }
  emit(e, ...t) {
    var s, r, i;
    if (kn.hasOwnProperty(e)) throw new Error('"' + e.toString() + '" is a reserved event name');
    if (t.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) return this._addToQueue(t), this;
    const o = {
      type: C.EVENT,
      data: t
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof t[t.length - 1] == "function") {
      const m = this.ids++,
        _ = t.pop();
      this._registerAckCallback(m, _), o.id = m
    }
    const a = (r = (s = this.io.engine) === null || s === void 0 ? void 0 : s.transport) === null || r === void 0 ? void 0 : r.writable,
      f = this.connected && !(!((i = this.io.engine) === null || i === void 0) && i._hasPingExpired());
    return this.flags.volatile && !a || (f ? (this.notifyOutgoingListeners(o), this.packet(o)) : this.sendBuffer.push(o)), this.flags = {}, this
  }
  _registerAckCallback(e, t) {
    var s;
    const r = (s = this.flags.timeout) !== null && s !== void 0 ? s : this._opts.ackTimeout;
    if (r === void 0) {
      this.acks[e] = t;
      return
    }
    const i = this.io.setTimeoutFn(() => {
        delete this.acks[e];
        for (let a = 0; a < this.sendBuffer.length; a++) this.sendBuffer[a].id === e && this.sendBuffer.splice(a, 1);
        t.call(this, new Error("operation has timed out"))
      }, r),
      o = (...a) => {
        this.io.clearTimeoutFn(i), t.apply(this, a)
      };
    o.withError = !0, this.acks[e] = o
  }
  emitWithAck(e, ...t) {
    return new Promise((s, r) => {
      const i = (o, a) => o ? r(o) : s(a);
      i.withError = !0, t.push(i), this.emit(e, ...t)
    })
  }
  _addToQueue(e) {
    let t;
    typeof e[e.length - 1] == "function" && (t = e.pop());
    const s = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: !1,
      args: e,
      flags: Object.assign({
        fromQueue: !0
      }, this.flags)
    };
    e.push((r, ...i) => s !== this._queue[0] ? void 0 : (r !== null ? s.tryCount > this._opts.retries && (this._queue.shift(), t && t(r)) : (this._queue.shift(), t && t(null, ...i)), s.pending = !1, this._drainQueue())), this._queue.push(s), this._drainQueue()
  }
  _drainQueue(e = !1) {
    if (!this.connected || this._queue.length === 0) return;
    const t = this._queue[0];
    t.pending && !e || (t.pending = !0, t.tryCount++, this.flags = t.flags, this.emit.apply(this, t.args))
  }
  packet(e) {
    e.nsp = this.nsp, this.io._packet(e)
  }
  onopen() {
    typeof this.auth == "function" ? this.auth(e => {
      this._sendConnectPacket(e)
    }) : this._sendConnectPacket(this.auth)
  }
  _sendConnectPacket(e) {
    this.packet({
      type: C.CONNECT,
      data: this._pid ? Object.assign({
        pid: this._pid,
        offset: this._lastOffset
      }, e) : e
    })
  }
  onerror(e) {
    this.connected || this.emitReserved("connect_error", e)
  }
  onclose(e, t) {
    this.connected = !1, delete this.id, this.emitReserved("disconnect", e, t), this._clearAcks()
  }
  _clearAcks() {
    Object.keys(this.acks).forEach(e => {
      if (!this.sendBuffer.some(s => String(s.id) === e)) {
        const s = this.acks[e];
        delete this.acks[e], s.withError && s.call(this, new Error("socket has been disconnected"))
      }
    })
  }
  onpacket(e) {
    if (e.nsp === this.nsp) switch (e.type) {
      case C.CONNECT:
        e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
        break;
      case C.EVENT:
      case C.BINARY_EVENT:
        this.onevent(e);
        break;
      case C.ACK:
      case C.BINARY_ACK:
        this.onack(e);
        break;
      case C.DISCONNECT:
        this.ondisconnect();
        break;
      case C.CONNECT_ERROR:
        this.destroy();
        const s = new Error(e.data.message);
        s.data = e.data.data, this.emitReserved("connect_error", s);
        break
    }
  }
  onevent(e) {
    const t = e.data || [];
    e.id != null && t.push(this.ack(e.id)), this.connected ? this.emitEvent(t) : this.receiveBuffer.push(Object.freeze(t))
  }
  emitEvent(e) {
    if (this._anyListeners && this._anyListeners.length) {
      const t = this._anyListeners.slice();
      for (const s of t) s.apply(this, e)
    }
    super.emit.apply(this, e), this._pid && e.length && typeof e[e.length - 1] == "string" && (this._lastOffset = e[e.length - 1])
  }
  ack(e) {
    const t = this;
    let s = !1;
    return function(...r) {
      s || (s = !0, t.packet({
        type: C.ACK,
        id: e,
        data: r
      }))
    }
  }
  onack(e) {
    const t = this.acks[e.id];
    typeof t == "function" && (delete this.acks[e.id], t.withError && e.data.unshift(null), t.apply(this, e.data))
  }
  onconnect(e, t) {
    this.id = e, this.recovered = t && this._pid === t, this._pid = t, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0)
  }
  emitBuffered() {
    this.receiveBuffer.forEach(e => this.emitEvent(e)), this.receiveBuffer = [], this.sendBuffer.forEach(e => {
      this.notifyOutgoingListeners(e), this.packet(e)
    }), this.sendBuffer = []
  }
  ondisconnect() {
    this.destroy(), this.onclose("io server disconnect")
  }
  destroy() {
    this.subs && (this.subs.forEach(e => e()), this.subs = void 0), this.io._destroy(this)
  }
  disconnect() {
    return this.connected && this.packet({
      type: C.DISCONNECT
    }), this.destroy(), this.connected && this.onclose("io client disconnect"), this
  }
  close() {
    return this.disconnect()
  }
  compress(e) {
    return this.flags.compress = e, this
  }
  get volatile() {
    return this.flags.volatile = !0, this
  }
  timeout(e) {
    return this.flags.timeout = e, this
  }
  onAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.push(e), this
  }
  prependAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(e), this
  }
  offAny(e) {
    if (!this._anyListeners) return this;
    if (e) {
      const t = this._anyListeners;
      for (let s = 0; s < t.length; s++)
        if (e === t[s]) return t.splice(s, 1), this
    } else this._anyListeners = [];
    return this
  }
  listenersAny() {
    return this._anyListeners || []
  }
  onAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(e), this
  }
  prependAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(e), this
  }
  offAnyOutgoing(e) {
    if (!this._anyOutgoingListeners) return this;
    if (e) {
      const t = this._anyOutgoingListeners;
      for (let s = 0; s < t.length; s++)
        if (e === t[s]) return t.splice(s, 1), this
    } else this._anyOutgoingListeners = [];
    return this
  }
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || []
  }
  notifyOutgoingListeners(e) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const t = this._anyOutgoingListeners.slice();
      for (const s of t) s.apply(this, e.data)
    }
  }
}

function X(n) {
  n = n || {}, this.ms = n.min || 100, this.max = n.max || 1e4, this.factor = n.factor || 2, this.jitter = n.jitter > 0 && n.jitter <= 1 ? n.jitter : 0, this.attempts = 0
}
X.prototype.duration = function() {
  var n = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var e = Math.random(),
      t = Math.floor(e * this.jitter * n);
    n = Math.floor(e * 10) & 1 ? n + t : n - t
  }
  return Math.min(n, this.max) | 0
};
X.prototype.reset = function() {
  this.attempts = 0
};
X.prototype.setMin = function(n) {
  this.ms = n
};
X.prototype.setMax = function(n) {
  this.max = n
};
X.prototype.setJitter = function(n) {
  this.jitter = n
};
class ye extends M {
  constructor(e, t) {
    var s;
    super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (t = e, e = void 0), t = t || {}, t.path = t.path || "/socket.io", this.opts = t, ce(this, t), this.reconnection(t.reconnection !== !1), this.reconnectionAttempts(t.reconnectionAttempts || 1 / 0), this.reconnectionDelay(t.reconnectionDelay || 1e3), this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3), this.randomizationFactor((s = t.randomizationFactor) !== null && s !== void 0 ? s : .5), this.backoff = new X({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(t.timeout == null ? 2e4 : t.timeout), this._readyState = "closed", this.uri = e;
    const r = t.parser || _n;
    this.encoder = new r.Encoder, this.decoder = new r.Decoder, this._autoConnect = t.autoConnect !== !1, this._autoConnect && this.open()
  }
  reconnection(e) {
    return arguments.length ? (this._reconnection = !!e, e || (this.skipReconnect = !0), this) : this._reconnection
  }
  reconnectionAttempts(e) {
    return e === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = e, this)
  }
  reconnectionDelay(e) {
    var t;
    return e === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = e, (t = this.backoff) === null || t === void 0 || t.setMin(e), this)
  }
  randomizationFactor(e) {
    var t;
    return e === void 0 ? this._randomizationFactor : (this._randomizationFactor = e, (t = this.backoff) === null || t === void 0 || t.setJitter(e), this)
  }
  reconnectionDelayMax(e) {
    var t;
    return e === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = e, (t = this.backoff) === null || t === void 0 || t.setMax(e), this)
  }
  timeout(e) {
    return arguments.length ? (this._timeout = e, this) : this._timeout
  }
  maybeReconnectOnOpen() {
    !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect()
  }
  open(e) {
    if (~this._readyState.indexOf("open")) return this;
    this.engine = new hn(this.uri, this.opts);
    const t = this.engine,
      s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = z(t, "open", function() {
        s.onopen(), e && e()
      }),
      i = a => {
        this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), e ? e(a) : this.maybeReconnectOnOpen()
      },
      o = z(t, "error", i);
    if (this._timeout !== !1) {
      const a = this._timeout,
        f = this.setTimeoutFn(() => {
          r(), i(new Error("timeout")), t.close()
        }, a);
      this.opts.autoUnref && f.unref(), this.subs.push(() => {
        this.clearTimeoutFn(f)
      })
    }
    return this.subs.push(r), this.subs.push(o), this
  }
  connect(e) {
    return this.open(e)
  }
  onopen() {
    this.cleanup(), this._readyState = "open", this.emitReserved("open");
    const e = this.engine;
    this.subs.push(z(e, "ping", this.onping.bind(this)), z(e, "data", this.ondata.bind(this)), z(e, "error", this.onerror.bind(this)), z(e, "close", this.onclose.bind(this)), z(this.decoder, "decoded", this.ondecoded.bind(this)))
  }
  onping() {
    this.emitReserved("ping")
  }
  ondata(e) {
    try {
      this.decoder.add(e)
    } catch (t) {
      this.onclose("parse error", t)
    }
  }
  ondecoded(e) {
    ae(() => {
      this.emitReserved("packet", e)
    }, this.setTimeoutFn)
  }
  onerror(e) {
    this.emitReserved("error", e)
  }
  socket(e, t) {
    let s = this.nsps[e];
    return s ? this._autoConnect && !s.active && s.connect() : (s = new Je(this, e, t), this.nsps[e] = s), s
  }
  _destroy(e) {
    const t = Object.keys(this.nsps);
    for (const s of t)
      if (this.nsps[s].active) return;
    this._close()
  }
  _packet(e) {
    const t = this.encoder.encode(e);
    for (let s = 0; s < t.length; s++) this.engine.write(t[s], e.options)
  }
  cleanup() {
    this.subs.forEach(e => e()), this.subs.length = 0, this.decoder.destroy()
  }
  _close() {
    this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close")
  }
  disconnect() {
    return this._close()
  }
  onclose(e, t) {
    var s;
    this.cleanup(), (s = this.engine) === null || s === void 0 || s.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", e, t), this._reconnection && !this.skipReconnect && this.reconnect()
  }
  reconnect() {
    if (this._reconnecting || this.skipReconnect) return this;
    const e = this;
    if (this.backoff.attempts >= this._reconnectionAttempts) this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
    else {
      const t = this.backoff.duration();
      this._reconnecting = !0;
      const s = this.setTimeoutFn(() => {
        e.skipReconnect || (this.emitReserved("reconnect_attempt", e.backoff.attempts), !e.skipReconnect && e.open(r => {
          r ? (e._reconnecting = !1, e.reconnect(), this.emitReserved("reconnect_error", r)) : e.onreconnect()
        }))
      }, t);
      this.opts.autoUnref && s.unref(), this.subs.push(() => {
        this.clearTimeoutFn(s)
      })
    }
  }
  onreconnect() {
    const e = this.backoff.attempts;
    this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", e)
  }
}
const G = {};

function ue(n, e) {
  typeof n == "object" && (e = n, n = void 0), e = e || {};
  const t = fn(n, e.path || "/socket.io"),
    s = t.source,
    r = t.id,
    i = t.path,
    o = G[r] && i in G[r].nsps,
    a = e.forceNew || e["force new connection"] || e.multiplex === !1 || o;
  let f;
  return a ? f = new ye(s, e) : (G[r] || (G[r] = new ye(s, e)), f = G[r]), t.query && !e.query && (e.query = t.queryKey), f.socket(t.path, e)
}
Object.assign(ue, {
  Manager: ye,
  Socket: Je,
  io: ue,
  connect: ue
});
const En = 200;

export { ue as io, ye as Manager, Je as Socket };
