function Ld() {
    const s = {
            enabled: !0,
            workingColorSpace: Xt,
            spaces: {},
            convert: function(i, r, a) {
                return this.enabled === !1 || r === a || !r || !a || (this.spaces[r].transfer === ct && (i.r = Fn(i.r), i.g = Fn(i.g), i.b = Fn(i.b)), this.spaces[r].primaries !== this.spaces[a].primaries && (i.applyMatrix3(this.spaces[r].toXYZ), i.applyMatrix3(this.spaces[a].fromXYZ)), this.spaces[a].transfer === ct && (i.r = Oi(i.r), i.g = Oi(i.g), i.b = Oi(i.b))), i
            },
            workingToColorSpace: function(i, r) {
                return this.convert(i, this.workingColorSpace, r)
            },
            colorSpaceToWorking: function(i, r) {
                return this.convert(i, r, this.workingColorSpace)
            },
            getPrimaries: function(i) {
                return this.spaces[i].primaries
            },
            getTransfer: function(i) {
                return i === Yn ? Ar : this.spaces[i].transfer
            },
            getToneMappingMode: function(i) {
                return this.spaces[i].outputColorSpaceConfig.toneMappingMode || "standard"
            },
            getLuminanceCoefficients: function(i, r = this.workingColorSpace) {
                return i.fromArray(this.spaces[r].luminanceCoefficients)
            },
            define: function(i) {
                Object.assign(this.spaces, i)
            },
            _getMatrix: function(i, r, a) {
                return i.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)
            },
            _getDrawingBufferColorSpace: function(i) {
                return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace
            },
            _getUnpackColorSpace: function(i = this.workingColorSpace) {
                return this.spaces[i].workingColorSpaceConfig.unpackColorSpace
            }
        },
        e = [.64, .33, .3, .6, .15, .06],
        t = [.2126, .7152, .0722],
        n = [.3127, .329];
    return s.define({
        [Xt]: {
            primaries: e,
            whitePoint: n,
            transfer: Ar,
            toXYZ: Rl,
            fromXYZ: Cl,
            luminanceCoefficients: t,
            workingColorSpaceConfig: {
                unpackColorSpace: bt
            },
            outputColorSpaceConfig: {
                drawingBufferColorSpace: bt
            }
        },
        [bt]: {
            primaries: e,
            whitePoint: n,
            transfer: ct,
            toXYZ: Rl,
            fromXYZ: Cl,
            luminanceCoefficients: t,
            outputColorSpaceConfig: {
                drawingBufferColorSpace: bt
            }
        }
    }), s
}
