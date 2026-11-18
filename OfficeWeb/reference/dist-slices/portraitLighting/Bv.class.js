class Bv {
    constructor(e, t, n = 0, i = 1 / 0) {
        this.ray = new Ds(e, t), this.near = n, this.far = i, this.camera = null, this.layers = new ko, this.params = {
            Mesh: {},
            Line: {
                threshold: 1
            },
            LOD: {},
            Points: {
                threshold: 1
            },
            Sprite: {}
        }
    }
    set(e, t) {
        this.ray.set(e, t)
    }
    setFromCamera(e, t) {
        t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, .5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, t.projectionMatrix.elements[14]).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : ze("Raycaster: Unsupported camera type: " + t.type)
    }
    setFromXRController(e) {
        return xc.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(xc), this
    }
    intersectObject(e, t = !0, n = []) {
        return yo(e, this, n, t), n.sort(vc), n
    }
    intersectObjects(e, t = !0, n = []) {
        for (let i = 0, r = e.length; i < r; i++) yo(e[i], this, n, t);
        return n.sort(vc), n
    }
}

