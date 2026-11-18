class Do {
    constructor(e, t) {
        m(this, "boards", new Map);
        m(this, "screens", new Map);
        m(this, "placeholder", null);
        m(this, "revision", -1);
        m(this, "listening", null);
        this.readContents = e, this.readScreen = t
    }
    sync(e, t) {
        var i, n;
        const s = t !== this.revision;
        this.revision = t;
        for (const [o, a] of this.boards) {
            const l = e.get(o);
            (l !== a.root || !((i = X0(l.userData.part.kind)) != null && i.notes)) && (this.disposeBoard(a), this.boards.delete(o))
        }
        for (const [o, a] of this.screens) {
            const l = e.get(o);
            (l !== a.root || !((n = X0(l.userData.part.kind)) != null && n.cinema)) && (this.disposeScreen(a), this.screens.delete(o))
        }
        for (const [o, a] of e) {
            const l = a.userData.part,
                A = X0(l.kind);
            if (A != null && A.notes) {
                let c = this.boards.get(o);
                if (!c || c.root !== a) {
                    const h = d2(A.notes.size[0], A.notes.size[1]);
                    h.material.visible = !1, h.position.set(A.notes.at[0], A.notes.at[1], A.notes.at[2]), h.userData.display = {
                        label: A.label,
                        size: A.notes.size
                    }, h.userData.livePart = o, a.add(h), c = {
                        root: a,
                        panel: h,
                        notes: [],
                        entries: [],
                        key: ""
                    }, this.boards.set(o, c)
                }(s || !c.key) && this.loadBoard(o)
            }
            if (A != null && A.cinema) {
                let c = this.screens.get(o);
                if (!c || c.root !== a) {
                    const {
                        canvas: u,
                        texture: d
                    } = this.emptyScreen(), g = d2(A.cinema.size[0], A.cinema.size[1], d);
                    g.position.set(A.cinema.at[0], A.cinema.at[1], A.cinema.at[2]), g.userData.display = {
                        label: A.label,
                        size: A.cinema.size
                    }, g.userData.livePart = o, a.add(g), c = {
                        root: a,
                        plane: g,
                        canvas: u,
                        texture: d,
                        version: -1,
                        content: null
                    }, this.screens.set(o, c)
                }
                const h = l.cinemaVersion || 0;
                h !== c.version && (c.version = h, this.loadScreen(o))
            }
        }
        this.screens.size || this.releasePlaceholder()
    }
    refreshBoard(e) {
        return this.loadBoard(e)
    }
    refreshScreen(e) {
        return this.loadScreen(e)
    }
    async loadBoard(e) {
        const t = this.boards.get(e);
        if (!t) return;
        let s;
        try {
            ({
                entries: s
            } = await this.readContents(e))
        } catch {
            return
        }
        if (this.boards.get(e) !== t) return;
        const i = s.map(h => h.id).join();
        if (i === t.key && t.notes.length) return;
        t.key = i, t.entries = s, this.clearNotes(t);
        const n = X0(t.root.userData.part.kind).notes,
            [o, a] = n.size,
            l = 4,
            A = Math.min(.4, o / l - .03),
            c = A * .75;
        s.slice(-8).forEach((h, u) => {
            const d = u % l,
                g = Math.floor(u / l),
                p = x => To(h, 256, 192, x),
                I = new f9(p());
            I.colorSpace = oe;
            const C = new k9(A, c);
            C.translate(0, -c / 2, 0);
            const E = new K(C, T1(new Ie({
                map: I,
                roughness: .95
            })));
            if (E.material.polygonOffsetUnits = -4 - u, E.position.set(n.at[0] - o / 2 + (d + .5) * (o / l), n.at[1] + a / 2 - .06 - g * (c + .1), n.at[2] + .004 + u * .002), E.rotation.z = (u * 37 % 7 - 3) * .015, E.userData.nohit = !0, E.userData.entry = h, E.userData.livePart = e, E.userData.display = {
                    label: h.title,
                    size: [A, c]
                }, t.root.add(E), t.notes.push(E), h.type === "image") {
                const x = new Image;
                x.onload = () => {
                    this.boards.get(e) !== t || !t.notes.includes(E) || (I.image = p(x), I.needsUpdate = !0)
                }, x.src = h.value
            }
        })
    }
    entriesOf(e) {
        var t;
        return ((t = this.boards.get(e)) == null ? void 0 : t.entries) || []
    }
    notes() {
        return [...this.boards.values()].flatMap(e => e.notes)
    }
    async loadScreen(e) {
        const t = this.screens.get(e);
        if (!t) return;
        let s;
        try {
            ({
                content: s
            } = await this.readScreen(e))
        } catch {
            return
        }
        this.screens.get(e) === t && JSON.stringify(t.content) !== JSON.stringify(s) && (this.stopVideo(t), t.content = s, this.paint(t), t.video && (t.video.muted = this.listening !== e))
    }
    contentOf(e) {
        var t;
        return ((t = this.screens.get(e)) == null ? void 0 : t.content) || null
    }
    videoOf(e) {
        var t;
        return ((t = this.screens.get(e)) == null ? void 0 : t.video) || null
    }
    screenOf(e) {
        var t;
        return ((t = this.screens.get(e)) == null ? void 0 : t.plane) || null
    }
    get playingVideo() {
        return [...this.screens.values()].some(e => !!e.video && !e.video.paused && !e.video.ended)
    }
    stopVideo(e) {
        var t;
        e.video && ((t = e.plane.material.map) == null || t.dispose(), e.video.pause(), e.video.removeAttribute("src"), e.video.load(), e.video = void 0, e.plane.material.map = e.texture, e.plane.material.needsUpdate = !0)
    }
    emptyScreen() {
        if (this.placeholder) return this.placeholder;
        const e = document.createElement("canvas");
        e.width = 640, e.height = 360;
        const t = e.getContext("2d");
        t.fillStyle = "#15191b", t.fillRect(0, 0, e.width, e.height), t.globalAlpha = .7, t.fillStyle = "#efe6d6", t.beginPath(), t.moveTo(e.width / 2 - 22, e.height / 2 - 26), t.lineTo(e.width / 2 + 28, e.height / 2), t.lineTo(e.width / 2 - 22, e.height / 2 + 26), t.closePath(), t.fill(), t.globalAlpha = .6, t.font = '500 22px "Microsoft YaHei",sans-serif', t.textAlign = "center", t.fillText("点一下放点什么", e.width / 2, e.height / 2 + 64), t.textAlign = "start", t.globalAlpha = 1;
        const s = new f9(e);
        return s.colorSpace = oe, this.placeholder = {
            canvas: e,
            texture: s
        }
    }
    releaseScreenPicture(e) {
        var t;
        e.texture !== ((t = this.placeholder) == null ? void 0 : t.texture) && (e.texture.dispose(), e.canvas.width = e.canvas.height = 0)
    }
    releasePlaceholder() {
        this.placeholder && (this.placeholder.texture.dispose(), this.placeholder.canvas.width = this.placeholder.canvas.height = 0, this.placeholder = null)
    }
    paint(e) {
        var h;
        if (!e.content) {
            this.releaseScreenPicture(e);
            const u = this.emptyScreen();
            e.canvas = u.canvas, e.texture = u.texture, e.plane.material.map = e.texture, e.plane.material.needsUpdate = !0;
            return
        }
        if (e.texture === ((h = this.placeholder) == null ? void 0 : h.texture)) {
            const u = document.createElement("canvas");
            u.width = 640, u.height = 360;
            const d = new f9(u);
            d.colorSpace = oe, e.canvas = u, e.texture = d, e.plane.material.map = d, e.plane.material.needsUpdate = !0
        }
        const {
            canvas: t,
            texture: s
        } = e, i = t.getContext("2d"), n = e.content;
        i.fillStyle = "#15191b", i.fillRect(0, 0, t.width, t.height);
        const o = u => {
                i.globalAlpha = .7, i.fillStyle = "#efe6d6", i.beginPath(), i.moveTo(t.width / 2 - 22, t.height / 2 - 26), i.lineTo(t.width / 2 + 28, t.height / 2), i.lineTo(t.width / 2 - 22, t.height / 2 + 26), i.closePath(), i.fill(), i.globalAlpha = .6, i.font = '500 22px "Microsoft YaHei",sans-serif', i.textAlign = "center", i.fillText(u, t.width / 2, t.height / 2 + 64), i.textAlign = "start", i.globalAlpha = 1
            },
            a = (u, d, g) => {
                if (n.fit === "stretch") return g(0, 0, t.width, t.height);
                const p = (n.fit === "cover" ? Math.max : Math.min)(t.width / u, t.height / d);
                g((t.width - u * p) / 2, (t.height - d * p) / 2, u * p, d * p)
            };
        if (s.needsUpdate = !0, n.type === "image") {
            const u = new Image;
            u.crossOrigin = "anonymous", u.onload = () => {
                e.content !== n || this.screens.get(e.plane.userData.livePart) !== e || (i.fillStyle = "#15191b", i.fillRect(0, 0, t.width, t.height), a(u.naturalWidth, u.naturalHeight, (d, g, p, I) => i.drawImage(u, d, g, p, I)), s.needsUpdate = !0)
            }, u.onerror = () => {
                e.content !== n || this.screens.get(e.plane.userData.livePart) !== e || (o("图片打不开"), s.needsUpdate = !0)
            }, u.src = n.src;
            return
        }
        const l = ut(n.src);
        if (l) {
            o(l.platform);
            return
        }
        const A = document.createElement("video");
        A.src = n.src, A.muted = !0, A.loop = !0, A.playsInline = !0, A.crossOrigin = "anonymous", e.video = A, A.play().catch(() => {});
        const c = new b3(A);
        c.colorSpace = oe, e.plane.material.map = c, e.plane.material.needsUpdate = !0, o("视频")
    }
    listen(e) {
        this.listening = e;
        for (const [t, s] of this.screens) s.video && (s.video.muted = t !== e)
    }
    clearNotes(e) {
        var t;
        for (const s of e.notes) {
            e.root.remove(s), s.geometry.dispose();
            const i = s.material;
            (t = i.map) == null || t.dispose(), i.dispose()
        }
        e.notes = []
    }
    disposeBoard(e) {
        this.clearNotes(e), e.root.remove(e.panel), e.panel.geometry.dispose(), e.panel.material.dispose()
    }
    disposeScreen(e) {
        this.stopVideo(e), e.content = null, e.root.remove(e.plane), e.plane.geometry.dispose(), e.plane.material.dispose(), this.releaseScreenPicture(e)
    }
    dispose() {
        for (const e of this.boards.values()) this.disposeBoard(e);
        this.boards.clear();
        for (const e of this.screens.values()) this.disposeScreen(e);
        this.screens.clear(), this.releasePlaceholder()
    }
}

