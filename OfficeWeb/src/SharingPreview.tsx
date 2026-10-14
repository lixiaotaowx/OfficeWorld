import { useEffect, useRef, useState } from 'react';
import ScreenStage from './ScreenStage';
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

export default function SharingPreview({ stream, meeting, onStop, onOpen, onClear, scope }: {
  stream: MediaStream; meeting: boolean; onStop: () => void; onOpen?: () => void;
  /** 分享者自己擦掉共享画面上的标注（用户 2026-10-14：「分享者清屏按钮需要」）。 */
  onClear?: (scope: string) => void;
  /** 这块共享画面属于哪张画布（`call-…` / `meeting-…`），清屏按它清。 */
  scope?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return <aside className={'sharing-preview' + (collapsed ? ' collapsed' : '')} aria-label="我的共享预览">
    <header><strong><i />{meeting ? '共享到会议' : '正在共享'}</strong>
      <button onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed} aria-label={collapsed ? '展开共享预览' : '收起共享预览'}>{collapsed ? '展开' : '收起'}</button>
      {/* 收起时看不见画面，清屏入口挪到标题栏上，别让分享者为了擦笔迹先展开窗口。 */}
      {collapsed && onClear && scope && <button className="clear-board" onClick={() => onClear(scope)}>清屏</button>}
      {collapsed && <button className="stop-sharing" onClick={onStop}>停止共享</button>}
    </header>
    <div hidden={collapsed}>{onClear && scope
      ? <ScreenStage stream={stream} scope={scope} label="我正在共享的屏幕"
          clearsOwnBoard onClear={onClear} onDraw={() => undefined} onUndo={() => undefined} />
      : <SharingVideo stream={stream} label="我正在共享的屏幕" />}</div>
    <footer><small>我的画面 · {stream.getVideoTracks()[0]?.label || '屏幕'}</small>
      {onOpen && <button onClick={onOpen}>查看会议</button>}
      <button className="stop-sharing" onClick={onStop}>停止共享</button>
    </footer>
  </aside>;
}
