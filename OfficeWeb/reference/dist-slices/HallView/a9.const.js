const a9 = {
        undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
        redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 14 5-5-5-5M20 9H9a5 5 0 0 0 0 10h3"/></svg>',
        done: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 12 5 5 9-10"/></svg>',
        upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4v12M6 10l6-6 6 6M4 20h16"/></svg>'
    },
    I0 = (r, e = "", t = "") => {
        const s = document.createElement(r);
        return e && (s.className = e), t && (s.innerHTML = t), s
    },
    Vt = (r, e, t, s) => {
        const i = I0("button", r, t);
        return i.type = "button", i.title = e, i.setAttribute("aria-label", e), i.addEventListener("click", s), i
    };
