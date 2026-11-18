function xd(p) {
    const [S, f] = gr.useState(() => To(p));
    return gr.useEffect(() => {
        const R = () => f(To(p));
        return R(), window.addEventListener("storage", R), window.addEventListener("office-chat-local", R), () => {
            window.removeEventListener("storage", R), window.removeEventListener("office-chat-local", R)
        }
    }, [p]), S
}
async function Nd(p, S, f) {
    const R = await Hf(p);
    try {
        od(p, S, {
            deletedThrough: f
        }), await new Promise((E, z) => {
            const F = R.transaction(["messages", "files"], "readwrite"),
                O = F.objectStore("messages").openCursor();
            O.onsuccess = () => {
                var V;
                const M = O.result;
                if (!M) return;
                const A = M.value;
                (A.recipientId ? A.senderId === p ? A.recipientId : A.senderId : "public") === S && A.time <= f && (M.delete(), (V = A.attachment) != null && V.id && F.objectStore("files").delete(A.attachment.id)), M.continue()
            }, F.oncomplete = () => E(), F.onerror = F.onabort = () => z(F.error)
        })
    } finally {
        R.close()
    }
}
