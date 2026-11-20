import { Room, ScreenSharePresets } from '../vendor/livekit.js';

export class MediaRoomPool {
  entries = new Map();
  closing = new Map();

  constructor(token, wire, notice) {
    this.token = token;
    this.wire = wire;
    this.notice = notice;
  }

  current(id, room) {
    const entry = this.entries.get(id);
    return !!entry && !entry.cancelled && entry.room === room;
  }

  get(id) {
    return this.entries.get(id)?.room;
  }

  values() {
    return [...this.entries].map(([id, entry]) => [id, entry.room]);
  }

  join(id) {
    const existing = this.entries.get(id);
    if (existing) return existing.ready;
    const room = new Room({
      adaptiveStream: false,
      dynacast: true,
      publishDefaults: {
        screenShareEncoding: { maxBitrate: 5_000_000, maxFramerate: 15 },
        screenShareSimulcastLayers: [ScreenSharePresets.h720fps15],
      },
    });
    const entry = {
      room,
      ready: Promise.resolve(null),
      tail: Promise.resolve(),
      audioTail: Promise.resolve(),
      cancelled: false,
    };
    this.entries.set(id, entry);
    this.wire(room, id);
    entry.ready = (async () => {
      await this.closing.get(id);
      if (!this.current(id, room)) return null;
      try {
        const credentials = await this.token(id);
        if (!this.current(id, room)) return null;
        if (!credentials.url || !credentials.token) throw new Error(credentials.error || '进不了通话房间');
        await room.connect(credentials.url, credentials.token);
        return this.current(id, room) ? room : null;
      } catch (error) {
        if (this.current(id, room)) this.notice(error instanceof Error ? error.message : '连接失败');
        return null;
      }
    })();
    return entry.ready;
  }

  run(id, work, lane = 'screen') {
    const entry = this.entries.get(id);
    if (!entry) return Promise.reject(new Error('还没连上，等它恢复'));
    const isReady = () => this.current(id, entry.room) && entry.room.state === 'connected';
    const queue = lane === 'audio' ? 'audioTail' : 'tail';
    const result = entry[queue].catch(() => {}).then(async () => {
      await entry.ready;
      if (!isReady()) throw new Error('正在恢复连接，等一下再试');
      return work(entry.room, isReady);
    });
    entry[queue] = result.catch(() => {});
    return result;
  }

  close(id) {
    const entry = this.entries.get(id);
    if (!entry) return;
    entry.cancelled = true;
    this.entries.delete(id);
    entry.room.localParticipant?.trackPublications.forEach(publication => publication.track?.stop());
    const cleanup = Promise.allSettled([entry.ready, entry.tail, entry.audioTail])
      .then(() => entry.room.disconnect())
      .catch(error => this.notice(`Media cleanup failed: ${String(error)}`));
    this.closing.set(id, cleanup);
    cleanup.finally(() => {
      if (this.closing.get(id) === cleanup) this.closing.delete(id);
    });
  }

  dispose() {
    for (const id of this.entries.keys()) this.close(id);
  }
}
