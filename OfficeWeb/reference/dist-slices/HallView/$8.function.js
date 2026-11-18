function $8() {
    Z8();
    const r = new E0;
    r.name = "hall-shell";
    const e = [],
        t = (h, u, d, g, p, I, C, E = {}) => X8(h, u, d, g, p, I, C, {
            parent: r,
            ...E
        }),
        s = Bt.x1 - Bt.x0,
        i = Bt.z1 - Bt.z0;
    t(s + .3, .5, i + .3, l0.plinth, 0, -.31, 0, {
        jit: !1,
        cast: !1
    });
    const n = t(s, .06, i, l0.floor, 0, -.03, 0, {
        jit: !1,
        cast: !1
    });
    n.userData.ground = !0;
    const o = t(s + .16, e9, .14, l0.wallBack, -.08, e9 / 2 - .02, Bt.z0 - .08, {
        cast: !0,
        jit: !1
    });
    o.userData.cutawaySide = "back";
    const a = t(.14, e9, i, l0.wall, Bt.x0 - .08, e9 / 2 - .02, 0, {
        cast: !0,
        jit: !1
    });
    a.userData.cutawaySide = "left", t(5, B0, 2.06, l0.blue, -4.5, B0 / 2, -3.97, {
        jit: !1
    });
    const l = t(9, .22, 3.4, l0.white, 2.5, B0 - .11, -3.3, {
        jit: !1
    });
    l.userData.keepStructure = !0;
    for (const h of [2.4, 6.85]) t(.12, B0 - .22, .12, l0.ink, h, (B0 - .22) / 2, It - .15);
    e.push(nt(r, "z", -3.55, -2.05, .05, B0 - .05, -2.94), nt(r, "x", -4.5, -3, .05, B0 - .05, -2)), u2(r, -2, 7, 0, B0 - .26, -5, .4).userData.cutawaySide = "back", u2(r, -7, 7, B0, B0 + 2.5, -5, .4).userData.cutawaySide = "back", t9(r, -.86, It - .03, 6.97, It - .03, B0), t9(r, -1.97, -2.94, -1.97, It - .03, B0), t9(r, -3.6, -2.91, -1.97, -2.91, B0), t9(r, 6.97, -4.58, 6.97, It - .03, B0);
    for (let h = 0; h < 9; h++) t(1.4, .3 * (h + 1), .66, l0.white, -6.3, .15 * (h + 1), 3 - .66 * (h + .5), {
        jit: !1
    });
    t(2, .9, 1.9, l0.blue, -4.6, .45, 1.85, {
        jit: !1
    }), t(2, 1.8, 1.9, l0.blue, -4.6, .9, -.05, {
        jit: !1
    }), t(2, B0, 1.94, l0.blue, -4.6, B0 / 2, -1.97, {
        jit: !1
    }), e.push(nt(r, "z", -5.55, -3.65, .05, .85, 2.8), nt(r, "z", -5.55, -3.65, .95, 1.75, .9), nt(r, "z", -5.55, -3.65, 1.85, B0 - .05, -1), nt(r, "x", .95, 2.75, .05, .85, -3.6), nt(r, "x", -.95, .85, .05, 1.75, -3.6), nt(r, "x", -2.89, -1.05, .05, B0 - .05, -3.6));
    for (const [h, u, d, g] of [
            [-5, .9, 1.6, l0.sage],
            [-4.2, .9, 2.2, l0.coral],
            [-4.9, 1.8, -.3, l0.coral],
            [-4.2, 1.8, .3, l0.sage]
        ]) {
        const p = new K(new qe(.22, .22, .06, 28), new Ie({
            color: g,
            roughness: .9
        }));
        p.position.set(h, u + .03, d), p.castShadow = p.receiveShadow = !0, p.userData.solid = !0, r.add(p)
    }
    for (let h = 0; h < 8; h++) t(1, .06, .32, l0.ink, -1.4, .3 * (h + 1) - .03, It + .32 * (7.5 - h));
    const A = .32 * 8,
        c = Math.hypot(A, B0);
    for (const h of [-1.92, -.88]) {
        const u = t(.05, .2, c, l0.ink, h, B0 / 2, It + A / 2, {
            nohit: !0,
            jit: !1
        });
        u.rotation.x = Math.atan2(B0, A)
    }
    return {
        group: r,
        walls: [a],
        decor: e
    }
}

