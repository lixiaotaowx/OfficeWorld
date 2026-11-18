function pn({
    text: t,
    children: s
}) {
    const [n, c] = u.useState(null), [r, i] = u.useState(""), [o, d] = u.useState(!1), m = u.useRef(null), h = u.useRef(null), k = u.useRef(null), f = () => {
        var g;
        c(null), (g = k.current) == null || g.focus({
            preventScroll: !0
        })
    };
    u.useEffect(() => {
        var C, I;
        if (!n) return;
        (I = (C = h.current) == null ? void 0 : C.querySelector("button")) == null || I.focus({
            preventScroll: !0
        });
        const g = j => {
                var _;
                (_ = h.current) != null && _.contains(j.target) || c(null)
            },
            R = j => {
                j.key === "Escape" && (j.preventDefault(), j.stopImmediatePropagation(), f())
            },
            N = () => c(null);
        return document.addEventListener("pointerdown", g, !0), document.addEventListener("contextmenu", g, !0), document.addEventListener("keydown", R, !0), document.addEventListener("scroll", N, !0), window.addEventListener("resize", N), window.addEventListener("blur", N), () => {
            document.removeEventListener("pointerdown", g, !0), document.removeEventListener("contextmenu", g, !0), document.removeEventListener("keydown", R, !0), document.removeEventListener("scroll", N, !0), window.removeEventListener("resize", N), window.removeEventListener("blur", N)
        }
    }, [n]), u.useEffect(() => {
        if (r === "已复制") {
            const g = setTimeout(() => i(""), 3e3);
            return () => clearTimeout(g)
        }
    }, [r]), u.useEffect(() => {
        c(null), i("")
    }, [t]);
    const b = async () => {
        if (!o) {
            d(!0), i("");
            try {
                await navigator.clipboard.writeText(t), i("已复制"), f()
            } catch {
                i("复制失败，请重试或选中文字后按 Ctrl+C")
            } finally {
                d(!1)
            }
        }
    };
    return e.jsxs("span", {
        ref: m,
        className: "dk-copy-text",
        tabIndex: 0,
        onContextMenu: g => {
            var I, j;
            g.preventDefault(), g.stopPropagation(), i(""), k.current = document.activeElement instanceof HTMLElement ? document.activeElement : m.current;
            const R = m.current.getBoundingClientRect(),
                N = g.clientX || R.left,
                C = g.clientY || R.top;
            c({
                x: Math.max(8, Math.min(N, window.innerWidth - 168)),
                y: Math.max(8, Math.min(C, window.innerHeight - 96)),
                theme: ((j = (I = m.current) == null ? void 0 : I.closest("[data-theme]")) == null ? void 0 : j.getAttribute("data-theme")) || "dark"
            })
        },
        children: [s, r && e.jsx("small", {
            className: "dk-copy-status",
            role: "status",
            children: r
        }), n && St.createPortal(e.jsx("div", {
            className: "dk dk-copy-layer",
            "data-theme": n.theme,
            style: {
                left: n.x,
                top: n.y
            },
            children: e.jsxs("div", {
                ref: h,
                className: "dock-card dk-copy-menu",
                role: "menu",
                "aria-label": "消息操作",
                onContextMenu: g => {
                    g.preventDefault(), g.stopPropagation()
                },
                children: [e.jsx("button", {
                    type: "button",
                    role: "menuitem",
                    disabled: o,
                    onClick: () => void b(),
                    children: o ? "正在复制…" : "复制消息"
                }), e.jsx("button", {
                    type: "button",
                    role: "menuitem",
                    onClick: f,
                    children: "取消"
                })]
            })
        }), document.body)]
    })
}

