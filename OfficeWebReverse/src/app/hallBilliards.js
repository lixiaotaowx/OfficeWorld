// Billiards table geometry and animated water surface: table dimensions
// (x0/V3), the lazy billiards table wrapper (Y3) with its interior loader
// registry, the water surface factory (q3) and its fish animator (k4).
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { G as E0, M as K, f as U0, g as Ie, h as Sn, D as C9, i as k9, j as u9, C as ni, k as Ye, V as T, n as qe } from '../chunks/portraitLighting.js';
import { definePrivate as m } from './hallPrelude.js';

function q3(r) {
  const e = new E0,
    t = new K(new U0(1, .025, 1), new Ie({
      color: "#32666a",
      roughness: .85
    }));
  t.position.y = .0125, t.receiveShadow = !0, t.userData.waterBounds = !0, e.add(t);
  const s = new Sn({
      color: r,
      roughness: .18,
      metalness: 0,
      transparent: !0,
      opacity: .48,
      depthWrite: !1,
      clearcoat: 1,
      clearcoatRoughness: .12,
      side: C9
    }),
    i = {
      value: 0
    };
  s.userData.waterTime = i, s.onBeforeCompile = o => {
    o.uniforms.waterTime = i, o.vertexShader = `varying vec3 waterPosition;
` + o.vertexShader, o.vertexShader = o.vertexShader.replace("#include <worldpos_vertex>", `#include <worldpos_vertex>
waterPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`), o.fragmentShader = `uniform float waterTime; varying vec3 waterPosition;
      float waterHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float waterNoise(vec2 p) {
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(waterHash(i), waterHash(i + vec2(1,0)), f.x),
          mix(waterHash(i + vec2(0,1)), waterHash(i + vec2(1,1)), f.x), f.y);
      }
      float waterHeight(vec2 p, float t) {
        vec2 drift = vec2(t * .07, -t * .045);
        float broad = waterNoise(p * 1.8 + drift);
        float fine = waterNoise(p * 5.3 - drift * 1.4);
        return broad * .055 + fine * .018
          + sin(p.x * 5.1 + p.y * 2.7 + broad * 3.0 - t * .65) * .009;
      }
    ` + o.fragmentShader, o.fragmentShader = o.fragmentShader.replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
      vec2 p = waterPosition.xz;
      float t = waterTime;
      float height = waterHeight(p, t);
      vec2 slope = vec2(waterHeight(p + vec2(.025, 0), t) - height,
        waterHeight(p + vec2(0, .025), t) - height) / .025;
      vec3 rippleNormal = normalize(vec3(-slope.x, 1.0, -slope.y));
      normal = normalize(normal + mat3(viewMatrix) * (rippleNormal - vec3(0.0, 1.0, 0.0)));
    `), o.fragmentShader = o.fragmentShader.replace("#include <clearcoat_normal_fragment_begin>", `#include <clearcoat_normal_fragment_begin>
#ifdef USE_CLEARCOAT
clearcoatNormal = normal;
#endif`), o.fragmentShader = o.fragmentShader.replace("#include <opaque_fragment>", `
      float waterFresnel = .025 + .35 * pow(1.0 - max(dot(normal, normalize(vViewPosition)), 0.0), 4.0);
      vec3 waterReflection = inverseTransformDirection(reflect(-normalize(vViewPosition), normal), viewMatrix);
      vec3 waterSky = mix(vec3(.23, .32, .35), vec3(.58, .69, .75), smoothstep(-.15, .85, waterReflection.y));
      outgoingLight = mix(outgoingLight, waterSky, waterFresnel);
      #include <opaque_fragment>
    `)
  }, s.customProgramCacheKey = () => "pond-water-v2";
  const n = new K(new k9(1, 1), s);
  n.rotation.x = -Math.PI / 2, n.position.y = .25, n.userData.token = "c", n.userData.waterSurface = !0, n.receiveShadow = !0, e.add(n);
  for (let o = 0; o < 3; o++) {
    const a = new E0;
    a.userData.fish = o;
    const l = new Ie({
        color: ["#e69a42", "#f4e9d4", "#db633d"][o],
        roughness: .4
      }),
      A = new K(new u9(1, 12, 8), l);
    A.scale.set(.035, .022, .085), a.add(A);
    const c = new K(new ni(.04, .07, 3), l);
    c.rotation.x = -Math.PI / 2, c.position.z = -.09, c.scale.y = .7, c.name = "tail", a.add(c);
    for (const u of [-1, 1]) {
      const d = new K(new u9(1, 8, 4), l);
      d.scale.set(.035, .004, .022), d.position.set(u * .03, 0, .005), d.rotation.y = u * .6, a.add(d);
      const g = new K(new u9(.006, 6, 4), new Ye({
        color: "#1a2224"
      }));
      g.position.set(u * .022, .014, .05), a.add(g)
    }
    const h = new E0;
    h.name = "swimmer", h.add(...a.children), a.add(h), a.traverse(u => {
      u.userData.nohit = !0
    }), e.add(a)
  }
  return k4(e, 0), e
}

function k4(r, e) {
  const t = r.getWorldScale(new T),
    s = Math.min(.8, Math.abs(t.x) * .8, Math.abs(t.z) * .8, Math.abs(t.y) * 2);
  r.traverse(i => {
    if (i.userData.waterSurface) {
      const n = i.material;
      n.userData.waterTime && (n.userData.waterTime.value = e)
    }
    if (typeof i.userData.fish == "number") {
      const n = i.userData.fish,
        o = e * (.19 + n * .035) + n * 2.1,
        a = .25 + n * .035,
        l = .22 + n * .03;
      i.position.set(Math.cos(o) * a, .1 + n * .025, Math.sin(o) * l), i.scale.set(s / Math.max(.001, Math.abs(t.x)), s / Math.max(.001, Math.abs(t.y)), s / Math.max(.001, Math.abs(t.z)));
      const A = i.getObjectByName("swimmer");
      A && (A.rotation.y = Math.atan2(-Math.sin(o) * a * t.x, Math.cos(o) * l * t.z));
      const c = i.getObjectByName("tail");
      c && (c.rotation.y = Math.sin(e * 7 + n) * .35)
    }
  })
}

const x0 = Object.freeze({
    halfX: 1.4,
    halfZ: .7,
    radius: .06,
    pocketRadius: .135,
    width: 3.5,
    depth: 2.25,
    height: 1,
    maxSpeed: 5.5,
    friction: .38,
    restitution: .96,
    cushion: .82
  }),
  V3 = [-x0.halfX, 0, x0.halfX].flatMap(r => [-x0.halfZ, x0.halfZ].map(e => ({
    x: r,
    z: e
  })));

function J6() {
  const r = [{
      id: 0,
      x: -.75,
      z: 0,
      vx: 0,
      vz: 0,
      pocketed: !1
    }],
    e = [1, 9, 2, 10, 8, 3, 4, 11, 5, 12, 6, 13, 7, 14, 15];
  let t = 0;
  for (let s = 0; s < 5; s++)
    for (let i = 0; i <= s; i++) r.push({
      id: e[t++],
      x: .4 + s * x0.radius * Math.sqrt(3) * 1.015,
      z: (i - s / 2) * x0.radius * 2.03,
      vx: 0,
      vz: 0,
      pocketed: !1
    });
  return r.sort((s, i) => s.id - i.id)
}

const js = new WeakMap,
  li = r => js.get(r);
class Y3 {
  constructor(e = () => import("../chunks/billiardsInterior.js")) {
    m(this, "root", new E0);
    m(this, "geometries", new Set);
    m(this, "materials", new Set);
    m(this, "state", null);
    m(this, "interior");
    m(this, "pending");
    m(this, "loading");
    m(this, "generation", 0);
    m(this, "disposed", !1);
    m(this, "activeValue", !1);
    m(this, "canShootValue", !1);
    m(this, "powerValue", .5);
    m(this, "angleValue", 0);
    m(this, "lobbyEyeBall", {
      x: -.75,
      z: 0
    });
    this.loadInterior = e, this.root.name = "billiards-table", js.set(this.root, this);
    const t = d => (this.geometries.add(d), d),
      s = (d, g = .55) => {
        const p = new Ie({
          color: d,
          roughness: g
        });
        return this.materials.add(p), p
      },
      i = t(new U0(1, 1, 1)),
      n = s("#553b30"),
      o = s("#b99a61", .28),
      a = s("#286657", .95),
      l = s("#16483e"),
      A = s("#111b19"),
      c = (d, g, p, I, C, E, x, B = !0) => {
        const b = new K(i, x);
        return b.scale.set(d, g, p), b.position.set(I, C, E), b.castShadow = b.receiveShadow = !0, b.userData.solid = B, this.root.add(b), b
      };
    for (const d of [-1.375, 1.375])
      for (const g of [-.75, .75]) c(.25, .75, .25, d, .375, g, n), c(.27, .08, .27, d, .04, g, o);
    c(x0.width, .25, x0.depth, 0, .795, 0, n), c(x0.width + .01, .045, x0.depth + .01, 0, .9, 0, o), c(x0.width - .02, .09, x0.depth - .02, 0, .947, 0, n), c(x0.halfX * 2, .025, x0.halfZ * 2, 0, x0.height - .0125, 0, a);
    for (const d of [-.77, .77])
      for (const g of [-.69, .69]) c(1.02, .075, .14, g, 1.025, d, l);
    for (const d of [-1.47, 1.47]) c(.14, .075, 1.02, d, 1.025, 0, l);
    const h = t(new qe(.16, .12, .13, 32));
    for (const d of V3) {
      const g = new K(h, A);
      g.position.set(d.x, .945, d.z), this.root.add(g)
    }
    const u = t(new qe(.017, .017, .005, 12));
    for (const d of [-.94, .94])
      for (const g of [-1.05, -.7, -.35, .35, .7, 1.05]) {
        const p = new K(u, o);
        p.position.set(g, .995, d), this.root.add(p)
      }
    for (const d of [-1.6, 1.6])
      for (const g of [-.35, 0, .35]) {
        const p = new K(u, o);
        p.position.set(d, .995, g), this.root.add(p)
      }
  }
  get active() {
    var e;
    return ((e = this.interior) == null ? void 0 : e.active) ?? this.activeValue
  }
  set active(e) {
    this.activeValue = e, this.interior && (this.interior.active = e)
  }
  get canShoot() {
    var e;
    return ((e = this.interior) == null ? void 0 : e.canShoot) ?? this.canShootValue
  }
  set canShoot(e) {
    this.canShootValue = e, this.interior && (this.interior.canShoot = e)
  }
  get power() {
    var e;
    return ((e = this.interior) == null ? void 0 : e.power) ?? this.powerValue
  }
  set power(e) {
    this.powerValue = e, this.interior && (this.interior.power = e)
  }
  get angle() {
    var e;
    return ((e = this.interior) == null ? void 0 : e.angle) ?? this.angleValue
  }
  set angle(e) {
    this.angleValue = e, this.interior && (this.interior.angle = e)
  }
  get eyeBall() {
    var e;
    return ((e = this.interior) == null ? void 0 : e.eyeBall) ?? this.lobbyEyeBall
  }
  get rolling() {
    var e;
    return ((e = this.interior) == null ? void 0 : e.rolling) ?? !1
  }
  get loaded() {
    return !!this.interior
  }
  set(e) {
    var t;
    this.state = e, (t = this.interior) == null || t.set(e)
  }
  direction() {
    var e;
    return ((e = this.interior) == null ? void 0 : e.direction()) ?? {
      dx: Math.cos(this.angle),
      dz: Math.sin(this.angle)
    }
  }
  aim(e) {
    var t;
    (t = this.interior) == null || t.aim(e)
  }
  hit(e) {
    return e.intersectObject(this.root, !0).find(t => !t.object.userData.nohit)
  }
  tick(e) {
    var t;
    (t = this.interior) == null || t.tick(e)
  }
  load() {
    if (this.disposed) return Promise.resolve(!1);
    if (this.interior) return Promise.resolve(!0);
    if (this.loading) return this.loading;
    const e = ++this.generation;
    let t;
    return t = (async () => {
      let s;
      try {
        const i = await this.loadInterior();
        return this.disposed || e !== this.generation ? !1 : (s = new i.BilliardsInterior, this.pending = s, await s.ready, this.disposed || e !== this.generation || this.pending !== s ? (s.dispose(), !1) : (this.pending = void 0, this.interior = s, s.active = this.activeValue, s.canShoot = this.canShootValue, s.power = this.powerValue, s.angle = this.angleValue, this.state && s.set(this.state), this.root.add(s.root), !0))
      } catch {
        return s && s.dispose(), this.pending === s && (this.pending = void 0), !1
      }
    })().finally(() => {
      this.loading === t && (this.loading = void 0)
    }), this.loading = t, t
  }
  unload() {
    var e, t;
    this.generation++, (e = this.pending) == null || e.dispose(), this.pending = void 0, (t = this.interior) == null || t.dispose(), this.interior = void 0, this.loading = void 0, this.activeValue = !1, this.canShootValue = !1, this.powerValue = .5, this.angleValue = 0
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.unload(), this.root.removeFromParent(), this.root.traverse(e => {
      e instanceof K && (Array.isArray(e.material) ? e.material : [e.material]).forEach(s => this.materials.add(s))
    }), this.geometries.forEach(e => e.dispose()), this.materials.forEach(e => e.dispose()), this.geometries.clear(), this.materials.clear(), this.state = null, this.root.clear(), js.delete(this.root))
  }
}

export { q3, k4, x0, J6, js, li, Y3 };
