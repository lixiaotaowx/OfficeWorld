function pm(i, e) {
    return i.segments.map(t => {
        let {
            id: n,
            text: s,
            language: r,
            startTime: a,
            endTime: o,
            final: c
        } = t;
        var d;
        const l = (d = e.get(n)) !== null && d !== void 0 ? d : Date.now(),
            u = Date.now();
        return c ? e.delete(n) : e.set(n, l), {
            id: n,
            text: s,
            startTime: Number.parseInt(a.toString()),
            endTime: Number.parseInt(o.toString()),
            final: c,
            language: r,
            firstReceivedTime: l,
            lastReceivedTime: u
        }
    })
}

