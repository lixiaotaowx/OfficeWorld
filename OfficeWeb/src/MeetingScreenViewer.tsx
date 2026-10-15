import { useEffect } from 'react';
import ScreenStage from './ScreenStage';
import SignalBars from './SignalBars';
import type { SignalEvent, SignalState } from './connectionQuality';

/**
 * 任务栏小窗里点「看屏幕」之后的那块全屏画面。
 *
 * **一进来就是全屏**（用户 2026-10-15：「把最大化去掉，现在只用全屏就可以了」）——
 * 以前是"最大化"那一档（只在软件窗口内占满），现在只有全屏，「返回头像条」退出。
 * 信号条挂在「返回头像条」**右侧**（同一批 `actions` 里，按顺序渲染）。
 */
export default function MeetingScreenViewer({ stream, label, onClose, signal }: {
  stream: MediaStream; label: string; onClose: () => void;
  /** 会议信号强弱（`useMeetingSignal` 的输出）。没有就说一句"检测中"，不假装有数据。 */
  signal?: { state: SignalState; summary: string; events: SignalEvent[] };
}) {
  useEffect(() => {
    const track = stream.getVideoTracks()[0];
    if (!track || track.readyState === 'ended') { onClose(); return; }
    track.addEventListener('ended', onClose);
    return () => track.removeEventListener('ended', onClose);
  }, [stream, onClose]);
  return <ScreenStage stream={stream} scope="dock-meeting-view" label={label}
    initialFullscreen
    actions={<>
      <button onClick={onClose}>返回头像条</button>
      {/* 看全屏的时候也要知道信号好坏 —— 卡了才分得清是网络还是对方那边的事。 */}
      {signal
        ? <SignalBars state={signal.state} summary={signal.summary} title="会议网络状况" />
        : <span className="screen-stage-signal-wait">信号检测中…</span>}
    </>}
    onDraw={() => undefined} onClear={() => undefined} onUndo={() => undefined} />;
}
