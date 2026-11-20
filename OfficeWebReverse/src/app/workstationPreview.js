import { showScreenTrack, hideScreenTrack } from './screenShareIndicator.js';
const MAX_PREVIEW_SIDE = 300,
  PREVIEW_INTERVAL_MS = 6e3,
  PREVIEW_JPEG_QUALITY = .55;
async function startWorkstationPreview(i) {
  const e = document.createElement("video");
  if (e.muted = !0, e.srcObject = i.stream, await e.play(), !i.current()) return e.srcObject = null, {
    video: null,
    stop() {}
  };
  const t = document.createElement("canvas");
  t.width = MAX_PREVIEW_SIDE, t.height = Math.round(MAX_PREVIEW_SIDE * 9 / 16);
  const n = t.getContext("2d");
  i.publicPreview && showScreenTrack(i.stream.getVideoTracks()[0]);
  const s = setInterval(() => {
    if (e.readyState < 2 || !e.videoWidth || !e.videoHeight || !n) return;
    const r = Math.min(1, MAX_PREVIEW_SIDE / Math.max(e.videoWidth, e.videoHeight));
    t.width = Math.max(1, Math.round(e.videoWidth * r)), t.height = Math.max(1, Math.round(e.videoHeight * r)), n.drawImage(e, 0, 0, t.width, t.height), i.publicPreview && i.publish(t.toDataURL("image/jpeg", PREVIEW_JPEG_QUALITY));
  }, i.intervalMs ?? PREVIEW_INTERVAL_MS);
  return {
    video: e,
    stop() {
      if (clearInterval(s), i.publicPreview) {
        const r = e.srcObject;
        r == null || r.getVideoTracks().forEach(hideScreenTrack);
      }
      e.srcObject = null;
    }
  };
}

export { startWorkstationPreview };
