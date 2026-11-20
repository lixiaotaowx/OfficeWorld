import { E6, C6, o4, y6, w6, B6, Ns, ue, I1 } from '../app/hallScreenView.js';
import { definePrivate as m, initPrivate as Vi, privateMethod as Z9, checkPrivate as vn } from '../app/hallPrelude.js';
import { x6 } from '../app/hallScreenShare.js';
import { P3, U3, G3, ai, O3, H3, j3, W3, u8, K6, X6, g8, A2, f8, p8 } from '../app/hallBilliardsUI.js';
import { C5, D8, O8, j8 } from '../app/hallRenderPipeline.js';
import { Zt, r1, V5, Y5, Lt, we, S9, xi, Be, h9, B1 } from '../app/hallLoop.js';
import { yt, Na, Rt } from '../app/hallSeats.js';
import { c0, Pa, p6, Y, v0, tn, si, E9, n4, m6, f0, bt, r4, At, I6 } from '../app/hallCards.js';
import { ut, Do, Ro, Fo, Xs } from '../app/hallPartPanel.js';
import { mi, Ft, U5, X, D0, aa, ba, l9, d1, se, Ra, P2, U2, at, G2, Q9, z2, A9, _2, Fa, O2 } from '../app/hallMarkdown.js';
import { bo, bs } from '../app/hallBuild.js';
import { Qo } from '../app/hallBuildController.js';
import { a9, Mo } from '../app/hallBuildTray.js';
import { b9, T5, R9, no, ao } from '../app/hallModels.js';
import { S1, He, co, M1, go, F5, pi, fo, po, Io, Co, y1, ke, yo, wo, je, N5, Bo } from '../app/hallModelSync.js';
import { isPickable as Qt } from '../app/hallPickable.js';
import { L9, pr, mr, Er } from '../app/hallAvatars.js';
import { yr, xr } from '../app/hallMonitor.js';
import { q3, k4, x0, J6, js, li, Y3 } from '../app/hallBilliards.js';
import { ar, n1, di, Ys, b1, d2, P0, rt, v5, v1, Ar, cr, hr, D1, S5, ur, gr, fr, p2, m2, I2 } from '../app/hallParts.js';
import { tr, i1, Vs, K0, X0, gs, rr, or, b5, s9 } from '../app/hallCatalog.js';
import { buildHallShell as $8, hallBounds as Bt } from '../app/hallShell.js';
import { hi, D9, W8, hs, w5, V8, l0, x1, h2, Y8, ht, B5, $1, ds, K8, T1 } from '../app/hallMaterials.js';
import { KTX2Loader as J0 } from '../vendor/ktx2Loader.js';
import { Pass as dt, EffectComposer as w8, RenderPass as B8, GTAOPass as Te, ShaderPass as S8, OutputPass as M8, UnrealBloomPass as t1 } from '../vendor/postprocessing.js';
import { DOMPurifyInstance as f6 } from '../vendor/dompurify.js';
import { HallSettings as T6 } from '../app/HallSettings.js';
import { observeHallVisibility, bindHallVisibility, HallRenderLifecycle, getHallFrameInterval, shouldRefreshHallShadows, IDLE_AFTER_MS, ACTIVE_FRAME_INTERVAL_MS } from '../app/hallRenderLifecycle.js';
import '../styles/HallView.css';
import { NavigationRequest } from '../app/NavigationRequest.js';
import {
  r as _,
  j as y,
  _ as A4
} from "./dockGreeting.js";
import {
  G as E0,
  B as k1,
  m as c4,
  M as K,
  P as ii,
  V as T,
  R as M9,
  b as re,
  c as ve,
  d as h4,
  e as Qn,
  f as U0,
  g as Ie,
  h as Sn,
  D as C9,
  i as k9,
  j as u9,
  C as ni,
  k as Ye,
  n as qe,
  o as u4,
  S as oe,
  L as d4,
  F as d9,
  q as g4,
  s as Mn,
  t as Jt,
  u as pe,
  v as T9,
  w as f4,
  N as Ps,
  x as Yi,
  y as Us,
  z as Gs,
  A as kn,
  E as Tn,
  H as Dn,
  I as Ln,
  J as zs,
  K as Ji,
  Q as _s,
  T as $9,
  U as g9,
  X as Rn,
  Y as Fn,
  Z as Nn,
  _ as Pn,
  $ as p4,
  a0 as m4,
  a1 as Os,
  a2 as E1,
  a3 as C1,
  a4 as ne,
  a5 as s0,
  a6 as T0,
  a7 as I4,
  a8 as E4,
  a9 as C4,
  aa as St,
  ab as De,
  ac as Un,
  ad as y4,
  ae as xe,
  af as Gn,
  ag as zn,
  ah as _n,
  ai as w4,
  aj as On,
  O as ri,
  ak as ct,
  al as Y0,
  am as fe,
  an as k0,
  ao as We,
  ap as Ge,
  aq as Hn,
  ar as be,
  as as Mt,
  at as e1,
  au as jn,
  av as O1,
  aw as H1,
  ax as Ki,
  ay as Xi,
  az as qn,
  aA as Wn,
  aB as Vn,
  aC as Yn,
  aD as Jn,
  aE as Kn,
  aF as Xn,
  aG as Zn,
  aH as $n,
  aI as B4,
  aJ as e3,
  aK as x4,
  aL as t3,
  aM as Hs,
  aN as s3,
  aO as i3,
  aP as n3,
  aQ as j1,
  aR as ze,
  aS as Zi,
  aT as q1,
  aU as oi,
  aV as r3,
  aW as me,
  aX as o3,
  aY as a3,
  aZ as l3,
  a_ as it,
  a$ as Ve,
  l as A3,
  b0 as c3,
  r as h3,
  b1 as u3,
  b2 as d3,
  b3 as g3,
  b4 as f3,
  b5 as f9,
  b6 as es,
  b7 as $i,
  b8 as W1,
  b9 as p3,
  ba as e2,
  bb as ts,
  bc as b4,
  bd as t2,
  be as m3,
  bf as y9,
  bg as I3,
  a as w9,
  bh as E3,
  bi as C3,
  bj as y3,
  bk as w3,
  bl as B3,
  bm as v4,
  bn as Q4,
  bo as s2,
  bp as x3,
  W as S4,
  bq as M4,
  br as b3,
  bs as v3,
  bt as Q3,
  bu as ss,
  bv as i2
} from "./portraitLighting.js";
import {
  L as S3
} from "./LiveLookPreview.js";
import {
  x as M3,
  S as k3,
  y as T3
} from "./chatLocal.js";
import {
  z as D3,
  M as L3,
  A as R3,
  B as n2,
  C as F3
} from "./hostStateProtocol.js";
import {
  S as N3
} from "./ScreenPicker.js";


function b6(r, e) {
  r.__hall === e && delete r.__hall
}
const v6 = r => `desk-${r}`;

function Q6(r, e) {
  const t = v6(e);
  return (r || []).find(s => s.sittingSpot === t)
}

function S6(r, e, t) {
  const s = `${r+1} 号工位`,
    i = t ? `${t.name} ${t.atDesk===!1?"正在坐（离开）":"正在坐"}` : "";
  return t && e ? t.clientId === e.id ? {
    label: s,
    sub: i,
    sitter: t.name
  } : {
    label: s,
    sitter: t.name,
    sub: `${i} · 工位属于 ${e.name}${e.online?"（在线）":"（离线）"}`
  } : t ? {
    label: s,
    sub: `${i} · 还没人认领`,
    sitter: t.name
  } : e ? {
    label: s,
    sitter: "",
    sub: `${e.name} · ${e.online?"在线，不在座位":"离线"}`
  } : {
    label: s,
    sub: "空着",
    sitter: ""
  }
}

















const G6 = 5e3,
  z6 = {
    morning: y.jsxs(y.Fragment, {
      children: [y.jsx("circle", {
        cx: "12",
        cy: "12",
        r: "4"
      }), y.jsx("path", {
        d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      })]
    }),
    afternoon: y.jsxs(y.Fragment, {
      children: [y.jsx("path", {
        d: "M4 18h16M7 18a5 5 0 0 1 10 0"
      }), y.jsx("path", {
        d: "M12 7v2M5.6 10.6l1.4 1.4M18.4 10.6 17 12"
      })]
    }),
    night: y.jsx("path", {
      d: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
    }),
    auto: y.jsxs(y.Fragment, {
      children: [y.jsx("circle", {
        cx: "12",
        cy: "12",
        r: "8"
      }), y.jsx("path", {
        d: "M12 7v5l3 2"
      })]
    })
  },
  l4 = {
    morning: "上午",
    afternoon: "下午",
    night: "晚上"
  };

function _6({
  office: r,
  accountId: e,
  appearance: t,
  onAppearance: s,
  onLogout: i,
  update: n
}) {
  const o = _.useRef(null),
    [a, l] = _.useState(null),
    [A, c] = _.useState(!0),
    h = _.useRef(null),
    u = _.useRef(null),
    d = _.useRef(null),
    g = _.useRef(null),
    [p, I] = _.useState({
      pick: "auto",
      name: "morning"
    }),
    [C, E] = _.useState(!1),
    [x, B] = _.useState(!1),
    [b, v] = _.useState(null),
    [L, D] = _.useState(null),
    [P, U] = _.useState(null),
    [R, Q] = _.useState(!1),
    [H, N] = _.useState(C5),
    [G, q] = _.useState(null),
    [j, h0] = _.useState(null),
    [i0, u0] = _.useState(null),
    [W, t0] = _.useState(!1),
    o0 = _.useRef({
      office: r,
      accountId: e,
      moving: W
    });
  o0.current = {
    office: r,
    accountId: e,
    moving: W
  };
  const d0 = r.people.find(F => F.id === r.myId),
    Re = r.seats.findIndex(F => (F == null ? void 0 : F.id) === e),
    Z = (d0 == null ? void 0 : d0.seat) ?? (Re >= 0 ? Re : null),
    le = (d0 == null ? void 0 : d0.role) === "visitor";
  _.useEffect(() => {
    var V, p0;
    if (!((V = window.officeDesktop) != null && V.mainWindowVisible) || !((p0 = window.officeDesktop) != null && p0.onMainWindowVisibility)) return;
    let F, z = !0;
    const a0 = observeHallVisibility(document, window, A0 => {
      if (z = A0, clearTimeout(F), A0) {
        c(!0);
        return
      }
      F = setTimeout(() => {
        var C0;
        if (z || !o0.current.office.connected) return;
        const Q0 = (C0 = h.current) == null ? void 0 : C0.snapshotForSleep();
        Q0 && (u.current = Q0, c(!1))
      }, G6)
    });
    return () => {
      clearTimeout(F), a0()
    }
  }, []);

  function H0(F) {
    var V;
    if (!F || !F.world || !F.actor || h.current !== F.scene) return;
    const z = (V = F.snapshot.actor) == null ? void 0 : V.sittingSpot,
      a0 = o0.current.office.people.find(p0 => p0.id === o0.current.office.myId);
    z && (a0 == null ? void 0 : a0.sittingSpot) === z && F.scene.sitMeAt(z)
  }
  _.useEffect(() => {
    if (!A) {
      l(null);
      return
    }
    const F = new x6(o.current);
    h.current = F;
    const z = u.current;
    u.current = null, z && F.restoreSleepSnapshot(z);
    const a0 = z ? {
      scene: F,
      snapshot: z,
      world: !1,
      actor: !z.actor
    } : null;
    g.current = a0;
    const V = n0 => {
        d.current = n0, F.shellRemoval.sync(n0.removedShell || []), F.setParts(n0.parts, n0.models, n0.revision)
      },
      p0 = new yo(V);
    let A0 = !1,
      Q0 = !1;
    const C0 = () => {
      A0 || Q0 || (Q0 = !0, F.attachBuild(p0, () => o0.current.accountId))
    };
    return d.current && (V(d.current), C0(), a0 && (a0.world = !0, H0(a0))), p0.load().catch(() => {}).finally(() => {
      A0 || (C0(), p0.follow(), a0 && (a0.world = !0, H0(a0)))
    }), F.onNotice = n0 => q({
      text: n0,
      key: Date.now()
    }), F.onHover = h0, F.onCatClick = () => B(!0), F.onBilliardsClick = v, F.onBuildChange = E, F.onMotion = n0 => o0.current.office.reportMotion(n0), F.onSit = n0 => o0.current.office.sitSpot(n0), F.ownerOf = n0 => {
      const {
        office: R0,
        accountId: Ee
      } = o0.current, Ae = R0.seats[n0];
      if (!Ae) return null;
      const $0 = R0.people.find(y0 => y0.seat === n0);
      return {
        name: Ae.name,
        mine: Ae.id === Ee,
        preview: $0 && R0.previews[$0.id] || "",
        atDesk: !!($0 && $0.atDesk !== !1)
      }
    }, F.onOfferClaim = n0 => {
      const {
        office: R0,
        accountId: Ee,
        moving: Ae
      } = o0.current;
      (!R0.seats.some(y0 => (y0 == null ? void 0 : y0.id) === Ee) || Ae) && u0(n0)
    }, l(F), window.__hall = F, () => {
      var R0;
      A0 = !0, p0.stop(), b6(window, F), h.current === F && (h.current = null), ((R0 = g.current) == null ? void 0 : R0.scene) === F && (g.current = null), F.dispose()
    }
  }, [A]), _.useEffect(() => {
    a && r.cat && a.cat.set(r.cat)
  }, [a, r.cat]), _.useEffect(() => {
    if (!a) return;
    const F = () => a.setBilliardsStates(r.billiards.states());
    return F(), r.billiards.subscribe(F)
  }, [a, r.billiards]), _.useEffect(() => {
    if (!a || !r.catSpeech) return;
    let F = 0;
    const z = performance.now() + 4500,
      a0 = () => {
        if (performance.now() > z) {
          D(null);
          return
        }
        const V = a.cat.root.position.clone();
        V.y += .9, V.project(a.camera), D(Math.abs(V.x) > 1 || Math.abs(V.y) > 1 ? null : {
          text: r.catSpeech.text,
          x: (V.x + 1) * a.host.clientWidth / 2,
          y: (1 - V.y) * a.host.clientHeight / 2
        }), F = requestAnimationFrame(a0)
      };
    return a0(), () => cancelAnimationFrame(F)
  }, [a, r.catSpeech]);
  const Z0 = _.useRef(!1);
  _.useEffect(() => {
    var a0;
    if (!a || !r.myId) return;
    const F = ((a0 = g.current) == null ? void 0 : a0.scene) === a ? g.current : null,
      z = F && !F.actor ? F.snapshot.actor : null;
    a.setMe(r.myId, t, z || void 0).then(V => {
      if (F && z && h.current === a && !F.actor && (V.holder.rotation.y = z.rotation, F.actor = !0, H0(F)), Z0.current || !a.me || !o0.current.office.people.some(C0 => C0.id === o0.current.office.myId)) return;
      Z0.current = !0;
      const p0 = o0.current.office,
        A0 = p0.people.find(C0 => C0.id === p0.myId),
        Q0 = A0.seat ?? p0.seats.findIndex(C0 => (C0 == null ? void 0 : C0.id) === o0.current.accountId);
      if (A0.sittingSpot) a.sitMeAt(A0.sittingSpot);
      else if (Q0 >= 0) {
        let C0 = 0;
        const n0 = () => {
          h.current === a && (a.seats().some(R0 => R0.workstation === Q0) ? a.goToDesk(Q0) : ++C0 < 40 && setTimeout(n0, 250))
        };
        setTimeout(n0, 400)
      } else A0.role !== "visitor" && q({
        text: "点一张没人用的工位坐下，就能把它设为你的工位",
        key: Date.now()
      })
    })
  }, [a, r.myId, t, !!d0, Z]), _.useEffect(() => {
    a && (d0 != null && d0.sittingSpot) && a.sitMeAt(d0.sittingSpot)
  }, [a, d0 == null ? void 0 : d0.sittingSpot]), _.useEffect(() => {
    a == null || a.setPeople(r.people.filter(F => F.id !== r.myId).map(F => ({
      id: F.id,
      name: F.name,
      appearance: F.appearance,
      seat: F.seat,
      sittingSpot: F.sittingSpot ?? void 0,
      atDesk: F.atDesk
    })))
  }, [a, r.people, r.myId]);
  const j0 = _.useRef(new Map);
  _.useEffect(() => {
    j0.current.clear()
  }, [a]), _.useEffect(() => {
    if (a)
      for (const [F, z] of Object.entries(r.motions)) F === r.myId || j0.current.get(F) === z || (j0.current.set(F, z), a.remoteMotion(F, z))
  }, [a, r.motions, r.myId]), _.useEffect(() => {
    a && (a.paused = R)
  }, [a, R]), _.useEffect(() => {
    const F = z => {
      var a0, V, p0;
      (V = (a0 = z.target) == null ? void 0 : a0.closest) != null && V.call(a0, "input, textarea, select") || z.ctrlKey || z.metaKey || z.altKey || !a || (z.key === "t" || z.key === "T" ? (p0 = a.build) != null && p0.active || Je() : z.key === "," && U(A0 => A0 ? null : "look"))
    };
    return window.addEventListener("keydown", F), () => window.removeEventListener("keydown", F)
  });

  function Je() {
    if (!a) return;
    const F = a.cycleTime();
    I({
      pick: a.timePick,
      name: F
    })
  }
  _.useEffect(() => {
    a && I({
      pick: a.timePick,
      name: a.timeName()
    })
  }, [a]), _.useEffect(() => {
    if (!G) return;
    const F = setTimeout(() => q(null), 5e3);
    return () => clearTimeout(F)
  }, [G]), _.useEffect(() => {
    r.notice && q({
      text: r.notice,
      key: Date.now()
    })
  }, [r.notice]);
  async function gt(F) {
    u0(null);
    const z = await r.claimSeat(F);
    z || q({
      text: "刚被别人占了，换一张吧",
      key: Date.now()
    }), z && t0(!1)
  }
  const z0 = j && (j.id === r.myId || j.id === e ? d0 : r.people.find(F => F.id === j.id)),
    Ke = p.pick === "auto" ? `跟随真实时间 · 现在${l4[p.name]}` : l4[p.name];
  return y.jsxs("div", {
    className: "hall-view",
    ref: o,
    children: [b && a && y.jsx(G3, {
      tableId: b,
      hall: a,
      client: r.billiards,
      myId: r.myId,
      online: r.connected,
      onClose: () => v(null)
    }, b), L && y.jsx("div", {
      className: "cat-bubble",
      role: "status",
      style: {
        left: L.x,
        top: L.y
      },
      children: L.text
    }), x && y.jsx(P3, {
      onClose: () => B(!1),
      interact: r.interactCat
    }), R && y.jsxs("div", {
      className: "hall-paused",
      children: [y.jsx("p", {
        children: "3D 画面已暂停"
      }), y.jsx("button", {
        type: "button",
        onClick: () => Q(!1),
        children: "继续"
      })]
    }), z0 && j && y.jsxs("div", {
      className: "hall-tag",
      style: {
        left: j.x,
        top: j.y
      },
      children: [z0.name, z0.id === r.myId && y.jsx("small", {
        children: "我"
      }), z0.id !== r.myId && y.jsx("small", {
        children: z0.meeting ? "在开会" : z0.inCall ? "在通话" : z0.atDesk === !1 ? "暂时离开" : z0.seat !== null ? "在工位" : ""
      })]
    }), G && !C && y.jsx("div", {
      className: "hall-ticker",
      role: "status",
      children: G.text
    }, G.key), i0 !== null && y.jsxs("div", {
      className: "hall-claim",
      role: "dialog",
      "aria-label": "认领工位",
      children: [y.jsx("strong", {
        children: Z === null ? "这张桌子还没人用" : "换到这张桌子？"
      }), y.jsx("small", {
        children: Z === null ? "设为你的工位后会一直给你留着，桌上的屏幕显示你的工作画面" : "原来的工位会空出来给别人"
      }), y.jsxs("div", {
        children: [y.jsx("button", {
          type: "button",
          onClick: () => u0(null),
          children: "先不用"
        }), y.jsx("button", {
          type: "button",
          className: "go",
          onClick: () => void gt(i0),
          children: Z === null ? "设为我的工位" : "换到这里"
        })]
      })]
    }), y.jsxs("div", {
      className: "hall-ctl",
      children: [y.jsxs("button", {
        type: "button",
        className: "cb",
        "aria-label": "时间",
        onClick: Je,
        children: [y.jsx("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.8",
          children: z6[p.pick === "auto" ? "auto" : p.name]
        }), y.jsxs("span", {
          className: "tip",
          children: [Ke, y.jsx("kbd", {
            children: "T"
          })]
        })]
      }), y.jsxs("button", {
        type: "button",
        className: "cb",
        "aria-label": "视角回正",
        onClick: () => a == null ? void 0 : a.home(),
        children: [y.jsx("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.8",
          children: y.jsx("path", {
            d: "M4 11 12 4l8 7M6 10v9h12v-9"
          })
        }), y.jsxs("span", {
          className: "tip",
          children: ["视角回正", y.jsx("kbd", {
            children: "Home"
          })]
        })]
      }), y.jsxs("button", {
        type: "button",
        className: "cb",
        "aria-label": "设置",
        "aria-pressed": !!P,
        onClick: () => U(F => F ? null : "look"),
        children: [y.jsxs("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.8",
          children: [y.jsx("circle", {
            cx: "12",
            cy: "12",
            r: "3"
          }), y.jsx("path", {
            d: "M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
          })]
        }), y.jsxs("span", {
          className: "tip",
          children: ["设置", y.jsx("kbd", {
            children: ","
          })]
        })]
      }), y.jsxs("button", {
        type: "button",
        className: "cb",
        "aria-label": "装修",
        "aria-pressed": C,
        onClick: () => a == null ? void 0 : a.toggleBuild(),
        children: [y.jsx("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.8",
          children: y.jsx("path", {
            d: "M14 4l6 6-3 3-6-6zM11 7 3 15l3 3 8-8"
          })
        }), y.jsxs("span", {
          className: "tip",
          children: ["装修", y.jsx("kbd", {
            children: "Tab"
          })]
        })]
      })]
    }), P && y.jsx(T6, {
      page: P,
      onPage: U,
      onClose: () => U(null),
      office: r,
      appearance: t,
      onAppearance: s,
      mySeat: Z,
      isVisitor: le,
      paused: R,
      onPaused: Q,
      timeTip: Ke,
      onTime: Je,
      update: n,
      onLogout: i,
      quality: H,
      onQuality: F => {
        N(F), a == null || a.setRenderQuality(F)
      },
      onGoToDesk: () => {
        U(null), Z !== null && (a == null || a.goToDesk(Z))
      },
      onMove: () => {
        U(null), t0(!0), q({
          text: Z === null ? "在大厅里点一张空着的工位坐下，就能设为你的" : "在大厅里点一张空着的工位坐下，就能换过去",
          key: Date.now()
        })
      }
    })]
  })
}
const Z6 = Object.freeze(Object.defineProperty({
  __proto__: null,
  default: _6
}, Symbol.toStringTag, {
  value: "Module"
}));
export {
  U3 as B, Z6 as H, x0 as T, K6 as a, X6 as b, J6 as c
};
export { Q6, S6 };
