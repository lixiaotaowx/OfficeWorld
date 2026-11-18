const we = new Map,
    He = t => {
        const s = we.get(t);
        if (s) return s;
        const n = new Promise((c, r) => {
            const i = new Image;
            i.onload = () => c(i), i.onerror = r, i.src = t
        });
        return t.startsWith("data:") || (we.set(t, n), n.catch(() => {
            we.get(t) === n && we.delete(t)
        }), we.size > 48 && we.delete(we.keys().next().value)), n
    },
    tt = new Map;

