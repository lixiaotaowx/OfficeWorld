// office socket protocol layer.
// Recovered verbatim from the production bundle; bindings renamed to semantic names.
import { w as pt } from '../chunks/chatLocal.js';

const PREVIEW_THROTTLE_MS = 200;

function trackSocketPreview(n, e, t) {
  const s = {
      ...n
    },
    r = [];
  for (const [i, o] of Object.entries(e)) {
    if (i !== t.selfId && !t.receiving) {
      delete s[i];
      continue;
    }
    if (o === null) {
      r.push(i);
      continue;
    }
    s[i] = o;
  }
  return {
    next: s,
    cleared: r
  };
}
function subscribeSocketRoom(n, e) {
  const t = {};
  let s;
  const r = () => {
      s = void 0;
      const o = {
        ...t
      };
      for (const a of Object.keys(t)) delete t[a];
      e(o);
    },
    i = ({
      id: o,
      image: a
    }) => {
      t[o] = a ? String(a) : null, s ?? (s = setTimeout(r, PREVIEW_THROTTLE_MS));
    };
  return n.on("preview", i), () => {
    s && clearTimeout(s), s = void 0, n.off("preview", i);
  };
}
function createSocketBridge(n) {
  return {
    rows: n.snapshot(),
    lookup: n.lookup,
    localImage: n.localImage,
    fileAction: n.fileAction,
    attach: n.attach,
    sendFiles: n.sendFiles,
    downloadAttachment: n.downloadAttachment,
    open: n.open,
    reveal: n.reveal,
    cancel: n.cancel,
    dismiss: n.dismiss,
    dismissAll: n.dismissAll,
    dockRows: n.dockRows
  };
}
function createOfficeActions(n) {
  const {
    flags: e,
    setNotice: t
  } = n;
  async function s() {
    var i, o;
    if (!n.getSnapshot().connected) {
      t("等重新连上再试");
      return;
    }
    if (!window.officeDesktop) {
      if (n.getSnapshot().sharing) {
        (i = n.media()) == null || i.stopScreen();
        return;
      }
      try {
        await ((o = n.media()) == null ? void 0 : o.startScreen()), n.annotations.attach();
      } catch {
        t("共享没开始，再选一次窗口或屏幕");
      }
    }
  }
  async function r(i, o) {
    var d, m, _, y, A, E;
    if (e.requestBusy) return;
    e.requestBusy = !0;
    const a = n.getSnapshot().requests.find(b => b.id === i);
    if (!a) {
      e.requestBusy = !1;
      return;
    }
    let f = null;
    try {
      o && a.kind === "screen" && !a.offer && !((m = (d = n.media()) == null ? void 0 : d.screen) != null && m.active) && (e.selectingForInvite = i, await ((_ = n.media()) == null ? void 0 : _.startScreen(!1)), f = ((y = n.media()) == null ? void 0 : y.screen) || null, f != null && f.active || (o = !1));
    } catch {
      o = !1, t("没有屏幕权限，已拒绝");
    }
    e.selectingForInvite = null;
    try {
      if (!e.invitationIds.has(i) || !((A = n.socket()) != null && A.connected)) throw Error("邀请已取消或过期");
      const b = await n.socket().timeout(1e4).emitWithAck("respond", {
        id: i,
        accept: o
      });
      if (!(b != null && b.ok) || o && !b.accepted) throw Error((b == null ? void 0 : b.error) || "邀请没连上");
    } catch (b) {
      f && ((E = n.media()) == null ? void 0 : E.screen) === f && n.media().stopScreen(), t(b instanceof Error ? b.message : "邀请没连上，再发一次");
    } finally {
      e.invitationIds.delete(i), n.publish({
        requests: n.getSnapshot().requests.filter(b => b.id !== i)
      }), e.requestBusy = !1;
    }
  }
  return {
    dismissCallAlert: i => n.publish({
      callAlerts: n.getSnapshot().callAlerts.filter(o => o.id !== i)
    }),
    cancelRequest: i => {
      var o;
      return (o = n.socket()) == null ? void 0 : o.emit("cancel-request", i);
    },
    interactCat: async i => {
      var o;
      try {
        return await ((o = n.socket()) == null ? void 0 : o.timeout(5e3).emitWithAck("cat-interact", i));
      } catch {
        return {
          ok: !1,
          text: "暂时没连上，稍后再试。"
        };
      }
    },
    share: s,
    shareInCall: async i => {
      var o;
      try {
        return await ((o = n.media()) == null ? void 0 : o.shareInCall(i)), n.annotations.attach(), !0;
      } catch (a) {
        return t(a instanceof Error ? a.message : "共享没开始，再试一次"), !1;
      }
    },
    stopShare: () => {
      var i;
      (i = n.media()) == null || i.stopScreen(), n.annotations.detach();
    },
    setRemoteAudioMuted: (i, o) => {
      var a;
      return (a = n.media()) == null ? void 0 : a.setRemoteAudioMuted(i, o);
    },
    annotation: {
      draw: n.annotations.draw,
      clear: n.annotations.clear,
      undo: n.annotations.undo
    },
    respond: r,
    claimSeat: i => n.seatApi.claimSeat(i),
    adminKick: (i, o) => n.seatApi.adminKick(i, o),
    setNotice: t,
    sitSpot: i => new Promise(o => {
      const a = ++e.sitSequence,
        f = n.socket();
      if (!(f != null && f.connected)) return o(!1);
      f.timeout(6e3).emit("sit", i, (d, m) => {
        d ? (a === e.sitSequence && f.emit("sit", null, () => {}), t("坐下超时了，再试一次")) : m != null && m.ok || t((m == null ? void 0 : m.error) || "坐不了这里"), o(!d && (m == null ? void 0 : m.ok) === !0);
      });
    }),
    reportMotion: i => {
      var o;
      return (o = n.socket()) == null ? void 0 : o.emit("motion", i);
    },
    setAppearance: i => {
      var o;
      pt(i), (o = n.socket()) == null || o.emit("appearance", i);
    },
    setPreviewAllowed: i => {
      var o;
      e.receivePreviews = i, i || n.publish({
        previews: Object.fromEntries(Object.entries(n.getSnapshot().previews).filter(([a]) => {
          var f;
          return a === ((f = n.socket()) == null ? void 0 : f.id);
        }))
      }), (o = n.socket()) == null || o.emit("preview-allowed", i);
    },
    sendChatFile: (i, o, a) => {
      var f;
      return ((f = n.chat()) == null ? void 0 : f.sendFile(i, o, a)) ?? Promise.resolve(!1);
    },
    loadChatFile: i => {
      var o;
      return ((o = n.chat()) == null ? void 0 : o.loadFile(i)) ?? Promise.reject(Error("聊天还没连上"));
    },
    chat: (i, o) => {
      var a;
      return ((a = n.chat()) == null ? void 0 : a.send(i, o)) ?? Promise.resolve(!1);
    },
    notifyWatching: i => {
      var o;
      i && ((o = n.socket()) == null || o.emit("preview-watch", {
        target: i
      }));
    },
    request: async (i, o, a = !1) => {
      var f, d, m, _;
      if (!e.requestBusy) {
        e.requestBusy = !0;
        try {
          a && !((d = (f = n.media()) == null ? void 0 : f.screen) != null && d.active) && (await ((m = n.media()) == null ? void 0 : m.startScreen(!1))), (_ = n.socket()) == null || _.emit("request", {
            target: i,
            kind: o,
            offer: a
          });
        } catch {
          t("没有屏幕权限，邀请没发出去");
        } finally {
          e.requestBusy = !1;
        }
      }
    },
    end: i => {
      var o;
      return (o = n.socket()) == null ? void 0 : o.emit("end", i);
    },
    mute: async i => {
      var o, a;
      if (e.muteBusy) return !1;
      e.muteBusy = !0, n.publish({
        voiceStatus: "Switching"
      });
      try {
        const f = n.media();
        return await (f == null ? void 0 : f.toggleMute((f == null ? void 0 : f.privateVoiceStatus(i)) === "On", i)), n.publish({
          muted: ((o = n.media()) == null ? void 0 : o.privateVoiceStatus()) === "Muted"
        }), !0;
      } catch {
        return t("麦克风打不开，检查一下权限或设备再试"), !1;
      } finally {
        e.muteBusy = !1, n.publish({
          voiceStatus: ((a = n.media()) == null ? void 0 : a.privateVoiceStatus()) || "Not in a call"
        });
      }
    },
    activeMic: () => {
      var i;
      return ((i = n.media()) == null ? void 0 : i.activeMic()) ?? null;
    }
  };
}

export { trackSocketPreview, subscribeSocketRoom, createSocketBridge, createOfficeActions };
