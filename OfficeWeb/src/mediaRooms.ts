import { Room } from 'livekit-client';

interface Token { url?: string; token?: string; error?: string }
interface Connection {
  room: Room;
  ready: Promise<Room | null>;
  tail: Promise<unknown>;
  cancelled: boolean;
}

/** One generation and one operation queue per room, including teardown. */
export class MediaRooms {
  private entries = new Map<string, Connection>();
  private closing = new Map<string, Promise<unknown>>();
  constructor(private token: (name: string) => Promise<Token>,
    private wire: (room: Room, name: string) => void,
    private notice: (message: string) => void) {}

  current(name: string, room: Room) {
    const entry = this.entries.get(name);
    return !!entry && !entry.cancelled && entry.room === room;
  }
  get(name: string) { return this.entries.get(name)?.room; }
  values() { return [...this.entries].map(([name, entry]) => [name, entry.room] as const); }

  join(name: string) {
    const existing = this.entries.get(name);
    if (existing) return existing.ready;
    const room = new Room({ adaptiveStream: false, dynacast: true });
    const entry: Connection = { room, ready: Promise.resolve(null), tail: Promise.resolve(), cancelled: false };
    this.entries.set(name, entry);
    this.wire(room, name);
    entry.ready = (async () => {
      await this.closing.get(name);
      if (!this.current(name, room)) return null;
      try {
        const reply = await this.token(name);
        if (!this.current(name, room)) return null;
        if (!reply.url || !reply.token) throw Error(reply.error || '无法加入媒体房间');
        await room.connect(reply.url, reply.token);
        return this.current(name, room) ? room : null;
      } catch (error) {
        if (this.current(name, room)) {
          this.notice(error instanceof Error ? error.message : '媒体连接失败');
        }
        return null;
      }
    })();
    return entry.ready;
  }

  run<T>(name: string, action: (room: Room, valid: () => boolean) => Promise<T>): Promise<T> {
    const entry = this.entries.get(name);
    if (!entry) return Promise.reject(Error('媒体尚未连接，请等待恢复'));
    const valid = () => this.current(name, entry.room) && entry.room.state === 'connected';
    const result = entry.tail.catch(() => undefined).then(async () => {
      await entry.ready;
      if (!valid()) throw Error('媒体连接正在恢复，请稍后重试');
      return action(entry.room, valid);
    });
    entry.tail = result.catch(() => undefined);
    return result;
  }

  close(name: string) {
    const entry = this.entries.get(name);
    if (!entry) return;
    entry.cancelled = true;
    this.entries.delete(name);
    entry.room.localParticipant?.trackPublications.forEach(publication => publication.track?.stop());
    // Never close a peer connection while capture/publication is using it.
    const done = Promise.allSettled([entry.ready, entry.tail])
      .then(() => entry.room.disconnect())
      .catch(error => this.notice(`媒体清理失败：${String(error)}`));
    this.closing.set(name, done);
    void done.finally(() => {
      if (this.closing.get(name) === done) this.closing.delete(name);
    });
  }
  dispose() { for (const name of this.entries.keys()) this.close(name); }
}
