function gl() {
    const [i, e] = I.useState(null), [t, n] = I.useState(), [s, r] = I.useState("unavailable"), [a, o] = I.useState({
        received: 0,
        total: 0,
        percent: null
    }), [c, d] = I.useState(), l = I.useRef(), u = I.useRef(!1), h = I.useRef(!1), m = I.useRef(void 0), f = typeof window > "u" ? void 0 : window.officeDesktop;
    I.useEffect(() => {
        var D, C;
        let E = !0;
        Promise.resolve((D = f == null ? void 0 : f.appVersion) == null ? void 0 : D.call(f)).then(M => {
            E && typeof M == "string" && M && n(M)
        }).catch(() => {});
        const x = (C = f == null ? void 0 : f.onUpdateProgress) == null ? void 0 : C.call(f, M => {
            const g = Number(M == null ? void 0 : M.received) || 0,
                T = Number(M == null ? void 0 : M.total) || 0;
            o({
                received: g,
                total: T,
                percent: ll(g, T)
            })
        });
        return () => {
            E = !1, x == null || x()
        }
    }, [f]), I.useEffect(() => {
        const E = hl("/download/latest.json", location.origin);
        let x = !0,
            D = 0,
            C;
        const M = () => {
                x && (clearTimeout(C), C = setTimeout(() => void g(), ml(D)))
            },
            g = async () => {
                var A;
                if (u.current || h.current) {
                    M();
                    return
                }
                try {
                    const F = new URL(E);
                    F.searchParams.set("t", String(Date.now()));
                    const H = await fetch(F.href, {
                        cache: "no-store"
                    });
                    if (!H.ok) throw Error("HTTP " + H.status);
                    const N = await H.json(),
                        Q = N != null && N.version && (N != null && N.url) ? qn(N.url, location.origin) : null;
                    if (!Q) throw Error("Bad manifest");
                    D = 0;
                    try {
                        (A = f == null ? void 0 : f.updateChecked) == null || A.call(f, String(N.version))
                    } catch {}
                    if (!x || u.current || h.current) return;
                    e({
                        ...N,
                        url: Q
                    }), r(pl() === N.version ? "skipped" : "available")
                } catch {
                    D += 1, x && !u.current && !h.current && r(F => F === "available" ? F : "unavailable")
                } finally {
                    M()
                }
            };
        g();
        const T = () => {
            D > 0 && navigator.onLine !== !1 && g()
        };
        return window.addEventListener("online", T), () => {
            x = !1, clearTimeout(C), window.removeEventListener("online", T)
        }
    }, []);
    const p = I.useCallback(async () => {
            var x, D;
            if (!i || u.current || h.current) return;
            if (d(void 0), l.current) {
                await ((x = m.current) == null ? void 0 : x.call(m));
                return
            }
            const E = new URL(i.url, location.origin).href;
            if (!(f != null && f.downloadUpdate) || !(f != null && f.installUpdate)) {
                window.open(E, "_blank", "noopener"), r("browser");
                return
            }
            r("downloading"), u.current = !0, o({
                received: 0,
                total: 0,
                percent: null
            });
            try {
                const C = await f.downloadUpdate(E, i.sha256);
                if (!(C != null && C.ok) || !C.file) throw Error("下载没有完成，请重试");
                l.current = C.file, await ((D = m.current) == null ? void 0 : D.call(m))
            } catch (C) {
                r("failed"), d(C instanceof Error ? C.message : "下载失败了，等一下再试")
            } finally {
                u.current = !1
            }
        }, [f, i]),
        _ = I.useCallback(async () => {
            if (!(!l.current || !(f != null && f.installUpdate) || h.current)) {
                h.current = !0, d(void 0), r("installing");
                try {
                    const E = await f.installUpdate(l.current);
                    if (!(E != null && E.ok)) throw Error("安装程序启动不了，请重试")
                } catch (E) {
                    r("failed"), h.current = !1, l.current = void 0, d(E instanceof Error ? E.message : "安装程序启动不了")
                }
            }
        }, [f]);
    m.current = _;
    const w = I.useCallback(async () => {
            if (!(!l.current || !(f != null && f.revealUpdate))) try {
                await f.revealUpdate(l.current)
            } catch {}
        }, [f]),
        k = I.useCallback(async () => {
            if (!i) return;
            const E = new URL(i.url, location.origin).href;
            try {
                await navigator.clipboard.writeText(E)
            } catch {
                window.prompt("复制下载链接", E)
            }
        }, [i]),
        P = I.useCallback(() => {
            if (!(u.current || h.current)) {
                if (i != null && i.version) try {
                    localStorage.setItem(Go, i.version)
                } catch {}
                r("skipped")
            }
        }, [i]),
        y = i && t && !dl(i.version, t) ? "current" : s,
        S = s === "failed" ? {
            title: "更新未完成",
            detail: c || "等一下再试",
            action: "重试更新",
            automatic: !!(f != null && f.downloadUpdate && (f != null && f.installUpdate)),
            secondary: void 0,
            hint: void 0
        } : ul(i, t, y, !!(f != null && f.downloadUpdate && (f != null && f.installUpdate)));
    return {
        copy: y === "skipped" || y === "current" ? null : S,
        currentVersion: t,
        stage: y,
        percent: a.percent,
        received: a.received,
        total: a.total,
        error: c,
        autoInstall: y === "ready",
        start: p,
        install: _,
        reveal: w,
        copyLink: k,
        later: P
    }
}

