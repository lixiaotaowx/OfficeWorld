function Ze(i, e) {
    const t = i.split("."),
        n = e.split("."),
        s = Math.min(t.length, n.length);
    for (let r = 0; r < s; ++r) {
        const a = parseInt(t[r], 10),
            o = parseInt(n[r], 10);
        if (a > o) return 1;
        if (a < o) return -1;
        if (r === s - 1 && a === o) return 0
    }
    return i === "" && e !== "" ? -1 : e === "" ? 1 : t.length == n.length ? 0 : t.length < n.length ? -1 : 1
}

