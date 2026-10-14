// Client media layer. LiveKit owns the whole media plane: it negotiates SDP/ICE,
// routes the streams and relays through its own TURN, so this file no longer
// performs any WebRTC signalling itself. socket.io stays the consent channel and
// the server mints a room token only after a request was actually approved.
import { Room, RoomEvent, Track } from "livekit-client";
import type { Socket } from "socket.io-client";
import type { Session } from "./types";
import { MediaRooms } from "./mediaRooms";
import { MediaAudioFocus } from "./mediaAudioFocus";
import { MeetingScreenShare } from './meetingScreenShare';
import { startScreenThumbnails, type ScreenThumbnails } from './screenThumbnails';
import { captureSelectedScreen, switchLiveScreen } from './screenSwitch';
import { meetingVideoKey } from './meetingVideo';
import { publishPrivateScreen, unpublishScreen, noScreenAudio } from './screenAudio';

interface TokenReply {
  url?: string;
  token?: string;
  room?: string;
  error?: string;
}

export class OfficeMedia {
  screen: MediaStream | null = null;
  /** Called whenever our own screen share ends, whatever ended it. */
  onScreenStopped?: () => void;
  private disposed = false;
  private connections = new MediaRooms(name => this.token(name),
    (room, name) => this.wire(room, name), message => this.onNotice(message));
  private audioInitialized = new Set<string>();
  private screenPublic = false;
  private meetingMic = false;
  private recovery?: ReturnType<typeof setTimeout>;
  private screenGeneration = 0;
  private meetingGeneration = 0;
  /** session id -> room name, so ending a session can release its room. */
  private sessionRoom = new Map<string, string>();
  private voiceRooms = new Set<string>();
  private privateSessions = new Map<string, Session>();
  private privateRecovery = new Map<string, ReturnType<typeof setTimeout>>();
  /** Rooms whose incoming audio this machine has muted (never affects the sender). */
  private remoteMuted = new Set<string>();
  private audioFocus = new MediaAudioFocus(this.connections, name => {
    for (const [key, element] of this.audio)
      element.muted = !name || !key.startsWith(`${name}:`) || this.remoteMuted.has(name);
    if (this.meetingRoom && name !== this.meetingRoom) this.meetingMic = false;
  }, message => this.onNotice(message));
  private audio = new Map<string, HTMLMediaElement>();
  private previewVideo?: HTMLVideoElement;
  /** Ambient thumbnail loop for our own shared screen. */
  private thumbnails?: ScreenThumbnails;
  private meetingRoom: string | null = null;
  private meetingVideos = new Set<string>();
  private meetingScreens: MeetingScreenShare;

  constructor(
    private socket: Socket,
    private onNotice: (message: string) => void,
    private onVideo: (id: string, stream: MediaStream | null) => void,
    private onSharing: (sharing: boolean) => void,
  ) {
    this.meetingScreens = new MeetingScreenShare(this.socket, this.connections,
      () => this.meetingRoom, text => this.onNotice(text));
    // A meeting share ending (stop, takeover, leave) needs the same cleanup as a
    // private one; both funnel into the single onScreenStopped callback.
    this.meetingScreens.onStopped = () => this.onScreenStopped?.();
    document.addEventListener('pointerdown', this.resumeAudio);
  }

  private resumeAudio = () => {
    for (const [, room] of this.connections.values()) void room.startAudio().catch(() => undefined);
  };

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
      .on(RoomEvent.LocalTrackPublished, publication => {
        if (!this.connections.current(roomName, room)) return;
        if (!roomName.startsWith('meeting-') || publication.source !== Track.Source.ScreenShare) return;
        const track = publication.track?.mediaStreamTrack;
        if (track) {
          const key = `${roomName}:local`;
          this.meetingVideos.add(key);
          this.onVideo(key, new MediaStream([track]));
        }
      })
      .on(RoomEvent.LocalTrackUnpublished, publication => {
        if (!this.connections.current(roomName, room)) return;
        if (publication.source !== Track.Source.ScreenShare) return;
        const key = `${roomName}:local`;
        this.meetingVideos.delete(key); this.onVideo(key, null);
      })
      .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (!this.connections.current(roomName, room)) return;
        const id = this.sessionOf(roomName);
        if (track.kind === Track.Kind.Video) {
          const key = roomName.startsWith('meeting-') ? meetingVideoKey(roomName, participant, track.sid) : id;
          if (roomName.startsWith('meeting-')) this.meetingVideos.add(key);
          this.onVideo(key, new MediaStream([track.mediaStreamTrack]));
          return;
        }
        const key = `${roomName}:${track.sid}`;
        const element = track.attach();
        element.autoplay = true;
        element.muted = this.audioFocus.current !== roomName || this.remoteMuted.has(roomName);
        document.body.appendChild(element);
        void element.play?.().catch(() => {
          this.onNotice("浏览器阻止自动播放，请点击恢复声音");
        });
        this.audio.set(key, element);
      })
      .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (!this.connections.current(roomName, room)) return;
        const id = this.sessionOf(roomName);
        if (track.kind === Track.Kind.Video) {
          const key = roomName.startsWith('meeting-') ? meetingVideoKey(roomName, participant, track.sid) : id;
          this.meetingVideos.delete(key); this.onVideo(key, null);
          return;
        }
        const key = `${roomName}:${track.sid}`;
        const element = this.audio.get(key);
        if (element) track.detach(element);
        element?.remove();
        this.audio.delete(key);
      })
      .on(RoomEvent.Disconnected, () => {
        if (!this.connections.current(roomName, room)) return;
        this.connections.close(roomName);
        this.clearRoomAudio(roomName);
        for (const key of this.meetingVideos) {
          if (key.startsWith(`${roomName}:`)) {
            this.onVideo(key, null); this.meetingVideos.delete(key);
          }
        }

        const id = this.sessionOf(roomName);
        if (id) this.onVideo(id, null);
        const privateSession = [...this.privateSessions.values()].find(session => session.room === roomName);
        if (!this.disposed && privateSession) {
          this.onNotice('通话媒体中断，正在重连');
          this.retryPrivate(privateSession);
        }
        if (!this.disposed && this.meetingRoom === roomName) {
          this.meetingScreens.stop(roomName);
          this.onNotice('会议媒体连接中断，正在重新连接；屏幕共享需重新选择');
          clearTimeout(this.recovery);
          this.recovery = setTimeout(() => {
            if (this.meetingRoom === roomName) void this.joinMeeting(roomName, this.meetingMic);
          }, 1500);
        }
      });
  }

  /** Silence (or restore) everything coming from one room on this machine only. */
  setRemoteAudioMuted(room: string, muted: boolean) {
    if (muted) this.remoteMuted.add(room);
    else this.remoteMuted.delete(room);
    for (const [key, element] of this.audio) {
      if (!key.startsWith(`${room}:`)) continue;
      element.muted = muted || this.audioFocus.current !== room;
    }
  }

  remoteAudioMuted(room: string) {
    return this.remoteMuted.has(room);
  }

  private clearRoomAudio(roomName: string) {
    for (const [key, element] of this.audio) {
      if (!key.startsWith(`${roomName}:`)) continue;
      element.remove();
      this.audio.delete(key);
    }
  }

  private join(roomName: string) { return this.connections.join(roomName); }

  private async publishScreen(room: Room) {
    await this.connections.run(room.name, async current => {
      const owns = () => [...this.privateSessions.values()].some(session => session.room === room.name &&
        session.screenOwners?.includes(this.socket.id || ''));
      if (!owns()) return;
      const stream = this.screen;
      if (!stream) throw Error('屏幕共享已停止');
      await publishPrivateScreen(current, stream, () => owns() && this.screen === stream,
        message => this.onNotice(message));
    });
  }

  private retryPrivate(session: Session) {
    clearTimeout(this.privateRecovery.get(session.id));
    this.privateRecovery.set(session.id, setTimeout(() => {
      this.privateRecovery.delete(session.id);
      const current = this.privateSessions.get(session.id);
      if (current && !this.disposed) void this.start(current);
    }, 2500));
  }

  /** Upgrade an existing pair in place; never duplicate its audio room. */
  async start(session: Session) {
    const previous = this.privateSessions.get(session.id);
    this.privateSessions.set(session.id, session);
    this.sessionRoom.set(session.id, session.room);
    this.voiceRooms.add(session.room);
    this.audioFocus.add(session.room);
    const reconnecting = this.connections.get(session.room)?.state !== "connected";
    const room = await this.join(session.room);
    if (this.privateSessions.get(session.id) !== session) return true;
    if (!room) {
      this.connections.close(session.room);
      this.retryPrivate(session); return true;
    }
    const ownsScreen = session.screenOwners?.includes(this.socket.id || '') ??
      (session.kind === 'screen' && session.owner === this.socket.id);
    if (ownsScreen && this.screen?.active) {
      try { await this.publishScreen(room); }
      catch { this.onNotice('屏幕发布失败，语音通话保留，请重新共享'); }
    } else if (!ownsScreen) {
      await this.connections.run(session.room, async current => {
        await unpublishScreen(current);
      }).catch(() => {});
      if (previous?.screenOwners?.includes(this.socket.id || '')) {
        if (session.screenOwners?.length) this.onNotice('对方已接替屏幕共享，语音通话保留');
        if (!this.screenPublic && ![...this.privateSessions.values()].some(s =>
            s.screenOwners?.includes(this.socket.id || ''))) this.stopScreen();
      }
    }
    // Screen permission failures must not discard the other working medium.
    if (!this.audioInitialized.has(session.room) || reconnecting && (!previous || this.audioFocus.current === session.room) &&
        !room.localParticipant.isMicrophoneEnabled && this.audioFocus.intended(session.room)) {
      this.audioInitialized.add(session.room);
      try { await this.audioFocus.activate(session.room); }
      catch { this.onNotice('麦克风未开启，画面仍可使用；请检查权限或设备后重试开麦'); }
    }
    return true;
  }

  /** Meeting audio belongs to this room, independent of private calls. */
  async joinMeeting(name: string, microphone = false) {
    if (this.disposed) return false;
    if (this.meetingRoom && this.meetingRoom !== name) this.leaveMeeting();
    this.meetingRoom = name;
    this.meetingMic = microphone;
    this.audioFocus.add(name);
    const generation = this.meetingGeneration;
    const room = await this.join(name);
    if (this.meetingRoom !== name || generation !== this.meetingGeneration) return false;
    if (!room) {
      this.connections.close(name);
      clearTimeout(this.recovery);
      this.recovery = setTimeout(() => {
        if (this.meetingRoom === name) void this.joinMeeting(name, this.meetingMic);
      }, 5000);
      return false;
    }
    try { await this.audioFocus.activate(name, microphone); }
    catch { this.onNotice('麦克风不可用，请重新开启麦克风'); }
    return true;
  }

  leaveMeeting() {
    this.meetingGeneration++;
    const name = this.meetingRoom;
    if (name) this.meetingScreens.stop(name);
    this.meetingRoom = null;
    this.meetingMic = false;
    clearTimeout(this.recovery);
    if (!name) return;
    this.audioFocus.remove(name);
    this.connections.close(name);
    this.clearRoomAudio(name);
    for (const key of this.meetingVideos) this.onVideo(key, null);
    this.meetingVideos.clear();
  }

  async meetingMicrophone(enabled: boolean) {
    const name = this.meetingRoom;
    if (!name) throw Error('会议音频尚未连接');
    if (enabled) await this.audioFocus.activate(name, true);
    else await this.audioFocus.mute(name);
    if (this.meetingRoom === name) this.meetingMic = enabled;
  }
  async meetingScreen(enabled: boolean) {
    const name = this.meetingRoom;
    if (!name) throw Error('会议尚未连接');
    if (enabled) await this.meetingScreens.start(name);
    else this.meetingScreens.stop(name);
  }

  meetingStatus() {
    const room = this.meetingRoom ? this.connections.get(this.meetingRoom) : undefined;
    return {
      connected: room?.state === 'connected',
      mic: !!room?.localParticipant.isMicrophoneEnabled &&
        room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track?.mediaStreamTrack.readyState === 'live',
      sharing: !!room?.localParticipant.isScreenShareEnabled,
    };
  }

  async startScreen(publicPreview = true) {
    this.stopScreen();
    const generation = this.screenGeneration;
    const stream = await captureSelectedScreen();
    if (this.disposed || generation !== this.screenGeneration) {
      stream.getTracks().forEach(track => track.stop()); return;
    }
    this.screen = stream;
    if (!stream.getAudioTracks().length) this.onNotice(noScreenAudio);
    this.screenPublic = publicPreview;
    this.onVideo('local-screen', stream);
    stream.getVideoTracks()[0].onended = () => { if (this.screen === stream) this.stopScreen(); };
    // Low-bandwidth seat-grid thumbnails; unrelated to the LiveKit video stream.
    const thumbnails = await startScreenThumbnails({
      stream,
      current: () => this.screen === stream,
      publicPreview,
      publish: image => this.socket.emit("preview", image),
    });
    if (!thumbnails.video) return;
    this.thumbnails = thumbnails;
    this.previewVideo = thumbnails.video;
    this.socket.emit("sharing", true);
    this.onSharing(true);
    // Viewers approved before this point already sit in our screen room.
    for (const [name, room] of this.connections.values()) {
      if ([...this.privateSessions.values()].some(session => session.room === name &&
          (session.screenOwners?.includes(this.socket.id || "") ?? session.owner === this.socket.id))) {
        await this.publishScreen(room).catch(error => this.onNotice(String(error)));
      }
    }
  }

  cancelScreenSelection() { this.stopScreen(); }

  /**
   * 跟着新选的屏幕走（用户 2026-09-15：会议与视频聊天里切换屏幕也要实时切过去）。
   * 会议共享自己管采集，先问它；私聊这条把正在发布的画面原地换轨，通话不中断。
   */
  async switchScreenDisplay(): Promise<boolean> {
    const meeting = await this.meetingScreens.switchDisplay();
    const privateShare = await switchLiveScreen({
      live: () => this.screen,
      owner: previous => !this.disposed && this.screen === previous,
      adopt: next => {
        this.screen = next;
        this.onVideo('local-screen', next);
        next.getVideoTracks()[0].onended = () => { if (this.screen === next) this.stopScreen(); };
        if (this.previewVideo) {
          this.previewVideo.srcObject = next;
          void this.previewVideo.play().catch(() => undefined);
        }
      },
      publishers: () => this.connections.values()
        .filter(([name]) => this.voiceRooms.has(name)).map(([, room]) => room),
      run: (room, action) => this.connections.run(room.name, action),
    });
    return privateShare || meeting;
  }

  async shareInCall(id: string) {
    const captured = !this.screen?.active;
    try {
      if (captured) await this.startScreen(false);
      if (!this.screen?.active || !this.privateSessions.has(id)) throw Error('屏幕未选择或通话已结束');
      const answer = await this.socket.timeout(10000).emitWithAck('private-screen', id);
      if (!answer?.ok) throw Error(answer?.error || '屏幕切换失败');
    } catch (error) {
      if (captured) this.stopScreen();
      throw error;
    }
  }

  stopScreen() {
    this.screenGeneration++;
    for (const [name] of this.connections.values()) {
      if (!this.voiceRooms.has(name)) continue;
      void this.connections.run(name, async room => {
        await unpublishScreen(room);
      }).catch(error => { if (!this.disposed) this.onNotice(String(error)); });
    }
    const hadScreen = Boolean(this.screen);
    this.thumbnails?.stop();
    this.thumbnails = undefined;
    this.screen?.getTracks().forEach((track) => track.stop());
    this.screen = null;
    this.onVideo('local-screen', null);
    if (this.previewVideo) this.previewVideo.srcObject = null;
    if (!this.disposed) {
      this.socket.emit("sharing", false);
      this.onSharing(false);
    }
    // Every way our own screen can end - explicit stop, being taken over, the call
    // ending, leaving a meeting, losing the session - funnels through here, so this
    // is where the annotation marks and the desktop layer are cleaned up.
    if (hadScreen) this.onScreenStopped?.();
  }

  async prepareMic() {
    // Permission preflight only. Each LiveKit room owns its own microphone track.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
  }

  async toggleMute(muted: boolean, sessionId?: string) {
    const name = sessionId ? this.sessionRoom.get(sessionId) :
      (this.audioFocus.current && this.voiceRooms.has(this.audioFocus.current) ? this.audioFocus.current : [...this.voiceRooms][0]);
    if (!name) throw Error('尚未建立私聊');
    if (muted) await this.audioFocus.mute(name);
    else await this.audioFocus.activate(name, true);
  }

  privateVoiceStatus(sessionId?: string) {
    const name = sessionId ? this.sessionRoom.get(sessionId) :
      (this.audioFocus.current && this.voiceRooms.has(this.audioFocus.current) ? this.audioFocus.current : [...this.voiceRooms][0]);
    if (!name) return '未通话';
    const room = this.connections.get(name);
    if (room?.state !== 'connected') return '连接中';
    if (this.audioFocus.current !== name) return '声音已暂停';
    const track = room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track?.mediaStreamTrack;
    if (room.localParticipant.isMicrophoneEnabled && track?.readyState === 'live') return '已开启';
    return this.audioFocus.intended(name) ? '等待授权或开启失败' : '已静音';
  }

  callStatus(sessionId: string) {
    const name = this.sessionRoom.get(sessionId);
    const room = name ? this.connections.get(name) : undefined;
    return { voice: this.privateVoiceStatus(sessionId), connected: room?.state === 'connected',
      sharing: !!room?.localParticipant.isScreenShareEnabled };
  }

  /** Release one approved session; the room closes once nobody needs it. */
  signalingDisconnected() {
    this.stopScreen();
    for (const id of [...this.sessionRoom.keys()]) this.end(id);
  }

  end(sessionId: string) {
    clearTimeout(this.privateRecovery.get(sessionId));
    this.privateRecovery.delete(sessionId);
    this.privateSessions.delete(sessionId);
    const roomName = this.sessionRoom.get(sessionId);
    this.sessionRoom.delete(sessionId);
    this.onVideo(sessionId, null);
    if (!roomName || this.roomStillNeeded(roomName)) return;
    this.audioInitialized.delete(roomName);
    this.voiceRooms.delete(roomName);
    this.audioFocus.remove(roomName);
    this.connections.close(roomName);
    this.clearRoomAudio(roomName);
    if (!this.screenPublic && this.screen && ![...this.privateSessions.values()].some(s =>
      s.screenOwners?.includes(this.socket.id || ""))) this.stopScreen();
  }

  dispose() {
    this.disposed = true;
    this.meetingScreens.dispose();
    this.leaveMeeting();
    this.stopScreen();
    document.removeEventListener('pointerdown', this.resumeAudio);
    this.connections.dispose();
    this.privateRecovery.forEach(timer => clearTimeout(timer));
    this.privateRecovery.clear();
    this.privateSessions.clear();
    this.voiceRooms.clear();
    this.sessionRoom.clear();
    this.audio.forEach(element => element.remove());
    this.audio.clear();
  }
}
