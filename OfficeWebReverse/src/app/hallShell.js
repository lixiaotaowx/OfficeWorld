// Hall shell construction: box/merged-geometry builders, seeded jitter RNG,
// the hall shell group (floors/walls/fixtures) and ladder/window helpers.
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { M as K, ar as be, B as k1, aW as me, G as E0, n as qe, g as Ie } from '../chunks/portraitLighting.js';
import { B5, ht, K8, $1, ds, l0 } from './hallMaterials.js';

function X8(r, e, t, s, i, n, o, a = {}) {
  const l = new K(B5, ht(s));
  return l.scale.set(r, e, t), a.jit !== !1 && l.scale.multiplyScalar(K8()), l.position.set(i, n, o), l.castShadow = a.cast !== !1, l.receiveShadow = !0, a.solid !== !1 && !a.nohit && (l.userData.solid = !0), a.nohit && (l.userData.nohit = !0), a.parent.add(l), l
}

function ui(r, e, t = {}) {
  const s = $1.length,
    i = new Float32Array(r.length * s),
    n = new Int8Array(r.length * s),
    o = new Float32Array(r.length * s),
    a = new be;
  for (let c = 0; c < r.length; c++) {
    const [h, u, d, g, p, I, C] = r[c], E = c * s;
    a.set(C);
    for (let x = 0; x < s; x += 3) {
      i[E + x] = Math.fround($1[x] * h) + g, i[E + x + 1] = Math.fround($1[x + 1] * u) + p, i[E + x + 2] = Math.fround($1[x + 2] * d) + I;
      const B = ds[x],
        b = ds[x + 1],
        v = ds[x + 2];
      n[E + x] = B ? 127 * (h === 0 ? -1 : h < 0 ? -B : B) : 0, n[E + x + 1] = b ? 127 * (u === 0 ? -1 : u < 0 ? -b : b) : 0, n[E + x + 2] = v ? 127 * (d === 0 ? -1 : d < 0 ? -v : v) : 0, o[E + x] = a.r, o[E + x + 1] = a.g, o[E + x + 2] = a.b
    }
  }
  const l = new k1;
  l.setAttribute("position", new me(i, 3)), l.setAttribute("normal", new me(n, 3, !0)), l.setAttribute("color", new me(o, 3));
  const A = new K(l, ht("#ffffff", {
    vertexColors: !0
  }));
  return A.castShadow = t.cast !== !1, A.receiveShadow = !0, t.nohit ? A.userData.nohit = !0 : A.userData.solid = !0, e.add(A), A
}
let m9 = 7;
const ye = () => (m9 = m9 * 16807 % 2147483647, (m9 - 1) / 2147483646),
  Z8 = () => {
    m9 = 7
  },
  B0 = 2.7,
  It = -1.6,
  Bt = {
    x0: -7,
    x1: 7,
    z0: -5,
    z1: 5
  },
  e9 = 5.6,
  B9 = ["#c9805e", "#8a5a3c", "#5b4a3a", "#5f8a9e", "#d9a56e", "#7fa08a", "#f0e4cc", "#4c6a7e", "#faf6ee"];

function $8() {
  Z8();
  const r = new E0;
  r.name = "hall-shell";
  const e = [],
    t = (h, u, d, g, p, I, C, E = {}) => X8(h, u, d, g, p, I, C, {
      parent: r,
      ...E
    }),
    s = Bt.x1 - Bt.x0,
    i = Bt.z1 - Bt.z0;
  t(s + .3, .5, i + .3, l0.plinth, 0, -.31, 0, {
    jit: !1,
    cast: !1
  });
  const n = t(s, .06, i, l0.floor, 0, -.03, 0, {
    jit: !1,
    cast: !1
  });
  n.userData.ground = !0;
  const o = t(s + .16, e9, .14, l0.wallBack, -.08, e9 / 2 - .02, Bt.z0 - .08, {
    cast: !0,
    jit: !1
  });
  o.userData.cutawaySide = "back";
  const a = t(.14, e9, i, l0.wall, Bt.x0 - .08, e9 / 2 - .02, 0, {
    cast: !0,
    jit: !1
  });
  a.userData.cutawaySide = "left", t(5, B0, 2.06, l0.blue, -4.5, B0 / 2, -3.97, {
    jit: !1
  });
  const l = t(9, .22, 3.4, l0.white, 2.5, B0 - .11, -3.3, {
    jit: !1
  });
  l.userData.keepStructure = !0;
  for (const h of [2.4, 6.85]) t(.12, B0 - .22, .12, l0.ink, h, (B0 - .22) / 2, It - .15);
  e.push(nt(r, "z", -3.55, -2.05, .05, B0 - .05, -2.94), nt(r, "x", -4.5, -3, .05, B0 - .05, -2)), u2(r, -2, 7, 0, B0 - .26, -5, .4).userData.cutawaySide = "back", u2(r, -7, 7, B0, B0 + 2.5, -5, .4).userData.cutawaySide = "back", t9(r, -.86, It - .03, 6.97, It - .03, B0), t9(r, -1.97, -2.94, -1.97, It - .03, B0), t9(r, -3.6, -2.91, -1.97, -2.91, B0), t9(r, 6.97, -4.58, 6.97, It - .03, B0);
  for (let h = 0; h < 9; h++) t(1.4, .3 * (h + 1), .66, l0.white, -6.3, .15 * (h + 1), 3 - .66 * (h + .5), {
    jit: !1
  });
  t(2, .9, 1.9, l0.blue, -4.6, .45, 1.85, {
    jit: !1
  }), t(2, 1.8, 1.9, l0.blue, -4.6, .9, -.05, {
    jit: !1
  }), t(2, B0, 1.94, l0.blue, -4.6, B0 / 2, -1.97, {
    jit: !1
  }), e.push(nt(r, "z", -5.55, -3.65, .05, .85, 2.8), nt(r, "z", -5.55, -3.65, .95, 1.75, .9), nt(r, "z", -5.55, -3.65, 1.85, B0 - .05, -1), nt(r, "x", .95, 2.75, .05, .85, -3.6), nt(r, "x", -.95, .85, .05, 1.75, -3.6), nt(r, "x", -2.89, -1.05, .05, B0 - .05, -3.6));
  for (const [h, u, d, g] of [
      [-5, .9, 1.6, l0.sage],
      [-4.2, .9, 2.2, l0.coral],
      [-4.9, 1.8, -.3, l0.coral],
      [-4.2, 1.8, .3, l0.sage]
    ]) {
    const p = new K(new qe(.22, .22, .06, 28), new Ie({
      color: g,
      roughness: .9
    }));
    p.position.set(h, u + .03, d), p.castShadow = p.receiveShadow = !0, p.userData.solid = !0, r.add(p)
  }
  for (let h = 0; h < 8; h++) t(1, .06, .32, l0.ink, -1.4, .3 * (h + 1) - .03, It + .32 * (7.5 - h));
  const A = .32 * 8,
    c = Math.hypot(A, B0);
  for (const h of [-1.92, -.88]) {
    const u = t(.05, .2, c, l0.ink, h, B0 / 2, It + A / 2, {
      nohit: !0,
      jit: !1
    });
    u.rotation.x = Math.atan2(B0, A)
  }
  return {
    group: r,
    walls: [a],
    decor: e
  }
}

function u2(r, e, t, s, i, n, o) {
  const a = [],
    l = t - e,
    A = i - s,
    c = Math.max(1, Math.round(l / .8)),
    h = Math.max(1, Math.round(A / .5)),
    u = l / c,
    d = A / h,
    g = .04;
  a.push([l, A, .03, e + l / 2, s + A / 2, n + .015, l0.trim]);
  for (let p = 0; p <= h; p++) a.push([l + g, g, o, e + l / 2, s + p * d, n + o / 2, l0.wood]);
  for (let p = 0; p <= c; p++) a.push([g, A, o - .01, e + p * u, s + A / 2, n + (o - .01) / 2, l0.wood]);
  for (let p = 0; p < h; p++)
    for (let I = 0; I < c; I++) {
      const C = e + I * u + g / 2 + .02,
        E = e + (I + 1) * u - g / 2 - .02,
        x = s + p * d + g / 2 + .002,
        B = d - g - .03,
        b = ye();
      if (b < .13) {
        a.push([u - g - .01, d - g - .01, .02, e + (I + .5) * u, s + (p + .5) * d, n + o - .025, l0.blue]);
        continue
      }
      if (b < .3) continue;
      let v = C + ye() * .12;
      const L = E - ye() * u * .45;
      for (; v < L;) {
        const D = .035 + ye() * .035,
          P = B * (.6 + ye() * .32);
        if (v + D > E) break;
        a.push([D, P, o * .7, v + D / 2, x + P / 2, n + .035 + o * .35, B9[Math.floor(ye() * B9.length)]]), v += D + .004
      }
    }
  return ui(a, r)
}

function nt(r, e, t, s, i, n, o) {
  const a = [],
    l = Math.max(1, Math.round((s - t) / .5)),
    A = Math.max(1, Math.round((n - i) / .45)),
    c = (s - t) / l,
    h = (n - i) / A;
  for (let u = 0; u < l; u++)
    for (let d = 0; d < A; d++) {
      const g = t + (u + .5) * c,
        p = i + (d + .5) * h,
        I = ye();
      if (a.push(e === "z" ? [c - .09, h - .09, .012, g, p, o + .007, l0.blueDark] : [.012, h - .09, c - .09, o + .007, p, g, l0.blueDark]), I < .45) {
        let C = -c / 2 + .09;
        const E = (h - .12) * (.55 + ye() * .3);
        for (let x = 0; x < 3 + Math.floor(ye() * 3); x++) {
          const B = .04 + ye() * .02,
            b = B9[Math.floor(ye() * B9.length)];
          a.push(e === "z" ? [B, E, .01, g + C + B / 2, p - (h - .09) / 2 + E / 2 + .01, o + .019, b] : [.01, E, B, o + .019, p - (h - .09) / 2 + E / 2 + .01, g + C + B / 2, b]), C += B + .006
        }
      }
    }
  return ui(a, r, {
    nohit: !0,
    cast: !1
  })
}

function t9(r, e, t, s, i, n) {
  const o = [],
    a = Math.hypot(s - e, i - t),
    l = Math.max(1, Math.round(a / .55)),
    A = Math.abs(s - e) > Math.abs(i - t),
    c = (e + s) / 2,
    h = (t + i) / 2;
  for (let u = 0; u <= l; u++) o.push([.035, 1, .035, e + (s - e) * u / l, n + .5, t + (i - t) * u / l, l0.ink]);
  for (const u of [1, .5]) o.push(A ? [a, .035, .035, c, n + u, h, l0.ink] : [.035, .035, a, c, n + u, h, l0.ink]);
  return ui(o, r)
}

export { $8 as buildHallShell, Bt as hallBounds };
