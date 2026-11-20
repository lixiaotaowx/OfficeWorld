// Dock root component (Vn): the floating dock bar, chat/call popovers, screen
// share viewer, person menu and drag-drop wiring. Single large component kept
// verbatim; recovered from chunks/dock.js.
import { r as u, l as Gt, g as pt, h as Yt, P as ie, c as Le, k as Zt, j as e, M as Jt } from '../chunks/dockGreeting.js';
import { EMPTY_DOCK_STATE as Wn, PREVIEW_REFRESH_MS as _n, PREVIEW_TIMEOUT_MS as Un, sendDockAction as G, pickMissedThread as zn, unreadThreadKey as st, GreetingAvatarMount as On, DockRadar as Pn } from './dockShared.js';
import { measureDockWindow as kt, useDockHover as sn, collectDroppedFiles as Dt, describeDragSelection as Lt, clampPanelLeft as nn, clampPanelHeight as tn, computePanelBottom as en, observeDockRects as Qt } from './dockGeometry.js';
import { M as Mt, D as Et } from '../chunks/chatLocal.js';
import { Bn, Tt, xn, An, Tn } from '../chunks/dock.js';
import { readAvatarAppearance as Ye } from './dockAvatarArt.js';
import { PersonChip as hn, RoundTableChip as mn } from './dockAvatarCanvas.js';
import { $n } from './dockChatPanel.js';
import { ScreenViewer as wt, ScreenShareButton as At } from './dockScreenViewer.js';
import { CallCard as Rn } from './dockCallPanels.js';

function Vn() {
  var at, it, ot, ct, lt, dt, ut, ft, ht, mt;
  const [t, s] = u.useState(null);
  u.useEffect(() => {
    var v, M;
    const a = z => {
        z.id && z.mode !== "call" && s({
          ...z,
          at: Date.now()
        })
      },
      x = (M = (v = window.officeDock) == null ? void 0 : v.onGreet) == null ? void 0 : M.call(v, a),
      y = Gt(a);
    return () => {
      x == null || x(), y()
    }
  }, []);
  const [n, c] = u.useState(Wn), [r, i] = u.useState(null), [o, d] = u.useState(null);
  u.useEffect(() => {
    var a;
    o && ((a = document.querySelector(".dk-person-menu button:not(:disabled)")) == null || a.focus())
  }, [o]);
  const [m, h] = u.useState(), [k, f] = u.useState(!1), [b, g] = u.useState(!1), [R, N] = u.useState(() => kt(window.screen.availWidth, window.screen.availHeight));
  u.useEffect(() => {
    const a = () => N(x => {
      const y = kt(window.screen.availWidth, window.screen.availHeight);
      return y.width === x.width && y.height === x.height ? x : y
    });
    return window.addEventListener("resize", a), () => window.removeEventListener("resize", a)
  }, []);
  const [C, I] = u.useState({}), [j, _] = u.useState(!1), [V, W] = u.useState(""), [T, D] = u.useState(""), [w, E] = u.useState(Date.now()), [L, U] = u.useState({}), K = u.useRef(""), p = u.useRef(), {
    hovered: $,
    open: S,
    focus: O,
    close: F,
    scheduleClose: oe
  } = sn(r !== null), q = u.useCallback(a => {
    W(a), clearTimeout(p.current), p.current = setTimeout(() => W(""), 3600)
  }, []);
  u.useEffect(() => {
    var z, te, X;
    const a = window.officeDock;
    if (!a) return;
    let x = !0,
      y = !1;
    (z = a.state) == null || z.call(a).then(me => {
      x && !y && me && c(xe => pt(xe, me))
    }).catch(() => {});
    const v = (te = a.onState) == null ? void 0 : te.call(a, me => {
        y = !0, c(xe => pt(xe, me))
      }),
      M = (X = a.onPreview) == null ? void 0 : X.call(a, ({
        id: me,
        image: xe
      }) => {
        me && xe && I(Be => ({
          ...Be,
          [me]: xe
        }))
      });
    return () => {
      x = !1, v == null || v(), M == null || M()
    }
  }, []), u.useEffect(() => {
    const a = setInterval(() => E(Date.now()), 1e3);
    return () => clearInterval(a)
  }, []), u.useEffect(() => {
    if (!$) {
      _(!1);
      return
    }
    const a = () => {
      var v, M;
      return (M = (v = window.officeDock) == null ? void 0 : v.requestPreview) == null ? void 0 : M.call(v, $)
    };
    a(), _(!0);
    const x = setInterval(a, _n),
      y = setTimeout(() => _(!1), Un);
    return () => {
      var v, M;
      clearInterval(x), clearTimeout(y), (M = (v = window.officeDock) == null ? void 0 : v.requestPreview) == null || M.call(v, "")
    }
  }, [$]);
  const ne = u.useMemo(() => [...n.people].sort((a, x) => +!!x.self - +!!a.self || a.name.localeCompare(x.name, "zh")), [n.people]),
    se = ne.find(a => a.self) || null,
    ve = n.huddles || [],
    Y = (at = n.meeting) != null && at.active && ve.find(a => {
      var x;
      return a.id === ((x = n.meeting) == null ? void 0 : x.id)
    }) || null,
    Pe = a => ve.some(x => x.members.some(y => y.id === a.account)),
    Re = a => {
      var x;
      return Pe(a) || a.inCall || a.self === !0 && ((x = n.meeting) == null ? void 0 : x.active) === !0
    },
    ye = ne.filter(a => !a.self && a.atDesk && !ve.some(x => [...x.members, ...x.ringing].some(y => y.id === a.account))),
    Te = a => ne.find(x => x.id === a) || null,
    de = u.useRef(new Set),
    Ce = a => {
      var y;
      const x = (y = n.screens) == null ? void 0 : y.find(v => v.id === a || v.personId === a);
      if (!x) {
        n.screens ? q("正在等待共享画面…") : G("meeting-view", a);
        return
      }
      F(), g(!1), i({
        kind: "screen",
        id: x.id,
        anchor: x.personId
      })
    };
  u.useLayoutEffect(() => {
    const a = n.screens || [],
      x = M => `${M.id}:${M.sessionId}:${M.streamId}`,
      y = new Set(a.map(x)),
      v = a.find(M => M.own && !de.current.has(x(M))) || a.find(M => !de.current.has(x(M)));
    de.current = y, v ? (g(!1), i({
      kind: "screen",
      id: v.id,
      anchor: v.personId
    }), F()) : (r == null ? void 0 : r.kind) === "screen" && !a.some(M => M.id === r.id) && i(null)
  }, [JSON.stringify(n.screens)]);
  const Z = u.useMemo(() => {
      var y, v, M;
      const a = (y = n.privateCalls) == null ? void 0 : y.invitations[0];
      if (a) return {
        id: a.id,
        personId: a.personId,
        name: a.name,
        meeting: !1,
        text: a.kind === "voice" ? "想和你说话" : a.offer ? "想给你看他的屏幕" : "想看你的屏幕"
      };
      const x = (M = (v = n.meeting) == null ? void 0 : v.invitations) == null ? void 0 : M[0];
      return x ? {
        id: x.id,
        personId: x.personId,
        name: x.name,
        meeting: !0,
        text: "拉你进来聊"
      } : null
    }, [n.privateCalls, (it = n.meeting) == null ? void 0 : it.invitations]),
    Ae = a => {
      var x, y, v, M;
      Z && ((Z.meeting ? (x = n.meeting) != null && x.busy : (y = n.privateCalls) != null && y.busy) || (Z.meeting ? G(a ? "meeting-accept" : "meeting-decline", Z.id) : (M = (v = window.officeDock) == null ? void 0 : v.answer) == null || M.call(v, Z.id, a), a || q(`${Z.name}那边会看到“稍后”`)))
    },
    Q = zn(n, (r == null ? void 0 : r.kind) === "chat" ? r.convo : "", L),
    re = Yt(t, w) ? t : null,
    ce = Z ? ne.find(a => a.id === Z.personId || a.account === Z.personId) : Q ? ne.find(a => (a.account || a.id) === (Q.lastFrom || Q.id)) : re ? ne.find(a => a.id === re.id || a.account === re.id) : null,
    pe = (ce == null ? void 0 : ce.id) || "table",
    ue = !!(Z || Q || re);
  u.useEffect(() => {
    var a;
    (r == null ? void 0 : r.kind) === "call" && !((a = n.meeting) != null && a.active) && i(null)
  }, [r == null ? void 0 : r.kind, (ot = n.meeting) == null ? void 0 : ot.active]), u.useEffect(() => {
    n.hidden && i(null)
  }, [n.hidden]), u.useEffect(() => {
    const a = x => {
      if (x.key === "Escape") {
        if (o) {
          d(null);
          return
        }
        i(null), F()
      }
    };
    return document.addEventListener("keydown", a), () => document.removeEventListener("keydown", a)
  }, [F, o]), u.useEffect(() => {
    const a = () => {
        d(null), i(null), F()
      },
      x = v => {
        var M, z, te, X;
        o && !((z = (M = v.target).closest) != null && z.call(M, ".dk-person-menu")) && d(null), (X = (te = v.target).closest) != null && X.call(te, ".dock-card, .dk-frame, .dk-bubble, .dk-table") || a()
      };
    document.addEventListener("pointerdown", x);
    const y = () => {
      F()
    };
    return window.addEventListener("blur", y), () => {
      document.removeEventListener("pointerdown", x), window.removeEventListener("blur", y)
    }
  }, [F, r == null ? void 0 : r.kind, o]);
  const ze = a => {
      var y, v, M;
      if (d(null), F(), Z && (Z.personId === a.id || Z.personId === a.account)) {
        Ae(!0);
        return
      }
      if (a.self) {
        const z = ((y = n.screens) == null ? void 0 : y.find(te => te.own)) || ((v = n.screens) == null ? void 0 : v[0]);
        if (z) {
          Ce(z.id);
          return
        }
        if ((M = n.meeting) != null && M.active) {
          i({
            kind: "call",
            anchor: a.id
          });
          return
        }
        i(null), G("focus", a.id);
        return
      }
      const x = a.account || a.id;
      i({
        kind: "chat",
        convo: x,
        anchor: a.id
      })
    },
    Ee = () => {
      if (F(), !se) {
        q("还没连上，正在连接…");
        return
      }
      if (se.role === "visitor") {
        q("访客不能进入群聊，可以点头像私聊");
        return
      }
      i({
        kind: "chat",
        convo: ie,
        anchor: "table"
      })
    },
    Me = a => {
      var y;
      const x = (y = n.screens) == null ? void 0 : y.find(v => v.personId === a.id);
      if (x) {
        Ce(x.id);
        return
      }
      if (Y != null && Y.members.some(v => v.id === a.account)) {
        i({
          kind: "call",
          anchor: "huddle:" + Y.id
        });
        return
      }
      G("huddle-start", "", {
        ids: [a.account || ""]
      }), q(`在叫${a.name}…`)
    },
    Fe = a => {
      var x;
      return Array.from(((x = a.dataTransfer) == null ? void 0 : x.types) || []).includes("Files")
    },
    Oe = async a => {
      const x = se == null ? void 0 : se.account,
        y = a.filter(v => v.size > 0 && v.name.length <= 200);
      if (!y.length) {
        q("没有可发送的文件");
        return
      }
      if (!x) {
        q("请登录后再发送附件");
        return
      }
      if ((se == null ? void 0 : se.role) === "visitor") {
        q("访客不能进入群聊，可以点头像私聊");
        return
      }
      q(`正在发到群里 · ${y.length>1?y.length+" 个文件":y[0].name}`);
      try {
        for (const v of y) {
          let M = -1;
          await Le({
            kind: "upload",
            account: x,
            conversation: ie,
            file: v
          }, z => {
            z < 0 || (z === 100 || z >= M + 20) && (M = z, q(`正在发到群里 · ${z}%`))
          })
        }
        q("已发到群里")
      } catch (v) {
        q(v instanceof Error ? v.message : "发到群里失败，再试一次")
      }
    }, We = async (a, x) => {
      const y = se == null ? void 0 : se.account,
        v = a.account || a.id,
        M = x.filter(z => z.size > 0 && z.size <= Mt && z.name.length <= 200);
      if (!M.length) {
        q("没有可发送的文件");
        return
      }
      if (!y) {
        q("请登录后再发送附件");
        return
      }
      q(`正在发给${a.name} · ${M.length>1?M.length+" 个文件":M[0].name}`);
      try {
        for (const z of M) {
          let te = -1;
          await Le({
            kind: "upload",
            account: y,
            conversation: v,
            file: z
          }, X => {
            X < 0 || (X === 100 || X >= te + 20) && (te = X, q(`正在发给${a.name} · ${X}%`))
          })
        }
        q(`已发给${a.name}`), i({
          kind: "chat",
          convo: v,
          anchor: a.id
        })
      } catch (z) {
        q(z instanceof Error ? z.message : `发给${a.name}失败，再试一次`)
      }
    }, Se = (a, x, y) => ({
      onDragOver: v => {
        if (Fe(v) && (y || a === "table")) {
          v.preventDefault(), v.dataTransfer.dropEffect = "copy", D(a);
          return
        }
        K.current && K.current !== (y == null ? void 0 : y.id) && (v.preventDefault(), D(a))
      },
      onDragLeave: () => D(v => v === a ? "" : v),
      onDrop: v => {
        if (v.preventDefault(), D(""), Fe(v)) {
          const z = Dt(v.dataTransfer),
            te = Lt(z);
          te && q(te);
          const X = z.files;
          if (!X.length) return;
          if (!y) {
            if (a === "table") {
              Oe(X);
              return
            }
            q("文件请拖到某个人的头像或圆桌上");
            return
          }
          if (y.self) {
            q("这是你自己");
            return
          }
          We(y, X);
          return
        }
        const M = K.current;
        K.current = "", M && x(M)
      }
    }), Ne = (...a) => a.map(x => {
      var y;
      return ((y = Te(x)) == null ? void 0 : y.account) || ""
    }).filter(Boolean), fe = u.useRef(null), [he, _e] = u.useState({}), l = a => {
      var M, z;
      const x = (M = fe.current) == null ? void 0 : M.querySelector(a === "table" ? '[data-id="table"]' : a.startsWith("huddle:") ? `[data-huddle="${a.slice(7)}"]` : `[data-person-id="${a}"]`),
        y = x == null ? void 0 : x.getBoundingClientRect(),
        v = (z = fe.current) == null ? void 0 : z.getBoundingClientRect();
      return y && v ? y.left + y.width / 2 - v.left : 0
    }, A = (r == null ? void 0 : r.kind) === "screen" && b ? R.width : (r == null ? void 0 : r.kind) === "chat" && k ? 660 : r ? 340 : 0;
  u.useLayoutEffect(() => {
    const a = () => {
      var M;
      const y = (M = fe.current) == null ? void 0 : M.getBoundingClientRect();
      if (!y) return;
      const v = (z, te) => nn(y.left + l(z), te, window.innerWidth);
      _e({
        fly: r ? v(r.anchor, A) : 0,
        tip: r ? y.left + l(r.anchor) : 0,
        peek: $ ? v($, 256) : 0,
        ring: ue ? v(pe, tn(window.innerWidth)) : 0,
        personMenu: o ? v(o.id, 260) : 0,
        radar: Z ? l(pe) : 0
      })
    };
    a();
    const x = new ResizeObserver(a);
    return fe.current && x.observe(fe.current), window.addEventListener("resize", a), () => {
      x.disconnect(), window.removeEventListener("resize", a)
    }
  }, [r, $, pe, ue, A, ne.length, ve.length, n.stripHeight, n.popup, o]);
  const B = u.useRef({
    open: !1,
    cardWidth: 0
  });
  B.current = {
    open: !!(r || $ || ue || V || o),
    cardWidth: en(A, ue || !!o)
  };
  const P = u.useRef("");
  if (u.useEffect(() => Qt(a => {
      var X, me, xe;
      const x = fe.current,
        y = x ? Math.ceil(x.getBoundingClientRect().width) : 0,
        v = Math.max(0, ...[...document.querySelectorAll(".dk-pops > *, .dk-radar-at")].map(Be => Be.getBoundingClientRect().height)),
        M = v ? Math.min(700, Math.ceil(v + 18)) : 0,
        z = {
          expanded: B.current.open,
          cardPx: M,
          cardWidth: B.current.cardWidth,
          stage: !1,
          stageMode: "",
          stagePx: 0,
          width: y,
          hitRegions: a.map(({
            x: Be,
            y: Pt,
            width: zt,
            height: Ft
          }) => ({
            x: Be,
            y: Pt,
            width: zt,
            height: Ft
          }))
        },
        te = JSON.stringify(z);
      te !== P.current && (P.current = te, (xe = (me = (X = window.officeDock) == null ? void 0 : X.layout) == null ? void 0 : me.call(X, z)) == null || xe.catch(() => {
        P.current = ""
      }))
    }), []), n.hidden) return null;
  const J = Zt(n.theme),
    le = $ ? Te($) : null,
    ge = (r == null ? void 0 : r.kind) === "chat" && r.convo !== ie && ne.find(a => (a.account || a.id) === r.convo) || null,
    ee = (ct = n.screens) == null ? void 0 : ct.find(a => (r == null ? void 0 : r.kind) === "screen" ? a.id === r.id : ge && a.personId === ge.id),
    Bt = (((dt = (lt = n.chat) == null ? void 0 : lt.threads.find(a => a.id === ie)) == null ? void 0 : dt.unread) || 0) > 0,
    je = (n.transfers || [])[0],
    Ze = Z ? e.jsx(Bn, {
      call: Z,
      person: ce,
      busy: Z.meeting ? (ut = n.meeting) == null ? void 0 : ut.busy : (ft = n.privateCalls) == null ? void 0 : ft.busy,
      onAnswer: Ae
    }, Z.id) : Q ? e.jsx(Tt, {
      name: Q.lastName || Q.name,
      text: Q.id === ie ? `群聊有 ${Q.unread} 条未读消息` : `发来了 ${Q.unread} 条消息`,
      person: ce,
      showAvatar: !1,
      action: "查看消息",
      onAccept: () => {
        F(), i({
          kind: "chat",
          convo: Q.id,
          anchor: Q.id === ie ? "table" : pe
        })
      },
      onDismiss: () => U(a => ({
        ...a,
        [Q.id]: st(Q)
      }))
    }, st(Q)) : re ? e.jsx("div", {
      className: "dk-greeting",
      role: "status",
      "aria-label": `${re.name||(ce==null?void 0:ce.name)||"同事"}正在看你的屏幕`,
      children: e.jsx(u.Suspense, {
        fallback: e.jsx("div", {
          className: "dk-greeting-avatar"
        }),
        children: e.jsx(On, {
          appearance: re.appearance || (ce ? Ye(ce) : Et)
        }, re.id)
      })
    }) : null;
  return e.jsxs("div", {
    ref: fe,
    className: ["dock", "dk", n.edge === "top" ? "edge-top" : "", n.popup === "right" ? "popup-right" : ""].filter(Boolean).join(" "),
    role: "toolbar",
    "aria-label": "同事头像条",
    "data-theme": (ht = n.theme) != null && ht.light ? "light" : "dark",
    style: {
      "--dock-h": `${n.stripHeight||40}px`,
      "--dk-frame": J.background,
      "--dk-line": J.border,
      "--dk-accent": ((mt = n.theme) == null ? void 0 : mt.accent) || "transparent"
    },
    children: [e.jsxs("div", {
      className: "dk-frame",
      children: [ne.length === 0 && e.jsx("span", {
        className: "dk-empty",
        children: n.connected === !0 ? "还没人上线" : "正在连接…"
      }), ne.map((a, x) => e.jsxs("span", {
        className: "dk-slot",
        children: [x === 1 && e.jsx("span", {
          className: "dk-sep",
          "aria-hidden": "true"
        }), e.jsx(hn, {
          person: a,
          turned: Re(a),
          inMine: !!(Y != null && Y.members.some(y => y.id === a.account)),
          active: ((r == null ? void 0 : r.kind) === "chat" || (r == null ? void 0 : r.kind) === "me") && r.anchor === a.id,
          dropping: T === a.id,
          onContextMenu: y => {
            y.preventDefault(), F(), a.self ? (d(null), i({
              kind: "me",
              anchor: a.id,
              quick: !0
            })) : d(a)
          },
          onClick: () => ze(a),
          onEnter: () => {
            !a.self && !r && !ue && !o && S(a.id, !0)
          },
          onLeave: oe,
          onKeyboardFocus: () => {
            !a.self && !r && !ue && !o && O(a.id)
          },
          drag: {
            onDragStart: y => {
              if (a.self) {
                y.preventDefault();
                return
              }
              K.current = a.id, F(), y.dataTransfer.setData("text/x-person", a.id)
            },
            onDragEnd: () => {
              K.current = "", D("")
            },
            ...Se(a.id, y => G("huddle-start", "", {
              ids: Ne(...a.self ? [y] : [a.id, y])
            }), a)
          }
        })]
      }, a.id))]
    }), e.jsxs("div", {
      className: "dk-zone",
      children: [e.jsx(mn, {
        people: ne,
        unread: Bt,
        active: (r == null ? void 0 : r.kind) === "chat" && r.convo === ie,
        dropping: T === "table",
        onClick: Ee,
        drag: Se("table", a => G("huddle-start", "", {
          ids: Ne(a)
        }))
      }), ve.map(a => e.jsx(xn, {
        huddle: a,
        people: ne,
        mine: a.id === (Y == null ? void 0 : Y.id),
        now: w,
        onClick: () => {
          a.id === (Y == null ? void 0 : Y.id) ? i(x => (x == null ? void 0 : x.kind) === "call" ? null : {
            kind: "call",
            anchor: "huddle:" + a.id
          }) : (G("huddle-join", a.id), q(`你加入了。${a.members.map(x=>x.name).join("和")}那边听到一声轻提示`))
        },
        drag: Se("huddle:" + a.id, x => G(a.id === (Y == null ? void 0 : Y.id) ? "huddle-invite" : "huddle-start", "", {
          ids: Ne(x)
        }))
      }, a.id)), je && e.jsx("span", {
        className: "dk-progress" + (je.failed ? " failed" : je.done ? " done" : ""),
        role: "progressbar",
        "aria-label": `${je.direction==="receive"?"正在接收":"正在发送"} ${je.name}`,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": Math.round(je.percent * 100),
        children: e.jsx("i", {
          style: {
            width: `${Math.max(3,Math.round(je.percent*100))}%`
          }
        })
      })]
    }), Z && e.jsx("span", {
      className: "dk-radar-at",
      style: {
        left: he.radar
      },
      children: e.jsx(Pn, {})
    }), e.jsxs("div", {
      className: "dk-pops",
      children: [V && e.jsx("div", {
        className: "dock-card dk-note",
        role: "status",
        children: V
      }), Ze && !r && e.jsx("div", {
        className: "dk-at",
        style: {
          left: he.ring
        },
        children: Ze
      }), le && !r && !ue && e.jsx("div", {
        className: "dk-at",
        style: {
          left: he.peek
        },
        onMouseEnter: () => S(le.id),
        onMouseLeave: oe,
        children: e.jsx(An, {
          person: le,
          image: C[le.id] || "",
          waiting: j
        })
      }), r && e.jsxs("div", {
        className: "dk-at dk-open-stack",
        style: {
          left: he.fly
        },
        children: [Ze, r.kind === "chat" && e.jsx($n, {
          state: n,
          convo: r.convo,
          person: ge,
          big: k,
          free: ye,
          media: ee && e.jsx(wt, {
            screen: ee,
            state: n,
            compact: !k
          }, ee.id),
          inCallWith: !!(ge && (Y != null && Y.members.some(a => a.id === ge.account))),
          meeting: !!(ge && Re(ge)),
          mention: m,
          onMentionUsed: () => h(void 0),
          onPersonMenu: d,
          onBig: () => f(a => !a),
          onClose: () => i(null),
          onCall: () => ge && Me(ge),
          notice: q,
          onSwitch: a => {
            var x;
            return i({
              kind: "chat",
              convo: a,
              anchor: a === ie ? "table" : ((x = ne.find(y => y.account === a)) == null ? void 0 : x.id) || r.anchor
            })
          }
        }), r.kind === "call" && e.jsx(Rn, {
          state: n,
          huddle: Y,
          people: ne,
          free: ye,
          onView: Ce,
          onClose: () => i(null)
        }), r.kind === "screen" && ee && e.jsxs("section", {
          className: "dock-card dk-screen-fly" + (b ? " big" : ""),
          role: "dialog",
          "aria-label": ee.name,
          style: {
            "--dk-screen-width": `${R.width}px`,
            "--dk-screen-height": `${R.height}px`
          },
          children: [e.jsxs("header", {
            children: [e.jsx("strong", {
              title: ee.name,
              children: ee.name
            }), !b && e.jsx(At, {
              screen: ee,
              state: n,
              className: "dk-screen-share"
            }), !b && e.jsx("button", {
              type: "button",
              className: "dk-screen-share dk-screen-hangup",
              disabled: ee.busy,
              "aria-label": ee.meeting ? "离开通话" : "挂断",
              title: ee.meeting ? "离开通话" : "挂断",
              onClick: () => G("screen-control", ee.id, {
                text: "end"
              }),
              children: "挂断"
            }), b && !ee.own && e.jsx("button", {
              type: "button",
              className: "dk-screen-chat",
              onClick: () => {
                const a = Te(ee.personId);
                a && i({
                  kind: "chat",
                  convo: a.account || a.id,
                  anchor: a.id
                })
              },
              children: "聊天"
            }), e.jsx("button", {
              type: "button",
              className: "dk-icon",
              "aria-label": b ? "缩小窗口" : "放大窗口",
              title: b ? "缩小窗口" : "放大到半屏宽度",
              onClick: () => g(a => !a),
              children: e.jsx("svg", {
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "1.8",
                "aria-hidden": "true",
                children: e.jsx("path", {
                  d: b ? "M9 3v6H3m12 12v-6h6M9 9 3 3m12 12 6 6" : "M14 4h6v6M4 14v6h6M20 4l-7 7M4 20l7-7"
                })
              })
            }), e.jsx("button", {
              type: "button",
              className: "dk-icon",
              "aria-label": "全屏",
              title: "全屏查看",
              onClick: () => G("meeting-fullscreen", ee.id),
              children: e.jsx("svg", {
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "1.8",
                "aria-hidden": "true",
                children: e.jsx("path", {
                  d: "M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"
                })
              })
            }), e.jsx("button", {
              type: "button",
              className: "dk-icon",
              "aria-label": "收起共享窗口",
              title: "收起预览，继续通话和共享（Esc）",
              onClick: () => i(null),
              children: e.jsx(Jt, {})
            })]
          }), e.jsx(wt, {
            screen: ee,
            state: n,
            compact: !b,
            showTitle: !1,
            pictureHeight: Math.max(120, R.pictureHeight - (ee.own ? 40 : 0))
          }, ee.id)]
        }), r.kind === "me" && se && e.jsx(Tn, {
          me: se,
          quick: r.quick,
          onClose: () => i(null)
        }), e.jsx("i", {
          className: "dk-tip",
          style: {
            left: he.tip - he.fly - 7
          },
          "aria-hidden": "true"
        })]
      }), o && e.jsx("div", {
        className: "dk-at",
        style: {
          left: he.personMenu
        },
        children: e.jsxs("section", {
          className: "dock-card dk-person-menu",
          role: "menu",
          "aria-label": `${o.name}的快捷菜单`,
          children: [e.jsx("strong", {
            children: o.name
          }), e.jsx("button", {
            type: "button",
            role: "menuitem",
            disabled: !se || se.role === "visitor" || !o.account,
            title: "在 iruler 群聊中提到此人",
            onClick: () => {
              o.account && (h({
                id: o.account,
                name: o.name,
                nonce: Date.now()
              }), d(null), i({
                kind: "chat",
                convo: ie,
                anchor: "table"
              }))
            },
            children: "@他"
          }), e.jsx("button", {
            type: "button",
            role: "menuitem",
            onClick: () => {
              i({
                kind: "chat",
                convo: o.account || o.id,
                anchor: o.id
              }), d(null)
            },
            children: "私聊"
          }), e.jsx("button", {
            type: "button",
            role: "menuitem",
            onClick: () => d(null),
            children: "取消"
          })]
        })
      })]
    })]
  })
}

export { Vn };
