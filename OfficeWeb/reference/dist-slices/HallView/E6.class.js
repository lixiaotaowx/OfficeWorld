class E6 {
    constructor(e, t, s, i) {
        m(this, "element", document.createElement("div"));
        m(this, "play", document.createElement("button"));
        m(this, "mute", document.createElement("button"));
        m(this, "seek", document.createElement("input"));
        m(this, "time", document.createElement("span"));
        m(this, "hint", document.createElement("small"));
        m(this, "lastState", "");
        this.video = e, this.notice = i, this.element.className = "hall-cinema-controls", this.element.setAttribute("role", "group"), this.element.setAttribute("aria-label", "影院屏观看控制");
        const n = (o, a, l) => (o.type = "button", o.textContent = a, o.addEventListener("click", l), o);
        n(this.play, "播放", () => this.toggle()), n(this.mute, "静音", () => {
            const o = this.video();
            o && (o.muted = !o.muted), this.update()
        }), this.seek.type = "range", this.seek.min = "0", this.seek.step = "0.1", this.seek.value = "0", this.seek.setAttribute("aria-label", "视频播放进度"), this.seek.addEventListener("input", () => {
            const o = this.video();
            o && Number.isFinite(o.duration) && (o.currentTime = Number(this.seek.value))
        }), this.element.append(this.play, this.seek, this.time, this.mute, n(document.createElement("button"), "换内容", t), n(document.createElement("button"), "退出观看", s), this.hint);
        for (const o of ["pointerdown", "pointerup", "click", "dblclick", "wheel", "keydown", "keyup"]) this.element.addEventListener(o, a => {
            a.stopPropagation(), o === "keydown" && a.key === "Escape" && s()
        });
        this.update()
    }
    toggle() {
        const e = this.video();
        e && (e.paused ? e.play().catch(() => this.notice("视频暂时无法播放，请检查链接或换一个文件")) : e.pause(), this.update())
    }
    update(e = "平台视频请使用播放器内的控制") {
        var o;
        const t = this.video(),
            s = JSON.stringify([!!t, t == null ? void 0 : t.paused, t == null ? void 0 : t.muted, (o = t == null ? void 0 : t.error) == null ? void 0 : o.code, t == null ? void 0 : t.duration, Math.floor(((t == null ? void 0 : t.currentTime) || 0) * 10), e]);
        if (s === this.lastState || (this.lastState = s, this.play.hidden = this.mute.hidden = this.seek.hidden = this.time.hidden = !t, this.hint.textContent = t ? t.error ? "视频加载失败，请换一个文件或链接" : "播放控制仅影响自己" : e, !t)) return;
        this.play.textContent = t.paused ? "播放" : "暂停", this.mute.textContent = t.muted ? "开启声音" : "静音", this.mute.setAttribute("aria-pressed", String(t.muted));
        const i = Number.isFinite(t.duration) && t.duration > 0;
        this.seek.disabled = !i, this.seek.max = String(i ? t.duration : 0), this.seek.value = String(t.currentTime || 0);
        const n = a => `${Math.floor(a/60)}:${String(Math.floor(a%60)).padStart(2,"0")}`;
        this.time.textContent = `${n(t.currentTime||0)} / ${i?n(t.duration):"--:--"}`
    }
    dispose() {
        this.element.remove()
    }
}

