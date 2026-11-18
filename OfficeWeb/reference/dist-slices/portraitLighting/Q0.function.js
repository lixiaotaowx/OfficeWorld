function Q0(s, e, t, n, i, r) {
    const a = new ko,
        o = new J0,
        l = new Set,
        c = [],
        h = new Map,
        u = n.logarithmicDepthBuffer,
        d = {
            MeshDepthMaterial: "depth",
            MeshDistanceMaterial: "distance",
            MeshNormalMaterial: "normal",
            MeshBasicMaterial: "basic",
            MeshLambertMaterial: "lambert",
            MeshPhongMaterial: "phong",
            MeshToonMaterial: "toon",
            MeshStandardMaterial: "physical",
            MeshPhysicalMaterial: "physical",
            MeshMatcapMaterial: "matcap",
            LineBasicMaterial: "basic",
            LineDashedMaterial: "dashed",
            PointsMaterial: "points",
            ShadowMaterial: "shadow",
            SpriteMaterial: "sprite"
        };

    function f(_) {
        return l.add(_), _ === 0 ? "uv" : `uv${_}`
    }

    function p(_, T, I, R, D, F) {
        const V = R.fog,
            L = D.geometry,
            k = _.isMeshStandardMaterial || _.isMeshLambertMaterial || _.isMeshPhongMaterial ? R.environment : null,
            X = _.isMeshStandardMaterial || _.isMeshLambertMaterial && !_.envMap || _.isMeshPhongMaterial && !_.envMap,
            H = e.get(_.envMap || k, X),
            te = d[_.type];
        let W = n.precision;
        _.precision !== null && (W = n.getMaxPrecision(_.precision), W !== _.precision && Ce("WebGLProgram.getParameters:", _.precision, "not supported, using", W, "instead."));
        const Q = L.morphAttributes.position || L.morphAttributes.normal || L.morphAttributes.color,
            ee = Q !== void 0 ? Q.length : 0;
        let Te = 0;
        L.morphAttributes.position !== void 0 && (Te = 1), L.morphAttributes.normal !== void 0 && (Te = 2), L.morphAttributes.color !== void 0 && (Te = 3);
        let Oe, Y, _e, Ee;
        if (te) {
            const ve = _n[te];
            Oe = ve.vertexShader, Y = ve.fragmentShader
        } else {
            Oe = _.vertexShader, Y = _.fragmentShader;
            const ve = o.getVertexShaderStage(_),
                lt = o.getFragmentShaderStage(_);
            o.update(_, ve, lt), _e = ve.id, Ee = lt.id
        }
        const Ne = s.getRenderTarget(),
            xe = s.state.buffers.depth.getReversed(),
            De = D.isInstancedMesh === !0,
            mt = D.isBatchedMesh === !0,
            Be = !!_.map,
            Je = !!_.matcap,
            je = !!H,
            j = je && H.isPMREMTexture === !0,
            ce = !!_.aoMap,
            ae = !!_.lightMap,
            ye = !!_.bumpMap && _.wireframe === !1,
            ge = !!_.normalMap,
            Ve = !!_.displacementMap,
            Le = !!_.emissiveMap,
            et = !!_.metalnessMap,
            tt = !!_.roughnessMap,
            rt = _.anisotropy > 0,
            U = _.clearcoat > 0,
            yt = _.diffuseRoughness > 0,
            $e = _.dispersion > 0,
            dt = _.retroreflectivity > 0,
            fe = _.iridescence > 0,
            St = _.sheen > 0,
            Ue = _.transmission > 0,
            ke = rt && !!_.anisotropyMap,
            w = U && !!_.clearcoatMap,
            S = U && !!_.clearcoatNormalMap,
            B = U && !!_.clearcoatRoughnessMap,
            ne = yt && !!_.diffuseRoughnessMap,
            $ = fe && !!_.iridescenceMap,
            oe = fe && !!_.iridescenceThicknessMap,
            pe = St && !!_.sheenColorMap,
            K = St && !!_.sheenRoughnessMap,
            J = !!_.specularMap,
            he = !!_.specularColorMap,
            C = !!_.specularIntensityMap,
            Z = Ue && !!_.transmissionMap,
            q = Ue && !!_.thicknessMap,
            ue = !!_.gradientMap,
            se = !!_.alphaMap,
            le = _.alphaTest > 0,
            Pe = !!_.alphaHash,
            qe = !!_.extensions;
        let ie = Un;
        _.toneMapped && (Ne === null || Ne.isXRRenderTarget === !0) && (ie = s.toneMapping);
        const Ie = j ? H.isCompressedCubeTexture ? H.image[0].mipmaps : H.mipmaps : null,
            Xe = {
                shaderID: te,
                shaderType: _.type,
                shaderName: _.name,
                vertexShader: Oe,
                fragmentShader: Y,
                defines: _.defines,
                customVertexShaderID: _e,
                customFragmentShaderID: Ee,
                isRawShaderMaterial: _.isRawShaderMaterial === !0,
                glslVersion: _.glslVersion,
                precision: W,
                batching: mt,
                batchingColor: mt && D._colorsTexture !== null,
                instancing: De,
                instancingColor: De && D.instanceColor !== null,
                instancingMorph: De && D.morphTexture !== null,
                outputColorSpace: Ne === null ? s.outputColorSpace : Ne.isXRRenderTarget === !0 ? Ne.texture.colorSpace : Qe.workingColorSpace,
                alphaToCoverage: !!_.alphaToCoverage,
                map: Be,
                matcap: Je,
                envMap: je,
                envMapMode: je && H.mapping,
                envMapPMREM: j,
                envMapMaxLod: j ? Ie.length - 1 : null,
                envMapSize: j ? Ie[0].width : null,
                aoMap: ce,
                lightMap: ae,
                bumpMap: ye,
                normalMap: ge,
                displacementMap: Ve,
                emissiveMap: Le,
                normalMapObjectSpace: ge && _.normalMapType === nd,
                normalMapTangentSpace: ge && _.normalMapType === Hi,
                packedNormalMap: ge && _.normalMapType === Hi && $0(_.normalMap.format),
                metalnessMap: et,
                roughnessMap: tt,
                anisotropy: rt,
                anisotropyMap: ke,
                clearcoat: U,
                clearcoatMap: w,
                clearcoatNormalMap: S,
                clearcoatRoughnessMap: B,
                diffuseRoughness: yt,
                diffuseRoughnessMap: ne,
                dispersion: $e,
                retroreflection: dt,
                iridescence: fe,
                iridescenceMap: $,
                iridescenceThicknessMap: oe,
                sheen: St,
                sheenColorMap: pe,
                sheenRoughnessMap: K,
                specularMap: J,
                specularColorMap: he,
                specularIntensityMap: C,
                transmission: Ue,
                transmissionMap: Z,
                thicknessMap: q,
                gradientMap: ue,
                opaque: _.transparent === !1 && _.blending === fs && _.alphaToCoverage === !1,
                alphaMap: se,
                alphaTest: le,
                alphaHash: Pe,
                combine: _.combine,
                mapUv: Be && f(_.map.channel),
                aoMapUv: ce && f(_.aoMap.channel),
                lightMapUv: ae && f(_.lightMap.channel),
                bumpMapUv: ye && f(_.bumpMap.channel),
                normalMapUv: ge && f(_.normalMap.channel),
                displacementMapUv: Ve && f(_.displacementMap.channel),
                emissiveMapUv: Le && f(_.emissiveMap.channel),
                metalnessMapUv: et && f(_.metalnessMap.channel),
                roughnessMapUv: tt && f(_.roughnessMap.channel),
                anisotropyMapUv: ke && f(_.anisotropyMap.channel),
                clearcoatMapUv: w && f(_.clearcoatMap.channel),
                clearcoatNormalMapUv: S && f(_.clearcoatNormalMap.channel),
                clearcoatRoughnessMapUv: B && f(_.clearcoatRoughnessMap.channel),
                diffuseRoughnessMapUv: ne && f(_.diffuseRoughnessMap.channel),
                iridescenceMapUv: $ && f(_.iridescenceMap.channel),
                iridescenceThicknessMapUv: oe && f(_.iridescenceThicknessMap.channel),
                sheenColorMapUv: pe && f(_.sheenColorMap.channel),
                sheenRoughnessMapUv: K && f(_.sheenRoughnessMap.channel),
                specularMapUv: J && f(_.specularMap.channel),
                specularColorMapUv: he && f(_.specularColorMap.channel),
                specularIntensityMapUv: C && f(_.specularIntensityMap.channel),
                transmissionMapUv: Z && f(_.transmissionMap.channel),
                thicknessMapUv: q && f(_.thicknessMap.channel),
                alphaMapUv: se && f(_.alphaMap.channel),
                vertexTangents: !!L.attributes.tangent && (ge || rt),
                vertexNormals: !!L.attributes.normal,
                vertexColors: _.vertexColors,
                vertexAlphas: _.vertexColors === !0 && !!L.attributes.color && L.attributes.color.itemSize === 4,
                pointsUvs: D.isPoints === !0 && !!L.attributes.uv && (Be || se),
                fog: !!V,
                useFog: _.fog === !0,
                fogExp2: !!V && V.isFogExp2,
                flatShading: _.wireframe === !1 && (_.flatShading === !0 || L.attributes.normal === void 0 && ge === !1 && (_.isMeshLambertMaterial || _.isMeshPhongMaterial || _.isMeshStandardMaterial || _.isMeshPhysicalMaterial)),
                sizeAttenuation: _.sizeAttenuation === !0,
                logarithmicDepthBuffer: u,
                reversedDepthBuffer: xe,
                skinning: D.isSkinnedMesh === !0,
                hasPositionAttribute: L.attributes.position !== void 0,
                morphTargets: L.morphAttributes.position !== void 0,
                morphNormals: L.morphAttributes.normal !== void 0,
                morphColors: L.morphAttributes.color !== void 0,
                morphTargetsCount: ee,
                morphTextureStride: Te,
                numSunLights: T.sun.length,
                numDirLights: T.directional.length,
                numPointLights: T.point.length,
                numSpotLights: T.spot.length,
                numSpotLightMaps: T.spotLightMap.length,
                numRectAreaLights: T.rectArea.length,
                numHemiLights: T.hemi.length,
                numSunLightShadows: T.sunShadowMap.length,
                numDirLightShadows: T.directionalShadowMap.length,
                numPointLightShadows: T.pointShadowMap.length,
                numSpotLightShadows: T.spotShadowMap.length,
                numSpotLightShadowsWithMaps: T.numSpotLightShadowsWithMaps,
                numLightProbes: T.numLightProbes,
                numLightProbeGrids: F.filter(ve => ve.texture !== null).length,
                numClippingPlanes: r.numPlanes,
                numClipIntersection: r.numIntersection,
                dithering: _.dithering,
                shadowMapEnabled: s.shadowMap.enabled && I.length > 0,
                shadowMapType: s.shadowMap.type,
                toneMapping: ie,
                decodeVideoTexture: Be && _.map.isVideoTexture === !0 && Qe.getTransfer(_.map.colorSpace) === ct,
                decodeVideoTextureEmissive: Le && _.emissiveMap.isVideoTexture === !0 && Qe.getTransfer(_.emissiveMap.colorSpace) === ct,
                premultipliedAlpha: _.premultipliedAlpha,
                doubleSided: _.side === xn,
                flipSided: _.side === Wt,
                useDepthPacking: _.depthPacking >= 0,
                depthPacking: _.depthPacking || 0,
                index0AttributeName: _.index0AttributeName,
                extensionClipCullDistance: qe && _.extensions.clipCullDistance === !0 && t.has("WEBGL_clip_cull_distance"),
                extensionMultiDraw: (qe && _.extensions.multiDraw === !0 || mt) && t.has("WEBGL_multi_draw"),
                rendererExtensionParallelShaderCompile: t.has("KHR_parallel_shader_compile"),
                customProgramCacheKey: _.customProgramCacheKey()
            };
        return Xe.vertexUv1s = l.has(1), Xe.vertexUv2s = l.has(2), Xe.vertexUv3s = l.has(3), l.clear(), Xe
    }

    function x(_) {
        const T = [];
        if (_.shaderID ? T.push(_.shaderID) : (T.push(_.customVertexShaderID), T.push(_.customFragmentShaderID)), _.defines !== void 0)
            for (const I in _.defines) T.push(I), T.push(_.defines[I]);
        return _.isRawShaderMaterial === !1 && (m(T, _), g(T, _), T.push(s.outputColorSpace)), T.push(_.customProgramCacheKey), T.join()
    }

    function m(_, T) {
        _.push(T.precision), _.push(T.outputColorSpace), _.push(T.envMapMode), _.push(T.envMapPMREM), _.push(T.envMapMaxLod), _.push(T.envMapSize), _.push(T.mapUv), _.push(T.alphaMapUv), _.push(T.lightMapUv), _.push(T.aoMapUv), _.push(T.bumpMapUv), _.push(T.normalMapUv), _.push(T.displacementMapUv), _.push(T.emissiveMapUv), _.push(T.metalnessMapUv), _.push(T.roughnessMapUv), _.push(T.anisotropyMapUv), _.push(T.clearcoatMapUv), _.push(T.clearcoatNormalMapUv), _.push(T.clearcoatRoughnessMapUv), _.push(T.diffuseRoughnessMapUv), _.push(T.iridescenceMapUv), _.push(T.iridescenceThicknessMapUv), _.push(T.sheenColorMapUv), _.push(T.sheenRoughnessMapUv), _.push(T.specularMapUv), _.push(T.specularColorMapUv), _.push(T.specularIntensityMapUv), _.push(T.transmissionMapUv), _.push(T.thicknessMapUv), _.push(T.combine), _.push(T.fogExp2), _.push(T.sizeAttenuation), _.push(T.morphTargetsCount), _.push(T.numSunLights), _.push(T.numDirLights), _.push(T.numPointLights), _.push(T.numSpotLights), _.push(T.numSpotLightMaps), _.push(T.numHemiLights), _.push(T.numRectAreaLights), _.push(T.numSunLightShadows), _.push(T.numDirLightShadows), _.push(T.numPointLightShadows), _.push(T.numSpotLightShadows), _.push(T.numSpotLightShadowsWithMaps), _.push(T.numLightProbes), _.push(T.numLightProbeGrids), _.push(T.shadowMapType), _.push(T.toneMapping), _.push(T.numClippingPlanes), _.push(T.numClipIntersection), _.push(T.depthPacking)
    }

    function g(_, T) {
        a.disableAll(), T.instancing && a.enable(0), T.instancingColor && a.enable(1), T.instancingMorph && a.enable(2), T.matcap && a.enable(3), T.envMap && a.enable(4), T.normalMapObjectSpace && a.enable(5), T.normalMapTangentSpace && a.enable(6), T.clearcoat && a.enable(7), T.iridescence && a.enable(8), T.alphaTest && a.enable(9), T.vertexColors && a.enable(10), T.vertexAlphas && a.enable(11), T.vertexUv1s && a.enable(12), T.vertexUv2s && a.enable(13), T.vertexUv3s && a.enable(14), T.vertexTangents && a.enable(15), T.anisotropy && a.enable(16), T.alphaHash && a.enable(17), T.batching && a.enable(18), T.dispersion && a.enable(19), T.retroreflection && a.enable(24), T.diffuseRoughness && a.enable(25), T.batchingColor && a.enable(20), T.gradientMap && a.enable(21), T.packedNormalMap && a.enable(22), T.vertexNormals && a.enable(23), _.push(a.mask), a.disableAll(), T.fog && a.enable(0), T.useFog && a.enable(1), T.flatShading && a.enable(2), T.logarithmicDepthBuffer && a.enable(3), T.reversedDepthBuffer && a.enable(4), T.skinning && a.enable(5), T.morphTargets && a.enable(6), T.morphNormals && a.enable(7), T.morphColors && a.enable(8), T.premultipliedAlpha && a.enable(9), T.shadowMapEnabled && a.enable(10), T.doubleSided && a.enable(11), T.flipSided && a.enable(12), T.useDepthPacking && a.enable(13), T.dithering && a.enable(14), T.transmission && a.enable(15), T.sheen && a.enable(16), T.opaque && a.enable(17), T.pointsUvs && a.enable(18), T.decodeVideoTexture && a.enable(19), T.decodeVideoTextureEmissive && a.enable(20), T.alphaToCoverage && a.enable(21), T.numLightProbeGrids > 0 && a.enable(22), T.hasPositionAttribute && a.enable(23), _.push(a.mask)
    }

    function M(_) {
        const T = d[_.type];
        let I;
        if (T) {
            const R = _n[T];
            I = Vf.clone(R.uniforms)
        } else I = _.uniforms;
        return I
    }

    function E(_, T) {
        let I = h.get(T);
        return I !== void 0 ? ++I.usedTimes : (I = new Y0(s, T, _, i), c.push(I), h.set(T, I)), I
    }

    function v(_) {
        if (--_.usedTimes === 0) {
            const T = c.indexOf(_);
            c[T] = c[c.length - 1], c.pop(), h.delete(_.cacheKey), _.destroy()
        }
    }

    function A(_) {
        o.remove(_)
    }

    function b() {
        o.dispose()
    }
    return {
        getParameters: p,
        getProgramCacheKey: x,
        getUniforms: M,
        acquireProgram: E,
        releaseProgram: v,
        releaseShaderCache: A,
        programs: c,
        dispose: b
    }
}

