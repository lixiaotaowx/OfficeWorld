const Wc = () => {
    var i;
    return typeof window > "u" || (i = window.officeDesktop) == null ? void 0 : i.screenShareIndicator
};
async function Zi(i, e) {
    var s;
    const t = Wc();
    if (!t) return i();
    if (An) throw Error("已经打开了一个选屏幕的窗口，等一下再试");
    An = !0;
    let n;
    try {
        const r = (s = window.officeDesktop) == null ? void 0 : s.displays;
        if (r && !(await r()).some(c => c.selected)) throw Error("设置里保存的屏幕当前不可用，请先选择可用屏幕");
        n = await i();
        const a = await t.source();
        if (!a) throw Error("认不出共享的是哪块屏幕，再选一次");
        for (const o of e(n)) o.kind === "video" && yi.set(o, a);
        return n
    } catch (r) {
        throw n !== void 0 && e(n).forEach(a => a.stop()), r
    } finally {
        An = !1
    }
}

