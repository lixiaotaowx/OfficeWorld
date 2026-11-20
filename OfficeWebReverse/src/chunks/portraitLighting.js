import { dracoDecoderWasmUrl, dracoWasmWrapperJsUrl, DRACOLoader as Rx, ResourcePool as Mv, GLTFLoader as Lx, Texture as vt, mv, uv, gu, uu, Box3 as un, Bone as Ho, Mesh as At, pv, mu, N, AnimationMixer as Pp, Scene as Vd, BoxGeometry as qi, MeshStandardMaterial as Ls, Wt, PointLight as jh, InstancedMesh as wh, Object3D as gt, MeshLambertMaterial as Yf, CubeCameraOperator as Ns, up, DirectionalLight as Mo } from '../vendor/three.js';
import { S as Ra, y as Ca, c as Eu, D as bu } from './chatLocal.js';
const Sv = 1.72,
  yv = "/media/models/ruler.glb?v=1";
let wa = null;

function Tv() {
  return wa || (wa = new Rx().setDecoderPath({
    js: dracoWasmWrapperJsUrl,
    wasm: dracoDecoderWasmUrl,
  })), wa
}
const Ev = new Mv(async () => {
    const s = await new Lx().setDRACOLoader(Tv()).loadAsync(yv),
      e = new Set;
    return s.scene.traverse(t => {
      const n = t;
      if (n.isMesh)
        for (const i of Array.isArray(n.material) ? n.material : [n.material]) e.add(i)
    }), {
      gltf: s,
      materials: e
    }
  }, ({
    gltf: s,
    materials: e
  }) => {
    const t = new Set;
    for (const n of e)
      for (const i of Object.values(n)) i instanceof vt && t.add(i);
    for (const n of t) mv(n);
    uv(s.scene)
  }),
  Ao = new WeakMap;

function Jc(s, e) {
  const t = new Set,
    n = new Set;
  s.traverse(i => {
    const r = i;
    if (!r.isMesh) return;
    for (const o of Array.isArray(r.material) ? r.material : [r.material]) e.has(o) || t.add(o);
    const a = r;
    a.isSkinnedMesh && n.add(a.skeleton)
  });
  for (const i of t) gu(i), i.dispose();
  for (const i of n) i.dispose()
}

function li(s) {
  return s.replaceAll(".", "").replaceAll(":", "")
}
const bv = {
  Hips: ["mixamorig:Hips"],
  Abdomen: ["mixamorig:Spine"],
  Chest: ["mixamorig:Spine1", "mixamorig:Spine2"],
  Neck: ["mixamorig:Neck"],
  Head: ["mixamorig:Head"],
  UpperLegL: ["mixamorig:LeftUpLeg"],
  UpperLegR: ["mixamorig:RightUpLeg"],
  LowerLegL: ["mixamorig:LeftLeg"],
  LowerLegR: ["mixamorig:RightLeg"],
  FootL: ["mixamorig:LeftFoot"],
  FootR: ["mixamorig:RightFoot"],
  UpperArmL: ["mixamorig:LeftArm"],
  UpperArmR: ["mixamorig:RightArm"],
  LowerArmL: ["mixamorig:LeftForeArm"],
  LowerArmR: ["mixamorig:RightForeArm"],
  WristL: ["mixamorig:LeftHand"],
  WristR: ["mixamorig:RightHand"],
  ShoulderL: ["mixamorig:LeftShoulder"],
  ShoulderR: ["mixamorig:RightShoulder"]
};

function Vv(s, e) {
  const t = s.get(e) ?? s.get(li(e));
  if (t) return t;
  const n = li(e);
  for (const [i, r] of s)
    if (li(i) === n) return r;
  for (const i of bv[n] ?? []) {
    const r = s.get(i) ?? s.get(li(i));
    if (r) return r;
    const a = li(i);
    for (const [o, l] of s)
      if (li(o) === a) return l
  }
}

function Av(s, ...e) {
  for (const t of e) {
    const n = s.find(r => r.name === t);
    if (n) return n;
    const i = s.find(r => r.name.endsWith(t));
    if (i) return i
  }
  for (const t of e) {
    const n = t.toLowerCase().replace(/[^a-z]/g, "");
    if (!n) continue;
    const i = s.find(r => r.name.toLowerCase().replace(/[^a-z]/g, "").includes(n));
    if (i) return i
  }
}
async function Wv(s = bu) {
  const e = await Ev.acquire(),
    {
      gltf: t,
      materials: n
    } = e.value;
  let i;
  try {
    i = uu(t.scene), i.updateMatrixWorld(!0);
    const r = new un().setFromObject(i),
      a = Sv / (r.max.y - r.min.y);
    i.scale.multiplyScalar(a), i.position.y = -r.min.y * a;
    const o = i.position.y,
      l = new Map;
    i.traverse(v => {
      v instanceof Ho && (l.set(v.name, v), l.set(li(v.name), v)), v instanceof At && (v.castShadow = !0, v.receiveShadow = !0, v.frustumCulled = !1)
    });
    const c = pv(i);
    mu(c, s), i.updateMatrixWorld(!0);
    const h = new Map;
    for (const [v, A] of l) h.set(v, {
      quaternion: A.quaternion.clone(),
      position: A.position.clone()
    });
    const u = l.get("mixamorig:Hips") ?? l.get("Hips"),
      d = new Map;
    for (const v of ["L", "R"]) {
      const A = l.get(`mixamorig:Foot${v}`) ?? l.get(`Foot${v}`);
      A && d.set(v, A.getWorldPosition(new N).y)
    }
    const f = u ? u.getWorldPosition(new N).y : 0,
      p = new Pp(i),
      x = (...v) => {
        const A = Av(t.animations, ...v);
        return A ? p.clipAction(A) : void 0
      },
      m = x("Idle", "Idle_Neutral", "Idle"),
      g = x("Walk", "Walk"),
      M = x("Run"),
      E = {
        model: i,
        mixer: p,
        idle: m,
        walk: g,
        run: M,
        action: x,
        clips: t.animations.map(v => v.name),
        bones: l,
        rest: h,
        restHipHeight: f,
        groundY: o,
        groundFootHeights: d,
        look: c,
        appearance: s
      };
    return Ao.set(E, () => {
      try {
        Jc(E.model, n)
      } finally {
        e.release()
      }
    }), E
  } catch (r) {
    try {
      i && Jc(i, n)
    } finally {
      e.release()
    }
    throw r
  }
}

function Xv(s, e) {
  mu(s.look, e), s.appearance = e
}

function qv(s) {
  const e = Ao.get(s);
  e && (Ao.delete(s), s.mixer.stopAllAction(), s.mixer.uncacheRoot(s.model), e())
}
class wv extends Vd {
  constructor() {
    super(), this.name = "RoomEnvironment", this.position.y = -3.5;
    const e = new qi;
    e.deleteAttribute("uv");
    const t = new Ls({
        side: Wt
      }),
      n = new Ls,
      i = new jh(16777215, 900, 28, 2);
    i.position.set(.418, 16.199, .3), this.add(i);
    const r = new At(e, t);
    r.position.set(-.757, 13.219, .717), r.scale.set(31.713, 28.305, 28.591), this.add(r);
    const a = new wh(e, n, 6),
      o = new gt;
    o.position.set(-10.906, 2.009, 1.846), o.rotation.set(0, -.195, 0), o.scale.set(2.328, 7.905, 4.651), o.updateMatrix(), a.setMatrixAt(0, o.matrix), o.position.set(-5.607, -.754, -.758), o.rotation.set(0, .994, 0), o.scale.set(1.97, 1.534, 3.955), o.updateMatrix(), a.setMatrixAt(1, o.matrix), o.position.set(6.167, .857, 7.803), o.rotation.set(0, .561, 0), o.scale.set(3.927, 6.285, 3.687), o.updateMatrix(), a.setMatrixAt(2, o.matrix), o.position.set(-2.017, .018, 6.124), o.rotation.set(0, .333, 0), o.scale.set(2.002, 4.566, 2.064), o.updateMatrix(), a.setMatrixAt(3, o.matrix), o.position.set(2.291, -.756, -2.621), o.rotation.set(0, -.286, 0), o.scale.set(1.546, 1.552, 1.496), o.updateMatrix(), a.setMatrixAt(4, o.matrix), o.position.set(-2.193, -.369, -5.547), o.rotation.set(0, .516, 0), o.scale.set(3.875, 3.487, 2.986), o.updateMatrix(), a.setMatrixAt(5, o.matrix), this.add(a);
    const l = new At(e, Ci(50));
    l.position.set(-16.116, 14.37, 8.208), l.scale.set(.1, 2.428, 2.739), this.add(l);
    const c = new At(e, Ci(50));
    c.position.set(-16.109, 18.021, -8.207), c.scale.set(.1, 2.425, 2.751), this.add(c);
    const h = new At(e, Ci(17));
    h.position.set(14.904, 12.198, -1.832), h.scale.set(.15, 4.265, 6.331), this.add(h);
    const u = new At(e, Ci(43));
    u.position.set(-.462, 8.89, 14.52), u.scale.set(4.38, 5.441, .088), this.add(u);
    const d = new At(e, Ci(20));
    d.position.set(3.235, 11.486, -12.541), d.scale.set(2.5, 2, .1), this.add(d);
    const f = new At(e, Ci(100));
    f.position.set(0, 20, 0), f.scale.set(1, .1, 1), this.add(f)
  }
  dispose() {
    const e = new Set;
    this.traverse(t => {
      t.isMesh && (e.add(t.geometry), e.add(t.material))
    });
    for (const t of e) t.dispose()
  }
}

function Ci(s) {
  return new Yf({
    color: 0,
    emissive: 16777215,
    emissiveIntensity: s
  })
}

function Yv(s, e) {
  const t = new Ns(s),
    n = new wv,
    i = t.fromScene(n, .04);
  n.dispose(), t.dispose(), e.environment = i.texture, e.environmentIntensity = .45, e.add(new up(16777215, 9542309, 1.4));
  const r = new Mo(16774889, 2.5);
  r.position.set(-2, 3, 4);
  const a = new Mo(15068671, .65);
  return a.position.set(3, 1, 2), e.add(r, a), () => i.dispose()
}

export { Ga as $ } from '../vendor/three.js';
export { Er as A } from '../vendor/three.js';
export { wt as B } from '../vendor/three.js';
export { Dh as C } from '../vendor/three.js';
export { xn as D } from '../vendor/three.js';
export { fo as E } from '../vendor/three.js';
export { Ir as F } from '../vendor/three.js';
export { ci as G } from '../vendor/three.js';
export { ho as H } from '../vendor/three.js';
export { uo as I } from '../vendor/three.js';
export { Mr as J } from '../vendor/three.js';
export { _r as K } from '../vendor/three.js';
export { pi as L } from '../vendor/three.js';
export { At as M } from '../vendor/three.js';
export { Yn as N } from '../vendor/three.js';
export { Qo as O } from '../vendor/three.js';
export { Xn as P } from '../vendor/three.js';
export { xr as Q } from '../vendor/three.js';
export { Bv as R } from '../vendor/three.js';
export { bt as S } from '../vendor/three.js';
export { $a as T } from '../vendor/three.js';
export { Ya as U } from '../vendor/three.js';
export { N as V } from '../vendor/three.js';
export { Hv as W } from '../vendor/three.js';
export { qa as X } from '../vendor/three.js';
export { Tr as Y } from '../vendor/three.js';
export { Xa as Z } from '../vendor/three.js';
export { Wa as _ } from '../vendor/three.js';
export { Vd as a } from '../vendor/three.js';
export { en as a$ } from '../vendor/three.js';
export { Va as a0 } from '../vendor/three.js';
export { dh as a1 } from '../vendor/three.js';
export { Po as a2 } from '../vendor/three.js';
export { ui as a3 } from '../vendor/three.js';
export { ln as a4 } from '../vendor/three.js';
export { Jt as a5 } from '../vendor/three.js';
export { yn as a6 } from '../vendor/three.js';
export { hh as a7 } from '../vendor/three.js';
export { ch as a8 } from '../vendor/three.js';
export { Ss as a9 } from '../vendor/three.js';
export { Vi as aA } from '../vendor/three.js';
export { Kn as aB } from '../vendor/three.js';
export { ki as aC } from '../vendor/three.js';
export { qf as aD } from '../vendor/three.js';
export { ct as aE } from '../vendor/three.js';
export { Qc as aF } from '../vendor/three.js';
export { jc as aG } from '../vendor/three.js';
export { eh as aH } from '../vendor/three.js';
export { th as aI } from '../vendor/three.js';
export { ih as aJ } from '../vendor/three.js';
export { sh as aK } from '../vendor/three.js';
export { nh as aL } from '../vendor/three.js';
export { vt as aM } from '../vendor/three.js';
export { vl as aN } from '../vendor/three.js';
export { Ns as aP } from '../vendor/three.js';
export { rh as aQ } from '../vendor/three.js';
export { on as aR } from '../vendor/three.js';
export { Lv as aS } from '../vendor/three.js';
export { Me as aT } from '../vendor/three.js';
export { Mo as aU } from '../vendor/three.js';
export { Fv as aV } from '../vendor/three.js';
export { Ft as aW } from '../vendor/three.js';
export { Sf as aX } from '../vendor/three.js';
export { Vh as aY } from '../vendor/three.js';
export { Wh as aZ } from '../vendor/three.js';
export { jt as aa } from '../vendor/three.js';
export { Go as ab } from '../vendor/three.js';
export { Ud as ac } from '../vendor/three.js';
export { ah as ad } from '../vendor/three.js';
export { Rt as ae } from '../vendor/three.js';
export { Oa as af } from '../vendor/three.js';
export { Ha as ag } from '../vendor/three.js';
export { co as ah } from '../vendor/three.js';
export { Mv as ai } from '../vendor/three.js';
export { ap as aj } from '../vendor/three.js';
export { ut as ak } from '../vendor/three.js';
export { fi as al } from '../vendor/three.js';
export { Vf as am } from '../vendor/three.js';
export { re as an } from '../vendor/three.js';
export { Mn as ao } from '../vendor/three.js';
export { Ui as ap } from '../vendor/three.js';
export { Ov as aq } from '../vendor/three.js';
export { Fe as ar } from '../vendor/three.js';
export { We as as } from '../vendor/three.js';
export { zi as at } from '../vendor/three.js';
export { Uv as au } from '../vendor/three.js';
export { Li as av } from '../vendor/three.js';
export { Du as aw } from '../vendor/three.js';
export { Bu as ax } from '../vendor/three.js';
export { ku as ay } from '../vendor/three.js';
export { Cu as az } from '../vendor/three.js';
export { un as b } from '../vendor/three.js';
export { uu as b1 } from '../vendor/three.js';
export { Pp as b2 } from '../vendor/three.js';
export { wh as b3 } from '../vendor/three.js';
export { jh as b4 } from '../vendor/three.js';
export { of as b5 } from '../vendor/three.js';
export { Xo as b6 } from '../vendor/three.js';
export { Zt as b7 } from '../vendor/three.js';
export { Ch as b8 } from '../vendor/three.js';
export { Dv as b9 } from '../vendor/three.js';
export { Rh as ba } from '../vendor/three.js';
export { af as bb } from '../vendor/three.js';
export { wo as bc } from '../vendor/three.js';
export { zo as bd } from '../vendor/three.js';
export { Pd as be } from '../vendor/three.js';
export { ot as bf } from '../vendor/three.js';
export { ys as bg } from '../vendor/three.js';
export { cs as bh } from '../vendor/three.js';
export { gr as bi } from '../vendor/three.js';
export { yr as bj } from '../vendor/three.js';
export { Ts as bk } from '../vendor/three.js';
export { Lx as bl } from '../vendor/three.js';
export { uv as bm } from '../vendor/three.js';
export { Kt as bn } from '../vendor/three.js';
export { Yh as bo } from '../vendor/three.js';
export { Tn as bp } from '../vendor/three.js';
export { up as bq } from '../vendor/three.js';
export { Pv as br } from '../vendor/three.js';
export { mr as bs } from '../vendor/three.js';
export { zv as bt } from '../vendor/three.js';
export { yh as bu } from '../vendor/three.js';
export { Xh as bv } from '../vendor/three.js';
export { Cd as c } from '../vendor/three.js';
export { kv as d } from '../vendor/three.js';
export { gt as e } from '../vendor/three.js';
export { qi as f } from '../vendor/three.js';
export { Ls as g } from '../vendor/three.js';
export { dn as h } from '../vendor/three.js';
export { Br as i } from '../vendor/three.js';
export { qh as j } from '../vendor/three.js';
export { Ni as k } from '../vendor/three.js';
export { Gv as m } from '../vendor/three.js';
export { Yo as n } from '../vendor/three.js';
export { Qe as o } from '../vendor/three.js';
export { Nv as q } from '../vendor/three.js';
export { Iv as s } from '../vendor/three.js';
export { Lh as t } from '../vendor/three.js';
export { Ct as u } from '../vendor/three.js';
export { vn as v } from '../vendor/three.js';
export { Xt as w } from '../vendor/three.js';
export { ka as x } from '../vendor/three.js';
export { za as y } from '../vendor/three.js';
export { oo as z } from '../vendor/three.js';
export {
  wv as aO,
  Vv as a_,
  Xv as b0,
  Wv as l,
  Yv as p,
  qv as r
};
