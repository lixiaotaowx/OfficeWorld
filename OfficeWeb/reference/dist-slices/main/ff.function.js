function ff(i, e, t, n) {
    const s = pf(i, e, t);
    let {
        encoding: r
    } = s[0];
    const a = Math.max(e, t);
    for (let o = 0; o < s.length; o += 1) {
        const c = s[o];
        if (r = c.encoding, c.width >= a) break
    }
    if (n) switch (n) {
        case "av1":
        case "h265":
            r = Object.assign({}, r), r.maxBitrate = r.maxBitrate * .7;
            break;
        case "vp9":
            r = Object.assign({}, r), r.maxBitrate = r.maxBitrate * .85;
            break
    }
    return r
}

