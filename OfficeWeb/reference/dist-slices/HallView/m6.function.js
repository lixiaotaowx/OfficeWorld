function m6(r, e, t, s) {
    let i = [],
        n = "全部",
        o = 0;
    const a = Y("div", "library-browser"),
        l = Y("input"),
        A = Y("div", "library-tabs"),
        c = Y("div", "library-grid"),
        h = Y("div", "library-pager");
    l.type = "search", l.placeholder = "搜索标题、正文或分享者", l.setAttribute("aria-label", "搜索资料");
    const u = () => {
        const d = l.value.trim().toLowerCase(),
            g = i.filter(E => (n === "全部" || si(E) === n) && `${E.title} ${E.author} ${E.type==="image"?"":E.value}`.toLowerCase().includes(d)),
            p = Math.max(1, Math.ceil(g.length / 12));
        o = Math.min(o, p - 1), c.replaceChildren(), h.replaceChildren();
        for (const E of g.slice(o * 12, o * 12 + 12)) {
            const x = Y("div", "library-item"),
                B = v0("", () => e(E, g));
            B.className = "library-open";
            const b = Y("div", `library-cover library-cover-${E.type}`);
            if (E.type === "image") {
                const v = Y("img");
                v.alt = E.title, v.src = E.value, v.loading = "lazy", v.onerror = () => {
                    b.textContent = "图片暂不可用"
                }, b.append(v)
            } else b.append(Y("span", "library-kind", si(E)), Y("p", "", E.type === "note" ? E.value.slice(0, 110) : E.title));
            if (B.append(b, Y("strong", "", E.title), Y("small", "", `${E.author} · ${E9(E.at)}`)), x.append(B), E.owner === s()) {
                const v = v0("移除", () => t(E));
                v.className = "library-remove", x.append(v)
            }
            c.append(x)
        }
        g.length || c.append(Y("p", "library-empty", i.length ? "没有找到资料，试试其他关键词或分类。" : "这里还没有资料。添加第一篇文章、一张图片或一个视频链接吧。"));
        const I = v0("上一页", () => {
            o--, u()
        });
        I.disabled = o === 0;
        const C = v0("下一页", () => {
            o++, u()
        });
        C.disabled = o === p - 1, h.append(Y("span", "", `${g.length} 项资料 · ${o+1} / ${p}`), I, C)
    };
    for (const d of ["全部", "文章", "图片", "视频", "链接"]) {
        const g = v0(d, () => {
            n = d, o = 0;
            for (const p of A.querySelectorAll("button")) p.setAttribute("aria-pressed", String(p === g));
            u()
        });
        g.setAttribute("aria-pressed", String(d === n)), A.append(g)
    }
    return l.oninput = () => {
        o = 0, u()
    }, a.append(l, A, c, h), r.append(a), d => {
        i = [...d].reverse(), u()
    }
}
