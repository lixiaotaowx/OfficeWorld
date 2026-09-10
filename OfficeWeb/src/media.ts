import type { Socket } from "socket.io-client";
import type { Session } from "./types";

export class OfficeMedia {
  screen: MediaStream | null = null;
  mic: MediaStream | null = null;
  private peers = new Map<string, RTCPeerConnection>();
  private audio = new Map<string, HTMLAudioElement>();
  private candidates = new Map<string, RTCIceCandidateInit[]>();
  private previewTimer?: ReturnType<typeof setInterval>;
  private previewVideo?: HTMLVideoElement;
  private pendingSignals = new Map<string, any[]>();

  constructor(
    private socket: Socket,
    private onNotice: (message: string) => void,
    private onVideo: (id: string, stream: MediaStream | null) => void,
    private onSharing: (sharing: boolean) => void,
  ) {}

  async startScreen() {
    this.stopScreen();
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 15, max: 20 } },
      audio: false,
    });
    this.screen = stream;
    stream.getVideoTracks()[0].onended = () => this.stopScreen();
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
  }

  stopScreen() {
    clearInterval(this.previewTimer);
    this.screen?.getTracks().forEach((track) => track.stop());
    this.screen = null;
    if (this.previewVideo) this.previewVideo.srcObject = null;
    this.socket.emit("sharing", false);
    this.onSharing(false);
  }

  async prepareMic() {
    if (!this.mic?.active) {
      this.mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    }
    return this.mic;
  }

  toggleMute(muted: boolean) {
    this.mic?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  async start(session: Session) {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      this.peers.set(session.id, pc);
      pc.onicecandidate = (event) => {
        if (event.candidate)
          this.socket.emit("signal", {
            id: session.id,
            data: { candidate: event.candidate.toJSON() },
          });
      };
      pc.ontrack = (event) => {
        const stream = event.streams[0] ?? new MediaStream([event.track]);
        if (event.track.kind === "video") this.onVideo(session.id, stream);
        else {
          const audio = document.createElement("audio");
          audio.srcObject = stream;
          audio.autoplay = true;
          this.audio.set(session.id, audio);
          audio
            .play()
            .catch(() => this.onNotice("浏览器阻止自动播放，请点击恢复声音"));
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") {
          this.onNotice("媒体连接失败；跨网络连接还需要配置 TURN 服务");
          this.socket.emit("end", session.id);
        }
      };
      if (session.kind === "screen") {
        if (session.owner === this.socket.id) {
          if (!this.screen) throw new Error("屏幕共享已停止");
          this.screen
            .getVideoTracks()
            .forEach((track) => pc.addTrack(track, this.screen!));
        }
      } else {
        const mic = await this.prepareMic();
        mic.getTracks().forEach((track) => pc.addTrack(track, mic));
      }
      if (session.initiator) {
        await pc.setLocalDescription(await pc.createOffer());
        this.socket.emit("signal", {
          id: session.id,
          data: { description: pc.localDescription },
        });
      }
      for (const data of this.pendingSignals.get(session.id) ?? []) {
        await this.signal(session.id, data);
      }
      this.pendingSignals.delete(session.id);
    } catch (error) {
      this.onNotice(error instanceof Error ? error.message : "媒体启动失败");
      this.socket.emit("end", session.id);
      this.end(session.id);
    }
  }

  async signal(id: string, data: any) {
    const pc = this.peers.get(id);
    if (!pc) {
      this.pendingSignals.set(id, [
        ...(this.pendingSignals.get(id) ?? []),
        data,
      ]);
      return;
    }
    try {
      if (data.description) {
        await pc.setRemoteDescription(data.description);
        for (const candidate of this.candidates.get(id) ?? [])
          await pc.addIceCandidate(candidate);
        this.candidates.delete(id);
        if (data.description.type === "offer") {
          await pc.setLocalDescription(await pc.createAnswer());
          this.socket.emit("signal", {
            id,
            data: { description: pc.localDescription },
          });
        }
      } else if (data.candidate) {
        if (pc.remoteDescription) await pc.addIceCandidate(data.candidate);
        else
          this.candidates.set(id, [
            ...(this.candidates.get(id) ?? []),
            data.candidate,
          ]);
      }
    } catch {
      this.onNotice("媒体协商失败，请结束后重试");
    }
  }

  resumeAudio() {
    this.audio.forEach((audio) =>
      audio.play().catch(() => this.onNotice("声音播放被阻止")),
    );
  }

  end(id: string) {
    this.peers.get(id)?.close();
    this.peers.delete(id);
    const audio = this.audio.get(id);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
    }
    this.audio.delete(id);
    this.candidates.delete(id);
    this.pendingSignals.delete(id);
    this.onVideo(id, null);
    if (
      ![...this.peers.values()].some((pc) =>
        pc.getSenders().some((s) => s.track?.kind === "audio"),
      )
    ) {
      this.mic?.getTracks().forEach((track) => track.stop());
      this.mic = null;
    }
  }

  dispose() {
    this.stopScreen();
    [...this.peers.keys()].forEach((id) => this.end(id));
    this.mic?.getTracks().forEach((track) => track.stop());
  }
}
