import { useEffect, useState } from 'react';

/**
 * 设置里的「接收文件夹」（用户 2026-09-22：「直接就发送到设置好的位置，设置里面可以改」）。
 *
 * **谁收到就进谁的文件夹**：发送方拖一下就走，不用选目录、也不用对方点同意；接收方在这
 * 里说一次"我的文件放哪"就永久生效。桌面客户端用原生目录选择器（能静默写盘的前提）；
 * 网页版没有可写的文件夹，只能落到浏览器的下载目录，所以这里明说一句，不装作能设。
 */
export default function FileReceiveSetting() {
  const files = typeof window === 'undefined' ? undefined : window.officeDesktop?.files;
  const [folder, setFolder] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!files?.settings) return;
    let live = true;
    void files.settings()
      .then(next => { if (live) setFolder(String(next?.receiveDir || '')); })
      .catch(() => undefined);
    return () => { live = false; };
  }, [files]);

  if (!files?.settings) {
    return <p className="settings-note">
      文件接收：<strong>网页版</strong>。同事发来的文件会直接下载到浏览器的下载文件夹；
      想要「直接落进指定文件夹、还有系统进度条」，请安装桌面客户端。
    </p>;
  }

  return <div className="settings-row file-folder-setting">
    <span>
      接收文件夹：
      <strong title={folder || undefined}>{folder || '读取中…'}</strong>
    </span>
    <span className="file-folder-actions">
      <button type="button" disabled={busy} onClick={async () => {
        setBusy(true);
        try {
          const next = await files.chooseFolder?.();
          if (next?.receiveDir) setFolder(String(next.receiveDir));
        } finally { setBusy(false); }
      }}>{busy ? '选择中…' : '更改文件夹'}</button>
      <button type="button" onClick={() => void files.openFolder?.(folder)}>打开文件夹</button>
    </span>
  </div>;
}
