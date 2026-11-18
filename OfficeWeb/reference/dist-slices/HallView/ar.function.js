function Ar(r, e, t, s, i) {
    e.updateWorldMatrix(!0, !0);
    const n = it(r.bones, "Hips");
    if (!n) return;
    const o = e.getWorldQuaternion(new Ve),
        a = new T(t.x, t.y + .07, t.z);
    if (e.position.add(a.sub(n.getWorldPosition(new T))), e.updateWorldMatrix(!0, !0), i === "sofa") {
        const l = new T(0, 0, 1).applyQuaternion(o),
            A = new T(0, -1, 0);
        for (const c of ["L", "R"]) {
            const h = it(r.bones, `UpperLeg${c}`),
                u = it(r.bones, `LowerLeg${c}`),
                d = it(r.bones, `Foot${c}`);
            !h || !u || !d || (v1(h, u, h.getWorldPosition(new T).add(l)), v1(u, d, u.getWorldPosition(new T).add(A)))
        }
    }
    if (s)
        for (const [l, A] of ["L", "R"].entries()) {
            const c = it(r.bones, `UpperArm${A}`),
                h = it(r.bones, `LowerArm${A}`),
                u = it(r.bones, `Wrist${A}`);
            if (!c || !h || !u || !s[l]) continue;
            const d = s[l];
            lr(c, h, u, new T(d.x, d.y, d.z), new T(l ? -.4 : .4, -1, 0).applyQuaternion(o));
            const g = it(r.bones, `mixamorig:${A==="L"?"Left":"Right"}HandMiddle1`);
            g && v1(u, g, u.getWorldPosition(new T).add(new T(0, -.015, .1).applyQuaternion(o)))
        }
}
