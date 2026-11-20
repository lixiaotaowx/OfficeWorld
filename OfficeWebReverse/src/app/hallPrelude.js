// Babel class-private-field helpers shared by HallView and its extracted slices.
// Recovered verbatim from chunks/HallView.js.

var xn = Object.defineProperty;
var Wi = r => {
  throw TypeError(r)
};
var bn = (r, e, t) => e in r ? xn(r, e, {
  enumerable: !0,
  configurable: !0,
  writable: !0,
  value: t
}) : r[e] = t;
var m = (r, e, t) => bn(r, typeof e != "symbol" ? e + "" : e, t),
  vn = (r, e, t) => e.has(r) || Wi("Cannot " + t);
var Vi = (r, e, t) => e.has(r) ? Wi("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t);
var Z9 = (r, e, t) => (vn(r, e, "access private method"), t);

export { m as definePrivate, Vi as initPrivate, Z9 as privateMethod, vn as checkPrivate, Wi as throwPrivate, bn as defineProperty, xn as objectDefineProperty };
