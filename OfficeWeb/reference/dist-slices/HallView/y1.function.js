function y1(r, e, t) {
    return r instanceof ri ? (r.top - r.bottom) / r.zoom / Math.max(1, t) : r instanceof Q4 ? 2 * Math.max(r.near, -e.clone().applyMatrix4(r.matrixWorldInverse).z) * Math.tan(r.fov * Math.PI / 360) / r.zoom / Math.max(1, t) : 0
}
async function ot(r = "", e) {
    const t = () => fetch(`/api/build${r}`, {
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.timeout(15e3),
        ...e ? {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(e)
        } : {}
    });
    let s = await t();
    for (let n = 0; s.status === 429 && e && n < 5; n++) await new Promise(o => setTimeout(o, 150)), s = await t();
    const i = await s.json().catch(() => ({}));
    if (!s.ok) throw Error(i.error || "现在存不了，等一下再试");
    return i
}
