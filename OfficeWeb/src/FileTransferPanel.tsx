import {
  formatBytes, headline, isActive, orderRows, percentOf, statusText,
} from './fileTransferRules';
import type { FileTransfers } from './useFileTransfers';
import './file-transfer.css';

/**
 * 文件直传的进度卡片（用户 2026-09-22）。
 *
 * 需求原话：「把文件拖至状态栏某人头像，就会开始发送，不需要对方同意，直接就发送到设置好的
 * 位置，设置里面可以改，双方要显示系统级进度条，完事有打开和打开文件夹的功能」。
 *
 * 所以这里只做三件事：进度、完事之后的「打开 / 打开文件夹」、以及取消/关闭。
 * 传完之后**不自动消失**——那两个按钮正是用户要的东西，卡片自己跑掉就没得点了
 * （和未接来电卡片同一个道理）。
 */
export default function FileTransferPanel({ files }: { files: FileTransfers }) {
  const rows = orderRows(files.rows);
  if (!rows.length) return null;
  return <section className="file-transfers" role="log" aria-label="文件传输">
    <header className="file-transfers-head">
      <strong>文件传输</strong>
      <button type="button" onClick={() => files.dismissAll()}>全部清除</button>
    </header>
    <ul className="file-transfers-list">
      {rows.map(row => <li key={row.id} className={`file-card ${row.status}`} data-transfer={row.id}>
        <div className="file-card-top">
          {/* 名字可能很长：这里截断，完整名字在 `title` 里（这里不是头像条，用系统提示没问题）。 */}
          <span className="file-card-name" title={row.name}>{row.name}</span>
          <span className="file-card-size">{formatBytes(row.size)}</span>
        </div>
        <div className={`file-card-bar ${row.status}`} role="progressbar"
          aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={Math.round(percentOf(row) * 100)}>
          <i style={{ width: `${Math.round(percentOf(row) * 100)}%` }} />
        </div>
        <p className="file-card-state">
          <span className="file-card-head">{headline(row)}</span>
          <span className="file-card-detail">{statusText(row)}</span>
        </p>
        <div className="file-card-actions">
          {row.status === 'done' && <button type="button" className="primary"
            onClick={() => files.open(row.id)}>打开</button>}
          {row.status === 'done' && (row.path || row.folder) && <button type="button"
            onClick={() => files.reveal(row.id)}>打开文件夹</button>}
          {isActive(row) && <button type="button"
            onClick={() => files.cancel(row.id)}>取消</button>}
          {!isActive(row) && <button type="button"
            onClick={() => files.dismiss(row.id)}>关闭</button>}
        </div>
      </li>)}
    </ul>
  </section>;
}
