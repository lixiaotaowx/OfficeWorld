function w5(r) {
    return r === "water" ? {
        roughness: .16,
        metalness: .12,
        map: qt(r),
        bumpMap: qt(r),
        bumpScale: .025
    } : r === "metal" ? {
        roughness: .32,
        metalness: .7
    } : r === "wood" ? {
        roughness: .52,
        metalness: 0,
        map: qt(r),
        bumpMap: qt(r),
        bumpScale: .003
    } : r === "fabric" ? {
        roughness: .94,
        metalness: 0,
        bumpMap: qt(r),
        bumpScale: .002
    } : r === "plaster" ? {
        roughness: .82,
        metalness: 0,
        bumpMap: qt(r),
        bumpScale: .001
    } : {
        roughness: .62,
        metalness: .03
    }
}
