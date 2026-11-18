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

