import type { FileTransferChannel } from './fileTransfer';
import type { FileTransfers } from './useFileTransfers';

/** The view-facing facade over the transfer channel, without React state. */
export function fileTransfersView(channel: FileTransferChannel): FileTransfers {
  return {
    rows: channel.snapshot(),
    lookup: channel.lookup,
    localImage: channel.localImage,
    fileAction: channel.fileAction,
    attach: channel.attach,
    sendFiles: channel.sendFiles,
    downloadAttachment: channel.downloadAttachment,
    open: channel.open,
    reveal: channel.reveal,
    cancel: channel.cancel,
    dismiss: channel.dismiss,
    dismissAll: channel.dismissAll,
    dockRows: channel.dockRows,
  };
}
