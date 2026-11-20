// Hall 3D scene orchestrator (x6): renderer + scene graph lifecycle, people and
// parts wiring, build integration, pointer/keyboard routing, resize and
// context-loss recovery, render loop wiring. Single large class kept verbatim.
// Recovered from chunks/HallView.js; only imports/exports added.
import { definePrivate as m } from './hallPrelude.js';
import { W as S4, a as w9, bn as Q4, aM as Hs, aU as oi, bq as M4, G as E0, bt as Q3, R as M9, S as oe, aK as x4, bs as v3, M as K, bv as i2, k as Ye, D as C9, V as T, b as re, bu as ss, an as k0, c as ve, a$ as Ve, bc as b4 } from '../chunks/portraitLighting.js';
import { j8, D8, O8 } from './hallRenderPipeline.js';
import { W3, O3, p8, u8, H3, ai, j3, g8, A2, f8 } from './hallBilliardsUI.js';
import { ACTIVE_FRAME_INTERVAL_MS, HallRenderLifecycle, bindHallVisibility, IDLE_AFTER_MS, getHallFrameInterval, shouldRefreshHallShadows } from './hallRenderLifecycle.js';
import { v5, Ys, n1, di, ur, gr } from './hallParts.js';
import { pr, L9, Er, mr } from './hallAvatars.js';
import { ue, I1, Ns, w6, B6, y6, C6, o4, E6 } from './hallScreenView.js';
import { NavigationRequest } from './NavigationRequest.js';
import { Y8, T1 } from './hallMaterials.js';
import { yr, xr } from './hallMonitor.js';
import { po, co, M1, He, pi, Co, y1, Io } from './hallModelSync.js';
import { X0 } from './hallCatalog.js';
import { Xs, Do } from './hallPartPanel.js';
import { buildHallShell as $8, hallBounds as Bt } from './hallShell.js';
import { li, x0, k4 } from './hallBilliards.js';
import { Qo } from './hallBuildController.js';
import { Mo } from './hallBuildTray.js';
import { I6 } from './hallCards.js';
import { isPickable as Qt } from './hallPickable.js';
import { nearestSeat as br } from '../vendor/model-io.js';

class x6 {
  constructor(e) {
    m(this, "renderer", new S4({
      antialias: !0
    }));
    m(this, "scene", new w9);
    m(this, "lighting", new j8(this.scene));
    m(this, "cat", new W3(this.scene));
    m(this, "billiardsTables", new Map);
    m(this, "billiardsStates", new Map);
    m(this, "billiardsId", null);
    m(this, "billiardsLoadingId", null);
    m(this, "billiardsLoadGeneration", 0);
    m(this, "billiardsView", "overhead");
    m(this, "billiardsPointer", null);
    m(this, "billiardsEdgeX", null);
    m(this, "billiardsInputPaused", !1);
    m(this, "billiardsLookHeight", 0);
    m(this, "billiardsMouseRequest", !1);
    m(this, "billiardsWasLocked", !1);
    m(this, "billiardsUnlockedAt", 0);
    m(this, "billiardsMouseFallback", !1);
    m(this, "onBilliardsMouseChange", () => {});
    m(this, "beforeBilliards", null);
    m(this, "camera", new Q4(20, 1, .1, 200));
    m(this, "rendering", new D8(this.renderer, this.scene, this.camera));
    m(this, "observer");
    m(this, "idle");
    m(this, "cover");
    m(this, "restoreStarted", 0);
    m(this, "restoreMs", null);
    m(this, "pace", 0);
    m(this, "nap", 0);
    m(this, "loop", e => {
      if (!this.alive || !this.idle.active || this.idle.released) return;
      this.tick(e);
      const t = this.lastFrame + this.pace - performance.now();
      this.pace > ACTIVE_FRAME_INTERVAL_MS && t > 24 ? this.nap = window.setTimeout(() => {
        this.nap = 0, this.frame = requestAnimationFrame(this.loop)
      }, t - 16) : this.frame = requestAnimationFrame(this.loop)
    });
    m(this, "stopVisibility");
    m(this, "blurInput", () => {
      this.keys.clear(), this.drag = null, this.host.classList.remove("dragging")
    });
    m(this, "contextLost", () => {
      this.cover.hold(), setTimeout(() => {
        this.alive && this.idle.active && this.renderer.forceContextRestore()
      }, 0)
    });
    m(this, "contextRestored", () => {
      this.alive && (this.rendering.dispose(), this.rendering.prepare(), this.applyTime(), this.lastShadow = -1 / 0, this.idle.restored(), this.resize())
    });
    m(this, "solids", new v5);
    m(this, "parts", new Map);
    m(this, "models", new Map);
    m(this, "build", null);
    m(this, "tray", null);
    m(this, "live", null);
    m(this, "cards", null);
    m(this, "client", null);
    m(this, "hidden", []);
    m(this, "focusedDisplay", null);
    m(this, "facingPart", null);
    m(this, "watching", null);
    m(this, "player", null);
    m(this, "cinemaControls", null);
    m(this, "watchedSource", "");
    m(this, "clickTimer", 0);
    m(this, "revision", -1);
    m(this, "localAvatar", new pr(this.scene, L9.create));
    m(this, "timePick", "auto");
    m(this, "view", {
      yaw: ue.yaw,
      pitch: ue.pitch,
      zoom: ue.zoom,
      target: ue.target.clone()
    });
    m(this, "goal", {
      yaw: ue.yaw,
      pitch: ue.pitch,
      zoom: ue.zoom,
      target: ue.target.clone()
    });
    m(this, "sky", new Hs);
    m(this, "key", new oi("#ffffff", 2));
    m(this, "hemi", new M4("#ffffff", "#888888", 1));
    m(this, "shellGroup");
    m(this, "shellRemoval");
    m(this, "cutaway");
    m(this, "partsGroup", new E0);
    m(this, "batch", new O3);
    m(this, "batchAfter", 0);
    m(this, "dirty", !0);
    m(this, "ladderPaths", []);
    m(this, "navigation", new NavigationRequest());
    m(this, "keys", new Set);
    m(this, "clock", new Q3);
    m(this, "frame", 0);
    m(this, "lastFrame", 0);
    m(this, "lastShadow", -1 / 0);
    m(this, "alive", !0);
    m(this, "lastInteraction", performance.now());
    m(this, "noteInteraction", () => {
      this.lastInteraction = performance.now(), this.nap && (this.stopLoop(), this.pace = 0, this.frame = requestAnimationFrame(this.loop))
    });
    m(this, "releaseHallMaterials", Y8());
    m(this, "drag", null);
    m(this, "ray", new M9);
    m(this, "ring");
    m(this, "mark");
    m(this, "ripples", []);
    m(this, "onCatClick", () => {});
    m(this, "onBilliardsClick", () => {});
    m(this, "onBilliardsClose", () => {});
    m(this, "onNotice", () => {});
    m(this, "onHover", () => {});
    m(this, "onBuildChange", () => {});
    m(this, "paused", !1);
    m(this, "onSit", async () => !0);
    m(this, "onOfferClaim", () => {});
    m(this, "onMotion", () => {});
    m(this, "ownerOf", () => null);
    m(this, "people");
    m(this, "monitors", new yr);
    m(this, "spots", []);
    m(this, "byPart", new Map);
    m(this, "mySpot", null);
    m(this, "sentAt", 0);
    m(this, "sentKey", "");
    m(this, "monitorsAt", 0);
    m(this, "taken", new Map);
    m(this, "keydown", e => {
      var i, n, o, a, l, A, c;
      if (this.billiards) {
        e.key === "Escape" && (e.preventDefault(), this.billiardsMouseLocked || performance.now() - this.billiardsUnlockedAt < 250 ? this.releaseBilliardsMouse() : this.onBilliardsClose()), !((n = (i = e.target) == null ? void 0 : i.closest) != null && n.call(i, "input, button")) && ["ArrowLeft", "ArrowRight"].includes(e.key) && (e.preventDefault(), this.billiards.angle += (e.key === "ArrowLeft" ? -1 : 1) * Math.PI / 180);
        return
      }
      if (e.defaultPrevented || e.isComposing || (a = (o = e.target) == null ? void 0 : o.closest) != null && a.call(o, 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) return;
      const t = po(e);
      if (t) {
        e.preventDefault(), this.drag = null, this.host.classList.remove("dragging"), this.unclip(), this.stopWatching(), this.goal.yaw = this.view.yaw = I1(this.view.yaw, t.yaw), this.goal.pitch = this.view.pitch = t.pitch, this.placeCamera(), (l = this.build) == null || l.cameraChanged(), this.onNotice(`${t.label} · 小键盘 1 前视 / 3 右视 / 7 顶视 · Ctrl 反向 · Home 恢复`);
        return
      }
      const s = e.key.toLowerCase();
      if (s === "tab" && this.build) {
        e.preventDefault(), this.toggleBuild();
        return
      }
      if (!((A = this.build) != null && A.key(e))) {
        if (s === "escape") {
          (c = this.cards) != null && c.open ? this.cards.clear() : (this.watching || this.hidden.length || this.facingPart) && this.home();
          return
        }
        if (s === "home") {
          this.home();
          return
        } ["w", "a", "s", "d", "shift"].includes(s) && !e.ctrlKey && !e.metaKey && (s !== "shift" && this.navigation.cancel(), this.keys.add(s))
      }
    });
    m(this, "keyup", e => this.keys.delete(e.key.toLowerCase()));
    m(this, "billiardsLockChange", () => {
      const e = this.billiardsMouseLocked;
      this.billiardsWasLocked && !e && (this.billiardsUnlockedAt = performance.now()), this.billiardsWasLocked = e, this.billiardsPointer = null, this.billiardsEdgeX = null, e && (this.billiardsMouseFallback = !1), e && (!this.billiards || this.billiardsView !== "player") && this.releaseBilliardsMouse(), this.onBilliardsMouseChange()
    });
    m(this, "billiardsLockError", () => {
      this.billiardsMouseFallback = !0, this.onBilliardsMouseChange()
    });
    m(this, "billiardsBlur", () => {
      this.billiardsInputPaused = !0, this.keys.clear(), this.releaseBilliardsMouse()
    });
    m(this, "billiardsFocus", () => {
      this.billiardsInputPaused = !1
    });
    m(this, "billiardsOverlayMove", e => {
      !this.billiardsMouseLocked && e.target !== this.renderer.domElement && (this.billiardsPointer = null, this.billiardsEdgeX = null)
    });
    m(this, "billiardsPointerLeave", e => {
      const t = this.billiardsEdgeX !== null;
      if (this.billiardsPointer = null, this.billiardsEdgeX = null, t && !this.billiardsInputPaused && this.billiards && this.billiardsView === "player" && !this.billiardsMouseLocked && !e.relatedTarget) {
        const s = p8(e.clientX, e.clientY, this.renderer.domElement.getBoundingClientRect());
        s !== null && (this.billiardsEdgeX = s < 0 ? 0 : this.host.clientWidth)
      }
      this.ring.visible = !1, this.onHover(null)
    });
    m(this, "paste", async e => {
      var a, l, A, c, h, u;
      if ((l = (a = e.target) == null ? void 0 : a.closest) != null && l.call(a, "input, textarea") || (A = this.build) != null && A.active) return;
      const t = this.facingPart,
        s = t && this.parts.get(t);
      if (!s || !((c = X0(s.userData.part.kind)) != null && c.notes) || !this.client) return;
      const i = [...((h = e.clipboardData) == null ? void 0 : h.files) || []].find(d => d.type.startsWith("image/")),
        n = (((u = e.clipboardData) == null ? void 0 : u.getData("text")) || "").trim();
      let o = null;
      try {
        if (i ? o = {
            type: "image",
            title: "贴的图片",
            value: await Xs(i)
          } : /^https?:\/\/\S+$/.test(n) ? o = {
            type: "link",
            title: new URL(n).host.replace(/^www\./, ""),
            value: n
          } : n && (o = {
            type: "note",
            title: n.split(`
`)[0].slice(0, 30),
            value: n.slice(0, 4e3)
          }), !o) return;
        await this.client.command({
          action: "put",
          id: t,
          entry: o
        }), await this.live.refreshBoard(t), this.onNotice(`贴上去了：${o.title}`)
      } catch (d) {
        this.onNotice(d.message || "没贴上")
      }
    });
    this.host = e;
    const t = this.renderer;
    co(t), u8(t), t.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)), t.outputColorSpace = oe, t.toneMapping = x4, t.shadowMap.enabled = !0, t.shadowMap.type = v3, t.domElement.className = "hall-gl", e.prepend(t.domElement), e.classList.add("hall-host"), this.cover = new O8(e), this.key.castShadow = !0, this.configureShadows(), Object.assign(this.key.shadow.camera, {
      left: -14,
      right: 14,
      top: 14,
      bottom: -14,
      near: 1,
      far: 90
    }), this.key.shadow.camera.updateProjectionMatrix(), this.key.shadow.bias = -8e-5, this.key.shadow.normalBias = .03, this.key.shadow.radius = 2, this.key.target.position.set(0, 0, -.5), this.scene.add(this.key, this.key.target, this.hemi);
    const s = $8();
    this.shellGroup = s.group, this.cutaway = new H3(this.shellGroup), t.localClippingEnabled = !0, this.scene.add(this.shellGroup, this.partsGroup, this.batch.group), this.ray.layers.enable(ai), this.shellRemoval = new j3(this, this.shellGroup, this.partsGroup), this.people = new Er(this.scene, () => this.spots);
    const i = (n, o, a, l) => {
      const A = new K(new i2(n, o, 48), T1(new Ye({
        color: a,
        transparent: !0,
        opacity: l,
        depthWrite: !1,
        side: C9
      })));
      return A.rotation.x = -Math.PI / 2, A.userData.nohit = !0, A.renderOrder = 5, A.visible = !1, this.scene.add(A), A
    };
    this.ring = i(.15, .19, "#fff7ea", .7), this.mark = i(.06, .11, "#fff7ea", .9), this.applyTime(), this.bindInput(), this.rendering.prepare(), this.observer = new ResizeObserver(() => this.resize()), this.observer.observe(e), this.resize(), this.idle = new HallRenderLifecycle(() => {
      this.stopLoop(), this.blurInput(), !this.renderer.getContext().isContextLost() && this.host.clientWidth && this.host.clientHeight && (this.rendering.render(!!this.focusedDisplay), this.cover.present(t.domElement, performance.now(), !0)), this.cover.hold()
    }, () => {
      this.stopLoop(), this.clock.getDelta(), this.lastFrame = 0, this.resize(), this.frame = requestAnimationFrame(this.loop)
    }, () => {
      this.rendering.dispose(), this.renderer.forceContextLoss()
    }, () => {
      this.restoreStarted = performance.now(), this.renderer.forceContextRestore()
    }), window.addEventListener("blur", this.blurInput), t.domElement.addEventListener("webglcontextlost", this.contextLost), t.domElement.addEventListener("webglcontextrestored", this.contextRestored), this.frame = requestAnimationFrame(this.loop), this.stopVisibility = bindHallVisibility(this.idle, document, window);
    for (const n of ["pointerdown", "pointermove", "wheel", "keydown", "focus"]) window.addEventListener(n, this.noteInteraction, {
      capture: !0,
      passive: !0
    })
  }
  get billiardsMouseLocked() {
    return document.pointerLockElement === this.renderer.domElement
  }
  get billiards() {
    return this.billiardsId && this.billiardsTables.get(this.billiardsId) || null
  }
  stopLoop() {
    cancelAnimationFrame(this.frame), clearTimeout(this.nap), this.nap = 0
  }
  get renderQuality() {
    return this.rendering.quality
  }
  setRenderQuality(e) {
    this.rendering.dispose(), this.rendering.quality = e;
    try {
      localStorage.setItem("hall-render-quality", e)
    } catch {}
    this.configureShadows(), this.lastShadow = -1 / 0, this.idle.released || this.rendering.prepare(), this.resize()
  }
  configureShadows() {
    var t;
    const e = this.renderQuality === "high" ? 2048 : 1024;
    this.key.shadow.mapSize.x !== e && ((t = this.key.shadow.map) == null || t.dispose(), this.key.shadow.map = null, this.key.shadow.mapSize.set(e, e)), this.lighting.setQuality(this.renderQuality)
  }
  get me() {
    return this.localAvatar.actor
  }
  snapshotForSleep() {
    var s, i, n, o, a, l, A;
    if (!this.alive || this.billiardsId || this.billiardsLoadingId || (s = this.build) != null && s.active || (i = this.cards) != null && i.open || this.watching || this.focusedDisplay || (n = this.live) != null && n.playingVideo || this.navigation.pending || (o = this.me) != null && o.route || (a = this.me) != null && a.falling || ((l = this.me) == null ? void 0 : l.state) === "jump") return null;
    const e = c => ({
        yaw: c.yaw,
        pitch: c.pitch,
        zoom: c.zoom,
        target: [c.target.x, c.target.y, c.target.z]
      }),
      t = (A = this.me) == null ? void 0 : A.position;
    return {
      view: e(this.view),
      goal: e(this.goal),
      time: this.timePick,
      actor: t && this.me ? {
        x: t.x,
        y: t.y,
        z: t.z,
        rotation: this.me.holder.rotation.y,
        sittingSpot: this.mySpot
      } : null
    }
  }
  restoreSleepSnapshot(e) {
    for (const t of ["view", "goal"]) {
      const s = e[t],
        i = this[t];
      i.yaw = s.yaw, i.pitch = s.pitch, i.zoom = s.zoom, i.target.set(...s.target)
    }
    this.timePick = e.time, this.applyTime()
  }
  dispose() {
    var e, t, s, i;
    this.releaseBilliardsMouse(), document.removeEventListener("pointerlockchange", this.billiardsLockChange), document.removeEventListener("pointerlockerror", this.billiardsLockError), document.removeEventListener("pointermove", this.billiardsOverlayMove, !0), window.removeEventListener("blur", this.billiardsBlur), window.removeEventListener("focus", this.billiardsFocus);
    for (const n of ["pointerdown", "pointermove", "wheel", "keydown", "focus"]) window.removeEventListener(n, this.noteInteraction, !0);
    this.alive = !1, this.navigation.cancel(), this.stopLoop(), this.idle.dispose(), this.observer.disconnect(), this.rendering.dispose(), this.cover.dispose(), this.stopVisibility(), window.removeEventListener("blur", this.blurInput), this.renderer.domElement.removeEventListener("webglcontextlost", this.contextLost), this.renderer.domElement.removeEventListener("webglcontextrestored", this.contextRestored), this.stopWatching(), (e = this.live) == null || e.dispose(), (t = this.cards) == null || t.clear(), (s = this.build) == null || s.end(), (i = this.tray) == null || i.dispose(), this.shellRemoval.dispose(), this.cutaway.dispose(), this.cat.dispose(), this.billiardsTables.forEach(n => n.dispose()), this.billiardsTables.clear(), this.parts.forEach(n => M1(n)), this.parts.clear(), this.lighting.dispose(), this.scene.background = null, this.sky.dispose(), this.monitors.dispose(), this.batch.release(), this.partsGroup.clear(), this.people.dispose(), this.localAvatar.dispose(), window.removeEventListener("keydown", this.keydown), window.removeEventListener("paste", this.paste), window.removeEventListener("keyup", this.keyup), this.releaseHallMaterials(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.renderer.domElement.remove()
  }
  setParts(e, t, s = this.revision + 1) {
    var n, o, a, l, A;
    if (this.navigation.cancel(), this.revision = s, t) {
      this.models.clear();
      for (const c of t) this.models.set(c.id, c)
    }
    const i = new Set;
    for (const c of e) {
      i.add(c.id);
      const h = this.parts.get(c.id),
        u = !!(h != null && h.userData.modelLoadFailed);
      if (!(h && h.userData.part.version === c.version && !u)) {
        if (h && h.userData.pending) {
          h.userData.part = c;
          continue
        }
        if (h && h.userData.part.kind === c.kind && !u) h.userData.part.color !== c.color && Ys(h, c.color), n1(h, c);
        else {
          h && (this.partsGroup.remove(h), M1(h), (n = this.billiardsTables.get(c.id)) == null || n.dispose(), this.billiardsTables.delete(c.id));
          const d = He(c.kind),
            g = d ? pi(c, this.models.get(d), () => this.markDirty()) : di(c);
          if (!g) continue;
          this.partsGroup.add(g), this.parts.set(c.id, g);
          const p = li(g.children[0]);
          p && this.billiardsTables.set(c.id, p)
        }
      }
    }
    for (const [c, h] of this.parts) i.has(c) || (this.partsGroup.remove(h), M1(h), this.parts.delete(c), (o = this.billiardsTables.get(c)) == null || o.dispose(), this.billiardsTables.delete(c));
    this.setBilliardsStates(this.billiardsStates), this.billiardsLoadingId && !this.billiardsTables.has(this.billiardsLoadingId) && (this.onBilliardsClose(), this.closeBilliards()), this.billiardsId && !this.billiards ? (this.onBilliardsClose(), this.closeBilliards()) : this.billiards && this.focusBilliards(), this.dirty = !0, {
      spots: this.spots,
      byPart: this.byPart
    } = xr(e, this.models);
    for (const [c, h] of this.parts) {
      if (h.userData.part.kind !== "stool") continue;
      const u = h.children[0],
        d = this.byPart.get(c);
      u && (u.position.set(0, 0, 0), (d == null ? void 0 : d.workstation) !== void 0 && u.position.set(-Math.sin(d.face) * .08, 0, -Math.cos(d.face) * .08).applyQuaternion(h.quaternion.clone().invert()).divide(h.scale))
    }
    this.monitors.sync(this.parts), (a = this.build) == null || a.worldChanged(), (l = this.tray) == null || l.worldChanged(), (A = this.live) == null || A.sync(this.parts, s)
  }
  markDirty() {
    this.navigation.cancel(), this.dirty = !0
  }
  setBilliardsStates(e) {
    this.billiardsStates = e;
    for (const [t, s] of this.billiardsTables) {
      const i = e.get(t);
      i && s.set(i)
    }
  }
  async openBilliards(e) {
    var n;
    const t = this.billiardsTables.get(e);
    if (this.billiards || this.billiardsLoadingId || !t) return !1;
    const s = ++this.billiardsLoadGeneration;
    this.billiardsLoadingId = e;
    const i = await t.load();
    return !this.alive || s !== this.billiardsLoadGeneration || this.billiardsTables.get(e) !== t || (this.billiardsLoadingId = null, !i) ? !1 : (this.billiardsId = e, this.billiardsView = "player", this.billiardsPointer = null, this.billiardsMouseFallback = !1, this.billiardsLookHeight = 0, this.billiardsEdgeX = null, this.billiardsInputPaused = !1, this.beforeBilliards = {
      ...this.goal,
      target: this.goal.target.clone()
    }, this.stopWatching(), (n = this.cards) == null || n.clear(), this.unclip(), this.keys.clear(), this.drag = null, this.billiards.active = !0, this.ring.visible = !1, this.host.classList.add("billiards-playing"), this.renderer.domElement.tabIndex = 0, this.setBilliardsView("player"), !0)
  }
  setBilliardsView(e) {
    this.billiards && (this.billiardsView = e, this.billiardsPointer = null, this.billiardsEdgeX = null, e === "overhead" && this.releaseBilliardsMouse(), this.focusBilliards(), this.camera.up.set(0, 1, 0), this.placeCamera(), this.renderer.domElement.setAttribute("aria-label", e === "player" ? "台球游戏模式：点击锁定鼠标，移动鼠标自由转向，长按左键或空格蓄力，Esc释放鼠标" : "台球俯视视角：移动鼠标瞄准，长按左键或空格蓄力，松开击球"))
  }
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
  closeBilliards() {
    var e;
    this.billiardsLoadGeneration++, this.billiardsLoadingId && ((e = this.billiardsTables.get(this.billiardsLoadingId)) == null || e.unload()), this.billiardsLoadingId = null, this.releaseBilliardsMouse(), this.billiards && (this.billiards.active = !1, this.billiards.canShoot = !1, this.billiards.unload()), this.billiardsId = null, this.host.classList.remove("billiards-playing"), this.billiardsView = "overhead", this.billiardsPointer = null, this.camera.up.set(0, 1, 0), this.renderer.domElement.removeAttribute("tabindex"), this.renderer.domElement.removeAttribute("aria-label"), this.beforeBilliards && Object.assign(this.goal, this.beforeBilliards), this.beforeBilliards = null
  }
  attachBuild(e, t) {
    return this.client = e, this.shellRemoval.connect(e), this.build = new Qo(this, e), this.tray = new Mo(this, this.build, e, t), this.live = new Do(s => e.contents(s), s => e.screen(s)), this.cards = new I6(this.host, this.camera, {
      contents: s => e.contents(s),
      send: s => e.command(s),
      screen: s => e.screen(s),
      uploadVideo: (s, i, n) => e.uploadVideo(s, i, n)
    }, t, () => this.goal.zoom >= 2.5, s => this.onNotice(s)), this.live.sync(this.parts, this.revision), this.build
  }
  toggleBuild() {
    var t;
    const e = this.build;
    e && (e.active ? e.end() : (this.stopWatching(), (t = this.cards) == null || t.clear(), this.unclip(), e.start(), this.ring.visible = !1, this.onHover(null)), this.onBuildChange(e.active))
  }
  lookAt(e, t = this.goal.zoom) {
    this.goal.target.copy(e), this.goal.zoom = t
  }
  setPeople(e) {
    this.people.set(e), this.taken = new Map(e.filter(t => t.sittingSpot).map(t => [t.sittingSpot, t.name]))
  }
  remoteMotion(e, t) {
    this.people.motion(e, t)
  }
  seats() {
    return this.spots
  }
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
  leaveSeat() {
    this.mySpot && (this.mySpot = null, this.onSit(null))
  }
  async setMe(e, t, s = {
    x: 2.5,
    y: 0,
    z: 2.6
  }) {
    const i = await this.localAvatar.set(e, t, s);
    return this.alive && (this.dirty = !0, this.refreshSolids()), i
  }
  refreshSolids() {
    if (!this.dirty) return;
    this.batch.release(), this.batchAfter = performance.now() + 300, this.scene.updateMatrixWorld(!0);
    const e = [],
      t = new re,
      s = (i, n) => i.traverse(o => {
        var A;
        const a = o;
        if (!a.isMesh || a.userData.nohit || a.geometry.type === "PlaneGeometry" || a.geometry.type === "RingGeometry" || !n && !a.userData.solid) return;
        let l = a;
        for (; l && !l.userData.part;) l = l.parent;
        a.userData.waterBounds ? t.set(new T(-.5, 0, -.5), new T(.5, .25, .5)).applyMatrix4(a.parent.matrixWorld) : t.setFromObject(a), e.push({
          partId: (A = l == null ? void 0 : l.userData.part) == null ? void 0 : A.id,
          water: !!a.userData.waterBounds,
          x0: t.min.x,
          x1: t.max.x,
          y0: t.min.y,
          y1: t.max.y,
          z0: t.min.z,
          z1: t.max.z
        })
      });
    if (s(this.shellGroup, !1), s(this.partsGroup, !0), this.solids.set(e), this.me && this.solids.waterAt(this.me.position.x, this.me.position.z, this.me.position.y)) {
      const i = this.me.position;
      let n = null;
      for (let o = .5; o <= 20 && !n; o += .5)
        for (let a = 0; a < 32 && !n; a++) {
          const l = i.x + Math.cos(a * Math.PI / 16) * o,
            A = i.z + Math.sin(a * Math.PI / 16) * o,
            c = this.solids.groundAt(l, A, i.y + .5);
          c !== null && !this.solids.blocksAt(l, A, c) && (n = {
            x: l,
            y: c,
            z: A
          })
        }
      n && this.me.stand(n)
    }
    this.ladderPaths = ur([...this.parts.values()].map(i => i.userData.part), this.solids), this.dirty = !1
  }
  applyTime() {
    const e = this.timePick === "auto" ? Ns() : this.timePick,
      t = w6[e];
    return this.key.position.set(t.key[0], t.key[1], t.key[2]), this.key.color.set(t.kc), this.key.intensity = t.ki, this.hemi.color.set(t.hs), this.hemi.groundColor.set(t.hg), this.hemi.intensity = t.hi, this.lighting.setTime(e === "night", e === "afternoon"), this.lastShadow = -1 / 0, this.renderer.toneMappingExposure = t.exp, this.renderer.setClearColor(t.sky[1], 1), this.sky.dispose(), this.sky = B6(t.sky[0], t.sky[1]), this.scene.background = this.sky, this.host.style.background = t.sky[1], this.scene.fog = new ss(t.sky[1], 52, 140), e
  }
  cycleTime() {
    const e = ["auto", "morning", "afternoon", "night"];
    return this.timePick = e[(e.indexOf(this.timePick) + 1) % e.length], this.applyTime()
  }
  home() {
    this.unclip(), this.stopWatching(), this.goal.yaw = I1(this.view.yaw, ue.yaw), this.goal.pitch = ue.pitch, this.goal.zoom = ue.zoom, this.goal.target.copy(ue.target)
  }
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
  resize() {
    var e;
    (e = this.idle) != null && e.released || (this.billiards && (this.focusBilliards(), this.view.zoom = this.goal.zoom), this.cover.hold(), this.rendering.resize(this.host.clientWidth, this.host.clientHeight), this.placeCamera())
  }
  ndc(e) {
    const t = this.renderer.domElement.getBoundingClientRect();
    return new k0((e.clientX - t.left) / t.width * 2 - 1, -((e.clientY - t.top) / t.height) * 2 + 1)
  }
  floorHit(e) {
    return this.ray.setFromCamera(this.ndc(e), this.camera), this.ray.intersectObjects([this.shellGroup, this.partsGroup], !0).filter(s => Qt(s) && !s.object.userData.nohit && s.face && s.face.normal.clone().transformDirection(s.object.matrixWorld).y > .5)[0] || null
  }
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
  async captureBilliardsMouse() {
    if (!(!this.billiards || this.billiardsView !== "player" || this.billiardsMouseLocked || this.billiardsMouseRequest)) {
      this.billiardsMouseRequest = !0, this.billiardsPointer = null, this.billiardsEdgeX = null;
      try {
        await this.renderer.domElement.requestPointerLock()
      } catch {
        this.billiards && this.billiardsView === "player" && this.billiardsLockError()
      } finally {
        this.billiardsMouseRequest = !1
      }
    }
  }
  releaseBilliardsMouse() {
    this.billiardsPointer = null, this.billiardsEdgeX = null, this.billiardsMouseLocked && document.exitPointerLock()
  }
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
  useLive(e) {
    var A;
    if (!this.live || !this.cards || !this.me) return !1;
    this.ray.setFromCamera(this.ndc(e), this.camera);
    const t = (A = this.ray.intersectObjects(this.live.notes(), !1)[0]) == null ? void 0 : A.object;
    if (t) {
      const c = () => this.goal.zoom < 2.5 ? this.faceDisplay(t) : this.openNote(t);
      return this.later(c), !0
    }
    const s = this.partHit(e);
    if (!s) return !1;
    const i = this.parts.get(s.id),
      n = i.userData.part,
      o = X0(n.kind);
    if (!o) return !1;
    const a = new re().setFromObject(i),
      l = new T((a.min.x + a.max.x) / 2, a.max.y + .1, (a.min.z + a.max.z) / 2);
    return o.notes ? (this.later(() => {
      if (this.goal.zoom < 2.5) {
        const c = i.children.find(h => h.userData.display && !h.userData.entry);
        c && this.faceDisplay(c)
      } else this.facingPart = n.id, this.cards.contents(n.id, o.label, "大家贴的东西 · 也可以直接 Ctrl+V 粘贴", l, !0)
    }), !0) : o.cinema ? (this.later(() => this.watch(n.id)), !0) : o.teleport ? (this.teleport(n.id), !0) : o.holds ? (this.unclip(), this.cards.contents(n.id, o.label, o.hint || "里面的东西 · 点开就能看", l), !0) : !1
  }
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
  later(e) {
    clearTimeout(this.clickTimer), this.clickTimer = window.setTimeout(e, 230)
  }
  openNote(e) {
    const t = e.userData.entry,
      s = e.userData.livePart;
    this.cards.note(s, t, e.getWorldPosition(new T).add(new T(0, .2, 0)), () => void this.live.refreshBoard(s))
  }
  displayHit(e) {
    var s, i;
    const t = [...((s = this.live) == null ? void 0 : s.notes()) || [], ...this.monitors.screens()];
    for (const n of this.parts.values())
      for (const o of n.children) o.userData.display && t.push(o);
    return this.ray.setFromCamera(this.ndc(e), this.camera), this.monitors.pickScreen(this.ray) || ((i = this.ray.intersectObjects(t, !1).find(Qt)) == null ? void 0 : i.object) || null
  }
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
  unclip() {
    for (const e of this.hidden) e.visible = !0;
    this.hidden = [], this.facingPart = null, this.focusedDisplay = null, this.camera.near = this.ray.near = .1
  }
  watch(e) {
    var d, g, p;
    const t = this.parts.get(e),
      s = (d = this.live) == null ? void 0 : d.screenOf(e);
    if (!t || !s || !this.me) return;
    const i = new re().setFromObject(s),
      n = i.getCenter(new T),
      o = new T(0, 0, 1).applyQuaternion(t.getWorldQuaternion(new Ve)).setY(0).normalize();
    if (this.watching === e) {
      (g = this.cinemaControls) == null || g.toggle();
      return
    }
    if (!this.live.contentOf(e)) {
      this.cards.cinema(e, n.clone().setY(i.max.y + .1), () => void this.live.refreshScreen(e));
      return
    }
    this.stopWatching(), (p = this.cards) == null || p.clear(), this.unclip();
    const a = new T(o.z, 0, -o.x),
      l = t.userData.part.y;
    this.leaveSeat(), this.refreshSolids(), this.me.getUp(this.solids);
    const A = this.me,
      c = [];
    for (const I of [2.2, 1.6, 2.8, 3.4])
      for (const C of [0, .9, -.9, 1.6, -1.6]) c.push({
        x: n.x + o.x * I + a.x * C,
        y: l,
        z: n.z + o.z * I + a.z * C
      });
    A.route = null, A.onArrive = null, this.navigation.start({
      kind: "seat",
      boxes: this.solids.list,
      ladders: this.ladderPaths,
      start: {
        x: A.position.x,
        y: A.position.y,
        z: A.position.z
      },
      targets: c
    }, I => {
      !this.alive || this.me !== A || this.watching !== e || !I || A.go(I, this.solids, () => {
        const C = A.position;
        A.holder.rotation.y = Math.atan2(n.x - C.x, n.z - C.z)
      })
    }), this.watching = e, this.live.listen(e), this.goal.target.copy(n), this.goal.yaw = I1(this.view.yaw, Math.atan2(o.x, o.z) + .35), this.goal.pitch = .35, this.goal.zoom = 2.2;
    const h = [];
    this.shellGroup.traverse(I => {
      const C = I;
      C.isMesh && !C.userData.ground && h.push(C)
    });
    const u = s.userData.display;
    this.hidden = o4([...this.partsGroup.children, ...h], n, o, u.size, I => {
      var C;
      return I === t || !!(I.userData.part && ((C = X0(I.userData.part.kind)) != null && C.seat))
    });
    for (const I of this.hidden) I.visible = !1;
    this.cinemaControls = new E6(() => {
      var I;
      return ((I = this.live) == null ? void 0 : I.videoOf(e)) || null
    }, () => void this.cards.cinema(e, n.clone().setY(i.max.y + .1), () => void this.live.refreshScreen(e)), () => this.home(), I => this.onNotice(I)), this.host.appendChild(this.cinemaControls.element), this.updateCinema(), this.onNotice("在看影院屏 · 下方控制播放或换内容 · Esc 退出观看")
  }
  updateCinema() {
    var s, i, n;
    if (!this.watching) return;
    if (!((s = this.live) != null && s.screenOf(this.watching))) {
      this.home();
      return
    }
    const e = this.live.contentOf(this.watching),
      t = (e == null ? void 0 : e.type) === "video" ? e.src : "";
    t !== this.watchedSource && ((i = this.player) == null || i.remove(), this.player = null, this.watchedSource = t, t && (this.player = this.cards.player(t, () => this.home()))), (n = this.cinemaControls) == null || n.update(t ? void 0 : e ? "当前显示图片" : "屏幕已清空")
  }
  stopWatching() {
    var e, t, s;
    this.watching = null, this.watchedSource = "", (e = this.live) == null || e.listen(null), (t = this.player) == null || t.remove(), this.player = null, (s = this.cinemaControls) == null || s.dispose(), this.cinemaControls = null
  }
  teleport(e) {
    const t = this.me;
    if (!t) return;
    const s = [...this.parts.values()].map(l => l.userData.part).filter(l => {
        var A;
        return (A = X0(l.kind)) == null ? void 0 : A.teleport
      }),
      i = s.find(l => l.id === e),
      n = Math.hypot(t.position.x - i.x, t.position.z - i.z) < .6,
      o = n ? s[(s.indexOf(i) + 1) % s.length] : i;
    if (n && o === i) {
      this.onNotice("只有这一个传送点，再放一个才能传过去");
      return
    }
    this.leaveSeat(), this.refreshSolids(), t.getUp(this.solids), t.route = null;
    const a = this.solids.groundAt(o.x, o.z, o.y + .3) ?? o.y;
    t.stand({
      x: o.x,
      y: a,
      z: o.z
    }, t.holder.rotation.y), this.goal.target.set(o.x, a + 1.2, o.z), this.onNotice(n ? `传送到了下一个传送点（一共 ${s.length} 个）` : "到传送点上了 · 再点一下传到下一个")
  }
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
  sitMeAt(e) {
    const t = this.me,
      s = this.spots.find(i => i.id === e);
    return !t || !s || this.mySpot === e ? !1 : (t.route = null, t.sit(s.at, s.face, s.hands, s.pose), this.mySpot = e, !0)
  }
  goToDesk(e) {
    const t = this.spots.find(s => s.workstation === e);
    t ? this.sitAt(t) : this.onNotice("找不到你的工位")
  }
  timeName() {
    return this.timePick === "auto" ? Ns() : this.timePick
  }
  keysDir() {
    if (!["w", "a", "s", "d"].some(n => this.keys.has(n))) return null;
    const e = this.view.yaw,
      t = new T(-Math.sin(e), 0, -Math.cos(e)),
      s = new T(Math.cos(e), 0, -Math.sin(e)),
      i = new T;
    return this.keys.has("w") && i.add(t), this.keys.has("s") && i.sub(t), this.keys.has("d") && i.add(s), this.keys.has("a") && i.sub(s), i.lengthSq() ? i.normalize() : null
  }
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
  tickRipples(e) {
    var t;
    for (let s = this.ripples.length - 1; s >= 0; s--) {
      const i = this.ripples[s],
        n = (e - i.t0) / 600;
      if (!(n < 0)) {
        if (n >= 1) {
          this.scene.remove(i.m), i.m.geometry.dispose(), this.ripples.splice(s, 1);
          continue
        }
        i.m.scale.setScalar(.5 + n * 1.6), i.m.material.opacity = (1 - n) * .9, i.ok || (i.m.position.x = i.x + Math.sin(n * 40) * .05 * (1 - n))
      }
    }
    this.mark.visible && !((t = this.me) != null && t.route) && (this.mark.visible = !1), this.mark.visible && this.mark.scale.setScalar(1 + Math.sin(e / 180) * .12)
  }
  tick(e) {
    var d, g, p, I, C, E, x, B, b, v, L, D, P, U, R;
    if (!this.host.clientWidth || !this.host.clientHeight || this.renderer.getContext().isContextLost()) return;
    const t = this.view,
      s = this.goal,
      i = !!this.drag || !!this.billiards || [...this.billiardsTables.values()].some(Q => Q.rolling) || !!((d = this.build) != null && d.busy) || Math.abs(s.pitch - t.pitch) > .002 || Math.abs(s.yaw - t.yaw) > .002 || Math.abs(s.zoom - t.zoom) > .002 || t.target.distanceToSquared(s.target) > 1e-5;
    if (this.pace = 0, this.paused || !i && e - this.lastFrame < ACTIVE_FRAME_INTERVAL_MS) return;
    const o = !i && e - this.lastInteraction >= IDLE_AFTER_MS && (this.dirty || this.cat.shadowMoving || this.people.shadowMoving || !!((g = this.me) != null && g.route) || ((p = this.me) == null ? void 0 : p.falling) || this.keys.size > 0 || ((I = this.me) == null ? void 0 : I.state) === "walk" || ((C = this.me) == null ? void 0 : C.state) === "jump" || this.ripples.length > 0),
      a = getHallFrameInterval(e, this.lastInteraction, i, !!o, !!((E = this.live) != null && E.playingVideo));
    if (this.pace = a, !i && e - this.lastFrame < a) return;
    this.lastFrame = e;
    const l = this.cat.shadowMoving,
      A = i || this.dirty || this.people.shadowMoving || !!((x = this.me) != null && x.route) || ((B = this.me) == null ? void 0 : B.falling) || this.keys.size > 0 || ((b = this.me) == null ? void 0 : b.state) === "walk" || ((v = this.me) == null ? void 0 : v.state) === "jump",
      c = shouldRefreshHallShadows(e, this.lastShadow, e - this.lastInteraction >= IDLE_AFTER_MS, l, A);
    c && (this.lastShadow = e);
    const h = Math.min(a > ACTIVE_FRAME_INTERVAL_MS ? a / 1e3 + .01 : .05, this.clock.getDelta());
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
  setRenderActive(e) {
    this.idle.setActive(e)
  }
  debug() {
    return {
      parts: this.parts.size,
      solids: this.solids.list.length,
      seats: this.spots.length,
      mySpot: this.mySpot,
      people: this.people.list(),
      rendering: {
        revision: b4,
        quality: this.renderQuality,
        active: this.idle.active,
        released: this.idle.released,
        contextLost: this.renderer.getContext().isContextLost(),
        restoreMs: this.restoreMs,
        frame: this.renderer.info.render.frame,
        textures: this.renderer.info.memory.textures,
        geometries: this.renderer.info.memory.geometries
      },
      me: this.me && {
        p: this.me.position.toArray().map(e => +e.toFixed(2)),
        s: this.me.state
      },
      hall: Bt
    }
  }
  stepFor(e) {
    var t;
    this.refreshSolids();
    for (let s = 0; s < e; s += .05)(t = this.me) == null || t.step(.05, this.solids, null), this.people.tick(.05)
  }
}

export { x6 };
