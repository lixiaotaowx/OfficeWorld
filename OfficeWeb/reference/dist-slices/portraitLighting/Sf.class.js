class Sf extends rc {
    constructor(e) {
        super(e), this.uuid = hn(), this.type = "Shape", this.holes = []
    }
    getPointsHoles(e) {
        const t = [];
        for (let n = 0, i = this.holes.length; n < i; n++) t[n] = this.holes[n].getPoints(e);
        return t
    }
    extractPoints(e) {
        return {
            shape: this.getPoints(e),
            holes: this.getPointsHoles(e)
        }
    }
    copy(e) {
        super.copy(e), this.holes = [];
        for (let t = 0, n = e.holes.length; t < n; t++) {
            const i = e.holes[t];
            this.holes.push(i.clone())
        }
        return this
    }
    toJSON() {
        const e = super.toJSON();
        e.uuid = this.uuid, e.holes = [];
        for (let t = 0, n = this.holes.length; t < n; t++) {
            const i = this.holes[t];
            e.holes.push(i.toJSON())
        }
        return e
    }
    fromJSON(e) {
        super.fromJSON(e), this.uuid = e.uuid, this.holes = [];
        for (let t = 0, n = e.holes.length; t < n; t++) {
            const i = e.holes[t];
            this.holes.push(new rc().fromJSON(i))
        }
        return this
    }
}

