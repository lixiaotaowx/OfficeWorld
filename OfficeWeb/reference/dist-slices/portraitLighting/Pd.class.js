class Pd {
    static getDataURL(e, t = "image/png") {
        if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u") return e.src;
        let n;
        if (e instanceof HTMLCanvasElement) n = e;
        else {
            mi === void 0 && (mi = bs("canvas")), mi.width = e.width, mi.height = e.height;
            const i = mi.getContext("2d");
            e instanceof ImageData ? i.putImageData(e, 0, 0) : i.drawImage(e, 0, 0, e.width, e.height), n = mi
        }
        return n.toDataURL(t)
    }
    static sRGBToLinear(e) {
        if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
            const t = bs("canvas");
            t.width = e.width, t.height = e.height;
            const n = t.getContext("2d");
            n.drawImage(e, 0, 0, e.width, e.height);
            const i = n.getImageData(0, 0, e.width, e.height),
                r = i.data;
            for (let a = 0; a < r.length; a++) r[a] = Fn(r[a] / 255) * 255;
            return n.putImageData(i, 0, 0), t
        } else if (e.data) {
            const t = e.data.slice(0);
            for (let n = 0; n < t.length; n++) t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(Fn(t[n] / 255) * 255) : t[n] = Fn(t[n]);
            return {
                data: t,
                width: e.width,
                height: e.height
            }
        } else return Ce("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e
    }
}
let Id = 0;
