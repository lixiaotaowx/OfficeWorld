const f0 = (r, e = "", t = "") => {
        const s = document.createElement(r);
        return e && (s.className = e), t && (s.textContent = t), s
    },
    bt = (r, e, t = "") => {
        const s = f0("button", t, r);
        return s.type = "button", s.addEventListener("click", e), s
    },
    r4 = (r, e, t) => {
        const s = f0("div", "chips");
        for (const [i, n] of r) {
            const o = bt(n, () => {
                t(i), s.querySelectorAll("button").forEach(a => a.setAttribute("aria-pressed", String(a === o)))
            });
            o.setAttribute("aria-pressed", String(i === e)), s.appendChild(o)
        }
        return s
    },
    At = (r, e) => {
        const t = (r == null ? void 0 : r.message) || "";
        return /[一-鿿]/.test(t) ? t : e
    };
