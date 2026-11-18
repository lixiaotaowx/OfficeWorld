class pi {
    constructor(e) {
        this.manager = e !== void 0 ? e : op, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {}, this.priority = "auto", this.cache = "default", typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
            detail: this
        }))
    }
    load() {}
    loadAsync(e, t) {
        const n = this;
        return new Promise(function(i, r) {
            n.load(e, i, t, r)
        })
    }
    parse() {}
    setCrossOrigin(e) {
        return this.crossOrigin = e, this
    }
    setWithCredentials(e) {
        return this.withCredentials = e, this
    }
    setPath(e) {
        return this.path = e, this
    }
    setResourcePath(e) {
        return this.resourcePath = e, this
    }
    setRequestHeader(e) {
        return this.requestHeader = e, this
    }
    setPriority(e) {
        return this.priority = e, this
    }
    setCache(e) {
        return this.cache = e, this
    }
    abort() {
        return this
    }
}
pi.DEFAULT_MATERIAL_NAME = "__DEFAULT";
