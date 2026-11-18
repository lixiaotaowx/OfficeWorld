function Cc() {
    var i;
    const e = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
    if (e) {
        const t = new e({
            latencyHint: "interactive"
        });
        if (t.state === "suspended" && typeof window < "u" && (!((i = window.document) === null || i === void 0) && i.body)) {
            const n = () => b(this, void 0, void 0, function*() {
                var s;
                try {
                    t.state === "suspended" && (yield t.resume())
                } catch (r) {
                    console.warn("Error trying to auto-resume audio context", r)
                } finally {
                    (s = window.document.body) === null || s === void 0 || s.removeEventListener("click", n)
                }
            });
            t.addEventListener("statechange", () => {
                var s;
                t.state === "closed" && ((s = window.document.body) === null || s === void 0 || s.removeEventListener("click", n))
            }), window.document.body.addEventListener("click", n)
        }
        return t
    }
}

