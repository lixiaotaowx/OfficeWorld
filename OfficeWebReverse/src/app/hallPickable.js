// Hall pickable test: shared visibility/clipping check used by every raycast
// helper in the hall. Recovered verbatim from chunks/HallView.js.


function Qt(r) {
  var s, i;
  for (let n = r.object; n; n = n.parent)
    if (!n.visible) return !1;
  const e = r.object,
    t = Array.isArray(e.material) ? e.material[((s = r.face) == null ? void 0 : s.materialIndex) ?? 0] : e.material;
  return !((i = t == null ? void 0 : t.clippingPlanes) != null && i.some(n => n.distanceToPoint(r.point) < 0))
}

export { Qt as isPickable };
