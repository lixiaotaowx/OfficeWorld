function gu(s) {
    const e = Nr.get(s);
    if (!e) return;
    Nr.delete(s);
    const t = (xs.get(e.texture) || 1) - 1;
    if (t > 0) {
        xs.set(e.texture, t);
        return
    }
    xs.delete(e.texture);
    const n = Jn.get(e.source);
    (n == null ? void 0 : n.get(e.key)) === e.texture && n.delete(e.key), n && !n.size && Jn.delete(e.source), e.texture !== e.source && e.texture.dispose()
}

