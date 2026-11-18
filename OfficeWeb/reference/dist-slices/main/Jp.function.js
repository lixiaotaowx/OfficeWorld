function Jp() {
    var D, C, M;
    const [i, e] = I.useState(null), [t, n] = I.useState(!0), [s, r] = I.useState("login"), [a, o] = I.useState(""), [c, d] = I.useState(""), [l, u] = I.useState(""), [h, m] = I.useState(!1), [f, p] = I.useState(!1), [_, w] = I.useState(!1), k = I.useRef(), P = qo() && !!((D = window.officeHost) != null && D.state || (M = (C = window.officeHost) == null ? void 0 : C.auth) != null && M.get);
    I.useEffect(() => {
        let g = !1;
        return fetch("/api/auth/me").then(T => T.json()).then(T => {
            g || w(T.recoveryEnabled === !0)
        }).catch(() => {}), () => {
            g = !0
        }
    }, []);
    async function y(g) {
        if (!(!i || f)) {
            p(!0), u("");
            try {
                if (P) {
                    e(await Nd(g));
                    return
                }
                const T = await fetch("/api/auth/role", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            role: g
                        })
                    }),
                    A = await T.json();
                if (!T.ok) throw Error((A == null ? void 0 : A.error) || "身份没存上，再试一次");
                e(A.user)
            } catch (T) {
                u(T instanceof Error ? T.message : "身份没存上，再试一次")
            } finally {
                p(!1)
            }
        }
    }
    async function S(g) {
        var A;
        const T = await Bn().catch(() => null);
        ((A = T == null ? void 0 : T.user) == null ? void 0 : A.id) === g && e(T.user)
    }
    I.useEffect(() => {
        const g = async A => {
            var H, N, Q;
            (H = k.current) == null || H.call(k);
            const F = A.detail || {};
            if (F.forget === !0) await ((N = window.officeDesktop) == null ? void 0 : N.clearLogin().catch(() => {})), d("");
            else {
                const Z = await ((Q = window.officeDesktop) == null ? void 0 : Q.readLogin().catch(() => null));
                Z && (o(Z.name), d(Z.password))
            }
            e(null), r("login"), u(window.officeDesktop ? "" : F.message || "登录过期了，请重新登录")
        }, T = A => {
            g(A)
        };
        return window.addEventListener("office-session-ended", T), () => window.removeEventListener("office-session-ended", T)
    }, []), I.useEffect(() => {
        if (P) {
            let g = !0;
            const T = async () => {
                var N;
                const H = await ((N = window.officeDesktop) == null ? void 0 : N.readLogin().catch(() => null));
                !g || !(H != null && H.name) || (o(Q => Q || H.name), d(Q => Q || H.password))
            }, A = H => {
                if (g) {
                    if (!H) {
                        n(!1), T();
                        return
                    }
                    H.user ? (e(H.user), u("")) : (H.status === "expired" && u(H.message || "登录过期了，请重新登录"), T()), n(!1)
                }
            };
            Bn().then(A).catch(() => {
                n(!1), T()
            });
            const F = Ad(A);
            return () => {
                g = !1, F == null || F()
            }
        }
        return k.current = Md({
            user: e,
            loading: n,
            error: u,
            credentials: g => {
                o(g.name), d(g.password)
            }
        }), () => {
            var g;
            return (g = k.current) == null ? void 0 : g.call(k)
        }
    }, [P]);
    async function E(g) {
        var T, A;
        g.preventDefault(), m(!0), u(""), (T = k.current) == null || T.call(k);
        try {
            const F = await fetch(`/api/auth/${s}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: a,
                        password: c
                    })
                }),
                H = await F.json();
            if (!F.ok) throw Error(H.error || "现在登录不了，等一下再试");
            await ((A = window.officeDesktop) == null ? void 0 : A.saveLogin({
                name: H.user.name,
                password: c
            }).catch(() => {})), o(H.user.name), e(H.user), P && S(H.user.id)
        } catch (F) {
            u(F instanceof Error ? F.message : "连不上，再试一次")
        } finally {
            m(!1)
        }
    }
    async function x() {
        var g, T;
        m(!0);
        try {
            if (P) {
                await Ld(), o((i == null ? void 0 : i.name) ?? a), d(""), e(null), r("login"), u("");
                return
            }
            if (!(await fetch("/api/auth/logout", {
                    method: "POST"
                })).ok) throw Error();
            (g = k.current) == null || g.call(k), await ((T = window.officeDesktop) == null ? void 0 : T.clearLogin().catch(() => {})), o((i == null ? void 0 : i.name) ?? a), d(""), e(null), r("login"), u("")
        } catch {
            window.alert("没退出成功，检查一下网络再试")
        } finally {
            m(!1)
        }
    }
    return i && !i.role ? v.jsx(Gp, {
        busy: f,
        error: l,
        choose: y
    }) : i ? v.jsx(qp, {
        account: i,
        onLogout: () => void x()
    }) : v.jsxs("main", {
        className: "account-page",
        children: [v.jsxs("section", {
            className: "account-intro",
            children: [v.jsxs("div", {
                className: "account-brand",
                children: [v.jsxs("span", {
                    className: "brand-mark",
                    children: ["i", v.jsx("span", {
                        children: "·"
                    })]
                }), v.jsxs("span", {
                    children: ["iruler dream", v.jsx("small", {
                        children: "在一起"
                    })]
                })]
            }), v.jsxs("div", {
                className: "intro-copy",
                children: [v.jsx("span", {
                    className: "eyebrow",
                    children: "隔得再远，也在一起"
                }), v.jsxs("div", {
                    className: "account-manifesto",
                    "aria-hidden": "true",
                    children: ["好好工作，", v.jsx("br", {}), v.jsx("em", {
                        children: "有人作伴。"
                    })]
                }), v.jsxs("h1", {
                    children: ["一个更好的", v.jsx("br", {}), "工作的地方"]
                }), v.jsxs("p", {
                    children: ["回到自己的工位，跟大家打个招呼。", v.jsx("br", {}), "一起看屏幕、说说话、交换想法。"]
                })]
            }), v.jsx(Kp, {}), v.jsxs("div", {
                className: "account-space",
                children: [v.jsx("span", {
                    children: "01 / 书馆大厅"
                }), v.jsxs("strong", {
                    children: ["各做各的事，但在一起。", v.jsx("span", {
                        "aria-hidden": "true",
                        children: "↗"
                    })]
                }), v.jsx("small", {
                    children: "自己的工位 / 共享屏幕 / 随时说话"
                })]
            })]
        }), v.jsxs("form", {
            className: "account-card",
            onSubmit: E,
            children: [v.jsx("span", {
                className: "eyebrow",
                children: "欢迎来到 iruler dream"
            }), v.jsx("h2", {
                children: t ? "正在恢复登录…" : s === "login" ? "欢迎回来" : s === "reset-password" ? "重设密码" : "初次见面"
            }), v.jsx("p", {
                children: s === "login" ? "用名字和密码登录。" : s === "reset-password" ? "确认名字，输入新密码就能回到办公室。" : "注册后挑一个形象，再选一张工位。"
            }), v.jsxs("div", {
                className: "account-tabs",
                children: [v.jsx("button", {
                    type: "button",
                    disabled: h,
                    "aria-pressed": s === "login",
                    onClick: () => {
                        r("login"), u("")
                    },
                    children: "登录"
                }), v.jsx("button", {
                    type: "button",
                    disabled: h,
                    "aria-pressed": s === "register",
                    onClick: () => {
                        r("register"), u("")
                    },
                    children: "注册"
                })]
            }), v.jsxs("label", {
                children: ["名字", v.jsx("input", {
                    autoComplete: "username",
                    value: a,
                    onChange: g => o(g.target.value),
                    minLength: 2,
                    maxLength: 24,
                    required: !0,
                    placeholder: "同事认识你的名字"
                })]
            }), v.jsxs("label", {
                children: [s === "reset-password" ? "新密码" : "密码", v.jsx("input", {
                    type: "password",
                    autoComplete: s !== "login" ? "new-password" : "current-password",
                    value: c,
                    onChange: g => d(g.target.value),
                    minLength: 1,
                    maxLength: 16,
                    required: !0,
                    placeholder: "输入密码（1 到 16 个字符）"
                })]
            }), s === "login" && _ && v.jsx("button", {
                type: "button",
                className: "account-recovery",
                disabled: h,
                onClick: () => {
                    var g;
                    (g = k.current) == null || g.call(k), n(!1), r("reset-password"), d(""), u("")
                },
                children: "忘了密码"
            }), v.jsx("p", {
                className: "account-error",
                role: "alert",
                children: l
            }), v.jsx("button", {
                className: "primary account-submit",
                disabled: h || t,
                children: h ? "请稍等…" : s === "login" ? "进入办公室 →" : s === "reset-password" ? "重设密码并进入 →" : "注册并进入 →"
            }), v.jsxs("small", {
                children: ["名字就是登录账号，被人用过了可以加上团队名。", v.jsx("br", {}), window.officeDesktop ? "会记住登录，下次打开自动进入。" : "登录保持 30 天，在公用电脑上记得退出。"]
            })]
        })]
    })
}
Jo();
pd.createRoot(document.getElementById("root")).render(v.jsx(Jp, {}));