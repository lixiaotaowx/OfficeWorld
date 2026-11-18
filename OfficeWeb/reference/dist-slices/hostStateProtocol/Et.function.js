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

