const ai = 1,
    z3 = r => {
        const e = r;
        return !!e.isMesh && !Array.isArray(e.material) && !!e.material.userData.shared && !e.isSkinnedMesh && !e.geometry.morphAttributes.position && e.geometry.hasAttribute("normal") && e.geometry.hasAttribute("uv")
    },
    _3 = (r, e) => {
        for (let t = r; t && t !== e; t = t.parent)
            if (!t.visible) return !1;
        return !0
    };
