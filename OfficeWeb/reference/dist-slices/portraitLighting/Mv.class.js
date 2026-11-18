class Mv {
    constructor(e, t) {
        _l(this, "current");
        this.create = e, this.destroy = t
    }
    async acquire() {
        let e = this.current;
        if (!e) {
            e = {
                refs: 0,
                promise: Promise.resolve().then(() => this.create())
            };
            const r = e;
            e.promise = e.promise.then(a => (r.value = a, a)), this.current = e
        }
        e.refs++;
        const t = e;
        let n = !1;
        const i = () => {
            n || (n = !0, --t.refs === 0 && (this.current === t && (this.current = void 0), t.value !== void 0 && this.destroy(t.value)))
        };
        try {
            return {
                value: await t.promise,
                release: i
            }
        } catch (r) {
            throw i(), r
        }
    }
}
