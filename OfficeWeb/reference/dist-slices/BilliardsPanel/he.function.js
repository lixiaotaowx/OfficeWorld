function he({
    hall: t,
    client: r,
    tableId: i,
    myId: l,
    online: a,
    onClose: f
}) {
    const e = c.useSyncExternalStore(r.subscribe, () => r.snapshot(i)),
        [s, k] = c.useState(null),
        [p, h] = c.useState(!1),
        [w, E] = c.useState(""),
        [v, y] = c.useState("player"),
        [N, W] = c.useState({
            locked: !1,
            fallback: !1
        }),
        [g, D] = c.useState(!1),
        [$, A] = c.useState(""),
        [x, I] = c.useState(() => {
            try {
                return localStorage.getItem(Q) !== "off"
            } catch {
                return !0
            }
        }),
        S = c.useRef(null),
        C = c.useRef(!1),
        T = c.useRef(!0),
        q = c.useRef(!1),
        F = c.useRef(r);
    F.current = r;
    const G = e == null ? void 0 : e.players.find(n => n.id === l),
        V = e == null ? void 0 : e.players.find(n => n.id === e.turn),
        B = g && !!G && (e == null ? void 0 : e.turn) === l && (e == null ? void 0 : e.phase) === "ready" && a && !p;
    c.useEffect(() => {
        const n = new oe,
            o = () => n.unlock();
        n.setEnabled(x), S.current = n;
        const d = () => {
            const j = r.snapshot(i);
            j && n.update(j)
        };
        d();
        const m = r.subscribe(d);
        return window.addEventListener("pointerdown", o), window.addEventListener("keydown", o), () => {
            m(), window.removeEventListener("pointerdown", o), window.removeEventListener("keydown", o), S.current = null, n.dispose()
        }
    }, [r, i]), c.useEffect(() => {
        var n;
        (n = S.current) == null || n.setEnabled(x);
        try {
            localStorage.setItem(Q, x ? "on" : "off")
        } catch {}
    }, [x]);
    const R = c.useCallback(async n => {
        if (!C.current) {
            C.current = !0, h(!0), E("");
            try {
                await r.act(i, n)
            } catch (o) {
                T.current && E(o instanceof Error ? o.message : "操作没有完成，请重试")
            } finally {
                C.current = !1, T.current && h(!1)
            }
        }
    }, [r, i]);
    c.useEffect(() => {
        let n = !1;
        return T.current = !0, D(!1), A(""), q.current = !1, t.openBilliards(i).then(o => {
            if (!n) {
                if (!o) {
                    A("台球加载失败，请返回后重试");
                    return
                }
                D(!0), t.renderer.domElement.focus()
            }
        }).catch(() => {
            n || A("台球加载失败，请返回后重试")
        }), () => {
            n = !0, T.current = !1, t.closeBilliards(), q.current && F.current.act(i, {
                action: "leave"
            }).catch(() => {})
        }
    }, [t, i]), c.useEffect(() => (t.onBilliardsClose = f, () => {
        t.onBilliardsClose = () => {}
    }), [t, f]), c.useEffect(() => {
        const n = () => W({
            locked: t.billiardsMouseLocked,
            fallback: t.billiardsMouseFallback
        });
        return t.onBilliardsMouseChange = n, n(), () => {
            t.onBilliardsMouseChange = () => {}
        }
    }, [t]), c.useEffect(() => {
        g && a && l && (q.current = !0, R({
            action: "join"
        }))
    }, [g, a, l, R]), c.useEffect(() => {
        const n = t.billiards;
        if (!g || !n) return;
        n.canShoot = B, n.power = 0;
        const o = t.renderer.domElement;
        let d = null;
        const m = () => {
                d && (cancelAnimationFrame(d.frame), d = null), k(null), n.power = 0
            },
            j = u => {
                if (!B || d) return;
                d = {
                    start: performance.now(),
                    frame: 0,
                    pointer: u
                };
                const z = () => {
                    d && (n.power = Math.min(1, Math.max(.03, (performance.now() - d.start) / J)), k(n.power), d.frame = requestAnimationFrame(z))
                };
                z()
            },
            H = u => {
                if (!d || d.pointer !== u) return;
                const z = Math.min(1, Math.max(.03, (performance.now() - d.start) / J));
                m(), B && e && R({
                    action: "shoot",
                    ...n.direction(),
                    power: z,
                    turnToken: e.turnToken
                })
            },
            O = u => {
                if (u.button === 0 && !(document.documentElement.classList.contains("officeworld-desktop") && !document.documentElement.classList.contains("officeworld-fullscreen") && u.clientY < 52)) {
                    if (t.billiardsView === "player" && !t.billiardsMouseLocked && !t.billiardsMouseFallback) {
                        u.preventDefault(), t.captureBilliardsMouse();
                        return
                    }
                    B && (u.preventDefault(), o.focus(), t.billiardsMouseLocked || o.setPointerCapture(u.pointerId), j(u.pointerId))
                }
            },
            X = u => {
                u.button === 0 && H(u.pointerId)
            },
            Y = u => {
                u.code === "Space" && u.target === o && (u.preventDefault(), u.repeat || j(null))
            },
            _ = u => {
                u.code === "Space" && (d == null ? void 0 : d.pointer) === null && (u.preventDefault(), H(null))
            },
            K = () => {
                document.hidden && m()
            },
            U = () => {
                document.pointerLockElement !== o && m()
            };
        return o.addEventListener("pointerdown", O), o.addEventListener("pointerup", X), o.addEventListener("pointercancel", m), o.addEventListener("lostpointercapture", m), window.addEventListener("blur", m), window.addEventListener("keydown", Y), window.addEventListener("keyup", _), document.addEventListener("visibilitychange", K), document.addEventListener("pointerlockchange", U), () => {
            m(), n.canShoot = !1, o.removeEventListener("pointerdown", O), o.removeEventListener("pointerup", X), o.removeEventListener("pointercancel", m), o.removeEventListener("lostpointercapture", m), window.removeEventListener("blur", m), window.removeEventListener("keydown", Y), window.removeEventListener("keyup", _), document.removeEventListener("visibilitychange", K), document.removeEventListener("pointerlockchange", U)
        }
    }, [t, i, g, B, e == null ? void 0 : e.turnToken, R, v]);
    const ee = v === "player" && !N.locked ? N.fallback ? "鼠标停在左右边缘可继续转动" : "点击画面进入游戏模式 · Esc 释放鼠标" : "",
        P = w || (a ? p ? "正在同步…" : e ? e.phase === "finished" ? e.message : e.phase === "rolling" ? "球正在滚动…" : V && V.id !== l ? "轮到 " + V.name : ee : "正在加入球桌…" : "连接已断开，正在重连…");
    return g ? b.jsxs("section", {
        className: "hall-billiards-panel",
        "aria-label": "台球操作",
        children: [b.jsx("p", {
            className: "hall-billiards-hint",
            children: "长按鼠标左键蓄力 · 松开击球"
        }), s !== null && b.jsx("div", {
            className: "hall-billiards-power",
            role: "progressbar",
            "aria-label": "击球力度",
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            "aria-valuenow": Math.round(s * 100),
            children: b.jsx("i", {
                style: {
                    transform: "scaleX(" + s + ")"
                }
            })
        }), P && b.jsx("p", {
            className: "hall-billiards-status" + (w ? " error" : ""),
            role: w ? "alert" : "status",
            children: P
        }), b.jsxs("div", {
            className: "hall-billiards-actions",
            children: [b.jsx("button", {
                type: "button",
                onClick: f,
                children: "返回大厅"
            }), b.jsx("button", {
                type: "button",
                disabled: !G || !a || p || (e == null ? void 0 : e.phase) === "rolling" || (e == null ? void 0 : e.phase) !== "finished" && (e == null ? void 0 : e.players.length) !== 1,
                onClick: () => void R({
                    action: "reset"
                }),
                children: "重新摆球"
            }), b.jsx("button", {
                type: "button",
                "aria-label": "台球音效",
                "aria-pressed": x,
                onClick: () => {
                    var o, d;
                    const n = !x;
                    (o = S.current) == null || o.setEnabled(n), n && ((d = S.current) == null || d.unlock()), I(n)
                },
                children: x ? "关闭音效" : "开启音效"
            }), b.jsx("button", {
                type: "button",
                className: "hall-billiards-view",
                "aria-label": v === "overhead" ? "切换到真人视角" : "切换到俯视视角",
                title: v === "overhead" ? "真人视角：左右移动鼠标瞄准" : "俯视视角：查看整张球桌",
                onClick: () => {
                    const n = v === "overhead" ? "player" : "overhead";
                    t.setBilliardsView(n), y(n)
                },
                children: v === "overhead" ? "真人视角" : "俯视视角"
            })]
        })]
    }) : b.jsx(re, {
        onClose: f,
        error: $
    })
}
export {
    he as
    default
};