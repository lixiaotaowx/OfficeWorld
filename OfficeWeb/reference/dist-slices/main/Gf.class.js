class Gf extends wt {
    get description() {
        return "Establishing WebRTC connection"
    }
    perform() {
        return b(this, void 0, void 0, function*() {
            let e = !1,
                t = !1;
            this.room.on(U.SignalConnected, () => {
                var n;
                const s = this.room.engine.client.onTrickle;
                this.room.engine.client.onTrickle = (r, a) => {
                    if (r.candidate) {
                        const o = new RTCIceCandidate(r);
                        let c = "".concat(o.protocol, " ").concat(o.address, ":").concat(o.port, " ").concat(o.type);
                        o.address && (Jf(o.address) ? c += " (private)" : o.protocol === "tcp" && o.tcpType === "passive" ? (e = !0, c += " (passive)") : o.protocol === "udp" && (t = !0)), this.appendMessage(c)
                    }
                    s && s(r, a)
                }, !((n = this.room.engine.pcManager) === null || n === void 0) && n.subscriber && (this.room.engine.pcManager.subscriber.onIceCandidateError = r => {
                    r instanceof RTCPeerConnectionIceErrorEvent && this.appendWarning("error with ICE candidate: ".concat(r.errorCode, " ").concat(r.errorText, " ").concat(r.url))
                })
            });
            try {
                yield this.connect(), X.info("now the room is connected")
            } catch (n) {
                throw this.appendWarning("ports need to be open on firewall in order to connect."), n
            }
            e || this.appendWarning("Server is not configured for ICE/TCP"), t || this.appendWarning("No public IPv4 UDP candidates were found. Your server is likely not configured correctly")
        })
    }
}

