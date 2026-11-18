function Ro(r) {
    var t;
    const e = r.trim();
    return (((t = e.match(/https:\/\/[^\s<>"']+/)) == null ? void 0 : t[0]) || e).replace(/[)\]]+$/, "")
}
async function Fo(r, e) {
    const t = Lo(r);
    if (t) return t;
    let s;
    try {
        s = new URL(r)
    } catch {
        throw Error("粘贴完整的链接")
    }
    if (s.protocol !== "https:" || s.username || s.password) throw Error("要 https 开头的图片或视频链接");
    const i = new AbortController,
        n = AbortSignal.any([e, i.signal]),
        o = a => new Promise(l => {
            const A = a === "image" ? new Image : document.createElement("video");
            let c = !1;
            const h = g => {
                    c || (c = !0, clearTimeout(d), n.removeEventListener("abort", u), A.onload = null, A.onerror = null, A instanceof HTMLVideoElement ? (A.onloadedmetadata = null, A.pause(), A.removeAttribute("src"), A.load()) : A.src = "", l(g))
                },
                u = () => h(!1),
                d = setTimeout(u, 7e3);
            n.addEventListener("abort", u, {
                once: !0
            }), A.onerror = u, A instanceof HTMLVideoElement ? (A.preload = "metadata", A.onloadedmetadata = () => h(!0)) : A.onload = () => h(!0), n.aborted ? u() : A.src = s.href
        });
    try {
        const a = await Promise.any([o("image").then(l => l ? "image" : Promise.reject()), o("video").then(l => l ? "video" : Promise.reject())]);
        return e.throwIfAborted(), a
    } finally {
        i.abort()
    }
}
async function Xs(r) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(r.type) || r.size > 20 * 1024 * 1024) throw Error("选一张 20 MB 以内的 PNG、JPEG 或 WebP 图片");
    const e = await createImageBitmap(r);
    try {
        const t = Math.min(1, 1e3 / Math.max(e.width, e.height)),
            s = document.createElement("canvas");
        s.width = Math.max(1, Math.round(e.width * t)), s.height = Math.max(1, Math.round(e.height * t)), s.getContext("2d").drawImage(e, 0, 0, s.width, s.height);
        let i = s.toDataURL("image/webp", .8);
        for (let n = 0; i.length > 22e4 && n < 5; n++) s.width = Math.max(1, Math.round(s.width * .8)), s.height = Math.max(1, Math.round(s.height * .8)), s.getContext("2d").drawImage(e, 0, 0, s.width, s.height), i = s.toDataURL("image/webp", .7);
        if (i.length > 22e4) throw Error("这张图太复杂了，换一张小一点的");
        return i
    } finally {
        e.close()
    }
}

