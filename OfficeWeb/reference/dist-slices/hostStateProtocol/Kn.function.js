function Kn(n) {
    return {
        rows: n.snapshot(),
        lookup: n.lookup,
        localImage: n.localImage,
        fileAction: n.fileAction,
        attach: n.attach,
        sendFiles: n.sendFiles,
        downloadAttachment: n.downloadAttachment,
        open: n.open,
        reveal: n.reveal,
        cancel: n.cancel,
        dismiss: n.dismiss,
        dismissAll: n.dismissAll,
        dockRows: n.dockRows
    }
}

