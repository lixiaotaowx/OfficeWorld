class ot {
    constructor(e, t, n) {
        this.path = t, this.parsedPath = n || ot.parseTrackName(t), this.node = ot.findNode(e, this.parsedPath.nodeName), this.rootNode = e, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound
    }
    static create(e, t, n) {
        return e && e.isAnimationObjectGroup ? new ot.Composite(e, t, n) : new ot(e, t, n)
    }
    static sanitizeNodeName(e) {
        return e.replace(/\s/g, "_").replace(Mp, "")
    }
    static parseTrackName(e) {
        const t = Ap.exec(e);
        if (t === null) throw new Error("THREE.PropertyBinding: Cannot parse trackName: " + e);
        const n = {
                nodeName: t[2],
                objectName: t[3],
                objectIndex: t[4],
                propertyName: t[5],
                propertyIndex: t[6]
            },
            i = n.nodeName && n.nodeName.lastIndexOf(".");
        if (i !== void 0 && i !== -1) {
            const r = n.nodeName.substring(i + 1);
            wp.indexOf(r) !== -1 && (n.nodeName = n.nodeName.substring(0, i), n.objectName = r)
        }
        if (n.propertyName === null || n.propertyName.length === 0) throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: " + e);
        return n
    }
    static findNode(e, t) {
        if (t === void 0 || t === "" || t === "." || t === -1 || t === e.name || t === e.uuid) return e;
        if (e.skeleton) {
            const n = e.skeleton.getBoneByName(t);
            if (n !== void 0) return n
        }
        if (e.children) {
            const n = function(r) {
                    for (let a = 0; a < r.length; a++) {
                        const o = r[a];
                        if (o.name === t || o.uuid === t) return o;
                        const l = n(o.children);
                        if (l) return l
                    }
                    return null
                },
                i = n(e.children);
            if (i) return i
        }
        return null
    }
    _getValue_unavailable() {}
    _setValue_unavailable() {}
    _getValue_direct(e, t) {
        e[t] = this.targetObject[this.propertyName]
    }
    _getValue_array(e, t) {
        const n = this.resolvedProperty;
        for (let i = 0, r = n.length; i !== r; ++i) e[t++] = n[i]
    }
    _getValue_arrayElement(e, t) {
        e[t] = this.resolvedProperty[this.propertyIndex]
    }
    _getValue_toArray(e, t) {
        this.resolvedProperty.toArray(e, t)
    }
    _setValue_direct(e, t) {
        this.targetObject[this.propertyName] = e[t]
    }
    _setValue_direct_setNeedsUpdate(e, t) {
        this.targetObject[this.propertyName] = e[t], this.targetObject.needsUpdate = !0
    }
    _setValue_direct_setMatrixWorldNeedsUpdate(e, t) {
        this.targetObject[this.propertyName] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _setValue_array(e, t) {
        const n = this.resolvedProperty;
        for (let i = 0, r = n.length; i !== r; ++i) n[i] = e[t++]
    }
    _setValue_array_setNeedsUpdate(e, t) {
        const n = this.resolvedProperty;
        for (let i = 0, r = n.length; i !== r; ++i) n[i] = e[t++];
        this.targetObject.needsUpdate = !0
    }
    _setValue_array_setMatrixWorldNeedsUpdate(e, t) {
        const n = this.resolvedProperty;
        for (let i = 0, r = n.length; i !== r; ++i) n[i] = e[t++];
        this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _setValue_arrayElement(e, t) {
        this.resolvedProperty[this.propertyIndex] = e[t]
    }
    _setValue_arrayElement_setNeedsUpdate(e, t) {
        this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.needsUpdate = !0
    }
    _setValue_arrayElement_setMatrixWorldNeedsUpdate(e, t) {
        this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _setValue_fromArray(e, t) {
        this.resolvedProperty.fromArray(e, t)
    }
    _setValue_fromArray_setNeedsUpdate(e, t) {
        this.resolvedProperty.fromArray(e, t), this.targetObject.needsUpdate = !0
    }
    _setValue_fromArray_setMatrixWorldNeedsUpdate(e, t) {
        this.resolvedProperty.fromArray(e, t), this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _getValue_unbound(e, t) {
        this.bind(), this.getValue(e, t)
    }
    _setValue_unbound(e, t) {
        this.bind(), this.setValue(e, t)
    }
    bind() {
        let e = this.node;
        const t = this.parsedPath,
            n = t.objectName,
            i = t.propertyName;
        let r = t.propertyIndex;
        if (e || (e = ot.findNode(this.rootNode, t.nodeName), this.node = e), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !e) {
            Ce("PropertyBinding: No target node found for track: " + this.path + ".");
            return
        }
        if (n) {
            let c = t.objectIndex;
            switch (n) {
                case "materials":
                    if (!e.material) {
                        ze("PropertyBinding: Can not bind to material as node does not have a material.", this);
                        return
                    }
                    if (!e.material.materials) {
                        ze("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
                        return
                    }
                    e = e.material.materials;
                    break;
                case "bones":
                    if (!e.skeleton) {
                        ze("PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
                        return
                    }
                    e = e.skeleton.bones;
                    for (let h = 0; h < e.length; h++)
                        if (e[h].name === c) {
                            c = h;
                            break
                        } break;
                case "map":
                    if ("map" in e) {
                        e = e.map;
                        break
                    }
                    if (!e.material) {
                        ze("PropertyBinding: Can not bind to material as node does not have a material.", this);
                        return
                    }
                    if (!e.material.map) {
                        ze("PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
                        return
                    }
                    e = e.material.map;
                    break;
                default:
                    if (e[n] === void 0) {
                        ze("PropertyBinding: Can not bind to objectName of node undefined.", this);
                        return
                    }
                    e = e[n]
            }
            if (c !== void 0) {
                if (e[c] === void 0) {
                    ze("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, e);
                    return
                }
                e = e[c]
            }
        }
        const a = e[i];
        if (a === void 0) {
            const c = t.nodeName;
            ze("PropertyBinding: Trying to update property for track: " + c + "." + i + " but it wasn't found.", e);
            return
        }
        let o = this.Versioning.None;
        this.targetObject = e, e.isMaterial === !0 ? o = this.Versioning.NeedsUpdate : e.isObject3D === !0 && (o = this.Versioning.MatrixWorldNeedsUpdate);
        let l = this.BindingType.Direct;
        if (r !== void 0) {
            if (i === "morphTargetInfluences") {
                if (!e.geometry) {
                    ze("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
                    return
                }
                if (!e.geometry.morphAttributes) {
                    ze("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
                    return
                }
                e.morphTargetDictionary[r] !== void 0 && (r = e.morphTargetDictionary[r])
            }
            l = this.BindingType.ArrayElement, this.resolvedProperty = a, this.propertyIndex = r
        } else a.fromArray !== void 0 && a.toArray !== void 0 ? (l = this.BindingType.HasFromToArray, this.resolvedProperty = a) : Array.isArray(a) ? (l = this.BindingType.EntireArray, this.resolvedProperty = a) : this.propertyName = i;
        this.getValue = this.GetterByBindingType[l], this.setValue = this.SetterByBindingTypeAndVersioning[l][o]
    }
    unbind() {
        this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound
    }
}
ot.Composite = Rp;
ot.prototype.BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3
};
ot.prototype.Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2
};
ot.prototype.GetterByBindingType = [ot.prototype._getValue_direct, ot.prototype._getValue_array, ot.prototype._getValue_arrayElement, ot.prototype._getValue_toArray];
ot.prototype.SetterByBindingTypeAndVersioning = [
    [ot.prototype._setValue_direct, ot.prototype._setValue_direct_setNeedsUpdate, ot.prototype._setValue_direct_setMatrixWorldNeedsUpdate],
    [ot.prototype._setValue_array, ot.prototype._setValue_array_setNeedsUpdate, ot.prototype._setValue_array_setMatrixWorldNeedsUpdate],
    [ot.prototype._setValue_arrayElement, ot.prototype._setValue_arrayElement_setNeedsUpdate, ot.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],
    [ot.prototype._setValue_fromArray, ot.prototype._setValue_fromArray_setNeedsUpdate, ot.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]
];
