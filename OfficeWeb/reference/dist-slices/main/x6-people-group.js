// --- setPeople ---
    setPeople(e) {
        this.people.set(e), this.taken = new Map(e.filter(t => t.sittingSpot).map(t => [t.sittingSpot, t.name]))
    }

// --- remoteMotion ---
    remoteMotion(e, t) {
        this.people.motion(e, t)
    }

// --- seats ---
    seats() {
        return this.spots
    }

// --- sitAt ---
    sitAt(e) {
        const t = this.me;
        if (!t) return;
        if (this.taken.has(e.id) && e.id !== this.mySpot) {
            this.onNotice(`${this.taken.get(e.id)}坐在这里`);
            return
        }
        const s = e.workstation !== void 0 ? this.ownerOf(e.workstation) : null;
        if (s && !s.mine) {
            this.onNotice(`这是${s.name}的工位`);
            return
        }
        this.refreshSolids(), t.getUp(this.solids), t.route = null, t.onArrive = null, this.navigation.start({
            kind: "seat",
            boxes: this.solids.list,
            ladders: this.ladderPaths,
            start: {
                x: t.position.x,
                y: t.position.y,
                z: t.position.z
            },
            targets: e.approaches
        }, i => {
            if (!(!this.alive || this.me !== t)) {
                if (!i) {
                    this.onNotice("没找到可走的路");
                    return
                }
                t.go(i, this.solids, () => {
                    this.onSit(e.id).then(n => {
                        n && (t.sit(e.at, e.face, e.hands, e.pose), this.mySpot = e.id, e.workstation !== void 0 && !s && this.onOfferClaim(e.workstation))
                    })
                })
            }
        })
    }

// --- leaveSeat ---
    leaveSeat() {
        this.mySpot && (this.mySpot = null, this.onSit(null))
    }

// --- sitMeAt ---
    sitMeAt(e) {
        const t = this.me,
            s = this.spots.find(i => i.id === e);
        return !t || !s || this.mySpot === e ? !1 : (t.route = null, t.sit(s.at, s.face, s.hands, s.pose), this.mySpot = e, !0)
    }

// --- goToDesk ---
    goToDesk(e) {
        const t = this.spots.find(s => s.workstation === e);
        t ? this.sitAt(t) : this.onNotice("找不到你的工位")
    }

// --- personHit ---
    personHit(e) {
        const t = [...this.people.holders(), ...this.me ? [this.me.holder] : []];
        this.ray.setFromCamera(this.ndc(e), this.camera);
        const s = this.ray.intersectObjects(t, !0)[0];
        if (!s) return null;
        let i = s.object;
        for (; i && i.userData.person === void 0;) i = i.parent;
        if (!i) return null;
        const n = i.position.clone();
        return n.y += 1.85, n.project(this.camera), {
            id: i.userData.person,
            x: (n.x + 1) / 2 * this.host.clientWidth,
            y: (1 - n.y) / 2 * this.host.clientHeight
        }
    }