// Hall billiards UI: cat greeting dialog (P3/U3/G3), the table state chip
// classes (O3/H3/j3/W3/J3), the KTX2 table-texture loader (h8/kt/u8/d8) and
// camera/billiards glue (K6/X6/g8/A2/f8/p8/Tt).
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { r as _, j as y } from '../chunks/dockGreeting.js';
import { definePrivate as m } from './hallPrelude.js';
import { G as E0, B as k1, m as c4, M as K, P as ii, V as T, R as M9, b as re, c as ve, d as h4, e as Qn, f as U0, g as Ie, ai as w4, aj as On, S as oe } from '../chunks/portraitLighting.js';
import { isPickable as Qt } from './hallPickable.js';
import { KTX2Loader as J0 } from '../vendor/ktx2Loader.js';
import { x0 } from './hallBilliards.js';

function P3({
  onClose: r,
  interact: e
}) {
  const [t, s] = _.useState("喵～你好。走到我身边，可以和我打招呼。"), [i, n] = _.useState(!1);
  _.useEffect(() => {
    const a = l => {
      l.key === "Escape" && (l.stopPropagation(), r())
    };
    return window.addEventListener("keydown", a, !0), () => window.removeEventListener("keydown", a, !0)
  }, [r]);
  const o = async a => {
    n(!0);
    try {
      const l = await e(a);
      s((l == null ? void 0 : l.text) || "暂时没连上，稍后再试。")
    } finally {
      n(!1)
    }
  };
  return y.jsx("div", {
    className: "cat-dialog-backdrop",
    onPointerDown: a => {
      a.stopPropagation(), a.target === a.currentTarget && r()
    },
    children: y.jsxs("section", {
      className: "cat-dialog",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "和猫说说话",
      onKeyDown: a => a.stopPropagation(),
      children: [y.jsxs("header", {
        children: [y.jsx("strong", {
          children: "办公室的猫"
        }), y.jsx("button", {
          "aria-label": "关闭猫对话",
          onClick: r,
          children: "×"
        })]
      }), y.jsx("p", {
        role: "status",
        children: t
      }), y.jsxs("div", {
        children: [y.jsx("button", {
          disabled: i,
          onClick: () => void o("hello"),
          children: "打个招呼"
        }), y.jsx("button", {
          disabled: i,
          onClick: () => void o("pet"),
          children: "摸摸它"
        })]
      }), y.jsx("small", {
        children: "当前为预设互动，不是 AI 聊天。"
      })]
    })
  })
}

function U3({
  onClose: r,
  error: e = ""
}) {
  return y.jsx("section", {
    className: "hall-billiards-panel",
    "aria-label": "台球加载",
    children: y.jsxs("div", {
      className: "hall-billiards-loading",
      role: e ? "alert" : "status",
      children: [!e && y.jsx("span", {
        className: "hall-billiards-spinner",
        "aria-hidden": "true"
      }), y.jsx("span", {
        children: e || "正在加载台球…"
      }), y.jsx("button", {
        type: "button",
        onClick: r,
        children: "返回大厅"
      })]
    })
  })
}

function G3(r) {
  const [e, t] = _.useState(null), [s, i] = _.useState("");
  return _.useEffect(() => {
    let n = !1;
    return import("../chunks/BilliardsPanel.js").then(o => {
      n || t(() => o.default)
    }).catch(() => {
      n || i("台球加载失败，请返回后重试")
    }), () => {
      n = !0
    }
  }, []), e ? y.jsx(e, {
    ...r
  }) : y.jsx(U3, {
    onClose: r.onClose,
    error: s
  })
}
const ai = 1,
  z3 = r => {
    const e = r;
    return !!e.isMesh && !Array.isArray(e.material) && !!e.material.userData.shared && !e.isSkinnedMesh && !e.geometry.morphAttributes.position && e.geometry.hasAttribute("normal") && e.geometry.hasAttribute("uv")
  },
  _3 = (r, e) => {
    for (let t = r; t && t !== e; t = t.parent)
      if (!t.visible) return !1;
    return !0
  };
class O3 {
  constructor() {
    m(this, "group", new E0);
    m(this, "merged", []);
    m(this, "sources", []);
    this.group.name = "hall-static-batch"
  }
  get active() {
    return this.sources.length > 0
  }
  build(e) {
    this.release(), e.updateMatrixWorld(!0);
    const t = new Map;
    e.traverse(s => {
      if (!z3(s) || !_3(s, e) || s.matrixWorld.determinant() <= 0 || s.layers.mask !== 1) return;
      const i = `${s.material.uuid}/${s.castShadow}/${s.receiveShadow}`;
      let n = t.get(i);
      n || t.set(i, n = {
        material: s.material,
        cast: s.castShadow,
        receive: s.receiveShadow,
        meshes: []
      }), n.meshes.push(s)
    });
    for (const s of t.values()) {
      if (s.meshes.length < 2) continue;
      const i = s.meshes.every(l => l.geometry.index),
        n = s.meshes.map(l => {
          const A = l.geometry,
            c = new k1;
          for (const u of ["position", "normal", "uv"]) c.setAttribute(u, A.getAttribute(u).clone());
          if (A.index && c.setIndex(A.index.clone()), i || !c.index) return c.applyMatrix4(l.matrixWorld);
          const h = c.toNonIndexed();
          return c.dispose(), h.applyMatrix4(l.matrixWorld)
        }),
        o = c4(n);
      if (n.forEach(l => l.dispose()), !o) continue;
      const a = new K(o, s.material);
      a.castShadow = s.cast, a.receiveShadow = s.receive, a.userData.nohit = !0, this.group.add(a), this.merged.push(a);
      for (const l of s.meshes) l.layers.set(ai), this.sources.push(l)
    }
  }
  release() {
    for (const e of this.sources) e.layers.set(0);
    for (const e of this.merged) this.group.remove(e), e.geometry.dispose();
    this.sources = [], this.merged = []
  }
}
class H3 {
  constructor(e) {
    m(this, "plane", new ii);
    m(this, "direction", new T);
    m(this, "point", new T);
    m(this, "materials", []);
    m(this, "architecture", []);
    m(this, "ray", new M9);
    m(this, "box", new re);
    m(this, "probe", new T);
    m(this, "origin", new T);
    e.traverse(t => {
      const s = t;
      if (!s.isMesh || s.userData.ground || s.userData.keepStructure) return;
      const i = n => {
        const o = n.clone();
        return o.clippingPlanes = [this.plane], this.materials.push(o), o
      };
      s.material = Array.isArray(s.material) ? s.material.map(i) : i(s.material), this.architecture.push(s)
    })
  }
  update(e, t, s, i, n = []) {
    e.getWorldDirection(this.direction), this.point.copy(t).addScaledVector(this.direction, -Math.max(1.2, 8.7 / s)), this.plane.setFromNormalAndCoplanarPoint(this.direction, this.point);
    for (const o of this.architecture) {
      const a = o.userData.cutawaySide;
      o.visible = !i.includes(o) && (a === "back" ? e.position.z > -5 : a === "left" ? e.position.x > -7 : !0)
    }
    for (const o of n)
      if (o.visible && (this.box.setFromObject(o), !this.box.isEmpty()))
        for (const a of [.9, .55, .12]) {
          this.box.getCenter(this.probe), this.probe.y = ve.lerp(this.box.min.y, this.box.max.y, a), this.origin.copy(this.probe).addScaledVector(this.direction, -40), this.ray.set(this.origin, this.direction), this.ray.far = 39.98;
          for (const l of this.ray.intersectObjects(this.architecture, !1)) Qt(l) && (l.object.visible = !1)
        }
  }
  dispose() {
    for (const e of this.materials) e.dispose()
  }
}

class j3 {
  constructor(e, t, s) {
    m(this, "meshes", new Map);
    m(this, "selected", null);
    m(this, "undo", []);
    m(this, "busy", !1);
    m(this, "client", null);
    m(this, "helper", new h4(new Qn, 16764500));
    m(this, "bar", document.createElement("div"));
    m(this, "remove", document.createElement("button"));
    m(this, "restore", document.createElement("button"));
    m(this, "ray", new M9);
    m(this, "key", e => {
      var t;
      if (!(!((t = this.hall.build) != null && t.active) || !this.selected || e.target instanceof Element && e.target.closest('input,textarea,[contenteditable="true"]'))) {
        if (e.key === "Escape") {
          this.clear();
          return
        }(e.key === "Delete" || e.key === "Backspace") && (e.preventDefault(), e.stopImmediatePropagation(), this.change(!1))
      }
    });
    this.hall = e, this.shell = t, this.parts = s, t.children.forEach((i, n) => {
      const o = `shell-v1-${n}`;
      i.userData.shellId = o, this.meshes.set(o, i)
    }), this.ray.layers.enable(ai), this.helper.userData.nohit = !0, this.helper.visible = !1, e.scene.add(this.helper), this.bar.className = "hall-shell-removal", this.bar.style.cssText = "position:absolute;left:16px;bottom:80px;display:none;gap:8px;padding:8px;background:#292e2b;border-radius:8px", this.remove.textContent = "拆除选中建筑", this.restore.textContent = "撤销上次拆除", this.remove.onclick = () => void this.change(!1), this.restore.onclick = () => void this.change(!0), this.bar.append(this.remove, this.restore), e.host.append(this.bar), window.addEventListener("keydown", this.key, !0)
  }
  connect(e) {
    this.client = e
  }
  sync(e) {
    var i;
    const t = new Set(e);
    this.undo = e.filter(n => this.meshes.has(n));
    for (const [n, o] of this.meshes) t.has(n) ? o.removeFromParent() : o.parent || this.shell.add(o);
    const s = [...this.meshes.values()].some(n => n.userData.keepStructure && n.parent === this.shell);
    (i = this.hall.scene.getObjectByName("hall-lighting")) == null || i.children.forEach(n => {
      n.userData.ceilingLight && (n.visible = s)
    }), this.selected && t.has(this.selected) && this.clear(), this.hall.markDirty()
  }
  clear() {
    this.selected = null, this.helper.visible = !1
  }
  pick(e) {
    this.clear(), this.ray.setFromCamera(this.hall.ndc(e), this.hall.camera);
    const t = this.ray.intersectObjects([this.shell, this.parts], !0).find(i => Qt(i) && (!i.object.userData.nohit || i.object.userData.shellId)),
      s = t == null ? void 0 : t.object.userData.shellId;
    return s ? (this.selected = s, this.helper.setFromObject(t.object), this.helper.visible = !0, this.hall.onNotice("已选中原有建筑 · 点击“拆除选中建筑”或按 Delete · 可撤销"), !0) : !1
  }
  tick(e) {
    var t;
    (!e || (t = this.hall.build) != null && t.armed) && this.clear(), this.bar.style.display = e && (this.selected || this.undo.length) ? "flex" : "none", this.remove.disabled = this.busy || !this.selected, this.restore.disabled = this.busy || !this.undo.length
  }
  async change(e) {
    const t = e ? this.undo.at(-1) : this.selected;
    if (!(!t || !this.client || this.busy)) {
      this.busy = !0;
      try {
        await this.client.command({
          action: "shell-visibility",
          id: t,
          removed: !e
        }), this.clear(), this.hall.onNotice(e ? "已恢复原有建筑" : "已拆除并保存，可点击撤销")
      } catch (s) {
        this.hall.onNotice(s instanceof Error ? s.message : "保存失败，请重试")
      } finally {
        this.busy = !1
      }
    }
  }
  dispose() {
    window.removeEventListener("keydown", this.key, !0), this.bar.remove(), this.helper.removeFromParent(), this.helper.dispose()
  }
}

class W3 {
  constructor(e) {
    m(this, "root", new E0);
    m(this, "body", new E0);
    m(this, "legs", []);
    m(this, "target", null);
    m(this, "geometry", new U0(1, 1, 1));
    m(this, "staticGeometry", []);
    m(this, "targetPosition", new T);
    m(this, "fur", new Ie({
      color: "#ce9261",
      roughness: .9
    }));
    m(this, "dark", new Ie({
      color: "#342b2a",
      roughness: .9
    }));
    this.root.name = "office-cat", this.root.visible = !1, this.root.add(this.body), e.add(this.root);
    const t = (i, n, o, a, l, A, c = this.fur) => {
      const h = new K(this.geometry, c);
      return h.scale.set(i, n, o), h.position.set(a, l, A), h.castShadow = !0, this.body.add(h), h
    };
    t(.28, .25, .47, 0, .3, 0), t(.3, .27, .25, 0, .43, .25);
    for (const i of [-.1, .1]) t(.08, .14, .1, i, .61, .24), t(.035, .04, .015, i, .46, .38, this.dark);
    t(.045, .03, .02, 0, .4, .39, this.dark);
    for (const i of [-.1, .1])
      for (const n of [-.16, .15]) this.legs.push(t(.065, .2, .065, i, .1, n));
    const s = t(.065, .065, .36, 0, .36, -.37);
    s.rotation.x = -.4;
    for (const i of [this.fur, this.dark]) {
      const n = this.body.children.filter(A => A instanceof K && A.material === i && !this.legs.includes(A)),
        o = n.map(A => (A.updateMatrix(), this.geometry.clone().applyMatrix4(A.matrix))),
        a = c4(o);
      if (o.forEach(A => A.dispose()), !a) continue;
      n.forEach(A => this.body.remove(A));
      const l = new K(a, i);
      l.castShadow = !0, this.body.add(l), this.staticGeometry.push(a)
    }
  }
  set(e) {
    [e.x, e.y, e.z, e.rot, e.seq].every(Number.isFinite) && (this.target || this.root.position.set(e.x, e.y, e.z), this.target = e, this.root.visible = !0)
  }
  get shadowMoving() {
    const e = this.target;
    return e ? e.moving || e.pose === "groom" || Math.abs(this.root.position.x - e.x) > .001 || Math.abs(this.root.position.y - e.y) > .001 || Math.abs(this.root.position.z - e.z) > .001 || Math.abs(Math.atan2(Math.sin(e.rot - this.root.rotation.y), Math.cos(e.rot - this.root.rotation.y))) > .001 : !1
  }
  tick(e, t) {
    const s = this.target;
    if (!s) return;
    this.root.position.lerp(this.targetPosition.set(s.x, s.y, s.z), 1 - Math.exp(-e * 12)), this.root.rotation.y += Math.atan2(Math.sin(s.rot - this.root.rotation.y), Math.cos(s.rot - this.root.rotation.y)) * (1 - Math.exp(-e * 10));
    const i = s.pose === "sleep" || s.pose === "lie";
    this.body.scale.y = i ? .5 : s.pose === "sit" ? .8 : 1, this.body.rotation.z = s.pose === "groom" ? Math.sin(t / 220) * .12 : 0, this.legs.forEach((n, o) => n.rotation.x = s.moving ? Math.sin(t / 90 + o * Math.PI) * .4 : 0)
  }
  dispose() {
    this.root.removeFromParent(), this.geometry.dispose(), this.staticGeometry.forEach(e => e.dispose()), this.fur.dispose(), this.dark.dispose()
  }
}
class J3 {
  constructor(e = 4) {
    this.pool = e, this.queue = [], this.workers = [], this.workersResolve = [], this.workerStatus = 0, this.workerCreator = null
  }
  _initWorker(e) {
    if (!this.workers[e]) {
      const t = this.workerCreator();
      t.addEventListener("message", this._onMessage.bind(this, e)), this.workers[e] = t
    }
  }
  _getIdleWorker() {
    for (let e = 0; e < this.pool; e++)
      if (!(this.workerStatus & 1 << e)) return e;
    return -1
  }
  _onMessage(e, t) {
    const s = this.workersResolve[e];
    if (s && s(t), this.queue.length) {
      const {
        resolve: i,
        msg: n,
        transfer: o
      } = this.queue.shift();
      this.workersResolve[e] = i, this.workers[e].postMessage(n, o)
    } else this.workerStatus ^= 1 << e
  }
  setWorkerCreator(e) {
    this.workerCreator = e
  }
  setWorkerLimit(e) {
    this.pool = e
  }
  postMessage(e, t) {
    return new Promise(s => {
      const i = this._getIdleWorker();
      i !== -1 ? (this._initWorker(i), this.workerStatus |= 1 << i, this.workersResolve[i] = s, this.workers[i].postMessage(e, t)) : this.queue.push({
        resolve: s,
        msg: e,
        transfer: t
      })
    })
  }
  dispose() {
    this.workers.forEach(e => e.terminate()), this.workersResolve.length = 0, this.workers.length = 0, this.queue.length = 0, this.workerStatus = 0
  }
}
const h8 = "/media/textures/billiards-balls.ktx2";
let kt;

function u8(r) {
  kt = new WeakRef(r)
}
const d8 = new w4(async () => {
  var n, o;
  const r = kt == null ? void 0 : kt.deref();
  if (!r || !["WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_texture_compression_bptc", "WEBGL_compressed_texture_pvrtc"].some(a => r.extensions.has(a))) throw Error("Compressed billiards textures are unavailable");
  const e = new On,
    t = new J0(e).setWorkerLimit(1).detectSupport(r);
  let s = !1,
    i;
  try {
    const a = t.loadAsync(h8).then(c => {
        if (s) throw c.dispose(), Error("Billiards atlas timed out");
        return c
      }),
      l = new Promise((c, h) => {
        i = setTimeout(() => {
          s = !0, e.abort(), h(Error("Billiards atlas timed out"))
        }, 8e3)
      }),
      A = await Promise.race([a, l]);
    if (!A.isCompressedTexture || ((n = A.image) == null ? void 0 : n.width) !== 2048 || ((o = A.image) == null ? void 0 : o.height) !== 1024 || A.mipmaps.length !== 12) throw A.dispose(), Error("Invalid billiards texture atlas");
    return A.colorSpace = oe, A.flipY = !1, A.anisotropy = 4, A
  } finally {
    i && clearTimeout(i), t.dispose()
  }
}, r => r.dispose());

function K6() {
  return kt != null && kt.deref() ? d8.acquire() : null
}

function X6(r, e) {
  if (!Number.isInteger(e) || e < 1 || e > 15) throw Error("Invalid billiards ball");
  const t = e - 1,
    s = r.clone();
  return s.offset.set((t % 4 * 512 + 4) / 2048, (Math.floor(t / 4) * 256 + 4) / 1024), s.repeat.set(504 / 2048, 248 / 1024), s.needsUpdate = !0, s
}

function g8(r, e, t, s, i, n, o = 0) {
  e.updateWorldMatrix(!0, !1);
  const a = Math.cos(s),
    l = Math.sin(s),
    A = e.localToWorld(new T(t.x - a * .95, x0.height + .25, t.z - l * .95)),
    c = e.localToWorld(new T(t.x + a * .65, x0.height + x0.radius + o, t.z + l * .65));
  r.position.copy(A), r.up.set(0, 1, 0).transformDirection(e.matrixWorld), r.aspect = Math.max(1, i) / Math.max(1, n), r.zoom = 1, r.fov = ve.radToDeg(2 * Math.atan(Math.tan(ve.degToRad(54) / 2) / Math.min(1, r.aspect)));
  const h = e.getWorldScale(new T);
  return r.near = Math.max(.005, .02 * Math.min(h.x, h.y, h.z)), r.far = Math.max(200, A.distanceTo(c) * 100), r.lookAt(c), r.updateProjectionMatrix(), r.updateMatrixWorld(!0), c
}

function A2(r, e, t) {
  return r + e / Math.max(1, t) * Math.PI * 1.5
}

function f8(r, e) {
  if (r === null || e <= 0 || r < 0 || r > e) return 0;
  const t = Math.min(48, e * .1),
    s = r < t ? -(t - r) / t : r > e - t ? (r - e + t) / t : 0;
  return Math.sign(s) * s * s * Math.PI * .8
}

function p8(r, e, t) {
  return e <= t.top || e >= t.bottom ? null : r <= t.left + 8 ? -1 : r >= t.right - 8 ? 1 : null
}

export { P3, U3, G3, ai, O3, H3, j3, W3, u8, K6, X6, g8, A2, f8, p8 };
