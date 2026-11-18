function En({
    account: t,
    conversation: s,
    file: n
}) {
    var T, D;
    const [c, r] = u.useState(""), [i, o] = u.useState(""), [d, m] = u.useState(!1), [h, k] = u.useState(!1), [f, b] = u.useState(0), g = u.useRef(null), R = u.useRef(null), N = ((T = g.current) == null ? void 0 : T.closest(".dk-fly")) || ((D = g.current) == null ? void 0 : D.closest(".dk"));
    u.useEffect(() => {
        var E;
        if (!h) return;
        (E = R.current) == null || E.focus({
            preventScroll: !0
        });
        const w = L => {
            L.key === "Escape" && (L.preventDefault(), L.stopImmediatePropagation(), k(!1))
        };
        return document.addEventListener("keydown", w, !0), () => {
            var L, U;
            document.removeEventListener("keydown", w, !0), (U = (L = g.current) == null ? void 0 : L.querySelector("button")) == null || U.focus({
                preventScroll: !0
            })
        }
    }, [h]);
    const [C, I] = u.useState(!1), [j, _] = u.useState(""), V = async () => {
        if (!C) {
            I(!0), _("");
            try {
                await Le({
                    kind: "view",
                    account: t,
                    conversation: s,
                    file: n
                }), k(!1)
            } catch {
                _("全屏打开失败，请确认主窗口已连接后重试")
            } finally {
                I(!1)
            }
        }
    }, W = () => {
        var w, E, L;
        m(!1), (L = (E = (w = window.officeDock) == null ? void 0 : w.action) == null ? void 0 : E.call(w, "chat-file", n.id)) == null || L.catch(() => o("下载失败，请重试"))
    };
    return u.useEffect(() => {
        if (!d) return;
        const w = E => {
            var L;
            (L = g.current) != null && L.contains(E.target) || m(!1)
        };
        return document.addEventListener("pointerdown", w), () => document.removeEventListener("pointerdown", w)
    }, [d]), u.useEffect(() => {
        let w = !0,
            E = "";
        if (r(""), o(""), n.size > 20 * 1024 * 1024) {
            o("图片较大，请下载原图查看");
            return
        }
        return Le({
            kind: "load",
            account: t,
            conversation: s,
            file: n
        }).then(L => {
            !w || !L || (E = URL.createObjectURL(L), r(E))
        }).catch(L => {
            w && o(L instanceof Error ? L.message : "图片加载失败，请重新加载")
        }), () => {
            w = !1, E && URL.revokeObjectURL(E)
        }
    }, [t, s, n.id, n.size, f]), e.jsxs("div", {
        className: "dk-image-wrap",
        ref: g,
        onKeyDownCapture: w => {
            w.key === "Escape" && (d || h) && (w.preventDefault(), w.stopPropagation(), m(!1), k(!1))
        },
        children: [e.jsx("button", {
            className: "dk-image",
            type: "button",
            "aria-label": "查看图片",
            title: "点击查看大图，右键显示操作",
            onClick: () => c && !i ? k(!0) : m(w => !w),
            onContextMenu: w => {
                w.preventDefault(), w.stopPropagation(), m(!0)
            },
            children: c && !i ? e.jsx("img", {
                src: c,
                alt: "聊天图片",
                onError: () => o("图片无法预览")
            }) : e.jsx("span", {
                className: "dk-image-placeholder",
                children: i || "图片加载中…"
            })
        }), d && e.jsxs("div", {
            className: "dk-image-menu",
            role: "menu",
            "aria-label": "图片操作",
            children: [e.jsx("button", {
                type: "button",
                role: "menuitem",
                disabled: !c || !!i,
                onClick: () => {
                    m(!1), k(!0)
                },
                children: "查看大图"
            }), e.jsx("button", {
                type: "button",
                role: "menuitem",
                onClick: W,
                children: "下载原图"
            }), i && e.jsx("button", {
                type: "button",
                role: "menuitem",
                onClick: () => {
                    m(!1), b(w => w + 1)
                },
                children: "重新加载"
            }), e.jsx("button", {
                type: "button",
                role: "menuitem",
                onClick: () => m(!1),
                children: "取消"
            })]
        }), h && N && St.createPortal(e.jsxs("div", {
            className: "dk-image-viewer",
            role: "dialog",
            "aria-label": "图片预览",
            onClick: () => k(!1),
            children: [e.jsxs("div", {
                className: "dk-image-toolbar",
                onClick: w => w.stopPropagation(),
                children: [e.jsx("span", {
                    children: "图片预览"
                }), e.jsx("button", {
                    type: "button",
                    disabled: C,
                    onClick: () => void V(),
                    children: C ? "打开中…" : "全屏观看"
                }), e.jsx("button", {
                    type: "button",
                    onClick: W,
                    children: "下载原图"
                }), e.jsx("button", {
                    ref: R,
                    type: "button",
                    onClick: () => k(!1),
                    "aria-label": "关闭图片预览",
                    children: "×"
                })]
            }), j && e.jsx("p", {
                role: "alert",
                children: j
            }), e.jsx("img", {
                src: c,
                alt: "图片预览",
                onClick: w => w.stopPropagation()
            })]
        }), N)]
    })
}

