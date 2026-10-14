import { attachOfficeNotifications } from './officeNotifications';
import { attachChatClient } from "./chatClient";
import { retainPresent, sameCallStates } from './presenceResources';
import { useDesktopPreview } from './useDesktopPreview';
import { useFileTransfers } from './useFileTransfers';
import { useMeetings } from "./useMeetings";
import { alertForExpiry, withCallAlert, type CallAlert } from './callAlertRules';
import { createAnnotationChannel } from './annotationChannel';
import { createSeatRequests } from './seatRequests';
import { watchInputPresence, deskSensorLabel } from './presenceInput';
import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { OfficeMedia } from "./media";
import { resolveAppearance, storeAppearance, type Appearance } from "./look";
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
import { attachPreviewIncoming, mergePreviewBatch } from './previewFrames';
import { PEEK_GLOW_FADE_MS } from './dockRules';
import { sendDockGreeting } from './dockGreeting';

/** How often relayed positions and thumbnails are folded into React state. */
const MOTION_FLUSH_MS = 100;

export function useOffice(account: Account) {
  const [people, setPeople] = useState<Person[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  /** Accounts shown out of the space: their conversations are hidden until they log
   *  in again, for everybody (user, 2026-09-15). */
  const [hiddenContacts, setHiddenContacts] = useState<string[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [outgoing, setOutgoing] = useState<Request[]>([]);
  // Missed-call popups; newest last, dismissed by hand or by their own timer.
  const [callAlerts, setCallAlerts] = useState<CallAlert[]>([]);
  // Whether Windows itself answers "is somebody at this machine" (desktop app) or only
  // this window's own input can (browser). Shown in the footer (user, 2026-09-15).
  const [systemIdleSensor, setSystemIdleSensor] = useState(false);
  const requestsRef = useRef<Request[]>([]);
  requestsRef.current = requests;
  const outgoingRef = useRef<Request[]>([]);
  outgoingRef.current = outgoing;
  const peopleRef = useRef<Person[]>([]);
  peopleRef.current = people;
  const requestBusy = useRef(false);
  const sitSequence = useRef(0);
  const invitationIds = useRef(new Set<string>());
  const selectingForInvite = useRef<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const receivePreviews = useRef(true);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [motions, setMotions] = useState<Record<string, Motion>>({});
  const [videos, setVideos] = useState<Record<string, MediaStream>>({});
  /** Scopes in which this client is currently the one sharing the screen. */
  const myShareScopes = useRef<string[]>([]);
  const sessionsRef = useRef<Session[]>([]);
  sessionsRef.current = sessions;
  const [connected, setConnected] = useState(false);
  const [sharing, setSharing] = useState(false);
  /** 同一个值的 ref：socket 回调里要读它（绿光在共享屏幕时不闪）。 */
  const sharingRef = useRef(false);
  sharingRef.current = sharing;
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
  // Built after the refs it closes over: reading `socket` inside the factory while it
  // was still in its temporal dead zone crashed the whole page on load.
  // Strokes are never held here: the only copy is the one the desktop layer paints
  // onto the sharer's own screen, which the screen share then carries to everyone.
  const annotations = useMemo(() => createAnnotationChannel({
    socket,
    notify: (message: string) => setNotice(message),
    // 会议里的共享是 MeetingScreenShare 自己采集的，不经过 media.screen —— 两处都要算
    // "我正在共享"，否则中继过来的笔迹与清空会被这一句挡掉（用户 2026-09-22）。
    sharingScreen: () => media.current?.screen?.active === true
      || media.current?.meetingStatus().sharing === true,
  }), []);
  const desktopPreview = useDesktopPreview(socket, connected, people.find(p => p.id === myId), setNotice);
  // 工位相关的两个服务端请求（认领/放弃、管理员释放）：逻辑在 src/seatRequests.ts。
  const seatApi = useMemo(() => createSeatRequests(socket, setNotice), []);
  // 文件直传：拖到任务栏头像上就发，直接落进对方的接收文件夹（用户 2026-09-22）。
  const fileTransfers = useFileTransfers(setNotice);
  const meetings = useMeetings(socket, media, connected);
  // Which screens we are publishing, so the marks can be cleared for exactly those
  // when the share ends however it ends.
  //
  // 同一个数组也是**分享者自己那块"清屏"按钮**要用的范围（用户 2026-10-14）。它必须
  // 在渲染里算得出来（按钮要挂在页面上），所以不再只写进 ref —— `boardScope` 是它的
  // 第一项（一个人同时只可能在共享一块屏幕）。
  const shareScopes = sessions
    .filter((session) => session.screenOwners?.includes(socket.current?.id || ''))
    .map((session) => session.room);
  if (meetings.sharing && meetings.active?.room) shareScopes.push(meetings.active.room);
  const boardScope = shareScopes[0];
  /**
   * 我这里**现在真的在收音**吗：麦克风轨活着，而且当前焦点房间（会议或某通私聊）的麦
   * 是开的。只给头像条那圈波纹用 —— 静音时它必须归零（用户 2026-10-14）。
   */
  const micTrackLive = !!media.current?.activeMic()
    && (meetings.mic || Object.values(callStates).some(
      state => state.voice === '已开启' || state.voice === '声音已暂停'));
  useEffect(() => {
    myShareScopes.current = shareScopes;
    // 数组每次渲染都是新的，用它当依赖会让 effect 每帧都跑；这里按内容比较。
  }, [shareScopes.join('|')]);
  // 会议共享那条路不会经过 shareInCall()，标注浮层要在这里主动挂上：不然参会者画在
  // 共享画面上的笔迹没有地方落，看起来就是"会议里不能标注"（用户 2026-09-22）。
  useEffect(() => {
    if (meetings.sharing) annotations.attach();
  }, [meetings.sharing]);
  // 换屏（右键画面里的显示器，或成员列表里的自己）不只换低清预览：正在进行的屏幕
  // 共享也要实时切到新屏幕，会议与私聊各自把已发布的轨原地换掉（用户 2026-09-15）。
  useEffect(() => {
    const onDisplayChanged = () => {
      void media.current?.switchScreenDisplay().catch(() => undefined);
    };
    window.addEventListener('office-display-changed', onDisplayChanged);
    return () => window.removeEventListener('office-display-changed', onDisplayChanged);
  }, []);
  // Leaving a meeting must drop its marks too: the room name is reused, so a later
  // share there would otherwise start with the previous strokes on it.
  const meetingRoom = meetings.active?.room ?? null;
  useEffect(() => { annotations.trackMeetingRoom(meetingRoom); }, [meetingRoom]);
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
    // 在座 / 离桌: watch this machine's mouse and keyboard and report the two
    // transitions over the socket. Works in the browser as well as in the app.
    const presence = watchInputPresence(s);
    setSystemIdleSensor(presence.usesSystemIdle());
    // Any way our own share ends - explicit stop, takeover, hanging up, leaving the
    // meeting, losing the session - funnels through the media layer, which reports
    // it here so the marks and the desktop layer never outlive the share.
    m.onScreenStopped = () => annotations.clearShareMarks(myShareScopes.current);
    s.on("connect", () => {
      setPreviews({});
      setConnected(true);
      setMyId(s.id || "");
      s.emit("join", {
        name: account.name,
        appearance: resolveAppearance(account.appearance),
        // Only the desktop app can paint on the sharer's real screen. A browser cannot
        // (there is no native layer out there), so it says so and everyone else can stop
        // offering to draw on a screen that could never show the marks.
        annotate: Boolean(window.officeDesktop?.annotations),
      });
      s.emit("preview-allowed", receivePreviews.current);
    });
    // Leaving the office must NOT cost the saved password (user, 2026-09-15: "客户端
    // 老是记不住用户账号和密码"). Only an explicit logout clears it; every other way
    // a session can end - displaced by another device, revoked cookie, shown out by an
    // administrator - hands the person back to the login form with the account and
    // password already filled in.
    const sessionEnded = (message: string, forget = false) => window.dispatchEvent(
      new CustomEvent("office-session-ended", { detail: { message, forget } }));
    s.on("session-replaced", () => sessionEnded("账号已在其他地方登录，请重新登录"));
    s.on("connect_error", (error) => {
      if (error.message === "请先登录") sessionEnded("登录已失效，请重新登录");
      else setNotice("连接失败，正在重试…");
    });
    s.on("disconnect", (reason) => {
      m.signalingDisconnected();
      // Offline there is nothing to annotate and nobody to annotate for, so no mark
      // or desktop layer may be left behind.
      annotations.detach();
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
    // Being shown out means leaving the space now: the server has revoked the session
    // and closed the socket, so return to the login screen instead of sitting in a
    // dead office. The saved account stays, so the next launch still remembers it.
    s.on("kicked", (info: { message?: string }) =>
      sessionEnded(info?.message || "你被管理员请出了空间，请重新登录"),
    );
    const chat = attachChatClient(s, account.id, setMessages, setNotice,
      (rows, hidden) => { setContacts(rows); setHiddenContacts(hidden); });
    chatClient.current = chat;
    // Thumbnails are batched for the same reason as motion: several people sharing
    // used to mean a render per JPEG, and the 3D scene only needs the newest frame.
    // 规则本身在 src/previewFrames.ts（纯函数，单独测）。
    const detachPreviews = attachPreviewIncoming(s, batch => setPreviews(old =>
      mergePreviewBatch(old, batch,
        { selfId: s.id, receiving: receivePreviews.current }).next));
    // 有人在小窗里悬停我的头像 → 我的所有屏幕四周**慢慢**亮起一圈绿光（用户 2026-09-18：
    // 「有人来看我了，提示我一下」；2026-09-20：停够 2 秒才开始、用 2 秒渐渐亮起来），同时让
    // 头像条把那个人拉出来——只是看一眼，所以是小一号、不打招呼（mode 缺省就是 peek）。
    s.on("watched", (payload: { from?: string; name?: string; appearance?: Appearance }) => {
      const desktop = window.officeDesktop;
      if (!desktop) return;
      void desktop.previewGlow?.({ sharing: sharingRef.current, fade: PEEK_GLOW_FADE_MS })
        .catch(() => undefined);
      if (payload?.from) sendDockGreeting({ id: payload.from, name: payload.name,
        appearance: payload.appearance, mode: 'peek' });
    });
    s.on("request", (r: Request) => {
      invitationIds.current.add(r.id); setRequests((old) => [...old, r]);
    });
    s.on('request-sent', (r: Request) => setOutgoing(old => [...old.filter(x => x.id !== r.id), r]));
    // A ring nobody answered: the popup in the corner tells the caller to try again and
    // the callee that they missed a call (user, 2026-09-15).
    s.on("request-expired", (payload: { id: string; reason?: string } | string) => {
      const id = typeof payload === 'string' ? payload : payload?.id;
      const alert = alertForExpiry(payload, outgoingRef.current, requestsRef.current,
        (socketId) => peopleRef.current.find((person) => person.id === socketId)?.name || '');
      invitationIds.current.delete(id);
      if (selectingForInvite.current === id) m.cancelScreenSelection();
      setOutgoing((old) => old.filter((r) => r.id !== id));
      setRequests((old) => old.filter((r) => r.id !== id));
      if (alert) setCallAlerts((old) => withCallAlert(old, alert));
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
    annotations.attachSocket(s);
    // 文件直传的收发两端都挂在这条 socket 上（不含发送动作本身，那由拖拽触发）。
    fileTransfers.attach(s);
    s.connect();
    return () => {
      presence.stop();
      clearTimeout(motionTimer);
      detachPreviews();
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
      annotations.attach();
    } catch {
      setNotice("未开始共享。可以重新选择窗口或屏幕。");
    }
  }
  async function respond(id: string, accept: boolean) {
    if (requestBusy.current) return;
    requestBusy.current = true;
    const request = requests.find(r => r.id === id);
    if (!request) { requestBusy.current = false; return; }
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
  return {
    people,
    seats,
    messages,
    contacts,
    hiddenContacts,
    /** Account id, so a local echo can use the same ink colour other people see. */
    accountId: account.id,
    requests,
    outgoing,
    /** Missed-call popups for the bottom-right corner. */
    callAlerts,
    dismissCallAlert: (id: string) => setCallAlerts((old) => old.filter((entry) => entry.id !== id)),
    /** How 在座 / 离桌 is judged here; the footer shows it so the mode is never a guess. */
    deskSensorLabel: deskSensorLabel(systemIdleSensor),
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
    /**
     * 我这里**现在真的在收音**吗：麦克风轨活着，而且当前焦点房间（会议或某通私聊）
     * 的麦克风是开的。只给头像条那圈音量波纹用 —— 静音时它必须归零
     * （用户 2026-10-14：「状态栏静音按钮需要一个声音波纹来看麦的音量」）。
     */
    micLive: micTrackLive,
    /** 量音量用（`OfficeMedia` 里它是箭头函数，可以单独传出去）。 */
    activeMic: () => media.current?.activeMic() ?? null,
    notice,
    /** 文件直传：`files.rows` / `files.sendFiles` / 完事的打开与打开文件夹（用户 2026-09-22）。 */
    files: fileTransfers,
    myId,
    name,
    adminKick: seatApi.adminKick,
    share,
    shareInCall: async (id: string) => {
      try { await media.current?.shareInCall(id); annotations.attach(); return true; }
      catch (error) { setNotice(error instanceof Error ? error.message : '未开始共享，请重试'); return false; }
    },
    stopShare: () => { media.current?.stopScreen(); annotations.detach(); },
    clientId: account.id,
    setRemoteAudioMuted: (room: string, muted: boolean) => media.current?.setRemoteAudioMuted(room, muted),
    /**
     * 我正在共享的那张画布（没有共享时是 undefined）。分享者自己那块预览上的「清屏」
     * 按它清 —— 浮层是鼠标穿透的，分享者只能从自己页面擦（用户 2026-10-14）。
     */
    boardScope,
    /** Whiteboard actions for one shared screen; the layer itself lives in the channel. */
    annotation: {
      draw: annotations.draw,
      clear: annotations.clear,
      undo: annotations.undo,
    },
    meetings,
    respond,
    claimSeat: seatApi.claimSeat,
    setNotice,
    sitSpot: (id: string | null) => new Promise<boolean>(resolve => {      const sequence = ++sitSequence.current;
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
    setAppearance: (appearance: Appearance) => {
      storeAppearance(appearance);
      socket.current?.emit("appearance", appearance);
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
    /**
     * 告诉服务端"我正在看某人的工位"（小窗悬停头像时每秒会报一次）。服务端转给他，
     * 他的屏幕就闪一圈绿光——用户 2026-09-18：「有人来看我了，提示我一下」。
     */
    notifyWatching: (targetId: string) => {
      if (!targetId) return;
      socket.current?.emit("preview-watch", { target: targetId });
    },
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
        return true;
      } catch { setNotice('麦克风开启失败，请检查权限或设备后重试'); return false; }
      finally { muteBusy.current = false; setVoiceStatus(media.current?.privateVoiceStatus() || '未通话'); }
    },
  };
}
