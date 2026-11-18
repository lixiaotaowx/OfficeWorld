function R6() {
    var s;
    const r = (s = window.officeDesktop) == null ? void 0 : s.files,
        [e, t] = _.useState("");
    return _.useEffect(() => {
        var i;
        (i = r == null ? void 0 : r.settings) == null || i.call(r).then(n => t(String((n == null ? void 0 : n.receiveDir) || ""))).catch(() => {})
    }, [r]), r != null && r.settings ? y.jsxs(G0, {
        title: "接收和保存",
        children: [y.jsx(g0, {
            label: "收文件的文件夹",
            sub: e || "读取中…",
            children: y.jsx("button", {
                type: "button",
                onClick: async () => {
                    var n;
                    const i = await ((n = r.chooseFolder) == null ? void 0 : n.call(r));
                    i != null && i.receiveDir && t(String(i.receiveDir))
                },
                children: "更改"
            })
        }), y.jsx(g0, {
            label: "打开这个文件夹",
            children: y.jsx("button", {
                type: "button",
                onClick: () => {
                    var i;
                    return void((i = r.openFolder) == null ? void 0 : i.call(r, e))
                },
                children: "打开"
            })
        })]
    }) : y.jsx(G0, {
        title: "接收和保存",
        children: y.jsx(g0, {
            label: "在浏览器里",
            sub: "同事发来的文件会下载到浏览器的下载文件夹。装了桌面客户端可以自己选文件夹"
        })
    })
}

