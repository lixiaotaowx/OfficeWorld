// ===== tick =====
    tick(e) {
        var d, g, p, I, C, E, x, B, b, v, L, D, P, U, R;
        if (!this.host.clientWidth || !this.host.clientHeight || this.renderer.getContext().isContextLost()) return;
        const t = this.view,
            s = this.goal,
            i = !!this.drag || !!this.billiards || [...this.billiardsTables.values()].some(Q => Q.rolling) || !!((d = this.build) != null && d.busy) || Math.abs(s.pitch - t.pitch) > .002 || Math.abs(s.yaw - t.yaw) > .002 || Math.abs(s.zoom - t.zoom) > .002 || t.target.distanceToSquared(s.target) > 1e-5;
        if (this.pace = 0, this.paused || !i && e - this.lastFrame < p9) return;
        const o = !i && e - this.lastInteraction >= Ws && (this.dirty || this.cat.shadowMoving || this.people.shadowMoving || !!((g = this.me) != null && g.route) || ((p = this.me) == null ? void 0 : p.falling) || this.keys.size > 0 || ((I = this.me) == null ? void 0 : I.state) === "walk" || ((C = this.me) == null ? void 0 : C.state) === "jump" || this.ripples.length > 0),
            a = G8(e, this.lastInteraction, i, !!o, !!((E = this.live) != null && E.playingVideo));
        if (this.pace = a, !i && e - this.lastFrame < a) return;
        this.lastFrame = e;
        const l = this.cat.shadowMoving,
            A = i || this.dirty || this.people.shadowMoving || !!((x = this.me) != null && x.route) || ((B = this.me) == null ? void 0 : B.falling) || this.keys.size > 0 || ((b = this.me) == null ? void 0 : b.state) === "walk" || ((v = this.me) == null ? void 0 : v.state) === "jump",
            c = _8(e, this.lastShadow, e - this.lastInteraction >= Ws, l, A);
        c && (this.lastShadow = e);
        const h = Math.min(a > p9 ? a / 1e3 + .01 : .05, this.clock.getDelta());
        this.billiards && this.billiardsView === "player" && !this.billiardsMouseLocked && (this.billiards.angle += f8(this.billiardsEdgeX, this.host.clientWidth) * h), this.refreshSolids(), (L = this.build) != null && L.active || this.hidden.length ? this.batch.active && (this.batch.release(), this.lastShadow = -1 / 0) : !this.batch.active && e >= this.batchAfter && (this.batchAfter = 1 / 0, this.batch.build(this.partsGroup)), this.cat.tick(h, e), this.billiardsTables.forEach(Q => Q.tick(h));
        for (const Q of this.parts.values()) Q.userData.part.kind === "water" && k4(Q, e / 1e3);
        if (this.me) {
            const Q = this.keysDir();
            if (Q && this.navigation.cancel(), Q && this.me.route && !this.me.climbing && (this.me.route = null, this.me.onArrive = null), Q && this.me.state === "sit" && (this.me.getUp(this.solids), this.leaveSeat()), Q && !this.me.climbing && !((D = this.build) != null && D.active)) {
                const H = gr(this.solids, this.ladderPaths, this.me.position, Q);
                H && (this.leaveSeat(), this.me.go(H, this.solids))
            }
            Q && (this.me.gait = this.keys.has("shift") ? "run" : "walk"), this.me.step(h, this.solids, Q, () => this.onNotice("过不去了")), this.publish(e)
        }
        this.people.tick(h), e - this.monitorsAt > 500 && (this.monitorsAt = e, this.monitors.update(this.parts, Q => this.ownerOf(Q), (this.timePick === "auto" ? Ns() : this.timePick) === "night"));
        const u = .14;
        t.yaw += (s.yaw - t.yaw) * u, t.pitch += (s.pitch - t.pitch) * u, t.zoom += (s.zoom - t.zoom) * u, t.target.lerp(s.target, u), this.placeCamera(), this.tickRipples(e), (P = this.build) == null || P.frame(), (U = this.cards) == null || U.frame(), this.updateCinema(), this.shellRemoval.tick(!!((R = this.build) != null && R.active)), this.rendering.render(!!this.focusedDisplay, c), this.cover.present(this.renderer.domElement, e), this.restoreStarted && (this.restoreMs = Math.round(performance.now() - this.restoreStarted), this.restoreStarted = 0)
    }

// ===== publish =====
    publish(e) {
        const t = this.me,
            s = t.position,
            i = t.state === "sit",
            n = {
                x: +s.x.toFixed(3),
                y: +s.y.toFixed(3),
                z: +s.z.toFixed(3),
                rot: +t.holder.rotation.y.toFixed(3),
                moving: t.state === "walk" || t.state === "jump",
                running: t.state === "walk" && t.gait === "run",
                sitting: i,
                sittingSpot: i ? this.mySpot : null
            },
            o = JSON.stringify(n);
        (o !== this.sentKey && e - this.sentAt > 70 || e - this.sentAt > 2e3) && (this.sentKey = o, this.sentAt = e, this.onMotion(n))
    }

// ===== placeCamera =====
    placeCamera() {
        const e = this.view,
            t = this.camera,
            s = this.billiards;
        if (s && this.billiardsView === "player") {
            const n = g8(t, s.root, s.eyeBall, s.angle, this.host.clientWidth, this.host.clientHeight, this.billiardsLookHeight);
            this.ray.near = t.near, this.scene.fog instanceof ss && (this.scene.fog.near = 24, this.scene.fog.far = 120), this.cutaway.update(t, n, 9, this.hidden);
            return
        }
        const i = Co(t, e.target, e.yaw, e.pitch, e.zoom, this.host.clientWidth, this.host.clientHeight);
        this.scene.fog instanceof ss && (this.scene.fog.near = i + 12, this.scene.fog.far = i + 100), t.near = y6(t, this.focusedDisplay), this.ray.near = t.near, t.updateProjectionMatrix(), this.cutaway.update(t, e.target, e.zoom, this.hidden, [...this.people.holders(), ...this.me ? [this.me.holder] : []])
    }

// ===== keysDir =====
    keysDir() {
        if (!["w", "a", "s", "d"].some(n => this.keys.has(n))) return null;
        const e = this.view.yaw,
            t = new T(-Math.sin(e), 0, -Math.cos(e)),
            s = new T(Math.cos(e), 0, -Math.sin(e)),
            i = new T;
        return this.keys.has("w") && i.add(t), this.keys.has("s") && i.sub(t), this.keys.has("d") && i.add(s), this.keys.has("a") && i.sub(s), i.lengthSq() ? i.normalize() : null
    }

// ===== ripple =====
    ripple(e, t) {
        for (let s = 0; s < 2; s++) {
            const i = new K(new i2(.2, .24, 48), T1(new Ye({
                color: t ? "#fff7ea" : "#c96a5a",
                transparent: !0,
                depthWrite: !1,
                side: C9
            })));
            i.rotation.x = -Math.PI / 2, i.position.set(e.x, e.y + .02, e.z), i.userData.nohit = !0, i.renderOrder = 5, this.scene.add(i), this.ripples.push({
                m: i,
                t0: performance.now() + s * 140,
                ok: t,
                x: e.x
            })
        }
        t && (this.mark.position.set(e.x, e.y + .02, e.z), this.mark.visible = !0)
    }

// ===== stepFor =====
    stepFor(e) {
        var t;
        this.refreshSolids();
        for (let s = 0; s < e; s += .05)(t = this.me) == null || t.step(.05, this.solids, null), this.people.tick(.05)
    }

// ===== later =====
    later(e) {
        clearTimeout(this.clickTimer), this.clickTimer = window.setTimeout(e, 230)
    }

// ===== goToDesk =====
    goToDesk(e) {
        const t = this.spots.find(s => s.workstation === e);
        t ? this.sitAt(t) : this.onNotice("找不到你的工位")
    }

// ===== sitMeAt =====
    sitMeAt(e) {
        const t = this.me,
            s = this.spots.find(i => i.id === e);
        return !t || !s || this.mySpot === e ? !1 : (t.route = null, t.sit(s.at, s.face, s.hands, s.pose), this.mySpot = e, !0)
    }