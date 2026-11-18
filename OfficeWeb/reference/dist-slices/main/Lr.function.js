function Lr(i) {
    var e = typeof Symbol == "function" && Symbol.iterator,
        t = e && i[e],
        n = 0;
    if (t) return t.call(i);
    if (i && typeof i.length == "number") return {
        next: function() {
            return i && n >= i.length && (i = void 0), {
                value: i && i[n++],
                done: !i
            }
        }
    };
    throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.")
}

