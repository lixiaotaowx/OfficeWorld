import { ki as publishScreenAudio } from './screen-share.js';
import { Track } from '../vendor/livekit.js';
import { Hc as prepareScreenPublication } from './standalone.js';
import { defineField } from './defineField.js';
import { captureWithSource, cloneScreenTrack, showScreenTrack, hideScreenTrack } from './screenShareIndicator.js';
import { SCREEN_AUDIO_OPTIONS, stopPublishedScreen, SCREEN_AUDIO_MISSING, replacePublishedVideo } from './mediaPublishing.js';
class MeetingScreenShare {
  constructor(e, t, n, s) {
    defineField(this, "captures", new Map());
    defineField(this, "generations", new Map());
    defineField(this, "onStopped");
    defineField(this, "replaced", ({
      room: e,
      lease: t
    }) => {
      var n;
      ((n = this.captures.get(e)) == null ? void 0 : n.lease) === t && (this.stop(e), this.notice("有人开始共享屏幕了，你的共享停了，语音还连着"));
    });
    this.socket = e, this.rooms = t, this.currentRoom = n, this.notice = s, e.on("meeting-screen-replaced", this.replaced);
  }
  async action(e, t, n) {
    if (!this.socket.connected) throw Error("Disconnected");
    const s = await this.socket.timeout(1e4).emitWithAck("meeting-screen", {
      room: e,
      lease: t,
      action: n
    });
    if (!(s != null && s.ok)) throw Error((s == null ? void 0 : s.error) || "屏幕没切过去");
  }
  stop(e) {
    var n;
    this.generations.set(e, (this.generations.get(e) || 0) + 1);
    const t = this.captures.get(e);
    this.captures.delete(e), t && (t.cancelled = !0, t.tracks.forEach(s => {
      s.stop(), hideScreenTrack(s.mediaStreamTrack);
    }), this.action(e, t.lease, "release").catch(() => {})), this.rooms.run(e, async s => {
      await stopPublishedScreen(s);
    }).catch(() => {}), t && ((n = this.onStopped) == null || n.call(this));
  }
  async switchDisplay() {
    let e = !1;
    for (const [t, n] of [...this.captures]) {
      if (n.cancelled) continue;
      const s = this.rooms.get(t);
      if ((s == null ? void 0 : s.state) === "connected") try {
        const r = await captureWithSource(() => s.localParticipant.createScreenTracks({
          audio: SCREEN_AUDIO_OPTIONS,
          resolution: {
            width: 1920,
            height: 1080,
            frameRate: 15
          },
          contentHint: "text"
        }), o => o.map(c => c.mediaStreamTrack));
        let a = !1;
        try {
          await this.rooms.run(t, async (o, c) => {
            var m, f;
            if (n.cancelled || this.captures.get(t) !== n || !c()) return;
            const d = (m = r.find(p => p.mediaStreamTrack.kind === "video")) == null ? void 0 : m.mediaStreamTrack;
            if (!d) return;
            const l = n.tracks.map(p => p.mediaStreamTrack),
              u = cloneScreenTrack(d);
            try {
              if (!(await replacePublishedVideo(o, u))) {
                u.stop();
                return;
              }
            } catch (p) {
              throw u.stop(), p;
            }
            if (n.cancelled || this.captures.get(t) !== n || !c()) {
              u.stop();
              return;
            }
            l.forEach(p => {
              p.stop(), hideScreenTrack(p);
            }), n.tracks = r, a = !0, d.addEventListener("ended", () => {
              this.captures.get(t) === n && n.tracks === r && this.stop(t);
            }, {
              once: !0
            });
            const h = (f = r.find(p => p.mediaStreamTrack.kind === "audio")) == null ? void 0 : f.mediaStreamTrack;
            await publishScreenAudio(o, h).catch(async () => {
              await publishScreenAudio(o), this.notice("屏幕换好了，但声音没共享出去，再试一次");
            }), h || this.notice(SCREEN_AUDIO_MISSING), e = !0;
          });
        } finally {
          a || r.forEach(o => o.stop());
        }
      } catch {}
    }
    return e;
  }
  async start(e) {
    const t = this.rooms.get(e);
    if ((t == null ? void 0 : t.state) !== "connected") throw Error("会议还没连上");
    const n = (this.generations.get(e) || 0) + 1;
    this.generations.set(e, n);
    const s = await captureWithSource(() => t.localParticipant.createScreenTracks({
        audio: SCREEN_AUDIO_OPTIONS,
        resolution: {
          width: 1920,
          height: 1080,
          frameRate: 15
        },
        contentHint: "text"
      }), o => o.map(c => c.mediaStreamTrack)),
      r = {
        lease: crypto.randomUUID(),
        tracks: s,
        cancelled: !1
      },
      a = () => !r.cancelled && this.currentRoom() === e && this.generations.get(e) === n && this.rooms.get(e) === t;
    try {
      if (!a()) throw Error("屏幕共享取消了");
      if (s.some(o => o.mediaStreamTrack.kind === "audio") || this.notice(SCREEN_AUDIO_MISSING), this.captures.set(e, r), await this.action(e, r.lease, "claim"), !a()) throw Error("屏幕共享被换掉或取消了");
      await this.rooms.run(e, async (o, c) => {
        if (!a() || !c()) throw Error("屏幕共享取消了");
        await prepareScreenPublication(o, () => a() && c(), s.some(d => d.mediaStreamTrack.kind === "audio"));
        for (const d of s) {
          const l = d.mediaStreamTrack.kind === "audio";
          try {
            await o.localParticipant.publishTrack(d, {
              source: l ? Track.Source.ScreenShareAudio : Track.Source.ScreenShare,
              ...(l ? {
                dtx: !1,
                forceStereo: !0
              } : {})
            });
          } catch (u) {
            if (!l) throw u;
            d.stop(), this.notice("屏幕共享了，但声音没发出去。停止共享再试一次");
          }
          if (l || (showScreenTrack(d.mediaStreamTrack), d.mediaStreamTrack.addEventListener("ended", () => {
            this.captures.get(e) === r && r.tracks === s && this.stop(e);
          }, {
            once: !0
          })), !a()) throw Error("屏幕共享被换掉了");
        }
      });
    } catch (o) {
      throw s.forEach(c => c.stop()), this.captures.get(e) === r && this.stop(e), o;
    }
  }
  dispose() {
    this.socket.off("meeting-screen-replaced", this.replaced);
    for (const e of this.generations.keys()) this.stop(e);
  }
}

export { MeetingScreenShare };
