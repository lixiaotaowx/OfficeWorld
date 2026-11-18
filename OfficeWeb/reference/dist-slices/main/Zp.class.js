class Zp extends et.EventEmitter {
    constructor(e, t) {
        let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        super(), this.options = {}, this.checkResults = new Map, this.url = e, this.token = t, this.options = n
    }
    getNextCheckId() {
        const e = this.checkResults.size;
        return this.checkResults.set(e, {
            logs: [],
            status: Be.IDLE,
            name: "",
            description: ""
        }), e
    }
    updateCheck(e, t) {
        this.checkResults.set(e, t), this.emit("checkUpdate", e, t)
    }
    isSuccess() {
        return Array.from(this.checkResults.values()).every(e => e.status !== Be.FAILED)
    }
    getResults() {
        return Array.from(this.checkResults.values())
    }
    createAndRunCheck(e) {
        return b(this, void 0, void 0, function*() {
            const t = this.getNextCheckId(),
                n = new e(this.url, this.token, this.options),
                s = a => {
                    this.updateCheck(t, a)
                };
            n.on("update", s);
            const r = yield n.run();
            return n.off("update", s), r
        })
    }
    checkWebsocket() {
        return b(this, void 0, void 0, function*() {
            return this.createAndRunCheck(zf)
        })
    }
    checkWebRTC() {
        return b(this, void 0, void 0, function*() {
            return this.createAndRunCheck(Gf)
        })
    }
    checkTURN() {
        return b(this, void 0, void 0, function*() {
            return this.createAndRunCheck(Kf)
        })
    }
    checkReconnect() {
        return b(this, void 0, void 0, function*() {
            return this.createAndRunCheck(Hf)
        })
    }
    checkPublishAudio() {
        return b(this, void 0, void 0, function*() {
            return this.createAndRunCheck(qf)
        })
    }
    checkPublishVideo() {
        return b(this, void 0, void 0, function*() {
            return this.createAndRunCheck(Wf)
        })
    }
    checkConnectionProtocol() {
        return b(this, void 0, void 0, function*() {
            const e = yield this.createAndRunCheck(Vf);
            if (e.data && "protocol" in e.data) {
                const t = e.data;
                this.options.protocol = t.protocol
            }
            return e
        })
    }
    checkCloudRegion() {
        return b(this, void 0, void 0, function*() {
            return this.createAndRunCheck(Bf)
        })
    }
}

