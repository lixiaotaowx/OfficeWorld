function ix() {
    const s = {};
    return {
        get: function(e) {
            if (s[e.id] !== void 0) return s[e.id];
            let t;
            switch (e.type) {
                case "SunLight":
                case "DirectionalLight":
                    t = {
                        shadowIntensity: 1,
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new re
                    };
                    break;
                case "SpotLight":
                    t = {
                        shadowIntensity: 1,
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new re
                    };
                    break;
                case "PointLight":
                    t = {
                        shadowIntensity: 1,
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new re,
                        shadowCameraNear: 1,
                        shadowCameraFar: 1e3
                    };
                    break
            }
            return s[e.id] = t, t
        }
    }
}
let sx = 0;

