class Qr {
    constructor() {
        this._targetRay = null, this._grip = null, this._hand = null
    }
    getHandSpace() {
        return this._hand === null && (this._hand = new ci, this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = {
            pinching: !1
        }), this._hand
    }
    getTargetRaySpace() {
        return this._targetRay === null && (this._targetRay = new ci, this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new N, this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new N), this._targetRay
    }
    getGripSpace() {
        return this._grip === null && (this._grip = new ci, this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new N, this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new N, this._grip.eventsEnabled = !1), this._grip
    }
    dispatchEvent(e) {
        return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this
    }
    connect(e) {
        if (e && e.hand) {
            const t = this._hand;
            if (t)
                for (const n of e.hand.values()) this._getHandJoint(t, n)
        }
        return this.dispatchEvent({
            type: "connected",
            data: e
        }), this
    }
    disconnect(e) {
        return this.dispatchEvent({
            type: "disconnected",
            data: e
        }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this
    }
    update(e, t, n) {
        let i = null,
            r = null,
            a = null;
        const o = this._targetRay,
            l = this._grip,
            c = this._hand;
        if (e && t.session.visibilityState !== "visible-blurred") {
            if (c && e.hand) {
                a = !0;
                for (const x of e.hand.values()) {
                    const m = t.getJointPose(x, n),
                        g = this._getHandJoint(c, x);
                    m !== null && (g.matrix.fromArray(m.transform.matrix), g.matrix.decompose(g.position, g.quaternion, g.scale), g.matrixWorldNeedsUpdate = !0, g.jointRadius = m.radius), g.visible = m !== null
                }
                const h = c.joints["index-finger-tip"],
                    u = c.joints["thumb-tip"],
                    d = h.position.distanceTo(u.position),
                    f = .02,
                    p = .005;
                c.inputState.pinching && d > f + p ? (c.inputState.pinching = !1, this.dispatchEvent({
                    type: "pinchend",
                    handedness: e.handedness,
                    target: this
                })) : !c.inputState.pinching && d <= f - p && (c.inputState.pinching = !0, this.dispatchEvent({
                    type: "pinchstart",
                    handedness: e.handedness,
                    target: this
                }))
            } else l !== null && e.gripSpace && (r = t.getPose(e.gripSpace, n), r !== null && (l.matrix.fromArray(r.transform.matrix), l.matrix.decompose(l.position, l.quaternion, l.scale), l.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(r.linearVelocity)) : l.hasLinearVelocity = !1, r.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(r.angularVelocity)) : l.hasAngularVelocity = !1, l.eventsEnabled && l.dispatchEvent({
                type: "gripUpdated",
                data: e,
                target: this
            })));
            o !== null && (i = t.getPose(e.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (o.matrix.fromArray(i.transform.matrix), o.matrix.decompose(o.position, o.quaternion, o.scale), o.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(i.linearVelocity)) : o.hasLinearVelocity = !1, i.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(i.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(Gd)))
        }
        return o !== null && (o.visible = i !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = a !== null), this
    }
    _getHandJoint(e, t) {
        if (e.joints[t.jointName] === void 0) {
            const n = new ci;
            n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n)
        }
        return e.joints[t.jointName]
    }
}
