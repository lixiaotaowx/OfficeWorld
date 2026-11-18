const sa = {
    dec(i) {
        let e = i.length * 3 / 4;
        i[i.length - 2] == "=" ? e -= 2 : i[i.length - 1] == "=" && (e -= 1);
        let t = new Uint8Array(e),
            n = 0,
            s = 0,
            r, a = 0;
        for (let o = 0; o < i.length; o++) {
            if (r = nn[i.charCodeAt(o)], r === void 0) switch (i[o]) {
                case "=":
                    s = 0;
                case `
`:
                case "\r":
                case "	":
                case " ":
                    continue;
                default:
                    throw Error("invalid base64 string.")
            }
            switch (s) {
                case 0:
                    a = r, s = 1;
                    break;
                case 1:
                    t[n++] = a << 2 | (r & 48) >> 4, a = r, s = 2;
                    break;
                case 2:
                    t[n++] = (a & 15) << 4 | (r & 60) >> 2, a = r, s = 3;
                    break;
                case 3:
                    t[n++] = (a & 3) << 6 | r, s = 0;
                    break
            }
        }
        if (s == 1) throw Error("invalid base64 string.");
        return t.subarray(0, n)
    },
    enc(i) {
        let e = "",
            t = 0,
            n, s = 0;
        for (let r = 0; r < i.length; r++) switch (n = i[r], t) {
            case 0:
                e += rt[n >> 2], s = (n & 3) << 4, t = 1;
                break;
            case 1:
                e += rt[s | n >> 4], s = (n & 15) << 2, t = 2;
                break;
            case 2:
                e += rt[s | n >> 6], e += rt[n & 63], t = 0;
                break
        }
        return t && (e += rt[s], e += "=", t == 1 && (e += "=")), e
    }
};

