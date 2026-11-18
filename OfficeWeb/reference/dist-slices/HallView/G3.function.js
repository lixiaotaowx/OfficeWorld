function G3(r) {
    const [e, t] = _.useState(null), [s, i] = _.useState("");
    return _.useEffect(() => {
        let n = !1;
        return A4(() => import("./BilliardsPanel-BCzM0yjQ.js"), __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7])).then(o => {
            n || t(() => o.default)
        }).catch(() => {
            n || i("台球加载失败，请返回后重试")
        }), () => {
            n = !0
        }
    }, []), e ? y.jsx(e, {
        ...r
    }) : y.jsx(U3, {
        onClose: r.onClose,
        error: s
    })
}
