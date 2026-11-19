// --- setBilliardsStates ---
    setBilliardsStates(e) {
        this.billiardsStates = e;
        for (const [t, s] of this.billiardsTables) {
            const i = e.get(t);
            i && s.set(i)
        }
    }

// --- setBilliardsView ---
    setBilliardsView(e) {
        this.billiards && (this.billiardsView = e, this.billiardsPointer = null, this.billiardsEdgeX = null, e === "overhead" && this.releaseBilliardsMouse(), this.focusBilliards(), this.camera.up.set(0, 1, 0), this.placeCamera(), this.renderer.domElement.setAttribute("aria-label", e === "player" ? "台球游戏模式：点击锁定鼠标，移动鼠标自由转向，长按左键或空格蓄力，Esc释放鼠标" : "台球俯视视角：移动鼠标瞄准，长按左键或空格蓄力，松开击球"))
    }

// --- focusBilliards ---
    focusBilliards() {
        const e = this.billiards;
        if (!e) return;
        e.root.updateWorldMatrix(!0, !1), this.goal.target.copy(e.root.localToWorld(new T(0, x0.height, 0)));
        const t = new T(0, Math.sin(1.12), Math.cos(1.12)).transformDirection(e.root.matrixWorld);
        this.goal.yaw = I1(this.view.yaw, Math.atan2(t.x, t.z)), this.goal.pitch = Math.asin(t.y);
        const s = e.root.getWorldScale(new T),
            i = this.host.clientWidth / Math.max(1, this.host.clientHeight);
        this.goal.zoom = 5.8 / Math.max(x0.depth * s.z * .72, x0.width * s.x / (i * 1.6))
    }

// --- closeBilliards ---
    closeBilliards() {
        var e;
        this.billiardsLoadGeneration++, this.billiardsLoadingId && ((e = this.billiardsTables.get(this.billiardsLoadingId)) == null || e.unload()), this.billiardsLoadingId = null, this.releaseBilliardsMouse(), this.billiards && (this.billiards.active = !1, this.billiards.canShoot = !1, this.billiards.unload()), this.billiardsId = null, this.host.classList.remove("billiards-playing"), this.billiardsView = "overhead", this.billiardsPointer = null, this.camera.up.set(0, 1, 0), this.renderer.domElement.removeAttribute("tabindex"), this.renderer.domElement.removeAttribute("aria-label"), this.beforeBilliards && Object.assign(this.goal, this.beforeBilliards), this.beforeBilliards = null
    }

// --- releaseBilliardsMouse ---
    releaseBilliardsMouse() {
        this.billiardsPointer = null, this.billiardsEdgeX = null, this.billiardsMouseLocked && document.exitPointerLock()
    }

// --- aimBilliards ---
    aimBilliards(e, t = !1) {
        const s = this.billiards;
        if (!(!s || this.billiardsInputPaused))
            if (this.billiardsView === "player")
                if (this.billiardsMouseLocked) t && (s.angle = A2(s.angle, e.movementX, 1280), this.billiardsLookHeight = ve.clamp(this.billiardsLookHeight - e.movementY * .0012, -.15, .3));
                else {
                    t && this.billiardsPointer !== null && (s.angle = A2(s.angle, e.clientX - this.billiardsPointer, this.host.clientWidth));
                    const i = this.renderer.domElement.getBoundingClientRect();
                    this.billiardsPointer = e.clientX, this.billiardsEdgeX = e.clientY <= i.top || e.clientY >= i.bottom ? null : ve.clamp((e.clientX - i.left) / Math.max(1, i.width), 0, 1) * this.host.clientWidth
                }
        else this.ray.setFromCamera(this.ndc(e), this.camera), s.aim(this.ray)
    }