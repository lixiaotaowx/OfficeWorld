// Hall model registry + collab sync: the model-id scheme (S1/He), registry
// (Dt/co/S2/M1), thumbnail + placement glue (ho..ke), the worker-backed part
// transformer (yo) and collab send/receive glue (wo/je/Bo).
// Recovered verbatim from chunks/HallView.js.
import { bl as B3, ai as w4, bm as v4, b as re, V as T, G as E0, M as K, f as U0, g as Ie, O as ri, bn as Q4, P as ii, k as Ye, a$ as Ve, n as qe, C as ni, bo as s2 } from '../chunks/portraitLighting.js';
import { R9, ro, no, lo, Ao, D5, fi, so, b9, k5 } from './hallModels.js';
import { KTX2Loader as J0 } from '../vendor/ktx2Loader.js';
import { n1 } from './hallParts.js';
import { OBJLoader as Tr, GLTFExporter as Q1 } from '../vendor/model-io.js';
import { definePrivate as m } from './hallPrelude.js';

const S1 = "model:",
  He = r => r.startsWith(S1) ? r.slice(S1.length) : null,
  F9 = new B3;
let Dt = null;

function co(r) {
  Dt = new WeakRef(r)
}
const S2 = new Map,
  R5 = new WeakMap;

function M1(r) {
  var t;
  const e = R5.get(r);
  if (!e) return !1;
  if (e.disposed) return !0;
  e.disposed = !0;
  try {
    R9(r), r.clear()
  } finally {
    (t = e.release) == null || t.call(e), e.release = void 0
  }
  return !0
}
async function ho(r, e) {
  const t = await fetch(r);
  if (!t.ok) throw Error(`Model load failed: ${t.status}`);
  const s = await t.arrayBuffer(),
    i = (await F9.parseAsync(s, "")).scene,
    n = Dt == null ? void 0 : Dt.deref();
  try {
    if (!n || !crypto.subtle || !["WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_texture_compression_bptc", "WEBGL_compressed_texture_pvrtc"].some(l => n.extensions.has(l))) return i;
    const o = await crypto.subtle.digest("SHA-256", s),
      a = [...new Uint8Array(o)].map(l => l.toString(16).padStart(2, "0")).join("");
    await ro(i, e, a, async () => {
      const l = new J0().setWorkerLimit(1).detectSupport(n);
      try {
        return await l.loadAsync(no)
      } finally {
        l.dispose()
      }
    })
  } catch {}
  return i
}
async function uo(r, e) {
  const t = await fetch(r);
  if (!t.ok) throw Error(`Model load failed: ${t.status}`);
  const s = await t.arrayBuffer(),
    i = (await F9.parseAsync(s, "")).scene;
  try {
    if (!crypto.subtle) return i;
    const n = await crypto.subtle.digest("SHA-256", s),
      o = [...new Uint8Array(n)].map(l => l.toString(16).padStart(2, "0")).join("");
    lo(i, e, o);
    const a = Dt == null ? void 0 : Dt.deref();
    if (a && ["WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_texture_compression_bptc", "WEBGL_compressed_texture_pvrtc"].some(l => a.extensions.has(l))) {
      const l = new J0().setWorkerLimit(1).detectSupport(a);
      try {
        await Ao(i, e, o, A => l.loadAsync(A))
      } finally {
        l.dispose()
      }
    }
  } catch {}
  return i
}
const go = r => {
  const e = `/api/build?modelFile=${encodeURIComponent(r)}`;
  let t = S2.get(r);
  return t || (t = new w4(() => r === D5 ? ho(e, r) : r === fi ? uo(e, r) : F9.loadAsync(e).then(s => s.scene), v4), S2.set(r, t)), t.acquire()
};

function F5(r, e, t = "") {
  const s = r.clone(!0);
  so(s, t), s.updateMatrixWorld(!0);
  const i = new re().setFromObject(s),
    n = i.getSize(new T),
    o = i.getCenter(new T),
    a = new E0,
    l = new E0;
  if (s.position.sub(new T(o.x, i.min.y, o.z)), l.add(s), a.add(l), e) {
    const A = Math.max(n.x, n.y, n.z) || 1;
    l.scale.setScalar(Math.max(...e) / A)
  }
  return a.traverse(A => {
    const c = A;
    c.isMesh && (c.castShadow = c.receiveShadow = !0, c.userData.token = "model", c.material = Array.isArray(c.material) ? c.material.map(h => b9(h.clone())) : b9(c.material.clone()))
  }), a
}

function pi(r, e, t = () => {}, s) {
  const i = new E0;
  i.name = "part:" + r.id;
  const n = {
    disposed: !1
  };
  R5.set(i, n);
  const o = (e == null ? void 0 : e.size) || [.5, .5, .5],
    a = new K(k5(new U0(o[0], o[1], o[2])), b9(new Ie({
      color: "#d8cbb6",
      transparent: !0,
      opacity: .45,
      roughness: 1
    })));
  return a.position.y = o[1] / 2, a.userData.token = "model", i.add(a), n1(i, r), e && go(e.file).then(l => {
    if (n.disposed) {
      l.release();
      return
    }
    n.release = l.release;
    let A;
    try {
      A = F5(l.value, e.size, e.file)
    } catch (c) {
      throw n.release = void 0, l.release(), c
    }
    i.remove(a), R9(a), i.add(A), t()
  }).catch(() => {
    n.disposed || (i.userData.modelLoadFailed = !0, a.material.color.set("#c96a5a"))
  }), i
}
async function fo(r) {
  const e = r.name.split(".").pop().toLowerCase(),
    t = r.name.replace(/\.[^.]+$/, "").slice(0, 60);
  if (r.size > 20 * 1024 * 1024) throw Error("模型文件最大 20 MB");
  let s, i;
  if (e === "glb") s = await r.arrayBuffer(), i = (await F9.parseAsync(s, "")).scene;
  else if (e === "obj") {
    if (i = new Tr().parse(await r.text()), i.traverse(o => {
        const a = o;
        a.isMesh && (a.material = new Ie({
          color: "#e9d4aa",
          roughness: .9
        }))
      }), s = await new Q1().parseAsync(i, {
        binary: !0
      }), s.byteLength > 20 * 1024 * 1024) throw Error("转换后超过 20 MB 了")
  } else throw Error("只支持 .glb 和 .obj");
  i.updateMatrixWorld(!0);
  const n = new re().setFromObject(i);
  if (n.isEmpty()) throw Error("这个文件里没有能显示的模型");
  return {
    glb: s,
    scene: i,
    size: n.getSize(new T),
    name: t
  }
}

function po(r) {
  if (r.altKey || r.metaKey || r.shiftKey || r.isComposing) return null;
  const e = r.ctrlKey;
  switch (r.code) {
    case "Numpad7":
      return {
        yaw: 0, pitch: e ? -Math.PI / 2 : Math.PI / 2, label: e ? "底视图" : "顶视图"
      };
    case "Numpad1":
      return {
        yaw: e ? Math.PI : 0, pitch: 0, label: e ? "后视图" : "前视图"
      };
    case "Numpad3":
      return {
        yaw: e ? -Math.PI / 2 : Math.PI / 2, pitch: 0, label: e ? "左视图" : "右视图"
      };
    default:
      return null
  }
}

function mo(r, e, t, s, i) {
  const n = Math.sin(s),
    o = Math.cos(s);
  r.position.set(e.x + i * o * Math.sin(t), e.y + i * n, e.z + i * o * Math.cos(t)), r.up.set(-n * Math.sin(t), o, -n * Math.cos(t)), r.lookAt(e), r.updateMatrixWorld()
}

function Io(r, e, t, s) {
  return new T().setFromMatrixColumn(r.matrixWorld, 0).multiplyScalar(-e * s).addScaledVector(new T().setFromMatrixColumn(r.matrixWorld, 1), t * s)
}
const Eo = 100;

function Co(r, e, t, s, i, n, o) {
  r.aspect = Math.max(1, n) / Math.max(1, o), r.filmGauge = 36, r.zoom = 1, r.setFocalLength(Eo);
  const l = 5.8 / i / Math.tan(r.fov * Math.PI / 360);
  return r.far = l + 160, mo(r, e, t, s, l), r.updateProjectionMatrix(), l
}

function y1(r, e, t) {
  return r instanceof ri ? (r.top - r.bottom) / r.zoom / Math.max(1, t) : r instanceof Q4 ? 2 * Math.max(r.near, -e.clone().applyMatrix4(r.matrixWorldInverse).z) * Math.tan(r.fov * Math.PI / 360) / r.zoom / Math.max(1, t) : 0
}
async function ot(r = "", e) {
  const t = () => fetch(`/api/build${r}`, {
    credentials: "same-origin",
    cache: "no-store",
    signal: AbortSignal.timeout(15e3),
    ...e ? {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(e)
    } : {}
  });
  let s = await t();
  for (let n = 0; s.status === 429 && e && n < 5; n++) await new Promise(o => setTimeout(o, 150)), s = await t();
  const i = await s.json().catch(() => ({}));
  if (!s.ok) throw Error(i.error || "现在存不了，等一下再试");
  return i
}
const ke = r => {
  const e = {
    kind: r.kind,
    color: r.color,
    x: r.x,
    y: r.y,
    z: r.z,
    rotation: r.rotation || 0
  };
  return r.pitch && (e.pitch = r.pitch), r.roll && (e.roll = r.roll), r.scale && (e.scale = [...r.scale]), e
};
class yo {
  constructor(e) {
    m(this, "revision", -1);
    m(this, "timer", 0);
    m(this, "stopped", !1);
    this.onWorld = e
  }
  take(e) {
    this.stopped || e.revision <= this.revision || (this.revision = e.revision, this.onWorld({
      removedShell: e.removedShell || [],
      revision: e.revision,
      parts: e.parts || [],
      models: e.models || []
    }))
  }
  async load() {
    this.take(await ot())
  }
  follow() {
    if (this.stopped) return;
    const e = async () => {
      if (!this.stopped) {
        try {
          const t = await ot(`?revision=${this.revision}`);
          "unchanged" in t || this.take(t)
        } catch {}
        this.stopped || (this.timer = window.setTimeout(e, document.hidden ? 1e4 : 2e3))
      }
    };
    this.timer = window.setTimeout(e, 2e3)
  }
  stop() {
    this.stopped = !0, clearTimeout(this.timer)
  }
  async send(e) {
    const t = await ot("", e);
    return this.take(t), t
  }
  contents(e) {
    return ot(`?chest=${encodeURIComponent(e)}`)
  }
  screen(e) {
    return ot(`?cinema=${encodeURIComponent(e)}`)
  }
  async command(e) {
    const t = await ot("", e);
    return this.take(t), t
  }
  async uploadVideo(e, t, s = () => {}) {
    if (!["video/mp4", "video/webm"].includes(t.type) || !t.size || t.size > 100 * 1024 * 1024) throw Error("选一个 100 MB 以内的 MP4 或 WebM 视频");
    let i = "";
    for (let n = 0; n < t.size;) {
      const o = new Uint8Array(await t.slice(n, n + 131072).arrayBuffer());
      let a = "";
      for (let A = 0; A < o.length; A += 32768) a += String.fromCharCode(...o.subarray(A, A + 32768));
      const l = await ot(`?cinemaUpload=${encodeURIComponent(e)}`, {
        uploadId: i,
        offset: n,
        total: t.size,
        type: t.type,
        bytes: btoa(a)
      });
      if (i = l.uploadId, n = l.offset, s(Math.round(n / t.size * 100)), l.src) return l.src
    }
    throw Error("视频没传完，再试一次")
  }
  async uploadModel(e, t = () => {}) {
    const s = new Uint8Array(e),
      i = 128 * 1024;
    let n, o = 0;
    for (; o < s.length;) {
      const a = s.subarray(o, o + i);
      let l = "";
      for (let c = 0; c < a.length; c += 32768) l += String.fromCharCode(...a.subarray(c, c + 32768));
      const A = await ot("?modelUpload=1", {
        type: "model/gltf-binary",
        total: s.length,
        offset: o,
        uploadId: n,
        bytes: btoa(l)
      });
      if (n = A.uploadId, o = A.offset, t(o / s.length), A.file) return A.file
    }
    throw Error("模型没传完，再试一次")
  }
}

function wo(r, e, t = null) {
  if (t === null && e) return e;
  if (Math.abs(r.direction.y) < 1e-6 || !Number.isFinite(t ?? 0) || Math.abs(t ?? 0) > 1e4) return null;
  const s = new ii(new T(0, 1, 0), -(t ?? 0)),
    i = r.intersectPlane(s, new T);
  return i && Math.abs(i.x) <= 1e4 && Math.abs(i.z) <= 1e4 ? i : null
}
const je = {
    x: new T(1, 0, 0),
    y: new T(0, 1, 0),
    z: new T(0, 0, 1)
  },
  N5 = {
    x: "#d9665b",
    y: "#6fb06a",
    z: "#5f8fd6",
    u: "#f5efe6"
  };

function Bo() {
  const r = new E0,
    e = new E0,
    t = [],
    s = (i, n, o, a, l, A) => {
      const c = new Ye({
        color: N5[n],
        depthTest: !1,
        depthWrite: !1,
        transparent: !0,
        opacity: .95,
        fog: !1,
        toneMapped: !1
      });
      o.traverse(h => {
        const u = h;
        u.isMesh && (u.material = c, u.renderOrder = 999)
      }), a.material = new Ye({
        visible: !1
      }), a.userData.h = t.length, A.add(o, a), t.push({
        kind: i,
        axis: n,
        mat: c,
        picker: a,
        prio: l
      })
    };
  for (const i of ["x", "y", "z"]) {
    const n = new Ve().setFromUnitVectors(je.y, je[i]),
      o = new E0,
      a = new K(new qe(.016, .016, .72, 8)),
      l = new K(new ni(.055, .17, 16));
    a.position.y = .5, l.position.y = .94, o.add(a, l), o.quaternion.copy(n);
    const A = new K(new qe(.08, .08, .9, 6));
    A.position.copy(je[i]).multiplyScalar(.58), A.quaternion.copy(n), s("move", i, o, A, 2, r);
    const c = new K(new U0(.1, .1, .1));
    c.position.copy(je[i]).multiplyScalar(1.18);
    const h = new K(new U0(.2, .2, .2));
    h.position.copy(c.position), s("scale", i, c, h, 3, r);
    const u = new K(new s2(1.45, .014, 6, 72)),
      d = new K(new s2(1.45, .08, 4, 48));
    i === "x" && (u.rotation.y = d.rotation.y = Math.PI / 2), i === "y" && (u.rotation.x = d.rotation.x = Math.PI / 2), s("rot", i, u, d, 1, e)
  }
  return s("scale", "u", new K(new U0(.12, .12, .12)), new K(new U0(.22, .22, .22)), 4, r), r.add(e), r.visible = !1, r.traverse(i => {
    i.userData.nohit = !0
  }), {
    gz: r,
    rings: e,
    handles: t
  }
}

export { S1, He, co, M1, go, F5, pi, fo, po, Io, Co, y1, ke, yo, wo, je, N5, Bo };
