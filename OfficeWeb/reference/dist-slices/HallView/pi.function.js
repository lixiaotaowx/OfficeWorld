function pi(r, e, t = () => {}, s) {
    const i = new E0;
    i.name = "part:" + r.id;
    const n = {
        disposed: !1
    };
    R5.set(i, n);
    const o = (e == null ? void 0 : e.size) || [.5, .5, .5],
        a = new K(k5(new U0(o[0], o[1], o[2])), b9(new Ie({
            color: "#d8cbb6",
            transparent: !0,
            opacity: .45,
            roughness: 1
        })));
    return a.position.y = o[1] / 2, a.userData.token = "model", i.add(a), n1(i, r), e && go(e.file).then(l => {
        if (n.disposed) {
            l.release();
            return
        }
        n.release = l.release;
        let A;
        try {
            A = F5(l.value, e.size, e.file)
        } catch (c) {
            throw n.release = void 0, l.release(), c
        }
        i.remove(a), R9(a), i.add(A), t()
    }).catch(() => {
        n.disposed || (i.userData.modelLoadFailed = !0, a.material.color.set("#c96a5a"))
    }), i
}
async function fo(r) {
    const e = r.name.split(".").pop().toLowerCase(),
        t = r.name.replace(/\.[^.]+$/, "").slice(0, 60);
    if (r.size > 20 * 1024 * 1024) throw Error("模型文件最大 20 MB");
    let s, i;
    if (e === "glb") s = await r.arrayBuffer(), i = (await F9.parseAsync(s, "")).scene;
    else if (e === "obj") {
        if (i = new Tr().parse(await r.text()), i.traverse(o => {
                const a = o;
                a.isMesh && (a.material = new Ie({
                    color: "#e9d4aa",
                    roughness: .9
                }))
            }), s = await new Q1().parseAsync(i, {
                binary: !0
            }), s.byteLength > 20 * 1024 * 1024) throw Error("转换后超过 20 MB 了")
    } else throw Error("只支持 .glb 和 .obj");
    i.updateMatrixWorld(!0);
    const n = new re().setFromObject(i);
    if (n.isEmpty()) throw Error("这个文件里没有能显示的模型");
    return {
        glb: s,
        scene: i,
        size: n.getSize(new T),
        name: t
    }
}

