import { Track } from '../vendor/livekit.js';
import { defineField } from './defineField.js';
import { setPublishedSource } from './mediaPublishing.js';
class RoomAudioFocus {
  constructor(e, t, n) {
    defineField(this, "current", null);
    defineField(this, "wanted", new Map());
    defineField(this, "tail", Promise.resolve());
    this.rooms = e, this.changed = t, this.notice = n;
  }
  add(e) {
    return this.wanted.has(e) ? !1 : (this.wanted.set(e, !0), !0);
  }
  intended(e) {
    return this.wanted.get(e) === !0;
  }
  activate(e, t = this.intended(e)) {
    this.wanted.set(e, t);
    const n = this.current;
    this.current = e, this.changed(e), n && n !== e && this.notice(e.startsWith("meeting-") ? "Audio switched to the meeting. Private call listening and microphone are paused." : "Audio switched to this call. Listening and microphone are paused in other calls and meetings.");
    const s = this.tail.catch(() => {}).then(async () => {
      if (this.current === e) {
        for (const [r, a] of this.rooms.values()) r === e || a.state !== "connected" || (await this.rooms.run(r, (o, c) => setPublishedSource(o, Track.Source.Microphone, !1, c), "audio"));
        this.current === e && (await this.rooms.run(e, (r, a) => setPublishedSource(r, Track.Source.Microphone, t, () => a() && this.current === e && this.intended(e) === t), "audio"));
      }
    });
    return this.tail = s.catch(() => {}), s;
  }
  async mute(e) {
    this.wanted.set(e, !1), await this.rooms.run(e, (t, n) => setPublishedSource(t, Track.Source.Microphone, !1, n), "audio");
  }
  remove(e) {
    this.wanted.delete(e), this.current === e && (this.current = null, this.changed(null));
  }
}

export { RoomAudioFocus };
