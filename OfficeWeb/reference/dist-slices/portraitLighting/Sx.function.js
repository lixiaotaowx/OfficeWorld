function Sx(s, e) {
    function t(m, g) {
        m.matrixAutoUpdate === !0 && m.updateMatrix(), g.value.copy(m.matrix)
    }

    function n(m, g) {
        g.color.getRGB(m.fogColor.value, Kh(s)), g.isFog ? (m.fogNear.value = g.near, m.fogFar.value = g.far) : g.isFogExp2 && (m.fogDensity.value = g.density)
    }

    function i(m, g, M, E, v) {
        g.isNodeMaterial ? g.uniformsNeedUpdate = !1 : g.isMeshBasicMaterial ? r(m, g) : g.isMeshLambertMaterial ? (r(m, g), g.envMap && (m.envMapIntensity.value = g.envMapIntensity)) : g.isMeshToonMaterial ? (r(m, g), u(m, g)) : g.isMeshPhongMaterial ? (r(m, g), h(m, g), g.envMap && (m.envMapIntensity.value = g.envMapIntensity)) : g.isMeshStandardMaterial ? (r(m, g), d(m, g), g.isMeshPhysicalMaterial && f(m, g, v)) : g.isMeshMatcapMaterial ? (r(m, g), p(m, g)) : g.isMeshDepthMaterial ? r(m, g) : g.isMeshDistanceMaterial ? (r(m, g), x(m, g)) : g.isMeshNormalMaterial ? r(m, g) : g.isLineBasicMaterial ? (a(m, g), g.isLineDashedMaterial && o(m, g)) : g.isPointsMaterial ? l(m, g, M, E) : g.isSpriteMaterial ? c(m, g) : g.isShadowMaterial ? (m.color.value.copy(g.color), m.opacity.value = g.opacity) : g.isShaderMaterial && (g.uniformsNeedUpdate = !1)
    }

    function r(m, g) {
        m.opacity.value = g.opacity, g.color && m.diffuse.value.copy(g.color), g.emissive && m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity), g.map && (m.map.value = g.map, t(g.map, m.mapTransform)), g.alphaMap && (m.alphaMap.value = g.alphaMap, t(g.alphaMap, m.alphaMapTransform)), g.bumpMap && (m.bumpMap.value = g.bumpMap, t(g.bumpMap, m.bumpMapTransform), m.bumpScale.value = g.bumpScale, g.side === Wt && (m.bumpScale.value *= -1)), g.normalMap && (m.normalMap.value = g.normalMap, t(g.normalMap, m.normalMapTransform), m.normalScale.value.copy(g.normalScale), g.side === Wt && m.normalScale.value.negate()), g.displacementMap && (m.displacementMap.value = g.displacementMap, t(g.displacementMap, m.displacementMapTransform), m.displacementScale.value = g.displacementScale, m.displacementBias.value = g.displacementBias), g.emissiveMap && (m.emissiveMap.value = g.emissiveMap, t(g.emissiveMap, m.emissiveMapTransform)), g.specularMap && (m.specularMap.value = g.specularMap, t(g.specularMap, m.specularMapTransform)), g.alphaTest > 0 && (m.alphaTest.value = g.alphaTest);
        const M = e.get(g),
            E = M.envMap,
            v = M.envMapRotation;
        E && (m.envMap.value = E, m.envMapRotation.value.setFromMatrix4(Mx.makeRotationFromEuler(v)).transpose(), E.isCubeTexture && E.isRenderTargetTexture === !1 && m.envMapRotation.value.premultiply(hu), m.reflectivity.value = g.reflectivity, m.ior.value = g.ior, m.refractionRatio.value = g.refractionRatio), g.lightMap && (m.lightMap.value = g.lightMap, m.lightMapIntensity.value = g.lightMapIntensity, t(g.lightMap, m.lightMapTransform)), g.aoMap && (m.aoMap.value = g.aoMap, m.aoMapIntensity.value = g.aoMapIntensity, t(g.aoMap, m.aoMapTransform))
    }

    function a(m, g) {
        m.diffuse.value.copy(g.color), m.opacity.value = g.opacity, g.map && (m.map.value = g.map, t(g.map, m.mapTransform))
    }

    function o(m, g) {
        m.dashSize.value = g.dashSize, m.totalSize.value = g.dashSize + g.gapSize, m.scale.value = g.scale
    }

    function l(m, g, M, E) {
        m.diffuse.value.copy(g.color), m.opacity.value = g.opacity, m.size.value = g.size * M, m.scale.value = E * .5, g.map && (m.map.value = g.map, t(g.map, m.uvTransform)), g.alphaMap && (m.alphaMap.value = g.alphaMap, t(g.alphaMap, m.alphaMapTransform)), g.alphaTest > 0 && (m.alphaTest.value = g.alphaTest)
    }

    function c(m, g) {
        m.diffuse.value.copy(g.color), m.opacity.value = g.opacity, m.rotation.value = g.rotation, g.map && (m.map.value = g.map, t(g.map, m.mapTransform)), g.alphaMap && (m.alphaMap.value = g.alphaMap, t(g.alphaMap, m.alphaMapTransform)), g.alphaTest > 0 && (m.alphaTest.value = g.alphaTest)
    }

    function h(m, g) {
        m.specular.value.copy(g.specular), m.shininess.value = Math.max(g.shininess, 1e-4)
    }

    function u(m, g) {
        g.gradientMap && (m.gradientMap.value = g.gradientMap)
    }

    function d(m, g) {
        m.metalness.value = g.metalness, g.metalnessMap && (m.metalnessMap.value = g.metalnessMap, t(g.metalnessMap, m.metalnessMapTransform)), m.roughness.value = g.roughness, g.roughnessMap && (m.roughnessMap.value = g.roughnessMap, t(g.roughnessMap, m.roughnessMapTransform)), g.envMap && (m.envMapIntensity.value = g.envMapIntensity)
    }

    function f(m, g, M) {
        m.ior.value = g.ior, g.diffuseRoughness > 0 && (m.diffuseRoughness.value = g.diffuseRoughness, g.diffuseRoughnessMap && (m.diffuseRoughnessMap.value = g.diffuseRoughnessMap, t(g.diffuseRoughnessMap, m.diffuseRoughnessMapTransform))), g.sheen > 0 && (m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen), m.sheenRoughness.value = g.sheenRoughness, g.sheenColorMap && (m.sheenColorMap.value = g.sheenColorMap, t(g.sheenColorMap, m.sheenColorMapTransform)), g.sheenRoughnessMap && (m.sheenRoughnessMap.value = g.sheenRoughnessMap, t(g.sheenRoughnessMap, m.sheenRoughnessMapTransform))), g.clearcoat > 0 && (m.clearcoat.value = g.clearcoat, m.clearcoatRoughness.value = g.clearcoatRoughness, g.clearcoatMap && (m.clearcoatMap.value = g.clearcoatMap, t(g.clearcoatMap, m.clearcoatMapTransform)), g.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = g.clearcoatRoughnessMap, t(g.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), g.clearcoatNormalMap && (m.clearcoatNormalMap.value = g.clearcoatNormalMap, t(g.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale), g.side === Wt && m.clearcoatNormalScale.value.negate())), g.dispersion > 0 && (m.dispersion.value = g.dispersion), g.retroreflectivity > 0 && (m.retroreflectivity.value = g.retroreflectivity), g.iridescence > 0 && (m.iridescence.value = g.iridescence, m.iridescenceIOR.value = g.iridescenceIOR, m.iridescenceThicknessMinimum.value = g.iridescenceThicknessMinimum, m.iridescenceThicknessMaximum.value = g.iridescenceThicknessMaximum, g.iridescenceMap && (m.iridescenceMap.value = g.iridescenceMap, t(g.iridescenceMap, m.iridescenceMapTransform)), g.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = g.iridescenceThicknessMap, t(g.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), g.transmission > 0 && (m.transmission.value = g.transmission, m.transmissionSamplerMap.value = M.texture, m.transmissionSamplerSize.value.set(M.width, M.height), g.transmissionMap && (m.transmissionMap.value = g.transmissionMap, t(g.transmissionMap, m.transmissionMapTransform)), m.thickness.value = g.thickness, g.thicknessMap && (m.thicknessMap.value = g.thicknessMap, t(g.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = g.attenuationDistance, m.attenuationColor.value.copy(g.attenuationColor)), g.anisotropy > 0 && (m.anisotropyVector.value.set(g.anisotropy * Math.cos(g.anisotropyRotation), g.anisotropy * Math.sin(g.anisotropyRotation)), g.anisotropyMap && (m.anisotropyMap.value = g.anisotropyMap, t(g.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = g.specularIntensity, m.specularColor.value.copy(g.specularColor), g.specularColorMap && (m.specularColorMap.value = g.specularColorMap, t(g.specularColorMap, m.specularColorMapTransform)), g.specularIntensityMap && (m.specularIntensityMap.value = g.specularIntensityMap, t(g.specularIntensityMap, m.specularIntensityMapTransform))
    }

    function p(m, g) {
        g.matcap && (m.matcap.value = g.matcap)
    }

    function x(m, g) {
        const M = e.get(g).light;
        m.referencePosition.value.setFromMatrixPosition(M.matrixWorld), m.nearDistance.value = M.shadow.camera.near, m.farDistance.value = M.shadow.camera.far
    }
    return {
        refreshFogUniforms: n,
        refreshMaterialUniforms: i
    }
}

