function ia(i, e) {
    switch (i) {
        case L.BOOL:
            return e === !1;
        case L.STRING:
            return e === "";
        case L.BYTES:
            return e instanceof Uint8Array && !e.byteLength;
        default:
            return e == 0
    }
}
var pe;
(function(i) {
    i[i.Varint = 0] = "Varint", i[i.Bit64 = 1] = "Bit64", i[i.LengthDelimited = 2] = "LengthDelimited", i[i.StartGroup = 3] = "StartGroup", i[i.EndGroup = 4] = "EndGroup", i[i.Bit32 = 5] = "Bit32"
})(pe || (pe = {}));
