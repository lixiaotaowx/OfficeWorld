class ke extends M {
    constructor(e) {
        super(), this.opts = Object.assign({
            reviver: void 0,
            maxAttachments: 10
        }, typeof e == "function" ? {
            reviver: e
        } : e)
    }
    add(e) {
        let t;
        if (typeof e == "string") {
            if (this.reconstructor) throw new Error("got plaintext data when reconstructing a packet");
            t = this.decodeString(e);
            const s = t.type === C.BINARY_EVENT;
            s || t.type === C.BINARY_ACK ? (t.type = s ? C.EVENT : C.ACK, this.reconstructor = new vn(t)) : super.emitReserved("decoded", t)
        } else if (_e(e) || e.base64)
            if (this.reconstructor) t = this.reconstructor.takeBinaryData(e), t && (this.reconstructor = null, super.emitReserved("decoded", t));
            else throw new Error("got binary data when not reconstructing a packet");
        else throw new Error("Unknown type: " + e)
    }
    decodeString(e) {
        let t = 0;
        const s = {
            type: Number(e.charAt(0))
        };
        if (C[s.type] === void 0) throw new Error("unknown packet type " + s.type);
        if (s.type === C.BINARY_EVENT || s.type === C.BINARY_ACK) {
            const i = t + 1;
            for (; e.charAt(++t) !== "-" && t != e.length;);
            const o = e.substring(i, t);
            if (o != Number(o) || e.charAt(t) !== "-") throw new Error("Illegal attachments");
            const a = Number(o);
            if (!bn(a) || a < 1) throw new Error("Illegal attachments");
            if (a > this.opts.maxAttachments) throw new Error("too many attachments");
            s.attachments = a
        }
        if (e.charAt(t + 1) === "/") {
            const i = t + 1;
            for (; ++t && !(e.charAt(t) === "," || t === e.length););
            s.nsp = e.substring(i, t)
        } else s.nsp = "/";
        const r = e.charAt(t + 1);
        if (r !== "" && Number(r) == r) {
            const i = t + 1;
            for (; ++t;) {
                const o = e.charAt(t);
                if (o == null || Number(o) != o) {
                    --t;
                    break
                }
                if (t === e.length) break
            }
            s.id = Number(e.substring(i, t + 1))
        }
        if (e.charAt(++t)) {
            const i = this.tryParse(e.substr(t));
            if (ke.isPayloadValid(s.type, i)) s.data = i;
            else throw new Error("invalid payload")
        }
        return s
    }
    tryParse(e) {
        try {
            return JSON.parse(e, this.opts.reviver)
        } catch {
            return !1
        }
    }
    static isPayloadValid(e, t) {
        switch (e) {
            case C.CONNECT:
                return Le(t);
            case C.DISCONNECT:
                return t === void 0;
            case C.CONNECT_ERROR:
                return typeof t == "string" || Le(t);
            case C.EVENT:
            case C.BINARY_EVENT:
                return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && yn.indexOf(t[0]) === -1);
            case C.ACK:
            case C.BINARY_ACK:
                return Array.isArray(t)
        }
    }
    destroy() {
        this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null)
    }
}
