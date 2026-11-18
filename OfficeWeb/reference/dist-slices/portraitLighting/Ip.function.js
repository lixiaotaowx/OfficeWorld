function Ip(s) {
    switch (s) {
        case Jt:
        case oh:
            return {
                byteLength: 1, components: 1
            };
        case Ss:
        case lh:
        case yn:
            return {
                byteLength: 2, components: 1
            };
        case Co:
        case Lo:
            return {
                byteLength: 2, components: 4
            };
        case Sn:
        case Ro:
        case jt:
            return {
                byteLength: 4, components: 1
            };
        case ch:
        case hh:
            return {
                byteLength: 4, components: 3
            }
    }
    throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", {
    detail: {
        revision: wo
    }
}));
typeof window < "u" && (window.__THREE__ ? Ce("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = wo);
/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
