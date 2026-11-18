function In(n, e) {
    var k, O;
    const t = new Set,
        s = new Map;
    let r = !1,
        i = 0,
        o, a, f = () => {};
    const d = () => {
            Ce()
        },
        m = l => {
            l !== void 0 && a !== l || (o !== void 0 && window.clearInterval(o), o = void 0, a = void 0, f(), f = () => {})
        },
        _ = l => {
            m(), a = l;
            let v = 0;
            f = te(), o = window.setInterval(() => {
                if (r || ++v > bt) {
                    m();
                    return
                }
                f(), f = te()
            }, vt)
        },
        y = () => {
            m()
        };
    window.addEventListener("pointerdown", d, {
        once: !0
    }), window.addEventListener("keydown", d, {
        once: !0
    }), window.addEventListener("pointerdown", y), window.addEventListener("keydown", y), window.officeDesktop && Ce();
    const A = l => {
            m(), window.focus(), window.dispatchEvent(new CustomEvent("office-notification-open", {
                detail: l
            }))
        },
        E = (O = (k = window.officeDesktop) == null ? void 0 : k.onAlertOpen) == null ? void 0 : O.call(k, A);

    function b(l, v, h, c, u = !1) {
        if (r || t.has(l)) return;
        t.add(l), t.size > 500 && t.delete(t.values().next().value), u ? _(l) : Date.now() - i > 500 && (te(c === "chat", gt()), i = Date.now());
        const p = window.officeDesktop;
        if (!(u && (p != null && p.dockState) && (c === "call" || c === "meeting"))) {
            if (p != null && p.alert) {
                p.alert({
                    title: v,
                    body: h.slice(0, 220),
                    section: c,
                    urgent: u
                }).then(g => {
                    g !== !0 && I(v, h, l, c)
                }).catch(() => I(v, h, l, c));
                return
            }
            I(v, h, l, c)
        }
    }

    function I(l, v, h, c) {
        var u;
        if (!(!("Notification" in window) || Notification.permission !== "granted")) try {
            const p = new Notification(l, {
                body: v.slice(0, 160),
                tag: h,
                silent: !0
            });
            if (s.set(h, p), p.onclose = () => s.delete(h), p.onclick = () => {
                    var g, w;
                    (w = (g = window.officeDesktop) == null ? void 0 : g.focusWindow) == null || w.call(g), A(c), p.close()
                }, s.size > 20) {
                const g = s.keys().next().value;
                (u = s.get(g)) == null || u.close(), s.delete(g)
            }
        } catch {}
    }
    const L = l => {
            l.senderId !== e && b("chat:" + l.id, l.recipientId ? l.name + " 发来消息" : l.name + " · iruler", l.attachment ? "Sent a file: " + l.attachment.name : l.text, "chat")
        },
        N = l => b("call:" + l.id, l.name + " 找你", l.kind === "screen" ? "看屏幕和语音 · 点开看邀请" : "语音来电 · 点开看邀请", "call", !0),
        F = l => {
            var v, h, c, u;
            if (a != null && a.startsWith("meeting:")) {
                const p = a.slice(8),
                    g = l.invitations.some(w => w.id === p && w.members.some(q => q.id === e && q.status === "invited"));
                (((v = l.active) == null ? void 0 : v.id) === p || !g) && ((h = s.get(a)) == null || h.close(), m())
            }
            for (const p of l.invitations)((c = l.active) == null ? void 0 : c.id) !== p.id && ((u = p.members.find(g => g.id === e)) == null ? void 0 : u.status) === "invited" && b("meeting:" + p.id, "会议邀请", p.title, "meeting", !0)
        },
        B = l => {
            var v;
            m("call:" + l), (v = s.get("call:" + l)) == null || v.close()
        },
        P = l => {
            const v = typeof l == "string" ? l : l == null ? void 0 : l.id;
            B(v || ""), !(!v || typeof l == "string" || (l == null ? void 0 : l.reason) !== "timeout") && b("missed:" + v, "未接来电", "没打通，可以再试一次", "call")
        },
        S = () => {
            var l;
            a && ((l = s.get(a)) == null || l.close()), m()
        };
    return n.on("session", S), n.on("disconnect", S), n.on("chat", L), n.on("request", N), n.on("meeting-state", F), n.on("request-expired", P), () => {
        r = !0, m(), E == null || E(), window.removeEventListener("pointerdown", d), window.removeEventListener("keydown", d), window.removeEventListener("pointerdown", y), window.removeEventListener("keydown", y), n.off("session", S), n.off("disconnect", S), n.off("chat", L), n.off("request", N), n.off("meeting-state", F), n.off("request-expired", P);
        for (const l of s.values()) l.close();
        s.clear(), Y && (Y.close().catch(() => {}), Y = void 0)
    }
}

