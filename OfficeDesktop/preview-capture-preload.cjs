const { contextBridge } = require('electron');

// This hidden page owns one small capture stream. Keeping the stream here means the
// main process never re-enumerates every display: it just asks for the newest frame.
//
// Notes that matter:
//   * `chromeMediaSource: 'desktop'` is the Electron capture source; the resolution
//     and frame rate are set here at capture time, so the pipeline stays small
//     instead of producing a full-size screen image per request.
//   * No picker, no floating self-preview and no video transport: this only ever
//     yields a still JPEG on demand.
const video = document.createElement('video');
video.muted = true;
video.playsInline = true;
video.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px';
document.addEventListener('DOMContentLoaded', () => document.body.append(video));

let stream;
let settings = { maxEdge: 300, quality: 55 };

function stopStream() {
  if (stream) for (const track of stream.getTracks()) track.stop();
  stream = undefined;
  video.srcObject = null;
}

async function start(options) {
  stopStream();
  if (!options || !options.sourceId) return false;
  settings = { maxEdge: options.maxEdge || settings.maxEdge, quality: options.quality || settings.quality };
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: options.sourceId,
          maxWidth: settings.maxEdge,
          maxHeight: settings.maxEdge,
          maxFrameRate: options.frameRate || 2,
        },
      },
    });
  } catch {
    stream = undefined;
    return false;
  }
  video.srcObject = stream;
  try { await video.play(); } catch { /* a frame may still be available */ }
  return true;
}

/** Newest frame as a low-resolution JPEG data URL, or null before the first frame. */
function frame() {
  if (!stream || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;
  const scale = Math.min(1, settings.maxEdge / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL('image/jpeg', settings.quality / 100);
  // Release the backing store immediately: these canvases are short-lived.
  canvas.width = 0;
  canvas.height = 0;
  return url;
}

contextBridge.exposeInMainWorld('previewCapture', {
  start,
  frame,
  stop: () => { stopStream(); return true; },
  attached: () => Boolean(stream),
});
