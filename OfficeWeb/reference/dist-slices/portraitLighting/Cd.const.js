const Cd = {
        DEG2RAD: ps,
        RAD2DEG: Gi,
        generateUUID: hn,
        clamp: Ke,
        euclideanModulo: Fo,
        mapLinear: pd,
        inverseLerp: md,
        lerp: ms,
        damp: gd,
        pingpong: _d,
        smoothstep: xd,
        smootherstep: vd,
        randInt: Md,
        randFloat: Sd,
        randFloatSpread: yd,
        seededRandom: Td,
        degToRad: Ed,
        radToDeg: bd,
        isPowerOfTwo: Ad,
        ceilPowerOfTwo: wd,
        floorPowerOfTwo: vh,
        setQuaternionFromProperEuler: Rd,
        normalize: Bo,
        denormalize: Oo
    },
    nl = class nl {
        constructor(e = 0, t = 0) {
            this.x = e, this.y = t
        }
        get width() {
            return this.x
        }
        set width(e) {
            this.x = e
        }
        get height() {
            return this.y
        }
        set height(e) {
            this.y = e
        }
        set(e, t) {
            return this.x = e, this.y = t, this
        }
        setScalar(e) {
            return this.x = e, this.y = e, this
        }
        setX(e) {
            return this.x = e, this
        }
        setY(e) {
            return this.y = e, this
        }
        setComponent(e, t) {
            switch (e) {
                case 0:
                    this.x = t;
                    break;
                case 1:
                    this.y = t;
                    break;
                default:
                    throw new Error("THREE.Vector2: index is out of range: " + e)
            }
            return this
        }
        getComponent(e) {
            switch (e) {
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                default:
                    throw new Error("THREE.Vector2: index is out of range: " + e)
            }
        }
        clone() {
            return new this.constructor(this.x, this.y)
        }
        copy(e) {
            return this.x = e.x, this.y = e.y, this
        }
        add(e) {
            return this.x += e.x, this.y += e.y, this
        }
        addScalar(e) {
            return this.x += e, this.y += e, this
        }
        addVectors(e, t) {
            return this.x = e.x + t.x, this.y = e.y + t.y, this
        }
        addScaledVector(e, t) {
            return this.x += e.x * t, this.y += e.y * t, this
        }
        sub(e) {
            return this.x -= e.x, this.y -= e.y, this
        }
        subScalar(e) {
            return this.x -= e, this.y -= e, this
        }
        subVectors(e, t) {
            return this.x = e.x - t.x, this.y = e.y - t.y, this
        }
        multiply(e) {
            return this.x *= e.x, this.y *= e.y, this
        }
        multiplyScalar(e) {
            return this.x *= e, this.y *= e, this
        }
        divide(e) {
            return this.x /= e.x, this.y /= e.y, this
        }
        divideScalar(e) {
            return this.multiplyScalar(1 / e)
        }
        applyMatrix3(e) {
            const t = this.x,
                n = this.y,
                i = e.elements;
            return this.x = i[0] * t + i[3] * n + i[6], this.y = i[1] * t + i[4] * n + i[7], this
        }
        min(e) {
            return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this
        }
        max(e) {
            return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this
        }
        clamp(e, t) {
            return this.x = Ke(this.x, e.x, t.x), this.y = Ke(this.y, e.y, t.y), this
        }
        clampScalar(e, t) {
            return this.x = Ke(this.x, e, t), this.y = Ke(this.y, e, t), this
        }
        clampLength(e, t) {
            const n = this.length();
            return this.divideScalar(n || 1).multiplyScalar(Ke(n, e, t))
        }
        floor() {
            return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this
        }
        ceil() {
            return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this
        }
        round() {
            return this.x = Math.round(this.x), this.y = Math.round(this.y), this
        }
        roundToZero() {
            return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this
        }
        negate() {
            return this.x = -this.x, this.y = -this.y, this
        }
        dot(e) {
            return this.x * e.x + this.y * e.y
        }
        cross(e) {
            return this.x * e.y - this.y * e.x
        }
        lengthSq() {
            return this.x * this.x + this.y * this.y
        }
        length() {
            return Math.sqrt(this.x * this.x + this.y * this.y)
        }
        manhattanLength() {
            return Math.abs(this.x) + Math.abs(this.y)
        }
        normalize() {
            return this.divideScalar(this.length() || 1)
        }
        angle() {
            return Math.atan2(-this.y, -this.x) + Math.PI
        }
        angleTo(e) {
            const t = Math.sqrt(this.lengthSq() * e.lengthSq());
            if (t === 0) return Math.PI / 2;
            const n = this.dot(e) / t;
            return Math.acos(Ke(n, -1, 1))
        }
        distanceTo(e) {
            return Math.sqrt(this.distanceToSquared(e))
        }
        distanceToSquared(e) {
            const t = this.x - e.x,
                n = this.y - e.y;
            return t * t + n * n
        }
        manhattanDistanceTo(e) {
            return Math.abs(this.x - e.x) + Math.abs(this.y - e.y)
        }
        setLength(e) {
            return this.normalize().multiplyScalar(e)
        }
        lerp(e, t) {
            return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this
        }
        lerpVectors(e, t, n) {
            return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this
        }
        equals(e) {
            return e.x === this.x && e.y === this.y
        }
        fromArray(e, t = 0) {
            return this.x = e[t], this.y = e[t + 1], this
        }
        toArray(e = [], t = 0) {
            return e[t] = this.x, e[t + 1] = this.y, e
        }
        fromBufferAttribute(e, t) {
            return this.x = e.getX(t), this.y = e.getY(t), this
        }
        rotateAround(e, t) {
            const n = Math.cos(t),
                i = Math.sin(t),
                r = this.x - e.x,
                a = this.y - e.y;
            return this.x = r * n - a * i + e.x, this.y = r * i + a * n + e.y, this
        }
        random() {
            return this.x = Math.random(), this.y = Math.random(), this
        }*[Symbol.iterator]() {
            yield this.x, yield this.y
        }
    };
nl.prototype.isVector2 = !0;
let re = nl;
