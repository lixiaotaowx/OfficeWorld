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
