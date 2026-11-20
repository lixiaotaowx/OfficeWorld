// three.js model IO addons (r187, vendored verbatim from the production bundle):
// OBJLoader stack (br/vr/kr/Tr) and the GLTFExporter (Q1 front, _r core, writer
// plugins). Only imports/exports added.
import { V as T } from '../chunks/portraitLighting.js';
import { ar as be } from '../chunks/portraitLighting.js';
import { L as d4 } from '../chunks/portraitLighting.js';
import { F as d9 } from '../chunks/portraitLighting.js';
import { S as oe } from '../chunks/portraitLighting.js';
import { G as E0 } from '../chunks/portraitLighting.js';
import { B as k1 } from '../chunks/portraitLighting.js';
import { ak as ct } from '../chunks/portraitLighting.js';
import { b6 as es } from '../chunks/portraitLighting.js';
import { b7 as $i } from '../chunks/portraitLighting.js';
import { b8 as W1 } from '../chunks/portraitLighting.js';
import { b9 as p3 } from '../chunks/portraitLighting.js';
import { ba as e2 } from '../chunks/portraitLighting.js';
import { bb as ts } from '../chunks/portraitLighting.js';
import { M as K } from '../chunks/portraitLighting.js';
import { ae as xe } from '../chunks/portraitLighting.js';
import { ad as y4 } from '../chunks/portraitLighting.js';
import { bh as E3 } from '../chunks/portraitLighting.js';
import { u as pe } from '../chunks/portraitLighting.js';
import { bi as C3 } from '../chunks/portraitLighting.js';
import { v as T9 } from '../chunks/portraitLighting.js';
import { aR as ze } from '../chunks/portraitLighting.js';
import { at as e1 } from '../chunks/portraitLighting.js';
import { bj as y3 } from '../chunks/portraitLighting.js';
import { c as ve } from '../chunks/portraitLighting.js';
import { bc as b4 } from '../chunks/portraitLighting.js';
import { t as Jt } from '../chunks/portraitLighting.js';
import { bd as t2 } from '../chunks/portraitLighting.js';
import { N as Ps } from '../chunks/portraitLighting.js';
import { a4 as ne } from '../chunks/portraitLighting.js';
import { be as m3 } from '../chunks/portraitLighting.js';
import { D as C9 } from '../chunks/portraitLighting.js';
import { bf as y9 } from '../chunks/portraitLighting.js';
import { bg as I3 } from '../chunks/portraitLighting.js';
import { aW as me } from '../chunks/portraitLighting.js';
import { as as Mt } from '../chunks/portraitLighting.js';
import { a as w9 } from '../chunks/portraitLighting.js';
import { a$ as Ve } from '../chunks/portraitLighting.js';
import { bk as w3 } from '../chunks/portraitLighting.js';

function br(r, e, t, s) {
  return r.filter(n => n.part === e && !s(n.id)).sort((n, o) => Math.hypot(n.at.x - t.x, n.at.z - t.z) - Math.hypot(o.at.x - t.x, o.at.z - t.z))[0] || null
}
const vr = /^[og]\s*(.+)?/,
  Qr = /^mtllib /,
  Sr = /^usemtl /,
  Mr = /^usemap /,
  r9 = /\s+/,
  y2 = new T,
  ys = new T,
  w2 = new T,
  B2 = new T,
  he = new T,
  o9 = new be;

function kr() {
  const r = {
    objects: [],
    object: {},
    vertices: [],
    normals: [],
    colors: [],
    uvs: [],
    materials: {},
    materialLibraries: [],
    startObject: function(e, t) {
      if (this.object && this.object.fromDeclaration === !1) {
        this.object.name = e, this.object.fromDeclaration = t !== !1;
        return
      }
      const s = this.object && typeof this.object.currentMaterial == "function" ? this.object.currentMaterial() : void 0;
      if (this.object && typeof this.object._finalize == "function" && this.object._finalize(!0), this.object = {
          name: e || "",
          fromDeclaration: t !== !1,
          geometry: {
            vertices: [],
            normals: [],
            colors: [],
            uvs: [],
            hasUVIndices: !1
          },
          materials: [],
          smooth: !0,
          startMaterial: function(i, n) {
            const o = this._finalize(!1);
            o && (o.inherited || o.groupCount <= 0) && this.materials.splice(o.index, 1);
            const a = {
              index: this.materials.length,
              name: i || "",
              mtllib: Array.isArray(n) && n.length > 0 ? n[n.length - 1] : "",
              smooth: o !== void 0 ? o.smooth : this.smooth,
              groupStart: o !== void 0 ? o.groupEnd : 0,
              groupEnd: -1,
              groupCount: -1,
              inherited: !1,
              clone: function(l) {
                const A = {
                  index: typeof l == "number" ? l : this.index,
                  name: this.name,
                  mtllib: this.mtllib,
                  smooth: this.smooth,
                  groupStart: 0,
                  groupEnd: -1,
                  groupCount: -1,
                  inherited: !1
                };
                return A.clone = this.clone.bind(A), A
              }
            };
            return this.materials.push(a), a
          },
          currentMaterial: function() {
            if (this.materials.length > 0) return this.materials[this.materials.length - 1]
          },
          _finalize: function(i) {
            const n = this.currentMaterial();
            if (n && n.groupEnd === -1 && (n.groupEnd = this.geometry.vertices.length / 3, n.groupCount = n.groupEnd - n.groupStart, n.inherited = !1), i && this.materials.length > 1)
              for (let o = this.materials.length - 1; o >= 0; o--) this.materials[o].groupCount <= 0 && this.materials.splice(o, 1);
            return i && this.materials.length === 0 && this.materials.push({
              name: "",
              smooth: this.smooth
            }), n
          }
        }, s && s.name && typeof s.clone == "function") {
        const i = s.clone(0);
        i.inherited = !0, this.object.materials.push(i)
      }
      this.objects.push(this.object)
    },
    finalize: function() {
      this.object && typeof this.object._finalize == "function" && this.object._finalize(!0)
    },
    parseVertexIndex: function(e, t) {
      const s = parseInt(e, 10);
      return (s >= 0 ? s - 1 : s + t / 3) * 3
    },
    parseNormalIndex: function(e, t) {
      const s = parseInt(e, 10);
      return (s >= 0 ? s - 1 : s + t / 3) * 3
    },
    parseUVIndex: function(e, t) {
      const s = parseInt(e, 10);
      return (s >= 0 ? s - 1 : s + t / 2) * 2
    },
    addVertex: function(e, t, s) {
      const i = this.vertices,
        n = this.object.geometry.vertices;
      n.push(i[e + 0], i[e + 1], i[e + 2]), n.push(i[t + 0], i[t + 1], i[t + 2]), n.push(i[s + 0], i[s + 1], i[s + 2])
    },
    addVertexPoint: function(e) {
      const t = this.vertices;
      this.object.geometry.vertices.push(t[e + 0], t[e + 1], t[e + 2])
    },
    addVertexLine: function(e) {
      const t = this.vertices;
      this.object.geometry.vertices.push(t[e + 0], t[e + 1], t[e + 2])
    },
    addNormal: function(e, t, s) {
      const i = this.normals,
        n = this.object.geometry.normals;
      n.push(i[e + 0], i[e + 1], i[e + 2]), n.push(i[t + 0], i[t + 1], i[t + 2]), n.push(i[s + 0], i[s + 1], i[s + 2])
    },
    addFaceNormal: function(e, t, s) {
      const i = this.vertices,
        n = this.object.geometry.normals;
      y2.fromArray(i, e), ys.fromArray(i, t), w2.fromArray(i, s), he.subVectors(w2, ys), B2.subVectors(y2, ys), he.cross(B2), he.normalize(), n.push(he.x, he.y, he.z), n.push(he.x, he.y, he.z), n.push(he.x, he.y, he.z)
    },
    addColor: function(e, t, s) {
      const i = this.colors,
        n = this.object.geometry.colors;
      i[e] !== void 0 && n.push(i[e + 0], i[e + 1], i[e + 2]), i[t] !== void 0 && n.push(i[t + 0], i[t + 1], i[t + 2]), i[s] !== void 0 && n.push(i[s + 0], i[s + 1], i[s + 2])
    },
    addUV: function(e, t, s) {
      const i = this.uvs,
        n = this.object.geometry.uvs;
      n.push(i[e + 0], i[e + 1]), n.push(i[t + 0], i[t + 1]), n.push(i[s + 0], i[s + 1])
    },
    addDefaultUV: function() {
      const e = this.object.geometry.uvs;
      e.push(0, 0), e.push(0, 0), e.push(0, 0)
    },
    addUVLine: function(e) {
      const t = this.uvs;
      this.object.geometry.uvs.push(t[e + 0], t[e + 1])
    },
    addFace: function(e, t, s, i, n, o, a, l, A) {
      const c = this.vertices.length;
      let h = this.parseVertexIndex(e, c),
        u = this.parseVertexIndex(t, c),
        d = this.parseVertexIndex(s, c);
      if (this.addVertex(h, u, d), this.addColor(h, u, d), a !== void 0 && a !== "") {
        const g = this.normals.length;
        h = this.parseNormalIndex(a, g), u = this.parseNormalIndex(l, g), d = this.parseNormalIndex(A, g), this.addNormal(h, u, d)
      } else this.addFaceNormal(h, u, d);
      if (i !== void 0 && i !== "") {
        const g = this.uvs.length;
        h = this.parseUVIndex(i, g), u = this.parseUVIndex(n, g), d = this.parseUVIndex(o, g), this.addUV(h, u, d), this.object.geometry.hasUVIndices = !0
      } else this.addDefaultUV()
    },
    addPointGeometry: function(e) {
      this.object.geometry.type = "Points";
      const t = this.vertices.length;
      for (let s = 0, i = e.length; s < i; s++) {
        const n = this.parseVertexIndex(e[s], t);
        this.addVertexPoint(n), this.addColor(n)
      }
    },
    addLineGeometry: function(e, t) {
      this.object.geometry.type = "Line";
      const s = this.vertices.length,
        i = this.uvs.length;
      for (let n = 0, o = e.length - 1; n < o; n++) this.addVertexLine(this.parseVertexIndex(e[n], s)), this.addVertexLine(this.parseVertexIndex(e[n + 1], s));
      for (let n = 0, o = t.length - 1; n < o; n++) this.addUVLine(this.parseUVIndex(t[n], i)), this.addUVLine(this.parseUVIndex(t[n + 1], i))
    }
  };
  return r.startObject("", !1), r
}
class Tr extends d4 {
  constructor(e) {
    super(e), this.materials = null
  }
  load(e, t, s, i) {
    const n = this,
      o = new d9(this.manager);
    o.setPriority(this.priority), o.setCache(this.cache), o.setPath(this.path), o.setRequestHeader(this.requestHeader), o.setWithCredentials(this.withCredentials), o.load(e, function(a) {
      try {
        t(n.parse(a))
      } catch (l) {
        i ? i(l) : console.error(l), n.manager.itemError(e)
      }
    }, s, i)
  }
  setMaterials(e) {
    return this.materials = e, this
  }
  parse(e) {
    const t = new kr;
    e.indexOf(`\r
`) !== -1 && (e = e.replace(/\r\n/g, `
`)), e.indexOf(`\\
`) !== -1 && (e = e.replace(/\\\n/g, ""));
    const s = e.split(`
`);
    let i = [];
    for (let a = 0, l = s.length; a < l; a++) {
      const A = s[a].trimStart();
      if (A.length === 0) continue;
      const c = A.charAt(0);
      if (c !== "#")
        if (c === "v") {
          const h = A.split(r9);
          switch (h[0]) {
            case "v":
              t.vertices.push(parseFloat(h[1]), parseFloat(h[2]), parseFloat(h[3])), h.length >= 7 ? (o9.setRGB(parseFloat(h[4]), parseFloat(h[5]), parseFloat(h[6]), oe), t.colors.push(o9.r, o9.g, o9.b)) : t.colors.push(void 0, void 0, void 0);
              break;
            case "vn":
              t.normals.push(parseFloat(h[1]), parseFloat(h[2]), parseFloat(h[3]));
              break;
            case "vt":
              t.uvs.push(parseFloat(h[1]), parseFloat(h[2]));
              break
          }
        } else if (c === "f") {
        const u = A.slice(1).trim().split(r9),
          d = [];
        for (let p = 0, I = u.length; p < I; p++) {
          const C = u[p];
          if (C.length > 0) {
            const E = C.split("/");
            d.push(E)
          }
        }
        const g = d[0];
        for (let p = 1, I = d.length - 1; p < I; p++) {
          const C = d[p],
            E = d[p + 1];
          t.addFace(g[0], C[0], E[0], g[1], C[1], E[1], g[2], C[2], E[2])
        }
      } else if (c === "l") {
        const h = A.substring(1).trim().split(r9);
        let u = [];
        const d = [];
        if (A.indexOf("/") === -1) u = h;
        else
          for (let g = 0, p = h.length; g < p; g++) {
            const I = h[g].split("/");
            I[0] !== "" && u.push(I[0]), I[1] !== "" && d.push(I[1])
          }
        t.addLineGeometry(u, d)
      } else if (c === "p") {
        const u = A.slice(1).trim().split(r9);
        t.addPointGeometry(u)
      } else if ((i = vr.exec(A)) !== null) {
        const h = (" " + i[0].slice(1).trim()).slice(1);
        t.startObject(h)
      } else if (Sr.test(A)) t.object.startMaterial(A.substring(7).trim(), t.materialLibraries);
      else if (Qr.test(A)) t.materialLibraries.push(A.substring(7).trim());
      else if (Mr.test(A)) console.warn('THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.');
      else if (c === "s") {
        if (i = A.split(" "), i.length > 1) {
          const u = i[1].trim().toLowerCase();
          t.object.smooth = u !== "0" && u !== "off"
        } else t.object.smooth = !0;
        const h = t.object.currentMaterial();
        h && (h.smooth = t.object.smooth)
      } else {
        if (A === "\0") continue;
        console.warn('THREE.OBJLoader: Unexpected line: "' + A + '"')
      }
    }
    t.finalize();
    const n = new E0;
    if (n.materialLibraries = [].concat(t.materialLibraries), !(t.objects.length === 1 && t.objects[0].geometry.vertices.length === 0) === !0)
      for (let a = 0, l = t.objects.length; a < l; a++) {
        const A = t.objects[a],
          c = A.geometry,
          h = A.materials,
          u = c.type === "Line",
          d = c.type === "Points";
        let g = !1;
        if (c.vertices.length === 0) continue;
        const p = new k1;
        p.setAttribute("position", new ct(c.vertices, 3)), c.normals.length > 0 && p.setAttribute("normal", new ct(c.normals, 3)), c.colors.length > 0 && (g = !0, p.setAttribute("color", new ct(c.colors, 3))), c.hasUVIndices === !0 && p.setAttribute("uv", new ct(c.uvs, 2));
        const I = [];
        for (let E = 0, x = h.length; E < x; E++) {
          const B = h[E],
            b = B.name + "_" + B.smooth + "_" + g;
          let v = t.materials[b];
          if (this.materials !== null) {
            if (v = this.materials.create(B.name), u && v && !(v instanceof es)) {
              const L = new es;
              $i.prototype.copy.call(L, v), L.color.copy(v.color), v = L
            } else if (d && v && !(v instanceof W1)) {
              const L = new W1({
                size: 10,
                sizeAttenuation: !1
              });
              $i.prototype.copy.call(L, v), L.color.copy(v.color), L.map = v.map, v = L
            }
          }
          v === void 0 && (u ? v = new es : d ? v = new W1({
            size: 1,
            sizeAttenuation: !1
          }) : v = new p3, v.name = B.name, v.flatShading = !B.smooth, v.vertexColors = g, t.materials[b] = v), I.push(v)
        }
        let C;
        if (I.length > 1) {
          for (let E = 0, x = h.length; E < x; E++) {
            const B = h[E];
            p.addGroup(B.groupStart, B.groupCount, E)
          }
          u ? C = new e2(p, I) : d ? C = new ts(p, I) : C = new K(p, I)
        } else u ? C = new e2(p, I[0]) : d ? C = new ts(p, I[0]) : C = new K(p, I[0]);
        C.name = A.name, n.add(C)
      } else if (t.vertices.length > 0) {
        const a = new W1({
            size: 1,
            sizeAttenuation: !1
          }),
          l = new k1;
        l.setAttribute("position", new ct(t.vertices, 3)), t.colors.length > 0 && t.colors[0] !== void 0 && (l.setAttribute("color", new ct(t.colors, 3)), a.vertexColors = !0);
        const A = new ts(l, a);
        n.add(A)
      } return n
  }
}
const x2 = {
  POSITION: ["byte", "byte normalized", "unsigned byte", "unsigned byte normalized", "short", "short normalized", "unsigned short", "unsigned short normalized"],
  NORMAL: ["byte normalized", "short normalized"],
  TANGENT: ["byte normalized", "short normalized"],
  TEXCOORD: ["byte", "byte normalized", "unsigned byte", "short", "short normalized", "unsigned short"]
};
class Q1 {
  constructor() {
    this.textureUtils = null, this.pluginCallbacks = [], this.register(function(e) {
      return new Or(e)
    }), this.register(function(e) {
      return new Hr(e)
    }), this.register(function(e) {
      return new Vr(e)
    }), this.register(function(e) {
      return new Yr(e)
    }), this.register(function(e) {
      return new Jr(e)
    }), this.register(function(e) {
      return new Kr(e)
    }), this.register(function(e) {
      return new jr(e)
    }), this.register(function(e) {
      return new qr(e)
    }), this.register(function(e) {
      return new Wr(e)
    }), this.register(function(e) {
      return new Xr(e)
    }), this.register(function(e) {
      return new Zr(e)
    }), this.register(function(e) {
      return new $r(e)
    }), this.register(function(e) {
      return new eo(e)
    }), this.register(function(e) {
      return new to(e)
    })
  }
  register(e) {
    return this.pluginCallbacks.indexOf(e) === -1 && this.pluginCallbacks.push(e), this
  }
  unregister(e) {
    return this.pluginCallbacks.indexOf(e) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e), 1), this
  }
  setTextureUtils(e) {
    return this.textureUtils = e, this
  }
  parse(e, t, s, i) {
    const n = new _r,
      o = [];
    for (let a = 0, l = this.pluginCallbacks.length; a < l; a++) o.push(this.pluginCallbacks[a](n));
    n.setPlugins(o), n.setTextureUtils(this.textureUtils), n.writeAsync(e, t, i).catch(s)
  }
  parseAsync(e, t) {
    const s = this;
    return new Promise(function(i, n) {
      s.parse(e, i, n, t)
    })
  }
}
const e0 = {
    POINTS: 0,
    LINES: 1,
    LINE_LOOP: 2,
    LINE_STRIP: 3,
    TRIANGLES: 4,
    BYTE: 5120,
    UNSIGNED_BYTE: 5121,
    SHORT: 5122,
    UNSIGNED_SHORT: 5123,
    INT: 5124,
    UNSIGNED_INT: 5125,
    FLOAT: 5126,
    ARRAY_BUFFER: 34962,
    ELEMENT_ARRAY_BUFFER: 34963,
    NEAREST: 9728,
    LINEAR: 9729,
    NEAREST_MIPMAP_NEAREST: 9984,
    LINEAR_MIPMAP_NEAREST: 9985,
    NEAREST_MIPMAP_LINEAR: 9986,
    LINEAR_MIPMAP_LINEAR: 9987,
    CLAMP_TO_EDGE: 33071,
    MIRRORED_REPEAT: 33648,
    REPEAT: 10497
  },
  ws = "KHR_mesh_quantization",
  ae = {};
ae[xe] = e0.NEAREST;
ae[y4] = e0.NEAREST_MIPMAP_NEAREST;
ae[E3] = e0.NEAREST_MIPMAP_LINEAR;
ae[pe] = e0.LINEAR;
ae[C3] = e0.LINEAR_MIPMAP_NEAREST;
ae[T9] = e0.LINEAR_MIPMAP_LINEAR;
ae[ze] = e0.CLAMP_TO_EDGE;
ae[e1] = e0.REPEAT;
ae[y3] = e0.MIRRORED_REPEAT;
const b2 = {
    scale: "scale",
    position: "translation",
    quaternion: "rotation",
    morphTargetInfluences: "weights"
  },
  Dr = new be,
  v2 = 12,
  Lr = 1179937895,
  Rr = 2,
  Q2 = 8,
  Fr = 1313821514,
  Nr = 5130562;

function Oe(r, e) {
  return r.length === e.length && r.every(function(t, s) {
    return t === e[s]
  })
}

function Pr(r) {
  return new TextEncoder().encode(r).buffer
}

function Ur(r) {
  return Oe(r.elements, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
}

function Gr(r, e, t) {
  const s = {
    min: new Array(r.itemSize).fill(Number.POSITIVE_INFINITY),
    max: new Array(r.itemSize).fill(Number.NEGATIVE_INFINITY)
  };
  for (let i = e; i < e + t; i++)
    for (let n = 0; n < r.itemSize; n++) {
      let o;
      r.itemSize > 4 ? o = r.array[i * r.itemSize + n] : (n === 0 ? o = r.getX(i) : n === 1 ? o = r.getY(i) : n === 2 ? o = r.getZ(i) : n === 3 && (o = r.getW(i)), r.normalized === !0 && (o = ve.normalize(o, r.array))), s.min[n] = Math.min(s.min[n], o), s.max[n] = Math.max(s.max[n], o)
    }
  return s
}

function M5(r) {
  return Math.ceil(r / 4) * 4
}

function Bs(r, e = 0) {
  const t = M5(r.byteLength);
  if (t !== r.byteLength) {
    const s = new Uint8Array(t);
    if (s.set(new Uint8Array(r)), e !== 0)
      for (let i = r.byteLength; i < t; i++) s[i] = e;
    return s.buffer
  }
  return r
}

function xs() {
  return typeof document > "u" && typeof OffscreenCanvas < "u" ? new OffscreenCanvas(1, 1) : document.createElement("canvas")
}

function zr(r, e) {
  if (typeof OffscreenCanvas < "u" && r instanceof OffscreenCanvas) {
    let t;
    return e === "image/jpeg" ? t = .92 : e === "image/webp" && (t = .8), r.convertToBlob({
      type: e,
      quality: t
    })
  } else return new Promise(t => r.toBlob(t, e))
}
class _r {
  constructor() {
    this.plugins = [], this.options = {}, this.pending = [], this.buffers = [], this.byteOffset = 0, this.buffers = [], this.nodeMap = new Map, this.skins = [], this.extensionsUsed = {}, this.extensionsRequired = {}, this.uids = new Map, this.uid = 0, this.json = {
      asset: {
        version: "2.0",
        generator: "THREE.GLTFExporter r" + b4
      }
    }, this.cache = {
      meshes: new Map,
      attributes: new Map,
      attributesNormalized: new Map,
      materials: new Map,
      textures: new Map,
      images: new Map,
      normalMaps: new Map
    }, this.textureUtils = null
  }
  setPlugins(e) {
    this.plugins = e
  }
  setTextureUtils(e) {
    this.textureUtils = e
  }
  async writeAsync(e, t, s = {}) {
    this.options = Object.assign({
      binary: !1,
      trs: !1,
      onlyVisible: !0,
      maxTextureSize: 1 / 0,
      animations: [],
      includeCustomExtensions: !1,
      copyright: null
    }, s), this.options.animations.length > 0 && (this.options.trs = !0), await this.processInputAsync(e), await Promise.all(this.pending);
    const i = this,
      n = i.buffers,
      o = i.json;
    s = i.options;
    const a = i.extensionsUsed,
      l = i.extensionsRequired,
      A = new Blob(n, {
        type: "application/octet-stream"
      }),
      c = Object.keys(a),
      h = Object.keys(l);
    if (c.length > 0 && (o.extensionsUsed = c), h.length > 0 && (o.extensionsRequired = h), o.buffers && o.buffers.length > 0 && (o.buffers[0].byteLength = A.size), s.copyright && (o.asset.copyright = s.copyright), s.binary === !0) {
      const u = new FileReader;
      u.readAsArrayBuffer(A), u.onloadend = function() {
        const d = Bs(u.result),
          g = new DataView(new ArrayBuffer(Q2));
        g.setUint32(0, d.byteLength, !0), g.setUint32(4, Nr, !0);
        const p = Bs(Pr(JSON.stringify(o)), 32),
          I = new DataView(new ArrayBuffer(Q2));
        I.setUint32(0, p.byteLength, !0), I.setUint32(4, Fr, !0);
        const C = new ArrayBuffer(v2),
          E = new DataView(C);
        E.setUint32(0, Lr, !0), E.setUint32(4, Rr, !0);
        const x = v2 + I.byteLength + p.byteLength + g.byteLength + d.byteLength;
        E.setUint32(8, x, !0);
        const B = new Blob([C, I, p, g, d], {
            type: "application/octet-stream"
          }),
          b = new FileReader;
        b.readAsArrayBuffer(B), b.onloadend = function() {
          t(b.result)
        }
      }
    } else if (o.buffers && o.buffers.length > 0) {
      const u = new FileReader;
      u.readAsDataURL(A), u.onloadend = function() {
        const d = u.result;
        o.buffers[0].uri = d, t(o)
      }
    } else t(o)
  }
  serializeUserData(e, t) {
    if (Object.keys(e.userData).length === 0) return;
    const s = this.options,
      i = this.extensionsUsed;
    try {
      const n = JSON.parse(JSON.stringify(e.userData));
      if (s.includeCustomExtensions && n.gltfExtensions) {
        t.extensions === void 0 && (t.extensions = {});
        for (const o in n.gltfExtensions) t.extensions[o] = n.gltfExtensions[o], i[o] = !0;
        delete n.gltfExtensions
      }
      Object.keys(n).length > 0 && (t.extras = n)
    } catch (n) {
      console.warn("THREE.GLTFExporter: userData of '" + e.name + "' won't be serialized because of JSON.stringify error - " + n.message)
    }
  }
  getUID(e, t = !1) {
    if (this.uids.has(e) === !1) {
      const i = new Map;
      i.set(!0, this.uid++), i.set(!1, this.uid++), this.uids.set(e, i)
    }
    return this.uids.get(e).get(t)
  }
  isNormalizedNormalAttribute(e) {
    if (this.cache.attributesNormalized.has(e)) return !1;
    const s = new T;
    for (let i = 0, n = e.count; i < n; i++)
      if (Math.abs(s.fromBufferAttribute(e, i).length() - 1) > 5e-4) return !1;
    return !0
  }
  createNormalizedNormalAttribute(e) {
    const t = this.cache;
    if (t.attributesNormalized.has(e)) return t.attributesNormalized.get(e);
    const s = e.clone(),
      i = new T;
    for (let n = 0, o = s.count; n < o; n++) i.fromBufferAttribute(s, n), i.x === 0 && i.y === 0 && i.z === 0 ? i.setX(1) : i.normalize(), s.setXYZ(n, i.x, i.y, i.z);
    return t.attributesNormalized.set(e, s), s
  }
  applyTextureTransform(e, t) {
    let s = !1;
    const i = {};
    (t.offset.x !== 0 || t.offset.y !== 0) && (i.offset = t.offset.toArray(), s = !0), t.rotation !== 0 && (i.rotation = t.rotation, s = !0), (t.repeat.x !== 1 || t.repeat.y !== 1) && (i.scale = t.repeat.toArray(), s = !0), s && (e.extensions = e.extensions || {}, e.extensions.KHR_texture_transform = i, this.extensionsUsed.KHR_texture_transform = !0)
  }
  async buildMetalRoughTextureAsync(e, t) {
    if (e === t) return e;

    function s(d) {
      return d.colorSpace === oe ? function(p) {
        return p < .04045 ? p * .0773993808 : Math.pow(p * .9478672986 + .0521327014, 2.4)
      } : function(p) {
        return p
      }
    }
    e instanceof Jt && (e = await this.decompressTextureAsync(e)), t instanceof Jt && (t = await this.decompressTextureAsync(t));
    const i = e ? e.image : null,
      n = t ? t.image : null,
      o = Math.max(i ? i.width : 0, n ? n.width : 0),
      a = Math.max(i ? i.height : 0, n ? n.height : 0),
      l = xs();
    l.width = o, l.height = a;
    const A = l.getContext("2d", {
      willReadFrequently: !0
    });
    A.fillStyle = "#00ffff", A.fillRect(0, 0, o, a);
    const c = A.getImageData(0, 0, o, a);
    if (i) {
      A.drawImage(i, 0, 0, o, a);
      const d = s(e),
        g = A.getImageData(0, 0, o, a).data;
      for (let p = 2; p < g.length; p += 4) c.data[p] = d(g[p] / 256) * 256
    }
    if (n) {
      A.drawImage(n, 0, 0, o, a);
      const d = s(t),
        g = A.getImageData(0, 0, o, a).data;
      for (let p = 1; p < g.length; p += 4) c.data[p] = d(g[p] / 256) * 256
    }
    A.putImageData(c, 0, 0);
    const u = (e || t).clone();
    return u.source = new t2(l), u.colorSpace = Ps, u.channel = (e || t).channel, e && t && e.channel !== t.channel && console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."), console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."), u
  }
  async buildNormalMapTextureAsync(e, t, s) {
    e instanceof Jt && (e = await this.decompressTextureAsync(e));
    const i = e.image,
      n = xs();
    n.width = i.width, n.height = i.height;
    const o = n.getContext("2d", {
      willReadFrequently: !0
    });
    o.drawImage(i, 0, 0, n.width, n.height);
    const a = o.getImageData(0, 0, n.width, n.height),
      l = a.data;
    for (let c = 0; c < l.length; c += 4) t && (l[c + 0] = 255 - l[c + 0]), s && (l[c + 1] = 255 - l[c + 1]);
    o.putImageData(a, 0, 0);
    const A = e.clone();
    return A.source = new t2(n), A
  }
  async decompressTextureAsync(e, t = 1 / 0) {
    if (this.textureUtils === null) throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");
    return await this.textureUtils.decompress(e, t)
  }
  processBuffer(e) {
    const t = this.json,
      s = this.buffers;
    return t.buffers || (t.buffers = [{
      byteLength: 0
    }]), s.push(e), 0
  }
  processBufferView(e, t, s, i, n) {
    const o = this.json;
    o.bufferViews || (o.bufferViews = []);
    let a;
    switch (t) {
      case e0.BYTE:
      case e0.UNSIGNED_BYTE:
        a = 1;
        break;
      case e0.SHORT:
      case e0.UNSIGNED_SHORT:
        a = 2;
        break;
      default:
        a = 4
    }
    let l = e.itemSize * a;
    n === e0.ARRAY_BUFFER && (l = Math.ceil(l / 4) * 4);
    const A = M5(i * l),
      c = new DataView(new ArrayBuffer(A));
    let h = 0;
    for (let g = s; g < s + i; g++) {
      for (let p = 0; p < e.itemSize; p++) {
        let I;
        e.itemSize > 4 ? I = e.array[g * e.itemSize + p] : (p === 0 ? I = e.getX(g) : p === 1 ? I = e.getY(g) : p === 2 ? I = e.getZ(g) : p === 3 && (I = e.getW(g)), e.normalized === !0 && (I = ve.normalize(I, e.array))), t === e0.FLOAT ? c.setFloat32(h, I, !0) : t === e0.INT ? c.setInt32(h, I, !0) : t === e0.UNSIGNED_INT ? c.setUint32(h, I, !0) : t === e0.SHORT ? c.setInt16(h, I, !0) : t === e0.UNSIGNED_SHORT ? c.setUint16(h, I, !0) : t === e0.BYTE ? c.setInt8(h, I) : t === e0.UNSIGNED_BYTE && c.setUint8(h, I), h += a
      }
      h % l !== 0 && (h += l - h % l)
    }
    const u = {
      buffer: this.processBuffer(c.buffer),
      byteOffset: this.byteOffset,
      byteLength: A
    };
    return n !== void 0 && (u.target = n), n === e0.ARRAY_BUFFER && (u.byteStride = l), this.byteOffset += A, o.bufferViews.push(u), {
      id: o.bufferViews.length - 1,
      byteLength: 0
    }
  }
  processBufferViewImage(e) {
    const t = this,
      s = t.json;
    return s.bufferViews || (s.bufferViews = []), new Promise(function(i) {
      const n = new FileReader;
      n.readAsArrayBuffer(e), n.onloadend = function() {
        const o = Bs(n.result),
          a = {
            buffer: t.processBuffer(o),
            byteOffset: t.byteOffset,
            byteLength: o.byteLength
          };
        t.byteOffset += o.byteLength, i(s.bufferViews.push(a) - 1)
      }
    })
  }
  processAccessor(e, t, s, i) {
    const n = this.json,
      o = {
        1: "SCALAR",
        2: "VEC2",
        3: "VEC3",
        4: "VEC4",
        9: "MAT3",
        16: "MAT4"
      };
    let a;
    if (e.array.constructor === Float32Array) a = e0.FLOAT;
    else if (e.array.constructor === Int32Array) a = e0.INT;
    else if (e.array.constructor === Uint32Array) a = e0.UNSIGNED_INT;
    else if (e.array.constructor === Int16Array) a = e0.SHORT;
    else if (e.array.constructor === Uint16Array) a = e0.UNSIGNED_SHORT;
    else if (e.array.constructor === Int8Array) a = e0.BYTE;
    else if (e.array.constructor === Uint8Array) a = e0.UNSIGNED_BYTE;
    else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: " + e.array.constructor.name);
    if (s === void 0 && (s = 0), (i === void 0 || i === 1 / 0) && (i = e.count), i === 0) return null;
    const l = Gr(e, s, i);
    let A;
    t !== void 0 && (A = e === t.index ? e0.ELEMENT_ARRAY_BUFFER : e0.ARRAY_BUFFER);
    const c = this.processBufferView(e, a, s, i, A),
      h = {
        bufferView: c.id,
        byteOffset: c.byteOffset,
        componentType: a,
        count: i,
        max: l.max,
        min: l.min,
        type: o[e.itemSize]
      };
    return e.normalized === !0 && (h.normalized = !0), n.accessors || (n.accessors = []), n.accessors.push(h) - 1
  }
  processImage(e, t, s, i = "image/png") {
    if (e !== null) {
      const n = this,
        o = n.cache,
        a = n.json,
        l = n.options,
        A = n.pending;
      o.images.has(e) || o.images.set(e, {});
      const c = o.images.get(e),
        h = i + ":flipY/" + s.toString();
      if (c[h] !== void 0) return c[h];
      a.images || (a.images = []);
      const u = {
          mimeType: i
        },
        d = xs();
      d.width = Math.min(e.width, l.maxTextureSize), d.height = Math.min(e.height, l.maxTextureSize);
      const g = d.getContext("2d", {
        willReadFrequently: !0
      });
      if (s === !0 && (g.translate(0, d.height), g.scale(1, -1)), e.data !== void 0) {
        t !== ne && console.error("GLTFExporter: Only RGBAFormat is supported.", t), (e.width > l.maxTextureSize || e.height > l.maxTextureSize) && console.warn("GLTFExporter: Image size is bigger than maxTextureSize", e);
        const I = new Uint8ClampedArray(e.height * e.width * 4);
        for (let C = 0; C < I.length; C += 4) I[C + 0] = e.data[C + 0], I[C + 1] = e.data[C + 1], I[C + 2] = e.data[C + 2], I[C + 3] = e.data[C + 3];
        g.putImageData(new ImageData(I, e.width, e.height), 0, 0)
      } else if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap || typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas) g.drawImage(e, 0, 0, d.width, d.height);
      else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");
      l.binary === !0 ? A.push(zr(d, i).then(I => n.processBufferViewImage(I)).then(I => {
        u.bufferView = I
      })) : u.uri = m3.getDataURL(d, i);
      const p = a.images.push(u) - 1;
      return c[h] = p, p
    } else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")
  }
  processSampler(e) {
    const t = this.json;
    t.samplers || (t.samplers = []);
    const s = {
      magFilter: ae[e.magFilter],
      minFilter: ae[e.minFilter],
      wrapS: ae[e.wrapS],
      wrapT: ae[e.wrapT]
    };
    return t.samplers.push(s) - 1
  }
  async processTextureAsync(e) {
    const s = this.options,
      i = this.cache,
      n = this.json;
    if (i.textures.has(e)) return i.textures.get(e);
    n.textures || (n.textures = []), e instanceof Jt && (e = await this.decompressTextureAsync(e, s.maxTextureSize));
    const o = e.userData.mimeType,
      a = this.processImage(e.image, e.format, e.flipY, o),
      l = {
        sampler: this.processSampler(e)
      };
    o === "image/webp" ? (l.extensions = l.extensions || {}, l.extensions.EXT_texture_webp = {
      source: a
    }, this.extensionsUsed.EXT_texture_webp = !0, this.extensionsRequired.EXT_texture_webp = !0) : l.source = a, e.name && (l.name = e.name), await this._invokeAllAsync(async function(c) {
      c.writeTexture && await c.writeTexture(e, l)
    });
    const A = n.textures.push(l) - 1;
    return i.textures.set(e, A), A
  }
  async processMaterialAsync(e, t) {
    const s = this.cache,
      i = this.json,
      n = t !== void 0 && t.hasAttribute("tangent"),
      o = e.normalMap ? e.uuid + ":" + n : e.uuid;
    if (s.materials.has(o)) return s.materials.get(o);
    if (e.isShaderMaterial) return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."), null;
    i.materials || (i.materials = []);
    const a = {
      pbrMetallicRoughness: {}
    };
    e.isMeshStandardMaterial !== !0 && e.isMeshBasicMaterial !== !0 && console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");
    const l = e.color.toArray().concat([e.opacity]);
    if (Oe(l, [1, 1, 1, 1]) || (a.pbrMetallicRoughness.baseColorFactor = l), e.isMeshStandardMaterial ? (a.pbrMetallicRoughness.metallicFactor = e.metalness, a.pbrMetallicRoughness.roughnessFactor = e.roughness) : (a.pbrMetallicRoughness.metallicFactor = 0, a.pbrMetallicRoughness.roughnessFactor = 1), e.metalnessMap || e.roughnessMap) {
      const c = await this.buildMetalRoughTextureAsync(e.metalnessMap, e.roughnessMap),
        h = {
          index: await this.processTextureAsync(c),
          texCoord: c.channel
        };
      this.applyTextureTransform(h, c), a.pbrMetallicRoughness.metallicRoughnessTexture = h
    }
    if (e.map) {
      const c = {
        index: await this.processTextureAsync(e.map),
        texCoord: e.map.channel
      };
      this.applyTextureTransform(c, e.map), a.pbrMetallicRoughness.baseColorTexture = c
    }
    if (e.emissive) {
      const c = e.emissive;
      if (Math.max(c.r, c.g, c.b) > 0 && (a.emissiveFactor = e.emissive.toArray()), e.emissiveMap) {
        const u = {
          index: await this.processTextureAsync(e.emissiveMap),
          texCoord: e.emissiveMap.channel
        };
        this.applyTextureTransform(u, e.emissiveMap), a.emissiveTexture = u
      }
    }
    if (e.normalMap) {
      const c = e.normalScale,
        h = c.x < 0,
        u = n ? c.y < 0 : c.y > 0;
      let d = e.normalMap;
      if (h || u) {
        s.normalMaps.has(e.normalMap) === !1 && s.normalMaps.set(e.normalMap, {});
        const p = s.normalMaps.get(e.normalMap),
          I = `${h}:${u}`;
        p[I] === void 0 && (p[I] = await this.buildNormalMapTextureAsync(e.normalMap, h, u)), d = p[I]
      }
      const g = {
        index: await this.processTextureAsync(d),
        texCoord: e.normalMap.channel
      };
      Math.abs(c.x) !== 1 && (g.scale = Math.abs(c.x)), this.applyTextureTransform(g, e.normalMap), a.normalTexture = g
    }
    if (e.aoMap) {
      const c = {
        index: await this.processTextureAsync(e.aoMap),
        texCoord: e.aoMap.channel
      };
      e.aoMapIntensity !== 1 && (c.strength = e.aoMapIntensity), this.applyTextureTransform(c, e.aoMap), a.occlusionTexture = c
    }
    e.transparent ? a.alphaMode = "BLEND" : e.alphaTest > 0 && (a.alphaMode = "MASK", a.alphaCutoff = e.alphaTest), e.side === C9 && (a.doubleSided = !0), e.name !== "" && (a.name = e.name), this.serializeUserData(e, a), await this._invokeAllAsync(async function(c) {
      c.writeMaterialAsync && await c.writeMaterialAsync(e, a)
    });
    const A = i.materials.push(a) - 1;
    return s.materials.set(o, A), A
  }
  async processMeshAsync(e) {
    const t = this.cache,
      s = this.json,
      i = [e.geometry.uuid];
    if (Array.isArray(e.material))
      for (let B = 0, b = e.material.length; B < b; B++) i.push(e.material[B].uuid);
    else i.push(e.material.uuid);
    const n = i.join(":");
    if (t.meshes.has(n)) return t.meshes.get(n);
    const o = e.geometry;
    let a;
    e.isLineSegments ? a = e0.LINES : e.isLineLoop ? a = e0.LINE_LOOP : e.isLine ? a = e0.LINE_STRIP : e.isPoints ? a = e0.POINTS : a = e.material.wireframe ? e0.LINES : e0.TRIANGLES;
    const l = {},
      A = {},
      c = [],
      h = [],
      u = {
        uv: "TEXCOORD_0",
        uv1: "TEXCOORD_1",
        uv2: "TEXCOORD_2",
        uv3: "TEXCOORD_3",
        color: "COLOR_0",
        skinWeight: "WEIGHTS_0",
        skinIndex: "JOINTS_0"
      },
      d = o.getAttribute("normal");
    d !== void 0 && !this.isNormalizedNormalAttribute(d) && (console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."), o.setAttribute("normal", this.createNormalizedNormalAttribute(d)));
    let g = null;
    for (let B in o.attributes) {
      if (B.slice(0, 5) === "morph") continue;
      const b = o.attributes[B];
      if (B = u[B] || B.toUpperCase(), !/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(B) && !B.startsWith("_") && (B = "_" + B), t.attributes.has(this.getUID(b))) {
        A[B] = t.attributes.get(this.getUID(b));
        continue
      }
      g = null;
      const L = b.array;
      B === "JOINTS_0" && !(L instanceof Uint16Array) && !(L instanceof Uint8Array) ? (console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'), g = Q1.Utils.toTypedBufferAttribute(b, Uint16Array)) : (L instanceof Uint32Array || L instanceof Int32Array) && !B.startsWith("_") && (console.warn(`GLTFExporter: Attribute "${B}" converted to type FLOAT.`), g = Q1.Utils.toTypedBufferAttribute(b, Float32Array));
      const D = this.processAccessor(g || b, o);
      D !== null && (B.startsWith("_") || this.detectMeshQuantization(B, b), A[B] = D, t.attributes.set(this.getUID(b), D))
    }
    if (d !== void 0 && o.setAttribute("normal", d), Object.keys(A).length === 0) return null;
    if (e.morphTargetInfluences !== void 0 && e.morphTargetInfluences.length > 0) {
      const B = [],
        b = [],
        v = {};
      if (e.morphTargetDictionary !== void 0)
        for (const L in e.morphTargetDictionary) v[e.morphTargetDictionary[L]] = L;
      for (let L = 0; L < e.morphTargetInfluences.length; ++L) {
        const D = {};
        let P = !1;
        for (const U in o.morphAttributes) {
          if (U !== "position" && U !== "normal") {
            P || (console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."), P = !0);
            continue
          }
          const R = o.morphAttributes[U][L],
            Q = U.toUpperCase(),
            H = o.attributes[U];
          if (t.attributes.has(this.getUID(R, !0))) {
            D[Q] = t.attributes.get(this.getUID(R, !0));
            continue
          }
          const N = R.clone();
          if (!o.morphTargetsRelative)
            for (let G = 0, q = R.count; G < q; G++)
              for (let j = 0; j < R.itemSize; j++) j === 0 && N.setX(G, R.getX(G) - H.getX(G)), j === 1 && N.setY(G, R.getY(G) - H.getY(G)), j === 2 && N.setZ(G, R.getZ(G) - H.getZ(G)), j === 3 && N.setW(G, R.getW(G) - H.getW(G));
          D[Q] = this.processAccessor(N, o), t.attributes.set(this.getUID(H, !0), D[Q])
        }
        h.push(D), B.push(e.morphTargetInfluences[L]), e.morphTargetDictionary !== void 0 && b.push(v[L])
      }
      l.weights = B, b.length > 0 && (l.extras = {}, l.extras.targetNames = b)
    }
    const p = Array.isArray(e.material);
    if (p && o.groups.length === 0) return null;
    let I = !1;
    if (p && o.index === null) {
      const B = [];
      for (let b = 0, v = o.attributes.position.count; b < v; b++) B[b] = b;
      o.setIndex(B), I = !0
    }
    const C = p ? e.material : [e.material],
      E = p ? o.groups : [{
        materialIndex: 0,
        start: void 0,
        count: void 0
      }];
    for (let B = 0, b = E.length; B < b; B++) {
      const v = {
        mode: a,
        attributes: A
      };
      if (this.serializeUserData(o, v), h.length > 0 && (v.targets = h), o.index !== null) {
        let D = this.getUID(o.index);
        (E[B].start !== void 0 || E[B].count !== void 0) && (D += ":" + E[B].start + ":" + E[B].count), t.attributes.has(D) ? v.indices = t.attributes.get(D) : (v.indices = this.processAccessor(o.index, o, E[B].start, E[B].count), t.attributes.set(D, v.indices)), v.indices === null && delete v.indices
      }
      const L = await this.processMaterialAsync(C[E[B].materialIndex], o);
      L !== null && (v.material = L), c.push(v)
    }
    I === !0 && o.setIndex(null), l.primitives = c, s.meshes || (s.meshes = []), await this._invokeAllAsync(function(B) {
      B.writeMesh && B.writeMesh(e, l)
    });
    const x = s.meshes.push(l) - 1;
    return t.meshes.set(n, x), x
  }
  detectMeshQuantization(e, t) {
    if (this.extensionsUsed[ws]) return;
    let s;
    switch (t.array.constructor) {
      case Int8Array:
        s = "byte";
        break;
      case Uint8Array:
        s = "unsigned byte";
        break;
      case Int16Array:
        s = "short";
        break;
      case Uint16Array:
        s = "unsigned short";
        break;
      default:
        return
    }
    t.normalized && (s += " normalized");
    const i = e.split("_", 1)[0];
    x2[i] && x2[i].includes(s) && (this.extensionsUsed[ws] = !0, this.extensionsRequired[ws] = !0)
  }
  processCamera(e) {
    const t = this.json;
    t.cameras || (t.cameras = []);
    const s = e.isOrthographicCamera,
      i = {
        type: s ? "orthographic" : "perspective"
      };
    return s ? i.orthographic = {
      xmag: e.right,
      ymag: e.top,
      zfar: e.far <= 0 ? .001 : e.far,
      znear: e.near < 0 ? 0 : e.near
    } : i.perspective = {
      aspectRatio: e.aspect,
      yfov: ve.degToRad(e.fov),
      zfar: e.far <= 0 ? .001 : e.far,
      znear: e.near < 0 ? 0 : e.near
    }, e.name !== "" && (i.name = e.type), t.cameras.push(i) - 1
  }
  processAnimation(e, t) {
    const s = this.json,
      i = this.nodeMap;
    s.animations || (s.animations = []), e = Q1.Utils.mergeMorphTargetTracks(e.clone(), t);
    const n = e.tracks,
      o = [],
      a = [];
    for (let A = 0; A < n.length; ++A) {
      const c = n[A],
        h = y9.parseTrackName(c.name);
      let u = y9.findNode(t, h.nodeName);
      const d = b2[h.propertyName];
      if (h.objectName === "bones" && (u.isSkinnedMesh === !0 ? u = u.skeleton.getBoneByName(h.objectIndex) : u = void 0), !u || !d) {
        console.warn('THREE.GLTFExporter: Could not export animation track "%s".', c.name);
        continue
      }
      const g = 1;
      let p = c.values.length / c.times.length;
      d === b2.morphTargetInfluences && (p /= u.morphTargetInfluences.length);
      let I;
      c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline === !0 ? (I = "CUBICSPLINE", p /= 3) : c.getInterpolation() === I3 ? I = "STEP" : I = "LINEAR", a.push({
        input: this.processAccessor(new me(c.times, g)),
        output: this.processAccessor(new me(c.values, p)),
        interpolation: I
      }), o.push({
        sampler: a.length - 1,
        target: {
          node: i.get(u),
          path: d
        }
      })
    }
    const l = {
      name: e.name || "clip_" + s.animations.length,
      samplers: a,
      channels: o
    };
    return this.serializeUserData(e, l), s.animations.push(l), s.animations.length - 1
  }
  processSkin(e) {
    const t = this.json,
      s = this.nodeMap,
      i = t.nodes[s.get(e)],
      n = e.skeleton;
    if (n === void 0) return null;
    const o = e.skeleton.bones[0];
    if (o === void 0) return null;
    const a = [],
      l = new Float32Array(n.bones.length * 16),
      A = new Mt;
    for (let h = 0; h < n.bones.length; ++h) a.push(s.get(n.bones[h])), A.copy(n.boneInverses[h]), A.multiply(e.bindMatrix).toArray(l, h * 16);
    return t.skins === void 0 && (t.skins = []), t.skins.push({
      inverseBindMatrices: this.processAccessor(new me(l, 16)),
      joints: a,
      skeleton: s.get(o)
    }), i.skin = t.skins.length - 1
  }
  async processNodeAsync(e) {
    const t = this.json,
      s = this.options,
      i = this.nodeMap;
    if (t.nodes || (t.nodes = []), e.pivot !== null) return await this._processNodeWithPivotAsync(e);
    const n = {};
    if (s.trs) {
      const a = e.quaternion.toArray(),
        l = e.position.toArray(),
        A = e.scale.toArray();
      Oe(a, [0, 0, 0, 1]) || (n.rotation = a), Oe(l, [0, 0, 0]) || (n.translation = l), Oe(A, [1, 1, 1]) || (n.scale = A)
    } else e.matrixAutoUpdate && e.updateMatrix(), Ur(e.matrix) === !1 && (n.matrix = e.matrix.elements);
    if (e.name !== "" && (n.name = String(e.name)), this.serializeUserData(e, n), e.isMesh || e.isLine || e.isPoints) {
      const a = await this.processMeshAsync(e);
      a !== null && (n.mesh = a)
    } else e.isCamera && (n.camera = this.processCamera(e));
    e.isSkinnedMesh && this.skins.push(e);
    const o = t.nodes.push(n) - 1;
    if (i.set(e, o), e.children.length > 0) {
      const a = [];
      for (let l = 0, A = e.children.length; l < A; l++) {
        const c = e.children[l];
        if (c.visible || s.onlyVisible === !1) {
          const h = await this.processNodeAsync(c);
          h !== null && a.push(h)
        }
      }
      a.length > 0 && (n.children = a)
    }
    return await this._invokeAllAsync(function(a) {
      a.writeNode && a.writeNode(e, n)
    }), o
  }
  async _processNodeWithPivotAsync(e) {
    const t = this.json,
      s = this.options,
      i = this.nodeMap,
      n = e.pivot,
      o = {},
      a = e.quaternion.toArray(),
      l = [e.position.x + n.x, e.position.y + n.y, e.position.z + n.z],
      A = e.scale.toArray();
    Oe(a, [0, 0, 0, 1]) || (o.rotation = a), Oe(l, [0, 0, 0]) || (o.translation = l), Oe(A, [1, 1, 1]) || (o.scale = A), o.extras = {
      pivot: n.toArray()
    }, e.name !== "" && (o.name = String(e.name)), this.serializeUserData(e, o);
    const c = t.nodes.push(o) - 1;
    i.set(e, c);
    const h = {},
      u = [-n.x, -n.y, -n.z];
    if (Oe(u, [0, 0, 0]) || (h.translation = u), e.isMesh || e.isLine || e.isPoints) {
      const p = await this.processMeshAsync(e);
      p !== null && (h.mesh = p)
    } else e.isCamera && (h.camera = this.processCamera(e));
    e.isSkinnedMesh && this.skins.push(e);
    const g = [t.nodes.push(h) - 1];
    if (e.children.length > 0) {
      const p = [];
      for (let I = 0, C = e.children.length; I < C; I++) {
        const E = e.children[I];
        if (E.visible || s.onlyVisible === !1) {
          const x = await this.processNodeAsync(E);
          x !== null && p.push(x)
        }
      }
      p.length > 0 && (h.children = p)
    }
    return o.children = g, await this._invokeAllAsync(function(p) {
      p.writeNode && p.writeNode(e, o)
    }), c
  }
  async processSceneAsync(e) {
    const t = this.json,
      s = this.options;
    t.scenes || (t.scenes = [], t.scene = 0);
    const i = {};
    e.name !== "" && (i.name = e.name), t.scenes.push(i);
    const n = [];
    for (let o = 0, a = e.children.length; o < a; o++) {
      const l = e.children[o];
      if (l.visible || s.onlyVisible === !1) {
        const A = await this.processNodeAsync(l);
        A !== null && n.push(A)
      }
    }
    n.length > 0 && (i.nodes = n), this.serializeUserData(e, i)
  }
  async processObjectsAsync(e) {
    const t = new w9;
    t.name = "AuxScene";
    for (let s = 0; s < e.length; s++) t.children.push(e[s]);
    await this.processSceneAsync(t)
  }
  async processInputAsync(e) {
    const t = this.options;
    e = e instanceof Array ? e : [e], await this._invokeAllAsync(function(i) {
      i.beforeParse && i.beforeParse(e)
    });
    const s = [];
    for (let i = 0; i < e.length; i++) e[i] instanceof w9 ? await this.processSceneAsync(e[i]) : s.push(e[i]);
    s.length > 0 && await this.processObjectsAsync(s);
    for (let i = 0; i < this.skins.length; ++i) this.processSkin(this.skins[i]);
    if (e.length === 1)
      for (let i = 0; i < t.animations.length; ++i) this.processAnimation(t.animations[i], e[0]);
    else
      for (let i = 0; i < e.length; i++) {
        const n = t.animations[i] || [];
        for (let o = 0; o < n.length; ++o) this.processAnimation(n[o], e[i])
      }
    await this._invokeAllAsync(function(i) {
      i.afterParse && i.afterParse(e)
    })
  }
  async _invokeAllAsync(e) {
    for (let t = 0, s = this.plugins.length; t < s; t++) await e(this.plugins[t])
  }
}
class Or {
  constructor(e) {
    this.writer = e, this.name = "KHR_lights_punctual"
  }
  writeNode(e, t) {
    if (!e.isLight) return;
    if (!e.isDirectionalLight && !e.isPointLight && !e.isSpotLight) {
      console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.", e);
      return
    }
    const s = this.writer,
      i = s.json,
      n = s.extensionsUsed,
      o = {};
    e.name && (o.name = e.name), o.color = e.color.toArray(), o.intensity = e.intensity, e.isDirectionalLight ? o.type = "directional" : e.isPointLight ? (o.type = "point", e.distance > 0 && (o.range = e.distance)) : e.isSpotLight && (o.type = "spot", e.distance > 0 && (o.range = e.distance), o.spot = {}, o.spot.innerConeAngle = (1 - e.penumbra) * e.angle, o.spot.outerConeAngle = e.angle), e.decay !== void 0 && e.decay !== 2 && console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."), e.target && (e.target.parent !== e || e.target.position.x !== 0 || e.target.position.y !== 0 || e.target.position.z !== -1) && console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."), n[this.name] || (i.extensions = i.extensions || {}, i.extensions[this.name] = {
      lights: []
    }, n[this.name] = !0);
    const a = i.extensions[this.name].lights;
    a.push(o), t.extensions = t.extensions || {}, t.extensions[this.name] = {
      light: a.length - 1
    }
  }
}
class Hr {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_unlit"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshBasicMaterial) return;
    const i = this.writer.extensionsUsed;
    t.extensions = t.extensions || {}, t.extensions[this.name] = {}, i[this.name] = !0, t.pbrMetallicRoughness.metallicFactor = 0, t.pbrMetallicRoughness.roughnessFactor = .9
  }
}
class jr {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_clearcoat"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshPhysicalMaterial || e.clearcoat === 0) return;
    const s = this.writer,
      i = s.extensionsUsed,
      n = {};
    if (n.clearcoatFactor = e.clearcoat, e.clearcoatMap) {
      const o = {
        index: await s.processTextureAsync(e.clearcoatMap),
        texCoord: e.clearcoatMap.channel
      };
      s.applyTextureTransform(o, e.clearcoatMap), n.clearcoatTexture = o
    }
    if (n.clearcoatRoughnessFactor = e.clearcoatRoughness, e.clearcoatRoughnessMap) {
      const o = {
        index: await s.processTextureAsync(e.clearcoatRoughnessMap),
        texCoord: e.clearcoatRoughnessMap.channel
      };
      s.applyTextureTransform(o, e.clearcoatRoughnessMap), n.clearcoatRoughnessTexture = o
    }
    if (e.clearcoatNormalMap) {
      const o = {
        index: await s.processTextureAsync(e.clearcoatNormalMap),
        texCoord: e.clearcoatNormalMap.channel
      };
      e.clearcoatNormalScale.x !== 1 && (o.scale = e.clearcoatNormalScale.x), s.applyTextureTransform(o, e.clearcoatNormalMap), n.clearcoatNormalTexture = o
    }
    t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class qr {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_dispersion"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshPhysicalMaterial || e.dispersion === 0) return;
    const i = this.writer.extensionsUsed,
      n = {};
    n.dispersion = e.dispersion, t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class Wr {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_iridescence"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshPhysicalMaterial || e.iridescence === 0) return;
    const s = this.writer,
      i = s.extensionsUsed,
      n = {};
    if (n.iridescenceFactor = e.iridescence, e.iridescenceMap) {
      const o = {
        index: await s.processTextureAsync(e.iridescenceMap),
        texCoord: e.iridescenceMap.channel
      };
      s.applyTextureTransform(o, e.iridescenceMap), n.iridescenceTexture = o
    }
    if (n.iridescenceIor = e.iridescenceIOR, n.iridescenceThicknessMinimum = e.iridescenceThicknessMinimum, n.iridescenceThicknessMaximum = e.iridescenceThicknessMaximum, e.iridescenceThicknessMap) {
      const o = {
        index: await s.processTextureAsync(e.iridescenceThicknessMap),
        texCoord: e.iridescenceThicknessMap.channel
      };
      s.applyTextureTransform(o, e.iridescenceThicknessMap), n.iridescenceThicknessTexture = o
    }
    t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class Vr {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_transmission"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshPhysicalMaterial || e.transmission === 0) return;
    const s = this.writer,
      i = s.extensionsUsed,
      n = {};
    if (n.transmissionFactor = e.transmission, e.transmissionMap) {
      const o = {
        index: await s.processTextureAsync(e.transmissionMap),
        texCoord: e.transmissionMap.channel
      };
      s.applyTextureTransform(o, e.transmissionMap), n.transmissionTexture = o
    }
    t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class Yr {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_volume"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshPhysicalMaterial || e.transmission === 0) return;
    const s = this.writer,
      i = s.extensionsUsed,
      n = {};
    if (n.thicknessFactor = e.thickness, e.thicknessMap) {
      const o = {
        index: await s.processTextureAsync(e.thicknessMap),
        texCoord: e.thicknessMap.channel
      };
      s.applyTextureTransform(o, e.thicknessMap), n.thicknessTexture = o
    }
    e.attenuationDistance !== 1 / 0 && (n.attenuationDistance = e.attenuationDistance), n.attenuationColor = e.attenuationColor.toArray(), t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class Jr {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_ior"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshPhysicalMaterial || e.ior === 1.5) return;
    const i = this.writer.extensionsUsed,
      n = {};
    n.ior = e.ior, t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class Kr {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_specular"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshPhysicalMaterial || e.specularIntensity === 1 && e.specularColor.equals(Dr) && !e.specularIntensityMap && !e.specularColorMap) return;
    const s = this.writer,
      i = s.extensionsUsed,
      n = {};
    if (e.specularIntensityMap) {
      const o = {
        index: await s.processTextureAsync(e.specularIntensityMap),
        texCoord: e.specularIntensityMap.channel
      };
      s.applyTextureTransform(o, e.specularIntensityMap), n.specularTexture = o
    }
    if (e.specularColorMap) {
      const o = {
        index: await s.processTextureAsync(e.specularColorMap),
        texCoord: e.specularColorMap.channel
      };
      s.applyTextureTransform(o, e.specularColorMap), n.specularColorTexture = o
    }
    n.specularFactor = e.specularIntensity, n.specularColorFactor = e.specularColor.toArray(), t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class Xr {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_sheen"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshPhysicalMaterial || e.sheen == 0) return;
    const s = this.writer,
      i = s.extensionsUsed,
      n = {};
    if (e.sheenRoughnessMap) {
      const o = {
        index: await s.processTextureAsync(e.sheenRoughnessMap),
        texCoord: e.sheenRoughnessMap.channel
      };
      s.applyTextureTransform(o, e.sheenRoughnessMap), n.sheenRoughnessTexture = o
    }
    if (e.sheenColorMap) {
      const o = {
        index: await s.processTextureAsync(e.sheenColorMap),
        texCoord: e.sheenColorMap.channel
      };
      s.applyTextureTransform(o, e.sheenColorMap), n.sheenColorTexture = o
    }
    n.sheenRoughnessFactor = e.sheenRoughness, n.sheenColorFactor = e.sheenColor.toArray(), t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class Zr {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_anisotropy"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshPhysicalMaterial || e.anisotropy == 0) return;
    const s = this.writer,
      i = s.extensionsUsed,
      n = {};
    if (e.anisotropyMap) {
      const o = {
        index: await s.processTextureAsync(e.anisotropyMap)
      };
      s.applyTextureTransform(o, e.anisotropyMap), n.anisotropyTexture = o
    }
    n.anisotropyStrength = e.anisotropy, n.anisotropyRotation = e.anisotropyRotation, t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class $r {
  constructor(e) {
    this.writer = e, this.name = "KHR_materials_emissive_strength"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshStandardMaterial || e.emissiveIntensity === 1) return;
    const i = this.writer.extensionsUsed,
      n = {};
    n.emissiveStrength = e.emissiveIntensity, t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class eo {
  constructor(e) {
    this.writer = e, this.name = "EXT_materials_bump"
  }
  async writeMaterialAsync(e, t) {
    if (!e.isMeshStandardMaterial || e.bumpScale === 1 && !e.bumpMap) return;
    const s = this.writer,
      i = s.extensionsUsed,
      n = {};
    if (e.bumpMap) {
      const o = {
        index: await s.processTextureAsync(e.bumpMap),
        texCoord: e.bumpMap.channel
      };
      s.applyTextureTransform(o, e.bumpMap), n.bumpTexture = o
    }
    n.bumpFactor = e.bumpScale, t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
  }
}
class to {
  constructor(e) {
    this.writer = e, this.name = "EXT_mesh_gpu_instancing"
  }
  writeNode(e, t) {
    if (!e.isInstancedMesh) return;
    const s = this.writer,
      i = e,
      n = new Float32Array(i.count * 3),
      o = new Float32Array(i.count * 4),
      a = new Float32Array(i.count * 3),
      l = new Mt,
      A = new T,
      c = new Ve,
      h = new T;
    for (let d = 0; d < i.count; d++) i.getMatrixAt(d, l), l.decompose(A, c, h), A.toArray(n, d * 3), c.toArray(o, d * 4), h.toArray(a, d * 3);
    const u = {
      TRANSLATION: s.processAccessor(new me(n, 3)),
      ROTATION: s.processAccessor(new me(o, 4)),
      SCALE: s.processAccessor(new me(a, 3))
    };
    i.instanceColor && (u._COLOR_0 = s.processAccessor(i.instanceColor)), t.extensions = t.extensions || {}, t.extensions[this.name] = {
      attributes: u
    }, s.extensionsUsed[this.name] = !0, s.extensionsRequired[this.name] = !0
  }
}
Q1.Utils = {
  insertKeyframe: function(r, e) {
    const s = r.getValueSize(),
      i = new r.TimeBufferType(r.times.length + 1),
      n = new r.ValueBufferType(r.values.length + s),
      o = r.createInterpolant(new r.ValueBufferType(s));
    let a;
    if (r.times.length === 0) {
      i[0] = e;
      for (let l = 0; l < s; l++) n[l] = 0;
      a = 0
    } else if (e < r.times[0]) {
      if (Math.abs(r.times[0] - e) < .001) return 0;
      i[0] = e, i.set(r.times, 1), n.set(o.evaluate(e), 0), n.set(r.values, s), a = 0
    } else if (e > r.times[r.times.length - 1]) {
      if (Math.abs(r.times[r.times.length - 1] - e) < .001) return r.times.length - 1;
      i[i.length - 1] = e, i.set(r.times, 0), n.set(r.values, 0), n.set(o.evaluate(e), r.values.length), a = i.length - 1
    } else
      for (let l = 0; l < r.times.length; l++) {
        if (Math.abs(r.times[l] - e) < .001) return l;
        if (r.times[l] < e && r.times[l + 1] > e) {
          i.set(r.times.slice(0, l + 1), 0), i[l + 1] = e, i.set(r.times.slice(l + 1), l + 2), n.set(r.values.slice(0, (l + 1) * s), 0), n.set(o.evaluate(e), (l + 1) * s), n.set(r.values.slice((l + 1) * s), (l + 2) * s), a = l + 1;
          break
        }
      }
    return r.times = i, r.values = n, a
  },
  mergeMorphTargetTracks: function(r, e) {
    const t = [],
      s = {},
      i = r.tracks;
    for (let n = 0; n < i.length; ++n) {
      let o = i[n];
      const a = y9.parseTrackName(o.name),
        l = y9.findNode(e, a.nodeName);
      if (a.propertyName !== "morphTargetInfluences" || a.propertyIndex === void 0) {
        t.push(o);
        continue
      }
      if (o.createInterpolant !== o.InterpolantFactoryMethodDiscrete && o.createInterpolant !== o.InterpolantFactoryMethodLinear) {
        if (o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline) throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");
        console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."), o = o.clone(), o.setInterpolation(w3)
      }
      const A = l.morphTargetInfluences.length,
        c = l.morphTargetDictionary[a.propertyIndex];
      if (c === void 0) throw new Error("THREE.GLTFExporter: Morph target name not found: " + a.propertyIndex);
      let h;
      if (s[l.uuid] === void 0) {
        h = o.clone();
        const d = new h.ValueBufferType(A * h.times.length);
        for (let g = 0; g < h.times.length; g++) d[g * A + c] = h.values[g];
        h.name = (a.nodeName || "") + ".morphTargetInfluences", h.values = d, s[l.uuid] = h, t.push(h);
        continue
      }
      const u = o.createInterpolant(new o.ValueBufferType(1));
      h = s[l.uuid];
      for (let d = 0; d < h.times.length; d++) h.values[d * A + c] = u.evaluate(h.times[d]);
      for (let d = 0; d < o.times.length; d++) {
        const g = this.insertKeyframe(h, o.times[d]);
        h.values[g * A + c] = o.values[d]
      }
    }
    return r.tracks = t, r
  },
  toTypedBufferAttribute: function(r, e) {
    const t = new me(new e(r.count * r.itemSize), r.itemSize, !1);
    if (!r.normalized && !r.isInterleavedBufferAttribute) return t.array.set(r.array), t;
    for (let s = 0, i = r.count; s < i; s++)
      for (let n = 0; n < r.itemSize; n++) t.setComponent(s, n, r.getComponent(s, n));
    return t
  }
};

export { Q1 as GLTFExporter, Tr as OBJLoader, br as nearestSeat };
