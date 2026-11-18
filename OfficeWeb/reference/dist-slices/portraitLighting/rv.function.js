function rv(s, e) {
    if (s.updateMorphTargets(), e.weights !== void 0)
        for (let t = 0, n = e.weights.length; t < n; t++) s.morphTargetInfluences[t] = e.weights[t];
    if (e.extras && Array.isArray(e.extras.targetNames)) {
        const t = e.extras.targetNames;
        if (s.morphTargetInfluences.length === t.length) {
            s.morphTargetDictionary = {};
            for (let n = 0, i = t.length; n < i; n++) s.morphTargetDictionary[t[n]] = n
        } else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")
    }
}

