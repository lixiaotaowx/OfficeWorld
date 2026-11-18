function Oe(i) {
    let e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
    if (typeof navigator > "u") return;
    const t = navigator.userAgent.toLowerCase();
    if (yn === void 0 || e) {
        const n = jh.find(s => {
            let {
                test: r
            } = s;
            return r.test(t)
        });
        yn = n == null ? void 0 : n.describe(t)
    }
    return yn
}
