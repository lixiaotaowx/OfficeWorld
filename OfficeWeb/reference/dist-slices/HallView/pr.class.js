class pr {
    constructor(e, t) {
        m(this, "actor", null);
        m(this, "loading", null);
        m(this, "alive", !0);
        this.parent = e, this.create = t
    }
    async set(e, t, s) {
        !this.actor && !this.loading && (this.loading = this.create(e, t).then(n => (this.alive ? (this.actor = n, this.parent.add(n.holder), n.stand(s, .4)) : n.dispose(), n)).finally(() => {
            this.loading = null
        }));
        const i = this.actor || await this.loading;
        return this.alive && (i.holder.userData.person = e, i.dress(t)), i
    }
    dispose() {
        var e;
        this.alive = !1, (e = this.actor) == null || e.dispose(), this.actor = null
    }
}

