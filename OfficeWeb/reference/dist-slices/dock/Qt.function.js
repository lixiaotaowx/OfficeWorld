function Qt(t) {
    let s = 0,
        n = !1,
        c;
    const r = ".dock, .dock-card, .dock-status-menu, .dock-meeting-panel, .dock-share-bubble, .dock button, .dock input, .dock select, .dock textarea, .dock a[href]";

    function i() {
        if (s = 0, n) return;
        const b = [...document.querySelectorAll(r)].map(g => g.getBoundingClientRect()).filter(g => g.width > 0 && g.height > 0).map(g => new DOMRect(Math.max(0, g.x), Math.max(0, g.y), Math.max(0, Math.min(innerWidth, g.right) - Math.max(0, g.x)), Math.max(0, Math.min(innerHeight, g.bottom) - Math.max(0, g.y))));
        t(b.filter((g, R) => g.width > 0 && g.height > 0 && !b.some((N, C) => C < R && N.left <= g.left && N.top <= g.top && N.right >= g.right && N.bottom >= g.bottom)))
    }

    function o() {
        s || (s = requestAnimationFrame(i))
    }
    const d = () => {
            n = !0, clearTimeout(c)
        },
        m = () => {
            c = setTimeout(() => {
                n = !1, o()
            }, 0)
        };
    document.addEventListener("pointerdown", d, !0), document.addEventListener("pointerup", m, !0), document.addEventListener("pointercancel", m, !0), window.addEventListener("blur", m);
    const h = new ResizeObserver(o),
        k = new MutationObserver(() => {
            h.disconnect(), document.querySelectorAll(r).forEach(b => h.observe(b)), o()
        });
    k.observe(document.getElementById("root"), {
        childList: !0,
        subtree: !0,
        attributes: !0,
        attributeFilter: ["class", "style"]
    }), document.querySelectorAll(r).forEach(b => h.observe(b)), window.addEventListener("resize", o), document.addEventListener("scroll", o, !0);
    const f = window.setInterval(o, 100);
    return o(), () => {
        cancelAnimationFrame(s), k.disconnect(), h.disconnect(), window.removeEventListener("resize", o), document.removeEventListener("scroll", o, !0), clearInterval(f), clearTimeout(c), document.removeEventListener("pointerdown", d, !0), document.removeEventListener("pointerup", m, !0), document.removeEventListener("pointercancel", m, !0), window.removeEventListener("blur", m)
    }
}

