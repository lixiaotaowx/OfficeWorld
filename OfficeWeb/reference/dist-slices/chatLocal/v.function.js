function v(e) {
    return new Promise((r, t) => {
        const s = indexedDB.open(`office-chat-${e}`, 2);
        s.onupgradeneeded = () => {
            s.result.objectStoreNames.contains("messages") || s.result.createObjectStore("messages", {
                keyPath: "id"
            }), s.result.objectStoreNames.contains("meta") || s.result.createObjectStore("meta"), s.result.createObjectStore("files")
        }, s.onsuccess = () => {
            s.result.onversionchange = () => s.result.close(), r(s.result)
        }, s.onerror = () => t(s.error), s.onblocked = () => t(Error("Another page is using local storage"))
    })
}

