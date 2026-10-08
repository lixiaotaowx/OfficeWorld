// 文件直传的 React 外壳。真正的逻辑在 `fileTransfer.ts`（纯通道，可单测），这里只订阅它。
//
// `attach(socket)` 由 `useOffice` 在 socket 建好之后立刻调一次——socket 的唯一拥有者是
// 主窗口那一层，头像条小窗永远不碰它（项目铁律）。
import { useMemo, useSyncExternalStore } from 'react';
import { createFileTransferChannel } from './fileTransfer';

export function useFileTransfers(notify: (message: string) => void) {
  // `notify` 是 useState 的 setter，引用本来就稳定，所以只建一次通道。
  const channel = useMemo(() => createFileTransferChannel({ notify }), []);
  const rows = useSyncExternalStore(channel.subscribe, channel.snapshot);
  return {
    /** 当前这几条记录（正在传的 + 刚完事的）。 */
    rows,
    /** socket 建好之后由 useOffice 调一次。 */
    attach: channel.attach,
    /** 拖到头像上的文件：`sendFiles(对方 id, 路径数组, 对方名字)`。 */
    sendFiles: channel.sendFiles,
    /** 聊天附件下载：走同一条通道，进度/任务栏/卡片/打开按钮全都复用（用户 2026-09-21）。 */
    downloadAttachment: channel.downloadAttachment,
    /** 完事的两个按钮：打开文件 / 在文件夹里显示。 */
    open: channel.open,
    reveal: channel.reveal,
    cancel: channel.cancel,
    dismiss: channel.dismiss,
    dismissAll: channel.dismissAll,
    /** 推给任务栏头像条的那一小段摘要。 */
    dockRows: channel.dockRows,
  };
}

export type FileTransfers = ReturnType<typeof useFileTransfers>;
