function Ad(i) {
    var e, t, n;
    return typeof window > "u" || (n = (t = (e = window.officeHost) == null ? void 0 : e.auth) == null ? void 0 : t.onChange) == null ? void 0 : n.call(t, i)
}
async function Ts(i) {
    const e = Ss();
    if (!e) return {
        ok: !1,
        error: "通信宿主还没准备好"
    };
    try {
        const t = await e.command(i);
        return t && typeof t == "object" ? t : {
            ok: !0
        }
    } catch (t) {
        return {
            ok: !1,
            error: t instanceof Error ? t.message : "通信宿主没有响应"
        }
    }
}
async function Nd(i) {
    var n;
    const e = await Ts({
        kind: "chooseRole",
        role: i
    });
    if (e.ok === !1) throw Error(e.error || "身份没存上，再试一次");
    const t = e.user ?? ((n = await Bn().catch(() => null)) == null ? void 0 : n.user) ?? null;
    if (!t || !t.role) throw Error("身份没存上，再试一次");
    return t
}
async function Ld() {
    const i = await Ts({
        kind: "logout"
    });
    if (i.ok === !1) throw Error(i.error || "通信宿主退出失败")
}

