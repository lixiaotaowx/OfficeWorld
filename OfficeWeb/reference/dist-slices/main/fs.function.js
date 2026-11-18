function fs(i, e) {
    const t = e || window;
    let n = i.offsetTop,
        s = i.offsetLeft;
    const r = i.offsetWidth,
        a = i.offsetHeight,
        {
            hidden: o
        } = i,
        {
            display: c
        } = getComputedStyle(i);
    for (; i.offsetParent;) i = i.offsetParent, n += i.offsetTop, s += i.offsetLeft;
    return n < t.pageYOffset + t.innerHeight && s < t.pageXOffset + t.innerWidth && n + a > t.pageYOffset && s + r > t.pageXOffset && !o && c !== "none"
}
