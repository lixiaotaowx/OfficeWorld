class L9 {
    constructor(e, t) {
        m(this, "holder", new E0);
        m(this, "state", "stand");
        m(this, "route", null);
        m(this, "onArrive", null);
        m(this, "gait", "walk");
        m(this, "vy", 0);
        m(this, "stuck", 0);
        m(this, "current", "");
        m(this, "disposed", !1);
        m(this, "seatAnchor", null);
        m(this, "seatPose");
        m(this, "handTargets");
        m(this, "seatRotations", new Map);
        m(this, "jump", null);
        this.c = e, this.id = t, this.holder.add(e.model), this.holder.userData.person = t, this.play("idle")
    }
    static async create(e, t) {
        var i;
        const s = await A3(t);
        if (!i9) {
            const n = I2(s, s.walk.getClip()),
                o = I2(s, (i = s.run) == null ? void 0 : i.getClip());
            i9 = {
                walk: (n || .45) * p2,
                run: (o || n || .45) * m2
            }
        }
        return s.walk.timeScale = p2, s.run && (s.run.timeScale = m2), new L9(s, e)
    }
    get climbing() {
        var e, t;
        return !!((t = (e = this.route) == null ? void 0 : e[0]) != null && t.climb)
    }
    get falling() {
        return this.vy !== 0
    }
    get position() {
        return this.holder.position
    }
    dress(e) {
        c3(this.c, e)
    }
    dispose() {
        this.disposed || (this.disposed = !0, this.holder.removeFromParent(), h3(this.c))
    }
    play(e, t = .25) {
        if (this.current === e) return;
        const s = e === "idle" ? this.c.idle : e === "walk" ? this.c.walk : e === "run" ? this.c.run || this.c.walk : e === "sit" ? this.c.action("SeatedTyping_Type", "Sitting", "Sit") : e === "jump" ? this.c.action("Jump") : this.c.action("Wave");
        if (!s) return;
        s.reset().fadeIn(t).play();
        const i = this.current && this.actionFor(this.current);
        i && i !== s && i.fadeOut(t), this.current = e
    }
    actionFor(e) {
        return e === "idle" ? this.c.idle : e === "walk" ? this.c.walk : e === "run" ? this.c.run || this.c.walk : e === "sit" ? this.c.action("SeatedTyping_Type", "Sitting", "Sit") : e === "jump" ? this.c.action("Jump") : this.c.action("Wave")
    }
    stand(e, t) {
        this.holder.position.set(e.x, e.y, e.z), t !== void 0 && (this.holder.rotation.y = t), this.state = "stand", this.route = null, this.onArrive = null, this.play("idle")
    }
    sit(e, t, s, i) {
        this.route = null, this.onArrive = null, this.play("sit", .3), this.holder.rotation.y = t, this.holder.position.set(e.x, e.y, e.z), this.seatAnchor = {
            ...e
        }, this.handTargets = s, this.seatPose = i, this.c.mixer.update(0), this.state = "sit", this.alignSeat()
    }
    restoreSeatPose() {
        for (const [e, t] of this.seatRotations) e.quaternion.copy(t);
        this.seatRotations.clear()
    }
    alignSeat() {
        if (this.restoreSeatPose(), !(this.state !== "sit" || !this.seatAnchor)) {
            for (const e of this.c.bones.values()) this.seatRotations.set(e, e.quaternion.clone());
            Ar(this.c, this.holder, this.seatAnchor, this.handTargets, this.seatPose)
        }
    }
    animate(e) {
        this.restoreSeatPose(), this.c.mixer.update(e), this.alignSeat()
    }
    getUp(e) {
        if (this.state !== "sit") return;
        const t = this.holder.position,
            s = this.holder.rotation.y,
            i = t.x + Math.sin(s) * .6,
            n = t.z + Math.cos(s) * .6;
        t.set(i, e.groundAt(i, n, t.y + .8) ?? 0, n), this.state = "stand", this.play("idle")
    }
    go(e, t, s) {
        return e ? (this.getUp(t), this.route = e.map(i => ({
            ...i
        })), this.onArrive = s || null, this.stuck = 0, !0) : !1
    }
    startJump(e, t, s) {
        this.jump = {
            from: this.holder.position.clone(),
            to: new T(e, s, t),
            t: 0,
            dur: .55
        }, this.state = "jump";
        const i = this.c.action("Jump");
        i && (i.timeScale = i.getClip().duration / .7), this.play("jump", .08)
    }
    step(e, t, s, i) {
        var a;
        const n = this.holder.position;
        if (this.animate(e), this.jump) {
            const l = this.jump;
            l.t = Math.min(1, l.t + e / l.dur), n.lerpVectors(l.from, l.to, l.t), n.y += Math.sin(l.t * Math.PI) * (.35 + Math.max(0, l.to.y - l.from.y) * .35), l.t >= 1 && (n.copy(l.to), this.jump = null, this.state = "walk", this.vy = 0);
            return
        }
        let o = null;
        for (; this.route && this.route.length;) {
            const l = this.route[0];
            if (l.climb) {
                const c = new T(l.x, l.y, l.z),
                    h = n.distanceTo(c);
                if (h > .001) {
                    const u = n.clone().lerp(c, Math.min(1, cr * e / h));
                    if (!l.climb.every(d => t.list.some(g => g.partId === d)) || !(l.climbEntry ? S5(t, n, l, l.climb) : D1(t, n, u, l.climb))) {
                        this.route = null, this.onArrive = null, this.state = "stand", this.play("idle"), i == null || i();
                        return
                    }
                    n.copy(u), this.vy = 0, this.state = "walk", this.play("walk"), l.face !== void 0 && (this.holder.rotation.y = l.face);
                    return
                }
            }
            const A = new T(l.x - n.x, 0, l.z - n.z);
            if (A.length() >= .08) {
                o = A.normalize();
                break
            }
            if (this.route.shift(), !this.route.length) {
                this.route = null;
                const c = this.onArrive;
                this.onArrive = null, this.state === "walk" && (this.state = "stand", this.play("idle")), c == null || c()
            }
        }
        if (!o && s && this.state !== "sit" && (o = s), o && (this.state === "stand" || this.state === "walk")) {
            let l = 0;
            if (this.route) {
                let C = n;
                for (const E of this.route) l += Math.hypot(E.x - C.x, E.z - C.z), C = E
            }
            this.route && (this.gait = l > (this.gait === "run" ? 1.2 : 2.5) ? "run" : "walk"), this.state = "walk", this.play(this.gait, .18), this.holder.rotation.y = Math.atan2(o.x, o.z);
            const A = (this.gait === "run" ? i9.run : i9.walk) * e,
                c = n.x + o.x * A,
                h = n.z + o.z * A,
                u = t.groundAt(c, h, n.y + P0 + .05),
                d = (a = this.route) == null ? void 0 : a[0];
            if (d && d.y > n.y + P0 && Math.hypot(d.x - n.x, d.z - n.z) < 1.05) {
                const C = t.canJump(n, d.x, d.z);
                if (C !== null) {
                    this.startJump(d.x, d.z, C);
                    return
                }
            }
            const g = t.groundAt(n.x + o.x * .28, n.z + o.z * .28, n.y + P0 + .05),
                p = Math.max(u ?? -9, n.y, g !== null && g <= n.y + P0 ? g : -9),
                I = !this.route && u !== null && t.blocksAt(n.x + o.x * (A + .05), n.z + o.z * (A + .05), p);
            if (!this.route && (I || u === null || u > n.y + P0))
                for (const C of [.4, .6]) {
                    const E = n.x + o.x * C,
                        x = n.z + o.z * C,
                        B = t.canJump(n, E, x);
                    if (B !== null) {
                        this.startJump(E, x, B);
                        return
                    }
                }
            if (I || u === null || u > n.y + P0) {
                if (this.stuck += e, this.stuck > .25)
                    if (this.stuck = 0, this.route && this.onArrive) {
                        const C = this.route[this.route.length - 1];
                        n.set(C.x, t.groundAt(C.x, C.z, C.y + 1) ?? C.y, C.z), this.route = null;
                        const E = this.onArrive;
                        this.onArrive = null, this.state = "stand", E()
                    } else this.route = null, this.state = "stand", this.play("idle"), i == null || i()
            } else this.stuck = 0, n.x = c, n.z = h, u >= n.y - .02 && (n.y = u, this.vy = 0)
        } else this.state === "walk" && !o && (this.state = "stand", this.play("idle"));
        if (this.state === "stand" || this.state === "walk") {
            const l = t.groundAt(n.x, n.z, n.y + .05);
            if (l === null || l < n.y - .02) {
                this.vy === 0 && l !== null && l < n.y - .3 && this.play("jump", .1), this.vy -= fr * e, n.y += this.vy * e;
                const A = l ?? -20;
                n.y <= A && (n.y = A, this.vy = 0)
            }
        }
        n.y < -10 && (n.set(0, 0, 2.5), this.vy = 0)
    }
}
