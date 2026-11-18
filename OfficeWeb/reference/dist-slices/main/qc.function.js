function qc({
    socket: i,
    notify: e,
    sharingScreen: t
}) {
    let n = !1,
        s = null,
        r = 0,
        a = null;
    const o = {
        attach() {
            const c = mt();
            !c || n || (n = !0, c.attach().then(d => {
                d && d.ok === !1 && e(d.reason === "window-share" ? "你共享的是一个窗口，标注只出现在共享的画面里" : "这台电脑显示不了桌面标注")
            }).catch(() => {
                n = !1
            }))
        },
        detach() {
            var c, d;
            n = !1, (c = mt()) == null || c.clear().catch(() => {}), (d = mt()) == null || d.detach().catch(() => {})
        },
        clearShareMarks(c) {
            var d;
            if (c.length && ((d = i.current) != null && d.connected))
                for (const l of c) i.current.emit("annotate-clear", {
                    scope: l
                });
            o.detach()
        },
        mirror(c) {
            var d, l;
            !mt() || !t() || (o.attach(), c.type === "clear" ? (d = mt()) == null || d.clear().catch(() => {}) : (l = mt()) == null || l.draw(c).catch(() => {}))
        },
        undoOnLayer(c) {
            var d;
            (d = mt()) == null || d.draw({
                type: "undo",
                id: c
            }).catch(() => {})
        },
        draw(c, d, l = !1, u) {
            const h = i.current;
            h != null && h.connected && (!d.length && !l || ((!s || s.scope !== c) && (s = {
                scope: c,
                id: `st${r+=1}`,
                ink: u || Bi
            }), h.emit("annotate", {
                scope: c,
                stroke: s.id,
                points: d,
                done: l,
                color: s.ink
            }), l && (s = null)))
        },
        clear(c) {
            var d, l;
            (d = i.current) == null || d.emit("annotate-clear", {
                scope: c
            }), (l = mt()) == null || l.clear().catch(() => {})
        },
        undo(c) {
            var l;
            const d = (s == null ? void 0 : s.scope) === c ? s.id : void 0;
            (l = i.current) == null || l.emit("annotate-undo", {
                scope: c,
                stroke: d
            })
        },
        attachSocket(c) {
            c.on("annotate", d => o.mirror({
                type: "annotate",
                ...d
            })), c.on("annotate-clear", () => o.mirror({
                type: "clear"
            })), c.on("annotate-undo", d => o.undoOnLayer(d == null ? void 0 : d.id))
        },
        trackMeetingRoom(c) {
            a && a !== c && o.clearShareMarks([a]), a = c
        }
    };
    return o
}
