function Lh() {
    let {
        window: i
    } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
        shimChrome: !0,
        shimFirefox: !0,
        shimSafari: !0
    };
    const t = Ha,
        n = Mh(i),
        s = {
            browserDetails: n,
            commonShim: Nh,
            extractVersion: oi,
            disableLog: Ih,
            disableWarnings: xh,
            sdp: Ah
        };
    switch (n.browser) {
        case "chrome":
            if (!Vr || !Qn || !e.shimChrome) return t("Chrome shim is not included in this adapter release."), s;
            if (n.version === null) return t("Chrome shim can not determine version, not shimming."), s;
            t("adapter.js shimming chrome."), s.browserShim = Vr, Li(i, n), Ui(i), Ga(i, n), Ja(i), Qn(i, n), za(i), Xa(i, n), $a(i), Qa(i), Za(i, n), Di(i), Xn(i), Zn(i), Ai(i, n), Ni(i), es(i, n);
            break;
        case "firefox":
            if (!qr || !Yn || !e.shimFirefox) return t("Firefox shim is not included in this adapter release."), s;
            t("adapter.js shimming firefox."), s.browserShim = qr, Li(i, n), Ui(i), ec(i, n), Yn(i, n), tc(i), sc(i), ic(i), nc(i), rc(i), oc(i), ac(i), cc(i), dc(i), Di(i), Zn(i), Ai(i, n), Ni(i);
            break;
        case "safari":
            if (!Wr || !e.shimSafari) return t("Safari shim is not included in this adapter release."), s;
            t("adapter.js shimming safari."), s.browserShim = Wr, Li(i, n), Ui(i), pc(i), vc(i), hc(i), lc(i), uc(i), gc(i), mc(i), bc(i), Di(i), Xn(i), Ai(i, n), Ni(i), es(i, n);
            break;
        default:
            t("Unsupported browser!");
            break
    }
    return s
}
Lh({
    window: typeof window > "u" ? void 0 : window
});
var ts, kc;
