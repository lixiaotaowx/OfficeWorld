import { Track } from 'livekit-client';
import { MediaRooms } from './mediaRooms';
import { setPublication } from './mediaPublication';

/** At most one destination receives this microphone or plays remote audio. */
export class MediaAudioFocus {
  current: string | null = null;
  private wanted = new Map<string, boolean>();
  private tail: Promise<unknown> = Promise.resolve();
  constructor(private rooms: MediaRooms, private changed: (name: string | null) => void,
    private notice: (message: string) => void) {}

  add(name: string) {
    if (this.wanted.has(name)) return false;
    this.wanted.set(name, true); return true;
  }
  intended(name: string) { return this.wanted.get(name) === true; }

  activate(name: string, enabled = this.intended(name)) {
    this.wanted.set(name, enabled);
    const previous = this.current;
    this.current = name;
    this.changed(name);
    if (previous && previous !== name)
      this.notice(name.startsWith('meeting-') ? '声音已切到会议，私聊已暂停收听和开麦' : '声音已切到此通话，其他通话及会议已暂停收听和开麦');
    const result = this.tail.catch(() => {}).then(async () => {
      if (this.current !== name) return;
      for (const [other, room] of this.rooms.values()) {
        if (other === name || room.state !== 'connected') continue;
        await this.rooms.run(other, (active, valid) => setPublication(active, Track.Source.Microphone, false, valid));
      }
      if (this.current !== name) return;
      await this.rooms.run(name, (room, valid) => setPublication(room, Track.Source.Microphone,
        enabled, () => valid() && this.current === name && this.intended(name) === enabled));
    });
    this.tail = result.catch(() => {});
    return result;
  }

  async mute(name: string) {
    this.wanted.set(name, false);
    await this.rooms.run(name, (room, valid) => setPublication(room, Track.Source.Microphone, false, valid));
  }
  remove(name: string) {
    this.wanted.delete(name);
    if (this.current === name) { this.current = null; this.changed(null); }
  }
}
