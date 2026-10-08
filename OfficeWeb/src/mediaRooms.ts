import { Room, ScreenSharePresets } from 'livekit-client';

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
    // 屏幕共享要"看得清字"，所以发布参数是特意定的（用户 2026-09-15：接通后
    // 很久才清晰、还会突然变糊）：
    //  - 两层，且**只有两层**：一层 720p@15 垫底 + 一层 1080p@15。默认的
    //    q/h/f 三层里最低那层很小，对端先订阅到它，看起来就是"很久才清晰"；
    //    而任何一次抖动把订阅切回低层，就是"突然变糊"。留一层 720p 是因为用户
    //    明确要"弱网也能看"：下行差的对端至少拿到看得清的 720p，好网络下服务器
    //    会升到 1080p（升层速度由对端带宽估计决定，页面里没有开关能强制）。
    //    传一个 preset 就得到两层（源码 `presets.length === 1` → [low, original]）。
    //  - 码率给足：LiveKit 的默认只有 2.5 Mbps（ScreenSharePresets.h1080fps15），
    //    而它按目标的 90% 设置 x-google-start-bitrate，所以目标定得高，第一帧就
    //    接近目标码率，不用等十几秒爬坡。总上行 = 1.5 + 5 = 6.5 Mbps。
    //  - 分辨率降解由 LiveKit 对屏幕轨默认的 maintain-resolution 负责：带宽不够时
    //    掉帧、不掉清晰度。
    const room = new Room({
      adaptiveStream: false,
      dynacast: true,
      publishDefaults: {
        screenShareEncoding: { maxBitrate: 5_000_000, maxFramerate: 15 },
        screenShareSimulcastLayers: [ScreenSharePresets.h720fps15],
      },
    });
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
