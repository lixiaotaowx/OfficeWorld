class Ac {
    constructor(e) {
        const t = e.match(/^L(\d)T(\d)(h|_KEY|_KEY_SHIFT){0,1}$/);
        if (!t) throw new Error("invalid scalability mode");
        if (this.spatial = parseInt(t[1]), this.temporal = parseInt(t[2]), t.length > 3) switch (t[3]) {
            case "h":
            case "_KEY":
            case "_KEY_SHIFT":
                this.suffix = t[3]
        }
    }
    toString() {
        var e;
        return "L".concat(this.spatial, "T").concat(this.temporal).concat((e = this.suffix) !== null && e !== void 0 ? e : "")
    }
}

