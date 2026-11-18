function n4(r, e, t, s = {}) {
    const i = Y("dialog", "hall-reader"),
        n = Y("header"),
        o = Y("h2"),
        a = Y("div", "library-actions"),
        l = Y("div", "reader-body"),
        A = Y("footer"),
        c = document.activeElement instanceof HTMLElement ? document.activeElement : null,
        h = Y("div", "reader-stage"),
        u = Y("aside", "reader-sidebar"),
        d = Y("input"),
        g = Y("nav"),
        p = Y("p", "reader-load-status");
    d.type = "search", d.placeholder = "搜索文章", d.setAttribute("aria-label", "搜索文章目录"), g.setAttribute("aria-label", "文章目录"), u.append(Y("strong", "reader-eyebrow", "文章目录"), d, p, g), h.append(u, l);
    let I = e,
        C = 1,
        E = 20,
        x = window.matchMedia("(max-width: 640px)").matches,
        B = !0,
        b = !1;
    const v = () => {
        g.replaceChildren();
        const R = t.filter(Q => Q.type === "note").filter(Q => `${Q.title} ${Q.author}`.toLowerCase().includes(d.value.toLowerCase().trim()));
        for (const Q of R) {
            const H = v0("", () => {
                I = Q, D()
            });
            H.setAttribute("aria-current", String(Q.id === I.id)), H.append(Y("span", "", Q.title), Y("small", "", `${Q.author} · ${E9(Q.at)}`)), g.append(H)
        }!R.length && !b && g.append(Y("p", "", "没有匹配的文章"))
    };
    d.oninput = v;
    const L = () => {
            B = !1, i.close(), i.remove(), c == null || c.focus()
        },
        D = () => {
            var R;
            l.replaceChildren(), l.scrollTop = 0, a.replaceChildren(), A.replaceChildren(), C = 1, i.classList.toggle("reader-document", I.type === "note"), u.hidden = I.type !== "note" || x, v(), o.textContent = I.title, i.setAttribute("aria-label", I.title), l.className = "reader-body";
            const U = Y("span", "", `${si(I)} · ${I.author} · ${E9(I.at)}`);
            if (A.append(U), I.type === "image") {
                l.classList.add("reader-image");
                const Q = Y("img");
                Q.alt = I.title, Q.src = I.value;
                const H = Y("span", "reader-status", "正在加载图片…"),
                    N = () => {
                        Q.style.width = "", Q.style.maxWidth = "100%", Q.style.maxHeight = "100%", C = 1
                    },
                    G = W => {
                        C = Math.max(.25, Math.min(4, W)), Q.style.width = `${Q.naturalWidth*C}px`, Q.style.maxWidth = "none", Q.style.maxHeight = "none"
                    };
                Q.onload = () => H.remove(), Q.onerror = () => {
                    H.textContent = "图片加载失败，请关闭后重试"
                }, Q.onclick = () => Q.style.maxWidth === "none" ? N() : G(1), a.append(v0("−", () => G(C - .25)), v0("+", () => G(C + .25)), v0("原尺寸", () => G(1)), v0("适应窗口", N));
                const q = Y("a", "", "下载图片");
                q.href = I.value, q.download = I.title, a.append(q), l.append(Q, H);
                const j = t.filter(W => W.type === "image"),
                    h0 = j.findIndex(W => W.id === I.id),
                    i0 = v0("上一张", () => {
                        I = j[h0 - 1], D()
                    });
                i0.disabled = h0 <= 0;
                const u0 = v0("下一张", () => {
                    I = j[h0 + 1], D()
                });
                u0.disabled = h0 < 0 || h0 >= j.length - 1, A.append(i0, Y("span", "", `${h0+1} / ${j.length}`), u0)
            } else if (I.type === "note") {
                o.textContent = "公告板 · 阅读室";
                const Q = Y("article", "reader-paper");
                Q.append(Y("div", "reader-eyebrow", "READING ROOM / 共享阅读"), Y("h1", "", I.title), Y("p", "reader-byline", `${I.author} · ${E9(I.at)} · ${I.value.length.toLocaleString()} 字 · 约 ${Math.max(1,Math.ceil(I.value.length/400))} 分钟`), p6(I.value)), Q.style.fontSize = `${E}px`;
                const H = W => {
                        E = Math.max(16, Math.min(32, E + W)), Q.style.fontSize = `${E}px`, N.textContent = `${E}px`
                    },
                    N = Y("span", "reader-font-size", `${E}px`),
                    G = v0(x ? "显示目录" : "专注阅读", () => {
                        x = !x, u.hidden = x, G.textContent = x ? "显示目录" : "专注阅读"
                    });
                a.append(G, v0("字号 −", () => H(-2)), N, v0("字号 +", () => H(2))), l.append(Q);
                const q = t.filter(W => W.type === "note"),
                    j = q.findIndex(W => W.id === I.id),
                    h0 = v0("← 上一篇", () => {
                        I = q[j - 1], D()
                    });
                h0.disabled = j <= 0;
                const i0 = v0("下一篇 →", () => {
                    I = q[j + 1], D()
                });
                i0.disabled = j < 0 || j >= q.length - 1;
                const u0 = Y("span", "reader-progress", "阅读 0%");
                l.onscroll = () => {
                    const W = l.scrollHeight - l.clientHeight;
                    u0.textContent = `阅读 ${W>0?Math.round(l.scrollTop/W*100):100}%`
                }, A.append(u0, h0, Y("span", "", `${j+1} / ${q.length}`), i0)
            } else {
                const Q = ut(I.value);
                if (tn(I.value)) {
                    const N = Y("video");
                    N.controls = !0, N.preload = "metadata", N.src = I.value, N.onerror = () => {
                        l.append(Y("p", "", "视频无法播放，可尝试打开原网页。"))
                    }, l.append(N)
                } else if (Q != null && Q.embed) {
                    const N = Y("iframe");
                    N.title = I.title, N.src = Q.embed, N.allow = "fullscreen; picture-in-picture", N.referrerPolicy = "no-referrer", l.append(N)
                } else l.append(Y("h3", "", I.title), Y("p", "", "此内容保留在原网站，打开原网页阅读或观看。若想在这里放大阅读文章，可添加“文章”并粘贴正文。"));
                const H = Y("a", "reader-source", "打开原网页 ↗");
                H.href = I.value, H.target = "_blank", H.rel = "noopener noreferrer", l.append(H)
            }
            if (s.remove && I.owner === ((R = s.myId) == null ? void 0 : R.call(s))) {
                const Q = v0("移除", async () => {
                    if (window.confirm(`移除“${I.title}”？`)) {
                        Q.disabled = !0;
                        try {
                            await s.remove(I), L()
                        } catch {
                            Q.textContent = "移除失败，重试", Q.disabled = !1
                        }
                    }
                });
                a.append(Q)
            }
            a.append(v0("关闭 ×", L))
        };
    n.append(o, a), i.append(n, h, A);
    for (const U of ["pointerdown", "pointerup", "click", "wheel", "keydown"]) i.addEventListener(U, R => R.stopPropagation());
    i.addEventListener("cancel", U => {
        U.preventDefault(), L()
    }), i.addEventListener("click", U => {
        U.target === i && L()
    }), r.append(i), D(), i.showModal();
    const P = async () => {
        if (!(!s.load || b)) {
            b = !0, p.textContent = "正在加载文章目录…";
            try {
                const U = await s.load();
                if (!B) return;
                t = U.some(R => R.id === e.id) ? U : [e, ...U], p.textContent = "", D()
            } catch {
                B && p.replaceChildren(Y("span", "", "目录加载失败 "), v0("重试", () => void P()))
            } finally {
                b = !1
            }
        }
    };
    return P(), () => {
        B = !1, i.close(), i.remove()
    }
}

