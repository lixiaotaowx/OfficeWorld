class Er {
    constructor(e, t) {
        m(this, "all", new Map);
        m(this, "alive", !0);
        this.parent = e, this.spots = t
    }
    set(e) {
        var s;
        if (!this.alive) return;
        const t = new Set(e.map(i => i.id));
        for (const [i, n] of this.all) t.has(i) || ((s = n.actor) == null || s.dispose(), this.all.delete(i));
        for (const i of e) {
            const n = this.all.get(i.id);
            if (n) {
                n.actor && n.key !== ms(i.appearance) && (n.actor.dress(i.appearance), n.key = ms(i.appearance)), n.person = i;
                continue
            }
            const o = {
                person: i,
                actor: null,
                loading: !0,
                target: null,
                key: ms(i.appearance)
            };
            this.all.set(i.id, o), L9.create(i.id, i.appearance).then(a => {
                if (this.all.get(i.id) !== o) {
                    a.dispose();
                    return
                }
                o.actor = a, o.loading = !1, this.parent.add(a.holder), this.place(o, !0)
            }).catch(() => {
                o.loading = !1
            })
        }
    }
    dispose() {
        var e;
        this.alive = !1;
        for (const t of this.all.values())(e = t.actor) == null || e.dispose();
        this.all.clear()
    }
    motion(e, t) {
        const s = this.all.get(e);
        s && (s.target = t)
    }
    get shadowMoving() {
        return [...this.all.values()].some(({
            actor: e,
            target: t
        }) => {
            if (!e || !t) return !1;
            const s = e.position,
                i = Math.atan2(Math.sin(t.rot - e.holder.rotation.y), Math.cos(t.rot - e.holder.rotation.y));
            return t.moving || t.sitting !== (e.state === "sit") || Math.abs(i) > .001 || Math.abs(s.x - t.x) > .001 || Math.abs(s.y - (t.y ?? 0)) > .001 || Math.abs(s.z - t.z) > .001
        })
    }
    resting(e) {
        const t = e.person.sittingSpot ? this.spots().find(n => n.id === e.person.sittingSpot) : void 0;
        if (t) return {
            x: t.at.x,
            y: t.at.y,
            z: t.at.z,
            rot: t.face,
            moving: !1,
            sitting: !0,
            sittingSpot: t.id
        };
        const s = e.person.seat !== null ? this.spots().find(n => n.workstation === e.person.seat) : void 0;
        if (s && e.person.atDesk !== !1) return {
            x: s.at.x,
            y: s.at.y,
            z: s.at.z,
            rot: s.face,
            moving: !1,
            sitting: !0,
            sittingSpot: s.id
        };
        let i = 0;
        for (const n of this.all.keys()) {
            if (n === e.person.id) break;
            i++
        }
        return {
            x: -5.5 + i % 4 * .8,
            y: 0,
            z: 4.3 - Math.floor(i / 4) * .8,
            rot: Math.PI * .8,
            moving: !1,
            sitting: !1
        }
    }
    place(e, t) {
        const s = e.actor;
        if (!s) return;
        const i = e.target || this.resting(e);
        if (i.sitting) {
            if (s.state !== "sit" || t || e.seatedAt !== i.sittingSpot) {
                e.seatedAt = i.sittingSpot;
                const A = this.spots().find(c => c.id === i.sittingSpot);
                s.sit(A ? A.at : {
                    x: i.x,
                    y: i.y ?? 0,
                    z: i.z
                }, A ? A.face : i.rot, A == null ? void 0 : A.hands, A == null ? void 0 : A.pose)
            }
            return
        }
        s.state === "sit" && (s.state = "stand", e.seatedAt = null);
        const n = s.position,
            o = i.x - n.x,
            a = i.z - n.z,
            l = (i.y ?? 0) - n.y;
        return (t || Math.hypot(o, a) > 6) && n.set(i.x, i.y ?? 0, i.z), s.holder.rotation.y = i.rot, s.play(i.moving ? i.running ? "run" : "walk" : "idle", .2), {
            dx: o,
            dy: l,
            dz: a
        }
    }
    tick(e) {
        for (const t of this.all.values()) {
            const s = t.actor;
            if (!s) continue;
            s.animate(e);
            const i = this.place(t, !1);
            if (!i) {
                s.alignSeat();
                continue
            }
            const n = Math.min(1, e * 10);
            s.position.x += i.dx * n, s.position.z += i.dz * n, s.position.y += i.dy * Math.min(1, e * 14)
        }
    }
    holders() {
        return [...this.all.values()].flatMap(e => e.actor ? [e.actor.holder] : [])
    }
    actorOf(e) {
        var t;
        return ((t = this.all.get(e)) == null ? void 0 : t.actor) || null
    }
    list() {
        return [...this.all.values()].map(e => {
            var t, s;
            return {
                id: e.person.id,
                name: e.person.name,
                loaded: !!e.actor,
                at: (t = e.actor) == null ? void 0 : t.position.toArray().map(i => +i.toFixed(2)),
                state: (s = e.actor) == null ? void 0 : s.state
            }
        })
    }
}
