class oe {
    constructor(e, t, n, s, r) {
        if (typeof e == "object") this.width = e.width, this.height = e.height, this.aspectRatio = e.aspectRatio, this.encoding = {
            maxBitrate: e.maxBitrate,
            maxFramerate: e.maxFramerate,
            priority: e.priority
        };
        else if (t !== void 0 && n !== void 0) this.width = e, this.height = t, this.aspectRatio = e / t, this.encoding = {
            maxBitrate: n,
            maxFramerate: s,
            priority: r
        };
        else throw new TypeError("Unsupported options: provide at least width, height and maxBitrate")
    }
    get resolution() {
        return {
            width: this.width,
            height: this.height,
            frameRate: this.encoding.maxFramerate,
            aspectRatio: this.aspectRatio
        }
    }
}
