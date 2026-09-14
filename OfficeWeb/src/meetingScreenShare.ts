import { Track, type LocalTrack } from 'livekit-client';
import type { Socket } from 'socket.io-client';
import type { MediaRooms } from './mediaRooms';
import { waitForScreenPermission } from './screenPermission';

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
      const publication = room.localParticipant.getTrackPublication(Track.Source.ScreenShare);
      if (publication?.track) await room.localParticipant.unpublishTrack(publication.track, true);
    }).catch(() => {});
    // Only a share that was actually running counts as "ended": releasing an
    // already-free room must not wipe marks that belong to somebody else's screen.
    if (capture) this.onStopped?.();
  }
  async start(name: string) {
    const room = this.rooms.get(name);
    if (room?.state !== 'connected') throw Error('会议媒体尚未连接');
    const generation = (this.generations.get(name) || 0) + 1;
    this.generations.set(name, generation);
    const tracks = await room.localParticipant.createScreenTracks({ audio: false,
      resolution: { width: 1920, height: 1080, frameRate: 15 } });
    const capture: Capture = { lease: crypto.randomUUID(), tracks, cancelled: false };
    const valid = () => !capture.cancelled && this.currentRoom() === name &&
      this.generations.get(name) === generation && this.rooms.get(name) === room;
    try {
      if (!valid()) throw Error('共享已取消');
      this.captures.set(name, capture);
      await this.action(name, capture.lease, 'claim');
      if (!valid()) throw Error('共享已被替换或取消');
      await this.rooms.run(name, async (current, connected) => {
        if (!valid() || !connected()) throw Error('共享已取消');
        await waitForScreenPermission(current, () => valid() && connected());
        for (const track of tracks) {
          await current.localParticipant.publishTrack(track, { source: Track.Source.ScreenShare });
          track.mediaStreamTrack.addEventListener('ended', () => {
            if (this.captures.get(name) === capture) this.stop(name);
          }, { once: true });
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
