function ee(e) {
    return new Promise((r, t) => {
        const s = e.transaction(["messages", "meta"], "readonly"),
            n = s.objectStore("messages").getAll(),
            o = s.objectStore("meta").get("cursor");
        s.oncomplete = () => r({
            messages: n.result,
            cursor: o.result || ""
        }), s.onabort = () => t(s.error), s.onerror = () => t(s.error)
    })
}

