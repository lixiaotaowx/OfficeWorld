import { useEffect, useRef } from 'react';
import type { DockVideoChunk } from './dock-meeting-contract';

/** Encode already-owned meeting video for passive playback in the other renderer. */
export function useDockMeetingVideo(streams: Record<string, MediaStream>) {
  const latest = useRef(streams); latest.current = streams;
  useEffect(() => {
    const bridge = window.officeDesktop;
    if (!bridge?.dockVideo || !bridge.onDockVideoWant || typeof MediaRecorder === 'undefined') return;
    const running = new Map<string, { stream: MediaStream; stop: () => void }>();
    const stop = (id: string) => { running.get(id)?.stop(); running.delete(id); };
    const start = (id: string) => {
      if (id.startsWith('-')) { stop(id.slice(1)); return; }
      stop(id);
      const stream = latest.current[id];
      if (!stream?.getVideoTracks().some(track => track.readyState === 'live')) return;
      const mime = ['video/webm;codecs=vp8', 'video/webm;codecs=vp9'].find(value => MediaRecorder.isTypeSupported(value));
      if (!mime) return;
      const epoch = crypto.randomUUID();
      let recorder: MediaRecorder;
      try { recorder = new MediaRecorder(new MediaStream(stream.getVideoTracks()), { mimeType: mime, videoBitsPerSecond: 900000 }); }
      catch { return; }
      let live = true;
      let queue = Promise.resolve();
      const send = (value: DockVideoChunk) => bridge.dockVideo!(value).catch(() => false);
      void send({ id, epoch, mime, reset: true });
      recorder.ondataavailable = event => {
        if (!live || !event.data.size) return;
        queue = queue.then(async () => {
          const bytes = await event.data.arrayBuffer();
          if (live && bytes.byteLength <= 2 * 1024 ** 2) await send({ id, epoch, mime, bytes });
        }).catch(() => undefined);
      };
      const release = () => {
        live = false; recorder.ondataavailable = null; recorder.onerror = null;
        if (recorder.state !== 'inactive') recorder.stop();
      };
      recorder.onerror = () => { if (live) { stop(id); void send({ id, epoch, mime, reset: true }); } };
      running.set(id, { stream, stop: release });
      try { recorder.start(400); } catch { stop(id); }
    };
    const off = bridge.onDockVideoWant(start);
    // Remove encoders as soon as a stream ends or is replaced. Never stop the source tracks.
    const timer = setInterval(() => {
      for (const [id, value] of running) if (latest.current[id] !== value.stream ||
        !value.stream.getVideoTracks().some(track => track.readyState === 'live')) stop(id);
    }, 500);
    return () => { off(); clearInterval(timer); for (const id of running.keys()) stop(id); };
  }, []);
}
