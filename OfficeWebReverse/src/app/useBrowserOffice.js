import { OfficeMedia as Jc } from './OfficeMedia.js';
import { createMeetingSignal } from './meetingSignal.js';
import { zo } from './comm-commands.js';
import { qc } from './screen-share.js';
import { r as Lo } from '../chunks/chatLocal.js';
import { r as I, E as ks, F as Fo } from '../chunks/dockGreeting.js';
import { c as gd, a as vd, f as sr, d as ai, m as bd, l as yd, b as kd, v as Bo, r as rr, e as Sd, g as Td, n as Cd, h as wd, w as Ed, i as Pd, x as Vo, s as Rd, j as or, k as _d } from '../chunks/hostStateProtocol.js';
const MOTION_INTERVAL_MS = 100;
function createBrowserOffice(i) {
  const e = {
      current: void 0
    },
    t = {
      current: []
    },
    n = {
      current: !1
    },
    s = _d(e);
  let r,
    a,
    o,
    c,
    d,
    l,
    u,
    h = !1,
    m = !1,
    f = !1,
    p = null,
    _ = "";
  const w = {
      requestBusy: !1,
      muteBusy: !1,
      sitSequence: 0,
      receivePreviews: !0,
      invitationIds: new Set(),
      selectingForInvite: null
    },
    k = new Set();
  let P;
  const y = {
      get current() {
        return r;
      }
    },
    S = qc({
      socket: e,
      notify: j => g(j),
      sharingScreen: () => {
        var j, G, J;
        return ((G = (j = y.current) == null ? void 0 : j.screen) == null ? void 0 : G.active) === !0 || ((J = y.current) == null ? void 0 : J.meetingStatus().sharing) === !0;
      }
    }),
    E = bd(e, j => g(j)),
    x = gd({
      accountId: i.id,
      notify: () => {}
    }),
    D = zo({
      socket: e,
      notify: j => g(j),
      onChange: () => N({})
    }),
    C = Pd({
      socket: () => e.current,
      media: () => r,
      onChange: () => N({})
    }),
    M = createMeetingSignal(() => r == null ? void 0 : r.meetingConnection(), () => N({}));
  x.subscribe(() => N({}));
  function g(j) {
    N({
      notice: j
    });
  }
  function T(j) {
    N({
      sharing: j
    });
  }
  function A(j) {
    j !== f && (f = j, N({
      deskSensorLabel: ai(j)
    }));
  }
  function F() {
    return {
      people: [],
      seats: [],
      messages: [],
      contacts: [],
      hiddenContacts: [],
      accountId: i.id,
      requests: [],
      outgoing: [],
      callAlerts: [],
      deskSensorLabel: ai(f),
      sessions: [],
      previews: {},
      motions: {},
      cat: null,
      catSpeech: null,
      billiards: s,
      videos: {},
      connected: !1,
      sharing: !1,
      previewReason: "",
      muted: !1,
      voiceStatus: "Not in a call",
      callStates: {},
      signal: M.snapshot(),
      micLive: !1,
      notice: `欢迎回来，${i.name}`,
      files: sr(x),
      myId: "",
      clientId: i.id,
      name: i.name,
      boardScope: void 0,
      meetings: C.view(),
      systemIdleSensor: f
    };
  }
  function H(j) {
    var be, Ke, Et;
    const G = {
        ...(P ?? F()),
        ...j
      },
      J = C.view();
    G.meetings = J, J.sharing && S.attach();
    const we = ((be = J.active) == null ? void 0 : be.room) ?? null;
    we !== p && (p = we, S.trackMeetingRoom(p)), M.setRoom(we);
    const ve = M.snapshot(),
      tt = ve.tick;
    G.signal = {
      ...ve,
      tick: tt
    }, !G.sessions.length && Object.keys(G.callStates).length && (G.callStates = {}), G.sessions.length && !u && (u = setInterval(Q, 500)), !G.sessions.length && u && (clearInterval(u), u = void 0);
    const lt = ((Ke = e.current) == null ? void 0 : Ke.id) || "",
      je = G.sessions.filter(Ge => {
        var Si;
        return (Si = Ge.screenOwners) == null ? void 0 : Si.includes(lt);
      }).map(Ge => Ge.room);
    J.sharing && (Et = J.active) != null && Et.room && je.push(J.active.room);
    const q = je[0],
      Y = je.join("|");
    return Y !== _ && (_ = Y, t.current = je), G.boardScope = q, G.micLive = !!(r != null && r.activeMic()) && (J.mic || Object.values(G.callStates).some(Ge => Ge.voice === "On" || Ge.voice === "Audio paused")), G.previewReason = window.officeDesktop || !G.sharing ? D.reason() : "正在共享（浏览器）", G.files = sr(x), G.deskSensorLabel = ai(f), G.systemIdleSensor = f, G.accountId = i.id, G.clientId = i.id, G.name = i.name, n.current = G.sharing, P = G, G;
  }
  function N(j) {
    const G = Object.keys(j);
    if (!(G.length && G.every(J => Object.is(P == null ? void 0 : P[J], j[J])))) {
      H(j);
      for (const J of k) J();
    }
  }
  function Q() {
    if (!P.sessions.length) return;
    const j = (r == null ? void 0 : r.privateVoiceStatus()) || "Not in a call",
      G = Object.fromEntries(P.sessions.map(J => [J.id, (r == null ? void 0 : r.callStatus(J.id)) || {
        voice: "Connecting",
        connected: !1,
        sharing: !1
      }]));
    N({
      voiceStatus: j,
      callStates: Vo(P.callStates, G) ? P.callStates : G
    });
  }
  function Z() {
    return P.people.find(j => j.id === P.myId);
  }
  function ue() {
    if (h) return;
    h = !0;
    const j = yd({
      autoConnect: !1
    });
    e.current = j, d = kd(j, i.id);
    const G = new Jc(j, q => g(q), (q, Y) => {
      const be = {
        ...P.videos
      };
      Y ? be[q] = Y : delete be[q], N({
        videos: be
      });
    }, q => T(q));
    r = G, G.onScreenStopped = () => S.clearShareMarks(t.current), a = Bo(j), A(a.usesSystemIdle()), j.on("connect", () => {
      var q;
      m = !1, N({
        previews: {},
        connected: !0,
        myId: j.id || ""
      }), j.emit("join", {
        name: i.name,
        appearance: Lo(i.appearance),
        annotate: !!((q = window.officeDesktop) != null && q.annotations)
      }), j.emit("preview-allowed", w.receivePreviews), D.setContext(!0, Z()), C.setConnected(!0);
    });
    const J = (q, Y = !1) => window.dispatchEvent(new CustomEvent("office-session-ended", {
        detail: {
          message: q,
          forget: Y
        }
      })),
      we = () => {
        j.disconnect(), j.connect();
      },
      ve = q => {
        const Y = Rd(q);
        if (Y === "reconnect") {
          we();
          return;
        }
        if (Y === "recover-once") {
          if (!m) {
            m = !0, we();
            return;
          }
          J(or(q, "登录过期了，请重新登录"));
          return;
        }
        Y === "login" && J(or(q, "你的账号在别处登录了，请重新登录"));
      };
    j.on("session-replaced", () => J("你的账号在别处登录了，请重新登录")), j.on("session-code", ve), j.on("connect_error", q => {
      q.message === "Please sign in" ? J("登录过期了，请重新登录") : g("连不上，正在重试…");
    }), j.on("disconnect", q => {
      G.signalingDisconnected(), S.detach(), w.invitationIds.clear(), w.selectingForInvite = null, N({
        sessions: [],
        requests: [],
        outgoing: [],
        connected: !1,
        people: [],
        previews: {},
        motions: {},
        notice: q === "io server disconnect" ? "你的账号在别的窗口登录了，或者登录过期了，请重新登录" : "断开了，正在重连…"
      }), D.setContext(!1, void 0), C.setConnected(!1);
    }), j.on("people", q => {
      const Y = new Set(q.map(be => be.id));
      N({
        people: q,
        previews: rr(P.previews, Y),
        motions: rr(P.motions, Y)
      }), D.setContext(P.connected, q.find(be => be.id === P.myId));
    }), j.on("seats", q => N({
      seats: q
    }));
    const tt = {};
    let lt;
    j.on("cat-speech", q => N({
      catSpeech: q
    })), j.on("office-cat", q => N({
      cat: q
    })), j.on("billiards-state", s.receive), j.on("motion", q => {
      tt[q.id] = q, !lt && (lt = setTimeout(() => {
        lt = void 0, l = void 0;
        const Y = {
          ...tt
        };
        for (const be of Object.keys(tt)) delete tt[be];
        N({
          motions: {
            ...P.motions,
            ...Y
          }
        });
      }, MOTION_INTERVAL_MS), l = lt);
    }), j.on("notice", q => g(q)), j.on("kicked", q => J((q == null ? void 0 : q.message) || "管理员把你移出了办公室，请重新登录")), o = Sd(j, i.id, q => N({
      messages: q(P.messages)
    }), q => g(q), (q, Y) => N({
      contacts: q,
      hiddenContacts: Y
    })), c = Td(j, q => {
      const Y = P.previews;
      N({
        previews: Cd(Y, q, {
          selfId: j.id,
          receiving: w.receivePreviews
        }).next
      });
    }), j.on("watched", q => {
      var be;
      const Y = window.officeDesktop;
      Y && ((be = Y.previewGlow) == null || be.call(Y, {
        sharing: n.current,
        fade: Fo
      }).catch(() => {}), q != null && q.from && ks({
        id: q.from,
        name: q.name,
        appearance: q.appearance,
        mode: "peek"
      }));
    }), j.on("request", q => {
      w.invitationIds.add(q.id), N({
        requests: [...P.requests, q]
      });
    }), j.on("request-sent", q => N({
      outgoing: [...P.outgoing.filter(Y => Y.id !== q.id), q]
    })), j.on("request-expired", q => {
      const Y = typeof q == "string" ? q : q == null ? void 0 : q.id,
        be = wd(q, P.outgoing, P.requests, Ke => {
          var Et;
          return ((Et = P.people.find(Ge => Ge.id === Ke)) == null ? void 0 : Et.name) || "";
        });
      w.invitationIds.delete(Y), w.selectingForInvite === Y && G.cancelScreenSelection(), N({
        outgoing: P.outgoing.filter(Ke => Ke.id !== Y),
        requests: P.requests.filter(Ke => Ke.id !== Y),
        ...(be ? {
          callAlerts: Ed(P.callAlerts, be)
        } : {})
      });
    }), j.on("session", q => {
      N({
        sessions: [...P.sessions.filter(Y => Y.id !== q.id), q]
      }), G.start(q).then(Y => {
        Y || j.emit("end", q.id);
      });
    }), j.on("session-end", q => {
      G.end(q), N({
        sessions: P.sessions.filter(Y => Y.id !== q)
      });
    }), S.attachSocket(j), x.attach(j), j.connect();
  }
  function K() {
    var j;
    h && (h = !1, a == null || a.stop(), l && clearTimeout(l), l = void 0, c == null || c(), d == null || d(), o == null || o.dispose(), r == null || r.dispose(), (j = e.current) == null || j.disconnect(), D.dispose(), C.dispose(), M.dispose(), u && (clearInterval(u), u = void 0));
  }
  const z = vd({
    getSnapshot: () => P,
    publish: N,
    socket: () => e.current,
    media: () => r,
    annotations: S,
    seatApi: E,
    chat: () => o,
    setNotice: g,
    flags: w
  });
  return P = H({}), {
    getSnapshot: () => P,
    subscribe(j) {
      return k.add(j), () => {
        k.delete(j);
      };
    },
    actions: z,
    start: ue,
    dispose: K
  };
}
function useBrowserOffice(i) {
  const [e] = I.useState(() => createBrowserOffice(i)),
    t = I.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot);
  return I.useEffect(() => (e.start(), () => e.dispose()), [e]), I.useMemo(() => ({
    ...t,
    ...e.actions
  }), [t, e]);
}

export { useBrowserOffice };
