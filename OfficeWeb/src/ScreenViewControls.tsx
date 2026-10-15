import { ScreenIcon } from './icons';
import './screen-view-controls.css';

/**
 * 画面上的紧凑控件（私聊面板与任务栏会议的共享画面都用它）。
 *
 * **只有全屏一个按钮了**（用户 2026-10-15：「把最大化去掉，现在只用全屏就可以了」）。
 * 以前这里是「最大化 + 全屏」两个 —— 最大化那一档（应用窗口内占满）已从 `ScreenStage` 整体删除。
 */
export default function ScreenViewControls({ onFullscreen, label }: {
  onFullscreen: () => void; label?: string;
}) {
  return <div className="screen-stage-bar minimal">
    <button type="button" className="screen-stage-expand" onClick={onFullscreen}
      aria-label={label ? `全屏 ${label}` : undefined}
      title="占满整个屏幕（看共享画面用这个）"><ScreenIcon />全屏</button>
  </div>;
}
