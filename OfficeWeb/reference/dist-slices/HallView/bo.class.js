class bo {
    constructor(e, t) {
        m(this, "ids", new Set);
        m(this, "boxes", new Map);
        m(this, "originals", []);
        m(this, "drafts", []);
        m(this, "proxy", null);
        m(this, "preview", null);
        m(this, "size", [1, 1, 1]);
        this.hall = e, this.draft = t
    }
    get primary() {
        return [...this.ids].at(-1) || null
    }
    get multiple() {
        return this.ids.size > 1
    }
    select(e, t = !1) {
        if (t || this.clear(), this.ids.has(e)) {
            this.remove(e);
            return
        }
        const s = this.hall.parts.get(e);
        if (!s) return;
        this.ids.add(e), b1(s, .22);
        const i = new h4(s, "#f2c230");
        Object.assign(i.material, {
            depthTest: !1,
            transparent: !0,
            opacity: .9
        }), i.userData.nohit = !0, i.renderOrder = 998, this.hall.scene.add(i), this.boxes.set(e, i)
    }
    remove(e) {
        const t = this.hall.parts.get(e);
        t && b1(t, 0), this.ids.delete(e);
        const s = this.boxes.get(e);
        s && (this.hall.scene.remove(s), s.geometry.dispose(), s.material.dispose(), this.boxes.delete(e))
    }
    clear() {
        for (const e of this.ids) this.remove(e);
        this.reset()
    }
    reset() {
        this.originals = [], this.drafts = [], this.proxy = this.preview = null
    }
    update() {
        for (const [e, t] of this.boxes) {
            const s = this.hall.parts.get(e);
            s && (b1(s, .22), t.setFromObject(s))
        }
    }
    bounds() {
        const e = new re;
        for (const t of this.ids) {
            const s = this.hall.parts.get(t);
            s && e.expandByObject(s)
        }
        return e
    }
    capture() {
        this.originals = [...this.ids].map(this.draft), this.drafts = [];
        const e = this.bounds(),
            t = e.getCenter(new T);
        return this.size = e.getSize(new T).toArray(), this.proxy = {
            ...this.originals[0],
            id: this.primary,
            kind: w1,
            x: t.x,
            y: e.min.y,
            z: t.z,
            rotation: 0,
            pitch: 0,
            roll: 0,
            scale: [1, 1, 1]
        }, structuredClone(this.proxy)
    }
    pose(e) {
        if (!this.proxy) return;
        const t = xo(this.originals, this.proxy, e);
        for (const s of t) {
            const i = this.hall.parts.get(s.id);
            if (!i) throw Error("选中的零件已经被删除");
            const n = i.userData.part;
            n1(i, s), i.userData.part = n
        }
        this.drafts = t, this.preview = structuredClone(e), this.hall.markDirty(), this.update()
    }
}
