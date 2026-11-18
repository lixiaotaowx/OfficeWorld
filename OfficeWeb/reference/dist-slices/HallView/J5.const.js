const J5 = Object.entries,
    j2 = Object.setPrototypeOf,
    Ha = Object.isFrozen,
    K5 = Object.getPrototypeOf,
    X5 = Object.getOwnPropertyDescriptor;
let L0 = Object.freeze,
    N0 = Object.seal,
    Yt = Object.create,
    Z5 = typeof Reflect < "u" && Reflect,
    ei = Z5.apply,
    ti = Z5.construct;
L0 || (L0 = function(e) {
    return e
});
N0 || (N0 = function(e) {
    return e
});
ei || (ei = function(e, t) {
    for (var s = arguments.length, i = new Array(s > 2 ? s - 2 : 0), n = 2; n < s; n++) i[n - 2] = arguments[n];
    return e.apply(t, i)
});
ti || (ti = function(e) {
    for (var t = arguments.length, s = new Array(t > 1 ? t - 1 : 0), i = 1; i < t; i++) s[i - 1] = arguments[i];
    return new e(...s)
});
