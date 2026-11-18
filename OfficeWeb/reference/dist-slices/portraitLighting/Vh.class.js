class Vh extends wt {
    constructor(e = new Sf([new re(.5, .5), new re(-.5, .5), new re(-.5, -.5), new re(.5, -.5)]), t = {}) {
        super(), this.type = "ExtrudeGeometry", this.parameters = {
            shapes: e,
            options: t
        }, e = Array.isArray(e) ? e : [e];
        const n = this,
            i = [],
            r = [];
        for (let o = 0, l = e.length; o < l; o++) {
            const c = e[o];
            a(c)
        }
        this.setAttribute("position", new ut(i, 3)), this.setAttribute("uv", new ut(r, 2)), this.computeVertexNormals();

        function a(o) {
            const l = [],
                c = t.curveSegments !== void 0 ? t.curveSegments : 12,
                h = t.steps !== void 0 ? t.steps : 1,
                u = t.depth !== void 0 ? t.depth : 1;
            let d = t.bevelEnabled !== void 0 ? t.bevelEnabled : !0,
                f = t.bevelThickness !== void 0 ? t.bevelThickness : .2,
                p = t.bevelSize !== void 0 ? t.bevelSize : f - .1,
                x = t.bevelOffset !== void 0 ? t.bevelOffset : 0,
                m = t.bevelSegments !== void 0 ? t.bevelSegments : 3;
            const g = t.extrudePath,
                M = t.UVGenerator !== void 0 ? t.UVGenerator : kf;
            let E, v = !1,
                A, b, _, T;
            if (g) {
                E = g.getSpacedPoints(h), v = !0, d = !1;
                const j = g.isCatmullRomCurve3 ? g.closed : !1;
                A = g.computeFrenetFrames(h, j), b = new N, _ = new N, T = new N
            }
            d || (m = 0, f = 0, p = 0, x = 0);
            const I = o.extractPoints(c);
            let R = I.shape;
            const D = I.holes;
            if (!Di.isClockWise(R)) {
                R = R.reverse();
                for (let j = 0, ce = D.length; j < ce; j++) {
                    const ae = D[j];
                    Di.isClockWise(ae) && (D[j] = ae.reverse())
                }
            }

            function V(j) {
                const ae = 10000000000000001e-36;
                let ye = j[0];
                for (let ge = 1; ge <= j.length; ge++) {
                    const Ve = ge % j.length,
                        Le = j[Ve],
                        et = Le.x - ye.x,
                        tt = Le.y - ye.y,
                        rt = et * et + tt * tt,
                        U = Math.max(Math.abs(Le.x), Math.abs(Le.y), Math.abs(ye.x), Math.abs(ye.y)),
                        yt = ae * U * U;
                    if (rt <= yt) {
                        j.splice(Ve, 1), ge--;
                        continue
                    }
                    ye = Le
                }
            }
            V(R), D.forEach(V);
            const L = D.length,
                k = R;
            for (let j = 0; j < L; j++) {
                const ce = D[j];
                R = R.concat(ce)
            }

            function X(j, ce, ae) {
                return ce || ze("ExtrudeGeometry: vec does not exist"), j.clone().addScaledVector(ce, ae)
            }
            const H = R.length;

            function te(j, ce, ae) {
                let ye, ge, Ve;
                const Le = j.x - ce.x,
                    et = j.y - ce.y,
                    tt = ae.x - j.x,
                    rt = ae.y - j.y,
                    U = Le * Le + et * et,
                    yt = Le * rt - et * tt;
                if (Math.abs(yt) > Number.EPSILON) {
                    const $e = Math.sqrt(U),
                        dt = Math.sqrt(tt * tt + rt * rt),
                        fe = ce.x - et / $e,
                        St = ce.y + Le / $e,
                        Ue = ae.x - rt / dt,
                        ke = ae.y + tt / dt,
                        w = ((Ue - fe) * rt - (ke - St) * tt) / (Le * rt - et * tt);
                    ye = fe + Le * w - j.x, ge = St + et * w - j.y;
                    const S = ye * ye + ge * ge;
                    if (S <= 2) return new re(ye, ge);
                    Ve = Math.sqrt(S / 2)
                } else {
                    let $e = !1;
                    Le > Number.EPSILON ? tt > Number.EPSILON && ($e = !0) : Le < -Number.EPSILON ? tt < -Number.EPSILON && ($e = !0) : Math.sign(et) === Math.sign(rt) && ($e = !0), $e ? (ye = -et, ge = Le, Ve = Math.sqrt(U)) : (ye = Le, ge = et, Ve = Math.sqrt(U / 2))
                }
                return new re(ye / Ve, ge / Ve)
            }
            const W = [];
            for (let j = 0, ce = k.length, ae = ce - 1, ye = j + 1; j < ce; j++, ae++, ye++) ae === ce && (ae = 0), ye === ce && (ye = 0), W[j] = te(k[j], k[ae], k[ye]);
            const Q = [];
            let ee, Te = W.concat();
            for (let j = 0, ce = L; j < ce; j++) {
                const ae = D[j];
                ee = [];
                for (let ye = 0, ge = ae.length, Ve = ge - 1, Le = ye + 1; ye < ge; ye++, Ve++, Le++) Ve === ge && (Ve = 0), Le === ge && (Le = 0), ee[ye] = te(ae[ye], ae[Ve], ae[Le]);
                Q.push(ee), Te = Te.concat(ee)
            }
            let Oe;
            if (m === 0) Oe = Di.triangulateShape(k, D);
            else {
                const j = [],
                    ce = [];
                for (let ae = 0; ae < m; ae++) {
                    const ye = ae / m,
                        ge = f * Math.cos(ye * Math.PI / 2),
                        Ve = p * Math.sin(ye * Math.PI / 2) + x;
                    for (let Le = 0, et = k.length; Le < et; Le++) {
                        const tt = X(k[Le], W[Le], Ve);
                        De(tt.x, tt.y, -ge), ye === 0 && j.push(tt)
                    }
                    for (let Le = 0, et = L; Le < et; Le++) {
                        const tt = D[Le];
                        ee = Q[Le];
                        const rt = [];
                        for (let U = 0, yt = tt.length; U < yt; U++) {
                            const $e = X(tt[U], ee[U], Ve);
                            De($e.x, $e.y, -ge), ye === 0 && rt.push($e)
                        }
                        ye === 0 && ce.push(rt)
                    }
                }
                Oe = Di.triangulateShape(j, ce)
            }
            const Y = Oe.length,
                _e = p + x;
            for (let j = 0; j < H; j++) {
                const ce = d ? X(R[j], Te[j], _e) : R[j];
                v ? (_.copy(A.normals[0]).multiplyScalar(ce.x), b.copy(A.binormals[0]).multiplyScalar(ce.y), T.copy(E[0]).add(_).add(b), De(T.x, T.y, T.z)) : De(ce.x, ce.y, 0)
            }
            for (let j = 1; j <= h; j++)
                for (let ce = 0; ce < H; ce++) {
                    const ae = d ? X(R[ce], Te[ce], _e) : R[ce];
                    v ? (_.copy(A.normals[j]).multiplyScalar(ae.x), b.copy(A.binormals[j]).multiplyScalar(ae.y), T.copy(E[j]).add(_).add(b), De(T.x, T.y, T.z)) : De(ae.x, ae.y, u / h * j)
                }
            for (let j = m - 1; j >= 0; j--) {
                const ce = j / m,
                    ae = f * Math.cos(ce * Math.PI / 2),
                    ye = p * Math.sin(ce * Math.PI / 2) + x;
                for (let ge = 0, Ve = k.length; ge < Ve; ge++) {
                    const Le = X(k[ge], W[ge], ye);
                    De(Le.x, Le.y, u + ae)
                }
                for (let ge = 0, Ve = D.length; ge < Ve; ge++) {
                    const Le = D[ge];
                    ee = Q[ge];
                    for (let et = 0, tt = Le.length; et < tt; et++) {
                        const rt = X(Le[et], ee[et], ye);
                        v ? De(rt.x, rt.y + E[h - 1].y, E[h - 1].x + ae) : De(rt.x, rt.y, u + ae)
                    }
                }
            }
            Ee(), Ne();

            function Ee() {
                const j = i.length / 3;
                if (d) {
                    let ce = 0,
                        ae = H * ce;
                    for (let ye = 0; ye < Y; ye++) {
                        const ge = Oe[ye];
                        mt(ge[2] + ae, ge[1] + ae, ge[0] + ae)
                    }
                    ce = h + m * 2, ae = H * ce;
                    for (let ye = 0; ye < Y; ye++) {
                        const ge = Oe[ye];
                        mt(ge[0] + ae, ge[1] + ae, ge[2] + ae)
                    }
                } else {
                    for (let ce = 0; ce < Y; ce++) {
                        const ae = Oe[ce];
                        mt(ae[2], ae[1], ae[0])
                    }
                    for (let ce = 0; ce < Y; ce++) {
                        const ae = Oe[ce];
                        mt(ae[0] + H * h, ae[1] + H * h, ae[2] + H * h)
                    }
                }
                n.addGroup(j, i.length / 3 - j, 0)
            }

            function Ne() {
                const j = i.length / 3;
                let ce = 0;
                xe(k, ce), ce += k.length;
                for (let ae = 0, ye = D.length; ae < ye; ae++) {
                    const ge = D[ae];
                    xe(ge, ce), ce += ge.length
                }
                n.addGroup(j, i.length / 3 - j, 1)
            }

            function xe(j, ce) {
                let ae = j.length;
                for (; --ae >= 0;) {
                    const ye = ae;
                    let ge = ae - 1;
                    ge < 0 && (ge = j.length - 1);
                    for (let Ve = 0, Le = h + m * 2; Ve < Le; Ve++) {
                        const et = H * Ve,
                            tt = H * (Ve + 1),
                            rt = ce + ye + et,
                            U = ce + ge + et,
                            yt = ce + ge + tt,
                            $e = ce + ye + tt;
                        Be(rt, U, yt, $e)
                    }
                }
            }

            function De(j, ce, ae) {
                l.push(j), l.push(ce), l.push(ae)
            }

            function mt(j, ce, ae) {
                Je(j), Je(ce), Je(ae);
                const ye = i.length / 3,
                    ge = M.generateTopUV(n, i, ye - 3, ye - 2, ye - 1);
                je(ge[0]), je(ge[1]), je(ge[2])
            }

            function Be(j, ce, ae, ye) {
                Je(j), Je(ce), Je(ye), Je(ce), Je(ae), Je(ye);
                const ge = i.length / 3,
                    Ve = M.generateSideWallUV(n, i, ge - 6, ge - 3, ge - 2, ge - 1);
                je(Ve[0]), je(Ve[1]), je(Ve[3]), je(Ve[1]), je(Ve[2]), je(Ve[3])
            }

            function Je(j) {
                i.push(l[j * 3 + 0]), i.push(l[j * 3 + 1]), i.push(l[j * 3 + 2])
            }

            function je(j) {
                r.push(j.x), r.push(j.y)
            }
        }
    }
    copy(e) {
        return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
    }
    toJSON() {
        const e = super.toJSON(),
            t = this.parameters.shapes,
            n = this.parameters.options;
        return Hf(t, n, e)
    }
    static fromJSON(e, t) {
        const n = [];
        for (let r = 0, a = e.shapes.length; r < a; r++) {
            const o = t[e.shapes[r]];
            n.push(o)
        }
        const i = e.options.extrudePath;
        return i !== void 0 && (e.options.extrudePath = new go[i.type]().fromJSON(i)), new Vh(n, e.options)
    }
}
