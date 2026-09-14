import { attachOfficeNotifications } from './officeNotifications';
import { attachChatClient } from "./chatClient";
import { retainPresent, sameCallStates } from './presenceResources';
import { useDesktopPreview } from './useDesktopPreview';
import { useMeetings } from "./useMeetings";
import type { AnnotateMessage } from './annotations';
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { OfficeMedia } from "./media";
import { resolveCharacterId, type CharacterId } from "./characters";
import type {
  Person,
  ChatContact,
  Message,
  Motion,
  Request,
  Session,
  SeatOwner,
} from "./types";

import type { Account } from "./AccountGate";

/** How often relayed positions and thumbnails are folded into React state. */
const MOTION_FLUSH_MS = 100;
const PREVIEW_FLUSH_MS = 500;

export function useOffice(account: Account) {
  const [people, setPeople] = useState<Person[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  /** Accounts shown out of the space: their conversations are hidden until they log
   *  in again, for everybody (user, 2026-09-15). */
  const [hiddenContacts, setHiddenContacts] = useState<string[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [outgoing, setOutgoing] = useState<Request[]>([]);
  const requestBusy = useRef(false);
  const sitSequence = useRef(0);
  const invitationIds = useRef(new Set<string>());
  const selectingForInvite = useRef<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const receivePreviews = useRef(true);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [motions, setMotions] = useState<Record<string, Motion>>({});
  const [videos, setVideos] = useState<Record<string, MediaStream>>({});
  // Strokes are never held here: the only copy is the one the desktop layer paints
  // onto the sharer's own screen, which the screen share then carries to everyone.
  const annotationStroke = useRef<{ scope: string; id: string } | null>(null);
  const annotationSeq = useRef(0);
  const annotationLayerReady = useRef(false);
  /** Show the desktop layer over the shared display (Electron app only). */
  const attachAnnotationLayer = () => {
    const bridge = window.officeDesktop?.annotations;
    if (!bridge || annotationLayerReady.current) return;
    annotationLayerReady.current = true;
    void bridge.attach().then((result) => {
      if (result && result.ok === false) setNotice(result.reason === 'window-share'
        ? '当前共享的是一个窗口，标注只显示在共享画面上。'
        : '这台设备无法在桌面上显示标注层。');
    }).catch(() => { annotationLayerReady.current = false; });
  };
  const detachAnnotationLayer = () => {
    annotationLayerReady.current = false;
    // Wipe the layer's canvas before hiding it: a stale board would otherwise be
    // shown again the next time a share starts.
    void window.officeDesktop?.annotations?.clear().catch(() => undefined);
    void window.officeDesktop?.annotations?.detach().catch(() => undefined);
  };
  /**
   * Marks are per shared screen, so they must not survive the share: a meeting
   * reuses its room name, and the next share there would otherwise start with the
   * previous person's strokes still on it. The board itself lives on the sharer's
   * desktop layer, so cleaning up means clearing that layer and telling everybody
   * watching the same screen to drop theirs.
   */
  const clearShareMarks = (scopes: string[]) => {
    if (scopes.length && socket.current?.connected)
      for (const scope of scopes) socket.current.emit('annotate-clear', { scope });
    detachAnnotationLayer();
  };
  /** Scopes in which this client is currently the one sharing the screen. */
  const myShareScopes = useRef<string[]>([]);
  const sessionsRef = useRef<Session[]>([]);
  sessionsRef.current = sessions;
  const [connected, setConnected] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('未通话');
  const [callStates, setCallStates] = useState<Record<string, ReturnType<OfficeMedia['callStatus']>>>({});
  const muteBusy = useRef(false);
  useEffect(() => {
    // No call, no polling: this used to rebuild the status object twice a second
    // even when nobody was on a call, re-rendering the whole app for nothing.
    if (!sessions.length) {
      setCallStates((old) => (Object.keys(old).length ? {} : old));
      return;
    }
    const timer = setInterval(() => {
      setVoiceStatus(media.current?.privateVoiceStatus() || '未通话');
      const next: Record<string, ReturnType<OfficeMedia['callStatus']>> = Object.fromEntries(
        sessions.map(s => [s.id, media.current?.callStatus(s.id) ||
          { voice: '连接中', connected: false, sharing: false }]));
      // Keep the previous object when nothing changed: a new identity would
      // re-render every consumer twice a second.
      setCallStates((old) => sameCallStates(old, next) ? old : next);
    }, 500);
    return () => clearInterval(timer);
  }, [sessions]);
  const [notice, setNotice] = useState(
    `欢迎回来，${account.name}。工位会随账号保留。`,
  );
  const [myId, setMyId] = useState("");
  const [seats, setSeats] = useState<(SeatOwner | null)[]>([]);
  const name = account.name;
  const socket = useRef<Socket>();
  const media = useRef<OfficeMedia>();
  const desktopPreview = useDesktopPreview(socket, connected, people.find(p => p.id === myId), setNotice);
  const meetings = useMeetings(socket, media, connected);
  // Which screens we are publishing, so the marks can be cleared for exactly those
  // when the share ends however it ends.
  useEffect(() => {
    const mine = sessions
      .filter((session) => session.screenOwners?.includes(socket.current?.id || ''))
      .map((session) => session.room);
    if (meetings.sharing && meetings.active?.room) mine.push(meetings.active.room);
    myShareScopes.current = mine;
  }, [sessions, meetings.sharing, meetings.active?.room]);
  // Leaving a meeting must drop its marks too: the room name is reused, so a later
  // share there would otherwise start with the previous strokes on it.
  const meetingRoom = meetings.active?.room ?? null;
  const previousMeetingRoom = useRef<string | null>(null);
  useEffect(() => {
    const previous = previousMeetingRoom.current;
    if (previous && previous !== meetingRoom) clearShareMarks([previous]);
    previousMeetingRoom.current = meetingRoom;
  }, [meetingRoom]);
  const chatClient = useRef<ReturnType<typeof attachChatClient>>();
  useEffect(() => {
    const s = io({ autoConnect: false });
    socket.current = s;
    const disposeNotifications = attachOfficeNotifications(s, account.id);
    const m = new OfficeMedia(
      s,
      setNotice,
      (id, stream) => {
        setVideos((old) => {
          const next = { ...old };
          if (stream) next[id] = stream;
          else delete next[id];
          return next;
        });
      },
      setSharing,
    );
    media.current = m;
    // Any way our own share ends - explicit stop, takeover, hanging up, leaving the
    // meeting, losing the session - funnels through the media layer, which reports
    // it here so the marks and the desktop layer never outlive the share.
    m.onScreenStopped = () => clearShareMarks(myShareScopes.current);
    s.on("connect", () => {
      setPreviews({});
      setConnected(true);
      setMyId(s.id || "");
      s.emit("join", {
        name: account.name,
        character: resolveCharacterId(account.character),
      });
      s.emit("preview-allowed", receivePreviews.current);
    });
    const sessionEnded = (message: string) => window.dispatchEvent(
      new CustomEvent("office-session-ended", { detail: message }));
    s.on("session-replaced", sessionEnded);
    s.on("connect_error", (error) => {
      if (error.message === "请先登录") sessionEnded("登录已失效，账号可能已在其他地方登录，请重新登录");
      else setNotice("连接失败，正在重试…");
    });
    s.on("disconnect", (reason) => {
      m.signalingDisconnected();
      // Offline there is nothing to annotate and nobody to annotate for, so no mark
      // or desktop layer may be left behind.
      detachAnnotationLayer();
      setSessions([]);
      setRequests([]); setOutgoing([]);
      invitationIds.current.clear(); selectingForInvite.current = null;
      setConnected(false);
      setPeople([]);
      setPreviews({});
      setMotions({});
      setNotice(reason === "io server disconnect" ? "此账号已在其他窗口登录或会话已失效，请重新登录" : "连接已断开，正在重连…");
    });
    s.on("people", (members: Person[]) => {
      const present = new Set(members.map(person => person.id));
      setPeople(members);
      setPreviews(old => retainPresent(old, present));
      setMotions(old => retainPresent(old, present));
    });
    s.on("seats", setSeats);
    // Motion snapshots are keyed by player; anybody absent is simply not drawn.
    // They are batched: one moving colleague used to be one React render each, and
    // a busy room reached well over a hundred renders per second. The scene already
    // interpolates between snapshots, so 10 updates a second look identical.
    const pendingMotions: Record<string, Motion> = {};
    let motionTimer: ReturnType<typeof setTimeout> | undefined;
    s.on("motion", (motion: Motion & { id: string }) => {
      pendingMotions[motion.id] = motion;
      if (motionTimer) return;
      motionTimer = setTimeout(() => {
        motionTimer = undefined;
        const batch = { ...pendingMotions };
        for (const key of Object.keys(pendingMotions)) delete pendingMotions[key];
        setMotions((old) => ({ ...old, ...batch }));
      }, MOTION_FLUSH_MS);
    });
    s.on("notice", setNotice);
    // Being shown out means leaving the space: the server revokes the session and
    // closes the socket, so return to the login screen instead of sitting in a dead
    // office (and clear a saved desktop login, or the EXE would log straight back in).
    s.on("kicked", (info: { message?: string }) =>
      sessionEnded(info?.message || "你被管理员请出了空间，请重新登录"),
    );
    const chat = attachChatClient(s, account.id, setMessages, setNotice,
      (rows, hidden) => { setContacts(rows); setHiddenContacts(hidden); });
    chatClient.current = chat;
    // Thumbnails are batched for the same reason as motion: several people sharing
    // used to mean a render per JPEG, and the 3D scene only needs the newest frame.
    const pendingPreviews: Record<string, string | null> = {};
    let previewTimer: ReturnType<typeof setTimeout> | undefined;
    const flushPreviews = () => {
      previewTimer = undefined;
      const batch = { ...pendingPreviews };
      for (const key of Object.keys(pendingPreviews)) delete pendingPreviews[key];
      setPreviews((old) => {
        const next = { ...old };
        for (const [key, value] of Object.entries(batch)) {
          if (value !== null && (key === s.id || receivePreviews.current)) next[key] = value;
          else delete next[key];
        }
        return next;
      });
    };
    s.on("preview", ({ id, image }) => {
      pendingPreviews[id] = image ? String(image) : null;
      previewTimer ??= setTimeout(flushPreviews, PREVIEW_FLUSH_MS);
    });
    s.on("request", (r: Request) => {
      invitationIds.current.add(r.id); setRequests((old) => [...old, r]);
    });
    s.on('request-sent', (r: Request) => setOutgoing(old => [...old.filter(x => x.id !== r.id), r]));
    s.on('request-expired', (id: string) => setOutgoing(old => old.filter(x => x.id !== id)));
    s.on("request-expired", (id) => {
      invitationIds.current.delete(id);
      if (selectingForInvite.current === id) m.cancelScreenSelection();
      setRequests((old) => old.filter((r) => r.id !== id));
    });
    s.on("session", (session: Session) => {
      setSessions((old) => [...old.filter(item => item.id !== session.id), session]);
      void m.start(session).then((started) => {
        if (!started) s.emit("end", session.id);
      });
    });
    s.on("session-end", (id) => {
      m.end(id);
      setSessions((old) => old.filter((x) => x.id !== id));
    });
    // Annotation board. The desktop app additionally mirrors the strokes onto the
    // display it is sharing, so the sharer sees them while working in other apps.
    const forwardToLayer = (message: Record<string, unknown>) => {
      const bridge = window.officeDesktop?.annotations;
      if (!bridge || !media.current?.screen?.active) return;
      attachAnnotationLayer();
      void bridge.draw(message).catch(() => undefined);
    };
    s.on("annotate", (message: AnnotateMessage) => {
      forwardToLayer({ type: 'annotate', ...message });
    });
    s.on("annotate-clear", (message: { scope?: string }) => {
      forwardToLayer({ type: 'clear' });
    });
    s.on("annotate-undo", (message: { id?: string; clientId?: string; scope?: string }) => {
      void window.officeDesktop?.annotations?.draw({ type: 'undo', id: message?.id }).catch(() => undefined);
    });
    s.connect();
    return () => {
      clearTimeout(motionTimer);
      clearTimeout(previewTimer);
      disposeNotifications();
      chat.dispose();
      m.dispose();
      s.disconnect();
    };
  }, []);
  async function share() {
    if (!connected) return setNotice("请等待连接恢复");
    if (window.officeDesktop) return;
    if (sharing) return media.current?.stopScreen();
    try {
      await media.current?.startScreen();
      attachAnnotationLayer();
    } catch {
      setNotice("未开始共享。可以重新选择窗口或屏幕。");
    }
  }
  async function respond(id: string, accept: boolean) {
    if (requestBusy.current) return;
    requestBusy.current = true;
    const request = requests.find(r => r.id === id);
    let captured: MediaStream | null = null;
    try {
      if (accept && request?.kind === 'screen' && !request.offer && !media.current?.screen?.active) {
        selectingForInvite.current = id;
        await media.current?.startScreen(false);
        captured = media.current?.screen || null;
        if (!captured?.active) accept = false;
      }
    } catch { accept = false; setNotice('未授权屏幕共享，已拒绝请求'); }
    selectingForInvite.current = null;
    try {
      if (!invitationIds.current.has(id) || !socket.current?.connected) throw Error('邀请已取消或过期');
      const reply = await socket.current.timeout(10000).emitWithAck('respond', { id, accept });
      if (!reply?.ok || accept && !reply.accepted) throw Error(reply?.error || '邀请未接通');
    } catch (error) {
      if (captured && media.current?.screen === captured) media.current.stopScreen();
      setNotice(error instanceof Error ? error.message : '邀请未接通，请重新邀请');
    } finally {
      invitationIds.current.delete(id);
      setRequests((old) => old.filter((r) => r.id !== id));
      requestBusy.current = false;
    }
  }
  /** Claim a workstation (or pass null to give it up). Resolves to success. */
  async function claimSeat(seat: number | null) {
    const reply = await new Promise<{
      ok: boolean;
      seat?: number | null;
      error?: string;
    }>((resolve) => {
      const active = socket.current;
      if (!active) return resolve({ ok: false, error: "尚未连接" });
      active.timeout(6000).emit("seat", seat, (error: unknown, answer: never) => {
        if (error) resolve({ ok: false, error: "工位请求超时" });
        else resolve(answer ?? { ok: false, error: "工位请求失败" });
      });
    });
    setNotice(
      reply.ok
        ? seat === null
          ? "已离开工位"
          : `已占用 ${seat + 1} 号工位`
        : reply.error || "无法占用该工位",
    );
    return reply.ok;
  }
  /** Ask the server to free a permanently held desk (admin only). */
  async function adminKick(seat: number, password: string) {
    const reply = await new Promise<{
      ok: boolean;
      seat?: number;
      name?: string;
      error?: string;
    }>((resolve) => {
      const active = socket.current;
      if (!active) return resolve({ ok: false, error: "尚未连接" });
      active
        .timeout(6000)
        .emit("admin", { password, seat }, (error: unknown, answer: never) => {
          if (error) resolve({ ok: false, error: "管理请求超时" });
          else resolve(answer ?? { ok: false, error: "管理请求失败" });
        });
    });
    return reply;
  }
  return {
    people,
    seats,
    messages,
    contacts,
    hiddenContacts,
    requests,
    outgoing,
    cancelRequest: (id: string) => socket.current?.emit('cancel-request', id),
    sessions,
    previews,
    motions,
    videos,
    connected,
    // Only a real screen share keeps the 3D scene drawing while the window is out of
    // focus. The ambient desk preview does not: it refreshes on its own slower
    // out-of-focus interval, and the scene stays frozen (user, 2026-09-14/15).
    sharing,
    // In a browser the low-resolution preview comes from an authorised screen share
    // (media.ts), so the status line has to speak about that path instead.
    previewReason: window.officeDesktop || !sharing
      ? desktopPreview.reason : '我的工位预览：共享中（浏览器）',
    muted,
    voiceStatus,
    callStates,
    notice,
    myId,
    name,
    adminKick,
    share,
    shareInCall: async (id: string) => {
      try { await media.current?.shareInCall(id); attachAnnotationLayer(); }
      catch (error) { setNotice(error instanceof Error ? error.message : '未开始共享，请重试'); }
    },
    stopShare: () => { media.current?.stopScreen(); detachAnnotationLayer(); },
    clientId: account.id,
    setRemoteAudioMuted: (room: string, muted: boolean) => media.current?.setRemoteAudioMuted(room, muted),
    /** Whiteboard actions for one shared screen. */
    annotation: {
      draw(scope: string, points: [number, number][], done = false) {
        const active = socket.current;
        if (!active?.connected || !points.length) return;
        if (!annotationStroke.current || annotationStroke.current.scope !== scope)
          annotationStroke.current = { scope, id: `st${(annotationSeq.current += 1)}` };
        // One layer only: the relay plus the desktop layer put the stroke on the
        // sharer's own screen, and the screen share brings it back to every viewer.
        active.emit('annotate', { scope, stroke: annotationStroke.current.id, points, done });
        if (done) annotationStroke.current = null;
      },
      clear(scope: string) {
        socket.current?.emit('annotate-clear', { scope });
        void window.officeDesktop?.annotations?.clear().catch(() => undefined);
      },
      undo(scope: string) {
        socket.current?.emit('annotate-undo', { scope });
      },
    },
    meetings,
    respond,
    claimSeat,
    setNotice,
    sitSpot: (id: string | null) => new Promise<boolean>(resolve => {
      const sequence = ++sitSequence.current;
      const active = socket.current;
      if (!active?.connected) return resolve(false);
      active.timeout(6000).emit("sit", id, (error: unknown, answer?: { ok: boolean; error?: string }) => {
        if (error) {
          // A timed-out claim may still have reached the server. Release it in socket order.
          if (sequence === sitSequence.current) active.emit("sit", null, () => {});
          setNotice("入座请求超时，请重试");
        } else if (!answer?.ok) setNotice(answer?.error || "无法入座");
        resolve(!error && answer?.ok === true);
      });
    }),
    reportMotion: (motion: Motion) => socket.current?.emit("motion", motion),
    setCharacter: (id: CharacterId) => {
      try {
        localStorage.setItem("office-character", id);
      } catch {
        // Storage may be unavailable; the server value still holds.
      }
      socket.current?.emit("character", id);
    },
    setPreviewAllowed: (allowed: boolean) => {
      receivePreviews.current = allowed;
      if (!allowed) setPreviews(old => Object.fromEntries(
        Object.entries(old).filter(([id]) => id === socket.current?.id)));
      socket.current?.emit("preview-allowed", allowed);
    },
    sendChatFile: (file: File, progress: (percent: number) => void, recipientId?: string) =>
      chatClient.current?.sendFile(file, progress, recipientId) ?? Promise.resolve(false),
    loadChatFile: (file: NonNullable<Message["attachment"]>) =>
      chatClient.current?.loadFile(file) ?? Promise.reject(Error("聊天尚未连接")),
    chat: (text: string, recipientId?: string) => chatClient.current?.send(text, recipientId) ?? Promise.resolve(false),
    request: async (target: string, kind: "screen" | "voice", offer = false) => {
      if (requestBusy.current) return;
      requestBusy.current = true;
      try {
        if (offer && !media.current?.screen?.active) await media.current?.startScreen(false);
        socket.current?.emit("request", { target, kind, offer });
      } catch { setNotice('未授权屏幕共享，邀请未发送'); }
      finally { requestBusy.current = false; }
    },
    end: (id: string) => socket.current?.emit("end", id),
    mute: async (sessionId?: string) => {
      if (muteBusy.current) return;
      muteBusy.current = true;
      setVoiceStatus('正在切换');
      try {
        await media.current?.toggleMute(media.current?.privateVoiceStatus(sessionId) === '已开启', sessionId);
        setMuted(media.current?.privateVoiceStatus() === '已静音');
      } catch { setNotice('麦克风开启失败，请检查权限或设备后重试'); }
      finally { muteBusy.current = false; setVoiceStatus(media.current?.privateVoiceStatus() || '未通话'); }
    },
  };
}
