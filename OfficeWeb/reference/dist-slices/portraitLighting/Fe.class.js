class Fe {
    constructor(e, t, n) {
        return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n)
    }
    set(e, t, n) {
        if (t === void 0 && n === void 0) {
            const i = e;
            i && i.isColor ? this.copy(i) : typeof i == "number" ? this.setHex(i) : typeof i == "string" && this.setStyle(i)
        } else this.setRGB(e, t, n);
        return this
    }
    setScalar(e) {
        return this.r = e, this.g = e, this.b = e, this
    }
    setHex(e, t = bt) {
        return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, Qe.colorSpaceToWorking(this, t), this
    }
    setRGB(e, t, n, i = Qe.workingColorSpace) {
        return this.r = e, this.g = t, this.b = n, Qe.colorSpaceToWorking(this, i), this
    }
    setHSL(e, t, n, i = Qe.workingColorSpace) {
        if (e = Fo(e, 1), t = Ke(t, 0, 1), n = Ke(n, 0, 1), t === 0) this.r = this.g = this.b = n;
        else {
            const r = n <= .5 ? n * (1 + t) : n + t - n * t,
                a = 2 * n - r;
            this.r = jr(a, r, e + 1 / 3), this.g = jr(a, r, e), this.b = jr(a, r, e - 1 / 3)
        }
        return Qe.colorSpaceToWorking(this, i), this
    }
    setStyle(e, t = bt) {
        function n(r) {
            r !== void 0 && parseFloat(r) < 1 && Ce("Color: Alpha component of " + e + " will be ignored.")
        }
        let i;
        if (i = /^(\w+)\(([^\)]*)\)/.exec(e)) {
            let r;
            const a = i[1],
                o = i[2];
            switch (a) {
                case "rgb":
                case "rgba":
                    if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o)) return n(r[4]), this.setRGB(Math.min(255, parseInt(r[1], 10)) / 255, Math.min(255, parseInt(r[2], 10)) / 255, Math.min(255, parseInt(r[3], 10)) / 255, t);
                    if (r = /^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o)) return n(r[4]), this.setRGB(Math.min(100, parseFloat(r[1])) / 100, Math.min(100, parseFloat(r[2])) / 100, Math.min(100, parseFloat(r[3])) / 100, t);
                    break;
                case "hsl":
                case "hsla":
                    if (r = /^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o)) return n(r[4]), this.setHSL(parseFloat(r[1]) / 360, parseFloat(r[2]) / 100, parseFloat(r[3]) / 100, t);
                    break;
                default:
                    Ce("Color: Unknown color model " + e)
            }
        } else if (i = /^\#([A-Fa-f\d]+)$/.exec(e)) {
            const r = i[1],
                a = r.length;
            if (a === 3) return this.setRGB(parseInt(r.charAt(0), 16) / 15, parseInt(r.charAt(1), 16) / 15, parseInt(r.charAt(2), 16) / 15, t);
            if (a === 6) return this.setHex(parseInt(r, 16), t);
            Ce("Color: Invalid hex color " + e)
        } else if (e && e.length > 0) return this.setColorName(e, t);
        return this
    }
    setColorName(e, t = bt) {
        const n = Sh[e.toLowerCase()];
        return n !== void 0 ? this.setHex(n, t) : Ce("Color: Unknown color " + e), this
    }
    clone() {
        return new this.constructor(this.r, this.g, this.b)
    }
    copy(e) {
        return this.r = e.r, this.g = e.g, this.b = e.b, this
    }
    copySRGBToLinear(e) {
        return this.r = Fn(e.r), this.g = Fn(e.g), this.b = Fn(e.b), this
    }
    copyLinearToSRGB(e) {
        return this.r = Oi(e.r), this.g = Oi(e.g), this.b = Oi(e.b), this
    }
    convertSRGBToLinear() {
        return this.copySRGBToLinear(this), this
    }
    convertLinearToSRGB() {
        return this.copyLinearToSRGB(this), this
    }
    getHex(e = bt) {
        return Qe.workingToColorSpace(kt.copy(this), e), Math.round(Ke(kt.r * 255, 0, 255)) * 65536 + Math.round(Ke(kt.g * 255, 0, 255)) * 256 + Math.round(Ke(kt.b * 255, 0, 255))
    }
    getHexString(e = bt) {
        return ("000000" + this.getHex(e).toString(16)).slice(-6)
    }
    getHSL(e, t = Qe.workingColorSpace) {
        Qe.workingToColorSpace(kt.copy(this), t);
        const n = kt.r,
            i = kt.g,
            r = kt.b,
            a = Math.max(n, i, r),
            o = Math.min(n, i, r);
        let l, c;
        const h = (o + a) / 2;
        if (o === a) l = 0, c = 0;
        else {
            const u = a - o;
            switch (c = h <= .5 ? u / (a + o) : u / (2 - a - o), a) {
                case n:
                    l = (i - r) / u + (i < r ? 6 : 0);
                    break;
                case i:
                    l = (r - n) / u + 2;
                    break;
                case r:
                    l = (n - i) / u + 4;
                    break
            }
            l /= 6
        }
        return e.h = l, e.s = c, e.l = h, e
    }
    getRGB(e, t = Qe.workingColorSpace) {
        return Qe.workingToColorSpace(kt.copy(this), t), e.r = kt.r, e.g = kt.g, e.b = kt.b, e
    }
    getStyle(e = bt) {
        Qe.workingToColorSpace(kt.copy(this), e);
        const t = kt.r,
            n = kt.g,
            i = kt.b;
        return e !== bt ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`
    }
    offsetHSL(e, t, n) {
        return this.getHSL(kn), this.setHSL(kn.h + e, kn.s + t, kn.l + n)
    }
    add(e) {
        return this.r += e.r, this.g += e.g, this.b += e.b, this
    }
    addColors(e, t) {
        return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this
    }
    addScalar(e) {
        return this.r += e, this.g += e, this.b += e, this
    }
    sub(e) {
        return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this
    }
    multiply(e) {
        return this.r *= e.r, this.g *= e.g, this.b *= e.b, this
    }
    multiplyScalar(e) {
        return this.r *= e, this.g *= e, this.b *= e, this
    }
    lerp(e, t) {
        return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this
    }
    lerpColors(e, t, n) {
        return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this
    }
    lerpHSL(e, t) {
        this.getHSL(kn), e.getHSL(Hs);
        const n = ms(kn.h, Hs.h, t),
            i = ms(kn.s, Hs.s, t),
            r = ms(kn.l, Hs.l, t);
        return this.setHSL(n, i, r), this
    }
    setFromVector3(e) {
        return this.r = e.x, this.g = e.y, this.b = e.z, this
    }
    applyMatrix3(e) {
        const t = this.r,
            n = this.g,
            i = this.b,
            r = e.elements;
        return this.r = r[0] * t + r[3] * n + r[6] * i, this.g = r[1] * t + r[4] * n + r[7] * i, this.b = r[2] * t + r[5] * n + r[8] * i, this
    }
    equals(e) {
        return e.r === this.r && e.g === this.g && e.b === this.b
    }
    fromArray(e, t = 0) {
        return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this
    }
    toArray(e = [], t = 0) {
        return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e
    }
    fromBufferAttribute(e, t) {
        return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this
    }
    toJSON() {
        return this.getHex()
    }*[Symbol.iterator]() {
        yield this.r, yield this.g, yield this.b
    }
}
