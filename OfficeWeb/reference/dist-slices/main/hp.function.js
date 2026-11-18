function Hp({
    account: i,
    onLogout: e
}) {
    const t = Up(),
        n = I.useRef(t);
    n.current = t;
    const s = I.useMemo(() => ({
        snapshot: () => {
            const r = n.current;
            return {
                people: r.people,
                myId: r.myId,
                previews: r.previews,
                sharing: r.sharing,
                connected: r.connected,
                transfers: r.files.dockRows()
            }
        }
    }), []);
    return v.jsx(zc, {
        office: t,
        account: i,
        onLogout: e,
        dockPublisher: s
    })
}

