// --- bindInput ---
    bindInput() {
        const e = this.renderer.domElement;
        e.addEventListener("contextmenu", t => t.preventDefault()), e.addEventListener("pointerdown", t => {
            var n, o;
            const s = document.documentElement.classList;
            if (s.contains("officeworld-desktop") && !s.contains("officeworld-fullscreen") && t.clientY < 52) return;
            if (this.billiards) {
                this.aimBilliards(t);
                return
            }
            if ((n = this.build) != null && n.down(t)) {
                this.drag = null, e.setPointerCapture(t.pointerId);
                return
            }
            const i = t.button === 2 || t.button === 1 && t.shiftKey || t.button === 0 && t.shiftKey && !((o = this.build) != null && o.armed);
            this.drag = {
                x: t.clientX,
                y: t.clientY,
                yaw: this.goal.yaw,
                pitch: this.goal.pitch,
                target: this.goal.target.clone(),
                pan: i,
                moved: !1,
                button: t.button
            }, e.setPointerCapture(t.pointerId)
        }), e.addEventListener("pointermove", t => {
            var a;
            if (this.billiards) {
                this.aimBilliards(t, !0);
                return
            }
            const s = this.drag;
            if ((a = this.build) != null && a.move(t, !!(s != null && s.moved)) && !s) return;
            if (s) {
                const l = t.clientX - s.x,
                    A = t.clientY - s.y;
                if (!s.moved && Math.abs(l) + Math.abs(A) > 5 && (s.moved = !0, this.host.classList.add("dragging"), this.unclip()), !s.moved) return;
                if (s.pan) {
                    const c = y1(this.camera, this.view.target, this.host.clientHeight);
                    this.goal.target.copy(s.target).add(Io(this.camera, l, A, c)), this.view.target.copy(this.goal.target)
                } else this.goal.yaw = s.yaw - l * .007, this.goal.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, s.pitch + A * .004));
                return
            }
            this.ray.setFromCamera(this.ndc(t), this.camera);
            const i = this.monitors.pickScreen(this.ray);
            if (this.host.classList.toggle("pointing", !!i || [...this.billiardsTables.values()].some(l => l.hit(this.ray))), i) {
                this.ring.visible = !1, this.onHover(null);
                return
            }
            const n = this.personHit(t);
            if (this.onHover(n), n) {
                this.ring.visible = !1;
                return
            }
            const o = this.floorHit(t);
            this.ring.visible = !!o, o && this.ring.position.set(o.point.x, o.point.y + .02, o.point.z)
        }), e.addEventListener("pointerup", t => {
            var c, h, u, d;
            if (this.billiards) return;
            const s = this.drag;
            if (this.drag = null, this.host.classList.remove("dragging"), (c = this.build) != null && c.up(t, !!(s && !s.moved)) || !s || s.moved || s.button !== 0) return;
            if ((h = this.me) != null && h.climbing) {
                this.onNotice("正在攀爬，请到平台后再移动");
                return
            }
            this.navigation.cancel(), this.ray.setFromCamera(this.ndc(t), this.camera);
            const i = this.floorHit(t),
                n = [...this.billiardsTables].map(([g, p]) => ({
                    id: g,
                    hit: p.hit(this.ray)
                })).filter(g => g.hit && Qt(g.hit)).sort((g, p) => g.hit.distance - p.hit.distance)[0];
            if (n && (!i || n.hit.distance <= i.distance + .03)) {
                this.onBilliardsClick(n.id);
                return
            }
            if (this.cat.root.visible && this.ray.intersectObject(this.cat.root, !0).length) {
                this.onCatClick();
                return
            }
            const o = this.monitors.pickScreen(this.ray);
            if (o) {
                clearTimeout(this.clickTimer), this.faceDisplay(o);
                return
            }
            if (this.useLive(t)) return;
            (u = this.cards) == null || u.clear();
            const a = this.partHit(t);
            if (a && ((d = this.parts.get(a.id)) == null ? void 0 : d.userData.part.kind) === "ladder") {
                this.climbLadder(a.id);
                return
            }
            const l = a ? br(this.spots, a.id, a.point, g => this.taken.has(g) && g !== this.mySpot) || this.byPart.get(a.id) : null;
            if (l) {
                this.sitAt(l);
                return
            }
            const A = this.floorHit(t);
            A && (this.stopWatching(), this.walkTo(A.point))
        }), e.addEventListener("dblclick", t => {
            var i;
            if ((i = this.build) != null && i.active || this.billiards) return;
            clearTimeout(this.clickTimer);
            const s = this.displayHit(t);
            s && this.faceDisplay(s)
        }), window.addEventListener("paste", this.paste), e.addEventListener("pointerleave", this.billiardsPointerLeave), e.addEventListener("wheel", t => {
            t.preventDefault(), !this.billiards && (t.deltaY > 0 && this.unclip(), this.goal.zoom = Math.max(.15, Math.min(9, this.goal.zoom * (1 - Math.sign(t.deltaY) * .1))))
        }, {
            passive: !1
        }), window.addEventListener("keydown", this.keydown), window.addEventListener("keyup", this.keyup), window.addEventListener("blur", this.billiardsBlur), window.addEventListener("focus", this.billiardsFocus), document.addEventListener("pointerlockchange", this.billiardsLockChange), document.addEventListener("pointerlockerror", this.billiardsLockError), document.addEventListener("pointermove", this.billiardsOverlayMove, !0)
    }

// --- keysDir ---
    keysDir() {
        if (!["w", "a", "s", "d"].some(n => this.keys.has(n))) return null;
        const e = this.view.yaw,
            t = new T(-Math.sin(e), 0, -Math.cos(e)),
            s = new T(Math.cos(e), 0, -Math.sin(e)),
            i = new T;
        return this.keys.has("w") && i.add(t), this.keys.has("s") && i.sub(t), this.keys.has("d") && i.add(s), this.keys.has("a") && i.sub(s), i.lengthSq() ? i.normalize() : null
    }

// --- walkTo ---
    walkTo(e) {
        if (!this.me || this.me.climbing) return !1;
        this.leaveSeat(), this.refreshSolids(), this.me.getUp(this.solids);
        const t = this.me,
            s = {
                x: e.x,
                y: e.y,
                z: e.z
            };
        return t.route = null, t.onArrive = null, this.navigation.start({
            kind: "walk",
            boxes: this.solids.list,
            ladders: this.ladderPaths,
            start: {
                x: t.position.x,
                y: t.position.y,
                z: t.position.z
            },
            target: s
        }, i => {
            if (!(!this.alive || this.me !== t)) {
                if (this.ripple(new T(s.x, s.y, s.z), !!i), !i) {
                    this.onNotice("没找到可走的路");
                    return
                }
                t.go(i, this.solids)
            }
        }), !0
    }

// --- climbLadder ---
    climbLadder(e) {
        const t = this.me;
        !t || t.climbing || (this.refreshSolids(), t.route = null, t.onArrive = null, this.navigation.start({
            kind: "ladder",
            boxes: this.solids.list,
            ladders: this.ladderPaths,
            start: {
                x: t.position.x,
                y: t.position.y,
                z: t.position.z
            },
            id: e
        }, s => {
            if (!(!this.alive || this.me !== t)) {
                if (!s) {
                    this.onNotice("没找到通往梯子或平台的路");
                    return
                }
                this.leaveSeat(), this.stopWatching(), t.go(s, this.solids), this.onNotice("正在走向梯子 · 自动攀爬到平台 · 在上方点击梯子可下梯")
            }
        }))
    }

// --- stepFor ---
    stepFor(e) {
        var t;
        this.refreshSolids();
        for (let s = 0; s < e; s += .05)(t = this.me) == null || t.step(.05, this.solids, null), this.people.tick(.05)
    }

// --- floorHit ---
    floorHit(e) {
        return this.ray.setFromCamera(this.ndc(e), this.camera), this.ray.intersectObjects([this.shellGroup, this.partsGroup], !0).filter(s => Qt(s) && !s.object.userData.nohit && s.face && s.face.normal.clone().transformDirection(s.object.matrixWorld).y > .5)[0] || null
    }

// --- partHit ---
    partHit(e) {
        this.ray.setFromCamera(this.ndc(e), this.camera);
        const t = mr(this.ray, [...this.parts.values()]);
        for (const s of this.ray.intersectObjects([this.partsGroup], !0)) {
            if (!Qt(s)) continue;
            if (t && t.distance < s.distance) return t;
            let i = s.object;
            for (; i && !i.userData.part;) i = i.parent;
            if (i) return {
                id: i.userData.part.id,
                point: {
                    x: s.point.x,
                    y: s.point.y,
                    z: s.point.z
                }
            }
        }
        return t
    }

// --- displayHit ---
    displayHit(e) {
        var s, i;
        const t = [...((s = this.live) == null ? void 0 : s.notes()) || [], ...this.monitors.screens()];
        for (const n of this.parts.values())
            for (const o of n.children) o.userData.display && t.push(o);
        return this.ray.setFromCamera(this.ndc(e), this.camera), this.monitors.pickScreen(this.ray) || ((i = this.ray.intersectObjects(t, !1).find(Qt)) == null ? void 0 : i.object) || null
    }

// --- faceDisplay ---
    faceDisplay(e) {
        var c;
        this.stopWatching(), (c = this.cards) == null || c.clear(), this.unclip(), this.focusedDisplay = e, e.updateWorldMatrix(!0, !1);
        const t = e.userData.display,
            s = e.getWorldScale(new T),
            i = new re().setFromObject(e).getCenter(new T),
            n = new T(0, 0, 1).applyQuaternion(e.getWorldQuaternion(new Ve)),
            o = [t.size[0] * s.x, t.size[1] * s.y],
            a = C6(i, n, o, this.host.clientWidth / Math.max(1, this.host.clientHeight));
        this.goal.target.copy(a.target), this.goal.yaw = I1(this.view.yaw, a.yaw), this.goal.pitch = a.pitch, this.goal.zoom = a.zoom;
        let l = e;
        for (; l && !l.userData.part;) l = l.parent;
        this.facingPart = l ? l.userData.part.id : null;
        const A = [];
        this.shellGroup.traverse(h => {
            const u = h;
            u.isMesh && !u.userData.ground && A.push(u)
        }), this.hidden = o4([...this.partsGroup.children, ...A], i, a.normal, o, h => h === l);
        for (const h of this.hidden) h.visible = !1;
        this.onNotice(t.label === "工位屏幕" ? "正在查看工位屏幕 · 拖动调整视角 · Esc 返回大厅" : `正对：${t.label} · 点里面的东西看详情 · Esc 回来`)
    }

// --- unclip ---
    unclip() {
        for (const e of this.hidden) e.visible = !0;
        this.hidden = [], this.facingPart = null, this.focusedDisplay = null, this.camera.near = this.ray.near = .1
    }