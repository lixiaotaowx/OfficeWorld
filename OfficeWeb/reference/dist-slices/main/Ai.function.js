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

