function D({
    value: s,
    face: o = !1
}) {
    const a = u.useRef(null),
        e = u.useRef(s),
        t = u.useRef(() => {}),
        [n, i] = u.useState("正在加载形象…"),
        [y, A] = u.useState(0);
    e.current = s;
    const v = u.useRef(o);
    return v.current = o, u.useEffect(() => {
        const l = a.current;
        let p = !1,
            g;
        const M = r => {
            p || (console.warn("Character preview failed", r), y < 2 ? (i("正在重新加载…"), g = setTimeout(() => A(L => L + 1), 500 * (y + 1))) : i("形象预览暂时打不开"))
        };
        let f, c;
        try {
            c = new z({
                alpha: !0,
                antialias: !0
            })
        } catch (r) {
            return M(r), () => {
                p = !0, clearTimeout(g)
            }
        }
        c.setPixelRatio(Math.min(window.devicePixelRatio, 2)), c.outputColorSpace = F, l.appendChild(c.domElement);
        const C = new P,
            j = W(c, C),
            m = new w(-.85, .85, 1.06, -1.06, .1, 20);
        m.position.set(0, .86, 3), m.lookAt(0, .86, 0);
        const b = () => {
            if (p || !f) return;
            N(f, e.current), c.setSize(l.clientWidth, l.clientHeight, !1), m.left = -1.06 * l.clientWidth / Math.max(1, l.clientHeight), m.right = -m.left, m.updateProjectionMatrix();
            const r = v.current ? T(f) : m;
            v.current && (r.left = -r.top * l.clientWidth / Math.max(1, l.clientHeight), r.right = -r.left, r.updateProjectionMatrix()), c.render(C, r), l.parentElement.dataset.look = B(e.current)
        };
        t.current = b;
        const R = new ResizeObserver(b);
        return R.observe(l), i("正在加载形象…"), O(e.current).then(r => {
            if (p) {
                E(r);
                return
            }
            f = r, r.idle.play(), r.mixer.update(.1), C.add(r.model), b(), i("")
        }).catch(M), () => {
            p = !0, clearTimeout(g), t.current = () => {}, R.disconnect(), f && E(f), j(), c.dispose(), c.forceContextLoss(), c.domElement.remove()
        }
    }, [y]), u.useEffect(() => t.current(), [s, o]), h.jsxs("div", {
        className: "live-look",
        role: "img",
        "aria-label": "形象 3D 预览",
        children: [h.jsx("div", {
            className: "live-look-canvas",
            ref: a
        }), n && h.jsxs("div", {
            className: "look-loading",
            role: "status",
            children: [n, n.includes("打不开") && h.jsx("button", {
                onClick: () => A(0),
                children: "重试"
            })]
        })]
    })
}
export {
    D as L
};