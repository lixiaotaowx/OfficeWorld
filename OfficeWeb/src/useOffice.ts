import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { OfficeMedia } from "./media";
import type { Person, Message, Request, Session } from "./types";

export function useOffice() {
  const [people, setPeople] = useState<Person[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [videos, setVideos] = useState<Record<string, MediaStream>>({});
  const [connected, setConnected] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState(
    "先在右侧选一个工位，再点击「占用这个工位」。也可以打开另一个标签页测试协作。",
  );
  const [myId, setMyId] = useState("");
  const socket = useRef<Socket>();
  const media = useRef<OfficeMedia>();
  useEffect(() => {
    const s = io({ autoConnect: false });
    socket.current = s;
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
      setConnected(true);
      setMyId(s.id || "");
      s.emit("join", {
        name:
          sessionStorage.getItem("office-name") ||
          "访客 " + Math.floor(Math.random() * 900 + 100),
      });
    });
    s.on("disconnect", () => {
      setConnected(false);
      setPeople([]);
      setNotice("连接已断开，正在重连…");
    });
    s.on("people", setPeople);
    s.on("notice", setNotice);
    s.on("chat", (message: Message) =>
      setMessages((old) => [...old.slice(-99), message]),
    );
    s.on("preview", ({ id, image }) =>
      setPreviews((old) => {
        const next = { ...old };
        if (image) next[id] = image;
        else delete next[id];
        return next;
      }),
    );
    s.on("request", (r: Request) => setRequests((old) => [...old, r]));
    s.on("request-expired", (id) =>
      setRequests((old) => old.filter((r) => r.id !== id)),
    );
    s.on("session", (session: Session) => {
      setSessions((old) => [...old, session]);
      void m.start(session);
    });
    s.on("session-end", (id) => {
      m.end(id);
      setSessions((old) => old.filter((x) => x.id !== id));
    });
    s.connect();
    return () => {
      m.dispose();
      s.disconnect();
    };
  }, []);
  // The meeting flag drives the shared LiveKit room, so any participant
  // joining or leaving is reflected without extra signalling messages.
  // Only a change in our own flag acts, otherwise every presence update
  // would trigger another join attempt.
  const inMeetingRoom = useRef(false);
  useEffect(() => {
    const me = people.find((p) => p.id === myId);
    if (!me || me.meeting === inMeetingRoom.current) return;
    inMeetingRoom.current = me.meeting;
    if (me.meeting) void media.current?.joinMeeting();
    else media.current?.leaveMeeting();
  }, [people, myId]);
  async function share() {
    if (!connected) return setNotice("请等待连接恢复");
    if (sharing) return media.current?.stopScreen();
    try {
      await media.current?.startScreen();
    } catch {
      setNotice("未开始共享。可以重新选择窗口或屏幕。");
    }
  }
  async function meeting() {
    const joined = people.find((p) => p.id === myId)?.meeting;
    if (!connected) return setNotice("请等待连接恢复");
    if (!joined) {
      try {
        await media.current?.prepareMic();
      } catch {
        return setNotice("需要麦克风权限才能进入语音会议");
      }
    }
    socket.current?.emit("meeting", !joined);
    setNotice(joined ? "已离开会议" : "已进入会议室，等待同事加入");
  }
  function respond(id: string, accept: boolean) {
    socket.current?.emit("respond", { id, accept });
    setRequests((old) => old.filter((r) => r.id !== id));
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
  return {
    people,
    messages,
    requests,
    sessions,
    previews,
    videos,
    connected,
    sharing,
    muted,
    notice,
    myId,
    share,
    meeting,
    respond,
    claimSeat,
    setNotice,
    setPreviewAllowed: (allowed: boolean) =>
      socket.current?.emit("preview-allowed", allowed),
    chat: (text: string) => socket.current?.emit("chat", text),
    request: (target: string, kind: "screen" | "voice") =>
      socket.current?.emit("request", { target, kind }),
    end: (id: string) => socket.current?.emit("end", id),
    mute: () => {
      media.current?.toggleMute(!muted);
      setMuted(!muted);
    },
  };
}
