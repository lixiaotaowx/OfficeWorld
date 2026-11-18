class Xf extends Ie {
    constructor(e, t) {
        let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "unspecified",
            s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "unspecified";
        super(e, {
            cause: {
                claim: n,
                reason: s,
                payload: t
            }
        }), ie(this, "code", "ERR_JWT_EXPIRED"), ie(this, "claim", void 0), ie(this, "reason", void 0), ie(this, "payload", void 0), this.claim = n, this.reason = s, this.payload = t
    }
}
ie(Xf, "code", "ERR_JWT_EXPIRED");
