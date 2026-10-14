import { useEffect, useRef, useState } from 'react';
import type { DockVideoChunk } from './dock-meeting-contract';

/** Passive video element: only receives encoded video from the main window. */
export default function DockMeetingVideo({ id, streamId }: { id: string; streamId: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('正在连接共享视频…');
  useEffect(() => {
    const element = video.current;
    const bridge = window.officeDock;
    if (!element || !bridge?.onVideo || !bridge.videoWant || typeof MediaSource === 'undefined') {
      setError('请更新桌面客户端以播放会议视频'); return;
    }
    let epoch = '';
    let source: MediaSource | undefined;
    let buffer: SourceBuffer | undefined;
    let url = '';
    let queue: ArrayBuffer[] = [];
    let live = true;
    const release = () => {
      queue = []; buffer = undefined; source = undefined;
      element.pause(); element.removeAttribute('src'); element.load();
      if (url) URL.revokeObjectURL(url);
      url = '';
    };
    const pump = () => {
      if (!buffer || buffer.updating || !queue.length || !live) return;
      try {
        if (buffer.buffered.length && element.currentTime - buffer.buffered.start(0) > 8) {
          buffer.remove(0, element.currentTime - 4); return;
        }
        buffer.appendBuffer(queue.shift()!);
      } catch { setError('视频播放中断，点击重新连接'); }
    };
    const receive = (chunk: DockVideoChunk) => {
      if (!live || chunk.id !== id) return;
      if (chunk.reset) {
        release(); epoch = chunk.epoch;
        if (!MediaSource.isTypeSupported(chunk.mime)) { setError('客户端不支持此视频格式'); return; }
        const current = source = new MediaSource();
        url = URL.createObjectURL(current); element.src = url;
        current.addEventListener('sourceopen', () => {
          if (!live || source !== current) return;
          try {
            const currentBuffer = buffer = current.addSourceBuffer(chunk.mime);
            currentBuffer.addEventListener('updateend', () => {
              if (!live || buffer !== currentBuffer || source !== current || !buffer.buffered.length) return;
              const end = buffer.buffered.end(buffer.buffered.length - 1);
              if (end - element.currentTime > 2) element.currentTime = Math.max(0, end - 0.6);
              pump(); void element.play().catch(() => setError('点击播放共享视频'));
            });
            pump();
          } catch { setError('视频加载失败，请重新连接'); }
        }, { once: true });
      } else if (epoch === chunk.epoch && chunk.bytes) {
        if (queue.length >= 12) { queue = []; void bridge.videoWant!(id); return; }
        queue.push(chunk.bytes); pump();
      }
    };
    const off = bridge.onVideo(receive);
    const request = () => { setError('正在连接共享视频…'); void bridge.videoWant!(id).catch(() => setError('共享视频连接失败')); };
    const playing = () => setError('');
    element.addEventListener('playing', playing);
    element.addEventListener('click', request);
    request();
    return () => {
      live = false; off(); release();
      element.removeEventListener('playing', playing); element.removeEventListener('click', request);
      void bridge.videoWant!('-' + id).catch(() => undefined);
    };
  }, [id, streamId]);
  return <div className="dock-meeting-video"><video ref={video} autoPlay playsInline muted />
    {error && <span role="status">{error}</span>}</div>;
}
