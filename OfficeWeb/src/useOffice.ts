import { attachOfficeNotifications } from './officeNotifications';
import { attachChatClient } from "./chatClient";
import { retainPresent } from './presenceResources';
import { useDesktopPreview } from './useDesktopPreview';
import { useMeetings } from "./useMeetings";
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

export function useOffice(account: Account) {
  const [people, setPeople] = useState<Person[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
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
  const [connected, setConnected] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('未通话');
  const [callStates, setCallStates] = useState<Record<string, ReturnType<OfficeMedia['callStatus']>>>({});
  const muteBusy = useRef(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setVoiceStatus(media.current?.privateVoiceStatus() || '未通话');
      setCallStates(Object.fromEntries(sessions.map(s => [s.id, media.current?.callStatus(s.id) ||
        { voice: '连接中', connected: false, sharing: false }])));
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
    s.on("motion", (motion: Motion & { id: string }) =>
      setMotions((old) => ({ ...old, [motion.id]: motion })),
    );
    s.on("notice", setNotice);
    s.on("kicked", (info: { message?: string }) =>
      setNotice(info?.message || "你被管理员请出了工位"),
    );
    const chat = attachChatClient(s, account.id, setMessages, setNotice, setContacts);
    chatClient.current = chat;
    s.on("preview", ({ id, image }) =>
      setPreviews((old) => {
        const next = { ...old };
        if (image && (id === s.id || receivePreviews.current)) next[id] = image;
        else delete next[id];
        return next;
      }),
    );
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
    s.connect();
    return () => {
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
    requests,
    outgoing,
    cancelRequest: (id: string) => socket.current?.emit('cancel-request', id),
    sessions,
    previews,
    motions,
    videos,
    connected,
    sharing: window.officeDesktop ? desktopPreview.active : sharing,
    muted,
    voiceStatus,
    callStates,
    notice,
    myId,
    name,
    adminKick,
    share,
    shareInCall: async (id: string) => {
      try { await media.current?.shareInCall(id); }
      catch (error) { setNotice(error instanceof Error ? error.message : '未开始共享，请重试'); }
    },
    stopShare: () => media.current?.stopScreen(),
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
