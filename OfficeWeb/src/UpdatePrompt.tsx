import type { AppUpdate } from './useAppUpdate';
import { progressLabel } from './useAppUpdate';
import { DownloadIcon } from './icons';
import './update.css';

/**
 * "There is a new version" popup. It sits in the bottom-right corner like the missed-call
 * cards, shows real download progress from the desktop process, and finishes by running
 * the installer (user, 2026-09-17: "网页检测到新版本就弹出更新软件的提示，然后就是下载
 * 进度条，然后安装器打开覆盖安装").
 */
export default function UpdatePrompt({ update }: { update: AppUpdate }) {
  if (!update.copy) return null;
  const { title, detail, action, automatic } = update.copy;
  const busy = update.stage === 'downloading' || update.stage === 'installing';
  const done = update.stage === 'ready';
  return <section className="update-prompt" role="alert" aria-live="polite">
    <div className="update-icon"><DownloadIcon /></div>
    <div className="update-body">
      <strong className="update-title">{title}</strong>
      <small className="update-detail">{detail}</small>
      {update.stage === 'downloading' && <div className="update-bar"
        role="progressbar" aria-label="下载进度" aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={update.percent ?? undefined}>
        <div className="update-bar-fill" style={{ width: `${update.percent ?? 0}%` }} />
      </div>}
      {update.stage === 'downloading' && <small className="update-bytes">{progressLabel(update)}</small>}
      <div className="update-actions">
        <button type="button" className="primary" disabled={busy && !done}
          onClick={() => void (done ? update.install() : update.start())}>
          <DownloadIcon />{action}
        </button>
        <button type="button" onClick={update.later} disabled={update.stage === 'installing'}>稍后</button>
      </div>
      {!automatic && <small className="update-hint">当前客户端不支持自动更新，请下载后手动安装</small>}
    </div>
  </section>;
}
