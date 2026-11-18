function Dd(i) {
    var e;
    return typeof window > "u" || !((e = window.officeHost) != null && e.onResponse) ? () => {} : (Yt.add(i), Je || (Je = window.officeHost.onResponse(t => {
        for (const n of Yt) n(t);
        Yt.size === 0 && (Je == null || Je(), Je = void 0)
    })), () => {
        Yt.delete(i), Yt.size === 0 && (Je == null || Je(), Je = void 0)
    })
}
async function Bn() {
    var e;
    const i = typeof window > "u" || (e = window.officeHost) == null ? void 0 : e.auth;
    if (!(i != null && i.get)) return null;
    try {
        return await i.get()
    } catch {
        return null
    }
}

