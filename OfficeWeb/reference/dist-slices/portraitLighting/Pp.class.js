class Pp extends jn {
    constructor(e) {
        super(), this._root = e, this._initMemoryManager(), this._accuIndex = 0, this.time = 0, this.timeScale = 1, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
            detail: this
        }))
    }
    _bindAction(e, t) {
        const n = e._localRoot || this._root,
            i = e._clip.tracks,
            r = i.length,
            a = e._propertyBindings,
            o = e._interpolants,
            l = n.uuid,
            c = this._bindingsByRootAndName;
        let h = c[l];
        h === void 0 && (h = {}, c[l] = h);
        for (let u = 0; u !== r; ++u) {
            const d = i[u],
                f = d.name;
            let p = h[f];
            if (p !== void 0) ++p.referenceCount, a[u] = p;
            else {
                if (p = a[u], p !== void 0) {
                    p._cacheIndex === null && (++p.referenceCount, this._addInactiveBinding(p, l, f));
                    continue
                }
                const x = t && t._propertyBindings[u].binding.parsedPath;
                p = new vp(ot.create(n, f, x), d.ValueTypeName, d.getValueSize()), ++p.referenceCount, this._addInactiveBinding(p, l, f), a[u] = p
            }
            o[u].resultBuffer = p.buffer
        }
    }
    _activateAction(e) {
        if (!this._isActiveAction(e)) {
            if (e._cacheIndex === null) {
                const n = (e._localRoot || this._root).uuid,
                    i = e._clip.uuid,
                    r = this._actionsByClip[i];
                this._bindAction(e, r && r.knownActions[0]), this._addInactiveAction(e, i, n)
            }
            const t = e._propertyBindings;
            for (let n = 0, i = t.length; n !== i; ++n) {
                const r = t[n];
                r.useCount++ === 0 && (this._lendBinding(r), r.saveOriginalState())
            }
            this._lendAction(e)
        }
    }
    _deactivateAction(e) {
        if (this._isActiveAction(e)) {
            const t = e._propertyBindings;
            for (let n = 0, i = t.length; n !== i; ++n) {
                const r = t[n];
                --r.useCount === 0 && (r.restoreOriginalState(), this._takeBackBinding(r))
            }
            this._takeBackAction(e)
        }
    }
    _initMemoryManager() {
        this._actions = [], this._nActiveActions = 0, this._actionsByClip = {}, this._bindings = [], this._nActiveBindings = 0, this._bindingsByRootAndName = {}, this._controlInterpolants = [], this._nActiveControlInterpolants = 0;
        const e = this;
        this.stats = {
            actions: {
                get total() {
                    return e._actions.length
                },
                get inUse() {
                    return e._nActiveActions
                }
            },
            bindings: {
                get total() {
                    return e._bindings.length
                },
                get inUse() {
                    return e._nActiveBindings
                }
            },
            controlInterpolants: {
                get total() {
                    return e._controlInterpolants.length
                },
                get inUse() {
                    return e._nActiveControlInterpolants
                }
            }
        }
    }
    _isActiveAction(e) {
        const t = e._cacheIndex;
        return t !== null && t < this._nActiveActions
    }
    _addInactiveAction(e, t, n) {
        const i = this._actions,
            r = this._actionsByClip;
        let a = r[t];
        if (a === void 0) a = {
            knownActions: [e],
            actionByRoot: {}
        }, e._byClipCacheIndex = 0, r[t] = a;
        else {
            const o = a.knownActions;
            e._byClipCacheIndex = o.length, o.push(e)
        }
        e._cacheIndex = i.length, i.push(e), a.actionByRoot[n] = e
    }
    _removeInactiveAction(e) {
        const t = this._actions,
            n = t[t.length - 1],
            i = e._cacheIndex;
        n._cacheIndex = i, t[i] = n, t.pop(), e._cacheIndex = null;
        const r = e._clip.uuid,
            a = this._actionsByClip,
            o = a[r],
            l = o.knownActions,
            c = l[l.length - 1],
            h = e._byClipCacheIndex;
        c._byClipCacheIndex = h, l[h] = c, l.pop(), e._byClipCacheIndex = null;
        const u = o.actionByRoot,
            d = (e._localRoot || this._root).uuid;
        delete u[d], l.length === 0 && delete a[r], this._removeInactiveBindingsForAction(e)
    }
    _removeInactiveBindingsForAction(e) {
        const t = e._propertyBindings;
        for (let n = 0, i = t.length; n !== i; ++n) {
            const r = t[n];
            --r.referenceCount === 0 && this._removeInactiveBinding(r)
        }
    }
    _lendAction(e) {
        const t = this._actions,
            n = e._cacheIndex,
            i = this._nActiveActions++,
            r = t[i];
        e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
    }
    _takeBackAction(e) {
        const t = this._actions,
            n = e._cacheIndex,
            i = --this._nActiveActions,
            r = t[i];
        e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
    }
    _addInactiveBinding(e, t, n) {
        const i = this._bindingsByRootAndName,
            r = this._bindings;
        let a = i[t];
        a === void 0 && (a = {}, i[t] = a), a[n] = e, e._cacheIndex = r.length, r.push(e)
    }
    _removeInactiveBinding(e) {
        const t = this._bindings,
            n = e.binding,
            i = n.rootNode.uuid,
            r = n.path,
            a = this._bindingsByRootAndName,
            o = a[i],
            l = t[t.length - 1],
            c = e._cacheIndex;
        l._cacheIndex = c, t[c] = l, t.pop(), delete o[r], Object.keys(o).length === 0 && delete a[i]
    }
    _lendBinding(e) {
        const t = this._bindings,
            n = e._cacheIndex,
            i = this._nActiveBindings++,
            r = t[i];
        e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
    }
    _takeBackBinding(e) {
        const t = this._bindings,
            n = e._cacheIndex,
            i = --this._nActiveBindings,
            r = t[i];
        e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
    }
    _lendControlInterpolant() {
        const e = this._controlInterpolants,
            t = this._nActiveControlInterpolants++;
        let n = e[t];
        return n === void 0 && (n = new Jh(new Float32Array(2), new Float32Array(2), 1, Lp), n.__cacheIndex = t, e[t] = n), n
    }
    _takeBackControlInterpolant(e) {
        const t = this._controlInterpolants,
            n = e.__cacheIndex,
            i = --this._nActiveControlInterpolants,
            r = t[i];
        e.__cacheIndex = i, t[i] = e, r.__cacheIndex = n, t[n] = r
    }
    clipAction(e, t, n) {
        const i = t || this._root,
            r = i.uuid;
        let a = typeof e == "string" ? vo.findByName(i, e) : e;
        const o = a !== null ? a.uuid : e,
            l = this._actionsByClip[o];
        let c = null;
        if (n === void 0 && (a !== null ? n = a.blendMode : n = Uo), l !== void 0) {
            const u = l.actionByRoot[r];
            if (u !== void 0 && u.blendMode === n) return u;
            c = l.knownActions[0], a === null && (a = c._clip)
        }
        if (a === null) return null;
        const h = new Cp(this, a, t, n);
        return this._bindAction(h, c), this._addInactiveAction(h, o, r), h
    }
    existingAction(e, t) {
        const n = t || this._root,
            i = n.uuid,
            r = typeof e == "string" ? vo.findByName(n, e) : e,
            a = r ? r.uuid : e,
            o = this._actionsByClip[a];
        return o !== void 0 && o.actionByRoot[i] || null
    }
    stopAllAction() {
        const e = this._actions,
            t = this._nActiveActions;
        for (let n = t - 1; n >= 0; --n) e[n].stop();
        return this
    }
    update(e) {
        e *= this.timeScale;
        const t = this._actions,
            n = this._nActiveActions,
            i = this.time += e,
            r = Math.sign(e),
            a = this._accuIndex ^= 1;
        for (let c = 0; c !== n; ++c) t[c]._update(i, e, r, a);
        const o = this._bindings,
            l = this._nActiveBindings;
        for (let c = 0; c !== l; ++c) o[c].apply(a);
        return this
    }
    setTime(e) {
        this.time = 0;
        for (let t = 0; t < this._actions.length; t++) this._actions[t].time = 0;
        return this.update(e)
    }
    getRoot() {
        return this._root
    }
    uncacheClip(e) {
        const t = this._actions,
            n = e.uuid,
            i = this._actionsByClip,
            r = i[n];
        if (r !== void 0) {
            const a = r.knownActions;
            for (let o = 0, l = a.length; o !== l; ++o) {
                const c = a[o];
                this._deactivateAction(c);
                const h = c._cacheIndex,
                    u = t[t.length - 1];
                c._cacheIndex = null, c._byClipCacheIndex = null, u._cacheIndex = h, t[h] = u, t.pop(), this._removeInactiveBindingsForAction(c)
            }
            delete i[n]
        }
    }
    uncacheRoot(e) {
        const t = e.uuid,
            n = this._actionsByClip;
        for (const a in n) {
            const o = n[a].actionByRoot,
                l = o[t];
            l !== void 0 && (this._deactivateAction(l), this._removeInactiveAction(l))
        }
        const i = this._bindingsByRootAndName,
            r = i[t];
        if (r !== void 0)
            for (const a in r) {
                const o = r[a];
                o.restoreOriginalState(), this._removeInactiveBinding(o)
            }
    }
    uncacheAction(e, t) {
        const n = this.existingAction(e, t);
        n !== null && (this._deactivateAction(n), this._removeInactiveAction(n))
    }
}
