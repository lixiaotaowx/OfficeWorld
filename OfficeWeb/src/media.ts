// Client media layer. LiveKit owns the whole media plane: it negotiates SDP/ICE,
// routes the streams and relays through its own TURN, so this file no longer
// performs any WebRTC signalling itself. socket.io stays the consent channel and
// the server mints a room token only after a request was actually approved.
import { Room, RoomEvent, Track } from "livekit-client";
import type { Socket } from "socket.io-client";
import type { Session } from "./types";

interface TokenReply {
  url?: string;
  token?: string;
  room?: string;
  error?: string;
}

export class OfficeMedia {
  screen: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private muted = false;
  private disposed = false;
  /** LiveKit room name -> connection. */
  private rooms = new Map<string, Room>();
  /** Rooms we are currently connecting to, so a re-render cannot join twice. */
  private pending = new Map<string, Promise<Room | null>>();
  /** Rooms we still want; a late connect for a dropped room gets closed. */
  private wanted = new Set<string>();
  /** session id -> room name, so ending a session can release its room. */
  private sessionRoom = new Map<string, string>();
  private audio = new Map<string, HTMLMediaElement>();
  private previewTimer?: ReturnType<typeof setInterval>;
  private previewVideo?: HTMLVideoElement;

  constructor(
    private socket: Socket,
    private onNotice: (message: string) => void,
    private onVideo: (id: string, stream: MediaStream | null) => void,
    private onSharing: (sharing: boolean) => void,
  ) {}

  /** Ask the server for a room token. The server decides whether we may join. */
  private token(room: string) {
    return new Promise<TokenReply>((resolve) => {
      this.socket
        .timeout(8000)
        .emit("livekit-token", room, (error: unknown, reply: TokenReply) => {
          if (error) resolve({ error: "获取媒体令牌超时" });
          else resolve(reply ?? { error: "媒体令牌无效" });
        });
    });
  }

  private sessionOf(roomName: string) {
    for (const [id, name] of this.sessionRoom) {
      if (name === roomName) return id;
    }
    return "";
  }

  private roomStillNeeded(roomName: string) {
    for (const name of this.sessionRoom.values()) {
      if (name === roomName) return true;
    }
    return false;
  }

  private wire(room: Room, roomName: string) {
    room
      .on(RoomEvent.TrackSubscribed, (track) => {
        const id = this.sessionOf(roomName);
        if (track.kind === Track.Kind.Video) {
          this.onVideo(id, new MediaStream([track.mediaStreamTrack]));
          return;
        }
        const key = `${id}:${track.sid}`;
        const element = track.attach();
        element.autoplay = true;
        document.body.appendChild(element);
        void element.play?.().catch(() => {
          this.onNotice("浏览器阻止自动播放，请点击恢复声音");
        });
        this.audio.set(key, element);
      })
      .on(RoomEvent.TrackUnsubscribed, (track) => {
        const id = this.sessionOf(roomName);
        if (track.kind === Track.Kind.Video) {
          this.onVideo(id, null);
          return;
        }
        const key = `${id}:${track.sid}`;
        const element = this.audio.get(key);
        element?.remove();
        this.audio.delete(key);
      })
      .on(RoomEvent.Disconnected, () => {
        this.rooms.delete(roomName);
        const id = this.sessionOf(roomName);
        if (id) this.onVideo(id, null);
      });
  }

  /**
   * Connect to one LiveKit room. Repeated calls while a connection is still
   * being established must share that attempt: two simultaneous connects would
   * arrive with the same identity and the server would drop one of them.
   */
  private join(roomName: string) {
    this.wanted.add(roomName);
    const existing = this.rooms.get(roomName);
    if (existing) return Promise.resolve<Room | null>(existing);
    const inFlight = this.pending.get(roomName);
    if (inFlight) return inFlight;
    const attempt = this.connect(roomName).finally(() =>
      this.pending.delete(roomName),
    );
    this.pending.set(roomName, attempt);
    return attempt;
  }

  private async connect(roomName: string): Promise<Room | null> {
    const reply = await this.token(roomName);
    if (!reply.token || !reply.url) {
      this.onNotice(reply.error || "无法加入媒体房间");
      return null;
    }
    const room = new Room({ adaptiveStream: true, dynacast: true });
    this.wire(room, roomName);
    try {
      await room.connect(reply.url, reply.token);
    } catch {
      room.disconnect();
      this.onNotice("媒体连接失败，请检查服务器是否可达");
      return null;
    }
    // The room may have been left while this connection was in flight.
    if (this.disposed || !this.wanted.has(roomName)) {
      room.disconnect();
      return null;
    }
    this.rooms.set(roomName, room);
    return room;
  }

  private async publishMic(room: Room) {
    const stream = await this.prepareMic();
    const track = stream.getAudioTracks()[0];
    if (!track) return;
    if (room.localParticipant.getTrackPublication(Track.Source.Microphone)) return;
    await room.localParticipant.publishTrack(track, {
      name: "microphone",
      source: Track.Source.Microphone,
    });
  }

  private async publishScreen(room: Room) {
    const track = this.screen?.getVideoTracks()[0];
    if (!track) {
      this.onNotice("屏幕共享已停止");
      return;
    }
    if (room.localParticipant.getTrackPublication(Track.Source.ScreenShare)) return;
    await room.localParticipant.publishTrack(track, {
      name: "screen",
      source: Track.Source.ScreenShare,
    });
  }

  /** Attach local media to an approved session. Public entry point. */
  async start(session: Session) {
    this.sessionRoom.set(session.id, session.room);
    const room = await this.join(session.room);
    if (!room) return;
    try {
      if (session.kind === "screen" && session.owner === this.socket.id) {
        await this.publishScreen(room);
      } else if (session.kind === "voice") {
        await this.publishMic(room);
      }
    } catch (error) {
      this.onNotice(error instanceof Error ? error.message : "媒体发布失败");
    }
  }

  /** Join or leave the shared meeting room. */
  async joinMeeting() {
    const room = await this.join("meeting");
    if (!room) return;
    try {
      await this.publishMic(room);
    } catch {
      this.onNotice("麦克风不可用，无法发言");
    }
  }

  leaveMeeting() {
    this.wanted.delete("meeting");
    const room = this.rooms.get("meeting");
    if (!room) return;
    room.disconnect();
    this.rooms.delete("meeting");
  }

  async startScreen() {
    this.stopScreen();
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 15, max: 20 } },
      audio: false,
    });
    this.screen = stream;
    stream.getVideoTracks()[0].onended = () => this.stopScreen();
    // Low-bandwidth seat-grid thumbnails; unrelated to the LiveKit video stream.
    const video = document.createElement("video");
    video.muted = true;
    video.srcObject = stream;
    await video.play();
    this.previewVideo = video;
    this.socket.emit("sharing", true);
    this.onSharing(true);
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 270;
    const context = canvas.getContext("2d")!;
    this.previewTimer = setInterval(() => {
      if (video.readyState < 2) return;
      context.fillStyle = "#101818";
      context.fillRect(0, 0, 480, 270);
      const scale = Math.min(480 / video.videoWidth, 270 / video.videoHeight);
      const width = video.videoWidth * scale;
      const height = video.videoHeight * scale;
      context.drawImage(
        video,
        (480 - width) / 2,
        (270 - height) / 2,
        width,
        height,
      );
      this.socket.emit("preview", canvas.toDataURL("image/jpeg", 0.55));
    }, 700);
    // Viewers approved before this point already sit in our screen room.
    for (const [name, room] of this.rooms) {
      if (name.startsWith("screen-")) {
        await this.publishScreen(room).catch(() => undefined);
      }
    }
  }

  stopScreen() {
    clearInterval(this.previewTimer);
    this.screen?.getTracks().forEach((track) => track.stop());
    this.screen = null;
    if (this.previewVideo) this.previewVideo.srcObject = null;
    if (!this.disposed) {
      this.socket.emit("sharing", false);
      this.onSharing(false);
    }
  }

  async prepareMic() {
    if (!this.micStream?.active) {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      this.micStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !this.muted));
    }
    return this.micStream;
  }

  toggleMute(muted: boolean) {
    this.muted = muted;
    this.micStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  /** Release one approved session; the room closes once nobody needs it. */
  end(sessionId: string) {
    const roomName = this.sessionRoom.get(sessionId);
    this.sessionRoom.delete(sessionId);
    this.onVideo(sessionId, null);
    if (!roomName || this.roomStillNeeded(roomName)) return;
    this.wanted.delete(roomName);
    const room = this.rooms.get(roomName);
    room?.disconnect();
    this.rooms.delete(roomName);
  }

  dispose() {
    this.disposed = true;
    this.stopScreen();
    for (const room of this.rooms.values()) room.disconnect();
    this.rooms.clear();
    this.pending.clear();
    this.wanted.clear();
    this.sessionRoom.clear();
    this.audio.forEach((element) => element.remove());
    this.audio.clear();
    this.micStream?.getTracks().forEach((track) => track.stop());
    this.micStream = null;
  }
}
