import {
    j as s,
    r as n
} from "./dockGreeting-B1Y_WK0D.js";
import {
    L as j
} from "./LiveLookPreview-Cnc9VF1m.js";
import {
    S as b,
    z as d,
    y as u,
    x,
    a as f,
    r as h
} from "./chatLocal-Dk4Cw6Bt.js";
import "./portraitLighting-DB1r9t74.js";
const k = "20260928-fit";

function m(e) {
    return `/assets/characters/thumbnails/${e}.png?v=${k}`
}

function p({
    value: e,
    size: i = "large",
    face: r = !1
}) {
    return i === "large" ? s.jsx(j, {
        value: e,
        face: r
    }) : s.jsx("span", {
        className: "look-preview small",
        "data-color": e.color,
        children: s.jsx("img", {
            src: m(`full-${e.color}`),
            alt: "",
            draggable: !1
        })
    })
}

function N({
    value: e,
    onChange: i
}) {
    const [r, l] = n.useState("hair");

    function o(a, c) {
        i({
            ...e,
            accessories: {
                ...e.accessories,
                [a]: c
            }
        })
    }
    return s.jsxs("div", {
        className: "accessory-list",
        role: "group",
        "aria-label": "选配饰",
        children: [s.jsx("div", {
            className: "accessory-tabs",
            "aria-label": "配饰种类",
            children: b.map(a => s.jsx("button", {
                "aria-pressed": r === a,
                className: r === a ? "chosen" : "",
                onClick: () => l(a),
                children: d[a]
            }, a))
        }), [r].map(a => s.jsxs("section", {
            className: "accessory-row",
            children: [s.jsx("span", {
                className: "accessory-slot",
                children: d[a]
            }), s.jsx("div", {
                className: "accessory-grid",
                role: "listbox",
                "aria-label": d[a],
                children: u[a].map(c => s.jsxs("button", {
                    type: "button",
                    role: "option",
                    "aria-selected": e.accessories[a] === c.id,
                    className: e.accessories[a] === c.id ? "chosen" : "",
                    onClick: () => o(a, c.id),
                    title: c.label,
                    children: [c.mesh ? s.jsx("img", {
                        src: m(`wear-${a}-${c.id}`),
                        alt: "",
                        draggable: !1
                    }) : s.jsx("i", {
                        className: "none-mark",
                        "aria-hidden": "true",
                        children: "—"
                    }), s.jsx("span", {
                        children: c.label
                    })]
                }, c.id))
            })]
        }, a))]
    })
}

function g({
    value: e,
    onChange: i
}) {
    return s.jsx("div", {
        className: "color-grid",
        role: "listbox",
        "aria-label": "选颜色",
        children: x.map(r => s.jsxs("button", {
            type: "button",
            role: "option",
            "aria-selected": e.color === r.id,
            "aria-label": r.label,
            className: e.color === r.id ? "chosen" : "",
            onClick: () => i({
                ...e,
                color: r.id
            }),
            title: r.label,
            children: [s.jsx(p, {
                value: {
                    ...e,
                    color: r.id
                },
                size: "small"
            }), s.jsx("span", {
                children: r.label
            }), s.jsx("i", {
                className: "swatch",
                style: {
                    background: r.hex
                },
                "aria-hidden": "true"
            })]
        }, r.id))
    })
}

function y({
    value: e,
    onChange: i,
    footer: r
}) {
    var a;
    const [l, o] = n.useState("color");
    return s.jsxs("div", {
        className: "look-chooser",
        "data-step": l,
        "data-look": f(e),
        children: [s.jsxs("div", {
            className: "look-body",
            children: [s.jsxs("div", {
                className: "look-stage",
                children: [s.jsx(p, {
                    value: e,
                    size: "large",
                    face: l === "accessory"
                }), s.jsx("strong", {
                    children: (a = x.find(c => c.id === e.color)) == null ? void 0 : a.label
                }), s.jsx("small", {
                    children: "现在的样子 · 实时预览"
                })]
            }), s.jsxs("div", {
                className: "look-options",
                children: [s.jsxs("div", {
                    className: "look-steps",
                    role: "tablist",
                    "aria-label": "形象设置步骤",
                    children: [s.jsx("button", {
                        type: "button",
                        role: "tab",
                        "aria-selected": l === "color",
                        className: l === "color" ? "chosen" : "",
                        onClick: () => o("color"),
                        children: "1 颜色"
                    }), s.jsx("button", {
                        type: "button",
                        role: "tab",
                        "aria-selected": l === "accessory",
                        className: l === "accessory" ? "chosen" : "",
                        onClick: () => o("accessory"),
                        children: "2 配饰"
                    })]
                }), l === "color" ? s.jsx(g, {
                    value: e,
                    onChange: i
                }) : s.jsx(N, {
                    value: e,
                    onChange: i
                })]
            })]
        }), r == null ? void 0 : r(l, o)]
    })
}

function v({
    account: e,
    appearance: i,
    onAppearance: r
}) {
    const [l, o] = n.useState(() => e.lookConfirmed !== !0), [a, c] = n.useState(() => h(i)), t = n.useRef(e.lookConfirmed === !0);
    return n.useEffect(() => {
        e.lookConfirmed === !0 && (t.current = !0, o(!1))
    }, [e.lookConfirmed]), !l || t.current ? null : s.jsxs("div", {
        className: "seat-picker-hint",
        role: "dialog",
        "aria-label": "挑一个形象",
        children: [s.jsx("strong", {
            children: "挑一个你自己的形象"
        }), s.jsx("p", {
            children: "先挑颜色，再挑眼镜、发型、胡子和帽子。以后可以在 设置 → 我的形象 里改。"
        }), s.jsx(y, {
            value: a,
            onChange: c
        }), s.jsx("div", {
            className: "hint-actions",
            children: s.jsx("button", {
                className: "primary",
                onClick: () => {
                    t.current = !0, o(!1), r(h(a))
                },
                children: "好了，进去吧"
            })
        })]
    })
}
export {
    v as
    default
};