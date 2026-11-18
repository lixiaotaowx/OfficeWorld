class Xp extends et.EventEmitter {
    constructor() {
        let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        super(), this.onKeyRatcheted = (t, n, s) => {
            X.debug("key ratcheted event received", {
                ratchetResult: t,
                participantId: n,
                keyIndex: s
            })
        }, this.keyInfoMap = new Map, this.options = Object.assign(Object.assign({}, Rm), e), this.on(yt.KeyRatcheted, this.onKeyRatcheted)
    }
    onSetEncryptionKey(e, t, n) {
        const s = {
            key: e,
            participantIdentity: t,
            keyIndex: n
        };
        if (!this.options.sharedKey && !t) throw new Error("participant identity needs to be passed for encryption key if sharedKey option is false");
        this.keyInfoMap.set("".concat(t ?? "shared", "-").concat(n ?? 0), s), this.emit(yt.SetKey, s)
    }
    getKeys() {
        return Array.from(this.keyInfoMap.values())
    }
    getOptions() {
        return this.options
    }
    ratchetKey(e, t) {
        this.emit(yt.RatchetRequest, e, t)
    }
}
var ro;
(function(i) {
    i[i.InvalidKey = 0] = "InvalidKey", i[i.MissingKey = 1] = "MissingKey", i[i.InternalError = 2] = "InternalError"
})(ro || (ro = {}));
