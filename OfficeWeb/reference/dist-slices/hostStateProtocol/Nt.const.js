const Nt = n => {
        let e = n.length * .75,
            t = n.length,
            s, r = 0,
            i, o, a, f;
        n[n.length - 1] === "=" && (e--, n[n.length - 2] === "=" && e--);
        const d = new ArrayBuffer(e),
            m = new Uint8Array(d);
        for (s = 0; s < t; s += 4) i = Q[n.charCodeAt(s)], o = Q[n.charCodeAt(s + 1)], a = Q[n.charCodeAt(s + 2)], f = Q[n.charCodeAt(s + 3)], m[r++] = i << 2 | o >> 4, m[r++] = (o & 15) << 4 | a >> 2, m[r++] = (a & 3) << 6 | f & 63;
        return d
    },
    Bt = typeof ArrayBuffer == "function",
    ve = (n, e) => {
        if (typeof n != "string") return {
            type: "message",
            data: Ue(n, e)
        };
        const t = n.charAt(0);
        return t === "b" ? {
            type: "message",
            data: qt(n.substring(1), e)
        } : ne[t] ? n.length > 1 ? {
            type: ne[t],
            data: n.substring(1)
        } : {
            type: ne[t]
        } : de
    },
    qt = (n, e) => {
        if (Bt) {
            const t = Nt(n);
            return Ue(t, e)
        } else return {
            base64: !0,
            data: n
        }
    },
    Ue = (n, e) => {
        switch (e) {
            case "blob":
                return n instanceof Blob ? n : new Blob([n]);
            case "arraybuffer":
            default:
                return n instanceof ArrayBuffer ? n : n.buffer
        }
    },
    ze = "",
    It = (n, e) => {
        const t = n.length,
            s = new Array(t);
        let r = 0;
        n.forEach((i, o) => {
            we(i, !1, a => {
                s[o] = a, ++r === t && e(s.join(ze))
            })
        })
    },
    Lt = (n, e) => {
        const t = n.split(ze),
            s = [];
        for (let r = 0; r < t.length; r++) {
            const i = ve(t[r], e);
            if (s.push(i), i.type === "error") break
        }
        return s
    };

