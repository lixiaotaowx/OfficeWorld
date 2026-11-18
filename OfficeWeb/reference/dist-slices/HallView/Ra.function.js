function Ra(r) {
    return D0.numericCharacterReference.test(r) ? r.replace(D0.numericCharacterReferenceOrAmpersand, (e, t, s) => {
        if (t === void 0 && s === void 0) return "&amp;";
        let i = t === void 0 ? Number.parseInt(s, 16) : Number.parseInt(t, 10);
        return i === 0 || i > 1114111 || i >= 55296 && i <= 57343 ? "�" : i === 38 ? "&amp;" : String.fromCodePoint(i)
    }) : r
}

