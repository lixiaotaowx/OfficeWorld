function wc(i) {
    const e = Object.assign({}, i);
    let t, n;
    return typeof e.audio == "object" && e.audio.processor && (t = e.audio.processor, e.audio = Object.assign(Object.assign({}, e.audio), {
        processor: void 0
    })), typeof e.video == "object" && e.video.processor && (n = e.video.processor, e.video = Object.assign(Object.assign({}, e.video), {
        processor: void 0
    })), {
        audioProcessor: t,
        videoProcessor: n,
        optionsWithoutProcessor: Wh(e)
    }
}

