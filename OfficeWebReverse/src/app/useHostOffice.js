import { subscribeToHostResponses, sendHostCommand } from './hostCommands.js';
import { Lp, Op } from './files.js';
import { Np, Ss, Wo, wp } from './standalone.js';
import { M as Zc } from '../chunks/chatLocal.js';
import { r as I } from '../chunks/dockGreeting.js';
import { H as Id, y as xd } from '../chunks/hostStateProtocol.js';
import { createHostMedia } from './hostMedia.js';
const INACTIVE_OFFICE_SIGNAL = {
    state: {
      connection: "inactive",
      quality: "unknown",
      participants: []
    },
    summary: "No active meeting",
    events: [],
    tick: 0
  },
  CHAT_UPLOAD_CHUNK_BYTES = 128 * 1024;
let uploadInFlight = !1;
async function uploadChatFile(i, e, t) {
  if (i.size < 0 || i.size > Zc) throw Error("每个文件要在 0 字节到 2 GB 之间");
  if (i.name.length > 200) throw Error("文件名不能超过 200 个字");
  const n = Wo();
  if (!n) throw Error("通信宿主还没准备好，先别发文件");
  if (uploadInFlight) throw Error("等这个文件传完再说");
  uploadInFlight = !0;
  const s = crypto.randomUUID();
  try {
    if (i.size === 0) {
      const a = await n.request({
        event: "chat-file",
        timeoutMs: 15e3,
        payload: {
          requestId: s,
          name: i.name,
          size: 0,
          offset: 0,
          bytes: new ArrayBuffer(0),
          recipientId: t
        }
      });
      if (!a.ok) throw Error(a.error || "文件没发出去");
      const o = a.reply;
      if (!(o != null && o.ok)) throw Error((o == null ? void 0 : o.error) || "文件没发出去");
      return e(100), !0;
    }
    let r = 0;
    for (; r < i.size;) {
      const a = await i.slice(r, r + CHAT_UPLOAD_CHUNK_BYTES).arrayBuffer(),
        o = await n.request({
          event: "chat-file",
          timeoutMs: 15e3,
          payload: {
            requestId: s,
            name: i.name,
            size: i.size,
            offset: r,
            bytes: a,
            recipientId: t
          }
        });
      if (!o.ok) throw Error(o.error || "文件没发出去");
      const c = o.reply;
      if (!(c != null && c.ok)) throw Error((c == null ? void 0 : c.error) || "文件没发出去");
      if (c.message) return e(100), !0;
      if (!Number.isFinite(c.offset) || !c.offset || c.offset <= r) throw Error("传输进度不对");
      r = c.offset, e(Math.floor(r / i.size * 100));
    }
    throw Error("服务器还没确认文件存好了");
  } catch (r) {
    throw n.emit({
      event: "chat-file-cancel",
      args: []
    }), r;
  } finally {
    uploadInFlight = !1;
  }
}
function createHostActions(i) {
  const e = t => i(t);
  return {
    dismissCallAlert: t => void e({
      kind: "dismissCallAlert",
      id: t
    }),
    cancelRequest: t => void e({
      kind: "cancelRequest",
      id: t
    }),
    interactCat: async t => {
      const n = await e({
        kind: "interactCat",
        action: t
      });
      return typeof n.text == "string" ? {
        ok: n.ok === !0,
        text: n.text
      } : void 0;
    },
    share: async () => {
      await e({
        kind: "share"
      });
    },
    shareInCall: async t => (await e({
      kind: "shareInCall",
      id: t
    })).ok === !0,
    stopShare: () => void e({
      kind: "stopShare"
    }),
    setRemoteAudioMuted: (t, n) => void e({
      kind: "setRemoteAudioMuted",
      room: t,
      muted: n
    }),
    annotation: {
      draw: (t, n, s, r) => void e({
        kind: "annotation",
        command: {
          action: "draw",
          scope: t,
          points: n,
          done: s,
          color: r
        }
      }),
      clear: t => void e({
        kind: "annotation",
        command: {
          action: "clear",
          scope: t
        }
      }),
      undo: t => void e({
        kind: "annotation",
        command: {
          action: "undo",
          scope: t
        }
      })
    },
    respond: async (t, n) => {
      await e({
        kind: "respond",
        id: t,
        accept: n
      });
    },
    claimSeat: async t => (await e({
      kind: "claimSeat",
      seat: t
    })).ok === !0,
    adminKick: async (t, n) => await e({
      kind: "adminKick",
      seat: t,
      password: n
    }),
    setNotice: t => void e({
      kind: "notice",
      message: t
    }),
    sitSpot: async t => (await e({
      kind: "sitSpot",
      id: t
    })).ok === !0,
    reportMotion: t => void e({
      kind: "reportMotion",
      motion: t
    }),
    setAppearance: t => void e({
      kind: "setAppearance",
      appearance: t
    }),
    setPreviewAllowed: t => void e({
      kind: "setPreviewAllowed",
      allowed: t
    }),
    sendChatFile: (t, n, s) => uploadChatFile(t, n, s),
    loadChatFile: t => Op(t),
    chat: async (t, n) => (await e({
      kind: "chat",
      text: t,
      recipientId: n
    })).ok === !0,
    notifyWatching: t => void e({
      kind: "notifyWatching",
      targetId: t
    }),
    request: async (t, n, s = !1) => {
      await e({
        kind: "request",
        target: t,
        callKind: n,
        offer: s
      });
    },
    end: t => void e({
      kind: "end",
      id: t
    }),
    mute: async t => (await e({
      kind: "mute",
      sessionId: t
    })).ok === !0,
    activeMic: () => null
  };
}
function useHostOffice() {
  const i = I.useMemo(() => Ss(), []),
    [e] = I.useState(() => new Id()),
    t = I.useMemo(() => m => sendHostCommand(m), []),
    n = I.useRef(null),
    s = I.useMemo(() => m => {
      t({
        kind: "notice",
        message: m
      });
    }, [t]),
    r = I.useMemo(() => createHostMedia({
      bridge: Wo(),
      getHost: () => n.current,
      onEndSession: m => {
        t({
          kind: "end",
          id: m
        });
      },
      notify: s
    }), [t, s]),
    a = r.actions;
  I.useEffect(() => {
    if (i) return xd(i, e);
  }, [i, e]), I.useEffect(() => subscribeToHostResponses(m => {
    m.kind === "auth-expired" && window.dispatchEvent(new CustomEvent("office-session-ended", {
      detail: {
        message: typeof m.message == "string" ? m.message : "登录过期了，请重新登录"
      }
    }));
  }), []);
  const o = I.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot),
    c = I.useSyncExternalStore(r.subscribe, r.getSnapshot, r.getSnapshot);
  I.useEffect(() => (r.start(), () => r.dispose()), [r]), I.useEffect(() => {
    n.current = o, r.sync(o);
  }, [o, r]), I.useEffect(() => (t({
    kind: "view",
    attached: !0
  }), () => {
    t({
      kind: "view",
      attached: !1
    });
  }), [t]);
  const d = I.useMemo(() => createHostActions(t), [t]),
    l = I.useMemo(() => ({
      ...Np(o, t),
      status: c.meetingStatus || (o == null ? void 0 : o.meetings.status) || "断开了，等待重连",
      mic: c.meetingMic,
      sharing: c.meetingSharing,
      act: async m => {
        const f = await t({
          kind: "meeting-action",
          data: m
        });
        if (f.ok === !1) throw Error(f.error || "会议操作没成功");
      },
      toggleMic: () => void a.meetingMic().catch(() => {}),
      toggleShare: () => void a.meetingShare().catch(() => {}),
      stopShare: () => void a.meetingShare(!1).catch(() => {})
    }), [o == null ? void 0 : o.meetings, c.meetingStatus, c.meetingMic, c.meetingSharing, t, a]),
    u = I.useMemo(() => Lp(o, t), [o == null ? void 0 : o.files.transfers, t]),
    h = I.useMemo(() => wp(t), [t]);
  return I.useEffect(() => {
    h.replace(o == null ? void 0 : o.presence.billiards);
  }, [h, o == null ? void 0 : o.presence.billiards]), I.useMemo(() => ({
    ...{
      people: (o == null ? void 0 : o.presence.people) ?? [],
      seats: (o == null ? void 0 : o.presence.seats) ?? [],
      messages: (o == null ? void 0 : o.chat.messages) ?? [],
      contacts: (o == null ? void 0 : o.chat.contacts) ?? [],
      hiddenContacts: (o == null ? void 0 : o.chat.hiddenContacts) ?? [],
      accountId: (o == null ? void 0 : o.identity.accountId) ?? "",
      requests: (o == null ? void 0 : o.calls.requests) ?? [],
      outgoing: (o == null ? void 0 : o.calls.outgoing) ?? [],
      callAlerts: (o == null ? void 0 : o.calls.callAlerts) ?? [],
      deskSensorLabel: c.deskSensorLabel || (o == null ? void 0 : o.desktop.deskSensorLabel) || "",
      sessions: (o == null ? void 0 : o.calls.sessions) ?? [],
      previews: (o == null ? void 0 : o.presence.previews) ?? {},
      motions: (o == null ? void 0 : o.presence.motions) ?? {},
      cat: (o == null ? void 0 : o.presence.cat) ?? null,
      catSpeech: (o == null ? void 0 : o.presence.catSpeech) ?? null,
      billiards: h,
      videos: c.videos,
      connected: (o == null ? void 0 : o.identity.connected) ?? !1,
      sharing: c.sharing,
      previewReason: c.previewReason || (o == null ? void 0 : o.media.previewReason) || "",
      muted: c.muted,
      voiceStatus: c.voiceStatus,
      callStates: c.callStates,
      signal: c.signal || (o == null ? void 0 : o.media.signal) || INACTIVE_OFFICE_SIGNAL,
      micLive: c.micLive,
      notice: (o == null ? void 0 : o.notice) ?? "",
      files: u,
      myId: (o == null ? void 0 : o.identity.myId) ?? "",
      clientId: (o == null ? void 0 : o.identity.accountId) ?? "",
      name: (o == null ? void 0 : o.identity.name) ?? "",
      boardScope: c.boardScope ?? (o == null ? void 0 : o.media.boardScope),
      meetings: l,
      systemIdleSensor: c.systemIdleSensor || ((o == null ? void 0 : o.desktop.systemIdleSensor) ?? !1)
    },
    ...d,
    share: a.share,
    stopShare: a.stopShare,
    shareInCall: a.shareInCall,
    mute: a.mute,
    setRemoteAudioMuted: a.setRemoteAudioMuted,
    activeMic: a.activeMic,
    annotation: a.annotation,
    respond: async (f, p) => {
      const _ = o == null ? void 0 : o.calls.requests.find(P => P.id === f);
      let w = !1;
      p && (_ == null ? void 0 : _.kind) === "screen" && !_.offer && !r.getSnapshot().sharing && (w = await a.startScreenForInvite(), w || (p = !1)), (await t({
        kind: "respond",
        id: f,
        accept: p
      })).ok === !1 && w && a.stopScreen();
    },
    request: async (f, p, _ = !1) => {
      let w = !1;
      if (_ && !r.getSnapshot().sharing && (w = await a.startScreenForInvite(), !w)) {
        t({
          kind: "notice",
          message: "没有屏幕权限，邀请没发出去"
        });
        return;
      }
      (await t({
        kind: "request",
        target: f,
        callKind: p,
        offer: _
      })).ok === !1 && w && a.stopScreen();
    }
  }), [o, l, u, h, d, c, a, t, r]);
}

export { useHostOffice };
