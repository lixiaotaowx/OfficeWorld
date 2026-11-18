function Wd(i) {
    const [e, t] = I.useState({}), [n, s] = I.useState(!1), [r, a] = I.useState(""), [o, c] = I.useState(!1), [d, l] = I.useState(""), u = I.useRef(0), h = I.useRef(!1);
    I.useEffect(() => {
        let p = !0;
        const _ = async () => {
            const k = ++u.current;
            try {
                const P = await ar();
                p && k === u.current && t(y => JSON.stringify(y) === JSON.stringify(P) ? y : P)
            } catch {}
        };
        _();
        const w = setInterval(() => {
            _()
        }, 5e3);
        return () => {
            p = !1, clearInterval(w)
        }
    }, [i]);
    const m = I.useCallback(() => {
        a(e[i] || ""), l(""), s(!0)
    }, [e, i]);
    async function f(p) {
        if (!h.current) {
            h.current = !0, c(!0), l(""), ++u.current;
            try {
                const _ = await ar(p);
                ++u.current, t(_), s(!1)
            } catch (_) {
                l(_ instanceof DOMException && _.name === "TimeoutError" ? "保存超时了，检查一下网络再试" : _ instanceof Error ? _.message : "状态没存上")
            } finally {
                h.current = !1, c(!1)
            }
        }
    }
    return {
        statuses: e,
        show: m,
        clear: () => {
            f("")
        },
        control: {
            busy: o,
            error: d
        },
        dialog: n ? v.jsx("div", {
            className: "presence-overlay",
            children: v.jsxs("form", {
                className: "presence-editor",
                role: "dialog",
                "aria-modal": "true",
                "aria-label": "写状态",
                onSubmit: p => {
                    p.preventDefault(), f(r)
                },
                onKeyDown: p => {
                    p.key === "Escape" && s(!1)
                },
                children: [v.jsxs("header", {
                    children: [v.jsx("strong", {
                        children: e[i] ? "改状态" : "写个状态"
                    }), v.jsx("button", {
                        type: "button",
                        "aria-label": "关闭",
                        onClick: () => s(!1),
                        children: "×"
                    })]
                }), v.jsx("p", {
                    children: "会显示在你的头像上，让同事知道你在忙什么。"
                }), v.jsx("div", {
                    className: "presence-presets",
                    children: ["吃饭去了", "外出", "记得报销", "记得交材料"].map(p => v.jsx("button", {
                        type: "button",
                        disabled: o,
                        onClick: () => a(p),
                        children: p
                    }, p))
                }), v.jsxs("label", {
                    children: ["状态", v.jsx("textarea", {
                        autoFocus: !0,
                        value: r,
                        maxLength: 40,
                        disabled: o,
                        placeholder: "比如：周五前把报销单交了",
                        onChange: p => a(p.target.value)
                    })]
                }), v.jsxs("small", {
                    children: [
                        [...r].length, " / 40 · 一直显示，直到你改掉或清空"
                    ]
                }), d && v.jsx("p", {
                    role: "alert",
                    children: d
                }), v.jsxs("footer", {
                    children: [e[i] && v.jsx("button", {
                        type: "button",
                        disabled: o,
                        onClick: () => void f(""),
                        children: "清空状态"
                    }), v.jsx("button", {
                        type: "button",
                        onClick: () => s(!1),
                        children: "取消"
                    }), v.jsx("button", {
                        type: "submit",
                        disabled: o || !r.trim(),
                        children: o ? "保存中…" : "发布"
                    })]
                })]
            })
        }) : null
    }
}

