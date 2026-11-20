import { r as I } from '../chunks/dockGreeting.js';
import { Cs, vr, Nl, Ll } from './standalone.js';

function Ud(i, e = 0) {
  const t = I.useRef(!1),
    [n, s] = I.useState(!1),
    [r, a] = I.useState(""),
    o = {
      invitations: i.connected ? i.requests.map(u => ({
        id: u.id,
        personId: u.from,
        name: u.name,
        kind: u.kind,
        offer: u.offer === !0
      })) : [],
      sessions: i.sessions.filter(u => u.kind !== "meeting").map(u => {
        var h, m, f, p;
        return {
          id: u.id,
          name: ((h = i.people.find(_ => _.id === u.peer)) == null ? void 0 : h.name) || "Participant",
          connected: i.connected && ((m = i.callStates[u.id]) == null ? void 0 : m.connected) === !0,
          mic: ((f = i.callStates[u.id]) == null ? void 0 : f.voice) === "On",
          sharing: ((p = i.callStates[u.id]) == null ? void 0 : p.sharing) === !0
        }
      }),
      busy: n,
      error: r,
      micLevel: e
    },
    c = u => {
      t.current || (t.current = !0, s(!0), a(""), u().catch(h => a(h instanceof Error ? h.message : "通话操作没成功，再试一次")).finally(() => {
        t.current = !1, s(!1)
      }))
    };
  return {
    state: o,
    command: u => {
      if (u.kind !== "private-share" && u.kind !== "private-mute") return !1;
      const h = o.sessions.find(m => m.id === u.personId);
      return !(h != null && h.connected) || i.meetings.active || c(async () => {
        if (u.kind === "private-mute") {
          if (await i.mute(h.id) === !1) throw Error("麦克风没切过去，检查一下权限或设备")
        } else if (h.sharing) i.stopShare();
        else if (await i.shareInCall(h.id) === !1) throw Error("共享没开始，再选一次屏幕")
      }), !0
    },
    answer: (u, h) => {
      o.invitations.some(m => m.id === u) && c(() => i.respond(u, h))
    }
  }
}

function qd(i, e, t, n, s, r, a, o = 0) {
  var P, y, S, E, x, D;
  const c = I.useRef(!1),
    [d, l] = I.useState(!1),
    [u, h] = I.useState(""),
    m = {};
  if (i.active)
    for (const [C, M] of Object.entries(e)) {
      if (!C.startsWith(i.active.room + ":") || !M.getVideoTracks().some(A => A.readyState === "live")) continue;
      const g = C.slice(i.active.room.length + 1),
        T = g === "local" ? n : (P = t.find(A => A.id === g || A.clientId === g)) == null ? void 0 : P.id;
      T && (m[T] = M)
    }
  const f = {
      active: !!i.active,
      title: ((y = i.active) == null ? void 0 : y.title) || "",
      mic: i.mic,
      id: (S = i.active) == null ? void 0 : S.id,
      host: ((E = i.active) == null ? void 0 : E.host) === s,
      members: ((x = i.active) == null ? void 0 : x.members.map(({
        id: C,
        name: M,
        status: g
      }) => ({
        id: C,
        name: M,
        status: g
      }))) || [],
      invitations: i.invitations.filter(C => {
        var M;
        return C.id !== ((M = i.active) == null ? void 0 : M.id) && C.members.some(g => g.id === s && g.status === "invited")
      }).map(C => {
        var g, T, A;
        const M = C.host || ((g = C.members.find(F => F.status === "joined")) == null ? void 0 : g.id) || "";
        return {
          id: C.id,
          personId: ((T = t.find(F => F.clientId === M)) == null ? void 0 : T.id) || M,
          name: ((A = C.members.find(F => F.id === M)) == null ? void 0 : A.name) || "同事"
        }
      }),
      sharing: i.sharing,
      busy: d,
      error: u,
      micLevel: o,
      candidates: t.filter(C => C.clientId !== s).map(C => ({
        id: C.clientId,
        personId: C.id,
        name: C.name
      })),
      screens: Object.keys(m).map(C => {
        var M;
        return {
          id: C,
          streamId: m[C].id,
          name: ((M = t.find(g => g.id === C)) == null ? void 0 : M.name) || "Colleague"
        }
      }),
      huddle: ((D = i.active) == null ? void 0 : D.huddle) === !0
    },
    p = (i.huddles || []).map(C => ({
      ...C,
      sharing: C.sharing || ""
    })),
    _ = new Set(p.flatMap(C => [...C.members, ...C.ringing].map(M => M.id))),
    w = t.filter(C => C.clientId !== s && C.role !== "visitor" && Cs(C) && !_.has(C.clientId)).map(C => C.clientId);
  return {
    state: f,
    command: C => {
      if (!C.kind.startsWith("meeting") && !C.kind.startsWith("huddle-") && C.kind !== "gather") return !1;
      if (C.kind === "meeting" || C.kind === "meeting-view" || C.kind === "meeting-fullscreen") {
        if (C.kind !== "meeting") {
          const g = t.find(T => T.id === C.personId || T.clientId === C.personId);
          i.active && g && (m[g.id] || i.active.sharing === g.clientId || i.active.sharing === g.id) ? a(g.id) : h("当前没有可查看的共享屏幕，请等对方开始共享后再试")
        }
        return !0
      }
      return c.current || (c.current = !0, l(!0), h(""), (async () => {
        var A, F;
        const g = new Set(t.map(H => H.clientId)),
          T = (C.ids || []).filter(H => g.has(H) && H !== s);
        if (C.kind === "huddle-start") i.active ? await i.act({
          action: "invite",
          id: i.active.id,
          invitees: T
        }) : await i.act({
          action: "huddle",
          invitees: T,
          microphone: !0
        });
        else if (C.kind === "huddle-join") {
          if (((A = i.active) == null ? void 0 : A.id) !== C.personId) {
            if (i.active) throw Error("先离开现在的通话");
            await i.act({
              action: "join",
              id: C.personId,
              microphone: !0
            })
          }
        } else if (C.kind === "huddle-invite" && i.active) await i.act({
          action: "invite",
          id: i.active.id,
          invitees: T
        });
        else if (C.kind === "gather") i.active ? w.length && await i.act({
          action: "invite",
          id: i.active.id,
          invitees: w
        }) : w.length ? await i.act({
          action: "huddle",
          invitees: w,
          microphone: !0
        }) : p[0] ? await i.act({
          action: "join",
          id: p[0].id,
          microphone: !0
        }) : await i.act({
          action: "huddle",
          invitees: [],
          microphone: !0
        });
        else if (C.kind === "meeting-create" && C.meeting && !i.active) {
          const H = new Set(f.candidates.map(N => N.id));
          await i.act({
            action: "create",
            ...C.meeting,
            invitees: C.meeting.invitees.filter(N => H.has(N))
          })
        } else if (i.active && C.kind === "meeting-mute") await i.toggleMic();
        else if (i.active && C.kind === "meeting-share") await i.toggleShare();
        else if (i.active && C.personId === i.active.id && C.kind === "meeting-leave") await i.act({
          action: "leave",
          id: i.active.id
        });
        else if (i.active && C.personId === i.active.id && C.kind === "meeting-end") {
          if (!f.host) throw Error("只有主持人能结束会议");
          await i.act({
            action: "end",
            id: i.active.id
          })
        } else if ((F = f.invitations) != null && F.some(H => H.id === C.personId))
          if (C.kind === "meeting-accept") {
            if (i.active) throw Error("先退出现在的会议再接受");
            await i.act({
              action: "accept",
              id: C.personId,
              microphone: !0
            })
          } else C.kind === "meeting-decline" && await i.act({
            action: "decline",
            id: C.personId
          })
      })().catch(g => h(g instanceof Error ? g.message : "会议操作没成功，再试一次")).finally(() => {
        c.current = !1, l(!1)
      })), !0
    },
    streams: m,
    huddles: p,
    free: w
  }
}

function zo(i) {
  let e = !1,
    t = !1,
    n = !1,
    s = !0,
    r = !1,
    a, o = !1,
    c, d = !1,
    l = "";
  const u = !!window.officeDesktop,
    h = E => {
      e !== E && (e = E, i.onChange())
    },
    m = E => {
      t !== E && (t = E, i.onChange())
    },
    f = E => {
      n !== E && (n = E, i.onChange())
    },
    p = E => {
      s !== E && (s = E, i.onChange())
    },
    _ = E => p((E == null ? void 0 : E.wanted) !== !1),
    w = () => {
      const E = i.socket.current;
      !E || d || (d = !0, E.on("ambient", _))
    },
    k = () => {
      var E;
      d && (d = !1, (E = i.socket.current) == null || E.off("ambient", _))
    };

  function P() {
    o && (o = !1, c == null || c(), c = void 0)
  }

  function y() {
    var N;
    if (o) return;
    (a == null ? void 0 : a.seat) != null;
    const E = !!a && a.role !== "visitor",
      x = vr({
        desktop: u,
        connected: r,
        mayBroadcast: E
      }),
      D = window.officeDesktop,
      C = i.socket.current;
    if (!x || !D || !C) {
      h(!1), (N = D == null ? void 0 : D.setPreviewActive) == null || N.call(D, !1).catch(() => {});
      return
    }
    o = !0;
    let M = !1,
      g = !1,
      T = !1,
      A;
    async function F() {
      var Q;
      if (!(M || g)) {
        g = !0, clearTimeout(A);
        try {
          const Z = await D.previewFrame();
          if (M || !C.connected) return;
          if (!Z) {
            const ue = await ((Q = D.previewState) == null ? void 0 : Q.call(D).catch(() => {}));
            if (ue != null && ue.paused) {
              f(!0), h(!1), m(!1);
              return
            }
            return
          }
          C.emit("ambient-sharing", !0), C.emit("preview", Z), h(!0), f(!1), m(!1), T = !1
        } catch {
          M || (h(!1), m(!0), C.emit("ambient-sharing", !1), T || i.notify("Screen preview unavailable. Retrying automatically."), T = !0)
        } finally {
          g = !1, M || (A = setTimeout(F, H()))
        }
      }
    }
    const H = () => Nl(document.hasFocus(), document.visibilityState !== "hidden");
    F(), window.addEventListener("office-display-changed", F), window.addEventListener("focus", F), c = () => {
      M = !0, clearTimeout(A), window.removeEventListener("office-display-changed", F), window.removeEventListener("focus", F), C.connected && C.emit("ambient-sharing", !1), h(!1)
    }
  }

  function S(E, x) {
    var g, T;
    r = E, a = x, (a == null ? void 0 : a.seat) != null;
    const D = !!a && a.role !== "visitor",
      C = vr({
        desktop: u,
        connected: r,
        mayBroadcast: D
      }),
      M = `${r}|${C}|${(a==null?void 0:a.id)||""}`;
    if (M !== l) {
      if (l = M, r && w(), P(), !C) {
        h(!1), (T = (g = window.officeDesktop) == null ? void 0 : g.setPreviewActive) == null || T.call(g, !1).catch(() => {});
        return
      }
      y()
    }
  }
  return {
    setContext: S,
    reason() {
      (a == null ? void 0 : a.seat) != null;
      const E = !!a && a.role !== "visitor";
      return Ll({
        active: e,
        desktop: u,
        connected: r,
        mayBroadcast: E,
        failed: t,
        watched: s,
        paused: n
      })
    },
    dispose() {
      P(), k()
    }
  }
}

export { Ud, qd, zo };
