// The tiny ambient thumbnail of our own shared screen.
//
// This is the low-resolution picture painted onto our desk monitor for
// colleagues: deliberately small and slow (300px, one frame every 6 seconds
// since 2026-09-14), never the readable stream, which only travels over LiveKit
// after an approved request. It is drawn from a hidden <video> fed by our own
// capture, so the same code works for a desktop capture and a browser one.
export const THUMBNAIL_MAX_EDGE = 300;
export const THUMBNAIL_INTERVAL_MS = 6_000;
/** JPEG quality of the ambient frame; the text on it is not meant to be read. */
const THUMBNAIL_QUALITY = 0.55;

export interface ScreenThumbnails {
  /** The hidden element playing the capture; null when it never started. */
  video: HTMLVideoElement | null;
  stop(): void;
}

/** Play `stream` off-screen and publish a shrunk JPEG every interval. */
export async function startScreenThumbnails(options: {
  stream: MediaStream;
  /** False once this capture is no longer the one we should publish. */
  current(): boolean;
  publish(image: string): void;
  /** Whether the ambient picture may be shown to others at all. */
  publicPreview: boolean;
  intervalMs?: number;
}): Promise<ScreenThumbnails> {
  const video = document.createElement("video");
  video.muted = true;
  video.srcObject = options.stream;
  await video.play();
  if (!options.current()) {
    video.srcObject = null;
    return { video: null, stop() {} };
  }
  const canvas = document.createElement("canvas");
  canvas.width = THUMBNAIL_MAX_EDGE;
  canvas.height = Math.round((THUMBNAIL_MAX_EDGE * 9) / 16);
  const context = canvas.getContext("2d");
  const timer = setInterval(() => {
    // Nothing decoded yet: keep the previous frame rather than publishing black.
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight || !context) return;
    const scale = Math.min(1, THUMBNAIL_MAX_EDGE / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (options.publicPreview) options.publish(canvas.toDataURL("image/jpeg", THUMBNAIL_QUALITY));
  }, options.intervalMs ?? THUMBNAIL_INTERVAL_MS);
  return {
    video,
    stop() { clearInterval(timer); video.srcObject = null; },
  };
}
