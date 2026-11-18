var Ge = Object.defineProperty;
var Qe = (n, e, t) => e in n ? Ge(n, e, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: t
}) : n[e] = t;
var V = (n, e, t) => Qe(n, typeof e != "symbol" ? e + "" : e, t);
import {
    f as Ze,
    o as et,
    g as tt,
    u as nt,
    l as Ee,
    m as st,
    P as rt,
    h as Se,
    A as it,
    i as J,
    C as oe,
    W as ot,
    j as K,
    d as at,
    t as Ae,
    b as ct,
    F as ht,
    k as Te,
    B as Oe,
    n as ft,
    p as lt,
    q as ut,
    v as dt,
    w as pt
} from "./chatLocal-Dk4Cw6Bt.js";

function Nn(n) {
    const e = new Map,
        t = new Set;
    return {
        snapshot: s => e.get(s) || null,
        states: () => e,
        subscribe: s => (t.add(s), () => {
            t.delete(s)
        }),
        receive: s => {
            "removed" in s ? e.delete(s.tableId) : e.set(s.tableId, s), t.forEach(r => r())
        },
        async act(s, r) {
            const i = n.current;
            if (!(i != null && i.connected)) throw Error("连接已断开，请等重新连接后再试");
            let o;
            try {
                o = await i.timeout(6e3).emitWithAck("billiards-action", {
                    ...r,
                    tableId: s
                })
            } catch {
                throw i.emit("billiards-sync"), Error("操作没有确认，请等待球桌同步后再试")
            }
            if (!(o != null && o.ok)) throw Error((o == null ? void 0 : o.error) || "操作没有完成，请重试")
        }
    }
}
const mt = [
        ["default", "默认"],
        ["cat", "猫咪"],
        ["dog", "小狗"],
        ["bird", "小鸟"],
        ["duck", "鸭子"],
        ["rooster", "公鸡"],
        ["owl", "猫头鹰"],
        ["frog", "青蛙"],
        ["sheep", "绵羊"],
        ["cow", "奶牛"],
        ["horse", "小马"],
        ["pig", "小猪"],
        ["cricket", "蟋蟀"]
    ],
    Pe = "office-message-sound";

function gt() {
    var n;
    try {
        const e = window.localStorage.getItem(Pe);
        return ((n = mt.find(([t]) => t === e)) == null ? void 0 : n[0]) ?? "default"
    } catch {
        return "default"
    }
}

function Bn(n) {
    try {
        return window.localStorage.setItem(Pe, n), !0
    } catch {
        return !1
    }
}
const yt = {
    cat: {
        wave: "sawtooth",
        filter: 1500,
        syllables: [
            [0, .65, 420, 760, 290]
        ]
    },
    dog: {
        wave: "sawtooth",
        filter: 900,
        syllables: [
            [0, .16, 240, 320, 100],
            [.25, .2, 220, 300, 90]
        ]
    },
    bird: {
        wave: "sine",
        filter: 6e3,
        syllables: [
            [0, .12, 2200, 3600, 2700],
            [.18, .1, 2800, 4100, 3100],
            [.34, .16, 2300, 3500, 1900]
        ]
    },
    duck: {
        wave: "sawtooth",
        filter: 1800,
        syllables: [
            [0, .18, 420, 600, 260],
            [.24, .18, 400, 560, 240],
            [.48, .16, 380, 520, 230]
        ]
    },
    rooster: {
        wave: "sawtooth",
        filter: 2200,
        syllables: [
            [0, .12, 600, 800, 720],
            [.16, .13, 720, 950, 850],
            [.33, .13, 800, 1050, 940],
            [.49, .43, 940, 1100, 540]
        ]
    },
    owl: {
        wave: "sine",
        filter: 900,
        syllables: [
            [0, .28, 380, 460, 360],
            [.4, .42, 330, 400, 300]
        ]
    },
    frog: {
        wave: "square",
        filter: 650,
        tremolo: 35,
        syllables: [
            [0, .25, 130, 210, 90],
            [.35, .3, 120, 190, 80]
        ]
    },
    sheep: {
        wave: "sawtooth",
        filter: 1600,
        tremolo: 18,
        syllables: [
            [0, .72, 270, 430, 240]
        ]
    },
    cow: {
        wave: "sawtooth",
        filter: 500,
        syllables: [
            [0, .85, 95, 155, 85]
        ]
    },
    horse: {
        wave: "sawtooth",
        filter: 2400,
        tremolo: 12,
        syllables: [
            [0, .25, 500, 1200, 900],
            [.26, .55, 900, 1e3, 300]
        ]
    },
    pig: {
        wave: "sawtooth",
        filter: 750,
        tremolo: 28,
        syllables: [
            [0, .22, 110, 180, 90],
            [.32, .28, 120, 210, 80]
        ]
    },
    cricket: {
        wave: "sine",
        filter: 6500,
        tremolo: 50,
        syllables: [
            [0, .12, 4200, 4400, 4200],
            [.22, .12, 4200, 4400, 4200],
            [.44, .12, 4200, 4400, 4200]
        ]
    }
};

function wt(n, e) {
    const t = yt[e],
        s = [];
    for (const [r, i, o, a, f] of t.syllables) {
        const d = n.createOscillator(),
            m = n.createBiquadFilter(),
            _ = n.createGain(),
            y = n.currentTime + r,
            A = y + i;
        d.type = t.wave, d.frequency.setValueAtTime(o, y), d.frequency.exponentialRampToValueAtTime(a, y + i * .3), d.frequency.exponentialRampToValueAtTime(f, A), m.type = "lowpass", m.frequency.value = t.filter, m.Q.value = .7, _.gain.setValueAtTime(0, y), _.gain.linearRampToValueAtTime(.1, y + .015), _.gain.exponentialRampToValueAtTime(.001, A), d.connect(m), m.connect(_), _.connect(n.destination);
        let E, b;
        t.tremolo && (E = n.createOscillator(), b = n.createGain(), E.frequency.value = t.tremolo, b.gain.value = a * .045, E.connect(b), b.connect(d.frequency), E.start(y), E.stop(A)), d.onended = () => {
            d.disconnect(), m.disconnect(), _.disconnect(), E == null || E.disconnect(), b == null || b.disconnect()
        }, d.start(y), d.stop(A), s.push(() => {
            try {
                d.stop(), E == null || E.stop()
            } catch {}
        })
    }
    return () => s.forEach(r => r())
}
let Y;
async function Ce() {
    try {
        Y ?? (Y = new AudioContext);
        const n = Y.resume(),
            e = "Notification" in window && Notification.permission === "default" ? Notification.requestPermission() : Promise.resolve();
        await Promise.all([n, e])
    } catch {}
}

function te(n = !1, e = "default") {
    let t = !1,
        s, r = () => {};
    try {
        Y ?? (Y = new AudioContext);
        const i = Y;
        i.resume().then(() => {
            if (t || i.state !== "running") return;
            if (n && e !== "default") {
                r = wt(i, e);
                return
            }
            s = i.createOscillator();
            const o = i.createGain(),
                a = i.currentTime,
                f = [];
            if (n) {
                s.type = "sawtooth", s.frequency.setValueAtTime(230, a), s.frequency.linearRampToValueAtTime(280, a + .24), s.frequency.linearRampToValueAtTime(330, a + .48);
                for (const [m, _] of [
                        [500, 300],
                        [900, 2300],
                        [2400, 3e3]
                    ]) {
                    const y = i.createBiquadFilter();
                    y.type = "bandpass", y.Q.value = 5, y.frequency.setValueAtTime(m, a), y.frequency.setValueAtTime(m, a + .16), y.frequency.exponentialRampToValueAtTime(_, a + .33), s.connect(y), y.connect(o), f.push(y)
                }
            } else s.type = "sine", s.frequency.value = 660, s.connect(o);
            const d = n ? .6 : .2;
            o.gain.setValueAtTime(0, a), o.gain.linearRampToValueAtTime(n ? .16 : .12, a + .025), o.gain.setValueAtTime(n ? .16 : .12, a + (n ? .35 : .04)), o.gain.exponentialRampToValueAtTime(.001, a + d - .02), o.connect(i.destination), s.onended = () => {
                s == null || s.disconnect(), o.disconnect(), f.forEach(m => m.disconnect())
            }, s.start(a), s.stop(a + d)
        }).catch(() => {})
    } catch {}
    return () => {
        t = !0, r();
        try {
            s == null || s.stop()
        } catch {}
    }
}

function qn(n) {
    return te(!0, n)
}
const vt = 2e3,
    bt = 15;

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

function Ln(n, e, t, s, r = () => {}) {
    let i = !1,
        o = !1,
        a = "";
    const f = new Set;
    let d, m = [];
    const _ = new Map;
    let y = !1,
        A = !1,
        E = !1;
    const b = Ze(async () => {
        if (await B, !d || i) throw Error("本地存储用不了");
        return d
    });
    async function I() {
        if (!(y || i)) {
            y = !0;
            try {
                for (const [l, v] of _) {
                    if (i) break;
                    try {
                        await b(v), _.delete(l)
                    } catch (h) {
                        if (h instanceof it) {
                            _.delete(l);
                            continue
                        }!i && !E && (E = !0, s("有些附件还没存到这台电脑上，会自动重试；7 天内保持连接就能收到"))
                    }
                }
                _.size || (E = !1)
            } finally {
                y = !1
            }
        }
    }
    const L = () => {
        i || t(l => l.filter(v => Ee(e, v))), _.clear()
    };
    window.addEventListener("storage", L), window.addEventListener("office-chat-local", L);
    const N = l => {
            l = l.filter(v => Ee(e, v)), i || t(v => st(v, l));
            for (const v of l) {
                const h = v.attachment;
                !h || h.id.startsWith("direct-") || b.isGone(h.id) || h.size > rt || _.set(h.id, h)
            }
            I()
        },
        F = () => {
            i || s("聊天没能存在本地，检查一下浏览器的存储和权限。服务器会保留 7 天")
        },
        B = (async () => {
            var l, v;
            try {
                if (d = await et(e), i) {
                    d.close();
                    return
                }
                const h = await tt(d);
                a = h.cursor, N(h.messages), (v = (l = navigator.storage) == null ? void 0 : l.persist) == null || v.call(l).catch(() => !1)
            } catch {
                F()
            }
        })();
    async function P(l) {
        var v;
        if (await B, !i) {
            l.senderId !== e && ((v = l.mentions) != null && v.some(h => h.id === e)) && !f.has(l.id) && (f.add(l.id), f.size > 200 && f.delete(f.values().next().value), s(`${l.name}在群聊中 @ 了你`)), N([l]);
            try {
                if (!d) throw Error("存储用不了");
                await Se(d, [l])
            } catch {
                F()
            }
        }
    }
    async function S() {
        if (await B, !(i || o || !n.connected)) {
            o = !0;
            try {
                const l = await n.timeout(1e4).emitWithAck("chat-contacts");
                !i && (l != null && l.ok) && (m = l.contacts || [], r(m, Array.isArray(l.hidden) ? l.hidden : []));
                let v = a;
                do {
                    const h = await n.timeout(1e4).emitWithAck("chat-history", v);
                    if (i) return;
                    if (!h.ok) throw Error(h.error);
                    if (N(h.messages), d) try {
                        await Se(d, h.messages, h.cursor), a = h.cursor
                    } catch {
                        F();
                        return
                    }
                    if (v = h.cursor, !h.more) break
                } while (n.connected && !i)
            } catch {
                i || s("以前的消息还在取，连上后会继续")
            } finally {
                o = !1
            }
        }
    }
    n.on("chat", P), n.on("connect", S);
    const k = l => {
        i || !Array.isArray(l == null ? void 0 : l.hidden) || r(m, l.hidden)
    };
    n.on("chat-directory", k);
    const O = window.setInterval(() => {
        S(), I()
    }, 3e4);
    return {
        loadFile: b,
        async sendFile(l, v, h) {
            if (A) return s("等这个文件传完再说"), !1;
            A = !0;
            try {
                return await P(await nt(n, l, v, h)), !0
            } catch (c) {
                return n.emit("chat-file-cancel"), s(c instanceof Error ? c.message : "文件没发出去"), !1
            } finally {
                A = !1
            }
        },
        async send(l, v) {
            if (!n.connected) return s("断开了，连上再发"), !1;
            const h = {
                text: l,
                requestId: crypto.randomUUID(),
                recipientId: v
            };
            for (let c = 0; c < 2; c++) try {
                const u = await n.timeout(1e4).emitWithAck("chat", h);
                return u != null && u.ok ? (await P(u.message), !0) : (s((u == null ? void 0 : u.error) || "没发出去"), !1)
            } catch {
                if (!n.connected) break
            }
            return s("没收到送达确认，你的话还在输入框里，先看看聊天里有没有再重发"), !1
        },
        dispose() {
            i = !0, clearInterval(O), window.removeEventListener("storage", L), window.removeEventListener("office-chat-local", L), n.off("chat", P), n.off("connect", S), n.off("chat-directory", k), d == null || d.close()
        }
    }
}

function Mn(n, e) {
    return Object.keys(n).every(t => e.has(t)) ? n : Object.fromEntries(Object.entries(n).filter(([t]) => e.has(t)))
}

function Pn(n, e) {
    const t = Object.keys(e);
    return t.length !== Object.keys(n).length ? !1 : t.every(s => {
        const r = n[s],
            i = e[s];
        return r && r.voice === i.voice && r.connected === i.connected && r.sharing === i.sharing
    })
}
class _t extends Error {}
async function kt(n) {
    var o, a;
    const t = await (n.fetchImpl || fetch)(n.url, {
        credentials: "same-origin",
        ...n.timeoutMs ? {
            signal: AbortSignal.timeout(n.timeoutMs)
        } : {}
    });
    if (t.status === 404 || t.status === 410) throw new _t("The server copy has expired (7-day retention)");
    if (!t.ok) throw Error(`File download failed (HTTP ${t.status}). Try again.`);
    const s = Number(t.headers.get("content-length")) || 0;
    (o = n.onStart) == null || o.call(n, {
        declared: s
    });
    const r = (a = t.body) == null ? void 0 : a.getReader();
    if (!r) throw Error("This browser does not support streaming downloads. Use the desktop client.");
    let i = 0;
    for (;;) {
        const {
            done: f,
            value: d
        } = await r.read();
        if (f) break;
        d != null && d.length && (await n.onChunk(d), i += d.length)
    }
    return {
        received: i,
        declared: s
    }
}

function Et(n) {
    async function e(s, r, i, o) {
        var m, _;
        const a = crypto.randomUUID(),
            f = String(o).split(/[\\/]/).pop() || "File";
        n.place({
            id: a,
            direction: "send",
            status: "sending",
            peerId: r,
            peerName: i || "Colleague",
            name: f,
            size: 0,
            transferred: 0,
            path: o,
            folder: "",
            url: "",
            error: "",
            at: Date.now(),
            endedAt: 0,
            handle: ""
        });
        let d;
        try {
            if (d = await ((m = n.bridge()) == null ? void 0 : m.sendOpen(o)), !(d != null && d.id)) throw Error("读不了这个文件");
            const y = n.row(a);
            y && (y.name = d.name || f, y.size = d.size || 0, y.path = d.path || o, y.handle = d.id), n.commit();
            const A = await s.timeout(2e4).emitWithAck("file-offer", {
                transferId: a,
                targetId: r,
                name: d.name,
                size: d.size
            });
            if (!(A != null && A.ok)) throw Error((A == null ? void 0 : A.error) || "文件没发出去");
            y && typeof A.attachmentId == "string" && (y.attachmentId = A.attachmentId);
            const E = [];
            for (let I = 0; I < d.size; I += oe) {
                const L = Math.min(oe, d.size - I),
                    N = await n.bridge().sendRead(d.id, I, L);
                if (!(N != null && N.length)) throw Error("读不了文件");
                const F = s.timeout(9e4).emitWithAck("file-chunk", {
                    transferId: a,
                    offset: I,
                    bytes: N
                }).then(B => {
                    if (!(B != null && B.ok)) throw Error((B == null ? void 0 : B.error) || "文件没发出去");
                    const P = n.row(a);
                    P && (P.transferred += N.length), n.soon(), n.taskbar()
                });
                for (F.catch(() => {}), E.push(F); E.length >= ot;) await E.shift()
            }
            await Promise.all(E);
            const b = await s.timeout(9e4).emitWithAck("file-end", {
                transferId: a
            });
            if (!(b != null && b.ok)) throw Error((b == null ? void 0 : b.error) || "对方没能存下文件");
            y && (y.status = "done", y.transferred = y.size, y.endedAt = Date.now()), n.notify(b.warning || `Sent to ${i||"Colleague"}: ${d.name}`)
        } catch (y) {
            const A = J(y);
            s.emit("file-cancel", {
                transferId: a,
                reason: A
            }), n.fail(a, A), n.notify(`Send failed: ${A}`)
        } finally {
            d != null && d.id && ((_ = n.bridge()) == null || _.sendClose(d.id).catch(() => {})), n.commit(), n.taskbar(), n.trim()
        }
    }
    async function t(s, r, i = "") {
        if (!s || !(r != null && r.length)) return;
        if (!n.bridge()) {
            n.notify("拖文件发送要用桌面客户端");
            return
        }
        const o = n.socket();
        if (!(o != null && o.connected)) {
            n.notify("断开了，文件没发出去");
            return
        }
        n.notify(`Sending ${r.length} files to ${i||"Colleague"}…`);
        for (const a of r.slice(0, 20)) {
            if (!o.connected) {
                n.notify("断开了，文件没发出去");
                return
            }
            try {
                await e(o, s, i, a)
            } catch (f) {
                n.notify(`Send failed: ${J(f)}`)
            }
        }
    }
    return {
        sendOne: e,
        sendFiles: t
    }
}

function St(n) {
    const e = `office-received-files:${n}`;
    let t = {};
    try {
        t = JSON.parse(localStorage.getItem(e) || "{}"), (!t || Array.isArray(t) || typeof t != "object") && (t = {})
    } catch {}
    return {
        get: s => t[s],
        save(s) {
            var i, o;
            let r = !1;
            for (const a of s) {
                if (a.status !== "done" || !a.path) continue;
                const f = a.attachmentId || a.id;
                ((i = t[f]) == null ? void 0 : i.path) === a.path && ((o = t[f]) == null ? void 0 : o.endedAt) === a.endedAt || (t[f] = {
                    ...a,
                    handle: "",
                    url: ""
                }, r = !0)
            }
            if (r) {
                t = Object.fromEntries(Object.entries(t).sort((a, f) => f[1].endedAt - a[1].endedAt).slice(0, 2e3));
                try {
                    localStorage.setItem(e, JSON.stringify(t))
                } catch {}
            }
        }
    }
}
const D = () => {
    var n;
    return (n = window.officeDesktop) == null ? void 0 : n.files
};

function Fn(n) {
    const e = St(n.accountId || "local");
    let t, s = [],
        r = [];
    const i = new Set,
        o = new Map,
        a = new Map;
    let f, d, m = -2;
    const _ = () => {
            if (e.save(s), !dt(r, s)) {
                r = s.map(h => ({
                    ...h
                }));
                for (const h of i) h()
            }
        },
        y = () => {
            f || (f = setTimeout(() => {
                f = void 0, _()
            }, ht))
        },
        A = () => {
            f && (clearTimeout(f), f = void 0), _()
        },
        E = h => s.find(c => c.id === h || c.attachmentId === h),
        b = h => E(h) || e.get(h);

    function I(h, c = !0) {
        s = c ? [h, ...s] : [...s, h], A()
    }

    function L() {
        const h = s.filter(u => !K(u));
        if (h.length <= Te) return;
        const c = new Set(h.slice(Te).map(u => u.id));
        s = s.filter(u => !c.has(u.id));
        for (const u of c) N(u)
    }

    function N(h) {
        const c = a.get(h);
        if (c) {
            try {
                URL.revokeObjectURL(c)
            } catch {}
            a.delete(h)
        }
        o.delete(h)
    }

    function F(h, c, u) {
        const p = URL.createObjectURL(new Blob(u, {
            type: "application/octet-stream"
        }));
        a.set(h, p);
        const g = document.createElement("a");
        return g.href = p, g.download = c, g.rel = "noopener", document.body.append(g), g.click(), g.remove(), p
    }

    function B() {
        const h = s.filter(K),
            c = u => {
                var p;
                u !== m && (m = u, (p = D()) == null || p.progress(u).catch(() => {}))
            };
        if (h.length) {
            d && (clearTimeout(d), d = void 0);
            const u = h.reduce((g, w) => g + Math.max(1, w.size), 0),
                p = h.reduce((g, w) => g + Math.min(w.transferred, w.size), 0);
            c(Math.max(0, Math.min(1, p / u)));
            return
        }
        m >= 0 && m < 1 && (c(1), d || (d = setTimeout(() => {
            d = void 0, c(-1)
        }, 1500)))
    }

    function P(h, c) {
        const u = E(h);
        u && (u.status = "failed", u.error = c, u.endedAt = Date.now(), A(), B())
    }

    function S(h, c) {
        var p, g;
        const u = E(h);
        u && (u.direction === "receive" && ((p = D()) == null || p.receiveCancel(h).catch(() => {})), u.handle && ((g = D()) == null || g.sendClose(u.handle).catch(() => {}), u.handle = ""), N(h), P(h, c), n.notify(c), L())
    }
    const k = Et({
        bridge: D,
        socket: () => t,
        place: h => I(h),
        row: E,
        fail: P,
        soon: y,
        commit: A,
        taskbar: B,
        trim: L,
        notify: n.notify
    });

    function O(h) {
        h.on("file-in", async (c, u) => {
            if (typeof u != "function") return;
            const p = String((c == null ? void 0 : c.transferId) || ""),
                g = String((c == null ? void 0 : c.name) || "File"),
                w = Number(c == null ? void 0 : c.size) || 0,
                q = String((c == null ? void 0 : c.fromName) || "Colleague");
            if (!p || E(p)) return u({
                ok: !1,
                error: "Duplicate transfer"
            });
            if (w < 1) return u({
                ok: !1,
                error: "Invalid file size"
            });
            const R = D();
            if (!R && w > Oe) return u({
                ok: !1,
                error: `浏览器最多只能收 ${ft(Oe)}，请对方用桌面客户端`
            });
            I({
                id: p,
                direction: "receive",
                status: "receiving",
                peerId: String((c == null ? void 0 : c.fromId) || ""),
                ...typeof(c == null ? void 0 : c.attachmentId) == "string" && /^direct-[a-z0-9-]+$/i.test(c.attachmentId) ? {
                    attachmentId: c.attachmentId
                } : {},
                peerName: q,
                name: g,
                size: w,
                transferred: 0,
                path: "",
                folder: "",
                url: "",
                error: "",
                at: Date.now(),
                endedAt: 0,
                handle: ""
            });
            try {
                if (R) {
                    const T = await R.receiveOpen({
                        transferId: p,
                        name: g,
                        size: w
                    });
                    if (!(T != null && T.ok)) throw Error((T == null ? void 0 : T.error) || "文件没收到");
                    const W = E(p);
                    W && (W.folder = T.folder || "")
                } else o.set(p, [])
            } catch (T) {
                const W = J(T);
                return h.emit("file-cancel", {
                    transferId: p,
                    reason: W
                }), S(p, W), u({
                    ok: !1,
                    error: W
                })
            }
            return u({
                ok: !0
            })
        }), h.on("file-in-part", async (c, u) => {
            if (typeof u != "function") return;
            const p = String((c == null ? void 0 : c.transferId) || ""),
                g = E(p);
            if (!g || g.status !== "receiving") return u({
                ok: !1,
                error: "传输过期了"
            });
            const w = await Ae(c == null ? void 0 : c.bytes);
            if (!w.length) {
                const R = lt(c == null ? void 0 : c.bytes);
                return u({
                    ok: !1,
                    error: R < 0 ? `Invalid file chunk (received ${ut(c==null?void 0:c.bytes)})` : "Invalid file chunk (zero length)"
                })
            }
            const q = D();
            try {
                if (q) {
                    const R = await q.receiveWrite(p, w);
                    if (!(R != null && R.ok)) throw Error((R == null ? void 0 : R.error) || "写不进收文件的文件夹");
                    g.transferred = Number(R.written) || g.transferred + w.length
                } else {
                    const R = o.get(p);
                    if (!R) throw Error("传输过期了");
                    R.push(w), g.transferred += w.length
                }
                return y(), B(), u({
                    ok: !0
                })
            } catch (R) {
                const T = J(R);
                return h.emit("file-cancel", {
                    transferId: p,
                    reason: T
                }), S(p, T), u({
                    ok: !1,
                    error: T
                })
            }
        }), h.on("file-in-end", async (c, u) => {
            if (typeof u != "function") return;
            const p = String((c == null ? void 0 : c.transferId) || ""),
                g = E(p);
            if (!g || g.status !== "receiving") return u({
                ok: !1,
                error: "传输过期了"
            });
            const w = D();
            try {
                if (!w) return g.url = F(p, g.name, o.get(p) || []), o.delete(p), g.status = "done", g.transferred = g.size, g.endedAt = Date.now(), A(), B(), L(), u({
                    ok: !0,
                    savedName: g.name
                });
                const q = await w.receiveEnd(p);
                if (!(q != null && q.ok)) throw Error((q == null ? void 0 : q.error) || "文件没存上");
                return g.status = "done", g.transferred = g.size, g.endedAt = Date.now(), g.path = q.path || "", g.folder = q.folder || g.folder, g.name = q.savedName || g.name, A(), B(), L(), u({
                    ok: !0,
                    path: g.path,
                    savedName: g.name
                })
            } catch (q) {
                const R = J(q);
                return h.emit("file-cancel", {
                    transferId: p,
                    reason: R
                }), S(p, R), u({
                    ok: !1,
                    error: R
                })
            }
        }), h.on("file-in-cancel", c => {
            const u = String((c == null ? void 0 : c.transferId) || ""),
                p = E(u);
            !p || !K(p) || S(u, String((c == null ? void 0 : c.reason) || "对方取消了传输"))
        })
    }

    function l(h) {
        t = h, O(h)
    }
    async function v(h) {
        var q;
        const c = String((h == null ? void 0 : h.id) || "");
        if (!c || !(h != null && h.url)) return;
        const u = E(c);
        if (u && K(u) || u && u.status === "done") return;
        u && (N(c), s = s.filter(R => R.id !== c));
        const p = Math.max(0, Number(h.size) || 0),
            g = D();
        I({
            id: c,
            direction: "receive",
            status: "receiving",
            peerId: "",
            peerName: "Chat",
            name: h.name || "File",
            size: p,
            transferred: 0,
            path: "",
            folder: "",
            url: "",
            error: "",
            at: Date.now(),
            endedAt: 0,
            handle: "",
            source: "chat"
        });
        const w = E(c);
        if (w) try {
            if (g) {
                const T = await g.receiveOpen({
                    transferId: c,
                    name: w.name,
                    size: p
                });
                if (!(T != null && T.ok)) throw Error((T == null ? void 0 : T.error) || "文件没存上");
                w.folder = T.folder || ""
            } else o.set(c, []);
            if (!(await kt({
                    url: h.url,
                    timeoutMs: ct(p),
                    onStart: ({
                        declared: T
                    }) => {
                        T && (w.size = T)
                    },
                    onChunk: async T => {
                        var W;
                        if (g) {
                            const j = await g.receiveWrite(c, T);
                            if (!(j != null && j.ok)) throw Error((j == null ? void 0 : j.error) || "写不进收文件的文件夹");
                            w.transferred = Number(j.written) || w.transferred + T.length
                        } else(W = o.get(c)) == null || W.push(T), w.transferred += T.length;
                        y(), B()
                    }
                })).received) throw Error("下载到的是空的，再试一次");
            if (g) {
                const T = await g.receiveEnd(c);
                if (!(T != null && T.ok)) throw Error((T == null ? void 0 : T.error) || "文件没存上");
                w.status = "done", w.transferred = w.size, w.endedAt = Date.now(), w.path = T.path || "", w.folder = T.folder || w.folder, w.name = T.savedName || w.name, A(), B(), L();
                return
            }
            w.url = F(c, w.name, o.get(c) || []), o.delete(c), w.status = "done", w.transferred = w.size, w.endedAt = Date.now(), A(), B(), L()
        } catch (R) {
            const T = J(R);
            g && ((q = D()) == null || q.receiveCancel(c).catch(() => {})), N(c), P(c, T), n.notify(`Download failed: ${T}`)
        }
    }
    return {
        lookup: b,
        async localImage(h) {
            const c = b(h),
                u = D();
            if (c != null && c.url) return (await fetch(c.url)).blob();
            if (!(c != null && c.path) || !u) throw Error("这台电脑没有该图片，请让对方重新发送");
            const p = await u.sendOpen(c.path);
            try {
                if (p.size > 20 * 1024 * 1024) throw Error("图片较大，请打开本地文件查看");
                const g = [];
                for (let w = 0; w < p.size; w += oe) {
                    const q = Math.min(oe, p.size - w),
                        R = await Ae(await u.sendRead(p.id, w, q));
                    if (R.byteLength !== q) throw Error("本地图片读取不完整，请确认文件未被移动或修改");
                    g.push(R)
                }
                return new Blob(g)
            } finally {
                await u.sendClose(p.id)
            }
        },
        async fileAction(h, c) {
            const u = b(h),
                p = D();
            if ((u == null ? void 0 : u.status) !== "done") throw Error("文件尚未保存到这台电脑");
            if (u.url && c === "open") {
                window.open(u.url, "_blank", "noopener");
                return
            }
            if (!p || !u.path) throw Error("打开文件夹需要桌面客户端");
            const g = await p.sendOpen(u.path);
            if (await p.sendClose(g.id), !await (c === "reveal" ? p.reveal(u.path) : p.open(u.path))) throw Error("无法打开，请确认文件仍在原位置")
        },
        attach: l,
        sendFiles: k.sendFiles,
        downloadAttachment: v,
        subscribe(h) {
            return i.add(h), () => {
                i.delete(h)
            }
        },
        snapshot: () => r,
        dockRows: (h = Date.now()) => at(s, h),
        open(h) {
            var u;
            const c = E(h);
            if (c) {
                if (c.url) {
                    window.open(c.url, "_blank", "noopener");
                    return
                }
                c.path && ((u = D()) == null || u.open(c.path).catch(() => {}))
            }
        },
        reveal(h) {
            var u, p;
            const c = E(h);
            c && (c.path ? (u = D()) == null || u.reveal(c.path).catch(() => {}) : c.folder && ((p = D()) == null || p.openFolder(c.folder).catch(() => {})))
        },
        cancel(h) {
            const c = E(h);
            !c || !K(c) || (t == null || t.emit("file-cancel", {
                transferId: h,
                reason: "Cancelled"
            }), S(h, "Cancelled"))
        },
        dismiss(h) {
            const c = E(h);
            c && (K(c) && (t == null || t.emit("file-cancel", {
                transferId: h,
                reason: "Cancelled"
            }), S(h, "Cancelled")), s = s.filter(u => u.id !== h), N(h), A())
        },
        dismissAll() {
            var h;
            for (const c of s) K(c) && (t == null || t.emit("file-cancel", {
                transferId: c.id,
                reason: "Cancelled"
            }));
            for (const c of s) N(c.id);
            s = [], A(), m = -2, (h = D()) == null || h.progress(-1).catch(() => {})
        }
    }
}

function Dn(n) {
    let e = {
            active: null,
            invitations: []
        },
        t = "断开了，等待重连",
        s = !1,
        r = !1,
        i = !1,
        o = !1,
        a = null,
        f = !1,
        d, m;
    const _ = () => n.onChange();

    function y() {
        m == null || m.off("meeting-state", b), m = void 0
    }

    function A() {
        var k, O, l;
        const S = i ? ((k = e.active) == null ? void 0 : k.room) ?? null : null;
        a !== S && (a = S, r = !1, S ? (t = "正在连会议语音…", (l = n.media()) == null || l.joinMeeting(S, o).then(v => {
            var h;
            a === S && (t = v ? "进入会议了" : "语音没连上，退出再进来试试", s = !!((h = n.media()) != null && h.meetingStatus().mic), _())
        })) : ((O = n.media()) == null || O.leaveMeeting(), s = !1)), e.active && !d && (d = setInterval(E, 1e3)), !e.active && d && (clearInterval(d), d = void 0)
    }

    function E() {
        var l;
        const S = (l = n.media()) == null ? void 0 : l.meetingStatus();
        if (!S) return;
        let k = !1;
        s !== S.mic && (s = S.mic, k = !0), r !== S.sharing && (r = S.sharing, k = !0);
        const O = S.connected ? "进入会议了" : "断开了，正在重连…";
        t !== O && (t = O, k = !0), k && _()
    }

    function b(S) {
        e = S, A(), _()
    }

    function I(S) {
        if (i = S, S) {
            const k = n.socket();
            k && m !== k && (y(), m = k, k.on("meeting-state", b), k.emit("meeting-sync")), A()
        } else y(), t = "断开了，等待重连", A();
        _()
    }
    async function L(S) {
        var l;
        const k = n.socket();
        if (!(k != null && k.connected)) throw Error("断开了，等重新连上");
        (S.action === "create" || S.action === "accept" || S.action === "huddle" || S.action === "join") && (o = S.microphone === !0, o && await ((l = n.media()) == null ? void 0 : l.prepareMic()));
        const O = await new Promise(v => {
            k.timeout(8e3).emit("meeting-action", S, (h, c) => v(h ? {
                ok: !1,
                error: "会议请求超时了，先看看会议列表再重试"
            } : c))
        });
        if (!(O != null && O.ok)) throw Error((O == null ? void 0 : O.error) || "会议操作没成功")
    }
    async function N(S, k) {
        var O, l, v, h;
        if (!f) {
            f = !0;
            try {
                const c = (O = n.media()) == null ? void 0 : O.meetingStatus();
                if (S === "mic") {
                    const p = k ?? !(c != null && c.mic);
                    await ((l = n.media()) == null ? void 0 : l.meetingMicrophone(p)), o = p
                } else await ((v = n.media()) == null ? void 0 : v.meetingScreen(k ?? !(c != null && c.sharing)));
                const u = (h = n.media()) == null ? void 0 : h.meetingStatus();
                s = !!(u != null && u.mic), r = !!(u != null && u.sharing)
            } finally {
                f = !1, _()
            }
        }
    }
    const F = () => {
            N("screen", !1)
        },
        B = () => {
            N("mic")
        },
        P = () => {
            N("screen")
        };
    return {
        act: L,
        stopShare: F,
        toggleMic: B,
        toggleShare: P,
        setConnected: I,
        dispose() {
            d && (clearInterval(d), d = void 0), y()
        },
        view() {
            return {
                ...e,
                act: L,
                status: t,
                mic: s,
                sharing: r,
                stopShare: F,
                toggleMic: B,
                toggleShare: P
            }
        }
    }
}

function Vn(n, e) {
    return [...n.filter(t => t.id !== e.id), e].slice(-5)
}

function Un(n, e = [], t = [], s = () => "") {
    const r = typeof n == "string" ? n : n == null ? void 0 : n.id,
        i = typeof n == "string" ? "cancelled" : n == null ? void 0 : n.reason;
    if (!r || i !== "timeout") return null;
    const o = e.find(f => f.id === r);
    if (o) {
        const f = s(o.target) || "对方";
        return {
            id: `${r}:unanswered`,
            kind: "unanswered",
            name: f,
            target: o.target,
            callKind: o.kind,
            title: "没打通，等一下再试",
            detail: `${f}没有接${o.kind==="screen"?"（看屏幕的邀请）":""}`
        }
    }
    const a = t.find(f => f.id === r);
    return a ? {
        id: `${r}:missed`,
        kind: "missed",
        name: a.name,
        target: a.from,
        callKind: a.kind,
        title: "未接来电",
        detail: `${a.name}找过你${a.kind==="screen"?"（看屏幕的邀请）":"（语音）"}`
    } : null
}

function zn(n, e) {
    return {
        async claimSeat(t) {
            const s = await new Promise(r => {
                const i = n.current;
                if (!i) return r({
                    ok: !1,
                    error: "还没连上"
                });
                i.timeout(6e3).emit("seat", t, (o, a) => {
                    r(o ? {
                        ok: !1,
                        error: "认领工位超时了"
                    } : a ?? {
                        ok: !1,
                        error: "认领工位没成功"
                    })
                })
            });
            return e(s.ok ? t === null ? "离开了工位" : `${t+1} 号工位是你的了` : s.error || "这张工位认领不了"), s.ok
        },
        async adminKick(t, s) {
            return new Promise(r => {
                const i = n.current;
                if (!i) return r({
                    ok: !1,
                    error: "还没连上"
                });
                i.timeout(6e3).emit("admin", {
                    password: s,
                    seat: t
                }, (o, a) => {
                    r(o ? {
                        ok: !1,
                        error: "管理员请求超时了"
                    } : a ?? {
                        ok: !1,
                        error: "管理员请求没成功"
                    })
                })
            })
        }
    }
}
const At = 1e4,
    Tt = 1e3,
    Ot = 2e3,
    Re = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"];

function Ct() {
    const n = typeof window > "u" ? void 0 : window.officeDesktop;
    return typeof(n == null ? void 0 : n.systemIdle) == "function" ? () => n.systemIdle() : void 0
}

function xn(n) {
    return n ? "按系统空闲时间判断（桌面客户端）" : "只看这个窗口里的键盘鼠标（浏览器）"
}

function Hn(n, e = {}) {
    const t = e.now ?? (() => Date.now()),
        s = e.awayAfterMs ?? At,
        r = e.target ?? (typeof document > "u" ? void 0 : document),
        i = e.setInterval ?? ((k, O) => setInterval(k, O)),
        o = e.clearInterval ?? (k => clearInterval(k));
    let a = t(),
        f = !0,
        d = !1,
        m = !1;
    const _ = new Set;
    let y = 0;
    const A = () => {
            const k = Math.floor(t() / 1e3);
            _.add(k);
            for (const O of _) O <= k - 10 && _.delete(O);
            _.size >= 6 && (y = t() + 8e3)
        },
        E = () => {
            n.connected && n.emit("input-state", {
                atDesk: f,
                busy: d,
                idleMs: Math.max(0, t() - a)
            })
        },
        b = k => {
            const O = k && t() < y;
            k === f && O === d || (f = k, d = O, E())
        },
        I = () => {
            A(), a = t(), b(!0)
        },
        L = () => b(t() - a < s),
        N = e.desktopIdle ?? Ct(),
        F = () => {
            N && Promise.resolve().then(N).then(k => {
                if (m || !k) return;
                const O = Number(k.seconds),
                    l = v => {
                        a = t() - Math.max(v, s), b(!1)
                    };
                if (k.state === "locked") return l(Number.isFinite(O) ? O * 1e3 : 0);
                Number.isFinite(O) && (O * 1e3 < s ? (O < 2 && (A(), _.add(Math.floor(t() / 1e3) - 1)), a = t() - O * 1e3, b(!0)) : l(O * 1e3))
            }).catch(() => {})
        };
    for (const k of Re) r == null || r.addEventListener(k, I, {
        passive: !0,
        capture: !0
    });
    const B = () => E();
    n.on("connect", B);
    const P = i(L, Tt),
        S = N ? i(F, Ot) : void 0;
    return {
        isAtDesk: () => f,
        usesSystemIdle: () => N !== void 0,
        touch: I,
        tick: L,
        poll: F,
        stop() {
            m = !0, o(P), S !== void 0 && o(S), n.off("connect", B);
            for (const k of Re) r == null || r.removeEventListener(k, I, {
                capture: !0
            })
        }
    }
}
const H = Object.create(null);
H.open = "0";
H.close = "1";
H.ping = "2";
H.pong = "3";
H.message = "4";
H.upgrade = "5";
H.noop = "6";
const ne = Object.create(null);
Object.keys(H).forEach(n => {
    ne[H[n]] = n
});
const de = {
        type: "error",
        data: "parser error"
    },
    Fe = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]",
    De = typeof ArrayBuffer == "function",
    Ve = n => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(n) : n && n.buffer instanceof ArrayBuffer,
    we = ({
        type: n,
        data: e
    }, t, s) => Fe && e instanceof Blob ? t ? s(e) : Ne(e, s) : De && (e instanceof ArrayBuffer || Ve(e)) ? t ? s(e) : Ne(new Blob([e]), s) : s(H[n] + (e || "")),
    Ne = (n, e) => {
        const t = new FileReader;
        return t.onload = function() {
            const s = t.result.split(",")[1];
            e("b" + (s || ""))
        }, t.readAsDataURL(n)
    };

function Be(n) {
    return n instanceof Uint8Array ? n : n instanceof ArrayBuffer ? new Uint8Array(n) : new Uint8Array(n.buffer, n.byteOffset, n.byteLength)
}
let he;

function Rt(n, e) {
    if (Fe && n.data instanceof Blob) return n.data.arrayBuffer().then(Be).then(e);
    if (De && (n.data instanceof ArrayBuffer || Ve(n.data))) return e(Be(n.data));
    we(n, !1, t => {
        he || (he = new TextEncoder), e(he.encode(t))
    })
}
const qe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    Q = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let n = 0; n < qe.length; n++) Q[qe.charCodeAt(n)] = n;
const Nt = n => {
        let e = n.length * .75,
            t = n.length,
            s, r = 0,
            i, o, a, f;
        n[n.length - 1] === "=" && (e--, n[n.length - 2] === "=" && e--);
        const d = new ArrayBuffer(e),
            m = new Uint8Array(d);
        for (s = 0; s < t; s += 4) i = Q[n.charCodeAt(s)], o = Q[n.charCodeAt(s + 1)], a = Q[n.charCodeAt(s + 2)], f = Q[n.charCodeAt(s + 3)], m[r++] = i << 2 | o >> 4, m[r++] = (o & 15) << 4 | a >> 2, m[r++] = (a & 3) << 6 | f & 63;
        return d
    },
    Bt = typeof ArrayBuffer == "function",
    ve = (n, e) => {
        if (typeof n != "string") return {
            type: "message",
            data: Ue(n, e)
        };
        const t = n.charAt(0);
        return t === "b" ? {
            type: "message",
            data: qt(n.substring(1), e)
        } : ne[t] ? n.length > 1 ? {
            type: ne[t],
            data: n.substring(1)
        } : {
            type: ne[t]
        } : de
    },
    qt = (n, e) => {
        if (Bt) {
            const t = Nt(n);
            return Ue(t, e)
        } else return {
            base64: !0,
            data: n
        }
    },
    Ue = (n, e) => {
        switch (e) {
            case "blob":
                return n instanceof Blob ? n : new Blob([n]);
            case "arraybuffer":
            default:
                return n instanceof ArrayBuffer ? n : n.buffer
        }
    },
    ze = "",
    It = (n, e) => {
        const t = n.length,
            s = new Array(t);
        let r = 0;
        n.forEach((i, o) => {
            we(i, !1, a => {
                s[o] = a, ++r === t && e(s.join(ze))
            })
        })
    },
    Lt = (n, e) => {
        const t = n.split(ze),
            s = [];
        for (let r = 0; r < t.length; r++) {
            const i = ve(t[r], e);
            if (s.push(i), i.type === "error") break
        }
        return s
    };

function Mt() {
    return new TransformStream({
        transform(n, e) {
            Rt(n, t => {
                const s = t.length;
                let r;
                if (s < 126) r = new Uint8Array(1), new DataView(r.buffer).setUint8(0, s);
                else if (s < 65536) {
                    r = new Uint8Array(3);
                    const i = new DataView(r.buffer);
                    i.setUint8(0, 126), i.setUint16(1, s)
                } else {
                    r = new Uint8Array(9);
                    const i = new DataView(r.buffer);
                    i.setUint8(0, 127), i.setBigUint64(1, BigInt(s))
                }
                n.data && typeof n.data != "string" && (r[0] |= 128), e.enqueue(r), e.enqueue(t)
            })
        }
    })
}
let fe;

function Z(n) {
    return n.reduce((e, t) => e + t.length, 0)
}

function ee(n, e) {
    if (n[0].length === e) return n.shift();
    const t = new Uint8Array(e);
    let s = 0;
    for (let r = 0; r < e; r++) t[r] = n[0][s++], s === n[0].length && (n.shift(), s = 0);
    return n.length && s < n[0].length && (n[0] = n[0].slice(s)), t
}

function Pt(n, e) {
    fe || (fe = new TextDecoder);
    const t = [];
    let s = 0,
        r = -1,
        i = !1;
    return new TransformStream({
        transform(o, a) {
            for (t.push(o);;) {
                if (s === 0) {
                    if (Z(t) < 1) break;
                    const f = ee(t, 1);
                    i = (f[0] & 128) === 128, r = f[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2
                } else if (s === 1) {
                    if (Z(t) < 2) break;
                    const f = ee(t, 2);
                    r = new DataView(f.buffer, f.byteOffset, f.length).getUint16(0), s = 3
                } else if (s === 2) {
                    if (Z(t) < 8) break;
                    const f = ee(t, 8),
                        d = new DataView(f.buffer, f.byteOffset, f.length),
                        m = d.getUint32(0);
                    if (m > Math.pow(2, 21) - 1) {
                        a.enqueue(de);
                        break
                    }
                    r = m * Math.pow(2, 32) + d.getUint32(4), s = 3
                } else {
                    if (Z(t) < r) break;
                    const f = ee(t, r);
                    a.enqueue(ve(i ? f : fe.decode(f), e)), s = 0
                }
                if (r === 0 || r > n) {
                    a.enqueue(de);
                    break
                }
            }
        }
    })
}
const xe = 4;

function M(n) {
    if (n) return Ft(n)
}

function Ft(n) {
    for (var e in M.prototype) n[e] = M.prototype[e];
    return n
}
M.prototype.on = M.prototype.addEventListener = function(n, e) {
    return this._callbacks = this._callbacks || {}, (this._callbacks["$" + n] = this._callbacks["$" + n] || []).push(e), this
};
M.prototype.once = function(n, e) {
    function t() {
        this.off(n, t), e.apply(this, arguments)
    }
    return t.fn = e, this.on(n, t), this
};
M.prototype.off = M.prototype.removeListener = M.prototype.removeAllListeners = M.prototype.removeEventListener = function(n, e) {
    if (this._callbacks = this._callbacks || {}, arguments.length == 0) return this._callbacks = {}, this;
    var t = this._callbacks["$" + n];
    if (!t) return this;
    if (arguments.length == 1) return delete this._callbacks["$" + n], this;
    for (var s, r = 0; r < t.length; r++)
        if (s = t[r], s === e || s.fn === e) {
            t.splice(r, 1);
            break
        } return t.length === 0 && delete this._callbacks["$" + n], this
};
M.prototype.emit = function(n) {
    this._callbacks = this._callbacks || {};
    for (var e = new Array(arguments.length - 1), t = this._callbacks["$" + n], s = 1; s < arguments.length; s++) e[s - 1] = arguments[s];
    if (t) {
        t = t.slice(0);
        for (var s = 0, r = t.length; s < r; ++s) t[s].apply(this, e)
    }
    return this
};
M.prototype.emitReserved = M.prototype.emit;
M.prototype.listeners = function(n) {
    return this._callbacks = this._callbacks || {}, this._callbacks["$" + n] || []
};
M.prototype.hasListeners = function(n) {
    return !!this.listeners(n).length
};
const ae = typeof Promise == "function" && typeof Promise.resolve == "function" ? e => Promise.resolve().then(e) : (e, t) => t(e, 0),
    U = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(),
    Dt = "arraybuffer";

function He(n, ...e) {
    return e.reduce((t, s) => (n.hasOwnProperty(s) && (t[s] = n[s]), t), {})
}
const Vt = U.setTimeout,
    Ut = U.clearTimeout;

function ce(n, e) {
    e.useNativeTimers ? (n.setTimeoutFn = Vt.bind(U), n.clearTimeoutFn = Ut.bind(U)) : (n.setTimeoutFn = U.setTimeout.bind(U), n.clearTimeoutFn = U.clearTimeout.bind(U))
}
const zt = 1.33;

function xt(n) {
    return typeof n == "string" ? Ht(n) : Math.ceil((n.byteLength || n.size) * zt)
}

function Ht(n) {
    let e = 0,
        t = 0;
    for (let s = 0, r = n.length; s < r; s++) e = n.charCodeAt(s), e < 128 ? t += 1 : e < 2048 ? t += 2 : e < 55296 || e >= 57344 ? t += 3 : (s++, t += 4);
    return t
}

function We() {
    return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5)
}

function Wt(n) {
    let e = "";
    for (let t in n) n.hasOwnProperty(t) && (e.length && (e += "&"), e += encodeURIComponent(t) + "=" + encodeURIComponent(n[t]));
    return e
}

function $t(n) {
    let e = {},
        t = n.split("&");
    for (let s = 0, r = t.length; s < r; s++) {
        let i = t[s].split("=");
        e[decodeURIComponent(i[0])] = decodeURIComponent(i[1])
    }
    return e
}
class jt extends Error {
    constructor(e, t, s) {
        super(e), this.description = t, this.context = s, this.type = "TransportError"
    }
}
class be extends M {
    constructor(e) {
        super(), this.writable = !1, ce(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64
    }
    onError(e, t, s) {
        return super.emitReserved("error", new jt(e, t, s)), this
    }
    open() {
        return this.readyState = "opening", this.doOpen(), this
    }
    close() {
        return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this
    }
    send(e) {
        this.readyState === "open" && this.write(e)
    }
    onOpen() {
        this.readyState = "open", this.writable = !0, super.emitReserved("open")
    }
    onData(e) {
        const t = ve(e, this.socket.binaryType);
        this.onPacket(t)
    }
    onPacket(e) {
        super.emitReserved("packet", e)
    }
    onClose(e) {
        this.readyState = "closed", super.emitReserved("close", e)
    }
    pause(e) {}
    createUri(e, t = {}) {
        return e + "://" + this._hostname() + this._port() + this.opts.path + this._query(t)
    }
    _hostname() {
        const e = this.opts.hostname;
        return e.indexOf(":") === -1 ? e : "[" + e + "]"
    }
    _port() {
        return this.opts.port && (this.opts.secure && Number(this.opts.port) !== 443 || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : ""
    }
    _query(e) {
        const t = Wt(e);
        return t.length ? "?" + t : ""
    }
}
class Kt extends be {
    constructor() {
        super(...arguments), this._polling = !1
    }
    get name() {
        return "polling"
    }
    doOpen() {
        this._poll()
    }
    pause(e) {
        this.readyState = "pausing";
        const t = () => {
            this.readyState = "paused", e()
        };
        if (this._polling || !this.writable) {
            let s = 0;
            this._polling && (s++, this.once("pollComplete", function() {
                --s || t()
            })), this.writable || (s++, this.once("drain", function() {
                --s || t()
            }))
        } else t()
    }
    _poll() {
        this._polling = !0, this.doPoll(), this.emitReserved("poll")
    }
    onData(e) {
        const t = s => {
            if (this.readyState === "opening" && s.type === "open" && this.onOpen(), s.type === "close") return this.onClose({
                description: "transport closed by the server"
            }), !1;
            this.onPacket(s)
        };
        Lt(e, this.socket.binaryType).forEach(t), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll())
    }
    doClose() {
        const e = () => {
            this.write([{
                type: "close"
            }])
        };
        this.readyState === "open" ? e() : this.once("open", e)
    }
    write(e) {
        this.writable = !1, It(e, t => {
            this.doWrite(t, () => {
                this.writable = !0, this.emitReserved("drain")
            })
        })
    }
    uri() {
        const e = this.opts.secure ? "https" : "http",
            t = this.query || {};
        return this.opts.timestampRequests !== !1 && (t[this.opts.timestampParam] = We()), !this.supportsBinary && !t.sid && (t.b64 = 1), this.createUri(e, t)
    }
}
let $e = !1;
try {
    $e = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest
} catch {}
const Yt = $e;

function Jt() {}
class Xt extends Kt {
    constructor(e) {
        if (super(e), typeof location < "u") {
            const t = location.protocol === "https:";
            let s = location.port;
            s || (s = t ? "443" : "80"), this.xd = typeof location < "u" && e.hostname !== location.hostname || s !== e.port
        }
    }
    doWrite(e, t) {
        const s = this.request({
            method: "POST",
            data: e
        });
        s.on("success", t), s.on("error", (r, i) => {
            this.onError("xhr post error", r, i)
        })
    }
    doPoll() {
        const e = this.request();
        e.on("data", this.onData.bind(this)), e.on("error", (t, s) => {
            this.onError("xhr poll error", t, s)
        }), this.pollXhr = e
    }
}
class x extends M {
    constructor(e, t, s) {
        super(), this.createRequest = e, ce(this, s), this._opts = s, this._method = s.method || "GET", this._uri = t, this._data = s.data !== void 0 ? s.data : null, this._create()
    }
    _create() {
        var e;
        const t = He(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
        t.xdomain = !!this._opts.xd;
        const s = this._xhr = this.createRequest(t);
        try {
            s.open(this._method, this._uri, !0);
            try {
                if (this._opts.extraHeaders) {
                    s.setDisableHeaderCheck && s.setDisableHeaderCheck(!0);
                    for (let r in this._opts.extraHeaders) this._opts.extraHeaders.hasOwnProperty(r) && s.setRequestHeader(r, this._opts.extraHeaders[r])
                }
            } catch {}
            if (this._method === "POST") try {
                s.setRequestHeader("Content-type", "text/plain;charset=UTF-8")
            } catch {}
            try {
                s.setRequestHeader("Accept", "*/*")
            } catch {}(e = this._opts.cookieJar) === null || e === void 0 || e.addCookies(s), "withCredentials" in s && (s.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (s.timeout = this._opts.requestTimeout), s.onreadystatechange = () => {
                var r;
                s.readyState === 3 && ((r = this._opts.cookieJar) === null || r === void 0 || r.parseCookies(s.getResponseHeader("set-cookie"))), s.readyState === 4 && (s.status === 200 || s.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
                    this._onError(typeof s.status == "number" ? s.status : 0)
                }, 0))
            }, s.send(this._data)
        } catch (r) {
            this.setTimeoutFn(() => {
                this._onError(r)
            }, 0);
            return
        }
        typeof document < "u" && (this._index = x.requestsCount++, x.requests[this._index] = this)
    }
    _onError(e) {
        this.emitReserved("error", e, this._xhr), this._cleanup(!0)
    }
    _cleanup(e) {
        if (!(typeof this._xhr > "u" || this._xhr === null)) {
            if (this._xhr.onreadystatechange = Jt, e) try {
                this._xhr.abort()
            } catch {}
            typeof document < "u" && delete x.requests[this._index], this._xhr = null
        }
    }
    _onLoad() {
        const e = this._xhr.responseText;
        e !== null && (this.emitReserved("data", e), this.emitReserved("success"), this._cleanup())
    }
    abort() {
        this._cleanup()
    }
}
x.requestsCount = 0;
x.requests = {};
if (typeof document < "u") {
    if (typeof attachEvent == "function") attachEvent("onunload", Ie);
    else if (typeof addEventListener == "function") {
        const n = "onpagehide" in U ? "pagehide" : "unload";
        addEventListener(n, Ie, !1)
    }
}

function Ie() {
    for (let n in x.requests) x.requests.hasOwnProperty(n) && x.requests[n].abort()
}
const Gt = function() {
    const n = je({
        xdomain: !1
    });
    return n && n.responseType !== null
}();
class Qt extends Xt {
    constructor(e) {
        super(e);
        const t = e && e.forceBase64;
        this.supportsBinary = Gt && !t
    }
    request(e = {}) {
        return Object.assign(e, {
            xd: this.xd
        }, this.opts), new x(je, this.uri(), e)
    }
}

function je(n) {
    const e = n.xdomain;
    try {
        if (typeof XMLHttpRequest < "u" && (!e || Yt)) return new XMLHttpRequest
    } catch {}
    if (!e) try {
        return new U[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP")
    } catch {}
}
const Ke = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Zt extends be {
    get name() {
        return "websocket"
    }
    doOpen() {
        const e = this.uri(),
            t = this.opts.protocols,
            s = Ke ? {} : He(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
        this.opts.extraHeaders && (s.headers = this.opts.extraHeaders);
        try {
            this.ws = this.createSocket(e, t, s)
        } catch (r) {
            return this.emitReserved("error", r)
        }
        this.ws.binaryType = this.socket.binaryType, this.addEventListeners()
    }
    addEventListeners() {
        this.ws.onopen = () => {
            this.opts.autoUnref && this.ws._socket.unref(), this.onOpen()
        }, this.ws.onclose = e => this.onClose({
            description: "websocket connection closed",
            context: e
        }), this.ws.onmessage = e => this.onData(e.data), this.ws.onerror = e => this.onError("websocket error", e)
    }
    write(e) {
        this.writable = !1;
        for (let t = 0; t < e.length; t++) {
            const s = e[t],
                r = t === e.length - 1;
            we(s, this.supportsBinary, i => {
                try {
                    this.doWrite(s, i)
                } catch {}
                r && ae(() => {
                    this.writable = !0, this.emitReserved("drain")
                }, this.setTimeoutFn)
            })
        }
    }
    doClose() {
        typeof this.ws < "u" && (this.ws.onerror = () => {}, this.ws.close(), this.ws = null)
    }
    uri() {
        const e = this.opts.secure ? "wss" : "ws",
            t = this.query || {};
        return this.opts.timestampRequests && (t[this.opts.timestampParam] = We()), this.supportsBinary || (t.b64 = 1), this.createUri(e, t)
    }
}
const le = U.WebSocket || U.MozWebSocket;
class en extends Zt {
    createSocket(e, t, s) {
        return Ke ? new le(e, t, s) : t ? new le(e, t) : new le(e)
    }
    doWrite(e, t) {
        this.ws.send(t)
    }
}
class tn extends be {
    get name() {
        return "webtransport"
    }
    doOpen() {
        try {
            this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name])
        } catch (e) {
            return this.emitReserved("error", e)
        }
        this._transport.closed.then(() => {
            this.onClose()
        }).catch(e => {
            this.onError("webtransport error", e)
        }), this._transport.ready.then(() => {
            this._transport.createBidirectionalStream().then(e => {
                const t = Pt(Number.MAX_SAFE_INTEGER, this.socket.binaryType),
                    s = e.readable.pipeThrough(t).getReader(),
                    r = Mt();
                r.readable.pipeTo(e.writable), this._writer = r.writable.getWriter();
                const i = () => {
                    s.read().then(({
                        done: a,
                        value: f
                    }) => {
                        a || (this.onPacket(f), i())
                    }).catch(a => {})
                };
                i();
                const o = {
                    type: "open"
                };
                this.query.sid && (o.data = `{"sid":"${this.query.sid}"}`), this._writer.write(o).then(() => this.onOpen())
            })
        })
    }
    write(e) {
        this.writable = !1;
        for (let t = 0; t < e.length; t++) {
            const s = e[t],
                r = t === e.length - 1;
            this._writer.write(s).then(() => {
                r && ae(() => {
                    this.writable = !0, this.emitReserved("drain")
                }, this.setTimeoutFn)
            })
        }
    }
    doClose() {
        var e;
        (e = this._transport) === null || e === void 0 || e.close()
    }
}
const nn = {
        websocket: en,
        webtransport: tn,
        polling: Qt
    },
    sn = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
    rn = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];

function pe(n) {
    if (n.length > 8e3) throw "URI too long";
    const e = n,
        t = n.indexOf("["),
        s = n.indexOf("]");
    t != -1 && s != -1 && (n = n.substring(0, t) + n.substring(t, s).replace(/:/g, ";") + n.substring(s, n.length));
    let r = sn.exec(n || ""),
        i = {},
        o = 14;
    for (; o--;) i[rn[o]] = r[o] || "";
    return t != -1 && s != -1 && (i.source = e, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = on(i, i.path), i.queryKey = an(i, i.query), i
}

function on(n, e) {
    const t = /\/{2,9}/g,
        s = e.replace(t, "/").split("/");
    return (e.slice(0, 1) == "/" || e.length === 0) && s.splice(0, 1), e.slice(-1) == "/" && s.splice(s.length - 1, 1), s
}

function an(n, e) {
    const t = {};
    return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
        r && (t[r] = i)
    }), t
}
const me = typeof addEventListener == "function" && typeof removeEventListener == "function",
    se = [];
me && addEventListener("offline", () => {
    se.forEach(n => n())
}, !1);
class $ extends M {
    constructor(e, t) {
        if (super(), this.binaryType = Dt, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, e && typeof e == "object" && (t = e, e = null), e) {
            const s = pe(e);
            t.hostname = s.host, t.secure = s.protocol === "https" || s.protocol === "wss", t.port = s.port, s.query && (t.query = s.query)
        } else t.host && (t.hostname = pe(t.host).host);
        ce(this, t), this.secure = t.secure != null ? t.secure : typeof location < "u" && location.protocol === "https:", t.hostname && !t.port && (t.port = this.secure ? "443" : "80"), this.hostname = t.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = t.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, t.transports.forEach(s => {
            const r = s.prototype.name;
            this.transports.push(r), this._transportsByName[r] = s
        }), this.opts = Object.assign({
            path: "/engine.io",
            agent: !1,
            withCredentials: !1,
            upgrade: !0,
            timestampParam: "t",
            rememberUpgrade: !1,
            addTrailingSlash: !0,
            rejectUnauthorized: !0,
            perMessageDeflate: {
                threshold: 1024
            },
            transportOptions: {},
            closeOnBeforeunload: !1
        }, t), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = $t(this.opts.query)), me && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
            this.transport && (this.transport.removeAllListeners(), this.transport.close())
        }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
            this._onClose("transport close", {
                description: "network connection lost"
            })
        }, se.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open()
    }
    createTransport(e) {
        const t = Object.assign({}, this.opts.query);
        t.EIO = xe, t.transport = e, this.id && (t.sid = this.id);
        const s = Object.assign({}, this.opts, {
            query: t,
            socket: this,
            hostname: this.hostname,
            secure: this.secure,
            port: this.port
        }, this.opts.transportOptions[e]);
        return new this._transportsByName[e](s)
    }
    _open() {
        if (this.transports.length === 0) {
            this.setTimeoutFn(() => {
                this.emitReserved("error", "No transports available")
            }, 0);
            return
        }
        const e = this.opts.rememberUpgrade && $.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
        this.readyState = "opening";
        const t = this.createTransport(e);
        t.open(), this.setTransport(t)
    }
    setTransport(e) {
        this.transport && this.transport.removeAllListeners(), this.transport = e, e.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", t => this._onClose("transport close", t))
    }
    onOpen() {
        this.readyState = "open", $.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush()
    }
    _onPacket(e) {
        if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") switch (this.emitReserved("packet", e), this.emitReserved("heartbeat"), e.type) {
            case "open":
                this.onHandshake(JSON.parse(e.data));
                break;
            case "ping":
                this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
                break;
            case "error":
                const t = new Error("server error");
                t.code = e.data, this._onError(t);
                break;
            case "message":
                this.emitReserved("data", e.data), this.emitReserved("message", e.data);
                break
        }
    }
    onHandshake(e) {
        this.emitReserved("handshake", e), this.id = e.sid, this.transport.query.sid = e.sid, this._pingInterval = e.pingInterval, this._pingTimeout = e.pingTimeout, this._maxPayload = e.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout()
    }
    _resetPingTimeout() {
        this.clearTimeoutFn(this._pingTimeoutTimer);
        const e = this._pingInterval + this._pingTimeout;
        this._pingTimeoutTime = Date.now() + e, this._pingTimeoutTimer = this.setTimeoutFn(() => {
            this._onClose("ping timeout")
        }, e), this.opts.autoUnref && this._pingTimeoutTimer.unref()
    }
    _onDrain() {
        this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush()
    }
    flush() {
        if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
            const e = this._getWritablePackets();
            this.transport.send(e), this._prevBufferLen = e.length, this.emitReserved("flush")
        }
    }
    _getWritablePackets() {
        if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1)) return this.writeBuffer;
        let t = 1;
        for (let s = 0; s < this.writeBuffer.length; s++) {
            const r = this.writeBuffer[s].data;
            if (r && (t += xt(r)), s > 0 && t > this._maxPayload) return this.writeBuffer.slice(0, s);
            t += 2
        }
        return this.writeBuffer
    }
    _hasPingExpired() {
        if (!this._pingTimeoutTime) return !0;
        const e = Date.now() > this._pingTimeoutTime;
        return e && (this._pingTimeoutTime = 0, ae(() => {
            this._onClose("ping timeout")
        }, this.setTimeoutFn)), e
    }
    write(e, t, s) {
        return this._sendPacket("message", e, t, s), this
    }
    send(e, t, s) {
        return this._sendPacket("message", e, t, s), this
    }
    _sendPacket(e, t, s, r) {
        if (typeof t == "function" && (r = t, t = void 0), typeof s == "function" && (r = s, s = null), this.readyState === "closing" || this.readyState === "closed") return;
        s = s || {}, s.compress = s.compress !== !1;
        const i = {
            type: e,
            data: t,
            options: s
        };
        this.emitReserved("packetCreate", i), this.writeBuffer.push(i), r && this.once("flush", r), this.flush()
    }
    close() {
        const e = () => {
                this._onClose("forced close"), this.transport.close()
            },
            t = () => {
                this.off("upgrade", t), this.off("upgradeError", t), e()
            },
            s = () => {
                this.once("upgrade", t), this.once("upgradeError", t)
            };
        return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
            this.upgrading ? s() : e()
        }) : this.upgrading ? s() : e()), this
    }
    _onError(e) {
        if ($.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") return this.transports.shift(), this._open();
        this.emitReserved("error", e), this._onClose("transport error", e)
    }
    _onClose(e, t) {
        if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
            if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), me && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
                const s = se.indexOf(this._offlineEventListener);
                s !== -1 && se.splice(s, 1)
            }
            this.readyState = "closed", this.id = null, this.emitReserved("close", e, t), this.writeBuffer = [], this._prevBufferLen = 0
        }
    }
}
$.protocol = xe;
class cn extends $ {
    constructor() {
        super(...arguments), this._upgrades = []
    }
    onOpen() {
        if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
            for (let e = 0; e < this._upgrades.length; e++) this._probe(this._upgrades[e])
    }
    _probe(e) {
        let t = this.createTransport(e),
            s = !1;
        $.priorWebsocketSuccess = !1;
        const r = () => {
            s || (t.send([{
                type: "ping",
                data: "probe"
            }]), t.once("packet", _ => {
                if (!s)
                    if (_.type === "pong" && _.data === "probe") {
                        if (this.upgrading = !0, this.emitReserved("upgrading", t), !t) return;
                        $.priorWebsocketSuccess = t.name === "websocket", this.transport.pause(() => {
                            s || this.readyState !== "closed" && (m(), this.setTransport(t), t.send([{
                                type: "upgrade"
                            }]), this.emitReserved("upgrade", t), t = null, this.upgrading = !1, this.flush())
                        })
                    } else {
                        const y = new Error("probe error");
                        y.transport = t.name, this.emitReserved("upgradeError", y)
                    }
            }))
        };

        function i() {
            s || (s = !0, m(), t.close(), t = null)
        }
        const o = _ => {
            const y = new Error("probe error: " + _);
            y.transport = t.name, i(), this.emitReserved("upgradeError", y)
        };

        function a() {
            o("transport closed")
        }

        function f() {
            o("socket closed")
        }

        function d(_) {
            t && _.name !== t.name && i()
        }
        const m = () => {
            t.removeListener("open", r), t.removeListener("error", o), t.removeListener("close", a), this.off("close", f), this.off("upgrading", d)
        };
        t.once("open", r), t.once("error", o), t.once("close", a), this.once("close", f), this.once("upgrading", d), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
            s || t.open()
        }, 200) : t.open()
    }
    onHandshake(e) {
        this._upgrades = this._filterUpgrades(e.upgrades), super.onHandshake(e)
    }
    _filterUpgrades(e) {
        const t = [];
        for (let s = 0; s < e.length; s++) ~this.transports.indexOf(e[s]) && t.push(e[s]);
        return t
    }
}
let hn = class extends cn {
    constructor(e, t = {}) {
        const s = typeof e == "object",
            r = s ? {
                ...e
            } : {
                ...t
            };
        (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map(i => nn[i]).filter(i => !!i)), super(s ? r : e, r)
    }
};

function fn(n, e = "", t) {
    let s = n;
    t = t || typeof location < "u" && location, n == null && (n = t.protocol + "//" + t.host), typeof n == "string" && (n.charAt(0) === "/" && (n.charAt(1) === "/" ? n = t.protocol + n : n = t.host + n), /^(https?|wss?):\/\//.test(n) || (typeof t < "u" ? n = t.protocol + "//" + n : n = "https://" + n), s = pe(n)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
    const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
    return s.id = s.protocol + "://" + i + ":" + s.port + e, s.href = s.protocol + "://" + i + (t && t.port === s.port ? "" : ":" + s.port), s
}
const ln = typeof ArrayBuffer == "function",
    un = n => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(n) : n.buffer instanceof ArrayBuffer,
    Ye = Object.prototype.toString,
    dn = typeof Blob == "function" || typeof Blob < "u" && Ye.call(Blob) === "[object BlobConstructor]",
    pn = typeof File == "function" || typeof File < "u" && Ye.call(File) === "[object FileConstructor]";

function _e(n) {
    return ln && (n instanceof ArrayBuffer || un(n)) || dn && n instanceof Blob || pn && n instanceof File
}

function re(n, e) {
    if (!n || typeof n != "object") return !1;
    if (Array.isArray(n)) {
        for (let t = 0, s = n.length; t < s; t++)
            if (re(n[t])) return !0;
        return !1
    }
    if (_e(n)) return !0;
    if (n.toJSON && typeof n.toJSON == "function" && arguments.length === 1) return re(n.toJSON(), !0);
    for (const t in n)
        if (Object.prototype.hasOwnProperty.call(n, t) && re(n[t])) return !0;
    return !1
}

function mn(n) {
    const e = [],
        t = n.data,
        s = n;
    return s.data = ie(t, e), s.attachments = e.length, {
        packet: s,
        buffers: e
    }
}

function ie(n, e, t) {
    if (!n) return n;
    if (_e(n)) {
        const s = {
            _placeholder: !0,
            num: e.length
        };
        return e.push(n), s
    } else if (Array.isArray(n)) {
        const s = new Array(n.length);
        for (let r = 0; r < n.length; r++) s[r] = ie(n[r], e);
        return s
    } else if (typeof n == "object" && !(n instanceof Date)) {
        if (n.toJSON && typeof n.toJSON == "function" && !t) return ie(n.toJSON(), e, !0);
        const s = {};
        for (const r in n) Object.prototype.hasOwnProperty.call(n, r) && (s[r] = ie(n[r], e));
        return s
    }
    return n
}

function gn(n, e) {
    return n.data = ge(n.data, e), delete n.attachments, n
}

function ge(n, e) {
    if (!n) return n;
    if (n && n._placeholder === !0) {
        if (typeof n.num == "number" && n.num >= 0 && n.num < e.length) return e[n.num];
        throw new Error("illegal attachments")
    } else if (Array.isArray(n))
        for (let t = 0; t < n.length; t++) n[t] = ge(n[t], e);
    else if (typeof n == "object")
        for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && (n[t] = ge(n[t], e));
    return n
}
const yn = ["connect", "connect_error", "disconnect", "disconnecting", "newListener", "removeListener"];
var C;
(function(n) {
    n[n.CONNECT = 0] = "CONNECT", n[n.DISCONNECT = 1] = "DISCONNECT", n[n.EVENT = 2] = "EVENT", n[n.ACK = 3] = "ACK", n[n.CONNECT_ERROR = 4] = "CONNECT_ERROR", n[n.BINARY_EVENT = 5] = "BINARY_EVENT", n[n.BINARY_ACK = 6] = "BINARY_ACK"
})(C || (C = {}));
class wn {
    constructor(e) {
        this.replacer = e
    }
    encode(e) {
        return (e.type === C.EVENT || e.type === C.ACK) && re(e) ? this.encodeAsBinary({
            type: e.type === C.EVENT ? C.BINARY_EVENT : C.BINARY_ACK,
            nsp: e.nsp,
            data: e.data,
            id: e.id
        }) : [this.encodeAsString(e)]
    }
    encodeAsString(e) {
        let t = "" + e.type;
        return (e.type === C.BINARY_EVENT || e.type === C.BINARY_ACK) && (t += e.attachments + "-"), e.nsp && e.nsp !== "/" && (t += e.nsp + ","), e.id != null && (t += e.id), e.data != null && (t += JSON.stringify(e.data, this.replacer)), t
    }
    encodeAsBinary(e) {
        const t = mn(e),
            s = this.encodeAsString(t.packet),
            r = t.buffers;
        return r.unshift(s), r
    }
}
class ke extends M {
    constructor(e) {
        super(), this.opts = Object.assign({
            reviver: void 0,
            maxAttachments: 10
        }, typeof e == "function" ? {
            reviver: e
        } : e)
    }
    add(e) {
        let t;
        if (typeof e == "string") {
            if (this.reconstructor) throw new Error("got plaintext data when reconstructing a packet");
            t = this.decodeString(e);
            const s = t.type === C.BINARY_EVENT;
            s || t.type === C.BINARY_ACK ? (t.type = s ? C.EVENT : C.ACK, this.reconstructor = new vn(t)) : super.emitReserved("decoded", t)
        } else if (_e(e) || e.base64)
            if (this.reconstructor) t = this.reconstructor.takeBinaryData(e), t && (this.reconstructor = null, super.emitReserved("decoded", t));
            else throw new Error("got binary data when not reconstructing a packet");
        else throw new Error("Unknown type: " + e)
    }
    decodeString(e) {
        let t = 0;
        const s = {
            type: Number(e.charAt(0))
        };
        if (C[s.type] === void 0) throw new Error("unknown packet type " + s.type);
        if (s.type === C.BINARY_EVENT || s.type === C.BINARY_ACK) {
            const i = t + 1;
            for (; e.charAt(++t) !== "-" && t != e.length;);
            const o = e.substring(i, t);
            if (o != Number(o) || e.charAt(t) !== "-") throw new Error("Illegal attachments");
            const a = Number(o);
            if (!bn(a) || a < 1) throw new Error("Illegal attachments");
            if (a > this.opts.maxAttachments) throw new Error("too many attachments");
            s.attachments = a
        }
        if (e.charAt(t + 1) === "/") {
            const i = t + 1;
            for (; ++t && !(e.charAt(t) === "," || t === e.length););
            s.nsp = e.substring(i, t)
        } else s.nsp = "/";
        const r = e.charAt(t + 1);
        if (r !== "" && Number(r) == r) {
            const i = t + 1;
            for (; ++t;) {
                const o = e.charAt(t);
                if (o == null || Number(o) != o) {
                    --t;
                    break
                }
                if (t === e.length) break
            }
            s.id = Number(e.substring(i, t + 1))
        }
        if (e.charAt(++t)) {
            const i = this.tryParse(e.substr(t));
            if (ke.isPayloadValid(s.type, i)) s.data = i;
            else throw new Error("invalid payload")
        }
        return s
    }
    tryParse(e) {
        try {
            return JSON.parse(e, this.opts.reviver)
        } catch {
            return !1
        }
    }
    static isPayloadValid(e, t) {
        switch (e) {
            case C.CONNECT:
                return Le(t);
            case C.DISCONNECT:
                return t === void 0;
            case C.CONNECT_ERROR:
                return typeof t == "string" || Le(t);
            case C.EVENT:
            case C.BINARY_EVENT:
                return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && yn.indexOf(t[0]) === -1);
            case C.ACK:
            case C.BINARY_ACK:
                return Array.isArray(t)
        }
    }
    destroy() {
        this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null)
    }
}
class vn {
    constructor(e) {
        this.packet = e, this.buffers = [], this.reconPack = e
    }
    takeBinaryData(e) {
        if (this.buffers.push(e), this.buffers.length === this.reconPack.attachments) {
            const t = gn(this.reconPack, this.buffers);
            return this.finishedReconstruction(), t
        }
        return null
    }
    finishedReconstruction() {
        this.reconPack = null, this.buffers = []
    }
}
const bn = Number.isInteger || function(n) {
    return typeof n == "number" && isFinite(n) && Math.floor(n) === n
};

function Le(n) {
    return Object.prototype.toString.call(n) === "[object Object]"
}
const _n = Object.freeze(Object.defineProperty({
    __proto__: null,
    Decoder: ke,
    Encoder: wn,
    get PacketType() {
        return C
    }
}, Symbol.toStringTag, {
    value: "Module"
}));

function z(n, e, t) {
    return n.on(e, t),
        function() {
            n.off(e, t)
        }
}
const kn = Object.freeze({
    connect: 1,
    connect_error: 1,
    disconnect: 1,
    disconnecting: 1,
    newListener: 1,
    removeListener: 1
});
class Je extends M {
    constructor(e, t, s) {
        super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = e, this.nsp = t, s && s.auth && (this.auth = s.auth), this._opts = Object.assign({}, s), this.io._autoConnect && this.open()
    }
    get disconnected() {
        return !this.connected
    }
    subEvents() {
        if (this.subs) return;
        const e = this.io;
        this.subs = [z(e, "open", this.onopen.bind(this)), z(e, "packet", this.onpacket.bind(this)), z(e, "error", this.onerror.bind(this)), z(e, "close", this.onclose.bind(this))]
    }
    get active() {
        return !!this.subs
    }
    connect() {
        return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this)
    }
    open() {
        return this.connect()
    }
    send(...e) {
        return e.unshift("message"), this.emit.apply(this, e), this
    }
    emit(e, ...t) {
        var s, r, i;
        if (kn.hasOwnProperty(e)) throw new Error('"' + e.toString() + '" is a reserved event name');
        if (t.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) return this._addToQueue(t), this;
        const o = {
            type: C.EVENT,
            data: t
        };
        if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof t[t.length - 1] == "function") {
            const m = this.ids++,
                _ = t.pop();
            this._registerAckCallback(m, _), o.id = m
        }
        const a = (r = (s = this.io.engine) === null || s === void 0 ? void 0 : s.transport) === null || r === void 0 ? void 0 : r.writable,
            f = this.connected && !(!((i = this.io.engine) === null || i === void 0) && i._hasPingExpired());
        return this.flags.volatile && !a || (f ? (this.notifyOutgoingListeners(o), this.packet(o)) : this.sendBuffer.push(o)), this.flags = {}, this
    }
    _registerAckCallback(e, t) {
        var s;
        const r = (s = this.flags.timeout) !== null && s !== void 0 ? s : this._opts.ackTimeout;
        if (r === void 0) {
            this.acks[e] = t;
            return
        }
        const i = this.io.setTimeoutFn(() => {
                delete this.acks[e];
                for (let a = 0; a < this.sendBuffer.length; a++) this.sendBuffer[a].id === e && this.sendBuffer.splice(a, 1);
                t.call(this, new Error("operation has timed out"))
            }, r),
            o = (...a) => {
                this.io.clearTimeoutFn(i), t.apply(this, a)
            };
        o.withError = !0, this.acks[e] = o
    }
    emitWithAck(e, ...t) {
        return new Promise((s, r) => {
            const i = (o, a) => o ? r(o) : s(a);
            i.withError = !0, t.push(i), this.emit(e, ...t)
        })
    }
    _addToQueue(e) {
        let t;
        typeof e[e.length - 1] == "function" && (t = e.pop());
        const s = {
            id: this._queueSeq++,
            tryCount: 0,
            pending: !1,
            args: e,
            flags: Object.assign({
                fromQueue: !0
            }, this.flags)
        };
        e.push((r, ...i) => s !== this._queue[0] ? void 0 : (r !== null ? s.tryCount > this._opts.retries && (this._queue.shift(), t && t(r)) : (this._queue.shift(), t && t(null, ...i)), s.pending = !1, this._drainQueue())), this._queue.push(s), this._drainQueue()
    }
    _drainQueue(e = !1) {
        if (!this.connected || this._queue.length === 0) return;
        const t = this._queue[0];
        t.pending && !e || (t.pending = !0, t.tryCount++, this.flags = t.flags, this.emit.apply(this, t.args))
    }
    packet(e) {
        e.nsp = this.nsp, this.io._packet(e)
    }
    onopen() {
        typeof this.auth == "function" ? this.auth(e => {
            this._sendConnectPacket(e)
        }) : this._sendConnectPacket(this.auth)
    }
    _sendConnectPacket(e) {
        this.packet({
            type: C.CONNECT,
            data: this._pid ? Object.assign({
                pid: this._pid,
                offset: this._lastOffset
            }, e) : e
        })
    }
    onerror(e) {
        this.connected || this.emitReserved("connect_error", e)
    }
    onclose(e, t) {
        this.connected = !1, delete this.id, this.emitReserved("disconnect", e, t), this._clearAcks()
    }
    _clearAcks() {
        Object.keys(this.acks).forEach(e => {
            if (!this.sendBuffer.some(s => String(s.id) === e)) {
                const s = this.acks[e];
                delete this.acks[e], s.withError && s.call(this, new Error("socket has been disconnected"))
            }
        })
    }
    onpacket(e) {
        if (e.nsp === this.nsp) switch (e.type) {
            case C.CONNECT:
                e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                break;
            case C.EVENT:
            case C.BINARY_EVENT:
                this.onevent(e);
                break;
            case C.ACK:
            case C.BINARY_ACK:
                this.onack(e);
                break;
            case C.DISCONNECT:
                this.ondisconnect();
                break;
            case C.CONNECT_ERROR:
                this.destroy();
                const s = new Error(e.data.message);
                s.data = e.data.data, this.emitReserved("connect_error", s);
                break
        }
    }
    onevent(e) {
        const t = e.data || [];
        e.id != null && t.push(this.ack(e.id)), this.connected ? this.emitEvent(t) : this.receiveBuffer.push(Object.freeze(t))
    }
    emitEvent(e) {
        if (this._anyListeners && this._anyListeners.length) {
            const t = this._anyListeners.slice();
            for (const s of t) s.apply(this, e)
        }
        super.emit.apply(this, e), this._pid && e.length && typeof e[e.length - 1] == "string" && (this._lastOffset = e[e.length - 1])
    }
    ack(e) {
        const t = this;
        let s = !1;
        return function(...r) {
            s || (s = !0, t.packet({
                type: C.ACK,
                id: e,
                data: r
            }))
        }
    }
    onack(e) {
        const t = this.acks[e.id];
        typeof t == "function" && (delete this.acks[e.id], t.withError && e.data.unshift(null), t.apply(this, e.data))
    }
    onconnect(e, t) {
        this.id = e, this.recovered = t && this._pid === t, this._pid = t, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0)
    }
    emitBuffered() {
        this.receiveBuffer.forEach(e => this.emitEvent(e)), this.receiveBuffer = [], this.sendBuffer.forEach(e => {
            this.notifyOutgoingListeners(e), this.packet(e)
        }), this.sendBuffer = []
    }
    ondisconnect() {
        this.destroy(), this.onclose("io server disconnect")
    }
    destroy() {
        this.subs && (this.subs.forEach(e => e()), this.subs = void 0), this.io._destroy(this)
    }
    disconnect() {
        return this.connected && this.packet({
            type: C.DISCONNECT
        }), this.destroy(), this.connected && this.onclose("io client disconnect"), this
    }
    close() {
        return this.disconnect()
    }
    compress(e) {
        return this.flags.compress = e, this
    }
    get volatile() {
        return this.flags.volatile = !0, this
    }
    timeout(e) {
        return this.flags.timeout = e, this
    }
    onAny(e) {
        return this._anyListeners = this._anyListeners || [], this._anyListeners.push(e), this
    }
    prependAny(e) {
        return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(e), this
    }
    offAny(e) {
        if (!this._anyListeners) return this;
        if (e) {
            const t = this._anyListeners;
            for (let s = 0; s < t.length; s++)
                if (e === t[s]) return t.splice(s, 1), this
        } else this._anyListeners = [];
        return this
    }
    listenersAny() {
        return this._anyListeners || []
    }
    onAnyOutgoing(e) {
        return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(e), this
    }
    prependAnyOutgoing(e) {
        return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(e), this
    }
    offAnyOutgoing(e) {
        if (!this._anyOutgoingListeners) return this;
        if (e) {
            const t = this._anyOutgoingListeners;
            for (let s = 0; s < t.length; s++)
                if (e === t[s]) return t.splice(s, 1), this
        } else this._anyOutgoingListeners = [];
        return this
    }
    listenersAnyOutgoing() {
        return this._anyOutgoingListeners || []
    }
    notifyOutgoingListeners(e) {
        if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
            const t = this._anyOutgoingListeners.slice();
            for (const s of t) s.apply(this, e.data)
        }
    }
}

function X(n) {
    n = n || {}, this.ms = n.min || 100, this.max = n.max || 1e4, this.factor = n.factor || 2, this.jitter = n.jitter > 0 && n.jitter <= 1 ? n.jitter : 0, this.attempts = 0
}
X.prototype.duration = function() {
    var n = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
        var e = Math.random(),
            t = Math.floor(e * this.jitter * n);
        n = Math.floor(e * 10) & 1 ? n + t : n - t
    }
    return Math.min(n, this.max) | 0
};
X.prototype.reset = function() {
    this.attempts = 0
};
X.prototype.setMin = function(n) {
    this.ms = n
};
X.prototype.setMax = function(n) {
    this.max = n
};
X.prototype.setJitter = function(n) {
    this.jitter = n
};
class ye extends M {
    constructor(e, t) {
        var s;
        super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (t = e, e = void 0), t = t || {}, t.path = t.path || "/socket.io", this.opts = t, ce(this, t), this.reconnection(t.reconnection !== !1), this.reconnectionAttempts(t.reconnectionAttempts || 1 / 0), this.reconnectionDelay(t.reconnectionDelay || 1e3), this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3), this.randomizationFactor((s = t.randomizationFactor) !== null && s !== void 0 ? s : .5), this.backoff = new X({
            min: this.reconnectionDelay(),
            max: this.reconnectionDelayMax(),
            jitter: this.randomizationFactor()
        }), this.timeout(t.timeout == null ? 2e4 : t.timeout), this._readyState = "closed", this.uri = e;
        const r = t.parser || _n;
        this.encoder = new r.Encoder, this.decoder = new r.Decoder, this._autoConnect = t.autoConnect !== !1, this._autoConnect && this.open()
    }
    reconnection(e) {
        return arguments.length ? (this._reconnection = !!e, e || (this.skipReconnect = !0), this) : this._reconnection
    }
    reconnectionAttempts(e) {
        return e === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = e, this)
    }
    reconnectionDelay(e) {
        var t;
        return e === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = e, (t = this.backoff) === null || t === void 0 || t.setMin(e), this)
    }
    randomizationFactor(e) {
        var t;
        return e === void 0 ? this._randomizationFactor : (this._randomizationFactor = e, (t = this.backoff) === null || t === void 0 || t.setJitter(e), this)
    }
    reconnectionDelayMax(e) {
        var t;
        return e === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = e, (t = this.backoff) === null || t === void 0 || t.setMax(e), this)
    }
    timeout(e) {
        return arguments.length ? (this._timeout = e, this) : this._timeout
    }
    maybeReconnectOnOpen() {
        !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect()
    }
    open(e) {
        if (~this._readyState.indexOf("open")) return this;
        this.engine = new hn(this.uri, this.opts);
        const t = this.engine,
            s = this;
        this._readyState = "opening", this.skipReconnect = !1;
        const r = z(t, "open", function() {
                s.onopen(), e && e()
            }),
            i = a => {
                this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), e ? e(a) : this.maybeReconnectOnOpen()
            },
            o = z(t, "error", i);
        if (this._timeout !== !1) {
            const a = this._timeout,
                f = this.setTimeoutFn(() => {
                    r(), i(new Error("timeout")), t.close()
                }, a);
            this.opts.autoUnref && f.unref(), this.subs.push(() => {
                this.clearTimeoutFn(f)
            })
        }
        return this.subs.push(r), this.subs.push(o), this
    }
    connect(e) {
        return this.open(e)
    }
    onopen() {
        this.cleanup(), this._readyState = "open", this.emitReserved("open");
        const e = this.engine;
        this.subs.push(z(e, "ping", this.onping.bind(this)), z(e, "data", this.ondata.bind(this)), z(e, "error", this.onerror.bind(this)), z(e, "close", this.onclose.bind(this)), z(this.decoder, "decoded", this.ondecoded.bind(this)))
    }
    onping() {
        this.emitReserved("ping")
    }
    ondata(e) {
        try {
            this.decoder.add(e)
        } catch (t) {
            this.onclose("parse error", t)
        }
    }
    ondecoded(e) {
        ae(() => {
            this.emitReserved("packet", e)
        }, this.setTimeoutFn)
    }
    onerror(e) {
        this.emitReserved("error", e)
    }
    socket(e, t) {
        let s = this.nsps[e];
        return s ? this._autoConnect && !s.active && s.connect() : (s = new Je(this, e, t), this.nsps[e] = s), s
    }
    _destroy(e) {
        const t = Object.keys(this.nsps);
        for (const s of t)
            if (this.nsps[s].active) return;
        this._close()
    }
    _packet(e) {
        const t = this.encoder.encode(e);
        for (let s = 0; s < t.length; s++) this.engine.write(t[s], e.options)
    }
    cleanup() {
        this.subs.forEach(e => e()), this.subs.length = 0, this.decoder.destroy()
    }
    _close() {
        this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close")
    }
    disconnect() {
        return this._close()
    }
    onclose(e, t) {
        var s;
        this.cleanup(), (s = this.engine) === null || s === void 0 || s.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", e, t), this._reconnection && !this.skipReconnect && this.reconnect()
    }
    reconnect() {
        if (this._reconnecting || this.skipReconnect) return this;
        const e = this;
        if (this.backoff.attempts >= this._reconnectionAttempts) this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
        else {
            const t = this.backoff.duration();
            this._reconnecting = !0;
            const s = this.setTimeoutFn(() => {
                e.skipReconnect || (this.emitReserved("reconnect_attempt", e.backoff.attempts), !e.skipReconnect && e.open(r => {
                    r ? (e._reconnecting = !1, e.reconnect(), this.emitReserved("reconnect_error", r)) : e.onreconnect()
                }))
            }, t);
            this.opts.autoUnref && s.unref(), this.subs.push(() => {
                this.clearTimeoutFn(s)
            })
        }
    }
    onreconnect() {
        const e = this.backoff.attempts;
        this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", e)
    }
}
const G = {};

function ue(n, e) {
    typeof n == "object" && (e = n, n = void 0), e = e || {};
    const t = fn(n, e.path || "/socket.io"),
        s = t.source,
        r = t.id,
        i = t.path,
        o = G[r] && i in G[r].nsps,
        a = e.forceNew || e["force new connection"] || e.multiplex === !1 || o;
    let f;
    return a ? f = new ye(s, e) : (G[r] || (G[r] = new ye(s, e)), f = G[r]), t.query && !e.query && (e.query = t.queryKey), f.socket(t.path, e)
}
Object.assign(ue, {
    Manager: ye,
    Socket: Je,
    io: ue,
    connect: ue
});
const En = 200;

function $n(n, e, t) {
    const s = {
            ...n
        },
        r = [];
    for (const [i, o] of Object.entries(e)) {
        if (i !== t.selfId && !t.receiving) {
            delete s[i];
            continue
        }
        if (o === null) {
            r.push(i);
            continue
        }
        s[i] = o
    }
    return {
        next: s,
        cleared: r
    }
}

function jn(n, e) {
    const t = {};
    let s;
    const r = () => {
            s = void 0;
            const o = {
                ...t
            };
            for (const a of Object.keys(t)) delete t[a];
            e(o)
        },
        i = ({
            id: o,
            image: a
        }) => {
            t[o] = a ? String(a) : null, s ?? (s = setTimeout(r, En))
        };
    return n.on("preview", i), () => {
        s && clearTimeout(s), s = void 0, n.off("preview", i)
    }
}

function Kn(n) {
    return {
        rows: n.snapshot(),
        lookup: n.lookup,
        localImage: n.localImage,
        fileAction: n.fileAction,
        attach: n.attach,
        sendFiles: n.sendFiles,
        downloadAttachment: n.downloadAttachment,
        open: n.open,
        reveal: n.reveal,
        cancel: n.cancel,
        dismiss: n.dismiss,
        dismissAll: n.dismissAll,
        dockRows: n.dockRows
    }
}

function Yn(n) {
    const {
        flags: e,
        setNotice: t
    } = n;
    async function s() {
        var i, o;
        if (!n.getSnapshot().connected) {
            t("等重新连上再试");
            return
        }
        if (!window.officeDesktop) {
            if (n.getSnapshot().sharing) {
                (i = n.media()) == null || i.stopScreen();
                return
            }
            try {
                await ((o = n.media()) == null ? void 0 : o.startScreen()), n.annotations.attach()
            } catch {
                t("共享没开始，再选一次窗口或屏幕")
            }
        }
    }
    async function r(i, o) {
        var d, m, _, y, A, E;
        if (e.requestBusy) return;
        e.requestBusy = !0;
        const a = n.getSnapshot().requests.find(b => b.id === i);
        if (!a) {
            e.requestBusy = !1;
            return
        }
        let f = null;
        try {
            o && a.kind === "screen" && !a.offer && !((m = (d = n.media()) == null ? void 0 : d.screen) != null && m.active) && (e.selectingForInvite = i, await ((_ = n.media()) == null ? void 0 : _.startScreen(!1)), f = ((y = n.media()) == null ? void 0 : y.screen) || null, f != null && f.active || (o = !1))
        } catch {
            o = !1, t("没有屏幕权限，已拒绝")
        }
        e.selectingForInvite = null;
        try {
            if (!e.invitationIds.has(i) || !((A = n.socket()) != null && A.connected)) throw Error("邀请已取消或过期");
            const b = await n.socket().timeout(1e4).emitWithAck("respond", {
                id: i,
                accept: o
            });
            if (!(b != null && b.ok) || o && !b.accepted) throw Error((b == null ? void 0 : b.error) || "邀请没连上")
        } catch (b) {
            f && ((E = n.media()) == null ? void 0 : E.screen) === f && n.media().stopScreen(), t(b instanceof Error ? b.message : "邀请没连上，再发一次")
        } finally {
            e.invitationIds.delete(i), n.publish({
                requests: n.getSnapshot().requests.filter(b => b.id !== i)
            }), e.requestBusy = !1
        }
    }
    return {
        dismissCallAlert: i => n.publish({
            callAlerts: n.getSnapshot().callAlerts.filter(o => o.id !== i)
        }),
        cancelRequest: i => {
            var o;
            return (o = n.socket()) == null ? void 0 : o.emit("cancel-request", i)
        },
        interactCat: async i => {
            var o;
            try {
                return await ((o = n.socket()) == null ? void 0 : o.timeout(5e3).emitWithAck("cat-interact", i))
            } catch {
                return {
                    ok: !1,
                    text: "暂时没连上，稍后再试。"
                }
            }
        },
        share: s,
        shareInCall: async i => {
            var o;
            try {
                return await ((o = n.media()) == null ? void 0 : o.shareInCall(i)), n.annotations.attach(), !0
            } catch (a) {
                return t(a instanceof Error ? a.message : "共享没开始，再试一次"), !1
            }
        },
        stopShare: () => {
            var i;
            (i = n.media()) == null || i.stopScreen(), n.annotations.detach()
        },
        setRemoteAudioMuted: (i, o) => {
            var a;
            return (a = n.media()) == null ? void 0 : a.setRemoteAudioMuted(i, o)
        },
        annotation: {
            draw: n.annotations.draw,
            clear: n.annotations.clear,
            undo: n.annotations.undo
        },
        respond: r,
        claimSeat: i => n.seatApi.claimSeat(i),
        adminKick: (i, o) => n.seatApi.adminKick(i, o),
        setNotice: t,
        sitSpot: i => new Promise(o => {
            const a = ++e.sitSequence,
                f = n.socket();
            if (!(f != null && f.connected)) return o(!1);
            f.timeout(6e3).emit("sit", i, (d, m) => {
                d ? (a === e.sitSequence && f.emit("sit", null, () => {}), t("坐下超时了，再试一次")) : m != null && m.ok || t((m == null ? void 0 : m.error) || "坐不了这里"), o(!d && (m == null ? void 0 : m.ok) === !0)
            })
        }),
        reportMotion: i => {
            var o;
            return (o = n.socket()) == null ? void 0 : o.emit("motion", i)
        },
        setAppearance: i => {
            var o;
            pt(i), (o = n.socket()) == null || o.emit("appearance", i)
        },
        setPreviewAllowed: i => {
            var o;
            e.receivePreviews = i, i || n.publish({
                previews: Object.fromEntries(Object.entries(n.getSnapshot().previews).filter(([a]) => {
                    var f;
                    return a === ((f = n.socket()) == null ? void 0 : f.id)
                }))
            }), (o = n.socket()) == null || o.emit("preview-allowed", i)
        },
        sendChatFile: (i, o, a) => {
            var f;
            return ((f = n.chat()) == null ? void 0 : f.sendFile(i, o, a)) ?? Promise.resolve(!1)
        },
        loadChatFile: i => {
            var o;
            return ((o = n.chat()) == null ? void 0 : o.loadFile(i)) ?? Promise.reject(Error("聊天还没连上"))
        },
        chat: (i, o) => {
            var a;
            return ((a = n.chat()) == null ? void 0 : a.send(i, o)) ?? Promise.resolve(!1)
        },
        notifyWatching: i => {
            var o;
            i && ((o = n.socket()) == null || o.emit("preview-watch", {
                target: i
            }))
        },
        request: async (i, o, a = !1) => {
            var f, d, m, _;
            if (!e.requestBusy) {
                e.requestBusy = !0;
                try {
                    a && !((d = (f = n.media()) == null ? void 0 : f.screen) != null && d.active) && await ((m = n.media()) == null ? void 0 : m.startScreen(!1)), (_ = n.socket()) == null || _.emit("request", {
                        target: i,
                        kind: o,
                        offer: a
                    })
                } catch {
                    t("没有屏幕权限，邀请没发出去")
                } finally {
                    e.requestBusy = !1
                }
            }
        },
        end: i => {
            var o;
            return (o = n.socket()) == null ? void 0 : o.emit("end", i)
        },
        mute: async i => {
            var o, a;
            if (e.muteBusy) return !1;
            e.muteBusy = !0, n.publish({
                voiceStatus: "Switching"
            });
            try {
                const f = n.media();
                return await (f == null ? void 0 : f.toggleMute((f == null ? void 0 : f.privateVoiceStatus(i)) === "On", i)), n.publish({
                    muted: ((o = n.media()) == null ? void 0 : o.privateVoiceStatus()) === "Muted"
                }), !0
            } catch {
                return t("麦克风打不开，检查一下权限或设备再试"), !1
            } finally {
                e.muteBusy = !1, n.publish({
                    voiceStatus: ((a = n.media()) == null ? void 0 : a.privateVoiceStatus()) || "Not in a call"
                })
            }
        },
        activeMic: () => {
            var i;
            return ((i = n.media()) == null ? void 0 : i.activeMic()) ?? null
        }
    }
}

function Jn(n) {
    if (typeof n == "string") return "login";
    switch (n == null ? void 0 : n.code) {
        case "login-rotated":
            return "reconnect";
        case "session-expired":
            return "recover-once";
        case "signed-in-elsewhere":
            return "login";
        default:
            return "ignore"
    }
}

function Xn(n, e) {
    return typeof n == "string" ? n || e : (n == null ? void 0 : n.message) || e
}
const Sn = 256 * 1024,
    An = 32 * 1024,
    Xe = (n, e) => n === e || JSON.stringify(n) === JSON.stringify(e);

function Gn(n, e) {
    const t = {};
    for (const s of Object.keys(e)) Xe(n[s], e[s]) || (t[s] = e[s]);
    return t
}

function Qn(n, e) {
    const t = {};
    for (const s of new Set([...Object.keys(n), ...Object.keys(e)])) n[s] !== e[s] && (t[s] = e[s] ?? null);
    return t
}

function Zn(n, e) {
    const t = {};
    for (const s of new Set([...Object.keys(n), ...Object.keys(e)])) Xe(n[s], e[s]) || (t[s] = e[s] ?? null);
    return t
}

function es(n, e) {
    const t = new Map(n.map(o => [o.id, o])),
        s = new Map(e.map(o => [o.id, o])),
        r = e.filter(o => !t.has(o.id) || t.get(o.id) !== o),
        i = n.filter(o => !s.has(o.id)).map(o => o.id);
    return {
        upserts: r,
        removed: i
    }
}

function ts(n, e, t) {
    const s = JSON.stringify(t);
    if (new TextEncoder().encode(s).length <= Sn) return [{
        kind: "full",
        epoch: n,
        seq: e,
        snapshot: t
    }];
    const r = On(s, An);
    return r.map((i, o) => ({
        kind: "full-chunk",
        epoch: n,
        seq: e,
        index: o,
        total: r.length,
        data: i
    }))
}

function Tn(n) {
    const e = [...n].sort((t, s) => t.index - s.index);
    return JSON.parse(e.map(t => t.data).join(""))
}

function On(n, e) {
    const t = [];
    for (let s = 0; s < n.length;) {
        let r = Math.min(s + e, n.length);
        const i = n.charCodeAt(r - 1);
        r < n.length && i >= 55296 && i <= 56319 && (r -= 1), t.push(n.slice(s, r)), s = r
    }
    return t
}
class ns {
    constructor() {
        V(this, "epoch", 0);
        V(this, "seq", {
            state: 0,
            preview: 0,
            motion: 0,
            chat: 0,
            full: 0,
            "full-chunk": 0
        });
        V(this, "base", null);
        V(this, "previews", {});
        V(this, "motions", {});
        V(this, "messages", []);
        V(this, "chunks", null);
        V(this, "snapshot", null);
        V(this, "listeners", new Set);
        V(this, "getSnapshot", () => this.snapshot);
        V(this, "subscribe", e => (this.listeners.add(e), () => {
            this.listeners.delete(e)
        }))
    }
    ingest(e) {
        if (e.epoch < this.epoch) return !1;
        if (e.epoch > this.epoch) {
            const s = this.snapshot !== null;
            if (this.reset(e.epoch), s)
                for (const r of this.listeners) r()
        }
        if (e.kind === "full-chunk") return this.ingestChunk(e);
        if (e.seq <= this.seq[e.kind]) return !1;
        this.seq[e.kind] = e.seq;
        let t = !0;
        switch (e.kind) {
            case "full":
                try {
                    this.applyFull(e.snapshot)
                } catch {
                    return this.seq.full = 0, !1
                }
                this.markSeq(e.seq);
                break;
            case "state":
                if (!this.base) return !1;
                if (!Object.keys(e.patch).length) {
                    t = !1;
                    break
                }
                this.base = {
                    ...this.base,
                    ...e.patch
                };
                break;
            case "preview":
                for (const [s, r] of Object.entries(e.batch)) r ? this.previews[s] = r : delete this.previews[s];
                break;
            case "motion":
                for (const [s, r] of Object.entries(e.batch)) r ? this.motions[s] = r : delete this.motions[s];
                break;
            case "chat": {
                const s = new Map(this.messages.map(r => [r.id, r]));
                for (const r of e.upserts) s.set(r.id, r);
                for (const r of e.removed || []) s.delete(r);
                this.messages = [...s.values()].sort((r, i) => r.id.localeCompare(i.id));
                break
            }
        }
        return t && this.rebuild(), !0
    }
    ingestChunk(e) {
        var s;
        if (e.seq <= this.seq.full || ((((s = this.chunks) == null ? void 0 : s.epoch) !== e.epoch || this.chunks.seq !== e.seq) && (this.chunks = {
                epoch: e.epoch,
                seq: e.seq,
                total: e.total,
                parts: new Map
            }), this.chunks.parts.set(e.index, e.data), this.chunks.parts.size < e.total)) return !1;
        const t = [...this.chunks.parts.entries()].sort(([r], [i]) => r - i).map(([, r]) => ({
            kind: "full-chunk",
            epoch: e.epoch,
            seq: e.seq,
            index: 0,
            total: e.total,
            data: r
        }));
        this.chunks = null;
        try {
            this.applyFull(Tn(t))
        } catch {
            return !1
        }
        return this.seq.full = e.seq, this.markSeq(e.seq), this.rebuild(), !0
    }
    markSeq(e) {
        this.seq = {
            state: e,
            preview: e,
            motion: e,
            chat: e,
            full: e,
            "full-chunk": e
        }
    }
    applyFull(e) {
        const {
            previews: t,
            motions: s,
            ...r
        } = e.presence, {
            messages: i,
            ...o
        } = e.chat;
        this.base = {
            ...e,
            presence: r,
            chat: o
        }, this.previews = {
            ...t || {}
        }, this.motions = {
            ...s || {}
        }, this.messages = Array.isArray(i) ? [...i] : []
    }
    reset(e) {
        this.epoch = e, this.seq = {
            state: 0,
            preview: 0,
            motion: 0,
            chat: 0,
            full: 0,
            "full-chunk": 0
        }, this.base = null, this.previews = {}, this.motions = {}, this.messages = [], this.chunks = null, this.snapshot = null
    }
    rebuild() {
        if (!this.base) {
            this.snapshot = null;
            return
        }
        this.snapshot = {
            ...this.base,
            presence: {
                ...this.base.presence,
                previews: this.previews,
                motions: this.motions
            },
            chat: {
                ...this.base.chat,
                messages: this.messages
            },
            epoch: this.epoch,
            seq: Math.max(...Object.values(this.seq))
        };
        for (const e of this.listeners) e()
    }
}
const Me = [300, 1e3, 2e3, 5e3];

function ss(n, e, t = {
    set: (s, r) => setTimeout(s, r),
    clear: s => clearTimeout(s)
}) {
    let s = !0,
        r = 0,
        i, o = !1;
    const a = () => {
            i = void 0, !(!s || o) && (o = !0, n.get().then(d => {
                if (s)
                    for (const m of d) e.ingest(m)
            }).catch(() => {}).then(() => {
                if (o = !1, !!s) {
                    if (e.getSnapshot()) {
                        r = 0;
                        return
                    }
                    i = t.set(a, Me[Math.min(r++, Me.length - 1)])
                }
            }))
        },
        f = n.onSnapshot(d => {
            e.ingest(d), !e.getSnapshot() && !o && i === void 0 && a()
        });
    return a(), () => {
        s = !1, t.clear(i), f()
    }
}
export {
    Bn as A, qn as B, Ce as C, ns as H, mt as M, Yn as a, In as b, Fn as c, xn as d, Ln as e, Kn as f, jn as g, Un as h, Dn as i, Xn as j, Nn as k, ue as l, zn as m, $n as n, ts as o, Gn as p, Qn as q, Mn as r, Jn as s, Zn as t, es as u, Hn as v, Vn as w, Pn as x, ss as y, gt as z
};