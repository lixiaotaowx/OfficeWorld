import { ScreenIcon } from './icons';
import './screen-view-controls.css';

/** Shared compact picture controls for private calls and taskbar meeting video. */
export default function ScreenViewControls({ onMaximize, onFullscreen, label }: {
  onMaximize: () => void; onFullscreen: () => void; label?: string;
}) {
  return <div className="screen-stage-bar minimal">
    <button type="button" className="screen-stage-expand" onClick={onMaximize}
      aria-label={label ? `最大化 ${label}` : undefined}
      title="在软件窗口内占满"><ScreenIcon />最大化</button>
    <button type="button" className="screen-stage-expand" onClick={onFullscreen}
      aria-label={label ? `全屏 ${label}` : undefined}
      title="占满整个屏幕"><ScreenIcon />全屏</button>
  </div>;
}
