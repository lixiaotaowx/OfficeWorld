function ax(s) {
    const e = new nx,
        t = ix(),
        n = {
            version: 0,
            hash: {
                sunLength: -1,
                directionalLength: -1,
                pointLength: -1,
                spotLength: -1,
                rectAreaLength: -1,
                hemiLength: -1,
                numSunShadows: -1,
                numDirectionalShadows: -1,
                numPointShadows: -1,
                numSpotShadows: -1,
                numSpotMaps: -1,
                numLightProbes: -1
            },
            ambient: [0, 0, 0],
            probe: [],
            sun: [],
            sunShadow: [],
            sunShadowMap: [],
            sunShadowMatrix: [],
            sunShadowCascade: [],
            directional: [],
            directionalShadow: [],
            directionalShadowMap: [],
            directionalShadowMatrix: [],
            spot: [],
            spotLightMap: [],
            spotShadow: [],
            spotShadowMap: [],
            spotLightMatrix: [],
            rectArea: [],
            rectAreaLTC1: null,
            rectAreaLTC2: null,
            point: [],
            pointShadow: [],
            pointShadowMap: [],
            pointShadowMatrix: [],
            hemi: [],
            numSpotLightShadowsWithMaps: 0,
            numLightProbes: 0
        };
    for (let c = 0; c < 9; c++) n.probe.push(new N);
    const i = new N,
        r = new We,
        a = new We;

    function o(c) {
        let h = 0,
            u = 0,
            d = 0;
        for (let F = 0; F < 9; F++) n.probe[F].set(0, 0, 0);
        let f = 0,
            p = 0,
            x = 0,
            m = 0,
            g = 0,
            M = 0,
            E = 0,
            v = 0,
            A = 0,
            b = 0,
            _ = 0,
            T = 0,
            I = 0,
            R = 0;
        c.sort(rx);
        for (let F = 0, V = c.length; F < V; F++) {
            const L = c[F],
                k = L.color,
                X = L.intensity,
                H = L.distance;
            let te = null;
            if (L.shadow && L.shadow.map && (L.shadow.map.texture.format === ui ? te = L.shadow.map.texture : te = L.shadow.map.depthTexture || L.shadow.map.texture), L.isAmbientLight) h += k.r * X, u += k.g * X, d += k.b * X;
            else if (L.isLightProbe) {
                for (let W = 0; W < 9; W++) n.probe[W].addScaledVector(L.sh.coefficients[W], X);
                R++
            } else if (L.isSunLight) {
                const W = e.get(L);
                if (W.color.copy(L.color).multiplyScalar(L.intensity), L.castShadow) {
                    const Q = L.shadow,
                        ee = t.get(L);
                    ee.shadowIntensity = Q.intensity, ee.shadowBias = Q.bias, ee.shadowNormalBias = Q.normalBias, ee.shadowRadius = Q.radius, ee.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()), n.sunShadow[p] = ee, n.sunShadowMap[p] = te;
                    const Te = Q.getViewportCount();
                    for (let Oe = 0; Oe < Te; Oe++) n.sunShadowMatrix[x + Oe] = Q.getMatrix(Oe), n.sunShadowCascade[x + Oe] = Q._cascadeData[Oe];
                    x += Te, p++
                }
                n.sun[f] = W, f++
            } else if (L.isDirectionalLight) {
                const W = e.get(L);
                if (W.color.copy(L.color).multiplyScalar(L.intensity), L.castShadow) {
                    const Q = L.shadow,
                        ee = t.get(L);
                    ee.shadowIntensity = Q.intensity, ee.shadowBias = Q.bias, ee.shadowNormalBias = Q.normalBias, ee.shadowRadius = Q.radius, ee.shadowMapSize = Q.mapSize, n.directionalShadow[m] = ee, n.directionalShadowMap[m] = te, n.directionalShadowMatrix[m] = L.shadow.matrix, A++
                }
                n.directional[m] = W, m++
            } else if (L.isSpotLight) {
                const W = e.get(L);
                W.position.setFromMatrixPosition(L.matrixWorld), W.color.copy(k).multiplyScalar(X), W.distance = H, W.coneCos = Math.cos(L.angle), W.penumbraCos = Math.cos(L.angle * (1 - L.penumbra)), W.decay = L.decay, n.spot[M] = W;
                const Q = L.shadow;
                if (L.map && (n.spotLightMap[T] = L.map, T++, Q.updateMatrices(L), L.castShadow && I++), n.spotLightMatrix[M] = Q.matrix, L.castShadow) {
                    const ee = t.get(L);
                    ee.shadowIntensity = Q.intensity, ee.shadowBias = Q.bias, ee.shadowNormalBias = Q.normalBias, ee.shadowRadius = Q.radius, ee.shadowMapSize = Q.mapSize, n.spotShadow[M] = ee, n.spotShadowMap[M] = te, _++
                }
                M++
            } else if (L.isRectAreaLight) {
                const W = e.get(L);
                W.color.copy(k).multiplyScalar(X), W.halfWidth.set(L.width * .5, 0, 0), W.halfHeight.set(0, L.height * .5, 0), n.rectArea[E] = W, E++
            } else if (L.isPointLight) {
                const W = e.get(L);
                if (W.color.copy(L.color).multiplyScalar(L.intensity), W.distance = L.distance, W.decay = L.decay, L.castShadow) {
                    const Q = L.shadow,
                        ee = t.get(L);
                    ee.shadowIntensity = Q.intensity, ee.shadowBias = Q.bias, ee.shadowNormalBias = Q.normalBias, ee.shadowRadius = Q.radius, ee.shadowMapSize = Q.mapSize, ee.shadowCameraNear = Q.camera.near, ee.shadowCameraFar = Q.camera.far, n.pointShadow[g] = ee, n.pointShadowMap[g] = te, n.pointShadowMatrix[g] = L.shadow.matrix, b++
                }
                n.point[g] = W, g++
            } else if (L.isHemisphereLight) {
                const W = e.get(L);
                W.skyColor.copy(L.color).multiplyScalar(X), W.groundColor.copy(L.groundColor).multiplyScalar(X), n.hemi[v] = W, v++
            }
        }
        E > 0 && (s.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = Me.LTC_FLOAT_1, n.rectAreaLTC2 = Me.LTC_FLOAT_2) : (n.rectAreaLTC1 = Me.LTC_HALF_1, n.rectAreaLTC2 = Me.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = u, n.ambient[2] = d;
        const D = n.hash;
        (D.sunLength !== f || D.directionalLength !== m || D.pointLength !== g || D.spotLength !== M || D.rectAreaLength !== E || D.hemiLength !== v || D.numSunShadows !== p || D.numDirectionalShadows !== A || D.numPointShadows !== b || D.numSpotShadows !== _ || D.numSpotMaps !== T || D.numLightProbes !== R) && (n.sun.length = f, n.directional.length = m, n.spot.length = M, n.rectArea.length = E, n.point.length = g, n.hemi.length = v, n.sunShadow.length = p, n.sunShadowMap.length = p, n.sunShadowMatrix.length = x, n.sunShadowCascade.length = x, n.directionalShadow.length = A, n.directionalShadowMap.length = A, n.directionalShadowMatrix.length = A, n.pointShadow.length = b, n.pointShadowMap.length = b, n.pointShadowMatrix.length = b, n.spotShadow.length = _, n.spotShadowMap.length = _, n.spotLightMatrix.length = _ + T - I, n.spotLightMap.length = T, n.numSpotLightShadowsWithMaps = I, n.numLightProbes = R, D.sunLength = f, D.directionalLength = m, D.pointLength = g, D.spotLength = M, D.rectAreaLength = E, D.hemiLength = v, D.numSunShadows = p, D.numDirectionalShadows = A, D.numPointShadows = b, D.numSpotShadows = _, D.numSpotMaps = T, D.numLightProbes = R, n.version = sx++)
    }

    function l(c, h) {
        let u = 0,
            d = 0,
            f = 0,
            p = 0,
            x = 0,
            m = 0;
        const g = h.matrixWorldInverse;
        for (let M = 0, E = c.length; M < E; M++) {
            const v = c[M];
            if (v.isSunLight) {
                const A = n.sun[u];
                A.direction.setFromMatrixPosition(v.matrixWorld), A.direction.transformDirection(g), u++
            } else if (v.isDirectionalLight) {
                const A = n.directional[d];
                A.direction.setFromMatrixPosition(v.matrixWorld), i.setFromMatrixPosition(v.target.matrixWorld), A.direction.sub(i), A.direction.transformDirection(g), d++
            } else if (v.isSpotLight) {
                const A = n.spot[p];
                A.position.setFromMatrixPosition(v.matrixWorld), A.position.applyMatrix4(g), A.direction.setFromMatrixPosition(v.matrixWorld), i.setFromMatrixPosition(v.target.matrixWorld), A.direction.sub(i), A.direction.transformDirection(g), p++
            } else if (v.isRectAreaLight) {
                const A = n.rectArea[x];
                A.position.setFromMatrixPosition(v.matrixWorld), A.position.applyMatrix4(g), a.identity(), r.copy(v.matrixWorld), r.premultiply(g), a.extractRotation(r), A.halfWidth.set(v.width * .5, 0, 0), A.halfHeight.set(0, v.height * .5, 0), A.halfWidth.applyMatrix4(a), A.halfHeight.applyMatrix4(a), x++
            } else if (v.isPointLight) {
                const A = n.point[f];
                A.position.setFromMatrixPosition(v.matrixWorld), A.position.applyMatrix4(g), f++
            } else if (v.isHemisphereLight) {
                const A = n.hemi[m];
                A.direction.setFromMatrixPosition(v.matrixWorld), A.direction.transformDirection(g), m++
            }
        }
    }
    return {
        setup: o,
        setupView: l,
        state: n
    }
}

