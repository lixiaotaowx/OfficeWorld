function Ol(i) {
    const e = I.useRef(i);
    e.current = i;
    const t = [...i.requests.map(n => n.id), ...i.ringing || []].join(",");
    I.useEffect(() => {
        if (!t) return;
        const n = typeof window > "u" ? void 0 : window.officeDesktop;
        if (!(n != null && n.previewGlow) && !(n != null && n.dockGreet)) return;
        const s = () => {
            var o, c;
            const a = Ml(e.current.requests, e.current.people);
            !a && !((o = e.current.ringing) != null && o.length) || ((c = n.previewGlow) == null || c.call(n, {
                sharing: e.current.sharing,
                fade: xl,
                tone: "call"
            }).catch(() => {}), a && ks({
                id: a.id,
                name: a.name,
                appearance: a.appearance,
                mode: a.mode,
                requestId: a.requestId,
                kind: a.kind,
                offer: a.offer
            }))
        };
        s();
        const r = setInterval(s, Il);
        return () => clearInterval(r)
    }, [t])
}

