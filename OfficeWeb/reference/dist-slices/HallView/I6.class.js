class I6 {
    constructor(e, t, s, i, n, o) {
        m(this, "card", null);
        m(this, "at", null);
        m(this, "closeReader", null);
        this.host = e, this.camera = t, this.api = s, this.myId = i, this.centred = n, this.notice = o
    }
    get open() {
        return !!this.card
    }
    clear() {
        var e, t;
        (e = this.closeReader) == null || e.call(this), this.closeReader = null, (t = this.card) == null || t.remove(), this.card = null, this.at = null
    }
    show(e, t) {
        this.clear(), this.card = e, e.classList.add("hall-card");
        for (const s of ["pointerdown", "wheel", "keydown"]) e.addEventListener(s, i => i.stopPropagation());
        e.addEventListener("keydown", s => {
            s.key === "Escape" && this.clear()
        }), this.centred() || !t ? e.classList.add("centered") : this.at = t.clone(), this.host.appendChild(e), this.frame()
    }
    frame() {
        if (!this.card || !this.at) return;
        const e = this.at.clone().project(this.camera),
            t = this.host.clientWidth,
            s = this.host.clientHeight,
            i = this.card.getBoundingClientRect();
        this.card.style.left = `${Math.max(i.width/2+8,Math.min(t-i.width/2-8,(e.x+1)/2*t))}px`, this.card.style.top = `${Math.max(i.height+20,Math.min(s-8,(1-e.y)/2*s))}px`
    }
    async contents(e, t, s, i, n = !1) {
        var R, Q, H;
        const o = f0("div", "hall-library"),
            a = f0("strong", "", t + (n ? " · 添加内容" : " · 资料库")),
            l = f0("small", "", s),
            A = f0("div", "list"),
            c = f0("small", "seen"),
            h = f0("div", "library-header");
        h.append(a, bt("关闭 ×", () => this.clear())), l.textContent = "收藏文章、图片与视频 · 点击卡片放大查看", o.append(h, l), n ? (o.classList.add("board-composer"), l.textContent = "把文章、图片或链接贴到板子上") : o.append(c, A);
        const u = m6(A, (N, G) => {
                var q;
                (q = this.closeReader) == null || q.call(this), this.closeReader = n4(this.host, N, G)
            }, N => {
                window.confirm(`移除“${N.title}”？`) && this.take(e, N, g)
            }, this.myId),
            d = (N, G) => {
                var j;
                u(N);
                const q = [(j = G.creator) == null ? void 0 : j.name, ...G.readers.map(h0 => h0.name)].filter(Boolean);
                c.textContent = q.length ? `${q.length} 人看过 · ${q.slice(0,4).join("、")}${q.length>4?" 等":""}` : ""
            },
            g = async () => {
                l.textContent = "正在加载资料…";
                try {
                    const N = await this.api.contents(e);
                    this.card === o && (d(N.entries, N.people), l.textContent = "点击卡片放大查看 · 图片支持原尺寸")
                } catch (N) {
                    l.textContent = At(N, "读不出来")
                }
            }, p = bt("刷新资料", () => void g());
        n || o.append(p);
        let I = n ? "note" : "link";
        const C = f0("form", "add"),
            E = f0("input"),
            x = f0("textarea"),
            B = f0("input");
        E.placeholder = "起个名字", E.maxLength = 100, E.setAttribute("aria-label", "名字"), x.rows = 2, x.setAttribute("aria-label", "内容"), B.type = "file", B.accept = "image/png,image/jpeg,image/webp", B.hidden = !0;
        let b = "";
        const v = N => {
                I = N, b = "", x.hidden = N === "image", L.hidden = N !== "image", L.textContent = "选一张图片", x.placeholder = N === "link" ? "粘贴文章或视频链接 https://…" : "粘贴文章正文或 Markdown（最多 40000 字）…", x.maxLength = N === "link" ? 2048 : 4e4
            },
            L = bt("选一张图片", () => B.click(), "pick");
        B.addEventListener("change", async () => {
            var G;
            const N = (G = B.files) == null ? void 0 : G[0];
            if (B.value = "", !!N) try {
                b = await Xs(N), L.textContent = `✓ ${N.name}`, E.value || (E.value = N.name.replace(/\.[^.]+$/, "").slice(0, 100))
            } catch (q) {
                this.notice(At(q, "图片太大或格式不支持（PNG、JPEG、WebP）"))
            }
        });
        const D = f0("button", "go", n ? "贴上去" : "放进去");
        if (D.type = "submit", C.append(r4([
                ["link", "链接 / 视频"],
                ["note", "文章"],
                ["image", "图片"]
            ], I, v), E, x, L, B, D), C.addEventListener("submit", async N => {
                N.preventDefault();
                const G = I === "image" ? b : x.value.trim(),
                    q = E.value.trim() || (I === "link" ? (() => {
                        try {
                            return new URL(G).host
                        } catch {
                            return ""
                        }
                    })() : G.slice(0, 20));
                if (!G) {
                    this.notice(I === "image" ? "先选一张图片" : "写点内容");
                    return
                }
                D.disabled = !0;
                try {
                    await this.api.send({
                        action: "put",
                        id: e,
                        entry: {
                            type: I,
                            title: q,
                            value: G
                        }
                    }), E.value = "", x.value = "", v(I), n ? (this.clear(), this.notice("已贴到公告板")) : await g()
                } catch (j) {
                    this.notice(At(j, "没放进去"))
                } finally {
                    D.disabled = !1
                }
            }), v(n ? "note" : "link"), n) {
            x.rows = 8, o.append(C), this.show(o, null), E.focus();
            return
        }
        const P = f0("details", "library-composer"),
            U = f0("summary", "", "+ 添加资料");
        P.append(U, C), o.appendChild(P), this.show(o, null), l.textContent = "正在加载资料…";
        try {
            const N = await this.api.contents(e);
            if (this.card !== o) return;
            if (d(N.entries, N.people), l.textContent = "点击卡片放大查看 · 图片支持原尺寸", !N.people.readers.some(G => G.id === this.myId()) && ((R = N.people.creator) == null ? void 0 : R.id) !== this.myId()) {
                const q = (H = (Q = (await this.api.send({
                    action: "read",
                    id: e
                })).parts) == null ? void 0 : Q.find(j => j.id === e)) == null ? void 0 : H.chestPeople;
                q && this.card === o && d(N.entries, q)
            }
        } catch (N) {
            l.textContent = At(N, "读不出来")
        }
    }
    async take(e, t, s) {
        try {
            await this.api.send({
                action: "take",
                id: e,
                entryId: t.id
            }), await s(), this.notice(`拿走了“${t.title}”`)
        } catch (i) {
            this.notice(At(i, "没拿走"))
        }
    }
    note(e, t, s, i) {
        this.clear(), this.closeReader = n4(this.host, t, [t], {
            load: async () => (await this.api.contents(e)).entries,
            remove: async n => {
                await this.api.send({
                    action: "take",
                    id: e,
                    entryId: n.id
                }), i()
            },
            myId: this.myId
        })
    }
    async cinema(e, t, s) {
        const i = f0("div", "wide"),
            n = f0("small", "status"),
            o = f0("input");
        o.placeholder = "粘贴图片、视频或 YouTube / Vimeo 链接", o.setAttribute("aria-label", "链接");
        const a = f0("input");
        a.type = "file", a.hidden = !0, a.accept = "image/png,image/jpeg,image/webp,video/mp4,video/webm";
        let l = "",
            A = null,
            c = "contain",
            h = 0;
        const u = f0("button", "go", "放到屏幕上");
        u.type = "button";
        const d = bt("清空屏幕", () => void p(null)),
            g = async () => {
                A = null, u.disabled = !0;
                const C = Ro(o.value);
                if (!C) {
                    n.textContent = "";
                    return
                }
                n.textContent = "正在识别…";
                try {
                    A = await Fo(C, AbortSignal.timeout(9e3)), l = C, n.textContent = A === "image" ? "是一张图片" : `是视频${ut(C)?`（${ut(C).platform}）`:""}`, u.disabled = !1
                } catch {
                    n.textContent = "认不出来：要 https 开头的图片或视频链接"
                }
            };
        o.addEventListener("change", () => void g()), o.addEventListener("paste", () => setTimeout(() => void g(), 0)), a.addEventListener("change", async () => {
            var E;
            const C = (E = a.files) == null ? void 0 : E[0];
            if (a.value = "", !!C) {
                u.disabled = !0;
                try {
                    C.type.startsWith("image/") ? (l = await Xs(C), A = "image") : (l = await this.api.uploadVideo(e, C, x => {
                        n.textContent = `上传中 ${x}%`
                    }), A = "video"), o.value = "", n.textContent = `✓ ${C.name}`, u.disabled = !1
                } catch (x) {
                    n.textContent = At(x, "传不上去：图片 20 MB、视频 100 MB 以内，MP4 或 WebM")
                }
            }
        });
        const p = async C => {
            u.disabled = d.disabled = !0;
            try {
                await this.api.send({
                    action: "cinema",
                    id: e,
                    version: h,
                    content: C
                }), h = (await this.api.screen(e)).version, n.textContent = C ? "放上去了，大家都能看到" : "清空了", s()
            } catch (E) {
                n.textContent = At(E, "没放上去")
            } finally {
                u.disabled = !A, d.disabled = !1
            }
        };
        u.addEventListener("click", () => {
            A && p({
                type: A,
                src: l,
                fit: c
            })
        }), u.disabled = !0;
        const I = f0("div", "row");
        I.append(d, u), i.append(f0("strong", "", "影院屏"), f0("small", "", "放一张图或一段视频，大厅里的人都能看到"), o, bt("或者从电脑里选一个文件", () => a.click(), "pick"), a, r4([
            ["contain", "完整显示"],
            ["cover", "铺满"],
            ["stretch", "拉伸"]
        ], c, C => {
            c = C
        }), n, I), this.show(i, t);
        try {
            const C = await this.api.screen(e);
            h = C.version, C.content && (c = C.content.fit, !C.content.src.startsWith("data:") && !C.content.src.startsWith("/api/") && (o.value = C.content.src), n.textContent = "现在在放：" + (C.content.type === "image" ? "图片" : "视频"))
        } catch (C) {
            n.textContent = At(C, "读不出来")
        }
    }
    player(e, t) {
        const s = ut(e);
        if (!(s != null && s.embed)) return null;
        const i = f0("div", "hall-player"),
            n = f0("iframe");
        return n.src = s.embed.replace("autoplay=0", "autoplay=1"), n.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen", n.title = "视频", i.append(n, bt("×", () => {
            i.remove(), t()
        }, "close")), i.addEventListener("pointerdown", o => o.stopPropagation()), this.host.appendChild(i), i
    }
}
