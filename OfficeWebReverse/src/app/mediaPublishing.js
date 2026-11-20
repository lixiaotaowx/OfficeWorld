import { ki as publishScreenAudio } from './screen-share.js';
import { Track } from '../vendor/livekit.js';
import { captureWithSource, cloneScreenTrack, showScreenTrack, hideScreenTrack, replaceIndicatorTrack } from './screenShareIndicator.js';
async function setPublishedSource(i, e, t, n) {
  var c;
  const s = i.localParticipant,
    r = s.getTrackPublication(e);
  if (!t) {
    e === Track.Source.ScreenShare ? r != null && r.track && (await s.unpublishTrack(r.track, !0), hideScreenTrack(r.track.mediaStreamTrack)) : await (r == null ? void 0 : r.mute());
    return;
  }
  if (!n()) throw Error("操作取消了");
  if (((c = r == null ? void 0 : r.track) == null ? void 0 : c.mediaStreamTrack.readyState) === "live") {
    if (await r.unmute(), !n()) throw await r.mute(), Error("操作取消了");
    return;
  }
  r != null && r.track && (await s.unpublishTrack(r.track, !0));
  const a = e === Track.Source.ScreenShare ? await captureWithSource(() => s.createScreenTracks({
      audio: !1,
      resolution: {
        width: 1920,
        height: 1080,
        frameRate: 15
      }
    }), d => d.map(l => l.mediaStreamTrack)) : await s.createTracks({
      audio: {
        echoCancellation: !0,
        noiseSuppression: !0
      }
    }),
    o = [];
  try {
    if (!n()) throw Error("操作取消了，连上后再试");
    for (const d of a) if (await s.publishTrack(d, {
      source: e
    }), o.push(d), e === Track.Source.ScreenShare && showScreenTrack(d.mediaStreamTrack), !n()) throw Error("操作取消了，连上后再试");
  } catch (d) {
    throw a.forEach(l => l.stop()), await Promise.allSettled(o.map(l => s.unpublishTrack(l, !0))), d;
  }
}
const SCREEN_AUDIO_OPTIONS = {
  restrictOwnAudio: !0,
  echoCancellation: !1,
  noiseSuppression: !1,
  autoGainControl: !1
};
async function stopPublishedScreen(i) {
  await Promise.all([Track.Source.ScreenShare, Track.Source.ScreenShareAudio].map(async e => {
    var n;
    const t = (n = i.localParticipant.getTrackPublication(e)) == null ? void 0 : n.track;
    t && (await i.localParticipant.unpublishTrack(t, !0), hideScreenTrack(t.mediaStreamTrack));
  }));
}
const SCREEN_AUDIO_MISSING = "这次共享没有声音。浏览器里要选能带声音的来源并勾选“共享音频”；桌面端要用支持录声音的客户端";
async function captureDisplay() {
  const i = await captureWithSource(() => navigator.mediaDevices.getDisplayMedia({
    video: {
      frameRate: {
        ideal: 15,
        max: 20
      }
    },
    audio: SCREEN_AUDIO_OPTIONS
  }), e => e.getTracks());
  return i.getVideoTracks().forEach(e => {
    e.contentHint = "text";
  }), i;
}
async function replacePublishedVideo(i, e) {
  var s;
  const t = (s = i.localParticipant.getTrackPublication(Track.Source.ScreenShare)) == null ? void 0 : s.track;
  if (!t) return !1;
  const n = t.mediaStreamTrack;
  return await t.replaceTrack(e), showScreenTrack(e), n && n !== e && hideScreenTrack(n), n && n !== e && n.stop(), !0;
}
async function switchDisplayForPublishers(i, e = captureDisplay) {
  const t = i.live();
  if (!(t != null && t.active)) return !1;
  const n = await e();
  if (!i.owner(t)) return n.getTracks().forEach(a => a.stop()), !1;
  const s = n.getVideoTracks()[0];
  t.getVideoTracks()[0].onended = null, i.adopt(n), replaceIndicatorTrack(t.getVideoTracks()[0], s);
  let r = !1;
  for (const a of i.publishers()) {
    const o = async () => {
      if (i.live() !== n) return;
      const c = cloneScreenTrack(s);
      (await replacePublishedVideo(a, c).catch(() => !1)) ? (r = !0, i.live() === n && (await publishScreenAudio(a, n.getAudioTracks()[0]).catch(() => publishScreenAudio(a)))) : c.stop();
    };
    i.run ? await i.run(a, o).catch(() => {}) : await o();
  }
  return t.getTracks().forEach(a => a.stop()), r;
}
function getRoomMicTrack(i) {
  var t, n;
  const e = (n = (t = i.localParticipant.getTrackPublication(Track.Source.Microphone)) == null ? void 0 : t.track) == null ? void 0 : n.mediaStreamTrack;
  return e && e.readyState === "live" ? e : null;
}

export { setPublishedSource, SCREEN_AUDIO_OPTIONS, stopPublishedScreen, SCREEN_AUDIO_MISSING, captureDisplay, replacePublishedVideo, switchDisplayForPublishers, getRoomMicTrack };
