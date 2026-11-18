class wt extends et.EventEmitter {
    constructor(e, t) {
        let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        super(), this.status = Be.IDLE, this.logs = [], this.options = {}, this.url = e, this.token = t, this.name = this.constructor.name, this.room = new $t(n.roomOptions), this.connectOptions = n.connectOptions, this.options = n
    }
    run(e) {
        return b(this, void 0, void 0, function*() {
            if (this.status !== Be.IDLE) throw Error("check is running already");
            this.setStatus(Be.RUNNING);
            try {
                yield this.perform()
            } catch (t) {
                t instanceof Error && (this.options.errorsAsWarnings ? this.appendWarning(t.message) : this.appendError(t.message))
            }
            return yield this.disconnect(), yield new Promise(t => setTimeout(t, 500)), this.status !== Be.SKIPPED && this.setStatus(this.isSuccess() ? Be.SUCCESS : Be.FAILED), e && e(), this.getInfo()
        })
    }
    isSuccess() {
        return !this.logs.some(e => e.level === "error")
    }
    connect(e) {
        return b(this, void 0, void 0, function*() {
            return this.room.state === re.Connected ? this.room : (e || (e = this.url), yield this.room.connect(e, this.token, this.connectOptions), this.room)
        })
    }
    disconnect() {
        return b(this, void 0, void 0, function*() {
            this.room && this.room.state !== re.Disconnected && (yield this.room.disconnect(), yield new Promise(e => setTimeout(e, 500)))
        })
    }
    skip() {
        this.setStatus(Be.SKIPPED)
    }
    switchProtocol(e) {
        return b(this, void 0, void 0, function*() {
            let t = !1,
                n = !1;
            if (this.room.on(U.Reconnecting, () => {
                    t = !0
                }), this.room.once(U.Reconnected, () => {
                    n = !0
                }), this.room.simulateScenario("force-".concat(e)), yield new Promise(r => setTimeout(r, 1e3)), !t) return;
            const s = Date.now() + 1e4;
            for (; Date.now() < s;) {
                if (n) return;
                yield Ce(100)
            }
            throw new Error("Could not reconnect using ".concat(e, " protocol after 10 seconds"))
        })
    }
    appendMessage(e) {
        this.logs.push({
            level: "info",
            message: e
        }), this.emit("update", this.getInfo())
    }
    appendWarning(e) {
        this.logs.push({
            level: "warning",
            message: e
        }), this.emit("update", this.getInfo())
    }
    appendError(e) {
        this.logs.push({
            level: "error",
            message: e
        }), this.emit("update", this.getInfo())
    }
    setStatus(e) {
        this.status = e, this.emit("update", this.getInfo())
    }
    get engine() {
        var e;
        return (e = this.room) === null || e === void 0 ? void 0 : e.engine
    }
    getInfo() {
        return {
            logs: this.logs,
            name: this.name,
            status: this.status,
            description: this.description
        }
    }
}
