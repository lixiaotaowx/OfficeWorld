import { Track, type LocalTrack } from 'livekit-client';
import type { Socket } from 'socket.io-client';
import type { MediaRooms } from './mediaRooms';
import { swapScreenTrack } from './screenSwitch';
import { waitForScreenPermission } from './screenPermission';
import { screenAudioConstraints, syncScreenAudio, unpublishScreen, noScreenAudio } from './screenAudio';

type Capture = { lease: string; tracks: LocalTrack[]; cancelled: boolean };

/** Capture first; claim the floor only after the user selected a screen. */
export class MeetingScreenShare {
  private captures = new Map<string, Capture>();
  private generations = new Map<string, number>();
  /** Called when our own meeting screen share really ends (stop, takeover, leave). */
  onStopped?: () => void;
  constructor(private socket: Socket, private rooms: MediaRooms,
    private currentRoom: () => string | null, private notice: (text: string) => void) {
    socket.on('meeting-screen-replaced', this.replaced);
  }
  private replaced = ({ room, lease }: { room: string; lease: string }) => {
    if (this.captures.get(room)?.lease !== lease) return;
    this.stop(room);
    this.notice('另一位成员已开始共享屏幕，你的屏幕共享已停止，语音保留');
  };
  private async action(room: string, lease: string, action: 'claim' | 'release') {
    if (!this.socket.connected) throw Error('连接已断开');
    const reply = await this.socket.timeout(10000).emitWithAck('meeting-screen', { room, lease, action });
    if (!reply?.ok) throw Error(reply?.error || '屏幕切换失败');
  }
  stop(name: string) {
    this.generations.set(name, (this.generations.get(name) || 0) + 1);
    const capture = this.captures.get(name);
    this.captures.delete(name);
    if (capture) {
      capture.cancelled = true;
      capture.tracks.forEach(track => track.stop());
      void this.action(name, capture.lease, 'release').catch(() => {});
    }
    void this.rooms.run(name, async room => {
      await unpublishScreen(room);
    }).catch(() => {});
    // Only a share that was actually running counts as "ended": releasing an
    // already-free room must not wipe marks that belong to somebody else's screen.
    if (capture) this.onStopped?.();
  }
  /**
   * 会议里换屏：重新采集当前选中的显示器（桌面端每次采集都取选中的那块），
   * 把画面原地换到已经发布的轨上——参会者不断线、不用重新同意
   * （用户 2026-09-15：会议与视频聊天里切换屏幕也要实时切过去）。
   */
  async switchDisplay(): Promise<boolean> {
    let switched = false;
    for (const [name, capture] of [...this.captures]) {
      if (capture.cancelled) continue;
      const room = this.rooms.get(name);
      if (room?.state !== 'connected') continue;
      try {
        const tracks = await room.localParticipant.createScreenTracks({ audio: screenAudioConstraints,
          resolution: { width: 1920, height: 1080, frameRate: 15 }, contentHint: 'text' });
        let adopted = false;
        try {
          await this.rooms.run(name, async (current, connected) => {
            if (capture.cancelled || this.captures.get(name) !== capture || !connected()) return;
            const next = tracks.find(track => track.mediaStreamTrack.kind === 'video')?.mediaStreamTrack;
            if (!next) return;
            const clone = next.clone();
            try {
              if (!await swapScreenTrack(current, clone)) { clone.stop(); return; }
            } catch (error) { clone.stop(); throw error; }
            if (capture.cancelled || this.captures.get(name) !== capture || !connected()) {
              clone.stop(); return;
            }
            capture.tracks.forEach(track => track.stop());
            capture.tracks = tracks;
            adopted = true;
            next.addEventListener('ended', () => {
              if (this.captures.get(name) === capture && capture.tracks === tracks) this.stop(name);
            }, { once: true });
            const audio = tracks.find(track => track.mediaStreamTrack.kind === 'audio')?.mediaStreamTrack;
            await syncScreenAudio(current, audio).catch(async () => {
              await syncScreenAudio(current);
              this.notice('画面已切换，但共享声音失败，请重新共享');
            });
            if (!audio) this.notice(noScreenAudio);
            switched = true;
          });
        } finally { if (!adopted) tracks.forEach(track => track.stop()); }
      } catch { /* 一次换屏失败不该弄断已经在跑的共享 */ }
    }
    return switched;
  }

  async start(name: string) {
    const room = this.rooms.get(name);
    if (room?.state !== 'connected') throw Error('会议媒体尚未连接');
    const generation = (this.generations.get(name) || 0) + 1;
    this.generations.set(name, generation);
    const tracks = await room.localParticipant.createScreenTracks({ audio: screenAudioConstraints,
      resolution: { width: 1920, height: 1080, frameRate: 15 }, contentHint: 'text' });
    const capture: Capture = { lease: crypto.randomUUID(), tracks, cancelled: false };
    const valid = () => !capture.cancelled && this.currentRoom() === name &&
      this.generations.get(name) === generation && this.rooms.get(name) === room;
    try {
      if (!valid()) throw Error('共享已取消');
      if (!tracks.some(track => track.mediaStreamTrack.kind === 'audio')) this.notice(noScreenAudio);
      this.captures.set(name, capture);
      await this.action(name, capture.lease, 'claim');
      if (!valid()) throw Error('共享已被替换或取消');
      await this.rooms.run(name, async (current, connected) => {
        if (!valid() || !connected()) throw Error('共享已取消');
        await waitForScreenPermission(current, () => valid() && connected(),
          tracks.some(track => track.mediaStreamTrack.kind === 'audio'));
        for (const track of tracks) {
          const audio = track.mediaStreamTrack.kind === 'audio';
          try {
            await current.localParticipant.publishTrack(track, {
              source: audio ? Track.Source.ScreenShareAudio : Track.Source.ScreenShare,
              ...(audio ? { dtx: false, forceStereo: true } : {}),
            });
          } catch (error) {
            if (!audio) throw error;
            track.stop();
            this.notice('画面已共享，但共享声音发布失败，请停止后重新共享');
          }
          if (!audio) {
            track.mediaStreamTrack.addEventListener('ended', () => {
              if (this.captures.get(name) === capture && capture.tracks === tracks) this.stop(name);
            }, { once: true });
          }
          if (!valid()) throw Error('共享已被替换');
        }
      });
    } catch (error) {
      tracks.forEach(track => track.stop());
      if (this.captures.get(name) === capture) this.stop(name);
      throw error;
    }
  }
  dispose() {
    this.socket.off('meeting-screen-replaced', this.replaced);
    for (const room of this.generations.keys()) this.stop(room);
  }
}
