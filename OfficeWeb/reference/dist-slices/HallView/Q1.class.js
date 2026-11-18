class Q1 {
    constructor() {
        this.textureUtils = null, this.pluginCallbacks = [], this.register(function(e) {
            return new Or(e)
        }), this.register(function(e) {
            return new Hr(e)
        }), this.register(function(e) {
            return new Vr(e)
        }), this.register(function(e) {
            return new Yr(e)
        }), this.register(function(e) {
            return new Jr(e)
        }), this.register(function(e) {
            return new Kr(e)
        }), this.register(function(e) {
            return new jr(e)
        }), this.register(function(e) {
            return new qr(e)
        }), this.register(function(e) {
            return new Wr(e)
        }), this.register(function(e) {
            return new Xr(e)
        }), this.register(function(e) {
            return new Zr(e)
        }), this.register(function(e) {
            return new $r(e)
        }), this.register(function(e) {
            return new eo(e)
        }), this.register(function(e) {
            return new to(e)
        })
    }
    register(e) {
        return this.pluginCallbacks.indexOf(e) === -1 && this.pluginCallbacks.push(e), this
    }
    unregister(e) {
        return this.pluginCallbacks.indexOf(e) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e), 1), this
    }
    setTextureUtils(e) {
        return this.textureUtils = e, this
    }
    parse(e, t, s, i) {
        const n = new _r,
            o = [];
        for (let a = 0, l = this.pluginCallbacks.length; a < l; a++) o.push(this.pluginCallbacks[a](n));
        n.setPlugins(o), n.setTextureUtils(this.textureUtils), n.writeAsync(e, t, i).catch(s)
    }
    parseAsync(e, t) {
        const s = this;
        return new Promise(function(i, n) {
            s.parse(e, i, n, t)
        })
    }
}
