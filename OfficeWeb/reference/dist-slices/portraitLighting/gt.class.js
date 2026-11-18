class gt extends jn {
    constructor() {
        super(), this.isObject3D = !0, Object.defineProperty(this, "id", {
            value: Bd++
        }), this.uuid = hn(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = gt.DEFAULT_UP.clone();
        const e = new N,
            t = new Tn,
            n = new en,
            i = new N(1, 1, 1);

        function r() {
            n.setFromEuler(t, !1)
        }

        function a() {
            t.setFromQuaternion(n, void 0, !1)
        }
        t._onChange(r), n._onChange(a), Object.defineProperties(this, {
            position: {
                configurable: !0,
                enumerable: !0,
                value: e
            },
            rotation: {
                configurable: !0,
                enumerable: !0,
                value: t
            },
            quaternion: {
                configurable: !0,
                enumerable: !0,
                value: n
            },
            scale: {
                configurable: !0,
                enumerable: !0,
                value: i
            },
            modelViewMatrix: {
                value: new We
            },
            normalMatrix: {
                value: new He
            }
        }), this.matrix = new We, this.matrixWorld = new We, this.matrixAutoUpdate = gt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new ko, this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.static = !1, this.userData = {}, this.pivot = null
    }
    onBeforeShadow() {}
    onAfterShadow() {}
    onBeforeRender() {}
    onAfterRender() {}
    applyMatrix4(e) {
        this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale), this.pivot !== null && this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)
    }
    applyQuaternion(e) {
        return this.quaternion.premultiply(e), this
    }
    setRotationFromAxisAngle(e, t) {
        this.quaternion.setFromAxisAngle(e, t)
    }
    setRotationFromEuler(e) {
        this.quaternion.setFromEuler(e, !0)
    }
    setRotationFromMatrix(e) {
        this.quaternion.setFromRotationMatrix(e)
    }
    setRotationFromQuaternion(e) {
        this.quaternion.copy(e)
    }
    rotateOnAxis(e, t) {
        return _i.setFromAxisAngle(e, t), this.quaternion.multiply(_i), this
    }
    rotateOnWorldAxis(e, t) {
        return _i.setFromAxisAngle(e, t), this.quaternion.premultiply(_i), this
    }
    rotateX(e) {
        return this.rotateOnAxis(Nl, e)
    }
    rotateY(e) {
        return this.rotateOnAxis(Dl, e)
    }
    rotateZ(e) {
        return this.rotateOnAxis(Ul, e)
    }
    translateOnAxis(e, t) {
        return Il.copy(e).applyQuaternion(this.quaternion), this.position.add(Il.multiplyScalar(t)), this
    }
    translateX(e) {
        return this.translateOnAxis(Nl, e)
    }
    translateY(e) {
        return this.translateOnAxis(Dl, e)
    }
    translateZ(e) {
        return this.translateOnAxis(Ul, e)
    }
    localToWorld(e) {
        return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld)
    }
    worldToLocal(e) {
        return this.updateWorldMatrix(!0, !1), e.applyMatrix4(wn.copy(this.matrixWorld).invert())
    }
    lookAt(e, t, n) {
        e.isVector3 ? ks.copy(e) : ks.set(e, t, n);
        const i = this.parent;
        this.updateWorldMatrix(!0, !1), Qi.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? wn.lookAt(Qi, ks, this.up) : wn.lookAt(ks, Qi, this.up), this.quaternion.setFromRotationMatrix(wn), i && (wn.extractRotation(i.matrixWorld), _i.setFromRotationMatrix(wn), this.quaternion.premultiply(_i.invert()))
    }
    add(e) {
        if (arguments.length > 1) {
            for (let t = 0; t < arguments.length; t++) this.add(arguments[t]);
            return this
        }
        return e === this ? (ze("Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(Fl), xi.child = e, this.dispatchEvent(xi), xi.child = null) : ze("Object3D.add: object not an instance of THREE.Object3D.", e), this)
    }
    remove(e) {
        if (arguments.length > 1) {
            for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
            return this
        }
        const t = this.children.indexOf(e);
        return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Hd), $r.child = e, this.dispatchEvent($r), $r.child = null), this
    }
    removeFromParent() {
        const e = this.parent;
        return e !== null && e.remove(this), this
    }
    clear() {
        return this.remove(...this.children)
    }
    attach(e) {
        return this.updateWorldMatrix(!0, !1), wn.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), wn.multiply(e.parent.matrixWorld)), e.applyMatrix4(wn), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(Fl), xi.child = e, this.dispatchEvent(xi), xi.child = null, this
    }
    getObjectById(e) {
        return this.getObjectByProperty("id", e)
    }
    getObjectByName(e) {
        return this.getObjectByProperty("name", e)
    }
    getObjectByProperty(e, t) {
        if (this[e] === t) return this;
        for (let n = 0, i = this.children.length; n < i; n++) {
            const a = this.children[n].getObjectByProperty(e, t);
            if (a !== void 0) return a
        }
    }
    getObjectsByProperty(e, t, n = []) {
        this[e] === t && n.push(this);
        const i = this.children;
        for (let r = 0, a = i.length; r < a; r++) i[r].getObjectsByProperty(e, t, n);
        return n
    }
    getWorldPosition(e) {
        return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld)
    }
    getWorldQuaternion(e) {
        return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Qi, e, zd), e
    }
    getWorldScale(e) {
        return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Qi, kd, e), e
    }
    getWorldDirection(e) {
        this.updateWorldMatrix(!0, !1);
        const t = this.matrixWorld.elements;
        return e.set(t[8], t[9], t[10]).normalize()
    }
    raycast() {}
    intersectsFrustum() {
        return !0
    }
    traverse(e) {
        e(this);
        const t = this.children;
        for (let n = 0, i = t.length; n < i; n++) t[n].traverse(e)
    }
    traverseVisible(e) {
        if (this.visible === !1) return;
        e(this);
        const t = this.children;
        for (let n = 0, i = t.length; n < i; n++) t[n].traverseVisible(e)
    }
    traverseAncestors(e) {
        const t = this.parent;
        t !== null && (e(t), t.traverseAncestors(e))
    }
    updateMatrix() {
        this.matrix.compose(this.position, this.quaternion, this.scale);
        const e = this.pivot;
        if (e !== null) {
            const t = e.x,
                n = e.y,
                i = e.z,
                r = this.matrix.elements;
            r[12] += t - r[0] * t - r[4] * n - r[8] * i, r[13] += n - r[1] * t - r[5] * n - r[9] * i, r[14] += i - r[2] * t - r[6] * n - r[10] * i
        }
        this.matrixWorldNeedsUpdate = !0
    }
    updateMatrixWorld(e) {
        this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, e = !0);
        const t = this.children;
        for (let n = 0, i = t.length; n < i; n++) t[n].updateMatrixWorld(e)
    }
    updateWorldMatrix(e, t, n = !1) {
        const i = this.parent;
        if (e === !0 && i !== null && i.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || n) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, n = !0), t === !0) {
            const r = this.children;
            for (let a = 0, o = r.length; a < o; a++) r[a].updateWorldMatrix(!1, !0, n)
        }
    }
    toJSON(e) {
        const t = e === void 0 || typeof e == "string",
            n = {};
        t && (e = {
            geometries: {},
            materials: {},
            textures: {},
            images: {},
            shapes: {},
            skeletons: {},
            animations: {},
            nodes: {}
        }, n.metadata = {
            version: 4.7,
            type: "Object",
            generator: "Object3D.toJSON"
        });
        const i = {};
        i.uuid = this.uuid, i.type = this.type, i.name = this.name, i.castShadow = this.castShadow, i.receiveShadow = this.receiveShadow, i.visible = this.visible, i.frustumCulled = this.frustumCulled, i.renderOrder = this.renderOrder, i.static = this.static, i.matrixAutoUpdate = this.matrixAutoUpdate, Object.keys(this.userData).length > 0 && (i.userData = this.userData), i.layers = this.layers.mask, i.matrix = this.matrix.toArray(), i.up = this.up.toArray(), this.pivot !== null && (i.pivot = this.pivot.toArray()), this.morphTargetDictionary !== void 0 && (i.morphTargetDictionary = Object.assign({}, this.morphTargetDictionary)), this.morphTargetInfluences !== void 0 && (i.morphTargetInfluences = this.morphTargetInfluences.slice()), this.isInstancedMesh && (i.type = "InstancedMesh", i.count = this.count, i.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (i.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (i.type = "BatchedMesh", i.perObjectFrustumCulled = this.perObjectFrustumCulled, i.sortObjects = this.sortObjects, i.drawRanges = this._drawRanges, i.reservedRanges = this._reservedRanges, i.geometryInfo = this._geometryInfo.map(o => ({
            ...o,
            boundingBox: o.boundingBox ? o.boundingBox.toJSON() : void 0,
            boundingSphere: o.boundingSphere ? o.boundingSphere.toJSON() : void 0
        })), i.instanceInfo = this._instanceInfo.map(o => ({
            ...o
        })), i.availableInstanceIds = this._availableInstanceIds.slice(), i.availableGeometryIds = this._availableGeometryIds.slice(), i.nextIndexStart = this._nextIndexStart, i.nextVertexStart = this._nextVertexStart, i.geometryCount = this._geometryCount, i.maxInstanceCount = this._maxInstanceCount, i.maxVertexCount = this._maxVertexCount, i.maxIndexCount = this._maxIndexCount, i.geometryInitialized = this._geometryInitialized, i.matricesTexture = this._matricesTexture.toJSON(e), i.indirectTexture = this._indirectTexture.toJSON(e), this._colorsTexture !== null && (i.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (i.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (i.boundingBox = this.boundingBox.toJSON()));

        function r(o, l) {
            return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(e)), l.uuid
        }
        if (this.isScene) this.background && (this.background.isColor ? i.background = this.background.toJSON() : this.background.isTexture && (i.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (i.environment = this.environment.toJSON(e).uuid);
        else if (this.isMesh || this.isLine || this.isPoints) {
            i.geometry = r(e.geometries, this.geometry);
            const o = this.geometry.parameters;
            if (o !== void 0 && o.shapes !== void 0) {
                const l = o.shapes;
                if (Array.isArray(l))
                    for (let c = 0, h = l.length; c < h; c++) {
                        const u = l[c];
                        r(e.shapes, u)
                    } else r(e.shapes, l)
            }
        }
        if (this.isSkinnedMesh && (i.bindMode = this.bindMode, i.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(e.skeletons, this.skeleton), i.skeleton = this.skeleton.uuid)), this.material !== void 0)
            if (Array.isArray(this.material)) {
                const o = [];
                for (let l = 0, c = this.material.length; l < c; l++) o.push(r(e.materials, this.material[l]));
                i.material = o
            } else i.material = r(e.materials, this.material);
        if (this.children.length > 0) {
            i.children = [];
            for (let o = 0; o < this.children.length; o++) i.children.push(this.children[o].toJSON(e).object)
        }
        if (this.animations.length > 0) {
            i.animations = [];
            for (let o = 0; o < this.animations.length; o++) {
                const l = this.animations[o];
                i.animations.push(r(e.animations, l))
            }
        }
        if (t) {
            const o = a(e.geometries),
                l = a(e.materials),
                c = a(e.textures),
                h = a(e.images),
                u = a(e.shapes),
                d = a(e.skeletons),
                f = a(e.animations),
                p = a(e.nodes);
            o.length > 0 && (n.geometries = o), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), u.length > 0 && (n.shapes = u), d.length > 0 && (n.skeletons = d), f.length > 0 && (n.animations = f), p.length > 0 && (n.nodes = p)
        }
        return n.object = i, n;

        function a(o) {
            const l = [];
            for (const c in o) {
                const h = o[c];
                delete h.metadata, l.push(h)
            }
            return l
        }
    }
    clone(e) {
        return new this.constructor().copy(this, e)
    }
    copy(e, t = !0) {
        if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.pivot = e.pivot !== null ? e.pivot.clone() : null, this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.static = e.static, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0)
            for (let n = 0; n < e.children.length; n++) {
                const i = e.children[n];
                this.add(i.clone())
            }
        return this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
}
gt.DEFAULT_UP = new N(0, 1, 0);
gt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
