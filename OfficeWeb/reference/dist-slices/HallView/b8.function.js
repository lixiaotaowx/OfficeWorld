function b8(r) {
    const e = Math.floor(r) % 2 === 0 ? Math.floor(r) + 1 : Math.floor(r),
        t = e * e,
        s = Array(t).fill(0);
    let i = Math.floor(e / 2),
        n = e - 1;
    for (let o = 1; o <= t;) {
        if (i === -1 && n === e ? (n = e - 2, i = 0) : (n === e && (n = 0), i < 0 && (i = e - 1)), s[i * e + n] !== 0) {
            n -= 2, i++;
            continue
        } else s[i * e + n] = o++;
        n++, i--
    }
    return s
}
