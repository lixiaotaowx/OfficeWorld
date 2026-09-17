import type { AppUpdate } from './useAppUpdate';
import { progressLabel } from './useAppUpdate';
import { DownloadIcon } from './icons';
import './update.css';

/**
 * "There is a new version" popup. It sits in the bottom-right corner like the missed-call
 * cards, shows real download progress from the desktop process, and finishes by running
 * the installer (user, 2026-09-17: "网页检测到新版本就弹出更新软件的提示，然后就是下载
 * 进度条，然后安装器打开覆盖安装").
 *
 * A client too old to install anything (0.1.13 and older) still gets the prompt, but the
 * copy has to say where the file went instead of pretending (user, 2026-09-17: "旧客户端
 * 选择位置之后下载好了没有弹出文件夹，或者没有弹出安装").
 */
export default function UpdatePrompt({ update }: { update: AppUpdate }) {
  if (!update.copy) return null;
  const { title, detail, action, automatic, secondary, hint } = update.copy;
  const busy = update.stage === 'downloading' || update.stage === 'installing';
  const ready = update.stage === 'ready';
  const failed = update.stage === 'failed';
  return <section className={`update-prompt ${update.stage}`} role="alert" aria-live="polite">
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
        <button type="button" className="primary" disabled={busy}
          onClick={() => void (ready ? update.install() : update.start())}>
          <DownloadIcon />{action}
        </button>
        {secondary && <button type="button" disabled={busy}
          onClick={() => void (ready ? update.reveal() : update.copyLink())}>
          {secondary}
        </button>}
        <button type="button" onClick={update.later}
          disabled={update.stage === 'installing'}>{ready ? '稍后安装' : '稍后'}</button>
      </div>
      {hint && <small className="update-hint">{hint}</small>}
      {!automatic && !hint && <small className="update-hint">当前客户端不支持自动更新，请下载后手动安装</small>}
      {failed && update.error && <small className="update-hint">{update.error}</small>}
    </div>
  </section>;
}
