import { useEffect, useRef, useState } from 'react';
import './sharing-preview.css';

export function SharingVideo({ stream, label }: { stream: MediaStream; label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.srcObject = stream;
    void element.play().catch(() => undefined);
    return () => { element.srcObject = null; };
  }, [stream]);
  return <video ref={video} autoPlay muted playsInline aria-label={label} />;
}

export default function SharingPreview({ stream, meeting, onStop, onOpen }: {
  stream: MediaStream; meeting: boolean; onStop: () => void; onOpen?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return <aside className="sharing-preview" aria-label="我的共享预览">
    <header><strong><i />正在共享{meeting ? '到会议' : '屏幕'}</strong>
      <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? '展开共享预览' : '收起共享预览'}>{collapsed ? '展开' : '收起'}</button>
    </header>
    {!collapsed && <SharingVideo stream={stream} label="我正在共享的屏幕" />}
    <footer><small>我的画面 · {stream.getVideoTracks()[0]?.label || '屏幕'}</small>
      {onOpen && <button onClick={onOpen}>查看会议</button>}
      <button className="stop-sharing" onClick={onStop}>停止共享</button>
    </footer>
  </aside>;
}
