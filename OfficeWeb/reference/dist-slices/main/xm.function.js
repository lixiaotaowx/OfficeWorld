function xm(i) {
    var e, t, n, s, r;
    if (((e = i.value) === null || e === void 0 ? void 0 : e.case) !== "sipDtmf" && ((t = i.value) === null || t === void 0 ? void 0 : t.case) !== "metrics" && ((n = i.value) === null || n === void 0 ? void 0 : n.case) !== "speaker" && ((s = i.value) === null || s === void 0 ? void 0 : s.case) !== "transcription" && ((r = i.value) === null || r === void 0 ? void 0 : r.case) !== "encryptedPacket") return new ga({
        value: i.value
    })
}
