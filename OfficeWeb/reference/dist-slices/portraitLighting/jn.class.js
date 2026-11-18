class jn {
    addEventListener(e, t) {
        this._listeners === void 0 && (this._listeners = {});
        const n = this._listeners;
        n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t)
    }
    hasEventListener(e, t) {
        const n = this._listeners;
        return n === void 0 ? !1 : n[e] !== void 0 && n[e].indexOf(t) !== -1
    }
    removeEventListener(e, t) {
        const n = this._listeners;
        if (n === void 0) return;
        const i = n[e];
        if (i !== void 0) {
            const r = i.indexOf(t);
            r !== -1 && i.splice(r, 1)
        }
    }
    dispatchEvent(e) {
        const t = this._listeners;
        if (t === void 0) return;
        const n = t[e.type];
        if (n !== void 0) {
            e.target = this;
            const i = n.slice(0);
            for (let r = 0, a = i.length; r < a; r++) i[r].call(this, e);
            e.target = null
        }
    }
}
