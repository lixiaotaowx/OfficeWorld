class Ix {
    constructor(e) {
        this.parser = e, this.name = Ze.KHR_LIGHTS_PUNCTUAL, this.cache = {
            refs: {},
            uses: {}
        }
    }
    _markDefs() {
        const e = this.parser,
            t = this.parser.json.nodes || [];
        for (let n = 0, i = t.length; n < i; n++) {
            const r = t[n];
            r.extensions && r.extensions[this.name] && r.extensions[this.name].light !== void 0 && e._addNodeRef(this.cache, r.extensions[this.name].light)
        }
    }
    _loadLight(e) {
        const t = this.parser,
            n = "light:" + e;
        let i = t.cache.get(n);
        if (i) return i;
        const r = t.json,
            l = ((r.extensions && r.extensions[this.name] || {}).lights || [])[e];
        let c;
        const h = new Fe(16777215);
        l.color !== void 0 && h.setRGB(l.color[0], l.color[1], l.color[2], Xt);
        const u = l.range !== void 0 ? l.range : 0;
        switch (l.type) {
            case "directional":
                c = new Mo(h), c.target.position.set(0, 0, -1), c.add(c.target);
                break;
            case "point":
                c = new jh(h), c.distance = u;
                break;
            case "spot":
                c = new fp(h), c.distance = u, l.spot = l.spot || {}, l.spot.innerConeAngle = l.spot.innerConeAngle !== void 0 ? l.spot.innerConeAngle : 0, l.spot.outerConeAngle = l.spot.outerConeAngle !== void 0 ? l.spot.outerConeAngle : Math.PI / 4, c.angle = l.spot.outerConeAngle, c.penumbra = 1 - l.spot.innerConeAngle / l.spot.outerConeAngle, c.target.position.set(0, 0, -1), c.add(c.target);
                break;
            default:
                throw new Error("THREE.GLTFLoader: Unexpected light type: " + l.type)
        }
        return c.position.set(0, 0, 0), gn(c, l), l.intensity !== void 0 && (c.intensity = l.intensity), c.name = t.createUniqueName(l.name || "light_" + e), i = Promise.resolve(c), t.cache.add(n, i), i
    }
    getDependency(e, t) {
        if (e === "light") return this._loadLight(t)
    }
    createNodeAttachment(e) {
        const t = this,
            n = this.parser,
            r = n.json.nodes[e],
            o = (r.extensions && r.extensions[this.name] || {}).light;
        return o === void 0 ? null : this._loadLight(o).then(function(l) {
            return n._getNodeRef(t.cache, o, l)
        })
    }
}
