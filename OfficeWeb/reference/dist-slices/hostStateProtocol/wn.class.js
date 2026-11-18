class wn {
    constructor(e) {
        this.replacer = e
    }
    encode(e) {
        return (e.type === C.EVENT || e.type === C.ACK) && re(e) ? this.encodeAsBinary({
            type: e.type === C.EVENT ? C.BINARY_EVENT : C.BINARY_ACK,
            nsp: e.nsp,
            data: e.data,
            id: e.id
        }) : [this.encodeAsString(e)]
    }
    encodeAsString(e) {
        let t = "" + e.type;
        return (e.type === C.BINARY_EVENT || e.type === C.BINARY_ACK) && (t += e.attachments + "-"), e.nsp && e.nsp !== "/" && (t += e.nsp + ","), e.id != null && (t += e.id), e.data != null && (t += JSON.stringify(e.data, this.replacer)), t
    }
    encodeAsBinary(e) {
        const t = mn(e),
            s = this.encodeAsString(t.packet),
            r = t.buffers;
        return r.unshift(s), r
    }
}
