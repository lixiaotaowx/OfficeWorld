const af = Object.values(gi),
    cf = Object.values(ns),
    df = Object.values(ln),
    lf = [gi.h180, gi.h360],
    uf = [ns.h180, ns.h360],
    hf = i => [{
        scaleResolutionDownBy: 2,
        fps: i.encoding.maxFramerate
    }].map(t => {
        var n, s;
        return new oe(Math.floor(i.width / t.scaleResolutionDownBy), Math.floor(i.height / t.scaleResolutionDownBy), Math.max(15e4, Math.floor(i.encoding.maxBitrate / (Math.pow(t.scaleResolutionDownBy, 2) * (((n = i.encoding.maxFramerate) !== null && n !== void 0 ? n : 30) / ((s = t.fps) !== null && s !== void 0 ? s : 30))))), t.fps, i.encoding.priority)
    }),
    hs = ["q", "h", "f"];

