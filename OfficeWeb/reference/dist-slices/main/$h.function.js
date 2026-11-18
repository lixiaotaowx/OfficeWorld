function $h(i) {
    var e, t;
    let n = (e = i.video) !== null && e !== void 0 ? e : !0;
    return i.resolution && i.resolution.width > 0 && i.resolution.height > 0 && (n = typeof n == "boolean" ? {} : n, Dt() ? n = Object.assign(Object.assign({}, n), {
        width: {
            max: i.resolution.width
        },
        height: {
            max: i.resolution.height
        },
        frameRate: i.resolution.frameRate
    }) : n = Object.assign(Object.assign({}, n), {
        width: {
            ideal: i.resolution.width
        },
        height: {
            ideal: i.resolution.height
        },
        frameRate: i.resolution.frameRate
    })), {
        audio: (t = i.audio) !== null && t !== void 0 ? t : !1,
        video: n,
        controller: i.controller,
        selfBrowserSurface: i.selfBrowserSurface,
        surfaceSwitching: i.surfaceSwitching,
        systemAudio: i.systemAudio,
        preferCurrentTab: i.preferCurrentTab
    }
}

