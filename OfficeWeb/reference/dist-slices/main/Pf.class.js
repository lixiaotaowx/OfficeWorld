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
