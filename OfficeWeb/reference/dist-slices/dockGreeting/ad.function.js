function ad(p, S, f) {
    const [R, E] = gr.useState(1);
    return gr.useEffect(() => {
        E(1)
    }, [S, f]), gr.useEffect(() => {
        const z = p.current;
        if (!S || !z) return;
        const F = O => {
            if (O.buttons || O.target.closest("button, .screen-stage-bar")) return;
            O.preventDefault();
            const M = O.deltaY * (O.deltaMode === 1 ? 16 : O.deltaMode === 2 ? innerHeight : 1);
            E(A => Math.max(1, Math.min(4, A * Math.exp(-M * .0015))))
        };
        return z.addEventListener("wheel", F, {
            passive: !1
        }), () => z.removeEventListener("wheel", F)
    }, [p, S, f]), [R, E]
}

