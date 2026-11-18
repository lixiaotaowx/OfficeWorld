class Tr extends d4 {
    constructor(e) {
        super(e), this.materials = null
    }
    load(e, t, s, i) {
        const n = this,
            o = new d9(this.manager);
        o.setPriority(this.priority), o.setCache(this.cache), o.setPath(this.path), o.setRequestHeader(this.requestHeader), o.setWithCredentials(this.withCredentials), o.load(e, function(a) {
            try {
                t(n.parse(a))
            } catch (l) {
                i ? i(l) : console.error(l), n.manager.itemError(e)
            }
        }, s, i)
    }
    setMaterials(e) {
        return this.materials = e, this
    }
    parse(e) {
        const t = new kr;
        e.indexOf(`\r
`) !== -1 && (e = e.replace(/\r\n/g, `
`)), e.indexOf(`\\
`) !== -1 && (e = e.replace(/\\\n/g, ""));
        const s = e.split(`
`);
        let i = [];
        for (let a = 0, l = s.length; a < l; a++) {
            const A = s[a].trimStart();
            if (A.length === 0) continue;
            const c = A.charAt(0);
            if (c !== "#")
                if (c === "v") {
                    const h = A.split(r9);
                    switch (h[0]) {
                        case "v":
                            t.vertices.push(parseFloat(h[1]), parseFloat(h[2]), parseFloat(h[3])), h.length >= 7 ? (o9.setRGB(parseFloat(h[4]), parseFloat(h[5]), parseFloat(h[6]), oe), t.colors.push(o9.r, o9.g, o9.b)) : t.colors.push(void 0, void 0, void 0);
                            break;
                        case "vn":
                            t.normals.push(parseFloat(h[1]), parseFloat(h[2]), parseFloat(h[3]));
                            break;
                        case "vt":
                            t.uvs.push(parseFloat(h[1]), parseFloat(h[2]));
                            break
                    }
                } else if (c === "f") {
                const u = A.slice(1).trim().split(r9),
                    d = [];
                for (let p = 0, I = u.length; p < I; p++) {
                    const C = u[p];
                    if (C.length > 0) {
                        const E = C.split("/");
                        d.push(E)
                    }
                }
                const g = d[0];
                for (let p = 1, I = d.length - 1; p < I; p++) {
                    const C = d[p],
                        E = d[p + 1];
                    t.addFace(g[0], C[0], E[0], g[1], C[1], E[1], g[2], C[2], E[2])
                }
            } else if (c === "l") {
                const h = A.substring(1).trim().split(r9);
                let u = [];
                const d = [];
                if (A.indexOf("/") === -1) u = h;
                else
                    for (let g = 0, p = h.length; g < p; g++) {
                        const I = h[g].split("/");
                        I[0] !== "" && u.push(I[0]), I[1] !== "" && d.push(I[1])
                    }
                t.addLineGeometry(u, d)
            } else if (c === "p") {
                const u = A.slice(1).trim().split(r9);
                t.addPointGeometry(u)
            } else if ((i = vr.exec(A)) !== null) {
                const h = (" " + i[0].slice(1).trim()).slice(1);
                t.startObject(h)
            } else if (Sr.test(A)) t.object.startMaterial(A.substring(7).trim(), t.materialLibraries);
            else if (Qr.test(A)) t.materialLibraries.push(A.substring(7).trim());
            else if (Mr.test(A)) console.warn('THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.');
            else if (c === "s") {
                if (i = A.split(" "), i.length > 1) {
                    const u = i[1].trim().toLowerCase();
                    t.object.smooth = u !== "0" && u !== "off"
                } else t.object.smooth = !0;
                const h = t.object.currentMaterial();
                h && (h.smooth = t.object.smooth)
            } else {
                if (A === "\0") continue;
                console.warn('THREE.OBJLoader: Unexpected line: "' + A + '"')
            }
        }
        t.finalize();
        const n = new E0;
        if (n.materialLibraries = [].concat(t.materialLibraries), !(t.objects.length === 1 && t.objects[0].geometry.vertices.length === 0) === !0)
            for (let a = 0, l = t.objects.length; a < l; a++) {
                const A = t.objects[a],
                    c = A.geometry,
                    h = A.materials,
                    u = c.type === "Line",
                    d = c.type === "Points";
                let g = !1;
                if (c.vertices.length === 0) continue;
                const p = new k1;
                p.setAttribute("position", new ct(c.vertices, 3)), c.normals.length > 0 && p.setAttribute("normal", new ct(c.normals, 3)), c.colors.length > 0 && (g = !0, p.setAttribute("color", new ct(c.colors, 3))), c.hasUVIndices === !0 && p.setAttribute("uv", new ct(c.uvs, 2));
                const I = [];
                for (let E = 0, x = h.length; E < x; E++) {
                    const B = h[E],
                        b = B.name + "_" + B.smooth + "_" + g;
                    let v = t.materials[b];
                    if (this.materials !== null) {
                        if (v = this.materials.create(B.name), u && v && !(v instanceof es)) {
                            const L = new es;
                            $i.prototype.copy.call(L, v), L.color.copy(v.color), v = L
                        } else if (d && v && !(v instanceof W1)) {
                            const L = new W1({
                                size: 10,
                                sizeAttenuation: !1
                            });
                            $i.prototype.copy.call(L, v), L.color.copy(v.color), L.map = v.map, v = L
                        }
                    }
                    v === void 0 && (u ? v = new es : d ? v = new W1({
                        size: 1,
                        sizeAttenuation: !1
                    }) : v = new p3, v.name = B.name, v.flatShading = !B.smooth, v.vertexColors = g, t.materials[b] = v), I.push(v)
                }
                let C;
                if (I.length > 1) {
                    for (let E = 0, x = h.length; E < x; E++) {
                        const B = h[E];
                        p.addGroup(B.groupStart, B.groupCount, E)
                    }
                    u ? C = new e2(p, I) : d ? C = new ts(p, I) : C = new K(p, I)
                } else u ? C = new e2(p, I[0]) : d ? C = new ts(p, I[0]) : C = new K(p, I[0]);
                C.name = A.name, n.add(C)
            } else if (t.vertices.length > 0) {
                const a = new W1({
                        size: 1,
                        sizeAttenuation: !1
                    }),
                    l = new k1;
                l.setAttribute("position", new ct(t.vertices, 3)), t.colors.length > 0 && t.colors[0] !== void 0 && (l.setAttribute("color", new ct(t.colors, 3)), a.vertexColors = !0);
                const A = new ts(l, a);
                n.add(A)
            } return n
    }
}
