function T6(r) {
    var i, n;
    const e = _.useRef(null),
        t = _.useRef(null),
        s = _.useId();
    return _.useEffect(() => {
        var o, a;
        (a = (o = t.current) == null ? void 0 : o.scrollTo) == null || a.call(o, 0, 0)
    }, [r.page]), _.useEffect(() => {
        const o = l => {
                l.key === "Escape" && (l.stopPropagation(), r.onClose())
            },
            a = l => {
                e.current && !e.current.contains(l.target) && r.onClose()
            };
        return window.addEventListener("keydown", o, !0), document.addEventListener("pointerdown", a, !0), () => {
            window.removeEventListener("keydown", o, !0), document.removeEventListener("pointerdown", a, !0)
        }
    }, [r.onClose]), y.jsxs("section", {
        ref: e,
        className: "hall-sheet",
        role: "dialog",
        "aria-label": "设置",
        onKeyDown: o => o.stopPropagation(),
        onPointerDown: o => o.stopPropagation(),
        children: [y.jsxs("header", {
            className: "settings-header",
            children: [y.jsxs("div", {
                children: [y.jsx("strong", {
                    children: "设置"
                }), y.jsx("small", {
                    children: "个人偏好与工作空间"
                })]
            }), y.jsx("button", {
                type: "button",
                "aria-label": "关闭设置",
                onClick: r.onClose,
                children: y.jsx("svg", {
                    viewBox: "0 0 24 24",
                    width: "15",
                    height: "15",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    children: y.jsx("path", {
                        d: "M6 6l12 12M18 6 6 18"
                    })
                })
            })]
        }), y.jsx("nav", {
            className: "tabs",
            role: "tablist",
            "aria-label": "设置分类",
            children: wt.map(([o, a], l) => y.jsxs("button", {
                type: "button",
                role: "tab",
                id: `${s}-${o}`,
                "aria-controls": `${s}-panel`,
                tabIndex: r.page === o ? 0 : -1,
                "aria-selected": r.page === o,
                onClick: () => r.onPage(o),
                onKeyDown: A => {
                    var u;
                    const c = A.key === "ArrowRight" || A.key === "ArrowDown" ? 1 : A.key === "ArrowLeft" || A.key === "ArrowUp" ? -1 : 0;
                    if (!c && A.key !== "Home" && A.key !== "End") return;
                    A.preventDefault();
                    const h = A.key === "Home" ? 0 : A.key === "End" ? wt.length - 1 : (l + c + wt.length) % wt.length;
                    r.onPage(wt[h][0]), (u = document.getElementById(`${s}-${wt[h][0]}`)) == null || u.focus()
                },
                children: [y.jsx("svg", {
                    "aria-hidden": "true",
                    viewBox: "0 0 24 24",
                    width: "18",
                    height: "18",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "1.7",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: y.jsx("path", {
                        d: a4[o].icon
                    })
                }), a]
            }, o))
        }), y.jsxs("div", {
            ref: t,
            className: "pane",
            role: "tabpanel",
            id: `${s}-panel`,
            "aria-labelledby": `${s}-${r.page}`,
            tabIndex: 0,
            children: [y.jsxs("div", {
                className: "settings-page-heading",
                children: [y.jsx("h3", {
                    children: (i = wt.find(([o]) => o === r.page)) == null ? void 0 : i[1]
                }), y.jsx("p", {
                    children: a4[r.page].description
                })]
            }), r.page === "look" && y.jsx(D6, {
                value: r.appearance,
                onChange: r.onAppearance
            }), r.page === "notify" && y.jsx(L6, {}), r.page === "files" && y.jsx(R6, {}), r.page === "screen" && y.jsx(F6, {
                office: r.office
            }), r.page === "view" && y.jsxs(y.Fragment, {
                children: [y.jsxs(G0, {
                    title: "3D 画面",
                    children: [y.jsx(sn, {
                        label: "暂停 3D 渲染",
                        sub: "语音、共享和聊天不受影响",
                        checked: r.paused,
                        onChange: r.onPaused
                    }), y.jsx(g0, {
                        label: "渲染画质",
                        sub: "高画质增加环境光、接触阴影和抗锯齿；标准模式更省显存",
                        children: y.jsxs("select", {
                            "aria-label": "渲染画质",
                            value: r.quality,
                            onChange: o => r.onQuality(o.target.value === "standard" ? "standard" : "high"),
                            children: [y.jsx("option", {
                                value: "high",
                                children: "高画质"
                            }), y.jsx("option", {
                                value: "standard",
                                children: "标准"
                            })]
                        })
                    }), y.jsx("p", {
                        className: "settings-note",
                        children: "隐藏或最小化窗口后暂停绘制，30 秒后释放 3D 显存；返回时恢复画面。聊天和通话继续运行。"
                    }), y.jsx(g0, {
                        label: "时间",
                        sub: r.timeTip,
                        children: y.jsx("button", {
                            type: "button",
                            onClick: r.onTime,
                            children: "切换"
                        })
                    })]
                }), ((n = window.officeDesktop) == null ? void 0 : n.windowAction) && y.jsx(U6, {
                    act: window.officeDesktop.windowAction
                }), y.jsx(G0, {
                    title: "快捷键",
                    children: y.jsx("dl", {
                        className: "keys",
                        children: k6.map(([o, a]) => y.jsxs("div", {
                            style: {
                                display: "contents"
                            },
                            children: [y.jsx("dt", {
                                children: o
                            }), y.jsx("dd", {
                                children: a.split(" / ").map((l, A) => y.jsxs("span", {
                                    children: [A ? " / " : "", y.jsx("kbd", {
                                        children: l
                                    })]
                                }, l))
                            })]
                        }, o))
                    })
                })]
            }), r.page === "account" && y.jsx(N6, {
                ...r
            })]
        })]
    })
}

