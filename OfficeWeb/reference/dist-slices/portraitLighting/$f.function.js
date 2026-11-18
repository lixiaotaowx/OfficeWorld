function $f(s, e, t, n) {
    let i = 1,
        r = s[0];
    for (; r !== void 0 && r[n] === void 0;) r = s[i++];
    if (r === void 0) return;
    let a = r[n];
    if (a !== void 0)
        if (Array.isArray(a))
            do a = r[n], a !== void 0 && (e.push(r.time), t.push(...a)), r = s[i++]; while (r !== void 0);
        else if (a.toArray !== void 0)
        do a = r[n], a !== void 0 && (e.push(r.time), a.toArray(t, t.length)), r = s[i++]; while (r !== void 0);
    else
        do a = r[n], a !== void 0 && (e.push(r.time), t.push(a)), r = s[i++]; while (r !== void 0)
}
