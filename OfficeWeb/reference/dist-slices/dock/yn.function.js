function yn({
    text: t,
    mentions: s,
    conversation: n,
    messageId: c
}) {
    const [r, i] = u.useState(""), [o, d] = u.useState(!1), m = async h => {
        var k;
        if (!o) {
            d(!0), i("");
            try {
                if (!((k = window.officeDock) != null && k.openChatTarget)) throw Error("请安装 0.1.61 或更新版本后打开链接和路径");
                const f = await window.officeDock.openChatTarget({
                    conversation: n,
                    messageId: c,
                    target: h
                });
                if (!f.ok) throw Error(f.error || "无法打开")
            } catch (f) {
                i(f instanceof Error ? f.message : "无法打开，请检查地址")
            } finally {
                d(!1)
            }
        }
    };
    return e.jsxs(pn, {
        text: t,
        children: [e.jsx("span", {
            className: "txt",
            children: kn(t).map((h, k) => h.target ? e.jsx("button", {
                type: "button",
                className: "dk-message-link",
                title: h.kind === "url" ? "在浏览器打开链接" : "打开此电脑上的文件或文件夹",
                disabled: o,
                onClick: () => void m(h.target),
                children: h.text
            }, k) : e.jsx("span", {
                children: Rt(h.text, s).map((f, b) => f.mention ? e.jsx("mark", {
                    className: "dk-mention",
                    children: f.text
                }, b) : f.text)
            }, k))
        }), r && e.jsx("small", {
            className: "dk-target-error",
            role: "alert",
            children: r
        })]
    })
}

