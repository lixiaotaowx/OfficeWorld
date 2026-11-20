import { Gd } from './screen-share.js';
import { Hd as fitVideoRect, Kd, cr as getScreenStatusMessage } from './standalone.js';
import { r as React, n as Fn, D as Bi, j as jsxRuntime, o as ScreenIcon, p as td, S as id, M as nd, a as ReactDOM } from '../chunks/dockGreeting.js';
const INITIAL_FRAME_GRACE_MS = 2500;
function getScreenStreamStatus(i) {
  return i.ended ? "disconnected" : i.muted ? "muted" : i.hasFrame || i.waitedMs < INITIAL_FRAME_GRACE_MS ? "live" : "waiting";
}
const canAnnotateStream = i => i !== "disconnected";
const ANNOTATION_MIN_POINTS = 6,
  ANNOTATION_BATCH_MS = 70,
  ANNOTATION_FADE_MS = 1400,
  ANNOTATION_MAX_POINTS = 2e3;
function ScreenStage(i) {
  const {
      scope: e,
      stream: t
    } = i,
    n = React.useRef(null),
    s = React.useRef(null),
    r = React.useRef(null),
    a = React.useRef([]),
    o = React.useRef(),
    c = React.useRef(!1),
    d = React.useRef({
      points: [],
      color: ""
    }),
    l = React.useRef(!1),
    [u, h] = React.useState(!1),
    [m, f] = React.useState(!!i.initialFullscreen),
    [p, _] = React.useState(() => Fn(i.selfColor, Bi));
  React.useEffect(() => {
    _(Fn(i.selfColor, Bi));
  }, [i.selfColor]);
  const w = m,
    k = td(n, w, t),
    [P, y] = React.useState("live"),
    S = React.useRef(Date.now()),
    E = React.useRef(!0);
  React.useEffect(() => {
    const K = s.current;
    if (K) return K.srcObject = t, K.play().catch(() => {}), () => {
      E.current || (K.srcObject = null);
    };
  }, [t, w]), React.useEffect(() => {
    S.current = Date.now();
    const K = t.getVideoTracks()[0],
      z = () => {
        const J = s.current;
        return getScreenStreamStatus({
          ended: (K == null ? void 0 : K.readyState) === "ended",
          muted: K == null ? void 0 : K.muted,
          hasFrame: ((J == null ? void 0 : J.videoWidth) ?? 0) > 0,
          waitedMs: Date.now() - S.current
        });
      },
      j = () => {
        const J = z();
        E.current = canAnnotateStream(J), y(J);
      };
    j();
    const G = setInterval(j, 700);
    return () => clearInterval(G);
  }, [t]), React.useEffect(() => {
    var j, G;
    const K = () => f(document.fullscreenElement === n.current);
    document.addEventListener("fullscreenchange", K);
    const z = (G = (j = window.officeDesktop) == null ? void 0 : j.onFullscreenChange) == null ? void 0 : G.call(j, J => f(J));
    return () => {
      document.removeEventListener("fullscreenchange", K), z == null || z();
    };
  }, []), React.useEffect(() => {
    if (!i.initialFullscreen) return;
    const K = window.officeDesktop;
    if (K != null && K.setFullscreen) {
      l.current = !0, K.setFullscreen(!0).catch(() => {
        l.current = !1;
      });
      return;
    }
    requestAnimationFrame(() => {
      const z = n.current;
      z != null && z.isConnected && z.requestFullscreen().catch(() => {});
    });
  }, [i.initialFullscreen]);
  const x = React.useCallback(() => {
    var z;
    const K = window.officeDesktop;
    K != null && K.setFullscreen && l.current && (l.current = !1, K.setFullscreen(!1).catch(() => {})), document.fullscreenElement && document.exitFullscreen().catch(() => {}), f(!1), (z = i.onExitFullscreen) == null || z.call(i);
  }, [i.onExitFullscreen]);
  React.useEffect(() => () => {
    const K = window.officeDesktop;
    K != null && K.setFullscreen && l.current && K.setFullscreen(!1).catch(() => {}), l.current = !1, document.fullscreenElement && document.exitFullscreen().catch(() => {}), clearTimeout(d.current.timer);
  }, []), React.useEffect(() => {
    if (!m) return;
    const K = z => {
      z.key === "Escape" && x();
    };
    return window.addEventListener("keydown", K), () => window.removeEventListener("keydown", K);
  }, [m, x]);
  const D = React.useCallback(() => {
    const K = r.current,
      z = s.current,
      j = n.current;
    if (!K || !z || !j) return;
    const G = window.devicePixelRatio || 1,
      J = j.clientWidth,
      we = j.clientHeight;
    (K.width !== Math.round(J * G) || K.height !== Math.round(we * G)) && (K.width = Math.round(J * G), K.height = Math.round(we * G));
    const ve = K.getContext("2d");
    if (!ve) return;
    ve.setTransform(G, 0, 0, G, 0, 0), ve.clearRect(0, 0, J, we);
    const {
      points: tt,
      color: lt
    } = d.current;
    if (tt.length < 2) return;
    const je = getDisplayedVideoRect(z);
    if (!je) return;
    const q = z.getBoundingClientRect(),
      Y = j.getBoundingClientRect(),
      be = q.left - Y.left,
      Ke = q.top - Y.top;
    ve.strokeStyle = lt || "#f0d274", ve.lineWidth = 3, ve.lineCap = "round", ve.lineJoin = "round", ve.beginPath(), tt.forEach(([Et, Ge], Si) => {
      const er = be + je.x + Et * je.width,
        tr = Ke + je.y + Ge * je.height;
      Si === 0 ? ve.moveTo(er, tr) : ve.lineTo(er, tr);
    }), ve.stroke();
  }, []);
  React.useEffect(() => {
    D();
  }, [k, D]);
  const C = React.useCallback(() => {
      clearTimeout(d.current.timer), d.current.timer = setTimeout(() => {
        d.current.points = [], D();
      }, ANNOTATION_FADE_MS);
    }, [D]),
    M = React.useCallback(K => {
      clearTimeout(o.current);
      const z = a.current;
      a.current = [], !(!z.length && !K) && i.onDraw(e, z, K, p);
    }, [i, e, p]),
    g = K => {
      const z = s.current;
      if (!z) return null;
      const j = getDisplayedVideoRect(z);
      if (!j) return null;
      const G = z.getBoundingClientRect();
      return Kd(j, K.clientX - G.left, K.clientY - G.top);
    },
    T = K => {
      if (!u) return;
      const z = g(K);
      z && (K.currentTarget.setPointerCapture(K.pointerId), c.current = !0, a.current = [z], clearTimeout(d.current.timer), d.current.points = [z], d.current.color = p);
    },
    A = K => {
      if (!u || !c.current) return;
      const z = g(K);
      z && (a.current.push(z), d.current.points.push(z), d.current.points.length > ANNOTATION_MAX_POINTS && d.current.points.splice(0, d.current.points.length - ANNOTATION_MAX_POINTS), D(), a.current.length >= ANNOTATION_MIN_POINTS ? M(!1) : (clearTimeout(o.current), o.current = setTimeout(() => M(!1), ANNOTATION_BATCH_MS)));
    },
    F = () => {
      c.current && (c.current = !1, M(!0), C());
    };
  React.useEffect(() => () => clearTimeout(o.current), []);
  const H = () => {
      if (m) {
        x();
        return;
      }
      const K = n.current;
      if (!K) return;
      const z = window.officeDesktop;
      if (z != null && z.setFullscreen) {
        const j = !m;
        l.current = j, z.setFullscreen(j).then(G => f(G === !0)).catch(() => {});
        return;
      }
      if (document.fullscreenElement === K) document.exitFullscreen().catch(() => {});else {
        f(!0);
        const j = G => {
          const J = n.current;
          if (!(!J || !J.isConnected)) {
            if (G > 0) {
              requestAnimationFrame(() => j(G - 1));
              return;
            }
            J.requestFullscreen().catch(() => f(!1));
          }
        };
        requestAnimationFrame(() => j(2));
      }
    },
    N = i.annotatable !== !1,
    Q = () => {
      d.current.points = [], D();
    },
    Z = () => {
      Q(), i.onClear(e);
    },
    ue = jsxRuntime.jsxs("div", {
      ref: n,
      className: `screen-stage${m ? " fullscreen" : ""}${u ? " annotating" : ""}${i.clearsOwnBoard ? " own-board" : ""}`,
      children: [jsxRuntime.jsx("video", {
        ref: s,
        autoPlay: !0,
        muted: !0,
        playsInline: !0,
        "aria-label": i.label,
        style: {
          transform: `scale(${k})`
        }
      }), jsxRuntime.jsx("canvas", {
        ref: r,
        className: "screen-stage-ink",
        "aria-hidden": "true"
      }), jsxRuntime.jsx("div", {
        className: "screen-stage-draw",
        onPointerDown: T,
        onPointerMove: A,
        onPointerUp: F,
        onPointerCancel: F
      }), i.clearsOwnBoard && !w && jsxRuntime.jsx("div", {
        className: "screen-stage-own-clear",
        children: jsxRuntime.jsx("button", {
          type: "button",
          title: "清掉所有人在共享屏幕上的标注",
          onClick: Z,
          children: "清掉标注"
        })
      }), !w && jsxRuntime.jsx(Gd, {
        onFullscreen: H
      }), w && jsxRuntime.jsxs("div", {
        className: "screen-stage-bar screen-stage-pill",
        children: [jsxRuntime.jsxs("span", {
          className: "screen-stage-name",
          children: [jsxRuntime.jsx(ScreenIcon, {}), i.label]
        }), jsxRuntime.jsx(id, {
          enabled: N,
          own: i.clearsOwnBoard,
          active: u,
          color: p,
          onToggle: () => {
            h(!u), c.current = !1;
          },
          onColor: _,
          onUndo: () => {
            Q(), i.onUndo(e);
          },
          onClear: Z
        }), jsxRuntime.jsx("button", {
          type: "button",
          onClick: H,
          "aria-pressed": m,
          title: "铺满整个屏幕",
          children: m ? "退出全屏" : "全屏"
        }), i.actions, jsxRuntime.jsx("button", {
          type: "button",
          className: "screen-stage-close",
          onClick: x,
          "aria-label": "收起共享窗口",
          title: "收起预览，继续通话和共享（Esc）",
          children: jsxRuntime.jsx(nd, {})
        })]
      }), w && i.hint && jsxRuntime.jsx("p", {
        className: "screen-stage-hint",
        children: i.hint
      }), getScreenStatusMessage(P) && jsxRuntime.jsx("p", {
        className: "screen-stage-health",
        role: "status",
        children: getScreenStatusMessage(P)
      }), u && w && jsxRuntime.jsx("p", {
        className: "screen-stage-tip",
        children: "标注中：在共享的屏幕上拖动来画"
      }), w && !N && !i.clearsOwnBoard && jsxRuntime.jsx("p", {
        className: "screen-stage-tip",
        children: "对方是在浏览器里共享的，标注不会出现在对方的桌面上。"
      })]
    });
  return w ? ReactDOM.createPortal(ue, document.body) : ue;
}
function getDisplayedVideoRect(i) {
  const e = i.getBoundingClientRect(),
    t = e.width,
    n = e.height,
    s = fitVideoRect({
      clientWidth: t,
      clientHeight: n
    }, i.videoWidth, i.videoHeight);
  return s || (!t || !n ? null : {
    x: 0,
    y: 0,
    width: t,
    height: n
  });
}
function LocalVideo({
  stream: i,
  label: e
}) {
  const t = React.useRef(null);
  return React.useEffect(() => {
    const n = t.current;
    if (n) return n.srcObject = i, n.play().catch(() => {}), () => {
      n.srcObject = null;
    };
  }, [i]), jsxRuntime.jsx("video", {
    ref: t,
    autoPlay: !0,
    muted: !0,
    playsInline: !0,
    "aria-label": e
  });
}

export { ScreenStage, LocalVideo };
