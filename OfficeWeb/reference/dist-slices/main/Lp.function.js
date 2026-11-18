function Lp(i, e) {
    const t = (i == null ? void 0 : i.files.transfers) ?? [],
        n = r => t.find(a => a.id === r || a.attachmentId === r),
        s = r => void e(r);
    return {
        rows: t,
        lookup: r => hi.get(r) ?? n(r),
        localImage: async r => {
            var d;
            const a = hi.get(r) ?? n(r);
            if (a != null && a.url) return (await fetch(a.url)).blob();
            if (!(a != null && a.path)) throw Error("这台电脑没有该图片，请让对方重新发送");
            const o = (d = window.officeDesktop) == null ? void 0 : d.files;
            if (!o) throw Error("这台电脑没有该图片，请让对方重新发送");
            const c = await o.sendOpen(a.path);
            try {
                if (c.size > 20 * 1024 * 1024) throw Error("图片较大，请打开本地文件查看");
                const l = [];
                for (let u = 0; u < c.size; u += 256 * 1024) {
                    const h = Math.min(262144, c.size - u),
                        m = await o.sendRead(c.id, u, h);
                    if (!m || m.byteLength !== h) throw Error("本地图片读取不完整，请确认文件未被移动或修改");
                    l.push(m)
                }
                return new Blob(l)
            } finally {
                await o.sendClose(c.id).catch(() => {})
            }
        },
        fileAction: async (r, a) => {
            var d;
            const o = hi.get(r);
            if (o != null && o.path) {
                const l = (d = window.officeDesktop) == null ? void 0 : d.files;
                if (!l) throw Error("打开文件需要桌面客户端");
                if (!await (a === "reveal" ? l.reveal(o.path) : l.open(o.path))) throw Error("无法打开，请确认文件仍在原位置");
                return
            }
            const c = await e({
                kind: a === "open" ? "file-open" : "file-reveal",
                id: r
            });
            if (c.ok === !1) throw Error(c.error || "打不开文件")
        },
        attach: () => {},
        sendFiles: async (r, a, o = "") => {
            const c = await e({
                kind: "file-send",
                personId: r,
                paths: a,
                peerName: o
            });
            if (c.ok === !1) throw Error(c.error || "文件没发出去")
        },
        downloadAttachment: async r => {
            await Dp(r)
        },
        open: r => s({
            kind: "file-open",
            id: r
        }),
        reveal: r => s({
            kind: "file-reveal",
            id: r
        }),
        cancel: r => s({
            kind: "file-cancel",
            id: r
        }),
        dismiss: r => s({
            kind: "file-dismiss",
            id: r
        }),
        dismissAll: () => s({
            kind: "file-dismiss-all"
        }),
        dockRows: () => Xc(t, Date.now())
    }
}

