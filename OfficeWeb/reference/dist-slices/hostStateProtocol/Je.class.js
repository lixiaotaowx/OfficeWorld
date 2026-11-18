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

