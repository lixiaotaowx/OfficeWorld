import { r as normalizeLook, E as AVATAR_EXPRESSIONS, a as lookSignature, c as appearanceHex } from '../chunks/chatLocal.js';
function readAutoExpression(t) {
  if (t.startsWith("look:")) try {
    const s = JSON.parse(t.slice(5)).autoExpression;
    return AVATAR_EXPRESSIONS.includes(s) ? s : void 0;
  } catch {
    return;
  }
}
function parseLookString(t) {
  if (!t.startsWith("look:")) return normalizeLook({
    color: t
  });
  try {
    return normalizeLook(JSON.parse(t.slice(5)));
  } catch {
    return normalizeLook(void 0);
  }
}
const AVATAR_EXPRESSION_BASE = "/media/avatars/expressions-v2";
function pickAvatarExpression(t = {}) {
  return t.greeting ? "wave" : t.inCall || t.sharing ? "focused" : t.autoExpression ? t.autoExpression : t.atDesk === !1 ? "away" : "focused";
}
const expressionImageCache = new Map();
function loadAvatarImage(t) {
  let s = expressionImageCache.get(t);
  return s || (s = new Promise((n, c) => {
    const r = new Image();
    r.onload = () => n(r), r.onerror = () => {
      expressionImageCache.delete(t), c(new Error("Avatar asset unavailable"));
    }, r.src = t;
  }), expressionImageCache.set(t, s)), s;
}
function tintAvatarExpression(t, s) {
  if (s === "kraft") return;
  const n = appearanceHex(s).slice(1),
    c = [0, 2, 4].map(o => parseInt(n.slice(o, o + 2), 16)),
    r = t.getImageData(0, 0, 512, 512),
    i = r.data;
  for (let o = 0; o < i.length; o += 4) {
    if (!i[o + 3]) continue;
    const [d, m, h] = [i[o], i[o + 1], i[o + 2]],
      k = Math.min(1, Math.max(0, (d - 95) / 40)) * Math.min(1, Math.max(0, (m / Math.max(d, 1) - .52) / .16)) * Math.min(1, Math.max(0, (Math.min(d, m) - h - 20) / 30));
    if (!k) continue;
    const f = Math.min(1.18, (d * .3 + m * .59 + h * .11) / 206);
    for (let b = 0; b < 3; b++) {
      const g = c[b] * Math.min(1, f) + Math.max(0, f - 1) * 160;
      i[o + b] = i[o + b] * (1 - k) + Math.min(255, g) * k;
    }
  }
  t.putImageData(r, 0, 0);
}
const composedExpressionCache = new Map();
function composeAvatarExpression(t, s = "happy") {
  const n = `${lookSignature(t)}:${s}`,
    c = composedExpressionCache.get(n);
  if (c) return c;
  const r = (async () => {
    const i = await loadAvatarImage(`${AVATAR_EXPRESSION_BASE}/${s}.png`),
      o = document.createElement("canvas");
    o.width = o.height = 512;
    const d = o.getContext("2d", {
      willReadFrequently: !0
    });
    d.save(), s === "sleepy" && (d.translate(512 * .54, 512 * .475), d.scale(.925, .925), d.translate(-512 * .537, -512 * .458)), d.drawImage(i, 0, 0, 512, 512), d.restore(), tintAvatarExpression(d, t.color);
    const m = ["hair", "hat", "beard", "glasses"];
    for (const h of m) {
      const k = t.accessories[h];
      if (k === "none") continue;
      const f = await loadAvatarImage(`${AVATAR_EXPRESSION_BASE}/layers/${h}-${k}.png?v=1`);
      d.drawImage(f, 0, 0, 512, 512);
    }
    return o.toDataURL("image/png");
  })();
  return composedExpressionCache.set(n, r), composedExpressionCache.size > 96 && composedExpressionCache.delete(composedExpressionCache.keys().next().value), r.catch(() => composedExpressionCache.delete(n)), r;
}
const AVATAR_CANVAS_SIZE = 512,
  AVATAR_PREVIEW_SIZE = 256,
  createAvatarCanvas = () => {
    const t = document.createElement("canvas");
    return t.width = t.height = AVATAR_CANVAS_SIZE, t;
  },
  avatar2dContext = t => t.getContext("2d", {
    willReadFrequently: !0
  }),
  clamp01 = t => Math.min(1, Math.max(0, t)),
  isSkinPixel = (t, s, n) => clamp01((t - 95) / 40) * clamp01((s / Math.max(t, 1) - .52) / .16) * clamp01((Math.min(t, s) - n - 20) / 30);
function readSkinMask(t) {
  const s = t.getImageData(0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE).data,
    n = new Uint8Array(AVATAR_CANVAS_SIZE * AVATAR_CANVAS_SIZE);
  for (let c = 0; c < AVATAR_CANVAS_SIZE * AVATAR_CANVAS_SIZE; c++) {
    const r = c * 4;
    s[r + 3] > 128 && isSkinPixel(s[r], s[r + 1], s[r + 2]) > .5 && (n[c] = 1);
  }
  return n;
}
function measureSkinBounds(t) {
  const s = new Array(AVATAR_CANVAS_SIZE).fill(0),
    n = new Array(AVATAR_CANVAS_SIZE).fill(0);
  for (let d = 0; d < AVATAR_CANVAS_SIZE; d++) for (let m = 0; m < AVATAR_CANVAS_SIZE; m++) t[d * AVATAR_CANVAS_SIZE + m] && (s[m]++, n[d]++);
  const c = Math.max(...s) * .12,
    r = Math.max(...n) * .12,
    i = (d, m) => d.findIndex(h => h > m),
    o = (d, m) => d.length - 1 - [...d].reverse().findIndex(h => h > m);
  return {
    x0: i(s, c),
    x1: o(s, c),
    y0: i(n, r),
    y1: o(n, r)
  };
}
const rotateCanvas = (t, s, n, c) => {
    const r = createAvatarCanvas(),
      i = avatar2dContext(r);
    return i.translate(n, c), i.rotate(-s), i.translate(-n, -c), i.drawImage(t, 0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE), r;
  },
  cropWindow = t => {
    const s = t.x1 - t.x0,
      n = s * .94;
    return {
      x: (t.x0 + t.x1) / 2 - n / 2,
      y: t.y0 - s * .14,
      w: n,
      bw: s
    };
  };
function cropAvatar(t, s) {
  const n = document.createElement("canvas");
  n.width = n.height = AVATAR_PREVIEW_SIZE;
  const c = avatar2dContext(n),
    r = cropWindow(s);
  return c.imageSmoothingQuality = "high", c.drawImage(t, r.x, r.y, r.w, r.w, 0, 0, AVATAR_PREVIEW_SIZE, AVATAR_PREVIEW_SIZE), t.width = t.height = 0, n;
}
const imageCache = new Map(),
  loadCachedImage = t => {
    const s = imageCache.get(t);
    if (s) return s;
    const n = new Promise((c, r) => {
      const i = new Image();
      i.onload = () => c(i), i.onerror = r, i.src = t;
    });
    return t.startsWith("data:") || (imageCache.set(t, n), n.catch(() => {
      imageCache.get(t) === n && imageCache.delete(t);
    }), imageCache.size > 48 && imageCache.delete(imageCache.keys().next().value)), n;
  },
  geometryCache = new Map();
function measureExpressionGeometry(t) {
  return geometryCache.has(t) || geometryCache.set(t, (async () => {
    const s = createAvatarCanvas(),
      n = avatar2dContext(s);
    n.drawImage(await loadCachedImage(`${AVATAR_EXPRESSION_BASE}/${t}.png`), 0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE);
    const c = readSkinMask(n),
      r = measureSkinBounds(c),
      i = [],
      o = [];
    for (let w = Math.round(r.x0 + (r.x1 - r.x0) * .25); w <= r.x0 + (r.x1 - r.x0) * .75; w++) for (let E = 0; E < AVATAR_CANVAS_SIZE - 4; E++) if (c[E * AVATAR_CANVAS_SIZE + w] && c[(E + 3) * AVATAR_CANVAS_SIZE + w]) {
      i.push(w), o.push(E);
      break;
    }
    const d = i.reduce((w, E) => w + E, 0) / Math.max(1, i.length),
      m = o.reduce((w, E) => w + E, 0) / Math.max(1, o.length);
    let h = 0,
      k = 0;
    i.forEach((w, E) => {
      h += (w - d) * (o[E] - m), k += (w - d) ** 2;
    });
    const f = Math.atan(k ? h / k : 0),
      b = (r.x0 + r.x1) / 2,
      g = (r.y0 + r.y1) / 2,
      R = rotateCanvas(s, f, b, g),
      N = avatar2dContext(R),
      C = measureSkinBounds(readSkinMask(N));
    let I = null;
    const j = N.getImageData(0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE).data;
    let _ = AVATAR_CANVAS_SIZE,
      V = AVATAR_CANVAS_SIZE,
      W = 0,
      T = 0,
      D = 0;
    for (let w = C.y0; w < C.y0 + (C.y1 - C.y0) * .62; w++) for (let E = C.x0; E < C.x1; E++) {
      const L = (w * AVATAR_CANVAS_SIZE + E) * 4,
        U = j[L],
        K = j[L + 1],
        p = j[L + 2];
      j[L + 3] > 200 && U > 200 && K > 192 && p > 170 && Math.max(U, K, p) - Math.min(U, K, p) < 50 && (D++, _ = Math.min(_, E), W = Math.max(W, E), V = Math.min(V, w), T = Math.max(T, w));
    }
    if (D > 60) {
      const w = C.x1 - C.x0,
        E = C.y1 - C.y0;
      I = {
        x0: (_ - C.x0) / w,
        x1: (W - C.x0) / w,
        y0: (V - C.y0) / E,
        y1: (T - C.y0) / E
      };
    }
    return s.width = s.height = 0, R.width = R.height = 0, {
      angle: f,
      cx: b,
      cy: g,
      box: C,
      eyes: I
    };
  })()), geometryCache.get(t);
}
const faceplateCache = new Map(),
  shiftColor = (t, s) => {
    const n = parseInt(t.slice(1), 16),
      c = r => Math.max(0, Math.min(255, Math.round(r * (1 + s))));
    return `rgb(${c(n >> 16)},${c(n >> 8 & 255)},${c(n & 255)})`;
  };
function composeAvatarFaceplate(t, s) {
  const n = JSON.stringify(t) + s;
  if (!faceplateCache.has(n)) {
    const c = (async () => {
      const [r, i] = await Promise.all([measureExpressionGeometry(s), measureExpressionGeometry("away")]),
        o = rotateCanvas(await loadCachedImage(await composeAvatarExpression(t, s)), r.angle, r.cx, r.cy),
        d = s === "away" ? null : rotateCanvas(await loadCachedImage(await composeAvatarExpression(t, "away")), i.angle, i.cx, i.cy),
        m = await measureExpressionGeometry("focused"),
        h = m.box,
        k = createAvatarCanvas(),
        f = avatar2dContext(k),
        b = h.x1 - h.x0,
        g = (h.y1 - h.y0) * .92,
        R = b * .07,
        N = appearanceHex(t.color),
        C = f.createLinearGradient(h.x0, 0, h.x1, 0);
      C.addColorStop(0, shiftColor(N, -.05)), C.addColorStop(.55, shiftColor(N, -.12)), C.addColorStop(1, shiftColor(N, -.3)), f.fillStyle = C, f.beginPath(), f.roundRect ? f.roundRect(h.x0, h.y0, b, g, R) : f.rect(h.x0, h.y0, b, g), f.fill(), f.fillStyle = "rgba(255,255,255,.16)", f.fillRect(h.x0 + R, h.y0, b - 2 * R, g * .035), f.fillStyle = shiftColor(N, -.5);
      for (let V = 1; V < 20; V++) {
        const W = h.y0 + g * V / 20,
          T = (V % 5 === 0 ? .14 : .07) * b;
        f.fillRect(h.x0 + b * .035, W, T, g * .009), f.fillRect(h.x1 - b * .035 - T, W, T, g * .009);
      }
      const I = createAvatarCanvas(),
        j = avatar2dContext(I);
      for (const V of ["hair", "hat"]) {
        const W = t.accessories[V];
        W && W !== "none" && j.drawImage(await loadCachedImage(`${AVATAR_EXPRESSION_BASE}/layers/${V}-${W}.png?v=1`), 0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE);
      }
      const _ = rotateCanvas(I, m.angle, m.cx, m.cy);
      return f.drawImage(_, 0, 0), I.width = I.height = 0, _.width = _.height = 0, {
        front: cropAvatar(o, r.box),
        closed: d ? cropAvatar(d, r.box) : null,
        back: cropAvatar(k, h),
        geo: r,
        backBox: h
      };
    })();
    faceplateCache.set(n, c), c.catch(() => {
      faceplateCache.get(n) === c && faceplateCache.delete(n);
    }), faceplateCache.size > 32 && faceplateCache.delete(faceplateCache.keys().next().value);
  }
  return faceplateCache.get(n);
}
function paintAvatarCanvas(t, s, n, c = {}) {
  const r = window.devicePixelRatio || 1,
    i = Math.round(n * r);
  t.width !== i && (t.width = i, t.height = i);
  const o = t.getContext("2d");
  if (o.clearRect(0, 0, i, i), o.imageSmoothingQuality = "high", c.turned) {
    o.save(), o.translate(i / 2, 0), o.transform(.8, -.06, 0, 1, 0, 0), o.translate(-i / 2, i * .03), o.drawImage(s.back, 0, 0, i, i), o.restore();
    return;
  }
  const d = s.geo.box,
    m = cropWindow(d);
  o.drawImage(s.front, 0, 0, i, i);
  const h = s.geo.eyes;
  if (c.blink && s.closed && h) {
    const k = d.y1 - d.y0,
      f = i / m.w,
      b = d.x0 + h.x0 * m.bw - m.bw * .02,
      g = d.y0 + h.y0 * k - k * .01,
      R = (h.x1 - h.x0) * m.bw + m.bw * .04,
      N = (h.y1 - h.y0) * k + k * .02;
    o.save(), o.beginPath(), o.rect((b - m.x) * f, (g - m.y) * f, R * f, N * f), o.clip(), o.drawImage(s.closed, 0, 0, i, i), o.restore();
  }
}
const prefersReducedMotion = typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  readAvatarAppearance = t => normalizeLook(t.appearance ?? parseLookString(t.character));

export { readAutoExpression, pickAvatarExpression, composeAvatarFaceplate, paintAvatarCanvas, prefersReducedMotion, readAvatarAppearance };
