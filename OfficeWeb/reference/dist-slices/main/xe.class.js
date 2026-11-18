class xe extends Es {
    constructor(e) {
        super(), this.seconds = de.zero, this.nanos = 0, R.util.initPartial(e, this)
    }
    fromJson(e, t) {
        if (typeof e != "string") throw new Error("cannot decode google.protobuf.Timestamp from JSON: ".concat(R.json.debug(e)));
        const n = e.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:Z|\.([0-9]{3,9})Z|([+-][0-9][0-9]:[0-9][0-9]))$/);
        if (!n) throw new Error("cannot decode google.protobuf.Timestamp from JSON: invalid RFC 3339 string");
        const s = Date.parse(n[1] + "-" + n[2] + "-" + n[3] + "T" + n[4] + ":" + n[5] + ":" + n[6] + (n[8] ? n[8] : "Z"));
        if (Number.isNaN(s)) throw new Error("cannot decode google.protobuf.Timestamp from JSON: invalid RFC 3339 string");
        if (s < Date.parse("0001-01-01T00:00:00Z") || s > Date.parse("9999-12-31T23:59:59Z")) throw new Error("cannot decode message google.protobuf.Timestamp from JSON: must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive");
        return this.seconds = de.parse(s / 1e3), this.nanos = 0, n[7] && (this.nanos = parseInt("1" + n[7] + "0".repeat(9 - n[7].length)) - 1e9), this
    }
    toJson(e) {
        const t = Number(this.seconds) * 1e3;
        if (t < Date.parse("0001-01-01T00:00:00Z") || t > Date.parse("9999-12-31T23:59:59Z")) throw new Error("cannot encode google.protobuf.Timestamp to JSON: must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive");
        if (this.nanos < 0) throw new Error("cannot encode google.protobuf.Timestamp to JSON: nanos must not be negative");
        let n = "Z";
        if (this.nanos > 0) {
            const s = (this.nanos + 1e9).toString().substring(1);
            s.substring(3) === "000000" ? n = "." + s.substring(0, 3) + "Z" : s.substring(6) === "000" ? n = "." + s.substring(0, 6) + "Z" : n = "." + s + "Z"
        }
        return new Date(t).toISOString().replace(".000Z", n)
    }
    toDate() {
        return new Date(Number(this.seconds) * 1e3 + Math.ceil(this.nanos / 1e6))
    }
    static now() {
        return xe.fromDate(new Date)
    }
    static fromDate(e) {
        const t = e.getTime();
        return new xe({
            seconds: de.parse(Math.floor(t / 1e3)),
            nanos: t % 1e3 * 1e6
        })
    }
    static fromBinary(e, t) {
        return new xe().fromBinary(e, t)
    }
    static fromJson(e, t) {
        return new xe().fromJson(e, t)
    }
    static fromJsonString(e, t) {
        return new xe().fromJsonString(e, t)
    }
    static equals(e, t) {
        return R.util.equals(xe, e, t)
    }
}
xe.runtime = R;
xe.typeName = "google.protobuf.Timestamp";
xe.fields = R.util.newFieldList(() => [{
    no: 1,
    name: "seconds",
    kind: "scalar",
    T: 3
}, {
    no: 2,
    name: "nanos",
    kind: "scalar",
    T: 5
}]);
