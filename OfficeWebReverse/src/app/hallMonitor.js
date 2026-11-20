// Hall workstation monitors and seat sync: monitor screen registry (yr),
// camera framing constants (Is/Cr/wr) and the parts-to-spots synchroniser (xr).
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { f as U0, ab as De, S as oe, c as ve, G as E0, M as K, n as qe, i as k9, k as Ye, b3 as g3, as as Mt, C as ni, j as u9, b4 as f3, b5 as f9 } from '../chunks/portraitLighting.js';
import { definePrivate as m } from './hallPrelude.js';
import { X0, K0 } from './hallCatalog.js';
import { ht, l0, T1 } from './hallMaterials.js';
import { isPickable as Qt } from './hallPickable.js';

const Is = 320,
  Es = 200,
  E2 = new U0(.028, .002, .023),
  x9 = new De(new Uint8Array([27, 29, 32, 255]), 1, 1);
x9.colorSpace = oe;
x9.needsUpdate = !0;
const Cr = ve.degToRad(110);
class yr {
  constructor() {
    m(this, "laptops", new Map);
    m(this, "images", new Map)
  }
  sync(e) {
    var t;
    for (const [s, i] of this.laptops) e.get(s) !== i.group.parent && (this.release(i), this.laptops.delete(s));
    this.pruneImages();
    for (const [s, i] of e) {
      const n = i.userData.part,
        o = (t = X0(n.kind)) == null ? void 0 : t.workstation;
      if (!o || this.laptops.has(s) || n.pitch || n.roll) continue;
      const a = new E0;
      a.name = "laptop";
      const l = new U0(.42, .28, .02);
      l.translate(0, .14, 0);
      const A = new K(l, ht(l0.ink)),
        c = o.monitor.at[1] - .14 + .0125;
      A.position.set(o.monitor.at[0], c, o.monitor.at[2]), A.rotation.x = Cr - Math.PI / 2, A.castShadow = !0, A.userData.nohit = !0;
      const h = new K(new qe(.009, .009, .38, 12), ht(l0.ink));
      h.rotation.z = Math.PI / 2, h.position.copy(A.position), h.userData.nohit = !0, a.add(h);
      const u = new K(new k9(o.monitor.size[0], o.monitor.size[1]), T1(new Ye({
        map: x9,
        toneMapped: !1
      })));
      u.position.set(0, .14, -.011), u.rotation.y = Math.PI, u.userData.nohit = !0, u.userData.display = {
        label: "工位屏幕",
        size: o.monitor.size
      }, A.add(u), a.add(A);
      const d = new g3(E2, ht("#555963"), 40),
        g = new Mt;
      for (let D = 0; D < 4; D++)
        for (let P = 0; P < 10; P++) g.makeTranslation(o.monitor.at[0] - .144 + P * .032, c + .002, o.monitor.at[2] - .035 - D * .028), d.setMatrixAt(D * 10 + P, g);
      d.userData.nohit = !0, a.add(d);
      const p = new K(new U0(.12, .002, .07), ht("#454952"));
      p.position.set(o.monitor.at[0], c + .002, o.monitor.at[2] - .22), p.userData.nohit = !0, a.add(p);
      const [I, C, E] = o.lamp, x = (D, P, U, R) => {
        const Q = new K(new U0(D, P, U), ht(l0.ink));
        Q.position.set(I, R, E), Q.userData.nohit = !0, a.add(Q)
      };
      x(.12, .03, .12, C + .015), x(.025, .32, .025, C + .16);
      const B = new K(new ni(.09, .1, 20, 1, !0), ht(l0.shade));
      B.position.set(I, C + .33, E), B.userData.nohit = !0, a.add(B);
      const b = new K(new u9(.035, 12, 8), new Ye({
        color: "#8a8378"
      }));
      b.position.set(I, C + .29, E), b.userData.nohit = !0, a.add(b);
      const v = new f3("#ffc77a", 0, 2.6, 2);
      v.position.set(I, C + .23, E), v.visible = !1, a.add(v), i.add(a);
      const L = {
        group: a,
        canvas: null,
        texture: null,
        screen: u,
        image: "",
        away: !0,
        bulb: b,
        light: v,
        disposed: !1
      };
      this.laptops.set(s, L)
    }
  }
  update(e, t, s) {
    var i;
    for (const [n, o] of this.laptops) {
      const a = (i = e.get(n)) == null ? void 0 : i.userData.part,
        l = (a == null ? void 0 : a.seatIndex) !== void 0 ? t(a.seatIndex) : null,
        A = (l == null ? void 0 : l.preview) || "",
        c = !l || !l.atDesk,
        h = !!(l && l.atDesk && s);
      if (o.light.visible = h, o.light.intensity = h ? 1.6 : 0, o.bulb.material.color.set(h ? "#ffd38a" : "#8a8378"), A === o.image && c === o.away) continue;
      if (o.image = A, o.away = c, !A) {
        this.paint(o);
        continue
      }
      let u = this.images.get(A);
      u || (u = new Image, u.src = A, this.images.set(A, u), this.images.size > 32 && this.images.delete(this.images.keys().next().value)), u.complete ? this.paint(o, u) : u.addEventListener("load", () => {
        !o.disposed && o.image === A && this.paint(o, u)
      }, {
        once: !0
      })
    }
    this.pruneImages()
  }
  pruneImages() {
    const e = new Set([...this.laptops.values()].map(t => t.image).filter(Boolean));
    for (const t of this.images.keys()) e.has(t) || this.images.delete(t)
  }
  paint(e, t) {
    var n;
    if (e.disposed) return;
    const s = e.screen.material;
    if (!t) {
      s.map = x9, s.needsUpdate = !0, (n = e.texture) == null || n.dispose(), e.texture = null, e.canvas && (e.canvas.width = e.canvas.height = 0, e.canvas = null);
      return
    }(!e.canvas || !e.texture) && (e.canvas = document.createElement("canvas"), e.canvas.width = Is, e.canvas.height = Es, e.texture = new f9(e.canvas), e.texture.colorSpace = oe, s.map = e.texture, s.needsUpdate = !0);
    const i = e.canvas.getContext("2d");
    i.drawImage(t, 0, 0, Is, Es), e.away && (i.fillStyle = "rgba(0,0,0,.55)", i.fillRect(0, 0, Is, Es)), e.texture.needsUpdate = !0
  }
  release(e) {
    var t;
    e.disposed = !0, e.group.removeFromParent(), (t = e.texture) == null || t.dispose(), e.canvas && (e.canvas.width = e.canvas.height = 0), e.group.traverse(s => {
      const i = s;
      i.isMesh && i.geometry !== E2 && i.geometry.dispose()
    }), e.screen.material.dispose(), e.bulb.material.dispose(), e.light.dispose()
  }
  dispose() {
    for (const e of this.laptops.values()) this.release(e);
    this.laptops.clear(), this.images.clear()
  }
  screens() {
    return [...this.laptops.values()].map(e => e.screen)
  }
  pickScreen(e) {
    const t = this.screens(),
      s = t.map(n => n.parent).filter(Boolean),
      i = e.intersectObjects(s, !0).find(Qt);
    return i && t.find(n => i.object === n || i.object === n.parent) || null
  }
}
const wr = .43,
  Br = .24,
  Cs = (r, e) => {
    const t = r.scale || [1, 1, 1],
      s = (r.rotation || 0) * K0,
      i = e[0] * t[0],
      n = e[1] * t[1],
      o = e[2] * t[2];
    return {
      x: r.x + i * Math.cos(s) + o * Math.sin(s),
      y: r.y + n,
      z: r.z - i * Math.sin(s) + o * Math.cos(s)
    }
  },
  n9 = (r, e, t, s) => ({
    x: r.x + Math.sin(e) * t,
    y: s,
    z: r.z + Math.cos(e) * t
  }),
  C2 = (r, e, t, s) => {
    const [i, n] = [n9(r, e, .6, t), n9(r, e, -.6, t)];
    return [...s ? [i, n] : [n, i], n9(r, e + Math.PI / 2, .6, t), n9(r, e - Math.PI / 2, .6, t)]
  };

function xr(r, e = new Map) {
  var o, a;
  const t = [],
    s = new Map,
    i = l => !l.pitch && !l.roll;
  for (const l of r) {
    const A = (o = X0(l.kind)) == null ? void 0 : o.workstation;
    if (!A || !i(l) || l.seatIndex === void 0) continue;
    const c = (l.rotation || 0) * K0 + A.face * Math.PI / 180,
      h = Cs(l, A.sit),
      u = [.1, -.1].map(g => Cs(l, [A.monitor.at[0] + g, A.monitor.at[1] - .1, A.monitor.at[2] - .19])),
      d = {
        id: `desk-${l.seatIndex}`,
        part: l.id,
        at: h,
        face: c,
        hands: u,
        approaches: C2(h, c, l.y, !1),
        workstation: l.seatIndex
      };
    t.push(d), s.set(l.id, d)
  }
  const n = l => {
    var h;
    const A = l.kind.startsWith("model:") ? e.get(l.kind.slice(6)) : void 0;
    if ((A == null ? void 0 : A.role) !== "seat") return null;
    const c = ((h = l.scale) == null ? void 0 : h[0]) || 1;
    return {
      at: [0, Math.min(.48, A.size[1] * c * .5) / c, .05],
      face: 0
    }
  };
  for (const l of r) {
    const A = ((a = X0(l.kind)) == null ? void 0 : a.seat) || n(l);
    if (!A || !i(l)) continue;
    const c = (l.rotation || 0) * K0 + A.face * Math.PI / 180,
      h = A.count || 1;
    for (let u = 0; u < h; u++) {
      const d = [A.at[0] + (h > 1 ? (u - (h - 1) / 2) * (A.spread || .9) : 0), A.at[1], A.at[2]];
      l.kind === "sofa" && (d[1] = wr, d[2] = Br);
      const g = Cs(l, d),
        p = t.find(C => C.workstation !== void 0 && Math.hypot(C.at.x - g.x, C.at.z - g.z) < .35 && Math.abs(C.at.y - g.y) < .3);
      if (p) {
        s.set(l.id, p);
        continue
      }
      const I = {
        id: h > 1 ? `build-seat-${l.id}:${u}` : `build-seat-${l.id}`,
        part: l.id,
        at: g,
        face: c,
        approaches: C2(g, c, l.y, !0),
        ...l.kind === "sofa" ? {
          pose: "sofa"
        } : {}
      };
      t.push(I), u === 0 && s.set(l.id, I)
    }
  }
  return {
    spots: t,
    byPart: s
  }
}


export { yr, xr };
