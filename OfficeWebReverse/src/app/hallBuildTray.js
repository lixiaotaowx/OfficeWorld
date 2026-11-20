// Hall build tray UI: part tray tabs, import dialog and thumbnail renderer
// (a9/So/Mo). Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { W as S4, a as w9, O as ri, bq as M4, aU as oi, S as oe, aI as B4, b as re, V as T, bm as v4 } from '../chunks/portraitLighting.js';
import { definePrivate as m } from './hallPrelude.js';
import { li } from './hallBilliards.js';
import { Vs, i1 } from './hallCatalog.js';
import { di } from './hallParts.js';
import { S1, pi, M1, fo, F5 } from './hallModelSync.js';
import { R9 } from './hallModels.js';

const a9 = {
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 14 5-5-5-5M20 9H9a5 5 0 0 0 0 10h3"/></svg>',
    done: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 12 5 5 9-10"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4v12M6 10l6-6 6 6M4 20h16"/></svg>'
  },
  I0 = (r, e = "", t = "") => {
    const s = document.createElement(r);
    return e && (s.className = e), t && (s.innerHTML = t), s
  },
  Vt = (r, e, t, s) => {
    const i = I0("button", r, t);
    return i.type = "button", i.title = e, i.setAttribute("aria-label", e), i.addEventListener("click", s), i
  };
class So {
  constructor(e = () => new S4({
    alpha: !0,
    antialias: !0,
    preserveDrawingBuffer: !0
  })) {
    m(this, "r", null);
    m(this, "s", new w9);
    m(this, "cam", new ri(-1, 1, 1, -1, .01, 200));
    m(this, "done", new Map);
    this.createRenderer = e, this.s.add(new M4("#ffffff", "#a8876a", .8));
    const t = new oi("#ffffff", 1.1);
    t.position.set(3, 5, 4), this.s.add(t)
  }
  of(e, t) {
    var i;
    if (this.done.has(e)) return this.done.get(e);
    const s = t();
    if (!s) return "";
    try {
      this.r || (this.r = this.createRenderer()), this.r.setSize(80, 80), this.r.outputColorSpace = oe, this.r.toneMapping = B4, this.s.add(s), s.updateMatrixWorld(!0);
      const n = new re().setFromObject(s),
        o = n.getSize(new T),
        a = n.getCenter(new T),
        l = Math.max(o.x, o.y, o.z) * .75 || 1;
      Object.assign(this.cam, {
        left: -l,
        right: l,
        top: l,
        bottom: -l,
        near: l * .01,
        far: l * 40
      }), this.cam.updateProjectionMatrix(), this.cam.position.set(a.x + l * 6, a.y + l * 5, a.z + l * 7), this.cam.lookAt(a), this.r.render(this.s, this.cam);
      const A = this.r.domElement.toDataURL();
      return this.done.set(e, A), this.done.size > 128 && this.done.delete(this.done.keys().next().value), A
    } catch {
      return ""
    } finally {
      this.s.remove(s), e === "billiards" && ((i = li(s.children[0])) == null || i.dispose())
    }
  }
  forget(e) {
    this.done.delete(e)
  }
  release() {
    this.r && (this.r.dispose(), this.r.forceContextLoss(), this.r = null)
  }
  dispose() {
    this.release(), this.done.clear()
  }
}
class Mo {
  constructor(e, t, s, i) {
    m(this, "alive", !0);
    m(this, "tray", null);
    m(this, "hintEl", null);
    m(this, "parts", null);
    m(this, "tabs", null);
    m(this, "sw", null);
    m(this, "menu", null);
    m(this, "tab", "build");
    m(this, "thumbs", new So);
    m(this, "file", Object.assign(document.createElement("input"), {
      type: "file",
      accept: ".glb,.obj",
      hidden: !0
    }));
    this.hall = e, this.build = t, this.client = s, this.myId = i, document.body.appendChild(this.file), this.file.addEventListener("change", () => {
      var o;
      const n = (o = this.file.files) == null ? void 0 : o[0];
      this.file.value = "", n && this.importFile(n)
    }), t.onChange = () => this.render(), t.onAddMenu = n => this.openMenu(n)
  }
  render() {
    const e = this.hall.host;
    if (!this.build.active) {
      for (const t of [this.tray, this.hintEl, this.menu]) t == null || t.remove();
      this.tray = this.hintEl = this.menu = null, this.thumbs.release();
      return
    }
    this.tray || this.makeTray(), this.hintEl || (this.hintEl = e.appendChild(I0("div", "hall-hint"))), this.hintEl.innerHTML = this.build.hint(), this.parts.querySelectorAll(".part").forEach(t => t.setAttribute("aria-pressed", String(t.dataset.kind === this.build.armed))), this.sw.querySelectorAll("button").forEach(t => t.setAttribute("aria-pressed", String(t.dataset.c === this.build.color)))
  }
  worldChanged() {
    this.tray && this.tab === "mine" && this.fill("mine")
  }
  makeTray() {
    const e = this.tray = this.hall.host.appendChild(I0("div", "hall-tray"));
    e.addEventListener("pointerdown", t => t.stopPropagation()), this.tabs = I0("div", "shelf-tabs");
    for (const [t, s] of [
        ["build", "搭建"],
        ["live", "互动"],
        ["mine", "导入"]
      ]) {
      const i = I0("button");
      i.type = "button", i.textContent = s, i.dataset.tab = t, i.addEventListener("click", () => this.fill(t)), this.tabs.appendChild(i)
    }
    this.parts = I0("div", "parts"), this.sw = I0("div", "sw");
    for (const t of Vs) {
      const s = Vt("", "颜色", "", () => this.build.setColor(t));
      s.style.background = t, s.dataset.c = t, this.sw.appendChild(s)
    }
    e.append(this.tabs, this.parts, I0("span", "tsep"), this.sw, I0("span", "tsep"), Vt("tool", "撤销 Ctrl+Z", a9.undo, () => this.build.undoLast()), Vt("tool", "重做 Ctrl+Y", a9.redo, () => this.build.redoLast()), Vt("tool", "完成 Tab", a9.done, () => this.build.end())), this.fill(this.tab)
  }
  partButton(e, t, s, i) {
    const n = Vt("part" + (i ? " live" : ""), t, "", () => this.build.arm(this.build.armed === e ? null : e));
    n.dataset.kind = e, n.setAttribute("aria-pressed", String(this.build.armed === e));
    const o = I0("img");
    return o.alt = "", s && (o.src = s), n.appendChild(o), n
  }
  libraryThumb(e) {
    return this.thumbs.of(e, () => di({
      id: "t",
      kind: e,
      color: "#e2b98c",
      x: 0,
      y: 0,
      z: 0,
      rotation: 0,
      version: 0
    }))
  }
  modelThumb(e, t) {
    const s = S1 + e.id,
      i = {
        id: "t",
        kind: s,
        color: Vs[0],
        x: 0,
        y: 0,
        z: 0,
        rotation: 0,
        version: 0
      },
      n = () => {
        if (!this.alive || !this.build.active || this.tab !== "mine") return;
        const a = this.thumbs.of(s, () => o);
        a && (t.src = a)
      },
      o = pi(i, e, () => {
        this.thumbs.forget(s), n(), M1(o)
      });
    n()
  }
  dispose() {
    this.alive = !1;
    for (const e of [this.tray, this.hintEl, this.menu, this.file]) e == null || e.remove();
    this.tray = this.hintEl = this.menu = null, this.thumbs.dispose()
  }
  fill(e) {
    this.tab = e;
    const t = this.parts;
    if (t.innerHTML = "", this.tabs.querySelectorAll("button").forEach(s => s.setAttribute("aria-pressed", String(s.dataset.tab === e))), e !== "mine") {
      for (const s of i1.parts.filter(i => i.category === e)) t.appendChild(this.partButton(s.id, s.label + (s.hint ? " · " + s.hint : ""), this.libraryThumb(s.id), e === "live"));
      return
    }
    t.appendChild(Vt("part add-model", "导入 GLB / OBJ 模型", a9.upload, () => this.file.click()));
    for (const s of this.hall.models.values()) {
      const i = this.partButton(S1 + s.id, `${s.name} · ${s.author}导入${s.owner===this.myId()?" · 右键删掉":""}`, "", s.role !== "plain");
      this.modelThumb(s, i.querySelector("img")), i.addEventListener("contextmenu", n => {
        if (n.preventDefault(), s.owner !== this.myId()) {
          this.hall.onNotice(`只有${s.author}能删掉这个模型`);
          return
        }
        confirm(`删掉导入的模型“${s.name}”？摆出去的要先删掉。`) && this.client.send({
          action: "model-remove",
          modelId: s.id
        }).then(() => this.fill("mine"), o => this.hall.onNotice(o.message))
      }), t.appendChild(i)
    }
  }
  openMenu(e) {
    var l;
    (l = this.menu) == null || l.remove();
    const t = this.hall.host,
      s = t.getBoundingClientRect(),
      i = this.menu = t.appendChild(I0("div", "hall-addmenu", '<div class="t"><span>加零件</span><span>Shift A</span></div>'));
    i.addEventListener("pointerdown", A => A.stopPropagation());
    const n = () => {
      i.remove(), this.menu === i && (this.menu = null)
    };
    for (const A of i1.parts) {
      const c = this.partButton(A.id, A.label, this.libraryThumb(A.id), A.category === "live");
      c.addEventListener("click", n, {
        capture: !0
      }), i.appendChild(c)
    }
    i.addEventListener("keydown", A => {
      A.key === "Escape" && n()
    });
    const o = ((e == null ? void 0 : e.x) ?? s.left + 300) - s.left,
      a = ((e == null ? void 0 : e.y) ?? s.top + 300) - s.top;
    i.style.left = `${Math.min(t.clientWidth-i.offsetWidth-8,Math.max(8,o))}px`, i.style.top = `${Math.min(t.clientHeight-i.offsetHeight-8,Math.max(8,a))}px`, setTimeout(() => window.addEventListener("pointerdown", n, {
      once: !0
    }), 0)
  }
  async importFile(e) {
    let t;
    try {
      t = await fo(e)
    } catch (D) {
      this.hall.onNotice("模型没读出来：" + (D.message || D));
      return
    }
    const {
      glb: s,
      scene: i,
      size: n,
      name: o
    } = t, a = Math.max(n.x, n.y, n.z);
    let l = a > 30 ? a > 3e3 ? .001 : .01 : 1,
      A = "plain";
    const c = this.hall.host.appendChild(I0("div", "hall-importer"));
    c.setAttribute("role", "dialog"), c.setAttribute("aria-label", "导入模型"), c.addEventListener("pointerdown", D => D.stopPropagation());
    const h = I0("img");
    h.alt = "模型预览";
    const u = I0("input");
    u.type = "text", u.value = o, u.maxLength = 60, u.setAttribute("aria-label", "名字");
    const d = I0("small"),
      g = D => {
        const P = I0("small");
        return P.textContent = D, P
      },
      p = (D, P, U) => {
        const R = I0("div", "chips");
        for (const [Q, H] of D) {
          const N = I0("button");
          N.type = "button", N.textContent = H, N.setAttribute("aria-pressed", String(Q === P)), N.addEventListener("click", () => {
            U(Q), R.querySelectorAll("button").forEach(G => G.setAttribute("aria-pressed", String(G === N)))
          }), R.appendChild(N)
        }
        return R
      },
      I = () => {
        const D = n.clone().multiplyScalar(l),
          P = a * l;
        d.innerHTML = `约 ${D.x.toFixed(2)} × ${D.z.toFixed(2)} × ${D.y.toFixed(2)} 米（宽 × 深 × 高）` + (P > 30 ? '<br><span class="warn">太大了，原文件可能是厘米或毫米</span>' : P < .05 ? '<br><span class="warn">好像太小了</span>' : ""), B.disabled = P > 30 || P < .01
      },
      C = I0("div", "row"),
      E = I0("small"),
      x = I0("button");
    x.type = "button", x.textContent = "取消", x.addEventListener("click", () => c.remove());
    const B = I0("button", "go");
    B.type = "button", B.textContent = "放进零件栏", B.addEventListener("click", async () => {
      B.disabled = x.disabled = !0;
      try {
        const D = await this.client.uploadModel(s, R => {
            E.textContent = `上传中 ${Math.round(R*100)}%`
          }),
          P = n.clone().multiplyScalar(l),
          U = await this.client.send({
            action: "model-add",
            model: {
              name: u.value.trim() || o,
              role: A,
              file: D,
              size: [P.x, P.y, P.z].map(R => Math.max(.01, +R.toFixed(3)))
            }
          });
        c.remove(), U.model && (this.fill("mine"), this.build.arm(S1 + U.model.id), this.hall.onNotice(`“${U.model.name}”放进了零件栏，点地面放下`))
      } catch (D) {
        E.textContent = D.message, B.disabled = x.disabled = !1
      }
    }), C.append(x, B);
    const b = I0("strong");
    b.textContent = "导入模型", c.append(b, h, g("名字"), u, g("用途"), p([
      ["plain", "摆件"],
      ["holds", "能放资料"],
      ["seat", "能坐"]
    ], A, D => {
      A = D
    }), g("单位"), p([
      [1, "按米"],
      [.01, "原文件是厘米"],
      [.001, "原文件是毫米"]
    ], l, D => {
      l = D, I()
    }), d, E, C), c.addEventListener("keydown", D => {
      D.stopPropagation(), D.key === "Escape" && c.remove()
    }), I(), u.focus();
    const v = F5(i),
      L = this.thumbs.of("import:" + Date.now(), () => v);
    R9(v), v4(i), L ? h.src = L : h.remove()
  }
}

export { a9, Mo };
