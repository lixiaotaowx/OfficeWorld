// Point a live screen share at a different display.
//
// The desktop app has no screen picker of its own: a capture always follows the
// display chosen in the office (desktop bridge `office:display-select`). So
// switching the shared screen mid-call means capturing again — a fresh
// getDisplayMedia returns the newly selected display — and swapping the media
// track *under the existing publication*. That way the room is not renegotiated
// and viewers never lose the share (user, 2026-09-15: "在屏幕会议和视频聊天中可以
// 切换屏分享的屏幕也是实时变化过去").
import { Track, type Room } from 'livekit-client';

/** Capture whatever display the office has selected right now. */
export async function captureSelectedScreen(): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 15, max: 20 } },
    audio: false,
  });
  // 告诉编码器这是文字/界面画面：同样码率下字更清楚（不设就按普通视频编码）。
  stream.getVideoTracks().forEach(track => { track.contentHint = 'text'; });
  return stream;
}

/**
 * Swap our screen publication onto `next`, in place, and stop the capture it
 * replaces (LiveKit detaches the old track but never stops it). Returns false
 * when we are not publishing a screen in that room.
 */
export async function swapScreenTrack(room: Room, next: MediaStreamTrack): Promise<boolean> {
  const track = room.localParticipant.getTrackPublication(Track.Source.ScreenShare)?.track;
  if (!track) return false;
  const previous = track.mediaStreamTrack;
  await track.replaceTrack(next);
  if (previous && previous !== next) previous.stop();
  return true;
}

/** What `switchLiveScreen` needs to know about whoever owns the capture. */
export interface LiveScreenHost {
  /** The capture that is live right now, if any. */
  live(): MediaStream | null;
  /** Still true when `previous` is the capture we should be replacing. */
  owner(previous: MediaStream): boolean;
  /** Take over the new capture: store it and keep the local previews in step. */
  adopt(next: MediaStream): void;
  /** Rooms that publish our screen right now. */
  publishers(): Room[];
}

/**
 * Re-capture the selected display and move a running share onto it. Returns true
 * when at least one publication was switched; false means there was nothing to
 * switch (or the share ended while we were capturing). `capture` is injectable so
 * a test never has to fake `navigator.mediaDevices`.
 */
export async function switchLiveScreen(
  host: LiveScreenHost,
  capture: () => Promise<MediaStream> = captureSelectedScreen,
): Promise<boolean> {
  const previous = host.live();
  if (!previous?.active) return false;
  const stream = await capture();
  if (!host.owner(previous)) {
    stream.getTracks().forEach(track => track.stop());
    return false;
  }
  const next = stream.getVideoTracks()[0];
  // The old capture is about to be stopped on purpose: clear the handler it
  // installed, or stopping it would be mistaken for "the user stopped sharing".
  previous.getVideoTracks()[0].onended = null;
  host.adopt(stream);
  let switched = false;
  for (const room of host.publishers()) {
    // A fresh clone per room: each sender needs its own track to own.
    if (await swapScreenTrack(room, next.clone()).catch(() => false)) switched = true;
  }
  previous.getTracks().forEach(track => track.stop());
  return switched;
}
