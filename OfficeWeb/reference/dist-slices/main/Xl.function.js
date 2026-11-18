function Xl() {
    const i = new DataView(new ArrayBuffer(8));
    if (typeof BigInt == "function" && typeof i.getBigInt64 == "function" && typeof i.getBigUint64 == "function" && typeof i.setBigInt64 == "function" && typeof i.setBigUint64 == "function" && (typeof process != "object" || typeof br != "object" || br.BUF_BIGINT_DISABLE !== "1")) {
        const s = BigInt("-9223372036854775808"),
            r = BigInt("9223372036854775807"),
            a = BigInt("0"),
            o = BigInt("18446744073709551615");
        return {
            zero: BigInt(0),
            supported: !0,
            parse(c) {
                const d = typeof c == "bigint" ? c : BigInt(c);
                if (d > r || d < s) throw new Error("int64 invalid: ".concat(c));
                return d
            },
            uParse(c) {
                const d = typeof c == "bigint" ? c : BigInt(c);
                if (d > o || d < a) throw new Error("uint64 invalid: ".concat(c));
                return d
            },
            enc(c) {
                return i.setBigInt64(0, this.parse(c), !0), {
                    lo: i.getInt32(0, !0),
                    hi: i.getInt32(4, !0)
                }
            },
            uEnc(c) {
                return i.setBigInt64(0, this.uParse(c), !0), {
                    lo: i.getInt32(0, !0),
                    hi: i.getInt32(4, !0)
                }
            },
            dec(c, d) {
                return i.setInt32(0, c, !0), i.setInt32(4, d, !0), i.getBigInt64(0, !0)
            },
            uDec(c, d) {
                return i.setInt32(0, c, !0), i.setInt32(4, d, !0), i.getBigUint64(0, !0)
            }
        }
    }
    const t = s => he(/^-?[0-9]+$/.test(s), "int64 invalid: ".concat(s)),
        n = s => he(/^[0-9]+$/.test(s), "uint64 invalid: ".concat(s));
    return {
        zero: "0",
        supported: !1,
        parse(s) {
            return typeof s != "string" && (s = s.toString()), t(s), s
        },
        uParse(s) {
            return typeof s != "string" && (s = s.toString()), n(s), s
        },
        enc(s) {
            return typeof s != "string" && (s = s.toString()), t(s), kr(s)
        },
        uEnc(s) {
            return typeof s != "string" && (s = s.toString()), n(s), kr(s)
        },
        dec(s, r) {
            return $l(s, r)
        },
        uDec(s, r) {
            return ea(s, r)
        }
    }
}
