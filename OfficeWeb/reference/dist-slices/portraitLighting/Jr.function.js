function Jr(s) {
    return typeof HTMLImageElement < "u" && s instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && s instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && s instanceof ImageBitmap ? Pd.getDataURL(s) : s.data ? {
        data: Array.from(s.data),
        width: s.width,
        height: s.height,
        type: s.data.constructor.name
    } : (Ce("Texture: Unable to serialize Texture."), {})
}
let Nd = 0;
