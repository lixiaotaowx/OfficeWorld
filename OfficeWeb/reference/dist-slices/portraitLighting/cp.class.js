class Cp {
    constructor(e, t, n = null, i = t.blendMode) {
        this._mixer = e, this._clip = t, this._localRoot = n, this.blendMode = i;
        const r = t.tracks,
            a = r.length,
            o = new Array(a),
            l = {
                endingStart: Pi,
                endingEnd: Pi
            };
        for (let c = 0; c !== a; ++c) {
            const h = r[c].createInterpolant(null);
            o[c] = h, h.settings = l
        }
        this._interpolantSettings = l, this._interpolants = o, this._propertyBindings = new Array(a), this._cacheIndex = null, this._byClipCacheIndex = null, this._timeScaleInterpolant = null, this._restoreTimeScale = null, this._weightInterpolant = null, this.loop = $u, this._loopCount = -1, this._startTime = null, this.time = 0, this.timeScale = 1, this._effectiveTimeScale = 1, this.weight = 1, this._effectiveWeight = 1, this.repetitions = 1 / 0, this.paused = !1, this.enabled = !0, this.clampWhenFinished = !1, this.zeroSlopeAtStart = !0, this.zeroSlopeAtEnd = !0
    }
    play() {
        return this._mixer._activateAction(this), this
    }
    stop() {
        return this._mixer._deactivateAction(this), this.reset()
    }
    reset() {
        return this.paused = !1, this.enabled = !0, this.time = 0, this._loopCount = -1, this._startTime = null, this.stopFading().stopWarping()
    }
    isRunning() {
        return this.enabled && !this.paused && this.timeScale !== 0 && this._startTime === null && this._mixer._isActiveAction(this)
    }
    isScheduled() {
        return this._mixer._isActiveAction(this)
    }
    startAt(e) {
        return this._startTime = e, this
    }
    setLoop(e, t) {
        return this.loop = e, this.repetitions = t, this
    }
    setEffectiveWeight(e) {
        return this.weight = e, this._effectiveWeight = this.enabled ? e : 0, this.stopFading()
    }
    getEffectiveWeight() {
        return this._effectiveWeight
    }
    fadeIn(e) {
        return this._scheduleFading(e, 0, 1)
    }
    fadeOut(e) {
        return this._scheduleFading(e, 1, 0)
    }
    crossFadeFrom(e, t, n = !1) {
        if (e.fadeOut(t), this.fadeIn(t), n === !0) {
            const i = this._clip.duration,
                r = e._clip.duration,
                a = r / i,
                o = i / r;
            e._restoreTimeScale = e.timeScale, this._restoreTimeScale = this.timeScale, e.warp(1, a, t), this.warp(o, 1, t)
        }
        return this
    }
    crossFadeTo(e, t, n = !1) {
        return e.crossFadeFrom(this, t, n)
    }
    stopFading() {
        const e = this._weightInterpolant;
        return e !== null && (this._weightInterpolant = null, this._mixer._takeBackControlInterpolant(e)), this
    }
    setEffectiveTimeScale(e) {
        return this.timeScale = e, this._effectiveTimeScale = this.paused ? 0 : e, this.stopWarping()
    }
    getEffectiveTimeScale() {
        return this._effectiveTimeScale
    }
    setDuration(e) {
        return this.timeScale = this._clip.duration / e, this.stopWarping()
    }
    syncWith(e) {
        return this.time = e.time, this.timeScale = e.timeScale, this.stopWarping()
    }
    halt(e) {
        return this.warp(this._effectiveTimeScale, 0, e)
    }
    warp(e, t, n) {
        const i = this._mixer,
            r = i.time,
            a = this.timeScale;
        let o = this._timeScaleInterpolant;
        o === null && (o = i._lendControlInterpolant(), this._timeScaleInterpolant = o);
        const l = o.parameterPositions,
            c = o.sampleValues;
        return l[0] = r, l[1] = r + n, c[0] = e / a, c[1] = t / a, this
    }
    stopWarping() {
        const e = this._timeScaleInterpolant;
        return e !== null && (this._timeScaleInterpolant = null, this._mixer._takeBackControlInterpolant(e)), this._restoreTimeScale = null, this
    }
    getMixer() {
        return this._mixer
    }
    getClip() {
        return this._clip
    }
    getRoot() {
        return this._localRoot || this._mixer._root
    }
    _update(e, t, n, i) {
        if (!this.enabled) {
            this._updateWeight(e);
            return
        }
        const r = this._startTime;
        if (r !== null) {
            const l = (e - r) * n;
            l < 0 || n === 0 ? t = 0 : (this._startTime = null, t = n * l)
        }
        t *= this._updateTimeScale(e);
        const a = this._updateTime(t),
            o = this._updateWeight(e);
        if (o > 0) {
            const l = this._interpolants,
                c = this._propertyBindings;
            switch (this.blendMode) {
                case ju:
                    for (let h = 0, u = l.length; h !== u; ++h) l[h].evaluate(a), c[h].accumulateAdditive(o);
                    break;
                case Uo:
                default:
                    for (let h = 0, u = l.length; h !== u; ++h) l[h].evaluate(a), c[h].accumulate(i, o)
            }
        }
    }
    _updateWeight(e) {
        let t = 0;
        if (this.enabled) {
            t = this.weight;
            const n = this._weightInterpolant;
            if (n !== null) {
                const i = n.evaluate(e)[0];
                t *= i, e > n.parameterPositions[1] && (this.stopFading(), i === 0 && (this.enabled = !1))
            }
        }
        return this._effectiveWeight = t, t
    }
    _updateTimeScale(e) {
        let t = 0;
        if (!this.paused) {
            t = this.timeScale;
            const n = this._timeScaleInterpolant;
            if (n !== null) {
                const i = n.evaluate(e)[0];
                t *= i, e > n.parameterPositions[1] && (t === 0 ? this.paused = !0 : (this._restoreTimeScale !== null && (t = this._restoreTimeScale), this.timeScale = t), this.stopWarping())
            }
        }
        return this._effectiveTimeScale = t, t
    }
    _updateTime(e) {
        const t = this._clip.duration,
            n = this.loop;
        let i = this.time + e,
            r = this._loopCount;
        const a = n === Qu;
        if (e === 0) return r === -1 ? i : a && (r & 1) === 1 ? t - i : i;
        if (n === Zu) {
            r === -1 && (this._loopCount = 0, this._setEndings(!0, !0, !1));
            e: {
                if (i >= t) i = t;
                else if (i < 0) i = 0;
                else {
                    this.time = i;
                    break e
                }
                this.clampWhenFinished ? this.paused = !0 : this.enabled = !1,
                this.time = i,
                this._mixer.dispatchEvent({
                    type: "finished",
                    action: this,
                    direction: e < 0 ? -1 : 1
                })
            }
        } else {
            if (r === -1 && (e >= 0 ? (r = 0, this._setEndings(!0, this.repetitions === 0, a)) : this._setEndings(this.repetitions === 0, !0, a)), i >= t || i < 0) {
                const o = Math.floor(i / t);
                i -= t * o, r += Math.abs(o);
                const l = this.repetitions - r;
                if (l <= 0) this.clampWhenFinished ? this.paused = !0 : this.enabled = !1, i = e > 0 ? t : 0, this.time = i, this._mixer.dispatchEvent({
                    type: "finished",
                    action: this,
                    direction: e > 0 ? 1 : -1
                });
                else {
                    if (l === 1) {
                        const c = e < 0;
                        this._setEndings(c, !c, a)
                    } else this._setEndings(!1, !1, a);
                    this._loopCount = r, this.time = i, this._mixer.dispatchEvent({
                        type: "loop",
                        action: this,
                        loopDelta: o
                    })
                }
            } else this._loopCount = r, this.time = i;
            if (a && (r & 1) === 1) return t - i
        }
        return i
    }
    _setEndings(e, t, n) {
        const i = this._interpolantSettings;
        n ? (i.endingStart = Ii, i.endingEnd = Ii) : (e ? i.endingStart = this.zeroSlopeAtStart ? Ii : Pi : i.endingStart = br, t ? i.endingEnd = this.zeroSlopeAtEnd ? Ii : Pi : i.endingEnd = br)
    }
    _scheduleFading(e, t, n) {
        const i = this._mixer,
            r = i.time;
        let a = this._weightInterpolant;
        a === null && (a = i._lendControlInterpolant(), this._weightInterpolant = a);
        const o = a.parameterPositions,
            l = a.sampleValues;
        return o[0] = r, l[0] = t, o[1] = r + e, l[1] = n, this
    }
}
