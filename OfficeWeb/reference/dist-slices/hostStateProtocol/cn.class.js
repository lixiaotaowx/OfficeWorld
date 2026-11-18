class cn extends $ {
    constructor() {
        super(...arguments), this._upgrades = []
    }
    onOpen() {
        if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
            for (let e = 0; e < this._upgrades.length; e++) this._probe(this._upgrades[e])
    }
    _probe(e) {
        let t = this.createTransport(e),
            s = !1;
        $.priorWebsocketSuccess = !1;
        const r = () => {
            s || (t.send([{
                type: "ping",
                data: "probe"
            }]), t.once("packet", _ => {
                if (!s)
                    if (_.type === "pong" && _.data === "probe") {
                        if (this.upgrading = !0, this.emitReserved("upgrading", t), !t) return;
                        $.priorWebsocketSuccess = t.name === "websocket", this.transport.pause(() => {
                            s || this.readyState !== "closed" && (m(), this.setTransport(t), t.send([{
                                type: "upgrade"
                            }]), this.emitReserved("upgrade", t), t = null, this.upgrading = !1, this.flush())
                        })
                    } else {
                        const y = new Error("probe error");
                        y.transport = t.name, this.emitReserved("upgradeError", y)
                    }
            }))
        };

        function i() {
            s || (s = !0, m(), t.close(), t = null)
        }
        const o = _ => {
            const y = new Error("probe error: " + _);
            y.transport = t.name, i(), this.emitReserved("upgradeError", y)
        };

        function a() {
            o("transport closed")
        }

        function f() {
            o("socket closed")
        }

        function d(_) {
            t && _.name !== t.name && i()
        }
        const m = () => {
            t.removeListener("open", r), t.removeListener("error", o), t.removeListener("close", a), this.off("close", f), this.off("upgrading", d)
        };
        t.once("open", r), t.once("error", o), t.once("close", a), this.once("close", f), this.once("upgrading", d), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
            s || t.open()
        }, 200) : t.open()
    }
    onHandshake(e) {
        this._upgrades = this._filterUpgrades(e.upgrades), super.onHandshake(e)
    }
    _filterUpgrades(e) {
        const t = [];
        for (let s = 0; s < e.length; s++) ~this.transports.indexOf(e[s]) && t.push(e[s]);
        return t
    }
}
let hn = class extends cn {
    constructor(e, t = {}) {
        const s = typeof e == "object",
            r = s ? {
                ...e
            } : {
                ...t
            };
        (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map(i => nn[i]).filter(i => !!i)), super(s ? r : e, r)
    }
};

