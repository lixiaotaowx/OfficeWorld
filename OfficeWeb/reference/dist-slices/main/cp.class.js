class cp extends Ie {
    constructor() {
        let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "multiple matching keys found in the JSON Web Key Set",
            t = arguments.length > 1 ? arguments[1] : void 0;
        super(e, t), ie(this, Symbol.asyncIterator, void 0), ie(this, "code", "ERR_JWKS_MULTIPLE_MATCHING_KEYS")
    }
}
ie(cp, "code", "ERR_JWKS_MULTIPLE_MATCHING_KEYS");
