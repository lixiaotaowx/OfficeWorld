function Xa(r) {
    switch (typeof r) {
        case "string":
            return r;
        case "number":
            return Ya(r);
        case "boolean":
            return Ja(r);
        case "bigint":
            return Y2 ? Y2(r) : "0";
        case "symbol":
            return J2 ? J2(r) : "Symbol()";
        case "undefined":
            return m1(r);
        case "function":
        case "object": {
            if (r === null) return m1(r);
            const e = r,
                t = de(e, "toString");
            if (typeof t == "function") {
                const s = t(e);
                return typeof s == "string" ? s : m1(s)
            }
            return m1(r)
        }
        default:
            return m1(r)
    }
}

