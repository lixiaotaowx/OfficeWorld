class Xt extends Kt {
    constructor(e) {
        if (super(e), typeof location < "u") {
            const t = location.protocol === "https:";
            let s = location.port;
            s || (s = t ? "443" : "80"), this.xd = typeof location < "u" && e.hostname !== location.hostname || s !== e.port
        }
    }
    doWrite(e, t) {
        const s = this.request({
            method: "POST",
            data: e
        });
        s.on("success", t), s.on("error", (r, i) => {
            this.onError("xhr post error", r, i)
        })
    }
    doPoll() {
        const e = this.request();
        e.on("data", this.onData.bind(this)), e.on("error", (t, s) => {
            this.onError("xhr poll error", t, s)
        }), this.pollXhr = e
    }
}
