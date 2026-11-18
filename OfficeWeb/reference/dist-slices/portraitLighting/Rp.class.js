class Rp {
    constructor(e, t, n) {
        const i = n || ot.parseTrackName(t);
        this._targetGroup = e, this._bindings = e.subscribe_(t, i)
    }
    getValue(e, t) {
        this.bind();
        const n = this._targetGroup.nCachedObjects_,
            i = this._bindings[n];
        i !== void 0 && i.getValue(e, t)
    }
    setValue(e, t) {
        const n = this._bindings;
        for (let i = this._targetGroup.nCachedObjects_, r = n.length; i !== r; ++i) n[i].setValue(e, t)
    }
    bind() {
        const e = this._bindings;
        for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].bind()
    }
    unbind() {
        const e = this._bindings;
        for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].unbind()
    }
}
