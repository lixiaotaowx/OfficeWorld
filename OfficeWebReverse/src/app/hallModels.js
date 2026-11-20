// Hall model placement + server loading: placement helpers (gi/b9/k5/T5/R9/so),
// showcase GLB ids (D5/fi) and the server model load/save/download trio
// (ro/lo/Ao). Recovered verbatim from chunks/HallView.js.
import { M as K, V as T, aW as me } from '../chunks/portraitLighting.js';

const gi = new WeakSet,
  Js = new WeakSet;

function b9(r) {
  return gi.add(r), r
}

function k5(r) {
  return Js.add(r), r
}

function T5(r) {
  gi.delete(r) && r.dispose()
}

function R9(r) {
  const e = new Set,
    t = new Set;
  r.traverse(s => {
    const i = s;
    if (i.isMesh) {
      for (const n of Array.isArray(i.material) ? i.material : [i.material]) gi.has(n) && e.add(n);
      Js.has(i.geometry) && t.add(i.geometry)
    }
  });
  for (const s of e) T5(s);
  for (const s of t) Js.delete(s) && s.dispose()
}

function so(r, e) {
  e === "cd46ea91-b2b8-4ca0-9b8f-b7a9be915731.glb" && r.traverse(t => {
    var a;
    if (!(t instanceof K) || !t.geometry) return;
    t.geometry.computeBoundingBox();
    const s = (a = t.geometry.boundingBox) == null ? void 0 : a.getSize(new T);
    if (!s) return;
    const i = (l, A) => Math.abs(l - A) < .002,
      n = i(s.x, .12) && i(s.y, 1.05) && i(s.z, 1.8),
      o = i(s.x, .14) && i(s.y, .04) && i(s.z, 1.8);
    (n || o) && (t.geometry = k5(t.geometry.clone()), t.geometry.scale(1, n ? .96 : 1, n ? .97 : .955))
  })
}
const D5 = "3060aecc-0b28-431f-8a5a-3b68a72ab633.glb",
  io = "9706055dfc4535bf204bc567e06c76eb138aff87c15d20738e10719328ade95b",
  no = "/media/textures/basketball-court.ktx2";
async function ro(r, e, t, s) {
  var A, c, h;
  if (e !== D5 || t !== io) return !1;
  const i = new Set;
  r.traverse(u => {
    var g;
    const d = u;
    if (d.isMesh)
      for (const p of Array.isArray(d.material) ? d.material : [d.material]) {
        const I = p,
          C = (g = I.map) == null ? void 0 : g.image;
        (C == null ? void 0 : C.width) === 4096 && C.height === 2048 && i.add(I)
      }
  });
  const n = new Set([...i].map(u => u.map).filter(u => !!u));
  if (n.size !== 1) return !1;
  const o = [...n][0];
  let a;
  try {
    a = await s()
  } catch {
    return !1
  }
  if (!a.isCompressedTexture || ((A = a.image) == null ? void 0 : A.width) !== 4096 || ((c = a.image) == null ? void 0 : c.height) !== 2048 || a.mipmaps.length < 2) return a.dispose(), !1;
  a.colorSpace = o.colorSpace, a.flipY = o.flipY, a.wrapS = o.wrapS, a.wrapT = o.wrapT, a.magFilter = o.magFilter, a.minFilter = o.minFilter, a.anisotropy = o.anisotropy, a.channel = o.channel, a.offset.copy(o.offset), a.repeat.copy(o.repeat), a.center.copy(o.center), a.rotation = o.rotation, a.matrixAutoUpdate = o.matrixAutoUpdate, a.matrix.copy(o.matrix);
  for (const u of i) u.map = a, u.needsUpdate = !0;
  o.dispose();
  const l = o.image;
  return (h = l == null ? void 0 : l.close) == null || h.call(l), !0
}
const fi = "31c4f2ed-9973-40fd-8c61-5fd7e107fe02.glb",
  L5 = "5f40ccf0310c842ef39a28e301af0731616973f2b35f4a50c8f895f2820e1eea",
  oo = ["/media/textures/ruler-model-color.ktx2", "/media/textures/ruler-model-normal.ktx2", "/media/textures/ruler-model-material.ktx2"],
  ao = 197767;

function lo(r, e, t) {
  if (e !== fi || t !== L5) return !1;
  const s = [];
  if (r.traverse(A => {
      const c = A;
      c.isMesh && s.push(c)
    }), s.length !== 1 || s[0].isSkinnedMesh) return !1;
  const i = s[0].geometry,
    n = ["position", "normal", "uv"],
    o = n.map(A => i.getAttribute(A));
  if (Object.keys(i.morphAttributes).length || o.some((A, c) => !(A instanceof me) || A.normalized || !(A.array instanceof Float32Array) || A.count !== ao || A.itemSize !== (c === 2 ? 2 : 3))) return !1;
  const a = o;
  for (let A = 0; A < a.length; A++)
    for (const c of a[A].array)
      if (!Number.isFinite(c) || c < (A === 2 ? 0 : -1) || c > 1) return !1;
  const l = a.map((A, c) => {
    const h = c === 2 ? 65535 : 32767,
      u = c === 2 ? new Uint16Array(A.array.length) : new Int16Array(A.array.length);
    for (let g = 0; g < u.length; g++) u[g] = Math.round(A.array[g] * h);
    const d = new me(u, A.itemSize, !0);
    return d.name = A.name, d.setUsage(A.usage), d
  });
  return n.forEach((A, c) => i.setAttribute(A, l[c])), i.computeBoundingBox(), i.computeBoundingSphere(), !0
}
async function Ao(r, e, t, s) {
  var l, A, c, h;
  if (e !== fi || t !== L5) return !1;
  const i = [];
  if (r.traverse(u => {
      const d = u;
      d.isMesh && i.push(d)
    }), i.length !== 1 || Array.isArray(i[0].material)) return !1;
  const n = i[0].material;
  if (!n.isMeshStandardMaterial || !n.map || !n.normalMap || !n.roughnessMap || n.metalnessMap !== n.roughnessMap) return !1;
  const o = [n.map, n.normalMap, n.roughnessMap];
  if (new Set(o).size !== 3 || o.some(u => {
      const d = u.image;
      return (d == null ? void 0 : d.width) !== 1024 || (d == null ? void 0 : d.height) !== 1024
    })) return !1;
  const a = [];
  try {
    for (const u of oo) {
      const d = await s(u);
      if (a.push(d), !d.isCompressedTexture || ((l = d.image) == null ? void 0 : l.width) !== 1024 || ((A = d.image) == null ? void 0 : A.height) !== 1024 || d.mipmaps.length !== 11) throw Error("Unexpected compressed texture")
    }
  } catch {
    for (const u of a) u.dispose();
    return !1
  }
  a.forEach((u, d) => {
    const g = o[d];
    u.colorSpace = g.colorSpace, u.flipY = g.flipY, u.wrapS = g.wrapS, u.wrapT = g.wrapT, u.magFilter = g.magFilter, u.minFilter = g.minFilter, u.anisotropy = g.anisotropy, u.channel = g.channel, u.offset.copy(g.offset), u.repeat.copy(g.repeat), u.center.copy(g.center), u.rotation = g.rotation, u.matrixAutoUpdate = g.matrixAutoUpdate, u.matrix.copy(g.matrix)
  }), [n.map, n.normalMap, n.roughnessMap, n.metalnessMap] = [a[0], a[1], a[2], a[2]], n.needsUpdate = !0;
  for (const u of o) u.dispose(), (h = (c = u.image) == null ? void 0 : c.close) == null || h.call(c);
  return !0
}

export { b9, T5, R9, no, ao, ro, lo, Ao, D5, fi, so, k5 };
