// desk occupancy + idle sensing.
// Recovered verbatim from the production bundle; bindings renamed to semantic names.
function computeDeskGeometry(n) {
  let e = {
      active: null,
      invitations: []
    },
    t = "断开了，等待重连",
    s = !1,
    r = !1,
    i = !1,
    o = !1,
    a = null,
    f = !1,
    d,
    m;
  const _ = () => n.onChange();
  function y() {
    m == null || m.off("meeting-state", b), m = void 0;
  }
  function A() {
    var k, O, l;
    const S = i ? ((k = e.active) == null ? void 0 : k.room) ?? null : null;
    a !== S && (a = S, r = !1, S ? (t = "正在连会议语音…", (l = n.media()) == null || l.joinMeeting(S, o).then(v => {
      var h;
      a === S && (t = v ? "进入会议了" : "语音没连上，退出再进来试试", s = !!((h = n.media()) != null && h.meetingStatus().mic), _());
    })) : ((O = n.media()) == null || O.leaveMeeting(), s = !1)), e.active && !d && (d = setInterval(E, 1e3)), !e.active && d && (clearInterval(d), d = void 0);
  }
  function E() {
    var l;
    const S = (l = n.media()) == null ? void 0 : l.meetingStatus();
    if (!S) return;
    let k = !1;
    s !== S.mic && (s = S.mic, k = !0), r !== S.sharing && (r = S.sharing, k = !0);
    const O = S.connected ? "进入会议了" : "断开了，正在重连…";
    t !== O && (t = O, k = !0), k && _();
  }
  function b(S) {
    e = S, A(), _();
  }
  function I(S) {
    if (i = S, S) {
      const k = n.socket();
      k && m !== k && (y(), m = k, k.on("meeting-state", b), k.emit("meeting-sync")), A();
    } else y(), t = "断开了，等待重连", A();
    _();
  }
  async function L(S) {
    var l;
    const k = n.socket();
    if (!(k != null && k.connected)) throw Error("断开了，等重新连上");
    (S.action === "create" || S.action === "accept" || S.action === "huddle" || S.action === "join") && (o = S.microphone === !0, o && (await ((l = n.media()) == null ? void 0 : l.prepareMic())));
    const O = await new Promise(v => {
      k.timeout(8e3).emit("meeting-action", S, (h, c) => v(h ? {
        ok: !1,
        error: "会议请求超时了，先看看会议列表再重试"
      } : c));
    });
    if (!(O != null && O.ok)) throw Error((O == null ? void 0 : O.error) || "会议操作没成功");
  }
  async function N(S, k) {
    var O, l, v, h;
    if (!f) {
      f = !0;
      try {
        const c = (O = n.media()) == null ? void 0 : O.meetingStatus();
        if (S === "mic") {
          const p = k ?? !(c != null && c.mic);
          await ((l = n.media()) == null ? void 0 : l.meetingMicrophone(p)), o = p;
        } else await ((v = n.media()) == null ? void 0 : v.meetingScreen(k ?? !(c != null && c.sharing)));
        const u = (h = n.media()) == null ? void 0 : h.meetingStatus();
        s = !!(u != null && u.mic), r = !!(u != null && u.sharing);
      } finally {
        f = !1, _();
      }
    }
  }
  const F = () => {
      N("screen", !1);
    },
    B = () => {
      N("mic");
    },
    P = () => {
      N("screen");
    };
  return {
    act: L,
    stopShare: F,
    toggleMic: B,
    toggleShare: P,
    setConnected: I,
    dispose() {
      d && (clearInterval(d), d = void 0), y();
    },
    view() {
      return {
        ...e,
        act: L,
        status: t,
        mic: s,
        sharing: r,
        stopShare: F,
        toggleMic: B,
        toggleShare: P
      };
    }
  };
}
function sameDeskOccupancy(n, e) {
  return [...n.filter(t => t.id !== e.id), e].slice(-5);
}
function formatDeskTooltip(n, e = [], t = [], s = () => "") {
  const r = typeof n == "string" ? n : n == null ? void 0 : n.id,
    i = typeof n == "string" ? "cancelled" : n == null ? void 0 : n.reason;
  if (!r || i !== "timeout") return null;
  const o = e.find(f => f.id === r);
  if (o) {
    const f = s(o.target) || "对方";
    return {
      id: `${r}:unanswered`,
      kind: "unanswered",
      name: f,
      target: o.target,
      callKind: o.kind,
      title: "没打通，等一下再试",
      detail: `${f}没有接${o.kind === "screen" ? "（看屏幕的邀请）" : ""}`
    };
  }
  const a = t.find(f => f.id === r);
  return a ? {
    id: `${r}:missed`,
    kind: "missed",
    name: a.name,
    target: a.from,
    callKind: a.kind,
    title: "未接来电",
    detail: `${a.name}找过你${a.kind === "screen" ? "（看屏幕的邀请）" : "（语音）"}`
  } : null;
}
function computeDeskSnapshot(n, e) {
  return {
    async claimSeat(t) {
      const s = await new Promise(r => {
        const i = n.current;
        if (!i) return r({
          ok: !1,
          error: "还没连上"
        });
        i.timeout(6e3).emit("seat", t, (o, a) => {
          r(o ? {
            ok: !1,
            error: "认领工位超时了"
          } : a ?? {
            ok: !1,
            error: "认领工位没成功"
          });
        });
      });
      return e(s.ok ? t === null ? "离开了工位" : `${t + 1} 号工位是你的了` : s.error || "这张工位认领不了"), s.ok;
    },
    async adminKick(t, s) {
      return new Promise(r => {
        const i = n.current;
        if (!i) return r({
          ok: !1,
          error: "还没连上"
        });
        i.timeout(6e3).emit("admin", {
          password: s,
          seat: t
        }, (o, a) => {
          r(o ? {
            ok: !1,
            error: "管理员请求超时了"
          } : a ?? {
            ok: !1,
            error: "管理员请求没成功"
          });
        });
      });
    }
  };
}
const AWAY_AFTER_MS = 1e4,
  Tt = 1e3,
  Ot = 2e3,
  Re = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"];
function IDLE_POLL_MS() {
  const n = typeof window > "u" ? void 0 : window.officeDesktop;
  return typeof (n == null ? void 0 : n.systemIdle) == "function" ? () => n.systemIdle() : void 0;
}
function IDLE_POLL_SECONDS(n) {
  return n ? "按系统空闲时间判断（桌面客户端）" : "只看这个窗口里的键盘鼠标（浏览器）";
}
function createDeskSensor(n, e = {}) {
  const t = e.now ?? (() => Date.now()),
    s = e.awayAfterMs ?? AWAY_AFTER_MS,
    r = e.target ?? (typeof document > "u" ? void 0 : document),
    i = e.setInterval ?? ((k, O) => setInterval(k, O)),
    o = e.clearInterval ?? (k => clearInterval(k));
  let a = t(),
    f = !0,
    d = !1,
    m = !1;
  const _ = new Set();
  let y = 0;
  const A = () => {
      const k = Math.floor(t() / 1e3);
      _.add(k);
      for (const O of _) O <= k - 10 && _.delete(O);
      _.size >= 6 && (y = t() + 8e3);
    },
    E = () => {
      n.connected && n.emit("input-state", {
        atDesk: f,
        busy: d,
        idleMs: Math.max(0, t() - a)
      });
    },
    b = k => {
      const O = k && t() < y;
      k === f && O === d || (f = k, d = O, E());
    },
    I = () => {
      A(), a = t(), b(!0);
    },
    L = () => b(t() - a < s),
    N = e.desktopIdle ?? IDLE_POLL_MS(),
    F = () => {
      N && Promise.resolve().then(N).then(k => {
        if (m || !k) return;
        const O = Number(k.seconds),
          l = v => {
            a = t() - Math.max(v, s), b(!1);
          };
        if (k.state === "locked") return l(Number.isFinite(O) ? O * 1e3 : 0);
        Number.isFinite(O) && (O * 1e3 < s ? (O < 2 && (A(), _.add(Math.floor(t() / 1e3) - 1)), a = t() - O * 1e3, b(!0)) : l(O * 1e3));
      }).catch(() => {});
    };
  for (const k of Re) r == null || r.addEventListener(k, I, {
    passive: !0,
    capture: !0
  });
  const B = () => E();
  n.on("connect", B);
  const P = i(L, Tt),
    S = N ? i(F, Ot) : void 0;
  return {
    isAtDesk: () => f,
    usesSystemIdle: () => N !== void 0,
    touch: I,
    tick: L,
    poll: F,
    stop() {
      m = !0, o(P), S !== void 0 && o(S), n.off("connect", B);
      for (const k of Re) r == null || r.removeEventListener(k, I, {
        capture: !0
      });
    }
  };
}

export { computeDeskGeometry, sameDeskOccupancy, formatDeskTooltip, computeDeskSnapshot, IDLE_POLL_SECONDS, createDeskSensor };
