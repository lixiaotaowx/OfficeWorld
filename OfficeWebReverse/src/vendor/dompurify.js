// DOMPurify 3.4.17 (vendored verbatim from the production bundle).
// Recovered from /assets/HallView-*.js; only imports/exports added.
// `f6` is the default DOMPurify instance configured with the app hooks.
/*! @license DOMPurify 3.4.17 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.17/LICENSE */
function H2(r, e) {
  (e == null || e > r.length) && (e = r.length);
  for (var t = 0, s = Array(e); t < e; t++) s[t] = r[t];
  return s
}

function Ua(r) {
  if (Array.isArray(r)) return r
}

function Ga(r, e) {
  var t = r == null ? null : typeof Symbol < "u" && r[Symbol.iterator] || r["@@iterator"];
  if (t != null) {
    var s, i, n, o, a = [],
      l = !0,
      A = !1;
    try {
      if (n = (t = t.call(r)).next, e !== 0)
        for (; !(l = (s = n.call(t)).done) && (a.push(s.value), a.length !== e); l = !0);
    } catch (c) {
      A = !0, i = c
    } finally {
      try {
        if (!l && t.return != null && (o = t.return(), Object(o) !== o)) return
      } finally {
        if (A) throw i
      }
    }
    return a
  }
}

function za() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
} /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
function _a(r, e) {
  return Ua(r) || Ga(r, e) || Oa(r, e) || za()
}

function Oa(r, e) {
  if (r) {
    if (typeof r == "string") return H2(r, e);
    var t = {}.toString.call(r).slice(8, -1);
    return t === "Object" && r.constructor && (t = r.constructor.name), t === "Map" || t === "Set" ? Array.from(r) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? H2(r, e) : void 0
  }
}
const J5 = Object.entries,
  j2 = Object.setPrototypeOf,
  Ha = Object.isFrozen,
  K5 = Object.getPrototypeOf,
  X5 = Object.getOwnPropertyDescriptor;
let L0 = Object.freeze,
  N0 = Object.seal,
  Yt = Object.create,
  Z5 = typeof Reflect < "u" && Reflect,
  ei = Z5.apply,
  ti = Z5.construct;
L0 || (L0 = function(e) {
  return e
});
N0 || (N0 = function(e) {
  return e
});
ei || (ei = function(e, t) {
  for (var s = arguments.length, i = new Array(s > 2 ? s - 2 : 0), n = 2; n < s; n++) i[n - 2] = arguments[n];
  return e.apply(t, i)
});
ti || (ti = function(e) {
  for (var t = arguments.length, s = new Array(t > 1 ? t - 1 : 0), i = 1; i < t; i++) s[i - 1] = arguments[i];
  return new e(...s)
});
const Pe = m0(Array.prototype.forEach),
  ja = m0(Array.prototype.lastIndexOf),
  q2 = m0(Array.prototype.pop),
  g1 = m0(Array.prototype.push),
  qa = m0(Array.prototype.slice),
  Wa = m0(Array.prototype.splice),
  $t = Array.isArray,
  Qs = $5(Set),
  Ss = m0(Set.prototype.add),
  f1 = m0(Set.prototype.has),
  xt = m0(String.prototype.toLowerCase),
  Ms = m0(String.prototype.toString),
  W2 = m0(String.prototype.match),
  p1 = m0(String.prototype.replace),
  V2 = m0(String.prototype.indexOf),
  Va = m0(String.prototype.trim),
  Ya = m0(Number.prototype.toString),
  Ja = m0(Boolean.prototype.toString),
  Y2 = typeof BigInt > "u" ? null : m0(BigInt.prototype.toString),
  J2 = typeof Symbol > "u" ? null : m0(Symbol.prototype.toString),
  V0 = m0(Object.prototype.hasOwnProperty),
  m1 = m0(Object.prototype.toString),
  F0 = m0(RegExp.prototype.test),
  Ue = $5(TypeError);

function m0(r) {
  return function(e) {
    e instanceof RegExp && (e.lastIndex = 0);
    for (var t = arguments.length, s = new Array(t > 1 ? t - 1 : 0), i = 1; i < t; i++) s[i - 1] = arguments[i];
    return ei(r, e, s)
  }
}

function $5(r) {
  return function() {
    for (var e = arguments.length, t = new Array(e), s = 0; s < e; s++) t[s] = arguments[s];
    return ti(r, t)
  }
}

function r0(r, e) {
  let t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : xt;
  if (j2 && j2(r, null), !$t(e)) return r;
  let s = e.length;
  for (; s--;) {
    let i = e[s];
    if (typeof i == "string") {
      const n = t(i);
      n !== i && (Ha(e) || (e[s] = n), i = n)
    }
    r[i] = !0
  }
  return r
}

function Ka(r) {
  for (let e = 0; e < r.length; e++) V0(r, e) || (r[e] = null);
  return r
}

function ie(r) {
  const e = Yt(null);
  for (const s of J5(r)) {
    var t = _a(s, 2);
    const i = t[0],
      n = t[1];
    V0(r, i) && ($t(n) ? e[i] = Ka(n) : n && typeof n == "object" && n.constructor === Object ? e[i] = ie(n) : e[i] = n)
  }
  return e
}

function Xa(r) {
  switch (typeof r) {
    case "string":
      return r;
    case "number":
      return Ya(r);
    case "boolean":
      return Ja(r);
    case "bigint":
      return Y2 ? Y2(r) : "0";
    case "symbol":
      return J2 ? J2(r) : "Symbol()";
    case "undefined":
      return m1(r);
    case "function":
    case "object": {
      if (r === null) return m1(r);
      const e = r,
        t = de(e, "toString");
      if (typeof t == "function") {
        const s = t(e);
        return typeof s == "string" ? s : m1(s)
      }
      return m1(r)
    }
    default:
      return m1(r)
  }
}

function de(r, e) {
  for (; r !== null;) {
    const s = X5(r, e);
    if (s) {
      if (s.get) return m0(s.get);
      if (typeof s.value == "function") return m0(s.value)
    }
    r = K5(r)
  }

  function t() {
    return null
  }
  return t
}

function Za(r, e) {
  for (; r !== null;) {
    const t = X5(r, e);
    if (t) return t.get ? m0(t.get) : null;
    r = K5(r)
  }
  return null
}

function $a(r) {
  try {
    return F0(r, ""), !0
  } catch {
    return !1
  }
}
const K2 = L0(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]),
  ks = L0(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]),
  Ts = L0(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]),
  e6 = L0(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]),
  Ds = L0(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]),
  t6 = L0(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]),
  X2 = L0(["#text"]),
  Z2 = L0(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]),
  Ls = L0(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]),
  $2 = L0(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]),
  c9 = L0(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]),
  s6 = N0(/{{[\w\W]*|^[\w\W]*}}/g),
  i6 = N0(/<%[\w\W]*|^[\w\W]*%>/g),
  n6 = N0(/\${[\w\W]*/g),
  r6 = N0(/^data-[\-\w.\u00B7-\uFFFF]+$/),
  o6 = N0(/^aria-[\-\w]+$/),
  e4 = N0(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),
  a6 = N0(/^(?:\w+script|data):/i),
  l6 = N0(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),
  A6 = N0(/^html$/i),
  c6 = N0(/^[a-z][.\w]*(-[.\w]+)+$/i),
  Rs = N0(/<[/\w!]/g),
  t4 = N0(/<[/\w]/g),
  h6 = N0(/<\/no(script|embed|frames)/i),
  s4 = N0(/\/>/i),
  b0 = {
    element: 1,
    attribute: 2,
    text: 3,
    cdataSection: 4,
    entityReference: 5,
    entityNode: 6,
    processingInstruction: 7,
    comment: 8,
    document: 9,
    documentType: 10,
    documentFragment: 11,
    notation: 12
  },
  u6 = L0(r0({}, ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"])),
  d6 = function() {
    return typeof window > "u" ? null : window
  },
  g6 = function(e, t) {
    if (typeof e != "object" || typeof e.createPolicy != "function") return null;
    let s = null;
    const i = "data-tt-policy-suffix";
    t && t.hasAttribute(i) && (s = t.getAttribute(i));
    const n = "dompurify" + (s ? "#" + s : "");
    try {
      return e.createPolicy(n, {
        createHTML(o) {
          return o
        },
        createScriptURL(o) {
          return o
        }
      })
    } catch {
      return console.warn("TrustedTypes policy " + n + " could not be created."), null
    }
  },
  i4 = function() {
    return {
      afterSanitizeAttributes: [],
      afterSanitizeElements: [],
      afterSanitizeShadowDOM: [],
      beforeSanitizeAttributes: [],
      beforeSanitizeElements: [],
      beforeSanitizeShadowDOM: [],
      uponSanitizeAttribute: [],
      uponSanitizeElement: [],
      uponSanitizeShadowNode: []
    }
  },
  lt = function(e, t, s, i) {
    return V0(e, t) && $t(e[t]) ? r0(i.base ? ie(i.base) : {}, e[t], i.transform) : s
  },
  Fs = function(e, t, s) {
    const i = V0(e, t) ? e[t] : void 0;
    return i && typeof i == "object" ? ie(i) : s()
  };

function en() {
  let r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : d6();
  const e = k => en(k);
  if (e.version = "3.4.17", e.removed = [], !r || !r.document || r.document.nodeType !== b0.document || !r.Element) return e.isSupported = !1, e;
  let t = r.document;
  const s = t,
    i = s.currentScript;
  r.DocumentFragment;
  const n = r.HTMLTemplateElement,
    o = r.Node,
    a = r.Element,
    l = r.NodeFilter;
  r.NamedNodeMap === void 0 && (r.NamedNodeMap || r.MozNamedAttrMap), r.HTMLFormElement;
  const A = r.DOMParser,
    c = r.trustedTypes,
    h = a.prototype,
    u = de(h, "cloneNode"),
    d = de(h, "remove"),
    g = de(h, "removeAttributeNode"),
    p = de(h, "nextSibling"),
    I = de(h, "childNodes"),
    C = de(h, "parentNode"),
    E = de(h, "shadowRoot"),
    x = de(h, "attributes"),
    B = o && o.prototype ? de(o.prototype, "nodeType") : null,
    b = o && o.prototype ? de(o.prototype, "nodeName") : null,
    v = o && o.prototype ? de(o.prototype, "ownerDocument") : null,
    L = function(f) {
      return B ? B(f) : f.nodeType
    },
    D = function(f) {
      return b ? b(f) : f.nodeName
    },
    P = Za(h, "namespaceURI"),
    U = function(f) {
      return P ? P(f) : f.namespaceURI
    };
  if (typeof n == "function") {
    const k = t.createElement("template");
    k.content && k.content.ownerDocument && (t = k.content.ownerDocument)
  }
  let R, Q = "",
    H, N = !1,
    G = 0;
  const q = function() {
      if (G > 0) throw Ue('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')
    },
    j = function(f) {
      q(), G++;
      try {
        return R.createHTML(f)
      } finally {
        G--
      }
    },
    h0 = function(f) {
      q(), G++;
      try {
        return R.createScriptURL(f)
      } finally {
        G--
      }
    },
    i0 = function() {
      return N || (H = g6(c, i), N = !0), H
    },
    u0 = t,
    W = u0.implementation,
    t0 = u0.createNodeIterator,
    o0 = u0.createDocumentFragment,
    d0 = u0.getElementsByTagName,
    Re = s.importNode;
  let Z = i4();
  e.isSupported = typeof J5 == "function" && typeof C == "function" && W && W.createHTMLDocument !== void 0;
  const le = s6,
    H0 = i6,
    Z0 = n6,
    j0 = r6,
    Je = o6,
    gt = a6,
    z0 = l6,
    Ke = c6;
  let F = e4,
    z = null;
  const a0 = r0({}, [...K2, ...ks, ...Ts, ...Ds, ...X2]);
  let V = null;
  const p0 = r0({}, [...Z2, ...Ls, ...$2, ...c9]);
  let A0 = Object.seal(Yt(null, {
      tagNameCheck: {
        writable: !0,
        configurable: !1,
        enumerable: !0,
        value: null
      },
      attributeNameCheck: {
        writable: !0,
        configurable: !1,
        enumerable: !0,
        value: null
      },
      allowCustomizedBuiltInElements: {
        writable: !0,
        configurable: !1,
        enumerable: !0,
        value: !1
      }
    })),
    Q0 = null,
    C0 = null;
  const n0 = Object.seal(Yt(null, {
    tagCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    }
  }));
  let R0 = !0,
    Ee = !0,
    Ae = !1,
    $0 = !0,
    y0 = !1,
    ee = !0,
    te = !1,
    Fe = !1,
    Nt = null,
    Pt = null,
    a1 = !1,
    Xe = !1,
    Ut = !1,
    Qe = !1,
    Ze = !0,
    $e = !1;
  const et = "user-content-";
  let Ne = !0,
    P9 = !1,
    ft = null,
    Gt = {},
    pt = null;
  const bi = r0({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "selectedcontent", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let vi = null;
  const Qi = r0({}, ["audio", "video", "img", "source", "image", "track"]);
  let Si = null;
  const Mi = r0({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]),
    P1 = "http://www.w3.org/1998/Math/MathML",
    U1 = "http://www.w3.org/2000/svg",
    Se = "http://www.w3.org/1999/xhtml";
  let zt = Se,
    U9 = !1,
    G9 = null;
  const nn = r0({}, [P1, U1, Se], Ms),
    ki = L0(["mi", "mo", "mn", "ms", "mtext"]);
  let z9 = r0({}, ki);
  const Ti = L0(["annotation-xml"]);
  let _9 = r0({}, Ti);
  const rn = r0({}, ["title", "style", "font", "a", "script"]);
  let l1 = null;
  const on = ["application/xhtml+xml", "text/html"],
    an = "text/html";
  let w0 = null,
    _t = null;
  const ln = t.createElement("form"),
    Di = function(f) {
      return f instanceof RegExp || f instanceof Function
    },
    O9 = function() {
      let f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (_t && _t === f) return;
      (!f || typeof f != "object") && (f = {}), f = ie(f), l1 = on.indexOf(f.PARSER_MEDIA_TYPE) === -1 ? an : f.PARSER_MEDIA_TYPE, w0 = l1 === "application/xhtml+xml" ? Ms : xt, z = lt(f, "ALLOWED_TAGS", a0, {
        transform: w0
      }), V = lt(f, "ALLOWED_ATTR", p0, {
        transform: w0
      }), G9 = lt(f, "ALLOWED_NAMESPACES", nn, {
        transform: Ms
      }), Si = lt(f, "ADD_URI_SAFE_ATTR", Mi, {
        transform: w0,
        base: Mi
      }), vi = lt(f, "ADD_DATA_URI_TAGS", Qi, {
        transform: w0,
        base: Qi
      }), pt = lt(f, "FORBID_CONTENTS", bi, {
        transform: w0
      }), Q0 = lt(f, "FORBID_TAGS", ie({}), {
        transform: w0
      }), C0 = lt(f, "FORBID_ATTR", ie({}), {
        transform: w0
      }), Gt = V0(f, "USE_PROFILES") ? f.USE_PROFILES && typeof f.USE_PROFILES == "object" ? ie(f.USE_PROFILES) : f.USE_PROFILES : !1, R0 = f.ALLOW_ARIA_ATTR !== !1, Ee = f.ALLOW_DATA_ATTR !== !1, Ae = f.ALLOW_UNKNOWN_PROTOCOLS || !1, $0 = f.ALLOW_SELF_CLOSE_IN_ATTR !== !1, y0 = f.SAFE_FOR_TEMPLATES || !1, ee = f.SAFE_FOR_XML !== !1, te = f.WHOLE_DOCUMENT || !1, Xe = f.RETURN_DOM || !1, Ut = f.RETURN_DOM_FRAGMENT || !1, Qe = f.RETURN_TRUSTED_TYPE || !1, a1 = f.FORCE_BODY || !1, Ze = f.SANITIZE_DOM !== !1, $e = f.SANITIZE_NAMED_PROPS || !1, Ne = f.KEEP_CONTENT !== !1, P9 = f.IN_PLACE || !1, F = $a(f.ALLOWED_URI_REGEXP) ? f.ALLOWED_URI_REGEXP : e4, zt = typeof f.NAMESPACE == "string" ? f.NAMESPACE : Se, z9 = Fs(f, "MATHML_TEXT_INTEGRATION_POINTS", () => r0({}, ki)), _9 = Fs(f, "HTML_INTEGRATION_POINTS", () => r0({}, Ti));
      const w = Fs(f, "CUSTOM_ELEMENT_HANDLING", () => Yt(null));
      if (A0 = Yt(null), V0(w, "tagNameCheck") && Di(w.tagNameCheck) && (A0.tagNameCheck = w.tagNameCheck), V0(w, "attributeNameCheck") && Di(w.attributeNameCheck) && (A0.attributeNameCheck = w.attributeNameCheck), V0(w, "allowCustomizedBuiltInElements") && typeof w.allowCustomizedBuiltInElements == "boolean" && (A0.allowCustomizedBuiltInElements = w.allowCustomizedBuiltInElements), N0(A0), y0 && (Ee = !1), Ut && (Xe = !0), Gt && (z = r0({}, X2), V = Yt(null), Gt.html === !0 && (r0(z, K2), r0(V, Z2)), Gt.svg === !0 && (r0(z, ks), r0(V, Ls), r0(V, c9)), Gt.svgFilters === !0 && (r0(z, Ts), r0(V, Ls), r0(V, c9)), Gt.mathMl === !0 && (r0(z, Ds), r0(V, $2), r0(V, c9))), n0.tagCheck = null, n0.attributeCheck = null, V0(f, "ADD_TAGS") && (typeof f.ADD_TAGS == "function" ? n0.tagCheck = f.ADD_TAGS : $t(f.ADD_TAGS) && (z === a0 && (z = ie(z)), r0(z, f.ADD_TAGS, w0))), V0(f, "ADD_ATTR") && (typeof f.ADD_ATTR == "function" ? n0.attributeCheck = f.ADD_ATTR : $t(f.ADD_ATTR) && (V === p0 && (V = ie(V)), r0(V, f.ADD_ATTR, w0))), V0(f, "ADD_FORBID_CONTENTS") && $t(f.ADD_FORBID_CONTENTS) && (pt === bi && (pt = ie(pt)), r0(pt, f.ADD_FORBID_CONTENTS, w0)), Ne && (z["#text"] = !0), te && r0(z, ["html", "head", "body"]), z.table && (r0(z, ["tbody"]), delete Q0.tbody), f.TRUSTED_TYPES_POLICY) {
        if (typeof f.TRUSTED_TYPES_POLICY.createHTML != "function") throw Ue('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof f.TRUSTED_TYPES_POLICY.createScriptURL != "function") throw Ue('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        const S = R;
        R = f.TRUSTED_TYPES_POLICY;
        try {
          Q = j("")
        } catch (M) {
          throw R = S, M
        }
      } else f.TRUSTED_TYPES_POLICY === null ? (R = void 0, Q = "") : (R === void 0 && (R = i0()), R && typeof Q == "string" && (Q = j("")));
      L0 && L0(f), _t = f
    },
    Li = r0({}, [...ks, ...Ts, ...e6]),
    Ri = r0({}, [...Ds, ...t6]),
    An = function(f, w, S) {
      return w.namespaceURI === Se ? f === "svg" : w.namespaceURI === P1 ? f === "svg" && (S === "annotation-xml" || z9[S]) : !!Li[f]
    },
    cn = function(f, w, S) {
      return w.namespaceURI === Se ? f === "math" : w.namespaceURI === U1 ? f === "math" && _9[S] : !!Ri[f]
    },
    hn = function(f, w, S) {
      return w.namespaceURI === U1 && !_9[S] || w.namespaceURI === P1 && !z9[S] ? !1 : !Ri[f] && (rn[f] || !Li[f])
    },
    un = function(f) {
      const w = U(f),
        S = xt(D(f)),
        M = C(f);
      let O, J;
      return M && L(M) === b0.element ? (O = {
        namespaceURI: U(M)
      }, J = xt(D(M))) : (O = {
        namespaceURI: zt
      }, J = "template"), G9[w] ? w === U1 ? An(S, O, J) : w === P1 ? cn(S, O, J) : w === Se ? hn(S, O, J) : !!(l1 === "application/xhtml+xml" && G9[w]) : !1
    },
    tt = function(f) {
      g1(e.removed, {
        element: f
      });
      try {
        C(f).removeChild(f)
      } catch {
        if (d(f), !C(f)) throw Ue("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")
      }
    },
    Fi = function(f, w, S) {
      try {
        g(f, w)
      } catch {
        try {
          f.removeAttribute(S)
        } catch {}
      }
    },
    H9 = function(f) {
      q9(f);
      const w = I(f);
      w && Pe(qa(w), M => {
        try {
          d(M)
        } catch {}
      });
      const S = L(f) === b0.element ? x(f) : null;
      if (S)
        for (let M = S.length - 1; M >= 0; --M) {
          const O = S[M],
            J = O && O.name;
          typeof J == "string" && Fi(f, O, J)
        }
    },
    Ot = function(f, w, S) {
      if (!S) try {
        S = w.getAttributeNode(f)
      } catch {
        S = null
      }
      g1(e.removed, {
        attribute: S || null,
        from: w
      });
      try {
        S ? g(w, S) : w.removeAttribute(f)
      } catch {
        try {
          w.removeAttribute(f)
        } catch {}
      }
      if (f === "is")
        if (Xe || Ut) try {
          tt(w)
        } catch {} else try {
          w.setAttribute(f, "")
        } catch {}
    },
    Ni = function(f) {
      const w = x(f);
      if (w)
        for (let S = w.length - 1; S >= 0; --S) {
          const M = w[S],
            O = M && M.name;
          typeof O != "string" || V[w0(O)] || Fi(f, M, O)
        }
    },
    j9 = function(f, w) {
      let S = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
      const M = [f];
      for (; M.length > 0;) {
        const O = M.pop();
        if (w(O) === !1) continue;
        if (S && L(O) === b0.element) {
          const $ = E(O);
          st($) && M.push($)
        }
        const J = I(O);
        if (J)
          for (let $ = J.length - 1; $ >= 0; --$) M.push(J[$])
      }
    },
    q9 = function(f) {
      j9(f, w => {
        L(w) === b0.element && Ni(w)
      })
    },
    W9 = function(f) {
      const w = [];
      return j9(f, S => {
        w.push(S)
      }, !0), w
    },
    dn = function(f, w) {
      const S = Qs();
      Pe(W9(f), M => {
        L(M) === b0.element && Ss(S, M)
      }), Pe(w, M => {
        L(M) === b0.element && !f1(S, M) && Ni(M)
      })
    },
    Pi = function(f, w) {
      let S = !1;
      return Pe(e.removed, M => {
        M.element && (S = S || M.element === f, q9(M.element))
      }), dn(f, w), S
    },
    gn = 8,
    fn = function(f, w) {
      const S = ft;
      let M = null;
      const O = () => (M || (M = Qs(), Pe(w, J => {
        Ss(M, J)
      })), M);
      for (let J = 0;; J++) {
        const $ = W9(f),
          S0 = [f];
        let Me = !1;
        if (Pe($, _0 => {
            L(_0) === b0.documentFragment ? g1(S0, _0) : !Me && !f1(S, _0) && (Me = f1(O(), _0))
          }), !Me) return;
        if (J >= gn) throw Ue("the tree kept changing during in-place sanitization; refusing to return it");
        Pe(S0, (_0, q0) => {
          pn(_0, q0 > 0, f, O())
        })
      }
    },
    pn = function(f, w, S, M) {
      const O = V9(f);
      let J;
      for (; J = O.nextNode();) !f1(M, J) || f1(ft, J) || (w && Ce(Z.uponSanitizeShadowNode, J, null), J9(J, S), K9(J, S), st(J.content) && c1(J.content))
    },
    mn = function(f) {
      ft && Ss(ft, f)
    },
    Ui = function(f, w) {
      return ee ? f === "patchsrc" ? !0 : f === "for" && w !== "label" && w !== "output" : !1
    },
    In = function(f) {
      ee && j9(f, w => {
        const S = L(w);
        if (S === b0.processingInstruction || S === b0.comment && F0(t4, w.data)) {
          try {
            d(w)
          } catch {}
          return !1
        }
        if (S === b0.element) {
          const M = w,
            O = w0(D(w));
          try {
            M.hasAttribute && M.hasAttribute("patchsrc") && M.removeAttribute("patchsrc"), M.hasAttribute && M.hasAttribute("for") && Ui("for", O) && M.removeAttribute("for")
          } catch {}
        }
        return !0
      })
    },
    Gi = function(f) {
      let w = null,
        S = null;
      if (a1) f = "<remove></remove>" + f;
      else {
        const J = W2(f, /^[\r\n\t ]+/);
        S = J && J[0]
      }
      l1 === "application/xhtml+xml" && zt === Se && (f = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + f + "</body></html>");
      const M = R ? j(f) : f;
      if (zt === Se) try {
        w = new A().parseFromString(M, l1)
      } catch {}
      if (!w || !w.documentElement) {
        w = W.createDocument(zt, "template", null);
        try {
          w.documentElement.innerHTML = U9 ? Q : M
        } catch {}
      }
      const O = w.body || w.documentElement;
      return f && S && O.insertBefore(t.createTextNode(S), O.childNodes[0] || null), zt === Se ? d0.call(w, te ? "html" : "body")[0] : te ? w.documentElement : O
    },
    V9 = function(f) {
      const w = v ? v(f) : f.ownerDocument;
      return t0.call(w || f, f, l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION, null)
    },
    G1 = function(f) {
      return f = p1(f, le, " "), f = p1(f, H0, " "), f = p1(f, Z0, " "), f
    },
    Y9 = function(f) {
      var w;
      zi(f);
      const S = (w = f.querySelectorAll) === null || w === void 0 ? void 0 : w.call(f, "template");
      S && Pe(S, M => {
        st(M.content) && Y9(M.content)
      })
    },
    zi = function(f) {
      f.normalize();
      const w = v ? v(f) : f.ownerDocument,
        S = t0.call(w || f, f, l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION, null);
      let M = S.nextNode();
      for (; M;) M.data = G1(M.data), M = S.nextNode()
    },
    z1 = function(f) {
      const w = b ? b(f) : null;
      return typeof w != "string" || w0(w) !== "form" ? !1 : typeof f.nodeName != "string" || typeof f.textContent != "string" || typeof f.removeChild != "function" || f.attributes !== x(f) || typeof f.removeAttribute != "function" || typeof f.removeAttributeNode != "function" || typeof f.getAttributeNode != "function" || typeof f.setAttribute != "function" || typeof f.namespaceURI != "string" || typeof f.insertBefore != "function" || typeof f.hasChildNodes != "function" || f.nodeType !== B(f) || f.childNodes !== I(f)
    },
    st = function(f) {
      if (!B || typeof f != "object" || f === null) return !1;
      try {
        return B(f) === b0.documentFragment
      } catch {
        return !1
      }
    },
    A1 = function(f) {
      if (!B || typeof f != "object" || f === null) return !1;
      try {
        return typeof B(f) == "number"
      } catch {
        return !1
      }
    };

  function Ce(k, f, w) {
    k.length !== 0 && Pe(k, S => {
      S.call(e, f, w, _t)
    })
  }
  const En = function(f, w) {
      return !!(ee && f.hasChildNodes() && !A1(f.firstElementChild) && F0(Rs, f.textContent) && F0(Rs, f.innerHTML) || ee && u6[w] && L(f) === b0.element && U(f) === Se && (A1(f.firstElementChild) || typeof f.textContent == "string" && F0(Rs, f.textContent)) || f.nodeType === b0.processingInstruction || ee && f.nodeType === b0.comment && F0(t4, f.data))
    },
    _1 = function(f, w) {
      if (f instanceof RegExp) return F0(f, w);
      if (f instanceof Function) {
        for (var S = arguments.length, M = new Array(S > 2 ? S - 2 : 0), O = 2; O < S; O++) M[O - 2] = arguments[O];
        return !!f(w, ...M)
      }
      return !1
    },
    Cn = function(f, w, S) {
      if (!Q0[w] && Hi(w) && _1(A0.tagNameCheck, w)) return !1;
      if (Ne && !pt[w] && !pt[xt(w)]) {
        const M = C(f),
          O = I(f);
        if (O && M) {
          const J = O.length;
          for (let $ = J - 1; $ >= 0; --$) {
            const S0 = f === S ? u(O[$], !0) : O[$];
            M.insertBefore(S0, p(f))
          }
        }
      }
      return tt(f), !0
    },
    _i = function(f, w, S, M) {
      return f.length === 0 ? w : w === S || w === M ? ie(w) : w
    },
    Ht = function(f, w) {
      return f === w || C(f) !== null ? !1 : (P9 && q9(f), !0)
    },
    J9 = function(f, w) {
      if (mn(f), Ce(Z.beforeSanitizeElements, f, null), Ht(f, w)) return !0;
      if (z1(f)) return tt(f), !0;
      const S = w0(D(f));
      if (z = _i(Z.uponSanitizeElement, z, a0, Nt), Ce(Z.uponSanitizeElement, f, {
          tagName: S,
          allowedTags: z
        }), Ht(f, w)) return !0;
      if (En(f, S)) return tt(f), !0;
      if (Q0[S] || !(n0.tagCheck instanceof Function && n0.tagCheck(S)) && !z[S]) {
        const M = Cn(f, S, w);
        return M === !1 && (Ce(Z.afterSanitizeElements, f, null), Ht(f, w)) ? !0 : M
      }
      if (L(f) === b0.element && !un(f) || (S === "noscript" || S === "noembed" || S === "noframes") && F0(h6, f.innerHTML)) return tt(f), !0;
      if (y0 && f.nodeType === b0.text) {
        const M = G1(f.textContent);
        f.textContent !== M && (g1(e.removed, {
          element: f.cloneNode()
        }), f.textContent = M)
      }
      return Ce(Z.afterSanitizeElements, f, null), Ht(f, w)
    },
    Oi = function(f, w, S) {
      if (C0[w] || Ui(w, f) || Ze && (w === "id" || w === "name") && (S in t || S in ln)) return !1;
      const M = V[w] || n0.attributeCheck instanceof Function && n0.attributeCheck(w, f);
      return Ee && F0(j0, w) || R0 && F0(Je, w) ? !0 : M ? Si[w] || F0(F, p1(S, z0, "")) || (w === "src" || w === "xlink:href" || w === "href") && f !== "script" && V2(S, "data:") === 0 && vi[f] || Ae && !F0(gt, p1(S, z0, "")) ? !0 : !S : Hi(f) && _1(A0.tagNameCheck, f) && _1(A0.attributeNameCheck, w, f) || w === "is" && A0.allowCustomizedBuiltInElements && _1(A0.tagNameCheck, S)
    },
    yn = r0({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]),
    Hi = function(f) {
      return !yn[xt(f)] && F0(Ke, f)
    },
    wn = function(f, w, S, M) {
      if (R && typeof c == "object" && typeof c.getAttributeType == "function" && !S) switch (c.getAttributeType(f, w)) {
        case "TrustedHTML":
          return j(M);
        case "TrustedScriptURL":
          return h0(M)
      }
      return M
    },
    Bn = function(f, w, S, M) {
      try {
        return S ? f.setAttributeNS(S, w, M) : f.setAttribute(w, M), z1(f) ? (tt(f), !1) : !0
      } catch {
        return Ot(w, f), !1
      }
    },
    ji = function(f, w) {
      return ee && F0(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, w) ? !0 : xt(f) === "attributename" && W2(w, "href") !== null
    },
    K9 = function(f, w) {
      if (Ce(Z.beforeSanitizeAttributes, f, null), Ht(f, w)) return;
      const S = f.attributes;
      if (!S || z1(f)) return;
      V = _i(Z.uponSanitizeAttribute, V, p0, Pt);
      const M = {
        attrName: "",
        attrValue: "",
        keepAttr: !0,
        allowedAttributes: V,
        forceKeepAttr: void 0
      };
      let O = S.length;
      const J = w0(f.nodeName);
      for (; O--;) {
        const $ = S[O],
          S0 = $.name,
          Me = $.namespaceURI,
          _0 = $.value,
          q0 = w0(S0),
          jt = _0;
        let W0 = S0 === "value" ? jt : Va(jt),
          qi = !1;
        if (M.attrName = q0, M.attrValue = W0, M.keepAttr = !0, M.forceKeepAttr = void 0, Ce(Z.uponSanitizeAttribute, f, M), W0 = M.attrValue, $e && (q0 === "id" || q0 === "name") && V2(W0, et) !== 0 && (Ot(S0, f, $), W0 = et + W0, qi = !0), ji(S0, W0)) {
          Ot(S0, f, $);
          continue
        }
        if (!M.forceKeepAttr) {
          if (!M.keepAttr) {
            Ot(S0, f, $);
            continue
          }
          if (!$0 && F0(s4, W0)) {
            Ot(S0, f, $);
            continue
          }
          if (y0 && (W0 = G1(W0)), !Oi(J, q0, W0)) {
            Ot(S0, f, $);
            continue
          }
          W0 = wn(J, q0, Me, W0), W0 !== jt && Bn(f, S0, Me, W0) && qi && q2(e.removed)
        }
      }
      Ce(Z.afterSanitizeAttributes, f, null), Ht(f, w)
    },
    c1 = function(f) {
      let w = null;
      const S = V9(f);
      for (Ce(Z.beforeSanitizeShadowDOM, f, null); w = S.nextNode();)
        if (Ce(Z.uponSanitizeShadowNode, w, null), J9(w, f), K9(w, f), st(w.content) && c1(w.content), L(w) === b0.element) {
          const M = E(w);
          st(M) && (X9(M), c1(M))
        } y0 && zi(f), Ce(Z.afterSanitizeShadowDOM, f, null)
    },
    X9 = function(f) {
      const w = [{
        node: f,
        shadow: null
      }];
      for (; w.length > 0;) {
        const S = w.pop();
        if (S.shadow) {
          c1(S.shadow);
          continue
        }
        const M = S.node,
          O = L(M) === b0.element,
          J = I(M);
        if (J)
          for (let $ = J.length - 1; $ >= 0; --$) w.push({
            node: J[$],
            shadow: null
          });
        if (O) {
          const $ = b ? b(M) : null;
          if (typeof $ == "string" && w0($) === "template") {
            const S0 = M.content;
            st(S0) && w.push({
              node: S0,
              shadow: null
            })
          }
        }
        if (O) {
          const $ = E(M);
          st($) && w.push({
            node: null,
            shadow: $
          }, {
            node: $,
            shadow: null
          })
        }
      }
    };
  return e.sanitize = function(k) {
    let f = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
      w = null,
      S = null,
      M = null,
      O = null;
    if (U9 = !k, U9 && (k = "<!-->"), typeof k != "string" && !A1(k) && (k = Xa(k), typeof k != "string")) throw Ue("dirty is not a string, aborting");
    if (!e.isSupported) return k;
    Fe ? (z = Nt, V = Pt) : O9(f), (Z.uponSanitizeElement.length > 0 || Z.uponSanitizeAttribute.length > 0) && (z = ie(z)), Z.uponSanitizeAttribute.length > 0 && (V = ie(V)), e.removed = [];
    const J = P9 && typeof k != "string" && A1(k);
    let $ = [];
    const S0 = ft;
    if (J) {
      In(k);
      const q0 = D(k);
      if (typeof q0 == "string") {
        const jt = w0(q0);
        if (!z[jt] || Q0[jt]) throw H9(k), Ue("root node is forbidden and cannot be sanitized in-place")
      }
      if (z1(k)) throw H9(k), Ue("root node is clobbered and cannot be sanitized in-place");
      $ = W9(k), ft = Qs()
    } else if (A1(k)) w = Gi("<!---->"), S = w.ownerDocument.importNode(k, !0), S.nodeType === b0.element && S.nodeName === "BODY" || S.nodeName === "HTML" ? w = S : w.appendChild(S), X9(w);
    else {
      if (!Xe && !y0 && !te && k.indexOf("<") === -1) return R && Qe ? j(k) : k;
      if (w = Gi(k), !w) return Xe ? null : Qe ? Q : ""
    }
    w && a1 && tt(w.firstChild);
    const Me = J ? k : w;
    try {
      J && X9(k);
      const q0 = V9(Me);
      for (; M = q0.nextNode();) J9(M, Me), K9(M, Me), st(M.content) && c1(M.content);
      J && fn(k, $)
    } catch (q0) {
      throw J && (H9(k), Pi(k, $)), q0
    } finally {
      ft = S0
    }
    if (J) {
      if (Pi(k, $)) throw Ue("a node selected for removal could not be safely returned; refusing to sanitize in place");
      return y0 && Y9(k), k
    }
    if (Xe) {
      if (y0 && Y9(w), Ut)
        for (O = o0.call(w.ownerDocument); w.firstChild;) O.appendChild(w.firstChild);
      else O = w;
      return (V.shadowroot || V.shadowrootmode) && (O = Re.call(s, O, !0)), O
    }
    let _0 = te ? w.outerHTML : w.innerHTML;
    return te && z["!doctype"] && w.ownerDocument && w.ownerDocument.doctype && w.ownerDocument.doctype.name && F0(A6, w.ownerDocument.doctype.name) && (_0 = "<!DOCTYPE " + w.ownerDocument.doctype.name + `>
` + _0), y0 && (_0 = G1(_0)), R && Qe ? j(_0) : _0
  }, e.setConfig = function() {
    let k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    O9(k), Fe = !0, Nt = z, Pt = V
  }, e.clearConfig = function() {
    _t = null, Fe = !1, Nt = null, Pt = null, R = H, Q = ""
  }, e.isValidAttribute = function(k, f, w) {
    _t || O9({});
    const S = w0(k),
      M = w0(f);
    return typeof w == "string" && (ji(f, w) || !$0 && F0(s4, w)) ? !1 : Oi(S, M, w)
  }, e.addHook = function(k, f) {
    typeof f == "function" && V0(Z, k) && g1(Z[k], f)
  }, e.removeHook = function(k, f) {
    if (V0(Z, k)) {
      if (f !== void 0) {
        const w = ja(Z[k], f);
        return w === -1 ? void 0 : Wa(Z[k], w, 1)[0]
      }
      return q2(Z[k])
    }
  }, e.removeHooks = function(k) {
    V0(Z, k) && (Z[k] = [])
  }, e.removeAllHooks = function() {
    Z = i4()
  }, e
}
var f6 = en();


export { f6 as DOMPurifyInstance, en as createDOMPurify };
