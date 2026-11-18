class O8 {
    constructor(e) {
        m(this, "layer", document.createElement("div"));
        m(this, "picture", document.createElement("canvas"));
        m(this, "status", document.createElement("div"));
        m(this, "context", this.picture.getContext("2d"));
        m(this, "saved", !1);
        m(this, "needsSnapshot", !0);
        this.layer.className = "hall-frame-cover", this.picture.hidden = !0, this.picture.setAttribute("aria-hidden", "true"), this.status.className = "hall-frame-status", this.status.setAttribute("role", "status"), this.status.textContent = "正在加载大厅…", this.layer.append(this.picture, this.status), e.append(this.layer)
    }
    hold() {
        this.layer.hidden = !1, this.needsSnapshot = !0
    }
    present(e, t, s = !1) {
        if (!(!e.width || !e.height)) {
            if (this.context && (s || !this.saved || this.needsSnapshot)) {
                const i = Math.min(1, 1280 / e.width, 720 / e.height),
                    n = Math.max(1, Math.round(e.width * i)),
                    o = Math.max(1, Math.round(e.height * i));
                try {
                    (this.picture.width !== n || this.picture.height !== o) && (this.picture.width = n, this.picture.height = o), this.context.drawImage(e, 0, 0, n, o), this.saved = !0, this.needsSnapshot = !1, this.picture.hidden = !1, this.status.hidden = !0
                } catch {}
            }
            this.layer.hidden = !0
        }
    }
    dispose() {
        this.layer.remove(), this.picture.width = this.picture.height = 0
    }
}
