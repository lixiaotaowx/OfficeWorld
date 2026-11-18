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
