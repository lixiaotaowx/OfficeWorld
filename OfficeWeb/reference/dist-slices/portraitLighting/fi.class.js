class fi extends Zt {
    constructor(e) {
        super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Wf, this.fragmentShader = Xf, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
            clipCullDistance: !1,
            multiDraw: !1
        }, this.defaultAttributeValues = {
            color: [1, 1, 1],
            uv: [0, 0],
            uv1: [0, 0]
        }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = Xi(e.uniforms), this.uniformsGroups = Gf(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this.defaultAttributeValues = Object.assign({}, e.defaultAttributeValues), this.index0AttributeName = e.index0AttributeName, this.uniformsNeedUpdate = e.uniformsNeedUpdate, this
    }
    toJSON(e) {
        const t = super.toJSON(e);
        t.glslVersion = this.glslVersion, t.uniforms = {};
        for (const i in this.uniforms) {
            const a = this.uniforms[i].value;
            a && a.isTexture ? t.uniforms[i] = {
                type: "t",
                value: a.toJSON(e).uuid
            } : a && a.isColor ? t.uniforms[i] = {
                type: "c",
                value: a.getHex()
            } : a && a.isVector2 ? t.uniforms[i] = {
                type: "v2",
                value: a.toArray()
            } : a && a.isVector3 ? t.uniforms[i] = {
                type: "v3",
                value: a.toArray()
            } : a && a.isVector4 ? t.uniforms[i] = {
                type: "v4",
                value: a.toArray()
            } : a && a.isMatrix3 ? t.uniforms[i] = {
                type: "m3",
                value: a.toArray()
            } : a && a.isMatrix4 ? t.uniforms[i] = {
                type: "m4",
                value: a.toArray()
            } : t.uniforms[i] = {
                value: a
            }
        }
        Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
        const n = {};
        for (const i in this.extensions) this.extensions[i] === !0 && (n[i] = !0);
        return Object.keys(n).length > 0 && (t.extensions = n), t
    }
    fromJSON(e, t) {
        if (super.fromJSON(e, t), e.uniforms !== void 0)
            for (const n in e.uniforms) {
                const i = e.uniforms[n];
                switch (this.uniforms[n] = {}, i.type) {
                    case "t":
                        this.uniforms[n].value = t[i.value] || null;
                        break;
                    case "c":
                        this.uniforms[n].value = new Fe().setHex(i.value);
                        break;
                    case "v2":
                        this.uniforms[n].value = new re().fromArray(i.value);
                        break;
                    case "v3":
                        this.uniforms[n].value = new N().fromArray(i.value);
                        break;
                    case "v4":
                        this.uniforms[n].value = new ht().fromArray(i.value);
                        break;
                    case "m3":
                        this.uniforms[n].value = new He().fromArray(i.value);
                        break;
                    case "m4":
                        this.uniforms[n].value = new We().fromArray(i.value);
                        break;
                    default:
                        this.uniforms[n].value = i.value
                }
            }
        if (e.defines !== void 0 && (this.defines = e.defines), e.vertexShader !== void 0 && (this.vertexShader = e.vertexShader), e.fragmentShader !== void 0 && (this.fragmentShader = e.fragmentShader), e.glslVersion !== void 0 && (this.glslVersion = e.glslVersion), e.extensions !== void 0)
            for (const n in e.extensions) this.extensions[n] = e.extensions[n];
        return e.lights !== void 0 && (this.lights = e.lights), e.clipping !== void 0 && (this.clipping = e.clipping), this
    }
}
