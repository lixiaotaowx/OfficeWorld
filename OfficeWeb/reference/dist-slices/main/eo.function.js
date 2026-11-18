function eo() {
    let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 16,
        e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 16,
        t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1,
        n = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
    const s = document.createElement("canvas");
    s.width = i, s.height = e;
    const r = s.getContext("2d");
    r == null || r.fillRect(0, 0, s.width, s.height), n && r && (r.beginPath(), r.arc(i / 2, e / 2, 50, 0, Math.PI * 2, !0), r.closePath(), r.fillStyle = "grey", r.fill());
    const a = s.captureStream(),
        [o] = a.getTracks();
    if (!o) throw Error("Could not get empty media stream video track");
    return o.enabled = t, o
}
let ti;

