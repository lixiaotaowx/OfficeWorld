class Or {
    constructor(e) {
        this.writer = e, this.name = "KHR_lights_punctual"
    }
    writeNode(e, t) {
        if (!e.isLight) return;
        if (!e.isDirectionalLight && !e.isPointLight && !e.isSpotLight) {
            console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.", e);
            return
        }
        const s = this.writer,
            i = s.json,
            n = s.extensionsUsed,
            o = {};
        e.name && (o.name = e.name), o.color = e.color.toArray(), o.intensity = e.intensity, e.isDirectionalLight ? o.type = "directional" : e.isPointLight ? (o.type = "point", e.distance > 0 && (o.range = e.distance)) : e.isSpotLight && (o.type = "spot", e.distance > 0 && (o.range = e.distance), o.spot = {}, o.spot.innerConeAngle = (1 - e.penumbra) * e.angle, o.spot.outerConeAngle = e.angle), e.decay !== void 0 && e.decay !== 2 && console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."), e.target && (e.target.parent !== e || e.target.position.x !== 0 || e.target.position.y !== 0 || e.target.position.z !== -1) && console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."), n[this.name] || (i.extensions = i.extensions || {}, i.extensions[this.name] = {
            lights: []
        }, n[this.name] = !0);
        const a = i.extensions[this.name].lights;
        a.push(o), t.extensions = t.extensions || {}, t.extensions[this.name] = {
            light: a.length - 1
        }
    }
}
