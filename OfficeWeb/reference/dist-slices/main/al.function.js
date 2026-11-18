function Al() {
    I.useEffect(() => {
        Jo();
        let i;
        const e = () => {
                var c;
                const n = document.getElementById("officeworld-desktop-chrome"),
                    s = (c = n == null ? void 0 : n.shadowRoot) == null ? void 0 : c.querySelector(".drag");
                if (!s) return;
                const r = s.getAttribute("style"),
                    a = n.getAttribute("style");
                n.style.setProperty("height", "52px", "important"), s.style.setProperty("height", "52px", "important"), s.style.setProperty("top", "0", "important"), s.style.setProperty("left", "16px", "important"), s.style.setProperty("right", "60px", "important"), s.style.setProperty("-webkit-app-region", "drag", "important"), s.style.setProperty("pointer-events", "auto", "important"), s.style.setProperty("background", "transparent", "important"), s.style.setProperty("border", "0", "important");
                const o = document.createElement("style");
                o.textContent = ".drag::after { display: none !important; }", n.shadowRoot.append(o), i = () => {
                    o.remove(), r === null ? s.removeAttribute("style") : s.setAttribute("style", r), a === null ? n.removeAttribute("style") : n.setAttribute("style", a)
                }, t.disconnect()
            },
            t = new MutationObserver(e);
        return t.observe(document.body, {
            childList: !0
        }), e(), () => {
            t.disconnect(), i == null || i()
        }
    }, [])
}

