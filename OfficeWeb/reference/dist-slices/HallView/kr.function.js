function kr() {
    const r = {
        objects: [],
        object: {},
        vertices: [],
        normals: [],
        colors: [],
        uvs: [],
        materials: {},
        materialLibraries: [],
        startObject: function(e, t) {
            if (this.object && this.object.fromDeclaration === !1) {
                this.object.name = e, this.object.fromDeclaration = t !== !1;
                return
            }
            const s = this.object && typeof this.object.currentMaterial == "function" ? this.object.currentMaterial() : void 0;
            if (this.object && typeof this.object._finalize == "function" && this.object._finalize(!0), this.object = {
                    name: e || "",
                    fromDeclaration: t !== !1,
                    geometry: {
                        vertices: [],
                        normals: [],
                        colors: [],
                        uvs: [],
                        hasUVIndices: !1
                    },
                    materials: [],
                    smooth: !0,
                    startMaterial: function(i, n) {
                        const o = this._finalize(!1);
                        o && (o.inherited || o.groupCount <= 0) && this.materials.splice(o.index, 1);
                        const a = {
                            index: this.materials.length,
                            name: i || "",
                            mtllib: Array.isArray(n) && n.length > 0 ? n[n.length - 1] : "",
                            smooth: o !== void 0 ? o.smooth : this.smooth,
                            groupStart: o !== void 0 ? o.groupEnd : 0,
                            groupEnd: -1,
                            groupCount: -1,
                            inherited: !1,
                            clone: function(l) {
                                const A = {
                                    index: typeof l == "number" ? l : this.index,
                                    name: this.name,
                                    mtllib: this.mtllib,
                                    smooth: this.smooth,
                                    groupStart: 0,
                                    groupEnd: -1,
                                    groupCount: -1,
                                    inherited: !1
                                };
                                return A.clone = this.clone.bind(A), A
                            }
                        };
                        return this.materials.push(a), a
                    },
                    currentMaterial: function() {
                        if (this.materials.length > 0) return this.materials[this.materials.length - 1]
                    },
                    _finalize: function(i) {
                        const n = this.currentMaterial();
                        if (n && n.groupEnd === -1 && (n.groupEnd = this.geometry.vertices.length / 3, n.groupCount = n.groupEnd - n.groupStart, n.inherited = !1), i && this.materials.length > 1)
                            for (let o = this.materials.length - 1; o >= 0; o--) this.materials[o].groupCount <= 0 && this.materials.splice(o, 1);
                        return i && this.materials.length === 0 && this.materials.push({
                            name: "",
                            smooth: this.smooth
                        }), n
                    }
                }, s && s.name && typeof s.clone == "function") {
                const i = s.clone(0);
                i.inherited = !0, this.object.materials.push(i)
            }
            this.objects.push(this.object)
        },
        finalize: function() {
            this.object && typeof this.object._finalize == "function" && this.object._finalize(!0)
        },
        parseVertexIndex: function(e, t) {
            const s = parseInt(e, 10);
            return (s >= 0 ? s - 1 : s + t / 3) * 3
        },
        parseNormalIndex: function(e, t) {
            const s = parseInt(e, 10);
            return (s >= 0 ? s - 1 : s + t / 3) * 3
        },
        parseUVIndex: function(e, t) {
            const s = parseInt(e, 10);
            return (s >= 0 ? s - 1 : s + t / 2) * 2
        },
        addVertex: function(e, t, s) {
            const i = this.vertices,
                n = this.object.geometry.vertices;
            n.push(i[e + 0], i[e + 1], i[e + 2]), n.push(i[t + 0], i[t + 1], i[t + 2]), n.push(i[s + 0], i[s + 1], i[s + 2])
        },
        addVertexPoint: function(e) {
            const t = this.vertices;
            this.object.geometry.vertices.push(t[e + 0], t[e + 1], t[e + 2])
        },
        addVertexLine: function(e) {
            const t = this.vertices;
            this.object.geometry.vertices.push(t[e + 0], t[e + 1], t[e + 2])
        },
        addNormal: function(e, t, s) {
            const i = this.normals,
                n = this.object.geometry.normals;
            n.push(i[e + 0], i[e + 1], i[e + 2]), n.push(i[t + 0], i[t + 1], i[t + 2]), n.push(i[s + 0], i[s + 1], i[s + 2])
        },
        addFaceNormal: function(e, t, s) {
            const i = this.vertices,
                n = this.object.geometry.normals;
            y2.fromArray(i, e), ys.fromArray(i, t), w2.fromArray(i, s), he.subVectors(w2, ys), B2.subVectors(y2, ys), he.cross(B2), he.normalize(), n.push(he.x, he.y, he.z), n.push(he.x, he.y, he.z), n.push(he.x, he.y, he.z)
        },
        addColor: function(e, t, s) {
            const i = this.colors,
                n = this.object.geometry.colors;
            i[e] !== void 0 && n.push(i[e + 0], i[e + 1], i[e + 2]), i[t] !== void 0 && n.push(i[t + 0], i[t + 1], i[t + 2]), i[s] !== void 0 && n.push(i[s + 0], i[s + 1], i[s + 2])
        },
        addUV: function(e, t, s) {
            const i = this.uvs,
                n = this.object.geometry.uvs;
            n.push(i[e + 0], i[e + 1]), n.push(i[t + 0], i[t + 1]), n.push(i[s + 0], i[s + 1])
        },
        addDefaultUV: function() {
            const e = this.object.geometry.uvs;
            e.push(0, 0), e.push(0, 0), e.push(0, 0)
        },
        addUVLine: function(e) {
            const t = this.uvs;
            this.object.geometry.uvs.push(t[e + 0], t[e + 1])
        },
        addFace: function(e, t, s, i, n, o, a, l, A) {
            const c = this.vertices.length;
            let h = this.parseVertexIndex(e, c),
                u = this.parseVertexIndex(t, c),
                d = this.parseVertexIndex(s, c);
            if (this.addVertex(h, u, d), this.addColor(h, u, d), a !== void 0 && a !== "") {
                const g = this.normals.length;
                h = this.parseNormalIndex(a, g), u = this.parseNormalIndex(l, g), d = this.parseNormalIndex(A, g), this.addNormal(h, u, d)
            } else this.addFaceNormal(h, u, d);
            if (i !== void 0 && i !== "") {
                const g = this.uvs.length;
                h = this.parseUVIndex(i, g), u = this.parseUVIndex(n, g), d = this.parseUVIndex(o, g), this.addUV(h, u, d), this.object.geometry.hasUVIndices = !0
            } else this.addDefaultUV()
        },
        addPointGeometry: function(e) {
            this.object.geometry.type = "Points";
            const t = this.vertices.length;
            for (let s = 0, i = e.length; s < i; s++) {
                const n = this.parseVertexIndex(e[s], t);
                this.addVertexPoint(n), this.addColor(n)
            }
        },
        addLineGeometry: function(e, t) {
            this.object.geometry.type = "Line";
            const s = this.vertices.length,
                i = this.uvs.length;
            for (let n = 0, o = e.length - 1; n < o; n++) this.addVertexLine(this.parseVertexIndex(e[n], s)), this.addVertexLine(this.parseVertexIndex(e[n + 1], s));
            for (let n = 0, o = t.length - 1; n < o; n++) this.addUVLine(this.parseUVIndex(t[n], i)), this.addUVLine(this.parseUVIndex(t[n + 1], i))
        }
    };
    return r.startObject("", !1), r
}
