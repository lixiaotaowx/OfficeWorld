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
